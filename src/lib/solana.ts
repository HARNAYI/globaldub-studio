import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

export type PayToken = "SOL" | "USDC";
export type SolanaNetwork = "devnet" | "mainnet-beta";

export type QuoteOption = {
  token: PayToken;
  amount: string;
  decimals: number;
  mint?: string;
};

export type PaymentQuote = {
  paymentId: string;
  merchantWallet: string;
  reference: string;
  network: SolanaNetwork;
  options: QuoteOption[];
  expiresAt: string;
};

export function getClusterUrl(network: SolanaNetwork) {
  return network === "mainnet-beta"
    ? "https://api.mainnet-beta.solana.com"
    : "https://api.devnet.solana.com";
}

export function getConnection(network: SolanaNetwork) {
  return new Connection(getClusterUrl(network), "confirmed");
}

export async function buildSolPaymentTx(params: {
  connection: Connection;
  payer: PublicKey;
  merchantWallet: PublicKey;
  reference: PublicKey;
  amountSol: string;
}) {
  const lamports = BigInt(Math.round(Number(params.amountSol) * 1_000_000_000));
  if (lamports <= 0n) throw new Error("Invalid SOL amount");

  const ix = SystemProgram.transfer({
    fromPubkey: params.payer,
    toPubkey: params.merchantWallet,
    lamports: Number(lamports),
  });

  ix.keys.push({
    pubkey: params.reference,
    isSigner: false,
    isWritable: false,
  });

  const tx = new Transaction().add(ix);
  tx.feePayer = params.payer;
  const { blockhash, lastValidBlockHeight } =
    await params.connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;

  return { tx, lastValidBlockHeight };
}

export async function buildUsdcPaymentTx(params: {
  connection: Connection;
  payer: PublicKey;
  merchantWallet: PublicKey;
  reference: PublicKey;
  usdcMint: PublicKey;
  amountUsdc: string;
  usdcDecimals: number;
}) {
  const raw = Number(params.amountUsdc) * Math.pow(10, params.usdcDecimals);
  const amount = BigInt(Math.round(raw));
  if (amount <= 0n) throw new Error("Invalid USDC amount");

  const payerAta = getAssociatedTokenAddressSync(params.usdcMint, params.payer);
  const merchantAta = getAssociatedTokenAddressSync(
    params.usdcMint,
    params.merchantWallet,
  );

  const ixs = [];
  const merchantAtaInfo = await params.connection.getAccountInfo(merchantAta);
  if (!merchantAtaInfo) {
    ixs.push(
      createAssociatedTokenAccountInstruction(
        params.payer,
        merchantAta,
        params.merchantWallet,
        params.usdcMint,
      ),
    );
  }

  const transferIx = createTransferInstruction(
    payerAta,
    merchantAta,
    params.payer,
    Number(amount),
  );
  transferIx.keys.push({
    pubkey: params.reference,
    isSigner: false,
    isWritable: false,
  });

  ixs.push(transferIx);

  const tx = new Transaction().add(...ixs);
  tx.feePayer = params.payer;
  const { blockhash, lastValidBlockHeight } =
    await params.connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;

  return { tx, lastValidBlockHeight };
}
