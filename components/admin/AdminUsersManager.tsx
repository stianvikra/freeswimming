"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import AdminManagerState from "@/components/admin/AdminManagerState";
import { cx } from "@/components/ui/cx";
import { ADMIN_ROLE_VALUES, type AdminRole } from "@/lib/admin/access";
import {
  ADMIN_USERS_DEFAULT_PAGE_SIZE,
  type AdminUserOverviewProfileStatus,
  type AdminUserOverviewRow,
  type AdminUserOverviewSupportCode,
  type AdminUsersOverviewApiResponse,
  type AdminUsersOverviewPayload,
  type AdminUserRoleMutationApiResponse,
  type AdminUserRoleMutationPayload,
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

type Props = {
  adminRole: AdminRole | null;
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

const ROLE_CHANGE_REASONS: Array<{
  value: AdminUserRoleMutationPayload["reason"];
  label: string;
}> = [
  { value: "owner_request", label: "Owner request" },
  { value: "support_access", label: "Support access" },
  { value: "operator_change", label: "Operator change" },
  { value: "repair", label: "Repair mismatch" },
];

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

async function updateUserRole(
  user: AdminUserOverviewRow,
  payload: AdminUserRoleMutationPayload
): Promise<AdminUserRoleMutationApiResponse> {
  const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}/role`, {
    method: "PATCH",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return (await response.json()) as AdminUserRoleMutationApiResponse;
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

function roleSourceLabel(source: AdminUserOverviewRow["roleSource"]): string {
  if (source === "profile") return "Profile";
  if (source === "auth_metadata") return "Auth metadata";
  if (source === "allowlist") return "Allowlist";
  return "No role source";
}

function profileStatusLabel(status: AdminUserOverviewProfileStatus): string {
  if (status === "complete") return "Profile linked";
  if (status === "missing_profile") return "Missing profile";
  if (status === "profile_email_mismatch") return "Email mismatch";
  return "Unknown role";
}

function supportCodeLabel(code: AdminUserOverviewSupportCode): string {
  if (code === "missing_profile") return "Missing profile";
  if (code === "profile_email_mismatch") return "Profile email mismatch";
  if (code === "unknown_role") return "Unknown role";
  if (code === "allowlist_override") return "Allowlist admin";
  if (code === "email_unconfirmed") return "Email unconfirmed";
  if (code === "no_entitlement") return "No entitlement";
  if (code === "last_activity_unknown") return "No product activity yet";
  return "Partial summary";
}

function supportCodeTone(code: AdminUserOverviewSupportCode): "neutral" | "warning" {
  if (
    code === "missing_profile" ||
    code === "profile_email_mismatch" ||
    code === "unknown_role" ||
    code === "allowlist_override" ||
    code === "email_unconfirmed" ||
    code === "summary_partial"
  ) {
    return "warning";
  }
  return "neutral";
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
  const hasProfileWarning = user.profileStatus !== "complete" || user.role === "unknown";

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
          {user.displayName ? (
            <p className="mt-1 text-xs font-medium text-[color:var(--fs-color-ink)]">
              {user.displayName}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-[color:var(--fs-color-muted)]">
            Last sign-in: {formatDateTime(user.lastSignInAt)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <StatusChip tone={user.role === "unknown" ? "warning" : "neutral"}>
            {roleLabel(user.role)}
          </StatusChip>
          <StatusChip tone={hasProfileWarning ? "warning" : "success"}>
            {profileStatusLabel(user.profileStatus)}
          </StatusChip>
          <StatusChip tone={user.accessStatus === "active" ? "success" : "neutral"}>
            {user.accessStatus === "active" ? "Access" : "No access"}
          </StatusChip>
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-[color:var(--fs-color-muted)]">
        Auth ID {user.id.slice(0, 8)} · {user.entitlementCount} entitlement
        {user.entitlementCount === 1 ? "" : "s"} ·{" "}
        {user.products.length > 0
          ? user.products.map((product) => product.title).join(", ")
          : "No products"}
      </p>
    </button>
  );
}

function DetailField({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div>
      <dt className={metadataLabelClass}>{label}</dt>
      <dd className="mt-1 text-sm break-words text-[color:var(--fs-color-ink)]">{value}</dd>
      {detail ? <p className="mt-1 text-xs text-[color:var(--fs-color-muted)]">{detail}</p> : null}
    </div>
  );
}

function RoleChangePanel({
  adminRole,
  onChanged,
  user,
}: {
  adminRole: AdminRole | null;
  onChanged: () => Promise<void>;
  user: AdminUserOverviewRow;
}) {
  const [role, setRole] = useState<AdminRole>(user.role === "unknown" ? "viewer" : user.role);
  const [reason, setReason] = useState<AdminUserRoleMutationPayload["reason"]>("owner_request");
  const [confirmation, setConfirmation] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const canMutate = adminRole === "admin";
  const changed = user.role !== role;

  async function submitRoleChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canMutate || !changed || !confirmation) return;

    setState("saving");
    setMessage(null);
    const result = await updateUserRole(user, {
      role,
      expectedRole: user.role,
      reason,
    });

    if (!result.ok) {
      setState("error");
      setMessage(result.error);
      return;
    }

    setState("saved");
    setMessage("Role updated and audit logged.");
    await onChanged();
  }

  return (
    <form
      onSubmit={submitRoleChange}
      className="mt-4 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/80 p-3"
      data-testid="admin-users-role-panel"
    >
      <div className="flex items-start gap-2">
        <UserCog
          aria-hidden="true"
          className="mt-0.5 h-4 w-4 text-[color:var(--fs-color-brand-700)]"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
            Role management
          </p>
          <p className="mt-1 text-xs leading-5 text-[color:var(--fs-color-muted)]">
            Role changes are admin-only, conflict-checked, and written through an audited server
            transaction.
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label>
          <span className={metadataLabelClass}>New role</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as AdminRole)}
            className={cx("mt-1", fieldClass)}
            disabled={!canMutate || state === "saving"}
          >
            {ADMIN_ROLE_VALUES.map((value) => (
              <option key={value} value={value}>
                {roleLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={metadataLabelClass}>Reason</span>
          <select
            value={reason}
            onChange={(event) =>
              setReason(event.target.value as AdminUserRoleMutationPayload["reason"])
            }
            className={cx("mt-1", fieldClass)}
            disabled={!canMutate || state === "saving"}
          >
            {ROLE_CHANGE_REASONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-3 flex items-start gap-2 text-sm text-[color:var(--fs-color-ink)]">
        <input
          type="checkbox"
          className="mt-1"
          checked={confirmation}
          onChange={(event) => setConfirmation(event.target.checked)}
          disabled={!canMutate || state === "saving"}
        />
        <span>Confirm this role change for {user.email}. Last-admin protection still applies.</span>
      </label>

      {!canMutate ? (
        <p className="mt-3 text-xs leading-5 text-[color:var(--fs-color-muted)]">
          Current admin role can inspect users, but only Admin can change roles.
        </p>
      ) : null}

      {message ? (
        <p
          className={cx(
            "mt-3 text-sm font-semibold",
            state === "error" ? "text-amber-800" : "text-emerald-700"
          )}
          role={state === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="submit"
          className={primaryActionClass}
          disabled={!canMutate || !changed || !confirmation || state === "saving"}
        >
          {state === "saving" ? "Saving..." : "Change role"}
        </button>
      </div>
    </form>
  );
}

function UserDetailPanel({
  adminRole,
  onRoleChanged,
  user,
}: {
  adminRole: AdminRole | null;
  onRoleChanged: () => Promise<void>;
  user: AdminUserOverviewRow | null;
}) {
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
          <p className={metadataLabelClass}>Auth user summary</p>
          <h3 className="mt-1 text-base font-semibold break-all text-[color:var(--fs-color-ink-strong)]">
            {user.email}
          </h3>
          {user.displayName ? (
            <p className="mt-1 text-sm text-[color:var(--fs-color-ink)]">
              {user.displayName} · {user.displayNameSource.replace("_", " ")}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <StatusChip tone={user.authStatus === "confirmed" ? "success" : "warning"}>
            {user.authStatus === "confirmed" ? "Confirmed" : "Unconfirmed"}
          </StatusChip>
          <StatusChip tone={user.profileStatus === "complete" ? "success" : "warning"}>
            {profileStatusLabel(user.profileStatus)}
          </StatusChip>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <DetailField label="Auth ID" value={user.id} />
        <DetailField
          label="Role"
          value={roleLabel(user.role)}
          detail={`Source: ${roleSourceLabel(user.roleSource)}`}
        />
        <DetailField label="Created" value={formatDateTime(user.createdAt)} />
        <DetailField label="Auth updated" value={formatDateTime(user.updatedAt)} />
        <DetailField label="Email confirmed" value={formatDateTime(user.emailConfirmedAt)} />
        <DetailField label="Last sign-in" value={formatDateTime(user.lastSignInAt)} />
        <DetailField
          label="Profile updated"
          value={formatDateTime(user.profileUpdatedAt)}
          detail={profileStatusLabel(user.profileStatus)}
        />
        <DetailField label="Tester status" value="Not configured" />
      </dl>

      <RoleChangePanel
        key={`${user.id}:${user.role}:${user.roleSource}`}
        adminRole={adminRole}
        user={user}
        onChanged={onRoleChanged}
      />

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
              <StatusChip key={code} tone={supportCodeTone(code)}>
                {supportCodeLabel(code)}
              </StatusChip>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default function AdminUsersManager({ adminRole }: Props) {
  const [query, setQuery] = useState<QueryState>(DEFAULT_QUERY);
  const [searchDraft, setSearchDraft] = useState(DEFAULT_QUERY.search);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

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
    setActionNotice(null);
    setQuery((current) => ({ ...current, search: searchDraft.trim(), page: 1 }));
  }

  async function handleRoleChanged() {
    setActionNotice("Role updated and audit logged.");
    await loadUsers(query);
  }

  return (
    <section className="space-y-4" data-testid="admin-users-manager">
      <div className={managerHeaderClass} data-testid="admin-users-manager-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className={eyebrowClass}>Users</p>
            <h2 className={cx("mt-1 flex items-center gap-2", headingClass)}>
              <Users aria-hidden="true" className="h-5 w-5" />
              Auth user directory
            </h2>
            <p className={cx("mt-2 max-w-3xl", mutedTextClass)}>
              Canonical Supabase Auth users with purpose-bound profile, role, access, tester, and
              support signals. Private training, habit notes, raw analytics payloads, provider IDs,
              and finance records stay out of this view.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActionNotice(null);
              void loadUsers(query);
            }}
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
            <span className={metadataLabelClass}>Search</span>
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              className={cx("mt-1", fieldClass)}
              placeholder="Email, display name, or auth id"
              maxLength={80}
            />
          </label>
          <label>
            <span className={metadataLabelClass}>Role</span>
            <select
              value={query.role}
              onChange={(event) => {
                setActionNotice(null);
                setQuery((current) => ({
                  ...current,
                  role: event.target.value as AdminUsersRoleFilter,
                  page: 1,
                }));
              }}
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
              onChange={(event) => {
                setActionNotice(null);
                setQuery((current) => ({
                  ...current,
                  sort: event.target.value as AdminUsersSort,
                  page: 1,
                }));
              }}
              className={cx("mt-1", fieldClass)}
            >
              <option value="updated_desc">Recently updated</option>
              <option value="created_desc">Newest auth users</option>
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
        <AdminManagerState tone="loading">Loading auth users...</AdminManagerState>
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

          {actionNotice ? (
            <AdminManagerState tone="success" density="compact" testId="admin-users-action-notice">
              {actionNotice}
            </AdminManagerState>
          ) : null}

          <section className={panelClass} data-testid="admin-users-summary">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className={metadataLabelClass}>Overview</p>
                <h3 className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                  {payload.summary.totalUsers} auth user
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
                detail={`Page ${payload.pageInfo.page} of matching auth users.`}
              />
              <SummaryCard
                label="Missing profiles"
                value={payload.summary.missingProfileUsers}
                detail={`${payload.summary.unconfirmedUsers} visible unconfirmed auth users.`}
              />
              <SummaryCard
                label="Access"
                value={payload.summary.usersWithAccess}
                detail={`${payload.summary.usersWithoutAccess} visible without linked entitlement.`}
              />
              <SummaryCard
                label="Review"
                value={payload.summary.unknownRoleUsers}
                detail={
                  payload.summary.partialSummary
                    ? "Partial data needs review."
                    : "Role/profile status is complete."
                }
              />
            </div>
          </section>

          {payload.items.length === 0 ? (
            <AdminManagerState tone="empty" title="No users found">
              Adjust search or role filters, then retry.
            </AdminManagerState>
          ) : (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,27rem)]">
              <section className={panelClass} data-testid="admin-users-list">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className={metadataLabelClass}>Users</p>
                    <h3 className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                      Matching auth accounts
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActionNotice(null);
                        setQuery((current) => ({
                          ...current,
                          page: Math.max(1, current.page - 1),
                        }));
                      }}
                      className={compactActionClass}
                      disabled={!payload.pageInfo.hasPreviousPage}
                    >
                      <ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionNotice(null);
                        setQuery((current) => ({ ...current, page: current.page + 1 }));
                      }}
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

              <UserDetailPanel
                adminRole={adminRole}
                user={selectedUser}
                onRoleChanged={handleRoleChanged}
              />
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
                  Purpose-bound privacy boundary
                </p>
                <p className={cx("mt-1", mutedTextClass)}>
                  Email and display names are shown only for account/support identification. This
                  panel does not expose private training content, habit names, notes, raw analytics
                  payloads, IP addresses, User-Agent strings, payment provider IDs, invoices,
                  refunds, payouts, or anonymous public analytics joined to profiles.
                </p>
              </div>
            </div>
          </section>

          {adminRole !== "admin" ? (
            <section className={mutedPanelClass} data-testid="admin-users-role-boundary">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
                />
                <p className={mutedTextClass}>
                  You can inspect the user directory with your current role, but role changes
                  require Admin access.
                </p>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
