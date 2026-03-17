"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  draft: "border-slate-300 bg-slate-100 text-slate-700",
  active: "border-emerald-300 bg-emerald-100 text-emerald-800",
  disabled: "border-amber-300 bg-amber-100 text-amber-800",
  archived: "border-slate-300 bg-slate-200 text-slate-700",
};

const STATUS_NOTICE_BY_VALUE: Partial<Record<QrLinkStatus, string>> = {
  active: "QR link activated.",
  disabled: "QR link disabled.",
};

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
    <section
      className={["rounded-lg border border-slate-200 bg-slate-50 p-3", className].join(" ")}
      data-testid="admin-context-qr-panel"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">{title}</h4>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <a
          href={registryHref}
          className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Open full QR registry
        </a>
      </div>

      {!schemaReady && warning ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {warning}
        </p>
      ) : null}

      {actionError ? (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {actionError}
        </p>
      ) : null}

      {actionNotice ? (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {actionNotice}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          Loading QR links for this content…
        </p>
      ) : null}

      {!loading && error ? (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
          <p className="text-xs text-rose-700">{error}</p>
          <button
            type="button"
            onClick={() => void loadItems()}
            className="mt-2 inline-flex h-8 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
          >
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          {items.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-600">
              No QR links attached yet. Create the first stable `/go/v/` link from this editor.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {items.map((item) => {
                const isEditing = editingId === item.id;
                const isBusy = savingId === item.id || deletingId === item.id;

                return (
                  <li
                    key={item.id}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-3"
                    data-testid="admin-context-qr-item"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.slug}</p>
                        <p className="mt-1 text-xs text-slate-500">
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
                        <label className="space-y-1 text-xs font-medium text-slate-700">
                          <span>Slug</span>
                          <input
                            type="text"
                            value={editState.slug}
                            onChange={(event) =>
                              setEditState((previous) =>
                                previous ? { ...previous, slug: event.target.value } : previous
                              )
                            }
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                          />
                        </label>

                        <label className="space-y-1 text-xs font-medium text-slate-700">
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
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
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
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                          />
                        </label>

                        <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
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
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                          />
                        </label>

                        <div className="flex flex-wrap gap-2 sm:col-span-2">
                          <button
                            type="button"
                            onClick={() => void saveEdit(item.id)}
                            disabled={isBusy}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {savingId === item.id ? "Saving…" : "Save QR changes"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={isBusy}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mt-2 space-y-1 text-xs text-slate-600">
                          <p>Destination: {item.destination_url}</p>
                          <p>Placement: {item.placement_key || "Not set"}</p>
                          <p>Updated: {formatTimestamp(item.updated_at)}</p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void copyStableLink(item)}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            {copiedLinkId === item.id ? "Copied" : "Copy stable link"}
                          </button>
                          <a
                            href={stableLinkForSlug(item.slug)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Open redirect
                          </a>
                          <a
                            href={item.destination_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Open destination
                          </a>
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            disabled={isBusy}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Edit QR
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleStatus(item)}
                            disabled={isBusy}
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
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
                            className="inline-flex h-8 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
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
            <label className="space-y-1 text-xs font-medium text-slate-700">
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
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                placeholder="lesson-share"
              />
            </label>

            <label className="space-y-1 text-xs font-medium text-slate-700">
              <span>Status</span>
              <select
                value={formState.status}
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    status: event.target.value as QrLinkStatus,
                  }))
                }
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
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
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                placeholder="https://freeswimming.org/course?lesson=intro-course--welcome-course-structure"
              />
              <p className="text-[11px] font-normal text-slate-500">
                {destinationHelpText ??
                  "Best default is the internal Freeswimming route. Use external video or other allowlisted HTTPS URLs only as an advanced override."}
              </p>
            </label>

            <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
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
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                placeholder="course.lesson.share"
              />
            </label>

            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
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
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
