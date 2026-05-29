"use client";

import { useEffect, useMemo, useState } from "react";
import AdminManagerState from "@/components/admin/AdminManagerState";
import { cx } from "@/components/ui/cx";
import type { Database } from "@/types/database";

type AdminProductRow = Database["public"]["Tables"]["products"]["Row"];

type AdminProductsResponse =
  | {
      ok: true;
      items: AdminProductRow[];
      schemaReady?: boolean;
      warning?: string | null;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminProductUpdateResponse =
  | {
      ok: true;
      item: AdminProductRow;
    }
  | {
      ok: false;
      error?: string;
    };

type ProductDraft = {
  title: string;
  active: boolean;
};

const managerHeaderClass = "fs-library-card fs-library-card-accent p-4 sm:p-5";
const rowCardClass = "fs-library-card p-4 sm:p-5";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";
const eyebrowClass = "text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]";
const headingClass = "text-lg font-semibold text-[color:var(--fs-color-ink-strong)]";
const secondaryActionClass =
  "fs-cta-secondary inline-flex min-h-10 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const primaryActionClass =
  "fs-cta-primary inline-flex min-h-10 items-center justify-center px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const fieldClass =
  "h-10 w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 text-sm text-[color:var(--fs-color-ink-strong)] transition-colors focus:border-[color:var(--fs-border-brand)] focus:outline-none";
const metadataLabelClass =
  "text-xs font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase";

export default function AdminCommerceManager() {
  const [items, setItems] = useState<AdminProductRow[]>([]);
  const [draftById, setDraftById] = useState<Record<string, ProductDraft>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [schemaReady, setSchemaReady] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    setWarning(null);
    try {
      const response = await fetch("/api/admin/products", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as AdminProductsResponse;
      if (!response.ok || !payload.ok) {
        setError(
          payload.ok ? "Could not load products." : (payload.error ?? "Could not load products.")
        );
        setItems([]);
        setDraftById({});
        setSchemaReady(true);
        return;
      }
      setItems(payload.items);
      setSchemaReady(payload.schemaReady !== false);
      setWarning(payload.warning ?? null);
      setDraftById(
        Object.fromEntries(
          payload.items.map((item) => [
            item.id,
            {
              title: item.title,
              active: item.active,
            },
          ])
        )
      );
    } catch {
      setError("Could not load products.");
      setItems([]);
      setDraftById({});
      setSchemaReady(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const productCountLabel = useMemo(() => {
    if (items.length === 0) return "No products found.";
    return `${items.length} product${items.length === 1 ? "" : "s"} in catalog.`;
  }, [items]);

  function updateDraft(productId: string, patch: Partial<ProductDraft>) {
    setDraftById((prev) => ({
      ...prev,
      [productId]: {
        title: prev[productId]?.title ?? "",
        active: prev[productId]?.active ?? false,
        ...patch,
      },
    }));
    setSavedId((current) => (current === productId ? null : current));
  }

  function isDirty(item: AdminProductRow) {
    const draft = draftById[item.id];
    if (!draft) return false;
    return draft.title !== item.title || draft.active !== item.active;
  }

  async function saveProduct(item: AdminProductRow) {
    if (savingId) return;
    const draft = draftById[item.id];
    if (!draft) return;
    if (!isDirty(item)) return;

    setSavingId(item.id);
    setActionError(null);
    setSavedId(null);

    try {
      const response = await fetch(`/api/admin/products/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          title: draft.title,
          active: draft.active,
        }),
      });
      const payload = (await response.json()) as AdminProductUpdateResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok ? "Could not update product." : (payload.error ?? "Could not update product.")
        );
        return;
      }

      setItems((prev) =>
        prev.map((entry) => (entry.id === payload.item.id ? payload.item : entry))
      );
      setDraftById((prev) => ({
        ...prev,
        [payload.item.id]: {
          title: payload.item.title,
          active: payload.item.active,
        },
      }));
      setSavedId(payload.item.id);
    } catch {
      setActionError("Could not update product.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="space-y-4" data-testid="admin-commerce-manager">
      <div className={managerHeaderClass} data-testid="admin-commerce-manager-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={eyebrowClass}>Commerce</p>
            <h2 className={cx("mt-1", headingClass)}>Product catalog</h2>
            <p className={cx("mt-2", mutedTextClass)}>{productCountLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadProducts()}
            className={secondaryActionClass}
          >
            Refresh
          </button>
        </div>
      </div>

      <div>
        {loading ? (
          <AdminManagerState tone="loading">Loading product catalog…</AdminManagerState>
        ) : null}

        {!loading && error ? (
          <AdminManagerState
            tone="error"
            actions={
              <button
                type="button"
                onClick={() => void loadProducts()}
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

        {!loading && !error && items.length === 0 ? (
          <AdminManagerState tone="empty">
            Product catalog is empty. Checkout flows depend on seeded products.
          </AdminManagerState>
        ) : null}

        {actionError ? (
          <AdminManagerState tone="error" announcement="polite" density="compact">
            {actionError}
          </AdminManagerState>
        ) : null}
      </div>

      {!loading && !error && items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item) => {
            const draft = draftById[item.id] ?? {
              title: item.title,
              active: item.active,
            };
            const dirty = isDirty(item);

            return (
              <li key={item.id} className={rowCardClass} data-testid="admin-commerce-product-row">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <p className={metadataLabelClass}>Product id</p>
                    <p className="mt-1 text-sm font-semibold break-all text-[color:var(--fs-color-ink-strong)]">
                      {item.id}
                    </p>
                  </div>
                  <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)] sm:col-span-2">
                    <span>Title</span>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(event) =>
                        updateDraft(item.id, {
                          title: event.target.value,
                        })
                      }
                      className={fieldClass}
                    />
                  </label>

                  <div>
                    <p className={metadataLabelClass}>Slug</p>
                    <p className="mt-1 text-sm text-[color:var(--fs-color-ink)]">/{item.slug}</p>
                  </div>

                  <div>
                    <p className={metadataLabelClass}>Kind</p>
                    <p className="mt-1 text-sm text-[color:var(--fs-color-ink)]">{item.kind}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className={metadataLabelClass}>Stripe price id</p>
                    <p className="mt-1 text-sm break-all text-[color:var(--fs-color-ink)]">
                      {item.stripe_price_id}
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--fs-color-ink)] sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={draft.active}
                      onChange={(event) =>
                        updateDraft(item.id, {
                          active: event.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[color:var(--fs-color-brand-600)]"
                    />
                    <span>
                      {draft.active ? "Active in plans/library" : "Hidden from new sales"}
                    </span>
                  </label>

                  <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                    <button
                      type="button"
                      onClick={() => void saveProduct(item)}
                      disabled={Boolean(savingId) || !dirty}
                      className={primaryActionClass}
                    >
                      {savingId === item.id ? "Saving…" : "Save product"}
                    </button>
                    {savedId === item.id ? (
                      <p className="text-xs font-semibold text-emerald-700">Saved.</p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
