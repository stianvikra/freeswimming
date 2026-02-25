import { COURSE_MODULES, type CourseLesson, type CourseModule } from "@/app/course/courseData";
import { ensurePlatformContentSeeded } from "@/lib/admin/content-import-apply";
import { isAdminContentSchemaMissing } from "@/lib/admin/schema";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/types/database";

type AdminContentRow = Database["public"]["Tables"]["admin_content_items"]["Row"];

type PublishedCourseModuleRow = Pick<
  AdminContentRow,
  "id" | "slug" | "title" | "summary" | "sort_order" | "body"
>;
type PublishedCourseLessonRow = Pick<
  AdminContentRow,
  "id" | "parent_id" | "slug" | "title" | "summary" | "sort_order" | "body"
>;

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

function getBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function inferModuleId(slug: string): string {
  const match = slug.match(/course-module-(.+)$/i);
  if (match?.[1]) return match[1];
  return slug;
}

function inferLessonId(slug: string): string {
  const match = slug.match(/course-lesson-(.+)$/i);
  if (match?.[1]) return match[1];
  return slug;
}

function inferModuleIdFromLessonId(lessonId: string): string | null {
  const normalized = lessonId.trim();
  if (!normalized) return null;
  const [moduleId] = normalized.split("-l");
  return moduleId?.trim().length ? moduleId.trim() : null;
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

  const cues = getBoolean(raw.cues);
  if (typeof cues === "boolean") display.cues = cues;

  const commonMistakes = getBoolean(raw.commonMistakes);
  if (typeof commonMistakes === "boolean") display.commonMistakes = commonMistakes;

  const checkpoint = getBoolean(raw.checkpoint);
  if (typeof checkpoint === "boolean") display.checkpoint = checkpoint;

  const nextStep = getBoolean(raw.nextStep);
  if (typeof nextStep === "boolean") display.nextStep = nextStep;

  return Object.keys(display).length > 0 ? display : undefined;
}

export function toPublishedCourseModules(
  moduleRows: PublishedCourseModuleRow[],
  lessonRows: PublishedCourseLessonRow[],
  fallback: CourseModule[] = COURSE_MODULES
): CourseModule[] {
  if (moduleRows.length === 0 || lessonRows.length === 0) {
    return fallback;
  }

  const modules = moduleRows.map((row) => {
    const body = isRecord(row.body) ? row.body : {};
    const moduleId = getString(body.moduleId) ?? inferModuleId(row.slug);
    const subtitle = getString(body.subtitle) ?? undefined;
    return {
      row,
      moduleId,
      module: {
        id: moduleId,
        title: row.title,
        subtitle,
        lessons: [] as CourseLesson[],
      },
    };
  });

  const moduleById = new Map(modules.map((entry) => [entry.moduleId, entry.module]));
  const moduleIdByRowId = new Map(modules.map((entry) => [entry.row.id, entry.moduleId]));
  const seenLessonIds = new Set<string>();

  for (const row of lessonRows) {
    const body = isRecord(row.body) ? row.body : {};
    const lessonId = getString(body.lessonId) ?? inferLessonId(row.slug);
    if (seenLessonIds.has(lessonId)) continue;

    const moduleIdFromParent = row.parent_id ? moduleIdByRowId.get(row.parent_id) : undefined;
    const moduleId =
      moduleIdFromParent ?? getString(body.moduleId) ?? inferModuleIdFromLessonId(lessonId) ?? null;
    if (!moduleId) continue;

    const targetModule = moduleById.get(moduleId);
    if (!targetModule) continue;

    const cues = getStringArray(body.cues);
    const commonMistakes = getStringArray(body.commonMistakes);
    const tags = getStringArray(body.tags);

    const safeFallbackDrill = {
      title: "Technique drill",
      steps: [row.summary || "Repeat calmly and keep your form."],
    };

    const lesson: CourseLesson = {
      id: lessonId,
      title: row.title,
      youtubeId: getString(body.youtubeId) ?? "Xh6OblO06LY",
      estMinutes: getNumber(body.estMinutes),
      lessonType: normalizeLessonType(body.lessonType),
      passCriteria: getStringArray(body.passCriteria).length
        ? getStringArray(body.passCriteria)
        : undefined,
      display: normalizeLessonDisplay(body.display),
      goal: getString(body.goal) ?? row.summary ?? "Refine your freestyle.",
      cues: cues.length > 0 ? cues : ["Swim relaxed and controlled."],
      commonMistakes: commonMistakes.length > 0 ? commonMistakes : [],
      drill: normalizeDrill(body.drill, safeFallbackDrill),
      nextStep: getString(body.nextStep) ?? "Continue to the next lesson.",
      tags: tags.length > 0 ? tags : undefined,
    };

    targetModule.lessons.push(lesson);
    seenLessonIds.add(lessonId);
  }

  const normalizedModules = modules
    .map((entry) => entry.module)
    .filter((courseModule) => courseModule.lessons.length > 0);

  if (normalizedModules.length === 0) {
    return fallback;
  }

  return normalizedModules;
}

export async function loadPublishedCourseModules(): Promise<CourseModule[]> {
  try {
    const supabase = createAdminSupabaseClient();

    const readRows = async () => {
      const modulesResult = await supabase
        .from("admin_content_items")
        .select("id, slug, title, summary, sort_order, body, created_at")
        .eq("content_type", "course_module")
        .eq("status", "published")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (modulesResult.error) {
        return {
          ok: false as const,
          error: modulesResult.error,
          modules: [] as PublishedCourseModuleRow[],
          lessons: [] as PublishedCourseLessonRow[],
        };
      }

      const lessonsResult = await supabase
        .from("admin_content_items")
        .select("id, parent_id, slug, title, summary, sort_order, body, created_at")
        .eq("content_type", "course_lesson")
        .eq("status", "published")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (lessonsResult.error) {
        return {
          ok: false as const,
          error: lessonsResult.error,
          modules: [] as PublishedCourseModuleRow[],
          lessons: [] as PublishedCourseLessonRow[],
        };
      }

      return {
        ok: true as const,
        modules: (modulesResult.data ?? []) as PublishedCourseModuleRow[],
        lessons: (lessonsResult.data ?? []) as PublishedCourseLessonRow[],
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
      return COURSE_MODULES;
    }

    if (readResult.modules.length === 0 || readResult.lessons.length === 0) {
      const ensureResult = await ensurePlatformContentSeeded({ supabase });
      if (!ensureResult.ok) {
        if (ensureResult.schemaReady) {
          console.error(
            "[PublishedContent] Could not auto-seed course baseline",
            ensureResult.error
          );
        }
        return COURSE_MODULES;
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
          return COURSE_MODULES;
        }
      }
    }

    const publishedModules = toPublishedCourseModules(readResult.modules, readResult.lessons, []);
    return publishedModules.length > 0 ? publishedModules : COURSE_MODULES;
  } catch (error) {
    console.error("[PublishedContent] Could not query published course content", error);
    return COURSE_MODULES;
  }
}
