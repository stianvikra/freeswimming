export const A2HS_PROMPT_SEEN_KEY = "a2hs_prompt_seen";
export const A2HS_DISMISSED_AT_KEY = "a2hs_dismissed_at";

export const A2HS_AUTO_PROMPT_DELAY_MS = 1500;
export const A2HS_DISMISS_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

export type AutoPromptEligibilityInput = {
  enabled: boolean;
  hasSeenPrompt: boolean;
  dismissedAtMs: number | null;
  isInstalled: boolean;
  canInstall: boolean;
  nowMs?: number;
};

export function parseStoredTimestamp(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function isDismissCooldownActive(
  dismissedAtMs: number | null,
  nowMs: number = Date.now()
): boolean {
  if (!dismissedAtMs) return false;
  return nowMs - dismissedAtMs < A2HS_DISMISS_COOLDOWN_MS;
}

export function shouldShowAutoInstallPrompt({
  enabled,
  hasSeenPrompt,
  dismissedAtMs,
  isInstalled,
  canInstall,
  nowMs = Date.now(),
}: AutoPromptEligibilityInput): boolean {
  if (!enabled) return false;
  if (isInstalled) return false;
  if (!canInstall) return false;
  if (hasSeenPrompt) return false;
  if (isDismissCooldownActive(dismissedAtMs, nowMs)) return false;
  return true;
}
