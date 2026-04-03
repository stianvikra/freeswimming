"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND_FONT_PUBLIC_PATH, BRAND_PDF_LOGO_PATH } from "@/lib/brand";
import { useAutoDismissNotice } from "@/components/my-library/workouts/useAutoDismissNotice";
import {
  SESSION_DRAFT_STEP_CATEGORIES,
  SESSION_DRAFT_STEP_CSS_TARGET_OFFSETS,
  SESSION_DRAFT_STEP_DISTANCE_PRESETS,
  SESSION_DRAFT_STEP_DRILL_TYPES,
  SESSION_DRAFT_POOL_LENGTH_MAX,
  SESSION_DRAFT_POOL_LENGTH_MIN,
  SESSION_DRAFT_POOL_LENGTH_PRESETS,
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
  buildSessionStepStructuredTargetLabel,
  buildSessionTargetSummary,
  computeSessionDraftDerivedTotals,
  formatDistanceMetersLabel,
  formatPaceSecondsPer100m,
  formatPoolLengthLabel,
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
  isSessionDraftPoolLengthPreset,
  isSessionDraftStepDistancePreset,
  type SessionDraft,
  type SessionDraftStep,
  type SessionDraftStepCategory,
  type SessionDraftStepDurationMode,
  type SessionGeneratorEnvironment,
  type SessionGeneratorStroke,
} from "@/lib/session-generator-v1/shared";
import {
  buildWorkoutPdfFileName,
  buildWorkoutPdfHtmlDocument,
  getDefaultWorkoutPoolsideFocusIds,
  buildWorkoutGarminReadyExport,
  buildWorkoutGarminReadyExportFileName,
  buildWorkoutGarminReadinessReport,
  buildWorkoutHandoffFileName,
  buildWorkoutHandoffText,
  normalizeWorkoutPoolsidePrintStyle,
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
      entries: StepRenderEntry[];
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

type LastRemovedBlock = {
  kind: "step" | "repeat";
  label: string;
  steps: SessionDraftStep[];
  insertIndex: number;
  restoreOpenStepId: string | null;
};

type SupportSectionKey = "readiness" | "garminExport" | "handoff";

const CUSTOM_DISTANCE_VALUE = "custom";
const EMPTY_WORKOUT_POOLSIDE_FOCUS_OPTIONS: WorkoutPoolsideFocusOption[] = [];

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

function parsePoolLengthInput(value: string) {
  const trimmed = value.trim().replace(",", ".");
  if (trimmed.length === 0) return null;
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) return null;

  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed)) return null;

  const normalized = Math.round(parsed * 100) / 100;
  if (normalized < SESSION_DRAFT_POOL_LENGTH_MIN || normalized > SESSION_DRAFT_POOL_LENGTH_MAX) {
    return null;
  }

  return normalized;
}

function formatEditablePoolLength(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return "";
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function formatEditableDistance(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return "";
  return String(Math.round(value));
}

function parseSignatureValues(value: string) {
  if (value.length === 0) {
    return [];
  }

  return value.split("|");
}

function buildStepStrokeGuidance(step: SessionDraftStep) {
  const recommendedFocus = getRecommendedStepFocus(step);

  if (step.category === "kick") {
    return "Kick category already tags this as kick work. Use Stroke pattern for the movement pattern this set supports, and change Focus tag only when you need extra kick, pull, or drill notation.";
  }

  if (step.category === "drill" || step.stroke === "drill") {
    return "Drill shell is active. Use Stroke pattern for the base movement, and use Focus tag to clarify whether the drill is general, kick, or pull.";
  }

  return recommendedFocus
    ? `This step already suggests the ${getSessionStepDrillTypeLabel(recommendedFocus)} focus tag. Keep it unless you need a different drill, kick, or pull note.`
    : "Use Stroke pattern for the swim pattern. Add Focus tag only when the step needs extra drill, kick, or pull notation.";
}

function buildStepFocusGuidance(step: SessionDraftStep) {
  const recommendedFocus = getRecommendedStepFocus(step);
  if (recommendedFocus === "kick") {
    return "Recommended Focus tag: Kick. Change it only when this kick set needs a more specific drill or pull note.";
  }

  if (recommendedFocus === "drill") {
    return "Recommended Focus tag: Drill. Switch it to Kick or Pull only when this drill set needs that extra label.";
  }

  return "Optional. Leave Focus tag on None unless the step needs extra drill, kick, or pull notation.";
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
      notes: "Edit this into the exact repeat you want to hold.",
      repeatGroupId: groupId,
      repeatCount: 4,
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
      notes: "Adjust or remove this recovery once the set is dialed in.",
      repeatGroupId: groupId,
      repeatCount: 4,
    }),
  ];
}

function buildRepeatInsertedStep(
  repeatGroupId: string,
  repeatCount: number | null
): Partial<SessionDraftStep> {
  return {
    name: "Repeat step",
    stroke: "freestyle",
    targetSummary: "Edit this into the next step for each round.",
    notes: "",
    repeatGroupId,
    repeatCount,
  };
}

function formatMinutesLabel(value: number) {
  return `${Number.isInteger(value) ? value : value.toFixed(1).replace(/\.0$/, "")} min`;
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

function buildStepRemovalLabel(step: SessionDraftStep, fallbackIndex: number) {
  return (
    step.name.trim() || `${getSessionStepCategoryLabel(step.category)} step ${fallbackIndex + 1}`
  );
}

function buildDurationSummary(step: SessionDraftStep, basePaceSecondsPer100m: number) {
  switch (step.durationMode) {
    case "distance":
      return step.distanceM ? `${step.distanceM}m` : "Distance not set";
    case "time":
      return step.timeMin ? formatMinutesLabel(step.timeMin) : "Time not set";
    case "fixed_rest":
      return step.timeMin
        ? `Fixed rest ${formatClockDurationLabel(step.timeMin)}`
        : "Fixed rest not set";
    case "send_off":
      return step.timeMin
        ? `Send-off ${formatClockDurationLabel(step.timeMin)}`
        : "Send-off not set";
    case "css_send_off":
      if (typeof step.cssSendOffOffsetSeconds !== "number") {
        return "CSS send-off not set";
      }
      return `CSS ${step.cssSendOffOffsetSeconds > 0 ? "+" : ""}${step.cssSendOffOffsetSeconds}s send-off (${formatClockDurationLabelFromSeconds(
        basePaceSecondsPer100m + step.cssSendOffOffsetSeconds
      )})`;
    case "lap_button":
      return "Lap button press";
    default:
      return getSessionStepDurationModeLabel(step.durationMode);
  }
}

function buildStepSummary(step: SessionDraftStep, basePaceSecondsPer100m: number) {
  const structuredTarget = buildSessionStepStructuredTargetLabel(step, basePaceSecondsPer100m);
  const contextParts = [getSessionStepStrokeLabel(step.stroke)];

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

  return [
    buildDurationSummary(step, basePaceSecondsPer100m),
    contextParts.join(" · "),
    structuredTarget ?? getSessionEffortLabel(step.intensity),
  ]
    .filter(Boolean)
    .join(" · ");
}

function buildRepeatSummary(
  entries: StepRenderEntry[],
  repeatCount: number | null,
  basePaceSecondsPer100m: number
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

  if (roundDistanceM > 0) roundParts.push(`${roundDistanceM}m`);
  if (roundDurationSeconds > 0) {
    roundParts.push(formatClockDurationLabelFromSeconds(roundDurationSeconds));
  }
  if (roundParts.length > 0) {
    parts.push(`${roundParts.join(" + ")} per round`);
  }
  if (roundDistanceM > 0) {
    parts.push(`${roundDistanceM * repeatCount}m repeated distance`);
  }

  return parts.join(" · ");
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

    groups.push({
      kind: "repeat",
      repeatGroupId: step.repeatGroupId,
      repeatCount: step.repeatCount ?? null,
      entries,
    });
    index = nextIndex - 1;
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
}: Props) {
  const draftTotals = computeSessionDraftDerivedTotals(draft);
  const garminReadiness = buildWorkoutGarminReadinessReport(draft);
  const stepGroups = buildStepRenderGroups(draft.steps);
  const [openStepId, setOpenStepId] = useState<string | null>(null);
  const [poolLengthInput, setPoolLengthInput] = useState(() =>
    formatEditablePoolLength(draft.poolLengthM)
  );
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
  const [lastRemovedBlock, setLastRemovedBlock] = useState<LastRemovedBlock | null>(null);
  const [workoutPdfNotice, setWorkoutPdfNotice] = useState("");
  const [workoutPdfError, setWorkoutPdfError] = useState("");
  const [garminExportNotice, setGarminExportNotice] = useState("");
  const [garminExportError, setGarminExportError] = useState("");
  const [handoffNotice, setHandoffNotice] = useState("");
  const [handoffError, setHandoffError] = useState("");
  const [metadataOpen, setMetadataOpen] = useState(
    () => !(savedWorkout && copyVariant === "default")
  );
  const [poolsidePrintStyle, setPoolsidePrintStyle] = useState<WorkoutPoolsidePrintStyle>("color");
  const [selectedPoolsideFocusIds, setSelectedPoolsideFocusIds] = useState<string[]>(() =>
    getDefaultWorkoutPoolsideFocusIds(trainingFocusOptions)
  );
  const [supportSectionOpen, setSupportSectionOpen] = useState<Record<SupportSectionKey, boolean>>({
    readiness: false,
    garminExport: false,
    handoff: false,
  });
  const showCalmBuilderLayout = copyVariant === "default";
  const [supportToolsOpen, setSupportToolsOpen] = useState(() => copyVariant !== "default");
  const savedWorkoutId = savedWorkout?.id ?? null;
  const trainingFocusIdSignature = trainingFocusOptions.map((focus) => focus.id).join("|");
  const defaultPoolsideFocusIdSignature =
    getDefaultWorkoutPoolsideFocusIds(trainingFocusOptions).join("|");
  const metadataStartsCollapsed = showCalmBuilderLayout && savedWorkoutId !== null;
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
  const poolLengthUsesPreset =
    typeof draft.poolLengthM === "number" && isSessionDraftPoolLengthPreset(draft.poolLengthM);
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
  const metadataSummary = buildSessionTargetSummary({
    ...draft,
    totalDistanceM: draftTotals.totalDistanceM ?? draft.totalDistanceM,
    estimatedDurationMin: draftTotals.estimatedDurationMin ?? draft.estimatedDurationMin,
  });
  const poolsideFocusSummary =
    trainingFocusOptions.length === 0
      ? "No open focuses are available right now. The poolside note will print without a focus section."
      : selectedPoolsideFocusTitles.length === 0
        ? "No open focuses are selected. The poolside note will print without a focus section."
        : `${selectedPoolsideFocusTitles.length} open focus${
            selectedPoolsideFocusTitles.length === 1 ? "" : "es"
          } will be included on the poolside note.`;
  const poolsidePrintStyleLabel =
    normalizeWorkoutPoolsidePrintStyle(poolsidePrintStyle) === "ink_saver"
      ? "Ink saver"
      : "Color mode";
  const poolsidePrintStyleDescription =
    normalizeWorkoutPoolsidePrintStyle(poolsidePrintStyle) === "ink_saver"
      ? "Text-first output with white surfaces to save ink."
      : "Color-first output. Turn on Print backgrounds in your browser if you want the blue fills.";
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

  useAutoDismissNotice(workoutPdfNotice, setWorkoutPdfNotice);
  useAutoDismissNotice(garminExportNotice, setGarminExportNotice);
  useAutoDismissNotice(handoffNotice, setHandoffNotice);

  useEffect(() => {
    setPoolLengthInput(formatEditablePoolLength(draft.poolLengthM));
  }, [draft.poolLengthM]);

  useEffect(() => {
    if (openStepId && !draft.steps.some((step) => step.id === openStepId)) {
      setOpenStepId(null);
    }
  }, [draft.steps, openStepId]);

  useEffect(() => {
    setSupportToolsOpen(!showCalmBuilderLayout);
  }, [savedWorkoutId, showCalmBuilderLayout]);

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
    setMetadataOpen(!metadataStartsCollapsed);
    setPoolsidePrintStyle("color");
    setSelectedPoolsideFocusIds(parseSignatureValues(defaultPoolsideFocusIdSignature));
  }, [copyVariant, defaultPoolsideFocusIdSignature, metadataStartsCollapsed, savedWorkoutId]);

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

  function syncDraftSelections(nextDraft: SessionDraft) {
    const requiredStrokes = Array.from(
      new Set(
        nextDraft.steps
          .map((step) => step.stroke)
          .filter((stroke): stroke is SessionGeneratorStroke =>
            SESSION_GENERATOR_STROKES.includes(stroke as SessionGeneratorStroke)
          )
      )
    );
    const requiredEquipment = Array.from(
      new Set(
        nextDraft.steps
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
      allowedStrokes: Array.from(new Set([...nextDraft.allowedStrokes, ...requiredStrokes])),
      equipmentAllowlist: Array.from(
        new Set([...nextDraft.equipmentAllowlist, ...requiredEquipment])
      ),
    };
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

  function moveDraftGroup(groupIndex: number, direction: -1 | 1) {
    const nextGroupIndex = groupIndex + direction;
    if (groupIndex < 0 || nextGroupIndex < 0 || nextGroupIndex >= stepGroups.length) return;

    const nextGroups = [...stepGroups];
    const [group] = nextGroups.splice(groupIndex, 1);
    nextGroups.splice(nextGroupIndex, 0, group);

    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: nextGroups.flatMap((group) => group.entries.map((entry) => entry.step)),
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
    const lastEntry = group ? group.entries[group.entries.length - 1] : null;
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
        ? buildRepeatInsertedStep(sourceStep.repeatGroupId, sourceStep.repeatCount ?? null)
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

    const nextRepeatGroupId = buildRepeatGroupId(draft.steps.length + 1);
    const duplicatedSteps = sourceSteps.map((step, index) => ({
      ...step,
      id: `${nextRepeatGroupId}-step-${index + 1}`,
      repeatGroupId: nextRepeatGroupId,
    }));
    const nextSteps = [...draft.steps];
    nextSteps.splice(sourceIndex + sourceSteps.length, 0, ...duplicatedSteps);

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
      label: buildStepRemovalLabel(step, stepIndex),
      repeatGroupId: step.repeatGroupId ?? null,
    });
  }

  function requestRepeatGroupRemoval(repeatGroupId: string) {
    const repeatEntries = draft.steps.filter((step) => step.repeatGroupId === repeatGroupId);
    if (repeatEntries.length === 0) return;

    const repeatCount = repeatEntries[0]?.repeatCount;
    const roundsLabel =
      typeof repeatCount === "number" ? `${repeatCount} rounds` : "repeat count not set";

    setLastRemovedBlock(null);
    setPendingRemoval({
      kind: "repeat",
      repeatGroupId,
      label: `Repeat block (${repeatEntries.length} steps, ${roundsLabel})`,
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
      (step) => step.repeatGroupId === pendingRemoval.repeatGroupId
    );
    if (removedSteps.length === 0) {
      setPendingRemoval(null);
      return;
    }

    const insertIndex = draft.steps.findIndex(
      (step) => step.repeatGroupId === pendingRemoval.repeatGroupId
    );
    const nextSteps = draft.steps.filter(
      (step) => step.repeatGroupId !== pendingRemoval.repeatGroupId
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
    updateDraftStep(stepId, (current) => ({
      ...current,
      durationMode: nextMode,
      distanceM: nextMode === "distance" ? (current.distanceM ?? 100) : null,
      timeMin:
        nextMode === "time" || nextMode === "fixed_rest" || nextMode === "send_off"
          ? (current.timeMin ?? (nextMode === "send_off" ? 2 : 1))
          : null,
      cssSendOffOffsetSeconds:
        nextMode === "css_send_off" ? (current.cssSendOffOffsetSeconds ?? 0) : null,
    }));
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

  function updateStepDistanceSelection(stepId: string, value: string) {
    updateDraftStep(stepId, (current) => ({
      ...current,
      distanceM:
        value === CUSTOM_DISTANCE_VALUE
          ? isSessionDraftStepDistancePreset(current.distanceM ?? Number.NaN)
            ? null
            : current.distanceM
          : Number.parseInt(value, 10),
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

    const parsed = parsePoolLengthInput(nextValue);
    updateDraft("poolLengthM", parsed);
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
    }
  ) {
    const insideRepeatGroup = options?.insideRepeatGroup ?? false;
    const isOpen = openStepId === step.id;
    const toggleLabel = isOpen ? "Done" : "Edit step";
    const panelId = `session-draft-step-panel-${step.id}`;

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
              {insideRepeatGroup
                ? `Repeat step ${options?.repeatStepNumber ?? 1}`
                : `Step ${index + 1}`}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {step.name || getSessionStepCategoryLabel(step.category)}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              {getSessionStepCategoryLabel(step.category)}
            </p>
            <p className="mt-2 text-xs text-slate-600">
              {buildStepSummary(step, draft.basePaceSecondsPer100m)}
            </p>
            {step.targetSummary ? (
              <p className="mt-1 text-xs text-slate-500">{step.targetSummary}</p>
            ) : null}
            {step.notes ? <p className="mt-1 text-xs text-slate-400">{step.notes}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {insideRepeatGroup ? (
              <p className="text-xs text-slate-500">Move the full repeat block from the header.</p>
            ) : (
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
            <button
              type="button"
              onClick={() => insertStepAfterStep(step.id)}
              data-testid={`session-draft-step-add-after-${index}`}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-800 transition hover:bg-blue-50"
            >
              Add step after
            </button>
            {!insideRepeatGroup ? (
              <button
                type="button"
                onClick={() => insertRepeatAfterGroup(groupIndex)}
                data-testid={`session-draft-step-add-repeat-after-${index}`}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-800 transition hover:bg-blue-50"
              >
                Add repeat after
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => duplicateStep(step.id)}
              data-testid={`session-draft-step-duplicate-${index}`}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Duplicate
            </button>
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
            <button
              type="button"
              onClick={() => requestStepRemoval(step.id)}
              data-testid={`session-draft-step-remove-${index}`}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-sm text-rose-700 transition hover:bg-rose-50"
            >
              Remove
            </button>
          </div>
        </div>

        {isOpen ? (
          <div id={panelId} className="mt-4 grid gap-4 md:grid-cols-2">
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

            <label className="text-sm text-slate-700">
              Category
              <select
                value={step.category}
                onChange={(event) =>
                  updateDraftStep(step.id, (current) =>
                    applyRecommendedStepFocus(current, {
                      category: event.target.value as SessionDraftStepCategory,
                    })
                  )
                }
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {SESSION_DRAFT_STEP_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {getSessionStepCategoryLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-slate-700">
              Stroke pattern
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

            <label className="text-sm text-slate-700">
              Focus tag
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

            <p className="text-sm text-slate-500 md:col-span-2">{buildStepStrokeGuidance(step)}</p>
            <p className="text-sm text-slate-500 md:col-span-2">{buildStepFocusGuidance(step)}</p>

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

            <label className="text-sm text-slate-700">
              Duration mode
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
                {SESSION_DRAFT_STEP_DURATION_MODES.map((value) => (
                  <option key={value} value={value}>
                    {getSessionStepDurationModeLabel(value)}
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
                      typeof step.distanceM === "number" &&
                      isSessionDraftStepDistancePreset(step.distanceM)
                        ? String(step.distanceM)
                        : CUSTOM_DISTANCE_VALUE
                    }
                    onChange={(event) => updateStepDistanceSelection(step.id, event.target.value)}
                    data-testid={`session-draft-step-distance-${index}`}
                    className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    {SESSION_DRAFT_STEP_DISTANCE_PRESETS.map((value) => (
                      <option key={value} value={String(value)}>
                        {formatDistanceMetersLabel(value)}
                      </option>
                    ))}
                    <option value={CUSTOM_DISTANCE_VALUE}>Custom distance</option>
                  </select>
                </label>
                {!(
                  typeof step.distanceM === "number" &&
                  isSessionDraftStepDistancePreset(step.distanceM)
                ) ? (
                  <label className="text-sm text-slate-700">
                    Custom distance (m)
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatEditableDistance(step.distanceM)}
                      onChange={(event) =>
                        updateDraftStep(step.id, (current) => ({
                          ...current,
                          distanceM: parsePositiveInteger(event.target.value),
                        }))
                      }
                      data-testid={`session-draft-step-distance-custom-${index}`}
                      className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </label>
                ) : (
                  <div className="self-end text-sm text-slate-500">
                    {formatDistanceMetersLabel(step.distanceM)}
                  </div>
                )}
              </div>
            ) : step.durationMode === "time" || step.durationMode === "fixed_rest" ? (
              <label className="text-sm text-slate-700">
                {step.durationMode === "fixed_rest" ? "Rest time (min)" : "Time (min)"}
                <input
                  type="text"
                  inputMode="numeric"
                  value={step.timeMin ?? ""}
                  onChange={(event) =>
                    updateDraftStep(step.id, (current) => ({
                      ...current,
                      timeMin: parsePositiveNumber(event.target.value),
                    }))
                  }
                  data-testid={`session-draft-step-time-${index}`}
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            ) : step.durationMode === "send_off" ? (
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:col-span-2 md:grid-cols-[1fr_1fr_auto]">
                <label className="text-sm text-slate-700">
                  Send-off min
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
                  Send-off sec
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
                    ? `${formatClockDurationLabel(step.timeMin)} send-off`
                    : "Set send-off"}
                </div>
              </div>
            ) : step.durationMode === "css_send_off" ? (
              <label className="text-sm text-slate-700 md:col-span-2">
                CSS send-off offset
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

            <label className="text-sm text-slate-700">
              Target mode
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
                    {getSessionStepTargetModeLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            {(step.targetMode ?? "none") === "effort" ? (
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

            {(step.targetMode ?? "none") === "target_pace" ? (
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
                    ? formatPaceSecondsPer100m(step.targetPaceSecondsPer100m)
                    : "Set pace"}
                </div>
              </div>
            ) : null}

            {(step.targetMode ?? "none") === "css_target_pace" ? (
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
                          draft.basePaceSecondsPer100m + value
                        )})`}
                      </option>
                    );
                  })}
                </select>
              </label>
            ) : null}

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

            <label className="text-sm text-slate-700 md:col-span-2">
              Notes
              <textarea
                value={step.notes}
                onChange={(event) =>
                  updateDraftStep(step.id, (current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                rows={3}
                className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </label>
          </div>
        ) : null}
      </article>
    );
  }

  const metadataFields = (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
        Title
        <input
          type="text"
          value={draft.title}
          onChange={(event) => updateDraft("title", event.target.value)}
          data-testid="session-draft-title"
          className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </label>

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

      <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700 md:col-span-2">
        Description
        <p className="mt-2 text-xs text-slate-500">
          Optional. Use this for the whole-workout purpose, pacing intent, or one short coaching
          note that applies across the session.
        </p>
        <textarea
          value={draft.description}
          onChange={(event) => updateDraft("description", event.target.value)}
          data-testid="session-draft-description"
          rows={4}
          className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </label>

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

      {draft.environment === "pool" ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700 md:col-span-2">
          <p className="text-sm font-medium text-slate-900">Pool length</p>
          <p className="mt-1 text-xs text-slate-500">
            Choose 12.5m, 25m, or 50m, or type the exact length when you build for a less common
            setup.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {SESSION_DRAFT_POOL_LENGTH_PRESETS.map((value) => {
              const isSelected = draft.poolLengthM === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateDraft("poolLengthM", value)}
                  className={`inline-flex h-10 items-center justify-center rounded-full border px-3 text-sm transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {formatPoolLengthLabel(value)}
                </button>
              );
            })}
          </div>

          <label className="mt-4 block text-sm text-slate-700">
            Exact pool length (m)
            <input
              type="text"
              inputMode="decimal"
              value={poolLengthInput}
              onChange={(event) => updateDraftPoolLengthInput(event.target.value)}
              data-testid="session-draft-pool-length-input"
              className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 md:max-w-xs"
            />
          </label>

          <p className="mt-2 text-xs text-slate-500">
            Supported range: {formatPoolLengthLabel(SESSION_DRAFT_POOL_LENGTH_MIN)} to{" "}
            {formatPoolLengthLabel(SESSION_DRAFT_POOL_LENGTH_MAX)}.{" "}
            {poolLengthUsesPreset
              ? "Preset selected."
              : draft.poolLengthM
                ? `Custom length saved as ${formatPoolLengthLabel(draft.poolLengthM)}.`
                : "Enter a valid pool length before saving."}
          </p>
        </div>
      ) : null}

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
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
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
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
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
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
            <pre
              data-testid="workout-editor-garmin-export-preview"
              className="max-h-[320px] overflow-auto whitespace-pre-wrap px-4 py-4 text-xs leading-relaxed text-slate-100"
            >
              {garminReadyExportPreview}
            </pre>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
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
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
            <pre
              data-testid="workout-editor-handoff-preview"
              className="max-h-[320px] overflow-auto whitespace-pre-wrap px-4 py-4 text-xs leading-relaxed text-slate-100"
            >
              {handoffText}
            </pre>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {savedWorkout ? "Accepted" : "Draft"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Session</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{metadataSummary}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
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
      className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4"
      data-testid="workout-editor-poolside-panel"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Poolside Note
          </p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            Choose the focus cues and print style before you open the compact lane-side note.
          </p>
          <p className="mt-1 text-sm text-slate-600">{poolsideFocusSummary}</p>
          <p className="mt-1 text-sm text-slate-600">
            {poolsidePrintStyleLabel}: {poolsidePrintStyleDescription}
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

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <div className="rounded-2xl border border-blue-100 bg-white/80 p-4">
          <p className="text-sm font-semibold text-slate-900">Open focus cues</p>
          {trainingFocusOptions.length > 0 ? (
            <div className="mt-3 grid gap-3">
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
                  <span>
                    <span className="block font-medium text-slate-900">{focus.title}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {focus.isPrimary ? "Primary focus" : "Optional focus"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              No open focuses are available, so the poolside note will only include the workout and
              totals.
            </p>
          )}
        </div>

        <fieldset className="rounded-2xl border border-blue-100 bg-white/80 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-900">Print style</legend>
          <div className="mt-3 grid gap-3">
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
      className={`rounded-2xl border p-4 ${
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
          <p className="mt-2 text-sm font-medium text-slate-900">
            {supportToolsAudienceDescription}
          </p>
          <p className="mt-1 text-sm text-slate-700">{supportToolsDraftStateDescription}</p>
          <p className="mt-1 text-sm text-slate-600">{supportToolsPersistenceDescription}</p>
          {supportToolsWarningSummary ? (
            <p className="mt-1 text-sm text-slate-600">{supportToolsWarningSummary}</p>
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
                    {workout.totalDistanceM ? `${workout.totalDistanceM}m` : null}
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
              <h3 className="mt-2 text-base font-semibold text-slate-900">
                Title through equipment
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {metadataOpen
                  ? "Core session details stay here while the workout steps remain the primary editing surface."
                  : "Collapsed while you work on the session itself. Open anytime to change title, environment, or equipment."}
              </p>
              {!metadataOpen ? (
                <p
                  data-testid="workout-editor-metadata-summary"
                  className="mt-2 text-sm font-medium text-slate-900"
                >
                  {metadataSummary}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setMetadataOpen((current) => !current)}
              aria-expanded={metadataOpen}
              data-testid="workout-editor-metadata-toggle"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              {metadataOpen ? "Hide details" : "Show details"}
            </button>
          </div>

          {metadataOpen ? <div className="mt-4">{metadataFields}</div> : null}
        </section>
      ) : (
        metadataFields
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">Editable draft steps</h3>
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
                className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                      Repeat block
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {buildRepeatSummary(
                        group.entries,
                        group.repeatCount,
                        draft.basePaceSecondsPer100m
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Garmin-familiar starter scaffold: edit the repeated steps below instead of
                      duplicating every round by hand.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Repeat counts currently support {SESSION_DRAFT_REPEAT_MIN}-
                      {SESSION_DRAFT_REPEAT_MAX} rounds per block.
                    </p>
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

                <div className="mt-4 space-y-3">
                  {group.entries.map((entry, repeatIndex) =>
                    renderStepEditorCard(entry.step, entry.index, groupIndex, {
                      insideRepeatGroup: true,
                      repeatStepNumber: repeatIndex + 1,
                    })
                  )}
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
