"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
import type { WorkoutEditorRecord, WorkoutSummary } from "@/lib/workouts/shared";

type Props = {
  draft: SessionDraft;
  savedWorkout: WorkoutEditorRecord | null;
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

const CUSTOM_DISTANCE_VALUE = "custom";

function buildBlankStep(
  index: number,
  overrides: Partial<SessionDraftStep> = {}
): SessionDraftStep {
  return {
    id: `step-${Date.now()}-${index}`,
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

function buildRepeatStarterSteps(index: number): SessionDraftStep[] {
  const groupId = `repeat-${Date.now()}-${index}`;

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
    if (!(step.stroke === "drill" && drillLabel === "Drill")) {
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
  recentWorkoutsDescription = "Open another saved session here until the dedicated workout builder route grows into the full manual builder flow.",
  workoutHrefBuilder = (workoutId) => `/my-library/workouts/${workoutId}`,
  saveButtonTestId = "session-generator-save",
}: Props) {
  const draftTotals = computeSessionDraftDerivedTotals(draft);
  const stepGroups = buildStepRenderGroups(draft.steps);
  const [openStepId, setOpenStepId] = useState<string | null>(null);
  const [poolLengthInput, setPoolLengthInput] = useState(() =>
    formatEditablePoolLength(draft.poolLengthM)
  );
  const poolLengthUsesPreset =
    typeof draft.poolLengthM === "number" && isSessionDraftPoolLengthPreset(draft.poolLengthM);

  useEffect(() => {
    setPoolLengthInput(formatEditablePoolLength(draft.poolLengthM));
  }, [draft.poolLengthM]);

  useEffect(() => {
    if (openStepId && !draft.steps.some((step) => step.id === openStepId)) {
      setOpenStepId(null);
    }
  }, [draft.steps, openStepId]);

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

  function addStep() {
    const nextStep = buildBlankStep(draft.steps.length + 1);

    setOpenStepId(nextStep.id);
    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: [...draft.steps, nextStep],
      })
    );
  }

  function addRepeat() {
    const nextSteps = buildRepeatStarterSteps(draft.steps.length + 1);

    setOpenStepId(nextSteps[0]?.id ?? null);
    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: [...draft.steps, ...nextSteps],
      })
    );
  }

  function removeStep(stepId: string) {
    if (openStepId === stepId) {
      setOpenStepId(null);
    }

    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: draft.steps.filter((step) => step.id !== stepId),
      })
    );
  }

  function removeRepeatGroup(repeatGroupId: string) {
    if (
      draft.steps.some((step) => step.repeatGroupId === repeatGroupId && step.id === openStepId)
    ) {
      setOpenStepId(null);
    }

    onDraftChange(
      syncDraftSelections({
        ...draft,
        steps: draft.steps.filter((step) => step.repeatGroupId !== repeatGroupId),
      })
    );
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
              onClick={() => removeStep(step.id)}
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
                  updateDraftStep(step.id, (current) => ({
                    ...current,
                    category: event.target.value as SessionDraftStepCategory,
                  }))
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
              Stroke
              <select
                value={step.stroke ?? "choice"}
                onChange={(event) => {
                  const nextStroke = event.target.value as SessionDraftStep["stroke"];

                  updateDraftStep(step.id, (current) => ({
                    ...current,
                    stroke: nextStroke,
                    drillType:
                      nextStroke === "drill"
                        ? current.drillType && current.drillType !== "none"
                          ? current.drillType
                          : "drill"
                        : (current.drillType ?? "none"),
                  }));
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
              Drill focus
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
              <h3 className="text-sm font-semibold text-slate-900">Recent accepted workouts</h3>
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
                  Open
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4">
        <p className="text-sm text-blue-900">
          {savedWorkout
            ? "Canonical workout loaded: edit everything below, then save changes back into the same owner-scoped workout."
            : "Local draft only: review and edit everything below, then accept it into the canonical workout layer when you are ready."}
        </p>
      </div>

      {draft.warnings.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <ul className="space-y-2 text-sm text-amber-900">
            {draft.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {savedWorkout ? "Accepted" : "Draft"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Session</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {buildSessionTargetSummary({
              ...draft,
              totalDistanceM: draftTotals.totalDistanceM ?? draft.totalDistanceM,
              estimatedDurationMin: draftTotals.estimatedDurationMin ?? draft.estimatedDurationMin,
            })}
          </p>
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

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-900">Title suggestions</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {draft.titleSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => updateDraft("title", suggestion)}
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
          Draft title
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
          Draft description
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
              Choose a common pool size or type the exact length when you build for a less common
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
                      onClick={() => removeRepeatGroup(group.repeatGroupId)}
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

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <div>
          <p className="text-sm text-slate-600">
            {savedWorkout
              ? "This workout is canonical now. Saving here updates the same workout instead of creating a new copy."
              : "Review the draft carefully, then accept it into the canonical workout layer when you are happy with it."}
          </p>
          <p
            data-testid="workout-editor-save-state"
            className={`mt-2 text-sm font-medium ${
              hasUnsavedChanges ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            {savedWorkout
              ? hasUnsavedChanges
                ? "Unsaved changes stay local until you save this workout."
                : "All builder changes are saved to the canonical workout."
              : "This draft still needs to be accepted into the canonical workout layer."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {savedWorkout && onResetToSaved ? (
            <button
              type="button"
              onClick={onResetToSaved}
              disabled={isSaving || !hasUnsavedChanges}
              data-testid="workout-editor-reset"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset to last saved
            </button>
          ) : null}
          <button
            type="button"
            onClick={onSave}
            disabled={
              isSaving || !canonicalSaveReady || (savedWorkout ? !hasUnsavedChanges : false)
            }
            data-testid={saveButtonTestId}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : savedWorkout ? "Save changes" : "Accept and save workout"}
          </button>
        </div>
      </div>

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
