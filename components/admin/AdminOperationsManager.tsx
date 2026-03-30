"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminRuntimeFlagRow } from "@/lib/admin/runtime-flags";

type SiteLockSnapshot = {
  configured: boolean;
  enabled: boolean;
  mode: string;
  cookieName: string;
  sessionMaxAgeSeconds: number;
};

type AdminOperationsResponse =
  | {
      ok: true;
      siteLock: SiteLockSnapshot;
      flags: AdminRuntimeFlagRow[];
      schemaReady?: boolean;
      warning?: string | null;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminRuntimeFlagUpdateResponse =
  | {
      ok: true;
      item: AdminRuntimeFlagRow;
    }
  | {
      ok: false;
      error?: string;
    };

const SITE_LOCK_WORKFLOW_URL =
  "https://github.com/stianvikra/freeswimming/actions/workflows/site-lock-operations.yml";
const SITE_LOCK_RUNBOOK_URL =
  "https://github.com/stianvikra/freeswimming/blob/main/docs/runbooks/site-lock-operations.md";

function runtimeFlagLabel(key: string): string {
  return key;
}

function runtimeFlagHint(_key: string, fallbackDescription: string): string {
  return fallbackDescription || "Runtime flag.";
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "n/a";
  const hours = Math.round(seconds / 3600);
  return `${hours}h (${seconds}s)`;
}

export default function AdminOperationsManager() {
  const [flags, setFlags] = useState<AdminRuntimeFlagRow[]>([]);
  const [siteLock, setSiteLock] = useState<SiteLockSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [schemaReady, setSchemaReady] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  async function loadOperations() {
    setLoading(true);
    setError(null);
    setWarning(null);
    try {
      const response = await fetch("/api/admin/operations/flags", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as AdminOperationsResponse;
      if (!response.ok || !payload.ok) {
        setError(
          payload.ok
            ? "Could not load operations data."
            : (payload.error ?? "Could not load operations data.")
        );
        setFlags([]);
        setSiteLock(null);
        setSchemaReady(true);
        return;
      }

      setFlags(payload.flags);
      setSiteLock(payload.siteLock);
      setSchemaReady(payload.schemaReady !== false);
      setWarning(payload.warning ?? null);
    } catch {
      setError("Could not load operations data.");
      setFlags([]);
      setSiteLock(null);
      setSchemaReady(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOperations();
  }, []);

  const flagCountLabel = useMemo(() => {
    if (flags.length === 0) return "No runtime flags configured.";
    return `${flags.length} runtime flag${flags.length === 1 ? "" : "s"} available.`;
  }, [flags]);

  async function toggleFlag(flag: AdminRuntimeFlagRow) {
    if (updatingKey) return;
    setUpdatingKey(flag.key);
    setActionError(null);

    try {
      const response = await fetch(`/api/admin/operations/flags/${flag.key}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          enabled: !flag.enabled,
        }),
      });
      const payload = (await response.json()) as AdminRuntimeFlagUpdateResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not update runtime flag."
            : (payload.error ?? "Could not update runtime flag.")
        );
        return;
      }

      setFlags((prev) =>
        prev.map((entry) => (entry.key === payload.item.key ? payload.item : entry))
      );
    } catch {
      setActionError("Could not update runtime flag.");
    } finally {
      setUpdatingKey(null);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Operations</h2>
          <p className="mt-2 text-sm text-slate-600">{flagCountLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => void loadOperations()}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Loading operations state…
        </p>
      ) : null}

      {!loading && error ? (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm font-medium text-rose-700">{error}</p>
          <button
            type="button"
            onClick={() => void loadOperations()}
            className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!schemaReady && warning ? (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {warning}
        </p>
      ) : null}

      {!loading && !error && siteLock ? (
        <article className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Private Access Gate (env-controlled)
            </h3>
            <span
              className={[
                "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
                siteLock.enabled
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-700",
              ].join(" ")}
            >
              {siteLock.enabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            This lock is read-only in Admin. It is controlled by environment variables in hosting
            settings for security.
          </p>
          <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
            <p>
              <span className="font-semibold text-slate-700">Environment setup:</span>{" "}
              {siteLock.configured ? "yes" : "no"}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Access method:</span> {siteLock.mode}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Session TTL:</span>{" "}
              {formatDuration(siteLock.sessionMaxAgeSeconds)}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={SITE_LOCK_WORKFLOW_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-medium text-indigo-800 transition hover:bg-indigo-100"
            >
              Open lock operations workflow
            </a>
            <a
              href="/preview-access?next=%2Fadmin"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Open unlock page
            </a>
            <a
              href="/preview-access/clear?next=%2Fadmin"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sign out this browser
            </a>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Operator runbook:{" "}
            <a
              href={SITE_LOCK_RUNBOOK_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-slate-700 underline underline-offset-2"
            >
              docs/runbooks/site-lock-operations.md
            </a>
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Signed-in admins should use the shared preview password on the unlock page today;
            stronger device-based admin unlock remains deferred.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            To turn this off: set <code>SITE_LOCK_ENABLED=0</code> in hosting environment settings
            and redeploy.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Required env vars: <code>SITE_LOCK_ENABLED</code>, <code>SITE_LOCK_PASSWORD_HASH</code>,{" "}
            <code>SITE_LOCK_BYPASS_TOKEN</code>.
          </p>
        </article>
      ) : null}

      {actionError ? (
        <p className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {actionError}
        </p>
      ) : null}

      {!loading && !error && flags.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {flags.map((flag) => (
            <li key={flag.key} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {runtimeFlagLabel(flag.key)}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {runtimeFlagHint(flag.key, flag.description)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    key: <code>{flag.key}</code> • {flag.is_public ? "public-read" : "admin-only"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleFlag(flag)}
                  disabled={Boolean(updatingKey)}
                  className={[
                    "inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold transition",
                    flag.enabled
                      ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      : "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
                    updatingKey ? "cursor-not-allowed opacity-60" : "",
                  ].join(" ")}
                >
                  {updatingKey === flag.key ? "Saving…" : flag.enabled ? "Disable" : "Enable"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
