export function isResendRequestFlag(value: unknown): boolean {
  return typeof value === "string" && value === "1";
}

export function shouldApplyMagicLinkCooldown(
  activeCooldownMs: number,
  isResendRequest: boolean
): boolean {
  return isResendRequest && activeCooldownMs > 0;
}
