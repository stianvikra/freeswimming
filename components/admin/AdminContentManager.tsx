"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AdminContentItemRow,
  AdminContentStatus,
  AdminContentType,
} from "@/lib/admin/content";
import type { AdminCategoryRow } from "@/lib/admin/categories";

const CONTENT_TYPE_OPTIONS: Array<{ value: AdminContentType; label: string }> = [
  { value: "course_module", label: "Course module" },
  { value: "course_lesson", label: "Course lesson" },
  { value: "guide_session", label: "Guide session" },
  { value: "guide_drill", label: "Guide drill" },
];

const STATUS_OPTIONS: Array<{ value: AdminContentStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

type MirrorMetric = {
  key: "course_module" | "course_lesson" | "guide_session" | "guide_drill" | "programs";
  label: string;
  platformCount: number;
  adminCount: number;
  delta: number;
  status: "matched" | "missing" | "extra" | "drift";
  coverage: {
    missingCount: number;
    extraCount: number;
    missingSamples: string[];
    extraSamples: string[];
  };
};

type MirrorSnapshot = {
  checkedAt: string;
  metrics: MirrorMetric[];
  summary: {
    matchedCount: number;
    mismatchCount: number;
    coverageMismatchCount: number;
  };
};

type AdminContentListResponse =
  | {
      ok: true;
      items: AdminContentItemRow[];
      schemaReady?: boolean;
      warning?: string | null;
      mirror?: MirrorSnapshot;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminContentCreateResponse =
  | {
      ok: true;
      item: AdminContentItemRow;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminContentUpdateResponse =
  | {
      ok: true;
      item: AdminContentItemRow;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminContentDeleteResponse =
  | {
      ok: true;
      id: string;
    }
  | {
      ok: false;
      error?: string;
    };

type ContentRevisionItem = {
  id: string;
  revisionNumber: number;
  action: string;
  changedByEmail: string | null;
  createdAt: string;
  snapshotTitle: string;
  snapshotStatus: string;
};

type AdminContentRevisionsResponse =
  | {
      ok: true;
      canRestore: boolean;
      items: ContentRevisionItem[];
    }
  | {
      ok: false;
      error?: string;
    };

type AdminContentRestoreResponse =
  | {
      ok: true;
      item: AdminContentItemRow;
      restoredRevisionId: string;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminCategoriesResponse =
  | {
      ok: true;
      items: AdminCategoryRow[];
      schemaReady?: boolean;
      warning?: string | null;
    }
  | {
      ok: false;
      error?: string;
    };

type FormState = {
  contentType: AdminContentType;
  title: string;
  slug: string;
  summary: string;
  category: string;
  status: AdminContentStatus;
};

const INITIAL_FORM: FormState = {
  contentType: "course_module",
  title: "",
  slug: "",
  summary: "",
  category: "General",
  status: "draft",
};

export default function AdminContentManager() {
  const [items, setItems] = useState<AdminContentItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [schemaReady, setSchemaReady] = useState(true);
  const [mirror, setMirror] = useState<MirrorSnapshot | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openRevisionsItemId, setOpenRevisionsItemId] = useState<string | null>(null);
  const [revisionsByItemId, setRevisionsByItemId] = useState<Record<string, ContentRevisionItem[]>>(
    {}
  );
  const [canRestoreByItemId, setCanRestoreByItemId] = useState<Record<string, boolean>>({});
  const [revisionsLoadingItemId, setRevisionsLoadingItemId] = useState<string | null>(null);
  const [restoringRevisionId, setRestoringRevisionId] = useState<string | null>(null);

  function formatRevisionDate(iso: string): string {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return "Unknown time";
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsed);
  }

  async function loadItems() {
    setLoading(true);
    setError(null);
    setWarning(null);
    try {
      const response = await fetch("/api/admin/content", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as AdminContentListResponse;
      if (!response.ok || !payload.ok) {
        setError(
          payload.ok
            ? "Could not load content list."
            : (payload.error ?? "Could not load content list.")
        );
        setItems([]);
        setSchemaReady(true);
        setMirror(null);
        return;
      }
      setItems(payload.items);
      setSchemaReady(payload.schemaReady !== false);
      setWarning(payload.warning ?? null);
      setMirror(payload.mirror ?? null);

      const categoriesResponse = await fetch("/api/admin/categories/content", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const categoriesPayload = (await categoriesResponse.json()) as AdminCategoriesResponse;
      if (categoriesResponse.ok && categoriesPayload.ok) {
        setCategoryOptions(
          categoriesPayload.items
            .filter((item) => item.is_active)
            .map((item) => item.title)
            .filter((value, index, self) => self.indexOf(value) === index)
        );
      } else {
        setCategoryOptions([]);
      }
    } catch {
      setError("Could not load content list.");
      setItems([]);
      setSchemaReady(true);
      setMirror(null);
      setCategoryOptions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  const groupedCountLabel = useMemo(() => {
    if (!schemaReady) return "Content catalog will appear after admin content setup is ready.";
    if (items.length === 0) return "No content items yet.";
    return `${items.length} content item${items.length === 1 ? "" : "s"} in admin catalog.`;
  }, [items, schemaReady]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setActionError(null);
    setActionNotice(null);

    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          contentType: formState.contentType,
          title: formState.title,
          slug: formState.slug,
          summary: formState.summary,
          category: formState.category,
          status: formState.status,
        }),
      });

      const payload = (await response.json()) as AdminContentCreateResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not create content item."
            : (payload.error ?? "Could not create content item.")
        );
        return;
      }

      setItems((prev) => [payload.item, ...prev]);
      setFormState(INITIAL_FORM);
      setActionNotice("Content item created.");
    } catch {
      setActionError("Could not create content item.");
    } finally {
      setSubmitting(false);
    }
  }

  function statusNotice(status: AdminContentStatus): string {
    if (status === "published") return "Content item published.";
    if (status === "review") return "Moved to review.";
    if (status === "archived") return "Content item archived.";
    return "Moved to draft.";
  }

  function statusActionLabel(status: AdminContentStatus): string {
    if (status === "published") return "Publish";
    if (status === "review") return "Move to review";
    if (status === "archived") return "Archive";
    return "Move to draft";
  }

  async function handleSetStatus(item: AdminContentItemRow, nextStatus: AdminContentStatus) {
    if (updatingId || deletingId) return;
    if (item.status === nextStatus) return;
    setActionError(null);
    setActionNotice(null);
    setUpdatingId(item.id);

    try {
      const response = await fetch(`/api/admin/content/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = (await response.json()) as AdminContentUpdateResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not update content item."
            : (payload.error ?? "Could not update content item.")
        );
        return;
      }

      setItems((prev) =>
        prev.map((entry) => (entry.id === payload.item.id ? payload.item : entry))
      );
      setActionNotice(statusNotice(nextStatus));
    } catch {
      setActionError("Could not update content item.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(item: AdminContentItemRow) {
    if (updatingId || deletingId) return;
    const confirmed = window.confirm(
      `Delete "${item.title}"? This cannot be undone and removes this content record.`
    );
    if (!confirmed) return;

    setActionError(null);
    setActionNotice(null);
    setDeletingId(item.id);
    try {
      const response = await fetch(`/api/admin/content/${item.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const payload = (await response.json()) as AdminContentDeleteResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not delete content item."
            : (payload.error ?? "Could not delete content item.")
        );
        return;
      }

      setItems((prev) => prev.filter((entry) => entry.id !== payload.id));
      setActionNotice("Content item deleted.");
    } catch {
      setActionError("Could not delete content item.");
    } finally {
      setDeletingId(null);
    }
  }

  async function loadRevisionsForItem(itemId: string, force = false): Promise<boolean> {
    if (!force && revisionsByItemId[itemId]) {
      return true;
    }

    setRevisionsLoadingItemId(itemId);
    setActionError(null);
    try {
      const response = await fetch(`/api/admin/content/${itemId}/revisions`, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as AdminContentRevisionsResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not load revision history."
            : (payload.error ?? "Could not load revision history.")
        );
        return false;
      }

      setRevisionsByItemId((prev) => ({
        ...prev,
        [itemId]: payload.items,
      }));
      setCanRestoreByItemId((prev) => ({
        ...prev,
        [itemId]: payload.canRestore,
      }));
      return true;
    } catch {
      setActionError("Could not load revision history.");
      return false;
    } finally {
      setRevisionsLoadingItemId(null);
    }
  }

  async function handleToggleRevisions(itemId: string) {
    if (openRevisionsItemId === itemId) {
      setOpenRevisionsItemId(null);
      return;
    }

    const loaded = await loadRevisionsForItem(itemId);
    if (!loaded) return;

    setOpenRevisionsItemId(itemId);
  }

  async function handleRestoreRevision(item: AdminContentItemRow, revisionId: string) {
    if (restoringRevisionId || updatingId || deletingId) return;
    const confirmed = window.confirm(
      `Restore "${item.title}" to this revision? Current values will be replaced.`
    );
    if (!confirmed) return;

    setActionError(null);
    setActionNotice(null);
    setRestoringRevisionId(revisionId);

    try {
      const response = await fetch(`/api/admin/content/${item.id}/revisions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ revisionId }),
      });
      const payload = (await response.json()) as AdminContentRestoreResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not restore revision."
            : (payload.error ?? "Could not restore revision.")
        );
        return;
      }

      setItems((prev) =>
        prev.map((entry) => (entry.id === payload.item.id ? payload.item : entry))
      );
      await loadRevisionsForItem(item.id, true);
      setActionNotice("Revision restored.");
    } catch {
      setActionError("Could not restore revision.");
    } finally {
      setRestoringRevisionId(null);
    }
  }

  return (
    <div className="space-y-6" data-testid="admin-content-manager">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Content items</h2>
            <p className="mt-2 text-sm text-slate-600">{groupedCountLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadItems()}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {!schemaReady && warning ? (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {warning}
          </p>
        ) : null}

        {schemaReady && mirror ? (
          <article className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Platform mirror snapshot</h3>
              <p className="text-xs text-slate-500">
                {mirror.summary.mismatchCount === 0
                  ? "All aligned"
                  : `${mirror.summary.mismatchCount} mismatch${
                      mirror.summary.mismatchCount === 1 ? "" : "es"
                    }`}
                {mirror.summary.coverageMismatchCount > 0
                  ? ` · ${mirror.summary.coverageMismatchCount} identity drift${
                      mirror.summary.coverageMismatchCount === 1 ? "" : "s"
                    }`
                  : ""}
              </p>
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {mirror.metrics.map((metric) => (
                <li
                  key={metric.key}
                  className={[
                    "rounded-lg border px-3 py-2 text-xs",
                    metric.status === "matched"
                      ? "border-emerald-200 bg-emerald-50/70 text-emerald-800"
                      : "border-amber-200 bg-amber-50 text-amber-900",
                  ].join(" ")}
                >
                  <p className="font-semibold">{metric.label}</p>
                  <p className="mt-1">
                    Platform: {metric.platformCount} · Admin: {metric.adminCount}
                    {metric.delta !== 0
                      ? ` · Delta: ${metric.delta > 0 ? "+" : ""}${metric.delta}`
                      : ""}
                  </p>
                  {metric.coverage.missingCount > 0 ? (
                    <p className="mt-1">
                      Missing IDs: {metric.coverage.missingCount}
                      {metric.coverage.missingSamples.length > 0
                        ? ` (${metric.coverage.missingSamples.join(", ")})`
                        : ""}
                    </p>
                  ) : null}
                  {metric.coverage.extraCount > 0 ? (
                    <p className="mt-1">
                      Extra IDs: {metric.coverage.extraCount}
                      {metric.coverage.extraSamples.length > 0
                        ? ` (${metric.coverage.extraSamples.join(", ")})`
                        : ""}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Snapshot checks current platform modules/lessons/guides/products against admin
              records.
            </p>
          </article>
        ) : null}

        {loading ? (
          <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Loading content list…
          </p>
        ) : null}

        {!loading && error ? (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-sm font-medium text-rose-700">{error}</p>
            <button
              type="button"
              onClick={() => void loadItems()}
              className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
            >
              Retry
            </button>
          </div>
        ) : null}

        {actionNotice ? (
          <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {actionNotice}
          </p>
        ) : null}

        {!loading && !error && schemaReady && items.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No content items created yet. Use the form below to create your first draft.
          </p>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                data-testid="admin-content-item"
                className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.content_type} · {item.category} · {item.status} · /{item.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Order: {item.sort_order}</span>
                    <button
                      type="button"
                      onClick={() => void handleToggleRevisions(item.id)}
                      disabled={Boolean(updatingId || deletingId || restoringRevisionId)}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {openRevisionsItemId === item.id ? "Hide revisions" : "Revisions"}
                    </button>
                    {STATUS_OPTIONS.filter((option) => option.value !== item.status).map(
                      (option) => (
                        <button
                          key={`${item.id}-${option.value}`}
                          type="button"
                          onClick={() => void handleSetStatus(item, option.value)}
                          disabled={Boolean(updatingId || deletingId)}
                          className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingId === item.id ? "Saving…" : statusActionLabel(option.value)}
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => void handleDelete(item)}
                      disabled={Boolean(updatingId || deletingId)}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === item.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
                {openRevisionsItemId === item.id ? (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Revision history
                    </h4>
                    {revisionsLoadingItemId === item.id ? (
                      <p className="mt-2 text-xs text-slate-500">Loading revisions…</p>
                    ) : null}
                    {revisionsLoadingItemId !== item.id &&
                    (revisionsByItemId[item.id] ?? []).length === 0 ? (
                      <p className="mt-2 text-xs text-slate-500">No revisions yet.</p>
                    ) : null}
                    {revisionsLoadingItemId !== item.id &&
                    (revisionsByItemId[item.id] ?? []).length > 0 ? (
                      <ul className="mt-2 space-y-2">
                        {(revisionsByItemId[item.id] ?? []).map((revision) => (
                          <li
                            key={revision.id}
                            data-testid="admin-content-revision-item"
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-700">
                                Rev {revision.revisionNumber} · {revision.action}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {revision.snapshotTitle} · {revision.snapshotStatus} ·{" "}
                                {formatRevisionDate(revision.createdAt)}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {revision.changedByEmail ?? "Unknown actor"}
                              </p>
                            </div>
                            {canRestoreByItemId[item.id] ? (
                              <button
                                type="button"
                                onClick={() => void handleRestoreRevision(item, revision.id)}
                                disabled={
                                  Boolean(updatingId || deletingId || restoringRevisionId) ||
                                  revision.action === "delete"
                                }
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 bg-white px-3 text-xs font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {restoringRevisionId === revision.id ? "Restoring…" : "Restore"}
                              </button>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Create content item</h2>
        <p className="mt-2 text-sm text-slate-600">
          Create and stage content records that power course and guide experiences in the app.
        </p>
        {!schemaReady ? (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Setup is not ready yet. Apply latest admin schema migrations before creating content.
          </p>
        ) : null}
        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          onSubmit={handleCreate}
          data-testid="admin-content-create-form"
        >
          <fieldset
            disabled={!schemaReady || submitting}
            className="contents disabled:cursor-not-allowed disabled:opacity-70"
          >
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Type</span>
              <select
                value={formState.contentType}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    contentType: e.target.value as AdminContentType,
                  }))
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                {CONTENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Status</span>
              <select
                value={formState.status}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    status: e.target.value as AdminContentStatus,
                  }))
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700 sm:col-span-2">
              <span>Title</span>
              <input
                type="text"
                required
                value={formState.title}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                placeholder="Module 1 foundations"
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700 sm:col-span-2">
              <span>Slug (optional)</span>
              <input
                type="text"
                value={formState.slug}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    slug: e.target.value,
                  }))
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                placeholder="module-1-foundations"
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700 sm:col-span-2">
              <span>Summary</span>
              <textarea
                rows={3}
                value={formState.summary}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    summary: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                placeholder="Short purpose or editor note."
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700 sm:col-span-2">
              <span>Category</span>
              <input
                type="text"
                list="admin-content-category-options"
                value={formState.category}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                placeholder="General"
              />
              <datalist id="admin-content-category-options">
                {categoryOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </label>

            {actionError ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
                {actionError}
              </p>
            ) : null}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={!schemaReady || submitting}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {submitting ? "Saving…" : "Save content item"}
              </button>
            </div>
          </fieldset>
        </form>
      </section>
    </div>
  );
}
