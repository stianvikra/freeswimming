import type { AdminContentItemRow } from "@/lib/admin/content";
import { ADMIN_PAGE_CONTEXT_OPTIONS } from "@/lib/admin/page-note-context";
import { type AdminNoteContextType, formatAdminNoteContextLabel } from "@/lib/admin/note-context";
import {
  inferCourseModuleRuntimeIdFromLessonRuntimeId,
  resolveCourseLessonRuntimeId,
  resolveCourseLessonRuntimeAliases,
  resolveCourseModuleRuntimeId,
  resolveCourseModuleRuntimeAliases,
} from "@/lib/course/runtime-identity";
import {
  resolveGuideDrillRuntimeId,
  resolveGuideSessionRuntimeId,
} from "@/lib/guides/runtime-identity";

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

function normalizeRef(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function toOrdinalFromSortOrder(value: number | null): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 0) return null;
  return Math.trunc(value) + 1;
}

function extractTrailingNumber(value: string, pattern: RegExp): number | null {
  const match = value.match(pattern);
  if (!match?.[1]) return null;
  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function inferModuleOrdinalFromRef(moduleRef: string): number | null {
  return extractTrailingNumber(moduleRef, /^mod(\d+)$/i);
}

function inferLessonOrdinalFromRef(lessonRef: string): number | null {
  return extractTrailingNumber(lessonRef, /-l(\d+)$/i);
}

function inferSessionOrdinalFromRef(sessionRef: string): number | null {
  return extractTrailingNumber(sessionRef, /s(\d+)$/i);
}

function inferDrillOrdinalFromRef(drillRef: string): number | null {
  return extractTrailingNumber(drillRef, /d(\d+)$/i);
}

function formatModuleLabel(title: string, moduleOrdinal: number | null): string {
  if (!moduleOrdinal) return title;
  return `M${moduleOrdinal} · ${title}`;
}

function formatLessonLabel(
  title: string,
  moduleOrdinal: number | null,
  lessonOrdinal: number | null
): string {
  const prefix: string[] = [];
  if (moduleOrdinal) prefix.push(`M${moduleOrdinal}`);
  if (lessonOrdinal) prefix.push(`L${lessonOrdinal}`);
  if (prefix.length === 0) return title;
  return `${prefix.join(" · ")} · ${title}`;
}

function formatSessionLabel(title: string, sessionOrdinal: number | null): string {
  if (!sessionOrdinal) return title;
  return `S${sessionOrdinal} · ${title}`;
}

function formatDrillLabel(title: string, drillOrdinal: number | null): string {
  if (!drillOrdinal) return title;
  return `D${drillOrdinal} · ${title}`;
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

function inferModuleRefFromLessonRef(lessonRef: string): string {
  const normalized = normalizeRef(lessonRef);
  if (!normalized) return "";
  return normalizeRef(inferCourseModuleRuntimeIdFromLessonRuntimeId(normalized) ?? normalized);
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
  const moduleAliasRefsByCanonicalRef = new Map<string, string[]>();
  const moduleOrdinalByRef = new Map<string, number>();
  const moduleByRowId = new Map<string, string>();
  const lessonsByRef = new Map<string, AdminNoteLessonContextOption>();
  const lessonAliasRefsByCanonicalRef = new Map<string, string[]>();
  const lessonOrdinalByRef = new Map<string, number>();
  const lessonModuleOrdinalByRef = new Map<string, number>();
  const sessionsByRef = new Map<string, AdminNoteContextOption>();
  const sessionOrdinalByRef = new Map<string, number>();
  const drillsByRef = new Map<string, AdminNoteContextOption>();
  const drillOrdinalByRef = new Map<string, number>();
  const productsByRef = new Map<string, AdminNoteContextOption>();
  const pagesByRef = new Map<string, AdminNoteContextOption>();

  for (const page of ADMIN_PAGE_CONTEXT_OPTIONS) {
    upsertOption(pagesByRef, page.ref, page.label);
  }

  for (const item of params.contentItems) {
    if (item.content_type !== "course_module") continue;
    const moduleRef = normalizeRef(resolveCourseModuleRuntimeId(item.body, item.slug) ?? "");
    const moduleOrdinal =
      toOrdinalFromSortOrder(item.sort_order) ?? inferModuleOrdinalFromRef(moduleRef);
    const moduleAliases = resolveCourseModuleRuntimeAliases(item.body, item.slug).map(normalizeRef);
    if (moduleOrdinal) {
      moduleOrdinalByRef.set(moduleRef, moduleOrdinal);
    }
    if (moduleAliases.length > 0) {
      moduleAliasRefsByCanonicalRef.set(moduleRef, moduleAliases);
    }
    const moduleLabel = formatModuleLabel(item.title.trim() || moduleRef, moduleOrdinal);
    upsertOption(modulesByRef, moduleRef, moduleLabel);
    moduleByRowId.set(item.id, moduleRef);
  }

  for (const item of params.contentItems) {
    if (item.content_type === "course_lesson") {
      const lessonRef = normalizeRef(resolveCourseLessonRuntimeId(item.body, item.slug) ?? "");
      const lessonLabel = item.title.trim() || lessonRef;
      const lessonAliases = resolveCourseLessonRuntimeAliases(item.body, item.slug).map(
        normalizeRef
      );

      const moduleRefFromParent = item.parent_id ? (moduleByRowId.get(item.parent_id) ?? "") : "";
      const moduleRefFromBody = normalizeRef(getBodyString(item.body, "moduleId"));
      const moduleRef =
        moduleRefFromParent || moduleRefFromBody || inferModuleRefFromLessonRef(lessonRef);
      const moduleOrdinal =
        moduleOrdinalByRef.get(moduleRef) ?? inferModuleOrdinalFromRef(moduleRef);
      const lessonOrdinal =
        toOrdinalFromSortOrder(item.sort_order) ?? inferLessonOrdinalFromRef(lessonRef);
      if (moduleOrdinal) {
        lessonModuleOrdinalByRef.set(lessonRef, moduleOrdinal);
      }
      if (lessonOrdinal) {
        lessonOrdinalByRef.set(lessonRef, lessonOrdinal);
      }

      lessonsByRef.set(lessonRef, {
        ref: lessonRef,
        label: formatLessonLabel(lessonLabel, moduleOrdinal, lessonOrdinal),
        moduleRef: normalizeRef(moduleRef),
      });
      if (lessonAliases.length > 0) {
        lessonAliasRefsByCanonicalRef.set(lessonRef, lessonAliases);
      }

      continue;
    }

    if (item.content_type === "guide_session") {
      const sessionResolution = resolveGuideSessionRuntimeId(item.body, item.slug);
      if (sessionResolution.source === "legacy_slug") {
        console.warn("[AdminNotes] Legacy guide-session slug fallback used", {
          slug: item.slug,
        });
      } else if (!sessionResolution.runtimeId) {
        console.warn("[AdminNotes] Unresolved guide-session runtime identity", {
          slug: item.slug,
        });
        continue;
      }

      const sessionRef = normalizeRef(sessionResolution.runtimeId);
      const sessionOrdinal =
        toOrdinalFromSortOrder(item.sort_order) ?? inferSessionOrdinalFromRef(sessionRef);
      if (sessionOrdinal) {
        sessionOrdinalByRef.set(sessionRef, sessionOrdinal);
      }
      upsertOption(
        sessionsByRef,
        sessionRef,
        formatSessionLabel(item.title.trim() || sessionRef, sessionOrdinal)
      );
      continue;
    }

    if (item.content_type === "guide_drill") {
      const drillResolution = resolveGuideDrillRuntimeId(item.body, item.slug);
      if (drillResolution.source === "legacy_slug") {
        console.warn("[AdminNotes] Legacy guide-drill slug fallback used", {
          slug: item.slug,
        });
      } else if (!drillResolution.runtimeId) {
        console.warn("[AdminNotes] Unresolved guide-drill runtime identity", {
          slug: item.slug,
        });
        continue;
      }

      const drillRef = normalizeRef(drillResolution.runtimeId);
      const drillOrdinal =
        toOrdinalFromSortOrder(item.sort_order) ?? inferDrillOrdinalFromRef(drillRef);
      if (drillOrdinal) {
        drillOrdinalByRef.set(drillRef, drillOrdinal);
      }
      upsertOption(
        drillsByRef,
        drillRef,
        formatDrillLabel(item.title.trim() || drillRef, drillOrdinal)
      );
    }
  }

  for (const product of params.products) {
    const productRef = normalizeRef(product.slug);
    if (!productRef) continue;
    const suffix = product.active ? "" : " (inactive)";
    upsertOption(productsByRef, productRef, `${product.title}${suffix}`);
  }

  const modules = [...modulesByRef.values()].sort((a, b) => {
    const aOrdinal = moduleOrdinalByRef.get(a.ref);
    const bOrdinal = moduleOrdinalByRef.get(b.ref);
    if (aOrdinal !== undefined && bOrdinal !== undefined && aOrdinal !== bOrdinal) {
      return aOrdinal - bOrdinal;
    }
    if (aOrdinal !== undefined && bOrdinal === undefined) return -1;
    if (aOrdinal === undefined && bOrdinal !== undefined) return 1;
    return a.label.localeCompare(b.label);
  });
  const lessons = [...lessonsByRef.values()].sort((a, b) => {
    const aModuleOrdinal = lessonModuleOrdinalByRef.get(a.ref);
    const bModuleOrdinal = lessonModuleOrdinalByRef.get(b.ref);
    if (
      aModuleOrdinal !== undefined &&
      bModuleOrdinal !== undefined &&
      aModuleOrdinal !== bModuleOrdinal
    ) {
      return aModuleOrdinal - bModuleOrdinal;
    }
    if (aModuleOrdinal !== undefined && bModuleOrdinal === undefined) return -1;
    if (aModuleOrdinal === undefined && bModuleOrdinal !== undefined) return 1;

    const aLessonOrdinal = lessonOrdinalByRef.get(a.ref);
    const bLessonOrdinal = lessonOrdinalByRef.get(b.ref);
    if (
      aLessonOrdinal !== undefined &&
      bLessonOrdinal !== undefined &&
      aLessonOrdinal !== bLessonOrdinal
    ) {
      return aLessonOrdinal - bLessonOrdinal;
    }
    if (aLessonOrdinal !== undefined && bLessonOrdinal === undefined) return -1;
    if (aLessonOrdinal === undefined && bLessonOrdinal !== undefined) return 1;
    return a.label.localeCompare(b.label);
  });
  const sessions = [...sessionsByRef.values()].sort((a, b) => {
    const aOrdinal = sessionOrdinalByRef.get(a.ref);
    const bOrdinal = sessionOrdinalByRef.get(b.ref);
    if (aOrdinal !== undefined && bOrdinal !== undefined && aOrdinal !== bOrdinal) {
      return aOrdinal - bOrdinal;
    }
    if (aOrdinal !== undefined && bOrdinal === undefined) return -1;
    if (aOrdinal === undefined && bOrdinal !== undefined) return 1;
    return a.label.localeCompare(b.label);
  });
  const drills = [...drillsByRef.values()].sort((a, b) => {
    const aOrdinal = drillOrdinalByRef.get(a.ref);
    const bOrdinal = drillOrdinalByRef.get(b.ref);
    if (aOrdinal !== undefined && bOrdinal !== undefined && aOrdinal !== bOrdinal) {
      return aOrdinal - bOrdinal;
    }
    if (aOrdinal !== undefined && bOrdinal === undefined) return -1;
    if (aOrdinal === undefined && bOrdinal !== undefined) return 1;
    return a.label.localeCompare(b.label);
  });
  const products = sortOptions([...productsByRef.values()]);
  const pages = sortOptions([...pagesByRef.values()]);

  const labelsByContextKey: Record<string, string> = {};
  const lessonModuleByRef: Record<string, string> = {};

  modules.forEach((option) => {
    labelsByContextKey[contextKey("course_module", option.ref)] = option.label;
    for (const aliasRef of moduleAliasRefsByCanonicalRef.get(option.ref) ?? []) {
      labelsByContextKey[contextKey("course_module", aliasRef)] = option.label;
    }
  });
  lessons.forEach((option) => {
    labelsByContextKey[contextKey("course_lesson", option.ref)] = option.label;
    lessonModuleByRef[option.ref] = option.moduleRef;
    for (const aliasRef of lessonAliasRefsByCanonicalRef.get(option.ref) ?? []) {
      labelsByContextKey[contextKey("course_lesson", aliasRef)] = option.label;
      lessonModuleByRef[aliasRef] = option.moduleRef;
    }
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
