import { COURSE_MODULES } from "@/app/course/courseData";
import type { AdminContentStatus, AdminContentType } from "@/lib/admin/content";
import {
  GUIDE_0_TO_1000M_SESSIONS,
  GUIDE_0_TO_1000M_SLUG,
  type Guide0To1000Session,
} from "@/lib/guides/guide-0-1000m";
import {
  GUIDE_POOLSIDE_DRILLS,
  GUIDE_POOLSIDE_SLUG,
  type PoolsideDrill,
} from "@/lib/guides/guide-poolside";

export type PlatformContentSeedItem = {
  contentType: AdminContentType;
  slug: string;
  title: string;
  summary: string;
  category: string;
  body: Record<string, unknown>;
  sortOrder: number;
  status: AdminContentStatus;
  parentSlug: string | null;
};

export type PlatformContentSeedSummary = {
  totalItems: number;
  courseModules: number;
  courseLessons: number;
  guideSessions: number;
  guideDrills: number;
};

const IMPORT_STATUS: AdminContentStatus = "published";

function capSummary(value: string): string {
  return value.trim().slice(0, 500);
}

function moduleSlug(moduleId: string): string {
  return `course-module-${moduleId.toLowerCase()}`;
}

function lessonSlug(lessonId: string): string {
  return `course-lesson-${lessonId.toLowerCase()}`;
}

function sessionSlug(sessionId: string): string {
  return `guide-${GUIDE_0_TO_1000M_SLUG}-session-${sessionId.toLowerCase()}`;
}

function drillSlug(drillId: string): string {
  return `guide-${GUIDE_POOLSIDE_SLUG}-drill-${drillId.toLowerCase()}`;
}

function toModuleSeedItems(): PlatformContentSeedItem[] {
  return COURSE_MODULES.map((module, index) => ({
    contentType: "course_module",
    slug: moduleSlug(module.id),
    title: module.title,
    summary: capSummary(module.subtitle || `${module.lessons.length} lessons`),
    category: "Course modules",
    body: {
      moduleId: module.id,
      subtitle: module.subtitle ?? "",
      moduleIndex: index + 1,
      lessonCount: module.lessons.length,
    },
    sortOrder: index,
    status: IMPORT_STATUS,
    parentSlug: null,
  }));
}

function toLessonSeedItems(): PlatformContentSeedItem[] {
  const items: PlatformContentSeedItem[] = [];

  COURSE_MODULES.forEach((module, moduleIndex) => {
    const parent = moduleSlug(module.id);
    module.lessons.forEach((lesson, lessonIndex) => {
      items.push({
        contentType: "course_lesson",
        slug: lessonSlug(lesson.id),
        title: lesson.title,
        summary: capSummary(lesson.goal),
        category: "Course lessons",
        body: {
          moduleId: module.id,
          moduleTitle: module.title,
          moduleIndex: moduleIndex + 1,
          lessonId: lesson.id,
          youtubeId: lesson.youtubeId,
          estMinutes: lesson.estMinutes ?? null,
          lessonType: lesson.lessonType ?? null,
          goal: lesson.goal,
          cues: lesson.cues,
          commonMistakes: lesson.commonMistakes ?? [],
          drill: lesson.drill,
          nextStep: lesson.nextStep,
          tags: lesson.tags ?? [],
        },
        sortOrder: lessonIndex,
        status: IMPORT_STATUS,
        parentSlug: parent,
      });
    });
  });

  return items;
}

function toGuideSessionSeedItem(session: Guide0To1000Session): PlatformContentSeedItem {
  return {
    contentType: "guide_session",
    slug: sessionSlug(session.id),
    title: session.title,
    summary: capSummary(session.focus),
    category: "Guide sessions",
    body: {
      guideSlug: GUIDE_0_TO_1000M_SLUG,
      sessionId: session.id,
      weekNumber: session.weekNumber,
      targetSet: session.targetSet,
      focus: session.focus,
    },
    sortOrder: Number.parseInt(session.id.replace(/[^0-9]/g, ""), 10) - 1,
    status: IMPORT_STATUS,
    parentSlug: null,
  };
}

function toGuideDrillSeedItem(drill: PoolsideDrill): PlatformContentSeedItem {
  return {
    contentType: "guide_drill",
    slug: drillSlug(drill.id),
    title: drill.title,
    summary: capSummary(drill.summary),
    category: "Guide drills",
    body: {
      guideSlug: GUIDE_POOLSIDE_SLUG,
      drillId: drill.id,
      setup: drill.setup,
      keyFocus: drill.keyFocus,
      visualAssetPath: drill.visualAssetPath,
      visualAlt: drill.visualAlt,
    },
    sortOrder: Number.parseInt(drill.id.replace(/[^0-9]/g, ""), 10) - 1,
    status: IMPORT_STATUS,
    parentSlug: null,
  };
}

export function buildPlatformContentSeedItems(): {
  items: PlatformContentSeedItem[];
  summary: PlatformContentSeedSummary;
} {
  const modules = toModuleSeedItems();
  const lessons = toLessonSeedItems();
  const sessions = GUIDE_0_TO_1000M_SESSIONS.map(toGuideSessionSeedItem);
  const drills = GUIDE_POOLSIDE_DRILLS.map(toGuideDrillSeedItem);
  const items = [...modules, ...lessons, ...sessions, ...drills];

  return {
    items,
    summary: {
      totalItems: items.length,
      courseModules: modules.length,
      courseLessons: lessons.length,
      guideSessions: sessions.length,
      guideDrills: drills.length,
    },
  };
}
