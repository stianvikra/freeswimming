"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminContentItemRow, AdminContentType } from "@/lib/admin/content";

const CONTENT_TYPE_OPTIONS: Array<{ value: AdminContentType; label: string }> = [
  { value: "course_module", label: "Course module" },
  { value: "course_lesson", label: "Course lesson" },
  { value: "guide_session", label: "Guide session" },
  { value: "guide_drill", label: "Guide drill" },
];

type AdminContentListResponse =
  | {
      ok: true;
      items: AdminContentItemRow[];
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

type FormState = {
  contentType: AdminContentType;
  title: string;
  slug: string;
  summary: string;
  status: "draft" | "published";
};

const INITIAL_FORM: FormState = {
  contentType: "course_module",
  title: "",
  slug: "",
  summary: "",
  status: "draft",
};

export default function AdminContentManager() {
  const [items, setItems] = useState<AdminContentItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadItems() {
    setLoading(true);
    setError(null);
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
        return;
      }
      setItems(payload.items);
    } catch {
      setError("Could not load content list.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  const groupedCountLabel = useMemo(() => {
    if (items.length === 0) return "No content items yet.";
    return `${items.length} content item${items.length === 1 ? "" : "s"} in admin catalog.`;
  }, [items]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setActionError(null);

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
    } catch {
      setActionError("Could not create content item.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(item: AdminContentItemRow) {
    if (updatingId || deletingId) return;
    setActionError(null);
    setUpdatingId(item.id);
    const nextStatus = item.status === "published" ? "draft" : "published";

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
    } catch {
      setActionError("Could not delete content item.");
    } finally {
      setDeletingId(null);
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
          <button
            type="button"
            onClick={() => void loadItems()}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

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

        {!loading && !error && items.length === 0 ? (
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
                      {item.content_type} · {item.status} · /{item.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Order: {item.sort_order}</span>
                    <button
                      type="button"
                      onClick={() => void handleToggleStatus(item)}
                      disabled={Boolean(updatingId || deletingId)}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updatingId === item.id
                        ? "Saving…"
                        : item.status === "published"
                          ? "Move to draft"
                          : "Publish"}
                    </button>
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
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Create content item</h2>
        <p className="mt-2 text-sm text-slate-600">
          This scaffold creates draft/published content records for future lesson and guide editors.
        </p>
        <form
          className="mt-5 grid gap-4 sm:grid-cols-2"
          onSubmit={handleCreate}
          data-testid="admin-content-create-form"
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
                  status: e.target.value as "draft" | "published",
                }))
              }
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
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

          {actionError ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
              {actionError}
            </p>
          ) : null}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {submitting ? "Saving…" : "Save content item"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
