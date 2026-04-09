"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type TextareaHTMLAttributes } from "react";
import { BRAND_FONT_PUBLIC_PATH, BRAND_PDF_LOGO_PATH } from "@/lib/brand";
import { useAutoDismissNotice } from "@/components/my-library/workouts/useAutoDismissNotice";
import {
  SESSION_DRAFT_STEP_CATEGORIES,
  SESSION_DRAFT_STEP_CSS_TARGET_OFFSETS,
  SESSION_DRAFT_STEP_DISTANCE_PRESETS,
  SESSION_DRAFT_STEP_DRILL_TYPES,
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
  selectWorkoutPoolsideFocusTitles,
  type WorkoutEditorRecord,
  type WorkoutHandoffDraftState,
  type WorkoutPoolsideFocusOption,
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

const MANUAL_POOL_SIZE_QUICK_CHOICES = [25, 33.33, 50] as const;
const YARD_POOL_SIZE_QUICK_CHOICES = [25, 33.33, 50] as const;

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
  if (isManualPoolDurationModeAllowed(step.category, step.durationMode)) {
    return step;
  }

  return applyStepDurationModeDefaults(step, getDefaultManualPoolDurationMode(step.category));
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
      return "Effort cue";
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
      timeMin: 1,
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
      timeMin: 1,
      targetMode: "none",
      targetSummary: "",
      notes: "",
      postSetRestForRepeatGroupId: groupId,
    }),
  ];
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
  const [rawMinutes = "", ...rest] = cleaned.split(":");
  const minutes = rawMinutes.slice(0, 3);

  if (rest.length === 0) {
    return minutes;
  }

  return `${minutes}:${rest.join("").slice(0, 2)}`;
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
    structuredTarget ?? getSessionEffortLabel(step.intensity),
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
      structuredTarget,
    ]
      .filter(Boolean)
      .join(" · ") || `${getSessionStepCategoryLabel(normalizedStep.category)} step`
  );
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

  const lastEntry = entries[entries.length - 1];

  if (
    repeatEndingRestMode === "skip_last_rest" &&
    repeatCount > 1 &&
    lastEntry &&
    isSessionDraftRepeatEndingRestStep(lastEntry.step)
  ) {
    parts.push("Final rest skipped");
  }

  return parts.join(" · ");
}

function buildRepeatEndingRestDescription(
  entries: StepRenderEntry[],
  repeatCount: number | null,
  basePaceSecondsPer100m: number,
  repeatEndingRestMode: SessionDraftRepeatEndingRestMode,
  poolLengthUnit: SessionDraftPoolLengthUnit
) {
  const lastEntry = entries[entries.length - 1];
  if (!lastEntry || !isSessionDraftRepeatEndingRestStep(lastEntry.step)) {
    return null;
  }

  const restLabel = buildWorkoutStepDurationOutputSummary(lastEntry.step, basePaceSecondsPer100m, {
    environment: "pool",
    poolLengthUnit,
  });

  if (repeatCount !== null && repeatCount <= 1) {
    return repeatEndingRestMode === "skip_last_rest"
      ? `${restLabel} is skipped after the round.`
      : `${restLabel} runs after the round.`;
  }

  return repeatEndingRestMode === "skip_last_rest"
    ? `${restLabel} still runs between rounds. It is skipped only after the final round.`
    : `${restLabel} runs between rounds and again after the final round.`;
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
  const isManualOpenWaterMode = manualBuilderMode === "open_water";
  const autoPoolBuilderTitle = getPoolBuilderAutoTitle(draft.environment);
  const timeDurationInputFocusRef = useRef<Record<string, boolean>>({});
  const [openStepId, setOpenStepId] = useState<string | null>(null);
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
        .filter((step) => step.durationMode === "time")
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
  const [manualMetadataProfileOpen, setManualMetadataProfileOpen] = useState(false);
  const [poolsidePrintStyle, setPoolsidePrintStyle] = useState<WorkoutPoolsidePrintStyle>("color");
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
    fontUrl:
      typeof window === "undefined"
        ? BRAND_FONT_PUBLIC_PATH
        : new URL(BRAND_FONT_PUBLIC_PATH, window.location.origin).toString(),
    logoUrl:
      typeof window === "undefined"
        ? BRAND_PDF_LOGO_PATH
        : new URL(BRAND_PDF_LOGO_PATH, window.location.origin).toString(),
  });
  const selectedPoolsideFocusTitles = selectWorkoutPoolsideFocusTitles(
    trainingFocusOptions,
    selectedPoolsideFocusIds
  );
  const selectedPoolsideFocusSignature = selectedPoolsideFocusTitles.join("|");
  const metadataSummary = isManualPoolMode
    ? [
        draftTotals.totalDistanceM
          ? formatDistanceMetersLabel(draftTotals.totalDistanceM, poolLengthUnit)
          : null,
        draftTotals.estimatedDurationMin ? `~${draftTotals.estimatedDurationMin} min` : null,
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
  const manualMetadataProfileSummary = `${getSessionTypeLabel(draft.sessionType)} · ${getSessionEffortLabel(draft.effort)}`;
  const metadataHeading = isManualPoolMode
    ? "Pool Swim"
    : isManualOpenWaterMode
      ? "Build your open water session"
      : "Build your swim session";
  const collapsedMetadataCopy = isManualPoolMode
    ? "Open when you want to change the title, session note, or pool size."
    : isManualOpenWaterMode
      ? "Open when you want to change the title, session note, strokes, or equipment."
      : "Open when you want to change the title, session note, environment, strokes, or equipment.";
  const workoutPdfHeadingLabel = "PDF";
  const workoutPdfStateLabel =
    handoffDraftState === "canonical"
      ? "Canonical full-session PDF"
      : "Local draft full-session PDF";
  const workoutPdfStateDescription = savedWorkout
    ? hasUnsavedChanges
      ? "Full-session PDF reflects your unsaved local edits. Save first if you want the canonical workout and this PDF to match exactly."
      : "Full-session PDF matches the saved canonical workout."
    : "Full-session PDF reflects the current local draft before canonical save.";
  const workoutPdfBodyCopy =
    handoffDraftState === "canonical"
      ? "Use PDF for the full-session sheet, or Poolside Note for the compact lane-side note."
      : "Both PDF views reflect the unsaved draft currently on screen.";
  const workoutPdfButtonLabel = "PDF";
  const workoutPoolsidePdfButtonLabel = "Poolside Note";
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
    "Optional export and handoff tools stay here so the workout itself can remain the primary editing surface.";
  const shouldHideAutoPoolBuilderTitle =
    isManualPoolMode &&
    !manualPoolTitleEdited &&
    autoPoolBuilderTitle !== null &&
    draft.title === autoPoolBuilderTitle;
  const displayedTitle = shouldHideAutoPoolBuilderTitle ? "" : draft.title;
  const poolLengthSupportCopy = poolSizeInputInvalid
    ? `Enter a valid pool ${isManualPoolMode ? "size" : "length"} between ${formatPoolLengthLabel(
        SESSION_DRAFT_POOL_LENGTH_MIN,
        poolLengthUnit
      )} and ${formatPoolLengthLabel(SESSION_DRAFT_POOL_LENGTH_MAX, poolLengthUnit)}.`
    : `Common presets: ${poolLengthQuickChoices
        .map((value) =>
          poolLengthUnit === "yd" ? `${value}yd` : formatPoolLengthLabel(value, poolLengthUnit)
        )
        .join(", ")}.`;
  const supportToolsDraftStateDescription =
    handoffDraftState === "canonical"
      ? "These support tools currently reflect the saved session."
      : "These support tools currently reflect the unsaved draft on screen.";
  const supportToolsPersistenceDescription = savedWorkout
    ? hasUnsavedChanges
      ? "Opening or downloading anything here does not save changes. Save first if you want these support outputs to match the canonical session."
      : "Opening or downloading anything here does not send or publish anything. It only opens or downloads support output for this saved session."
    : "Opening or downloading anything here does not accept or save this draft. It only opens or downloads support output for the current draft on screen.";
  const supportToolsWarningSummary =
    draft.warnings.length > 0
      ? `${draft.warnings.length} builder warning${
          draft.warnings.length === 1 ? "" : "s"
        } also stay inside this section.`
      : null;
  const supportToolsStatusLabel =
    garminReadiness.status === "ready"
      ? "Ready"
      : `${garminReadiness.issues.length} review ${
          garminReadiness.issues.length === 1 ? "item" : "items"
        }`;
  const integratedSupportSectionClass = "border-t border-slate-200/80 pt-4";
  const supportPreviewShellClass =
    "mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950";
  const supportSummaryItemClass = "rounded-xl bg-slate-100/80 p-4";

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
    setTimeDurationInputs((current) => {
      const next: Record<string, string> = {};

      for (const step of draft.steps) {
        if (step.durationMode !== "time") continue;

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
    setManualPoolTitleEdited(false);
  }, [savedWorkoutId, savedWorkout?.updatedAt]);

  useEffect(() => {
    setManualMetadataProfileOpen(false);
  }, [savedWorkoutId, isManualMetadataMode]);

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
    setPoolsidePrintStyle("color");
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
    selectedPoolsideFocusSignature,
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

  function insertStepAt(insertIndex: number, overrides: Partial<SessionDraftStep> = {}) {
    const nextStep = buildBlankStep(draft.steps.length + 1, overrides);
    const nextSteps = [...draft.steps];
    const safeInsertIndex = Math.min(Math.max(insertIndex, 0), nextSteps.length);

    nextSteps.splice(safeInsertIndex, 0, nextStep);
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
    insertStepAt(draft.steps.length);
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
        : {}
    );
  }

  function insertStepAfterGroup(groupIndex: number) {
    const insertIndex = getGroupInsertIndex(groupIndex);
    if (insertIndex === null) return;
    insertStepAt(insertIndex);
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
              focusPoints: selectedPoolsideFocusTitles,
              poolsidePrintStyle,
              logoUrl: new URL(BRAND_PDF_LOGO_PATH, window.location.origin).toString(),
              fontUrl: new URL(BRAND_FONT_PUBLIC_PATH, window.location.origin).toString(),
            })
          : workoutPdfHtml;
      const fileName = variant === "poolside" ? workoutPoolsidePdfFileName : workoutPdfFileName;
      const variantLabel = variant === "poolside" ? "Poolside Note" : "PDF";
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
    const isOpen = openStepId === step.id;
    const toggleLabel = isOpen ? "Done" : "Edit step";
    const panelId = `session-draft-step-panel-${step.id}`;
    const stepLabel =
      options?.labelOverride ??
      (insideRepeatGroup
        ? step.category === "rest"
          ? `Repeat rest step ${options?.repeatStepNumber ?? 1}`
          : `Repeat step ${options?.repeatStepNumber ?? 1}`
        : `Step ${index + 1}`);
    const selectedDistancePreset = SESSION_DRAFT_STEP_DISTANCE_PRESETS.find((value) =>
      isDistanceQuickChoiceSelected(step.distanceM, value, poolLengthUnit)
    );
    const isMinimalRestEditor = isManualPoolMode && step.category === "rest";
    const stepTitle = isManualPoolMode
      ? buildManualPoolStepSummary(step, draft.basePaceSecondsPer100m, poolLengthUnit)
      : step.name || getSessionStepCategoryLabel(step.category);

    return (
      <article
        key={step.id}
        className={`rounded-2xl border p-4 transition ${
          isOpen
            ? "border-blue-300 bg-white shadow-sm ring-1 ring-blue-100"
            : insideRepeatGroup
              ? "border-blue-200 bg-white"
              : "border-slate-200 bg-slate-50/70"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {stepLabel}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">{stepTitle}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              {getSessionStepCategoryLabel(step.category)}
            </p>
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
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
            {isLinkedPostSetRest ? null : (
              <button
                type="button"
                onClick={() => requestStepRemoval(step.id)}
                data-testid={`session-draft-step-remove-${index}`}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-sm text-rose-700 transition hover:bg-rose-50"
              >
                Remove
              </button>
            )}
          </div>
        </div>

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
                value={step.category}
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
                {(isLinkedPostSetRest ? (["rest"] as const) : SESSION_DRAFT_STEP_CATEGORIES).map(
                  (value) => (
                    <option key={value} value={value}>
                      {getSessionStepCategoryLabel(value)}
                    </option>
                  )
                )}
              </select>
            </label>

            {isMinimalRestEditor ? null : (
              <label className="text-sm text-slate-700">
                {isManualPoolMode ? "Stroke Type" : "Stroke pattern"}
                <select
                  value={step.stroke ?? "choice"}
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
                  {SESSION_DRAFT_STEP_STROKES.map((value) => (
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
                  value={step.drillType ?? "none"}
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
                  value={step.equipment ?? "none"}
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
                Effort cue
                <select
                  value={step.intensity}
                  onChange={(event) =>
                    updateDraftStep(step.id, (current) => ({
                      ...current,
                      intensity: event.target.value as SessionDraft["effort"],
                    }))
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
            )}

            <label className="text-sm text-slate-700">
              {isManualPoolMode ? "Duration" : "Duration mode"}
              <select
                value={step.durationMode}
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
                  ? getManualPoolDurationModesForCategory(step.category)
                  : SESSION_DRAFT_STEP_DURATION_MODES
                ).map((value) => (
                  <option key={value} value={value}>
                    {getStepDurationModeEditorLabel(value, isManualPoolMode)}
                  </option>
                ))}
              </select>
            </label>

            {step.durationMode === "distance" ? (
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
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
            ) : step.durationMode === "fixed_rest" ? (
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-2 md:grid-cols-[1fr_1fr_auto]">
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
                {isManualPoolMode ? (
                  <p className="mt-2 text-xs text-slate-500">Use `MM:SS`.</p>
                ) : null}
              </label>
            ) : step.durationMode === "send_off" ? (
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-2 md:grid-cols-[1fr_1fr_auto]">
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
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
                This step stays open until the swimmer advances with the lap button.
              </div>
            )}

            {isMinimalRestEditor ? null : (
              <label className="text-sm text-slate-700">
                {isManualPoolMode ? "Target" : "Target mode"}
                <select
                  value={step.targetMode ?? "none"}
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

            {!isMinimalRestEditor && (step.targetMode ?? "none") === "effort" ? (
              <label className="text-sm text-slate-700">
                Target effort
                <select
                  value={step.effortTarget ?? step.intensity}
                  onChange={(event) =>
                    updateDraftStep(step.id, (current) => ({
                      ...current,
                      effortTarget: event.target.value as SessionDraft["effort"],
                    }))
                  }
                  data-testid={`session-draft-step-target-effort-${index}`}
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

            {!isMinimalRestEditor && (step.targetMode ?? "none") === "target_pace" ? (
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-2 md:grid-cols-[1fr_1fr_auto]">
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

            {!isMinimalRestEditor && (step.targetMode ?? "none") === "css_target_pace" ? (
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
          </div>
        ) : null}
      </article>
    );
  }

  const sessionTypeField = (
    <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
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
  );

  const effortField = (
    <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
      Effort
      <select
        value={draft.effort}
        onChange={(event) => updateDraft("effort", event.target.value as SessionDraft["effort"])}
        className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      >
        {SESSION_GENERATOR_EFFORT_PRESETS.map((value) => (
          <option key={value} value={value}>
            {getSessionEffortLabel(value)}
          </option>
        ))}
      </select>
    </label>
  );

  const manualMetadataProfileFields = (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-900">Training profile</p>
          <p className="mt-1 text-xs text-slate-500">
            These labels shape summaries and export context. Change them when this session needs a
            different training emphasis.
          </p>
          {!manualMetadataProfileOpen ? (
            <p
              data-testid="workout-editor-metadata-profile-summary"
              className="mt-2 text-sm font-medium text-slate-900"
            >
              {manualMetadataProfileSummary}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setManualMetadataProfileOpen((current) => !current)}
          aria-expanded={manualMetadataProfileOpen}
          data-testid="workout-editor-metadata-profile-toggle"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
        >
          {manualMetadataProfileOpen ? "Hide profile" : "Edit profile"}
        </button>
      </div>

      {manualMetadataProfileOpen ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {sessionTypeField}
          {effortField}
        </div>
      ) : null}
    </div>
  );

  const metadataFields = (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
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

      {isManualMetadataMode ? null : sessionTypeField}

      <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700 md:col-span-2">
        Session note
        {isManualPoolMode ? null : (
          <p className="mt-2 text-xs text-slate-500">
            Optional. Use this for the whole-session purpose or one short coaching note that applies
            across the session.
          </p>
        )}
        <AutoGrowingTextarea
          aria-label="Session note"
          value={draft.description}
          onChange={(event) => updateDraft("description", event.target.value)}
          data-testid="session-draft-description"
          minRows={isManualPoolMode ? 1 : 4}
          className="mt-2 block w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </label>

      {manualBuilderMode ? null : (
        <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
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
          className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700 md:col-span-2"
        >
          <p className="text-sm font-medium text-slate-900">
            {isManualPoolMode ? "Pool Size" : "Pool length"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {poolLengthUnit === "yd"
              ? "Yard entry stays visible in yards while FreeSwimming saves the exact meter conversion canonically."
              : "Choose meters or yards, then pick a common size or type the exact value."}
          </p>
          <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.9fr)] xl:items-start">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unit</p>
                <div
                  role="group"
                  aria-label={isManualPoolMode ? "Pool size unit" : "Pool length unit"}
                  className="mt-3 flex flex-wrap items-center gap-2"
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
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Common sizes
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
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
              </div>
            </div>

            <div className="space-y-2 xl:border-l xl:border-slate-200 xl:pl-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Exact size
              </p>
              <label className="block text-sm text-slate-700">
                {isManualPoolMode
                  ? `Exact pool size (${poolLengthUnit})`
                  : `Exact pool length (${poolLengthUnit})`}
                <input
                  type="text"
                  inputMode="decimal"
                  value={poolLengthInput}
                  onChange={(event) => updateDraftPoolLengthInput(event.target.value)}
                  data-testid="session-draft-pool-length-input"
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
              <p className="text-xs text-slate-500">{poolLengthSupportCopy}</p>
            </div>
          </div>
        </div>
      ) : null}

      {isManualPoolMode ? null : isManualMetadataMode ? manualMetadataProfileFields : effortField}

      {isManualPoolMode ? null : (
        <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:col-span-2">
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
        <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:col-span-2">
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
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
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
        className={`rounded-2xl border p-4 ${
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

      {showPdfPanel ? (
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
      className="rounded-2xl border border-blue-200/80 bg-blue-50/60 p-5"
      data-testid="workout-editor-poolside-panel"
      data-containment-style="split"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Poolside Note
          </p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            Choose the focus cues and print style before you open the compact lane-side note.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openWorkoutPdfPrintView("poolside")}
            data-testid="workout-editor-poolside-pdf-open"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-800 transition hover:bg-blue-100 active:bg-blue-200"
          >
            Open Poolside Note
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] lg:items-start">
        <div className="min-w-0 space-y-3 lg:border-r lg:border-blue-200/70 lg:pr-5">
          <p className="text-sm font-semibold text-slate-900">Open focus cues</p>
          {trainingFocusOptions.length > 0 ? (
            <div
              data-testid="workout-editor-poolside-focus-list"
              className="grid max-h-72 gap-3 overflow-y-auto pr-1"
            >
              {trainingFocusOptions.map((focus) => (
                <label
                  key={focus.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedPoolsideFocusIds.includes(focus.id)}
                    onChange={() => togglePoolsideFocusSelection(focus.id)}
                    data-testid={`workout-editor-poolside-focus-${focus.id}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-slate-900">{focus.title}</span>
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

        <fieldset className="min-w-0 space-y-3 lg:pl-5">
          <legend className="text-sm font-semibold text-slate-900">Print style</legend>
          <div className="grid gap-3">
            <label className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
              <span className="flex items-start gap-3">
                <input
                  type="radio"
                  name="workout-poolside-print-style"
                  checked={poolsidePrintStyle === "color"}
                  onChange={() => setPoolsidePrintStyle("color")}
                  data-testid="workout-editor-poolside-style-color"
                />
                <span>
                  <span className="block font-medium text-slate-900">Color mode</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Keeps the blue surfaces when your browser prints backgrounds.
                  </span>
                </span>
              </span>
            </label>
            <label className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
              <span className="flex items-start gap-3">
                <input
                  type="radio"
                  name="workout-poolside-print-style"
                  checked={poolsidePrintStyle === "ink_saver"}
                  onChange={() => setPoolsidePrintStyle("ink_saver")}
                  data-testid="workout-editor-poolside-style-ink-saver"
                />
                <span>
                  <span className="block font-medium text-slate-900">Ink saver</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Uses white surfaces and strong outlines for cheaper printing.
                  </span>
                </span>
              </span>
            </label>
          </div>
        </fieldset>
      </div>
    </div>
  ) : null;
  const supportStatusSectionList = <div className="space-y-4">{supportStatusSections}</div>;
  const supportToolsPanel = showCalmBuilderLayout ? (
    <section
      data-testid="workout-editor-support-tools-panel"
      data-containment-style="sectioned"
      className={`rounded-2xl border p-5 ${
        garminReadiness.status === "ready"
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-amber-200 bg-amber-50/60"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${
              garminReadiness.status === "ready" ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            Export and handoff support
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
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-white/80 active:bg-white/70"
          >
            {supportToolsOpen ? "Hide support details" : "Show support details"}
          </button>
        </div>
      </div>

      {supportToolsOpen ? <div className="mt-4">{supportStatusSectionList}</div> : null}
    </section>
  ) : (
    supportStatusSectionList
  );

  return (
    <div data-testid="workout-editor-panel" className="space-y-5">
      {showLoadedBanner && savedWorkout ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 p-4">
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
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
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
                    {workout.totalDistanceM
                      ? formatDistanceMetersLabel(
                          workout.totalDistanceM,
                          resolveSessionDraftPoolLengthUnit(workout.poolLengthUnit)
                        )
                      : null}
                    {workout.totalDistanceM && workout.estimatedDurationMin ? " · " : null}
                    {workout.estimatedDurationMin ? `~${workout.estimatedDurationMin} min` : null}
                    {workout.totalDistanceM || workout.estimatedDurationMin ? " · " : null}
                    {getSessionTypeLabel(workout.sessionType)}
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
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4">
          <p className="text-sm text-blue-900">
            {savedWorkout ? editorCopy.loadedDraftBanner : editorCopy.unsavedDraftBanner}
          </p>
        </div>
      ) : null}

      {!showCalmBuilderLayout ? supportToolsPanel : null}

      {showCalmBuilderLayout ? (
        <section
          data-testid="workout-editor-metadata-panel"
          className="rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Session details
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-900">{metadataHeading}</h3>
              {metadataOpen ? null : (
                <p className="mt-1 text-sm text-slate-600">{collapsedMetadataCopy}</p>
              )}
              {!metadataOpen ? (
                <p
                  data-testid="workout-editor-metadata-summary"
                  className="mt-2 text-sm font-medium text-slate-900"
                >
                  {metadataSummary}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMetadataOpen((current) => !current)}
                aria-expanded={metadataOpen}
                data-testid="workout-editor-metadata-toggle"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                {metadataOpen ? "Hide details" : "Show details"}
              </button>
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

          {metadataOpen ? <div className="mt-4">{metadataFields}</div> : null}
        </section>
      ) : (
        metadataFields
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">
            {isManualPoolMode ? "Session builder" : "Editable draft steps"}
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addStep}
              data-testid="session-draft-add-step"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              Add step
            </button>
            <button
              type="button"
              onClick={addRepeat}
              data-testid="session-draft-add-repeat"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-medium text-blue-800 transition hover:bg-blue-100 active:bg-blue-200"
            >
              Add repeat
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {stepGroups.length === 0 ? (
            <div
              data-testid="session-draft-empty-steps"
              className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4"
            >
              <p className="text-sm font-medium text-slate-900">
                Start from a clean empty session.
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Add your first step or repeat block below when you are ready to build from scratch.
              </p>
            </div>
          ) : null}

          {pendingRemoval ? (
            <div
              data-testid="workout-editor-removal-confirm"
              className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4"
            >
              <p className="text-sm font-medium text-amber-950">
                Confirm removal before this builder change is applied.
              </p>
              <p className="mt-1 text-sm text-amber-900">
                Remove <span className="font-semibold">{pendingRemoval.label}</span>? You can still
                undo it locally before saving.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={confirmPendingRemoval}
                  data-testid="workout-editor-removal-confirm-button"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 active:bg-rose-700"
                >
                  Remove now
                </button>
                <button
                  type="button"
                  onClick={cancelPendingRemoval}
                  data-testid="workout-editor-removal-cancel-button"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-white px-4 text-sm font-medium text-amber-900 transition hover:bg-amber-100 active:bg-amber-200"
                >
                  Keep it
                </button>
              </div>
            </div>
          ) : null}

          {lastRemovedBlock ? (
            <div
              data-testid="workout-editor-removal-undo"
              className="rounded-2xl border border-blue-200 bg-blue-50/90 p-4"
            >
              <p className="text-sm font-medium text-blue-950">
                Removed <span className="font-semibold">{lastRemovedBlock.label}</span>.
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
                  Undo removal
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

          {stepGroups.map((group, groupIndex) =>
            group.kind === "single" ? (
              renderStepEditorCard(group.entries[0].step, group.entries[0].index, groupIndex)
            ) : (
              <section
                key={group.repeatGroupId}
                data-testid={`workout-editor-repeat-group-${groupIndex}`}
                data-containment-style="calm"
                className="rounded-2xl bg-gradient-to-b from-blue-50/70 to-white p-4 ring-1 ring-inset ring-blue-100"
              >
                {(() => {
                  const repeatSummary = buildRepeatSummary(
                    group.entries,
                    group.repeatCount,
                    draft.basePaceSecondsPer100m,
                    group.repeatEndingRestMode,
                    poolLengthUnit
                  );
                  const repeatEndingRestDescription = buildRepeatEndingRestDescription(
                    group.entries,
                    group.repeatCount,
                    draft.basePaceSecondsPer100m,
                    group.repeatEndingRestMode,
                    poolLengthUnit
                  );
                  const postSetRestLabel = group.postSetRestEntry
                    ? buildWorkoutStepDurationOutputSummary(
                        group.postSetRestEntry.step,
                        draft.basePaceSecondsPer100m,
                        {
                          environment: "pool",
                          poolLengthUnit,
                        }
                      )
                    : null;
                  const postSetRestSuppressed =
                    group.repeatEndingRestMode === "use_last_rest" &&
                    Boolean(
                      group.entries[group.entries.length - 1] &&
                      isSessionDraftRepeatEndingRestStep(
                        group.entries[group.entries.length - 1].step
                      )
                    );

                  return (
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                          Repeat set
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{repeatSummary}</p>
                        {isManualPoolMode ? (
                          <p className="mt-1 text-xs text-slate-600">
                            Inside the repeat: work interval, then between-interval recovery. After
                            the set: separate post-set rest.
                          </p>
                        ) : (
                          <>
                            <p className="mt-1 text-xs text-slate-600">
                              Edit the repeated steps below instead of duplicating every round by
                              hand.
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Repeat counts currently support {SESSION_DRAFT_REPEAT_MIN}-
                              {SESSION_DRAFT_REPEAT_MAX} rounds per block.
                            </p>
                          </>
                        )}
                        {repeatEndingRestDescription ? (
                          <p className="mt-2 text-xs text-slate-600">
                            {repeatEndingRestDescription}
                          </p>
                        ) : null}
                        {postSetRestLabel ? (
                          <p className="mt-1 text-xs text-slate-600">
                            {postSetRestSuppressed
                              ? `${postSetRestLabel} is preserved as post-set rest, but suppressed while the last internal rest interval runs after the final round.`
                              : `${postSetRestLabel} stays outside the repeat block as the post-set rest after the set.`}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-end gap-2">
                        <label className="text-sm text-slate-700">
                          Repeat count
                          <input
                            type="text"
                            inputMode="numeric"
                            value={group.repeatCount ?? ""}
                            onChange={(event) =>
                              updateRepeatGroupCount(group.repeatGroupId, event.target.value)
                            }
                            min={SESSION_DRAFT_REPEAT_MIN}
                            max={SESSION_DRAFT_REPEAT_MAX}
                            data-testid={`session-draft-repeat-count-${groupIndex}`}
                            className="mt-2 block h-11 w-28 rounded-xl border border-blue-200 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                        </label>
                        {draft.environment === "pool" &&
                        (() => {
                          const lastEntry = group.entries[group.entries.length - 1];
                          return Boolean(
                            lastEntry && isSessionDraftRepeatEndingRestStep(lastEntry.step)
                          );
                        })() ? (
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
                              className="mt-2 block h-11 min-w-[15rem] rounded-xl border border-blue-200 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            >
                              {SESSION_DRAFT_REPEAT_ENDING_REST_MODES.map((mode) => (
                                <option key={mode} value={mode}>
                                  {getSessionDraftRepeatEndingRestModeLabel(mode)}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : null}
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
                          Remove repeat
                        </button>
                      </div>
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
                </div>
              </section>
            )
          )}
        </div>
      </div>

      {poolsideNotePanel}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <div>
          <p className="text-sm text-slate-600">
            {savedWorkout ? editorCopy.savedWorkoutDescription : editorCopy.unsavedDraftDescription}
          </p>
          <p
            data-testid="workout-editor-save-state"
            className={`mt-2 text-sm font-medium ${
              hasUnsavedChanges ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            {savedWorkout
              ? hasUnsavedChanges
                ? editorCopy.savedWorkoutPendingState
                : editorCopy.savedWorkoutSavedState
              : editorCopy.unsavedDraftPendingState}
          </p>
          {!showPdfPanel ? (
            <>
              <p
                data-testid="workout-editor-pdf-source"
                data-pdf-state={handoffDraftState}
                className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {workoutPdfStateLabel}
              </p>
              <p className="mt-1 text-sm text-slate-600">{workoutPdfBodyCopy}</p>
            </>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!showPdfPanel ? (
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

      {!showPdfPanel && workoutPdfNotice ? (
        <p
          data-testid="workout-editor-pdf-notice"
          className="mt-3 text-sm font-medium text-emerald-700"
        >
          {workoutPdfNotice}
        </p>
      ) : null}

      {showCalmBuilderLayout ? supportToolsPanel : null}

      {!showPdfPanel && workoutPdfError ? (
        <p data-testid="workout-editor-pdf-error" className="mt-3 text-sm text-rose-700">
          {workoutPdfError}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
        <pre
          data-testid="session-generator-draft-preview"
          className="max-h-[420px] overflow-auto px-4 py-4 text-xs leading-relaxed text-slate-100"
        >
          {JSON.stringify(
            {
              ...draft,
              totalDistanceM: draftTotals.totalDistanceM ?? draft.totalDistanceM,
              estimatedDurationMin: draftTotals.estimatedDurationMin ?? draft.estimatedDurationMin,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
