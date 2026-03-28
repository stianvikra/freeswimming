"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import WorkoutEditor from "@/components/my-library/workouts/WorkoutEditor";
import type {
  GeneratorIntakeHandoffPayload,
  GeneratorIntakeOverrides,
  GeneratorIntakeSelection,
} from "@/lib/generator-intake/shared";
import {
  SESSION_GENERATOR_EFFORT_PRESETS,
  SESSION_GENERATOR_ENVIRONMENTS,
  SESSION_GENERATOR_EQUIPMENT,
  SESSION_GENERATOR_POOL_LENGTHS,
  SESSION_GENERATOR_SESSION_TYPES,
  SESSION_GENERATOR_STROKES,
  formatPoolLengthLabel,
  getDefaultSessionGeneratorFormState,
  getSessionEffortLabel,
  getSessionEnvironmentLabel,
  getSessionEquipmentLabel,
  getSessionStrokeLabel,
  getSessionTypeLabel,
  normalizeSessionGeneratorFormState,
  type SessionDraft,
  type SessionDraftApiResponse,
  type SessionGeneratorEquipment,
  type SessionGeneratorFormState,
  type SessionGeneratorStroke,
} from "@/lib/session-generator-v1/shared";
import type {
  WorkoutEditorRecord,
  WorkoutLibrarySnapshot,
  WorkoutSaveApiResponse,
  WorkoutSummary,
} from "@/lib/workouts/shared";
import { haveWorkoutDraftChanges } from "@/lib/workouts/shared";

type Props = {
  payload: GeneratorIntakeHandoffPayload;
  selection: GeneratorIntakeSelection;
  overrides: GeneratorIntakeOverrides;
  handoffPrepared: boolean;
  workoutLibrary: WorkoutLibrarySnapshot;
};

export default function SessionGeneratorPanel({
  payload,
  selection,
  overrides,
  handoffPrepared,
  workoutLibrary,
}: Props) {
  const [formState, setFormState] = useState<SessionGeneratorFormState>(() =>
    getDefaultSessionGeneratorFormState(payload)
  );
  const [draft, setDraft] = useState<SessionDraft | null>(null);
  const [savedWorkout, setSavedWorkout] = useState<WorkoutEditorRecord | null>(
    workoutLibrary.selectedWorkout
  );
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSummary[]>(
    workoutLibrary.recentWorkouts
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (workoutLibrary.selectedWorkout) {
      setSavedWorkout(workoutLibrary.selectedWorkout);
      setDraft(workoutLibrary.selectedWorkout.draft);
      setError("");
      setSuccess("");
      return;
    }

    setSavedWorkout(null);
    setDraft(null);
    setError("");
    setSuccess("");
  }, [workoutLibrary.selectedWorkout]);

  useEffect(() => {
    if (workoutLibrary.selectedWorkout) return;
    setFormState(getDefaultSessionGeneratorFormState(payload));
  }, [payload, workoutLibrary.selectedWorkout]);

  useEffect(() => {
    setRecentWorkouts(workoutLibrary.recentWorkouts);
  }, [workoutLibrary.recentWorkouts]);

  const sessionReady = payload.overrides.targetType === "session" && handoffPrepared;
  const canonicalSaveReady = workoutLibrary.schemaReady;
  const hasLoadedCanonicalWorkout = Boolean(savedWorkout);
  const hasUnsavedChanges = savedWorkout
    ? haveWorkoutDraftChanges(draft, savedWorkout.draft)
    : true;

  function updateFormState<K extends keyof SessionGeneratorFormState>(
    key: K,
    value: SessionGeneratorFormState[K]
  ) {
    setFormState((current) =>
      normalizeSessionGeneratorFormState(
        {
          ...current,
          [key]: value,
        },
        payload
      )
    );
    setError("");
    setSuccess("");
  }

  function toggleStroke(stroke: SessionGeneratorStroke) {
    const exists = formState.allowedStrokes.includes(stroke);
    updateFormState(
      "allowedStrokes",
      exists
        ? formState.allowedStrokes.filter((value) => value !== stroke)
        : [...formState.allowedStrokes, stroke]
    );
  }

  function toggleEquipment(item: SessionGeneratorEquipment) {
    const exists = formState.equipmentAllowlist.includes(item);
    updateFormState(
      "equipmentAllowlist",
      exists
        ? formState.equipmentAllowlist.filter((value) => value !== item)
        : [...formState.equipmentAllowlist, item]
    );
  }

  async function generateDraft() {
    setIsGenerating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/my-library/generator/session-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selection,
          overrides,
          input: formState,
        }),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as SessionDraftApiResponse | null;
      const responseError =
        responseBody && !responseBody.ok
          ? responseBody.error
          : "Could not generate a session draft right now.";

      if (!response.ok || !responseBody?.ok) {
        setError(responseError);
        return;
      }

      setDraft(responseBody.draft);
      setSavedWorkout(null);
      setSuccess("Session draft generated. Review and edit it locally, then accept it below.");
      void sendClientAnalyticsEvent("session_draft_generated", {
        sessionType: responseBody.draft.sessionType,
        environment: responseBody.draft.environment,
        sizeMode: responseBody.draft.sizeMode,
        hasCss: Boolean(responseBody.draft.usedCssPaceLabel),
      });
    } catch {
      setError("Could not generate a session draft right now.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveWorkout() {
    if (!draft) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        savedWorkout ? `/api/my-library/workouts/${savedWorkout.id}` : "/api/my-library/workouts",
        {
          method: savedWorkout ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            draft,
          }),
        }
      );
      const responseBody = (await response
        .json()
        .catch(() => null)) as WorkoutSaveApiResponse | null;
      const responseError =
        responseBody && !responseBody.ok ? responseBody.error : "Could not save workout right now.";

      if (!response.ok || !responseBody?.ok) {
        setError(responseError);
        return;
      }

      setSavedWorkout(responseBody.workout);
      setDraft(responseBody.workout.draft);
      setRecentWorkouts((current) => upsertRecentWorkoutSummary(current, responseBody.summary));
      setSuccess(
        savedWorkout
          ? "Workout changes saved to the canonical workout."
          : "Workout accepted and saved as a canonical session."
      );
    } catch {
      setError("Could not save workout right now.");
    } finally {
      setIsSaving(false);
    }
  }

  function resetDraftToSavedWorkout() {
    if (!savedWorkout) return;

    setDraft(savedWorkout.draft);
    setError("");
    setSuccess("Unsaved builder edits were reset to the last saved workout.");
  }

  function upsertRecentWorkoutSummary(current: WorkoutSummary[], next: WorkoutSummary) {
    const existing = current.filter((summary) => summary.id !== next.id);
    return [next, ...existing].slice(0, 6);
  }

  return (
    <section
      data-testid="session-generator-panel"
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Session draft generator</h2>
          <p className="mt-2 max-w-[66ch] text-sm text-slate-600">
            Build one Garmin-familiar swim-session draft from the prepared intake handoff, then edit
            it fully before accepting it into the first canonical workout layer for later editing.
          </p>
        </div>
        <p className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Session only
        </p>
      </div>

      {workoutLibrary.loadError ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
          <p className="text-sm text-rose-900">{workoutLibrary.loadError}</p>
        </div>
      ) : null}

      {workoutLibrary.selectedWorkoutMissing ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm text-amber-900">
            That saved workout could not be found. You can start a fresh draft or open another
            recent workout below.
          </p>
        </div>
      ) : null}

      {!canonicalSaveReady ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm text-amber-900">
            Canonical workout save is still syncing in this environment. You can still generate and
            edit local drafts, but accept/save is unavailable until the workouts table is live.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
          <p className="text-sm text-rose-900">{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="text-sm text-emerald-900">{success}</p>
        </div>
      ) : null}

      {recentWorkouts.length > 0 ? (
        <div
          data-testid="session-generator-recent-workouts"
          className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent accepted workouts</h3>
              <p className="mt-1 text-sm text-slate-600">
                Open one saved session in the dedicated workout builder route, or start a fresh
                AI-generated draft below.
              </p>
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
                  href={`/my-library/workouts/${workout.id}`}
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

      {payload.overrides.targetType === "program" ? (
        <div
          data-testid="session-generator-program-deferred"
          className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4"
        >
          <p className="text-sm text-amber-900">
            Program generation stays deferred for now. Switch the generator target back to
            <span className="font-semibold"> Single session </span>
            to draft one workout in this slice.
          </p>
        </div>
      ) : null}

      {payload.overrides.targetType === "session" &&
      !handoffPrepared &&
      !hasLoadedCanonicalWorkout ? (
        <div
          data-testid="session-generator-prepare-needed"
          className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/80 p-4"
        >
          <p className="text-sm text-blue-900">
            Prepare the generator above before generating a session draft, so this run uses the
            saved profile, goal, and focus context you just reviewed.
          </p>
        </div>
      ) : null}

      {!hasLoadedCanonicalWorkout && sessionReady ? (
        <>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Goal context
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {payload.source.openGoals[0]?.title ?? "No goal included"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Focus cue
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {payload.overrides.focusText ?? payload.source.activeFocus?.title ?? "No focus cue"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                CSS anchor
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {payload.source.cssMetric?.paceLabel
                  ? `${payload.source.cssMetric.paceLabel}/100m`
                  : "Fallback pace guidance"}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
              Session type
              <select
                value={formState.sessionType}
                onChange={(event) =>
                  updateFormState(
                    "sessionType",
                    event.target.value as SessionGeneratorFormState["sessionType"]
                  )
                }
                data-testid="session-generator-session-type"
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {SESSION_GENERATOR_SESSION_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {getSessionTypeLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
              Effort
              <select
                value={formState.effort}
                onChange={(event) =>
                  updateFormState(
                    "effort",
                    event.target.value as SessionGeneratorFormState["effort"]
                  )
                }
                data-testid="session-generator-effort"
                className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {SESSION_GENERATOR_EFFORT_PRESETS.map((value) => (
                  <option key={value} value={value}>
                    {getSessionEffortLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <legend className="px-1 text-sm font-semibold text-slate-900">Environment</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {SESSION_GENERATOR_ENVIRONMENTS.map((value) => (
                  <label
                    key={value}
                    className="inline-flex items-center gap-2 text-sm text-slate-700"
                  >
                    <input
                      type="radio"
                      name="session-generator-environment"
                      checked={formState.environment === value}
                      onChange={() => updateFormState("environment", value)}
                      data-testid={`session-generator-environment-${value}`}
                    />
                    {getSessionEnvironmentLabel(value)}
                  </label>
                ))}
              </div>
            </fieldset>

            {formState.environment === "pool" ? (
              <label className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
                Pool length
                <select
                  value={formState.poolLengthM}
                  onChange={(event) => updateFormState("poolLengthM", event.target.value)}
                  data-testid="session-generator-pool-length"
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

            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <legend className="px-1 text-sm font-semibold text-slate-900">Session size</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="session-generator-size-mode"
                    checked={formState.sizeMode === "distance"}
                    onChange={() => updateFormState("sizeMode", "distance")}
                    data-testid="session-generator-size-distance"
                  />
                  Distance
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="session-generator-size-mode"
                    checked={formState.sizeMode === "estimated_time"}
                    onChange={() => updateFormState("sizeMode", "estimated_time")}
                    data-testid="session-generator-size-time"
                  />
                  Estimated time
                </label>
              </div>

              {formState.sizeMode === "distance" ? (
                <label className="mt-4 block text-sm text-slate-700">
                  Target distance (m)
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formState.targetDistanceM}
                    onChange={(event) => updateFormState("targetDistanceM", event.target.value)}
                    data-testid="session-generator-target-distance"
                    className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
              ) : (
                <label className="mt-4 block text-sm text-slate-700">
                  Estimated duration (min)
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formState.targetTimeMin}
                    onChange={(event) => updateFormState("targetTimeMin", event.target.value)}
                    data-testid="session-generator-target-time"
                    className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </label>
              )}
            </fieldset>

            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <legend className="px-1 text-sm font-semibold text-slate-900">
                Optional structure
              </legend>
              <div className="mt-3 flex flex-col gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.includeDrills}
                    onChange={(event) => updateFormState("includeDrills", event.target.checked)}
                    data-testid="session-generator-include-drills"
                  />
                  Include drills
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.includeKick}
                    onChange={(event) => updateFormState("includeKick", event.target.checked)}
                    data-testid="session-generator-include-kick"
                  />
                  Include kick work
                </label>
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:col-span-2">
              <legend className="px-1 text-sm font-semibold text-slate-900">Allowed strokes</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {SESSION_GENERATOR_STROKES.map((stroke) => (
                  <label
                    key={stroke}
                    className="inline-flex items-center gap-2 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={formState.allowedStrokes.includes(stroke)}
                      onChange={() => toggleStroke(stroke)}
                      data-testid={`session-generator-stroke-${stroke}`}
                    />
                    {getSessionStrokeLabel(stroke)}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:col-span-2">
              <legend className="px-1 text-sm font-semibold text-slate-900">
                Allowed equipment
              </legend>
              <div className="mt-3 flex flex-wrap gap-3">
                {SESSION_GENERATOR_EQUIPMENT.map((item) => (
                  <label
                    key={item}
                    className="inline-flex items-center gap-2 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={formState.equipmentAllowlist.includes(item)}
                      onChange={() => toggleEquipment(item)}
                      data-testid={`session-generator-equipment-${item}`}
                    />
                    {getSessionEquipmentLabel(item)}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Drafts stay local until you explicitly accept one below as a canonical workout.
            </p>
            <button
              type="button"
              onClick={generateDraft}
              disabled={isGenerating}
              data-testid="session-generator-generate"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating
                ? "Generating..."
                : draft
                  ? "Regenerate draft"
                  : "Generate session draft"}
            </button>
          </div>
        </>
      ) : null}

      {draft ? (
        <div className="mt-6 border-t border-slate-200 pt-6">
          <WorkoutEditor
            draft={draft}
            savedWorkout={savedWorkout}
            recentWorkouts={[]}
            canonicalSaveReady={canonicalSaveReady}
            isSaving={isSaving}
            onSave={saveWorkout}
            hasUnsavedChanges={hasUnsavedChanges}
            onDraftChange={(nextDraft) => {
              setDraft(nextDraft);
              setSuccess("");
            }}
            onResetToSaved={resetDraftToSavedWorkout}
            startNewDraftHref="/my-library/generator"
            recentWorkoutsDescription="Open another saved session in the dedicated workout builder route."
            workoutHrefBuilder={(workoutId) => `/my-library/workouts/${workoutId}`}
          />
        </div>
      ) : null}
    </section>
  );
}
