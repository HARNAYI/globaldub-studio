import type { PayToken, PaymentQuote } from "@/lib/solana";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}

export type QuoteRequest = {
  assetId: string;
};

export type ConfirmRequest = {
  paymentId: string;
  signature: string;
  token: PayToken;
};

export type StatusResponse = {
  status: "pending" | "confirmed" | "expired" | "failed";
  receiptJwt?: string;
};

export function createQuote(body: QuoteRequest) {
  return http<PaymentQuote>("/api/x402/quote", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function confirmPayment(body: ConfirmRequest) {
  return http<StatusResponse>("/api/x402/confirm", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getPaymentStatus(paymentId: string) {
  return http<StatusResponse>(
    `/api/x402/status/${encodeURIComponent(paymentId)}`,
  );
}
