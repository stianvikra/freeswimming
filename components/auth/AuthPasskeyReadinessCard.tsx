"use client";

import { useSyncExternalStore } from "react";
import { getBrowserPasskeySupport } from "@/lib/auth/passkeys";

type Props = {
  sent: boolean;
};

export default function AuthPasskeyReadinessCard({ sent }: Props) {
  const support = useSyncExternalStore(
    () => () => {},
    getBrowserPasskeySupport,
    () => ({
      supported: false,
      detail: "Checking whether this browser can use passkeys.",
    })
  );

  const message = sent
    ? "Check your email, then enter the code below."
    : "Email code sign-in works on this device today.";

  const detail = support.supported
    ? "This browser supports passkeys, but freeswimming still uses email codes today."
    : `${support.detail} Email codes still work here today.`;

  return (
    <section
      data-testid="auth-passkey-readiness"
      className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/85 p-5"
      aria-labelledby="auth-passkey-readiness-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="auth-passkey-readiness-title" className="text-lg font-semibold text-slate-900">
            What works on this device
          </h2>
          <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-slate-600">{message}</p>
        </div>
        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
          Email code today
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">{detail}</p>
    </section>
  );
}
