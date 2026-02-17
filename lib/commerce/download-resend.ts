import { getSafeNextPath } from "@/lib/auth/next-path";

export const RESEND_DOWNLOAD_GENERIC_MESSAGE =
  "If this email exists, we sent a secure access link.";

export const RESEND_DOWNLOAD_FALLBACK_ERROR =
  "Could not process request right now. Please try again.";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type DownloadResendSource =
  | "checkout_success"
  | "library_recovery"
  | "claim_entry"
  | "unknown";

export function normalizeResendEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidResendEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function getSafeDownloadResendNextPath(input: string | undefined): string {
  return getSafeNextPath(input, "/my-library");
}

export function toDownloadResendSource(input: string | undefined): DownloadResendSource {
  if (input === "checkout_success") return input;
  if (input === "library_recovery") return input;
  if (input === "claim_entry") return input;
  return "unknown";
}
