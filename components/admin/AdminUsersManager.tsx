"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Search, ShieldCheck, Users } from "lucide-react";
import AdminManagerState from "@/components/admin/AdminManagerState";
import { cx } from "@/components/ui/cx";
import {
  ADMIN_USERS_DEFAULT_PAGE_SIZE,
  type AdminUserOverviewRow,
  type AdminUserOverviewSupportCode,
  type AdminUsersOverviewApiResponse,
  type AdminUsersOverviewPayload,
  type AdminUsersRoleFilter,
  type AdminUsersSort,
} from "@/lib/admin/users";

type LoadState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "loaded"; payload: AdminUsersOverviewPayload };

type QueryState = {
  search: string;
  role: AdminUsersRoleFilter;
  sort: AdminUsersSort;
  page: number;
  pageSize: number;
};

const DEFAULT_QUERY: QueryState = {
  search: "",
  role: "all",
  sort: "updated_desc",
  page: 1,
  pageSize: ADMIN_USERS_DEFAULT_PAGE_SIZE,
};

const managerHeaderClass = "fs-library-card fs-library-card-accent p-4 sm:p-5";
const panelClass = "fs-library-card p-4 sm:p-5";
const mutedPanelClass = "fs-library-card fs-library-card-muted p-4 sm:p-5";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";
const eyebrowClass = "text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]";
const headingClass = "text-lg font-semibold text-[color:var(--fs-color-ink-strong)]";
const metadataLabelClass =
  "text-xs font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase";
const secondaryActionClass =
  "fs-cta-secondary inline-flex min-h-10 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const compactActionClass =
  "fs-cta-secondary inline-flex min-h-9 items-center justify-center gap-1.5 px-3 text-xs font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const primaryActionClass =
  "fs-cta-primary inline-flex min-h-10 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const fieldClass =
  "ui-field min-h-10 w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 text-sm text-[color:var(--fs-color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700";

function isLoadedPayload(
  payload: AdminUsersOverviewApiResponse
): payload is AdminUsersOverviewPayload {
  return payload.ok === true;
}

function buildUsersOverviewUrl(query: QueryState): string {
  const params = new URLSearchParams();
  if (query.search.trim()) params.set("q", query.search.trim());
  if (query.role !== "all") params.set("role", query.role);
  if (query.sort !== "updated_desc") params.set("sort", query.sort);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return `/api/admin/users/overview?${params.toString()}`;
}

async function fetchUsersOverview(
  query: QueryState
): Promise<Extract<LoadState, { status: "error" | "loaded" }>> {
  try {
    const response = await fetch(buildUsersOverviewUrl(query), {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
    const payload = (await response.json()) as AdminUsersOverviewApiResponse;
    if (!response.ok || !isLoadedPayload(payload)) {
      return {
        status: "error",
        error: isLoadedPayload(payload)
          ? "Could not load user overview."
          : (payload.error ?? "Could not load user overview."),
      };
    }

    return { status: "loaded", payload };
  } catch {
    return { status: "error", error: "Could not load user overview." };
  }
}

function formatDateTime(value: string | null): string {
  if (!value) return "n/a";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "n/a";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function roleLabel(role: AdminUserOverviewRow["role"]): string {
  if (role === "admin") return "Admin";
  if (role === "editor") return "Editor";
  if (role === "viewer") return "Viewer";
  return "Needs review";
}

function supportCodeLabel(code: AdminUserOverviewSupportCode): string {
  if (code === "unknown_role") return "Unknown role";
  if (code === "no_entitlement") return "No entitlement";
  if (code === "last_activity_unknown") return "No product activity yet";
  return "Partial summary";
}

function supportCodeTone(code: AdminUserOverviewSupportCode): string {
  if (code === "unknown_role" || code === "summary_partial") {
    return "bg-amber-50 text-amber-800 ring-amber-200";
  }
  return "bg-white text-[color:var(--fs-color-muted)] ring-[color:var(--fs-border-soft)]";
}

function StatusChip({
  children,
  tone = "neutral",
}: {
  children: string;
  tone?: "neutral" | "success" | "warning";
}) {
  return (
    <span
      className={cx(
        "inline-flex min-h-7 items-center rounded-[var(--fs-radius-control)] px-2.5 text-xs font-semibold ring-1",
        tone === "success"
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : tone === "warning"
            ? "bg-amber-50 text-amber-800 ring-amber-200"
            : "bg-white text-[color:var(--fs-color-muted)] ring-[color:var(--fs-border-soft)]"
      )}
    >
      {children}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="min-w-0 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/80 p-3">
      <p className={metadataLabelClass}>{label}</p>
      <p className="mt-1 text-xl font-semibold text-[color:var(--fs-color-ink-strong)] tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-[color:var(--fs-color-muted)]">{detail}</p>
    </div>
  );
}

function UserRowButton({
  isSelected,
  onSelect,
  user,
}: {
  isSelected: boolean;
  onSelect: () => void;
  user: AdminUserOverviewRow;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        "w-full rounded-[var(--fs-radius-control)] border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2",
        isSelected
          ? "border-[color:var(--fs-border-brand)] bg-blue-50/50"
          : "border-[color:var(--fs-border-soft)] bg-white/80 hover:border-[color:var(--fs-border-brand)]"
      )}
      aria-pressed={isSelected}
      data-testid={`admin-users-row-${user.id}`}
    >
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold break-all text-[color:var(--fs-color-ink-strong)]">
            {user.email}
          </p>
          <p className="mt-1 text-xs text-[color:var(--fs-color-muted)]">
            Last seen: {formatDateTime(user.lastActivityAt)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <StatusChip tone={user.role === "unknown" ? "warning" : "neutral"}>
            {roleLabel(user.role)}
          </StatusChip>
          <StatusChip tone={user.accessStatus === "active" ? "success" : "neutral"}>
            {user.accessStatus === "active" ? "Access" : "No access"}
          </StatusChip>
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-[color:var(--fs-color-muted)]">
        {user.entitlementCount} entitlement{user.entitlementCount === 1 ? "" : "s"} ·{" "}
        {user.products.length > 0
          ? user.products.map((product) => product.title).join(", ")
          : "No products"}
      </p>
    </button>
  );
}

function UserDetailPanel({ user }: { user: AdminUserOverviewRow | null }) {
  if (!user) {
    return (
      <section className={mutedPanelClass} data-testid="admin-users-detail-empty">
        <p className={metadataLabelClass}>User summary</p>
        <p className={cx("mt-2", mutedTextClass)}>Select a user to inspect the safe summary.</p>
      </section>
    );
  }

  return (
    <section className={mutedPanelClass} data-testid="admin-users-detail-panel">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={metadataLabelClass}>User summary</p>
          <h3 className="mt-1 text-base font-semibold break-all text-[color:var(--fs-color-ink-strong)]">
            {user.email}
          </h3>
        </div>
        <StatusChip tone={user.accessStatus === "active" ? "success" : "neutral"}>
          {user.accessStatus === "active" ? "Has access" : "No entitlement"}
        </StatusChip>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className={metadataLabelClass}>Role</dt>
          <dd className="mt-1 text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
            {roleLabel(user.role)}
          </dd>
        </div>
        <div>
          <dt className={metadataLabelClass}>Created</dt>
          <dd className="mt-1 text-sm text-[color:var(--fs-color-ink)]">
            {formatDateTime(user.createdAt)}
          </dd>
        </div>
        <div>
          <dt className={metadataLabelClass}>Last activity</dt>
          <dd className="mt-1 text-sm text-[color:var(--fs-color-ink)]">
            {formatDateTime(user.lastActivityAt)}
          </dd>
          <p className="mt-1 text-xs text-[color:var(--fs-color-muted)]">
            {user.lastActivitySource === "product_activity"
              ? "Minimized product activity timestamp"
              : "Profile update fallback"}
          </p>
        </div>
        <div>
          <dt className={metadataLabelClass}>Latest grant</dt>
          <dd className="mt-1 text-sm text-[color:var(--fs-color-ink)]">
            {formatDateTime(user.latestGrantedAt)}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <p className={metadataLabelClass}>Products</p>
        {user.products.length === 0 ? (
          <p className={cx("mt-2", mutedTextClass)}>No product access is linked to this account.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {user.products.map((product) => (
              <li
                key={product.id}
                className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/75 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold break-words text-[color:var(--fs-color-ink-strong)]">
                    {product.title}
                  </p>
                  <p className="mt-0.5 text-xs break-all text-[color:var(--fs-color-muted)]">
                    {product.id} · {product.kind}
                  </p>
                </div>
                <StatusChip tone={product.active === false ? "warning" : "neutral"}>
                  {product.known ? (product.active === false ? "Inactive" : "Known") : "Unknown"}
                </StatusChip>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <p className={metadataLabelClass}>Support signals</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {user.supportCodes.length === 0 ? (
            <span className="text-sm text-[color:var(--fs-color-muted)]">No support signals.</span>
          ) : (
            user.supportCodes.map((code) => (
              <span
                key={code}
                className={cx(
                  "inline-flex min-h-7 items-center rounded-[var(--fs-radius-control)] px-2.5 text-xs font-semibold ring-1",
                  supportCodeTone(code)
                )}
              >
                {supportCodeLabel(code)}
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default function AdminUsersManager() {
  const [query, setQuery] = useState<QueryState>(DEFAULT_QUERY);
  const [searchDraft, setSearchDraft] = useState(DEFAULT_QUERY.search);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  async function loadUsers(nextQuery: QueryState = query) {
    setState({ status: "loading" });
    const nextState = await fetchUsersOverview(nextQuery);
    setState(nextState);
    if (nextState.status === "loaded") {
      setSelectedUserId((current) => {
        if (current && nextState.payload.items.some((item) => item.id === current)) return current;
        return nextState.payload.items[0]?.id ?? null;
      });
    }
  }

  useEffect(() => {
    void loadUsers(query);
    // loadUsers closes over state setters only; query changes should trigger one refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const payload = state.status === "loaded" ? state.payload : null;
  const selectedUser = useMemo(() => {
    if (!payload) return null;
    return payload.items.find((item) => item.id === selectedUserId) ?? payload.items[0] ?? null;
  }, [payload, selectedUserId]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery((current) => ({ ...current, search: searchDraft.trim(), page: 1 }));
  }

  return (
    <section className="space-y-4" data-testid="admin-users-manager">
      <div className={managerHeaderClass} data-testid="admin-users-manager-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className={eyebrowClass}>Users</p>
            <h2 className={cx("mt-1 flex items-center gap-2", headingClass)}>
              <Users aria-hidden="true" className="h-5 w-5" />
              Platform user overview
            </h2>
            <p className={cx("mt-2 max-w-3xl", mutedTextClass)}>
              Read-only account and access summary. Private training, habit notes, raw analytics
              payloads, payment provider IDs, and public anonymous traffic stay out of this view.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadUsers(query)}
            className={secondaryActionClass}
            disabled={state.status === "loading"}
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <form onSubmit={submitSearch} className={panelClass} data-testid="admin-users-controls">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_11rem_12rem_auto]">
          <label className="min-w-0">
            <span className={metadataLabelClass}>Search email</span>
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              className={cx("mt-1", fieldClass)}
              placeholder="user@example.com"
              maxLength={80}
            />
          </label>
          <label>
            <span className={metadataLabelClass}>Role</span>
            <select
              value={query.role}
              onChange={(event) =>
                setQuery((current) => ({
                  ...current,
                  role: event.target.value as AdminUsersRoleFilter,
                  page: 1,
                }))
              }
              className={cx("mt-1", fieldClass)}
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>
          <label>
            <span className={metadataLabelClass}>Sort</span>
            <select
              value={query.sort}
              onChange={(event) =>
                setQuery((current) => ({
                  ...current,
                  sort: event.target.value as AdminUsersSort,
                  page: 1,
                }))
              }
              className={cx("mt-1", fieldClass)}
            >
              <option value="updated_desc">Recently updated</option>
              <option value="created_desc">Newest accounts</option>
              <option value="email_asc">Email A-Z</option>
            </select>
          </label>
          <div className="flex items-end">
            <button type="submit" className={primaryActionClass}>
              <Search aria-hidden="true" className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>
      </form>

      {state.status === "loading" ? (
        <AdminManagerState tone="loading">Loading user overview...</AdminManagerState>
      ) : null}

      {state.status === "error" ? (
        <AdminManagerState
          tone="error"
          actions={
            <button
              type="button"
              onClick={() => void loadUsers(query)}
              className={secondaryActionClass}
            >
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Retry
            </button>
          }
        >
          {state.error}
        </AdminManagerState>
      ) : null}

      {payload ? (
        <>
          {payload.warnings.length > 0 ? (
            <AdminManagerState tone="warning" title="Partial user summary">
              {payload.warnings.join(" ")}
            </AdminManagerState>
          ) : null}

          <section className={panelClass} data-testid="admin-users-summary">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className={metadataLabelClass}>Overview</p>
                <h3 className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                  {payload.summary.totalUsers} known user
                  {payload.summary.totalUsers === 1 ? "" : "s"}
                </h3>
              </div>
              <p className="text-xs font-semibold text-[color:var(--fs-color-muted)]">
                Generated {formatDateTime(payload.generatedAt)}
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Visible"
                value={payload.summary.visibleUsers}
                detail={`Page ${payload.pageInfo.page} of matching users.`}
              />
              <SummaryCard
                label="Access"
                value={payload.summary.usersWithAccess}
                detail={`${payload.summary.usersWithoutAccess} visible without linked entitlement.`}
              />
              <SummaryCard
                label="Admin roles"
                value={payload.summary.adminUsers + payload.summary.editorUsers}
                detail={`${payload.summary.viewerUsers} visible viewers.`}
              />
              <SummaryCard
                label="Review"
                value={payload.summary.unknownRoleUsers}
                detail={
                  payload.summary.partialSummary
                    ? "Partial data needs review."
                    : "No partial summary."
                }
              />
            </div>
          </section>

          {payload.items.length === 0 ? (
            <AdminManagerState tone="empty" title="No users found">
              Adjust search or role filters, then retry.
            </AdminManagerState>
          ) : (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
              <section className={panelClass} data-testid="admin-users-list">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className={metadataLabelClass}>Users</p>
                    <h3 className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                      Matching accounts
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setQuery((current) => ({ ...current, page: Math.max(1, current.page - 1) }))
                      }
                      className={compactActionClass}
                      disabled={!payload.pageInfo.hasPreviousPage}
                    >
                      <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setQuery((current) => ({ ...current, page: current.page + 1 }))
                      }
                      className={compactActionClass}
                      disabled={!payload.pageInfo.hasNextPage}
                    >
                      Next
                      <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {payload.items.map((user) => (
                    <UserRowButton
                      key={user.id}
                      user={user}
                      isSelected={selectedUser?.id === user.id}
                      onSelect={() => setSelectedUserId(user.id)}
                    />
                  ))}
                </div>
              </section>

              <UserDetailPanel user={selectedUser} />
            </div>
          )}

          <section className={mutedPanelClass} data-testid="admin-users-privacy-boundary">
            <div className="flex items-start gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--fs-color-brand-700)]"
              />
              <div>
                <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                  Privacy boundary
                </p>
                <p className={cx("mt-1", mutedTextClass)}>
                  This view is read-only and minimized. It does not expose private training content,
                  habit names, notes, raw analytics payloads, IP addresses, User-Agent strings,
                  payment provider IDs, invoices, refunds, payouts, or anonymous public analytics
                  joined to profiles.
                </p>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}
