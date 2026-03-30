"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";
import {
  getBrowserPasskeySupport,
  loadPasskeySecuritySnapshot,
  type PasskeySecuritySnapshot,
} from "@/lib/auth/passkeys";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type EntryState = {
  loading: boolean;
  support: ReturnType<typeof getBrowserPasskeySupport>;
  snapshot: PasskeySecuritySnapshot | null;
};

function getBadgeText(state: EntryState) {
  if (state.loading) {
    return "Checking this device";
  }

  if (!state.support.supported) {
    return "Email code fallback";
  }

  const passkeyCount = state.snapshot?.passkeys.length ?? 0;
  if (passkeyCount === 0) {
    return "Recommended next step";
  }

  return `${passkeyCount} passkey${passkeyCount === 1 ? "" : "s"} saved`;
}

function getBodyCopy(state: EntryState) {
  if (state.loading) {
    return "Checking whether this browser can finish passkey setup after your email sign-in.";
  }

  if (!state.support.supported) {
    return `${state.support.detail} Keep email code as the recovery path here, then add a passkey later on a supported device.`;
  }

  const passkeyCount = state.snapshot?.passkeys.length ?? 0;
  if (passkeyCount === 0) {
    return "You are already signed in. Add a passkey on this device next so future sign-ins can use Touch ID, Face ID, fingerprint, Windows Hello, or the unlock method your platform chooses.";
  }

  return "Manage saved passkeys, add another trusted device, and keep your fallback email sign-in easy to recover.";
}

function getCtaLabel(state: EntryState) {
  if (state.support.supported && (state.snapshot?.passkeys.length ?? 0) === 0) {
    return "Add passkey on this device";
  }

  return "Open Account & Security";
}

export default function AccountSecurityEntryCard() {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [state, setState] = useState<EntryState>(() => {
    const support = getBrowserPasskeySupport();
    return {
      loading: support.supported,
      support,
      snapshot: null,
    };
  });

  async function refreshEntryState() {
    const support = getBrowserPasskeySupport();

    if (!support.supported) {
      setState({
        loading: false,
        support,
        snapshot: null,
      });
      return;
    }

    const result = await loadPasskeySecuritySnapshot(supabase);

    setState({
      loading: false,
      support,
      snapshot: result.ok ? result.snapshot : null,
    });
  }

  const refreshEntryStateOnMount = useEffectEvent(() => {
    void refreshEntryState();
  });

  useEffect(() => {
    refreshEntryStateOnMount();
  }, []);

  return (
    <section
      data-testid="account-security-entry-card"
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Account & Security</h2>
          <p className="mt-2 text-sm text-slate-600">{getBodyCopy(state)}</p>
        </div>
        <Link
          href="/my-library/security"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
        >
          {getCtaLabel(state)}
        </Link>
      </div>
      <div className="mt-4 flex justify-end">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
          {getBadgeText(state)}
        </span>
      </div>
    </section>
  );
}
