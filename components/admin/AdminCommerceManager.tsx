"use client";

import { useEffect, useMemo, useState } from "react";
import AdminManagerState from "@/components/admin/AdminManagerState";
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
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Commerce</h2>
          <p className="mt-2 text-sm text-slate-600">{productCountLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => void loadProducts()}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

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
              className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
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

      {!loading && !error && items.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {items.map((item) => {
            const draft = draftById[item.id] ?? {
              title: item.title,
              active: item.active,
            };
            const dirty = isDirty(item);

            return (
              <li key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Product id: {item.id}
                    </p>
                  </div>
                  <label className="space-y-1 text-sm font-medium text-slate-700 sm:col-span-2">
                    <span>Title</span>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(event) =>
                        updateDraft(item.id, {
                          title: event.target.value,
                        })
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                    />
                  </label>

                  <div>
                    <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                      Slug
                    </p>
                    <p className="mt-1 text-sm text-slate-700">/{item.slug}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                      Kind
                    </p>
                    <p className="mt-1 text-sm text-slate-700">{item.kind}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                      Stripe price id
                    </p>
                    <p className="mt-1 text-sm break-all text-slate-700">{item.stripe_price_id}</p>
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={draft.active}
                      onChange={(event) =>
                        updateDraft(item.id, {
                          active: event.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span>
                      {draft.active ? "Active in plans/library" : "Hidden from new sales"}
                    </span>
                  </label>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={() => void saveProduct(item)}
                      disabled={Boolean(savingId) || !dirty}
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      {savingId === item.id ? "Saving…" : "Save product"}
                    </button>
                    {savedId === item.id ? (
                      <p className="mt-2 text-xs font-medium text-emerald-700">Saved.</p>
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
