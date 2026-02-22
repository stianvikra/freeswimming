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
};

const STYLE_BY_STATE: Record<Exclude<SignInRequestState, "idle" | "sending">, string> = {
  sent: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cooldown: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function AuthRequestStatus({ sent, error, cooldownUntilMs }: Props) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!cooldownUntilMs) return;

    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [cooldownUntilMs]);

  const remainingSeconds = getSignInCooldownRemainingSeconds(cooldownUntilMs, nowMs);

  const state = useMemo(
    () =>
      deriveSignInRequestState({
        sent,
        error,
        cooldownUntilMs,
        remainingCooldownSeconds: remainingSeconds,
      }),
    [cooldownUntilMs, error, remainingSeconds, sent]
  );

  if (state === "idle" || state === "sending") {
    return null;
  }

  const text =
    state === "cooldown"
      ? remainingSeconds > 0
        ? formatLoginCodeCooldownMessageFromSeconds(remainingSeconds)
        : "You can request a new login code now."
      : state === "sent"
        ? "Sign-in email sent. Enter the code below."
        : error;

  const style = STYLE_BY_STATE[state];

  return (
    <p
      data-testid="auth-request-status"
      className={`mt-5 rounded-xl border px-4 py-3 text-sm ${style}`}
      role="status"
      aria-live="polite"
    >
      {text}
    </p>
  );
}
