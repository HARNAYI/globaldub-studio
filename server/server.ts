import "dotenv/config";
import cors from "cors";
import crypto from "crypto";
import express from "express";
import jwt from "jsonwebtoken";
import {
  Connection,
  ParsedInstruction,
  ParsedTransactionWithMeta,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import bs58 from "bs58";

type SolanaNetwork = "devnet" | "mainnet-beta";
type PayToken = "SOL" | "USDC";
type PaymentStatus = "pending" | "confirmed" | "expired" | "failed";

type QuoteOption = {
  token: PayToken;
  amount: string;
  decimals: number;
  mint?: string;
};

type PaymentRecord = {
  paymentId: string;
  assetId: string;
  network: SolanaNetwork;
  merchantWallet: string;
  reference: string;
  options: QuoteOption[];
  expiresAt: number;
  status: PaymentStatus;
  signature?: string;
  token?: PayToken;
  receiptJwt?: string;
  error?: string;
};

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT ?? 3000);
const SOLANA_NETWORK = (process.env.SOLANA_NETWORK as SolanaNetwork) ?? "devnet";
const MERCHANT_WALLET = process.env.MERCHANT_WALLET ?? "";
const USDC_MINT = process.env.USDC_MINT ?? "";
const RECEIPT_JWT_SECRET = process.env.RECEIPT_JWT_SECRET ?? "dev-secret-change-me";
const RECEIPT_TTL_SECONDS = Number(process.env.RECEIPT_TTL_SECONDS ?? 900);

if (!MERCHANT_WALLET) throw new Error("MERCHANT_WALLET missing");
if (!USDC_MINT) throw new Error("USDC_MINT missing");

const endpoint =
  SOLANA_NETWORK === "mainnet-beta"
    ? clusterApiUrl("mainnet-beta")
    : clusterApiUrl("devnet");
const connection = new Connection(endpoint, "confirmed");
const payments = new Map<string, PaymentRecord>();

function randomId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function createReference() {
  return bs58.encode(crypto.randomBytes(32));
}

function lamportsFromAmount(amount: string, decimals: number) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) throw new Error("Invalid amount");
  return BigInt(Math.round(n * Math.pow(10, decimals)));
}

function txContainsReference(tx: ParsedTransactionWithMeta, reference: PublicKey): boolean {
  return tx.transaction.message.accountKeys.some((keyEntry) => {
    const key = "pubkey" in keyEntry ? keyEntry.pubkey : keyEntry;
    return key.toBase58() === reference.toBase58();
  });
}

function findSystemTransfer(
  tx: ParsedTransactionWithMeta,
  toAddress: string,
  expectedLamports: bigint,
) {
  for (const ix of tx.transaction.message.instructions) {
    if (!("parsed" in ix) || !ix.parsed) continue;
    const parsedIx = ix as ParsedInstruction;
    if (parsedIx.program !== "system") continue;
    if ((parsedIx.parsed as { type?: string }).type !== "transfer") continue;

    const info = (parsedIx.parsed as { info?: Record<string, unknown> }).info ?? {};
    const destination = String(info.destination ?? "");
    const lamports = BigInt((info.lamports as number | string | bigint) ?? 0);

    if (destination === toAddress && lamports === expectedLamports) {
      return true;
    }
  }
  return false;
}

function findSplTransferChecked(
  tx: ParsedTransactionWithMeta,
  expectedMint: string,
  expectedDestinationAta: string,
  expectedUiAmountString: string,
) {
  for (const ix of tx.transaction.message.instructions) {
    if (!("parsed" in ix) || !ix.parsed) continue;
    const parsedIx = ix as ParsedInstruction;
    if (parsedIx.program !== "spl-token") continue;

    const parsed = (parsedIx.parsed as { type?: string; info?: Record<string, unknown> }) ?? {};
    if (parsed.type !== "transferChecked") continue;

    const mint = String(parsed.info?.mint ?? "");
    const destination = String(parsed.info?.destination ?? "");
    const tokenAmount =
      typeof parsed.info?.tokenAmount === "object" && parsed.info?.tokenAmount
        ? (parsed.info.tokenAmount as { uiAmountString?: string })
        : undefined;
    const uiAmountString = String(tokenAmount?.uiAmountString ?? "");

    if (
      mint === expectedMint &&
      destination === expectedDestinationAta &&
      uiAmountString === expectedUiAmountString
    ) {
      return true;
    }
  }
  return false;
}

function mintReceipt(payment: PaymentRecord) {
  const payload = {
    sub: payment.paymentId,
    assetId: payment.assetId,
    token: payment.token,
    network: payment.network,
    sig: payment.signature,
    ref: payment.reference,
  };

  return jwt.sign(payload, RECEIPT_JWT_SECRET, {
    expiresIn: RECEIPT_TTL_SECONDS,
  });
}

app.post("/api/x402/quote", (req, res) => {
  const assetId = String(req.body?.assetId ?? "").trim();
  if (!assetId) return res.status(400).json({ error: "assetId required" });

  const paymentId = randomId("pay");
  const reference = createReference();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  const record: PaymentRecord = {
    paymentId,
    assetId,
    network: SOLANA_NETWORK,
    merchantWallet: MERCHANT_WALLET,
    reference,
    options: [
      { token: "SOL", amount: "0.02", decimals: 9 },
      { token: "USDC", amount: "1.50", decimals: 6, mint: USDC_MINT },
    ],
    expiresAt,
    status: "pending",
  };

  payments.set(paymentId, record);

  return res.json({
    paymentId: record.paymentId,
    merchantWallet: record.merchantWallet,
    reference: record.reference,
    network: record.network,
    options: record.options,
    expiresAt: new Date(record.expiresAt).toISOString(),
  });
});

app.post("/api/x402/confirm", async (req, res) => {
  try {
    const paymentId = String(req.body?.paymentId ?? "");
    const signature = String(req.body?.signature ?? "");
    const token = String(req.body?.token ?? "") as PayToken;

    if (!paymentId || !signature || (token !== "SOL" && token !== "USDC")) {
      return res.status(400).json({ error: "paymentId, signature and token are required" });
    }

    const payment = payments.get(paymentId);
    if (!payment) return res.status(404).json({ error: "payment not found" });

    if (Date.now() > payment.expiresAt) {
      payment.status = "expired";
      return res.json({ status: "expired" });
    }

    const tx = await connection.getParsedTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      payment.status = "pending";
      return res.json({ status: "pending" });
    }

    const referencePk = new PublicKey(payment.reference);
    if (!txContainsReference(tx, referencePk)) {
      payment.status = "failed";
      payment.error = "Missing reference";
      return res.json({ status: "failed" });
    }

    let verified = false;

    if (token === "SOL") {
      const solOption = payment.options.find((opt) => opt.token === "SOL");
      if (!solOption) return res.status(400).json({ error: "SOL quote is unavailable" });

      const expectedLamports = lamportsFromAmount(solOption.amount, solOption.decimals);
      verified = findSystemTransfer(tx, payment.merchantWallet, expectedLamports);
    } else {
      const usdcOption = payment.options.find((opt) => opt.token === "USDC");
      if (!usdcOption?.mint) {
        return res.status(400).json({ error: "USDC quote is unavailable" });
      }

      const merchantPk = new PublicKey(payment.merchantWallet);
      const mintPk = new PublicKey(usdcOption.mint);
      const merchantAta = getAssociatedTokenAddressSync(mintPk, merchantPk).toBase58();

      verified = findSplTransferChecked(tx, usdcOption.mint, merchantAta, usdcOption.amount);
    }

    if (!verified) {
      payment.status = "failed";
      payment.signature = signature;
      payment.token = token;
      payment.error = "Transfer mismatch";
      return res.json({ status: "failed" });
    }

    payment.status = "confirmed";
    payment.signature = signature;
    payment.token = token;
    payment.receiptJwt = mintReceipt(payment);

    return res.json({ status: "confirmed", receiptJwt: payment.receiptJwt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "confirm error";
    return res.status(500).json({ error: message });
  }
});

app.get("/api/x402/status/:paymentId", (req, res) => {
  const payment = payments.get(req.params.paymentId);
  if (!payment) return res.status(404).json({ error: "payment not found" });

  if (payment.status !== "confirmed" && Date.now() > payment.expiresAt) {
    payment.status = "expired";
  }

  return res.json({
    status: payment.status,
    receiptJwt: payment.status === "confirmed" ? payment.receiptJwt : undefined,
  });
});

app.get("/api/download/:assetId", (req, res) => {
  const authHeader = req.header("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(402).json({
      error: "Payment required",
      hint: "Use receipt JWT from x402 confirmed payment",
    });
  }

  try {
    const payload = jwt.verify(token, RECEIPT_JWT_SECRET) as { assetId?: string };
    if (payload.assetId !== req.params.assetId) {
      return res.status(403).json({ error: "Receipt not valid for this asset" });
    }

    return res.json({
      ok: true,
      downloadUrl: `https://example.com/files/${encodeURIComponent(req.params.assetId)}.mp4`,
    });
  } catch {
    return res.status(401).json({ error: "Invalid or expired receipt" });
  }
});

app.listen(PORT, () => {
  console.log(`x402 verifier listening on http://localhost:${PORT}`);
});
