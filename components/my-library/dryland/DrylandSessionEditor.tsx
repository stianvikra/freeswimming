"use client";

import { useId } from "react";
import Modal from "@/components/Modal";
import {
  buildCustomDrylandExercise,
  buildDrylandExerciseFromBankItem,
  getDrylandExerciseBankByKind,
} from "@/lib/dryland/exercise-bank";
import {
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
  if (seconds % 60 === 0) {
    return String(seconds / 60);
  }
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
      Media can be attached later. For now, use the how-to cues and target areas below while the
      exercise bank grows.
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
  const summary = buildDrylandSummary(draft);
  const activeDetailExercise =
    draft.exercises.find((exercise) => exercise.id === activeDetailExerciseId) ?? null;
  const focusInputId = useId();
  const actualDurationInputId = useId();

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
    if (draft.exercises.length === 1) {
      return;
    }
    onDraftChange({
      ...draft,
      exercises: draft.exercises.filter((exercise) => exercise.id !== exerciseId),
    });
    if (activeDetailExerciseId === exerciseId) {
      onCloseExerciseDetail();
    }
  }

  function addBankExercise(kind: DrylandSessionKind, bankId: string) {
    const bankItem = getDrylandExerciseBankByKind(kind).find((item) => item.id === bankId);
    if (!bankItem) return;
    onDraftChange({
      ...draft,
      exercises: [...draft.exercises, buildDrylandExerciseFromBankItem(bankItem)],
    });
  }

  function addCustomExercise(kind: DrylandSessionKind) {
    onDraftChange({
      ...draft,
      exercises: [...draft.exercises, buildCustomDrylandExercise(kind)],
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
    <div className="space-y-6">
      <section className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Current saved session
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{draft.title}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {getDrylandSessionKindLabel(draft.sessionKind)} · {summary.exerciseCount} exercise
              {summary.exerciseCount === 1 ? "" : "s"} · {summary.setCount} set
              {summary.setCount === 1 ? "" : "s"} · {summary.completedSetCount} completed
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800">
              {getDrylandStatusLabel(savedSession.status)}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Updated {formatDateTimeLabel(savedSession.updatedAt)}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Session setup</h3>
            <p className="mt-2 max-w-[68ch] text-sm text-slate-600">
              Keep the dryland form simple: choose the session type, capture the goal, then add or
              trim only the exercises and sets you actually want to use.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              data-testid="dryland-editor-save-state"
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700"
            >
              {hasUnsavedChanges
                ? "Unsaved changes stay local until you save"
                : "All dryland changes are saved"}
            </span>
            <button
              type="button"
              onClick={onResetToSaved}
              disabled={!hasUnsavedChanges || isSaving}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset to saved
            </button>
            <button
              type="button"
              data-testid="dryland-builder-save"
              onClick={onSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSaving ? "Saving..." : "Save session"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">Session type</span>
            <select
              data-testid="dryland-draft-kind"
              value={draft.sessionKind}
              onChange={(event) =>
                patchDraft({
                  sessionKind: event.target.value === "stretching" ? "stretching" : "strength",
                })
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400"
            >
              <option value="strength">Strength</option>
              <option value="stretching">Stretching</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900">Title</span>
            <input
              data-testid="dryland-draft-title"
              value={draft.title}
              onChange={(event) => patchDraft({ title: event.target.value })}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400"
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-900">Description</span>
            <textarea
              data-testid="dryland-draft-description"
              value={draft.description}
              onChange={(event) => patchDraft({ description: event.target.value })}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400"
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
              placeholder="One short cue for this session"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400"
            />
          </label>
          <label className="space-y-2">
            <span id={actualDurationInputId} className="text-sm font-medium text-slate-900">
              Actual duration (min)
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
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400"
            />
          </label>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Session timing
              </h4>
              <p className="mt-2 text-sm text-slate-600">
                Use start/stop when you want a real completion timestamp, or just fill in the final
                duration manually if you are catching up afterward.
              </p>
              <dl className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
                <div>
                  <dt className="font-medium text-slate-900">Started</dt>
                  <dd>{formatDateTimeLabel(draft.startedAt)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900">Completed</dt>
                  <dd>{formatDateTimeLabel(draft.completedAt)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900">Actual duration</dt>
                  <dd>{formatSecondsLabel(draft.actualDurationSeconds) ?? "Not set"}</dd>
                </div>
              </dl>
            </div>
            <div className="flex flex-wrap gap-2">
              {!draft.startedAt ? (
                <button
                  type="button"
                  data-testid="dryland-draft-start-timer"
                  onClick={startTimer}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
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
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Exercise bank</h3>
            <p className="mt-2 max-w-[68ch] text-sm text-slate-600">
              Start from the shared bank when it is good enough, or add a custom exercise when you
              want to write the movement yourself.
            </p>
          </div>
          <button
            type="button"
            data-testid="dryland-add-custom-exercise"
            onClick={() => addCustomExercise(draft.sessionKind)}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
          >
            Add custom exercise
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {getDrylandExerciseBankByKind(draft.sessionKind).map((item) => (
            <article
              key={item.id}
              className={`rounded-2xl border p-4 ${accentClasses(item.accent)}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                {draft.sessionKind === "strength" ? "Strength bank" : "Stretch bank"}
              </p>
              <h4 className="mt-2 text-base font-semibold">{item.title}</h4>
              <p className="mt-2 text-sm opacity-90">{item.summary}</p>
              <p className="mt-3 text-xs opacity-80">{item.targetAreas.join(" · ")}</p>
              <button
                type="button"
                data-testid={`dryland-bank-add-${item.id}`}
                onClick={() => addBankExercise(draft.sessionKind, item.id)}
                className="border-current/15 mt-4 inline-flex h-10 items-center justify-center rounded-xl border bg-white px-4 text-sm font-medium transition hover:bg-white/80 active:bg-white/70"
              >
                Add exercise
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Execution view</h3>
            <p className="mt-2 max-w-[68ch] text-sm text-slate-600">
              Keep the left side for the exercise itself, and use the colored chips to mark sets
              complete as you go. Incomplete work stays warm-colored; completed sets turn green.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {draft.exercises.map((exercise, exerciseIndex) => (
            <article
              key={exercise.id}
              data-testid={`dryland-exercise-card-${exerciseIndex}`}
              className="rounded-3xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-xs font-semibold uppercase tracking-wide ${accentClasses(
                          exercise.accent
                        )}`}
                      >
                        {exercise.mediaType === "video"
                          ? "Video"
                          : exercise.mediaType === "image"
                            ? "Image"
                            : exercise.source === "bank"
                              ? "Bank"
                              : "Custom"}
                      </div>
                      <div className="min-w-0 space-y-3">
                        <input
                          data-testid={`dryland-exercise-title-${exerciseIndex}`}
                          value={exercise.title}
                          onChange={(event) =>
                            updateExercise(exercise.id, (current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-900 outline-none transition focus:border-blue-400"
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
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        data-testid={`dryland-exercise-detail-${exerciseIndex}`}
                        onClick={() => onOpenExerciseDetail(exercise.id)}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        data-testid={`dryland-exercise-remove-${exerciseIndex}`}
                        onClick={() => removeExercise(exercise.id)}
                        disabled={draft.exercises.length === 1}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-50 active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-900">How-to</span>
                      <textarea
                        value={exercise.howTo}
                        onChange={(event) =>
                          updateExercise(exercise.id, (current) => ({
                            ...current,
                            howTo: event.target.value,
                          }))
                        }
                        rows={4}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400"
                      />
                    </label>
                    <div className="space-y-4">
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-900">Target areas</span>
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
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-900">Notes</span>
                        <textarea
                          value={exercise.notes}
                          onChange={(event) =>
                            updateExercise(exercise.id, (current) => ({
                              ...current,
                              notes: event.target.value,
                            }))
                          }
                          rows={3}
                          placeholder="Optional coaching cue or variation"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                      Sets
                    </h4>
                    <button
                      type="button"
                      data-testid={`dryland-add-set-${exerciseIndex}`}
                      onClick={() => addSet(exercise.id)}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                    >
                      Add set
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {exercise.sets.map((set, setIndex) => (
                      <button
                        key={set.id}
                        type="button"
                        data-testid={`dryland-set-chip-${exerciseIndex}-${setIndex}`}
                        onClick={() => toggleSetCompletion(exercise.id, set.id)}
                        className={[
                          "inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition",
                          set.isCompleted
                            ? "border-emerald-300 bg-emerald-100 text-emerald-900"
                            : "border-orange-200 bg-orange-50 text-orange-900 hover:bg-orange-100 active:bg-orange-200",
                        ].join(" ")}
                      >
                        {buildDrylandSetChipLabel(set, draft.sessionKind)}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={set.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900">Set {setIndex + 1}</p>
                          <button
                            type="button"
                            data-testid={`dryland-set-remove-${exerciseIndex}-${setIndex}`}
                            onClick={() => removeSet(exercise.id, set.id)}
                            disabled={exercise.sets.length === 1}
                            className="inline-flex h-8 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-50 active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {draft.sessionKind === "strength" ? (
                            <label className="space-y-1">
                              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Reps
                              </span>
                              <input
                                value={set.reps ?? ""}
                                onChange={(event) =>
                                  updateSetField(exercise.id, set.id, "reps", event.target.value)
                                }
                                inputMode="numeric"
                                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400"
                              />
                            </label>
                          ) : (
                            <label className="space-y-1">
                              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Hold (sec)
                              </span>
                              <input
                                value={set.holdSeconds ?? ""}
                                onChange={(event) =>
                                  updateSetField(
                                    exercise.id,
                                    set.id,
                                    "holdSeconds",
                                    event.target.value
                                  )
                                }
                                inputMode="numeric"
                                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400"
                              />
                            </label>
                          )}

                          <label className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                              Pause (sec)
                            </span>
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
                              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400"
                            />
                          </label>

                          {draft.sessionKind === "strength" ? (
                            <label className="space-y-1 sm:col-span-2">
                              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Load (kg, optional)
                              </span>
                              <input
                                value={set.loadKg ?? ""}
                                onChange={(event) =>
                                  updateSetField(exercise.id, set.id, "loadKg", event.target.value)
                                }
                                inputMode="decimal"
                                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-400"
                              />
                            </label>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

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
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
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
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                    How to do it
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {activeDetailExercise.howTo ||
                      "Add exact execution notes in the editor when you want more detail here."}
                  </p>
                </section>
                <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
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
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
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
