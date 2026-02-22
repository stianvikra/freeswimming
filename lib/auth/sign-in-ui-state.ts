export type SignInRequestState = "idle" | "sending" | "sent" | "cooldown" | "error";

type SignInRequestStateInput = {
  sent: boolean;
  error: string;
  cooldownUntilMs?: number | null;
  remainingCooldownSeconds?: number;
  sending?: boolean;
};

export function getSignInCooldownRemainingSeconds(
  cooldownUntilMs: number | null | undefined,
  nowMs = Date.now()
): number {
  if (typeof cooldownUntilMs !== "number" || !Number.isFinite(cooldownUntilMs)) {
    return 0;
  }
  return Math.max(0, Math.ceil((cooldownUntilMs - nowMs) / 1_000));
}

export function deriveSignInRequestState(
  input: SignInRequestStateInput,
  nowMs = Date.now()
): SignInRequestState {
  if (input.sending) {
    return "sending";
  }

  const trimmedError = input.error.trim();
  const hasError = trimmedError.length > 0;
  const hasCooldownSignal =
    typeof input.cooldownUntilMs === "number" && Number.isFinite(input.cooldownUntilMs);
  const remainingCooldownSeconds =
    typeof input.remainingCooldownSeconds === "number" &&
    Number.isFinite(input.remainingCooldownSeconds)
      ? Math.max(0, Math.ceil(input.remainingCooldownSeconds))
      : getSignInCooldownRemainingSeconds(input.cooldownUntilMs, nowMs);

  if (hasError && remainingCooldownSeconds > 0) {
    return "cooldown";
  }
  if (hasError && hasCooldownSignal && remainingCooldownSeconds === 0) {
    return input.sent ? "sent" : "idle";
  }
  if (hasError) {
    return "error";
  }
  if (input.sent) {
    return "sent";
  }
  return "idle";
}
