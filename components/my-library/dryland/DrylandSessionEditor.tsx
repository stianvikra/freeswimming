"use client";

import { useId, useState } from "react";
import Modal from "@/components/Modal";
import {
  buildCustomDrylandExercise,
  buildDrylandExerciseFromBankItem,
  getDrylandExerciseBankByKind,
} from "@/lib/dryland/exercise-bank";
import {
  buildDrylandExecutionSummary,
  buildDrylandSetChipLabel,
  buildDrylandSummary,
  formatSecondsLabel,
  getDrylandSessionKindLabel,
  getDrylandStatusLabel,
  type DrylandExerciseAccent,
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
  activeDetailExerciseId: string | null;
  onOpenExerciseDetail: (exerciseId: string) => void;
  onCloseExerciseDetail: () => void;
};

type DrylandEditorMode = "train" | "build";

function accentClasses(accent: DrylandExerciseAccent) {
  switch (accent) {
    case "amber":
      return "border-amber-200 bg-amber-50/80 text-amber-950";
    case "emerald":
      return "border-emerald-200 bg-emerald-50/80 text-emerald-950";
    case "rose":
      return "border-rose-200 bg-rose-50/80 text-rose-950";
    case "teal":
      return "border-teal-200 bg-teal-50/80 text-teal-950";
    default:
      return "border-blue-200 bg-blue-50/80 text-blue-950";
  }
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

function firstSentence(value: string) {
  return value.split(".")[0]?.trim() || "";
}

function getCoachCue(exercise: DrylandExerciseDraft) {
  return exercise.notes.trim() || firstSentence(exercise.howTo) || "Coach cue placeholder";
}

function getSwimRelevance(exercise: DrylandExerciseDraft, focusText: string | null) {
  if (focusText) return focusText;
  if (exercise.targetAreas.length > 0) return exercise.targetAreas.slice(0, 3).join(" · ");
  return "Swim relevance placeholder";
}

function getMediaSlotLabel(exercise: DrylandExerciseDraft) {
  if (exercise.mediaType === "video") return "Video attached";
  if (exercise.mediaType === "image") return "Image attached";
  return "Media slot";
}

function getSetStatusLabel(set: DrylandExerciseDraft["sets"][number], isNext: boolean) {
  if (set.isCompleted) return "Done";
  if (isNext) return "Now";
  return "Queued";
}

function getSetStatusClasses(set: DrylandExerciseDraft["sets"][number], isNext: boolean) {
  if (set.isCompleted) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (isNext) return "border-blue-200 bg-blue-50 text-blue-800";
  return "border-slate-200 bg-white text-slate-700";
}

function countCompletedSets(exercise: DrylandExerciseDraft) {
  return exercise.sets.filter((set) => set.isCompleted).length;
}

function SetMetricLabel({ children }: { children: string }) {
  return <span className="text-xs font-medium text-slate-500 sm:hidden">{children}</span>;
}

function buildDetailCopy(exercise: DrylandExerciseDraft) {
  if (exercise.mediaType === "image" && exercise.mediaUrl) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
        <p className="text-sm font-semibold text-blue-950">
          {exercise.mediaLabel ?? `${exercise.title} reference image`}
        </p>
        <p className="mt-2 text-sm text-blue-900/90">
          This exercise already points to an image reference. Open the raw asset in a new tab when
          you want the larger visual until the dedicated media surface ships.
        </p>
        <a
          href={exercise.mediaUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-900 transition hover:bg-blue-100 active:bg-blue-200"
        >
          Open image reference
        </a>
      </div>
    );
  }

  if (exercise.mediaType === "video" && exercise.mediaUrl) {
    return (
      <video
        controls
        playsInline
        poster={exercise.mediaPosterUrl ?? undefined}
        className="max-h-72 w-full rounded-2xl bg-slate-950"
      >
        <source src={exercise.mediaUrl} />
      </video>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-sm text-slate-600">
      Media can be attached later. For now, use the how-to cues and target areas while the exercise
      bank grows.
    </div>
  );
}

export default function DrylandSessionEditor({
  draft,
  savedSession,
  isSaving,
  hasUnsavedChanges,
  onDraftChange,
  onSave,
  onResetToSaved,
  activeDetailExerciseId,
  onOpenExerciseDetail,
  onCloseExerciseDetail,
}: Props) {
  const [mode, setMode] = useState<DrylandEditorMode>("train");
  const [openBuildExerciseIds, setOpenBuildExerciseIds] = useState<Set<string>>(() => new Set());
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
  const activeDetailExercise =
    draft.exercises.find((exercise) => exercise.id === activeDetailExerciseId) ?? null;
  const focusInputId = useId();
  const actualDurationInputId = useId();
  const progressBarLabelId = useId();

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
    if (activeDetailExerciseId === exerciseId) onCloseExerciseDetail();
    setOpenBuildExerciseIds((current) => {
      const next = new Set(current);
      next.delete(exerciseId);
      return next;
    });
  }

  function addBankExercise(kind: DrylandSessionKind, bankId: string) {
    const bankItem = getDrylandExerciseBankByKind(kind).find((item) => item.id === bankId);
    if (!bankItem) return;
    const nextExercise = buildDrylandExerciseFromBankItem(bankItem);
    onDraftChange({
      ...draft,
      exercises: [...draft.exercises, nextExercise],
    });
    setOpenBuildExerciseIds(new Set([nextExercise.id]));
  }

  function addCustomExercise(kind: DrylandSessionKind) {
    const nextExercise = buildCustomDrylandExercise(kind);
    onDraftChange({
      ...draft,
      exercises: [...draft.exercises, nextExercise],
    });
    setOpenBuildExerciseIds(new Set([nextExercise.id]));
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
        const parsed = trimmed.length > 0 ? Number.parseInt(trimmed, 10) : Number.NaN;
        const normalized = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
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

  function startTimer() {
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
              onClick={onResetToSaved}
              disabled={!hasUnsavedChanges || isSaving}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset
            </button>
            <button
              type="button"
              data-testid="dryland-builder-save"
              onClick={onSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSaving ? "Saving..." : hasUnsavedChanges ? "Save session" : "Saved"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
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
            <p
              data-testid="dryland-editor-save-state"
              className="mt-3 text-sm font-medium text-slate-700"
            >
              {hasUnsavedChanges
                ? "Unsaved changes stay local until you save"
                : "All dryland changes are saved"}
            </p>
          </div>

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
                      ? "bg-slate-950 text-white shadow-sm"
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
              className="relative rounded-[2rem] bg-slate-950 p-5 text-white shadow-[0_18px_50px_rgba(15,23,42,0.22)] sm:p-6"
            >
              <div className="min-w-0 md:pr-52">
                <p className="text-xs font-semibold tracking-wide text-blue-200 uppercase">
                  Workout player
                </p>
                <button
                  type="button"
                  data-testid="dryland-complete-next-set"
                  onClick={completeNextSet}
                  disabled={!executionSummary.nextSet}
                  className="mt-4 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-500 px-6 text-sm font-semibold text-white transition hover:bg-emerald-400 active:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-700 md:absolute md:top-6 md:right-6 md:mt-0 md:w-auto"
                >
                  Complete set
                </button>
                {executionSummary.nextSet ? (
                  <>
                    <p data-testid="dryland-next-set-label" className="mt-4 text-3xl font-semibold">
                      {executionSummary.nextSet.exerciseTitle} · Set{" "}
                      {executionSummary.nextSet.setIndex + 1}
                    </p>
                    <p className="mt-2 text-base text-slate-300">
                      {executionSummary.nextSet.label}
                    </p>
                  </>
                ) : (
                  <p data-testid="dryland-next-set-label" className="mt-4 text-3xl font-semibold">
                    All sets complete
                  </p>
                )}
              </div>

              <div className="mt-6 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    Remaining
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {executionSummary.remainingSetCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    Duration
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {formatSecondsLabel(draft.actualDurationSeconds) ?? "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
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
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 active:bg-slate-200"
                  >
                    Start session
                  </button>
                ) : null}
                {draft.startedAt && !draft.completedAt ? (
                  <button
                    type="button"
                    data-testid="dryland-draft-stop-timer"
                    onClick={stopTimer}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:bg-emerald-400 active:bg-emerald-600"
                  >
                    Stop session
                  </button>
                ) : null}
                {draft.startedAt || draft.completedAt || draft.actualDurationSeconds ? (
                  <button
                    type="button"
                    data-testid="dryland-draft-clear-timing"
                    onClick={clearTimer}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-white/20 px-4 text-sm font-medium text-white transition hover:bg-white/10 active:bg-white/15"
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
                    <p className="mt-2 max-w-[70ch] text-sm text-slate-600">
                      {currentExercise.summary}
                    </p>
                  </div>
                  <span className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700">
                    {currentExerciseProgressPercent}%
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenExerciseDetail(currentExercise.id)}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                  >
                    Details
                  </button>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6">
                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      {getMediaSlotLabel(currentExercise)}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      Add real exercise video or image content later without changing this player
                      layout.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        Coach cue
                      </p>
                      <p className="mt-1 text-sm text-slate-800">{getCoachCue(currentExercise)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                        Swim relevance
                      </p>
                      <p className="mt-1 text-sm text-slate-800">
                        {getSwimRelevance(currentExercise, draft.focusText)}
                      </p>
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
                    <p className="mt-1 text-sm text-slate-600">
                      Compose the plan. Train mode stays clean for execution.
                    </p>
                  </div>
                  <span
                    data-testid="dryland-session-kind-locked-build"
                    className="inline-flex min-h-8 items-center rounded-full border border-blue-200 bg-blue-50 px-3 text-xs font-semibold tracking-wide text-blue-800 uppercase"
                  >
                    {getDrylandSessionKindLabel(draft.sessionKind)}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
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
                    <span id={focusInputId} className="text-sm font-medium text-slate-900">
                      Focus cue
                    </span>
                    <input
                      aria-labelledby={focusInputId}
                      data-testid="dryland-draft-focus"
                      value={draft.focusText ?? ""}
                      onChange={(event) => patchDraft({ focusText: event.target.value || null })}
                      placeholder="One short cue"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
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
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
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

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Add exercises</h3>
                <p className="mt-1 text-sm text-slate-600">Pick from the bank or add custom.</p>
              </div>
              <button
                type="button"
                data-testid="dryland-add-custom-exercise"
                onClick={() => addCustomExercise(draft.sessionKind)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Add custom
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {getDrylandExerciseBankByKind(draft.sessionKind).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`dryland-bank-add-${item.id}`}
                  onClick={() => addBankExercise(draft.sessionKind, item.id)}
                  className={`rounded-2xl border p-4 text-left transition hover:shadow-sm ${accentClasses(
                    item.accent
                  )}`}
                >
                  <span className="text-xs font-semibold tracking-wide uppercase opacity-80">
                    {draft.sessionKind === "strength" ? "Strength" : "Stretch"}
                  </span>
                  <span className="mt-2 block text-base font-semibold">{item.title}</span>
                  <span className="mt-2 line-clamp-2 block text-sm opacity-90">{item.summary}</span>
                  <span className="mt-3 block text-xs opacity-80">
                    {item.targetAreas.join(" · ")}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Session plan</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Edit one exercise at a time. The plan stays compact until you open a movement.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMode("train")}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 active:bg-slate-900"
              >
                Train this
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {draft.exercises.map((exercise, exerciseIndex) => {
                const isBuildExerciseOpen = openBuildExerciseIds.has(exercise.id);
                const completed = countCompletedSets(exercise);
                return (
                  <article
                    key={exercise.id}
                    data-testid={`dryland-exercise-card-${exerciseIndex}`}
                    className={`rounded-2xl border transition ${
                      isBuildExerciseOpen
                        ? "border-blue-200 bg-blue-50/35"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="grid gap-3 p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                        {exerciseIndex + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-base font-semibold text-slate-950">{exercise.title}</h4>
                        <p className="mt-1 text-sm text-slate-600">
                          {completed}/{exercise.sets.length} sets · {getMediaSlotLabel(exercise)} ·{" "}
                          {exercise.targetAreas.slice(0, 3).join(" · ") || "No target areas"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <button
                          type="button"
                          onClick={() => setBuildExerciseOpen(exercise.id, !isBuildExerciseOpen)}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                        >
                          {isBuildExerciseOpen ? "Close" : "Edit"}
                        </button>
                        <button
                          type="button"
                          data-testid={`dryland-exercise-detail-${exerciseIndex}`}
                          onClick={() => onOpenExerciseDetail(exercise.id)}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                        >
                          Details
                        </button>
                      </div>
                    </div>

                    {isBuildExerciseOpen ? (
                      <div className="border-t border-blue-100 p-4">
                        <div className="grid gap-3 lg:grid-cols-[minmax(180px,0.75fr)_minmax(0,1fr)_auto]">
                          <input
                            data-testid={`dryland-exercise-title-${exerciseIndex}`}
                            value={exercise.title}
                            onChange={(event) =>
                              updateExercise(exercise.id, (current) => ({
                                ...current,
                                title: event.target.value,
                              }))
                            }
                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-900 transition outline-none focus:border-blue-400"
                          />
                          <textarea
                            data-testid={`dryland-exercise-summary-${exerciseIndex}`}
                            value={exercise.summary}
                            onChange={(event) =>
                              updateExercise(exercise.id, (current) => ({
                                ...current,
                                summary: event.target.value,
                              }))
                            }
                            rows={2}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition outline-none focus:border-blue-400"
                          />
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

                        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
                          <div className="space-y-3">
                            <label className="block space-y-2">
                              <span className="text-sm font-medium text-slate-900">How-to</span>
                              <textarea
                                value={exercise.howTo}
                                onChange={(event) =>
                                  updateExercise(exercise.id, (current) => ({
                                    ...current,
                                    howTo: event.target.value,
                                  }))
                                }
                                rows={3}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition outline-none focus:border-blue-400"
                              />
                            </label>
                            <div>
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <h5 className="text-sm font-semibold text-slate-900">
                                  Set targets
                                </h5>
                                <button
                                  type="button"
                                  data-testid={`dryland-add-set-${exerciseIndex}`}
                                  onClick={() => addSet(exercise.id)}
                                  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                                >
                                  Add set
                                </button>
                              </div>
                              <div className="mt-3 hidden grid-cols-[64px_minmax(80px,1fr)_minmax(80px,1fr)_minmax(90px,1fr)_86px_76px] gap-2 border-b border-slate-200 pb-2 text-xs font-semibold text-slate-500 sm:grid">
                                <span>Set</span>
                                <span>{draft.sessionKind === "strength" ? "Reps" : "Hold"}</span>
                                <span>Pause</span>
                                <span>Load</span>
                                <span>Status</span>
                                <span className="text-right">Action</span>
                              </div>
                              <div className="divide-y divide-slate-200">
                                {exercise.sets.map((set, setIndex) => {
                                  const isNext = executionSummary.nextSet?.setId === set.id;
                                  return (
                                    <div
                                      key={set.id}
                                      className={`grid gap-2 py-3 sm:grid-cols-[64px_minmax(80px,1fr)_minmax(80px,1fr)_minmax(90px,1fr)_86px_76px] sm:items-center ${
                                        isNext ? "rounded-2xl bg-blue-50 px-3 sm:-mx-3" : ""
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-3 sm:block">
                                        <span className="text-sm font-semibold text-slate-900">
                                          Set {setIndex + 1}
                                        </span>
                                        <button
                                          type="button"
                                          data-testid={`dryland-set-chip-${exerciseIndex}-${setIndex}`}
                                          aria-pressed={set.isCompleted}
                                          onClick={() => toggleSetCompletion(exercise.id, set.id)}
                                          className={`inline-flex h-9 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition sm:hidden ${getSetStatusClasses(
                                            set,
                                            isNext
                                          )}`}
                                        >
                                          {getSetStatusLabel(set, isNext)}
                                        </button>
                                      </div>

                                      <label className="grid gap-1">
                                        <SetMetricLabel>
                                          {draft.sessionKind === "strength" ? "Reps" : "Hold sec"}
                                        </SetMetricLabel>
                                        <input
                                          value={
                                            draft.sessionKind === "strength"
                                              ? (set.reps ?? "")
                                              : (set.holdSeconds ?? "")
                                          }
                                          onChange={(event) =>
                                            updateSetField(
                                              exercise.id,
                                              set.id,
                                              draft.sessionKind === "strength"
                                                ? "reps"
                                                : "holdSeconds",
                                              event.target.value
                                            )
                                          }
                                          inputMode="numeric"
                                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                                        />
                                      </label>

                                      <label className="grid gap-1">
                                        <SetMetricLabel>Pause sec</SetMetricLabel>
                                        <input
                                          value={set.restSeconds ?? ""}
                                          onChange={(event) =>
                                            updateSetField(
                                              exercise.id,
                                              set.id,
                                              "restSeconds",
                                              event.target.value
                                            )
                                          }
                                          inputMode="numeric"
                                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                                        />
                                      </label>

                                      <label className="grid gap-1">
                                        <SetMetricLabel>Load kg</SetMetricLabel>
                                        {draft.sessionKind === "strength" ? (
                                          <input
                                            value={set.loadKg ?? ""}
                                            onChange={(event) =>
                                              updateSetField(
                                                exercise.id,
                                                set.id,
                                                "loadKg",
                                                event.target.value
                                              )
                                            }
                                            inputMode="decimal"
                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                                          />
                                        ) : (
                                          <span className="hidden text-sm text-slate-400 sm:block">
                                            N/A
                                          </span>
                                        )}
                                      </label>

                                      <button
                                        type="button"
                                        data-testid={`dryland-set-chip-desktop-${exerciseIndex}-${setIndex}`}
                                        aria-pressed={set.isCompleted}
                                        onClick={() => toggleSetCompletion(exercise.id, set.id)}
                                        className={`hidden h-9 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition sm:inline-flex ${getSetStatusClasses(
                                          set,
                                          isNext
                                        )}`}
                                      >
                                        {getSetStatusLabel(set, isNext)}
                                      </button>

                                      <button
                                        type="button"
                                        data-testid={`dryland-set-remove-${exerciseIndex}-${setIndex}`}
                                        onClick={() => removeSet(exercise.id, set.id)}
                                        disabled={exercise.sets.length === 1}
                                        className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-50 active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 sm:justify-self-end"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <h5 className="text-sm font-semibold tracking-wide text-slate-600 uppercase">
                              Guidance
                            </h5>
                            <div className="mt-3 space-y-3">
                              <label className="block space-y-2">
                                <span className="text-sm font-medium text-slate-900">
                                  Target areas
                                </span>
                                <input
                                  value={exercise.targetAreas.join(", ")}
                                  onChange={(event) =>
                                    updateExercise(exercise.id, (current) => ({
                                      ...current,
                                      targetAreas: event.target.value
                                        .split(",")
                                        .map((entry) => entry.trim())
                                        .filter(Boolean)
                                        .slice(0, 8),
                                    }))
                                  }
                                  placeholder="Glutes, Core, Shoulders"
                                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                                />
                              </label>
                              <label className="block space-y-2">
                                <span className="text-sm font-medium text-slate-900">Notes</span>
                                <input
                                  value={exercise.notes}
                                  onChange={(event) =>
                                    updateExercise(exercise.id, (current) => ({
                                      ...current,
                                      notes: event.target.value,
                                    }))
                                  }
                                  placeholder="Optional cue"
                                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-400"
                                />
                              </label>
                              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                  Common mistake
                                </p>
                                <p className="mt-1 text-sm text-slate-700">Placeholder</p>
                              </div>
                              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                  {getMediaSlotLabel(exercise)}
                                </p>
                                <p className="mt-1 text-sm text-slate-700">
                                  Real media attaches here later.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        </section>
      )}

      <Modal
        isOpen={Boolean(activeDetailExercise)}
        onClose={onCloseExerciseDetail}
        ariaLabel={
          activeDetailExercise ? `${activeDetailExercise.title} details` : "Exercise details"
        }
      >
        {activeDetailExercise ? (
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                  Exercise detail
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  {activeDetailExercise.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{activeDetailExercise.summary}</p>
              </div>
              <button
                type="button"
                onClick={onCloseExerciseDetail}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-5">
                {buildDetailCopy(activeDetailExercise)}
                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <h4 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">
                    How to do it
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {activeDetailExercise.howTo ||
                      "Add exact execution notes in the editor when you want more detail here."}
                  </p>
                </section>
                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <h4 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">
                    What it trains or opens
                  </h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeDetailExercise.targetAreas.length > 0 ? (
                      activeDetailExercise.targetAreas.map((area) => (
                        <span
                          key={area}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {area}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-600">
                        Add target areas in the editor when you want them called out here.
                      </span>
                    )}
                  </div>
                </section>
                {activeDetailExercise.notes ? (
                  <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <h4 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">
                      Session note
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {activeDetailExercise.notes}
                    </p>
                  </section>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
