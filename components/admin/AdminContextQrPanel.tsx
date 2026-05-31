"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminManagerState from "@/components/admin/AdminManagerState";
import { cx } from "@/components/ui/cx";
import { buildAdminQrPrefillHref } from "@/lib/qr-links/admin-prefill";
import { type QrLinkStatus, type QrRedirectLinkRow } from "@/lib/qr-links/admin";

type AdminQrLinksResponse =
  | {
      ok: true;
      items: QrRedirectLinkRow[];
      schemaReady?: boolean;
      warning?: string | null;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminQrLinkCreateResponse =
  | {
      ok: true;
      item: QrRedirectLinkRow;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminQrLinkUpdateResponse =
  | {
      ok: true;
      item: QrRedirectLinkRow;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminQrLinkDeleteResponse =
  | {
      ok: true;
      id: string;
    }
  | {
      ok: false;
      error?: string;
    };

type FormState = {
  slug: string;
  destinationUrl: string;
  status: QrLinkStatus;
  placementKey: string;
};

type Props = {
  contentItemId: string;
  contentLabel: string;
  slugHint?: string | null;
  destinationPath?: string | null;
  placementKey?: string | null;
  title?: string;
  description?: string;
  destinationHelpText?: string | null;
  className?: string;
};

type EditState = {
  slug: string;
  destinationUrl: string;
  status: QrLinkStatus;
  placementKey: string;
};

const STATUS_OPTIONS: Array<{ value: QrLinkStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
  { value: "archived", label: "Archived" },
];

const STATUS_CHIP_CLASS_BY_VALUE: Record<QrLinkStatus, string> = {
  draft: "border-[color:var(--fs-border-soft)] bg-white/75 text-[color:var(--fs-color-muted)]",
  active:
    "border-emerald-300 bg-[color:var(--fs-color-emerald-100)] text-[color:var(--fs-color-emerald-700)]",
  disabled: "border-amber-300 bg-amber-100 text-amber-800",
  archived:
    "border-[color:var(--fs-border-soft)] bg-[rgba(226,232,240,0.55)] text-[color:var(--fs-color-muted)]",
};

const STATUS_NOTICE_BY_VALUE: Partial<Record<QrLinkStatus, string>> = {
  active: "QR link activated.",
  disabled: "QR link disabled.",
};

const panelClass = "fs-library-card fs-library-card-muted p-4 sm:p-5";
const rowCardClass = "fs-library-card p-3 sm:p-4";
const metadataLabelClass =
  "text-xs font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase";
const mutedTextClass = "text-xs leading-5 text-[color:var(--fs-color-muted)]";
const fieldLabelClass = "space-y-1 text-xs font-medium text-[color:var(--fs-color-ink)]";
const fieldClass =
  "h-9 w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 text-sm text-[color:var(--fs-color-ink-strong)] transition-colors placeholder:text-[color:var(--fs-color-muted)] focus:border-[color:var(--fs-border-brand)] focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-[rgba(248,250,252,0.75)] disabled:text-[color:var(--fs-color-muted)]";
const compactPrimaryActionClass =
  "fs-cta-primary inline-flex min-h-9 items-center justify-center px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const compactSecondaryActionClass =
  "fs-cta-secondary inline-flex min-h-9 items-center justify-center px-3 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const compactQuietActionClass =
  "inline-flex min-h-9 items-center justify-center rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/75 px-3 text-sm font-semibold text-[color:var(--fs-color-ink)] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const dangerActionClass =
  "inline-flex min-h-9 items-center justify-center rounded-[var(--fs-radius-control)] border border-rose-200 bg-white/85 px-3 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

function normalizeTextInput(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("nb-NO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildInitialFormState(params: {
  origin: string;
  slugHint?: string | null;
  destinationPath?: string | null;
  placementKey?: string | null;
}): FormState {
  return {
    slug: normalizeTextInput(params.slugHint ?? "").toLowerCase(),
    destinationUrl: params.destinationPath
      ? `${params.origin}${normalizeTextInput(params.destinationPath)}`
      : "",
    status: "draft",
    placementKey: normalizeTextInput(params.placementKey ?? "").toLowerCase(),
  };
}

function toEditState(item: QrRedirectLinkRow): EditState {
  return {
    slug: item.slug,
    destinationUrl: item.destination_url,
    status: item.status,
    placementKey: item.placement_key,
  };
}

export default function AdminContextQrPanel({
  contentItemId,
  contentLabel,
  slugHint = null,
  destinationPath = null,
  placementKey = null,
  title = "QR links",
  description = "Create and manage stable /go/v/ QR links without leaving this edit flow.",
  destinationHelpText = null,
  className = "",
}: Props) {
  const [origin, setOrigin] = useState("https://freeswimming.org");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [schemaReady, setSchemaReady] = useState(true);
  const [items, setItems] = useState<QrRedirectLinkRow[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>({
    slug: "",
    destinationUrl: "",
    status: "draft",
    placementKey: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    setFormState(
      buildInitialFormState({
        origin,
        slugHint,
        destinationPath,
        placementKey,
      })
    );
  }, [destinationPath, origin, placementKey, slugHint]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWarning(null);
    setActionError(null);
    setActionNotice(null);

    try {
      const response = await fetch(`/api/admin/qr-links?contentItemId=${contentItemId}`, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as AdminQrLinksResponse;

      if (!response.ok || !payload.ok) {
        setItems([]);
        setError(
          payload.ok
            ? "Could not load QR links for this content."
            : (payload.error ?? "Could not load QR links for this content.")
        );
        return;
      }

      setItems(payload.items);
      setSchemaReady(payload.schemaReady !== false);
      setWarning(payload.warning ?? null);
    } catch {
      setItems([]);
      setError("Could not load QR links for this content.");
    } finally {
      setLoading(false);
    }
  }, [contentItemId]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const registryHref = useMemo(
    () =>
      buildAdminQrPrefillHref({
        slugHint,
        destinationPath,
        contentItemId,
        contentLabel,
        placementKey,
      }),
    [contentItemId, contentLabel, destinationPath, placementKey, slugHint]
  );

  function stableLinkForSlug(slug: string): string {
    return `${origin}/go/v/${slug}`;
  }

  async function copyStableLink(item: QrRedirectLinkRow) {
    setCopiedLinkId(null);
    setActionError(null);
    setActionNotice(null);

    try {
      await navigator.clipboard.writeText(stableLinkForSlug(item.slug));
      setCopiedLinkId(item.id);
      setActionNotice("Stable link copied.");
    } catch {
      setActionError("Could not copy stable link automatically. Copy it from the panel instead.");
    }
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setActionError(null);
    setActionNotice(null);

    try {
      const response = await fetch("/api/admin/qr-links", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: normalizeTextInput(formState.slug).toLowerCase(),
          destinationUrl: normalizeTextInput(formState.destinationUrl),
          status: formState.status,
          contentItemId,
          contentLabel,
          placementKey: normalizeTextInput(formState.placementKey).toLowerCase(),
        }),
      });
      const payload = (await response.json()) as AdminQrLinkCreateResponse;

      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok ? "Could not create QR link." : (payload.error ?? "Could not create QR link.")
        );
        return;
      }

      setItems((previous) => [payload.item, ...previous]);
      setFormState(
        buildInitialFormState({
          origin,
          slugHint,
          destinationPath,
          placementKey,
        })
      );
      setActionNotice("QR link created.");
    } catch {
      setActionError("Could not create QR link.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(item: QrRedirectLinkRow) {
    if (savingId || deletingId) return;
    setEditingId(item.id);
    setEditState(toEditState(item));
    setActionError(null);
    setActionNotice(null);
  }

  function cancelEdit() {
    if (savingId || deletingId) return;
    setEditingId(null);
    setEditState(null);
  }

  async function saveEdit(id: string) {
    if (!editState || savingId || deletingId) return;

    setSavingId(id);
    setActionError(null);
    setActionNotice(null);

    try {
      const response = await fetch(`/api/admin/qr-links/${id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: normalizeTextInput(editState.slug).toLowerCase(),
          destinationUrl: normalizeTextInput(editState.destinationUrl),
          status: editState.status,
          placementKey: normalizeTextInput(editState.placementKey).toLowerCase(),
        }),
      });
      const payload = (await response.json()) as AdminQrLinkUpdateResponse;

      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok ? "Could not update QR link." : (payload.error ?? "Could not update QR link.")
        );
        return;
      }

      setItems((previous) =>
        previous.map((item) => (item.id === payload.item.id ? payload.item : item))
      );
      setEditingId(null);
      setEditState(null);
      setActionNotice("QR link updated.");
    } catch {
      setActionError("Could not update QR link.");
    } finally {
      setSavingId(null);
    }
  }

  async function toggleStatus(item: QrRedirectLinkRow) {
    if (savingId || deletingId) return;

    const nextStatus: QrLinkStatus = item.status === "active" ? "disabled" : "active";
    setSavingId(item.id);
    setActionError(null);
    setActionNotice(null);

    try {
      const response = await fetch(`/api/admin/qr-links/${item.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });
      const payload = (await response.json()) as AdminQrLinkUpdateResponse;

      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not update QR status."
            : (payload.error ?? "Could not update QR status.")
        );
        return;
      }

      setItems((previous) =>
        previous.map((entry) => (entry.id === payload.item.id ? payload.item : entry))
      );
      setActionNotice(STATUS_NOTICE_BY_VALUE[nextStatus] ?? "QR link updated.");
    } catch {
      setActionError("Could not update QR status.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteItem(item: QrRedirectLinkRow) {
    if (savingId || deletingId) return;

    const confirmed = window.confirm(
      `Delete QR link "${item.slug}"? This removes the registry record permanently.`
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    setActionError(null);
    setActionNotice(null);

    try {
      const response = await fetch(`/api/admin/qr-links/${item.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const payload = (await response.json()) as AdminQrLinkDeleteResponse;

      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok ? "Could not delete QR link." : (payload.error ?? "Could not delete QR link.")
        );
        return;
      }

      setItems((previous) => previous.filter((entry) => entry.id !== payload.id));
      setActionNotice("QR link deleted.");
    } catch {
      setActionError("Could not delete QR link.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className={cx(panelClass, className)} data-testid="admin-context-qr-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className={metadataLabelClass}>{title}</h4>
          <p className={cx("mt-1", mutedTextClass)}>{description}</p>
        </div>
        <a href={registryHref} className={compactSecondaryActionClass}>
          Open full QR registry
        </a>
      </div>

      {!schemaReady && warning ? (
        <AdminManagerState tone="warning" density="compact" className="mt-3">
          {warning}
        </AdminManagerState>
      ) : null}

      {actionError ? (
        <AdminManagerState tone="error" announcement="polite" density="compact" className="mt-3">
          {actionError}
        </AdminManagerState>
      ) : null}

      {actionNotice ? (
        <AdminManagerState tone="success" density="compact" className="mt-3">
          {actionNotice}
        </AdminManagerState>
      ) : null}

      {loading ? (
        <AdminManagerState tone="loading" density="compact" className="mt-3">
          Loading QR links for this content…
        </AdminManagerState>
      ) : null}

      {!loading && error ? (
        <AdminManagerState
          tone="error"
          density="compact"
          className="mt-3"
          actionsClassName="mt-2"
          actions={
            <button
              type="button"
              onClick={() => void loadItems()}
              className={compactSecondaryActionClass}
            >
              Retry
            </button>
          }
        >
          {error}
        </AdminManagerState>
      ) : null}

      {!loading && !error ? (
        <>
          {items.length === 0 ? (
            <AdminManagerState
              tone="empty"
              title="No QR links attached yet"
              density="spacious"
              className="mt-3"
              testId="admin-context-qr-empty-state"
            >
              Create the first stable `/go/v/` link from this editor.
            </AdminManagerState>
          ) : (
            <ul className="mt-3 space-y-2">
              {items.map((item) => {
                const isEditing = editingId === item.id;
                const isBusy = savingId === item.id || deletingId === item.id;

                return (
                  <li key={item.id} className={rowCardClass} data-testid="admin-context-qr-item">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                          {item.slug}
                        </p>
                        <p className={cx("mt-1 break-all", mutedTextClass)}>
                          Stable link: {stableLinkForSlug(item.slug)}
                        </p>
                      </div>
                      <span
                        className={[
                          "inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-semibold",
                          STATUS_CHIP_CLASS_BY_VALUE[item.status],
                        ].join(" ")}
                      >
                        {item.status}
                      </span>
                    </div>

                    {isEditing && editState ? (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <label className={fieldLabelClass}>
                          <span>Slug</span>
                          <input
                            type="text"
                            value={editState.slug}
                            onChange={(event) =>
                              setEditState((previous) =>
                                previous ? { ...previous, slug: event.target.value } : previous
                              )
                            }
                            className={fieldClass}
                          />
                        </label>

                        <label className={fieldLabelClass}>
                          <span>Status</span>
                          <select
                            value={editState.status}
                            onChange={(event) =>
                              setEditState((previous) =>
                                previous
                                  ? {
                                      ...previous,
                                      status: event.target.value as QrLinkStatus,
                                    }
                                  : previous
                              )
                            }
                            className={fieldClass}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className={cx(fieldLabelClass, "sm:col-span-2")}>
                          <span>Destination URL (https)</span>
                          <input
                            type="url"
                            value={editState.destinationUrl}
                            onChange={(event) =>
                              setEditState((previous) =>
                                previous
                                  ? {
                                      ...previous,
                                      destinationUrl: event.target.value,
                                    }
                                  : previous
                              )
                            }
                            className={fieldClass}
                          />
                        </label>

                        <label className={cx(fieldLabelClass, "sm:col-span-2")}>
                          <span>Placement key</span>
                          <input
                            type="text"
                            value={editState.placementKey}
                            onChange={(event) =>
                              setEditState((previous) =>
                                previous
                                  ? {
                                      ...previous,
                                      placementKey: event.target.value,
                                    }
                                  : previous
                              )
                            }
                            className={fieldClass}
                          />
                        </label>

                        <div className="flex flex-wrap gap-2 sm:col-span-2">
                          <button
                            type="button"
                            onClick={() => void saveEdit(item.id)}
                            disabled={isBusy}
                            className={compactPrimaryActionClass}
                          >
                            {savingId === item.id ? "Saving…" : "Save QR changes"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={isBusy}
                            className={compactSecondaryActionClass}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={cx("mt-2 space-y-1", mutedTextClass)}>
                          <p>Destination: {item.destination_url}</p>
                          <p>Placement: {item.placement_key || "Not set"}</p>
                          <p>Updated: {formatTimestamp(item.updated_at)}</p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void copyStableLink(item)}
                            className={compactPrimaryActionClass}
                          >
                            {copiedLinkId === item.id ? "Copied" : "Copy stable link"}
                          </button>
                          <a
                            href={stableLinkForSlug(item.slug)}
                            target="_blank"
                            rel="noreferrer"
                            className={compactSecondaryActionClass}
                          >
                            Open redirect
                          </a>
                          <a
                            href={item.destination_url}
                            target="_blank"
                            rel="noreferrer"
                            className={compactSecondaryActionClass}
                          >
                            Open destination
                          </a>
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            disabled={isBusy}
                            className={compactSecondaryActionClass}
                          >
                            Edit QR
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleStatus(item)}
                            disabled={isBusy}
                            className={compactQuietActionClass}
                          >
                            {savingId === item.id
                              ? "Saving…"
                              : item.status === "active"
                                ? "Disable"
                                : "Set active"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteItem(item)}
                            disabled={isBusy}
                            className={dangerActionClass}
                          >
                            {deletingId === item.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <form
            className="mt-3 grid gap-3 sm:grid-cols-2"
            onSubmit={handleCreate}
            data-testid="admin-context-qr-create-form"
          >
            <label className={fieldLabelClass}>
              <span>Slug</span>
              <input
                type="text"
                value={formState.slug}
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    slug: event.target.value,
                  }))
                }
                className={fieldClass}
                placeholder="lesson-share"
              />
            </label>

            <label className={fieldLabelClass}>
              <span>Status</span>
              <select
                value={formState.status}
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    status: event.target.value as QrLinkStatus,
                  }))
                }
                className={fieldClass}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={cx(fieldLabelClass, "sm:col-span-2")}>
              <span>Destination URL (https)</span>
              <input
                type="url"
                value={formState.destinationUrl}
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    destinationUrl: event.target.value,
                  }))
                }
                className={fieldClass}
                placeholder="https://freeswimming.org/course?lesson=intro-course--welcome-course-structure"
              />
              <p className="text-[11px] font-normal text-[color:var(--fs-color-muted)]">
                {destinationHelpText ??
                  "Best default is the internal Freeswimming route. Use external video or other allowlisted HTTPS URLs only as an advanced override."}
              </p>
            </label>

            <label className={cx(fieldLabelClass, "sm:col-span-2")}>
              <span>Placement key</span>
              <input
                type="text"
                value={formState.placementKey}
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    placementKey: event.target.value,
                  }))
                }
                className={fieldClass}
                placeholder="course.lesson.share"
              />
            </label>

            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button type="submit" disabled={submitting} className={compactPrimaryActionClass}>
                {submitting ? "Creating…" : "Create QR link"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormState(
                    buildInitialFormState({
                      origin,
                      slugHint,
                      destinationPath,
                      placementKey,
                    })
                  )
                }
                disabled={submitting}
                className={compactSecondaryActionClass}
              >
                Reset defaults
              </button>
            </div>
          </form>
        </>
      ) : null}
    </section>
  );
}
