"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminManagerState from "@/components/admin/AdminManagerState";
import { cx } from "@/components/ui/cx";
import type { AdminCategoryRow, AdminCategoryScope } from "@/lib/admin/categories";

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

type AdminCategoryCreateResponse =
  | {
      ok: true;
      item: AdminCategoryRow;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminCategoryUpdateResponse =
  | {
      ok: true;
      item: AdminCategoryRow;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminCategoryDeleteResponse =
  | {
      ok: true;
      id: string;
    }
  | {
      ok: false;
      error?: string;
    };

type FormState = {
  title: string;
  slug: string;
  sortOrder: string;
};

const CATEGORY_SCOPES: Array<{ id: AdminCategoryScope; label: string; subtitle: string }> = [
  {
    id: "notes",
    label: "Notes categories",
    subtitle: "Used by admin notes and planning tasks.",
  },
  {
    id: "content",
    label: "Content categories",
    subtitle: "Used to classify modules, lessons, guides, and programs.",
  },
];

const INITIAL_FORM: FormState = {
  title: "",
  slug: "",
  sortOrder: "0",
};

const managerHeaderClass = "fs-library-card fs-library-card-accent p-4 sm:p-5";
const createPanelClass = "fs-library-card fs-library-card-muted p-4 sm:p-5";
const rowCardClass = "fs-library-card p-4 sm:p-5";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";
const eyebrowClass = "text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]";
const headingClass = "text-lg font-semibold text-[color:var(--fs-color-ink-strong)]";
const fieldClass =
  "h-10 w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 text-sm text-[color:var(--fs-color-ink-strong)] transition-colors focus:border-[color:var(--fs-border-brand)] focus:outline-none";
const secondaryActionClass =
  "fs-cta-secondary inline-flex min-h-10 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const primaryActionClass =
  "fs-cta-primary inline-flex min-h-10 items-center justify-center px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const compactStatusActionClass =
  "inline-flex min-h-9 items-center justify-center rounded-[var(--fs-radius-control)] px-3 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const activateActionClass = cx(
  compactStatusActionClass,
  "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 focus-visible:ring-emerald-500"
);
const deactivateActionClass = cx(
  compactStatusActionClass,
  "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 focus-visible:ring-amber-500"
);
const destructiveActionClass =
  "inline-flex min-h-9 items-center justify-center rounded-[var(--fs-radius-control)] border border-rose-200 bg-white/85 px-3 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const scopeCardClass =
  "fs-library-card p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const scopeCardActiveClass = "fs-library-card-accent border-[color:var(--fs-border-brand)]";
const labelClass = "space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]";

export default function AdminCategoriesManager() {
  const [scope, setScope] = useState<AdminCategoryScope>("notes");
  const [items, setItems] = useState<AdminCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [schemaReady, setSchemaReady] = useState(true);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCategories = useCallback(
    async (targetScope: AdminCategoryScope = scope) => {
      setLoading(true);
      setError(null);
      setWarning(null);
      try {
        const response = await fetch(`/api/admin/categories/${targetScope}`, {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        const payload = (await response.json()) as AdminCategoriesResponse;
        if (!response.ok || !payload.ok) {
          setError(
            payload.ok
              ? "Could not load categories."
              : (payload.error ?? "Could not load categories.")
          );
          setItems([]);
          setSchemaReady(true);
          return;
        }

        setItems(payload.items);
        setSchemaReady(payload.schemaReady !== false);
        setWarning(payload.warning ?? null);
      } catch {
        setError("Could not load categories.");
        setItems([]);
        setSchemaReady(true);
      } finally {
        setLoading(false);
      }
    },
    [scope]
  );

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const categorySummary = useMemo(() => {
    if (items.length === 0) return "No categories configured.";
    const active = items.filter((item) => item.is_active).length;
    const inactive = items.length - active;
    return `${active} active · ${inactive} inactive`;
  }, [items]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/admin/categories/${scope}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          title: formState.title,
          slug: formState.slug,
          sortOrder: Number.parseInt(formState.sortOrder || "0", 10),
        }),
      });
      const payload = (await response.json()) as AdminCategoryCreateResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not create category."
            : (payload.error ?? "Could not create category.")
        );
        return;
      }

      setItems((prev) =>
        [...prev, payload.item].sort(
          (a, b) =>
            a.sort_order - b.sort_order ||
            a.created_at.localeCompare(b.created_at) ||
            a.title.localeCompare(b.title)
        )
      );
      setFormState(INITIAL_FORM);
    } catch {
      setActionError("Could not create category.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(item: AdminCategoryRow) {
    if (updatingId || deletingId) return;
    setActionError(null);
    setUpdatingId(item.id);

    try {
      const response = await fetch(`/api/admin/categories/${scope}/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          isActive: !item.is_active,
        }),
      });
      const payload = (await response.json()) as AdminCategoryUpdateResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not update category."
            : (payload.error ?? "Could not update category.")
        );
        return;
      }

      setItems((prev) =>
        prev.map((entry) => (entry.id === payload.item.id ? payload.item : entry))
      );
    } catch {
      setActionError("Could not update category.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(item: AdminCategoryRow) {
    if (updatingId || deletingId) return;
    const confirmed = window.confirm(`Delete category "${item.title}"?`);
    if (!confirmed) return;

    setActionError(null);
    setDeletingId(item.id);
    try {
      const response = await fetch(`/api/admin/categories/${scope}/${item.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const payload = (await response.json()) as AdminCategoryDeleteResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not delete category."
            : (payload.error ?? "Could not delete category.")
        );
        return;
      }

      setItems((prev) => prev.filter((entry) => entry.id !== payload.id));
    } catch {
      setActionError("Could not delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4" data-testid="admin-categories-manager">
      <section className={managerHeaderClass} data-testid="admin-categories-manager-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={eyebrowClass}>Admin library</p>
            <h2 className={cx("mt-1", headingClass)}>Categories</h2>
            <p className={cx("mt-2", mutedTextClass)}>{categorySummary}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadCategories(scope)}
            className={secondaryActionClass}
          >
            Refresh
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {CATEGORY_SCOPES.map((option) => {
            const isActive = scope === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setScope(option.id)}
                className={cx(scopeCardClass, isActive && scopeCardActiveClass)}
                aria-pressed={isActive}
              >
                <p
                  className={cx(
                    "text-sm font-semibold",
                    isActive
                      ? "text-[color:var(--fs-color-brand-700)]"
                      : "text-[color:var(--fs-color-ink-strong)]"
                  )}
                >
                  {option.label}
                </p>
                <p className="mt-1 text-xs text-[color:var(--fs-color-muted)]">{option.subtitle}</p>
              </button>
            );
          })}
        </div>
      </section>

      <div>
        {!schemaReady && warning ? (
          <AdminManagerState tone="warning">{warning}</AdminManagerState>
        ) : null}

        {loading ? <AdminManagerState tone="loading">Loading categories…</AdminManagerState> : null}

        {!loading && error ? (
          <AdminManagerState
            tone="error"
            actions={
              <button
                type="button"
                onClick={() => void loadCategories(scope)}
                className={secondaryActionClass}
              >
                Retry
              </button>
            }
          >
            {error}
          </AdminManagerState>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <AdminManagerState tone="empty" testId="admin-categories-empty-state">
            No categories created yet for this scope.
          </AdminManagerState>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.id} className={rowCardClass} data-testid="admin-category-item">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--fs-color-muted)]">
                      {item.slug} · order {item.sort_order}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleActive(item)}
                      disabled={Boolean(updatingId || deletingId)}
                      className={item.is_active ? deactivateActionClass : activateActionClass}
                    >
                      {updatingId === item.id
                        ? "Saving…"
                        : item.is_active
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(item)}
                      disabled={Boolean(updatingId || deletingId)}
                      className={destructiveActionClass}
                    >
                      {deletingId === item.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <section className={createPanelClass} data-testid="admin-categories-create-panel">
        <h2 className={headingClass}>Create category</h2>
        <p className={cx("mt-2", mutedTextClass)}>
          Add a reusable category for {scope === "notes" ? "admin notes" : "content records"}.
        </p>

        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>
          <label className={cx(labelClass, "sm:col-span-2")}>
            <span>Title</span>
            <input
              type="text"
              required
              value={formState.title}
              onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
              className={fieldClass}
              placeholder="Technique"
            />
          </label>

          <label className={labelClass}>
            <span>Slug (optional)</span>
            <input
              type="text"
              value={formState.slug}
              onChange={(e) => setFormState((prev) => ({ ...prev, slug: e.target.value }))}
              className={fieldClass}
              placeholder="technique"
            />
          </label>

          <label className={labelClass}>
            <span>Sort order</span>
            <input
              type="number"
              value={formState.sortOrder}
              onChange={(e) => setFormState((prev) => ({ ...prev, sortOrder: e.target.value }))}
              className={fieldClass}
            />
          </label>

          {actionError ? (
            <AdminManagerState
              tone="error"
              announcement="polite"
              density="compact"
              className="!mt-0 sm:col-span-2"
            >
              {actionError}
            </AdminManagerState>
          ) : null}

          <div className="sm:col-span-2">
            <button type="submit" disabled={submitting} className={primaryActionClass}>
              {submitting ? "Saving…" : "Save category"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
