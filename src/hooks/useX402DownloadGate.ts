import { useCallback, useMemo, useState } from "react";

export type GateStatus =
  | "idle"
  | "creating_quote"
  | "awaiting_wallet_signature"
  | "waiting_confirmation"
  | "confirmed"
  | "failed"
  | "expired";

export function useX402DownloadGate() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [status, setStatus] = useState<GateStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [receiptJwt, setReceiptJwt] = useState<string | null>(null);

  const openGate = useCallback(() => {
    setError(null);
    setIsOpen(true);
  }, []);

  const closeGate = useCallback(() => {
    setIsOpen(false);
  }, []);

  const markStatus = useCallback((nextStatus: GateStatus) => {
    setStatus(nextStatus);
  }, []);

  const markFailed = useCallback((message: string) => {
    setStatus("failed");
    setError(message);
  }, []);

  const markExpired = useCallback(() => {
    setStatus("expired");
    setError("Payment expired. Please try again.");
  }, []);

  const markConfirmed = useCallback((jwt?: string) => {
    setStatus("confirmed");
    setIsUnlocked(true);
    setError(null);
    if (jwt) setReceiptJwt(jwt);
    setIsOpen(false);
  }, []);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    setReceiptJwt(null);
    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    setIsOpen(false);
    setStatus("idle");
    setError(null);
  }, []);

  const canDownload = useMemo(() => isUnlocked, [isUnlocked]);

  return {
    isOpen,
    isUnlocked,
    canDownload,
    status,
    error,
    receiptJwt,
    openGate,
    closeGate,
    markStatus,
    markFailed,
    markExpired,
    markConfirmed,
    lock,
    reset,
  };
}
