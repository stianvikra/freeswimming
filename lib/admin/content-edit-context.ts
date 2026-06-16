import { COURSE_MODULES } from "@/app/course/courseData";
import type { AdminContentItemRow } from "@/lib/admin/content";
import { buildCourseLessonHref } from "@/lib/course/canonical-routes";
import {
  getAdminPageContextLabel,
  normalizeAdminPageContextRef,
} from "@/lib/admin/page-note-context";
import {
  resolveCourseLessonRuntimeId,
  resolveCourseModuleRuntimeId,
} from "@/lib/course/runtime-identity";
import {
  resolveGuideDrillRuntimeId,
  resolveGuideSessionRuntimeId,
} from "@/lib/guides/runtime-identity";

export type AdminContentEditNotesContext = {
  contextType:
    | "course_module"
    | "course_lesson"
    | "guide_session"
    | "guide_drill"
    | "page"
    | "product";
  contextRef: string;
  contextLabel: string;
  includeModuleContextForCourseLesson?: boolean;
};

export type AdminContentEditQrContext = {
  contentItemId: string;
  contentLabel: string;
  slugHint?: string | null;
  destinationPath?: string | null;
  placementKey?: string | null;
  destinationHelpText?: string | null;
};

export function pageRoutePathForAdminContentItem(item: AdminContentItemRow): string {
  return normalizeAdminPageContextRef(`/${item.slug}`);
}

export function resolveAdminContentEditNotesContext(
  item: AdminContentItemRow
): AdminContentEditNotesContext | null {
  if (item.content_type === "course_module") {
    const moduleId = resolveCourseModuleRuntimeId(item.body, item.slug) ?? item.slug.trim();
    return {
      contextType: "course_module",
      contextRef: moduleId,
      contextLabel: `Module: ${item.title} (${moduleId})`,
    };
  }

  if (item.content_type === "course_lesson") {
    const lessonId = resolveCourseLessonRuntimeId(item.body, item.slug) ?? item.slug.trim();
    return {
      contextType: "course_lesson",
      contextRef: lessonId,
      contextLabel: `Lesson: ${item.title} (${lessonId})`,
      includeModuleContextForCourseLesson: true,
    };
  }

  if (item.content_type === "guide_session") {
    const sessionId =
      resolveGuideSessionRuntimeId(item.body, item.slug).runtimeId ?? item.slug.trim();
    return {
      contextType: "guide_session",
      contextRef: sessionId,
      contextLabel: `Guide session: ${item.title} (${sessionId})`,
    };
  }

  if (item.content_type === "guide_drill") {
    const drillId = resolveGuideDrillRuntimeId(item.body, item.slug).runtimeId ?? item.slug.trim();
    return {
      contextType: "guide_drill",
      contextRef: drillId,
      contextLabel: `Guide drill: ${item.title} (${drillId})`,
    };
  }

  if (item.content_type === "page") {
    const routePath = pageRoutePathForAdminContentItem(item);
    return {
      contextType: "page",
      contextRef: routePath,
      contextLabel: getAdminPageContextLabel(routePath),
    };
  }

  if (item.content_type === "product") {
    return {
      contextType: "product",
      contextRef: item.slug,
      contextLabel: `Product: ${item.title} (${item.slug})`,
    };
  }

  return null;
}

export function resolveAdminContentEditQrContext(
  item: AdminContentItemRow
): AdminContentEditQrContext | null {
  if (item.content_type === "course_lesson") {
    const lessonId = resolveCourseLessonRuntimeId(item.body, item.slug) ?? item.slug.trim();
    return {
      contentItemId: item.id,
      contentLabel: item.title,
      slugHint: lessonId,
      destinationPath: buildCourseLessonHref(COURSE_MODULES, lessonId),
      placementKey: "course.lesson.share",
    };
  }

  if (item.content_type === "page") {
    const routePath = pageRoutePathForAdminContentItem(item);
    return {
      contentItemId: item.id,
      contentLabel: item.title,
      slugHint: item.slug,
      destinationPath: routePath,
      placementKey: "page.share",
    };
  }

  if (item.content_type === "product") {
    return {
      contentItemId: item.id,
      contentLabel: item.title,
      slugHint: item.slug,
      placementKey: "product.share",
      destinationHelpText:
        "Set the intended landing page for this product QR before creating it. Use a stable Freeswimming page or another allowlisted HTTPS destination.",
    };
  }

  return null;
}
