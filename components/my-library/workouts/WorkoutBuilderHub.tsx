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
  trainingFocusTitles?: string[];
  savedSessionsOpenByDefault?: boolean;
};

function upsertRecentWorkoutSummary(current: WorkoutSummary[], next: WorkoutSummary) {
  const existing = current.filter((summary) => summary.id !== next.id);
  return [next, ...existing].slice(0, 6);
}

export default function WorkoutBuilderHub({
  workoutLibrary,
  trainingFocusTitles = [],
  savedSessionsOpenByDefault = false,
}: Props) {
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
  const [savedSessionsOpen, setSavedSessionsOpen] = useState(savedSessionsOpenByDefault);
  const [clientReady, setClientReady] = useState(false);
  const hasUnsavedChanges = haveWorkoutDraftChanges(draft, savedWorkout?.draft ?? null);
  const latestSavedWorkout =
    recentWorkouts[0] ??
    (savedWorkout
      ? {
          id: savedWorkout.id,
          title: savedWorkout.draft.title,
        }
      : null);

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
    setSavedSessionsOpen(savedSessionsOpenByDefault);
  }, [
    workoutLibrary.recentWorkouts,
    workoutLibrary.selectedWorkout,
    workoutLibrary.selectedWorkoutMissing,
    savedSessionsOpenByDefault,
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
            {savedWorkout
              ? "Keep the session form front and center while you edit one saved swim session. Open saved sessions only when you want to switch, print, or clean up older work."
              : "View saved sessions when you want to reopen existing work, or create a new empty swim session from scratch."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {recentWorkouts.length > 0 ? (
            <button
              type="button"
              data-testid="workout-builder-view-sessions"
              onClick={() => setSavedSessionsOpen((current) => !current)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              {savedSessionsOpen ? "Hide sessions" : "View sessions"}
            </button>
          ) : null}
          {workoutLibrary.schemaReady ? (
            <CreateManualWorkoutButton
              label="Create session"
              testId="workout-builder-create-manual"
              latestSavedWorkout={
                savedWorkout
                  ? {
                      id: savedWorkout.id,
                      title: savedWorkout.draft.title,
                    }
                  : latestSavedWorkout
              }
              currentWorkoutId={savedWorkout?.id ?? null}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            />
          ) : null}
          {savedWorkout ? (
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
          ) : null}
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
        {savedWorkout && pendingCurrentDelete ? (
          <div
            data-testid="workout-builder-current-workout-actions"
            className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4"
          >
            <p className="text-sm font-medium text-rose-900">Delete this saved session?</p>
            <p className="mt-1 text-sm text-rose-900/90">
              This removes <span className="font-semibold">{savedWorkout.draft.title}</span> from My
              Library and discards any unsaved local builder edits tied to it.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  void confirmDeleteWorkout({
                    id: savedWorkout.id,
                    title: savedWorkout.draft.title,
                  })
                }
                disabled={deletingWorkoutId === savedWorkout.id}
                data-testid="workout-builder-confirm-delete-current-workout"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-500 active:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingWorkoutId === savedWorkout.id ? "Deleting..." : "Delete current session"}
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

        {!savedWorkout ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
              <p className="text-sm font-medium text-amber-900">
                {workoutLibrary.selectedWorkoutMissing
                  ? "That saved swim session could not be found."
                  : "No saved swim session is loaded in this route yet."}
              </p>
              <p className="mt-2 text-sm text-amber-900/90">
                Open saved sessions only when you want to switch back to older work, or create a new
                session from scratch when you want a clean shell.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {recentWorkouts.length > 0 ? (
                  <button
                    type="button"
                    data-testid="workout-builder-empty-view-sessions"
                    onClick={() => setSavedSessionsOpen((current) => !current)}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                  >
                    {savedSessionsOpen ? "Hide sessions" : "View sessions"}
                  </button>
                ) : null}
                {workoutLibrary.schemaReady ? (
                  <CreateManualWorkoutButton
                    label="Create session"
                    testId="workout-builder-empty-create-manual"
                    latestSavedWorkout={latestSavedWorkout}
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
              trainingFocusTitles={trainingFocusTitles}
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
              showPdfPanel={false}
              recentWorkoutsDescription="Use the header actions when you want to view saved sessions, create a clean new session, or jump back to the generator."
              workoutHrefBuilder={(workoutId) => `/my-library/workouts/${workoutId}`}
              saveButtonTestId="workout-builder-save"
            />
          </div>
        ) : null}

        {savedSessionsOpen ? (
          <SavedWorkoutsPanel
            workouts={recentWorkouts}
            heading="Saved sessions"
            description={
              savedWorkout
                ? "Open another saved session, print the current one, or clean up older work without leaving the builder."
                : "Open, print, or delete a saved swim session here, or create a fresh clean session above."
            }
            workoutHrefBuilder={(workoutId) => `/my-library/workouts/${workoutId}`}
            workoutPdfHrefBuilder={(workoutId) =>
              `/api/my-library/workouts/${workoutId}/export/pdf`
            }
            workoutPoolsidePdfHrefBuilder={(workoutId) =>
              `/api/my-library/workouts/${workoutId}/export/pdf?variant=poolside`
            }
            editLabel="Open"
            testId="session-generator-recent-workouts"
            currentWorkoutId={savedWorkout?.id ?? null}
            showToggle={false}
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
        ) : null}
      </div>
    </section>
  );
}
