"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type TextareaHTMLAttributes,
} from "react";
import PoolsideNotePanel from "@/components/my-library/workouts/PoolsideNotePanel";
import {
  RemovalConfirm,
  SessionStepRepeatSummaryCard,
  SessionStepSummaryCard,
  SessionStepSurfaceRenderer,
  type SessionStepSurfaceMode,
} from "@/components/my-library/workouts/SessionStepSurfaceRenderer";
import {
  MANUAL_POOL_REST_DURATION_MODES,
  applyRecommendedStepFocus,
  applyStepDurationModeDefaults,
  buildGeneratedSessionRestValueSummary,
  buildGeneratedSessionTopLevelSectionDescriptors,
  buildGeneratedSessionViewSections,
  buildLinkedRestLabel,
  buildManualPoolDisplaySummary,
  buildManualPoolStepSummary,
  buildManualPoolTopLevelSectionDescriptors,
  buildManualPoolViewLineParts,
  buildManualPoolViewSections,
  buildRepeatSummary,
  buildSessionStepEditBlocks,
  buildStepRenderGroups,
  buildStepSummary,
  didManualPoolSummaryUnitInputsChange,
  getDefaultManualPoolDurationMode,
  getManualPoolCategoryLabelClass,
  getManualPoolCategoryRailClass,
  getManualPoolDrillNameInputValue,
  getManualPoolDurationModesForCategory,
  getRecommendedStepFocus,
  getStepDurationModeEditorLabel,
  getStepTargetModeEditorLabel,
  getWorkoutEditorTopLevelCategory,
  isManualPoolDrillNameRelevantStep,
  isManualPoolDurationModeAllowed,
  normalizeManualPoolStepForEditor,
  resolveManualPoolSummaryUnit,
  syncManualPoolEditableStep,
  usesClockDurationInput,
  type SessionStepEditBlock,
  type StepRenderEntry,
  type StepRenderGroup,
} from "@/components/my-library/workouts/sessionStepSurfaceContract";
import { BRAND_FONT_PUBLIC_PATH, getWorkoutPdfLogoPath } from "@/lib/brand";
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
  buildWorkoutPdfFileName,
  buildWorkoutPdfHtmlDocument,
  buildWorkoutGarminReadyExport,
  buildWorkoutGarminReadyExportFileName,
  buildWorkoutGarminReadinessReport,
  buildWorkoutHandoffFileName,
  buildWorkoutHandoffText,
  getDefaultWorkoutPoolsideFocusIds,
  selectWorkoutPoolsideFocusPoints,
  type WorkoutEditorRecord,
  type WorkoutHandoffDraftState,
  type WorkoutPoolsideFocusOption,
  type WorkoutSummary,
} from "@/lib/workouts/shared";
import {
  buildWorkoutPoolsidePreviewHref,
  createWorkoutPoolsidePreviewId,
  writeStoredWorkoutPoolsidePreviewDraft,
} from "@/lib/workouts/poolside-preview";
import type { ManualWorkoutBuilderMode } from "@/lib/workouts/manual";

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
  onDiscardChanges?: (() => void) | null;
  onRequestDiscardDraft?: (() => void) | null;
  showDiscardUndoNotice?: boolean;
  onUndoDiscardChanges?: (() => void) | null;
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
  manualBuilderMode?: ManualWorkoutBuilderMode | null;
  forceMetadataOpenOnLoad?: boolean;
  onRequestDeleteCurrent?: (() => void) | null;
  isDeletingCurrent?: boolean;
  swimmerName?: string | null;
};

type PendingRemoval =
  | {
      kind: "step";
      stepId: string;
      stepIds: string[];
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
type LastRemovedBlock = {
  kind: "step" | "repeat";
  label: string;
  steps: SessionDraftStep[];
  insertIndex: number;
  restoreOpenStepId: string | null;
  restoreOpenRepeatGroupId: string | null;
};

type AutoGrowingTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string;
  minRows?: number;
};

type SupportSectionKey = "readiness" | "garminExport" | "handoff";
type WorkoutEditorFeedbackTone = "success" | "error";
type WorkoutEditorFeedback = {
  tone: WorkoutEditorFeedbackTone;
  title: string;
  message: string;
  testId: string;
};

const CUSTOM_DISTANCE_VALUE = "custom";
const EMPTY_WORKOUT_POOLSIDE_FOCUS_OPTIONS: WorkoutPoolsideFocusOption[] = [];
const DESKTOP_CARD_EDIT_MEDIA_QUERY = "(hover: hover) and (pointer: fine)";
const workoutEditorFeedbackToneClasses: Record<WorkoutEditorFeedbackTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-800",
};

function WorkoutEditorActionFeedback({
  id,
  tone,
  title,
  message,
  testId,
}: WorkoutEditorFeedback & { id: string }) {
  return (
    <div
      id={id}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      data-feedback-tone={tone}
      data-testid={testId}
      className={`mt-3 max-w-2xl rounded-xl border px-3 py-2 text-sm leading-6 ${workoutEditorFeedbackToneClasses[tone]}`}
    >
      <p className="font-semibold">{title}</p>
      <p className="text-xs leading-5">{message}</p>
    </div>
  );
}

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

function getDefaultPoolLengthQuickChoice(unit: SessionDraftPoolLengthUnit) {
  return unit === "yd" ? YARD_POOL_SIZE_QUICK_CHOICES[0] : MANUAL_POOL_SIZE_QUICK_CHOICES[0];
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
  onDiscardChanges = null,
  onRequestDiscardDraft = null,
  showDiscardUndoNotice = false,
  onUndoDiscardChanges = null,
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
  manualBuilderMode = null,
  forceMetadataOpenOnLoad = false,
  onRequestDeleteCurrent = null,
  isDeletingCurrent = false,
  swimmerName = null,
}: Props) {
  const draftTotals = computeSessionDraftDerivedTotals(draft);
  const garminReadiness = buildWorkoutGarminReadinessReport(draft);
  const stepGroups = buildStepRenderGroups(draft.steps);
  const showCalmBuilderLayout = copyVariant === "default" || copyVariant === "generator";
  const isManualMetadataMode = showCalmBuilderLayout && savedWorkout?.sourceKind === "manual";
  const resolvedManualBuilderMode = manualBuilderMode
    ? manualBuilderMode
    : isManualMetadataMode
      ? draft.environment === "open_water"
        ? "open_water"
        : "pool"
      : null;
  const isManualPoolMode = resolvedManualBuilderMode === "pool";
  const autoPoolBuilderTitle = getPoolBuilderAutoTitle(draft.environment);
  const workoutPdfFeedbackId = useId();
  const garminExportFeedbackId = useId();
  const handoffFeedbackId = useId();
  const timeDurationInputFocusRef = useRef<Record<string, boolean>>({});
  const [openStepId, setOpenStepId] = useState<string | null>(null);
  const [openRepeatGroupId, setOpenRepeatGroupId] = useState<string | null>(null);
  const [openMobileActionKey, setOpenMobileActionKey] = useState<string | null>(null);
  const [repeatConflictKeepBoth, setRepeatConflictKeepBoth] = useState<Record<string, boolean>>({});
  const [repeatConflictPendingReplacement, setRepeatConflictPendingReplacement] = useState<
    string | null
  >(null);
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
  const [recentlyMovedBlockKey, setRecentlyMovedBlockKey] = useState<string | null>(null);
  const [rearrangeLiveMessage, setRearrangeLiveMessage] = useState("");
  const movedHighlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [workoutPdfNotice, setWorkoutPdfNotice] = useState("");
  const [workoutPdfError, setWorkoutPdfError] = useState("");
  const [garminExportNotice, setGarminExportNotice] = useState("");
  const [garminExportError, setGarminExportError] = useState("");
  const [handoffNotice, setHandoffNotice] = useState("");
  const [handoffError, setHandoffError] = useState("");
  const [metadataOpen, setMetadataOpen] = useState(
    () =>
      forceMetadataOpenOnLoad ||
      (copyVariant !== "generator" && !(savedWorkout && copyVariant === "default"))
  );
  const [builderViewMode, setBuilderViewMode] = useState<SessionStepSurfaceMode>("edit");
  const [selectedPoolsideFocusIds, setSelectedPoolsideFocusIds] = useState<string[]>(() =>
    getDefaultWorkoutPoolsideFocusIds(trainingFocusOptions)
  );
  const [supportSectionOpen, setSupportSectionOpen] = useState<Record<SupportSectionKey, boolean>>({
    readiness: false,
    garminExport: false,
    handoff: false,
  });
  const [supportToolsOpen, setSupportToolsOpen] = useState(
    () => copyVariant !== "default" && copyVariant !== "generator"
  );
  const [pendingCustomDistanceFocusStepId, setPendingCustomDistanceFocusStepId] = useState<
    string | null
  >(null);
  const [desktopCardEditEnabled, setDesktopCardEditEnabled] = useState(false);
  const savedWorkoutId = savedWorkout?.id ?? null;
  const isManualSourceDraft = draft.sourceFingerprint.startsWith("manual-");
  const simplifyManualMetadata = showCalmBuilderLayout && isManualSourceDraft;
  const trainingFocusIdSignature = trainingFocusOptions.map((focus) => focus.id).join("|");
  const defaultPoolsideFocusIdSignature =
    getDefaultWorkoutPoolsideFocusIds(trainingFocusOptions).join("|");
  const metadataStartsCollapsed =
    showCalmBuilderLayout &&
    !forceMetadataOpenOnLoad &&
    (copyVariant === "generator" || savedWorkoutId !== null);
  const customDistanceInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
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
          savedWorkoutPendingState: "Unsaved changes stay local until you save this session.",
          savedWorkoutSavedState: "All changes are saved to this session.",
          unsavedDraftPendingState: "This session is not saved yet.",
        };
  const unsavedSaveButtonLabel = "Save session";
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
        ? getWorkoutPdfLogoPath({ variant: "standard" })
        : new URL(
            getWorkoutPdfLogoPath({ variant: "standard" }),
            window.location.origin
          ).toString(),
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
  const metadataPanelSummary = simplifyManualMetadata ? null : metadataSummary;
  const sessionTotalLabel = draftTotals.totalDistanceM
    ? formatDistanceMetersLabel(draftTotals.totalDistanceM, poolLengthUnit)
    : null;
  const saveStateMessage = savedWorkout
    ? hasUnsavedChanges
      ? editorCopy.savedWorkoutPendingState
      : editorCopy.savedWorkoutSavedState
    : editorCopy.unsavedDraftPendingState;
  const saveStateToneClass = hasUnsavedChanges ? "text-amber-700" : "text-emerald-700";
  const workoutPdfHeadingLabel = "View PDF";
  const workoutPdfStateLabel =
    handoffDraftState === "canonical"
      ? "Saved session PDF"
      : savedWorkout
        ? "Current session PDF"
        : "Current draft PDF";
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
  const desktopRepeatControlRowClass = "grid gap-3";
  const isEditMode = builderViewMode === "edit";
  const isRearrangeMode = builderViewMode === "rearrange";
  const isViewMode = builderViewMode === "view";
  const isSummaryOnlyMode = !isEditMode;
  const useManualLikeStepSummaries = isManualPoolMode || copyVariant === "generator";
  const manualPoolTopLevelSectionDescriptors = useMemo(
    () =>
      isManualPoolMode
        ? buildManualPoolTopLevelSectionDescriptors(stepGroups)
        : copyVariant === "generator"
          ? buildGeneratedSessionTopLevelSectionDescriptors(stepGroups)
          : [],
    [copyVariant, isManualPoolMode, stepGroups]
  );
  const sessionStepEditBlocks = useMemo(
    () => (useManualLikeStepSummaries ? buildSessionStepEditBlocks(stepGroups, draft.steps) : []),
    [draft.steps, stepGroups, useManualLikeStepSummaries]
  );
  const manualPoolViewSections = useMemo(
    () =>
      isManualPoolMode
        ? buildManualPoolViewSections(
            stepGroups,
            draft.steps,
            draft.basePaceSecondsPer100m,
            poolLengthUnit
          )
        : [],
    [draft.basePaceSecondsPer100m, draft.steps, isManualPoolMode, poolLengthUnit, stepGroups]
  );
  const generatedSessionViewSections = useMemo(
    () =>
      copyVariant === "generator"
        ? buildGeneratedSessionViewSections(
            stepGroups,
            draft.basePaceSecondsPer100m,
            draft.environment,
            poolLengthUnit
          )
        : [],
    [copyVariant, draft.basePaceSecondsPer100m, draft.environment, poolLengthUnit, stepGroups]
  );
  const calmViewSections = isManualPoolMode
    ? manualPoolViewSections
    : copyVariant === "generator"
      ? generatedSessionViewSections
      : [];
  const workoutPdfFeedback: WorkoutEditorFeedback | null = workoutPdfError
    ? {
        tone: "error",
        title: "PDF could not open",
        message: workoutPdfError,
        testId: "workout-editor-pdf-error",
      }
    : workoutPdfNotice
      ? {
          tone: "success",
          title: "PDF tab opened",
          message: workoutPdfNotice,
          testId: "workout-editor-pdf-notice",
        }
      : null;
  const garminExportFeedback: WorkoutEditorFeedback | null = garminExportError
    ? {
        tone: "error",
        title: "Export failed",
        message: garminExportError,
        testId: "workout-editor-garmin-export-error",
      }
    : garminExportNotice
      ? {
          tone: "success",
          title: "Export downloaded",
          message: garminExportNotice,
          testId: "workout-editor-garmin-export-notice",
        }
      : null;
  const handoffFeedback: WorkoutEditorFeedback | null = handoffError
    ? {
        tone: "error",
        title: "Handoff failed",
        message: handoffError,
        testId: "workout-editor-handoff-error",
      }
    : handoffNotice
      ? {
          tone: "success",
          title: "Handoff ready",
          message: handoffNotice,
          testId: "workout-editor-handoff-notice",
        }
      : null;

  function renderWorkoutPdfFeedback() {
    return workoutPdfFeedback ? (
      <WorkoutEditorActionFeedback id={workoutPdfFeedbackId} {...workoutPdfFeedback} />
    ) : null;
  }

  function renderGarminExportFeedback() {
    return garminExportFeedback ? (
      <WorkoutEditorActionFeedback id={garminExportFeedbackId} {...garminExportFeedback} />
    ) : null;
  }

  function renderHandoffFeedback() {
    return handoffFeedback ? (
      <WorkoutEditorActionFeedback id={handoffFeedbackId} {...handoffFeedback} />
    ) : null;
  }

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
    if (!useManualLikeStepSummaries || !openStepId) {
      return;
    }

    const parentBlock = sessionStepEditBlocks.find(
      (block) =>
        block.kind === "single" &&
        block.linkedRestEntry?.step.id === openStepId &&
        block.entry.step.id !== openStepId
    );

    if (parentBlock?.kind === "single") {
      setOpenStepId(parentBlock.entry.step.id);
    }
  }, [openStepId, sessionStepEditBlocks, useManualLikeStepSummaries]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (typeof window.matchMedia !== "function") {
      setDesktopCardEditEnabled(true);
      return;
    }

    const mediaQueryList = window.matchMedia(DESKTOP_CARD_EDIT_MEDIA_QUERY);
    const syncDesktopCardEdit = () => {
      setDesktopCardEditEnabled(mediaQueryList.matches);
    };

    syncDesktopCardEdit();

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", syncDesktopCardEdit);
      return () => {
        mediaQueryList.removeEventListener("change", syncDesktopCardEdit);
      };
    }

    mediaQueryList.addListener(syncDesktopCardEdit);
    return () => {
      mediaQueryList.removeListener(syncDesktopCardEdit);
    };
  }, []);

  useEffect(() => {
    if (!pendingCustomDistanceFocusStepId) {
      return;
    }

    if (!draft.steps.some((step) => step.id === pendingCustomDistanceFocusStepId)) {
      setPendingCustomDistanceFocusStepId(null);
      return;
    }

    const targetInput = customDistanceInputRefs.current[pendingCustomDistanceFocusStepId];

    if (!targetInput) {
      return;
    }

    targetInput.focus();
    targetInput.select();
    setPendingCustomDistanceFocusStepId(null);
  }, [draft.steps, openStepId, pendingCustomDistanceFocusStepId]);

  useEffect(() => {
    if (
      openRepeatGroupId &&
      !stepGroups.some(
        (group) => group.kind === "repeat" && group.repeatGroupId === openRepeatGroupId
      )
    ) {
      setOpenRepeatGroupId(null);
    }
  }, [openRepeatGroupId, stepGroups]);

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
    if (!isManualPoolMode) {
      return;
    }

    const validRepeatGroupIds = new Set(
      stepGroups
        .filter(
          (group): group is Extract<StepRenderGroup, { kind: "repeat" }> => group.kind === "repeat"
        )
        .map((group) => group.repeatGroupId)
    );

    setRepeatConflictKeepBoth((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([repeatGroupId]) => validRepeatGroupIds.has(repeatGroupId))
      );
      const currentEntries = Object.entries(current);
      const nextEntries = Object.entries(next);

      if (
        currentEntries.length === nextEntries.length &&
        currentEntries.every(([key, value]) => next[key] === value)
      ) {
        return current;
      }

      return next;
    });

    setRepeatConflictPendingReplacement((current) =>
      current && validRepeatGroupIds.has(current) ? current : null
    );
  }, [isManualPoolMode, stepGroups]);

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
    if (isEditMode) return;

    setOpenStepId(null);
    setOpenRepeatGroupId(null);
    setOpenMobileActionKey(null);
    setMetadataOpen(false);
  }, [isEditMode]);

  useEffect(() => {
    setManualPoolTitleEdited(false);
  }, [savedWorkoutId, savedWorkout?.updatedAt]);

  useEffect(() => {
    if (!pendingRemoval) return;

    if (
      pendingRemoval.kind === "step" &&
      !pendingRemoval.stepIds.some((stepId) => draft.steps.some((step) => step.id === stepId))
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
      const previousStepsById = new Map(draft.steps.map((step) => [step.id, step]));
      const nextSteps = isManualPoolMode
        ? nextDraft.steps.map((step) =>
            syncManualPoolEditableStep(step, nextDraft.basePaceSecondsPer100m, nextPoolLengthUnit, {
              summaryUnit: didManualPoolSummaryUnitInputsChange(
                previousStepsById.get(step.id),
                step
              )
                ? nextPoolLengthUnit
                : resolveManualPoolSummaryUnit(
                    previousStepsById.get(step.id) ?? step,
                    nextPoolLengthUnit
                  ),
            })
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
    [draft.steps, isManualPoolMode]
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

  useEffect(() => {
    return () => {
      if (movedHighlightTimeoutRef.current) {
        clearTimeout(movedHighlightTimeoutRef.current);
      }
    };
  }, []);

  function markBlockMoved(blockKey: string, label: string, direction: -1 | 1) {
    if (movedHighlightTimeoutRef.current) {
      clearTimeout(movedHighlightTimeoutRef.current);
    }

    setRecentlyMovedBlockKey(blockKey);
    setRearrangeLiveMessage(`Moved ${label} ${direction === -1 ? "up" : "down"}.`);
    movedHighlightTimeoutRef.current = setTimeout(() => {
      setRecentlyMovedBlockKey(null);
    }, 1500);
  }

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

  function moveDraftGroup(groupIndex: number, direction: -1 | 1, movedLabel?: string) {
    const nextGroupIndex = groupIndex + direction;
    if (groupIndex < 0 || nextGroupIndex < 0 || nextGroupIndex >= stepGroups.length) return;

    const nextGroups = [...stepGroups];
    const [group] = nextGroups.splice(groupIndex, 1);
    if (!group) return;
    nextGroups.splice(nextGroupIndex, 0, group);
    const movedBlockKey =
      group.kind === "repeat"
        ? `repeat:${group.repeatGroupId}`
        : `step:${group.entries[0]?.step.id ?? groupIndex}`;
    const movedBlockLabel =
      movedLabel ??
      (group.kind === "repeat"
        ? "repeat block"
        : getSessionStepCategoryLabel(group.entries[0]?.step.category ?? "main"));

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
    markBlockMoved(movedBlockKey, movedBlockLabel, direction);
  }

  function findSessionStepSingleBlockByStepId(
    stepId: string
  ): Extract<SessionStepEditBlock, { kind: "single" }> | null {
    const block =
      sessionStepEditBlocks.find((block) => {
        if (block.kind !== "single") return false;
        return block.entry.step.id === stepId || block.linkedRestEntry?.step.id === stepId;
      }) ?? null;

    return block?.kind === "single" ? block : null;
  }

  function moveSessionStepSingleBlock(stepId: string, direction: -1 | 1) {
    const sourceBlock = findSessionStepSingleBlockByStepId(stepId);
    if (!sourceBlock) return;

    const sourceBlockIndex = sessionStepEditBlocks.findIndex(
      (block) => block.key === sourceBlock.key
    );
    const targetBlockIndex = sourceBlockIndex + direction;
    if (
      sourceBlockIndex < 0 ||
      targetBlockIndex < 0 ||
      targetBlockIndex >= sessionStepEditBlocks.length
    ) {
      return;
    }

    const nextBlocks = [...sessionStepEditBlocks];
    const [movedBlock] = nextBlocks.splice(sourceBlockIndex, 1);
    if (!movedBlock) return;
    nextBlocks.splice(targetBlockIndex, 0, movedBlock);
    const movedLabel = getSessionStepCategoryLabel(sourceBlock.entry.step.category);

    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: nextBlocks.flatMap((block) => block.steps),
      })
    );
    markBlockMoved(sourceBlock.key, movedLabel, direction);
  }

  function insertStepAfterManualPoolSingleBlock(stepId: string) {
    const sourceBlock = findSessionStepSingleBlockByStepId(stepId);
    if (!sourceBlock) return;
    insertStepAt(sourceBlock.endIndex + 1);
  }

  function buildDuplicatedManualPoolSingleBlockSteps(
    block: Extract<SessionStepEditBlock, { kind: "single" }>
  ) {
    const primaryStep = block.entry.step;
    const duplicatedPrimary: SessionDraftStep = {
      ...primaryStep,
      id: buildStepId(draft.steps.length + 1),
    };

    const duplicatedLinkedRest = block.linkedRestEntry
      ? {
          ...block.linkedRestEntry.step,
          id: buildStepId(draft.steps.length + 2),
        }
      : null;

    return duplicatedLinkedRest ? [duplicatedPrimary, duplicatedLinkedRest] : [duplicatedPrimary];
  }

  function duplicateManualPoolSingleBlock(stepId: string) {
    const sourceBlock = findSessionStepSingleBlockByStepId(stepId);
    if (!sourceBlock || sourceBlock.kind !== "single") return;

    const duplicatedSteps = buildDuplicatedManualPoolSingleBlockSteps(sourceBlock);
    const nextSteps = [...draft.steps];
    nextSteps.splice(sourceBlock.endIndex + 1, 0, ...duplicatedSteps);

    setPendingRemoval(null);
    setLastRemovedBlock(null);
    setOpenRepeatGroupId(null);
    setOpenStepId(duplicatedSteps[0]?.id ?? null);
    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: nextSteps,
      })
    );
  }

  function insertAttachedRestAfterStep(stepId: string) {
    const sourceBlock = findSessionStepSingleBlockByStepId(stepId);
    if (!sourceBlock || sourceBlock.kind !== "single" || sourceBlock.linkedRestEntry) {
      return;
    }

    const nextSteps = [...draft.steps];
    nextSteps.splice(sourceBlock.entry.index + 1, 0, buildAutoRestStep(draft.steps.length + 1));
    setPendingRemoval(null);
    setLastRemovedBlock(null);
    setOpenRepeatGroupId(null);
    setOpenStepId(sourceBlock.entry.step.id);
    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: nextSteps,
      })
    );
  }

  function removeAttachedRestStep(restStepId: string, parentStepId: string) {
    const nextSteps = draft.steps.filter((step) => step.id !== restStepId);

    setPendingRemoval(null);
    setLastRemovedBlock(null);
    if (openStepId === restStepId) {
      setOpenStepId(parentStepId);
    }
    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: nextSteps,
      })
    );
  }

  function removeRepeatPostSetRestStep(repeatGroupId: string) {
    const nextSteps = draft.steps.filter(
      (step) => step.postSetRestForRepeatGroupId !== repeatGroupId
    );
    const removedPostSetRest = draft.steps.find(
      (step) => step.postSetRestForRepeatGroupId === repeatGroupId
    );

    setRepeatConflictPendingReplacement(null);
    setRepeatConflictKeepBoth((current) => {
      const next = { ...current };
      delete next[repeatGroupId];
      return next;
    });
    if (removedPostSetRest && openStepId === removedPostSetRest.id) {
      setOpenStepId(null);
      setOpenRepeatGroupId(repeatGroupId);
    }
    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: nextSteps,
      })
    );
  }

  function openTargetedStepEditor(stepId: string) {
    const targetStep = draft.steps.find((step) => step.id === stepId);
    if (!targetStep) return;

    const sessionStepParentBlock = useManualLikeStepSummaries
      ? findSessionStepSingleBlockByStepId(stepId)
      : null;
    const targetOpenStepId =
      sessionStepParentBlock?.kind === "single" ? sessionStepParentBlock.entry.step.id : stepId;

    setBuilderViewMode("edit");
    setMetadataOpen(false);
    setPendingRemoval(null);
    setLastRemovedBlock(null);
    setOpenMobileActionKey(null);
    setOpenRepeatGroupId(targetStep.repeatGroupId ?? null);
    setOpenStepId(targetOpenStepId);
  }

  function openTargetedRepeatEditor(repeatGroupId: string) {
    const hasRepeatGroup = draft.steps.some((step) => step.repeatGroupId === repeatGroupId);
    if (!hasRepeatGroup) return;

    setBuilderViewMode("edit");
    setMetadataOpen(false);
    setPendingRemoval(null);
    setLastRemovedBlock(null);
    setOpenMobileActionKey(null);
    setOpenRepeatGroupId(repeatGroupId);
    setOpenStepId(null);
  }

  function toggleRepeatEditor(repeatGroupId: string) {
    setOpenMobileActionKey(null);
    setOpenRepeatGroupId((current) => {
      const nextOpen = current === repeatGroupId ? null : repeatGroupId;

      if (nextOpen === null) {
        setOpenStepId((currentOpenStepId) => {
          if (!currentOpenStepId) return null;
          const openStep = draft.steps.find((step) => step.id === currentOpenStepId);
          return openStep?.repeatGroupId === repeatGroupId ? null : currentOpenStepId;
        });
      }

      return nextOpen;
    });
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
    setOpenRepeatGroupId(nextStep.repeatGroupId ?? null);
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
    setOpenRepeatGroupId(nextSteps[0]?.repeatGroupId ?? null);
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
        : {},
      {
        autoCreateStandaloneRest: !sourceStep.repeatGroupId,
      }
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
    setOpenRepeatGroupId(sourceStep.repeatGroupId ?? null);
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
    setOpenRepeatGroupId(nextRepeatGroupId);
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
    const sessionStepBlock = useManualLikeStepSummaries
      ? findSessionStepSingleBlockByStepId(stepId)
      : null;
    const stepIds =
      sessionStepBlock?.kind === "single"
        ? sessionStepBlock.steps.map((blockStep) => blockStep.id)
        : [stepId];
    const label =
      sessionStepBlock?.kind === "single" && sessionStepBlock.linkedRestEntry
        ? `${buildStepRemovalLabel(step, stepIndex, {
            isManualPoolMode,
            basePaceSecondsPer100m: draft.basePaceSecondsPer100m,
            poolLengthUnit,
          })} and attached rest`
        : buildStepRemovalLabel(step, stepIndex, {
            isManualPoolMode,
            basePaceSecondsPer100m: draft.basePaceSecondsPer100m,
            poolLengthUnit,
          });

    setLastRemovedBlock(null);
    setPendingRemoval({
      kind: "step",
      stepId,
      stepIds,
      label,
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
      const removeIndex = draft.steps.findIndex((step) => pendingRemoval.stepIds.includes(step.id));
      if (removeIndex === -1) {
        setPendingRemoval(null);
        return;
      }

      const removedSteps = draft.steps.filter((step) => pendingRemoval.stepIds.includes(step.id));
      const nextSteps = draft.steps.filter((step) => !pendingRemoval.stepIds.includes(step.id));
      const removedOpenStep = Boolean(openStepId && pendingRemoval.stepIds.includes(openStepId));
      const restoreOpenStepId = removedOpenStep ? pendingRemoval.stepId : openStepId;
      const primaryRemovedStep =
        removedSteps.find((step) => step.id === pendingRemoval.stepId) ?? removedSteps[0];

      setPendingRemoval(null);
      setLastRemovedBlock({
        kind: "step",
        label: pendingRemoval.label,
        steps: removedSteps,
        insertIndex: removeIndex,
        restoreOpenStepId,
        restoreOpenRepeatGroupId:
          removedOpenStep && primaryRemovedStep?.repeatGroupId
            ? primaryRemovedStep.repeatGroupId
            : openRepeatGroupId,
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
      restoreOpenRepeatGroupId:
        removedSteps[0]?.repeatGroupId === pendingRemoval.repeatGroupId ||
        openRepeatGroupId === pendingRemoval.repeatGroupId
          ? pendingRemoval.repeatGroupId
          : openRepeatGroupId,
    });
    if (removedOpenStep) {
      setOpenStepId(null);
    }
    if (openRepeatGroupId === pendingRemoval.repeatGroupId) {
      setOpenRepeatGroupId(null);
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
    setOpenRepeatGroupId(lastRemovedBlock.restoreOpenRepeatGroupId);
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
    if (value !== "use_last_rest") {
      setRepeatConflictPendingReplacement((current) =>
        current === repeatGroupId ? null : current
      );
      setRepeatConflictKeepBoth((current) => {
        if (!(repeatGroupId in current)) {
          return current;
        }

        const next = { ...current };
        delete next[repeatGroupId];
        return next;
      });
    }

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

  function updateStepDistanceSelection(
    stepId: string,
    value: string,
    unitOverride?: SessionDraftPoolLengthUnit
  ) {
    const editorUnit = unitOverride ?? poolLengthUnit;

    setPendingCustomDistanceFocusStepId(value === CUSTOM_DISTANCE_VALUE ? stepId : null);

    updateDraftStep(stepId, (current) => ({
      ...current,
      distanceM:
        value === CUSTOM_DISTANCE_VALUE
          ? SESSION_DRAFT_STEP_DISTANCE_PRESETS.some((preset) =>
              isDistanceQuickChoiceSelected(current.distanceM, preset, editorUnit)
            )
            ? null
            : current.distanceM
          : convertPoolUnitValueToMeters(Number.parseFloat(value), editorUnit),
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
    if (nextUnit === poolLengthUnit) {
      return;
    }

    const nextPoolLength = convertPoolUnitValueToMeters(
      getDefaultPoolLengthQuickChoice(nextUnit),
      nextUnit
    );
    setPoolLengthInput(formatEditablePoolLength(nextPoolLength, nextUnit));
    onDraftChange(
      syncDraftSelections({
        ...draft,
        poolLengthUnit: nextUnit,
        poolLengthM: nextPoolLength,
      })
    );
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

      if (variant === "poolside") {
        const previewId = createWorkoutPoolsidePreviewId();
        writeStoredWorkoutPoolsidePreviewDraft(previewId, {
          draft,
          draftState: handoffDraftState,
          focusPoints: selectedPoolsideFocusPoints,
          swimmerName: swimmerName ?? null,
        });
        const previewHref = buildWorkoutPoolsidePreviewHref(
          `/my-library/workouts/poolside-preview?previewId=${encodeURIComponent(previewId)}`
        );
        const previewWindow = window.open(previewHref, "_blank", "noopener,noreferrer");

        if (!previewWindow) {
          throw new Error("Popup blocked.");
        }

        previewWindow.focus?.();
        setWorkoutPdfNotice(
          `Opened Print Preview for ${workoutPoolsidePdfFileName}. Finish layout and print settings in that tab.`
        );
        return;
      }

      const printWindow = window.open("", "_blank");

      if (!printWindow?.document) {
        throw new Error("Popup blocked.");
      }

      printWindow.document.open();
      printWindow.document.write(workoutPdfHtml);
      printWindow.document.close();
      printWindow.focus?.();
      setWorkoutPdfNotice(
        `Opened PDF for ${workoutPdfFileName}. Use Print / Save PDF in that tab.`
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
      linkedTopLevelRestEntry?: StepRenderEntry | null;
      pendingInlineDelete?: boolean;
    }
  ) {
    const insideRepeatGroup = options?.insideRepeatGroup ?? false;
    const isLinkedPostSetRest = options?.isLinkedPostSetRest ?? false;
    const isOpen = isEditMode && openStepId === step.id;
    const panelId = `session-draft-step-panel-${step.id}`;
    const normalizedStep = isManualPoolMode ? normalizeManualPoolStepForEditor(step) : step;
    const isGeneratorSummaryCard = copyVariant === "generator";
    const useManualLikeTopLevelCard =
      (isManualPoolMode || isGeneratorSummaryCard) && !insideRepeatGroup && !isLinkedPostSetRest;
    const topLevelDescriptor = useManualLikeTopLevelCard
      ? (manualPoolTopLevelSectionDescriptors[groupIndex] ?? null)
      : null;
    const linkedTopLevelRestEntry =
      useManualLikeTopLevelCard && !insideRepeatGroup
        ? (options?.linkedTopLevelRestEntry ?? null)
        : null;
    const linkedTopLevelRestStep = linkedTopLevelRestEntry?.step ?? null;
    const sessionStepEditBlock = useManualLikeStepSummaries
      ? findSessionStepSingleBlockByStepId(step.id)
      : null;
    const sessionStepBlockIndex = sessionStepEditBlock
      ? sessionStepEditBlocks.findIndex((block) => block.key === sessionStepEditBlock.key)
      : -1;
    const isTopLevelSessionStepBlock =
      useManualLikeStepSummaries &&
      !insideRepeatGroup &&
      !isLinkedPostSetRest &&
      sessionStepEditBlock?.kind === "single";
    const stepLabel =
      options?.labelOverride ??
      (insideRepeatGroup
        ? step.category === "rest"
          ? `Repeat rest step ${options?.repeatStepNumber ?? 1}`
          : `Repeat step ${options?.repeatStepNumber ?? 1}`
        : isManualPoolMode
          ? (topLevelDescriptor?.label ?? getSessionStepCategoryLabel(normalizedStep.category))
          : isGeneratorSummaryCard && topLevelDescriptor
            ? topLevelDescriptor.label
            : `Step ${index + 1}`);
    const stepDistanceUnit = isManualPoolMode
      ? resolveManualPoolSummaryUnit(normalizedStep, poolLengthUnit)
      : poolLengthUnit;
    const selectedDistancePreset = SESSION_DRAFT_STEP_DISTANCE_PRESETS.find((value) =>
      isDistanceQuickChoiceSelected(normalizedStep.distanceM, value, stepDistanceUnit)
    );
    const isMinimalRestEditor = isManualPoolMode && normalizedStep.category === "rest";
    const isRestStepCard = normalizedStep.category === "rest";
    const linkedManualPoolTitleParts =
      isManualPoolMode && !isRestStepCard && linkedTopLevelRestStep
        ? buildManualPoolViewLineParts(
            normalizedStep,
            draft.basePaceSecondsPer100m,
            poolLengthUnit,
            linkedTopLevelRestStep
          )
        : null;
    const stepTitle = isManualPoolMode
      ? linkedManualPoolTitleParts
        ? [linkedManualPoolTitleParts.primaryText, linkedManualPoolTitleParts.secondaryText]
            .filter(Boolean)
            .join(" · ")
        : buildManualPoolDisplaySummary(
            normalizedStep,
            draft.basePaceSecondsPer100m,
            poolLengthUnit
          )
      : isGeneratorSummaryCard
        ? [
            buildStepSummary(step, draft.basePaceSecondsPer100m, draft.environment, poolLengthUnit),
            linkedTopLevelRestStep
              ? `Rest ${buildGeneratedSessionRestValueSummary(
                  linkedTopLevelRestStep,
                  draft.basePaceSecondsPer100m,
                  draft.environment,
                  poolLengthUnit
                )}`
              : null,
          ]
            .filter(Boolean)
            .join(" · ")
        : step.name || getSessionStepCategoryLabel(step.category);
    const mobileActionKey = `step:${step.id}`;
    const mobileActionsOpen = openMobileActionKey === mobileActionKey;
    const showMobilePrimaryAddAfter = isEditMode && isOpen && !isLinkedPostSetRest;
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
    const pendingDelete =
      options?.pendingInlineDelete === true ||
      (pendingRemoval?.kind === "step" && pendingRemoval.stepIds.includes(step.id));
    const topLevelCategoryLabelClass =
      useManualLikeTopLevelCard && !pendingDelete
        ? getManualPoolCategoryLabelClass(normalizedStep.category)
        : "text-slate-500";
    const stepNotes = isManualPoolMode && isRestStepCard ? "" : step.notes;
    const showManualPoolDrillNameField =
      isManualPoolMode && !isMinimalRestEditor && isManualPoolDrillNameRelevantStep(normalizedStep);
    const manualPoolDrillNameHelpId = `session-draft-step-drill-name-help-${step.id}`;
    const stepSummary = {
      label: stepLabel,
      title: stepTitle,
      labelClassName: topLevelCategoryLabelClass,
      categoryLabel:
        !isManualPoolMode && !isGeneratorSummaryCard
          ? getSessionStepCategoryLabel(step.category)
          : null,
      description:
        options?.descriptionOverride ??
        (!isManualPoolMode && !isGeneratorSummaryCard
          ? buildStepSummary(step, draft.basePaceSecondsPer100m, draft.environment, poolLengthUnit)
          : null),
      targetSummary: !isManualPoolMode && !isGeneratorSummaryCard ? step.targetSummary : null,
      pendingDelete,
      notes: !isGeneratorSummaryCard ? stepNotes : null,
    };
    const isTerminalSessionStepBlock =
      isTopLevelSessionStepBlock && sessionStepBlockIndex === sessionStepEditBlocks.length - 1;
    const moveUpDisabled = isTopLevelSessionStepBlock
      ? sessionStepBlockIndex <= 0
      : groupIndex === 0;
    const moveDownDisabled = isTopLevelSessionStepBlock
      ? sessionStepBlockIndex === -1 || sessionStepBlockIndex >= sessionStepEditBlocks.length - 1
      : groupIndex === stepGroups.length - 1;
    const handleMoveUp = () => {
      if (isTopLevelSessionStepBlock) {
        moveSessionStepSingleBlock(step.id, -1);
      } else {
        moveDraftGroup(groupIndex, -1);
      }
      setOpenMobileActionKey(null);
    };
    const handleMoveDown = () => {
      if (isTopLevelSessionStepBlock) {
        moveSessionStepSingleBlock(step.id, 1);
      } else {
        moveDraftGroup(groupIndex, 1);
      }
      setOpenMobileActionKey(null);
    };
    const handleAddStepAfter = () => {
      if (isTopLevelSessionStepBlock) {
        insertStepAfterManualPoolSingleBlock(step.id);
      } else {
        insertStepAfterStep(step.id);
      }
      setOpenMobileActionKey(null);
    };
    const handleAddRepeatAfter = () => {
      if (isTopLevelSessionStepBlock && sessionStepEditBlock) {
        insertRepeatAt(sessionStepEditBlock.endIndex + 1);
      } else {
        insertRepeatAfterGroup(groupIndex);
      }
      setOpenMobileActionKey(null);
    };
    const handleDuplicate = () => {
      if (isTopLevelSessionStepBlock) {
        duplicateManualPoolSingleBlock(step.id);
      } else {
        duplicateStep(step.id);
      }
      setOpenMobileActionKey(null);
    };
    const restStepDurationModeValue = linkedTopLevelRestStep
      ? normalizeManualPoolStepForEditor(linkedTopLevelRestStep).durationMode
      : null;
    const attachedRestEditor =
      isTopLevelSessionStepBlock && !isRestStepCard ? (
        <div
          data-testid={`session-draft-step-linked-rest-panel-${index}`}
          className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 md:col-span-2"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">Rest</p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {linkedTopLevelRestStep
                  ? buildManualPoolDisplaySummary(
                      linkedTopLevelRestStep,
                      draft.basePaceSecondsPer100m,
                      poolLengthUnit
                    )
                  : "No rest after this step."}
              </p>
              {!linkedTopLevelRestStep && isTerminalSessionStepBlock ? (
                <p className="mt-1 text-xs text-slate-500">
                  Leave it empty when this block ends the session.
                </p>
              ) : null}
            </div>
            {linkedTopLevelRestStep ? (
              <button
                type="button"
                onClick={() => removeAttachedRestStep(linkedTopLevelRestStep.id, step.id)}
                data-testid={`session-draft-step-linked-rest-remove-${index}`}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
              >
                Remove rest
              </button>
            ) : (
              <button
                type="button"
                onClick={() => insertAttachedRestAfterStep(step.id)}
                data-testid={`session-draft-step-linked-rest-add-${index}`}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm font-medium text-blue-800 transition hover:bg-blue-100"
              >
                Add rest
              </button>
            )}
          </div>

          {linkedTopLevelRestStep ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-700">
                Rest mode
                <select
                  value={restStepDurationModeValue ?? "fixed_rest"}
                  onChange={(event) =>
                    updateDraftStep(linkedTopLevelRestStep.id, (current) =>
                      applyStepDurationModeDefaults(
                        current,
                        event.target.value as SessionDraftStepDurationMode
                      )
                    )
                  }
                  data-testid={`session-draft-step-linked-rest-duration-mode-${index}`}
                  className="mt-2 block h-11 w-full rounded-xl border border-blue-200 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {MANUAL_POOL_REST_DURATION_MODES.map((value) => (
                    <option key={value} value={value}>
                      {getStepDurationModeEditorLabel(value, true)}
                    </option>
                  ))}
                </select>
              </label>

              {restStepDurationModeValue === "fixed_rest" ||
              restStepDurationModeValue === "send_off" ? (
                <label className="text-sm text-slate-700">
                  {restStepDurationModeValue === "send_off" ? "Send-off time" : "Rest time"}
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM:SS"
                    value={timeDurationInputs[linkedTopLevelRestStep.id] ?? ""}
                    onFocus={() => {
                      timeDurationInputFocusRef.current[linkedTopLevelRestStep.id] = true;
                    }}
                    onBlur={() => {
                      commitTimeDurationInput(linkedTopLevelRestStep.id);
                    }}
                    onChange={(event) =>
                      handleTimeDurationInputChange(linkedTopLevelRestStep.id, event.target.value)
                    }
                    data-testid={`session-draft-step-linked-rest-time-${index}`}
                    className="mt-2 block h-11 w-full rounded-xl border border-blue-200 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
              ) : null}

              {restStepDurationModeValue === "css_send_off" ? (
                <label className="text-sm text-slate-700 md:col-span-2">
                  CSS send-off offset
                  <select
                    value={String(linkedTopLevelRestStep.cssSendOffOffsetSeconds ?? 0)}
                    onChange={(event) =>
                      updateDraftStep(linkedTopLevelRestStep.id, (current) => ({
                        ...current,
                        cssSendOffOffsetSeconds: Number.parseInt(event.target.value, 10),
                      }))
                    }
                    data-testid={`session-draft-step-linked-rest-css-offset-${index}`}
                    className="mt-2 block h-11 w-full rounded-xl border border-blue-200 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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

              <label className="text-sm text-slate-700 md:col-span-2">
                Rest notes
                <AutoGrowingTextarea
                  aria-label="Rest notes"
                  value={linkedTopLevelRestStep.notes}
                  onChange={(event) =>
                    updateDraftStep(linkedTopLevelRestStep.id, (current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  minRows={1}
                  className="mt-2 block w-full resize-y rounded-xl border border-blue-200 bg-white px-3 py-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            </div>
          ) : null}
        </div>
      ) : null;
    const showRearrangeControls = isRearrangeMode && !insideRepeatGroup && !isLinkedPostSetRest;
    const canUseDesktopCardOpen = desktopCardEditEnabled && isEditMode && !isOpen;
    const stepMoveHighlightKey = isTopLevelSessionStepBlock
      ? (sessionStepEditBlock?.key ?? `step:${step.id}`)
      : `step:${step.id}`;
    const stepWasRecentlyMoved = recentlyMovedBlockKey === stepMoveHighlightKey;
    const topLevelCategoryRailClass =
      !pendingDelete && useManualLikeTopLevelCard
        ? `border-l-4 ${getManualPoolCategoryRailClass(normalizedStep.category)}`
        : "";
    const cardStateClass = pendingDelete
      ? "border-dashed border-rose-300 bg-rose-50/70 ring-1 ring-rose-100"
      : isOpen
        ? isRestStepCard
          ? "border-blue-300 bg-blue-50/70 shadow-sm ring-1 ring-blue-100"
          : "border-blue-300 bg-white shadow-sm ring-1 ring-blue-100"
        : isRestStepCard
          ? "border-blue-100 bg-blue-50/55"
          : insideRepeatGroup
            ? "border-blue-200 bg-white"
            : useManualLikeTopLevelCard
              ? "border-blue-100 bg-white ring-1 ring-blue-100/70"
              : "border-slate-200 bg-slate-50/70";
    const openStepCard = () => {
      setOpenMobileActionKey(null);
      setOpenStepId(step.id);
      if (insideRepeatGroup && normalizedStep.repeatGroupId) {
        setOpenRepeatGroupId(normalizedStep.repeatGroupId);
      }
    };
    const toggleStepCard = () => {
      setOpenMobileActionKey(null);
      setOpenStepId((current) => (current === step.id ? null : step.id));
      if (insideRepeatGroup && normalizedStep.repeatGroupId) {
        setOpenRepeatGroupId(normalizedStep.repeatGroupId);
      }
    };
    const toggleMobileStepActions = () =>
      setOpenMobileActionKey((current) => (current === mobileActionKey ? null : mobileActionKey));
    const requestRemoveStep = () => {
      requestStepRemoval(step.id);
      setOpenMobileActionKey(null);
    };
    const editPanel = isOpen ? (
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
              className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
            className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              {SESSION_DRAFT_STEP_DRILL_TYPES.map((value) => (
                <option key={value} value={value}>
                  {getSessionStepDrillTypeLabel(value)}
                </option>
              ))}
            </select>
          </label>
        )}

        {showManualPoolDrillNameField ? (
          <div className="text-sm text-slate-700">
            <label htmlFor={`session-draft-step-drill-name-${step.id}`}>Drill name</label>
            <input
              id={`session-draft-step-drill-name-${step.id}`}
              type="text"
              value={getManualPoolDrillNameInputValue(normalizedStep)}
              onChange={(event) =>
                updateDraftStep(step.id, (current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              aria-describedby={manualPoolDrillNameHelpId}
              placeholder="Catch drill"
              data-testid={`session-draft-step-drill-name-${index}`}
              className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <p id={manualPoolDrillNameHelpId} className="mt-2 text-sm text-slate-500">
              Names the drill. Use Notes for execution cues.
            </p>
          </div>
        ) : null}

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
              className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              updateStepDurationMode(step.id, event.target.value as SessionDraftStepDurationMode)
            }
            data-testid={`session-draft-step-duration-mode-${index}`}
            className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4 md:col-span-2 md:grid-cols-2">
            <label className="text-sm text-slate-700">
              Distance
              <select
                value={
                  selectedDistancePreset ? String(selectedDistancePreset) : CUSTOM_DISTANCE_VALUE
                }
                onChange={(event) =>
                  updateStepDistanceSelection(step.id, event.target.value, stepDistanceUnit)
                }
                data-testid={`session-draft-step-distance-${index}`}
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {SESSION_DRAFT_STEP_DISTANCE_PRESETS.map((value) => (
                  <option key={value} value={String(value)}>
                    {stepDistanceUnit === "yd" ? `${value}yd` : formatDistanceMetersLabel(value)}
                  </option>
                ))}
                <option value={CUSTOM_DISTANCE_VALUE}>Custom distance</option>
              </select>
            </label>
            {!selectedDistancePreset ? (
              <label className="text-sm text-slate-700">
                {`Custom distance (${stepDistanceUnit})`}
                <input
                  ref={(node) => {
                    customDistanceInputRefs.current[step.id] = node;
                  }}
                  type="text"
                  inputMode="decimal"
                  value={formatEditableDistance(step.distanceM, stepDistanceUnit)}
                  onChange={(event) =>
                    updateDraftStep(step.id, (current) => ({
                      ...current,
                      distanceM: parseDistanceInput(event.target.value, stepDistanceUnit),
                    }))
                  }
                  data-testid={`session-draft-step-distance-custom-${index}`}
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            ) : null}
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
              className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              value={isManualPoolMode ? (timeDurationInputs[step.id] ?? "") : (step.timeMin ?? "")}
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
              className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                    event.target.value === "target_pace" ? current.targetPaceSecondsPer100m : null,
                  cssTargetOffsetSeconds:
                    event.target.value === "css_target_pace"
                      ? (current.cssTargetOffsetSeconds ?? 0)
                      : null,
                }))
              }
              data-testid={`session-draft-step-target-mode-${index}`}
              className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                onChange={(event) => updateStepTargetPace(step.id, "minutes", event.target.value)}
                data-testid={`session-draft-step-target-pace-minutes-${index}`}
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <label className="text-sm text-slate-700">
              Pace seconds
              <input
                type="text"
                inputMode="numeric"
                value={getPaceSeconds(step.targetPaceSecondsPer100m)}
                onChange={(event) => updateStepTargetPace(step.id, "seconds", event.target.value)}
                data-testid={`session-draft-step-target-pace-seconds-${index}`}
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
            className="mt-2 block w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </label>

        {attachedRestEditor}

        {isEditMode ? (
          <div
            data-testid={`session-draft-step-desktop-actions-${index}`}
            data-desktop-layout="bottom"
            className="hidden flex-wrap items-center gap-2 border-t border-slate-200 pt-3 sm:flex md:col-span-2"
          >
            {isLinkedPostSetRest ? null : (
              <button
                type="button"
                onClick={handleAddStepAfter}
                data-testid={`session-draft-step-add-after-${index}`}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-800 transition hover:bg-blue-50"
              >
                Add step after
              </button>
            )}
            {!insideRepeatGroup && !isLinkedPostSetRest ? (
              <button
                type="button"
                onClick={handleAddRepeatAfter}
                data-testid={`session-draft-step-add-repeat-after-${index}`}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-800 transition hover:bg-blue-50"
              >
                Add repeat after
              </button>
            ) : null}
            {isLinkedPostSetRest ? null : (
              <button
                type="button"
                onClick={handleDuplicate}
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
            <button
              type="button"
              onClick={() => setOpenStepId(null)}
              data-testid={`session-draft-step-done-bottom-${index}`}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-800 transition hover:bg-blue-100 sm:ml-auto"
            >
              Done
            </button>
          </div>
        ) : null}
      </div>
    ) : null;

    return (
      <SessionStepSummaryCard
        key={step.id}
        stepId={step.id}
        index={index}
        panelId={panelId}
        dataManualPoolCategory={
          isTopLevelSessionStepBlock && !pendingDelete ? normalizedStep.category : undefined
        }
        canUseDesktopCardOpen={canUseDesktopCardOpen}
        cardStateClass={cardStateClass}
        categoryRailClass={topLevelCategoryRailClass}
        isEditMode={isEditMode}
        isSummaryOnlyMode={isSummaryOnlyMode}
        isOpen={isOpen}
        mobileActionsOpen={mobileActionsOpen}
        pendingDelete={pendingDelete}
        removalLabel={pendingRemoval?.label ?? null}
        showRearrangeControls={showRearrangeControls}
        showMobilePrimaryAddAfter={showMobilePrimaryAddAfter}
        showMobilePrimaryAddRepeatAfter={showMobilePrimaryAddRepeatAfter}
        canAddRepeatAfter={!insideRepeatGroup && !isLinkedPostSetRest}
        isLinkedPostSetRest={isLinkedPostSetRest}
        moveUpDisabled={moveUpDisabled}
        moveDownDisabled={moveDownDisabled}
        wasRecentlyMoved={stepWasRecentlyMoved}
        summary={stepSummary}
        editPanel={editPanel}
        onOpen={openStepCard}
        onToggle={toggleStepCard}
        onToggleMobileActions={toggleMobileStepActions}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onAddStepAfter={handleAddStepAfter}
        onAddRepeatAfter={handleAddRepeatAfter}
        onDuplicate={handleDuplicate}
        onRequestRemove={requestRemoveStep}
        onConfirmRemoval={confirmPendingRemoval}
        onCancelRemoval={cancelPendingRemoval}
      />
    );
  }

  function renderRepeatSummaryCard(
    group: Extract<StepRenderGroup, { kind: "repeat" }>,
    groupIndex: number
  ) {
    const pendingRepeatDelete =
      pendingRemoval?.kind === "repeat" && pendingRemoval.repeatGroupId === group.repeatGroupId;
    const repeatSummary = buildRepeatSummary(
      group.entries,
      group.repeatCount,
      draft.basePaceSecondsPer100m,
      group.repeatEndingRestMode,
      poolLengthUnit,
      group.postSetRestEntry?.step ?? null
    );
    const repeatDescriptor = useManualLikeStepSummaries
      ? (manualPoolTopLevelSectionDescriptors[groupIndex] ?? null)
      : null;
    const repeatCategory = useManualLikeStepSummaries
      ? getWorkoutEditorTopLevelCategory(group, {
          normalizeForManualPool: isManualPoolMode,
        })
      : "main";
    const repeatLabelToneClass =
      useManualLikeStepSummaries && !pendingRepeatDelete
        ? getManualPoolCategoryLabelClass(repeatCategory)
        : "text-blue-700";
    const repeatLabel = useManualLikeStepSummaries
      ? (repeatDescriptor?.label ?? "Repeat")
      : "Repeat set";
    const isRepeatOpen = isEditMode && openRepeatGroupId === group.repeatGroupId;
    const hasEditableRepeatEndingRest = Boolean(
      draft.environment === "pool" &&
      (() => {
        const lastEntry = group.entries[group.entries.length - 1];
        return lastEntry && isSessionDraftRepeatEndingRestStep(lastEntry.step);
      })()
    );
    const repeatMobileActionKey = `repeat:${group.repeatGroupId}`;
    const repeatMobileActionsOpen = openMobileActionKey === repeatMobileActionKey;
    const hasRepeatRestConflict = Boolean(
      hasEditableRepeatEndingRest &&
      group.postSetRestEntry?.step &&
      group.repeatEndingRestMode === "use_last_rest"
    );
    const repeatConflictKeptBoth = repeatConflictKeepBoth[group.repeatGroupId] === true;
    const showRepeatRestConflict = hasRepeatRestConflict && !repeatConflictKeptBoth;
    const showRepeatRestReplacementConfirm =
      repeatConflictPendingReplacement === group.repeatGroupId;
    const repeatCanUseDesktopCardOpen =
      desktopCardEditEnabled && isEditMode && openRepeatGroupId !== group.repeatGroupId;
    const repeatCategoryRailClass =
      useManualLikeStepSummaries && !pendingRepeatDelete
        ? `border-l-4 ${getManualPoolCategoryRailClass(repeatCategory)}`
        : "";

    const openRepeatCard = () => {
      setOpenMobileActionKey(null);
      setOpenStepId(null);
      setOpenRepeatGroupId(group.repeatGroupId);
    };
    const toggleRepeatMobileActions = () =>
      setOpenMobileActionKey((current) =>
        current === repeatMobileActionKey ? null : repeatMobileActionKey
      );
    const addStepAfterRepeat = () => {
      insertStepAfterGroup(groupIndex);
      setOpenMobileActionKey(null);
    };
    const addRepeatAfterRepeat = () => {
      insertRepeatAfterGroup(groupIndex);
      setOpenMobileActionKey(null);
    };
    const duplicateRepeat = () => {
      duplicateRepeatGroup(group.repeatGroupId);
      setOpenMobileActionKey(null);
    };
    const requestRemoveRepeat = () => {
      requestRepeatGroupRemoval(group.repeatGroupId);
      setOpenMobileActionKey(null);
    };

    const repeatEditPanel =
      isEditMode && isRepeatOpen ? (
        <div className="mt-4 space-y-3">
          <div className={desktopRepeatControlRowClass}>
            <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-end sm:gap-2">
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
                  className="mt-2 block h-11 w-full rounded-xl border border-blue-200 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:w-28"
                />
              </label>
              {hasEditableRepeatEndingRest ? (
                <label className="text-sm text-slate-700">
                  Rest after last repeat
                  <select
                    value={group.repeatEndingRestMode}
                    onChange={(event) =>
                      updateRepeatGroupEndingRestMode(
                        group.repeatGroupId,
                        event.target.value as SessionDraftRepeatEndingRestMode
                      )
                    }
                    data-testid={`session-draft-repeat-ending-rest-mode-${groupIndex}`}
                    className="mt-2 block h-11 w-full rounded-xl border border-blue-200 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:min-w-[15rem]"
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
            {showRepeatRestConflict ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3">
                <p className="text-sm font-medium text-amber-950">
                  This creates two rests in a row.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateRepeatGroupEndingRestMode(group.repeatGroupId, "skip_last_rest")
                    }
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-amber-200 bg-white px-3 text-sm font-medium text-amber-900 transition hover:bg-amber-100"
                  >
                    Use separate rest step
                  </button>
                  <button
                    type="button"
                    onClick={() => setRepeatConflictPendingReplacement(group.repeatGroupId)}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm font-medium text-blue-800 transition hover:bg-blue-50"
                  >
                    Use repeat rest time
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRepeatConflictKeepBoth((current) => ({
                        ...current,
                        [group.repeatGroupId]: true,
                      }));
                      setRepeatConflictPendingReplacement((current) =>
                        current === group.repeatGroupId ? null : current
                      );
                    }}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Keep both
                  </button>
                </div>
                {showRepeatRestReplacementConfirm ? (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-white p-3">
                    <p className="text-sm font-medium text-rose-950">
                      Delete the separate rest step and use repeat rest time?
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => removeRepeatPostSetRestStep(group.repeatGroupId)}
                        className="inline-flex h-9 items-center justify-center rounded-xl bg-rose-600 px-3 text-sm font-semibold text-white transition hover:bg-rose-500"
                      >
                        Delete rest step
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setRepeatConflictPendingReplacement((current) =>
                            current === group.repeatGroupId ? null : current
                          )
                        }
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {group.entries.map((entry, repeatIndex) =>
            renderStepEditorCard(entry.step, entry.index, groupIndex, {
              insideRepeatGroup: true,
              repeatStepNumber: repeatIndex + 1,
              labelOverride:
                repeatIndex === 0
                  ? isManualPoolMode
                    ? (manualPoolTopLevelSectionDescriptors[groupIndex]?.label ?? "Repeat")
                    : "Work interval"
                  : entry.step.category === "rest"
                    ? isManualPoolMode
                      ? buildLinkedRestLabel(
                          manualPoolTopLevelSectionDescriptors[groupIndex]?.label ?? "Repeat",
                          "interval"
                        )
                      : "Between-interval recovery"
                    : undefined,
              descriptionOverride:
                entry.step.category === "rest" && isManualPoolMode ? null : undefined,
            })
          )}
          {group.postSetRestEntry
            ? renderStepEditorCard(
                group.postSetRestEntry.step,
                group.postSetRestEntry.index,
                groupIndex,
                {
                  labelOverride: isManualPoolMode
                    ? buildLinkedRestLabel(
                        manualPoolTopLevelSectionDescriptors[groupIndex]?.label ?? "Repeat",
                        "set"
                      )
                    : "Post-set rest",
                  descriptionOverride: null,
                  isLinkedPostSetRest: true,
                  pendingInlineDelete: repeatConflictPendingReplacement === group.repeatGroupId,
                }
              )
            : null}
          {pendingRepeatDelete ? (
            <RemovalConfirm
              label={pendingRemoval?.label ?? null}
              fallbackLabel="this repeat block"
              onConfirm={confirmPendingRemoval}
              onCancel={cancelPendingRemoval}
            />
          ) : null}
          <div
            data-testid={`session-draft-repeat-desktop-actions-${groupIndex}`}
            data-desktop-layout="bottom"
            className="hidden flex-wrap items-end gap-2 border-t border-blue-100 pt-3 sm:flex"
          >
            <button
              type="button"
              onClick={addStepAfterRepeat}
              data-testid={`session-draft-repeat-add-step-after-${groupIndex}`}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-800 transition hover:bg-blue-100"
            >
              Add step after
            </button>
            <button
              type="button"
              onClick={addRepeatAfterRepeat}
              data-testid={`session-draft-repeat-add-repeat-after-${groupIndex}`}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-800 transition hover:bg-blue-100"
            >
              Add repeat after
            </button>
            <button
              type="button"
              onClick={duplicateRepeat}
              data-testid={`session-draft-repeat-duplicate-${groupIndex}`}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-800 transition hover:bg-blue-100"
            >
              Duplicate repeat
            </button>
            <button
              type="button"
              onClick={requestRemoveRepeat}
              data-testid={`session-draft-repeat-remove-${groupIndex}`}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-sm text-rose-700 transition hover:bg-rose-50"
            >
              Delete repeat
            </button>
            <button
              type="button"
              onClick={() => toggleRepeatEditor(group.repeatGroupId)}
              data-testid={`session-draft-repeat-done-bottom-${groupIndex}`}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-800 transition hover:bg-blue-100 sm:ml-auto"
            >
              Done
            </button>
          </div>
        </div>
      ) : null;

    return (
      <SessionStepRepeatSummaryCard
        key={group.repeatGroupId}
        repeatGroupId={group.repeatGroupId}
        groupIndex={groupIndex}
        dataManualPoolCategory={
          useManualLikeStepSummaries && !pendingRepeatDelete ? repeatCategory : undefined
        }
        categoryRailClass={repeatCategoryRailClass}
        dataDesktopCardClickable={repeatCanUseDesktopCardOpen}
        pendingDelete={pendingRepeatDelete}
        isEditMode={isEditMode}
        isRearrangeMode={isRearrangeMode}
        isOpen={isRepeatOpen}
        isManualPoolMode={isManualPoolMode}
        mobileActionsOpen={repeatMobileActionsOpen}
        moveUpDisabled={groupIndex === 0}
        moveDownDisabled={groupIndex === stepGroups.length - 1}
        wasRecentlyMoved={recentlyMovedBlockKey === `repeat:${group.repeatGroupId}`}
        summary={{
          label: repeatLabel,
          title: repeatSummary,
          labelClassName: repeatLabelToneClass,
          pendingDelete: pendingRepeatDelete,
          showRepeatBlockBadge: isRepeatOpen,
        }}
        editPanel={repeatEditPanel}
        onOpen={openRepeatCard}
        onToggle={() => toggleRepeatEditor(group.repeatGroupId)}
        onToggleMobileActions={toggleRepeatMobileActions}
        onMoveUp={() => moveDraftGroup(groupIndex, -1, repeatLabel)}
        onMoveDown={() => moveDraftGroup(groupIndex, 1, repeatLabel)}
        onAddStepAfter={addStepAfterRepeat}
        onAddRepeatAfter={addRepeatAfterRepeat}
        onDuplicate={duplicateRepeat}
        onRequestRemove={requestRemoveRepeat}
      />
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
          className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
            className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
          className="mt-2 block w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </label>

      {resolvedManualBuilderMode ? null : (
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
                  className={`block h-11 w-full rounded-xl border bg-white px-3 pr-10 text-base text-slate-900 shadow-sm transition outline-none ${
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
            className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
              className={`text-xs font-semibold tracking-wide uppercase ${
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
              className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${
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
              <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                {workoutPdfHeadingLabel}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">{workoutPdfBodyCopy}</p>
              <p
                data-testid="workout-editor-pdf-source"
                data-pdf-state={handoffDraftState}
                className="mt-2 text-xs font-semibold tracking-wide text-slate-600 uppercase"
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
                aria-describedby={workoutPdfFeedback ? workoutPdfFeedbackId : undefined}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                {workoutPdfButtonLabel}
              </button>
              <button
                type="button"
                onClick={() => openWorkoutPdfPrintView("poolside")}
                data-testid="workout-editor-poolside-pdf-open"
                aria-describedby={workoutPdfFeedback ? workoutPdfFeedbackId : undefined}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-800 transition hover:bg-blue-50 active:bg-blue-100"
              >
                {workoutPoolsidePdfButtonLabel}
              </button>
            </div>
          </div>

          {renderWorkoutPdfFeedback()}
        </section>
      ) : null}

      <section className={integratedSupportSectionClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-sky-700 uppercase">
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
              className="mt-2 text-xs font-semibold tracking-wide text-slate-600 uppercase"
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
              aria-describedby={garminExportFeedback ? garminExportFeedbackId : undefined}
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

        {renderGarminExportFeedback()}

        {supportSectionOpen.garminExport ? (
          <div className={supportPreviewShellClass}>
            <pre
              data-testid="workout-editor-garmin-export-preview"
              className="max-h-[320px] overflow-auto px-4 py-4 text-xs leading-relaxed whitespace-pre-wrap text-slate-100"
            >
              {garminReadyExportPreview}
            </pre>
          </div>
        ) : null}
      </section>

      <section className={integratedSupportSectionClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Workout handoff
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              Optional text handoff for manual Garmin Connect entry, coach review, or lane-side
              notes. Copying or downloading it does not save or send the workout.
            </p>
            <p
              data-testid="workout-editor-handoff-source"
              data-handoff-state={handoffDraftState}
              className="mt-2 text-xs font-semibold tracking-wide text-slate-600 uppercase"
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
              aria-describedby={handoffFeedback ? handoffFeedbackId : undefined}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              Copy handoff
            </button>
            <button
              type="button"
              onClick={downloadWorkoutHandoff}
              data-testid="workout-editor-handoff-download"
              aria-describedby={handoffFeedback ? handoffFeedbackId : undefined}
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

        {renderHandoffFeedback()}

        {supportSectionOpen.handoff ? (
          <div className={supportPreviewShellClass}>
            <pre
              data-testid="workout-editor-handoff-preview"
              className="max-h-[320px] overflow-auto px-4 py-4 text-xs leading-relaxed whitespace-pre-wrap text-slate-100"
            >
              {handoffText}
            </pre>
          </div>
        ) : null}
      </section>

      <section className={integratedSupportSectionClass}>
        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Draft JSON</p>
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
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Status</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {savedWorkout ? "Accepted" : "Draft"}
          </p>
        </div>
        <div className={supportSummaryItemClass}>
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Session</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{metadataSummary}</p>
        </div>
        <div className={supportSummaryItemClass}>
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Context</p>
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
    <PoolsideNotePanel
      className="rounded-2xl border border-blue-200/80 bg-blue-50/60 p-4 sm:p-5"
      testIdPrefix="workout-editor-poolside"
      swimmerName={swimmerName}
      focusOptions={trainingFocusOptions}
      selectedFocusIds={selectedPoolsideFocusIds}
      onToggleFocus={togglePoolsideFocusSelection}
      actionSlot={
        <button
          type="button"
          onClick={() => openWorkoutPdfPrintView("poolside")}
          data-testid="workout-editor-poolside-pdf-open"
          aria-describedby={workoutPdfFeedback ? workoutPdfFeedbackId : undefined}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-800 transition hover:bg-blue-100 active:bg-blue-200"
        >
          Print Preview
        </button>
      }
    />
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
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
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
            className={`rounded-full bg-white px-3 py-1 text-xs font-semibold tracking-wide uppercase ${
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
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Session details
              </p>
              <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-3">
                <p className="text-base font-semibold text-slate-900">
                  {draft.title || autoPoolBuilderTitle || "Untitled swim session"}
                </p>
                {sessionTotalLabel ? (
                  <span
                    data-testid="workout-editor-session-total"
                    className="inline-flex w-fit items-center self-start rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800"
                  >
                    {sessionTotalLabel}
                  </span>
                ) : null}
              </div>
              <p
                data-testid="workout-editor-save-state"
                className={`mt-2 text-sm font-medium ${saveStateToneClass} ${
                  copyVariant === "generator" ? "" : "sr-only"
                }`}
              >
                {saveStateMessage}
              </p>
              {showInlinePdfAction ? (
                <p
                  data-testid="workout-editor-pdf-source"
                  data-pdf-state={handoffDraftState}
                  className="sr-only mt-1 text-xs font-semibold tracking-wide text-slate-500 uppercase"
                >
                  {workoutPdfStateLabel}
                </p>
              ) : null}
              {(!metadataOpen || isSummaryOnlyMode) && metadataPanelSummary ? (
                <p
                  data-testid="workout-editor-metadata-summary"
                  className="mt-2 text-sm font-medium text-slate-900"
                >
                  {metadataPanelSummary}
                </p>
              ) : null}
            </div>
            <div className="flex min-w-0 flex-col gap-2 sm:items-end">
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {isEditMode ? (
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
                {showInlinePdfAction ? (
                  <button
                    type="button"
                    onClick={() => openWorkoutPdfPrintView("standard")}
                    data-testid="workout-editor-pdf-open"
                    aria-describedby={workoutPdfFeedback ? workoutPdfFeedbackId : undefined}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                  >
                    {workoutPdfButtonLabel}
                  </button>
                ) : null}
                {savedWorkout && onDiscardChanges && hasUnsavedChanges ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingRemoval(null);
                      setLastRemovedBlock(null);
                      onDiscardChanges();
                    }}
                    disabled={isSaving || pendingRemoval !== null}
                    data-testid="workout-editor-reset"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Discard changes
                  </button>
                ) : null}
                {isEditMode && !savedWorkout && onRequestDiscardDraft ? (
                  <button
                    type="button"
                    onClick={onRequestDiscardDraft}
                    disabled={isSaving || pendingRemoval !== null}
                    data-testid="workout-builder-discard-current-draft"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-white px-4 text-sm font-medium text-amber-900 transition hover:bg-amber-50 active:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Discard draft
                  </button>
                ) : null}
                {isEditMode && savedWorkout && onRequestDeleteCurrent ? (
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
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : savedWorkout ? "Save changes" : unsavedSaveButtonLabel}
                </button>
              </div>
            </div>
          </div>

          {showInlinePdfAction ? renderWorkoutPdfFeedback() : null}

          {isEditMode && metadataOpen ? <div className="mt-4">{metadataFields}</div> : null}
        </section>
      ) : (
        metadataFields
      )}

      <SessionStepSurfaceRenderer
        mode={builderViewMode}
        title={
          isManualPoolMode || copyVariant === "generator" ? "Session steps" : "Editable draft steps"
        }
        showModeTabs={showCalmBuilderLayout}
        showAddActions={isEditMode}
        hasSteps={stepGroups.length > 0}
        rearrangeLiveMessage={rearrangeLiveMessage}
        lastRemovedLabel={lastRemovedBlock?.label ?? null}
        viewSections={calmViewSections}
        onModeChange={setBuilderViewMode}
        onAddStep={addStep}
        onAddRepeat={addRepeat}
        onUndoLastRemoval={undoLastRemoval}
        onDismissLastRemoval={() => setLastRemovedBlock(null)}
        onOpenViewStep={openTargetedStepEditor}
        onOpenViewRepeat={openTargetedRepeatEditor}
      >
        {stepGroups.map((group, groupIndex) =>
          group.kind === "single"
            ? (() => {
                if (!useManualLikeStepSummaries || isViewMode) {
                  return renderStepEditorCard(
                    group.entries[0].step,
                    group.entries[0].index,
                    groupIndex
                  );
                }

                const sessionStepBlock = sessionStepEditBlocks.find(
                  (block) =>
                    block.kind === "single" &&
                    block.groupIndex === groupIndex &&
                    block.entry.step.id === group.entries[0].step.id
                );

                if (!sessionStepBlock || sessionStepBlock.kind !== "single") {
                  return null;
                }

                return renderStepEditorCard(
                  sessionStepBlock.entry.step,
                  sessionStepBlock.entry.index,
                  groupIndex,
                  {
                    linkedTopLevelRestEntry: sessionStepBlock.linkedRestEntry,
                  }
                );
              })()
            : renderRepeatSummaryCard(group, groupIndex)
        )}
      </SessionStepSurfaceRenderer>

      {poolsideNotePanel}

      {!showCalmBuilderLayout ? (
        <>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                    {savedWorkout ? "Saved workout" : "Draft"}
                  </span>
                  <p
                    data-testid="workout-editor-save-state"
                    className={`text-sm font-medium ${saveStateToneClass}`}
                  >
                    {saveStateMessage}
                  </p>
                </div>
                {showInlinePdfAction ? (
                  <p
                    data-testid="workout-editor-pdf-source"
                    data-pdf-state={handoffDraftState}
                    className="mt-2 text-xs font-semibold tracking-wide text-slate-500 uppercase"
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
                    aria-describedby={workoutPdfFeedback ? workoutPdfFeedbackId : undefined}
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
                    aria-describedby={workoutPdfFeedback ? workoutPdfFeedbackId : undefined}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-800 transition hover:bg-blue-50 active:bg-blue-100"
                  >
                    {workoutPoolsidePdfButtonLabel}
                  </button>
                ) : null}
                {savedWorkout && onDiscardChanges && hasUnsavedChanges ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingRemoval(null);
                      setLastRemovedBlock(null);
                      onDiscardChanges();
                    }}
                    disabled={isSaving || pendingRemoval !== null}
                    data-testid="workout-editor-reset"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Discard changes
                  </button>
                ) : null}
                {!savedWorkout && onRequestDiscardDraft ? (
                  <button
                    type="button"
                    onClick={onRequestDiscardDraft}
                    disabled={isSaving || pendingRemoval !== null}
                    data-testid="workout-builder-discard-current-draft"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-amber-200 bg-white px-4 text-sm font-medium text-amber-900 transition hover:bg-amber-50 active:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Discard draft
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
                  {isSaving ? "Saving..." : savedWorkout ? "Save changes" : unsavedSaveButtonLabel}
                </button>
              </div>
            </div>
          </div>

          {showInlinePdfAction ? renderWorkoutPdfFeedback() : null}
        </>
      ) : null}

      {showCalmBuilderLayout ? supportToolsPanel : null}

      {showDiscardUndoNotice && onUndoDiscardChanges ? (
        <div className="fixed inset-x-0 bottom-4 z-[85] flex justify-center px-4">
          <div
            data-testid="workout-editor-discard-undo"
            className="flex w-full max-w-[560px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-[0_12px_34px_rgba(15,23,42,0.18)]"
          >
            <p className="text-sm font-medium text-emerald-900" aria-live="polite">
              Changes discarded.
            </p>
            <button
              type="button"
              onClick={onUndoDiscardChanges}
              data-testid="workout-editor-discard-undo-button"
              className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-emerald-300 bg-white px-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              Undo
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
