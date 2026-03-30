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

  const message = support.supported
    ? sent
      ? "Finish this sign-in, then add a passkey in Account & Security so trusted devices can use Touch ID, Face ID, fingerprint, Windows Hello, or the unlock method your platform chooses."
      : "This browser can use passkeys after your first email sign-in. Add one in Account & Security once you are inside My Library."
    : support.detail;

  return (
    <section
      data-testid="auth-passkey-readiness"
      className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/85 p-5"
      aria-labelledby="auth-passkey-readiness-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="auth-passkey-readiness-title" className="text-lg font-semibold text-slate-900">
            Passkeys on this device
          </h2>
          <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-slate-600">{message}</p>
        </div>
        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
            support.supported ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700",
          ].join(" ")}
        >
          {support.supported ? "Passkey-ready browser" : "Email code only here"}
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Email code stays available as your recovery path while passkey sign-in rollout is still
        maturing.
      </p>
    </section>
  );
}
