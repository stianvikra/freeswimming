import type { User } from "@supabase/supabase-js";
import {
  ADMIN_ROLE_VALUES,
  isAdminEmailAllowlisted,
  resolveAdminRoleForUser,
  type AdminRole,
} from "@/lib/admin/access";
import type { Database } from "@/types/database";

export const ADMIN_USERS_DEFAULT_PAGE_SIZE = 25;
export const ADMIN_USERS_MAX_PAGE_SIZE = 50;
export const ADMIN_USERS_MAX_ACTIVITY_ROWS = 1000;
export const ADMIN_USERS_AUTH_PAGE_SIZE = 1000;
export const ADMIN_USERS_MAX_AUTH_ROWS = 5000;
export const ADMIN_USERS_QUERY_CHUNK_SIZE = 500;

export const ADMIN_USERS_SORT_VALUES = ["updated_desc", "created_desc", "email_asc"] as const;
export type AdminUsersSort = (typeof ADMIN_USERS_SORT_VALUES)[number];

export const ADMIN_USERS_ROLE_FILTER_VALUES = ["all", ...ADMIN_ROLE_VALUES] as const;
export type AdminUsersRoleFilter = (typeof ADMIN_USERS_ROLE_FILTER_VALUES)[number];

export type AdminUserOverviewSupportCode =
  | "missing_profile"
  | "profile_email_mismatch"
  | "unknown_role"
  | "allowlist_override"
  | "email_unconfirmed"
  | "no_entitlement"
  | "last_activity_unknown"
  | "summary_partial";

export type AdminUserOverviewAccessStatus = "active" | "none";
export type AdminUserOverviewActivitySource = "product_activity" | "auth_user";
export type AdminUserOverviewProfileStatus =
  | "complete"
  | "missing_profile"
  | "profile_email_mismatch"
  | "unknown_role";
export type AdminUserOverviewAuthStatus = "confirmed" | "unconfirmed" | "unknown";
export type AdminUserOverviewRoleSource = "profile" | "auth_metadata" | "allowlist" | "none";
export type AdminUserOverviewTesterStatus = "not_configured";

export type AdminUserOverviewProduct = {
  id: string;
  title: string;
  kind: string;
  active: boolean | null;
  known: boolean;
};

export type AdminUserOverviewRow = {
  id: string;
  email: string;
  displayName: string | null;
  displayNameSource: "athlete_profile" | "auth_metadata" | "none";
  role: AdminRole | "unknown";
  roleSource: AdminUserOverviewRoleSource;
  profileStatus: AdminUserOverviewProfileStatus;
  authStatus: AdminUserOverviewAuthStatus;
  testerStatus: AdminUserOverviewTesterStatus;
  createdAt: string;
  updatedAt: string;
  profileUpdatedAt: string | null;
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
  accessStatus: AdminUserOverviewAccessStatus;
  entitlementCount: number;
  products: AdminUserOverviewProduct[];
  latestGrantedAt: string | null;
  lastActivityAt: string;
  lastActivitySource: AdminUserOverviewActivitySource;
  supportCodes: AdminUserOverviewSupportCode[];
};

export type AdminUsersOverviewSummary = {
  totalUsers: number;
  visibleUsers: number;
  usersWithAccess: number;
  usersWithoutAccess: number;
  adminUsers: number;
  editorUsers: number;
  viewerUsers: number;
  unknownRoleUsers: number;
  missingProfileUsers: number;
  unconfirmedUsers: number;
  testerUsers: number;
  partialSummary: boolean;
};

export type AdminUsersOverviewPageInfo = {
  page: number;
  pageSize: number;
  totalCount: number | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type AdminUsersOverviewQuery = {
  search: string;
  role: AdminUsersRoleFilter;
  sort: AdminUsersSort;
  page: number;
  pageSize: number;
};

export type AdminUsersOverviewPayload = {
  ok: true;
  generatedAt: string;
  query: AdminUsersOverviewQuery;
  summary: AdminUsersOverviewSummary;
  pageInfo: AdminUsersOverviewPageInfo;
  items: AdminUserOverviewRow[];
  warnings: string[];
};

export type AdminUsersOverviewApiResponse =
  | AdminUsersOverviewPayload
  | {
      ok: false;
      error?: string;
    };

export type AdminUserAuthSourceRow = Pick<
  User,
  | "id"
  | "email"
  | "created_at"
  | "updated_at"
  | "last_sign_in_at"
  | "confirmed_at"
  | "email_confirmed_at"
  | "phone_confirmed_at"
  | "app_metadata"
  | "user_metadata"
>;

export type AdminUserProfileSourceRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "email" | "role" | "created_at" | "updated_at"
>;

export type AdminUserAthleteProfileSourceRow = Pick<
  Database["public"]["Tables"]["athlete_profiles"]["Row"],
  "user_id" | "display_name" | "first_name" | "last_name" | "updated_at"
>;

export type AdminUserEntitlementSourceRow = Pick<
  Database["public"]["Tables"]["entitlements"]["Row"],
  "id" | "user_id" | "product_id" | "source" | "granted_at" | "updated_at"
>;

export type AdminUserProductSourceRow = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "title" | "kind" | "active"
>;

export type AdminUserActivitySourceRow = Pick<
  Database["public"]["Tables"]["analytics_events"]["Row"],
  "user_id" | "occurred_at"
>;

type BuildAdminUsersOverviewInput = {
  authUsers: AdminUserAuthSourceRow[];
  profiles: AdminUserProfileSourceRow[];
  athleteProfiles?: AdminUserAthleteProfileSourceRow[];
  entitlements: AdminUserEntitlementSourceRow[];
  products: AdminUserProductSourceRow[];
  activityRows: AdminUserActivitySourceRow[];
  query: AdminUsersOverviewQuery;
  generatedAt?: Date;
  partialSummary?: boolean;
  warnings?: string[];
  allowlistedEmailsRaw?: string | undefined;
};

export type AdminUserRoleMutationPayload = {
  role: AdminRole;
  expectedRole: AdminRole | "unknown" | null;
  reason: "support_access" | "operator_change" | "owner_request" | "repair";
};

export type AdminUserRoleMutationApiResponse =
  | {
      ok: true;
      userId: string;
      role: AdminRole;
      auditLogged: true;
    }
  | {
      ok: false;
      error: string;
      code?:
        | "invalid_payload"
        | "unauthorized"
        | "forbidden"
        | "not_found"
        | "role_conflict"
        | "last_admin"
        | "email_required"
        | "audit_or_update_failed";
    };

function clampInteger(value: string | null, fallback: number, min: number, max: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function isAdminUsersSort(value: string | null): value is AdminUsersSort {
  return ADMIN_USERS_SORT_VALUES.includes(value as AdminUsersSort);
}

function isAdminUsersRoleFilter(value: string | null): value is AdminUsersRoleFilter {
  return ADMIN_USERS_ROLE_FILTER_VALUES.includes(value as AdminUsersRoleFilter);
}

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && ADMIN_ROLE_VALUES.includes(value as AdminRole);
}

function normalizeSearch(value: string | null): string {
  if (!value) return "";
  return value
    .trim()
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .slice(0, 80);
}

function normalizeDisplayText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/[\u0000-\u001f\u007f]/g, "");
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}

export function parseAdminUsersOverviewSearchParams(
  params: URLSearchParams
): AdminUsersOverviewQuery {
  const sortParam = params.get("sort");
  const roleParam = params.get("role");
  return {
    search: normalizeSearch(params.get("q")),
    role: isAdminUsersRoleFilter(roleParam) ? roleParam : "all",
    sort: isAdminUsersSort(sortParam) ? sortParam : "updated_desc",
    page: clampInteger(params.get("page"), 1, 1, 1000),
    pageSize: clampInteger(
      params.get("pageSize"),
      ADMIN_USERS_DEFAULT_PAGE_SIZE,
      1,
      ADMIN_USERS_MAX_PAGE_SIZE
    ),
  };
}

export function buildAdminUsersIlikePattern(search: string): string {
  const escaped = search.replace(/[\\%_]/g, (match) => `\\${match}`);
  return `%${escaped}%`;
}

function normalizeAdminRole(role: unknown): AdminRole | "unknown" {
  if (typeof role !== "string") return "unknown";
  const normalized = role.trim().toLowerCase();
  return ADMIN_ROLE_VALUES.includes(normalized as AdminRole)
    ? (normalized as AdminRole)
    : "unknown";
}

function compareIsoDate(a: string | null | undefined, b: string | null | undefined): string | null {
  if (!a) return b ?? null;
  if (!b) return a;
  return Date.parse(a) >= Date.parse(b) ? a : b;
}

function getLatestActivityByUser(rows: AdminUserActivitySourceRow[]): Map<string, string> {
  const latest = new Map<string, string>();
  for (const row of rows) {
    if (!row.user_id || !row.occurred_at) continue;
    latest.set(
      row.user_id,
      compareIsoDate(latest.get(row.user_id), row.occurred_at) ?? row.occurred_at
    );
  }
  return latest;
}

function groupEntitlementsByUser(
  rows: AdminUserEntitlementSourceRow[]
): Map<string, AdminUserEntitlementSourceRow[]> {
  const grouped = new Map<string, AdminUserEntitlementSourceRow[]>();
  for (const row of rows) {
    if (!row.user_id) continue;
    const current = grouped.get(row.user_id) ?? [];
    current.push(row);
    grouped.set(row.user_id, current);
  }
  return grouped;
}

function uniqueProductsForEntitlements(
  rows: AdminUserEntitlementSourceRow[],
  productById: Map<string, AdminUserProductSourceRow>
): AdminUserOverviewProduct[] {
  const seen = new Set<string>();
  const products: AdminUserOverviewProduct[] = [];

  for (const row of rows) {
    if (seen.has(row.product_id)) continue;
    seen.add(row.product_id);
    const product = productById.get(row.product_id);
    products.push({
      id: row.product_id,
      title: product?.title ?? row.product_id,
      kind: product?.kind ?? "unknown",
      active: product?.active ?? null,
      known: Boolean(product),
    });
  }

  return products.sort((a, b) => a.title.localeCompare(b.title));
}

function getAuthEmail(authUser: AdminUserAuthSourceRow): string {
  return normalizeDisplayText(authUser.email, 320)?.toLowerCase() ?? "No email on auth user";
}

function getAuthUpdatedAt(authUser: AdminUserAuthSourceRow): string {
  return authUser.updated_at ?? authUser.last_sign_in_at ?? authUser.created_at;
}

function getAuthStatus(authUser: AdminUserAuthSourceRow): AdminUserOverviewAuthStatus {
  if (authUser.email_confirmed_at || authUser.confirmed_at || authUser.phone_confirmed_at) {
    return "confirmed";
  }
  if (authUser.email || authUser.confirmed_at === null) return "unconfirmed";
  return "unknown";
}

function getAuthMetadataDisplayName(authUser: AdminUserAuthSourceRow): string | null {
  const metadata = authUser.user_metadata ?? {};
  return (
    normalizeDisplayText(metadata.display_name, 80) ??
    normalizeDisplayText(metadata.full_name, 80) ??
    normalizeDisplayText(metadata.name, 80) ??
    normalizeDisplayText(metadata.preferred_username, 80) ??
    normalizeDisplayText(metadata.user_name, 80) ??
    normalizeDisplayText(metadata.username, 80)
  );
}

function getAthleteDisplayName(
  athleteProfile: AdminUserAthleteProfileSourceRow | undefined
): string | null {
  if (!athleteProfile) return null;
  const explicit = normalizeDisplayText(athleteProfile.display_name, 80);
  if (explicit) return explicit;
  const first = normalizeDisplayText(athleteProfile.first_name, 60);
  const last = normalizeDisplayText(athleteProfile.last_name, 60);
  return [first, last].filter(Boolean).join(" ") || null;
}

function getDisplayName(
  authUser: AdminUserAuthSourceRow,
  athleteProfile: AdminUserAthleteProfileSourceRow | undefined
): Pick<AdminUserOverviewRow, "displayName" | "displayNameSource"> {
  const athleteName = getAthleteDisplayName(athleteProfile);
  if (athleteName) return { displayName: athleteName, displayNameSource: "athlete_profile" };

  const authName = getAuthMetadataDisplayName(authUser);
  if (authName) return { displayName: authName, displayNameSource: "auth_metadata" };

  return { displayName: null, displayNameSource: "none" };
}

export function resolveAdminUserRoleSource(
  authUser: Pick<AdminUserAuthSourceRow, "email" | "app_metadata">,
  profileRole: unknown,
  allowlistedEmailsRaw?: string
): AdminUserOverviewRoleSource {
  if (normalizeAdminRole(profileRole) !== "unknown") return "profile";
  const metadataRole = normalizeAdminRole(
    authUser.app_metadata?.admin_role ?? authUser.app_metadata?.role
  );
  if (metadataRole !== "unknown") return "auth_metadata";
  if (isAdminEmailAllowlisted(authUser.email, allowlistedEmailsRaw)) return "allowlist";
  return "none";
}

function getProfileStatus(
  authUser: AdminUserAuthSourceRow,
  profile: AdminUserProfileSourceRow | undefined
): AdminUserOverviewProfileStatus {
  if (!profile) return "missing_profile";
  const authEmail = normalizeDisplayText(authUser.email, 320)?.toLowerCase() ?? "";
  const profileEmail = normalizeDisplayText(profile.email, 320)?.toLowerCase() ?? "";
  if (authEmail && profileEmail && authEmail !== profileEmail) return "profile_email_mismatch";
  if (normalizeAdminRole(profile.role) === "unknown") return "unknown_role";
  return "complete";
}

function buildSupportCodes(input: {
  profileStatus: AdminUserOverviewProfileStatus;
  role: AdminRole | "unknown";
  roleSource: AdminUserOverviewRoleSource;
  authStatus: AdminUserOverviewAuthStatus;
  entitlementCount: number;
  activityAt: string | null;
  partialSummary: boolean;
}): AdminUserOverviewSupportCode[] {
  const codes: AdminUserOverviewSupportCode[] = [];

  if (input.profileStatus === "missing_profile") codes.push("missing_profile");
  if (input.profileStatus === "profile_email_mismatch") codes.push("profile_email_mismatch");
  if (input.profileStatus === "unknown_role" || input.role === "unknown")
    codes.push("unknown_role");
  if (input.roleSource === "allowlist") codes.push("allowlist_override");
  if (input.authStatus === "unconfirmed") codes.push("email_unconfirmed");
  if (input.entitlementCount === 0) codes.push("no_entitlement");
  if (!input.activityAt) codes.push("last_activity_unknown");
  if (input.partialSummary) codes.push("summary_partial");

  return codes;
}

function buildAllRows(input: BuildAdminUsersOverviewInput): AdminUserOverviewRow[] {
  const entitlementByUser = groupEntitlementsByUser(input.entitlements);
  const productById = new Map(input.products.map((product) => [product.id, product]));
  const activityByUser = getLatestActivityByUser(input.activityRows);
  const profileById = new Map(input.profiles.map((profile) => [profile.id, profile]));
  const athleteProfileByUser = new Map(
    (input.athleteProfiles ?? []).map((profile) => [profile.user_id, profile])
  );
  const partialSummary = input.partialSummary === true;

  return input.authUsers.map((authUser): AdminUserOverviewRow => {
    const profile = profileById.get(authUser.id);
    const athleteProfile = athleteProfileByUser.get(authUser.id);
    const role = resolveAdminRoleForUser(authUser, {
      profileRole: profile?.role,
      allowlistedEmailsRaw: input.allowlistedEmailsRaw,
    });
    const roleSource = resolveAdminUserRoleSource(
      authUser,
      profile?.role,
      input.allowlistedEmailsRaw
    );
    const profileStatus = getProfileStatus(authUser, profile);
    const authStatus = getAuthStatus(authUser);
    const entitlements = entitlementByUser.get(authUser.id) ?? [];
    const latestGrantedAt = entitlements.reduce<string | null>(
      (latest, row) => compareIsoDate(latest, row.granted_at),
      null
    );
    const activityAt = activityByUser.get(authUser.id) ?? null;
    const lastActivityAt = activityAt ?? authUser.last_sign_in_at ?? getAuthUpdatedAt(authUser);
    const display = getDisplayName(authUser, athleteProfile);

    return {
      id: authUser.id,
      email: getAuthEmail(authUser),
      ...display,
      role: role ?? "unknown",
      roleSource,
      profileStatus,
      authStatus,
      testerStatus: "not_configured",
      createdAt: authUser.created_at,
      updatedAt: getAuthUpdatedAt(authUser),
      profileUpdatedAt: profile?.updated_at ?? null,
      emailConfirmedAt: authUser.email_confirmed_at ?? authUser.confirmed_at ?? null,
      lastSignInAt: authUser.last_sign_in_at ?? null,
      accessStatus: entitlements.length > 0 ? "active" : "none",
      entitlementCount: entitlements.length,
      products: uniqueProductsForEntitlements(entitlements, productById),
      latestGrantedAt,
      lastActivityAt,
      lastActivitySource: activityAt ? "product_activity" : "auth_user",
      supportCodes: buildSupportCodes({
        profileStatus,
        role: role ?? "unknown",
        roleSource,
        authStatus,
        entitlementCount: entitlements.length,
        activityAt,
        partialSummary,
      }),
    };
  });
}

function rowMatchesSearch(row: AdminUserOverviewRow, search: string): boolean {
  if (!search) return true;
  const normalized = search.toLowerCase();
  return (
    row.email.toLowerCase().includes(normalized) ||
    row.displayName?.toLowerCase().includes(normalized) ||
    row.id.toLowerCase().includes(normalized)
  );
}

function sortRows(rows: AdminUserOverviewRow[], sort: AdminUsersSort): AdminUserOverviewRow[] {
  return [...rows].sort((a, b) => {
    if (sort === "email_asc") return a.email.localeCompare(b.email);
    const aDate = sort === "created_desc" ? a.createdAt : a.updatedAt;
    const bDate = sort === "created_desc" ? b.createdAt : b.updatedAt;
    return Date.parse(bDate) - Date.parse(aDate);
  });
}

export function buildAdminUsersOverview(
  input: BuildAdminUsersOverviewInput
): AdminUsersOverviewPayload {
  const generatedAt = input.generatedAt ?? new Date();
  const allRows = buildAllRows(input);
  const filteredRows = sortRows(
    allRows.filter((row) => rowMatchesSearch(row, input.query.search)),
    input.query.sort
  ).filter((row) => input.query.role === "all" || row.role === input.query.role);
  const offset = (input.query.page - 1) * input.query.pageSize;
  const items = filteredRows.slice(offset, offset + input.query.pageSize);
  const partialSummary = input.partialSummary === true;

  const summary: AdminUsersOverviewSummary = {
    totalUsers: filteredRows.length,
    visibleUsers: items.length,
    usersWithAccess: items.filter((item) => item.accessStatus === "active").length,
    usersWithoutAccess: items.filter((item) => item.accessStatus === "none").length,
    adminUsers: items.filter((item) => item.role === "admin").length,
    editorUsers: items.filter((item) => item.role === "editor").length,
    viewerUsers: items.filter((item) => item.role === "viewer").length,
    unknownRoleUsers: items.filter((item) => item.role === "unknown").length,
    missingProfileUsers: items.filter((item) => item.profileStatus === "missing_profile").length,
    unconfirmedUsers: items.filter((item) => item.authStatus === "unconfirmed").length,
    testerUsers: items.filter((item) => item.testerStatus !== "not_configured").length,
    partialSummary,
  };

  return {
    ok: true,
    generatedAt: generatedAt.toISOString(),
    query: input.query,
    summary,
    pageInfo: {
      page: input.query.page,
      pageSize: input.query.pageSize,
      totalCount: filteredRows.length,
      hasPreviousPage: input.query.page > 1,
      hasNextPage: offset + items.length < filteredRows.length,
    },
    items,
    warnings: input.warnings ?? [],
  };
}
