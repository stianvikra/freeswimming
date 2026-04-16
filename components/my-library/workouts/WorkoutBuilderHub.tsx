"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreateManualWorkoutButton from "@/components/my-library/workouts/CreateManualWorkoutButton";
import SavedWorkoutsPanel from "@/components/my-library/workouts/SavedWorkoutsPanel";
import WorkoutEditor from "@/components/my-library/workouts/WorkoutEditor";
import {
  useAutoDismissNotice,
  WORKOUT_NOTICE_AUTO_DISMISS_MS,
} from "@/components/my-library/workouts/useAutoDismissNotice";
import type {
  WorkoutDeleteApiResponse,
  WorkoutEditorRecord,
  WorkoutLibrarySnapshot,
  WorkoutPoolsideFocusOption,
  WorkoutSaveApiResponse,
  WorkoutSummary,
} from "@/lib/workouts/shared";
import { haveWorkoutDraftChanges } from "@/lib/workouts/shared";

type Props = {
  workoutLibrary: WorkoutLibrarySnapshot;
  trainingFocusOptions?: WorkoutPoolsideFocusOption[];
  manualPoolCssMetricSecondsPer100m?: number | null;
  manualPoolCssPaceLabel?: string | null;
  swimmerName?: string | null;
  browseOnly?: boolean;
  hideShellIntro?: boolean;
  preferExpandedDetailsOnLoad?: boolean;
};

function upsertRecentWorkoutSummary(current: WorkoutSummary[], next: WorkoutSummary) {
  const existing = current.filter((summary) => summary.id !== next.id);
  return [next, ...existing].sort(
    (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
  );
}

export default function WorkoutBuilderHub({
  workoutLibrary,
  trainingFocusOptions = [],
  manualPoolCssMetricSecondsPer100m = null,
  manualPoolCssPaceLabel = null,
  swimmerName = null,
  browseOnly = false,
  hideShellIntro = false,
  preferExpandedDetailsOnLoad = false,
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
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [pendingCurrentDelete, setPendingCurrentDelete] = useState(false);
  const [discardUndoDraft, setDiscardUndoDraft] = useState<WorkoutEditorRecord["draft"] | null>(
    null
  );
  const [clientReady, setClientReady] = useState(false);
  const hasUnsavedChanges = haveWorkoutDraftChanges(draft, savedWorkout?.draft ?? null);

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
    setDiscardUndoDraft(null);
    setPendingDeleteWorkoutId(null);
    setDeletingWorkoutId(null);
    setBulkDeleting(false);
    setPendingCurrentDelete(false);
  }, [
    workoutLibrary.recentWorkouts,
    workoutLibrary.selectedWorkout,
    workoutLibrary.selectedWorkoutMissing,
  ]);

  useEffect(() => {
    if (!discardUndoDraft) return;

    const timeoutId = window.setTimeout(() => {
      setDiscardUndoDraft(null);
    }, WORKOUT_NOTICE_AUTO_DISMISS_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [discardUndoDraft]);

  async function saveWorkout() {
    if (!draft || !savedWorkout) return;

    setIsSaving(true);
    setError("");
    setSuccess("");
    setDiscardUndoDraft(null);

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
      setSuccess("Changes saved to this session.");
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
    setPendingCurrentDelete(false);
  }

  function undoDiscardDraftChanges() {
    if (!discardUndoDraft) return;

    setDraft(discardUndoDraft);
    setDiscardUndoDraft(null);
    setError("");
    setSuccess("");
  }

  async function confirmDeleteWorkout(workout: Pick<WorkoutSummary, "id" | "title">) {
    setDeletingWorkoutId(workout.id);
    setError("");
    setSuccess("");
    setDiscardUndoDraft(null);

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
        router.replace("/my-library");
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

  async function confirmDeleteWorkouts(workouts: WorkoutSummary[]) {
    if (workouts.length === 0) return;

    setBulkDeleting(true);
    setPendingDeleteWorkoutId(null);
    setPendingCurrentDelete(false);
    setError("");
    setSuccess("");
    setDiscardUndoDraft(null);

    try {
      const results = await Promise.all(
        workouts.map(async (workout) => {
          try {
            const response = await fetch(`/api/my-library/workouts/${workout.id}`, {
              method: "DELETE",
            });
            const responseBody = (await response
              .json()
              .catch(() => null)) as WorkoutDeleteApiResponse | null;

            return {
              workout,
              ok: Boolean(response.ok && responseBody?.ok),
              error:
                response.ok && responseBody?.ok
                  ? null
                  : responseBody && !responseBody.ok
                    ? responseBody.error
                    : "Could not delete workout right now.",
            };
          } catch {
            return {
              workout,
              ok: false,
              error: "Could not delete workout right now.",
            };
          }
        })
      );

      const deletedIds = results.filter((result) => result.ok).map((result) => result.workout.id);
      const failedDeletes = results.filter((result) => !result.ok);

      if (deletedIds.length > 0) {
        setRecentWorkouts((current) =>
          current.filter((summary) => !deletedIds.includes(summary.id))
        );
      }

      if (deletedIds.length > 0 && failedDeletes.length === 0) {
        setSuccess(
          deletedIds.length === 1
            ? `Deleted ${results.find((result) => result.ok)?.workout.title ?? "1 session"}.`
            : `Deleted ${deletedIds.length} saved sessions.`
        );
      } else if (deletedIds.length > 0) {
        setError(
          `Deleted ${deletedIds.length} saved session${
            deletedIds.length === 1 ? "" : "s"
          }, but ${failedDeletes.length} could not be deleted right now.`
        );
      } else {
        setError(failedDeletes[0]?.error ?? "Could not delete the selected sessions right now.");
      }

      router.refresh();
    } finally {
      setBulkDeleting(false);
    }
  }

  return (
    <section
      data-testid="workout-builder-hub"
      data-client-ready={clientReady ? "true" : "false"}
      data-containment-style="flat"
      data-mobile-density="tight"
      className="space-y-4 sm:space-y-5"
    >
      {browseOnly ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {workoutLibrary.schemaReady ? (
              <CreateManualWorkoutButton
                label="Build pool session"
                testId="workout-builder-browse-create-pool"
                manualPoolCssMetricSecondsPer100m={manualPoolCssMetricSecondsPer100m}
                manualPoolCssPaceLabel={manualPoolCssPaceLabel}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              />
            ) : null}
            {workoutLibrary.schemaReady ? (
              <CreateManualWorkoutButton
                label="Build open water session"
                builderMode="open_water"
                testId="workout-builder-browse-create-open-water"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            ) : null}
            <Link
              href="/my-library/generator"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              AI-generated session
            </Link>
          </div>
          {recentWorkouts.length > 0 ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {recentWorkouts.length} saved session{recentWorkouts.length === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
          {!hideShellIntro ? (
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Swim session builder</h2>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            {recentWorkouts.length > 0 ? (
              <Link
                href="/my-library/workouts"
                data-testid="workout-builder-view-sessions-link"
                className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 sm:h-10 sm:px-4"
              >
                <span className="sm:hidden">Sessions</span>
                <span className="hidden sm:inline">My Swim Sessions</span>
              </Link>
            ) : null}
          </div>
        </div>
      )}

      {!workoutLibrary.schemaReady ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3 sm:p-4">
          <p className="text-sm text-amber-900">
            Canonical workout save is still syncing in this environment. Come back once the workouts
            table is live to edit accepted workouts here.
          </p>
        </div>
      ) : null}

      {workoutLibrary.loadError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3 sm:p-4">
          <p className="text-sm text-rose-900">{workoutLibrary.loadError}</p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3 sm:p-4">
          <p className="text-sm text-rose-900">{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 sm:p-4">
          <p className="text-sm text-emerald-900">{success}</p>
        </div>
      ) : null}

      <div className="space-y-4 sm:space-y-5">
        {!browseOnly && savedWorkout && pendingCurrentDelete ? (
          <div
            data-testid="workout-builder-current-workout-actions"
            className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3 sm:p-4"
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
                {deletingWorkoutId === savedWorkout.id ? "Deleting..." : "Delete session"}
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

        {browseOnly ? (
          recentWorkouts.length > 0 ? (
            <SavedWorkoutsPanel
              workouts={recentWorkouts}
              heading="My Swim Sessions"
              workoutHrefBuilder={(workoutId) => `/my-library/workouts/${workoutId}`}
              workoutPdfHrefBuilder={(workoutId) =>
                `/api/my-library/workouts/${workoutId}/export/pdf`
              }
              workoutPoolsidePdfHrefBuilder={(workoutId) =>
                `/api/my-library/workouts/${workoutId}/export/pdf?variant=poolside`
              }
              editLabel="Edit"
              testId="workout-builder-saved-sessions"
              showToggle={false}
              showInlinePreview
              showHeader={false}
              initialVisibleCount={null}
              enableBulkDelete
              editButtonTestIdBuilder={(workoutId) => `workout-builder-edit-workout-${workoutId}`}
              deleteButtonTestIdBuilder={(workoutId) =>
                `workout-builder-delete-workout-${workoutId}`
              }
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
              onConfirmDeleteWorkouts={confirmDeleteWorkouts}
              pendingDeleteWorkoutId={pendingDeleteWorkoutId}
              deletingWorkoutId={deletingWorkoutId}
              bulkDeleting={bulkDeleting}
              trainingFocusOptions={trainingFocusOptions}
              swimmerName={swimmerName}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
              <p className="text-sm font-medium text-slate-900">No saved sessions yet.</p>
              <p className="mt-2 text-sm text-slate-600">
                Create your first pool or open water session here, then return to My Swim Sessions
                to browse, preview, or print saved work in one list.
              </p>
            </div>
          )
        ) : !savedWorkout ? (
          <div className="space-y-4 sm:space-y-5">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3 sm:p-4">
              <p className="text-sm font-medium text-amber-900">
                {workoutLibrary.selectedWorkoutMissing
                  ? "That saved swim session could not be found."
                  : "No saved swim session is loaded in this route yet."}
              </p>
              <p className="mt-2 text-sm text-amber-900/90">
                Open My Swim Sessions when you want older work, or create a fresh session when you
                want a clean shell.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {recentWorkouts.length > 0 ? (
                  <Link
                    href="/my-library/workouts"
                    data-testid="workout-builder-empty-view-sessions-link"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                  >
                    My Swim Sessions
                  </Link>
                ) : null}
                {workoutLibrary.schemaReady ? (
                  <CreateManualWorkoutButton
                    label="Build pool session"
                    testId="workout-builder-empty-create-pool"
                    manualPoolCssMetricSecondsPer100m={manualPoolCssMetricSecondsPer100m}
                    manualPoolCssPaceLabel={manualPoolCssPaceLabel}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  />
                ) : null}
                {workoutLibrary.schemaReady ? (
                  <CreateManualWorkoutButton
                    label="Build open water session"
                    builderMode="open_water"
                    testId="workout-builder-empty-create-open-water"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                ) : null}
                <Link
                  href="/my-library/generator"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-white px-4 text-sm font-medium text-amber-900 transition hover:bg-amber-50 active:bg-amber-100"
                >
                  AI-generated session
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
              trainingFocusOptions={trainingFocusOptions}
              recentWorkouts={[]}
              canonicalSaveReady={workoutLibrary.schemaReady}
              isSaving={isSaving}
              onSave={saveWorkout}
              hasUnsavedChanges={hasUnsavedChanges}
              onDraftChange={handleDraftChange}
              onDiscardChanges={discardDraftChanges}
              showDiscardUndoNotice={discardUndoDraft !== null}
              onUndoDiscardChanges={undoDiscardDraftChanges}
              startNewDraftHref={null}
              showLoadedBanner={false}
              showPdfPanel={false}
              forceMetadataOpenOnLoad={preferExpandedDetailsOnLoad}
              onRequestDeleteCurrent={() => {
                setDiscardUndoDraft(null);
                setPendingCurrentDelete(true);
                setPendingDeleteWorkoutId(null);
                setError("");
                setSuccess("");
              }}
              isDeletingCurrent={deletingWorkoutId === savedWorkout.id}
              swimmerName={swimmerName}
              recentWorkoutsDescription="Edit another saved session when you want to switch what you are working on."
              workoutHrefBuilder={(workoutId) => `/my-library/workouts/${workoutId}`}
              saveButtonTestId="workout-builder-save"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
