"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CreateManualWorkoutButton from "@/components/my-library/workouts/CreateManualWorkoutButton";
import WorkoutEditor from "@/components/my-library/workouts/WorkoutEditor";
import type {
  WorkoutEditorRecord,
  WorkoutLibrarySnapshot,
  WorkoutSaveApiResponse,
  WorkoutSummary,
} from "@/lib/workouts/shared";

type Props = {
  workoutLibrary: WorkoutLibrarySnapshot;
};

function upsertRecentWorkoutSummary(current: WorkoutSummary[], next: WorkoutSummary) {
  const existing = current.filter((summary) => summary.id !== next.id);
  return [next, ...existing].slice(0, 6);
}

export default function WorkoutBuilderHub({ workoutLibrary }: Props) {
  const [savedWorkout, setSavedWorkout] = useState<WorkoutEditorRecord | null>(
    workoutLibrary.selectedWorkout
  );
  const [draft, setDraft] = useState(workoutLibrary.selectedWorkout?.draft ?? null);
  const [recentWorkouts, setRecentWorkouts] = useState(workoutLibrary.recentWorkouts);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    setSavedWorkout(workoutLibrary.selectedWorkout);
    setDraft(workoutLibrary.selectedWorkout?.draft ?? null);
    setRecentWorkouts(workoutLibrary.recentWorkouts);
    setError("");
    setSuccess("");
  }, [
    workoutLibrary.recentWorkouts,
    workoutLibrary.selectedWorkout,
    workoutLibrary.selectedWorkoutMissing,
  ]);

  async function saveWorkout() {
    if (!draft || !savedWorkout) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/my-library/workouts/${savedWorkout.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draft,
        }),
      });
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
      setSuccess("Workout changes saved to the canonical workout.");
    } catch {
      setError("Could not save workout right now.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section
      data-testid="workout-builder-hub"
      data-client-ready={clientReady ? "true" : "false"}
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Workout builder</h2>
          <p className="mt-2 max-w-[66ch] text-sm text-slate-600">
            Edit one accepted canonical workout in a dedicated route. This is the first step toward
            the fuller manual builder flow.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {workoutLibrary.schemaReady ? (
            <CreateManualWorkoutButton
              testId="workout-builder-create-manual"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            />
          ) : null}
          <p className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Canonical workout
          </p>
        </div>
      </div>

      {!workoutLibrary.schemaReady ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm text-amber-900">
            Canonical workout save is still syncing in this environment. Come back once the workouts
            table is live to edit accepted workouts here.
          </p>
        </div>
      ) : null}

      {workoutLibrary.loadError ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4">
          <p className="text-sm text-rose-900">{workoutLibrary.loadError}</p>
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

      {!savedWorkout ? (
        <div className="mt-6 space-y-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
            <p className="text-sm font-medium text-amber-900">
              {workoutLibrary.selectedWorkoutMissing
                ? "That saved workout could not be found."
                : "No canonical workout is loaded in this route."}
            </p>
            <p className="mt-2 text-sm text-amber-900/90">
              Create a starter manual workout here, return to the generator for a brand-new AI
              draft, or reopen another saved workout below.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {workoutLibrary.schemaReady ? (
                <CreateManualWorkoutButton
                  testId="workout-builder-empty-create-manual"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                />
              ) : null}
              <Link
                href="/my-library/generator"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-white px-4 text-sm font-medium text-amber-900 transition hover:bg-amber-50 active:bg-amber-100"
              >
                Open generator
              </Link>
              <Link
                href="/my-library"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Back to My Library
              </Link>
            </div>
          </div>

          {recentWorkouts.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Recent accepted workouts</h3>
              <p className="mt-1 text-sm text-slate-600">
                Reopen another saved canonical workout directly in this builder route.
              </p>
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
                        {workout.estimatedDurationMin
                          ? `~${workout.estimatedDurationMin} min`
                          : null}
                      </p>
                    </div>
                    <Link
                      href={`/my-library/workouts/${workout.id}`}
                      data-testid={`workout-builder-open-workout-${workout.id}`}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                    >
                      Open
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {draft && savedWorkout ? (
        <div className="mt-6">
          <WorkoutEditor
            draft={draft}
            savedWorkout={savedWorkout}
            recentWorkouts={recentWorkouts}
            canonicalSaveReady={workoutLibrary.schemaReady}
            isSaving={isSaving}
            onSave={saveWorkout}
            onDraftChange={(nextDraft) => {
              setDraft(nextDraft);
              setSuccess("");
            }}
            startNewDraftHref="/my-library/generator"
            startNewDraftLabel="Generate new draft"
            showLoadedBanner={false}
            recentWorkoutsDescription="Open another saved workout here, create a new manual workout from the header, or jump back to the generator when you want a brand-new AI draft."
            workoutHrefBuilder={(workoutId) => `/my-library/workouts/${workoutId}`}
            saveButtonTestId="workout-builder-save"
          />
        </div>
      ) : null}
    </section>
  );
}
