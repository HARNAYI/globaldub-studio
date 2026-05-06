import { useEffect, useMemo, useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  buildSolPaymentTx,
  buildUsdcPaymentTx,
  type PayToken,
  type PaymentQuote,
} from "@/lib/solana";
import { confirmPayment, createQuote, getPaymentStatus } from "@/lib/x402";

type Props = {
  open: boolean;
  assetId: string;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (
    status:
      | "idle"
      | "creating_quote"
      | "awaiting_wallet_signature"
      | "waiting_confirmation"
      | "confirmed"
      | "failed"
      | "expired",
    error?: string,
  ) => void;
  onUnlocked: (receiptJwt?: string) => void;
};

type UiStatus =
  | "idle"
  | "creating_quote"
  | "awaiting_wallet_signature"
  | "waiting_confirmation"
  | "failed"
  | "expired";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function PaymentGateModal({
  open,
  assetId,
  onOpenChange,
  onStatusChange,
  onUnlocked,
}: Props) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [status, setStatus] = useState<UiStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<PaymentQuote | null>(null);
  const [token, setToken] = useState<PayToken>("SOL");

  useEffect(() => {
    onStatusChange?.(status, error ?? undefined);
  }, [status, error, onStatusChange]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadQuote() {
      try {
        setStatus("creating_quote");
        setError(null);
        const nextQuote = await createQuote({ assetId });
        if (cancelled) return;
        setQuote(nextQuote);
        const hasSol = nextQuote.options.some((o) => o.token === "SOL");
        setToken(hasSol ? "SOL" : "USDC");
        setStatus("idle");
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Failed to create payment quote";
        setStatus("failed");
        setError(message);
      }
    }

    void loadQuote();
    return () => {
      cancelled = true;
    };
  }, [open, assetId]);

  const selected = useMemo(
    () => quote?.options.find((o) => o.token === token),
    [quote, token],
  );

  async function handlePay() {
    if (!quote || !selected) return;
    if (!wallet.publicKey || !wallet.sendTransaction) {
      setStatus("failed");
      setError("Connect Phantom or Solflare wallet before paying.");
      return;
    }

    try {
      setError(null);
      setStatus("awaiting_wallet_signature");

      const merchant = new PublicKey(quote.merchantWallet);
      const reference = new PublicKey(quote.reference);

      let signature = "";
      if (selected.token === "SOL") {
        const { tx } = await buildSolPaymentTx({
          connection,
          payer: wallet.publicKey,
          merchantWallet: merchant,
          reference,
          amountSol: selected.amount,
        });
        signature = await wallet.sendTransaction(tx, connection);
      } else {
        if (!selected.mint) throw new Error("USDC mint missing in quote");
        const { tx } = await buildUsdcPaymentTx({
          connection,
          payer: wallet.publicKey,
          merchantWallet: merchant,
          reference,
          usdcMint: new PublicKey(selected.mint),
          amountUsdc: selected.amount,
          usdcDecimals: selected.decimals ?? 6,
        });
        signature = await wallet.sendTransaction(tx, connection);
      }

      setStatus("waiting_confirmation");
      await confirmPayment({
        paymentId: quote.paymentId,
        signature,
        token: selected.token,
      });

      for (let i = 0; i < 60; i += 1) {
        const paymentStatus = await getPaymentStatus(quote.paymentId);
        if (paymentStatus.status === "confirmed") {
          onStatusChange?.("confirmed");
          onUnlocked(paymentStatus.receiptJwt);
          return;
        }
        if (paymentStatus.status === "expired") {
          setStatus("expired");
          setError("Payment request expired. Please retry.");
          return;
        }
        if (paymentStatus.status === "failed") {
          throw new Error("Payment verification failed");
        }
        await sleep(2000);
      }

      throw new Error("Payment confirmation timed out");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Payment failed";
      setStatus("failed");
      setError(message);
    }
  }

  const busy = status === "creating_quote" || status === "awaiting_wallet_signature" || status === "waiting_confirmation";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Unlock download</DialogTitle>
          <DialogDescription>
            Pay with SOL or USDC to unlock this export with x402-compatible flow.
          </DialogDescription>
        </DialogHeader>

        {!quote ? (
          <div className="py-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparing payment quote...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-3 space-y-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Payment token</div>
              <div className="flex gap-2">
                {quote.options.map((o) => (
                  <Button
                    key={o.token}
                    variant={token === o.token ? "default" : "outline"}
                    type="button"
                    onClick={() => setToken(o.token)}
                  >
                    {o.token} - {o.amount}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border p-3 text-sm space-y-2">
              <div>
                <span className="text-muted-foreground">Send to: </span>
                <code className="text-xs break-all">{quote.merchantWallet}</code>
              </div>
              <div>
                <span className="text-muted-foreground">Reference: </span>
                <code className="text-xs break-all">{quote.reference}</code>
              </div>
              <div>
                <span className="text-muted-foreground">Amount: </span>
                <span>{selected?.amount} {selected?.token}</span>
              </div>
            </div>

            {status === "waiting_confirmation" && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Waiting for confirmation...
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <Button type="button" className="w-full" onClick={handlePay} disabled={busy}>
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Wallet className="h-4 w-4 mr-2" />
              )}
              {status === "awaiting_wallet_signature"
                ? "Approve transaction in wallet..."
                : status === "waiting_confirmation"
                  ? "Waiting for confirmation..."
                  : `Pay with ${token}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
