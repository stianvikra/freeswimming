"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  Eye,
  EyeOff,
  Inbox,
  Mail,
  RefreshCcw,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import type { AdminRole } from "@/lib/admin/access";
import {
  ADMIN_MESSAGE_SOURCE_FILTER_VALUES,
  ADMIN_MESSAGE_STATUS_FILTER_VALUES,
  canMutateAdminMessages,
  getAdminMessageDeliveryStatusLabel,
  getAdminMessageSourceLabel,
  getAdminMessageStatusLabel,
  type AdminMessageItem,
  type AdminMessageResponse,
  type AdminMessageSourceFilter,
  type AdminMessageStatusAction,
  type AdminMessageStatusFilter,
  type AdminMessagesResponse,
} from "@/lib/admin/messages";

type Props = {
  adminRole: AdminRole | null;
};

type PendingConfirmation = {
  id: string;
  action: Extract<AdminMessageStatusAction, "delete">;
};

const PAGE_SIZE = 25;

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusBadgeClasses(status: AdminMessageItem["statusBucket"]): string {
  switch (status) {
    case "new":
      return "border-blue-200 bg-blue-50 text-blue-800";
    case "read":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "needs_reply":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "replied":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "archived":
      return "border-slate-200 bg-white text-slate-600";
    case "deleted":
      return "border-rose-200 bg-rose-50 text-rose-800";
  }
}

function getDeliveryBadgeClasses(status: AdminMessageItem["notificationStatus"]): string {
  switch (status) {
    case "accepted_by_provider":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "failed_retryable":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "failed_final":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "disabled":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "queued":
    default:
      return "border-blue-200 bg-blue-50 text-blue-800";
  }
}

function actionLabel(action: AdminMessageStatusAction): string {
  switch (action) {
    case "mark_read":
      return "Mark read";
    case "mark_unread":
      return "Mark unread";
    case "needs_reply":
      return "Needs reply";
    case "mark_replied":
      return "Mark replied";
    case "archive":
      return "Archive";
    case "delete":
      return "Move to deleted";
    case "restore":
      return "Restore";
  }
}

function messageMatchesFilters(params: {
  item: AdminMessageItem;
  statusFilter: AdminMessageStatusFilter;
  sourceFilter: AdminMessageSourceFilter;
  query: string;
}): boolean {
  if (params.statusFilter !== "all" && params.item.statusBucket !== params.statusFilter) {
    return false;
  }

  if (params.sourceFilter !== "all" && params.item.sourceVariant !== params.sourceFilter) {
    return false;
  }

  const query = params.query.trim().toLowerCase();
  if (!query) return true;

  return [
    params.item.submitterName,
    params.item.submitterEmail,
    params.item.sourceLabel,
    params.item.messageBody,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function mergeItems(current: AdminMessageItem[], next: AdminMessageItem[]): AdminMessageItem[] {
  const map = new Map<string, AdminMessageItem>();
  for (const item of current) map.set(item.id, item);
  for (const item of next) map.set(item.id, item);
  return Array.from(map.values()).sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt)
  );
}

export default function AdminMessagesManager({ adminRole }: Props) {
  const [items, setItems] = useState<AdminMessageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AdminMessageStatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<AdminMessageSourceFilter>("all");
  const [searchDraft, setSearchDraft] = useState("");
  const deferredSearchDraft = useDeferredValue(searchDraft);
  const [role, setRole] = useState<AdminRole | null>(adminRole);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [schemaReady, setSchemaReady] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const canMutate = canMutateAdminMessages(role ?? adminRole);
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  );

  const filteredSummary = useMemo(() => {
    if (items.length === 0) return "No stored messages in this view.";
    return `${items.length} message${items.length === 1 ? "" : "s"} shown`;
  }, [items.length]);

  const loadMessages = useCallback(
    async (options?: { before?: string | null; append?: boolean }) => {
      const append = options?.append === true;
      if (append) {
        setLoadingOlder(true);
      } else {
        setLoading(true);
      }
      setError(null);
      setWarning(null);

      const params = new URLSearchParams();
      params.set("pageSize", String(PAGE_SIZE));
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (sourceFilter !== "all") params.set("source", sourceFilter);
      if (deferredSearchDraft.trim()) params.set("q", deferredSearchDraft.trim());
      if (options?.before) params.set("before", options.before);

      try {
        const response = await fetch(`/api/admin/messages?${params.toString()}`, {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        const payload = (await response.json()) as AdminMessagesResponse;
        if (!response.ok || !payload.ok) {
          setError(
            payload.ok ? "Could not load messages." : (payload.error ?? "Could not load messages.")
          );
          if (!append) setItems([]);
          return;
        }

        setRole(payload.role);
        setSchemaReady(payload.schemaReady);
        setWarning(payload.warning);
        setItems((current) => (append ? mergeItems(current, payload.items) : payload.items));
        setNextCursor(payload.nextCursor);
      } catch {
        setError("Could not load messages.");
        if (!append) setItems([]);
      } finally {
        setLoading(false);
        setLoadingOlder(false);
      }
    },
    [deferredSearchDraft, sourceFilter, statusFilter]
  );

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (loading) return;
    if (items.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !items.some((item) => item.id === selectedId)) {
      setSelectedId(items[0].id);
    }
  }, [items, loading, selectedId]);

  async function runAction(item: AdminMessageItem, action: AdminMessageStatusAction) {
    if (!canMutate) return;

    if (action === "delete" && pendingConfirmation?.id !== item.id) {
      setPendingConfirmation({ id: item.id, action });
      setActionError(null);
      setNotice(null);
      return;
    }

    setUpdatingId(item.id);
    setActionError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/messages/${item.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      const payload = (await response.json()) as AdminMessageResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok ? "Could not update message." : (payload.error ?? "Could not update message.")
        );
        return;
      }

      const shouldKeepItem = messageMatchesFilters({
        item: payload.item,
        statusFilter,
        sourceFilter,
        query: deferredSearchDraft,
      });
      setItems((current) =>
        shouldKeepItem
          ? current.map((currentItem) =>
              currentItem.id === payload.item.id ? payload.item : currentItem
            )
          : current.filter((currentItem) => currentItem.id !== payload.item.id)
      );
      setSelectedId(shouldKeepItem ? payload.item.id : null);
      setPendingConfirmation(null);
      setNotice(`${actionLabel(action)} completed.`);
    } catch {
      setActionError("Could not update message.");
    } finally {
      setUpdatingId(null);
    }
  }

  const showRestoreOnly =
    selectedItem?.statusBucket === "archived" || selectedItem?.statusBucket === "deleted";

  return (
    <section className="space-y-4" data-testid="admin-messages-manager">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-blue-700" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-slate-900">Messages</h2>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Stored contact and intake requests with delivery diagnostics. Reply from the normal
              email inbox in v1.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadMessages()}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="relative block">
            <span className="sr-only">Search messages</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search name, email, or message"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="flex min-w-52 items-center gap-2 text-sm font-medium text-slate-700">
            Source
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value as AdminMessageSourceFilter)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            >
              {ADMIN_MESSAGE_SOURCE_FILTER_VALUES.map((source) => (
                <option key={source} value={source}>
                  {source === "all" ? "All sources" : getAdminMessageSourceLabel(source)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="Message status filters">
          {ADMIN_MESSAGE_STATUS_FILTER_VALUES.map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={[
                  "inline-flex h-9 items-center rounded-lg border px-3 text-sm font-semibold transition",
                  isActive
                    ? "border-blue-300 bg-blue-50 text-blue-800"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
                aria-pressed={isActive}
              >
                {status === "all" ? "All" : getAdminMessageStatusLabel(status)}
              </button>
            );
          })}
        </div>
      </div>

      <div aria-live="polite" className="sr-only">
        {notice ?? actionError ?? error ?? warning ?? ""}
      </div>

      {warning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {warning}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          {notice}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {actionError}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Stored requests</p>
            <p className="text-xs text-slate-500">{filteredSummary}</p>
          </div>

          {loading ? (
            <div className="px-4 py-8 text-sm text-slate-600">Loading messages...</div>
          ) : !schemaReady ? (
            <div className="px-4 py-8 text-sm text-slate-600">Message storage is not ready.</div>
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-sm text-slate-600">
              No messages match the current filters.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={[
                      "block w-full px-4 py-3 text-left transition",
                      isSelected ? "bg-blue-50/70" : "bg-white hover:bg-slate-50",
                    ].join(" ")}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {item.submitterName}
                        </p>
                        <p className="truncate text-xs text-slate-600">{item.submitterEmail}</p>
                      </div>
                      <span
                        className={[
                          "shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold",
                          getStatusBadgeClasses(item.statusBucket),
                        ].join(" ")}
                      >
                        {item.statusLabel}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-700">
                      {item.messageExcerpt}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{item.sourceLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDateTime(item.createdAt)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {nextCursor && !loading ? (
            <div className="border-t border-slate-200 p-3">
              <button
                type="button"
                onClick={() => void loadMessages({ before: nextCursor, append: true })}
                disabled={loadingOlder}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                {loadingOlder ? "Loading..." : "Load older"}
              </button>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white">
          {!selectedItem ? (
            <div className="px-5 py-10 text-sm text-slate-600">
              Select a message to inspect details and diagnostics.
            </div>
          ) : (
            <div className="space-y-5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        "rounded-full border px-2 py-0.5 text-xs font-semibold",
                        getStatusBadgeClasses(selectedItem.statusBucket),
                      ].join(" ")}
                    >
                      {selectedItem.statusLabel}
                    </span>
                    <span
                      className={[
                        "rounded-full border px-2 py-0.5 text-xs font-semibold",
                        getDeliveryBadgeClasses(selectedItem.notificationStatus),
                      ].join(" ")}
                    >
                      Notification: {selectedItem.notificationStatusLabel}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-slate-900">
                    {selectedItem.submitterName}
                  </h3>
                  <p className="mt-1 text-sm break-all text-slate-600">
                    {selectedItem.submitterEmail}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedItem.sourceLabel} · Received {formatDateTime(selectedItem.createdAt)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Message
                </p>
                <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-slate-800">
                  {selectedItem.messageBody || "No message body."}
                </p>
              </div>

              {selectedItem.structuredIntake.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-slate-900">Structured intake</p>
                  <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                    {selectedItem.structuredIntake.map((entry) => (
                      <div
                        key={entry.key}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        <dt className="text-xs font-semibold text-slate-500">{entry.label}</dt>
                        <dd className="mt-1 text-sm text-slate-800">{entry.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              <div>
                <p className="text-sm font-semibold text-slate-900">Actions</p>
                {!canMutate ? (
                  <p className="mt-2 text-sm text-slate-600">
                    Viewer access can inspect messages, but cannot change workflow status.
                  </p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {showRestoreOnly ? (
                      <button
                        type="button"
                        onClick={() => void runAction(selectedItem, "restore")}
                        disabled={updatingId === selectedItem.id}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Restore
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            void runAction(
                              selectedItem,
                              selectedItem.statusBucket === "new" ? "mark_read" : "mark_unread"
                            )
                          }
                          disabled={updatingId === selectedItem.id}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {selectedItem.statusBucket === "new" ? (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          )}
                          {selectedItem.statusBucket === "new" ? "Mark read" : "Mark unread"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void runAction(selectedItem, "needs_reply")}
                          disabled={updatingId === selectedItem.id}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Mail className="h-4 w-4" aria-hidden="true" />
                          Needs reply
                        </button>
                        <button
                          type="button"
                          onClick={() => void runAction(selectedItem, "mark_replied")}
                          disabled={updatingId === selectedItem.id}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          Mark replied
                        </button>
                        <button
                          type="button"
                          onClick={() => void runAction(selectedItem, "archive")}
                          disabled={updatingId === selectedItem.id}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Archive className="h-4 w-4" aria-hidden="true" />
                          Archive
                        </button>
                        <button
                          type="button"
                          onClick={() => void runAction(selectedItem, "delete")}
                          disabled={updatingId === selectedItem.id}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Move to deleted
                        </button>
                      </>
                    )}
                  </div>
                )}

                {pendingConfirmation?.id === selectedItem.id ? (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                    <p className="font-semibold">Confirm soft delete</p>
                    <p className="mt-1">
                      The message content stays stored and can be restored from the Deleted filter.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void runAction(selectedItem, "delete")}
                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-rose-700 px-3 text-sm font-semibold text-white transition hover:bg-rose-600"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Confirm delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingConfirmation(null)}
                        className="inline-flex h-9 items-center rounded-lg border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-800 transition hover:bg-rose-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Request diagnostics</p>
                  {selectedItem.requestDiagnostics.length > 0 ? (
                    <dl className="mt-2 space-y-2">
                      {selectedItem.requestDiagnostics.map((entry) => (
                        <div
                          key={entry.label}
                          className="rounded-xl border border-slate-200 px-3 py-2"
                        >
                          <dt className="text-xs font-semibold text-slate-500">{entry.label}</dt>
                          <dd className="mt-1 text-sm text-slate-800">{entry.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600">No request diagnostics recorded.</p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">Delivery attempts</p>
                  {selectedItem.deliveryAttempts.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {selectedItem.deliveryAttempts.map((attempt) => (
                        <article
                          key={attempt.id}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">
                              {attempt.targetLabel}
                            </p>
                            <span
                              className={[
                                "rounded-full border px-2 py-0.5 text-xs font-semibold",
                                getDeliveryBadgeClasses(attempt.status),
                              ].join(" ")}
                            >
                              {getAdminMessageDeliveryStatusLabel(attempt.status)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">
                            {attempt.providerLabel} · {formatDateTime(attempt.createdAt)}
                          </p>
                          {attempt.errorCode ? (
                            <p className="mt-1 text-xs text-rose-700">
                              {attempt.errorCode}
                              {attempt.redactedErrorMessage
                                ? `: ${attempt.redactedErrorMessage}`
                                : ""}
                            </p>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600">
                      No delivery attempts recorded yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
