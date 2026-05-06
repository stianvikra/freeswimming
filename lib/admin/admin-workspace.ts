export const ADMIN_TAB_VALUES = [
  "content",
  "qr-links",
  "commerce",
  "operations",
  "email-templates",
  "messages",
  "notes",
  "categories",
  "help",
] as const;

export type AdminTab = (typeof ADMIN_TAB_VALUES)[number];

export const PLANNED_ADMIN_TAB_VALUES = [] as const;

export type PlannedAdminTab = (typeof PLANNED_ADMIN_TAB_VALUES)[number];

export type AdminWorkspaceModuleId = AdminTab | PlannedAdminTab;

export const ADMIN_TAB_QUERY_KEY = "tab";

export type AdminWorkspaceModuleBoundary = {
  id: AdminWorkspaceModuleId;
  status: "active" | "planned";
  label: string;
  routePath: "/admin";
  tabQueryValue: AdminWorkspaceModuleId | null;
  orchestrationBoundary: string;
  mutationBoundary: string;
  viewBoundary: string;
  serverCanonicalData: readonly string[];
  localOnlyState: readonly string[];
  activationBrief: string;
};

export const ADMIN_MESSAGES_WORKSPACE_BOUNDARY = {
  id: "messages",
  status: "active",
  label: "Messages",
  routePath: "/admin",
  tabQueryValue: "messages",
  orchestrationBoundary:
    "Admin Messages owns filters, selection, and status action state in a dedicated message workspace module.",
  mutationBoundary:
    "Admin message reads and mutations go through admin-only route handlers backed by lib/admin message contracts; client panels do not call delivery providers directly.",
  viewBoundary:
    "Admin message list, detail, diagnostics, and reply panels live under a dedicated admin messages component boundary instead of being added to existing large admin managers.",
  serverCanonicalData: [
    "inbound messages",
    "message statuses",
    "delivery attempts",
    "redacted diagnostics",
  ],
  localOnlyState: ["filters", "current selection", "pending action state"],
  activationBrief: "docs/task-briefs/in-progress/2026-05-06-admin-message-inbox-10-10.md",
} as const satisfies AdminWorkspaceModuleBoundary;

export const ADMIN_WORKSPACE_MODULE_BOUNDARIES = [
  ADMIN_MESSAGES_WORKSPACE_BOUNDARY,
] as const satisfies readonly AdminWorkspaceModuleBoundary[];

export function parseAdminTab(value: string | null | undefined): AdminTab | null {
  if (!value) return null;
  return ADMIN_TAB_VALUES.includes(value as AdminTab) ? (value as AdminTab) : null;
}

export function parseAdminWorkspaceModuleId(
  value: string | null | undefined
): AdminWorkspaceModuleId | null {
  if (!value) return null;
  if (ADMIN_TAB_VALUES.includes(value as AdminTab)) return value as AdminTab;
  if (PLANNED_ADMIN_TAB_VALUES.includes(value as PlannedAdminTab)) {
    return value as PlannedAdminTab;
  }
  return null;
}

export function getAdminWorkspaceModuleBoundary(
  id: AdminWorkspaceModuleId
): AdminWorkspaceModuleBoundary | null {
  return ADMIN_WORKSPACE_MODULE_BOUNDARIES.find((boundary) => boundary.id === id) ?? null;
}

export function buildAdminWorkspaceModuleHref(boundary: AdminWorkspaceModuleBoundary): string {
  if (!boundary.tabQueryValue || boundary.tabQueryValue === "content") {
    return boundary.routePath;
  }

  const params = new URLSearchParams();
  params.set(ADMIN_TAB_QUERY_KEY, boundary.tabQueryValue);
  return `${boundary.routePath}?${params.toString()}`;
}

export function applyAdminTabToSearchParams(
  params: URLSearchParams,
  tab: AdminTab
): URLSearchParams {
  const next = new URLSearchParams(params.toString());
  if (tab === "content") {
    next.delete(ADMIN_TAB_QUERY_KEY);
    return next;
  }

  next.set(ADMIN_TAB_QUERY_KEY, tab);
  return next;
}
