import type { Json } from "@/types/database";
import type { WorkoutSummary } from "@/lib/workouts/shared";

export const PROGRAM_SOURCE_KINDS = ["manual"] as const;
export const PROGRAM_STATUSES = ["draft"] as const;
export const PROGRAM_WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const PROGRAM_MAX_WEEKS = 24;
export const PROGRAM_MAX_ASSIGNMENTS = 84;

export type ProgramSourceKind = (typeof PROGRAM_SOURCE_KINDS)[number];
export type ProgramStatus = (typeof PROGRAM_STATUSES)[number];

export type ProgramAssignment = {
  id: string;
  workoutId: string;
  dayIndex: number;
  position: number;
};

export type ProgramWeek = {
  id: string;
  label: string;
  assignments: ProgramAssignment[];
};

export type ProgramEditorRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  sourceKind: ProgramSourceKind;
  status: ProgramStatus;
  title: string;
  weeks: ProgramWeek[];
};

export type ProgramSummary = {
  id: string;
  title: string;
  weekCount: number;
  assignmentCount: number;
  updatedAt: string;
  sourceKind: ProgramSourceKind;
  status: ProgramStatus;
};

export type ProgramLibrarySnapshot = {
  schemaReady: boolean;
  loadError: string | null;
  selectedProgram: ProgramEditorRecord | null;
  selectedProgramMissing: boolean;
  recentPrograms: ProgramSummary[];
  availableWorkouts: WorkoutSummary[];
  missingWorkoutIds: string[];
};

export type ProgramSaveRequestBody = {
  title?: string | null;
  weeks?: ProgramWeek[] | null;
  sourceKind?: ProgramSourceKind | null;
};

export type ProgramSaveApiSuccess = {
  ok: true;
  program: ProgramEditorRecord;
  summary: ProgramSummary;
};

export type ProgramSaveApiError = {
  ok: false;
  error: string;
};

export type ProgramSaveApiResponse = ProgramSaveApiSuccess | ProgramSaveApiError;

export function createProgramEntityId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `program-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function buildManualProgramStarterState(now = new Date()): {
  title: string;
  weeks: ProgramWeek[];
} {
  void now;

  return {
    title: "New program",
    weeks: [
      {
        id: createProgramEntityId(),
        label: "Week 1",
        assignments: [],
      },
    ],
  };
}

export function buildProgramDraftChangeSignature(
  draft: Pick<ProgramEditorRecord, "title" | "weeks"> | null | undefined
): string | null {
  if (!draft) return null;
  return JSON.stringify(draft);
}

export function haveProgramDraftChanges(
  currentDraft: Pick<ProgramEditorRecord, "title" | "weeks"> | null | undefined,
  savedDraft: Pick<ProgramEditorRecord, "title" | "weeks"> | null | undefined
): boolean {
  const currentSignature = buildProgramDraftChangeSignature(currentDraft);
  const savedSignature = buildProgramDraftChangeSignature(savedDraft);

  if (currentSignature === null && savedSignature === null) return false;
  if (currentSignature === null || savedSignature === null) return true;

  return currentSignature !== savedSignature;
}

export function countProgramAssignments(weeks: ProgramWeek[] | null | undefined) {
  if (!Array.isArray(weeks)) return 0;
  return weeks.reduce(
    (total, week) => total + (Array.isArray(week.assignments) ? week.assignments.length : 0),
    0
  );
}

export function buildProgramWeekdayGroups(week: ProgramWeek) {
  return PROGRAM_WEEKDAY_LABELS.map((_, dayIndex) =>
    week.assignments
      .filter((assignment) => assignment.dayIndex === dayIndex)
      .sort((left, right) => left.position - right.position)
  );
}

export function normalizeProgramForPersistence(
  input:
    | {
        title?: string | null;
        weeks?: ProgramWeek[] | null;
      }
    | null
    | undefined
): { ok: true; value: { title: string; weeks: ProgramWeek[] } } | { ok: false; error: string } {
  if (!input) {
    return { ok: false, error: "Create and review a program shell before saving it." };
  }

  const title = normalizeRequiredText(input.title, 120);
  if (!title) {
    return { ok: false, error: "Add a program title before saving." };
  }

  if (!Array.isArray(input.weeks) || input.weeks.length === 0) {
    return { ok: false, error: "Add at least one program week before saving." };
  }

  if (input.weeks.length > PROGRAM_MAX_WEEKS) {
    return {
      ok: false,
      error: `This first canonical slice supports up to ${PROGRAM_MAX_WEEKS} program weeks.`,
    };
  }

  const seenWeekIds = new Set<string>();
  const seenAssignmentIds = new Set<string>();
  const normalizedWeeks: ProgramWeek[] = [];
  let assignmentCount = 0;

  for (const [weekIndex, rawWeek] of input.weeks.entries()) {
    const weekId = normalizeRequiredText(rawWeek?.id, 120);
    if (!weekId) {
      return { ok: false, error: `Week ${weekIndex + 1} is missing a stable id.` };
    }
    if (seenWeekIds.has(weekId)) {
      return { ok: false, error: `Week ${weekIndex + 1} is duplicated in this program.` };
    }
    seenWeekIds.add(weekId);

    const label = normalizeRequiredText(rawWeek?.label, 80) ?? `Week ${weekIndex + 1}`;
    const rawAssignments = Array.isArray(rawWeek?.assignments) ? rawWeek.assignments : [];
    const normalizedAssignments: ProgramAssignment[] = [];

    for (const rawAssignment of rawAssignments) {
      assignmentCount += 1;
      if (assignmentCount > PROGRAM_MAX_ASSIGNMENTS) {
        return {
          ok: false,
          error: `This first canonical slice supports up to ${PROGRAM_MAX_ASSIGNMENTS} scheduled workouts per program.`,
        };
      }

      const assignmentId = normalizeRequiredText(rawAssignment?.id, 120);
      if (!assignmentId) {
        return {
          ok: false,
          error: `${label} includes a scheduled workout without a stable assignment id.`,
        };
      }
      if (seenAssignmentIds.has(assignmentId)) {
        return {
          ok: false,
          error: `${label} includes a duplicated assignment id.`,
        };
      }
      seenAssignmentIds.add(assignmentId);

      const workoutId = normalizeRequiredText(rawAssignment?.workoutId, 120);
      if (!workoutId) {
        return { ok: false, error: `${label} includes a scheduled workout with no workout id.` };
      }

      const dayIndex = normalizeInteger(rawAssignment?.dayIndex);
      if (dayIndex == null || dayIndex < 0 || dayIndex >= PROGRAM_WEEKDAY_LABELS.length) {
        return { ok: false, error: `${label} includes a scheduled workout on an invalid day.` };
      }

      const position = normalizeInteger(rawAssignment?.position);
      if (position == null || position < 0) {
        return {
          ok: false,
          error: `${label} includes a scheduled workout with invalid day ordering.`,
        };
      }

      normalizedAssignments.push({
        id: assignmentId,
        workoutId,
        dayIndex,
        position,
      });
    }

    const groupedByDay = PROGRAM_WEEKDAY_LABELS.map((_, dayIndex) =>
      normalizedAssignments
        .filter((assignment) => assignment.dayIndex === dayIndex)
        .sort((left, right) => left.position - right.position || left.id.localeCompare(right.id))
        .map((assignment, position) => ({
          ...assignment,
          position,
        }))
    );

    normalizedWeeks.push({
      id: weekId,
      label,
      assignments: groupedByDay.flat(),
    });
  }

  return {
    ok: true,
    value: {
      title,
      weeks: normalizedWeeks,
    },
  };
}

export function programWeeksToJson(weeks: ProgramWeek[]): Json {
  return weeks as unknown as Json;
}

function normalizeRequiredText(value: string | null | undefined, maxLength: number) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > maxLength) return null;
  return normalized;
}

function normalizeInteger(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.trunc(value);
}
