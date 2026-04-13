"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Ellipsis } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type TextareaHTMLAttributes } from "react";
import { BRAND_FONT_PUBLIC_PATH, BRAND_PDF_LOGO_PATH } from "@/lib/brand";
import { useAutoDismissNotice } from "@/components/my-library/workouts/useAutoDismissNotice";
import {
  SESSION_DRAFT_STEP_CATEGORIES,
  SESSION_DRAFT_STEP_CSS_TARGET_OFFSETS,
  SESSION_DRAFT_STEP_DISTANCE_PRESETS,
  SESSION_DRAFT_STEP_DRILL_TYPES,
  SESSION_DRAFT_STEP_INTENSITY_PRESETS,
  SESSION_DRAFT_POOL_LENGTH_MAX,
  SESSION_DRAFT_POOL_LENGTH_MIN,
  SESSION_DRAFT_STEP_DURATION_MODES,
  SESSION_DRAFT_STEP_EQUIPMENT,
  SESSION_DRAFT_REPEAT_MAX,
  SESSION_DRAFT_REPEAT_MIN,
  SESSION_DRAFT_REPEAT_ENDING_REST_MODES,
  SESSION_DRAFT_STEP_STROKES,
  SESSION_DRAFT_STEP_TARGET_MODES,
  SESSION_GENERATOR_ENVIRONMENTS,
  SESSION_GENERATOR_EFFORT_PRESETS,
  SESSION_GENERATOR_EQUIPMENT,
  SESSION_GENERATOR_POOL_LENGTHS,
  SESSION_GENERATOR_SESSION_TYPES,
  SESSION_GENERATOR_STROKES,
  buildSessionStepStructuredTargetLabel,
  buildSessionTargetSummary,
  computeSessionDraftDerivedTotals,
  convertMetersToPoolUnitValue,
  convertPoolUnitValueToMeters,
  formatDistanceMetersLabel,
  formatPaceSecondsPer100m,
  formatPoolLengthLabel,
  getSessionDraftRepeatEndingRestModeLabel,
  getSessionEffortLabel,
  getSessionEnvironmentLabel,
  getSessionEquipmentLabel,
  getSessionStepCategoryLabel,
  getSessionStepDrillTypeLabel,
  getSessionStepEquipmentLabel,
  getSessionStepIntensityLabel,
  getSessionStepStrokeLabel,
  getSessionStepDurationModeLabel,
  getSessionStepTargetModeLabel,
  getSessionStrokeLabel,
  getSessionTypeLabel,
  isSessionDraftRepeatEndingRestStep,
  resolveSessionDraftPoolLengthUnit,
  resolveSessionDraftRepeatEndingRestMode,
  type SessionDraft,
  type SessionDraftPoolLengthUnit,
  type SessionDraftRepeatEndingRestMode,
  type SessionDraftStep,
  type SessionDraftStepCategory,
  type SessionDraftStepDurationMode,
  type SessionDraftStepIntensityPreset,
  type SessionGeneratorEnvironment,
  type SessionGeneratorStroke,
} from "@/lib/session-generator-v1/shared";
import {
  buildWorkoutStepDurationOutputSummary,
  buildWorkoutPdfFileName,
  buildWorkoutPdfHtmlDocument,
  getDefaultWorkoutPoolsideFocusIds,
  buildWorkoutGarminReadyExport,
  buildWorkoutGarminReadyExportFileName,
  buildWorkoutGarminReadinessReport,
  buildWorkoutHandoffFileName,
  buildWorkoutHandoffText,
  selectWorkoutPoolsideFocusPoints,
  type WorkoutEditorRecord,
  type WorkoutHandoffDraftState,
  type WorkoutPoolsideFocusOption,
  type WorkoutPoolsidePrintLayout,
  type WorkoutPoolsidePrintStyle,
  type WorkoutSummary,
} from "@/lib/workouts/shared";

type Props = {
  draft: SessionDraft;
  savedWorkout: WorkoutEditorRecord | null;
  trainingFocusOptions?: WorkoutPoolsideFocusOption[];
  recentWorkouts: WorkoutSummary[];
  canonicalSaveReady: boolean;
  isSaving: boolean;
  hasUnsavedChanges?: boolean;
  onSave: () => void;
  onDraftChange: (draft: SessionDraft) => void;
  onResetToSaved?: (() => void) | null;
  startNewDraftHref?: string | null;
  startNewDraftLabel?: string;
  showLoadedBanner?: boolean;
  loadedBannerTitle?: string;
  loadedBannerDescription?: string;
  recentWorkoutsDescription?: string;
  workoutHrefBuilder?: (workoutId: string) => string;
  saveButtonTestId?: string;
  showPdfPanel?: boolean;
  copyVariant?: "default" | "generator";
  forceMetadataOpenOnLoad?: boolean;
  onRequestDeleteCurrent?: (() => void) | null;
  isDeletingCurrent?: boolean;
  swimmerName?: string | null;
};

type StepRenderEntry = {
  step: SessionDraftStep;
  index: number;
};

type StepRenderGroup =
  | {
      kind: "single";
      entries: [StepRenderEntry];
    }
  | {
      kind: "repeat";
      repeatGroupId: string;
      repeatCount: number | null;
      repeatEndingRestMode: SessionDraftRepeatEndingRestMode;
      entries: StepRenderEntry[];
      postSetRestEntry: StepRenderEntry | null;
    };

type PendingRemoval =
  | {
      kind: "step";
      stepId: string;
      label: string;
      repeatGroupId: string | null;
    }
  | {
      kind: "repeat";
      repeatGroupId: string;
      label: string;
    };

const MANUAL_POOL_SIZE_QUICK_CHOICES = [25, 50] as const;
const YARD_POOL_SIZE_QUICK_CHOICES = [25, 50] as const;
const MANUAL_POOL_VISIBLE_STEP_CATEGORIES = [
  "warmup",
  "main",
  "cooldown",
  "rest",
  "swim",
] as const satisfies readonly SessionDraftStepCategory[];
const MANUAL_POOL_VISIBLE_STEP_STROKES = [
  "freestyle",
  "breaststroke",
  "backstroke",
  "butterfly",
  "choice",
  "individual_medley",
  "im_by_round",
  "reverse_im_order",
  "mixed",
] as const;
const MANUAL_POOL_VISIBLE_STEP_INTENSITY_PRESETS = [
  "recovery",
  "easy",
  "moderate",
  "hard",
  "very_hard",
  "all_out",
  "ascending",
  "descending",
] as const satisfies readonly SessionDraftStepIntensityPreset[];
const WORKOUT_VIEW_MODES = ["edit", "view"] as const;

type LastRemovedBlock = {
  kind: "step" | "repeat";
  label: string;
  steps: SessionDraftStep[];
  insertIndex: number;
  restoreOpenStepId: string | null;
};

type AutoGrowingTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string;
  minRows?: number;
};

type SupportSectionKey = "readiness" | "garminExport" | "handoff";

const CUSTOM_DISTANCE_VALUE = "custom";
const EMPTY_WORKOUT_POOLSIDE_FOCUS_OPTIONS: WorkoutPoolsideFocusOption[] = [];

function getPoolBuilderAutoTitle(environment: SessionGeneratorEnvironment | null | undefined) {
  return environment === "pool" ? "Untitled pool session" : null;
}

function syncAutoGrowingTextareaHeight(node: HTMLTextAreaElement, minRows: number) {
  node.style.height = "auto";
  const computedLineHeight = Number.parseFloat(window.getComputedStyle(node).lineHeight || "0");
  const minimumHeight =
    Number.isFinite(computedLineHeight) && computedLineHeight > 0
      ? computedLineHeight * minRows + 24
      : 44;
  node.style.height = `${Math.max(node.scrollHeight, minimumHeight)}px`;
}

function AutoGrowingTextarea({
  value,
  minRows = 1,
  className,
  onInput,
  style,
  ...props
}: AutoGrowingTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    syncAutoGrowingTextareaHeight(textareaRef.current, minRows);
  }, [minRows, value]);

  return (
    <textarea
      {...props}
      ref={textareaRef}
      value={value}
      rows={minRows}
      onInput={(event) => {
        syncAutoGrowingTextareaHeight(event.currentTarget, minRows);
        onInput?.(event);
      }}
      className={className}
      style={{
        ...style,
        overflowY: "hidden",
      }}
    />
  );
}

function buildStepId(index: number) {
  return `step-${Date.now()}-${index}`;
}

function buildRepeatGroupId(index: number) {
  return `repeat-${Date.now()}-${index}`;
}

function buildBlankStep(
  index: number,
  overrides: Partial<SessionDraftStep> = {}
): SessionDraftStep {
  return {
    id: buildStepId(index),
    category: "main",
    name: "Custom step",
    stroke: "choice",
    drillType: "none",
    equipment: "none",
    intensity: "moderate",
    durationMode: "distance",
    distanceM: 100,
    timeMin: null,
    targetMode: "effort",
    effortTarget: "moderate",
    targetPaceSecondsPer100m: null,
    cssTargetOffsetSeconds: null,
    cssSendOffOffsetSeconds: null,
    targetSummary: "",
    notes: "",
    repeatGroupId: null,
    repeatCount: null,
    repeatEndingRestMode: null,
    postSetRestForRepeatGroupId: null,
    ...overrides,
  };
}

function parsePositiveNumber(value: string) {
  if (!/^\d+(\.\d+)?$/.test(value)) return null;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function parsePositiveInteger(value: string) {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function parsePoolLengthInput(value: string, unit: SessionDraftPoolLengthUnit = "m") {
  const trimmed = value.trim().replace(",", ".");
  if (trimmed.length === 0) return null;
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) return null;

  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed)) return null;

  const normalizedMeters = convertPoolUnitValueToMeters(parsed, unit);
  if (
    normalizedMeters < SESSION_DRAFT_POOL_LENGTH_MIN ||
    normalizedMeters > SESSION_DRAFT_POOL_LENGTH_MAX
  ) {
    return null;
  }

  return normalizedMeters;
}

function formatEditablePoolLength(
  value: number | null | undefined,
  unit: SessionDraftPoolLengthUnit = "m"
) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return "";
  return convertMetersToPoolUnitValue(value, unit)
    .toFixed(2)
    .replace(/\.?0+$/, "");
}

function formatPoolLengthUnitLabel(value: number, unit: SessionDraftPoolLengthUnit) {
  return `${formatEditablePoolLength(value, unit)}${unit}`;
}

function isPoolLengthQuickChoiceSelected(
  currentValueMeters: number | null | undefined,
  quickChoiceValue: number,
  unit: SessionDraftPoolLengthUnit
) {
  if (typeof currentValueMeters !== "number" || !Number.isFinite(currentValueMeters)) {
    return false;
  }

  return Math.abs(currentValueMeters - convertPoolUnitValueToMeters(quickChoiceValue, unit)) < 0.01;
}

function parseDistanceInput(value: string, unit: SessionDraftPoolLengthUnit) {
  const trimmed = value.trim().replace(",", ".");
  if (trimmed.length === 0) return null;
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) return null;
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return convertPoolUnitValueToMeters(parsed, unit);
}

function formatEditableDistance(
  value: number | null | undefined,
  unit: SessionDraftPoolLengthUnit = "m"
) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return "";
  return convertMetersToPoolUnitValue(value, unit)
    .toFixed(2)
    .replace(/\.?0+$/, "");
}

function isDistanceQuickChoiceSelected(
  currentValueMeters: number | null | undefined,
  quickChoiceValue: number,
  unit: SessionDraftPoolLengthUnit
) {
  if (typeof currentValueMeters !== "number" || !Number.isFinite(currentValueMeters)) {
    return false;
  }

  return Math.abs(currentValueMeters - convertPoolUnitValueToMeters(quickChoiceValue, unit)) < 0.01;
}

function parseSignatureValues(value: string) {
  if (value.length === 0) {
    return [];
  }

  return value.split("|");
}

function buildStepStrokeGuidance(step: SessionDraftStep, isManualPoolMode: boolean) {
  const recommendedFocus = getRecommendedStepFocus(step);
  const drillTypeLabel = isManualPoolMode ? "Drill Type" : "Focus tag";
  const strokeLabel = isManualPoolMode ? "Stroke Type" : "Stroke pattern";

  if (step.category === "kick") {
    return `Kick category already tags this as kick work. Use ${strokeLabel} for the movement pattern this set supports, and change ${drillTypeLabel} only when you need extra kick, pull, or drill notation.`;
  }

  if (step.category === "drill" || step.stroke === "drill") {
    return `Drill shell is active. Use ${strokeLabel} for the base movement, and use ${drillTypeLabel} to clarify whether the drill is general, kick, or pull.`;
  }

  return recommendedFocus
    ? `This step already suggests the ${getSessionStepDrillTypeLabel(recommendedFocus)} ${drillTypeLabel.toLowerCase()}. Keep it unless you need a different drill, kick, or pull note.`
    : `Use ${strokeLabel} for the swim pattern. Add ${drillTypeLabel} only when the step needs extra drill, kick, or pull notation.`;
}

function buildStepFocusGuidance(step: SessionDraftStep, isManualPoolMode: boolean) {
  const recommendedFocus = getRecommendedStepFocus(step);
  const drillTypeLabel = isManualPoolMode ? "Drill Type" : "Focus tag";
  if (recommendedFocus === "kick") {
    return `Recommended ${drillTypeLabel}: Kick. Change it only when this kick set needs a more specific drill or pull note.`;
  }

  if (recommendedFocus === "drill") {
    return `Recommended ${drillTypeLabel}: Drill. Switch it to Kick or Pull only when this drill set needs that extra label.`;
  }

  return `Optional. Leave ${drillTypeLabel} on None unless the step needs extra drill, kick, or pull notation.`;
}

function getStepDurationModeEditorLabel(
  value: SessionDraftStepDurationMode,
  isManualPoolMode: boolean
) {
  if (!isManualPoolMode) {
    return getSessionStepDurationModeLabel(value);
  }

  switch (value) {
    case "distance":
      return "Distance";
    case "time":
      return "Time";
    case "fixed_rest":
      return "Fixed Rest Time";
    case "lap_button":
      return "Lap Button Press";
    case "send_off":
      return "Send-Off Time";
    case "css_send_off":
      return "CSS-Based Send-Off Time";
    default:
      return getSessionStepDurationModeLabel(value);
  }
}

function usesClockDurationInput(durationMode: SessionDraftStepDurationMode) {
  return durationMode === "time" || durationMode === "fixed_rest" || durationMode === "send_off";
}

const MANUAL_POOL_SWIM_DURATION_MODES: readonly SessionDraftStepDurationMode[] = [
  "distance",
  "time",
  "lap_button",
];

const MANUAL_POOL_REST_DURATION_MODES: readonly SessionDraftStepDurationMode[] = [
  "fixed_rest",
  "lap_button",
  "send_off",
  "css_send_off",
];

function isManualPoolRestCategory(category: SessionDraftStepCategory) {
  return category === "rest";
}

function normalizeManualPoolStepCategory(category: SessionDraftStepCategory) {
  if (category === "drill") {
    return {
      category: "swim" as const,
      drillType: "drill" as const,
    };
  }

  if (category === "kick") {
    return {
      category: "swim" as const,
      drillType: "kick" as const,
    };
  }

  return {
    category,
    drillType: null,
  };
}

function normalizeManualPoolStrokeForEditor(stroke: SessionDraftStep["stroke"]) {
  if (stroke === "drill") {
    return {
      stroke: "choice" as const,
      drillType: "drill" as const,
    };
  }

  return {
    stroke,
    drillType: null,
  };
}

function getManualPoolDurationModesForCategory(
  category: SessionDraftStepCategory
): readonly SessionDraftStepDurationMode[] {
  return isManualPoolRestCategory(category)
    ? MANUAL_POOL_REST_DURATION_MODES
    : MANUAL_POOL_SWIM_DURATION_MODES;
}

function getDefaultManualPoolDurationMode(
  category: SessionDraftStepCategory
): SessionDraftStepDurationMode {
  return isManualPoolRestCategory(category) ? "fixed_rest" : "distance";
}

function isManualPoolDurationModeAllowed(
  category: SessionDraftStepCategory,
  durationMode: SessionDraftStepDurationMode
) {
  return getManualPoolDurationModesForCategory(category).includes(durationMode);
}

function applyStepDurationModeDefaults(
  step: SessionDraftStep,
  nextMode: SessionDraftStepDurationMode
): SessionDraftStep {
  return {
    ...step,
    durationMode: nextMode,
    distanceM: nextMode === "distance" ? (step.distanceM ?? 100) : null,
    timeMin:
      nextMode === "time" || nextMode === "fixed_rest" || nextMode === "send_off"
        ? (step.timeMin ?? (nextMode === "send_off" ? 2 : 1))
        : null,
    cssSendOffOffsetSeconds:
      nextMode === "css_send_off" ? (step.cssSendOffOffsetSeconds ?? 0) : null,
  };
}

function normalizeManualPoolStepForEditor(step: SessionDraftStep): SessionDraftStep {
  const normalizedCategory = normalizeManualPoolStepCategory(step.category);
  const normalizedStroke = normalizeManualPoolStrokeForEditor(step.stroke);
  const nextStep: SessionDraftStep = {
    ...step,
    category: normalizedCategory.category,
    stroke: normalizedStroke.stroke,
    drillType:
      step.drillType && step.drillType !== "none"
        ? step.drillType
        : (normalizedCategory.drillType ?? normalizedStroke.drillType ?? step.drillType ?? "none"),
  };

  if (isManualPoolDurationModeAllowed(nextStep.category, nextStep.durationMode)) {
    return nextStep;
  }

  return applyStepDurationModeDefaults(
    nextStep,
    getDefaultManualPoolDurationMode(nextStep.category)
  );
}

function getStepTargetModeEditorLabel(
  value: NonNullable<SessionDraftStep["targetMode"]>,
  isManualPoolMode: boolean
) {
  if (!isManualPoolMode) {
    return getSessionStepTargetModeLabel(value);
  }

  switch (value) {
    case "effort":
      return "Effort";
    case "css_target_pace":
      return "CSS target pace";
    default:
      return getSessionStepTargetModeLabel(value);
  }
}

function getRecommendedStepFocus(
  step: Pick<SessionDraftStep, "category" | "stroke">
): Exclude<NonNullable<SessionDraftStep["drillType"]>, "none"> | null {
  if (step.category === "kick") {
    return "kick";
  }

  if (step.category === "drill" || step.stroke === "drill") {
    return "drill";
  }

  return null;
}

function applyRecommendedStepFocus(
  step: SessionDraftStep,
  overrides: Partial<SessionDraftStep>
): SessionDraftStep {
  const nextStep = {
    ...step,
    ...overrides,
  };

  if (Object.prototype.hasOwnProperty.call(overrides, "drillType")) {
    return nextStep;
  }

  const recommendedFocus = getRecommendedStepFocus(nextStep);
  if ((!step.drillType || step.drillType === "none") && recommendedFocus) {
    nextStep.drillType = recommendedFocus;
  }

  return nextStep;
}

function buildRepeatStarterSteps(index: number): SessionDraftStep[] {
  const groupId = buildRepeatGroupId(index);

  return [
    buildBlankStep(index, {
      id: `${groupId}-step-1`,
      category: "main",
      name: "Repeat swim",
      stroke: "freestyle",
      intensity: "moderate",
      durationMode: "distance",
      distanceM: 100,
      timeMin: null,
      targetMode: "effort",
      effortTarget: "moderate",
      targetSummary: "Repeatable working swim for the core set.",
      notes: "",
      repeatGroupId: groupId,
      repeatCount: 4,
      repeatEndingRestMode: "skip_last_rest",
    }),
    buildBlankStep(index + 1, {
      id: `${groupId}-step-2`,
      category: "rest",
      name: "Repeat rest",
      stroke: "choice",
      intensity: "easy",
      durationMode: "fixed_rest",
      distanceM: null,
      timeMin: 0.5,
      targetMode: "none",
      targetSummary: "Short recovery before the next round.",
      notes: "",
      repeatGroupId: groupId,
      repeatCount: 4,
      repeatEndingRestMode: "skip_last_rest",
    }),
    buildBlankStep(index + 2, {
      id: `${groupId}-post-set-rest`,
      category: "rest",
      name: "Post-set rest",
      stroke: "choice",
      intensity: "easy",
      durationMode: "fixed_rest",
      distanceM: null,
      timeMin: 0.5,
      targetMode: "none",
      targetSummary: "",
      notes: "",
      postSetRestForRepeatGroupId: groupId,
    }),
  ];
}

function buildAutoRestStep(index: number): SessionDraftStep {
  return buildBlankStep(index, {
    category: "rest",
    name: "Auto rest",
    stroke: "choice",
    intensity: "recovery",
    durationMode: "fixed_rest",
    distanceM: null,
    timeMin: 0.5,
    targetMode: "none",
    effortTarget: null,
    targetSummary: "",
    notes: "",
  });
}

function buildRepeatInsertedStep(
  repeatGroupId: string,
  repeatCount: number | null,
  repeatEndingRestMode: SessionDraftRepeatEndingRestMode | null
): Partial<SessionDraftStep> {
  return {
    name: "Repeat step",
    stroke: "freestyle",
    targetSummary: "Edit this into the next step for each round.",
    notes: "",
    repeatGroupId,
    repeatCount,
    repeatEndingRestMode,
    postSetRestForRepeatGroupId: null,
  };
}

function getClockTotalSeconds(valueMinutes: number | null | undefined) {
  if (!valueMinutes || valueMinutes <= 0) return 0;
  return Math.max(0, Math.round(valueMinutes * 60));
}

function formatClockDurationLabelFromSeconds(totalSeconds: number) {
  const normalizedSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(normalizedSeconds / 60);
  const seconds = normalizedSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatClockDurationLabel(valueMinutes: number | null | undefined) {
  return formatClockDurationLabelFromSeconds(getClockTotalSeconds(valueMinutes));
}

function formatEditableClockDuration(valueMinutes: number | null | undefined) {
  if (!valueMinutes || valueMinutes <= 0) return "";
  return formatClockDurationLabel(valueMinutes);
}

function sanitizeClockDurationInput(rawValue: string) {
  const cleaned = rawValue.replace(/[^\d:]/g, "");
  const digits = cleaned.replace(/[^\d]/g, "").slice(0, 5);

  if (cleaned.includes(":")) {
    const [rawMinutes = "", rawSeconds = ""] = cleaned.split(":");
    const minutes = rawMinutes.replace(/[^\d]/g, "").slice(0, 3);
    const seconds = rawSeconds.replace(/[^\d]/g, "").slice(0, 2);

    if (!minutes && !seconds) {
      return "";
    }

    return `${minutes}${cleaned.endsWith(":") && seconds.length === 0 ? ":" : seconds.length > 0 ? `:${seconds}` : ""}`;
  }

  if (digits.length === 0) return "";
  if (digits.length === 1) return digits;
  if (digits.length === 2) return `${digits}:`;
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  }

  return `${digits.slice(0, 3)}:${digits.slice(3)}`;
}

function parseClockDurationInputForChange(value: string) {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  if (/^\d{1,3}$/.test(trimmed)) {
    const minutes = Number.parseInt(trimmed, 10);
    return minutes > 0 ? minutes : null;
  }

  if (/^\d{1,3}:$/.test(trimmed)) {
    return undefined;
  }

  const completeClockMatch = trimmed.match(/^(\d{1,3}):(\d{2})$/);
  if (!completeClockMatch) {
    return undefined;
  }

  const minutes = Number.parseInt(completeClockMatch[1], 10);
  const seconds = Math.min(59, Number.parseInt(completeClockMatch[2], 10));
  const totalSeconds = minutes * 60 + seconds;

  return totalSeconds > 0 ? totalSeconds / 60 : null;
}

function normalizeClockDurationInput(value: string) {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return {
      display: "",
      timeMin: null as number | null,
    };
  }

  if (/^\d{1,3}$/.test(trimmed)) {
    const minutes = Number.parseInt(trimmed, 10);
    return {
      display: `${minutes}:00`,
      timeMin: minutes > 0 ? minutes : null,
    };
  }

  const partialClockMatch = trimmed.match(/^(\d{1,3}):(\d{0,2})$/);
  if (!partialClockMatch) {
    return {
      display: "",
      timeMin: null as number | null,
    };
  }

  const minutes = Number.parseInt(partialClockMatch[1], 10);
  const seconds = Math.min(59, Number.parseInt(partialClockMatch[2] || "0", 10));
  const totalSeconds = minutes * 60 + seconds;

  return {
    display: `${minutes}:${String(seconds).padStart(2, "0")}`,
    timeMin: totalSeconds > 0 ? totalSeconds / 60 : null,
  };
}

function buildStepRemovalLabel(
  step: SessionDraftStep,
  fallbackIndex: number,
  options?: {
    isManualPoolMode?: boolean;
    basePaceSecondsPer100m?: number;
    poolLengthUnit?: SessionDraftPoolLengthUnit;
  }
) {
  if (options?.isManualPoolMode && typeof options.basePaceSecondsPer100m === "number") {
    return buildManualPoolStepSummary(
      step,
      options.basePaceSecondsPer100m,
      options.poolLengthUnit ?? "m"
    );
  }

  return (
    step.name.trim() || `${getSessionStepCategoryLabel(step.category)} step ${fallbackIndex + 1}`
  );
}

function buildStepContextLabel(
  step: SessionDraftStep,
  options?: {
    environment?: SessionGeneratorEnvironment | null;
  }
) {
  const contextParts =
    options?.environment === "pool" && step.category === "rest"
      ? []
      : [getSessionStepStrokeLabel(step.stroke)];

  if (step.drillType && step.drillType !== "none") {
    const drillLabel = getSessionStepDrillTypeLabel(step.drillType);
    if (
      !(
        (step.stroke === "drill" && drillLabel === "Drill") ||
        (step.category === "drill" && drillLabel === "Drill") ||
        (step.category === "kick" && drillLabel === "Kick")
      )
    ) {
      contextParts.push(drillLabel);
    }
  }

  if (step.equipment && step.equipment !== "none") {
    contextParts.push(getSessionStepEquipmentLabel(step.equipment));
  }

  return contextParts.join(" · ");
}

function buildStepSummary(
  step: SessionDraftStep,
  basePaceSecondsPer100m: number,
  environment: SessionGeneratorEnvironment,
  poolLengthUnit: SessionDraftPoolLengthUnit = "m"
) {
  const structuredTarget = buildSessionStepStructuredTargetLabel(
    step,
    basePaceSecondsPer100m,
    environment === "pool" ? poolLengthUnit : "m"
  );

  return [
    buildWorkoutStepDurationOutputSummary(step, basePaceSecondsPer100m, {
      environment,
      poolLengthUnit,
    }),
    buildStepContextLabel(step, { environment }),
    structuredTarget ?? getSessionStepIntensityLabel(step.intensity),
  ]
    .filter(Boolean)
    .join(" · ");
}

function buildManualPoolStepSummary(
  step: SessionDraftStep,
  basePaceSecondsPer100m: number,
  poolLengthUnit: SessionDraftPoolLengthUnit
) {
  const normalizedStep = normalizeManualPoolStepForEditor(step);
  const structuredTarget = buildSessionStepStructuredTargetLabel(
    normalizedStep,
    basePaceSecondsPer100m,
    poolLengthUnit
  );

  return (
    [
      buildWorkoutStepDurationOutputSummary(normalizedStep, basePaceSecondsPer100m, {
        environment: "pool",
        poolLengthUnit,
      }),
      buildStepContextLabel(normalizedStep, { environment: "pool" }),
      structuredTarget ?? getSessionStepIntensityLabel(normalizedStep.intensity),
    ]
      .filter(Boolean)
      .join(" · ") || `${getSessionStepCategoryLabel(normalizedStep.category)} step`
  );
}

function buildManualPoolRestInlineSummary(step: SessionDraftStep, basePaceSecondsPer100m: number) {
  const summary = buildWorkoutStepDurationOutputSummary(step, basePaceSecondsPer100m, {
    environment: "pool",
  });
  if (summary.startsWith("Fixed Rest Time ")) {
    return `Rest: ${summary.replace("Fixed Rest Time ", "")}`;
  }

  return summary === "Fixed Rest Time not set" ? "Rest: not set" : summary;
}

function buildManualPoolDisplaySummary(
  step: SessionDraftStep,
  basePaceSecondsPer100m: number,
  poolLengthUnit: SessionDraftPoolLengthUnit,
  linkedRestStep?: SessionDraftStep | null
) {
  const normalizedStep = normalizeManualPoolStepForEditor(step);

  if (normalizedStep.category === "rest") {
    return buildManualPoolRestInlineSummary(normalizedStep, basePaceSecondsPer100m);
  }

  const parts = buildManualPoolStepSummary(
    normalizedStep,
    basePaceSecondsPer100m,
    poolLengthUnit
  ).split(" · ");

  if (
    linkedRestStep &&
    linkedRestStep.category === "rest" &&
    linkedRestStep.postSetRestForRepeatGroupId == null
  ) {
    parts.push(buildManualPoolRestInlineSummary(linkedRestStep, basePaceSecondsPer100m));
  }

  return parts.filter(Boolean).join(" · ");
}

function syncManualPoolEditableStep(
  step: SessionDraftStep,
  basePaceSecondsPer100m: number,
  poolLengthUnit: SessionDraftPoolLengthUnit
): SessionDraftStep {
  const normalizedStep = normalizeManualPoolStepForEditor(step);

  return {
    ...normalizedStep,
    name: buildManualPoolStepSummary(normalizedStep, basePaceSecondsPer100m, poolLengthUnit).slice(
      0,
      120
    ),
    targetSummary: "",
  };
}

function hasSelectionSyncChanges(currentDraft: SessionDraft, nextDraft: SessionDraft) {
  return (
    JSON.stringify({
      steps: currentDraft.steps,
      allowedStrokes: currentDraft.allowedStrokes,
      equipmentAllowlist: currentDraft.equipmentAllowlist,
    }) !==
    JSON.stringify({
      steps: nextDraft.steps,
      allowedStrokes: nextDraft.allowedStrokes,
      equipmentAllowlist: nextDraft.equipmentAllowlist,
    })
  );
}

function buildRepeatSummary(
  entries: StepRenderEntry[],
  repeatCount: number | null,
  basePaceSecondsPer100m: number,
  repeatEndingRestMode: SessionDraftRepeatEndingRestMode,
  poolLengthUnit: SessionDraftPoolLengthUnit
) {
  if (repeatCount === null) {
    return "Set a repeat count to keep this block valid.";
  }

  let roundDistanceM = 0;
  let roundDurationSeconds = 0;

  for (const { step } of entries) {
    if (step.durationMode === "distance" && step.distanceM) {
      roundDistanceM += step.distanceM;
    }
    if (
      (step.durationMode === "time" ||
        step.durationMode === "fixed_rest" ||
        step.durationMode === "send_off") &&
      step.timeMin
    ) {
      roundDurationSeconds += getClockTotalSeconds(step.timeMin);
    }
    if (step.durationMode === "css_send_off" && typeof step.cssSendOffOffsetSeconds === "number") {
      roundDurationSeconds += Math.max(1, basePaceSecondsPer100m + step.cssSendOffOffsetSeconds);
    }
  }

  const parts = [`${repeatCount} rounds`];
  const roundParts: string[] = [];

  if (roundDistanceM > 0)
    roundParts.push(formatDistanceMetersLabel(roundDistanceM, poolLengthUnit));
  if (roundDurationSeconds > 0) {
    roundParts.push(formatClockDurationLabelFromSeconds(roundDurationSeconds));
  }
  if (roundParts.length > 0) {
    parts.push(`${roundParts.join(" + ")} per round`);
  }
  if (roundDistanceM > 0) {
    parts.push(
      `${formatDistanceMetersLabel(roundDistanceM * repeatCount, poolLengthUnit)} repeated distance`
    );
  }

  return parts.join(" · ");
}

type ManualPoolViewSectionLine = {
  text: string;
  tone?: "default" | "rest" | "subtle";
};

type ManualPoolViewSection = {
  key: string;
  title: string;
  lines: ManualPoolViewSectionLine[];
  numbered: boolean;
  variant: "default" | "rest" | "repeat";
};

function findTopLevelLinkedRestStep(
  steps: SessionDraftStep[],
  step: SessionDraftStep,
  index: number
) {
  const nextStep = steps[index + 1] ?? null;

  if (
    step.category === "rest" ||
    step.repeatGroupId ||
    step.postSetRestForRepeatGroupId ||
    !nextStep ||
    nextStep.category !== "rest" ||
    nextStep.repeatGroupId ||
    nextStep.postSetRestForRepeatGroupId
  ) {
    return null;
  }

  return nextStep;
}

function buildManualPoolViewLine(
  step: SessionDraftStep,
  basePaceSecondsPer100m: number,
  poolLengthUnit: SessionDraftPoolLengthUnit,
  linkedRestStep?: SessionDraftStep | null
) {
  const normalizedStep = normalizeManualPoolStepForEditor(step);

  if (normalizedStep.category === "rest") {
    return buildManualPoolRestInlineSummary(normalizedStep, basePaceSecondsPer100m);
  }

  const stepSummary = buildManualPoolStepSummary(
    normalizedStep,
    basePaceSecondsPer100m,
    poolLengthUnit
  );

  if (!linkedRestStep || linkedRestStep.category !== "rest") {
    return stepSummary;
  }

  const restSummary = buildManualPoolRestInlineSummary(linkedRestStep, basePaceSecondsPer100m);
  return `${stepSummary} · ${restSummary}`;
}

function buildManualPoolRepeatViewSection(
  group: Extract<StepRenderGroup, { kind: "repeat" }>,
  basePaceSecondsPer100m: number,
  poolLengthUnit: SessionDraftPoolLengthUnit
): ManualPoolViewSection {
  const workStep = group.entries[0]?.step ?? null;
  const betweenStep = group.entries[1]?.step ?? null;
  const normalizedWorkStep = workStep ? normalizeManualPoolStepForEditor(workStep) : null;
  const repeatCountLabel = group.repeatCount ? `${group.repeatCount} x ` : "";
  const title = normalizedWorkStep
    ? getSessionStepCategoryLabel(normalizedWorkStep.category)
    : "Repeat";

  if (!normalizedWorkStep) {
    return {
      key: group.repeatGroupId,
      title,
      lines: [{ text: "Set the work interval for this repeat block." }],
      numbered: false,
      variant: "repeat",
    };
  }

  const lines: ManualPoolViewSectionLine[] = [
    {
      text: `${repeatCountLabel}${buildManualPoolStepSummary(
        normalizedWorkStep,
        basePaceSecondsPer100m,
        poolLengthUnit
      )}`,
    },
  ];

  if (betweenStep) {
    if (betweenStep.category === "rest") {
      lines[0] = {
        text: `${lines[0].text} · Rest: ${formatClockDurationLabel(betweenStep.timeMin)}`,
      };
    } else {
      lines.push({
        text: `Recovery: ${buildManualPoolStepSummary(
          betweenStep,
          basePaceSecondsPer100m,
          poolLengthUnit
        )}`,
        tone: "subtle",
      });
    }
  }

  if (group.postSetRestEntry?.step && group.repeatEndingRestMode !== "use_last_rest") {
    lines.push({
      text: `Post-set rest: ${formatClockDurationLabel(group.postSetRestEntry.step.timeMin)}`,
      tone: "rest",
    });
  }

  return {
    key: group.repeatGroupId,
    title,
    lines,
    numbered: false,
    variant: "repeat",
  };
}

function buildManualPoolViewSections(
  stepGroups: StepRenderGroup[],
  draftSteps: SessionDraftStep[],
  basePaceSecondsPer100m: number,
  poolLengthUnit: SessionDraftPoolLengthUnit
) {
  const sections: ManualPoolViewSection[] = [];
  const consumedRestStepIds = new Set<string>();

  stepGroups.forEach((group) => {
    if (group.kind === "repeat") {
      sections.push(
        buildManualPoolRepeatViewSection(group, basePaceSecondsPer100m, poolLengthUnit)
      );
      return;
    }

    const entry = group.entries[0];
    const linkedRestStep = findTopLevelLinkedRestStep(draftSteps, entry.step, entry.index);
    if (linkedRestStep) {
      consumedRestStepIds.add(linkedRestStep.id);
    }
    if (consumedRestStepIds.has(entry.step.id)) {
      return;
    }

    const normalizedStep = normalizeManualPoolStepForEditor(entry.step);
    const title = getSessionStepCategoryLabel(normalizedStep.category);
    const nextLine: ManualPoolViewSectionLine = {
      text: buildManualPoolViewLine(
        normalizedStep,
        basePaceSecondsPer100m,
        poolLengthUnit,
        linkedRestStep
      ),
      tone: normalizedStep.category === "rest" ? "rest" : "default",
    };
    const lastSection = sections[sections.length - 1] ?? null;

    if (
      lastSection &&
      lastSection.variant !== "repeat" &&
      lastSection.title === title &&
      normalizedStep.category !== "rest"
    ) {
      lastSection.lines.push(nextLine);
      lastSection.numbered = true;
      return;
    }

    sections.push({
      key: entry.step.id,
      title,
      lines: [nextLine],
      numbered: false,
      variant: normalizedStep.category === "rest" ? "rest" : "default",
    });
  });

  return sections;
}

function getPaceMinutes(secondsPer100m: number | null | undefined) {
  if (!secondsPer100m || secondsPer100m <= 0) return "";
  return String(Math.floor(secondsPer100m / 60));
}

function getPaceSeconds(secondsPer100m: number | null | undefined) {
  if (!secondsPer100m || secondsPer100m <= 0) return "";
  return String(secondsPer100m % 60).padStart(2, "0");
}

function getDurationMinutes(valueMinutes: number | null | undefined) {
  const totalSeconds = getClockTotalSeconds(valueMinutes);
  if (totalSeconds <= 0) return "";
  return String(Math.floor(totalSeconds / 60));
}

function getDurationSeconds(valueMinutes: number | null | undefined) {
  const totalSeconds = getClockTotalSeconds(valueMinutes);
  if (totalSeconds <= 0) return "";
  return String(totalSeconds % 60).padStart(2, "0");
}

function buildStepRenderGroups(steps: SessionDraftStep[]): StepRenderGroup[] {
  const groups: StepRenderGroup[] = [];

  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];

    if (!step.repeatGroupId) {
      groups.push({
        kind: "single",
        entries: [{ step, index }],
      });
      continue;
    }

    const entries: StepRenderEntry[] = [{ step, index }];
    let nextIndex = index + 1;

    while (nextIndex < steps.length && steps[nextIndex].repeatGroupId === step.repeatGroupId) {
      entries.push({ step: steps[nextIndex], index: nextIndex });
      nextIndex += 1;
    }

    const postSetRestStep =
      steps[nextIndex]?.postSetRestForRepeatGroupId === step.repeatGroupId
        ? steps[nextIndex]
        : null;
    const postSetRestEntry = postSetRestStep ? { step: postSetRestStep, index: nextIndex } : null;

    groups.push({
      kind: "repeat",
      repeatGroupId: step.repeatGroupId,
      repeatCount: step.repeatCount ?? null,
      repeatEndingRestMode: resolveSessionDraftRepeatEndingRestMode(
        step.repeatEndingRestMode ?? null
      ),
      entries,
      postSetRestEntry,
    });
    index = postSetRestEntry ? nextIndex : nextIndex - 1;
  }

  return groups;
}

export default function WorkoutEditor({
  draft,
  savedWorkout,
  trainingFocusOptions = EMPTY_WORKOUT_POOLSIDE_FOCUS_OPTIONS,
  recentWorkouts,
  canonicalSaveReady,
  isSaving,
  hasUnsavedChanges = true,
  onSave,
  onDraftChange,
  onResetToSaved = null,
  startNewDraftHref = null,
  startNewDraftLabel = "Start new draft",
  showLoadedBanner = true,
  loadedBannerTitle = "Accepted workout loaded.",
  loadedBannerDescription = "Save changes below, or start a fresh draft from the prepared intake when you want a brand-new generated workout.",
  recentWorkoutsDescription = "Edit another saved session here when you want to switch what you are working on.",
  workoutHrefBuilder = (workoutId) => `/my-library/workouts/${workoutId}`,
  saveButtonTestId = "session-generator-save",
  showPdfPanel = true,
  copyVariant = "default",
  forceMetadataOpenOnLoad = false,
  onRequestDeleteCurrent = null,
  isDeletingCurrent = false,
  swimmerName = null,
}: Props) {
  const draftTotals = computeSessionDraftDerivedTotals(draft);
  const garminReadiness = buildWorkoutGarminReadinessReport(draft);
  const stepGroups = buildStepRenderGroups(draft.steps);
  const showCalmBuilderLayout = copyVariant === "default";
  const isManualMetadataMode = showCalmBuilderLayout && savedWorkout?.sourceKind === "manual";
  const manualBuilderMode = isManualMetadataMode
    ? draft.environment === "open_water"
      ? "open_water"
      : "pool"
    : null;
  const isManualPoolMode = manualBuilderMode === "pool";
  const autoPoolBuilderTitle = getPoolBuilderAutoTitle(draft.environment);
  const timeDurationInputFocusRef = useRef<Record<string, boolean>>({});
  const [openStepId, setOpenStepId] = useState<string | null>(null);
  const [openMobileActionKey, setOpenMobileActionKey] = useState<string | null>(null);
  const poolLengthUnit = resolveSessionDraftPoolLengthUnit(draft.poolLengthUnit);
  const [poolLengthInput, setPoolLengthInput] = useState(() =>
    formatEditablePoolLength(
      draft.poolLengthM,
      resolveSessionDraftPoolLengthUnit(draft.poolLengthUnit)
    )
  );
  const [timeDurationInputs, setTimeDurationInputs] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      draft.steps
        .filter((step) => usesClockDurationInput(step.durationMode))
        .map((step) => [step.id, formatEditableClockDuration(step.timeMin)])
    )
  );
  const [manualPoolTitleEdited, setManualPoolTitleEdited] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
  const [lastRemovedBlock, setLastRemovedBlock] = useState<LastRemovedBlock | null>(null);
  const [workoutPdfNotice, setWorkoutPdfNotice] = useState("");
  const [workoutPdfError, setWorkoutPdfError] = useState("");
  const [garminExportNotice, setGarminExportNotice] = useState("");
  const [garminExportError, setGarminExportError] = useState("");
  const [handoffNotice, setHandoffNotice] = useState("");
  const [handoffError, setHandoffError] = useState("");
  const [metadataOpen, setMetadataOpen] = useState(
    () => forceMetadataOpenOnLoad || !(savedWorkout && copyVariant === "default")
  );
  const [builderViewMode, setBuilderViewMode] =
    useState<(typeof WORKOUT_VIEW_MODES)[number]>("edit");
  const [poolsidePrintStyle, setPoolsidePrintStyle] = useState<WorkoutPoolsidePrintStyle>("color");
  const [poolsidePrintLayout, setPoolsidePrintLayout] =
    useState<WorkoutPoolsidePrintLayout>("portrait");
  const [selectedPoolsideFocusIds, setSelectedPoolsideFocusIds] = useState<string[]>(() =>
    getDefaultWorkoutPoolsideFocusIds(trainingFocusOptions)
  );
  const [supportSectionOpen, setSupportSectionOpen] = useState<Record<SupportSectionKey, boolean>>({
    readiness: false,
    garminExport: false,
    handoff: false,
  });
  const [supportToolsOpen, setSupportToolsOpen] = useState(() => copyVariant !== "default");
  const savedWorkoutId = savedWorkout?.id ?? null;
  const isManualSourceDraft = draft.sourceFingerprint.startsWith("manual-");
  const simplifyManualMetadata = showCalmBuilderLayout && isManualSourceDraft;
  const trainingFocusIdSignature = trainingFocusOptions.map((focus) => focus.id).join("|");
  const defaultPoolsideFocusIdSignature =
    getDefaultWorkoutPoolsideFocusIds(trainingFocusOptions).join("|");
  const metadataStartsCollapsed =
    showCalmBuilderLayout && savedWorkoutId !== null && !forceMetadataOpenOnLoad;
  const editorCopy =
    copyVariant === "generator"
      ? {
          loadedDraftBanner:
            "Saved session loaded: edit everything below, then save changes back to this same session.",
          unsavedDraftBanner:
            "Generated session ready: review and edit everything below, then save it to My Swim Sessions when you are happy with it.",
          savedWorkoutDescription:
            "Saving here updates this same saved session instead of creating a new copy.",
          unsavedDraftDescription:
            "Review the generated session below, then save it to My Swim Sessions when you are ready.",
          savedWorkoutPendingState: "Unsaved changes stay local until you save this session.",
          savedWorkoutSavedState: "All changes are saved to this session.",
          unsavedDraftPendingState: "This generated session is not saved to My Swim Sessions yet.",
        }
      : {
          loadedDraftBanner:
            "Canonical workout loaded: edit everything below, then save changes back into the same owner-scoped workout.",
          unsavedDraftBanner:
            "Local draft only: review and edit everything below, then accept it into the canonical workout layer when you are ready.",
          savedWorkoutDescription:
            "This workout is canonical now. Saving here updates the same workout instead of creating a new copy.",
          unsavedDraftDescription:
            "Review the draft carefully, then accept it into the canonical workout layer when you are happy with it.",
          savedWorkoutPendingState: "Unsaved changes stay local until you save this workout.",
          savedWorkoutSavedState: "All builder changes are saved to the canonical workout.",
          unsavedDraftPendingState:
            "This draft still needs to be accepted into the canonical workout layer.",
        };
  const poolLengthQuickChoices =
    poolLengthUnit === "yd" ? YARD_POOL_SIZE_QUICK_CHOICES : MANUAL_POOL_SIZE_QUICK_CHOICES;
  const parsedPoolLengthInput = parsePoolLengthInput(poolLengthInput, poolLengthUnit);
  const poolSizeInputInvalid =
    draft.environment === "pool" &&
    (poolLengthInput.trim().length === 0 || parsedPoolLengthInput === null);
  const handoffDraftState: WorkoutHandoffDraftState =
    savedWorkout && !hasUnsavedChanges ? "canonical" : "local_draft";
  const garminReadyExport = buildWorkoutGarminReadyExport(draft, {
    draftState: handoffDraftState,
    workoutId: savedWorkout?.id ?? null,
  });
  const garminReadyExportPreview = JSON.stringify(garminReadyExport, null, 2);
  const garminReadyExportFileName = buildWorkoutGarminReadyExportFileName(draft, {
    draftState: handoffDraftState,
  });
  const workoutPdfFileName = buildWorkoutPdfFileName(draft, {
    draftState: handoffDraftState,
    variant: "standard",
  });
  const workoutPoolsidePdfFileName = buildWorkoutPdfFileName(draft, {
    draftState: handoffDraftState,
    variant: "poolside",
  });
  const workoutPdfHtml = buildWorkoutPdfHtmlDocument(draft, {
    draftState: handoffDraftState,
    variant: "standard",
    swimmerName,
    fontUrl:
      typeof window === "undefined"
        ? BRAND_FONT_PUBLIC_PATH
        : new URL(BRAND_FONT_PUBLIC_PATH, window.location.origin).toString(),
    logoUrl:
      typeof window === "undefined"
        ? BRAND_PDF_LOGO_PATH
        : new URL(BRAND_PDF_LOGO_PATH, window.location.origin).toString(),
  });
  const selectedPoolsideFocusPoints = selectWorkoutPoolsideFocusPoints(
    trainingFocusOptions,
    selectedPoolsideFocusIds
  );
  const selectedPoolsideFocusSignature = selectedPoolsideFocusPoints.join("|");
  const metadataSummary = isManualPoolMode
    ? [
        draftTotals.totalDistanceM
          ? formatDistanceMetersLabel(draftTotals.totalDistanceM, poolLengthUnit)
          : null,
        draft.poolLengthM === null
          ? "Set pool size"
          : formatPoolLengthUnitLabel(draft.poolLengthM, poolLengthUnit),
      ]
        .filter(Boolean)
        .join(" · ")
    : buildSessionTargetSummary({
        ...draft,
        totalDistanceM: draftTotals.totalDistanceM ?? draft.totalDistanceM,
        estimatedDurationMin: draftTotals.estimatedDurationMin ?? draft.estimatedDurationMin,
      });
  const workoutPdfHeadingLabel = "View PDF";
  const workoutPdfStateLabel =
    handoffDraftState === "canonical"
      ? "Canonical full-session PDF"
      : "Local draft full-session PDF";
  const workoutPdfStateDescription = savedWorkout
    ? hasUnsavedChanges
      ? "Full-session PDF reflects unsaved edits on screen."
      : "Full-session PDF matches the saved canonical workout."
    : "Full-session PDF reflects the current draft on screen.";
  const workoutPdfBodyCopy =
    handoffDraftState === "canonical"
      ? "Open the full-session sheet for this workout."
      : "Open the full-session sheet for the draft on screen.";
  const workoutPdfButtonLabel = "View PDF";
  const workoutPoolsidePdfButtonLabel = "Print Preview";
  const garminExportStateLabel =
    handoffDraftState === "canonical"
      ? "Canonical Garmin-ready export"
      : "Local draft Garmin-ready export";
  const garminExportStateDescription = savedWorkout
    ? hasUnsavedChanges
      ? "JSON export preview reflects unsaved local edits. Save first if you want the canonical workout and export adapter output to match."
      : "JSON export preview matches the saved canonical workout."
    : "JSON export preview reflects the current local draft before canonical save.";
  const handoffText = buildWorkoutHandoffText(draft, {
    draftState: handoffDraftState,
  });
  const handoffFileName = buildWorkoutHandoffFileName(draft, {
    draftState: handoffDraftState,
  });
  const handoffStateLabel =
    handoffDraftState === "canonical" ? "Canonical handoff" : "Local draft handoff";
  const handoffStateDescription = savedWorkout
    ? hasUnsavedChanges
      ? "Handoff preview reflects unsaved local edits. Save first if you want the canonical workout and handoff to match."
      : "Handoff preview matches the saved canonical workout."
    : "Handoff preview reflects the current local draft before canonical save.";
  const supportToolsAudienceDescription =
    "Advanced export and support tools stay here when you need them.";
  const shouldHideAutoPoolBuilderTitle =
    isManualPoolMode &&
    !manualPoolTitleEdited &&
    autoPoolBuilderTitle !== null &&
    draft.title === autoPoolBuilderTitle;
  const displayedTitle = shouldHideAutoPoolBuilderTitle ? "" : draft.title;
  const supportToolsDraftStateDescription =
    handoffDraftState === "canonical"
      ? "Support output reflects the saved workout."
      : "Support output reflects unsaved edits on screen.";
  const supportToolsPersistenceDescription = "Open, copy, or download here without saving.";
  const supportToolsWarningSummary =
    draft.warnings.length > 0
      ? `${draft.warnings.length} builder warning${
          draft.warnings.length === 1 ? "" : "s"
        } still need review here.`
      : null;
  const supportToolsStatusLabel =
    garminReadiness.status === "ready"
      ? "Ready"
      : `${garminReadiness.issues.length} review ${
          garminReadiness.issues.length === 1 ? "item" : "items"
        }`;
  const showInlinePdfAction = showCalmBuilderLayout || !showPdfPanel;
  const integratedSupportSectionClass = "border-t border-slate-200/80 pt-4";
  const supportPreviewShellClass =
    "mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950";
  const supportSummaryItemClass = "rounded-xl bg-slate-100/80 p-3 sm:p-4";
  const mobileSummaryToggleClass =
    "w-full rounded-2xl text-left outline-none transition focus-visible:ring-2 focus-visible:ring-blue-200";
  const mobileActionToggleClass =
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 active:bg-slate-100";
  const mobileActionPanelClass = "mt-3 rounded-2xl border border-slate-200 bg-slate-50/90 p-2.5";
  const mobileSecondaryActionClass =
    "inline-flex min-h-10 w-full items-center justify-start rounded-xl border px-3 py-2 text-sm font-medium transition";
  const desktopHeaderStackClass = "flex items-start justify-between gap-3";
  const desktopSummaryBlockClass = "min-w-0 flex-1";
  const desktopRepeatControlRowClass = "grid gap-3";
  const isViewMode = builderViewMode === "view";
  const manualPoolViewSections = isManualPoolMode
    ? buildManualPoolViewSections(
        stepGroups,
        draft.steps,
        draft.basePaceSecondsPer100m,
        poolLengthUnit
      )
    : [];

  useAutoDismissNotice(workoutPdfNotice, setWorkoutPdfNotice);
  useAutoDismissNotice(garminExportNotice, setGarminExportNotice);
  useAutoDismissNotice(handoffNotice, setHandoffNotice);

  useEffect(() => {
    setPoolLengthInput(formatEditablePoolLength(draft.poolLengthM, poolLengthUnit));
  }, [draft.environment, draft.poolLengthM, poolLengthUnit]);

  useEffect(() => {
    if (openStepId && !draft.steps.some((step) => step.id === openStepId)) {
      setOpenStepId(null);
    }
  }, [draft.steps, openStepId]);

  useEffect(() => {
    if (!openMobileActionKey) return;

    const validMobileActionKeys = new Set<string>();
    for (const step of draft.steps) {
      validMobileActionKeys.add(`step:${step.id}`);
    }
    for (const group of stepGroups) {
      if (group.kind === "repeat") {
        validMobileActionKeys.add(`repeat:${group.repeatGroupId}`);
      }
    }

    if (!validMobileActionKeys.has(openMobileActionKey)) {
      setOpenMobileActionKey(null);
    }
  }, [draft.steps, openMobileActionKey, stepGroups]);

  useEffect(() => {
    setTimeDurationInputs((current) => {
      const next: Record<string, string> = {};

      for (const step of draft.steps) {
        if (!usesClockDurationInput(step.durationMode)) continue;

        next[step.id] = timeDurationInputFocusRef.current[step.id]
          ? (current[step.id] ?? formatEditableClockDuration(step.timeMin))
          : formatEditableClockDuration(step.timeMin);
      }

      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(next);
      if (
        currentKeys.length === nextKeys.length &&
        currentKeys.every((key) => current[key] === next[key])
      ) {
        return current;
      }

      return next;
    });
  }, [draft.steps]);

  useEffect(() => {
    setSupportToolsOpen(!showCalmBuilderLayout);
  }, [savedWorkoutId, showCalmBuilderLayout]);

  useEffect(() => {
    if (!isViewMode) return;

    setOpenStepId(null);
    setOpenMobileActionKey(null);
    setMetadataOpen(false);
  }, [isViewMode]);

  useEffect(() => {
    setManualPoolTitleEdited(false);
  }, [savedWorkoutId, savedWorkout?.updatedAt]);

  useEffect(() => {
    if (!pendingRemoval) return;

    if (
      pendingRemoval.kind === "step" &&
      !draft.steps.some((step) => step.id === pendingRemoval.stepId)
    ) {
      setPendingRemoval(null);
      return;
    }

    if (
      pendingRemoval.kind === "repeat" &&
      !draft.steps.some((step) => step.repeatGroupId === pendingRemoval.repeatGroupId)
    ) {
      setPendingRemoval(null);
    }
  }, [draft.steps, pendingRemoval]);

  useEffect(() => {
    setPendingRemoval(null);
    setLastRemovedBlock(null);
  }, [savedWorkoutId, savedWorkout?.updatedAt]);

  useEffect(() => {
    setMetadataOpen(forceMetadataOpenOnLoad || !metadataStartsCollapsed);
    setBuilderViewMode("edit");
    setPoolsidePrintStyle("color");
    setPoolsidePrintLayout("portrait");
    setSelectedPoolsideFocusIds(parseSignatureValues(defaultPoolsideFocusIdSignature));
  }, [
    copyVariant,
    defaultPoolsideFocusIdSignature,
    forceMetadataOpenOnLoad,
    metadataStartsCollapsed,
    savedWorkoutId,
  ]);

  useEffect(() => {
    const validFocusIds = new Set(parseSignatureValues(trainingFocusIdSignature));
    const defaultSelectedFocusIds = parseSignatureValues(defaultPoolsideFocusIdSignature);
    setSelectedPoolsideFocusIds((current) => {
      const nextSelected = current.filter((focusId) => validFocusIds.has(focusId));

      if (nextSelected.length > 0 || current.length > 0) {
        return Array.from(new Set(nextSelected));
      }

      return defaultSelectedFocusIds;
    });
  }, [defaultPoolsideFocusIdSignature, trainingFocusIdSignature]);

  useEffect(() => {
    setWorkoutPdfNotice("");
    setWorkoutPdfError("");
  }, [
    workoutPdfHtml,
    handoffDraftState,
    savedWorkoutId,
    savedWorkout?.updatedAt,
    poolsidePrintStyle,
    poolsidePrintLayout,
    selectedPoolsideFocusSignature,
    swimmerName,
  ]);

  useEffect(() => {
    setGarminExportNotice("");
    setGarminExportError("");
  }, [garminReadyExportPreview, handoffDraftState, savedWorkoutId, savedWorkout?.updatedAt]);

  useEffect(() => {
    setHandoffNotice("");
    setHandoffError("");
  }, [handoffText, handoffDraftState, savedWorkoutId, savedWorkout?.updatedAt]);

  useEffect(() => {
    setSupportSectionOpen({
      readiness: false,
      garminExport: false,
      handoff: false,
    });
  }, [savedWorkoutId]);

  const syncDraftSelections = useCallback(
    (nextDraft: SessionDraft) => {
      const nextPoolLengthUnit = resolveSessionDraftPoolLengthUnit(nextDraft.poolLengthUnit);
      const nextSteps = isManualPoolMode
        ? nextDraft.steps.map((step) =>
            syncManualPoolEditableStep(step, nextDraft.basePaceSecondsPer100m, nextPoolLengthUnit)
          )
        : nextDraft.steps;
      const requiredStrokes = Array.from(
        new Set(
          nextSteps
            .map((step) => step.stroke)
            .filter((stroke): stroke is SessionGeneratorStroke =>
              SESSION_GENERATOR_STROKES.includes(stroke as SessionGeneratorStroke)
            )
        )
      );
      const requiredEquipment = Array.from(
        new Set(
          nextSteps
            .map((step) => step.equipment)
            .filter((value): value is (typeof SESSION_GENERATOR_EQUIPMENT)[number] =>
              SESSION_GENERATOR_EQUIPMENT.includes(
                value as (typeof SESSION_GENERATOR_EQUIPMENT)[number]
              )
            )
        )
      );

      return {
        ...nextDraft,
        steps: nextSteps,
        allowedStrokes: Array.from(new Set([...nextDraft.allowedStrokes, ...requiredStrokes])),
        equipmentAllowlist: Array.from(
          new Set([...nextDraft.equipmentAllowlist, ...requiredEquipment])
        ),
      };
    },
    [isManualPoolMode]
  );

  useEffect(() => {
    if (!isManualPoolMode) {
      return;
    }

    const syncedDraft = syncDraftSelections(draft);
    if (!hasSelectionSyncChanges(draft, syncedDraft)) {
      return;
    }

    onDraftChange(syncedDraft);
  }, [draft, isManualPoolMode, onDraftChange, syncDraftSelections]);

  function stepUsesAllowedStroke(stroke: SessionGeneratorStroke) {
    return draft.steps.some((step) => step.stroke === stroke);
  }

  function stepUsesEquipment(item: (typeof SESSION_GENERATOR_EQUIPMENT)[number]) {
    return draft.steps.some((step) => step.equipment === item);
  }

  function updateDraft<K extends keyof SessionDraft>(key: K, value: SessionDraft[K]) {
    onDraftChange(
      syncDraftSelections({
        ...draft,
        [key]: value,
      })
    );
  }

  function updateDraftStep(stepId: string, updater: (step: SessionDraftStep) => SessionDraftStep) {
    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: draft.steps.map((step) => (step.id === stepId ? updater(step) : step)),
      })
    );
  }

  function moveDraftGroup(groupIndex: number, direction: -1 | 1) {
    const nextGroupIndex = groupIndex + direction;
    if (groupIndex < 0 || nextGroupIndex < 0 || nextGroupIndex >= stepGroups.length) return;

    const nextGroups = [...stepGroups];
    const [group] = nextGroups.splice(groupIndex, 1);
    nextGroups.splice(nextGroupIndex, 0, group);

    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: nextGroups.flatMap((group) =>
          group.kind === "repeat" && group.postSetRestEntry
            ? [...group.entries.map((entry) => entry.step), group.postSetRestEntry.step]
            : group.entries.map((entry) => entry.step)
        ),
      })
    );
  }

  function insertStepAt(
    insertIndex: number,
    overrides: Partial<SessionDraftStep> = {},
    options?: {
      autoCreateStandaloneRest?: boolean;
    }
  ) {
    const nextStep = buildBlankStep(draft.steps.length + 1, overrides);
    const shouldAutoCreateStandaloneRest =
      options?.autoCreateStandaloneRest === true &&
      isManualPoolMode &&
      !nextStep.repeatGroupId &&
      !nextStep.postSetRestForRepeatGroupId &&
      nextStep.category !== "rest";
    const insertedSteps = shouldAutoCreateStandaloneRest
      ? [nextStep, buildAutoRestStep(draft.steps.length + 2)]
      : [nextStep];
    const nextSteps = [...draft.steps];
    const safeInsertIndex = Math.min(Math.max(insertIndex, 0), nextSteps.length);

    nextSteps.splice(safeInsertIndex, 0, ...insertedSteps);
    setPendingRemoval(null);
    setLastRemovedBlock(null);
    setOpenStepId(nextStep.id);
    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: nextSteps,
      })
    );
  }

  function insertRepeatAt(insertIndex: number) {
    const nextSteps = buildRepeatStarterSteps(draft.steps.length + 1);
    const nextDraftSteps = [...draft.steps];
    const safeInsertIndex = Math.min(Math.max(insertIndex, 0), nextDraftSteps.length);

    nextDraftSteps.splice(safeInsertIndex, 0, ...nextSteps);
    setPendingRemoval(null);
    setLastRemovedBlock(null);
    setOpenStepId(nextSteps[0]?.id ?? null);
    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: nextDraftSteps,
      })
    );
  }

  function getGroupInsertIndex(groupIndex: number) {
    const group = stepGroups[groupIndex];
    const lastEntry =
      group?.kind === "repeat" && group.postSetRestEntry
        ? group.postSetRestEntry
        : group
          ? group.entries[group.entries.length - 1]
          : null;
    if (!lastEntry) return null;
    return lastEntry.index + 1;
  }

  function addStep() {
    insertStepAt(draft.steps.length, {}, { autoCreateStandaloneRest: true });
  }

  function addRepeat() {
    insertRepeatAt(draft.steps.length);
  }

  function insertStepAfterStep(stepId: string) {
    const sourceIndex = draft.steps.findIndex((step) => step.id === stepId);
    if (sourceIndex === -1) return;

    const sourceStep = draft.steps[sourceIndex];

    insertStepAt(
      sourceIndex + 1,
      sourceStep.repeatGroupId
        ? buildRepeatInsertedStep(
            sourceStep.repeatGroupId,
            sourceStep.repeatCount ?? null,
            resolveSessionDraftRepeatEndingRestMode(sourceStep.repeatEndingRestMode ?? null)
          )
        : {},
      {
        autoCreateStandaloneRest: !sourceStep.repeatGroupId,
      }
    );
  }

  function insertStepAfterGroup(groupIndex: number) {
    const insertIndex = getGroupInsertIndex(groupIndex);
    if (insertIndex === null) return;
    insertStepAt(insertIndex, {}, { autoCreateStandaloneRest: true });
  }

  function insertRepeatAfterGroup(groupIndex: number) {
    const insertIndex = getGroupInsertIndex(groupIndex);
    if (insertIndex === null) return;
    insertRepeatAt(insertIndex);
  }

  function duplicateStep(stepId: string) {
    const sourceIndex = draft.steps.findIndex((step) => step.id === stepId);
    if (sourceIndex === -1) return;

    const sourceStep = draft.steps[sourceIndex];
    const duplicatedStep: SessionDraftStep = {
      ...sourceStep,
      id: buildStepId(draft.steps.length + 1),
    };
    const nextSteps = [...draft.steps];
    nextSteps.splice(sourceIndex + 1, 0, duplicatedStep);

    setPendingRemoval(null);
    setLastRemovedBlock(null);
    setOpenStepId(duplicatedStep.id);
    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: nextSteps,
      })
    );
  }

  function duplicateRepeatGroup(repeatGroupId: string) {
    const sourceIndex = draft.steps.findIndex((step) => step.repeatGroupId === repeatGroupId);
    if (sourceIndex === -1) return;

    const sourceSteps = draft.steps.filter((step) => step.repeatGroupId === repeatGroupId);
    if (sourceSteps.length === 0) return;
    const sourcePostSetRest = draft.steps.find(
      (step) => step.postSetRestForRepeatGroupId === repeatGroupId
    );

    const nextRepeatGroupId = buildRepeatGroupId(draft.steps.length + 1);
    const duplicatedSteps = sourceSteps.map((step, index) => ({
      ...step,
      id: `${nextRepeatGroupId}-step-${index + 1}`,
      repeatGroupId: nextRepeatGroupId,
    }));
    const duplicatedPostSetRest = sourcePostSetRest
      ? {
          ...sourcePostSetRest,
          id: `${nextRepeatGroupId}-post-set-rest`,
          postSetRestForRepeatGroupId: nextRepeatGroupId,
        }
      : null;
    const nextSteps = [...draft.steps];
    nextSteps.splice(
      sourceIndex + sourceSteps.length + (sourcePostSetRest ? 1 : 0),
      0,
      ...duplicatedSteps,
      ...(duplicatedPostSetRest ? [duplicatedPostSetRest] : [])
    );

    setPendingRemoval(null);
    setLastRemovedBlock(null);
    setOpenStepId(duplicatedSteps[0]?.id ?? null);
    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: nextSteps,
      })
    );
  }

  function requestStepRemoval(stepId: string) {
    const stepIndex = draft.steps.findIndex((step) => step.id === stepId);
    if (stepIndex === -1) return;

    const step = draft.steps[stepIndex];
    setLastRemovedBlock(null);
    setPendingRemoval({
      kind: "step",
      stepId,
      label: buildStepRemovalLabel(step, stepIndex, {
        isManualPoolMode,
        basePaceSecondsPer100m: draft.basePaceSecondsPer100m,
        poolLengthUnit,
      }),
      repeatGroupId: step.repeatGroupId ?? null,
    });
  }

  function requestRepeatGroupRemoval(repeatGroupId: string) {
    const repeatEntries = draft.steps.filter((step) => step.repeatGroupId === repeatGroupId);
    if (repeatEntries.length === 0) return;
    const linkedPostSetRest = draft.steps.find(
      (step) => step.postSetRestForRepeatGroupId === repeatGroupId
    );

    const repeatCount = repeatEntries[0]?.repeatCount;
    const roundsLabel =
      typeof repeatCount === "number" ? `${repeatCount} rounds` : "repeat count not set";

    setLastRemovedBlock(null);
    setPendingRemoval({
      kind: "repeat",
      repeatGroupId,
      label: `Repeat block (${repeatEntries.length + (linkedPostSetRest ? 1 : 0)} steps, ${roundsLabel})`,
    });
  }

  function cancelPendingRemoval() {
    setPendingRemoval(null);
  }

  function confirmPendingRemoval() {
    if (!pendingRemoval) return;

    if (pendingRemoval.kind === "step") {
      const removeIndex = draft.steps.findIndex((step) => step.id === pendingRemoval.stepId);
      if (removeIndex === -1) {
        setPendingRemoval(null);
        return;
      }

      const removedStep = draft.steps[removeIndex];
      const nextSteps = draft.steps.filter((step) => step.id !== pendingRemoval.stepId);
      const removedOpenStep = openStepId === pendingRemoval.stepId;

      setPendingRemoval(null);
      setLastRemovedBlock({
        kind: "step",
        label: pendingRemoval.label,
        steps: [removedStep],
        insertIndex: removeIndex,
        restoreOpenStepId: removedOpenStep ? removedStep.id : openStepId,
      });
      if (removedOpenStep) {
        setOpenStepId(null);
      }
      onDraftChange(
        syncDraftSelections({
          ...draft,
          steps: nextSteps,
        })
      );
      return;
    }

    const removedSteps = draft.steps.filter(
      (step) =>
        step.repeatGroupId === pendingRemoval.repeatGroupId ||
        step.postSetRestForRepeatGroupId === pendingRemoval.repeatGroupId
    );
    if (removedSteps.length === 0) {
      setPendingRemoval(null);
      return;
    }

    const insertIndex = draft.steps.findIndex(
      (step) => step.repeatGroupId === pendingRemoval.repeatGroupId
    );
    const nextSteps = draft.steps.filter(
      (step) =>
        step.repeatGroupId !== pendingRemoval.repeatGroupId &&
        step.postSetRestForRepeatGroupId !== pendingRemoval.repeatGroupId
    );
    const removedOpenStep = removedSteps.some((step) => step.id === openStepId);

    setPendingRemoval(null);
    setLastRemovedBlock({
      kind: "repeat",
      label: pendingRemoval.label,
      steps: removedSteps,
      insertIndex,
      restoreOpenStepId: removedOpenStep ? (removedSteps[0]?.id ?? null) : openStepId,
    });
    if (removedOpenStep) {
      setOpenStepId(null);
    }
    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: nextSteps,
      })
    );
  }

  function undoLastRemoval() {
    if (!lastRemovedBlock) return;

    const nextSteps = [...draft.steps];
    const insertIndex = Math.min(Math.max(lastRemovedBlock.insertIndex, 0), nextSteps.length);
    nextSteps.splice(insertIndex, 0, ...lastRemovedBlock.steps);

    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: nextSteps,
      })
    );
    setOpenStepId(lastRemovedBlock.restoreOpenStepId);
    setLastRemovedBlock(null);
  }

  function updateRepeatGroupCount(repeatGroupId: string, value: string) {
    const nextRepeatCount = parsePositiveInteger(value);

    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: draft.steps.map((step) =>
          step.repeatGroupId === repeatGroupId
            ? {
                ...step,
                repeatCount: nextRepeatCount,
              }
            : step
        ),
      })
    );
  }

  function updateRepeatGroupEndingRestMode(
    repeatGroupId: string,
    value: SessionDraftRepeatEndingRestMode
  ) {
    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: draft.steps.map((step) =>
          step.repeatGroupId === repeatGroupId
            ? {
                ...step,
                repeatEndingRestMode: value,
              }
            : step
        ),
      })
    );
  }

  function updateStepTargetPace(stepId: string, nextPart: "minutes" | "seconds", rawValue: string) {
    const sanitized = rawValue.replace(/[^\d]/g, "").slice(0, 2);

    updateDraftStep(stepId, (current) => {
      const currentSeconds = current.targetPaceSecondsPer100m ?? 0;
      const minutes =
        nextPart === "minutes"
          ? sanitized.length > 0
            ? Number.parseInt(sanitized, 10)
            : 0
          : Math.floor(currentSeconds / 60);
      const seconds =
        nextPart === "seconds"
          ? sanitized.length > 0
            ? Math.min(59, Number.parseInt(sanitized, 10))
            : 0
          : currentSeconds % 60;
      const totalSeconds = minutes * 60 + seconds;

      return {
        ...current,
        targetPaceSecondsPer100m: totalSeconds > 0 ? totalSeconds : null,
      };
    });
  }

  function updateStepDurationMode(stepId: string, nextMode: SessionDraftStepDurationMode) {
    updateDraftStep(stepId, (current) =>
      applyStepDurationModeDefaults(
        current,
        isManualPoolMode && !isManualPoolDurationModeAllowed(current.category, nextMode)
          ? getDefaultManualPoolDurationMode(current.category)
          : nextMode
      )
    );
  }

  function updateStepDurationClock(
    stepId: string,
    nextPart: "minutes" | "seconds",
    rawValue: string
  ) {
    const sanitized = rawValue.replace(/[^\d]/g, "").slice(0, 2);

    updateDraftStep(stepId, (current) => {
      const currentSeconds = getClockTotalSeconds(current.timeMin);
      const minutes =
        nextPart === "minutes"
          ? sanitized.length > 0
            ? Number.parseInt(sanitized, 10)
            : 0
          : Math.floor(currentSeconds / 60);
      const seconds =
        nextPart === "seconds"
          ? sanitized.length > 0
            ? Math.min(59, Number.parseInt(sanitized, 10))
            : 0
          : currentSeconds % 60;
      const totalSeconds = minutes * 60 + seconds;

      return {
        ...current,
        timeMin: totalSeconds > 0 ? totalSeconds / 60 : null,
      };
    });
  }

  function handleTimeDurationInputChange(stepId: string, rawValue: string) {
    const sanitized = sanitizeClockDurationInput(rawValue);
    setTimeDurationInputs((current) =>
      current[stepId] === sanitized ? current : { ...current, [stepId]: sanitized }
    );

    const parsed = parseClockDurationInputForChange(sanitized);
    if (parsed === undefined) {
      return;
    }

    updateDraftStep(stepId, (current) => ({
      ...current,
      timeMin: parsed,
    }));
  }

  function commitTimeDurationInput(stepId: string) {
    timeDurationInputFocusRef.current[stepId] = false;
    const normalized = normalizeClockDurationInput(timeDurationInputs[stepId] ?? "");
    setTimeDurationInputs((current) =>
      current[stepId] === normalized.display
        ? current
        : { ...current, [stepId]: normalized.display }
    );
    updateDraftStep(stepId, (current) => ({
      ...current,
      timeMin: normalized.timeMin,
    }));
  }

  function updateStepDistanceSelection(stepId: string, value: string) {
    updateDraftStep(stepId, (current) => ({
      ...current,
      distanceM:
        value === CUSTOM_DISTANCE_VALUE
          ? SESSION_DRAFT_STEP_DISTANCE_PRESETS.some((preset) =>
              isDistanceQuickChoiceSelected(current.distanceM, preset, poolLengthUnit)
            )
            ? null
            : current.distanceM
          : convertPoolUnitValueToMeters(Number.parseFloat(value), poolLengthUnit),
    }));
  }

  function toggleDraftStroke(stroke: SessionGeneratorStroke) {
    const exists = draft.allowedStrokes.includes(stroke);
    updateDraft(
      "allowedStrokes",
      exists
        ? draft.allowedStrokes.filter((value) => value !== stroke)
        : [...draft.allowedStrokes, stroke]
    );
  }

  function toggleDraftEquipment(item: (typeof SESSION_GENERATOR_EQUIPMENT)[number]) {
    const exists = draft.equipmentAllowlist.includes(item);
    updateDraft(
      "equipmentAllowlist",
      exists
        ? draft.equipmentAllowlist.filter((value) => value !== item)
        : [...draft.equipmentAllowlist, item]
    );
  }

  function updateDraftPoolLengthInput(nextValue: string) {
    setPoolLengthInput(nextValue);

    const trimmed = nextValue.trim();
    if (trimmed.length === 0) {
      updateDraft("poolLengthM", null);
      return;
    }

    const parsed = parsePoolLengthInput(nextValue, poolLengthUnit);
    updateDraft("poolLengthM", parsed);
  }

  function updatePoolLengthUnit(nextUnit: SessionDraftPoolLengthUnit) {
    updateDraft("poolLengthUnit", nextUnit);
  }

  function choosePoolLengthQuickChoice(value: number) {
    const nextPoolLength = convertPoolUnitValueToMeters(value, poolLengthUnit);
    setPoolLengthInput(formatEditablePoolLength(nextPoolLength, poolLengthUnit));
    updateDraft("poolLengthM", nextPoolLength);
  }

  function togglePoolsideFocusSelection(focusId: string) {
    setSelectedPoolsideFocusIds((current) =>
      current.includes(focusId)
        ? current.filter((value) => value !== focusId)
        : [...current, focusId]
    );
  }

  async function copyWorkoutHandoff() {
    setHandoffNotice("");
    setHandoffError("");

    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable.");
      }

      await navigator.clipboard.writeText(handoffText);
      setHandoffNotice("Workout handoff copied.");
    } catch {
      setHandoffError("Could not copy the workout handoff automatically. Use the preview below.");
    }
  }

  function downloadWorkoutHandoff() {
    setHandoffNotice("");
    setHandoffError("");

    try {
      const blob = new Blob([handoffText], {
        type: "text/plain;charset=utf-8",
      });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = handoffFileName;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setHandoffNotice(`Downloaded ${handoffFileName}.`);
    } catch {
      setHandoffError("Could not download the workout handoff right now.");
    }
  }

  function downloadWorkoutGarminReadyExport() {
    setGarminExportNotice("");
    setGarminExportError("");

    try {
      const blob = new Blob([garminReadyExportPreview], {
        type: "application/json;charset=utf-8",
      });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = garminReadyExportFileName;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setGarminExportNotice(`Downloaded ${garminReadyExportFileName}.`);
    } catch {
      setGarminExportError("Could not download the Garmin-ready JSON right now.");
    }
  }

  function openWorkoutPdfPrintView(variant: "standard" | "poolside" = "standard") {
    setWorkoutPdfNotice("");
    setWorkoutPdfError("");

    try {
      if (typeof window === "undefined") {
        throw new Error("Window unavailable.");
      }

      const html =
        variant === "poolside"
          ? buildWorkoutPdfHtmlDocument(draft, {
              draftState: handoffDraftState,
              variant: "poolside",
              focusPoints: selectedPoolsideFocusPoints,
              poolsidePrintStyle,
              poolsidePrintLayout,
              swimmerName,
              logoUrl: new URL(BRAND_PDF_LOGO_PATH, window.location.origin).toString(),
              fontUrl: new URL(BRAND_FONT_PUBLIC_PATH, window.location.origin).toString(),
            })
          : workoutPdfHtml;
      const fileName = variant === "poolside" ? workoutPoolsidePdfFileName : workoutPdfFileName;
      const variantLabel = variant === "poolside" ? "Print Preview" : "PDF";
      const printWindow = window.open("", "_blank");

      if (!printWindow?.document) {
        throw new Error("Popup blocked.");
      }

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus?.();
      setWorkoutPdfNotice(
        `Opened ${variantLabel} for ${fileName}. Use Print / Save PDF in that tab.`
      );
    } catch {
      setWorkoutPdfError(
        `Could not open the ${variant === "poolside" ? "poolside note" : "full-session"} PDF. Check whether pop-ups are blocked.`
      );
    }
  }

  function renderStepEditorCard(
    step: SessionDraftStep,
    index: number,
    groupIndex: number,
    options?: {
      insideRepeatGroup?: boolean;
      repeatStepNumber?: number;
      labelOverride?: string;
      descriptionOverride?: string | null;
      isLinkedPostSetRest?: boolean;
    }
  ) {
    const insideRepeatGroup = options?.insideRepeatGroup ?? false;
    const isLinkedPostSetRest = options?.isLinkedPostSetRest ?? false;
    const isOpen = !isViewMode && openStepId === step.id;
    const toggleLabel = isOpen ? "Done" : "Edit";
    const panelId = `session-draft-step-panel-${step.id}`;
    const normalizedStep = isManualPoolMode ? normalizeManualPoolStepForEditor(step) : step;
    const nextDraftStep = draft.steps[index + 1] ?? null;
    const linkedRestStep =
      isManualPoolMode &&
      normalizedStep.category !== "rest" &&
      nextDraftStep?.category === "rest" &&
      ((normalizedStep.repeatGroupId &&
        nextDraftStep.repeatGroupId === normalizedStep.repeatGroupId) ||
        (!normalizedStep.repeatGroupId &&
          !nextDraftStep.repeatGroupId &&
          !nextDraftStep.postSetRestForRepeatGroupId))
        ? nextDraftStep
        : null;
    const topLevelSingleEntries = isManualPoolMode
      ? stepGroups.filter(
          (group): group is Extract<StepRenderGroup, { kind: "single" }> => group.kind === "single"
        )
      : [];
    const sameTypeTotal = isManualPoolMode
      ? topLevelSingleEntries.filter(
          (group) =>
            normalizeManualPoolStepForEditor(group.entries[0].step).category ===
            normalizedStep.category
        ).length
      : 0;
    const sameTypePosition = isManualPoolMode
      ? topLevelSingleEntries.filter(
          (group) =>
            normalizeManualPoolStepForEditor(group.entries[0].step).category ===
              normalizedStep.category && group.entries[0].index <= index
        ).length
      : 0;
    const stepLabel =
      options?.labelOverride ??
      (insideRepeatGroup
        ? step.category === "rest"
          ? `Repeat rest step ${options?.repeatStepNumber ?? 1}`
          : `Repeat step ${options?.repeatStepNumber ?? 1}`
        : isManualPoolMode
          ? sameTypeTotal > 1
            ? `${getSessionStepCategoryLabel(normalizedStep.category)} ${sameTypePosition} of ${sameTypeTotal}`
            : getSessionStepCategoryLabel(normalizedStep.category)
          : `Step ${index + 1}`);
    const selectedDistancePreset = SESSION_DRAFT_STEP_DISTANCE_PRESETS.find((value) =>
      isDistanceQuickChoiceSelected(normalizedStep.distanceM, value, poolLengthUnit)
    );
    const isMinimalRestEditor = isManualPoolMode && normalizedStep.category === "rest";
    const isRestStepCard = normalizedStep.category === "rest";
    const stepTitle = isManualPoolMode
      ? buildManualPoolDisplaySummary(
          normalizedStep,
          draft.basePaceSecondsPer100m,
          poolLengthUnit,
          linkedRestStep
        )
      : step.name || getSessionStepCategoryLabel(step.category);
    const mobileActionKey = `step:${step.id}`;
    const mobileActionsOpen = openMobileActionKey === mobileActionKey;
    const showMobilePrimaryAddAfter = !isViewMode && isOpen && !isLinkedPostSetRest;
    const showMobilePrimaryAddRepeatAfter = showMobilePrimaryAddAfter && !insideRepeatGroup;
    const stepCategoryValue = isManualPoolMode ? normalizedStep.category : step.category;
    const stepStrokeValue = isManualPoolMode
      ? (normalizedStep.stroke ?? "choice")
      : (step.stroke ?? "choice");
    const stepDrillTypeValue =
      isManualPoolMode && normalizedStep.drillType
        ? normalizedStep.drillType
        : (step.drillType ?? "none");
    const stepIntensityValue = isManualPoolMode ? normalizedStep.intensity : step.intensity;
    const stepEquipmentValue = isManualPoolMode
      ? (normalizedStep.equipment ?? "none")
      : (step.equipment ?? "none");
    const stepDurationModeValue = isManualPoolMode
      ? normalizedStep.durationMode
      : step.durationMode;
    const stepTargetModeValue = isManualPoolMode
      ? (normalizedStep.targetMode ?? "none")
      : (step.targetMode ?? "none");
    const stepEffortTargetValue = isManualPoolMode
      ? (normalizedStep.effortTarget ?? normalizedStep.intensity)
      : (step.effortTarget ?? step.intensity);
    const pendingDelete = pendingRemoval?.kind === "step" && pendingRemoval.stepId === step.id;
    const stepSummaryContent = (
      <>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stepLabel}</p>
        <p className="mt-1 text-base font-medium text-slate-900 sm:text-sm">{stepTitle}</p>
        {!isManualPoolMode ? (
          <p className="mt-1 text-xs font-medium text-slate-600">
            {getSessionStepCategoryLabel(step.category)}
          </p>
        ) : null}
        {!isManualPoolMode ? (
          <p className="mt-2 text-xs text-slate-600">
            {buildStepSummary(
              step,
              draft.basePaceSecondsPer100m,
              draft.environment,
              poolLengthUnit
            )}
          </p>
        ) : null}
        {options?.descriptionOverride ? (
          <p className="mt-2 text-xs text-slate-500">{options.descriptionOverride}</p>
        ) : null}
        {!isManualPoolMode && step.targetSummary ? (
          <p className="mt-1 text-xs text-slate-500">{step.targetSummary}</p>
        ) : null}
        {step.notes ? <p className="mt-1 text-xs text-slate-400">{step.notes}</p> : null}
      </>
    );

    return (
      <article
        key={step.id}
        data-mobile-actions="progressive"
        className={`rounded-2xl border p-3 transition sm:p-4 ${
          isOpen
            ? isRestStepCard
              ? "border-blue-300 bg-blue-50/70 shadow-sm ring-1 ring-blue-100"
              : "border-blue-300 bg-white shadow-sm ring-1 ring-blue-100"
            : isRestStepCard
              ? "border-blue-100 bg-blue-50/55"
              : insideRepeatGroup
                ? "border-blue-200 bg-white"
                : "border-slate-200 bg-slate-50/70"
        }`}
      >
        <div className={desktopHeaderStackClass}>
          <div className={desktopSummaryBlockClass}>
            {isViewMode ? (
              <div data-testid={`session-draft-step-mobile-summary-${index}`} className="sm:hidden">
                {stepSummaryContent}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOpenMobileActionKey(null);
                  setOpenStepId((current) => (current === step.id ? null : step.id));
                }}
                aria-expanded={isOpen}
                aria-controls={panelId}
                data-testid={`session-draft-step-mobile-summary-${index}`}
                className={`${mobileSummaryToggleClass} sm:hidden`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">{stepSummaryContent}</div>
                  <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
                    {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </span>
                </div>
              </button>
            )}
            <div data-testid={`session-draft-step-summary-${index}`} className="hidden sm:block">
              {stepSummaryContent}
            </div>
          </div>
          {!isViewMode ? (
            <div className="hidden shrink-0 sm:flex">
              <button
                type="button"
                onClick={() => setOpenStepId((current) => (current === step.id ? null : step.id))}
                aria-expanded={isOpen}
                aria-controls={panelId}
                data-testid={`session-draft-step-toggle-${index}`}
                className={`inline-flex h-9 items-center justify-center rounded-xl border px-3 text-sm transition ${
                  isOpen
                    ? "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {toggleLabel}
              </button>
            </div>
          ) : null}
          {!isViewMode ? (
            <div className="flex shrink-0 sm:hidden">
              <button
                type="button"
                onClick={() =>
                  setOpenMobileActionKey((current) =>
                    current === mobileActionKey ? null : mobileActionKey
                  )
                }
                aria-expanded={mobileActionsOpen}
                aria-controls={`session-draft-step-mobile-actions-panel-${step.id}`}
                data-testid={`session-draft-step-mobile-actions-toggle-${index}`}
                className={mobileActionToggleClass}
              >
                <Ellipsis className="size-5" />
                <span className="sr-only">
                  {mobileActionsOpen ? "Hide step actions" : "Show step actions"}
                </span>
              </button>
            </div>
          ) : null}
        </div>

        {!isViewMode && mobileActionsOpen ? (
          <div
            id={`session-draft-step-mobile-actions-panel-${step.id}`}
            data-testid={`session-draft-step-mobile-actions-panel-${index}`}
            className={`${mobileActionPanelClass} sm:hidden`}
          >
            {!insideRepeatGroup && !isLinkedPostSetRest ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    moveDraftGroup(groupIndex, -1);
                    setOpenMobileActionKey(null);
                  }}
                  disabled={groupIndex === 0}
                  data-testid={`session-draft-step-mobile-move-up-${index}`}
                  className={`${mobileSecondaryActionClass} border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    moveDraftGroup(groupIndex, 1);
                    setOpenMobileActionKey(null);
                  }}
                  disabled={groupIndex === stepGroups.length - 1}
                  data-testid={`session-draft-step-mobile-move-down-${index}`}
                  className={`${mobileSecondaryActionClass} border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  Move down
                </button>
              </div>
            ) : null}
            <div className="mt-2 grid gap-2">
              {!showMobilePrimaryAddAfter && !isLinkedPostSetRest ? (
                <button
                  type="button"
                  onClick={() => {
                    insertStepAfterStep(step.id);
                    setOpenMobileActionKey(null);
                  }}
                  data-testid={`session-draft-step-mobile-add-after-${index}`}
                  className={`${mobileSecondaryActionClass} border-blue-200 bg-white text-blue-800 hover:bg-blue-50`}
                >
                  Add step after
                </button>
              ) : null}
              {!showMobilePrimaryAddRepeatAfter && !insideRepeatGroup && !isLinkedPostSetRest ? (
                <button
                  type="button"
                  onClick={() => {
                    insertRepeatAfterGroup(groupIndex);
                    setOpenMobileActionKey(null);
                  }}
                  data-testid={`session-draft-step-mobile-add-repeat-after-${index}`}
                  className={`${mobileSecondaryActionClass} border-blue-200 bg-white text-blue-800 hover:bg-blue-50`}
                >
                  Add repeat after
                </button>
              ) : null}
              {isLinkedPostSetRest ? null : (
                <button
                  type="button"
                  onClick={() => {
                    duplicateStep(step.id);
                    setOpenMobileActionKey(null);
                  }}
                  data-testid={`session-draft-step-mobile-duplicate-${index}`}
                  className={`${mobileSecondaryActionClass} border-slate-200 bg-white text-slate-700 hover:bg-slate-100`}
                >
                  Duplicate
                </button>
              )}
              {isLinkedPostSetRest ? null : (
                <button
                  type="button"
                  onClick={() => {
                    requestStepRemoval(step.id);
                    setOpenMobileActionKey(null);
                  }}
                  data-testid={`session-draft-step-mobile-remove-${index}`}
                  className={`${mobileSecondaryActionClass} border-rose-200 bg-white text-rose-700 hover:bg-rose-50`}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ) : null}

        {!isViewMode && showMobilePrimaryAddAfter ? (
          <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => {
                insertStepAfterStep(step.id);
                setOpenMobileActionKey(null);
              }}
              data-testid={`session-draft-step-mobile-primary-add-after-${index}`}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm font-medium text-blue-800 transition hover:bg-blue-50"
            >
              Add after
            </button>
            {showMobilePrimaryAddRepeatAfter ? (
              <button
                type="button"
                onClick={() => {
                  insertRepeatAfterGroup(groupIndex);
                  setOpenMobileActionKey(null);
                }}
                data-testid={`session-draft-step-mobile-primary-add-repeat-after-${index}`}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-800 transition hover:bg-blue-100"
              >
                Repeat after
              </button>
            ) : null}
          </div>
        ) : null}

        {pendingDelete ? (
          <div
            data-testid="workout-editor-removal-confirm"
            className="mt-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-3"
          >
            <p className="text-sm font-medium text-rose-950">
              Delete <span className="font-semibold">{pendingRemoval?.label ?? "this step"}</span>?
            </p>
            <p className="mt-1 text-sm text-rose-900">
              This builder change stays local until you save, and you can still undo it right after
              deletion.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={confirmPendingRemoval}
                data-testid="workout-editor-removal-confirm-button"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 active:bg-rose-700"
              >
                Delete now
              </button>
              <button
                type="button"
                onClick={cancelPendingRemoval}
                data-testid="workout-editor-removal-cancel-button"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-900 transition hover:bg-rose-100 active:bg-rose-200"
              >
                Keep it
              </button>
            </div>
          </div>
        ) : null}

        {isOpen ? (
          <div id={panelId} className="mt-4 grid gap-4 md:grid-cols-2">
            {isManualPoolMode ? null : (
              <label className="text-sm text-slate-700">
                Step name
                <input
                  type="text"
                  value={step.name}
                  onChange={(event) =>
                    updateDraftStep(step.id, (current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  data-testid={`session-draft-step-name-${index}`}
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            )}

            <label className="text-sm text-slate-700">
              {isManualPoolMode ? "Step Type" : "Category"}
              <select
                value={stepCategoryValue}
                disabled={isLinkedPostSetRest}
                onChange={(event) =>
                  updateDraftStep(step.id, (current) =>
                    applyRecommendedStepFocus(current, {
                      category: event.target.value as SessionDraftStepCategory,
                    })
                  )
                }
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {(isLinkedPostSetRest
                  ? (["rest"] as const)
                  : isManualPoolMode
                    ? MANUAL_POOL_VISIBLE_STEP_CATEGORIES
                    : SESSION_DRAFT_STEP_CATEGORIES
                ).map((value) => (
                  <option key={value} value={value}>
                    {getSessionStepCategoryLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            {isMinimalRestEditor ? null : (
              <label className="text-sm text-slate-700">
                {isManualPoolMode ? "Stroke Type" : "Stroke pattern"}
                <select
                  value={stepStrokeValue}
                  onChange={(event) => {
                    const nextStroke = event.target.value as SessionDraftStep["stroke"];

                    updateDraftStep(step.id, (current) =>
                      applyRecommendedStepFocus(current, {
                        stroke: nextStroke,
                      })
                    );
                  }}
                  data-testid={`session-draft-step-stroke-${index}`}
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {(isManualPoolMode
                    ? MANUAL_POOL_VISIBLE_STEP_STROKES
                    : SESSION_DRAFT_STEP_STROKES
                  ).map((value) => (
                    <option key={value} value={value}>
                      {getSessionStepStrokeLabel(value)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {isMinimalRestEditor ? null : (
              <label className="text-sm text-slate-700">
                {isManualPoolMode ? "Drill Type" : "Focus tag"}
                <select
                  value={stepDrillTypeValue}
                  onChange={(event) =>
                    updateDraftStep(step.id, (current) => ({
                      ...current,
                      drillType: event.target.value as NonNullable<SessionDraftStep["drillType"]>,
                    }))
                  }
                  data-testid={`session-draft-step-drill-type-${index}`}
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {SESSION_DRAFT_STEP_DRILL_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {getSessionStepDrillTypeLabel(value)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {isManualPoolMode || isMinimalRestEditor ? null : (
              <>
                <p className="text-sm text-slate-500 md:col-span-2">
                  {buildStepStrokeGuidance(step, isManualPoolMode)}
                </p>
                <p className="text-sm text-slate-500 md:col-span-2">
                  {buildStepFocusGuidance(step, isManualPoolMode)}
                </p>
              </>
            )}

            {isMinimalRestEditor ? null : (
              <label className="text-sm text-slate-700">
                Equipment
                <select
                  value={stepEquipmentValue}
                  onChange={(event) =>
                    updateDraftStep(step.id, (current) => ({
                      ...current,
                      equipment: event.target.value as NonNullable<SessionDraftStep["equipment"]>,
                    }))
                  }
                  data-testid={`session-draft-step-equipment-${index}`}
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {SESSION_DRAFT_STEP_EQUIPMENT.map((value) => (
                    <option key={value} value={value}>
                      {getSessionStepEquipmentLabel(value)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {isManualPoolMode || isMinimalRestEditor ? null : (
              <label className="text-sm text-slate-700">
                Effort
                <select
                  value={stepIntensityValue}
                  onChange={(event) =>
                    updateDraftStep(step.id, (current) => ({
                      ...current,
                      intensity: event.target.value as SessionDraftStepIntensityPreset,
                    }))
                  }
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {(isManualPoolMode
                    ? MANUAL_POOL_VISIBLE_STEP_INTENSITY_PRESETS
                    : SESSION_DRAFT_STEP_INTENSITY_PRESETS
                  ).map((value) => (
                    <option key={value} value={value}>
                      {getSessionStepIntensityLabel(value)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="text-sm text-slate-700">
              {isManualPoolMode ? "Duration" : "Duration mode"}
              <select
                value={stepDurationModeValue}
                onChange={(event) =>
                  updateStepDurationMode(
                    step.id,
                    event.target.value as SessionDraftStepDurationMode
                  )
                }
                data-testid={`session-draft-step-duration-mode-${index}`}
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {(isManualPoolMode
                  ? getManualPoolDurationModesForCategory(stepCategoryValue)
                  : SESSION_DRAFT_STEP_DURATION_MODES
                ).map((value) => (
                  <option key={value} value={value}>
                    {getStepDurationModeEditorLabel(value, isManualPoolMode)}
                  </option>
                ))}
              </select>
            </label>

            {step.durationMode === "distance" ? (
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4 md:col-span-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <label className="text-sm text-slate-700">
                  Distance
                  <select
                    value={
                      selectedDistancePreset
                        ? String(selectedDistancePreset)
                        : CUSTOM_DISTANCE_VALUE
                    }
                    onChange={(event) => updateStepDistanceSelection(step.id, event.target.value)}
                    data-testid={`session-draft-step-distance-${index}`}
                    className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    {SESSION_DRAFT_STEP_DISTANCE_PRESETS.map((value) => (
                      <option key={value} value={String(value)}>
                        {poolLengthUnit === "yd" ? `${value}yd` : formatDistanceMetersLabel(value)}
                      </option>
                    ))}
                    <option value={CUSTOM_DISTANCE_VALUE}>Custom distance</option>
                  </select>
                </label>
                {!selectedDistancePreset ? (
                  <label className="text-sm text-slate-700">
                    {`Custom distance (${poolLengthUnit})`}
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formatEditableDistance(step.distanceM, poolLengthUnit)}
                      onChange={(event) =>
                        updateDraftStep(step.id, (current) => ({
                          ...current,
                          distanceM: parseDistanceInput(event.target.value, poolLengthUnit),
                        }))
                      }
                      data-testid={`session-draft-step-distance-custom-${index}`}
                      className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </label>
                ) : (
                  <div className="self-end text-sm text-slate-500">
                    {typeof step.distanceM === "number"
                      ? formatDistanceMetersLabel(step.distanceM, poolLengthUnit)
                      : null}
                  </div>
                )}
              </div>
            ) : step.durationMode === "fixed_rest" && isManualPoolMode ? (
              <label className="text-sm text-slate-700">
                Rest time
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM:SS"
                  value={timeDurationInputs[step.id] ?? ""}
                  onFocus={() => {
                    timeDurationInputFocusRef.current[step.id] = true;
                  }}
                  onBlur={() => {
                    commitTimeDurationInput(step.id);
                  }}
                  onChange={(event) => handleTimeDurationInputChange(step.id, event.target.value)}
                  data-testid={`session-draft-step-rest-time-${index}`}
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            ) : step.durationMode === "fixed_rest" ? (
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4 md:col-span-2 md:grid-cols-[1fr_1fr_auto]">
                <label className="text-sm text-slate-700">
                  Minutes
                  <input
                    type="text"
                    inputMode="numeric"
                    value={getDurationMinutes(step.timeMin)}
                    onChange={(event) =>
                      updateStepDurationClock(step.id, "minutes", event.target.value)
                    }
                    data-testid={`session-draft-step-rest-minutes-${index}`}
                    className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  Seconds
                  <input
                    type="text"
                    inputMode="numeric"
                    value={getDurationSeconds(step.timeMin)}
                    onChange={(event) =>
                      updateStepDurationClock(step.id, "seconds", event.target.value)
                    }
                    data-testid={`session-draft-step-rest-seconds-${index}`}
                    className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
                <div className="self-end text-sm text-slate-500">
                  {step.timeMin
                    ? `Fixed Rest Time ${formatClockDurationLabel(step.timeMin)}`
                    : "Set Fixed Rest Time"}
                </div>
              </div>
            ) : step.durationMode === "time" ? (
              <label className="text-sm text-slate-700">
                {isManualPoolMode ? "Time" : "Time (min)"}
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={isManualPoolMode ? "MM:SS" : undefined}
                  value={
                    isManualPoolMode ? (timeDurationInputs[step.id] ?? "") : (step.timeMin ?? "")
                  }
                  onFocus={() => {
                    if (!isManualPoolMode) return;
                    timeDurationInputFocusRef.current[step.id] = true;
                  }}
                  onBlur={() => {
                    if (!isManualPoolMode) return;
                    commitTimeDurationInput(step.id);
                  }}
                  onChange={(event) =>
                    isManualPoolMode
                      ? handleTimeDurationInputChange(step.id, event.target.value)
                      : updateDraftStep(step.id, (current) => ({
                          ...current,
                          timeMin: parsePositiveNumber(event.target.value),
                        }))
                  }
                  data-testid={`session-draft-step-time-${index}`}
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            ) : step.durationMode === "send_off" && isManualPoolMode ? (
              <label className="text-sm text-slate-700">
                Send-off time
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM:SS"
                  value={timeDurationInputs[step.id] ?? ""}
                  onFocus={() => {
                    timeDurationInputFocusRef.current[step.id] = true;
                  }}
                  onBlur={() => {
                    commitTimeDurationInput(step.id);
                  }}
                  onChange={(event) => handleTimeDurationInputChange(step.id, event.target.value)}
                  data-testid={`session-draft-step-sendoff-time-${index}`}
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            ) : step.durationMode === "send_off" ? (
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4 md:col-span-2 md:grid-cols-[1fr_1fr_auto]">
                <label className="text-sm text-slate-700">
                  Minutes
                  <input
                    type="text"
                    inputMode="numeric"
                    value={getDurationMinutes(step.timeMin)}
                    onChange={(event) =>
                      updateStepDurationClock(step.id, "minutes", event.target.value)
                    }
                    data-testid={`session-draft-step-sendoff-minutes-${index}`}
                    className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  Seconds
                  <input
                    type="text"
                    inputMode="numeric"
                    value={getDurationSeconds(step.timeMin)}
                    onChange={(event) =>
                      updateStepDurationClock(step.id, "seconds", event.target.value)
                    }
                    data-testid={`session-draft-step-sendoff-seconds-${index}`}
                    className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
                <div className="self-end text-sm text-slate-500">
                  {step.timeMin
                    ? `Send-Off Time ${formatClockDurationLabel(step.timeMin)}`
                    : "Set Send-Off Time"}
                </div>
              </div>
            ) : step.durationMode === "css_send_off" ? (
              <label className="text-sm text-slate-700 md:col-span-2">
                CSS-Based Send-Off Time
                <select
                  value={String(step.cssSendOffOffsetSeconds ?? 0)}
                  onChange={(event) =>
                    updateDraftStep(step.id, (current) => ({
                      ...current,
                      cssSendOffOffsetSeconds: Number.parseInt(event.target.value, 10),
                    }))
                  }
                  data-testid={`session-draft-step-css-sendoff-offset-${index}`}
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {SESSION_DRAFT_STEP_CSS_TARGET_OFFSETS.map((value) => {
                    const sign = value > 0 ? "+" : "";
                    return (
                      <option key={value} value={String(value)}>
                        {`CSS ${sign}${value}s (${formatClockDurationLabelFromSeconds(
                          draft.basePaceSecondsPer100m + value
                        )})`}
                      </option>
                    );
                  })}
                </select>
              </label>
            ) : null}

            {isMinimalRestEditor ? null : (
              <label className="text-sm text-slate-700">
                {isManualPoolMode ? "Target" : "Target mode"}
                <select
                  value={stepTargetModeValue}
                  onChange={(event) =>
                    updateDraftStep(step.id, (current) => ({
                      ...current,
                      targetMode: event.target.value as NonNullable<SessionDraftStep["targetMode"]>,
                      effortTarget:
                        event.target.value === "effort"
                          ? (current.effortTarget ?? current.intensity)
                          : null,
                      targetPaceSecondsPer100m:
                        event.target.value === "target_pace"
                          ? current.targetPaceSecondsPer100m
                          : null,
                      cssTargetOffsetSeconds:
                        event.target.value === "css_target_pace"
                          ? (current.cssTargetOffsetSeconds ?? 0)
                          : null,
                    }))
                  }
                  data-testid={`session-draft-step-target-mode-${index}`}
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {SESSION_DRAFT_STEP_TARGET_MODES.map((value) => (
                    <option key={value} value={value}>
                      {getStepTargetModeEditorLabel(value, isManualPoolMode)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {!isMinimalRestEditor && stepTargetModeValue === "effort" ? (
              <label className="text-sm text-slate-700">
                {isManualPoolMode ? "Effort" : "Target effort"}
                <select
                  value={stepEffortTargetValue}
                  onChange={(event) =>
                    updateDraftStep(step.id, (current) => ({
                      ...current,
                      effortTarget: event.target.value as SessionDraftStepIntensityPreset,
                    }))
                  }
                  data-testid={`session-draft-step-target-effort-${index}`}
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {(isManualPoolMode
                    ? MANUAL_POOL_VISIBLE_STEP_INTENSITY_PRESETS
                    : SESSION_DRAFT_STEP_INTENSITY_PRESETS
                  ).map((value) => (
                    <option key={value} value={value}>
                      {getSessionStepIntensityLabel(value)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {!isMinimalRestEditor && stepTargetModeValue === "target_pace" ? (
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4 md:col-span-2 md:grid-cols-[1fr_1fr_auto]">
                <label className="text-sm text-slate-700">
                  Pace minutes
                  <input
                    type="text"
                    inputMode="numeric"
                    value={getPaceMinutes(step.targetPaceSecondsPer100m)}
                    onChange={(event) =>
                      updateStepTargetPace(step.id, "minutes", event.target.value)
                    }
                    data-testid={`session-draft-step-target-pace-minutes-${index}`}
                    className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  Pace seconds
                  <input
                    type="text"
                    inputMode="numeric"
                    value={getPaceSeconds(step.targetPaceSecondsPer100m)}
                    onChange={(event) =>
                      updateStepTargetPace(step.id, "seconds", event.target.value)
                    }
                    data-testid={`session-draft-step-target-pace-seconds-${index}`}
                    className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
                <div className="self-end text-sm text-slate-500">
                  {step.targetPaceSecondsPer100m
                    ? formatPaceSecondsPer100m(step.targetPaceSecondsPer100m, poolLengthUnit)
                    : "Set pace"}
                </div>
              </div>
            ) : null}

            {!isMinimalRestEditor && stepTargetModeValue === "css_target_pace" ? (
              <label className="text-sm text-slate-700 md:col-span-2">
                CSS pace offset
                <select
                  value={String(step.cssTargetOffsetSeconds ?? 0)}
                  onChange={(event) =>
                    updateDraftStep(step.id, (current) => ({
                      ...current,
                      cssTargetOffsetSeconds: Number.parseInt(event.target.value, 10),
                    }))
                  }
                  data-testid={`session-draft-step-css-offset-${index}`}
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {SESSION_DRAFT_STEP_CSS_TARGET_OFFSETS.map((value) => {
                    const sign = value > 0 ? "+" : "";
                    return (
                      <option key={value} value={String(value)}>
                        {`CSS ${sign}${value}s (${formatPaceSecondsPer100m(
                          draft.basePaceSecondsPer100m + value,
                          poolLengthUnit
                        )})`}
                      </option>
                    );
                  })}
                </select>
              </label>
            ) : null}

            {isManualPoolMode || isMinimalRestEditor ? null : (
              <label className="text-sm text-slate-700 md:col-span-2">
                Target notes
                <input
                  type="text"
                  value={step.targetSummary}
                  onChange={(event) =>
                    updateDraftStep(step.id, (current) => ({
                      ...current,
                      targetSummary: event.target.value,
                    }))
                  }
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            )}

            <label className="text-sm text-slate-700 md:col-span-2">
              {isManualPoolMode ? "Notes" : "Notes"}
              <AutoGrowingTextarea
                aria-label={isManualPoolMode ? "Notes" : "Notes"}
                value={step.notes}
                onChange={(event) =>
                  updateDraftStep(step.id, (current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                minRows={isManualPoolMode ? 1 : 3}
                className="mt-2 block w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </label>

            {!isViewMode ? (
              <div
                data-testid={`session-draft-step-desktop-actions-${index}`}
                data-desktop-layout="bottom"
                className="hidden flex-wrap items-center gap-2 border-t border-slate-200 pt-3 sm:flex md:col-span-2"
              >
                {insideRepeatGroup || isLinkedPostSetRest ? null : (
                  <>
                    <button
                      type="button"
                      onClick={() => moveDraftGroup(groupIndex, -1)}
                      disabled={groupIndex === 0}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDraftGroup(groupIndex, 1)}
                      disabled={groupIndex === stepGroups.length - 1}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Move down
                    </button>
                  </>
                )}
                {isLinkedPostSetRest ? null : (
                  <button
                    type="button"
                    onClick={() => insertStepAfterStep(step.id)}
                    data-testid={`session-draft-step-add-after-${index}`}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-800 transition hover:bg-blue-50"
                  >
                    Add step after
                  </button>
                )}
                {!insideRepeatGroup && !isLinkedPostSetRest ? (
                  <button
                    type="button"
                    onClick={() => insertRepeatAfterGroup(groupIndex)}
                    data-testid={`session-draft-step-add-repeat-after-${index}`}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-800 transition hover:bg-blue-50"
                  >
                    Add repeat after
                  </button>
                ) : null}
                {isLinkedPostSetRest ? null : (
                  <button
                    type="button"
                    onClick={() => duplicateStep(step.id)}
                    data-testid={`session-draft-step-duplicate-${index}`}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    Duplicate
                  </button>
                )}
                {isLinkedPostSetRest ? null : (
                  <button
                    type="button"
                    onClick={() => requestStepRemoval(step.id)}
                    data-testid={`session-draft-step-remove-${index}`}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-sm text-rose-700 transition hover:bg-rose-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </article>
    );
  }

  const metadataFields = (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700 sm:p-4">
        Title
        <input
          type="text"
          value={displayedTitle}
          onChange={(event) => {
            if (isManualPoolMode) {
              setManualPoolTitleEdited(true);
            }
            updateDraft("title", event.target.value);
          }}
          data-testid="session-draft-title"
          className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </label>

      {!simplifyManualMetadata ? (
        <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700 sm:p-4">
          Session type
          <select
            value={draft.sessionType}
            onChange={(event) =>
              updateDraft("sessionType", event.target.value as SessionDraft["sessionType"])
            }
            className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {SESSION_GENERATOR_SESSION_TYPES.map((value) => (
              <option key={value} value={value}>
                {getSessionTypeLabel(value)}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700 sm:p-4 md:col-span-2">
        {simplifyManualMetadata ? "Session note" : "Description"}
        {!simplifyManualMetadata ? (
          <p className="mt-2 text-xs text-slate-500">
            Optional. Use this for the whole-workout purpose, pacing intent, or one short coaching
            note that applies across the session.
          </p>
        ) : null}
        <AutoGrowingTextarea
          aria-label={simplifyManualMetadata ? "Session note" : "Description"}
          value={draft.description}
          onChange={(event) => updateDraft("description", event.target.value)}
          data-testid="session-draft-description"
          minRows={isManualPoolMode ? 1 : 4}
          className="mt-2 block w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </label>

      {manualBuilderMode ? null : (
        <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4">
          <legend className="px-1 text-sm font-semibold text-slate-900">Environment</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {SESSION_GENERATOR_ENVIRONMENTS.map((value) => (
              <label key={value} className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="session-draft-environment"
                  checked={draft.environment === value}
                  onChange={() =>
                    onDraftChange({
                      ...draft,
                      environment: value as SessionGeneratorEnvironment,
                      poolLengthM:
                        value === "pool"
                          ? (draft.poolLengthM ?? SESSION_GENERATOR_POOL_LENGTHS[1])
                          : null,
                    })
                  }
                />
                {getSessionEnvironmentLabel(value)}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {draft.environment === "pool" ? (
        <div
          data-testid="workout-editor-pool-size-panel"
          data-containment-style="integrated"
          className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700 sm:p-4 md:col-span-2"
        >
          <p className="text-sm font-medium text-slate-900">
            {isManualPoolMode ? "Pool Size" : "Pool length"}
          </p>
          <div
            data-testid="workout-editor-pool-size-inline-row"
            data-layout="compact-inline"
            className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3"
          >
            <div
              role="group"
              aria-label={isManualPoolMode ? "Pool size unit" : "Pool length unit"}
              className="flex shrink-0 flex-wrap items-center gap-2"
            >
              {(
                [
                  ["m", "Meters"],
                  ["yd", "Yards"],
                ] as const
              ).map(([unit, label]) => {
                const isSelected = poolLengthUnit === unit;
                return (
                  <button
                    key={unit}
                    type="button"
                    aria-pressed={isSelected}
                    data-testid={`workout-editor-pool-length-unit-${unit}`}
                    onClick={() => updatePoolLengthUnit(unit)}
                    className={`inline-flex h-9 items-center justify-center rounded-full border px-3 text-sm transition ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div
              role="group"
              aria-label={isManualPoolMode ? "Common pool sizes" : "Common pool lengths"}
              className="flex shrink-0 flex-wrap items-center gap-2"
            >
              {poolLengthQuickChoices.map((value) => {
                const isSelected = isPoolLengthQuickChoiceSelected(
                  draft.poolLengthM,
                  value,
                  poolLengthUnit
                );
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => choosePoolLengthQuickChoice(value)}
                    className={`inline-flex h-10 items-center justify-center rounded-full border px-3 text-sm transition ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {poolLengthUnit === "yd"
                      ? `${value}yd`
                      : formatPoolLengthLabel(value, poolLengthUnit)}
                  </button>
                );
              })}
            </div>

            <div className="min-w-0 shrink-0">
              <div className="relative w-[8.75rem] sm:w-[9.25rem]">
                <input
                  type="text"
                  inputMode="decimal"
                  aria-label={
                    isManualPoolMode
                      ? `Exact pool size (${poolLengthUnit})`
                      : `Exact pool length (${poolLengthUnit})`
                  }
                  value={poolLengthInput}
                  onChange={(event) => updateDraftPoolLengthInput(event.target.value)}
                  data-testid="session-draft-pool-length-input"
                  className={`block h-11 w-full rounded-xl border bg-white px-3 pr-10 text-base text-slate-900 shadow-sm outline-none transition ${
                    poolSizeInputInvalid
                      ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-slate-500"
                >
                  {poolLengthUnit}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!simplifyManualMetadata ? (
        <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700 sm:p-4">
          Effort
          <select
            value={draft.effort}
            onChange={(event) =>
              updateDraft("effort", event.target.value as SessionDraft["effort"])
            }
            className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {SESSION_GENERATOR_EFFORT_PRESETS.map((value) => (
              <option key={value} value={value}>
                {getSessionEffortLabel(value)}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {isManualPoolMode ? null : (
        <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4 md:col-span-2">
          <legend className="px-1 text-sm font-semibold text-slate-900">Session strokes</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {SESSION_GENERATOR_STROKES.map((stroke) => (
              <label key={stroke} className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={draft.allowedStrokes.includes(stroke)}
                  onChange={() => toggleDraftStroke(stroke)}
                  disabled={stepUsesAllowedStroke(stroke)}
                />
                {getSessionStrokeLabel(stroke)}
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Strokes already used on a step stay selected here until those steps change.
          </p>
        </fieldset>
      )}

      {isManualPoolMode ? null : (
        <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4 md:col-span-2">
          <legend className="px-1 text-sm font-semibold text-slate-900">Equipment</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {SESSION_GENERATOR_EQUIPMENT.map((item) => (
              <label key={item} className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={draft.equipmentAllowlist.includes(item)}
                  onChange={() => toggleDraftEquipment(item)}
                  disabled={stepUsesEquipment(item)}
                />
                {getSessionEquipmentLabel(item)}
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Equipment used on a step stays selected here until those step details change.
          </p>
        </fieldset>
      )}
    </div>
  );

  const supportStatusSections = (
    <>
      {draft.warnings.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3 sm:p-4">
          <ul className="space-y-2 text-sm text-amber-900">
            {draft.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div
        data-testid="workout-editor-garmin-readiness"
        data-readiness-status={garminReadiness.status}
        className={`rounded-2xl border p-3 sm:p-4 ${
          garminReadiness.status === "ready"
            ? "border-emerald-200 bg-emerald-50/80"
            : "border-amber-200 bg-amber-50/80"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${
                garminReadiness.status === "ready" ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              Garmin/export readiness
            </p>
            <p
              data-testid="workout-editor-garmin-readiness-summary"
              className={`mt-2 text-sm font-medium ${
                garminReadiness.status === "ready" ? "text-emerald-950" : "text-amber-950"
              }`}
            >
              {garminReadiness.summary}
            </p>
            <p
              className={`mt-1 text-sm ${
                garminReadiness.status === "ready" ? "text-emerald-900" : "text-amber-900"
              }`}
            >
              {garminReadiness.status === "ready"
                ? "This workout stays inside the current Garmin-ready builder contract."
                : "Editing and saving still work, but these support tools should be treated as secondary until the mapping details below are resolved."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                garminReadiness.status === "ready"
                  ? "bg-white text-emerald-700"
                  : "bg-white text-amber-700"
              }`}
            >
              {garminReadiness.status === "ready"
                ? "Ready"
                : `${garminReadiness.issues.length} review ${
                    garminReadiness.issues.length === 1 ? "item" : "items"
                  }`}
            </p>
            <button
              type="button"
              aria-expanded={supportSectionOpen.readiness}
              data-testid="workout-editor-garmin-readiness-toggle"
              onClick={() =>
                setSupportSectionOpen((current) => ({
                  ...current,
                  readiness: !current.readiness,
                }))
              }
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-white/80 active:bg-white/70"
            >
              {supportSectionOpen.readiness ? "Hide details" : "Show details"}
            </button>
          </div>
        </div>

        {supportSectionOpen.readiness && garminReadiness.issues.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm text-amber-900">
            {garminReadiness.issues.map((issue, index) => (
              <li key={issue.id} data-testid={`workout-editor-garmin-readiness-issue-${index}`}>
                {issue.detail}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {showPdfPanel && !showCalmBuilderLayout ? (
        <section className={integratedSupportSectionClass}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                {workoutPdfHeadingLabel}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">{workoutPdfBodyCopy}</p>
              <p
                data-testid="workout-editor-pdf-source"
                data-pdf-state={handoffDraftState}
                className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                {workoutPdfStateLabel}
              </p>
              <p className="mt-1 text-sm text-slate-600">{workoutPdfStateDescription}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openWorkoutPdfPrintView("standard")}
                data-testid="workout-editor-pdf-open"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                {workoutPdfButtonLabel}
              </button>
              <button
                type="button"
                onClick={() => openWorkoutPdfPrintView("poolside")}
                data-testid="workout-editor-poolside-pdf-open"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-800 transition hover:bg-blue-50 active:bg-blue-100"
              >
                {workoutPoolsidePdfButtonLabel}
              </button>
            </div>
          </div>

          {workoutPdfNotice ? (
            <p
              data-testid="workout-editor-pdf-notice"
              className="mt-3 text-sm font-medium text-emerald-700"
            >
              {workoutPdfNotice}
            </p>
          ) : null}

          {workoutPdfError ? (
            <p data-testid="workout-editor-pdf-error" className="mt-3 text-sm text-rose-700">
              {workoutPdfError}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className={integratedSupportSectionClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              Garmin-ready JSON
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              Optional support export for manual review or later Garmin delivery work. Downloading
              this JSON does not save or send anything; it only packages the workout exactly as the
              current `garmin-ready` adapter sees it.
            </p>
            <p
              data-testid="workout-editor-garmin-export-source"
              data-export-state={handoffDraftState}
              className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-600"
            >
              {garminExportStateLabel}
            </p>
            <p className="mt-1 text-sm text-slate-600">{garminExportStateDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={downloadWorkoutGarminReadyExport}
              data-testid="workout-editor-garmin-export-download"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              Download .json
            </button>
            <button
              type="button"
              aria-expanded={supportSectionOpen.garminExport}
              data-testid="workout-editor-garmin-export-toggle"
              onClick={() =>
                setSupportSectionOpen((current) => ({
                  ...current,
                  garminExport: !current.garminExport,
                }))
              }
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              {supportSectionOpen.garminExport ? "Hide preview" : "Show preview"}
            </button>
          </div>
        </div>

        {garminExportNotice ? (
          <p
            data-testid="workout-editor-garmin-export-notice"
            className="mt-3 text-sm font-medium text-emerald-700"
          >
            {garminExportNotice}
          </p>
        ) : null}

        {garminExportError ? (
          <p
            data-testid="workout-editor-garmin-export-error"
            className="mt-3 text-sm text-rose-700"
          >
            {garminExportError}
          </p>
        ) : null}

        {supportSectionOpen.garminExport ? (
          <div className={supportPreviewShellClass}>
            <pre
              data-testid="workout-editor-garmin-export-preview"
              className="max-h-[320px] overflow-auto whitespace-pre-wrap px-4 py-4 text-xs leading-relaxed text-slate-100"
            >
              {garminReadyExportPreview}
            </pre>
          </div>
        ) : null}
      </section>

      <section className={integratedSupportSectionClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Workout handoff
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              Optional text handoff for manual Garmin Connect entry, coach review, or lane-side
              notes. Copying or downloading it does not save or send the workout.
            </p>
            <p
              data-testid="workout-editor-handoff-source"
              data-handoff-state={handoffDraftState}
              className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-600"
            >
              {handoffStateLabel}
            </p>
            <p className="mt-1 text-sm text-slate-600">{handoffStateDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyWorkoutHandoff}
              data-testid="workout-editor-handoff-copy"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              Copy handoff
            </button>
            <button
              type="button"
              onClick={downloadWorkoutHandoff}
              data-testid="workout-editor-handoff-download"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              Download .txt
            </button>
            <button
              type="button"
              aria-expanded={supportSectionOpen.handoff}
              data-testid="workout-editor-handoff-toggle"
              onClick={() =>
                setSupportSectionOpen((current) => ({
                  ...current,
                  handoff: !current.handoff,
                }))
              }
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              {supportSectionOpen.handoff ? "Hide preview" : "Show preview"}
            </button>
          </div>
        </div>

        {handoffNotice ? (
          <p
            data-testid="workout-editor-handoff-notice"
            className="mt-3 text-sm font-medium text-emerald-700"
          >
            {handoffNotice}
          </p>
        ) : null}

        {handoffError ? (
          <p data-testid="workout-editor-handoff-error" className="mt-3 text-sm text-rose-700">
            {handoffError}
          </p>
        ) : null}

        {supportSectionOpen.handoff ? (
          <div className={supportPreviewShellClass}>
            <pre
              data-testid="workout-editor-handoff-preview"
              className="max-h-[320px] overflow-auto whitespace-pre-wrap px-4 py-4 text-xs leading-relaxed text-slate-100"
            >
              {handoffText}
            </pre>
          </div>
        ) : null}
      </section>

      <section className={integratedSupportSectionClass}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Draft JSON</p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            Raw builder draft for support review only.
          </p>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
          <pre
            data-testid="session-generator-draft-preview"
            className="max-h-[420px] overflow-auto px-4 py-4 text-xs leading-relaxed text-slate-100"
          >
            {JSON.stringify(
              {
                ...draft,
                totalDistanceM: draftTotals.totalDistanceM ?? draft.totalDistanceM,
                estimatedDurationMin:
                  draftTotals.estimatedDurationMin ?? draft.estimatedDurationMin,
              },
              null,
              2
            )}
          </pre>
        </div>
      </section>

      <div className="grid gap-3 border-t border-slate-200/80 pt-4 md:grid-cols-3">
        <div className={supportSummaryItemClass}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {savedWorkout ? "Accepted" : "Draft"}
          </p>
        </div>
        <div className={supportSummaryItemClass}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Session</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{metadataSummary}</p>
        </div>
        <div className={supportSummaryItemClass}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Context</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {draft.goalTitle ?? draft.focusText ?? "Session-only request"}
          </p>
          {savedWorkout ? (
            <p className="mt-2 text-xs text-slate-500">
              Accepted {new Date(savedWorkout.acceptedAt).toLocaleDateString("en-GB")} · last saved{" "}
              {new Date(savedWorkout.updatedAt).toLocaleDateString("en-GB")}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );

  const poolsideNotePanel = showCalmBuilderLayout ? (
    <div
      className="rounded-2xl border border-blue-200/80 bg-blue-50/60 p-4 sm:p-5"
      data-testid="workout-editor-poolside-panel"
      data-containment-style="split"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Poolside Note
          </p>
          {swimmerName ? (
            <p className="mt-2 text-sm font-medium text-slate-900">Swimmer: {swimmerName}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openWorkoutPdfPrintView("poolside")}
            data-testid="workout-editor-poolside-pdf-open"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-800 transition hover:bg-blue-100 active:bg-blue-200"
          >
            Print Preview
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] lg:items-start">
        <div className="min-w-0 space-y-3 lg:border-r lg:border-blue-200/70 lg:pr-5">
          <p className="text-sm font-semibold text-slate-900">Session Focus</p>
          {trainingFocusOptions.length > 0 ? (
            <div
              data-testid="workout-editor-poolside-focus-list"
              className="grid max-h-72 gap-3 overflow-y-auto pr-1"
            >
              {trainingFocusOptions.map((focus) => (
                <label
                  key={focus.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedPoolsideFocusIds.includes(focus.id)}
                    onChange={() => togglePoolsideFocusSelection(focus.id)}
                    data-testid={`workout-editor-poolside-focus-${focus.id}`}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-slate-900">{focus.title}</span>
                    {focus.description ? (
                      <span className="mt-1 block text-xs text-slate-500">{focus.description}</span>
                    ) : null}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              No open focuses are available, so the poolside note will only include the workout and
              totals.
            </p>
          )}
        </div>

        <div className="min-w-0 space-y-4 lg:pl-5">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Print options</p>

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Style
              </legend>
              <div className="grid gap-3">
                <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="workout-poolside-print-style"
                    checked={poolsidePrintStyle === "color"}
                    onChange={() => setPoolsidePrintStyle("color")}
                    data-testid="workout-editor-poolside-style-color"
                    className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                  />
                  <span>
                    <span className="block font-medium text-slate-900">Color mode</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Keeps the blue surfaces
                    </span>
                  </span>
                </label>
                <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="workout-poolside-print-style"
                    checked={poolsidePrintStyle === "ink_saver"}
                    onChange={() => setPoolsidePrintStyle("ink_saver")}
                    data-testid="workout-editor-poolside-style-ink-saver"
                    className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                  />
                  <span>
                    <span className="block font-medium text-slate-900">Ink saver</span>
                    <span className="mt-1 block text-xs text-slate-500">Uses white surfaces.</span>
                  </span>
                </label>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Layout
              </legend>
              <div className="grid gap-3">
                <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="workout-poolside-print-layout"
                    checked={poolsidePrintLayout === "portrait"}
                    onChange={() => setPoolsidePrintLayout("portrait")}
                    data-testid="workout-editor-poolside-layout-portrait"
                    className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                  />
                  <span className="block font-medium text-slate-900">Portrait</span>
                </label>
                <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="workout-poolside-print-layout"
                    checked={poolsidePrintLayout === "landscape"}
                    onChange={() => setPoolsidePrintLayout("landscape")}
                    data-testid="workout-editor-poolside-layout-landscape"
                    className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                  />
                  <span className="block font-medium text-slate-900">Landscape</span>
                </label>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  ) : null;
  const supportStatusSectionList = <div className="space-y-4">{supportStatusSections}</div>;
  const supportToolsPanel = showCalmBuilderLayout ? (
    <section
      data-testid="workout-editor-support-tools-panel"
      data-containment-style="sectioned"
      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Advanced tools
          </p>
          {supportToolsOpen ? (
            <>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {supportToolsAudienceDescription}
              </p>
              <p className="mt-1 text-sm text-slate-700">{supportToolsDraftStateDescription}</p>
              <p className="mt-1 text-sm text-slate-600">{supportToolsPersistenceDescription}</p>
              {supportToolsWarningSummary ? (
                <p className="mt-1 text-sm text-slate-600">{supportToolsWarningSummary}</p>
              ) : null}
            </>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p
            data-testid="workout-editor-support-tools-status"
            className={`rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              garminReadiness.status === "ready" ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {supportToolsStatusLabel}
          </p>
          <button
            type="button"
            aria-expanded={supportToolsOpen}
            data-testid="workout-editor-support-tools-toggle"
            onClick={() => setSupportToolsOpen((current) => !current)}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
          >
            {supportToolsOpen ? "Hide advanced tools" : "Show advanced tools"}
          </button>
        </div>
      </div>

      {supportToolsOpen ? <div className="mt-4">{supportStatusSectionList}</div> : null}
    </section>
  ) : (
    supportStatusSectionList
  );

  return (
    <div data-testid="workout-editor-panel" className="space-y-4 sm:space-y-5">
      {showLoadedBanner && savedWorkout ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 p-3 sm:p-4">
          <div>
            <p className="text-sm font-medium text-blue-900">{loadedBannerTitle}</p>
            <p className="mt-1 text-sm text-blue-900/90">{loadedBannerDescription}</p>
          </div>
          {startNewDraftHref ? (
            <Link
              href={startNewDraftHref}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-800 transition hover:bg-blue-50 active:bg-blue-100"
            >
              {startNewDraftLabel}
            </Link>
          ) : null}
        </div>
      ) : null}

      {recentWorkouts.length > 0 ? (
        <div
          data-testid="session-generator-recent-workouts"
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">My Swim Sessions</h3>
              <p className="mt-1 text-sm text-slate-600">{recentWorkoutsDescription}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {recentWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white p-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{workout.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {[
                      workout.totalDistanceM
                        ? formatDistanceMetersLabel(
                            workout.totalDistanceM,
                            resolveSessionDraftPoolLengthUnit(workout.poolLengthUnit)
                          )
                        : null,
                      getSessionTypeLabel(workout.sessionType),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <Link
                  href={workoutHrefBuilder(workout.id)}
                  data-testid={`session-generator-open-workout-${workout.id}`}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!showCalmBuilderLayout ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-3 sm:p-4">
          <p className="text-sm text-blue-900">
            {savedWorkout ? editorCopy.loadedDraftBanner : editorCopy.unsavedDraftBanner}
          </p>
        </div>
      ) : null}

      {!showCalmBuilderLayout ? supportToolsPanel : null}

      {showCalmBuilderLayout ? (
        <section
          data-testid="workout-editor-metadata-panel"
          className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Session details
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {draft.title || autoPoolBuilderTitle || "Untitled swim session"}
              </p>
              {!metadataOpen || isViewMode ? (
                <p
                  data-testid="workout-editor-metadata-summary"
                  className="mt-2 text-sm font-medium text-slate-900"
                >
                  {metadataSummary}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!isViewMode ? (
                <button
                  type="button"
                  onClick={() => setMetadataOpen((current) => !current)}
                  aria-expanded={metadataOpen}
                  data-testid="workout-editor-metadata-toggle"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                >
                  {metadataOpen ? "Hide details" : "Show details"}
                </button>
              ) : null}
              {savedWorkout && onRequestDeleteCurrent ? (
                <button
                  type="button"
                  onClick={onRequestDeleteCurrent}
                  disabled={isDeletingCurrent}
                  data-testid="workout-builder-delete-current-workout"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-50 active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeletingCurrent ? "Deleting..." : "Delete session"}
                </button>
              ) : null}
            </div>
          </div>

          {!isViewMode && metadataOpen ? <div className="mt-4">{metadataFields}</div> : null}
        </section>
      ) : (
        metadataFields
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">
            {isManualPoolMode ? "Session steps" : "Editable draft steps"}
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            {showCalmBuilderLayout ? (
              <div
                role="group"
                aria-label="Builder mode"
                className="inline-flex rounded-xl border border-blue-100 bg-blue-50/60 p-1"
              >
                {WORKOUT_VIEW_MODES.map((mode) => {
                  const isSelected = builderViewMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setBuilderViewMode(mode)}
                      data-testid={`workout-editor-builder-mode-${mode}`}
                      className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-semibold transition ${
                        isSelected
                          ? "border border-blue-200 bg-blue-600 text-white shadow-sm"
                          : "text-blue-900/70 hover:text-blue-900"
                      }`}
                    >
                      {mode === "edit" ? "Edit" : "View"}
                    </button>
                  );
                })}
              </div>
            ) : null}
            {!isViewMode ? (
              <div className="flex flex-wrap items-center gap-2 border-l border-slate-200 pl-3">
                <button
                  type="button"
                  onClick={addStep}
                  data-testid="session-draft-add-step"
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 sm:h-10 sm:px-4"
                >
                  Add step
                </button>
                <button
                  type="button"
                  onClick={addRepeat}
                  data-testid="session-draft-add-repeat"
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-800 transition hover:bg-blue-100 active:bg-blue-200 sm:h-10 sm:px-4"
                >
                  Add repeat
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {stepGroups.length === 0 ? (
            <div
              data-testid="session-draft-empty-steps"
              className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-3 sm:p-4"
            >
              <p className="text-sm font-medium text-slate-900">
                Start from a clean empty session.
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Add your first step or repeat block below when you are ready to build from scratch.
              </p>
            </div>
          ) : null}

          {lastRemovedBlock ? (
            <div
              data-testid="workout-editor-removal-undo"
              className="rounded-2xl border border-blue-200 bg-blue-50/90 p-3 sm:p-4"
            >
              <p className="text-sm font-medium text-blue-950">
                Deleted <span className="font-semibold">{lastRemovedBlock.label}</span>.
              </p>
              <p className="mt-1 text-sm text-blue-900">
                Undo restores it to the same local spot before you save this workout.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={undoLastRemoval}
                  data-testid="workout-editor-removal-undo-button"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
                >
                  Undo delete
                </button>
                <button
                  type="button"
                  onClick={() => setLastRemovedBlock(null)}
                  data-testid="workout-editor-removal-dismiss-button"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-900 transition hover:bg-blue-100 active:bg-blue-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}

          {isViewMode && isManualPoolMode
            ? manualPoolViewSections.map((section) => (
                <section
                  key={section.key}
                  className={`rounded-2xl border p-4 ${
                    section.variant === "repeat"
                      ? "border-blue-200 bg-gradient-to-b from-blue-50/70 to-white"
                      : section.variant === "rest"
                        ? "border-blue-100 bg-blue-50/55"
                        : "border-slate-200 bg-slate-50/70"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      section.variant === "repeat" ? "text-blue-700" : "text-slate-500"
                    }`}
                  >
                    {section.title}
                  </p>
                  <div className="mt-2 space-y-2">
                    {section.lines.map((line, lineIndex) => (
                      <div
                        key={`${section.key}-line-${lineIndex}`}
                        className={`text-base leading-6 ${
                          line.tone === "rest"
                            ? "font-semibold text-blue-900"
                            : line.tone === "subtle"
                              ? "text-slate-600"
                              : "text-slate-900"
                        }`}
                      >
                        {section.numbered ? (
                          <span className="mr-2 font-semibold text-slate-500">
                            {lineIndex + 1}.
                          </span>
                        ) : null}
                        <span>{line.text}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            : stepGroups.map((group, groupIndex) =>
                group.kind === "single" ? (
                  renderStepEditorCard(group.entries[0].step, group.entries[0].index, groupIndex)
                ) : (
                  <section
                    key={group.repeatGroupId}
                    data-testid={`workout-editor-repeat-group-${groupIndex}`}
                    data-containment-style="calm"
                    className="rounded-2xl bg-gradient-to-b from-blue-50/70 to-white p-3 ring-1 ring-inset ring-blue-100 sm:p-4"
                  >
                    {(() => {
                      const repeatSummary = buildRepeatSummary(
                        group.entries,
                        group.repeatCount,
                        draft.basePaceSecondsPer100m,
                        group.repeatEndingRestMode,
                        poolLengthUnit
                      );
                      const hasEditableRepeatEndingRest = Boolean(
                        draft.environment === "pool" &&
                        (() => {
                          const lastEntry = group.entries[group.entries.length - 1];
                          return lastEntry && isSessionDraftRepeatEndingRestStep(lastEntry.step);
                        })()
                      );
                      const repeatMobileActionKey = `repeat:${group.repeatGroupId}`;
                      const repeatMobileActionsOpen = openMobileActionKey === repeatMobileActionKey;

                      return (
                        <div className="space-y-3">
                          <div className={desktopHeaderStackClass}>
                            <div
                              data-testid={`session-draft-repeat-summary-${groupIndex}`}
                              className={desktopSummaryBlockClass}
                            >
                              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                                Repeat set
                              </p>
                              <p className="mt-1 text-sm font-medium text-slate-900">
                                {repeatSummary}
                              </p>
                              {isManualPoolMode ? null : (
                                <>
                                  <p className="mt-1 text-xs text-slate-600">
                                    Edit the repeated steps below instead of duplicating every round
                                    by hand.
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Repeat counts currently support {SESSION_DRAFT_REPEAT_MIN}-
                                    {SESSION_DRAFT_REPEAT_MAX} rounds per block.
                                  </p>
                                </>
                              )}
                            </div>
                            {!isViewMode ? (
                              <div className="flex shrink-0 sm:hidden">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenMobileActionKey((current) =>
                                      current === repeatMobileActionKey
                                        ? null
                                        : repeatMobileActionKey
                                    )
                                  }
                                  aria-expanded={repeatMobileActionsOpen}
                                  aria-controls={`session-draft-repeat-mobile-actions-panel-${group.repeatGroupId}`}
                                  data-testid={`session-draft-repeat-mobile-actions-toggle-${groupIndex}`}
                                  className={mobileActionToggleClass}
                                >
                                  <Ellipsis className="size-5" />
                                  <span className="sr-only">
                                    {repeatMobileActionsOpen
                                      ? "Hide repeat actions"
                                      : "Show repeat actions"}
                                  </span>
                                </button>
                              </div>
                            ) : null}
                          </div>

                          {!isViewMode ? (
                            <div className={desktopRepeatControlRowClass}>
                              <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-end sm:gap-2">
                                <label className="text-sm text-slate-700">
                                  Repeat count
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={group.repeatCount ?? ""}
                                    onChange={(event) =>
                                      updateRepeatGroupCount(
                                        group.repeatGroupId,
                                        event.target.value
                                      )
                                    }
                                    min={SESSION_DRAFT_REPEAT_MIN}
                                    max={SESSION_DRAFT_REPEAT_MAX}
                                    data-testid={`session-draft-repeat-count-${groupIndex}`}
                                    className="mt-2 block h-11 w-full rounded-xl border border-blue-200 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:w-28"
                                  />
                                </label>
                                {hasEditableRepeatEndingRest ? (
                                  <label className="text-sm text-slate-700">
                                    Last rest interval
                                    <select
                                      value={group.repeatEndingRestMode}
                                      onChange={(event) =>
                                        updateRepeatGroupEndingRestMode(
                                          group.repeatGroupId,
                                          event.target.value as SessionDraftRepeatEndingRestMode
                                        )
                                      }
                                      data-testid={`session-draft-repeat-ending-rest-mode-${groupIndex}`}
                                      className="mt-2 block h-11 w-full rounded-xl border border-blue-200 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:min-w-[15rem]"
                                    >
                                      {SESSION_DRAFT_REPEAT_ENDING_REST_MODES.map((mode) => (
                                        <option key={mode} value={mode}>
                                          {getSessionDraftRepeatEndingRestModeLabel(mode)}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                ) : null}
                              </div>
                            </div>
                          ) : null}

                          {!isViewMode ? (
                            <div className="sm:hidden">
                              <button
                                type="button"
                                onClick={() => {
                                  insertStepAfterGroup(groupIndex);
                                  setOpenMobileActionKey(null);
                                }}
                                data-testid={`session-draft-repeat-mobile-primary-add-step-after-${groupIndex}`}
                                className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm font-medium text-blue-800 transition hover:bg-blue-50"
                              >
                                Add step after
                              </button>
                            </div>
                          ) : null}

                          {!isViewMode && repeatMobileActionsOpen ? (
                            <div
                              id={`session-draft-repeat-mobile-actions-panel-${group.repeatGroupId}`}
                              data-testid={`session-draft-repeat-mobile-actions-panel-${groupIndex}`}
                              className={`${mobileActionPanelClass} sm:hidden`}
                            >
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    moveDraftGroup(groupIndex, -1);
                                    setOpenMobileActionKey(null);
                                  }}
                                  disabled={groupIndex === 0}
                                  data-testid={`session-draft-repeat-mobile-move-up-${groupIndex}`}
                                  className={`${mobileSecondaryActionClass} border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60`}
                                >
                                  Move up
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    moveDraftGroup(groupIndex, 1);
                                    setOpenMobileActionKey(null);
                                  }}
                                  disabled={groupIndex === stepGroups.length - 1}
                                  data-testid={`session-draft-repeat-mobile-move-down-${groupIndex}`}
                                  className={`${mobileSecondaryActionClass} border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60`}
                                >
                                  Move down
                                </button>
                              </div>
                              <div className="mt-2 grid gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    insertRepeatAfterGroup(groupIndex);
                                    setOpenMobileActionKey(null);
                                  }}
                                  data-testid={`session-draft-repeat-mobile-add-repeat-after-${groupIndex}`}
                                  className={`${mobileSecondaryActionClass} border-blue-200 bg-white text-blue-800 hover:bg-blue-50`}
                                >
                                  Add repeat after
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    duplicateRepeatGroup(group.repeatGroupId);
                                    setOpenMobileActionKey(null);
                                  }}
                                  data-testid={`session-draft-repeat-mobile-duplicate-${groupIndex}`}
                                  className={`${mobileSecondaryActionClass} border-slate-200 bg-white text-slate-700 hover:bg-slate-100`}
                                >
                                  Duplicate repeat
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    requestRepeatGroupRemoval(group.repeatGroupId);
                                    setOpenMobileActionKey(null);
                                  }}
                                  data-testid={`session-draft-repeat-mobile-remove-${groupIndex}`}
                                  className={`${mobileSecondaryActionClass} border-rose-200 bg-white text-rose-700 hover:bg-rose-50`}
                                >
                                  Delete repeat
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })()}

                    <div className="mt-4 space-y-3">
                      {group.entries.map((entry, repeatIndex) =>
                        renderStepEditorCard(entry.step, entry.index, groupIndex, {
                          insideRepeatGroup: true,
                          repeatStepNumber: repeatIndex + 1,
                          labelOverride:
                            repeatIndex === 0
                              ? "Work interval"
                              : repeatIndex === 1
                                ? "Between-interval recovery"
                                : undefined,
                        })
                      )}
                      {group.postSetRestEntry
                        ? renderStepEditorCard(
                            group.postSetRestEntry.step,
                            group.postSetRestEntry.index,
                            groupIndex,
                            {
                              labelOverride: "Post-set rest",
                              descriptionOverride:
                                group.repeatEndingRestMode === "use_last_rest" &&
                                Boolean(
                                  group.entries[group.entries.length - 1] &&
                                  isSessionDraftRepeatEndingRestStep(
                                    group.entries[group.entries.length - 1].step
                                  )
                                )
                                  ? "Separate canonical rest after the set. It is preserved here, but active execution and export suppress it because the last internal rest interval is used after the final rep."
                                  : "Separate canonical rest after the set, outside the repeat block itself.",
                              isLinkedPostSetRest: true,
                            }
                          )
                        : null}
                      {pendingRemoval?.kind === "repeat" &&
                      pendingRemoval.repeatGroupId === group.repeatGroupId ? (
                        <div
                          data-testid="workout-editor-removal-confirm"
                          className="rounded-2xl border border-rose-200 bg-rose-50/90 p-3"
                        >
                          <p className="text-sm font-medium text-rose-950">
                            Delete{" "}
                            <span className="font-semibold">
                              {pendingRemoval?.label ?? "this repeat block"}
                            </span>
                            ?
                          </p>
                          <p className="mt-1 text-sm text-rose-900">
                            This builder change stays local until you save, and you can still undo
                            it right after deletion.
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={confirmPendingRemoval}
                              data-testid="workout-editor-removal-confirm-button"
                              className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 active:bg-rose-700"
                            >
                              Delete now
                            </button>
                            <button
                              type="button"
                              onClick={cancelPendingRemoval}
                              data-testid="workout-editor-removal-cancel-button"
                              className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-900 transition hover:bg-rose-100 active:bg-rose-200"
                            >
                              Keep it
                            </button>
                          </div>
                        </div>
                      ) : null}
                      {!isViewMode ? (
                        <div
                          data-testid={`session-draft-repeat-desktop-actions-${groupIndex}`}
                          data-desktop-layout="bottom"
                          className="hidden flex-wrap items-end gap-2 border-t border-blue-100 pt-3 sm:flex"
                        >
                          <button
                            type="button"
                            onClick={() => moveDraftGroup(groupIndex, -1)}
                            disabled={groupIndex === 0}
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Move up
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDraftGroup(groupIndex, 1)}
                            disabled={groupIndex === stepGroups.length - 1}
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Move down
                          </button>
                          <button
                            type="button"
                            onClick={() => insertStepAfterGroup(groupIndex)}
                            data-testid={`session-draft-repeat-add-step-after-${groupIndex}`}
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-800 transition hover:bg-blue-100"
                          >
                            Add step after
                          </button>
                          <button
                            type="button"
                            onClick={() => insertRepeatAfterGroup(groupIndex)}
                            data-testid={`session-draft-repeat-add-repeat-after-${groupIndex}`}
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-800 transition hover:bg-blue-100"
                          >
                            Add repeat after
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateRepeatGroup(group.repeatGroupId)}
                            data-testid={`session-draft-repeat-duplicate-${groupIndex}`}
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-800 transition hover:bg-blue-100"
                          >
                            Duplicate repeat
                          </button>
                          <button
                            type="button"
                            onClick={() => requestRepeatGroupRemoval(group.repeatGroupId)}
                            data-testid={`session-draft-repeat-remove-${groupIndex}`}
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-sm text-rose-700 transition hover:bg-rose-50"
                          >
                            Delete repeat
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </section>
                )
              )}
        </div>
      </div>

      {poolsideNotePanel}

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {savedWorkout ? "Saved workout" : "Draft"}
              </span>
              <p
                data-testid="workout-editor-save-state"
                className={`text-sm font-medium ${
                  hasUnsavedChanges ? "text-amber-700" : "text-emerald-700"
                }`}
              >
                {savedWorkout
                  ? hasUnsavedChanges
                    ? editorCopy.savedWorkoutPendingState
                    : editorCopy.savedWorkoutSavedState
                  : editorCopy.unsavedDraftPendingState}
              </p>
            </div>
            {showInlinePdfAction ? (
              <p
                data-testid="workout-editor-pdf-source"
                data-pdf-state={handoffDraftState}
                className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {workoutPdfStateLabel}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {showInlinePdfAction ? (
              <button
                type="button"
                onClick={() => openWorkoutPdfPrintView("standard")}
                data-testid="workout-editor-pdf-open"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                {workoutPdfButtonLabel}
              </button>
            ) : null}
            {!showPdfPanel && !showCalmBuilderLayout ? (
              <button
                type="button"
                onClick={() => openWorkoutPdfPrintView("poolside")}
                data-testid="workout-editor-poolside-pdf-open"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-800 transition hover:bg-blue-50 active:bg-blue-100"
              >
                {workoutPoolsidePdfButtonLabel}
              </button>
            ) : null}
            {savedWorkout && onResetToSaved ? (
              <button
                type="button"
                onClick={() => {
                  setPendingRemoval(null);
                  setLastRemovedBlock(null);
                  onResetToSaved();
                }}
                disabled={isSaving || !hasUnsavedChanges || pendingRemoval !== null}
                data-testid="workout-editor-reset"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reset to last saved
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setPendingRemoval(null);
                setLastRemovedBlock(null);
                onSave();
              }}
              disabled={
                isSaving ||
                !canonicalSaveReady ||
                poolSizeInputInvalid ||
                pendingRemoval !== null ||
                (savedWorkout ? !hasUnsavedChanges : false)
              }
              data-testid={saveButtonTestId}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : savedWorkout ? "Save changes" : "Accept and save workout"}
            </button>
          </div>
        </div>
      </div>

      {showInlinePdfAction && workoutPdfNotice ? (
        <p
          data-testid="workout-editor-pdf-notice"
          className="mt-3 text-sm font-medium text-emerald-700"
        >
          {workoutPdfNotice}
        </p>
      ) : null}

      {showCalmBuilderLayout ? supportToolsPanel : null}

      {showInlinePdfAction && workoutPdfError ? (
        <p data-testid="workout-editor-pdf-error" className="mt-3 text-sm text-rose-700">
          {workoutPdfError}
        </p>
      ) : null}
    </div>
  );
}
