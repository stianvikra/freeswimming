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
  "technical_fault_correction",
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
export const SESSION_DRAFT_STEP_INTENSITY_PRESETS = [
  "recovery",
  "easy",
  "moderate",
  "hard",
  "very_hard",
  "race_pace",
  "all_out",
  "ascending",
  "descending",
] as const;
export const SESSION_GENERATOR_SIZE_MODES = ["distance", "estimated_time"] as const;
export const SESSION_GENERATOR_VOLUME_MODES = ["coach_decides", "explicit"] as const;
export const SESSION_GENERATOR_REST_MODES = ["coach_decides", "explicit"] as const;
export const SESSION_GENERATOR_SKILL_LIMIT_MODES = ["profile", "override"] as const;
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
export const SESSION_DRAFT_STEP_STROKES = [
  "choice",
  "freestyle",
  "backstroke",
  "breaststroke",
  "butterfly",
  "individual_medley",
  "im_by_round",
  "reverse_im_order",
  "mixed",
  "drill",
] as const;
export const SESSION_DRAFT_STEP_DRILL_TYPES = ["none", "kick", "pull", "drill"] as const;
export const SESSION_DRAFT_STEP_EQUIPMENT = [
  "none",
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
  "send_off",
  "css_send_off",
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
export const SESSION_DRAFT_STEP_DISTANCE_PRESETS = [
  25, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500,
] as const;
export const SESSION_DRAFT_REPEAT_MIN = 2;
export const SESSION_DRAFT_REPEAT_MAX = 20;
export const SESSION_DRAFT_REPEAT_ENDING_REST_MODES = ["use_last_rest", "skip_last_rest"] as const;
export const SESSION_DRAFT_POOL_LENGTH_UNITS = ["m", "yd"] as const;
export const SESSION_DRAFT_POOL_LENGTH_PRESETS = [12.5, 25, 50] as const;
export const SESSION_DRAFT_POOL_LENGTH_MIN = 12.5;
export const SESSION_DRAFT_POOL_LENGTH_MAX = 500;
export const METERS_PER_YARD = 0.9144;
const WORKOUT_DISTANCE_PRECISION_FACTOR = 10000;

export type SessionGeneratorEnvironment = (typeof SESSION_GENERATOR_ENVIRONMENTS)[number];
export type SessionGeneratorPoolLength = (typeof SESSION_GENERATOR_POOL_LENGTHS)[number];
export type SessionGeneratorSessionType = (typeof SESSION_GENERATOR_SESSION_TYPES)[number];
export type SessionGeneratorEffortPreset = (typeof SESSION_GENERATOR_EFFORT_PRESETS)[number];
export type SessionDraftStepIntensityPreset = (typeof SESSION_DRAFT_STEP_INTENSITY_PRESETS)[number];
export type SessionGeneratorSizeMode = (typeof SESSION_GENERATOR_SIZE_MODES)[number];
export type SessionGeneratorVolumeMode = (typeof SESSION_GENERATOR_VOLUME_MODES)[number];
export type SessionGeneratorRestMode = (typeof SESSION_GENERATOR_REST_MODES)[number];
export type SessionGeneratorSkillLimitMode = (typeof SESSION_GENERATOR_SKILL_LIMIT_MODES)[number];
export type SessionGeneratorStroke = (typeof SESSION_GENERATOR_STROKES)[number];
export type SessionGeneratorEquipment = (typeof SESSION_GENERATOR_EQUIPMENT)[number];
export type SessionDraftPoolLengthPreset = (typeof SESSION_DRAFT_POOL_LENGTH_PRESETS)[number];
export type SessionDraftStepStroke = (typeof SESSION_DRAFT_STEP_STROKES)[number];
export type SessionDraftStepDrillType = (typeof SESSION_DRAFT_STEP_DRILL_TYPES)[number];
export type SessionDraftStepEquipment = (typeof SESSION_DRAFT_STEP_EQUIPMENT)[number];
export type SessionDraftStepCategory = (typeof SESSION_DRAFT_STEP_CATEGORIES)[number];
export type SessionDraftStepDurationMode = (typeof SESSION_DRAFT_STEP_DURATION_MODES)[number];
export type SessionDraftStepTargetMode = (typeof SESSION_DRAFT_STEP_TARGET_MODES)[number];
export type SessionDraftStepDistancePreset = (typeof SESSION_DRAFT_STEP_DISTANCE_PRESETS)[number];
export type SessionDraftRepeatEndingRestMode =
  (typeof SESSION_DRAFT_REPEAT_ENDING_REST_MODES)[number];
export type SessionDraftPoolLengthUnit = (typeof SESSION_DRAFT_POOL_LENGTH_UNITS)[number];
export type SessionDraftPoolLength = number;

export type SessionGeneratorStrokeLimitFormState = Record<
  SessionGeneratorStroke,
  {
    maxRepeatDistance: string;
    maxTotalDistance: string;
  }
>;

export type SessionGeneratorSkillLimits = {
  source: "profile" | "override" | "none";
  drill: {
    maxRepeatDistanceM: number | null;
    targetTotalDistanceM: number | null;
  };
  kick: {
    maxRepeatDistanceM: number | null;
    targetTotalDistanceM: number | null;
  };
  strokes: Partial<
    Record<
      SessionGeneratorStroke,
      {
        maxRepeatDistanceM: number | null;
        maxTotalDistanceM: number | null;
      }
    >
  >;
};

export type SessionGeneratorFormState = {
  environment: SessionGeneratorEnvironment;
  poolLengthM: string;
  poolLengthUnit: SessionDraftPoolLengthUnit;
  sessionType: SessionGeneratorSessionType;
  effort: SessionGeneratorEffortPreset;
  sizeMode: SessionGeneratorSizeMode;
  targetDistanceM: string;
  targetTimeMin: string;
  includeDrills: boolean;
  drillVolumeMode: SessionGeneratorVolumeMode;
  drillTargetMeters: string;
  drillMaxRepeatDistance: string;
  drillApproxTotalDistance: string;
  includeKick: boolean;
  kickVolumeMode: SessionGeneratorVolumeMode;
  kickTargetMeters: string;
  kickIntervalMeters: string;
  kickApproxTotalDistance: string;
  skillLimitMode: SessionGeneratorSkillLimitMode;
  strokeLimits: SessionGeneratorStrokeLimitFormState;
  restMode: SessionGeneratorRestMode;
  restSeconds: string;
  allowedStrokes: SessionGeneratorStroke[];
  equipmentAllowlist: SessionGeneratorEquipment[];
};

export type SessionGeneratorInput = {
  environment: SessionGeneratorEnvironment;
  poolLengthM: number | null;
  poolLengthUnit: SessionDraftPoolLengthUnit;
  sessionType: SessionGeneratorSessionType;
  effort: SessionGeneratorEffortPreset;
  sizeMode: SessionGeneratorSizeMode;
  targetDistanceM: number | null;
  targetTimeMin: number | null;
  includeDrills: boolean;
  drillVolumeMode: SessionGeneratorVolumeMode;
  drillTargetMeters: number | null;
  drillMaxRepeatDistanceM: number | null;
  includeKick: boolean;
  kickVolumeMode: SessionGeneratorVolumeMode;
  kickTargetMeters: number | null;
  kickIntervalMeters: number | null;
  skillLimits: SessionGeneratorSkillLimits;
  restMode: SessionGeneratorRestMode;
  restSeconds: number | null;
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
  stroke: SessionDraftStepStroke;
  drillType?: SessionDraftStepDrillType | null;
  equipment?: SessionDraftStepEquipment | null;
  intensity: SessionDraftStepIntensityPreset;
  durationMode: SessionDraftStepDurationMode;
  distanceM: number | null;
  timeMin: number | null;
  targetMode?: SessionDraftStepTargetMode | null;
  effortTarget?: SessionDraftStepIntensityPreset | null;
  targetPaceSecondsPer100m?: number | null;
  cssTargetOffsetSeconds?: number | null;
  cssSendOffOffsetSeconds?: number | null;
  targetSummary: string;
  notes: string;
  repeatGroupId?: string | null;
  repeatCount?: number | null;
  repeatEndingRestMode?: SessionDraftRepeatEndingRestMode | null;
  postSetRestForRepeatGroupId?: string | null;
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
  poolLengthUnit?: SessionDraftPoolLengthUnit | null;
  poolLengthM: SessionDraftPoolLength | null;
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
  technical_fault_correction: "Fault correction",
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

const STEP_INTENSITY_LABELS: Record<SessionDraftStepIntensityPreset, string> = {
  recovery: "Recovery",
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
  very_hard: "Very hard",
  race_pace: "Race pace",
  all_out: "All out",
  ascending: "Ascending",
  descending: "Descending",
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

const STEP_STROKE_LABELS: Record<SessionDraftStepStroke, string> = {
  choice: "Choice",
  freestyle: "Freestyle",
  backstroke: "Backstroke",
  breaststroke: "Breaststroke",
  butterfly: "Butterfly",
  individual_medley: "Individual medley (IM)",
  im_by_round: "IM by round",
  reverse_im_order: "Reverse IM order (RIMO)",
  mixed: "Mixed",
  drill: "Drill",
};

const STEP_DRILL_TYPE_LABELS: Record<SessionDraftStepDrillType, string> = {
  none: "None",
  kick: "Kick",
  pull: "Pull",
  drill: "Drill",
};

const STEP_EQUIPMENT_LABELS: Record<SessionDraftStepEquipment, string> = {
  none: "None",
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
  send_off: "Send-off time",
  css_send_off: "CSS-based send-off",
};

const STEP_TARGET_MODE_LABELS: Record<SessionDraftStepTargetMode, string> = {
  none: "No target",
  effort: "Effort-based",
  target_pace: "Target pace",
  css_target_pace: "CSS-based target pace",
};

const REPEAT_ENDING_REST_MODE_LABELS: Record<SessionDraftRepeatEndingRestMode, string> = {
  use_last_rest: "Use repeat rest time",
  skip_last_rest: "Use separate rest step",
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

export function getDefaultEffortForSessionType(
  sessionType: SessionGeneratorSessionType
): SessionGeneratorEffortPreset {
  switch (sessionType) {
    case "recovery":
      return "easy";
    case "technique":
    case "technical_fault_correction":
      return "easy";
    case "threshold_css":
    case "race_pace":
      return "hard";
    case "speed":
      return "very_hard";
    case "endurance":
    default:
      return "moderate";
  }
}

export function getSessionStepIntensityLabel(value: SessionDraftStepIntensityPreset) {
  return STEP_INTENSITY_LABELS[value];
}

export function getSessionStrokeLabel(value: SessionGeneratorStroke | "choice") {
  if (value === "choice") return "Stroke choice";
  return STROKE_LABELS[value];
}

export function getSessionStepStrokeLabel(value: SessionDraftStepStroke) {
  return STEP_STROKE_LABELS[value];
}

export function getSessionStepDrillTypeLabel(value: SessionDraftStepDrillType) {
  return STEP_DRILL_TYPE_LABELS[value];
}

export function getSessionEquipmentLabel(value: SessionGeneratorEquipment) {
  return EQUIPMENT_LABELS[value];
}

export function getSessionStepEquipmentLabel(value: SessionDraftStepEquipment) {
  return STEP_EQUIPMENT_LABELS[value];
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

export function getSessionDraftRepeatEndingRestModeLabel(value: SessionDraftRepeatEndingRestMode) {
  return REPEAT_ENDING_REST_MODE_LABELS[value];
}

export function resolveSessionDraftPoolLengthUnit(value: unknown): SessionDraftPoolLengthUnit {
  return SESSION_DRAFT_POOL_LENGTH_UNITS.includes(value as SessionDraftPoolLengthUnit)
    ? (value as SessionDraftPoolLengthUnit)
    : "m";
}

export function convertPoolUnitValueToMeters(value: number, unit: SessionDraftPoolLengthUnit) {
  const normalized = unit === "yd" ? value * METERS_PER_YARD : value;
  return (
    Math.round(normalized * WORKOUT_DISTANCE_PRECISION_FACTOR) / WORKOUT_DISTANCE_PRECISION_FACTOR
  );
}

export function convertMetersToPoolUnitValue(value: number, unit: SessionDraftPoolLengthUnit) {
  const normalized = unit === "yd" ? value / METERS_PER_YARD : value;
  return (
    Math.round(normalized * WORKOUT_DISTANCE_PRECISION_FACTOR) / WORKOUT_DISTANCE_PRECISION_FACTOR
  );
}

function formatWorkoutUnitValue(value: number) {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

export function formatPoolLengthLabel(value: number, unit: SessionDraftPoolLengthUnit = "m") {
  return `${formatWorkoutUnitValue(convertMetersToPoolUnitValue(value, unit))}${unit}`;
}

export function formatDistanceMetersLabel(value: number, unit: SessionDraftPoolLengthUnit = "m") {
  return `${formatWorkoutUnitValue(convertMetersToPoolUnitValue(value, unit))}${unit}`;
}

export function normalizeSessionDraftPoolLength(value: unknown): SessionDraft["poolLengthM"] {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  const normalized = Math.round(value * 100) / 100;
  if (normalized < SESSION_DRAFT_POOL_LENGTH_MIN || normalized > SESSION_DRAFT_POOL_LENGTH_MAX) {
    return null;
  }

  return normalized;
}

export function isSessionDraftPoolLengthPreset(
  value: number
): value is SessionDraftPoolLengthPreset {
  return SESSION_DRAFT_POOL_LENGTH_PRESETS.includes(value as SessionDraftPoolLengthPreset);
}

export function isSessionDraftStepDistancePreset(
  value: number
): value is SessionDraftStepDistancePreset {
  return SESSION_DRAFT_STEP_DISTANCE_PRESETS.includes(value as SessionDraftStepDistancePreset);
}

export function formatPaceSecondsPer100m(value: number, unit: SessionDraftPoolLengthUnit = "m") {
  const normalizedSeconds =
    unit === "yd"
      ? Math.max(1, Math.round(value * METERS_PER_YARD))
      : Math.max(1, Math.round(value));
  const totalSeconds = normalizedSeconds;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}/100${unit}`;
}

export function resolveSessionStepTargetMode(step: SessionDraftStep): SessionDraftStepTargetMode {
  const candidate = step.targetMode ?? "none";
  return SESSION_DRAFT_STEP_TARGET_MODES.includes(candidate) ? candidate : "none";
}

export function resolveSessionDraftRepeatEndingRestMode(
  value: SessionDraftStep["repeatEndingRestMode"]
): SessionDraftRepeatEndingRestMode {
  return SESSION_DRAFT_REPEAT_ENDING_REST_MODES.includes(value as SessionDraftRepeatEndingRestMode)
    ? (value as SessionDraftRepeatEndingRestMode)
    : "use_last_rest";
}

export function isSessionDraftRepeatEndingRestStep(step: SessionDraftStep) {
  return step.category === "rest";
}

export function isSessionDraftRepeatPostSetRestStep(step: SessionDraftStep) {
  return Boolean(step.postSetRestForRepeatGroupId && !step.repeatGroupId);
}

export function buildSessionStepStructuredTargetLabel(
  step: SessionDraftStep,
  basePaceSecondsPer100m: number,
  unit: SessionDraftPoolLengthUnit = "m"
) {
  const targetMode = resolveSessionStepTargetMode(step);

  if (targetMode === "effort") {
    const effortTarget =
      step.effortTarget && SESSION_DRAFT_STEP_INTENSITY_PRESETS.includes(step.effortTarget)
        ? step.effortTarget
        : step.intensity;
    return getSessionStepIntensityLabel(effortTarget);
  }

  if (targetMode === "target_pace" && step.targetPaceSecondsPer100m) {
    return `Target ${formatPaceSecondsPer100m(step.targetPaceSecondsPer100m, unit)}`;
  }

  if (targetMode === "css_target_pace" && typeof step.cssTargetOffsetSeconds === "number") {
    const offset = Math.round(step.cssTargetOffsetSeconds);
    const sign = offset > 0 ? "+" : "";
    return `CSS ${sign}${offset}s (${formatPaceSecondsPer100m(
      basePaceSecondsPer100m + offset,
      unit
    )})`;
  }

  return null;
}

export function getDefaultSessionGeneratorFormState(
  handoff: GeneratorIntakeHandoffPayload
): SessionGeneratorFormState {
  const defaultPoolLength = handoff.source.preferences?.poolLengthM;
  const defaultMinutes = handoff.effectiveDefaults.sessionMinutes;
  const defaultStrokes = deriveDefaultAllowedStrokes(handoff);
  const sessionType: SessionGeneratorSessionType = "endurance";
  const poolLengthUnit: SessionDraftPoolLengthUnit = "m";
  const profileLimits = buildSkillLimitFormStateFromHandoff(handoff, poolLengthUnit);
  const hasProfileSkillLimits = handoff.source.swimCapabilityLimits.length > 0;

  return {
    environment: "pool",
    poolLengthM:
      defaultPoolLength && isPoolLength(defaultPoolLength) ? String(defaultPoolLength) : "25",
    poolLengthUnit,
    sessionType,
    effort: getDefaultEffortForSessionType(sessionType),
    sizeMode: defaultMinutes ? "estimated_time" : "distance",
    targetDistanceM: defaultMinutes ? "" : "2000",
    targetTimeMin: defaultMinutes ? String(defaultMinutes) : "45",
    includeDrills: false,
    drillVolumeMode: "coach_decides",
    drillTargetMeters: "300",
    drillMaxRepeatDistance: profileLimits.drillMaxRepeatDistance,
    drillApproxTotalDistance: profileLimits.drillApproxTotalDistance,
    includeKick: false,
    kickVolumeMode: "coach_decides",
    kickTargetMeters: "200",
    kickIntervalMeters: profileLimits.kickMaxRepeatDistance || "50",
    kickApproxTotalDistance: profileLimits.kickApproxTotalDistance,
    skillLimitMode: hasProfileSkillLimits ? "profile" : "override",
    strokeLimits: profileLimits.strokeLimits,
    restMode: "coach_decides",
    restSeconds: "20",
    allowedStrokes: defaultStrokes,
    equipmentAllowlist: [],
  };
}

export function normalizeSessionGeneratorFormState(
  input: Partial<SessionGeneratorFormState> | null | undefined,
  handoff: GeneratorIntakeHandoffPayload
): SessionGeneratorFormState {
  const defaults = getDefaultSessionGeneratorFormState(handoff);
  const sessionType = isSessionType(input?.sessionType) ? input.sessionType : defaults.sessionType;
  const poolLengthUnit = resolveSessionDraftPoolLengthUnit(input?.poolLengthUnit);
  const profileLimits = buildSkillLimitFormStateFromHandoff(handoff, poolLengthUnit);
  const hasProfileSkillLimits = handoff.source.swimCapabilityLimits.length > 0;
  const requestedSkillLimitMode = isSkillLimitMode(input?.skillLimitMode)
    ? input.skillLimitMode
    : defaults.skillLimitMode;
  const skillLimitMode: SessionGeneratorSkillLimitMode = hasProfileSkillLimits
    ? requestedSkillLimitMode
    : "override";
  const shouldUseProfileLimitFallback = hasProfileSkillLimits && skillLimitMode === "profile";
  const limitInput = !hasProfileSkillLimits && requestedSkillLimitMode === "profile" ? null : input;

  return {
    environment: isSessionEnvironment(input?.environment)
      ? input.environment
      : defaults.environment,
    poolLengthM:
      typeof input?.poolLengthM === "string" && input.poolLengthM.length > 0
        ? input.poolLengthM
        : defaults.poolLengthM,
    poolLengthUnit,
    sessionType,
    effort: getDefaultEffortForSessionType(sessionType),
    sizeMode: isSizeMode(input?.sizeMode) ? input.sizeMode : defaults.sizeMode,
    targetDistanceM: normalizeIntegerString(input?.targetDistanceM, 5) || defaults.targetDistanceM,
    targetTimeMin: normalizeIntegerString(input?.targetTimeMin, 3) || defaults.targetTimeMin,
    includeDrills:
      typeof input?.includeDrills === "boolean" ? input.includeDrills : defaults.includeDrills,
    drillVolumeMode: isVolumeMode(input?.drillVolumeMode)
      ? input.drillVolumeMode
      : defaults.drillVolumeMode,
    drillTargetMeters:
      normalizeIntegerString(input?.drillTargetMeters, 5) || defaults.drillTargetMeters,
    drillMaxRepeatDistance:
      normalizeDecimalString(limitInput?.drillMaxRepeatDistance, 5) ||
      (shouldUseProfileLimitFallback ? profileLimits.drillMaxRepeatDistance : ""),
    drillApproxTotalDistance:
      normalizeDecimalString(limitInput?.drillApproxTotalDistance, 5) ||
      (shouldUseProfileLimitFallback ? profileLimits.drillApproxTotalDistance : ""),
    includeKick: typeof input?.includeKick === "boolean" ? input.includeKick : defaults.includeKick,
    kickVolumeMode: isVolumeMode(input?.kickVolumeMode)
      ? input.kickVolumeMode
      : defaults.kickVolumeMode,
    kickTargetMeters:
      normalizeIntegerString(input?.kickTargetMeters, 5) || defaults.kickTargetMeters,
    kickIntervalMeters:
      normalizeDecimalString(limitInput?.kickIntervalMeters, 5) ||
      (shouldUseProfileLimitFallback ? profileLimits.kickMaxRepeatDistance : "") ||
      defaults.kickIntervalMeters,
    kickApproxTotalDistance:
      normalizeDecimalString(limitInput?.kickApproxTotalDistance, 5) ||
      (shouldUseProfileLimitFallback ? profileLimits.kickApproxTotalDistance : ""),
    skillLimitMode,
    strokeLimits: normalizeStrokeLimitFormState(
      limitInput?.strokeLimits,
      shouldUseProfileLimitFallback ? profileLimits.strokeLimits : createEmptyStrokeLimitFormState()
    ),
    restMode: isRestMode(input?.restMode) ? input.restMode : defaults.restMode,
    restSeconds: normalizeIntegerString(input?.restSeconds, 3) || defaults.restSeconds,
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
  input: SessionGeneratorFormState,
  handoff?: GeneratorIntakeHandoffPayload
): { ok: true; value: SessionGeneratorInput } | { ok: false; error: string } {
  const poolLengthUnit = input.environment === "pool" ? input.poolLengthUnit : "m";
  const poolLength =
    input.environment === "pool" ? parsePoolLength(input.poolLengthM, poolLengthUnit) : null;
  const distanceUnitLabel = input.environment === "pool" ? poolLengthUnit : "m";

  if (input.environment === "pool" && poolLength === null) {
    return { ok: false, error: "Choose a supported pool length before generating a session." };
  }

  if (input.allowedStrokes.length === 0) {
    return { ok: false, error: "Select at least one stroke the swimmer can use in this session." };
  }

  const targetDistance =
    input.sizeMode === "distance"
      ? parsePositiveDistanceAsMeters(input.targetDistanceM, distanceUnitLabel)
      : null;
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
      return { ok: false, error: "Enter a duration in minutes." };
    }
    if (targetTime > 600) {
      return {
        ok: false,
        error: "Session time limit exceeded. Use 600 min or less.",
      };
    }
  }

  const drillTargetMeters =
    input.includeDrills && input.drillVolumeMode === "explicit"
      ? parsePositiveDistanceAsMeters(input.drillTargetMeters, distanceUnitLabel)
      : null;
  const skillLimits = buildSkillLimitsFromFormState(input, distanceUnitLabel, handoff);
  if (skillLimits === null) {
    return {
      ok: false,
      error: `Use valid ${distanceUnitLabel} values for stroke and skill limits.`,
    };
  }

  if (input.includeDrills && input.drillVolumeMode === "explicit") {
    if (drillTargetMeters === null) {
      return { ok: false, error: "Enter drill distance or switch drills back to Coach decides." };
    }
    if (drillTargetMeters < 25 || drillTargetMeters > 3000) {
      return { ok: false, error: "Drill volume must stay between 25m and 3000m." };
    }
    if (input.environment === "pool" && poolLength && drillTargetMeters < poolLength) {
      return { ok: false, error: "Drill distance must be at least one pool length." };
    }
  }

  const kickTargetMeters =
    input.includeKick && input.kickVolumeMode === "explicit"
      ? parsePositiveDistanceAsMeters(input.kickTargetMeters, distanceUnitLabel)
      : null;
  const parsedKickIntervalMeters =
    input.includeKick && input.kickVolumeMode === "explicit" && input.kickIntervalMeters
      ? parsePositiveDistanceAsMeters(input.kickIntervalMeters, distanceUnitLabel)
      : null;
  const kickIntervalMeters =
    input.includeKick && input.kickVolumeMode === "explicit"
      ? (parsedKickIntervalMeters ?? skillLimits.kick.maxRepeatDistanceM)
      : null;
  if (input.includeKick && input.kickVolumeMode === "explicit") {
    if (input.kickIntervalMeters && parsedKickIntervalMeters === null) {
      return {
        ok: false,
        error: "Use a valid max kick repeat or leave it blank to use the Swim Profile limit.",
      };
    }
    if (kickTargetMeters === null || kickIntervalMeters === null) {
      return {
        ok: false,
        error: "Enter kick distance and max kick repeat or switch kick back to Coach decides.",
      };
    }
    if (kickTargetMeters < 25 || kickTargetMeters > 3000) {
      return { ok: false, error: "Kick volume must stay between 25m and 3000m." };
    }
    if (input.environment === "pool" && poolLength && kickTargetMeters < poolLength) {
      return { ok: false, error: "Kick distance must be at least one pool length." };
    }
    if (kickIntervalMeters < 25 || kickIntervalMeters > 400) {
      return { ok: false, error: "Max kick repeat must stay between 25m and 400m." };
    }
  }

  if (
    input.includeDrills &&
    skillLimits.drill.maxRepeatDistanceM &&
    drillTargetMeters &&
    skillLimits.drill.maxRepeatDistanceM > drillTargetMeters
  ) {
    return { ok: false, error: "Drill max length cannot be longer than drill total." };
  }

  if (
    input.environment === "pool" &&
    input.includeDrills &&
    poolLength &&
    skillLimits.drill.maxRepeatDistanceM &&
    skillLimits.drill.maxRepeatDistanceM < poolLength
  ) {
    return { ok: false, error: "Drill max length must be at least one pool length." };
  }

  if (
    input.environment === "pool" &&
    input.includeDrills &&
    poolLength &&
    skillLimits.drill.targetTotalDistanceM &&
    skillLimits.drill.targetTotalDistanceM < poolLength
  ) {
    return { ok: false, error: "Drill approx per session must be at least one pool length." };
  }

  if (
    input.includeDrills &&
    drillTargetMeters &&
    skillLimits.drill.targetTotalDistanceM &&
    drillTargetMeters > skillLimits.drill.targetTotalDistanceM
  ) {
    return {
      ok: false,
      error: "Drill distance cannot exceed drill approx per session.",
    };
  }

  if (
    input.includeKick &&
    skillLimits.kick.maxRepeatDistanceM &&
    kickTargetMeters &&
    skillLimits.kick.maxRepeatDistanceM > kickTargetMeters
  ) {
    return { ok: false, error: "Kick max length cannot be longer than kick total." };
  }

  if (
    input.environment === "pool" &&
    input.includeKick &&
    poolLength &&
    skillLimits.kick.maxRepeatDistanceM &&
    skillLimits.kick.maxRepeatDistanceM < poolLength
  ) {
    return { ok: false, error: "Kick max length must be at least one pool length." };
  }

  if (
    input.environment === "pool" &&
    input.includeKick &&
    poolLength &&
    skillLimits.kick.targetTotalDistanceM &&
    skillLimits.kick.targetTotalDistanceM < poolLength
  ) {
    return { ok: false, error: "Kick approx per session must be at least one pool length." };
  }

  if (
    input.includeKick &&
    kickTargetMeters &&
    skillLimits.kick.targetTotalDistanceM &&
    kickTargetMeters > skillLimits.kick.targetTotalDistanceM
  ) {
    return {
      ok: false,
      error: "Kick distance cannot exceed kick approx per session.",
    };
  }

  if (
    input.environment === "pool" &&
    input.sizeMode === "distance" &&
    targetDistance &&
    poolLength
  ) {
    const expectedDrillDistance =
      input.includeDrills && input.drillVolumeMode === "explicit"
        ? (drillTargetMeters ?? 0)
        : input.includeDrills
          ? (skillLimits.drill.targetTotalDistanceM ?? poolLength)
          : 0;
    const expectedKickDistance =
      input.includeKick && input.kickVolumeMode === "explicit"
        ? (kickTargetMeters ?? 0)
        : input.includeKick
          ? (skillLimits.kick.targetTotalDistanceM ?? poolLength)
          : 0;
    const minimumCoreDistance = poolLength * 3;

    if (expectedDrillDistance + expectedKickDistance + minimumCoreDistance > targetDistance) {
      return {
        ok: false,
        error:
          "Session Rules leave no room for warmup, main work, and cooldown. Lower drill/kick distance or raise the target distance.",
      };
    }
  }

  if (input.allowedStrokes.length === 1 && targetDistance !== null) {
    const onlyStroke = input.allowedStrokes[0];
    const limit = onlyStroke ? skillLimits.strokes[onlyStroke] : null;
    if (limit?.maxTotalDistanceM && limit.maxTotalDistanceM < targetDistance) {
      return {
        ok: false,
        error:
          "Selected stroke limits are lower than the target distance. Add another stroke or lower the session size.",
      };
    }
  }

  const restSeconds =
    input.restMode === "explicit" ? parsePositiveInteger(input.restSeconds) : null;
  if (input.restMode === "explicit") {
    if (restSeconds === null) {
      return { ok: false, error: "Enter rest seconds or switch rest back to Coach decides." };
    }
    if (restSeconds < 5 || restSeconds > 180) {
      return { ok: false, error: "Rest preference must stay between 5 and 180 seconds." };
    }
  }

  return {
    ok: true,
    value: {
      environment: input.environment,
      poolLengthM: poolLength,
      poolLengthUnit,
      sessionType: input.sessionType,
      effort: getDefaultEffortForSessionType(input.sessionType),
      sizeMode: input.sizeMode,
      targetDistanceM: targetDistance,
      targetTimeMin: targetTime,
      includeDrills: input.includeDrills,
      drillVolumeMode: input.drillVolumeMode,
      drillTargetMeters,
      drillMaxRepeatDistanceM: skillLimits.drill.maxRepeatDistanceM,
      includeKick: input.includeKick,
      kickVolumeMode: input.kickVolumeMode,
      kickTargetMeters,
      kickIntervalMeters,
      skillLimits,
      restMode: input.restMode,
      restSeconds,
      allowedStrokes: input.allowedStrokes,
      equipmentAllowlist: input.equipmentAllowlist,
    },
  };
}

export function roundDistanceForEnvironment(
  distanceM: number,
  environment: SessionGeneratorEnvironment,
  poolLengthM: number | null
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
  const suppressedPostSetRestGroupIds = collectSuppressedPostSetRestGroupIds(draft.steps);

  for (let index = 0; index < draft.steps.length; index += 1) {
    const step = draft.steps[index];

    if (!step) continue;

    if (
      isSessionDraftRepeatPostSetRestStep(step) &&
      suppressedPostSetRestGroupIds.has(step.postSetRestForRepeatGroupId ?? "")
    ) {
      continue;
    }

    const repeatCount =
      step.repeatGroupId && step.repeatCount && step.repeatCount >= SESSION_DRAFT_REPEAT_MIN
        ? step.repeatCount
        : 1;
    const isRepeatGroupStart =
      Boolean(step.repeatGroupId) &&
      (index === 0 || draft.steps[index - 1]?.repeatGroupId !== step.repeatGroupId);

    if (step.repeatGroupId && !isRepeatGroupStart) {
      continue;
    }

    const groupSteps: SessionDraftStep[] = [step];
    if (step.repeatGroupId) {
      let nextIndex = index + 1;
      while (draft.steps[nextIndex]?.repeatGroupId === step.repeatGroupId) {
        const nextStep = draft.steps[nextIndex];
        if (!nextStep) break;
        groupSteps.push(nextStep);
        nextIndex += 1;
      }
      index = nextIndex - 1;
    }

    const repeatEndingRestMode = resolveSessionDraftRepeatEndingRestMode(
      step.repeatEndingRestMode ?? null
    );
    const lastGroupStep = groupSteps[groupSteps.length - 1] ?? null;
    const shouldSkipLastRest =
      repeatCount > 1 &&
      repeatEndingRestMode === "skip_last_rest" &&
      Boolean(lastGroupStep && isSessionDraftRepeatEndingRestStep(lastGroupStep));

    for (const [groupStepIndex, groupStep] of groupSteps.entries()) {
      const durationMode = resolveStepDurationMode(groupStep);
      const repeatMultiplier =
        shouldSkipLastRest && groupStepIndex === groupSteps.length - 1
          ? Math.max(0, repeatCount - 1)
          : repeatCount;

      if (durationMode === "distance" && groupStep.distanceM) {
        totalDistanceM += groupStep.distanceM * repeatMultiplier;
        estimatedMinutes +=
          (((groupStep.distanceM * repeatMultiplier) / 100) *
            resolveStepPaceSecondsPer100m(draft, groupStep)) /
          60;
      }

      if (
        (durationMode === "time" || durationMode === "fixed_rest" || durationMode === "send_off") &&
        groupStep.timeMin
      ) {
        estimatedMinutes += groupStep.timeMin * repeatMultiplier;
      }

      if (
        durationMode === "css_send_off" &&
        typeof groupStep.cssSendOffOffsetSeconds === "number"
      ) {
        estimatedMinutes +=
          (Math.max(
            1,
            draft.basePaceSecondsPer100m + Math.round(groupStep.cssSendOffOffsetSeconds)
          ) *
            repeatMultiplier) /
          60;
      }
    }
  }

  return {
    totalDistanceM:
      totalDistanceM > 0
        ? Math.round(totalDistanceM * WORKOUT_DISTANCE_PRECISION_FACTOR) /
          WORKOUT_DISTANCE_PRECISION_FACTOR
        : null,
    estimatedDurationMin: estimatedMinutes > 0 ? Math.round(estimatedMinutes) : null,
  };
}

export function buildSessionTargetSummary(draft: SessionDraft) {
  const poolLengthUnit =
    draft.environment === "pool" ? resolveSessionDraftPoolLengthUnit(draft.poolLengthUnit) : "m";
  const parts = [
    draft.totalDistanceM ? formatDistanceMetersLabel(draft.totalDistanceM, poolLengthUnit) : null,
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

function collectSuppressedPostSetRestGroupIds(steps: SessionDraftStep[]) {
  const suppressedGroupIds = new Set<string>();

  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    if (!step?.repeatGroupId) continue;

    const entries: SessionDraftStep[] = [step];
    let nextIndex = index + 1;
    while (steps[nextIndex]?.repeatGroupId === step.repeatGroupId) {
      const nextStep = steps[nextIndex];
      if (!nextStep) break;
      entries.push(nextStep);
      nextIndex += 1;
    }

    const lastEntry = entries[entries.length - 1];
    const repeatEndingRestMode = resolveSessionDraftRepeatEndingRestMode(
      step.repeatEndingRestMode ?? null
    );
    if (
      repeatEndingRestMode === "use_last_rest" &&
      lastEntry &&
      isSessionDraftRepeatEndingRestStep(lastEntry)
    ) {
      suppressedGroupIds.add(step.repeatGroupId);
    }

    index = nextIndex - 1;
  }

  return suppressedGroupIds;
}

function normalizeIntegerString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/[^\d]/g, "").slice(0, maxLength);
}

function normalizeDecimalString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  const normalized = value.replace(/[^\d.]/g, "").slice(0, maxLength);
  const [whole = "", ...decimalParts] = normalized.split(".");
  if (decimalParts.length === 0) return whole;
  return `${whole}.${decimalParts.join("").slice(0, 2)}`;
}

function parsePositiveInteger(value: string) {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function parsePositiveDistanceAsMeters(value: string, unit: SessionDraftPoolLengthUnit) {
  if (!/^\d+(\.\d+)?$/.test(value)) return null;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return convertPoolUnitValueToMeters(parsed, unit);
}

function parsePoolLength(value: string, unit: SessionDraftPoolLengthUnit): number | null {
  const parsed = parsePositiveDistanceAsMeters(value, unit);
  return parsed !== null && normalizeSessionDraftPoolLength(parsed) !== null ? parsed : null;
}

function formatDistanceForForm(value: number | null | undefined, unit: SessionDraftPoolLengthUnit) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return "";
  const converted = convertMetersToPoolUnitValue(value, unit);
  return converted.toFixed(2).replace(/\.?0+$/, "");
}

function createEmptyStrokeLimitFormState(): SessionGeneratorStrokeLimitFormState {
  return SESSION_GENERATOR_STROKES.reduce((result, stroke) => {
    result[stroke] = {
      maxRepeatDistance: "",
      maxTotalDistance: "",
    };
    return result;
  }, {} as SessionGeneratorStrokeLimitFormState);
}

function buildSkillLimitFormStateFromHandoff(
  handoff: GeneratorIntakeHandoffPayload,
  unit: SessionDraftPoolLengthUnit
) {
  const strokeLimits = createEmptyStrokeLimitFormState();
  let drillMaxRepeatDistance = "";
  let drillApproxTotalDistance = "";
  let kickMaxRepeatDistance = "";
  let kickApproxTotalDistance = "";

  for (const limit of handoff.source.swimCapabilityLimits) {
    if (limit.kind === "drill") {
      drillMaxRepeatDistance = formatDistanceForForm(limit.maxRepeatDistanceM, unit);
      drillApproxTotalDistance = formatDistanceForForm(limit.targetTotalDistanceM, unit);
      continue;
    }

    if (limit.kind === "kick") {
      kickMaxRepeatDistance = formatDistanceForForm(limit.maxRepeatDistanceM, unit);
      kickApproxTotalDistance = formatDistanceForForm(limit.targetTotalDistanceM, unit);
      continue;
    }

    if (limit.kind === "stroke" && limit.stroke && strokeLimits[limit.stroke]) {
      strokeLimits[limit.stroke] = {
        maxRepeatDistance: formatDistanceForForm(limit.maxRepeatDistanceM, unit),
        maxTotalDistance: formatDistanceForForm(limit.maxTotalDistanceM, unit),
      };
    }
  }

  return {
    drillMaxRepeatDistance,
    drillApproxTotalDistance,
    kickMaxRepeatDistance,
    kickApproxTotalDistance,
    strokeLimits,
  };
}

function normalizeStrokeLimitFormState(
  value: unknown,
  fallback: SessionGeneratorStrokeLimitFormState
): SessionGeneratorStrokeLimitFormState {
  const input = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const next = createEmptyStrokeLimitFormState();

  for (const stroke of SESSION_GENERATOR_STROKES) {
    const row =
      input[stroke] && typeof input[stroke] === "object"
        ? (input[stroke] as Record<string, unknown>)
        : {};
    next[stroke] = {
      maxRepeatDistance:
        normalizeDecimalString(row.maxRepeatDistance, 5) || fallback[stroke].maxRepeatDistance,
      maxTotalDistance:
        normalizeDecimalString(row.maxTotalDistance, 5) || fallback[stroke].maxTotalDistance,
    };
  }

  return next;
}

function buildSkillLimitsFromFormState(
  input: SessionGeneratorFormState,
  unit: SessionDraftPoolLengthUnit,
  handoff?: GeneratorIntakeHandoffPayload
): SessionGeneratorSkillLimits | null {
  const profileLimits = handoff ? buildProfileSkillLimitsFromHandoff(handoff) : null;
  const useProfileBase = Boolean(
    profileLimits && (input.skillLimitMode === "profile" || input.skillLimitMode === "override")
  );
  const shouldReadFormLimits = input.skillLimitMode === "override" || !useProfileBase;
  const drillMaxRepeatDistanceM =
    shouldReadFormLimits && input.drillMaxRepeatDistance
      ? parsePositiveDistanceAsMeters(input.drillMaxRepeatDistance, unit)
      : null;
  const drillTargetTotalDistanceM =
    shouldReadFormLimits && input.drillApproxTotalDistance
      ? parsePositiveDistanceAsMeters(input.drillApproxTotalDistance, unit)
      : null;
  const kickMaxRepeatDistanceM =
    shouldReadFormLimits && input.kickIntervalMeters
      ? parsePositiveDistanceAsMeters(input.kickIntervalMeters, unit)
      : null;
  const kickTargetTotalDistanceM =
    shouldReadFormLimits && input.kickApproxTotalDistance
      ? parsePositiveDistanceAsMeters(input.kickApproxTotalDistance, unit)
      : null;
  const strokes: SessionGeneratorSkillLimits["strokes"] = {};

  if (shouldReadFormLimits && input.drillMaxRepeatDistance && drillMaxRepeatDistanceM === null) {
    return null;
  }
  if (
    shouldReadFormLimits &&
    input.drillApproxTotalDistance &&
    drillTargetTotalDistanceM === null
  ) {
    return null;
  }
  if (shouldReadFormLimits && input.kickIntervalMeters && kickMaxRepeatDistanceM === null) {
    return null;
  }
  if (shouldReadFormLimits && input.kickApproxTotalDistance && kickTargetTotalDistanceM === null) {
    return null;
  }

  if (shouldReadFormLimits) {
    for (const stroke of SESSION_GENERATOR_STROKES) {
      const draft = input.strokeLimits[stroke];
      const maxRepeatDistanceM = draft.maxRepeatDistance
        ? parsePositiveDistanceAsMeters(draft.maxRepeatDistance, unit)
        : null;
      const maxTotalDistanceM = draft.maxTotalDistance
        ? parsePositiveDistanceAsMeters(draft.maxTotalDistance, unit)
        : null;

      if (draft.maxRepeatDistance && maxRepeatDistanceM === null) return null;
      if (draft.maxTotalDistance && maxTotalDistanceM === null) return null;

      if (maxRepeatDistanceM !== null || maxTotalDistanceM !== null) {
        strokes[stroke] = {
          maxRepeatDistanceM,
          maxTotalDistanceM,
        };
      }
    }
  }

  const baseLimits = useProfileBase ? profileLimits : null;
  const mergedStrokes: SessionGeneratorSkillLimits["strokes"] = {
    ...(baseLimits?.strokes ?? {}),
    ...strokes,
  };
  const hasFormLimit =
    drillMaxRepeatDistanceM !== null ||
    drillTargetTotalDistanceM !== null ||
    kickMaxRepeatDistanceM !== null ||
    kickTargetTotalDistanceM !== null ||
    Object.keys(strokes).length > 0;
  const hasAnyLimit =
    drillMaxRepeatDistanceM !== null ||
    drillTargetTotalDistanceM !== null ||
    kickMaxRepeatDistanceM !== null ||
    kickTargetTotalDistanceM !== null ||
    Object.keys(mergedStrokes).length > 0 ||
    Boolean(
      baseLimits?.drill.maxRepeatDistanceM ||
      baseLimits?.drill.targetTotalDistanceM ||
      baseLimits?.kick.maxRepeatDistanceM ||
      baseLimits?.kick.targetTotalDistanceM
    );

  return {
    source: hasFormLimit
      ? input.skillLimitMode === "profile"
        ? "profile"
        : "override"
      : hasAnyLimit
        ? "profile"
        : "none",
    drill: {
      maxRepeatDistanceM: drillMaxRepeatDistanceM ?? baseLimits?.drill.maxRepeatDistanceM ?? null,
      targetTotalDistanceM:
        drillTargetTotalDistanceM ?? baseLimits?.drill.targetTotalDistanceM ?? null,
    },
    kick: {
      maxRepeatDistanceM: kickMaxRepeatDistanceM ?? baseLimits?.kick.maxRepeatDistanceM ?? null,
      targetTotalDistanceM:
        kickTargetTotalDistanceM ?? baseLimits?.kick.targetTotalDistanceM ?? null,
    },
    strokes: mergedStrokes,
  };
}

function buildProfileSkillLimitsFromHandoff(
  handoff: GeneratorIntakeHandoffPayload
): SessionGeneratorSkillLimits | null {
  if (handoff.source.swimCapabilityLimits.length === 0) return null;

  const profileLimits: SessionGeneratorSkillLimits = {
    source: "profile",
    drill: {
      maxRepeatDistanceM: null,
      targetTotalDistanceM: null,
    },
    kick: {
      maxRepeatDistanceM: null,
      targetTotalDistanceM: null,
    },
    strokes: {},
  };

  for (const limit of handoff.source.swimCapabilityLimits) {
    if (limit.kind === "drill") {
      profileLimits.drill = {
        maxRepeatDistanceM: limit.maxRepeatDistanceM,
        targetTotalDistanceM: limit.targetTotalDistanceM,
      };
      continue;
    }

    if (limit.kind === "kick") {
      profileLimits.kick = {
        maxRepeatDistanceM: limit.maxRepeatDistanceM,
        targetTotalDistanceM: limit.targetTotalDistanceM,
      };
      continue;
    }

    if (
      limit.kind === "stroke" &&
      limit.stroke &&
      SESSION_GENERATOR_STROKES.includes(limit.stroke as SessionGeneratorStroke)
    ) {
      const stroke = limit.stroke as SessionGeneratorStroke;
      profileLimits.strokes[stroke] = {
        maxRepeatDistanceM: limit.maxRepeatDistanceM,
        maxTotalDistanceM: limit.maxTotalDistanceM,
      };
    }
  }

  return profileLimits;
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

export function isSessionDraftStepIntensityPreset(
  value: unknown
): value is SessionDraftStepIntensityPreset {
  return SESSION_DRAFT_STEP_INTENSITY_PRESETS.includes(value as SessionDraftStepIntensityPreset);
}

function isSizeMode(value: unknown): value is SessionGeneratorSizeMode {
  return SESSION_GENERATOR_SIZE_MODES.includes(value as SessionGeneratorSizeMode);
}

function isVolumeMode(value: unknown): value is SessionGeneratorVolumeMode {
  return SESSION_GENERATOR_VOLUME_MODES.includes(value as SessionGeneratorVolumeMode);
}

function isRestMode(value: unknown): value is SessionGeneratorRestMode {
  return SESSION_GENERATOR_REST_MODES.includes(value as SessionGeneratorRestMode);
}

function isSkillLimitMode(value: unknown): value is SessionGeneratorSkillLimitMode {
  return SESSION_GENERATOR_SKILL_LIMIT_MODES.includes(value as SessionGeneratorSkillLimitMode);
}

function getIntensityMultiplier(value: SessionDraftStepIntensityPreset) {
  switch (value) {
    case "recovery":
      return 1.18;
    case "easy":
      return 1.12;
    case "moderate":
      return 1.06;
    case "hard":
      return 1;
    case "very_hard":
      return 0.96;
    case "race_pace":
      return 0.94;
    case "all_out":
      return 0.9;
    case "ascending":
      return 1.02;
    case "descending":
      return 1;
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
    SESSION_DRAFT_STEP_INTENSITY_PRESETS.includes(step.effortTarget)
      ? step.effortTarget
      : step.intensity;

  return draft.basePaceSecondsPer100m * getIntensityMultiplier(effectiveEffort);
}
