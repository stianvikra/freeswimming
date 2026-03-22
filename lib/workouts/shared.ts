import {
  SESSION_DRAFT_STEP_CATEGORIES,
  SESSION_DRAFT_STEP_DURATION_MODES,
  SESSION_GENERATOR_ENVIRONMENTS,
  SESSION_GENERATOR_EFFORT_PRESETS,
  SESSION_GENERATOR_EQUIPMENT,
  SESSION_GENERATOR_POOL_LENGTHS,
  SESSION_GENERATOR_SESSION_TYPES,
  SESSION_GENERATOR_STROKES,
  computeSessionDraftDerivedTotals,
  type SessionDraft,
  type SessionDraftStep,
  type SessionGeneratorEnvironment,
  type SessionGeneratorPoolLength,
  type SessionGeneratorStroke,
} from "@/lib/session-generator-v1/shared";

export const WORKOUT_SOURCE_KINDS = ["ai_session_v1", "manual"] as const;
export const WORKOUT_STATUSES = ["accepted"] as const;

export type WorkoutSourceKind = (typeof WORKOUT_SOURCE_KINDS)[number];
export type WorkoutStatus = (typeof WORKOUT_STATUSES)[number];

export type WorkoutSummary = {
  id: string;
  title: string;
  environment: SessionGeneratorEnvironment;
  poolLengthM: SessionGeneratorPoolLength | null;
  sessionType: SessionDraft["sessionType"];
  effort: SessionDraft["effort"];
  totalDistanceM: number | null;
  estimatedDurationMin: number | null;
  updatedAt: string;
  acceptedAt: string;
  sourceKind: WorkoutSourceKind;
  status: WorkoutStatus;
};

export type WorkoutEditorRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string;
  sourceKind: WorkoutSourceKind;
  status: WorkoutStatus;
  draft: SessionDraft;
};

export type WorkoutSaveRequestBody = {
  draft?: SessionDraft | null;
  sourceKind?: WorkoutSourceKind | null;
};

export type WorkoutSaveApiSuccess = {
  ok: true;
  workout: WorkoutEditorRecord;
  summary: WorkoutSummary;
};

export type WorkoutSaveApiError = {
  ok: false;
  error: string;
};

export type WorkoutSaveApiResponse = WorkoutSaveApiSuccess | WorkoutSaveApiError;

export type WorkoutLibrarySnapshot = {
  schemaReady: boolean;
  loadError: string | null;
  selectedWorkout: WorkoutEditorRecord | null;
  selectedWorkoutMissing: boolean;
  recentWorkouts: WorkoutSummary[];
};

export function normalizeSessionDraftForWorkoutPersistence(
  input: SessionDraft | null | undefined
): { ok: true; value: SessionDraft } | { ok: false; error: string } {
  if (!input) {
    return { ok: false, error: "Generate and review a session draft before saving it." };
  }

  const title = normalizeRequiredText(input.title, 120);
  if (!title) {
    return { ok: false, error: "Add a workout title before saving." };
  }

  const description = normalizeText(input.description, 600);
  if (input.description.trim().length > 600) {
    return { ok: false, error: "Workout description must stay under 600 characters." };
  }

  if (!SESSION_GENERATOR_ENVIRONMENTS.includes(input.environment)) {
    return { ok: false, error: "Choose a supported environment before saving." };
  }

  const poolLengthM = input.environment === "pool" ? normalizePoolLength(input.poolLengthM) : null;

  if (input.environment === "pool" && poolLengthM === null) {
    return { ok: false, error: "Choose a supported pool length before saving." };
  }

  if (!SESSION_GENERATOR_SESSION_TYPES.includes(input.sessionType)) {
    return { ok: false, error: "Choose a supported session type before saving." };
  }

  if (!SESSION_GENERATOR_EFFORT_PRESETS.includes(input.effort)) {
    return { ok: false, error: "Choose a supported session effort before saving." };
  }

  if (input.sizeMode !== "distance" && input.sizeMode !== "estimated_time") {
    return { ok: false, error: "Choose whether the workout is sized by distance or time." };
  }

  const allowedStrokes = uniqueEnumList(input.allowedStrokes, SESSION_GENERATOR_STROKES);
  if (allowedStrokes.length === 0) {
    return { ok: false, error: "Select at least one session stroke before saving." };
  }

  const equipmentAllowlist = uniqueEnumList(input.equipmentAllowlist, SESSION_GENERATOR_EQUIPMENT);

  const warnings = normalizeStringList(input.warnings, 160, 8);
  const titleSuggestions = normalizeStringList(input.titleSuggestions, 120, 5);

  const normalizedSteps: SessionDraftStep[] = [];

  if (!Array.isArray(input.steps) || input.steps.length === 0) {
    return { ok: false, error: "Add at least one workout step before saving." };
  }

  if (input.steps.length > 40) {
    return {
      ok: false,
      error: "This first canonical slice supports up to 40 workout steps per session.",
    };
  }

  for (const [index, rawStep] of input.steps.entries()) {
    const normalizedStep = normalizeStep(rawStep, index);
    if (!normalizedStep.ok) {
      return normalizedStep;
    }
    normalizedSteps.push(normalizedStep.value);
  }

  const explicitStepStrokes = normalizedSteps
    .map((step) => step.stroke)
    .filter((stroke): stroke is SessionGeneratorStroke => stroke !== "choice");

  const missingStroke = explicitStepStrokes.find((stroke) => !allowedStrokes.includes(stroke));
  if (missingStroke) {
    return {
      ok: false,
      error: "Every explicit step stroke must also be included in the session stroke list.",
    };
  }

  const createdAt = normalizeIsoDate(input.createdAt) ?? new Date().toISOString();
  const basePaceSecondsPer100m = normalizePositiveNumber(input.basePaceSecondsPer100m);

  if (basePaceSecondsPer100m === null) {
    return { ok: false, error: "Workout pace metadata is invalid. Regenerate the session draft." };
  }

  const normalizedDraft: SessionDraft = {
    version: 1,
    status: "draft",
    generatorKind: "rule_engine_v1",
    createdAt,
    sourceFingerprint: normalizeRequiredText(input.sourceFingerprint, 64) ?? "unknown",
    title,
    titleSuggestions: titleSuggestions.length > 0 ? titleSuggestions : [title],
    description,
    environment: input.environment,
    poolLengthM,
    sessionType: input.sessionType,
    effort: input.effort,
    sizeMode: input.sizeMode,
    targetDistanceM: normalizeNullableInteger(input.targetDistanceM),
    targetTimeMin: normalizeNullableInteger(input.targetTimeMin),
    totalDistanceM: null,
    estimatedDurationMin: null,
    basePaceSecondsPer100m,
    usedCssPaceLabel: normalizeNullableText(input.usedCssPaceLabel, 32),
    allowedStrokes,
    equipmentAllowlist,
    focusText: normalizeNullableText(input.focusText, 120),
    goalTitle: normalizeNullableText(input.goalTitle, 120),
    constraintText: normalizeNullableText(input.constraintText, 240),
    warnings,
    steps: normalizedSteps,
  };

  const totals = computeSessionDraftDerivedTotals(normalizedDraft);
  const targetDistanceM =
    normalizedDraft.sizeMode === "distance"
      ? (normalizedDraft.targetDistanceM ?? totals.totalDistanceM)
      : null;
  const targetTimeMin =
    normalizedDraft.sizeMode === "estimated_time"
      ? (normalizedDraft.targetTimeMin ?? totals.estimatedDurationMin)
      : null;

  if (normalizedDraft.sizeMode === "distance" && targetDistanceM === null) {
    return { ok: false, error: "Distance-based workouts need a target distance before saving." };
  }

  if (normalizedDraft.sizeMode === "estimated_time" && targetTimeMin === null) {
    return {
      ok: false,
      error: "Time-based workouts need an estimated workout time before saving.",
    };
  }

  return {
    ok: true,
    value: {
      ...normalizedDraft,
      targetDistanceM,
      targetTimeMin,
      totalDistanceM: totals.totalDistanceM,
      estimatedDurationMin: totals.estimatedDurationMin,
    },
  };
}

function normalizeStep(
  input: SessionDraftStep,
  index: number
): { ok: true; value: SessionDraftStep } | { ok: false; error: string } {
  if (!SESSION_DRAFT_STEP_CATEGORIES.includes(input.category)) {
    return {
      ok: false,
      error: `Step ${index + 1} uses an unsupported category.`,
    };
  }

  if (!SESSION_GENERATOR_EFFORT_PRESETS.includes(input.intensity)) {
    return {
      ok: false,
      error: `Step ${index + 1} uses an unsupported intensity.`,
    };
  }

  if (
    input.stroke !== "choice" &&
    !SESSION_GENERATOR_STROKES.includes(input.stroke as SessionGeneratorStroke)
  ) {
    return {
      ok: false,
      error: `Step ${index + 1} uses an unsupported stroke.`,
    };
  }

  if (!SESSION_DRAFT_STEP_DURATION_MODES.includes(input.durationMode)) {
    return {
      ok: false,
      error: `Step ${index + 1} uses an unsupported duration mode.`,
    };
  }

  const name = normalizeRequiredText(input.name, 120);
  if (!name) {
    return { ok: false, error: `Step ${index + 1} needs a step name before saving.` };
  }

  const targetSummary = normalizeText(input.targetSummary, 160);
  const notes = normalizeText(input.notes, 400);
  const id = normalizeRequiredText(input.id, 80) ?? `step-${index + 1}`;

  if (input.durationMode === "distance") {
    const distanceM = normalizeNullableInteger(input.distanceM);

    if (distanceM === null) {
      return { ok: false, error: `Step ${index + 1} needs a distance target before saving.` };
    }

    return {
      ok: true,
      value: {
        id,
        category: input.category,
        name,
        stroke: input.stroke,
        intensity: input.intensity,
        durationMode: "distance",
        distanceM,
        timeMin: null,
        targetSummary,
        notes,
      },
    };
  }

  const timeMin = normalizePositiveNumber(input.timeMin);
  if (timeMin === null) {
    return { ok: false, error: `Step ${index + 1} needs a time target before saving.` };
  }

  return {
    ok: true,
    value: {
      id,
      category: input.category,
      name,
      stroke: input.stroke,
      intensity: input.intensity,
      durationMode: "time",
      distanceM: null,
      timeMin,
      targetSummary,
      notes,
    },
  };
}

function normalizePoolLength(value: SessionDraft["poolLengthM"]) {
  if (value === null) return null;
  return SESSION_GENERATOR_POOL_LENGTHS.includes(value) ? value : null;
}

function normalizeRequiredText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > maxLength) return null;
  return normalized;
}

function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeNullableText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (normalized.length === 0) return null;
  return normalized.slice(0, maxLength);
}

function normalizeNullableInteger(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const normalized = Math.round(value);
  return normalized > 0 ? normalized : null;
}

function normalizePositiveNumber(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 10) / 10;
}

function normalizeIsoDate(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (normalized.length === 0) return null;
  return Number.isNaN(Date.parse(normalized)) ? null : new Date(normalized).toISOString();
}

function normalizeStringList(value: unknown, maxLength: number, maxItems: number) {
  if (!Array.isArray(value)) return [];

  const normalized = value
    .map((entry) => normalizeRequiredText(entry, maxLength))
    .filter((entry): entry is string => Boolean(entry));

  return Array.from(new Set(normalized)).slice(0, maxItems);
}

function uniqueEnumList<T extends string>(value: unknown, allowed: readonly T[]) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((entry): entry is T => allowed.includes(entry as T))));
}
