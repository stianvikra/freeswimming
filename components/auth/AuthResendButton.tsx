"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { getSignInCooldownRemainingSeconds } from "@/lib/auth/sign-in-ui-state";

type Props = {
  cooldownUntilMs?: number | null;
  initialNowMs?: number;
};

export default function AuthResendButton({ cooldownUntilMs, initialNowMs }: Props) {
  const { pending } = useFormStatus();
  const [nowMs, setNowMs] = useState<number | null>(() => initialNowMs ?? null);

  useEffect(() => {
    if (!cooldownUntilMs) {
      return;
    }

    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [cooldownUntilMs]);

  const hasCooldownSignal = typeof cooldownUntilMs === "number" && Number.isFinite(cooldownUntilMs);
  const remainingSeconds =
    nowMs === null ? null : getSignInCooldownRemainingSeconds(cooldownUntilMs, nowMs);

  const hasCooldown = remainingSeconds === null ? hasCooldownSignal : remainingSeconds > 0;
  const disabled = pending || hasCooldown;
  const label = pending
    ? "Resending..."
    : remainingSeconds !== null && remainingSeconds > 0
      ? `Resend email in ${remainingSeconds}s`
      : hasCooldown
        ? "Resend email soon"
        : "Resend sign-in email";

  return (
    <button
      type="submit"
      disabled={disabled}
      aria-disabled={disabled}
      data-testid="auth-resend-button"
      className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {label}
    </button>
  );
}
