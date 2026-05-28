"use client";

import { useEffect, useMemo, useState } from "react";
import { formatLoginCodeCooldownMessageFromSeconds } from "@/lib/auth/magic-link-cooldown";
import {
  deriveSignInRequestState,
  getSignInCooldownRemainingSeconds,
  type SignInRequestState,
} from "@/lib/auth/sign-in-ui-state";

type Props = {
  sent: boolean;
  error: string;
  cooldownUntilMs?: number | null;
  initialNowMs?: number;
};

const STYLE_BY_STATE: Record<Exclude<SignInRequestState, "idle" | "sending">, string> = {
  sent: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cooldown: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function AuthRequestStatus({ sent, error, cooldownUntilMs, initialNowMs }: Props) {
  const [nowMs, setNowMs] = useState<number | null>(() => initialNowMs ?? null);

  useEffect(() => {
    if (!cooldownUntilMs) return;

    const tick = () => {
      setNowMs(Date.now());
    };

    tick();
    const interval = window.setInterval(tick, 1_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [cooldownUntilMs]);

  const hasCooldownSignal = typeof cooldownUntilMs === "number" && Number.isFinite(cooldownUntilMs);
  const remainingSeconds =
    nowMs === null ? null : getSignInCooldownRemainingSeconds(cooldownUntilMs, nowMs);

  const state = useMemo(() => {
    if (remainingSeconds === null && error.trim().length > 0 && hasCooldownSignal) {
      return "cooldown";
    }

    return deriveSignInRequestState({
      sent,
      error,
      cooldownUntilMs,
      remainingCooldownSeconds: remainingSeconds ?? undefined,
    });
  }, [cooldownUntilMs, error, hasCooldownSignal, remainingSeconds, sent]);

  if (state === "idle" || state === "sending") {
    return null;
  }

  const text =
    state === "cooldown"
      ? remainingSeconds === null
        ? "Please wait before requesting a new sign-in email."
        : remainingSeconds > 0
          ? formatLoginCodeCooldownMessageFromSeconds(remainingSeconds)
          : "You can request a new sign-in email now."
      : state === "sent"
        ? "Sign-in email sent. Open the secure link first. If you're using the iPhone Home Screen app or the link opens in Safari, enter the one-time code below instead. Check spam/junk if needed."
        : error;

  const style = STYLE_BY_STATE[state];

  return (
    <p
      data-testid="auth-request-status"
      className={`mt-5 rounded-[var(--fs-radius-control)] border px-4 py-3 text-sm ${style}`}
      role="status"
      aria-live="polite"
    >
      {text}
    </p>
  );
}
