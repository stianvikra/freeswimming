"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminContentItemRow } from "@/lib/admin/content";
import { parseAdminQrPrefillFromSearch } from "@/lib/qr-links/admin-prefill";
import { generateQrAssets } from "@/lib/qr-links/codegen";
import {
  QR_LINK_STATUS_VALUES,
  type QrLinkStatus,
  type QrRedirectLinkRow,
} from "@/lib/qr-links/admin";

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

type AdminContentResponse =
  | {
      ok: true;
      items: AdminContentItemRow[];
    }
  | {
      ok: false;
      error?: string;
    };

type LinkFormState = {
  slug: string;
  destinationUrl: string;
  status: QrLinkStatus;
  contentItemId: string;
  contentLabel: string;
  placementKey: string;
  ownerUserId: string;
};

type QrAssetState =
  | {
      status: "idle";
    }
  | {
      status: "loading";
    }
  | {
      status: "ready";
      svgDataUrl: string;
      pngDataUrl: string;
    }
  | {
      status: "error";
      message: string;
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

const STATUS_LABEL_BY_VALUE: Record<QrLinkStatus, string> = {
  draft: "Draft",
  active: "Active",
  disabled: "Disabled",
  archived: "Archived",
};

const INITIAL_FORM: LinkFormState = {
  slug: "",
  destinationUrl: "",
  status: "draft",
  contentItemId: "",
  contentLabel: "",
  placementKey: "",
  ownerUserId: "",
};

function normalizeTextInput(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function toEditState(item: QrRedirectLinkRow): LinkFormState {
  return {
    slug: item.slug,
    destinationUrl: item.destination_url,
    status: item.status,
    contentItemId: item.content_item_id ?? "",
    contentLabel: item.content_label,
    placementKey: item.placement_key,
    ownerUserId: item.owner_user_id ?? "",
  };
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

export default function AdminQrLinksManager() {
  const [items, setItems] = useState<QrRedirectLinkRow[]>([]);
  const [contentItems, setContentItems] = useState<AdminContentItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [schemaReady, setSchemaReady] = useState(true);
  const [formState, setFormState] = useState<LinkFormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<LinkFormState | null>(null);
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [isAdvancedCreateOpen, setIsAdvancedCreateOpen] = useState(false);
  const [openMoreActionsId, setOpenMoreActionsId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | QrLinkStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [openQrPreviewId, setOpenQrPreviewId] = useState<string | null>(null);
  const [qrAssetsById, setQrAssetsById] = useState<Record<string, QrAssetState>>({});
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [queryPrefill] = useState(() => {
    if (typeof window === "undefined") return null;
    return parseAdminQrPrefillFromSearch(window.location.search);
  });
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!queryPrefill || prefillApplied) return;
    if (queryPrefill.destinationPath && !origin) return;

    const prefillsDestination = queryPrefill.destinationPath
      ? `${origin}${queryPrefill.destinationPath}`
      : "";

    setFormState((prev) => ({
      ...prev,
      slug: queryPrefill.slug || prev.slug,
      destinationUrl: prefillsDestination || prev.destinationUrl,
      contentItemId: queryPrefill.contentItemId || prev.contentItemId,
      contentLabel: queryPrefill.contentLabel || prev.contentLabel,
      placementKey: queryPrefill.placementKey || prev.placementKey,
    }));
    setIsCreatePanelOpen(true);
    setIsAdvancedCreateOpen(true);
    setActionError(null);
    setActionNotice("Prefilled from lesson context. Review fields and create QR link.");
    setPrefillApplied(true);
  }, [origin, prefillApplied, queryPrefill]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWarning(null);
    setActionError(null);

    try {
      const [qrResponse, contentResponse] = await Promise.all([
        fetch("/api/admin/qr-links", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        }),
        fetch("/api/admin/content", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        }),
      ]);

      const qrPayload = (await qrResponse.json()) as AdminQrLinksResponse;
      const contentPayload = (await contentResponse.json()) as AdminContentResponse;

      if (!qrResponse.ok || !qrPayload.ok) {
        setError(
          qrPayload.ok
            ? "Could not load QR links."
            : (qrPayload.error ?? "Could not load QR links.")
        );
        setItems([]);
        setSchemaReady(true);
      } else {
        setItems(qrPayload.items);
        setSchemaReady(qrPayload.schemaReady !== false);
        setWarning(qrPayload.warning ?? null);
        if (!queryPrefill && qrPayload.items.length === 0) {
          setIsCreatePanelOpen(true);
        }
      }

      if (contentResponse.ok && contentPayload.ok) {
        setContentItems(contentPayload.items);
      } else {
        setContentItems([]);
      }
    } catch {
      setError("Could not load QR links.");
      setItems([]);
      setContentItems([]);
      setSchemaReady(true);
    } finally {
      setLoading(false);
    }
  }, [queryPrefill]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const contentItemById = useMemo(
    () =>
      Object.fromEntries(contentItems.map((item) => [item.id, item] as const)) as Record<
        string,
        AdminContentItemRow
      >,
    [contentItems]
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!query) return true;

      const attachment = item.content_item_id ? contentItemById[item.content_item_id] : null;
      const haystack = [
        item.slug,
        item.destination_url,
        item.content_label,
        item.placement_key,
        attachment?.title ?? "",
        attachment?.slug ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [contentItemById, items, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    const base = Object.fromEntries(
      QR_LINK_STATUS_VALUES.map((status) => [status, 0] as const)
    ) as Record<QrLinkStatus, number>;
    for (const item of items) {
      base[item.status] += 1;
    }
    return base;
  }, [items]);

  function stableLinkForSlug(slug: string): string {
    const resolvedOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "");
    return `${resolvedOrigin}/go/v/${slug}`;
  }

  function openCreatePanel() {
    setIsCreatePanelOpen(true);
  }

  function clearFilters() {
    setStatusFilter("all");
    setSearchQuery("");
  }

  function applyExampleDraft() {
    const fallbackOrigin =
      origin ||
      (typeof window !== "undefined" ? window.location.origin : "https://freeswimming.org");
    setFormState({
      slug: "intro-video",
      destinationUrl: `${fallbackOrigin}/course?lesson=mod1-l1`,
      status: "draft",
      contentItemId: "",
      contentLabel: "Module 1 intro",
      placementKey: "course.support-card",
      ownerUserId: "",
    });
    setIsCreatePanelOpen(true);
    setIsAdvancedCreateOpen(true);
    setActionError(null);
    setActionNotice("Example values loaded. Adjust fields and create your first QR link.");
  }

  async function copyStableLink(item: QrRedirectLinkRow) {
    setCopiedLinkId(null);
    const link = stableLinkForSlug(item.slug);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLinkId(item.id);
      setActionNotice("Stable link copied.");
    } catch {
      setActionError("Could not copy link automatically. Copy it manually from the card.");
    }
  }

  function downloadDataUrl(dataUrl: string, fileName: string) {
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = fileName;
    anchor.rel = "noopener";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  async function ensureQrAssets(item: QrRedirectLinkRow) {
    const currentState = qrAssetsById[item.id];
    if (currentState?.status === "loading" || currentState?.status === "ready") return;

    setQrAssetsById((prev) => ({
      ...prev,
      [item.id]: { status: "loading" },
    }));

    try {
      const assets = await generateQrAssets(stableLinkForSlug(item.slug));
      setQrAssetsById((prev) => ({
        ...prev,
        [item.id]: {
          status: "ready",
          svgDataUrl: assets.svgDataUrl,
          pngDataUrl: assets.pngDataUrl,
        },
      }));
    } catch {
      setQrAssetsById((prev) => ({
        ...prev,
        [item.id]: {
          status: "error",
          message: "Could not generate QR assets right now.",
        },
      }));
    }
  }

  function toggleQrPreview(item: QrRedirectLinkRow) {
    const shouldOpen = openQrPreviewId !== item.id;
    setOpenQrPreviewId(shouldOpen ? item.id : null);
    if (shouldOpen) {
      void ensureQrAssets(item);
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
          contentItemId: normalizeTextInput(formState.contentItemId) || null,
          contentLabel: normalizeTextInput(formState.contentLabel),
          placementKey: normalizeTextInput(formState.placementKey).toLowerCase(),
          ownerUserId: normalizeTextInput(formState.ownerUserId) || null,
        }),
      });

      const payload = (await response.json()) as AdminQrLinkCreateResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok ? "Could not create QR link." : (payload.error ?? "Could not create QR link.")
        );
        return;
      }

      setItems((prev) => [payload.item, ...prev]);
      setFormState(INITIAL_FORM);
      setIsCreatePanelOpen(false);
      setIsAdvancedCreateOpen(false);
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
    setOpenMoreActionsId(null);
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
          contentItemId: normalizeTextInput(editState.contentItemId) || null,
          contentLabel: normalizeTextInput(editState.contentLabel),
          placementKey: normalizeTextInput(editState.placementKey).toLowerCase(),
          ownerUserId: normalizeTextInput(editState.ownerUserId) || null,
        }),
      });

      const payload = (await response.json()) as AdminQrLinkUpdateResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok ? "Could not update QR link." : (payload.error ?? "Could not update QR link.")
        );
        return;
      }

      setItems((prev) => prev.map((item) => (item.id === payload.item.id ? payload.item : item)));
      setEditingId(null);
      setEditState(null);
      setActionNotice("QR link updated.");
    } catch {
      setActionError("Could not update QR link.");
    } finally {
      setSavingId(null);
    }
  }

  async function toggleActiveState(item: QrRedirectLinkRow) {
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

      setItems((prev) =>
        prev.map((entry) => (entry.id === payload.item.id ? payload.item : entry))
      );
      setOpenMoreActionsId(null);
      setActionNotice(nextStatus === "active" ? "QR link activated." : "QR link disabled.");
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
      setItems((prev) => prev.filter((entry) => entry.id !== payload.id));
      setOpenMoreActionsId(null);
      setActionNotice("QR link deleted.");
    } catch {
      setActionError("Could not delete QR link.");
    } finally {
      setDeletingId(null);
    }
  }

  const summaryLabel = `${items.length} total · ${statusCounts.active} active · ${statusCounts.draft} draft · ${statusCounts.disabled} disabled · ${statusCounts.archived} archived`;
  const hasItems = items.length > 0;
  const hasFilteredItems = filteredItems.length > 0;
  const showEmptyState = !loading && !error && !hasItems;
  const showNoMatches = !loading && !error && hasItems && !hasFilteredItems;
  const exampleStableLink = `${origin || "https://freeswimming.org"}/go/v/intro-video`;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">QR registry</h2>
          <p className="mt-2 text-sm text-slate-600">{summaryLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreatePanelOpen((prev) => !prev)}
            aria-expanded={isCreatePanelOpen}
            aria-controls="admin-qr-link-create-panel"
            data-testid="admin-qr-link-create-toggle"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
          >
            {isCreatePanelOpen ? "Hide new link" : "New link"}
          </button>
          <button
            type="button"
            onClick={() => void loadData()}
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

      {loading ? (
        <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Loading QR registry…
        </p>
      ) : null}

      {!loading && error ? (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm font-medium text-rose-700">{error}</p>
          <button
            type="button"
            onClick={() => void loadData()}
            className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
          >
            Retry
          </button>
        </div>
      ) : null}

      {actionError ? (
        <p className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {actionError}
        </p>
      ) : null}

      {actionNotice ? (
        <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {actionNotice}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span>Filter by status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | QrLinkStatus)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span>Search</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="slug, destination, placement, attachment…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
          />
        </label>
      </div>

      {showEmptyState ? (
        <div
          className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"
          data-testid="admin-qr-empty-state"
        >
          <p className="text-sm font-semibold text-slate-900">No QR links yet</p>
          <p className="mt-1 text-sm text-slate-600">
            Start with one stable slug. Example stable link:{" "}
            <span className="font-medium text-slate-800">{exampleStableLink}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openCreatePanel}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Create first QR link
            </button>
            <button
              type="button"
              onClick={applyExampleDraft}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Use example values
            </button>
          </div>
        </div>
      ) : null}

      {showNoMatches ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p>No QR links match current filters.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Clear filters
          </button>
        </div>
      ) : null}

      {hasFilteredItems ? (
        <ul className="mt-5 space-y-3" data-testid="admin-qr-link-list">
          {filteredItems.map((item) => {
            const attachment = item.content_item_id ? contentItemById[item.content_item_id] : null;
            const stableLink = stableLinkForSlug(item.slug);
            const isEditing = editingId === item.id && editState !== null;
            const isBusy = savingId === item.id || deletingId === item.id;
            const qrAssetState = qrAssetsById[item.id] ?? { status: "idle" };
            const isQrPreviewOpen = openQrPreviewId === item.id;
            const isMoreActionsOpen = openMoreActionsId === item.id;

            return (
              <li
                key={item.id}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                data-testid="admin-qr-link-item"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.slug}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Updated: {formatTimestamp(item.updated_at)}
                    </p>
                  </div>
                  <span
                    className={[
                      "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold",
                      STATUS_CHIP_CLASS_BY_VALUE[item.status],
                    ].join(" ")}
                  >
                    {STATUS_LABEL_BY_VALUE[item.status]}
                  </span>
                </div>

                {!isEditing ? (
                  <>
                    <div className="mt-3 space-y-1 text-sm">
                      <p>
                        <span className="font-medium text-slate-700">Stable link:</span>{" "}
                        <a
                          href={`/go/v/${item.slug}`}
                          className="text-blue-700 underline underline-offset-2"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {stableLink}
                        </a>
                      </p>
                      <p className="break-all">
                        <span className="font-medium text-slate-700">Destination:</span>{" "}
                        <a
                          href={item.destination_url}
                          className="text-blue-700 underline underline-offset-2"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item.destination_url}
                        </a>
                      </p>
                      <p className="text-slate-700">
                        <span className="font-medium">Attachment:</span>{" "}
                        {attachment
                          ? `${attachment.title} (${attachment.content_type})`
                          : "Not attached"}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-medium">Content label:</span>{" "}
                        {item.content_label || "Not set"}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-medium">Placement key:</span>{" "}
                        {item.placement_key || "Not set"}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void copyStableLink(item)}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                      >
                        {copiedLinkId === item.id ? "Copied" : "Copy link"}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleQrPreview(item)}
                        disabled={isBusy}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 px-3 text-sm font-medium text-teal-800 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isQrPreviewOpen ? "Hide QR" : "Show QR"}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        disabled={isBusy}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMoreActionsId((prev) => (prev === item.id ? null : item.id))
                        }
                        disabled={isBusy}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isMoreActionsOpen ? "Hide actions" : "More actions"}
                      </button>
                    </div>

                    {isMoreActionsOpen ? (
                      <div className="mt-2 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2">
                        <button
                          type="button"
                          onClick={() => void toggleActiveState(item)}
                          disabled={isBusy}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-3 text-sm font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {item.status === "active" ? "Disable" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteItem(item)}
                          disabled={isBusy}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {deletingId === item.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    ) : null}

                    {isQrPreviewOpen ? (
                      <div className="mt-3 rounded-lg border border-teal-200 bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
                          QR preview
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          Scan from desktop to continue on mobile. Stable link: {stableLink}
                        </p>

                        {qrAssetState.status === "loading" ? (
                          <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                            Generating QR assets…
                          </p>
                        ) : null}

                        {qrAssetState.status === "error" ? (
                          <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2">
                            <p className="text-sm text-rose-700">{qrAssetState.message}</p>
                            <button
                              type="button"
                              onClick={() => void ensureQrAssets(item)}
                              className="mt-2 inline-flex h-8 items-center justify-center rounded-md border border-rose-200 bg-white px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                            >
                              Retry
                            </button>
                          </div>
                        ) : null}

                        {qrAssetState.status === "ready" ? (
                          <div className="mt-3 flex flex-wrap items-start gap-3">
                            <Image
                              src={qrAssetState.svgDataUrl}
                              alt={`QR code for ${item.slug}`}
                              width={112}
                              height={112}
                              unoptimized
                              className="h-28 w-28 rounded-lg border border-slate-200 bg-white p-1"
                            />
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  downloadDataUrl(qrAssetState.svgDataUrl, `${item.slug}.svg`);
                                  setActionNotice("QR SVG downloaded.");
                                }}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                Download SVG
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  downloadDataUrl(qrAssetState.pngDataUrl, `${item.slug}.png`);
                                  setActionNotice("QR PNG downloaded.");
                                }}
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                Download PNG
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1 text-sm font-medium text-slate-700">
                      <span>Slug</span>
                      <input
                        type="text"
                        value={editState.slug}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, slug: event.target.value } : prev
                          )
                        }
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      />
                    </label>
                    <label className="space-y-1 text-sm font-medium text-slate-700">
                      <span>Status</span>
                      <select
                        value={editState.status}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, status: event.target.value as QrLinkStatus } : prev
                          )
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
                      <span>Destination URL (https)</span>
                      <input
                        type="url"
                        value={editState.destinationUrl}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, destinationUrl: event.target.value } : prev
                          )
                        }
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      />
                    </label>
                    <label className="space-y-1 text-sm font-medium text-slate-700">
                      <span>Attach to content item (optional)</span>
                      <select
                        value={editState.contentItemId}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, contentItemId: event.target.value } : prev
                          )
                        }
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      >
                        <option value="">Not attached</option>
                        {contentItems.map((entry) => (
                          <option key={entry.id} value={entry.id}>
                            {entry.title} ({entry.content_type})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm font-medium text-slate-700">
                      <span>Content label (optional)</span>
                      <input
                        type="text"
                        value={editState.contentLabel}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, contentLabel: event.target.value } : prev
                          )
                        }
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      />
                    </label>
                    <label className="space-y-1 text-sm font-medium text-slate-700">
                      <span>Placement key (optional)</span>
                      <input
                        type="text"
                        value={editState.placementKey}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, placementKey: event.target.value } : prev
                          )
                        }
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      />
                    </label>
                    <label className="space-y-1 text-sm font-medium text-slate-700">
                      <span>Owner user id (optional UUID)</span>
                      <input
                        type="text"
                        value={editState.ownerUserId}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, ownerUserId: event.target.value } : prev
                          )
                        }
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      />
                    </label>
                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={() => void saveEdit(item.id)}
                        disabled={savingId === item.id}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                      >
                        {savingId === item.id ? "Saving…" : "Save changes"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={savingId === item.id}
                        className="ml-2 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      <div
        id="admin-qr-link-create-panel"
        className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">New link</h3>
            <p className="mt-1 text-sm text-slate-600">
              Create links from stable slug to HTTPS destination. Required fields first.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreatePanelOpen((prev) => !prev)}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {isCreatePanelOpen ? "Hide form" : "Open form"}
          </button>
        </div>

        {isCreatePanelOpen ? (
          <form
            onSubmit={(event) => void handleCreate(event)}
            className="mt-4 space-y-3"
            data-testid="admin-qr-link-create-form"
          >
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-sm font-semibold text-slate-900">Required</p>
              <p className="mt-1 text-xs text-slate-600">
                Slug and HTTPS destination are mandatory. Status defaults to draft.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Slug</span>
                  <input
                    type="text"
                    value={formState.slug}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, slug: event.target.value }))
                    }
                    placeholder="intro-video"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Status</span>
                  <select
                    value={formState.status}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        status: event.target.value as QrLinkStatus,
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
                  <span>Destination URL (https)</span>
                  <input
                    type="url"
                    value={formState.destinationUrl}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, destinationUrl: event.target.value }))
                    }
                    placeholder="https://freeswimming.org/course?lesson=mod1-l1"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <button
                type="button"
                onClick={() => setIsAdvancedCreateOpen((prev) => !prev)}
                aria-expanded={isAdvancedCreateOpen}
                aria-controls="admin-qr-create-advanced"
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="text-sm font-semibold text-slate-900">Advanced (optional)</span>
                <span className="text-xs font-medium text-slate-600">
                  {isAdvancedCreateOpen ? "Hide" : "Show"}
                </span>
              </button>

              {isAdvancedCreateOpen ? (
                <div id="admin-qr-create-advanced" className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-medium text-slate-700">
                    <span>Attach to content item (optional)</span>
                    <select
                      value={formState.contentItemId}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, contentItemId: event.target.value }))
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                    >
                      <option value="">Not attached</option>
                      {contentItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title} ({item.content_type})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-sm font-medium text-slate-700">
                    <span>Content label (optional)</span>
                    <input
                      type="text"
                      value={formState.contentLabel}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, contentLabel: event.target.value }))
                      }
                      placeholder="Module 1 intro"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium text-slate-700">
                    <span>Placement key (optional)</span>
                    <input
                      type="text"
                      value={formState.placementKey}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, placementKey: event.target.value }))
                      }
                      placeholder="course.support-card"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium text-slate-700">
                    <span>Owner user id (optional UUID)</span>
                    <input
                      type="text"
                      value={formState.ownerUserId}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, ownerUserId: event.target.value }))
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                    />
                  </label>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-600">
                  Attach metadata when you need ownership and placement traceability.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {submitting ? "Creating…" : "Create QR link"}
              </button>
              <button
                type="button"
                onClick={applyExampleDraft}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Use example values
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormState(INITIAL_FORM);
                  setIsAdvancedCreateOpen(false);
                }}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Clear form
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Open form to create a new stable QR link.
          </p>
        )}
      </div>
    </section>
  );
}
