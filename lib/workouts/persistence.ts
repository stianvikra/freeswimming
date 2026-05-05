import {
  SESSION_DRAFT_REPEAT_ENDING_REST_MODES,
  SESSION_DRAFT_REPEAT_MAX,
  SESSION_DRAFT_REPEAT_MIN,
  SESSION_DRAFT_STEP_CATEGORIES,
  SESSION_DRAFT_STEP_CSS_TARGET_OFFSETS,
  SESSION_DRAFT_STEP_DRILL_TYPES,
  SESSION_DRAFT_STEP_DURATION_MODES,
  SESSION_DRAFT_STEP_EQUIPMENT,
  SESSION_DRAFT_STEP_INTENSITY_PRESETS,
  SESSION_DRAFT_STEP_STROKES,
  SESSION_DRAFT_STEP_TARGET_MODES,
  SESSION_GENERATOR_EFFORT_PRESETS,
  SESSION_GENERATOR_ENVIRONMENTS,
  SESSION_GENERATOR_EQUIPMENT,
  SESSION_GENERATOR_SESSION_TYPES,
  SESSION_GENERATOR_STROKES,
  computeSessionDraftDerivedTotals,
  isSessionDraftRepeatPostSetRestStep,
  isSessionDraftStepIntensityPreset,
  normalizeSessionDraftPoolLength,
  resolveSessionDraftPoolLengthUnit,
  resolveSessionDraftRepeatEndingRestMode,
  type SessionDraft,
  type SessionDraftRepeatEndingRestMode,
  type SessionDraftStep,
  type SessionDraftStepIntensityPreset,
  type SessionGeneratorStroke,
} from "@/lib/session-generator-v1/shared";

export type WorkoutPersistenceResult =
  | { ok: true; value: SessionDraft }
  | { ok: false; error: string };

export function normalizeSessionDraftForWorkoutPersistence(
  input: SessionDraft | null | undefined
): WorkoutPersistenceResult {
  if (!input) {
    return { ok: false, error: "Generate and review a session draft before saving it." };
  }

  const title = normalizeRequiredText(input.title, 120);
  if (!title) {
    return { ok: false, error: "Add a workout title before saving." };
  }

  const rawDescription = typeof input.description === "string" ? input.description : "";
  const description = normalizeText(rawDescription, 600);
  if (rawDescription.trim().length > 600) {
    return { ok: false, error: "Workout description must stay under 600 characters." };
  }

  if (!SESSION_GENERATOR_ENVIRONMENTS.includes(input.environment)) {
    return { ok: false, error: "Choose a supported environment before saving." };
  }

  const poolLengthUnit = resolveSessionDraftPoolLengthUnit(input.poolLengthUnit);
  const poolLengthM = input.environment === "pool" ? normalizePoolLength(input.poolLengthM) : null;

  if (input.environment === "pool" && poolLengthM === null) {
    return { ok: false, error: "Choose an exact pool size before saving." };
  }

  if (!SESSION_GENERATOR_SESSION_TYPES.includes(input.sessionType)) {
    return { ok: false, error: "Choose a supported session type before saving." };
  }

  if (!SESSION_GENERATOR_EFFORT_PRESETS.includes(input.effort)) {
    return { ok: false, error: "Choose a supported session effort before saving." };
  }

  const normalizedTargetDistanceM = normalizeNullableDistance(input.targetDistanceM);
  const normalizedTargetTimeMin = normalizeNullableInteger(input.targetTimeMin);
  const sizeMode =
    input.sizeMode === "distance" || input.sizeMode === "estimated_time"
      ? input.sizeMode
      : normalizedTargetTimeMin !== null && normalizedTargetDistanceM === null
        ? "estimated_time"
        : "distance";

  const hasExplicitAllowedStrokes = Array.isArray(input.allowedStrokes);
  const allowedStrokes = uniqueEnumList(input.allowedStrokes, SESSION_GENERATOR_STROKES);

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

  const canonicalSteps =
    input.environment === "pool" && input.sourceFingerprint.startsWith("manual")
      ? ensureManualPoolRepeatPostSetRestSteps(normalizedSteps)
      : normalizedSteps;

  if (canonicalSteps.length > 40) {
    return {
      ok: false,
      error: "This first canonical slice supports up to 40 workout steps per session.",
    };
  }

  const explicitStepStrokes = canonicalSteps
    .map((step) => mapDraftStepStrokeToAllowedStroke(step.stroke))
    .filter((stroke): stroke is SessionGeneratorStroke => Boolean(stroke));
  const requiredEquipment = canonicalSteps
    .map((step) => mapDraftStepEquipmentToAllowlist(step.equipment))
    .filter((item): item is (typeof SESSION_GENERATOR_EQUIPMENT)[number] => Boolean(item));
  const canonicalAllowedStrokes = Array.from(new Set([...allowedStrokes, ...explicitStepStrokes]));
  const resolvedAllowedStrokes =
    canonicalAllowedStrokes.length > 0
      ? canonicalAllowedStrokes
      : hasExplicitAllowedStrokes
        ? canonicalAllowedStrokes
        : [...SESSION_GENERATOR_STROKES];
  const canonicalEquipmentAllowlist = Array.from(
    new Set([...equipmentAllowlist, ...requiredEquipment])
  );

  if (resolvedAllowedStrokes.length === 0) {
    return { ok: false, error: "Select at least one session stroke before saving." };
  }

  const repeatGroups = new Map<
    string,
    {
      repeatCount: number;
      repeatEndingRestMode: SessionDraftRepeatEndingRestMode;
      lastIndex: number;
    }
  >();

  for (const [index, step] of canonicalSteps.entries()) {
    if (!step.repeatGroupId || step.repeatCount == null) continue;

    const existing = repeatGroups.get(step.repeatGroupId);
    if (!existing) {
      repeatGroups.set(step.repeatGroupId, {
        repeatCount: step.repeatCount,
        repeatEndingRestMode: resolveSessionDraftRepeatEndingRestMode(
          step.repeatEndingRestMode ?? null
        ),
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

    if (
      existing.repeatEndingRestMode !==
      resolveSessionDraftRepeatEndingRestMode(step.repeatEndingRestMode ?? null)
    ) {
      return {
        ok: false,
        error: `Repeat block ${step.repeatGroupId} must use the same last-rest rule on every step.`,
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

  const linkedPostSetRestValidation = validateLinkedRepeatPostSetRestSteps(
    canonicalSteps,
    repeatGroups
  );
  if (!linkedPostSetRestValidation.ok) {
    return linkedPostSetRestValidation;
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
    poolLengthUnit,
    poolLengthM,
    sessionType: input.sessionType,
    effort: input.effort,
    sizeMode,
    targetDistanceM: normalizedTargetDistanceM,
    targetTimeMin: normalizedTargetTimeMin,
    totalDistanceM: null,
    estimatedDurationMin: null,
    basePaceSecondsPer100m,
    usedCssPaceLabel: normalizeNullableText(input.usedCssPaceLabel, 32),
    allowedStrokes: resolvedAllowedStrokes,
    equipmentAllowlist: canonicalEquipmentAllowlist,
    focusText: normalizeNullableText(input.focusText, 120),
    goalTitle: normalizeNullableText(input.goalTitle, 120),
    constraintText: normalizeNullableText(input.constraintText, 240),
    warnings,
    steps: canonicalSteps,
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

function ensureManualPoolRepeatPostSetRestSteps(steps: SessionDraftStep[]) {
  const existingLinkedGroupIds = new Set(
    steps
      .filter((step) => isSessionDraftRepeatPostSetRestStep(step))
      .map((step) => step.postSetRestForRepeatGroupId)
      .filter((value): value is string => Boolean(value))
  );
  const nextSteps: SessionDraftStep[] = [];

  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    if (!step) continue;

    nextSteps.push(step);

    if (!step.repeatGroupId) {
      continue;
    }

    const nextStep = steps[index + 1] ?? null;
    const isRepeatGroupEnd = nextStep?.repeatGroupId !== step.repeatGroupId;

    if (!isRepeatGroupEnd || existingLinkedGroupIds.has(step.repeatGroupId)) {
      continue;
    }

    nextSteps.push(buildLinkedPostSetRestStep(step.repeatGroupId, step));
  }

  return nextSteps;
}

function buildLinkedPostSetRestStep(
  repeatGroupId: string,
  lastRepeatStep: SessionDraftStep
): SessionDraftStep {
  const copyLastRestTiming = lastRepeatStep.category === "rest";
  const durationMode =
    copyLastRestTiming &&
    (lastRepeatStep.durationMode === "fixed_rest" ||
      lastRepeatStep.durationMode === "lap_button" ||
      lastRepeatStep.durationMode === "send_off" ||
      lastRepeatStep.durationMode === "css_send_off")
      ? lastRepeatStep.durationMode
      : "fixed_rest";

  return {
    id: `${repeatGroupId}-post-set-rest`,
    category: "rest",
    name: "Post-set rest",
    stroke: "choice",
    drillType: "none",
    equipment: "none",
    intensity: "easy",
    durationMode,
    distanceM: null,
    timeMin:
      durationMode === "fixed_rest" || durationMode === "send_off"
        ? copyLastRestTiming
          ? (lastRepeatStep.timeMin ?? 1)
          : 1
        : durationMode === "lap_button" || durationMode === "css_send_off"
          ? null
          : 1,
    targetMode: "none",
    effortTarget: null,
    targetPaceSecondsPer100m: null,
    cssTargetOffsetSeconds: null,
    cssSendOffOffsetSeconds:
      durationMode === "css_send_off" && copyLastRestTiming
        ? (lastRepeatStep.cssSendOffOffsetSeconds ?? 0)
        : null,
    targetSummary: "",
    notes: copyLastRestTiming ? lastRepeatStep.notes : "",
    repeatGroupId: null,
    repeatCount: null,
    repeatEndingRestMode: null,
    postSetRestForRepeatGroupId: repeatGroupId,
  };
}

function validateLinkedRepeatPostSetRestSteps(
  steps: SessionDraftStep[],
  repeatGroups: Map<
    string,
    {
      repeatCount: number;
      repeatEndingRestMode: SessionDraftRepeatEndingRestMode;
      lastIndex: number;
    }
  >
): { ok: true } | { ok: false; error: string } {
  const seenGroupIds = new Set<string>();

  for (const [index, step] of steps.entries()) {
    if (!isSessionDraftRepeatPostSetRestStep(step)) {
      continue;
    }

    const repeatGroupId = step.postSetRestForRepeatGroupId;
    if (!repeatGroupId || !repeatGroups.has(repeatGroupId)) {
      return {
        ok: false,
        error: `Step ${index + 1} links to a repeat block that does not exist.`,
      };
    }

    if (seenGroupIds.has(repeatGroupId)) {
      return {
        ok: false,
        error: `Repeat block ${repeatGroupId} can only have one linked post-set rest step.`,
      };
    }

    if (step.category !== "rest") {
      return {
        ok: false,
        error: `Step ${index + 1} must stay a rest step when it is linked after a repeat block.`,
      };
    }

    if ((repeatGroups.get(repeatGroupId)?.lastIndex ?? -1) !== index - 1) {
      return {
        ok: false,
        error: `Linked post-set rest for repeat block ${repeatGroupId} must sit immediately after that repeat block.`,
      };
    }

    seenGroupIds.add(repeatGroupId);
  }

  return { ok: true };
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

  if (!SESSION_DRAFT_STEP_INTENSITY_PRESETS.includes(input.intensity)) {
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
  const postSetRestForRepeatGroupId = normalizeNullableText(input.postSetRestForRepeatGroupId, 80);
  const repeatCount = normalizeNullableInteger(input.repeatCount);
  const repeatEndingRestMode = normalizeRepeatEndingRestMode(input.repeatEndingRestMode);
  const drillType = normalizeStepDrillType(input.drillType);
  const equipment = normalizeStepEquipment(input.equipment);
  const targetMode = normalizeTargetMode(input.targetMode);
  const intensity = normalizeStepIntensityPreset(input.intensity);
  const effortTarget =
    targetMode === "effort" ? normalizeStepIntensityPreset(input.effortTarget) : null;
  const targetPaceSecondsPer100m =
    targetMode === "target_pace" ? normalizeNullableInteger(input.targetPaceSecondsPer100m) : null;
  const cssTargetOffsetSeconds =
    targetMode === "css_target_pace" ? normalizeCssOffset(input.cssTargetOffsetSeconds) : null;
  const cssSendOffOffsetSeconds =
    input.durationMode === "css_send_off"
      ? normalizeCssOffset(input.cssSendOffOffsetSeconds)
      : null;

  if (Boolean(repeatGroupId) !== Boolean(repeatCount)) {
    return {
      ok: false,
      error: `Step ${index + 1} must include both repeat metadata fields or neither.`,
    };
  }

  if (repeatGroupId && postSetRestForRepeatGroupId) {
    return {
      ok: false,
      error: `Step ${index + 1} cannot be both inside a repeat block and the linked post-set rest.`,
    };
  }

  if (repeatEndingRestMode === "invalid") {
    return {
      ok: false,
      error: `Step ${index + 1} uses an unsupported repeat ending-rest mode.`,
    };
  }

  if (!repeatGroupId && repeatEndingRestMode !== null) {
    return {
      ok: false,
      error: `Step ${index + 1} can only set last-rest behavior inside a repeat block.`,
    };
  }

  if (postSetRestForRepeatGroupId && input.category !== "rest") {
    return {
      ok: false,
      error: `Step ${index + 1} must stay a rest step when it is linked as post-set rest.`,
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

  if (input.durationMode === "css_send_off" && cssSendOffOffsetSeconds === null) {
    return {
      ok: false,
      error: `Step ${index + 1} needs a CSS-Based Send-Off Time offset before saving.`,
    };
  }

  if (input.durationMode === "distance") {
    const distanceM = normalizeNullableDistance(input.distanceM);

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
        intensity: intensity!,
        durationMode: "distance",
        distanceM,
        timeMin: null,
        targetMode,
        effortTarget,
        targetPaceSecondsPer100m,
        cssTargetOffsetSeconds,
        cssSendOffOffsetSeconds: null,
        targetSummary,
        notes,
        repeatGroupId,
        repeatCount,
        repeatEndingRestMode,
        postSetRestForRepeatGroupId,
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
        intensity: intensity!,
        durationMode: "lap_button",
        distanceM: null,
        timeMin: null,
        targetMode,
        effortTarget,
        targetPaceSecondsPer100m,
        cssTargetOffsetSeconds,
        cssSendOffOffsetSeconds: null,
        targetSummary,
        notes,
        repeatGroupId,
        repeatCount,
        repeatEndingRestMode,
        postSetRestForRepeatGroupId,
      },
    };
  }

  if (input.durationMode === "css_send_off") {
    return {
      ok: true,
      value: {
        id,
        category: input.category,
        name,
        stroke: input.stroke,
        drillType,
        equipment,
        intensity: intensity!,
        durationMode: "css_send_off",
        distanceM: null,
        timeMin: null,
        targetMode,
        effortTarget,
        targetPaceSecondsPer100m,
        cssTargetOffsetSeconds,
        cssSendOffOffsetSeconds,
        targetSummary,
        notes,
        repeatGroupId,
        repeatCount,
        repeatEndingRestMode,
        postSetRestForRepeatGroupId,
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
      intensity: intensity!,
      durationMode:
        input.durationMode === "fixed_rest"
          ? "fixed_rest"
          : input.durationMode === "send_off"
            ? "send_off"
            : "time",
      distanceM: null,
      timeMin,
      targetMode,
      effortTarget,
      targetPaceSecondsPer100m,
      cssTargetOffsetSeconds,
      cssSendOffOffsetSeconds: null,
      targetSummary,
      notes,
      repeatGroupId,
      repeatCount,
      repeatEndingRestMode,
      postSetRestForRepeatGroupId,
    },
  };
}

function normalizePoolLength(value: SessionDraft["poolLengthM"]) {
  return normalizeSessionDraftPoolLength(value);
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

function normalizeNullableDistance(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const normalized = Math.round(value * 10000) / 10000;
  return normalized > 0 ? normalized : null;
}

function normalizeRepeatEndingRestMode(
  value: unknown
): SessionDraftRepeatEndingRestMode | null | "invalid" {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return SESSION_DRAFT_REPEAT_ENDING_REST_MODES.includes(value as SessionDraftRepeatEndingRestMode)
    ? (value as SessionDraftRepeatEndingRestMode)
    : "invalid";
}

function normalizePositiveNumber(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 10000) / 10000;
}

function normalizeStepIntensityPreset(value: unknown): SessionDraftStepIntensityPreset | null {
  return isSessionDraftStepIntensityPreset(value) ? value : null;
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
