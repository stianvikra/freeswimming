"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreateManualWorkoutButton from "@/components/my-library/workouts/CreateManualWorkoutButton";
import SavedWorkoutsPanel from "@/components/my-library/workouts/SavedWorkoutsPanel";
import WorkoutEditor from "@/components/my-library/workouts/WorkoutEditor";
import { useAutoDismissNotice } from "@/components/my-library/workouts/useAutoDismissNotice";
import type {
  WorkoutDeleteApiResponse,
  WorkoutEditorRecord,
  WorkoutLibrarySnapshot,
  WorkoutSaveApiResponse,
  WorkoutSummary,
} from "@/lib/workouts/shared";
import { haveWorkoutDraftChanges } from "@/lib/workouts/shared";

type Props = {
  workoutLibrary: WorkoutLibrarySnapshot;
};

function upsertRecentWorkoutSummary(current: WorkoutSummary[], next: WorkoutSummary) {
  const existing = current.filter((summary) => summary.id !== next.id);
  return [next, ...existing].slice(0, 6);
}

export default function WorkoutBuilderHub({ workoutLibrary }: Props) {
  const router = useRouter();
  const [savedWorkout, setSavedWorkout] = useState<WorkoutEditorRecord | null>(
    workoutLibrary.selectedWorkout
  );
  const [draft, setDraft] = useState(workoutLibrary.selectedWorkout?.draft ?? null);
  const [recentWorkouts, setRecentWorkouts] = useState(workoutLibrary.recentWorkouts);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDeleteWorkoutId, setPendingDeleteWorkoutId] = useState<string | null>(null);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);
  const [pendingCurrentDelete, setPendingCurrentDelete] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const hasUnsavedChanges = haveWorkoutDraftChanges(draft, savedWorkout?.draft ?? null);
  const currentWorkoutCardCopy = savedWorkout
    ? (recentWorkouts.find((summary) => summary.id === savedWorkout.id) ?? {
        id: savedWorkout.id,
        title: savedWorkout.draft.title,
      })
    : null;
  const alternateRecentWorkouts = savedWorkout
    ? recentWorkouts.filter((summary) => summary.id !== savedWorkout.id)
    : recentWorkouts;

  useAutoDismissNotice(success, setSuccess);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    setSavedWorkout(workoutLibrary.selectedWorkout);
    setDraft(workoutLibrary.selectedWorkout?.draft ?? null);
    setRecentWorkouts(workoutLibrary.recentWorkouts);
    setError("");
    setSuccess("");
    setPendingDeleteWorkoutId(null);
    setDeletingWorkoutId(null);
    setPendingCurrentDelete(false);
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

  function resetDraftToSavedWorkout() {
    if (!savedWorkout) return;

    setDraft(savedWorkout.draft);
    setError("");
    setSuccess("Unsaved builder edits were reset to the last saved workout.");
  }

  async function confirmDeleteWorkout(workout: Pick<WorkoutSummary, "id" | "title">) {
    setDeletingWorkoutId(workout.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/my-library/workouts/${workout.id}`, {
        method: "DELETE",
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as WorkoutDeleteApiResponse | null;
      const responseError =
        responseBody && !responseBody.ok
          ? responseBody.error
          : "Could not delete workout right now.";

      if (!response.ok || !responseBody?.ok) {
        setError(responseError);
        return;
      }

      setRecentWorkouts((current) => current.filter((summary) => summary.id !== workout.id));
      setPendingDeleteWorkoutId(null);

      if (savedWorkout?.id === workout.id) {
        setPendingCurrentDelete(false);
        setSavedWorkout(null);
        setDraft(null);
        router.push("/my-library");
        router.refresh();
        return;
      }

      setSuccess(`Deleted ${workout.title}.`);
      router.refresh();
    } catch {
      setError("Could not delete workout right now.");
    } finally {
      setDeletingWorkoutId(null);
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
          <h2 className="text-lg font-semibold text-slate-900">Swim session builder</h2>
          <p className="mt-2 max-w-[66ch] text-sm text-slate-600">
            Create or edit one canonical swim session in a dedicated route. Keep the editor as the
            primary workspace, then open saved sessions only when you want to switch, print, or
            clean up older work.
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

      <div className="mt-6 space-y-5">
        {savedWorkout && currentWorkoutCardCopy ? (
          <div
            data-testid="workout-builder-current-workout-actions"
            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Current swim session
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {savedWorkout.draft.title}
                </p>
                <p className="mt-1 max-w-[72ch] text-sm text-slate-600">
                  You are editing this saved session below. Delete it here only when you want to
                  remove the session from My Library entirely.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPendingCurrentDelete(true);
                  setPendingDeleteWorkoutId(null);
                  setError("");
                  setSuccess("");
                }}
                disabled={deletingWorkoutId === savedWorkout.id}
                data-testid="workout-builder-delete-current-workout"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-50 active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingWorkoutId === savedWorkout.id ? "Deleting..." : "Delete current session"}
              </button>
            </div>

            {pendingCurrentDelete ? (
              <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-3">
                <p className="text-sm font-medium text-rose-900">
                  Delete the session you are editing right now?
                </p>
                <p className="mt-1 text-sm text-rose-900/90">
                  This removes the canonical swim session from My Library and discards any unsaved
                  local builder edits tied to it.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void confirmDeleteWorkout(currentWorkoutCardCopy)}
                    disabled={deletingWorkoutId === savedWorkout.id}
                    data-testid="workout-builder-confirm-delete-current-workout"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 active:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingWorkoutId === savedWorkout.id ? "Deleting..." : "Delete workout"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingCurrentDelete(false)}
                    disabled={deletingWorkoutId === savedWorkout.id}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-50 active:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {!savedWorkout ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
              <p className="text-sm font-medium text-amber-900">
                {workoutLibrary.selectedWorkoutMissing
                  ? "That saved workout could not be found."
                  : "No saved swim session is loaded in this route."}
              </p>
              <p className="mt-2 text-sm text-amber-900/90">
                Create a manual swim session here, return to the generator for a brand-new AI draft,
                or reopen another saved swim session below.
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
          </div>
        ) : null}

        {draft && savedWorkout ? (
          <div>
            <WorkoutEditor
              draft={draft}
              savedWorkout={savedWorkout}
              recentWorkouts={[]}
              canonicalSaveReady={workoutLibrary.schemaReady}
              isSaving={isSaving}
              onSave={saveWorkout}
              hasUnsavedChanges={hasUnsavedChanges}
              onDraftChange={(nextDraft) => {
                setDraft(nextDraft);
                setSuccess("");
              }}
              onResetToSaved={resetDraftToSavedWorkout}
              startNewDraftHref="/my-library/generator"
              startNewDraftLabel="Generate new draft"
              showLoadedBanner={false}
              recentWorkoutsDescription="Open another saved workout here, create a new manual workout from the header, or jump back to the generator when you want a brand-new AI draft."
              workoutHrefBuilder={(workoutId) => `/my-library/workouts/${workoutId}`}
              saveButtonTestId="workout-builder-save"
            />
          </div>
        ) : null}

        <SavedWorkoutsPanel
          workouts={alternateRecentWorkouts}
          heading={savedWorkout ? "Other saved swim sessions" : "Saved swim sessions"}
          description={
            savedWorkout
              ? "Open, print, or delete another saved session here only when you want to switch context or clean up older work."
              : "Open, print, or delete a saved swim session here, or create a fresh manual session above."
          }
          workoutHrefBuilder={(workoutId) => `/my-library/workouts/${workoutId}`}
          workoutPdfHrefBuilder={(workoutId) => `/api/my-library/workouts/${workoutId}/export/pdf`}
          editLabel="Edit"
          testId="session-generator-recent-workouts"
          editButtonTestIdBuilder={(workoutId) =>
            savedWorkout
              ? `session-generator-open-workout-${workoutId}`
              : `workout-builder-open-workout-${workoutId}`
          }
          deleteButtonTestIdBuilder={(workoutId) => `workout-builder-delete-workout-${workoutId}`}
          confirmDeleteButtonTestIdBuilder={(workoutId) =>
            `workout-builder-confirm-delete-workout-${workoutId}`
          }
          onRequestDeleteWorkout={(workout) => {
            setPendingDeleteWorkoutId(workout.id);
            setPendingCurrentDelete(false);
            setError("");
            setSuccess("");
          }}
          onCancelDeleteWorkout={() => setPendingDeleteWorkoutId(null)}
          onConfirmDeleteWorkout={confirmDeleteWorkout}
          pendingDeleteWorkoutId={pendingDeleteWorkoutId}
          deletingWorkoutId={deletingWorkoutId}
        />
      </div>
    </section>
  );
}
