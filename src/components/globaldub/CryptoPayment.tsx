import { Check, Copy, Wallet, ShieldCheck, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

type Coin = "SOL" | "USDC";

const PRICES: Record<Coin, { amount: string; usd: string; icon: string; color: string }> = {
  SOL: { amount: "0.085", usd: "$14.90", icon: "◎", color: "from-[#9945FF] to-[#14F195]" },
  USDC: { amount: "14.90", usd: "$14.90", icon: "$", color: "from-[#2775CA] to-[#4AA3FF]" },
};

const WALLET = "GdUbAi5kQv9wXyZ3pLmN8rT4hF2cJ7eK1aB6sV0nM2qR";

export const CryptoPayment = ({ onPaid }: { onPaid?: () => void }) => {
  const [coin, setCoin] = useState<Coin>("SOL");
  const [status, setStatus] = useState<"idle" | "pending" | "paid">("idle");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const pay = () => {
    setStatus("pending");
    setTimeout(() => {
      setStatus("paid");
      onPaid?.();
    }, 2200);
  };

  const price = PRICES[coin];

  return (
    <div className="glass rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 h-60 w-60 rounded-full bg-brand-cyan/15 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-brand-cyan" />
            <h3 className="font-medium">Unlock download · Pay with crypto</h3>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-success" /> Solana network
          </span>
        </div>

        {/* Coin tabs */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {(["SOL", "USDC"] as Coin[]).map((c) => (
            <button
              key={c}
              onClick={() => setCoin(c)}
              className={`p-4 rounded-xl text-left transition-all ${
                coin === c ? "gradient-border shadow-glow" : "glass hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${PRICES[c].color} flex items-center justify-center text-white font-bold`}>
                  {PRICES[c].icon}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{c}</span>
              </div>
              <div className="mt-3 font-mono text-sm">{PRICES[c].amount} {c}</div>
              <div className="text-xs text-muted-foreground">≈ {PRICES[c].usd} USD</div>
            </button>
          ))}
        </div>

        {/* Wallet address */}
        <div className="rounded-xl glass p-3 flex items-center gap-2 mb-4">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">Pay to</span>
          <code className="flex-1 text-xs font-mono truncate text-foreground/90">{WALLET}</code>
          <button onClick={copy} className="h-7 w-7 rounded-md glass flex items-center justify-center hover:text-accent transition">
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Amount summary */}
        <div className="flex items-center justify-between text-xs mb-5 px-1">
          <span className="text-muted-foreground">Total due</span>
          <span className="font-mono text-accent">{price.amount} {coin} <span className="text-muted-foreground">· {price.usd}</span></span>
        </div>

        {/* Action */}
        {status !== "paid" ? (
          <button
            onClick={pay}
            disabled={status === "pending"}
            className="w-full h-12 rounded-xl bg-gradient-primary text-white font-medium shadow-glow-purple hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {status === "pending" ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Waiting for confirmation…</>
            ) : (
              <><Wallet className="h-4 w-4" /> Pay {price.amount} {coin}</>
            )}
          </button>
        ) : (
          <div className="w-full h-12 rounded-xl glass border border-success/40 text-success flex items-center justify-center gap-2 text-sm font-medium">
            <Check className="h-4 w-4" /> Payment confirmed · Download unlocked
          </div>
        )}

        <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
          <Sparkles className="h-3 w-3" /> One-time fee · No subscription · Instant unlock on confirmation
        </div>
      </div>
    </div>
  );
};
