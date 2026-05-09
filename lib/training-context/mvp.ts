import type { Database } from "@/types/database";

export const TRAINING_FOCUS_STATUS_VALUES = ["open", "completed", "archived"] as const;
export const TRAINING_NOTE_TYPE_VALUES = ["observation", "question"] as const;
export const TRAINING_NOTE_STATUS_VALUES = [
  "open",
  "actioned",
  "no_action_needed",
  "unanswered",
  "answered",
  "no_answer_needed",
] as const;
export const TRAINING_CONTEXT_TYPE_VALUES = [
  "course_lesson",
  "course_module",
  "guide_drill",
  "guide_session",
  "workout_session",
  "program",
] as const;
export const TRAINING_NOTES_PAGE_SIZE = 12;
export const TRAINING_FOCUS_HISTORY_SIZE = 6;

export type TrainingFocusStatus = (typeof TRAINING_FOCUS_STATUS_VALUES)[number];
export type TrainingNoteType = (typeof TRAINING_NOTE_TYPE_VALUES)[number];
export type TrainingNoteStatus = (typeof TRAINING_NOTE_STATUS_VALUES)[number];
export type TrainingContextType = (typeof TRAINING_CONTEXT_TYPE_VALUES)[number];

export type TrainingFocusRow = Database["public"]["Tables"]["training_focuses"]["Row"];
export type TrainingFocusInsert = Database["public"]["Tables"]["training_focuses"]["Insert"];
export type TrainingFocusUpdate = Database["public"]["Tables"]["training_focuses"]["Update"];
export type TrainingNoteRow = Omit<
  Database["public"]["Tables"]["training_notes"]["Row"],
  "note_type" | "status"
> & {
  note_type: TrainingNoteType;
  status: TrainingNoteStatus;
};
export type TrainingNoteInsert = Database["public"]["Tables"]["training_notes"]["Insert"];
export type TrainingNoteUpdate = Database["public"]["Tables"]["training_notes"]["Update"];

type FocusInsertInput = {
  title?: string | null;
  details?: string | null;
  goalId?: string | null;
  contextType?: string | null;
  contextRef?: string | null;
};

type FocusUpdateInput = {
  title?: string | null;
  details?: string | null;
  goalId?: string | null;
};

type NoteInsertInput = {
  noteType?: string | null;
  body?: string | null;
  goalId?: string | null;
  focusId?: string | null;
  contextType?: string | null;
  contextRef?: string | null;
};

export type TrainingGoalOption = {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
};

function normalizeText(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

export function normalizeNullableText(value: string | null | undefined): string | null {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : null;
}

export function normalizeNullableId(value: string | null | undefined): string | null {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : null;
}

export function normalizeTrainingContextType(
  value: string | null | undefined
): TrainingContextType | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  return TRAINING_CONTEXT_TYPE_VALUES.find((item) => item === normalized) ?? null;
}

export function normalizeTrainingContextRef(value: string | null | undefined): string | null {
  return normalizeNullableText(value);
}

export function normalizeTrainingNoteType(
  value: string | null | undefined
): TrainingNoteType | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  return TRAINING_NOTE_TYPE_VALUES.find((item) => item === normalized) ?? null;
}

export function normalizeTrainingFocusStatus(
  value: string | null | undefined
): TrainingFocusStatus | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  if (normalized === "active") return "open";
  return TRAINING_FOCUS_STATUS_VALUES.find((item) => item === normalized) ?? null;
}

export function normalizeTrainingNoteStatus(
  value: string | null | undefined
): TrainingNoteStatus | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  return TRAINING_NOTE_STATUS_VALUES.find((item) => item === normalized) ?? null;
}

export function getDefaultTrainingNoteStatus(noteType: TrainingNoteType): TrainingNoteStatus {
  return noteType === "question" ? "unanswered" : "open";
}

export function isTrainingFocusTerminalStatus(status: TrainingFocusStatus): boolean {
  return status === "completed" || status === "archived";
}

export function isTrainingNoteResolvedStatus(status: TrainingNoteStatus): boolean {
  return (
    status === "actioned" ||
    status === "no_action_needed" ||
    status === "answered" ||
    status === "no_answer_needed"
  );
}

export function getTrainingFocusStatusLabel(status: TrainingFocusStatus): string {
  if (status === "completed") return "Completed";
  if (status === "archived") return "Archived";
  return "Open";
}

export function getTrainingNoteTypeLabel(noteType: TrainingNoteType): string {
  return noteType === "question" ? "Question" : "Observation";
}

export function getTrainingNoteStatusLabel(status: TrainingNoteStatus): string {
  switch (status) {
    case "actioned":
      return "Actioned";
    case "no_action_needed":
      return "No action needed";
    case "answered":
      return "Answered";
    case "no_answer_needed":
      return "No answer needed";
    case "unanswered":
      return "Unanswered";
    case "open":
    default:
      return "Open";
  }
}

export function buildTrainingFocusInsert(
  input: FocusInsertInput
): Omit<TrainingFocusInsert, "user_id"> | null {
  const title = normalizeText(input.title);
  if (title.length < 3 || title.length > 140) return null;

  const details = normalizeNullableText(input.details);
  const contextType = normalizeTrainingContextType(input.contextType);
  const contextRef = normalizeTrainingContextRef(input.contextRef);
  if ((contextType && !contextRef) || (!contextType && contextRef)) return null;

  return {
    title,
    details,
    goal_id: normalizeNullableId(input.goalId),
    context_type: contextType,
    context_ref: contextRef,
    status: "open",
    is_primary: false,
    completed_at: null,
    archived_at: null,
  };
}

export function buildTrainingFocusUpdate(
  input: FocusUpdateInput
): Pick<TrainingFocusUpdate, "title" | "details" | "goal_id"> | null {
  const title = normalizeText(input.title);
  if (title.length < 3 || title.length > 140) return null;

  return {
    title,
    details: normalizeNullableText(input.details),
    goal_id: normalizeNullableId(input.goalId),
  };
}

export function isValidTrainingNoteState(
  noteType: TrainingNoteType,
  status: TrainingNoteStatus,
  answer: string | null
): boolean {
  const normalizedAnswer = normalizeNullableText(answer);

  if (noteType === "observation") {
    return (
      (status === "open" || status === "actioned" || status === "no_action_needed") &&
      normalizedAnswer === null
    );
  }

  if (status === "unanswered") return normalizedAnswer === null;
  if (status === "answered") return normalizedAnswer !== null;
  if (status === "no_answer_needed") return normalizedAnswer === null;
  return false;
}

export function buildTrainingNoteInsert(
  input: NoteInsertInput
): Omit<TrainingNoteInsert, "user_id"> | null {
  const noteType = normalizeTrainingNoteType(input.noteType);
  if (!noteType) return null;

  const body = normalizeText(input.body);
  if (body.length < 3 || body.length > 2000) return null;

  const contextType = normalizeTrainingContextType(input.contextType);
  const contextRef = normalizeTrainingContextRef(input.contextRef);
  if ((contextType && !contextRef) || (!contextType && contextRef)) return null;

  const status = getDefaultTrainingNoteStatus(noteType);
  if (!isValidTrainingNoteState(noteType, status, null)) return null;

  return {
    note_type: noteType,
    status,
    body,
    answer: null,
    goal_id: normalizeNullableId(input.goalId),
    focus_id: normalizeNullableId(input.focusId),
    context_type: contextType,
    context_ref: contextRef,
    resolved_at: null,
  };
}

export function resolveTrainingNoteResolvedAt(
  status: TrainingNoteStatus,
  nowIso: string
): string | null {
  return isTrainingNoteResolvedStatus(status) ? nowIso : null;
}
