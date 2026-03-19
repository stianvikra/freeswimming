import type { SupabaseClient } from "@supabase/supabase-js";
import { loadGoalViews } from "@/lib/goals/server";
import {
  getTrainingFocusStatusLabel,
  getTrainingNoteStatusLabel,
  getTrainingNoteTypeLabel,
  isTrainingNoteResolvedStatus,
  TRAINING_FOCUS_HISTORY_SIZE,
  TRAINING_NOTES_PAGE_SIZE,
  type TrainingContextType,
  type TrainingFocusRow,
  type TrainingGoalOption,
  type TrainingNoteRow,
} from "@/lib/training-context/mvp";
import { isTrainingContextSchemaMissing } from "@/lib/training-context/schema";
import type { Database } from "@/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

const TRAINING_FOCUS_SELECT = `
  id,
  user_id,
  goal_id,
  title,
  details,
  status,
  context_type,
  context_ref,
  completed_at,
  archived_at,
  created_at,
  updated_at
`;

const TRAINING_NOTE_SELECT = `
  id,
  user_id,
  goal_id,
  focus_id,
  note_type,
  status,
  body,
  answer,
  context_type,
  context_ref,
  resolved_at,
  created_at,
  updated_at
`;

export type TrainingFocusView = {
  id: string;
  title: string;
  details: string | null;
  status: TrainingFocusRow["status"];
  statusLabel: string;
  goalId: string | null;
  goalTitle: string | null;
  contextType: TrainingContextType | null;
  contextRef: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  archivedAt: string | null;
};

export type TrainingNoteView = {
  id: string;
  noteType: TrainingNoteRow["note_type"];
  noteTypeLabel: string;
  status: TrainingNoteRow["status"];
  statusLabel: string;
  body: string;
  answer: string | null;
  goalId: string | null;
  goalTitle: string | null;
  focusId: string | null;
  focusTitle: string | null;
  contextType: TrainingContextType | null;
  contextRef: string | null;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

export type TrainingContextSnapshot = {
  schemaReady: boolean;
  loadError: string | null;
  activeFocus: TrainingFocusView | null;
  focusHistory: TrainingFocusView[];
  recentNotes: TrainingNoteView[];
  unresolvedObservationCount: number;
  unansweredQuestionCount: number;
  goalOptions: TrainingGoalOption[];
};

function asTrainingContextType(value: string | null | undefined): TrainingContextType | null {
  if (!value) return null;
  return isTrainingContextType(value) ? value : null;
}

function buildFocusView(
  row: TrainingFocusRow,
  goalTitleById: Map<string, string>
): TrainingFocusView {
  return {
    id: row.id,
    title: row.title,
    details: row.details,
    status: row.status,
    statusLabel: getTrainingFocusStatusLabel(row.status),
    goalId: row.goal_id,
    goalTitle: row.goal_id ? (goalTitleById.get(row.goal_id) ?? null) : null,
    contextType: asTrainingContextType(row.context_type),
    contextRef: row.context_ref,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    archivedAt: row.archived_at,
  };
}

function buildNoteView(
  row: TrainingNoteRow,
  goalTitleById: Map<string, string>,
  focusTitleById: Map<string, string>
): TrainingNoteView {
  return {
    id: row.id,
    noteType: row.note_type,
    noteTypeLabel: getTrainingNoteTypeLabel(row.note_type),
    status: row.status,
    statusLabel: getTrainingNoteStatusLabel(row.status),
    body: row.body,
    answer: row.answer,
    goalId: row.goal_id,
    goalTitle: row.goal_id ? (goalTitleById.get(row.goal_id) ?? null) : null,
    focusId: row.focus_id,
    focusTitle: row.focus_id ? (focusTitleById.get(row.focus_id) ?? null) : null,
    contextType: asTrainingContextType(row.context_type),
    contextRef: row.context_ref,
    isResolved: isTrainingNoteResolvedStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at,
  };
}

export function isTrainingContextType(value: string): value is TrainingContextType {
  return (
    value === "course_lesson" ||
    value === "course_module" ||
    value === "guide_drill" ||
    value === "guide_session" ||
    value === "workout_session" ||
    value === "program"
  );
}

export async function loadTrainingGoalOptions(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<TrainingGoalOption[]> {
  const goals = await loadGoalViews(supabase, userId);
  return goals
    .filter((goal) => goal.status !== "archived")
    .map((goal) => ({
      id: goal.id,
      title: goal.title,
      status: goal.status,
      statusLabel: goal.statusLabel,
    }));
}

export async function loadTrainingContextSnapshot(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<TrainingContextSnapshot> {
  const [goalsResult, focusResult, noteResult, openObservationCountResult, unansweredCountResult] =
    await Promise.all([
      supabase.from("goals").select("id, title").eq("user_id", userId),
      supabase
        .from("training_focuses")
        .select(TRAINING_FOCUS_SELECT)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(TRAINING_FOCUS_HISTORY_SIZE + 1),
      supabase
        .from("training_notes")
        .select(TRAINING_NOTE_SELECT)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(TRAINING_NOTES_PAGE_SIZE),
      supabase
        .from("training_notes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("note_type", "observation")
        .eq("status", "open"),
      supabase
        .from("training_notes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("note_type", "question")
        .eq("status", "unanswered"),
    ]);

  const schemaError =
    focusResult.error ??
    noteResult.error ??
    openObservationCountResult.error ??
    unansweredCountResult.error;
  if (isTrainingContextSchemaMissing(schemaError)) {
    return {
      schemaReady: false,
      loadError: null,
      activeFocus: null,
      focusHistory: [],
      recentNotes: [],
      unresolvedObservationCount: 0,
      unansweredQuestionCount: 0,
      goalOptions: await loadTrainingGoalOptions(supabase, userId),
    };
  }

  const failedQuery =
    goalsResult.error ??
    focusResult.error ??
    noteResult.error ??
    openObservationCountResult.error ??
    unansweredCountResult.error;
  if (failedQuery) {
    console.error("[TrainingContext] Failed loading snapshot", failedQuery);
    return {
      schemaReady: true,
      loadError: "Could not load Focus and Notes right now.",
      activeFocus: null,
      focusHistory: [],
      recentNotes: [],
      unresolvedObservationCount: 0,
      unansweredQuestionCount: 0,
      goalOptions: [],
    };
  }

  const goalTitleById = new Map(
    (goalsResult.data ?? []).map((goal) => [goal.id, goal.title] as const)
  );
  const goalOptions = await loadTrainingGoalOptions(supabase, userId);
  const focusRows = focusResult.data ?? [];
  const noteRows = noteResult.data ?? [];
  const activeFocusRow = focusRows.find((row) => row.status === "active") ?? null;

  const missingFocusIds = Array.from(
    new Set(
      noteRows
        .map((row) => row.focus_id)
        .filter((focusId): focusId is string => Boolean(focusId))
        .filter((focusId) => !focusRows.some((focus) => focus.id === focusId))
    )
  );

  let extraFocusRows: TrainingFocusRow[] = [];
  if (missingFocusIds.length > 0) {
    const extraFocusResult = await supabase
      .from("training_focuses")
      .select(TRAINING_FOCUS_SELECT)
      .eq("user_id", userId)
      .in("id", missingFocusIds);

    if (extraFocusResult.error) {
      console.error("[TrainingContext] Failed loading linked focus titles", extraFocusResult.error);
    } else {
      extraFocusRows = extraFocusResult.data ?? [];
    }
  }

  const focusTitleById = new Map(
    [...focusRows, ...extraFocusRows].map((focus) => [focus.id, focus.title] as const)
  );

  const activeFocus = activeFocusRow ? buildFocusView(activeFocusRow, goalTitleById) : null;
  const focusHistory = focusRows
    .filter((row) => row.status !== "active")
    .map((row) => buildFocusView(row, goalTitleById));
  const recentNotes = noteRows.map((row) => buildNoteView(row, goalTitleById, focusTitleById));

  return {
    schemaReady: true,
    loadError: null,
    activeFocus,
    focusHistory,
    recentNotes,
    unresolvedObservationCount: openObservationCountResult.count ?? 0,
    unansweredQuestionCount: unansweredCountResult.count ?? 0,
    goalOptions,
  };
}
