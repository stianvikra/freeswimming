import {
  COURSE_MODULES,
  type CourseLesson,
  type CourseModule,
  type CourseSupportActionId,
} from "@/app/course/courseData";
import { unstable_cache } from "next/cache";
import { ensurePlatformContentSeeded } from "@/lib/admin/content-import-apply";
import { isAdminContentSchemaMissing } from "@/lib/admin/schema";
import {
  resolveCourseLessonModuleRuntimeId,
  resolveCourseLessonRuntimeAliases,
  resolveCourseLessonRuntimeId,
  resolveCourseModuleRuntimeAliases,
  resolveCourseModuleRuntimeId,
} from "@/lib/course/runtime-identity";
import {
  normalizeCourseLessonExperienceInput,
  resolveCourseLessonExperience,
} from "@/lib/course/lesson-experience";
import type { CourseContentReadStatus } from "@/lib/course/preview";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/types/database";

export const PUBLIC_COURSE_CONTENT_REVALIDATE_SECONDS = 60 * 60;

type AdminContentRow = Database["public"]["Tables"]["admin_content_items"]["Row"];

type CourseModuleContentRow = Pick<
  AdminContentRow,
  "id" | "slug" | "title" | "summary" | "sort_order" | "body"
> & {
  published_at?: string | null;
};
type CourseLessonContentRow = Pick<
  AdminContentRow,
  "id" | "parent_id" | "slug" | "title" | "summary" | "sort_order" | "body"
> & {
  published_at?: string | null;
};

const SUPPORT_ACTION_IDS: CourseSupportActionId[] = [
  "videoAnalysis",
  "poolsideGuide",
  "guide0To1000",
  "contact",
];

function isRecord(value: Json): value is Record<string, Json> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => getString(entry)).filter((entry): entry is string => Boolean(entry));
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizePositiveInteger(value: unknown): number | undefined {
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed >= 1) return parsed;
    return undefined;
  }
  const numeric = getNumber(value);
  if (typeof numeric !== "number") return undefined;
  const floored = Math.floor(numeric);
  return floored >= 1 ? floored : undefined;
}

function getBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function normalizeLessonType(value: unknown): CourseLesson["lessonType"] | undefined {
  const candidate = getString(value);
  if (!candidate) return undefined;
  if (candidate === "learn" || candidate === "drill" || candidate === "swim") {
    return candidate;
  }
  return undefined;
}

function normalizeDrill(value: unknown, fallback: CourseLesson["drill"]): CourseLesson["drill"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fallback;
  }

  const raw = value as Record<string, unknown>;
  const title = getString(raw.title) ?? fallback.title;
  const steps = getStringArray(raw.steps);

  return {
    title,
    steps: steps.length > 0 ? steps : fallback.steps,
  };
}

function normalizeLessonDisplay(value: unknown): CourseLesson["display"] | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const raw = value as Record<string, unknown>;
  const display: NonNullable<CourseLesson["display"]> = {};

  const goal = getBoolean(raw.goal);
  if (typeof goal === "boolean") display.goal = goal;

  const cues = getBoolean(raw.cues);
  if (typeof cues === "boolean") display.cues = cues;

  const commonMistakes = getBoolean(raw.commonMistakes);
  if (typeof commonMistakes === "boolean") display.commonMistakes = commonMistakes;

  const drill = getBoolean(raw.drill);
  if (typeof drill === "boolean") display.drill = drill;

  const checkpoint = getBoolean(raw.checkpoint);
  if (typeof checkpoint === "boolean") display.checkpoint = checkpoint;

  const nextStep = getBoolean(raw.nextStep);
  if (typeof nextStep === "boolean") display.nextStep = nextStep;

  const support = getBoolean(raw.support);
  if (typeof support === "boolean") display.support = support;

  return Object.keys(display).length > 0 ? display : undefined;
}

function normalizeSupportActionId(value: unknown): CourseSupportActionId | undefined {
  const candidate = getString(value);
  if (!candidate) return undefined;
  if (candidate === "videoAnalysis") return candidate;
  if (candidate === "poolsideGuide") return candidate;
  if (candidate === "guide0To1000") return candidate;
  if (candidate === "contact") return candidate;
  return undefined;
}

function normalizeSupportCard(value: unknown): CourseLesson["supportCard"] | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const raw = value as Record<string, unknown>;
  const rawActions =
    raw.actions && typeof raw.actions === "object" && !Array.isArray(raw.actions)
      ? (raw.actions as Record<string, unknown>)
      : null;
  const actions: Partial<Record<CourseSupportActionId, boolean>> = {};
  if (rawActions) {
    for (const actionId of SUPPORT_ACTION_IDS) {
      const maybeValue = getBoolean(rawActions[actionId]);
      if (typeof maybeValue === "boolean") {
        actions[actionId] = maybeValue;
      }
    }
  }

  const primaryAction = normalizeSupportActionId(raw.primaryAction);
  if (Object.keys(actions).length === 0 && !primaryAction) {
    return undefined;
  }
  return {
    actions: Object.keys(actions).length > 0 ? actions : undefined,
    primaryAction,
  };
}

export function toPublishedCourseModules(
  moduleRows: CourseModuleContentRow[],
  lessonRows: CourseLessonContentRow[],
  fallback: CourseModule[] = COURSE_MODULES
): CourseModule[] {
  if (moduleRows.length === 0 || lessonRows.length === 0) {
    return fallback;
  }

  const modules = moduleRows.map((row) => {
    const body = isRecord(row.body) ? row.body : {};
    const moduleId = resolveCourseModuleRuntimeId(body, row.slug);
    if (!moduleId) return null;
    const legacyIds = resolveCourseModuleRuntimeAliases(body, row.slug);
    const subtitle = getString(body.subtitle) ?? undefined;
    return {
      row,
      moduleId,
      module: {
        id: moduleId,
        legacyIds: legacyIds.length > 0 ? legacyIds : undefined,
        title: row.title,
        subtitle,
        publishedAt: row.published_at,
        lessons: [] as CourseLesson[],
      },
    };
  });

  const normalizedModuleEntries = modules.filter(
    (entry): entry is NonNullable<(typeof modules)[number]> => Boolean(entry)
  );

  const moduleById = new Map(
    normalizedModuleEntries.map((entry) => [entry.moduleId, entry.module])
  );
  const moduleIdByRowId = new Map(
    normalizedModuleEntries.map((entry) => [entry.row.id, entry.moduleId])
  );
  const fallbackLessonById = new Map<string, CourseLesson>();
  for (const fallbackModule of fallback) {
    for (const lesson of fallbackModule.lessons) {
      for (const id of [lesson.id, ...(lesson.legacyIds ?? [])]) {
        if (!fallbackLessonById.has(id)) {
          fallbackLessonById.set(id, lesson);
        }
      }
    }
  }
  const seenLessonIds = new Set<string>();

  for (const row of lessonRows) {
    const body = isRecord(row.body) ? row.body : {};
    const lessonId = resolveCourseLessonRuntimeId(body, row.slug);
    if (!lessonId) continue;
    if (seenLessonIds.has(lessonId)) continue;
    const legacyIds = resolveCourseLessonRuntimeAliases(body, row.slug);

    const moduleId = resolveCourseLessonModuleRuntimeId({
      body,
      lessonId,
      parentId: row.parent_id,
      moduleIdByRowId,
    });
    if (!moduleId) continue;

    const targetModule = moduleById.get(moduleId);
    if (!targetModule) continue;

    const fallbackLesson = fallbackLessonById.get(lessonId);
    const cues = getStringArray(body.cues);
    const commonMistakes = getStringArray(body.commonMistakes);
    const tags = getStringArray(body.tags);

    const safeFallbackDrill = {
      title: "Technique drill",
      steps: [row.summary || "Repeat calmly and keep your form."],
    };

    const lesson: CourseLesson = {
      id: lessonId,
      legacyIds: legacyIds.length > 0 ? legacyIds : undefined,
      title: row.title,
      publishedAt: row.published_at,
      youtubeId: getString(body.youtubeId) ?? "Xh6OblO06LY",
      estMinutes: getNumber(body.estMinutes),
      lessonType: normalizeLessonType(body.lessonType),
      drillLabel: getString(body.drillLabel) ?? undefined,
      supportStartAtLessonInModule: normalizePositiveInteger(body.supportStartAtLessonInModule),
      supportCard: normalizeSupportCard(body.supportCard),
      passCriteria: getStringArray(body.passCriteria).length
        ? getStringArray(body.passCriteria)
        : undefined,
      display: normalizeLessonDisplay(body.display),
      lessonExperience:
        normalizeCourseLessonExperienceInput(body.lessonExperience) ??
        fallbackLesson?.lessonExperience,
      goal: getString(body.goal) ?? row.summary ?? "Refine your freestyle.",
      cues: cues.length > 0 ? cues : ["Swim relaxed and controlled."],
      commonMistakes:
        commonMistakes.length > 0 ? commonMistakes : (fallbackLesson?.commonMistakes ?? []),
      drill: normalizeDrill(body.drill, safeFallbackDrill),
      nextStep: getString(body.nextStep) ?? "Continue to the next lesson.",
      tags: tags.length > 0 ? tags : undefined,
    };
    const resolvedLessonExperience = resolveCourseLessonExperience(lesson);
    if (resolvedLessonExperience) {
      lesson.lessonExperience = resolvedLessonExperience;
    } else {
      delete lesson.lessonExperience;
    }

    targetModule.lessons.push(lesson);
    seenLessonIds.add(lessonId);
  }

  const normalizedModules = normalizedModuleEntries
    .map((entry) => entry.module)
    .filter((courseModule) => courseModule.lessons.length > 0);

  if (normalizedModules.length === 0) {
    return fallback;
  }

  return normalizedModules;
}

type LoadCourseModulesByStatusInput = {
  statuses: CourseContentReadStatus[];
  fallback: CourseModule[];
  autoSeedWhenEmpty: boolean;
};

function normalizeReadStatuses(
  statuses: readonly CourseContentReadStatus[]
): CourseContentReadStatus[] {
  const unique = new Set<CourseContentReadStatus>();
  for (const status of statuses) {
    if (
      status === "draft" ||
      status === "review" ||
      status === "published" ||
      status === "archived"
    ) {
      unique.add(status);
    }
  }

  if (unique.size === 0) {
    return ["published"];
  }

  return Array.from(unique);
}

export async function loadCourseModulesByStatus(
  input: LoadCourseModulesByStatusInput
): Promise<CourseModule[]> {
  const statuses = normalizeReadStatuses(input.statuses);

  try {
    const supabase = createAdminSupabaseClient();

    const readRows = async () => {
      const modulesQuery = supabase
        .from("admin_content_items")
        .select("id, slug, title, summary, sort_order, body, published_at, created_at")
        .eq("content_type", "course_module")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (statuses.length === 1) {
        modulesQuery.eq("status", statuses[0]);
      } else {
        modulesQuery.in("status", statuses);
      }
      const modulesResult = await modulesQuery;

      if (modulesResult.error) {
        return {
          ok: false as const,
          error: modulesResult.error,
          modules: [] as CourseModuleContentRow[],
          lessons: [] as CourseLessonContentRow[],
        };
      }

      const lessonsQuery = supabase
        .from("admin_content_items")
        .select("id, parent_id, slug, title, summary, sort_order, body, published_at, created_at")
        .eq("content_type", "course_lesson")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (statuses.length === 1) {
        lessonsQuery.eq("status", statuses[0]);
      } else {
        lessonsQuery.in("status", statuses);
      }
      const lessonsResult = await lessonsQuery;

      if (lessonsResult.error) {
        return {
          ok: false as const,
          error: lessonsResult.error,
          modules: [] as CourseModuleContentRow[],
          lessons: [] as CourseLessonContentRow[],
        };
      }

      return {
        ok: true as const,
        modules: (modulesResult.data ?? []) as CourseModuleContentRow[],
        lessons: (lessonsResult.data ?? []) as CourseLessonContentRow[],
      };
    };

    let readResult = await readRows();
    if (!readResult.ok) {
      if (!isAdminContentSchemaMissing(readResult.error)) {
        console.error(
          "[PublishedContent] Could not load published course content rows",
          readResult.error
        );
      }
      return input.fallback;
    }

    if (
      input.autoSeedWhenEmpty &&
      (readResult.modules.length === 0 || readResult.lessons.length === 0)
    ) {
      const ensureResult = await ensurePlatformContentSeeded({ supabase });
      if (!ensureResult.ok) {
        if (ensureResult.schemaReady) {
          console.error(
            "[PublishedContent] Could not auto-seed course baseline",
            ensureResult.error
          );
        }
        return input.fallback;
      }
      if (ensureResult.seeded) {
        readResult = await readRows();
        if (!readResult.ok) {
          if (!isAdminContentSchemaMissing(readResult.error)) {
            console.error(
              "[PublishedContent] Could not reload course content after seeding",
              readResult.error
            );
          }
          return input.fallback;
        }
      }
    }

    const publishedModules = toPublishedCourseModules(readResult.modules, readResult.lessons, []);
    return publishedModules.length > 0 ? publishedModules : input.fallback;
  } catch (error) {
    console.error("[PublishedContent] Could not query published course content", error);
    return input.fallback;
  }
}

export const loadPublishedCourseModulesCached = unstable_cache(
  async () =>
    loadCourseModulesByStatus({
      statuses: ["published"],
      fallback: COURSE_MODULES,
      autoSeedWhenEmpty: true,
    }),
  ["published-course-modules-v4"],
  {
    revalidate: PUBLIC_COURSE_CONTENT_REVALIDATE_SECONDS,
    tags: ["published-course-content"],
  }
);

export async function loadPublishedCourseModules(): Promise<CourseModule[]> {
  return loadPublishedCourseModulesCached();
}
