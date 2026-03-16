import { inferCourseModuleRuntimeIdFromLessonRuntimeId } from "@/lib/course/runtime-identity";
import {
  resolveCanonicalCourseLessonRuntimeId,
  resolveCanonicalCourseModuleRuntimeId,
  resolveCanonicalCourseModuleRuntimeIdFromLesson,
  resolveCourseLessonRuntimeLookupIds,
  resolveCourseModuleRuntimeLookupIds,
} from "@/lib/course/runtime-id-manifest";
import {
  resolveGuideDrillRuntimeId,
  resolveGuideSessionRuntimeId,
} from "@/lib/guides/runtime-identity";

export const ADMIN_NOTE_CONTEXT_TYPE_VALUES = [
  "course_module",
  "course_lesson",
  "guide_session",
  "guide_drill",
  "product",
  "page",
] as const;

export type AdminNoteContextType = (typeof ADMIN_NOTE_CONTEXT_TYPE_VALUES)[number];

export type AdminNoteContext = {
  contextType: AdminNoteContextType;
  contextRef: string;
};

type ParseContextResult =
  | {
      ok: true;
      value: AdminNoteContext | null;
    }
  | {
      ok: false;
      error: string;
    };

export function isAdminNoteContextType(value: string): value is AdminNoteContextType {
  return ADMIN_NOTE_CONTEXT_TYPE_VALUES.includes(value as AdminNoteContextType);
}

function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeContextRef(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export function deriveCourseModuleRefFromLessonRef(lessonRef: string): string {
  const normalized = normalizeContextRef(lessonRef);
  if (!normalized) return "";
  const canonicalLessonRef = resolveCanonicalCourseLessonRuntimeId(normalized) ?? normalized;
  return normalizeContextRef(
    resolveCanonicalCourseModuleRuntimeIdFromLesson(canonicalLessonRef) ??
      inferCourseModuleRuntimeIdFromLessonRuntimeId(canonicalLessonRef) ??
      canonicalLessonRef
  );
}

export function canonicalizeAdminNoteContext(
  context: AdminNoteContext | null
): AdminNoteContext | null {
  if (!context) return null;

  if (context.contextType === "course_module") {
    return {
      ...context,
      contextRef: normalizeContextRef(
        resolveCanonicalCourseModuleRuntimeId(context.contextRef) ?? context.contextRef
      ),
    };
  }

  if (context.contextType === "course_lesson") {
    return {
      ...context,
      contextRef: normalizeContextRef(
        resolveCanonicalCourseLessonRuntimeId(context.contextRef) ?? context.contextRef
      ),
    };
  }

  if (context.contextType === "guide_session") {
    return {
      ...context,
      contextRef: normalizeContextRef(
        resolveGuideSessionRuntimeId({ sessionId: context.contextRef }, context.contextRef)
          .runtimeId ?? context.contextRef
      ),
    };
  }

  if (context.contextType === "guide_drill") {
    return {
      ...context,
      contextRef: normalizeContextRef(
        resolveGuideDrillRuntimeId({ drillId: context.contextRef }, context.contextRef).runtimeId ??
          context.contextRef
      ),
    };
  }

  return context;
}

export function resolveAdminNoteContextLookupRefs(params: {
  contextType: AdminNoteContextType;
  contextRef: string;
}): string[] {
  if (params.contextType === "course_module") {
    return resolveCourseModuleRuntimeLookupIds(params.contextRef).map((value) =>
      normalizeContextRef(value)
    );
  }

  if (params.contextType === "course_lesson") {
    return resolveCourseLessonRuntimeLookupIds(params.contextRef).map((value) =>
      normalizeContextRef(value)
    );
  }

  if (params.contextType === "guide_session") {
    const canonicalRef = normalizeContextRef(
      resolveGuideSessionRuntimeId({ sessionId: params.contextRef }, params.contextRef).runtimeId ??
        params.contextRef
    );
    const originalRef = normalizeContextRef(params.contextRef);
    return canonicalRef === originalRef ? [canonicalRef] : [canonicalRef, originalRef];
  }

  if (params.contextType === "guide_drill") {
    const canonicalRef = normalizeContextRef(
      resolveGuideDrillRuntimeId({ drillId: params.contextRef }, params.contextRef).runtimeId ??
        params.contextRef
    );
    const originalRef = normalizeContextRef(params.contextRef);
    return canonicalRef === originalRef ? [canonicalRef] : [canonicalRef, originalRef];
  }

  return [normalizeContextRef(params.contextRef)];
}

export function parseAdminNoteContextInput(input: {
  contextType?: unknown;
  contextRef?: unknown;
}): ParseContextResult {
  const rawType = normalizeText(input.contextType);
  const rawRef = normalizeText(input.contextRef);

  if (!rawType && !rawRef) {
    return {
      ok: true,
      value: null,
    };
  }

  if (!rawType || !rawRef) {
    return {
      ok: false,
      error: "Context type and reference must both be set, or both be empty.",
    };
  }

  const normalizedType = rawType.toLowerCase();
  if (!isAdminNoteContextType(normalizedType)) {
    return {
      ok: false,
      error: "Context type is invalid.",
    };
  }

  const contextRef = normalizeContextRef(rawRef);
  if (contextRef.length < 2 || contextRef.length > 160) {
    return {
      ok: false,
      error: "Context reference must be between 2 and 160 characters.",
    };
  }

  return {
    ok: true,
    value: {
      contextType: normalizedType,
      contextRef,
    },
  };
}

export function formatAdminNoteContextLabel(context: {
  contextType: string | null | undefined;
  contextRef: string | null | undefined;
}): string | null {
  if (!context.contextType || !context.contextRef) return null;

  const typeLabel = context.contextType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return `${typeLabel}: ${context.contextRef}`;
}
