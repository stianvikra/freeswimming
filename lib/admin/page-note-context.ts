type AdminPageContextOption = {
  ref: string;
  label: string;
};

export const ADMIN_PAGE_CONTEXT_OPTIONS: AdminPageContextOption[] = [
  { ref: "/admin", label: "Admin dashboard" },
  { ref: "/", label: "Home page" },
  { ref: "/course", label: "Course page" },
  { ref: "/guides/0-1000m", label: "0-1000 guide" },
  { ref: "/guides/poolside", label: "Poolside guide" },
  { ref: "/my-library", label: "My Library" },
  { ref: "/my-library/goals", label: "My Library goals" },
  { ref: "/plans", label: "Plans page" },
  { ref: "/analysis", label: "Analysis page" },
  { ref: "/programs", label: "Programs page" },
  { ref: "/our-method", label: "Our method page" },
  { ref: "/about", label: "About page" },
  { ref: "/contact", label: "Contact page" },
  { ref: "/privacy", label: "Privacy page" },
  { ref: "/cookies", label: "Cookies page" },
];

const PAGE_LABEL_BY_REF = Object.fromEntries(
  ADMIN_PAGE_CONTEXT_OPTIONS.map((item) => [item.ref, item.label])
) as Record<string, string>;

function trimTrailingSlash(path: string): string {
  if (path === "/") return path;
  return path.replace(/\/+$/, "") || "/";
}

export function normalizeAdminPageContextRef(value: string): string {
  const raw = value.trim().toLowerCase();
  if (!raw) return "/";

  const withoutQueryOrHash = raw.split(/[?#]/, 1)[0] ?? "";
  const withLeadingSlash = withoutQueryOrHash.startsWith("/")
    ? withoutQueryOrHash
    : `/${withoutQueryOrHash}`;
  const singleSlashPath = withLeadingSlash.replace(/\/{2,}/g, "/");
  return trimTrailingSlash(singleSlashPath);
}

export function getAdminPageContextLabel(ref: string): string {
  const normalized = normalizeAdminPageContextRef(ref);
  const knownLabel = PAGE_LABEL_BY_REF[normalized];
  if (knownLabel) return knownLabel;
  return `Page: ${normalized}`;
}

export function hasDedicatedContextNotesForPage(pathname: string): boolean {
  const normalized = normalizeAdminPageContextRef(pathname);
  if (normalized === "/course") return true;
  if (normalized === "/guides/0-1000m") return true;
  if (normalized === "/guides/poolside") return true;
  if (normalized.startsWith("/my-library/item/")) return true;
  return false;
}
