"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import {
  getBrowserPasskeySupport,
  getPasskeyErrorMessage,
  loadPasskeySecuritySnapshot,
  type PasskeyFactorSummary,
} from "@/lib/auth/passkeys";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type Props = {
  nextPath: string;
  signInHref: string;
  signedInEmail: string | null;
  isAdmin: boolean;
};

type NoticeState = {
  kind: "success" | "error";
  message: string;
} | null;

function getNoticeClasses(kind: "success" | "error") {
  return kind === "success"
    ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    : "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800";
}

function getPrimaryPasskey(passkeys: PasskeyFactorSummary[]) {
  return passkeys.find((factor) => factor.status === "verified") ?? passkeys[0] ?? null;
}

export default function AdminPreviewUnlockCard({
  nextPath,
  signInHref,
  signedInEmail,
  isAdmin,
}: Props) {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [browserSupport, setBrowserSupport] = useState(() => getBrowserPasskeySupport());
  const [loading, setLoading] = useState(true);
  const [pendingUnlock, setPendingUnlock] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [sessionLevel, setSessionLevel] = useState<"aal1" | "aal2" | null>(null);
  const [passkeys, setPasskeys] = useState<PasskeyFactorSummary[]>([]);

  async function refreshPasskeys() {
    if (!signedInEmail || !isAdmin) {
      setLoading(false);
      setPasskeys([]);
      setSessionLevel(null);
      return;
    }

    const support = getBrowserPasskeySupport();
    setBrowserSupport(support);

    if (!support.supported) {
      setLoading(false);
      setPasskeys([]);
      setSessionLevel(null);
      return;
    }

    const result = await loadPasskeySecuritySnapshot(supabase);
    if (!result.ok) {
      setNotice({ kind: "error", message: result.error });
      setLoading(false);
      return;
    }

    setPasskeys(result.snapshot.passkeys);
    setSessionLevel(result.snapshot.currentLevel);
    setLoading(false);
  }

  const refreshPasskeysOnInputChange = useEffectEvent(() => {
    void refreshPasskeys();
  });

  useEffect(() => {
    refreshPasskeysOnInputChange();
  }, [signedInEmail, isAdmin]);

  async function handleUnlock() {
    const factor = getPrimaryPasskey(passkeys);
    if (!factor) {
      setNotice({
        kind: "error",
        message: "No verified passkey is available on this account yet.",
      });
      return;
    }

    setPendingUnlock(true);
    setNotice(null);

    if (sessionLevel !== "aal2") {
      const authResult = await supabase.auth.mfa.webauthn.authenticate({
        factorId: factor.id,
      });

      if (authResult.error) {
        const message = getPasskeyErrorMessage(authResult.error);
        setNotice({ kind: "error", message });
        void sendClientAnalyticsEvent("preview_admin_unlock_failed", {
          reason: authResult.error.code ?? "passkey-authenticate",
        });
        setPendingUnlock(false);
        return;
      }
    }

    const response = await fetch("/preview-access/admin-unlock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ next: nextPath }),
    });

    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
      redirectPath?: string;
    } | null;

    if (!response.ok || !payload?.ok) {
      const message = payload?.error || "Could not open the preview with admin passkey right now.";
      setNotice({ kind: "error", message });
      void sendClientAnalyticsEvent("preview_admin_unlock_failed", {
        reason: message,
      });
      setPendingUnlock(false);
      return;
    }

    setNotice({
      kind: "success",
      message: "Preview unlocked for this browser.",
    });
    void sendClientAnalyticsEvent("preview_admin_unlock_succeeded", {});
    router.push(payload.redirectPath ?? nextPath);
    router.refresh();
    setPendingUnlock(false);
  }

  return (
    <article
      data-testid="admin-preview-unlock-card"
      className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/70 p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Admin unlock
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Unlock with admin passkey</h2>
          <p className="mt-2 max-w-[64ch] text-sm text-slate-600">
            Signed-in admins can use an enrolled passkey here. The shared password remains below as
            the explicit operations fallback while rollout continues.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {sessionLevel === "aal2" ? "Passkey ready" : "Needs passkey check"}
        </span>
      </div>

      {notice ? (
        <p className={`mt-4 ${getNoticeClasses(notice.kind)}`} role="status" aria-live="polite">
          {notice.message}
        </p>
      ) : null}

      {!signedInEmail ? (
        <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 p-4">
          <p className="text-sm text-slate-700">
            Sign in with your admin email first, then return here to unlock with passkey.
          </p>
          <div className="mt-4">
            <Link
              href={signInHref}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Sign in as admin
            </Link>
          </div>
        </div>
      ) : !isAdmin ? (
        <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 p-4 text-sm text-slate-700">
          Signed in as {signedInEmail}, but this account does not have admin preview access.
        </div>
      ) : !browserSupport.supported ? (
        <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 p-4 text-sm text-slate-700">
          {browserSupport.detail}
        </div>
      ) : loading ? (
        <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 p-4 text-sm text-slate-700">
          Checking your passkeys...
        </div>
      ) : passkeys.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 p-4 text-sm text-slate-700">
          No passkey is enrolled on this account yet. Use the fallback password once, then add a
          passkey in Account & Security inside My Library.
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 p-4">
          <p className="text-sm text-slate-700">
            {passkeys.length} passkey{passkeys.length === 1 ? "" : "s"} available on this account.
          </p>
          <button
            type="button"
            data-testid="admin-preview-unlock-button"
            onClick={() => void handleUnlock()}
            disabled={pendingUnlock}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {pendingUnlock ? "Unlocking..." : "Unlock with passkey"}
          </button>
        </div>
      )}
    </article>
  );
}
