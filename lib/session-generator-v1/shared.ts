import type {
  GeneratorIntakeHandoffPayload,
  GeneratorIntakeOverrides,
  GeneratorIntakeSelection,
} from "@/lib/generator-intake/shared";

export const SESSION_GENERATOR_ENVIRONMENTS = ["pool", "open_water"] as const;
export const SESSION_GENERATOR_POOL_LENGTHS = [12.5, 25, 50] as const;
export const SESSION_GENERATOR_SESSION_TYPES = [
  "recovery",
  "endurance",
  "technique",
  "threshold_css",
  "speed",
  "race_pace",
] as const;
export const SESSION_GENERATOR_EFFORT_PRESETS = [
  "easy",
  "moderate",
  "hard",
  "very_hard",
  "race_pace",
] as const;
export const SESSION_GENERATOR_SIZE_MODES = ["distance", "estimated_time"] as const;
export const SESSION_GENERATOR_STROKES = [
  "freestyle",
  "backstroke",
  "breaststroke",
  "butterfly",
  "individual_medley",
] as const;
export const SESSION_GENERATOR_EQUIPMENT = [
  "kickboard",
  "pull_buoy",
  "fins",
  "paddles",
  "snorkel",
] as const;
export const SESSION_DRAFT_STEP_CATEGORIES = [
  "warmup",
  "drill",
  "kick",
  "main",
  "rest",
  "cooldown",
  "swim",
] as const;
export const SESSION_DRAFT_STEP_DURATION_MODES = [
  "distance",
  "time",
  "fixed_rest",
  "lap_button",
] as const;
export const SESSION_DRAFT_STEP_TARGET_MODES = [
  "none",
  "effort",
  "target_pace",
  "css_target_pace",
] as const;
export const SESSION_DRAFT_STEP_CSS_TARGET_OFFSETS = [
  -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5,
] as const;
export const SESSION_DRAFT_REPEAT_MIN = 2;
export const SESSION_DRAFT_REPEAT_MAX = 20;

export type SessionGeneratorEnvironment = (typeof SESSION_GENERATOR_ENVIRONMENTS)[number];
export type SessionGeneratorPoolLength = (typeof SESSION_GENERATOR_POOL_LENGTHS)[number];
export type SessionGeneratorSessionType = (typeof SESSION_GENERATOR_SESSION_TYPES)[number];
export type SessionGeneratorEffortPreset = (typeof SESSION_GENERATOR_EFFORT_PRESETS)[number];
export type SessionGeneratorSizeMode = (typeof SESSION_GENERATOR_SIZE_MODES)[number];
export type SessionGeneratorStroke = (typeof SESSION_GENERATOR_STROKES)[number];
export type SessionGeneratorEquipment = (typeof SESSION_GENERATOR_EQUIPMENT)[number];
export type SessionDraftStepCategory = (typeof SESSION_DRAFT_STEP_CATEGORIES)[number];
export type SessionDraftStepDurationMode = (typeof SESSION_DRAFT_STEP_DURATION_MODES)[number];
export type SessionDraftStepTargetMode = (typeof SESSION_DRAFT_STEP_TARGET_MODES)[number];

export type SessionGeneratorFormState = {
  environment: SessionGeneratorEnvironment;
  poolLengthM: string;
  sessionType: SessionGeneratorSessionType;
  effort: SessionGeneratorEffortPreset;
  sizeMode: SessionGeneratorSizeMode;
  targetDistanceM: string;
  targetTimeMin: string;
  includeDrills: boolean;
  includeKick: boolean;
  allowedStrokes: SessionGeneratorStroke[];
  equipmentAllowlist: SessionGeneratorEquipment[];
};

export type SessionGeneratorInput = {
  environment: SessionGeneratorEnvironment;
  poolLengthM: SessionGeneratorPoolLength | null;
  sessionType: SessionGeneratorSessionType;
  effort: SessionGeneratorEffortPreset;
  sizeMode: SessionGeneratorSizeMode;
  targetDistanceM: number | null;
  targetTimeMin: number | null;
  includeDrills: boolean;
  includeKick: boolean;
  allowedStrokes: SessionGeneratorStroke[];
  equipmentAllowlist: SessionGeneratorEquipment[];
};

export type SessionGeneratorRequestBody = {
  selection?: Partial<GeneratorIntakeSelection> | null;
  overrides?: Partial<GeneratorIntakeOverrides> | null;
  input?: Partial<SessionGeneratorFormState> | null;
};

export type SessionDraftStep = {
  id: string;
  category: SessionDraftStepCategory;
  name: string;
  stroke: SessionGeneratorStroke | "choice";
  intensity: SessionGeneratorEffortPreset;
  durationMode: SessionDraftStepDurationMode;
  distanceM: number | null;
  timeMin: number | null;
  targetMode?: SessionDraftStepTargetMode | null;
  effortTarget?: SessionGeneratorEffortPreset | null;
  targetPaceSecondsPer100m?: number | null;
  cssTargetOffsetSeconds?: number | null;
  targetSummary: string;
  notes: string;
  repeatGroupId?: string | null;
  repeatCount?: number | null;
};

export type SessionDraft = {
  version: 1;
  status: "draft";
  generatorKind: "rule_engine_v1";
  createdAt: string;
  sourceFingerprint: string;
  title: string;
  titleSuggestions: string[];
  description: string;
  environment: SessionGeneratorEnvironment;
  poolLengthM: SessionGeneratorPoolLength | null;
  sessionType: SessionGeneratorSessionType;
  effort: SessionGeneratorEffortPreset;
  sizeMode: SessionGeneratorSizeMode;
  targetDistanceM: number | null;
  targetTimeMin: number | null;
  totalDistanceM: number | null;
  estimatedDurationMin: number | null;
  basePaceSecondsPer100m: number;
  usedCssPaceLabel: string | null;
  allowedStrokes: SessionGeneratorStroke[];
  equipmentAllowlist: SessionGeneratorEquipment[];
  focusText: string | null;
  goalTitle: string | null;
  constraintText: string | null;
  warnings: string[];
  steps: SessionDraftStep[];
};

export type SessionDraftApiSuccess = {
  ok: true;
  handoff: GeneratorIntakeHandoffPayload;
  draft: SessionDraft;
};

export type SessionDraftApiError = {
  ok: false;
  error: string;
};

export type SessionDraftApiResponse = SessionDraftApiSuccess | SessionDraftApiError;

const ENVIRONMENT_LABELS: Record<SessionGeneratorEnvironment, string> = {
  pool: "Pool",
  open_water: "Open water",
};

const SESSION_TYPE_LABELS: Record<SessionGeneratorSessionType, string> = {
  recovery: "Recovery",
  endurance: "Endurance",
  technique: "Technique",
  threshold_css: "Threshold / CSS",
  speed: "Speed",
  race_pace: "Race pace",
};

const EFFORT_LABELS: Record<SessionGeneratorEffortPreset, string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
  very_hard: "Very hard",
  race_pace: "Race pace",
};

const STROKE_LABELS: Record<SessionGeneratorStroke, string> = {
  freestyle: "Freestyle",
  backstroke: "Backstroke",
  breaststroke: "Breaststroke",
  butterfly: "Butterfly",
  individual_medley: "Individual medley",
};

const EQUIPMENT_LABELS: Record<SessionGeneratorEquipment, string> = {
  kickboard: "Kickboard",
  pull_buoy: "Pull buoy",
  fins: "Fins",
  paddles: "Paddles",
  snorkel: "Snorkel",
};

const STEP_CATEGORY_LABELS: Record<SessionDraftStepCategory, string> = {
  warmup: "Warmup",
  drill: "Drill",
  kick: "Kick",
  main: "Main",
  rest: "Rest",
  cooldown: "Cooldown",
  swim: "Swim",
};

const STEP_DURATION_MODE_LABELS: Record<SessionDraftStepDurationMode, string> = {
  distance: "Distance",
  time: "Time",
  fixed_rest: "Fixed rest",
  lap_button: "Lap button press",
};

const STEP_TARGET_MODE_LABELS: Record<SessionDraftStepTargetMode, string> = {
  none: "No target",
  effort: "Effort-based",
  target_pace: "Target pace",
  css_target_pace: "CSS-based target pace",
};

export function getSessionEnvironmentLabel(value: SessionGeneratorEnvironment) {
  return ENVIRONMENT_LABELS[value];
}

export function getSessionTypeLabel(value: SessionGeneratorSessionType) {
  return SESSION_TYPE_LABELS[value];
}

export function getSessionEffortLabel(value: SessionGeneratorEffortPreset) {
  return EFFORT_LABELS[value];
}

export function getSessionStrokeLabel(value: SessionGeneratorStroke | "choice") {
  if (value === "choice") return "Stroke choice";
  return STROKE_LABELS[value];
}

export function getSessionEquipmentLabel(value: SessionGeneratorEquipment) {
  return EQUIPMENT_LABELS[value];
}

export function getSessionStepCategoryLabel(value: SessionDraftStepCategory) {
  return STEP_CATEGORY_LABELS[value];
}

export function getSessionStepDurationModeLabel(value: SessionDraftStepDurationMode) {
  return STEP_DURATION_MODE_LABELS[value];
}

export function getSessionStepTargetModeLabel(value: SessionDraftStepTargetMode) {
  return STEP_TARGET_MODE_LABELS[value];
}

export function formatPoolLengthLabel(value: SessionGeneratorPoolLength) {
  return `${value}m`;
}

export function formatPaceSecondsPer100m(value: number) {
  const totalSeconds = Math.max(1, Math.round(value));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}/100m`;
}

export function resolveSessionStepTargetMode(step: SessionDraftStep): SessionDraftStepTargetMode {
  const candidate = step.targetMode ?? "none";
  return SESSION_DRAFT_STEP_TARGET_MODES.includes(candidate) ? candidate : "none";
}

export function buildSessionStepStructuredTargetLabel(
  step: SessionDraftStep,
  basePaceSecondsPer100m: number
) {
  const targetMode = resolveSessionStepTargetMode(step);

  if (targetMode === "effort") {
    const effortTarget =
      step.effortTarget && SESSION_GENERATOR_EFFORT_PRESETS.includes(step.effortTarget)
        ? step.effortTarget
        : step.intensity;
    return `Target ${getSessionEffortLabel(effortTarget)}`;
  }

  if (targetMode === "target_pace" && step.targetPaceSecondsPer100m) {
    return `Target ${formatPaceSecondsPer100m(step.targetPaceSecondsPer100m)}`;
  }

  if (targetMode === "css_target_pace" && typeof step.cssTargetOffsetSeconds === "number") {
    const offset = Math.round(step.cssTargetOffsetSeconds);
    const sign = offset > 0 ? "+" : "";
    return `CSS ${sign}${offset}s (${formatPaceSecondsPer100m(basePaceSecondsPer100m + offset)})`;
  }

  return null;
}

export function getDefaultSessionGeneratorFormState(
  handoff: GeneratorIntakeHandoffPayload
): SessionGeneratorFormState {
  const defaultPoolLength = handoff.source.preferences?.poolLengthM;
  const defaultMinutes = handoff.effectiveDefaults.sessionMinutes;
  const defaultStrokes = deriveDefaultAllowedStrokes(handoff);

  return {
    environment: "pool",
    poolLengthM:
      defaultPoolLength && isPoolLength(defaultPoolLength) ? String(defaultPoolLength) : "25",
    sessionType: handoff.source.activeFocus ? "technique" : "endurance",
    effort: "moderate",
    sizeMode: defaultMinutes ? "estimated_time" : "distance",
    targetDistanceM: defaultMinutes ? "" : "2000",
    targetTimeMin: defaultMinutes ? String(defaultMinutes) : "45",
    includeDrills: Boolean(handoff.source.activeFocus),
    includeKick: false,
    allowedStrokes: defaultStrokes,
    equipmentAllowlist: [],
  };
}

export function normalizeSessionGeneratorFormState(
  input: Partial<SessionGeneratorFormState> | null | undefined,
  handoff: GeneratorIntakeHandoffPayload
): SessionGeneratorFormState {
  const defaults = getDefaultSessionGeneratorFormState(handoff);

  return {
    environment: isSessionEnvironment(input?.environment)
      ? input.environment
      : defaults.environment,
    poolLengthM:
      typeof input?.poolLengthM === "string" && input.poolLengthM.length > 0
        ? input.poolLengthM
        : defaults.poolLengthM,
    sessionType: isSessionType(input?.sessionType) ? input.sessionType : defaults.sessionType,
    effort: isEffortPreset(input?.effort) ? input.effort : defaults.effort,
    sizeMode: isSizeMode(input?.sizeMode) ? input.sizeMode : defaults.sizeMode,
    targetDistanceM: normalizeIntegerString(input?.targetDistanceM, 5) || defaults.targetDistanceM,
    targetTimeMin: normalizeIntegerString(input?.targetTimeMin, 3) || defaults.targetTimeMin,
    includeDrills:
      typeof input?.includeDrills === "boolean" ? input.includeDrills : defaults.includeDrills,
    includeKick: typeof input?.includeKick === "boolean" ? input.includeKick : defaults.includeKick,
    allowedStrokes: uniqueEnumList(
      input?.allowedStrokes,
      SESSION_GENERATOR_STROKES,
      defaults.allowedStrokes
    ),
    equipmentAllowlist: uniqueEnumList(
      input?.equipmentAllowlist,
      SESSION_GENERATOR_EQUIPMENT,
      defaults.equipmentAllowlist
    ),
  };
}

export function validateSessionGeneratorFormState(
  input: SessionGeneratorFormState
): { ok: true; value: SessionGeneratorInput } | { ok: false; error: string } {
  const poolLength = input.environment === "pool" ? parsePoolLength(input.poolLengthM) : null;

  if (input.environment === "pool" && poolLength === null) {
    return { ok: false, error: "Choose a supported pool length before generating a session." };
  }

  if (input.allowedStrokes.length === 0) {
    return { ok: false, error: "Select at least one stroke the swimmer can use in this session." };
  }

  const targetDistance =
    input.sizeMode === "distance" ? parsePositiveInteger(input.targetDistanceM) : null;
  const targetTime =
    input.sizeMode === "estimated_time" ? parsePositiveInteger(input.targetTimeMin) : null;

  if (input.sizeMode === "distance") {
    if (targetDistance === null) {
      return { ok: false, error: "Enter a target distance in meters for this draft." };
    }
    if (targetDistance < 400 || targetDistance > 10000) {
      return {
        ok: false,
        error: "Distance-based sessions must stay between 400m and 10000m in this first slice.",
      };
    }
  }

  if (input.sizeMode === "estimated_time") {
    if (targetTime === null) {
      return { ok: false, error: "Enter an estimated session length in minutes for this draft." };
    }
    if (targetTime < 15 || targetTime > 180) {
      return {
        ok: false,
        error: "Time-based sessions must stay between 15 and 180 minutes in this first slice.",
      };
    }
  }

  return {
    ok: true,
    value: {
      environment: input.environment,
      poolLengthM: poolLength,
      sessionType: input.sessionType,
      effort: input.effort,
      sizeMode: input.sizeMode,
      targetDistanceM: targetDistance,
      targetTimeMin: targetTime,
      includeDrills: input.includeDrills,
      includeKick: input.includeKick,
      allowedStrokes: input.allowedStrokes,
      equipmentAllowlist: input.equipmentAllowlist,
    },
  };
}

export function roundDistanceForEnvironment(
  distanceM: number,
  environment: SessionGeneratorEnvironment,
  poolLengthM: SessionGeneratorPoolLength | null
) {
  const roundingUnit = environment === "pool" ? (poolLengthM ?? 25) : 50;
  if (roundingUnit <= 0) return Math.max(0, Math.round(distanceM));
  return Math.max(roundingUnit, Math.round(distanceM / roundingUnit) * roundingUnit);
}

export function computeSessionDraftDerivedTotals(draft: SessionDraft): {
  totalDistanceM: number | null;
  estimatedDurationMin: number | null;
} {
  let totalDistanceM = 0;
  let estimatedMinutes = 0;

  for (const step of draft.steps) {
    const durationMode = resolveStepDurationMode(step);
    const repeatMultiplier =
      step.repeatGroupId && step.repeatCount && step.repeatCount >= SESSION_DRAFT_REPEAT_MIN
        ? step.repeatCount
        : 1;

    if (durationMode === "distance" && step.distanceM) {
      totalDistanceM += step.distanceM * repeatMultiplier;
      estimatedMinutes +=
        (((step.distanceM * repeatMultiplier) / 100) * resolveStepPaceSecondsPer100m(draft, step)) /
        60;
    }

    if ((durationMode === "time" || durationMode === "fixed_rest") && step.timeMin) {
      estimatedMinutes += step.timeMin * repeatMultiplier;
    }
  }

  return {
    totalDistanceM: totalDistanceM > 0 ? totalDistanceM : null,
    estimatedDurationMin: estimatedMinutes > 0 ? Math.round(estimatedMinutes) : null,
  };
}

export function buildSessionTargetSummary(draft: SessionDraft) {
  const parts = [
    draft.totalDistanceM ? `${draft.totalDistanceM}m` : null,
    draft.estimatedDurationMin ? `~${draft.estimatedDurationMin} min` : null,
    getSessionEffortLabel(draft.effort),
  ].filter(Boolean);

  return parts.join(" · ");
}

function deriveDefaultAllowedStrokes(
  handoff: GeneratorIntakeHandoffPayload
): SessionGeneratorStroke[] {
  const recordStrokes = handoff.source.personalRecords
    .map((record) => mapRecordStroke(record.stroke))
    .filter((value): value is SessionGeneratorStroke => value !== null);

  const uniqueStrokes = Array.from(new Set(recordStrokes));
  return uniqueStrokes.length > 0 ? uniqueStrokes : ["freestyle"];
}

function mapRecordStroke(value: string): SessionGeneratorStroke | null {
  if (value === "freestyle") return "freestyle";
  if (value === "backstroke") return "backstroke";
  if (value === "breaststroke") return "breaststroke";
  if (value === "butterfly") return "butterfly";
  if (value === "individual_medley") return "individual_medley";
  return null;
}

function normalizeIntegerString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/[^\d]/g, "").slice(0, maxLength);
}

function parsePositiveInteger(value: string) {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function parsePoolLength(value: string): SessionGeneratorPoolLength | null {
  if (!/^\d+(\.\d+)?$/.test(value)) return null;
  const parsed = Number.parseFloat(value);
  return isPoolLength(parsed) ? parsed : null;
}

function uniqueEnumList<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: readonly T[]
): T[] {
  if (!Array.isArray(value)) return [...fallback];

  const next = value.filter((entry): entry is T => allowed.includes(entry as T));
  return Array.from(new Set(next));
}

function isPoolLength(value: number): value is SessionGeneratorPoolLength {
  return SESSION_GENERATOR_POOL_LENGTHS.includes(value as SessionGeneratorPoolLength);
}

function isSessionEnvironment(value: unknown): value is SessionGeneratorEnvironment {
  return SESSION_GENERATOR_ENVIRONMENTS.includes(value as SessionGeneratorEnvironment);
}

function isSessionType(value: unknown): value is SessionGeneratorSessionType {
  return SESSION_GENERATOR_SESSION_TYPES.includes(value as SessionGeneratorSessionType);
}

function isEffortPreset(value: unknown): value is SessionGeneratorEffortPreset {
  return SESSION_GENERATOR_EFFORT_PRESETS.includes(value as SessionGeneratorEffortPreset);
}

function isSizeMode(value: unknown): value is SessionGeneratorSizeMode {
  return SESSION_GENERATOR_SIZE_MODES.includes(value as SessionGeneratorSizeMode);
}

function getIntensityMultiplier(value: SessionGeneratorEffortPreset) {
  switch (value) {
    case "easy":
      return 1.12;
    case "moderate":
      return 1.06;
    case "hard":
      return 1;
    case "very_hard":
      return 0.96;
    case "race_pace":
      return 0.93;
  }
}

function resolveStepDurationMode(step: SessionDraftStep): SessionDraftStepDurationMode {
  const candidate = step.durationMode;
  return SESSION_DRAFT_STEP_DURATION_MODES.includes(candidate) ? candidate : "distance";
}

function resolveStepPaceSecondsPer100m(draft: SessionDraft, step: SessionDraftStep) {
  const targetMode = resolveSessionStepTargetMode(step);

  if (targetMode === "target_pace" && step.targetPaceSecondsPer100m) {
    return step.targetPaceSecondsPer100m;
  }

  if (targetMode === "css_target_pace" && typeof step.cssTargetOffsetSeconds === "number") {
    return Math.max(1, draft.basePaceSecondsPer100m + Math.round(step.cssTargetOffsetSeconds));
  }

  const effectiveEffort =
    targetMode === "effort" &&
    step.effortTarget &&
    SESSION_GENERATOR_EFFORT_PRESETS.includes(step.effortTarget)
      ? step.effortTarget
      : step.intensity;

  return draft.basePaceSecondsPer100m * getIntensityMultiplier(effectiveEffort);
}
