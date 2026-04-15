"use client";

import { useEffect, useState } from "react";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import WorkoutEditor from "@/components/my-library/workouts/WorkoutEditor";
import { WORKOUT_NOTICE_AUTO_DISMISS_MS } from "@/components/my-library/workouts/useAutoDismissNotice";
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
} from "@/lib/workouts/shared";
import { haveWorkoutDraftChanges } from "@/lib/workouts/shared";

type Props = {
  payload: GeneratorIntakeHandoffPayload;
  selection: GeneratorIntakeSelection;
  overrides: GeneratorIntakeOverrides;
  onOverrideChange: (key: "focusText" | "constraintText", value: string) => void;
  onResetOverrides: () => void;
  workoutLibrary: WorkoutLibrarySnapshot;
};

export default function SessionGeneratorPanel({
  payload,
  selection,
  overrides,
  onOverrideChange,
  onResetOverrides,
  workoutLibrary,
}: Props) {
  const [formState, setFormState] = useState<SessionGeneratorFormState>(() =>
    getDefaultSessionGeneratorFormState(payload)
  );
  const [draft, setDraft] = useState<SessionDraft | null>(null);
  const [savedWorkout, setSavedWorkout] = useState<WorkoutEditorRecord | null>(
    workoutLibrary.selectedWorkout
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [discardUndoDraft, setDiscardUndoDraft] = useState<WorkoutEditorRecord["draft"] | null>(
    null
  );

  useEffect(() => {
    if (workoutLibrary.selectedWorkout) {
      setSavedWorkout(workoutLibrary.selectedWorkout);
      setDraft(workoutLibrary.selectedWorkout.draft);
      setError("");
      setSuccess("");
      setDiscardUndoDraft(null);
      return;
    }

    setSavedWorkout(null);
    setDraft(null);
    setError("");
    setSuccess("");
    setDiscardUndoDraft(null);
  }, [workoutLibrary.selectedWorkout]);

  useEffect(() => {
    if (workoutLibrary.selectedWorkout) return;
    setFormState(getDefaultSessionGeneratorFormState(payload));
  }, [payload, workoutLibrary.selectedWorkout]);

  useEffect(() => {
    if (!discardUndoDraft) return;

    const timeoutId = window.setTimeout(() => {
      setDiscardUndoDraft(null);
    }, WORKOUT_NOTICE_AUTO_DISMISS_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [discardUndoDraft]);

  const sessionReady = payload.overrides.targetType === "session";
  const canonicalSaveReady = workoutLibrary.schemaReady;
  const hasLoadedCanonicalWorkout = Boolean(savedWorkout);
  const hasUnsavedChanges = savedWorkout
    ? haveWorkoutDraftChanges(draft, savedWorkout.draft)
    : true;

  function applyOverrideChange(key: "focusText" | "constraintText", value: string) {
    setError("");
    setSuccess("");
    onOverrideChange(key, value);
  }

  function handleResetOverrides() {
    setError("");
    setSuccess("");
    onResetOverrides();
  }

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
    setDiscardUndoDraft(null);

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
      setSuccess(
        "Your session is ready. Review it below, make any edits you want, then save it to My Swim Sessions."
      );
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
    setDiscardUndoDraft(null);

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
      setSuccess(
        savedWorkout
          ? "Session changes saved to My Swim Sessions."
          : "Session saved to My Swim Sessions."
      );
    } catch {
      setError("Could not save workout right now.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleDraftChange(nextDraft: WorkoutEditorRecord["draft"]) {
    setDraft(nextDraft);
    setSuccess("");

    if (
      discardUndoDraft &&
      savedWorkout &&
      !haveWorkoutDraftChanges(nextDraft, savedWorkout.draft)
    ) {
      return;
    }

    setDiscardUndoDraft(null);
  }

  function discardDraftChanges() {
    if (!savedWorkout || !draft || !hasUnsavedChanges) return;

    setDiscardUndoDraft(draft);
    setDraft(savedWorkout.draft);
    setError("");
    setSuccess("");
  }

  function undoDiscardDraftChanges() {
    if (!discardUndoDraft) return;

    setDraft(discardUndoDraft);
    setDiscardUndoDraft(null);
    setError("");
    setSuccess("");
  }

  return (
    <section
      data-testid="session-generator-panel"
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Generate a swim session</h2>
          <p className="mt-2 max-w-[62ch] text-sm text-slate-600">
            Add one-time notes and session settings here. Your saved My Library details stay
            read-only unless you edit them in their own hubs.
          </p>
        </div>
      </div>

      {workoutLibrary.loadError ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
          <p className="text-sm text-rose-900">{workoutLibrary.loadError}</p>
        </div>
      ) : null}

      {workoutLibrary.selectedWorkoutMissing ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm text-amber-900">
            That saved session could not be found. Start a fresh AI session here or open My Swim
            Sessions instead.
          </p>
        </div>
      ) : null}

      {!canonicalSaveReady ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm text-amber-900">
            Saving to My Swim Sessions is still syncing in this environment. You can generate and
            review a session here, but Save to My Swim Sessions stays unavailable until sync
            finishes.
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

      {!hasLoadedCanonicalWorkout && sessionReady ? (
        <>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Session notes and setup</h3>
              </div>
              <button
                type="button"
                onClick={handleResetOverrides}
                data-testid="session-generator-reset-overrides"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Clear notes
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:col-span-2">
                Focus for this session
                <input
                  type="text"
                  value={overrides.focusText}
                  onChange={(event) => applyOverrideChange("focusText", event.target.value)}
                  data-testid="session-generator-focus-text"
                  className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Example: Breathing timing under fatigue"
                />
              </label>

              <label className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 md:col-span-2">
                Special instructions for this session
                <textarea
                  value={overrides.constraintText}
                  onChange={(event) => applyOverrideChange("constraintText", event.target.value)}
                  data-testid="session-generator-constraint-text"
                  rows={4}
                  className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Example: Keep total volume moderate and avoid heavy kick work."
                />
              </label>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Goal from My Library
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {payload.source.openGoals[0]?.title ?? "No goal included"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Focus for this session
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {payload.overrides.focusText ?? payload.source.activeFocus?.title ?? "No focus cue"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pace anchor
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
                  Estimated duration (15-180 min)
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
              Nothing changes in My Swim Sessions until you save this generated session.
            </p>
            <button
              type="button"
              onClick={generateDraft}
              disabled={isGenerating}
              data-testid="session-generator-generate"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Generating..." : draft ? "Generate again" : "Generate session"}
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
            onDraftChange={handleDraftChange}
            onDiscardChanges={discardDraftChanges}
            showDiscardUndoNotice={discardUndoDraft !== null}
            onUndoDiscardChanges={undoDiscardDraftChanges}
            copyVariant="generator"
            startNewDraftHref="/my-library/generator"
            startNewDraftLabel="Start a fresh AI session"
            loadedBannerTitle="Saved session loaded."
            loadedBannerDescription="Save changes below, or start a fresh session in the AI session generator when you want a brand-new version."
            recentWorkoutsDescription="Edit another saved session in the dedicated workout builder route."
            workoutHrefBuilder={(workoutId) => `/my-library/workouts/${workoutId}`}
          />
        </div>
      ) : null}
    </section>
  );
}
