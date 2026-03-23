import {
  SESSION_DRAFT_STEP_CATEGORIES,
  SESSION_DRAFT_STEP_CSS_TARGET_OFFSETS,
  SESSION_DRAFT_STEP_DRILL_TYPES,
  SESSION_DRAFT_STEP_DURATION_MODES,
  SESSION_DRAFT_STEP_EQUIPMENT,
  SESSION_DRAFT_REPEAT_MAX,
  SESSION_DRAFT_REPEAT_MIN,
  SESSION_DRAFT_STEP_STROKES,
  SESSION_DRAFT_STEP_TARGET_MODES,
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
    .map((step) => mapDraftStepStrokeToAllowedStroke(step.stroke))
    .filter((stroke): stroke is SessionGeneratorStroke => Boolean(stroke));
  const requiredEquipment = normalizedSteps
    .map((step) => mapDraftStepEquipmentToAllowlist(step.equipment))
    .filter((item): item is (typeof SESSION_GENERATOR_EQUIPMENT)[number] => Boolean(item));
  const canonicalAllowedStrokes = Array.from(new Set([...allowedStrokes, ...explicitStepStrokes]));
  const canonicalEquipmentAllowlist = Array.from(
    new Set([...equipmentAllowlist, ...requiredEquipment])
  );

  const repeatGroups = new Map<string, { repeatCount: number; lastIndex: number }>();

  for (const [index, step] of normalizedSteps.entries()) {
    if (!step.repeatGroupId || step.repeatCount == null) continue;

    const existing = repeatGroups.get(step.repeatGroupId);
    if (!existing) {
      repeatGroups.set(step.repeatGroupId, {
        repeatCount: step.repeatCount,
        lastIndex: index,
      });
      continue;
    }

    if (existing.repeatCount !== step.repeatCount) {
      return {
        ok: false,
        error: `Repeat block ${step.repeatGroupId} must use the same repeat count on every step.`,
      };
    }

    if (existing.lastIndex !== index - 1) {
      return {
        ok: false,
        error: `Repeat block ${step.repeatGroupId} must stay contiguous in the workout order.`,
      };
    }

    existing.lastIndex = index;
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
    allowedStrokes: canonicalAllowedStrokes,
    equipmentAllowlist: canonicalEquipmentAllowlist,
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

  if (!SESSION_DRAFT_STEP_STROKES.includes(input.stroke as SessionDraftStep["stroke"])) {
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
  const repeatGroupId = normalizeNullableText(input.repeatGroupId, 80);
  const repeatCount = normalizeNullableInteger(input.repeatCount);
  const drillType = normalizeStepDrillType(input.drillType);
  const equipment = normalizeStepEquipment(input.equipment);
  const targetMode = normalizeTargetMode(input.targetMode);
  const effortTarget = targetMode === "effort" ? normalizeEffortPreset(input.effortTarget) : null;
  const targetPaceSecondsPer100m =
    targetMode === "target_pace" ? normalizeNullableInteger(input.targetPaceSecondsPer100m) : null;
  const cssTargetOffsetSeconds =
    targetMode === "css_target_pace" ? normalizeCssOffset(input.cssTargetOffsetSeconds) : null;

  if (Boolean(repeatGroupId) !== Boolean(repeatCount)) {
    return {
      ok: false,
      error: `Step ${index + 1} must include both repeat metadata fields or neither.`,
    };
  }

  if (
    repeatCount !== null &&
    (repeatCount < SESSION_DRAFT_REPEAT_MIN || repeatCount > SESSION_DRAFT_REPEAT_MAX)
  ) {
    return {
      ok: false,
      error: `Step ${index + 1} repeat count must stay between ${SESSION_DRAFT_REPEAT_MIN} and ${SESSION_DRAFT_REPEAT_MAX}.`,
    };
  }

  if (targetMode === "effort" && !effortTarget) {
    return {
      ok: false,
      error: `Step ${index + 1} needs an effort target before saving.`,
    };
  }

  if (targetMode === "target_pace" && targetPaceSecondsPer100m === null) {
    return {
      ok: false,
      error: `Step ${index + 1} needs a target pace before saving.`,
    };
  }

  if (targetMode === "css_target_pace" && cssTargetOffsetSeconds === null) {
    return {
      ok: false,
      error: `Step ${index + 1} needs a CSS pace offset before saving.`,
    };
  }

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
        drillType,
        equipment,
        intensity: input.intensity,
        durationMode: "distance",
        distanceM,
        timeMin: null,
        targetMode,
        effortTarget,
        targetPaceSecondsPer100m,
        cssTargetOffsetSeconds,
        targetSummary,
        notes,
        repeatGroupId,
        repeatCount,
      },
    };
  }

  if (input.durationMode === "lap_button") {
    return {
      ok: true,
      value: {
        id,
        category: input.category,
        name,
        stroke: input.stroke,
        drillType,
        equipment,
        intensity: input.intensity,
        durationMode: "lap_button",
        distanceM: null,
        timeMin: null,
        targetMode,
        effortTarget,
        targetPaceSecondsPer100m,
        cssTargetOffsetSeconds,
        targetSummary,
        notes,
        repeatGroupId,
        repeatCount,
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
      drillType,
      equipment,
      intensity: input.intensity,
      durationMode: input.durationMode === "fixed_rest" ? "fixed_rest" : "time",
      distanceM: null,
      timeMin,
      targetMode,
      effortTarget,
      targetPaceSecondsPer100m,
      cssTargetOffsetSeconds,
      targetSummary,
      notes,
      repeatGroupId,
      repeatCount,
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

function normalizeEffortPreset(value: unknown) {
  return SESSION_GENERATOR_EFFORT_PRESETS.includes(value as SessionDraft["effort"])
    ? (value as SessionDraft["effort"])
    : null;
}

function normalizeTargetMode(value: unknown) {
  return SESSION_DRAFT_STEP_TARGET_MODES.includes(
    value as (typeof SESSION_DRAFT_STEP_TARGET_MODES)[number]
  )
    ? (value as (typeof SESSION_DRAFT_STEP_TARGET_MODES)[number])
    : "none";
}

function normalizeStepDrillType(value: unknown) {
  return SESSION_DRAFT_STEP_DRILL_TYPES.includes(
    value as (typeof SESSION_DRAFT_STEP_DRILL_TYPES)[number]
  )
    ? (value as (typeof SESSION_DRAFT_STEP_DRILL_TYPES)[number])
    : "none";
}

function normalizeStepEquipment(value: unknown) {
  return SESSION_DRAFT_STEP_EQUIPMENT.includes(
    value as (typeof SESSION_DRAFT_STEP_EQUIPMENT)[number]
  )
    ? (value as (typeof SESSION_DRAFT_STEP_EQUIPMENT)[number])
    : "none";
}

function mapDraftStepStrokeToAllowedStroke(value: SessionDraftStep["stroke"]) {
  return SESSION_GENERATOR_STROKES.includes(value as SessionGeneratorStroke)
    ? (value as SessionGeneratorStroke)
    : null;
}

function mapDraftStepEquipmentToAllowlist(value: SessionDraftStep["equipment"]) {
  return SESSION_GENERATOR_EQUIPMENT.includes(value as (typeof SESSION_GENERATOR_EQUIPMENT)[number])
    ? (value as (typeof SESSION_GENERATOR_EQUIPMENT)[number])
    : null;
}

function normalizeCssOffset(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const normalized = Math.round(value);
  return SESSION_DRAFT_STEP_CSS_TARGET_OFFSETS.includes(
    normalized as (typeof SESSION_DRAFT_STEP_CSS_TARGET_OFFSETS)[number]
  )
    ? normalized
    : null;
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
