import { ADMIN_ROLE_VALUES, type AdminRole } from "@/lib/admin/access";
import type { Database } from "@/types/database";

export const ADMIN_USERS_DEFAULT_PAGE_SIZE = 25;
export const ADMIN_USERS_MAX_PAGE_SIZE = 50;
export const ADMIN_USERS_MAX_ACTIVITY_ROWS = 1000;

export const ADMIN_USERS_SORT_VALUES = ["updated_desc", "created_desc", "email_asc"] as const;
export type AdminUsersSort = (typeof ADMIN_USERS_SORT_VALUES)[number];

export const ADMIN_USERS_ROLE_FILTER_VALUES = ["all", ...ADMIN_ROLE_VALUES] as const;
export type AdminUsersRoleFilter = (typeof ADMIN_USERS_ROLE_FILTER_VALUES)[number];

export type AdminUserOverviewSupportCode =
  | "unknown_role"
  | "no_entitlement"
  | "last_activity_unknown"
  | "summary_partial";

export type AdminUserOverviewAccessStatus = "active" | "none";
export type AdminUserOverviewActivitySource = "product_activity" | "profile_update";

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
  role: AdminRole | "unknown";
  createdAt: string;
  updatedAt: string;
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

export type AdminUserProfileSourceRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "email" | "role" | "created_at" | "updated_at"
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
  profiles: AdminUserProfileSourceRow[];
  entitlements: AdminUserEntitlementSourceRow[];
  products: AdminUserProductSourceRow[];
  activityRows: AdminUserActivitySourceRow[];
  query: AdminUsersOverviewQuery;
  totalCount: number | null;
  hasNextPage: boolean;
  generatedAt?: Date;
  partialSummary?: boolean;
  warnings?: string[];
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

function normalizeSearch(value: string | null): string {
  if (!value) return "";
  return value
    .trim()
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .slice(0, 80);
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

export function buildAdminUsersOverview(
  input: BuildAdminUsersOverviewInput
): AdminUsersOverviewPayload {
  const generatedAt = input.generatedAt ?? new Date();
  const entitlementByUser = groupEntitlementsByUser(input.entitlements);
  const productById = new Map(input.products.map((product) => [product.id, product]));
  const activityByUser = getLatestActivityByUser(input.activityRows);
  const partialSummary = input.partialSummary === true;

  const items = input.profiles.map((profile): AdminUserOverviewRow => {
    const role = normalizeAdminRole(profile.role);
    const entitlements = entitlementByUser.get(profile.id) ?? [];
    const latestGrantedAt = entitlements.reduce<string | null>(
      (latest, row) => compareIsoDate(latest, row.granted_at),
      null
    );
    const activityAt = activityByUser.get(profile.id) ?? null;
    const lastActivityAt = activityAt ?? profile.updated_at ?? profile.created_at;
    const supportCodes: AdminUserOverviewSupportCode[] = [];

    if (role === "unknown") supportCodes.push("unknown_role");
    if (entitlements.length === 0) supportCodes.push("no_entitlement");
    if (!activityAt) supportCodes.push("last_activity_unknown");
    if (partialSummary) supportCodes.push("summary_partial");

    return {
      id: profile.id,
      email: profile.email,
      role,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      accessStatus: entitlements.length > 0 ? "active" : "none",
      entitlementCount: entitlements.length,
      products: uniqueProductsForEntitlements(entitlements, productById),
      latestGrantedAt,
      lastActivityAt,
      lastActivitySource: activityAt ? "product_activity" : "profile_update",
      supportCodes,
    };
  });

  const summary: AdminUsersOverviewSummary = {
    totalUsers: input.totalCount ?? items.length,
    visibleUsers: items.length,
    usersWithAccess: items.filter((item) => item.accessStatus === "active").length,
    usersWithoutAccess: items.filter((item) => item.accessStatus === "none").length,
    adminUsers: items.filter((item) => item.role === "admin").length,
    editorUsers: items.filter((item) => item.role === "editor").length,
    viewerUsers: items.filter((item) => item.role === "viewer").length,
    unknownRoleUsers: items.filter((item) => item.role === "unknown").length,
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
      totalCount: input.totalCount,
      hasPreviousPage: input.query.page > 1,
      hasNextPage: input.hasNextPage,
    },
    items,
    warnings: input.warnings ?? [],
  };
}
