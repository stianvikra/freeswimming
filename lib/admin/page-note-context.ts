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
  { ref: "/my-library/training", label: "My Library training" },
  { ref: "/my-library/profile", label: "My Library profile" },
  { ref: "/my-library/workouts", label: "My Library workouts" },
  { ref: "/my-library/dryland", label: "My Library dryland" },
  { ref: "/my-library/generator", label: "My Library generator" },
  { ref: "/my-library/security", label: "My Library security" },
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

const ADMIN_MY_LIBRARY_PAGE_NOTE_REFS = [
  "/my-library",
  "/my-library/goals",
  "/my-library/training",
  "/my-library/profile",
  "/my-library/workouts",
  "/my-library/dryland",
  "/my-library/generator",
  "/my-library/security",
] as const;

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
  if (normalized.startsWith("/my-library/workouts/")) {
    return "My Library swim session detail";
  }
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

export function supportsAdminPageNotesSurface(pathname: string): boolean {
  const normalized = normalizeAdminPageContextRef(pathname);

  if (normalized === "/admin" || normalized.startsWith("/admin/")) {
    return false;
  }

  if (normalized === "/auth/sign-in" || normalized.startsWith("/auth/")) {
    return false;
  }

  if (normalized === "/checkout/success" || normalized.startsWith("/checkout/")) {
    return false;
  }

  if (hasDedicatedContextNotesForPage(normalized)) {
    return false;
  }

  if (normalized.startsWith("/my-library/workouts/")) {
    return true;
  }

  if (normalized.startsWith("/my-library")) {
    return ADMIN_MY_LIBRARY_PAGE_NOTE_REFS.includes(
      normalized as (typeof ADMIN_MY_LIBRARY_PAGE_NOTE_REFS)[number]
    );
  }

  return true;
}
