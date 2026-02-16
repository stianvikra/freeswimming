"use client";

import { useEffect, useMemo, useState } from "react";
import { formatLoginCodeCooldownMessageFromSeconds } from "@/lib/auth/magic-link-cooldown";

type Props = {
  message: string;
  cooldownUntilMs?: number | null;
};

function getRemainingSeconds(cooldownUntilMs: number): number {
  return Math.max(0, Math.ceil((cooldownUntilMs - Date.now()) / 1000));
}

export default function AuthErrorNotice({ message, cooldownUntilMs }: Props) {
  const hasCooldown = typeof cooldownUntilMs === "number" && Number.isFinite(cooldownUntilMs);
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    hasCooldown ? getRemainingSeconds(cooldownUntilMs) : 0
  );

  useEffect(() => {
    if (!hasCooldown) return;

    const tick = () => {
      setRemainingSeconds(getRemainingSeconds(cooldownUntilMs));
    };

    tick();
    const interval = window.setInterval(tick, 1_000);
    return () => {
      window.clearInterval(interval);
    };
  }, [cooldownUntilMs, hasCooldown]);

  const content = useMemo(() => {
    if (!hasCooldown) return message;
    if (remainingSeconds <= 0) return "You can request a new login code now.";
    return formatLoginCodeCooldownMessageFromSeconds(remainingSeconds);
  }, [hasCooldown, message, remainingSeconds]);

  return (
    <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {content}
    </p>
  );
}
