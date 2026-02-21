import type { AdminContentItemRow } from "@/lib/admin/content";
import { type AdminNoteContextType, formatAdminNoteContextLabel } from "@/lib/admin/note-context";

type AdminProductSummary = {
  slug: string;
  title: string;
  active: boolean;
};

type AdminNoteContextOption = {
  ref: string;
  label: string;
};

type AdminNoteLessonContextOption = AdminNoteContextOption & {
  moduleRef: string;
};

export type AdminNoteContextCatalog = {
  modules: AdminNoteContextOption[];
  lessons: AdminNoteLessonContextOption[];
  sessions: AdminNoteContextOption[];
  drills: AdminNoteContextOption[];
  products: AdminNoteContextOption[];
  pages: AdminNoteContextOption[];
  labelsByContextKey: Record<string, string>;
  lessonModuleByRef: Record<string, string>;
};

const PAGE_OPTIONS: AdminNoteContextOption[] = [
  { ref: "/admin", label: "Admin dashboard" },
  { ref: "/course", label: "Course page" },
  { ref: "/guides/0-1000m", label: "0-1000 guide" },
  { ref: "/guides/poolside", label: "Poolside guide" },
  { ref: "/my-library", label: "My Library" },
  { ref: "/my-library/goals", label: "My Library goals" },
  { ref: "/plans", label: "Plans page" },
  { ref: "/analysis", label: "Analysis page" },
  { ref: "/", label: "Home page" },
];

function normalizeRef(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function getBodyRecord(body: AdminContentItemRow["body"]): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {};
  }
  return body as Record<string, unknown>;
}

function getBodyString(body: AdminContentItemRow["body"], key: string): string {
  const record = getBodyRecord(body);
  const value = record[key];
  if (typeof value !== "string") return "";
  return value.trim();
}

function inferModuleRefFromSlug(slug: string): string {
  const match = slug.match(/^course-module-(.+)$/i);
  return normalizeRef(match?.[1] ?? slug);
}

function inferLessonRefFromSlug(slug: string): string {
  const match = slug.match(/^course-lesson-(.+)$/i);
  return normalizeRef(match?.[1] ?? slug);
}

function inferModuleRefFromLessonRef(lessonRef: string): string {
  const normalized = normalizeRef(lessonRef);
  if (!normalized) return "";
  const [moduleRef] = normalized.split("-l");
  return normalizeRef(moduleRef ?? "");
}

function inferGuideSessionRefFromSlug(slug: string): string {
  const match = slug.match(/-session-(.+)$/i);
  return normalizeRef(match?.[1] ?? slug);
}

function inferGuideDrillRefFromSlug(slug: string): string {
  const match = slug.match(/-drill-(.+)$/i);
  return normalizeRef(match?.[1] ?? slug);
}

function upsertOption(map: Map<string, AdminNoteContextOption>, ref: string, label: string): void {
  const normalizedRef = normalizeRef(ref);
  if (!normalizedRef) return;
  const normalizedLabel = label.trim() || normalizedRef;
  const existing = map.get(normalizedRef);
  if (!existing) {
    map.set(normalizedRef, { ref: normalizedRef, label: normalizedLabel });
    return;
  }
  if (existing.label === existing.ref && normalizedLabel !== normalizedRef) {
    map.set(normalizedRef, { ref: normalizedRef, label: normalizedLabel });
  }
}

function contextKey(contextType: AdminNoteContextType, contextRef: string): string {
  return `${contextType}:${normalizeRef(contextRef)}`;
}

function sortOptions<T extends AdminNoteContextOption>(options: T[]): T[] {
  return [...options].sort((a, b) => a.label.localeCompare(b.label));
}

export function buildAdminNoteContextCatalog(params: {
  contentItems: AdminContentItemRow[];
  products: AdminProductSummary[];
}): AdminNoteContextCatalog {
  const modulesByRef = new Map<string, AdminNoteContextOption>();
  const moduleByRowId = new Map<string, string>();
  const lessonsByRef = new Map<string, AdminNoteLessonContextOption>();
  const sessionsByRef = new Map<string, AdminNoteContextOption>();
  const drillsByRef = new Map<string, AdminNoteContextOption>();
  const productsByRef = new Map<string, AdminNoteContextOption>();
  const pagesByRef = new Map<string, AdminNoteContextOption>();

  for (const page of PAGE_OPTIONS) {
    upsertOption(pagesByRef, page.ref, page.label);
  }

  for (const item of params.contentItems) {
    if (item.content_type !== "course_module") continue;
    const moduleRef = normalizeRef(
      getBodyString(item.body, "moduleId") || inferModuleRefFromSlug(item.slug)
    );
    const moduleLabel = item.title.trim() || moduleRef;
    upsertOption(modulesByRef, moduleRef, moduleLabel);
    moduleByRowId.set(item.id, moduleRef);
  }

  for (const item of params.contentItems) {
    if (item.content_type === "course_lesson") {
      const lessonRef = normalizeRef(
        getBodyString(item.body, "lessonId") || inferLessonRefFromSlug(item.slug)
      );
      const lessonLabel = item.title.trim() || lessonRef;

      const moduleRefFromParent = item.parent_id ? (moduleByRowId.get(item.parent_id) ?? "") : "";
      const moduleRefFromBody = normalizeRef(getBodyString(item.body, "moduleId"));
      const moduleRef =
        moduleRefFromParent || moduleRefFromBody || inferModuleRefFromLessonRef(lessonRef);

      lessonsByRef.set(lessonRef, {
        ref: lessonRef,
        label: lessonLabel,
        moduleRef: normalizeRef(moduleRef),
      });

      continue;
    }

    if (item.content_type === "guide_session") {
      const sessionRef = normalizeRef(
        getBodyString(item.body, "sessionId") || inferGuideSessionRefFromSlug(item.slug)
      );
      upsertOption(sessionsByRef, sessionRef, item.title.trim() || sessionRef);
      continue;
    }

    if (item.content_type === "guide_drill") {
      const drillRef = normalizeRef(
        getBodyString(item.body, "drillId") || inferGuideDrillRefFromSlug(item.slug)
      );
      upsertOption(drillsByRef, drillRef, item.title.trim() || drillRef);
    }
  }

  for (const product of params.products) {
    const productRef = normalizeRef(product.slug);
    if (!productRef) continue;
    const suffix = product.active ? "" : " (inactive)";
    upsertOption(productsByRef, productRef, `${product.title}${suffix}`);
  }

  const modules = sortOptions([...modulesByRef.values()]);
  const lessons = [...lessonsByRef.values()].sort((a, b) => a.label.localeCompare(b.label));
  const sessions = sortOptions([...sessionsByRef.values()]);
  const drills = sortOptions([...drillsByRef.values()]);
  const products = sortOptions([...productsByRef.values()]);
  const pages = sortOptions([...pagesByRef.values()]);

  const labelsByContextKey: Record<string, string> = {};
  const lessonModuleByRef: Record<string, string> = {};

  modules.forEach((option) => {
    labelsByContextKey[contextKey("course_module", option.ref)] = option.label;
  });
  lessons.forEach((option) => {
    labelsByContextKey[contextKey("course_lesson", option.ref)] = option.label;
    lessonModuleByRef[option.ref] = option.moduleRef;
  });
  sessions.forEach((option) => {
    labelsByContextKey[contextKey("guide_session", option.ref)] = option.label;
  });
  drills.forEach((option) => {
    labelsByContextKey[contextKey("guide_drill", option.ref)] = option.label;
  });
  products.forEach((option) => {
    labelsByContextKey[contextKey("product", option.ref)] = option.label;
  });
  pages.forEach((option) => {
    labelsByContextKey[contextKey("page", option.ref)] = option.label;
  });

  return {
    modules,
    lessons,
    sessions,
    drills,
    products,
    pages,
    labelsByContextKey,
    lessonModuleByRef,
  };
}

export function resolveAdminNoteContextLabel(params: {
  catalog: Pick<AdminNoteContextCatalog, "labelsByContextKey">;
  contextType: string | null | undefined;
  contextRef: string | null | undefined;
}): string | null {
  if (!params.contextType || !params.contextRef) return null;

  const type = params.contextType as AdminNoteContextType;
  const key = contextKey(type, params.contextRef);
  const knownLabel = params.catalog.labelsByContextKey[key];
  if (knownLabel) {
    const typeLabel = type
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    return `${typeLabel}: ${knownLabel}`;
  }

  return formatAdminNoteContextLabel({
    contextType: params.contextType,
    contextRef: params.contextRef,
  });
}
