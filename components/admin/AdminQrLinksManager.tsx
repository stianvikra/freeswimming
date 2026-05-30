"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminManagerState from "@/components/admin/AdminManagerState";
import { cx } from "@/components/ui/cx";
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
  draft: "border-[color:var(--fs-border-soft)] bg-white/75 text-[color:var(--fs-color-muted)]",
  active:
    "border-emerald-300 bg-[color:var(--fs-color-emerald-100)] text-[color:var(--fs-color-emerald-700)]",
  disabled: "border-amber-300 bg-amber-100 text-amber-800",
  archived:
    "border-[color:var(--fs-border-soft)] bg-[rgba(226,232,240,0.55)] text-[color:var(--fs-color-muted)]",
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

const managerHeaderClass = "fs-library-card fs-library-card-accent p-4 sm:p-5";
const mutedPanelClass = "fs-library-card fs-library-card-muted p-4 sm:p-5";
const rowCardClass = "fs-library-card p-4 sm:p-5";
const nestedPanelClass =
  "rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/86 p-3";
const qrPreviewPanelClass =
  "rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-brand)] bg-[color:var(--fs-color-brand-50)] p-3";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";
const eyebrowClass = "text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]";
const headingClass = "text-lg font-semibold text-[color:var(--fs-color-ink-strong)]";
const metadataLabelClass =
  "text-xs font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase";
const fieldClass =
  "h-10 w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 text-sm text-[color:var(--fs-color-ink-strong)] transition-colors focus:border-[color:var(--fs-border-brand)] focus:outline-none";
const primaryActionClass =
  "fs-cta-primary inline-flex min-h-10 items-center justify-center px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const secondaryActionClass =
  "fs-cta-secondary inline-flex min-h-10 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
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
    <section className="space-y-4" data-testid="admin-qr-links-manager">
      <div className={managerHeaderClass} data-testid="admin-qr-links-manager-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={eyebrowClass}>QR workflow</p>
            <h2 className={cx("mt-1", headingClass)}>QR registry</h2>
            <p className={cx("mt-2", mutedTextClass)}>{summaryLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreatePanelOpen((prev) => !prev)}
              aria-expanded={isCreatePanelOpen}
              aria-controls="admin-qr-link-create-panel"
              data-testid="admin-qr-link-create-toggle"
              className={primaryActionClass}
            >
              {isCreatePanelOpen ? "Hide new link" : "New link"}
            </button>
            <button type="button" onClick={() => void loadData()} className={secondaryActionClass}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div>
        {!schemaReady && warning ? (
          <AdminManagerState tone="warning">{warning}</AdminManagerState>
        ) : null}

        {loading ? (
          <AdminManagerState tone="loading">Loading QR registry…</AdminManagerState>
        ) : null}

        {!loading && error ? (
          <AdminManagerState
            tone="error"
            actions={
              <button
                type="button"
                onClick={() => void loadData()}
                className={compactSecondaryActionClass}
              >
                Retry
              </button>
            }
          >
            {error}
          </AdminManagerState>
        ) : null}

        {actionError ? (
          <AdminManagerState tone="error" announcement="polite" density="compact">
            {actionError}
          </AdminManagerState>
        ) : null}

        {actionNotice ? (
          <AdminManagerState tone="success" density="compact">
            {actionNotice}
          </AdminManagerState>
        ) : null}
      </div>

      <div className={mutedPanelClass} data-testid="admin-qr-links-filter-panel">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]">
            <span>Filter by status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | QrLinkStatus)}
              className={fieldClass}
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]">
            <span>Search</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="slug, destination, placement, attachment…"
              className={fieldClass}
            />
          </label>
        </div>
      </div>

      {showEmptyState ? (
        <AdminManagerState
          tone="empty"
          title="No QR links yet"
          density="spacious"
          testId="admin-qr-empty-state"
          actions={
            <>
              <button type="button" onClick={openCreatePanel} className={compactPrimaryActionClass}>
                Create first QR link
              </button>
              <button
                type="button"
                onClick={applyExampleDraft}
                className={compactSecondaryActionClass}
              >
                Use example values
              </button>
            </>
          }
        >
          Start with one stable slug. Example stable link:{" "}
          <span className="font-medium text-[color:var(--fs-color-ink-strong)]">
            {exampleStableLink}
          </span>
        </AdminManagerState>
      ) : null}

      {showNoMatches ? (
        <AdminManagerState
          tone="no-results"
          actionsClassName="mt-2"
          actions={
            <button type="button" onClick={clearFilters} className={compactSecondaryActionClass}>
              Clear filters
            </button>
          }
        >
          No QR links match current filters.
        </AdminManagerState>
      ) : null}

      {hasFilteredItems ? (
        <ul className="space-y-3" data-testid="admin-qr-link-list">
          {filteredItems.map((item) => {
            const attachment = item.content_item_id ? contentItemById[item.content_item_id] : null;
            const stableLink = stableLinkForSlug(item.slug);
            const isEditing = editingId === item.id && editState !== null;
            const isBusy = savingId === item.id || deletingId === item.id;
            const qrAssetState = qrAssetsById[item.id] ?? { status: "idle" };
            const isQrPreviewOpen = openQrPreviewId === item.id;
            const isMoreActionsOpen = openMoreActionsId === item.id;

            return (
              <li key={item.id} className={rowCardClass} data-testid="admin-qr-link-item">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                      {item.slug}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--fs-color-muted)]">
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
                    <div className="mt-3 space-y-1 text-sm text-[color:var(--fs-color-ink)]">
                      <p>
                        <span className="font-semibold text-[color:var(--fs-color-ink)]">
                          Stable link:
                        </span>{" "}
                        <a
                          href={`/go/v/${item.slug}`}
                          className="text-[color:var(--fs-color-brand-700)] underline underline-offset-2"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {stableLink}
                        </a>
                      </p>
                      <p className="break-all">
                        <span className="font-semibold text-[color:var(--fs-color-ink)]">
                          Destination:
                        </span>{" "}
                        <a
                          href={item.destination_url}
                          className="text-[color:var(--fs-color-brand-700)] underline underline-offset-2"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item.destination_url}
                        </a>
                      </p>
                      <p>
                        <span className="font-semibold">Attachment:</span>{" "}
                        {attachment
                          ? `${attachment.title} (${attachment.content_type})`
                          : "Not attached"}
                      </p>
                      <p>
                        <span className="font-semibold">Content label:</span>{" "}
                        {item.content_label || "Not set"}
                      </p>
                      <p>
                        <span className="font-semibold">Placement key:</span>{" "}
                        {item.placement_key || "Not set"}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void copyStableLink(item)}
                        className={compactPrimaryActionClass}
                      >
                        {copiedLinkId === item.id ? "Copied" : "Copy link"}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleQrPreview(item)}
                        disabled={isBusy}
                        className={compactSecondaryActionClass}
                      >
                        {isQrPreviewOpen ? "Hide QR" : "Show QR"}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        disabled={isBusy}
                        className={compactSecondaryActionClass}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMoreActionsId((prev) => (prev === item.id ? null : item.id))
                        }
                        disabled={isBusy}
                        className={compactQuietActionClass}
                      >
                        {isMoreActionsOpen ? "Hide actions" : "More actions"}
                      </button>
                    </div>

                    {isMoreActionsOpen ? (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-[color:var(--fs-border-soft)] pt-3">
                        <button
                          type="button"
                          onClick={() => void toggleActiveState(item)}
                          disabled={isBusy}
                          className={compactSecondaryActionClass}
                        >
                          {item.status === "active" ? "Disable" : "Activate"}
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
                    ) : null}

                    {isQrPreviewOpen ? (
                      <div className={cx("mt-3", qrPreviewPanelClass)}>
                        <p className={metadataLabelClass}>QR preview</p>
                        <p className="mt-1 text-xs text-[color:var(--fs-color-muted)]">
                          Scan from desktop to continue on mobile. Stable link: {stableLink}
                        </p>

                        {qrAssetState.status === "loading" ? (
                          <AdminManagerState tone="loading" density="compact" className="mt-3">
                            Generating QR assets…
                          </AdminManagerState>
                        ) : null}

                        {qrAssetState.status === "error" ? (
                          <AdminManagerState
                            tone="error"
                            density="compact"
                            className="mt-3"
                            actionsClassName="mt-2 flex flex-wrap gap-2"
                            actions={
                              <button
                                type="button"
                                onClick={() => void ensureQrAssets(item)}
                                className={dangerActionClass}
                              >
                                Retry
                              </button>
                            }
                          >
                            {qrAssetState.message}
                          </AdminManagerState>
                        ) : null}

                        {qrAssetState.status === "ready" ? (
                          <div className="mt-3 flex flex-wrap items-start gap-3">
                            <Image
                              src={qrAssetState.svgDataUrl}
                              alt={`QR code for ${item.slug}`}
                              width={112}
                              height={112}
                              unoptimized
                              className="h-28 w-28 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white p-1"
                            />
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  downloadDataUrl(qrAssetState.svgDataUrl, `${item.slug}.svg`);
                                  setActionNotice("QR SVG downloaded.");
                                }}
                                className={compactSecondaryActionClass}
                              >
                                Download SVG
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  downloadDataUrl(qrAssetState.pngDataUrl, `${item.slug}.png`);
                                  setActionNotice("QR PNG downloaded.");
                                }}
                                className={compactSecondaryActionClass}
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
                    <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]">
                      <span>Slug</span>
                      <input
                        type="text"
                        value={editState.slug}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, slug: event.target.value } : prev
                          )
                        }
                        className={fieldClass}
                      />
                    </label>
                    <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]">
                      <span>Status</span>
                      <select
                        value={editState.status}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, status: event.target.value as QrLinkStatus } : prev
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
                    <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)] sm:col-span-2">
                      <span>Destination URL (https)</span>
                      <input
                        type="url"
                        value={editState.destinationUrl}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, destinationUrl: event.target.value } : prev
                          )
                        }
                        className={fieldClass}
                      />
                    </label>
                    <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]">
                      <span>Attach to content item (optional)</span>
                      <select
                        value={editState.contentItemId}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, contentItemId: event.target.value } : prev
                          )
                        }
                        className={fieldClass}
                      >
                        <option value="">Not attached</option>
                        {contentItems.map((entry) => (
                          <option key={entry.id} value={entry.id}>
                            {entry.title} ({entry.content_type})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]">
                      <span>Content label (optional)</span>
                      <input
                        type="text"
                        value={editState.contentLabel}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, contentLabel: event.target.value } : prev
                          )
                        }
                        className={fieldClass}
                      />
                    </label>
                    <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]">
                      <span>Placement key (optional)</span>
                      <input
                        type="text"
                        value={editState.placementKey}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, placementKey: event.target.value } : prev
                          )
                        }
                        className={fieldClass}
                      />
                    </label>
                    <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]">
                      <span>Owner user id (optional UUID)</span>
                      <input
                        type="text"
                        value={editState.ownerUserId}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, ownerUserId: event.target.value } : prev
                          )
                        }
                        className={fieldClass}
                      />
                    </label>
                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={() => void saveEdit(item.id)}
                        disabled={savingId === item.id}
                        className={primaryActionClass}
                      >
                        {savingId === item.id ? "Saving…" : "Save changes"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={savingId === item.id}
                        className={cx("ml-2", secondaryActionClass)}
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

      <div id="admin-qr-link-create-panel" className={mutedPanelClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
              New link
            </h3>
            <p className={cx("mt-1", mutedTextClass)}>
              Create links from stable slug to HTTPS destination. Required fields first.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreatePanelOpen((prev) => !prev)}
            className={compactSecondaryActionClass}
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
            <div className={nestedPanelClass}>
              <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                Required
              </p>
              <p className="mt-1 text-xs text-[color:var(--fs-color-muted)]">
                Slug and HTTPS destination are mandatory. Status defaults to draft.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]">
                  <span>Slug</span>
                  <input
                    type="text"
                    value={formState.slug}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, slug: event.target.value }))
                    }
                    placeholder="intro-video"
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]">
                  <span>Status</span>
                  <select
                    value={formState.status}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
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
                <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)] sm:col-span-2">
                  <span>Destination URL (https)</span>
                  <input
                    type="url"
                    value={formState.destinationUrl}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, destinationUrl: event.target.value }))
                    }
                    placeholder="https://freeswimming.org/course?lesson=mod1-l1"
                    className={fieldClass}
                  />
                </label>
              </div>
            </div>

            <div className={nestedPanelClass}>
              <button
                type="button"
                onClick={() => setIsAdvancedCreateOpen((prev) => !prev)}
                aria-expanded={isAdvancedCreateOpen}
                aria-controls="admin-qr-create-advanced"
                className="flex w-full items-center justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
              >
                <span className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                  Advanced (optional)
                </span>
                <span className="text-xs font-semibold text-[color:var(--fs-color-muted)]">
                  {isAdvancedCreateOpen ? "Hide" : "Show"}
                </span>
              </button>

              {isAdvancedCreateOpen ? (
                <div id="admin-qr-create-advanced" className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]">
                    <span>Attach to content item (optional)</span>
                    <select
                      value={formState.contentItemId}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, contentItemId: event.target.value }))
                      }
                      className={fieldClass}
                    >
                      <option value="">Not attached</option>
                      {contentItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title} ({item.content_type})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]">
                    <span>Content label (optional)</span>
                    <input
                      type="text"
                      value={formState.contentLabel}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, contentLabel: event.target.value }))
                      }
                      placeholder="Module 1 intro"
                      className={fieldClass}
                    />
                  </label>
                  <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]">
                    <span>Placement key (optional)</span>
                    <input
                      type="text"
                      value={formState.placementKey}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, placementKey: event.target.value }))
                      }
                      placeholder="course.support-card"
                      className={fieldClass}
                    />
                  </label>
                  <label className="space-y-1 text-sm font-semibold text-[color:var(--fs-color-ink)]">
                    <span>Owner user id (optional UUID)</span>
                    <input
                      type="text"
                      value={formState.ownerUserId}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, ownerUserId: event.target.value }))
                      }
                      className={fieldClass}
                    />
                  </label>
                </div>
              ) : (
                <p className="mt-2 text-xs text-[color:var(--fs-color-muted)]">
                  Attach metadata when you need ownership and placement traceability.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={submitting} className={primaryActionClass}>
                {submitting ? "Creating…" : "Create QR link"}
              </button>
              <button type="button" onClick={applyExampleDraft} className={secondaryActionClass}>
                Use example values
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormState(INITIAL_FORM);
                  setIsAdvancedCreateOpen(false);
                }}
                className={secondaryActionClass}
              >
                Clear form
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-3 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/86 px-3 py-2 text-sm text-[color:var(--fs-color-muted)]">
            Open form to create a new stable QR link.
          </p>
        )}
      </div>
    </section>
  );
}
