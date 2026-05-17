const SECOND_MS = 1_000;

export const MAGIC_LINK_CADENCE_WINDOW_MS = 60 * 60_000;

export function toRetrySeconds(retryAfterMs: number): number {
  return Math.max(1, Math.ceil(retryAfterMs / SECOND_MS));
}

export function formatLoginCodeCooldownMessageFromSeconds(seconds: number): string {
  return `Please wait ${seconds} second${seconds === 1 ? "" : "s"} before requesting a new sign-in email.`;
}

export function formatLoginCodeCooldownMessage(retryAfterMs: number): string {
  return formatLoginCodeCooldownMessageFromSeconds(toRetrySeconds(retryAfterMs));
}

export function getMagicLinkCadenceCooldownMs(requestCountInWindow: number): number {
  if (requestCountInWindow <= 1) return 30_000;
  if (requestCountInWindow === 2) return 60_000;
  return 5 * 60_000;
}
