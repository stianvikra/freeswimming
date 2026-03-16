import { inferCourseModuleRuntimeIdFromLessonRuntimeId } from "@/lib/course/runtime-identity";

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
  return normalizeContextRef(
    inferCourseModuleRuntimeIdFromLessonRuntimeId(normalized) ?? normalized
  );
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
