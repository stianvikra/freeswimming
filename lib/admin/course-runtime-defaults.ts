import {
  resolveCanonicalCourseLessonRuntimeId,
  resolveCanonicalCourseLessonRuntimeIdBySlug,
  resolveCanonicalCourseModuleRuntimeId,
  resolveCanonicalCourseModuleRuntimeIdBySlug,
  resolveCanonicalCourseModuleRuntimeIdFromLesson,
} from "@/lib/course/runtime-id-manifest";
import {
  normalizeRuntimeId,
  resolveCourseLessonRuntimeId,
  resolveCourseModuleRuntimeId,
} from "@/lib/course/runtime-identity";
import type { Database } from "@/types/database";

export type CourseIdentityRow = Pick<
  Database["public"]["Tables"]["admin_content_items"]["Row"],
  "id" | "content_type" | "slug" | "body" | "parent_id"
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(body: Record<string, unknown>, key: "moduleId" | "lessonId"): boolean {
  return Object.prototype.hasOwnProperty.call(body, key);
}

function normalizeSemanticToken(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;

  const lower = value.trim().toLowerCase();
  if (!lower) return null;

  const chars: string[] = [];
  let wroteSeparator = false;

  for (let index = 0; index < lower.length; index += 1) {
    const char = lower[index] ?? "";
    const code = char.charCodeAt(0);
    const isDigit = code >= 48 && code <= 57;
    const isLetter = code >= 97 && code <= 122;

    if (isDigit || isLetter) {
      chars.push(char);
      wroteSeparator = false;
      continue;
    }

    if (chars.length > 0 && !wroteSeparator) {
      chars.push("-");
      wroteSeparator = true;
    }
  }

  while (chars[chars.length - 1] === "-") {
    chars.pop();
  }

  const normalized = chars.join("");
  return normalized.length > 0 ? normalized : null;
}

function normalizeLessonRuntimeIdInput(value: unknown): string | null {
  const raw = normalizeRuntimeId(value);
  if (!raw) return null;

  const canonicalLessonId = resolveCanonicalCourseLessonRuntimeId(raw);
  if (canonicalLessonId) return canonicalLessonId;

  const segments = raw.split("--");
  if (segments.length === 1) {
    return normalizeSemanticToken(segments[0]);
  }

  const normalizedSegments = segments.map((segment) => normalizeSemanticToken(segment));
  if (normalizedSegments.some((segment) => !segment)) {
    return null;
  }

  return normalizedSegments.join("--");
}

function normalizeModuleRuntimeIdInput(value: unknown): string | null {
  const raw = normalizeRuntimeId(value);
  if (!raw) return null;
  return resolveCanonicalCourseModuleRuntimeId(raw) ?? normalizeSemanticToken(raw);
}

function normalizeSlugRemainder(slug: string, prefix: string): string | null {
  const normalizedSlug = slug.trim().toLowerCase();
  const remainder = normalizedSlug.startsWith(prefix)
    ? normalizedSlug.slice(prefix.length)
    : normalizedSlug;
  return normalizeSemanticToken(remainder);
}

function normalizeLessonSuffixToken(params: { slug: string; moduleRuntimeId: string }): string {
  const rawToken = normalizeSlugRemainder(params.slug, "course-lesson-") ?? "lesson";

  if (rawToken === params.moduleRuntimeId) {
    return "lesson";
  }

  if (rawToken.startsWith(`${params.moduleRuntimeId}-`)) {
    const withoutModulePrefix = rawToken.slice(params.moduleRuntimeId.length + 1);
    return normalizeSemanticToken(withoutModulePrefix) ?? "lesson";
  }

  return rawToken;
}

function ensureUniqueRuntimeId(baseRuntimeId: string, usedRuntimeIds: ReadonlySet<string>): string {
  if (!usedRuntimeIds.has(baseRuntimeId)) {
    return baseRuntimeId;
  }

  let counter = 2;
  let candidate = `${baseRuntimeId}-${counter}`;
  while (usedRuntimeIds.has(candidate)) {
    counter += 1;
    candidate = `${baseRuntimeId}-${counter}`;
  }

  return candidate;
}

function collectUsedModuleRuntimeIds(rows: CourseIdentityRow[]): Set<string> {
  const runtimeIds = new Set<string>();

  for (const row of rows) {
    if (row.content_type !== "course_module") continue;
    const runtimeId = resolveCourseModuleRuntimeId(row.body, row.slug);
    if (runtimeId) {
      runtimeIds.add(runtimeId);
    }
  }

  return runtimeIds;
}

function collectUsedLessonRuntimeIds(rows: CourseIdentityRow[]): Set<string> {
  const runtimeIds = new Set<string>();

  for (const row of rows) {
    if (row.content_type !== "course_lesson") continue;
    const runtimeId = resolveCourseLessonRuntimeId(row.body, row.slug);
    if (runtimeId) {
      runtimeIds.add(runtimeId);
    }
  }

  return runtimeIds;
}

function resolveDefaultModuleRuntimeIdFromSlug(slug: string): string {
  return (
    resolveCanonicalCourseModuleRuntimeIdBySlug(slug) ??
    resolveCanonicalCourseModuleRuntimeId(normalizeSlugRemainder(slug, "course-module-")) ??
    normalizeSlugRemainder(slug, "course-module-") ??
    "course-module"
  );
}

function resolveDefaultLessonRuntimeIdFromSlug(params: {
  slug: string;
  moduleRuntimeId: string;
}): string {
  const canonicalLessonId = resolveCanonicalCourseLessonRuntimeIdBySlug(params.slug);
  if (canonicalLessonId) {
    const canonicalLessonModuleId =
      resolveCanonicalCourseModuleRuntimeIdFromLesson(canonicalLessonId);
    if (!canonicalLessonModuleId || canonicalLessonModuleId === params.moduleRuntimeId) {
      return canonicalLessonId;
    }
  }

  return `${params.moduleRuntimeId}--${normalizeLessonSuffixToken(params)}`;
}

export function applyCourseModuleRuntimeIdDefaults(params: {
  body: Record<string, unknown>;
  slug: string;
  rows: CourseIdentityRow[];
}):
  | { ok: true; body: Record<string, unknown>; moduleRuntimeId: string }
  | { ok: false; error: string } {
  const explicitModuleId = hasOwn(params.body, "moduleId")
    ? normalizeModuleRuntimeIdInput(params.body.moduleId)
    : null;

  if (hasOwn(params.body, "moduleId") && !explicitModuleId) {
    return {
      ok: false,
      error: "Course module runtime ID must use lowercase letters, numbers, and dashes.",
    };
  }

  const usedRuntimeIds = collectUsedModuleRuntimeIds(params.rows);
  const moduleRuntimeId = ensureUniqueRuntimeId(
    explicitModuleId ?? resolveDefaultModuleRuntimeIdFromSlug(params.slug),
    usedRuntimeIds
  );

  return {
    ok: true,
    moduleRuntimeId,
    body: {
      ...params.body,
      moduleId: moduleRuntimeId,
    },
  };
}

export function applyCourseLessonRuntimeIdDefaults(params: {
  body: Record<string, unknown>;
  slug: string;
  moduleRuntimeId: string;
  rows: CourseIdentityRow[];
}):
  | { ok: true; body: Record<string, unknown>; lessonRuntimeId: string }
  | { ok: false; error: string } {
  const explicitModuleId = hasOwn(params.body, "moduleId")
    ? normalizeModuleRuntimeIdInput(params.body.moduleId)
    : null;
  if (hasOwn(params.body, "moduleId") && !explicitModuleId) {
    return {
      ok: false,
      error: "Course lesson module runtime ID must use lowercase letters, numbers, and dashes.",
    };
  }

  if (explicitModuleId && explicitModuleId !== params.moduleRuntimeId) {
    return {
      ok: false,
      error: "Course lesson module runtime ID must match the selected parent module.",
    };
  }

  const explicitLessonId = hasOwn(params.body, "lessonId")
    ? normalizeLessonRuntimeIdInput(params.body.lessonId)
    : null;
  if (hasOwn(params.body, "lessonId") && !explicitLessonId) {
    return {
      ok: false,
      error:
        "Course lesson runtime ID must use lowercase letters, numbers, dashes, and optional -- segments.",
    };
  }

  const usedRuntimeIds = collectUsedLessonRuntimeIds(params.rows);
  const lessonRuntimeId = ensureUniqueRuntimeId(
    explicitLessonId ??
      resolveDefaultLessonRuntimeIdFromSlug({
        slug: params.slug,
        moduleRuntimeId: params.moduleRuntimeId,
      }),
    usedRuntimeIds
  );

  return {
    ok: true,
    lessonRuntimeId,
    body: {
      ...params.body,
      moduleId: params.moduleRuntimeId,
      lessonId: lessonRuntimeId,
    },
  };
}

export function readCourseParentModuleRuntimeId(
  parentRow: CourseIdentityRow | null
): string | null {
  if (!parentRow || parentRow.content_type !== "course_module") {
    return null;
  }

  return resolveCourseModuleRuntimeId(parentRow.body, parentRow.slug);
}

export function toCourseRuntimeBody(input: unknown): Record<string, unknown> {
  return isRecord(input) ? input : {};
}
