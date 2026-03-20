"use client";

import Link from "next/link";
import {
  SESSION_DRAFT_STEP_CATEGORIES,
  SESSION_DRAFT_STEP_DURATION_MODES,
  SESSION_GENERATOR_ENVIRONMENTS,
  SESSION_GENERATOR_EFFORT_PRESETS,
  SESSION_GENERATOR_EQUIPMENT,
  SESSION_GENERATOR_POOL_LENGTHS,
  SESSION_GENERATOR_SESSION_TYPES,
  SESSION_GENERATOR_STROKES,
  buildSessionTargetSummary,
  computeSessionDraftDerivedTotals,
  formatPoolLengthLabel,
  getSessionEffortLabel,
  getSessionEnvironmentLabel,
  getSessionEquipmentLabel,
  getSessionStepCategoryLabel,
  getSessionStrokeLabel,
  getSessionTypeLabel,
  type SessionDraft,
  type SessionDraftStep,
  type SessionDraftStepCategory,
  type SessionDraftStepDurationMode,
  type SessionGeneratorEnvironment,
  type SessionGeneratorPoolLength,
  type SessionGeneratorStroke,
} from "@/lib/session-generator-v1/shared";
import type { WorkoutEditorRecord, WorkoutSummary } from "@/lib/workouts/shared";

type Props = {
  draft: SessionDraft;
  savedWorkout: WorkoutEditorRecord | null;
  recentWorkouts: WorkoutSummary[];
  canonicalSaveReady: boolean;
  isSaving: boolean;
  onSave: () => void;
  onDraftChange: (draft: SessionDraft) => void;
  startNewDraftHref?: string | null;
  startNewDraftLabel?: string;
  showLoadedBanner?: boolean;
  loadedBannerTitle?: string;
  loadedBannerDescription?: string;
  recentWorkoutsDescription?: string;
  workoutHrefBuilder?: (workoutId: string) => string;
  saveButtonTestId?: string;
};

function buildBlankStep(index: number): SessionDraftStep {
  return {
    id: `step-${Date.now()}-${index}`,
    category: "main",
    name: "Custom step",
    stroke: "choice",
    intensity: "moderate",
    durationMode: "distance",
    distanceM: 100,
    timeMin: null,
    targetSummary: "",
    notes: "",
  };
}

function parsePositiveNumber(value: string) {
  if (!/^\d+(\.\d+)?$/.test(value)) return null;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export default function WorkoutEditor({
  draft,
  savedWorkout,
  recentWorkouts,
  canonicalSaveReady,
  isSaving,
  onSave,
  onDraftChange,
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

  function updateDraft<K extends keyof SessionDraft>(key: K, value: SessionDraft[K]) {
    onDraftChange({
      ...draft,
      [key]: value,
    });
  }

  function updateDraftStep(stepId: string, updater: (step: SessionDraftStep) => SessionDraftStep) {
    onDraftChange({
      ...draft,
      steps: draft.steps.map((step) => (step.id === stepId ? updater(step) : step)),
    });
  }

  function moveStep(stepId: string, direction: -1 | 1) {
    const index = draft.steps.findIndex((step) => step.id === stepId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= draft.steps.length) return;
    const nextSteps = [...draft.steps];
    const [step] = nextSteps.splice(index, 1);
    nextSteps.splice(nextIndex, 0, step);
    onDraftChange({
      ...draft,
      steps: nextSteps,
    });
  }

  function addStep() {
    onDraftChange({
      ...draft,
      steps: [...draft.steps, buildBlankStep(draft.steps.length + 1)],
    });
  }

  function removeStep(stepId: string) {
    onDraftChange({
      ...draft,
      steps: draft.steps.filter((step) => step.id !== stepId),
    });
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
          <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
            Pool length
            <select
              value={draft.poolLengthM ? String(draft.poolLengthM) : ""}
              onChange={(event) =>
                updateDraft(
                  "poolLengthM",
                  (parsePositiveNumber(event.target.value) as SessionGeneratorPoolLength | null) ??
                    null
                )
              }
              className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              {SESSION_GENERATOR_POOL_LENGTHS.map((value) => (
                <option key={value} value={String(value)}>
                  {formatPoolLengthLabel(value)}
                </option>
              ))}
            </select>
          </label>
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
                />
                {getSessionStrokeLabel(stroke)}
              </label>
            ))}
          </div>
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
                />
                {getSessionEquipmentLabel(item)}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">Editable draft steps</h3>
          <button
            type="button"
            onClick={addStep}
            data-testid="session-draft-add-step"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
          >
            Add step
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {draft.steps.map((step, index) => (
            <article
              key={step.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Step {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {getSessionStepCategoryLabel(step.category)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => moveStep(step.id, -1)}
                    disabled={index === 0}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(step.id, 1)}
                    disabled={index === draft.steps.length - 1}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Move down
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

              <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                    value={step.stroke}
                    onChange={(event) =>
                      updateDraftStep(step.id, (current) => ({
                        ...current,
                        stroke: event.target.value as SessionDraftStep["stroke"],
                      }))
                    }
                    className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="choice">Stroke choice</option>
                    {SESSION_GENERATOR_STROKES.map((value) => (
                      <option key={value} value={value}>
                        {getSessionStrokeLabel(value)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm text-slate-700">
                  Intensity
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
                      updateDraftStep(step.id, (current) => ({
                        ...current,
                        durationMode: event.target.value as SessionDraftStepDurationMode,
                        distanceM:
                          event.target.value === "distance" ? (current.distanceM ?? 100) : null,
                        timeMin: event.target.value === "time" ? (current.timeMin ?? 10) : null,
                      }))
                    }
                    className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    {SESSION_DRAFT_STEP_DURATION_MODES.map((value) => (
                      <option key={value} value={value}>
                        {value === "distance" ? "Distance" : "Time"}
                      </option>
                    ))}
                  </select>
                </label>

                {step.durationMode === "distance" ? (
                  <label className="text-sm text-slate-700">
                    Distance (m)
                    <input
                      type="text"
                      inputMode="numeric"
                      value={step.distanceM ?? ""}
                      onChange={(event) =>
                        updateDraftStep(step.id, (current) => ({
                          ...current,
                          distanceM: parsePositiveNumber(event.target.value),
                        }))
                      }
                      className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </label>
                ) : (
                  <label className="text-sm text-slate-700">
                    Time (min)
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
                      className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </label>
                )}

                <label className="text-sm text-slate-700 md:col-span-2">
                  Target summary
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
            </article>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <p className="text-sm text-slate-600">
          {savedWorkout
            ? "This workout is canonical now. Saving here updates the same workout instead of creating a new copy."
            : "Review the draft carefully, then accept it into the canonical workout layer when you are happy with it."}
        </p>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !canonicalSaveReady}
          data-testid={saveButtonTestId}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : savedWorkout ? "Save changes" : "Accept and save workout"}
        </button>
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
