"use client";

import { useId, useState } from "react";
import { buildCustomDrylandExercise } from "@/lib/dryland/exercise-bank";
import {
  buildDrylandExecutionSummary,
  buildDrylandSetChipLabel,
  buildDrylandSummary,
  DRYLAND_MAX_SETS_PER_EXERCISE,
  formatSecondsLabel,
  getDrylandSessionKindLabel,
  getDrylandStatusLabel,
  type DrylandExerciseDraft,
  type DrylandSessionDraft,
  type DrylandSessionKind,
  type DrylandSessionRecord,
} from "@/lib/dryland/shared";

type Props = {
  draft: DrylandSessionDraft;
  savedSession: DrylandSessionRecord;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onDraftChange: (draft: DrylandSessionDraft) => void;
  onSave: () => void;
  onResetToSaved: () => void;
};

type DrylandEditorMode = "train" | "build";
type SimpleInputField = "setCount" | "target" | "rest" | "load";

const DRYLAND_MIN_SETS_PER_EXERCISE = 1;

function getSimpleInputKey(revision: string, exerciseId: string, field: SimpleInputField) {
  return `${revision}:${exerciseId}:${field}`;
}

function formatDateTimeLabel(value: string | null) {
  if (!value) return "Not set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not set";
  return parsed.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toMinutesInputValue(seconds: number | null) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0) {
    return "";
  }
  if (seconds % 60 === 0) return String(seconds / 60);
  return String(Math.round((seconds / 60) * 10) / 10);
}

function parseMinutesToSeconds(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 60);
}

function parsePositiveIntegerInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseNonNegativeDecimalInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseSetCountInput(value: string) {
  const parsed = parsePositiveIntegerInput(value);
  if (parsed === null) return null;
  if (parsed < DRYLAND_MIN_SETS_PER_EXERCISE || parsed > DRYLAND_MAX_SETS_PER_EXERCISE) {
    return null;
  }
  return parsed;
}

function buildNextSet(
  sessionKind: DrylandSessionKind,
  previous: DrylandExerciseDraft["sets"][number] | null
) {
  return {
    id: `set-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    reps: sessionKind === "strength" ? (previous?.reps ?? 8) : null,
    holdSeconds: sessionKind === "stretching" ? (previous?.holdSeconds ?? 30) : null,
    loadKg: sessionKind === "strength" ? (previous?.loadKg ?? null) : null,
    restSeconds: previous?.restSeconds ?? (sessionKind === "strength" ? 90 : 15),
    isCompleted: false,
    completedAt: null,
  };
}

function getCoachCue(exercise: DrylandExerciseDraft) {
  return exercise.notes.trim() || "No note added.";
}

function getMediaSlotLabel(exercise: DrylandExerciseDraft) {
  if (exercise.mediaType === "video") return "Video attached";
  if (exercise.mediaType === "image") return "Image attached";
  return "Media";
}

function getSetStatusLabel(set: DrylandExerciseDraft["sets"][number], isNext: boolean) {
  if (set.isCompleted) return "Done";
  if (isNext) return "Now";
  return "Queued";
}

function countCompletedSets(exercise: DrylandExerciseDraft) {
  return exercise.sets.filter((set) => set.isCompleted).length;
}

function SetMetricLabel({ children }: { children: string }) {
  return <span className="text-xs font-medium text-slate-500 sm:hidden">{children}</span>;
}

export default function DrylandSessionEditor({
  draft,
  savedSession,
  isSaving,
  hasUnsavedChanges,
  onDraftChange,
  onSave,
  onResetToSaved,
}: Props) {
  const startsAsManualDraft =
    savedSession.status === "draft" &&
    !draft.startedAt &&
    draft.exercises.every((exercise) => exercise.source === "custom");
  const [mode, setMode] = useState<DrylandEditorMode>(startsAsManualDraft ? "build" : "train");
  const [openBuildExerciseIds, setOpenBuildExerciseIds] = useState<Set<string>>(() => new Set());
  const [simpleInputValues, setSimpleInputValues] = useState<Record<string, string>>({});
  const simpleInputRevision = `${savedSession.id}:${savedSession.updatedAt ?? ""}`;
  const summary = buildDrylandSummary(draft);
  const executionSummary = buildDrylandExecutionSummary(draft);
  const currentExercise =
    (executionSummary.nextSet
      ? draft.exercises[executionSummary.nextSet.exerciseIndex]
      : draft.exercises.at(-1)) ??
    draft.exercises[0] ??
    null;
  const currentExerciseCompletedSetCount = currentExercise
    ? countCompletedSets(currentExercise)
    : 0;
  const currentExerciseProgressPercent =
    currentExercise && currentExercise.sets.length > 0
      ? Math.round((currentExerciseCompletedSetCount / currentExercise.sets.length) * 100)
      : 0;
  const actualDurationInputId = useId();
  const progressBarLabelId = useId();

  function getSimpleInputValue(
    exerciseId: string,
    field: SimpleInputField,
    fallback: string | number
  ) {
    return (
      simpleInputValues[getSimpleInputKey(simpleInputRevision, exerciseId, field)] ??
      String(fallback)
    );
  }

  function setSimpleInputValue(exerciseId: string, field: SimpleInputField, value: string) {
    setSimpleInputValues((current) => ({
      ...current,
      [getSimpleInputKey(simpleInputRevision, exerciseId, field)]: value,
    }));
  }

  function clearSimpleInputValues() {
    setSimpleInputValues({});
  }

  function getSimpleInputIssues() {
    const issues: string[] = [];

    if (!draft.title.trim()) {
      issues.push("Add a session title.");
    }

    draft.exercises.forEach((exercise, exerciseIndex) => {
      const label = `Exercise ${exerciseIndex + 1}`;
      const setCountInput =
        simpleInputValues[getSimpleInputKey(simpleInputRevision, exercise.id, "setCount")];
      const targetInput =
        simpleInputValues[getSimpleInputKey(simpleInputRevision, exercise.id, "target")];
      const restInput =
        simpleInputValues[getSimpleInputKey(simpleInputRevision, exercise.id, "rest")];
      const loadInput =
        simpleInputValues[getSimpleInputKey(simpleInputRevision, exercise.id, "load")];

      if (!exercise.title.trim()) {
        issues.push(`${label} needs a name.`);
      }

      if (setCountInput !== undefined && parseSetCountInput(setCountInput) === null) {
        issues.push(`${label} needs 1-${DRYLAND_MAX_SETS_PER_EXERCISE} sets.`);
      }

      if (targetInput !== undefined && parsePositiveIntegerInput(targetInput) === null) {
        issues.push(
          draft.sessionKind === "strength" ? `${label} needs reps.` : `${label} needs hold seconds.`
        );
      }

      if (
        restInput !== undefined &&
        restInput.trim().length > 0 &&
        parsePositiveIntegerInput(restInput) === null
      ) {
        issues.push(`${label} rest must be a positive number of seconds.`);
      }

      if (
        draft.sessionKind === "strength" &&
        loadInput !== undefined &&
        loadInput.trim().length > 0 &&
        parseNonNegativeDecimalInput(loadInput) === null
      ) {
        issues.push(`${label} load must be zero or higher.`);
      }

      for (const set of exercise.sets) {
        const hasTarget =
          draft.sessionKind === "strength"
            ? typeof set.reps === "number" && set.reps > 0
            : typeof set.holdSeconds === "number" && set.holdSeconds > 0;

        if (!hasTarget) {
          issues.push(
            draft.sessionKind === "strength"
              ? `${label} needs reps.`
              : `${label} needs hold seconds.`
          );
          break;
        }
      }
    });

    return Array.from(new Set(issues));
  }

  const simpleInputIssues = getSimpleInputIssues();
  const canSaveOrTrain = simpleInputIssues.length === 0;

  function patchDraft(patch: Partial<DrylandSessionDraft>) {
    onDraftChange({
      ...draft,
      ...patch,
    });
  }

  function updateExercise(
    exerciseId: string,
    updater: (exercise: DrylandExerciseDraft) => DrylandExerciseDraft
  ) {
    onDraftChange({
      ...draft,
      exercises: draft.exercises.map((exercise) =>
        exercise.id === exerciseId ? updater(exercise) : exercise
      ),
    });
  }

  function removeExercise(exerciseId: string) {
    if (draft.exercises.length === 1) return;
    onDraftChange({
      ...draft,
      exercises: draft.exercises.filter((exercise) => exercise.id !== exerciseId),
    });
    setOpenBuildExerciseIds((current) => {
      const next = new Set(current);
      next.delete(exerciseId);
      return next;
    });
  }

  function addCustomExercise(kind: DrylandSessionKind) {
    const nextExercise = buildCustomDrylandExercise(kind);
    onDraftChange({
      ...draft,
      exercises: [...draft.exercises, nextExercise],
    });
  }

  function updateExerciseSetCount(exerciseId: string, value: string) {
    setSimpleInputValue(exerciseId, "setCount", value);
    const nextSetCount = parseSetCountInput(value);
    if (nextSetCount === null) return;

    updateExercise(exerciseId, (exercise) => {
      if (nextSetCount === exercise.sets.length) return exercise;

      if (nextSetCount < exercise.sets.length) {
        return {
          ...exercise,
          sets: exercise.sets.slice(0, nextSetCount),
        };
      }

      const sets = [...exercise.sets];
      while (sets.length < nextSetCount) {
        sets.push(buildNextSet(draft.sessionKind, sets.at(-1) ?? null));
      }

      return {
        ...exercise,
        sets,
      };
    });
  }

  function updateAllExerciseSetField(
    exerciseId: string,
    field: "reps" | "holdSeconds" | "loadKg" | "restSeconds",
    value: string
  ) {
    const simpleField: SimpleInputField =
      field === "reps" || field === "holdSeconds"
        ? "target"
        : field === "restSeconds"
          ? "rest"
          : "load";
    setSimpleInputValue(exerciseId, simpleField, value);

    updateExercise(exerciseId, (exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => {
        if (field === "loadKg") {
          return {
            ...set,
            loadKg: parseNonNegativeDecimalInput(value),
          };
        }

        return {
          ...set,
          [field]: parsePositiveIntegerInput(value),
        };
      }),
    }));
  }

  function setBuildExerciseOpen(exerciseId: string, isOpen: boolean) {
    setOpenBuildExerciseIds((current) => {
      const next = new Set(current);
      if (isOpen) next.add(exerciseId);
      else next.delete(exerciseId);
      return next;
    });
  }

  function toggleSetCompletion(exerciseId: string, setId: string) {
    updateExercise(exerciseId, (exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) =>
        set.id === setId
          ? {
              ...set,
              isCompleted: !set.isCompleted,
              completedAt: !set.isCompleted ? new Date().toISOString() : null,
            }
          : set
      ),
    }));
  }

  function completeNextSet() {
    const nextSet = executionSummary.nextSet;
    if (!nextSet) return;
    toggleSetCompletion(nextSet.exerciseId, nextSet.setId);
  }

  function addSet(exerciseId: string) {
    updateExercise(exerciseId, (exercise) => ({
      ...exercise,
      sets: [...exercise.sets, buildNextSet(draft.sessionKind, exercise.sets.at(-1) ?? null)],
    }));
  }

  function updateSetField(
    exerciseId: string,
    setId: string,
    field: "reps" | "holdSeconds" | "loadKg" | "restSeconds",
    value: string
  ) {
    updateExercise(exerciseId, (exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => {
        if (set.id !== setId) return set;

        if (field === "loadKg") {
          const trimmed = value.trim();
          const parsed = trimmed.length > 0 ? Number.parseFloat(trimmed) : Number.NaN;
          return {
            ...set,
            loadKg: Number.isFinite(parsed) && parsed >= 0 ? parsed : null,
          };
        }

        const trimmed = value.trim();
        const normalized = parsePositiveIntegerInput(trimmed);
        return {
          ...set,
          [field]: normalized,
        };
      }),
    }));
  }

  function removeSet(exerciseId: string, setId: string) {
    updateExercise(exerciseId, (exercise) => ({
      ...exercise,
      sets:
        exercise.sets.length === 1
          ? exercise.sets
          : exercise.sets.filter((set) => set.id !== setId),
    }));
  }

  function makeSetsEqual(exerciseId: string) {
    const exercise = draft.exercises.find((item) => item.id === exerciseId);
    const firstSet = exercise?.sets[0] ?? null;
    if (!firstSet) return;

    updateExercise(exerciseId, (current) => ({
      ...current,
      sets: current.sets.map((set) => ({
        ...set,
        reps: firstSet.reps,
        holdSeconds: firstSet.holdSeconds,
        restSeconds: firstSet.restSeconds,
        loadKg: firstSet.loadKg,
      })),
    }));
    setSimpleInputValues((current) => ({
      ...current,
      [getSimpleInputKey(simpleInputRevision, exerciseId, "target")]: String(
        draft.sessionKind === "strength" ? (firstSet.reps ?? "") : (firstSet.holdSeconds ?? "")
      ),
      [getSimpleInputKey(simpleInputRevision, exerciseId, "rest")]: String(
        firstSet.restSeconds ?? ""
      ),
      [getSimpleInputKey(simpleInputRevision, exerciseId, "load")]: String(firstSet.loadKg ?? ""),
    }));
  }

  function startTimer() {
    if (!canSaveOrTrain) return;
    const now = new Date().toISOString();
    patchDraft({
      startedAt: now,
      completedAt: null,
    });
  }

  function stopTimer() {
    const completedAt = new Date().toISOString();
    const durationSeconds =
      draft.startedAt && Number.isFinite(Date.parse(draft.startedAt))
        ? Math.max(0, Math.round((Date.parse(completedAt) - Date.parse(draft.startedAt)) / 1000))
        : draft.actualDurationSeconds;
    patchDraft({
      completedAt,
      actualDurationSeconds: durationSeconds ?? null,
    });
  }

  function clearTimer() {
    patchDraft({
      startedAt: null,
      completedAt: null,
      actualDurationSeconds: null,
    });
  }

  function handleSave() {
    if (!canSaveOrTrain) return;
    onSave();
  }

  function handleResetToSaved() {
    clearSimpleInputValues();
    onResetToSaved();
  }

  function switchToTrainMode() {
    if (!canSaveOrTrain) return;
    setMode("train");
  }

  function renderSetTargets(
    exercise: DrylandExerciseDraft,
    exerciseIndex: number,
    panelId: string
  ) {
    return (
      <div
        id={panelId}
        data-testid={`dryland-exercise-card-${exerciseIndex}`}
        className="mt-4 border-t border-blue-100 pt-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Individual sets</h4>
            <p className="mt-1 text-sm text-slate-600">Only when one set differs.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              data-testid={`dryland-make-sets-equal-${exerciseIndex}`}
              onClick={() => makeSetsEqual(exercise.id)}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50 active:bg-blue-100"
            >
              Make sets equal
            </button>
            <button
              type="button"
              data-testid={`dryland-add-set-${exerciseIndex}`}
              onClick={() => addSet(exercise.id)}
              disabled={exercise.sets.length >= DRYLAND_MAX_SETS_PER_EXERCISE}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add set
            </button>
          </div>
        </div>

        <div className="mt-3 hidden grid-cols-[64px_88px_88px_90px_auto] gap-2 border-b border-slate-200 pb-2 text-xs font-semibold text-slate-500 sm:grid">
          <span>Set</span>
          <span>{draft.sessionKind === "strength" ? "Reps" : "Hold"}</span>
          <span>Rest sec</span>
          <span>Load kg</span>
          <span className="text-right">Action</span>
        </div>
        <div className="divide-y divide-slate-200">
          {exercise.sets.map((set, setIndex) => (
            <div
              key={set.id}
              className="grid grid-cols-2 gap-2 py-3 sm:grid-cols-[64px_88px_88px_90px_auto] sm:items-center"
            >
              <span className="col-span-2 text-sm font-semibold text-slate-900 sm:col-span-1">
                Set {setIndex + 1}
              </span>

              <label className="grid gap-1">
                <SetMetricLabel>
                  {draft.sessionKind === "strength" ? "Reps" : "Hold sec"}
                </SetMetricLabel>
                <input
                  value={
                    draft.sessionKind === "strength" ? (set.reps ?? "") : (set.holdSeconds ?? "")
                  }
                  data-testid={`dryland-set-target-${exerciseIndex}-${setIndex}`}
                  onChange={(event) =>
                    updateSetField(
                      exercise.id,
                      set.id,
                      draft.sessionKind === "strength" ? "reps" : "holdSeconds",
                      event.target.value
                    )
                  }
                  inputMode="numeric"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                />
              </label>

              <label className="grid gap-1">
                <SetMetricLabel>Rest sec</SetMetricLabel>
                <input
                  value={set.restSeconds ?? ""}
                  data-testid={`dryland-set-rest-${exerciseIndex}-${setIndex}`}
                  onChange={(event) =>
                    updateSetField(exercise.id, set.id, "restSeconds", event.target.value)
                  }
                  inputMode="numeric"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                />
              </label>

              <label className={draft.sessionKind === "strength" ? "grid gap-1" : "hidden sm:grid"}>
                <SetMetricLabel>Load kg</SetMetricLabel>
                {draft.sessionKind === "strength" ? (
                  <input
                    value={set.loadKg ?? ""}
                    data-testid={`dryland-set-load-${exerciseIndex}-${setIndex}`}
                    onChange={(event) =>
                      updateSetField(exercise.id, set.id, "loadKg", event.target.value)
                    }
                    inputMode="decimal"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                  />
                ) : (
                  <span className="hidden text-sm text-slate-400 sm:block">N/A</span>
                )}
              </label>

              <button
                type="button"
                data-testid={`dryland-set-remove-${exerciseIndex}-${setIndex}`}
                onClick={() => removeSet(exercise.id, set.id)}
                disabled={exercise.sets.length === 1}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-50 active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 sm:h-9 sm:justify-self-end"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                data-testid="dryland-session-kind-locked"
                className="inline-flex min-h-8 items-center rounded-full border border-blue-200 bg-blue-50 px-3 text-xs font-semibold tracking-wide text-blue-800 uppercase"
              >
                {getDrylandSessionKindLabel(draft.sessionKind)}
              </span>
              <span className="inline-flex min-h-8 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                {getDrylandStatusLabel(savedSession.status)}
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">{draft.title}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {summary.exerciseCount} exercise{summary.exerciseCount === 1 ? "" : "s"} ·{" "}
              {summary.setCount} set{summary.setCount === 1 ? "" : "s"} · updated{" "}
              {formatDateTimeLabel(savedSession.updatedAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-start gap-2 lg:justify-end">
            <button
              type="button"
              onClick={handleResetToSaved}
              disabled={!hasUnsavedChanges || isSaving}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset
            </button>
            <button
              type="button"
              data-testid="dryland-builder-save"
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges || !canSaveOrTrain}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSaving ? "Saving..." : hasUnsavedChanges ? "Save session" : "Saved"}
            </button>
          </div>
        </div>

        <div
          className={`mt-5 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-4 ${
            mode === "train" ? "justify-between" : "justify-end"
          }`}
        >
          {mode === "train" ? (
            <div className="min-w-[min(100%,28rem)] flex-1">
              <div className="flex items-center justify-between gap-3">
                <p id={progressBarLabelId} className="text-sm font-semibold text-slate-900">
                  Execution progress
                </p>
                <p className="text-sm text-slate-600">
                  {executionSummary.completedSetCount} of {executionSummary.setCount}
                </p>
              </div>
              <div
                role="progressbar"
                aria-labelledby={progressBarLabelId}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={executionSummary.progressPercent}
                className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
              >
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width]"
                  style={{ width: `${executionSummary.progressPercent}%` }}
                />
              </div>
            </div>
          ) : null}

          <div
            role="tablist"
            aria-label="Dryland builder mode"
            className="inline-flex h-12 rounded-2xl border border-slate-200 bg-slate-50 p-1"
          >
            {(["train", "build"] as const).map((option) => {
              const selected = mode === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  data-testid={`dryland-mode-${option}`}
                  onClick={() => setMode(option)}
                  className={`inline-flex min-w-24 items-center justify-center rounded-xl px-4 text-sm font-semibold capitalize transition ${
                    selected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-white active:bg-slate-100"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {mode === "train" ? (
        <section data-testid="dryland-train-mode" className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <section
              data-testid="dryland-training-player"
              className="relative rounded-[2rem] border border-blue-100 bg-white p-5 text-slate-950 shadow-[0_16px_44px_rgba(37,99,235,0.12)] sm:p-6"
            >
              <div className="min-w-0 md:pr-52">
                <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                  Workout player
                </p>
                <button
                  type="button"
                  data-testid="dryland-complete-next-set"
                  onClick={completeNextSet}
                  disabled={!executionSummary.nextSet}
                  className="mt-4 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 md:absolute md:top-6 md:right-6 md:mt-0 md:w-auto"
                >
                  Complete set
                </button>
                {executionSummary.nextSet ? (
                  <>
                    <p data-testid="dryland-next-set-label" className="mt-4 text-3xl font-semibold">
                      {executionSummary.nextSet.exerciseTitle} · Set{" "}
                      {executionSummary.nextSet.setIndex + 1}
                    </p>
                    <p className="mt-2 text-base text-slate-600">
                      {executionSummary.nextSet.label}
                    </p>
                  </>
                ) : (
                  <p data-testid="dryland-next-set-label" className="mt-4 text-3xl font-semibold">
                    All sets complete
                  </p>
                )}
              </div>

              <div className="mt-6 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Remaining
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {executionSummary.remainingSetCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Duration
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {formatSecondsLabel(draft.actualDurationSeconds) ?? "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Save
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {hasUnsavedChanges ? "Pending" : "Current"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {!draft.startedAt ? (
                  <button
                    type="button"
                    data-testid="dryland-draft-start-timer"
                    onClick={startTimer}
                    disabled={!canSaveOrTrain}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    Start session
                  </button>
                ) : null}
                {draft.startedAt && !draft.completedAt ? (
                  <button
                    type="button"
                    data-testid="dryland-draft-stop-timer"
                    onClick={stopTimer}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 active:bg-emerald-700"
                  >
                    Stop session
                  </button>
                ) : null}
                {draft.startedAt || draft.completedAt || draft.actualDurationSeconds ? (
                  <button
                    type="button"
                    data-testid="dryland-draft-clear-timing"
                    onClick={clearTimer}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                  >
                    Clear timing
                  </button>
                ) : null}
              </div>
            </section>

            {currentExercise ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                      Current exercise
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                      {currentExercise.title}
                    </h3>
                  </div>
                  <span className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700">
                    {currentExerciseProgressPercent}%
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6">
                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      {getMediaSlotLabel(currentExercise)}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      No media is attached to this exercise.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        Note
                      </p>
                      <p className="mt-1 text-sm text-slate-800">{getCoachCue(currentExercise)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-2">
                  {currentExercise.sets.map((set, setIndex) => {
                    const isNext = executionSummary.nextSet?.setId === set.id;
                    const exerciseIndex = draft.exercises.findIndex(
                      (exercise) => exercise.id === currentExercise.id
                    );
                    return (
                      <button
                        key={set.id}
                        type="button"
                        data-testid={`dryland-set-chip-${exerciseIndex}-${setIndex}`}
                        aria-pressed={set.isCompleted}
                        onClick={() => toggleSetCompletion(currentExercise.id, set.id)}
                        className={`grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                          set.isCompleted
                            ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                            : isNext
                              ? "border-blue-200 bg-blue-50 text-blue-950 ring-2 ring-blue-400 ring-offset-2 hover:bg-blue-100 active:bg-blue-200"
                              : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100"
                        }`}
                      >
                        <span className="text-sm font-semibold">Set {setIndex + 1}</span>
                        <span className="truncate text-sm text-slate-700">
                          {buildDrylandSetChipLabel(set, draft.sessionKind)}
                        </span>
                        <span className="text-xs font-semibold">
                          {getSetStatusLabel(set, isNext)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 lg:sticky lg:top-4 lg:self-start">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-950">Session plan</h3>
              <span className="text-sm font-medium text-slate-500">
                {executionSummary.progressPercent}%
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${executionSummary.progressPercent}%` }}
              />
            </div>
            <div className="mt-4 space-y-2">
              {draft.exercises.map((exercise, index) => {
                const completed = countCompletedSets(exercise);
                const isCurrent = currentExercise?.id === exercise.id;
                return (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => setMode("build")}
                    className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                      isCurrent
                        ? "border-blue-200 bg-blue-50 text-blue-950"
                        : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">
                        {index + 1}. {exercise.title}
                      </span>
                      <span className="text-xs font-semibold">
                        {completed}/{exercise.sets.length}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </section>
      ) : (
        <section data-testid="dryland-build-mode" className="space-y-4">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">Build session</h3>
                  </div>
                  <span
                    data-testid="dryland-session-kind-locked-build"
                    className="inline-flex min-h-8 items-center rounded-full border border-blue-200 bg-blue-50 px-3 text-xs font-semibold tracking-wide text-blue-800 uppercase"
                  >
                    {getDrylandSessionKindLabel(draft.sessionKind)}
                  </span>
                </div>

                <div className="mt-5 grid gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-900">Title</span>
                    <input
                      data-testid="dryland-draft-title"
                      value={draft.title}
                      onChange={(event) => patchDraft({ title: event.target.value })}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-900">Description</span>
                    <textarea
                      data-testid="dryland-draft-description"
                      value={draft.description}
                      onChange={(event) => patchDraft({ description: event.target.value })}
                      rows={3}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-sm font-semibold tracking-wide text-slate-600 uppercase">
                  Timing
                </h4>
                <dl className="mt-3 space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between gap-3">
                    <dt>Started</dt>
                    <dd className="font-medium text-slate-900">
                      {formatDateTimeLabel(draft.startedAt)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Completed</dt>
                    <dd className="font-medium text-slate-900">
                      {formatDateTimeLabel(draft.completedAt)}
                    </dd>
                  </div>
                </dl>
                <label className="mt-4 block space-y-2">
                  <span id={actualDurationInputId} className="text-sm font-medium text-slate-900">
                    Duration (min)
                  </span>
                  <input
                    aria-labelledby={actualDurationInputId}
                    data-testid="dryland-draft-actual-duration"
                    value={toMinutesInputValue(draft.actualDurationSeconds)}
                    onChange={(event) =>
                      patchDraft({
                        actualDurationSeconds: parseMinutesToSeconds(event.target.value),
                      })
                    }
                    placeholder="Optional"
                    inputMode="decimal"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                  />
                </label>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!draft.startedAt ? (
                    <button
                      type="button"
                      data-testid="dryland-draft-start-timer"
                      onClick={startTimer}
                      disabled={!canSaveOrTrain}
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      Start
                    </button>
                  ) : null}
                  {draft.startedAt && !draft.completedAt ? (
                    <button
                      type="button"
                      data-testid="dryland-draft-stop-timer"
                      onClick={stopTimer}
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 active:bg-emerald-700"
                    >
                      Stop
                    </button>
                  ) : null}
                  {draft.startedAt || draft.completedAt || draft.actualDurationSeconds ? (
                    <button
                      type="button"
                      data-testid="dryland-draft-clear-timing"
                      onClick={clearTimer}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section
            data-testid="dryland-manual-exercises"
            className="rounded-[2rem] border border-slate-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Quick session</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Type the exercises you want to do now.
                </p>
              </div>
              <button
                type="button"
                data-testid="dryland-add-custom-exercise"
                onClick={() => addCustomExercise(draft.sessionKind)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Add exercise
              </button>
            </div>

            {simpleInputIssues.length > 0 ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-medium text-amber-950">Fix targets before training.</p>
                <p className="mt-1 text-sm text-amber-900">{simpleInputIssues[0]}</p>
              </div>
            ) : null}

            <div className="mt-5 space-y-3">
              {draft.exercises.map((exercise, exerciseIndex) => {
                const firstSet = exercise.sets[0] ?? null;
                const setTargetValue =
                  draft.sessionKind === "strength"
                    ? (firstSet?.reps ?? "")
                    : (firstSet?.holdSeconds ?? "");
                const isBuildExerciseOpen = openBuildExerciseIds.has(exercise.id);
                const setEditorId = `dryland-exercise-card-${exerciseIndex}`;
                return (
                  <article
                    key={exercise.id}
                    data-testid={`dryland-simple-exercise-row-${exerciseIndex}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_72px_80px_88px_88px_auto] lg:items-end">
                      <label className="grid gap-1">
                        <span className="text-sm font-medium text-slate-900">Exercise</span>
                        <input
                          data-testid={`dryland-manual-exercise-name-${exerciseIndex}`}
                          value={exercise.title}
                          onChange={(event) =>
                            updateExercise(exercise.id, (current) => ({
                              ...current,
                              title: event.target.value,
                              source: "custom",
                              bankExerciseId: null,
                            }))
                          }
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 transition outline-none focus:border-blue-400"
                        />
                      </label>

                      <label className="grid gap-1">
                        <span className="text-sm font-medium text-slate-900">Sets</span>
                        <input
                          aria-label={`Set count for exercise ${exerciseIndex + 1}`}
                          data-testid={`dryland-manual-exercise-set-count-${exerciseIndex}`}
                          value={getSimpleInputValue(exercise.id, "setCount", exercise.sets.length)}
                          onChange={(event) =>
                            updateExerciseSetCount(exercise.id, event.target.value)
                          }
                          inputMode="numeric"
                          min={DRYLAND_MIN_SETS_PER_EXERCISE}
                          max={DRYLAND_MAX_SETS_PER_EXERCISE}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                        />
                      </label>

                      <label className="grid gap-1">
                        <span className="text-sm font-medium text-slate-900">
                          {draft.sessionKind === "strength" ? "Reps" : "Hold sec"}
                        </span>
                        <input
                          aria-label={`${draft.sessionKind === "strength" ? "Reps" : "Hold seconds"} for exercise ${exerciseIndex + 1}`}
                          data-testid={`dryland-manual-exercise-target-${exerciseIndex}`}
                          value={getSimpleInputValue(exercise.id, "target", setTargetValue)}
                          onChange={(event) =>
                            updateAllExerciseSetField(
                              exercise.id,
                              draft.sessionKind === "strength" ? "reps" : "holdSeconds",
                              event.target.value
                            )
                          }
                          inputMode="numeric"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                        />
                      </label>

                      <label className="grid gap-1">
                        <span className="text-sm font-medium text-slate-900">Rest sec</span>
                        <input
                          aria-label={`Rest seconds for exercise ${exerciseIndex + 1}`}
                          data-testid={`dryland-manual-exercise-rest-${exerciseIndex}`}
                          value={getSimpleInputValue(
                            exercise.id,
                            "rest",
                            firstSet?.restSeconds ?? ""
                          )}
                          onChange={(event) =>
                            updateAllExerciseSetField(
                              exercise.id,
                              "restSeconds",
                              event.target.value
                            )
                          }
                          inputMode="numeric"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                        />
                      </label>

                      <label className="grid gap-1">
                        <span className="text-sm font-medium text-slate-900">Load kg</span>
                        {draft.sessionKind === "strength" ? (
                          <input
                            aria-label={`Load kg for exercise ${exerciseIndex + 1}`}
                            data-testid={`dryland-manual-exercise-load-${exerciseIndex}`}
                            value={getSimpleInputValue(exercise.id, "load", firstSet?.loadKg ?? "")}
                            onChange={(event) =>
                              updateAllExerciseSetField(exercise.id, "loadKg", event.target.value)
                            }
                            inputMode="decimal"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                          />
                        ) : (
                          <span className="flex h-11 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-400">
                            N/A
                          </span>
                        )}
                      </label>

                      <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                        <button
                          type="button"
                          aria-expanded={isBuildExerciseOpen}
                          aria-controls={setEditorId}
                          onClick={() => setBuildExerciseOpen(exercise.id, !isBuildExerciseOpen)}
                          className="inline-flex h-11 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-700 transition hover:bg-blue-50 active:bg-blue-100"
                        >
                          {isBuildExerciseOpen ? "Close set edits" : "Edit sets individually"}
                        </button>
                        <button
                          type="button"
                          data-testid={`dryland-exercise-remove-${exerciseIndex}`}
                          onClick={() => removeExercise(exercise.id)}
                          disabled={draft.exercises.length === 1}
                          className="inline-flex h-11 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-50 active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <label className="mt-3 grid gap-1">
                      <span className="text-sm font-medium text-slate-900">Notes</span>
                      <input
                        data-testid={`dryland-manual-exercise-notes-${exerciseIndex}`}
                        value={exercise.notes}
                        onChange={(event) =>
                          updateExercise(exercise.id, (current) => ({
                            ...current,
                            notes: event.target.value,
                            source: "custom",
                            bankExerciseId: null,
                          }))
                        }
                        placeholder="Optional cue"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                      />
                    </label>
                    {isBuildExerciseOpen
                      ? renderSetTargets(exercise, exerciseIndex, setEditorId)
                      : null}
                  </article>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={switchToTrainMode}
                disabled={!canSaveOrTrain}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                Open Train mode
              </button>
            </div>
          </section>
        </section>
      )}
    </div>
  );
}
