"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminManagerState from "@/components/admin/AdminManagerState";
import { cx } from "@/components/ui/cx";
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

const managerHeaderClass = "fs-library-card fs-library-card-accent p-4 sm:p-5";
const rowCardClass = "fs-library-card p-4 sm:p-5";
const siteLockCardClass = "fs-library-card fs-library-card-muted p-4 sm:p-5";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";
const eyebrowClass = "text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]";
const headingClass = "text-lg font-semibold text-[color:var(--fs-color-ink-strong)]";
const secondaryActionClass =
  "fs-cta-secondary inline-flex min-h-10 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const compactSecondaryActionClass =
  "fs-cta-secondary inline-flex min-h-9 items-center justify-center px-3 text-xs font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const primaryActionClass =
  "fs-cta-primary inline-flex min-h-9 items-center justify-center px-3 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const metadataLabelClass =
  "text-xs font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase";

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
    <section className="space-y-4" data-testid="admin-operations-manager">
      <div className={managerHeaderClass} data-testid="admin-operations-manager-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={eyebrowClass}>Operations</p>
            <h2 className={cx("mt-1", headingClass)}>Runtime controls</h2>
            <p className={cx("mt-2", mutedTextClass)}>{flagCountLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadOperations()}
            className={secondaryActionClass}
          >
            Refresh
          </button>
        </div>
      </div>

      <div>
        {loading ? (
          <AdminManagerState tone="loading">Loading operations state…</AdminManagerState>
        ) : null}

        {!loading && error ? (
          <AdminManagerState
            tone="error"
            actions={
              <button
                type="button"
                onClick={() => void loadOperations()}
                className={secondaryActionClass}
              >
                Retry
              </button>
            }
          >
            {error}
          </AdminManagerState>
        ) : null}

        {!schemaReady && warning ? (
          <AdminManagerState tone="warning">{warning}</AdminManagerState>
        ) : null}
      </div>

      {!loading && !error && siteLock ? (
        <article className={siteLockCardClass} data-testid="admin-operations-site-lock-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className={metadataLabelClass}>Site lock</p>
              <h3 className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                Private Access Gate (env-controlled)
              </h3>
            </div>
            <span
              className={[
                "inline-flex min-h-8 items-center rounded-[var(--fs-radius-control)] px-3 text-xs font-semibold ring-1",
                siteLock.enabled
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-white text-[color:var(--fs-color-muted)] ring-[color:var(--fs-border-soft)]",
              ].join(" ")}
            >
              {siteLock.enabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          <p className={cx("mt-3", mutedTextClass)}>
            This lock is read-only in Admin. It is controlled by environment variables in hosting
            settings for security.
          </p>
          <div className="mt-4 grid gap-3 text-xs text-[color:var(--fs-color-muted)] sm:grid-cols-3">
            <p>
              <span className="font-semibold text-[color:var(--fs-color-ink)]">
                Environment setup:
              </span>{" "}
              {siteLock.configured ? "yes" : "no"}
            </p>
            <p>
              <span className="font-semibold text-[color:var(--fs-color-ink)]">Access method:</span>{" "}
              {siteLock.mode}
            </p>
            <p>
              <span className="font-semibold text-[color:var(--fs-color-ink)]">Session TTL:</span>{" "}
              {formatDuration(siteLock.sessionMaxAgeSeconds)}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={SITE_LOCK_WORKFLOW_URL}
              target="_blank"
              rel="noreferrer"
              className={compactSecondaryActionClass}
            >
              Open lock operations workflow
            </a>
            <Link href="/preview-access?next=%2Fadmin" className={compactSecondaryActionClass}>
              Open unlock page
            </Link>
            <Link
              href="/preview-access/clear?next=%2Fadmin"
              className={compactSecondaryActionClass}
            >
              Sign out this browser
            </Link>
          </div>
          <p className="mt-4 text-xs text-[color:var(--fs-color-muted)]">
            Operator runbook:{" "}
            <a
              href={SITE_LOCK_RUNBOOK_URL}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[color:var(--fs-color-ink)] underline underline-offset-2"
            >
              docs/runbooks/site-lock-operations.md
            </a>
          </p>
          <div className="mt-3 space-y-2 text-xs leading-5 text-[color:var(--fs-color-muted)]">
            <p>
              Signed-in admins are issued preview access automatically; the shared preview password
              remains the fallback for non-admin preview access.
            </p>
            <p>
              To turn this off: set <code>SITE_LOCK_ENABLED=0</code> in hosting environment settings
              and redeploy.
            </p>
            <p>
              Required env vars: <code>SITE_LOCK_ENABLED</code>,{" "}
              <code>SITE_LOCK_PASSWORD_HASH</code>, <code>SITE_LOCK_BYPASS_TOKEN</code>.
            </p>
          </div>
        </article>
      ) : null}

      {actionError ? (
        <AdminManagerState tone="error" announcement="polite" density="compact">
          {actionError}
        </AdminManagerState>
      ) : null}

      {!loading && !error && flags.length > 0 ? (
        <ul className="space-y-3">
          {flags.map((flag) => (
            <li key={flag.key} className={rowCardClass} data-testid="admin-operations-flag-row">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                    {runtimeFlagLabel(flag.key)}
                  </h3>
                  <p className={cx("mt-1", mutedTextClass)}>
                    {runtimeFlagHint(flag.key, flag.description)}
                  </p>
                  <p className="mt-2 text-xs text-[color:var(--fs-color-muted)]">
                    key: <code>{flag.key}</code> • {flag.is_public ? "public-read" : "admin-only"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleFlag(flag)}
                  disabled={Boolean(updatingKey)}
                  className={flag.enabled ? compactSecondaryActionClass : primaryActionClass}
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
