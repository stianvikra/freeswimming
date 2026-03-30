"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import {
  buildDefaultPasskeyFriendlyName,
  getBrowserPasskeySupport,
  getPasskeyErrorMessage,
  loadPasskeySecuritySnapshot,
  type PasskeyFactorSummary,
} from "@/lib/auth/passkeys";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type Props = {
  email: string | null;
  isAdmin: boolean;
  siteLockEnabled: boolean;
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

export default function AccountSecurityHub({ email, isAdmin, siteLockEnabled }: Props) {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [browserSupport, setBrowserSupport] = useState(() => getBrowserPasskeySupport());
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);
  const [sessionLevel, setSessionLevel] = useState<"aal1" | "aal2" | null>(null);
  const [nextLevel, setNextLevel] = useState<"aal1" | "aal2" | null>(null);
  const [passkeys, setPasskeys] = useState<PasskeyFactorSummary[]>([]);
  const [newPasskeyName, setNewPasskeyName] = useState(() => buildDefaultPasskeyFriendlyName());

  async function refreshSecurityState() {
    setLoading(true);
    const support = getBrowserPasskeySupport();
    setBrowserSupport(support);

    if (!support.supported) {
      setPasskeys([]);
      setSessionLevel(null);
      setNextLevel(null);
      setLoading(false);
      return;
    }

    const result = await loadPasskeySecuritySnapshot(supabase);
    if (!result.ok) {
      setNotice({ kind: "error", message: result.error });
      setPasskeys([]);
      setSessionLevel(null);
      setNextLevel(null);
      setLoading(false);
      return;
    }

    setPasskeys(result.snapshot.passkeys);
    setSessionLevel(result.snapshot.currentLevel);
    setNextLevel(result.snapshot.nextLevel);
    setLoading(false);
  }

  const refreshSecurityStateOnMount = useEffectEvent(() => {
    void refreshSecurityState();
  });

  useEffect(() => {
    refreshSecurityStateOnMount();
  }, []);

  async function handleAddPasskey() {
    const friendlyName = newPasskeyName.trim() || buildDefaultPasskeyFriendlyName();
    setPendingAction("add");
    setNotice(null);

    const result = await supabase.auth.mfa.webauthn.register({
      friendlyName,
    });

    if (result.error) {
      const message = getPasskeyErrorMessage(result.error);
      setNotice({ kind: "error", message });
      void sendClientAnalyticsEvent("passkey_registration_failed", {
        reason: result.error.code ?? "unknown",
      });
      setPendingAction(null);
      return;
    }

    setNotice({
      kind: "success",
      message: "Passkey added and verified for this session.",
    });
    void sendClientAnalyticsEvent("passkey_registered", {
      passkeyCount: passkeys.length + 1,
    });
    await refreshSecurityState();
    router.refresh();
    setPendingAction(null);
  }

  async function handleVerifyPasskey(factorId: string) {
    setPendingAction(`verify:${factorId}`);
    setNotice(null);

    const result = await supabase.auth.mfa.webauthn.authenticate({
      factorId,
    });

    if (result.error) {
      const message = getPasskeyErrorMessage(result.error);
      setNotice({ kind: "error", message });
      void sendClientAnalyticsEvent("passkey_session_verification_failed", {
        reason: result.error.code ?? "unknown",
      });
      setPendingAction(null);
      return;
    }

    setNotice({
      kind: "success",
      message: "This session is now verified with your passkey.",
    });
    void sendClientAnalyticsEvent("passkey_session_verified", {});
    await refreshSecurityState();
    router.refresh();
    setPendingAction(null);
  }

  async function handleRemovePasskey(factor: PasskeyFactorSummary) {
    setPendingAction(`remove:${factor.id}`);
    setNotice(null);

    if (factor.status === "verified" && sessionLevel !== "aal2") {
      const verifyResult = await supabase.auth.mfa.webauthn.authenticate({
        factorId: factor.id,
      });

      if (verifyResult.error) {
        const message = getPasskeyErrorMessage(verifyResult.error);
        setNotice({ kind: "error", message });
        void sendClientAnalyticsEvent("passkey_remove_verification_failed", {
          reason: verifyResult.error.code ?? "unknown",
        });
        setPendingAction(null);
        return;
      }
    }

    const result = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    if (result.error) {
      const message = getPasskeyErrorMessage(result.error);
      setNotice({ kind: "error", message });
      void sendClientAnalyticsEvent("passkey_remove_failed", {
        reason: result.error.code ?? "unknown",
      });
      setPendingAction(null);
      return;
    }

    setNotice({
      kind: "success",
      message: "Passkey removed from this account.",
    });
    void sendClientAnalyticsEvent("passkey_removed", {
      passkeyCount: Math.max(0, passkeys.length - 1),
    });
    await refreshSecurityState();
    router.refresh();
    setPendingAction(null);
  }

  return (
    <div data-testid="account-security-hub" className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Sign-in & recovery</h2>
            <p className="mt-2 max-w-[68ch] text-sm text-slate-600">
              Keep email code as your recovery path, then add passkeys on the devices you trust so
              supported browsers can skip the inbox on later sign-ins.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {sessionLevel === "aal2" ? "Passkey verified session" : "Standard session"}
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sign-in email
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">{email ?? "No email found"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Browser support
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {browserSupport.supported ? "Passkey-capable" : "Passkey unavailable"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{browserSupport.detail}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Session assurance
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {sessionLevel === "aal2"
                ? "Passkey verified"
                : nextLevel === "aal2"
                  ? "Can step up with a passkey"
                  : "Email fallback only right now"}
            </p>
          </div>
        </div>

        {notice ? (
          <p className={`mt-4 ${getNoticeClasses(notice.kind)}`} role="status" aria-live="polite">
            {notice.message}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Passkeys</h2>
            <p className="mt-2 max-w-[68ch] text-sm text-slate-600">
              Add one passkey per device you trust. Email code sign-in remains available as the
              recovery path while this rollout is still maturing.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            {passkeys.length} saved
          </span>
        </div>

        {!browserSupport.supported ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-sm text-slate-600">
            This browser cannot manage passkeys here yet. Use a supported secure browser on the
            device where you want the passkey stored.
          </div>
        ) : (
          <>
            {passkeys.length === 0 && !loading ? (
              <div
                data-testid="account-security-setup-callout"
                className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Recommended next step on this device
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  You already made it in with email code. Add a passkey here now so this device can
                  use its own unlock method next time instead of waiting on another message.
                </p>
              </div>
            ) : null}
            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Device name</span>
                <input
                  data-testid="account-security-passkey-name"
                  type="text"
                  value={newPasskeyName}
                  onChange={(event) => setNewPasskeyName(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm outline-none ring-blue-300 transition focus:ring-2"
                  placeholder="This device"
                />
              </label>
              <button
                type="button"
                data-testid="account-security-add-passkey"
                onClick={() => void handleAddPasskey()}
                disabled={loading || pendingAction !== null}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {pendingAction === "add" ? "Adding passkey..." : "Add passkey on this device"}
              </button>
            </div>

            {loading ? (
              <p className="mt-4 text-sm text-slate-600">Checking saved passkeys...</p>
            ) : passkeys.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-sm text-slate-600">
                No passkeys added yet on this account.
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {passkeys.map((factor) => (
                  <li
                    key={factor.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                    data-testid={`account-security-passkey-${factor.id}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {factor.friendlyName ?? "Passkey"}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          {factor.status === "verified"
                            ? "Ready to use on this account."
                            : "Setup was started but is not verified yet."}
                        </p>
                      </div>
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                          factor.status === "verified"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700",
                        ].join(" ")}
                      >
                        {factor.status}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {factor.status === "verified" && sessionLevel !== "aal2" ? (
                        <button
                          type="button"
                          data-testid={`account-security-verify-passkey-${factor.id}`}
                          onClick={() => void handleVerifyPasskey(factor.id)}
                          disabled={pendingAction !== null}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {pendingAction === `verify:${factor.id}`
                            ? "Verifying..."
                            : "Verify this session"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        data-testid={`account-security-remove-passkey-${factor.id}`}
                        onClick={() => void handleRemovePasskey(factor)}
                        disabled={pendingAction !== null}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pendingAction === `remove:${factor.id}` ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Admin preview unlock</h2>
        <p className="mt-2 max-w-[68ch] text-sm text-slate-600">
          {isAdmin
            ? siteLockEnabled
              ? "When the site is private, signed-in admins can use a verified passkey on the preview unlock page instead of relying only on the shared fallback password."
              : "Site lock is currently off, so admin preview unlock is not needed right now."
            : "This area becomes relevant only for admin accounts that need to unlock the private site while launch lock is active."}
        </p>
      </section>
    </div>
  );
}
