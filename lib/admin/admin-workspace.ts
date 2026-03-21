export const ADMIN_TAB_VALUES = [
  "content",
  "qr-links",
  "commerce",
  "operations",
  "email-templates",
  "notes",
  "categories",
  "help",
] as const;

export type AdminTab = (typeof ADMIN_TAB_VALUES)[number];

export const ADMIN_TAB_QUERY_KEY = "tab";

export function parseAdminTab(value: string | null | undefined): AdminTab | null {
  if (!value) return null;
  return ADMIN_TAB_VALUES.includes(value as AdminTab) ? (value as AdminTab) : null;
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
