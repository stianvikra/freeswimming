"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildManualWorkoutEmptyDraft } from "@/lib/workouts/manual";
import type { WorkoutSaveApiResponse, WorkoutSummary } from "@/lib/workouts/shared";

type Props = {
  label?: string;
  pendingLabel?: string;
  className?: string;
  testId?: string;
  latestSavedWorkout?: Pick<WorkoutSummary, "id" | "title"> | null;
  currentWorkoutId?: string | null;
  continueHrefBuilder?: (workoutId: string) => string;
};

export default function CreateManualWorkoutButton({
  label = "Create session",
  pendingLabel = "Creating session...",
  className = "",
  testId = "create-manual-workout",
  latestSavedWorkout = null,
  currentWorkoutId = null,
  continueHrefBuilder = (workoutId) => `/my-library/workouts/${workoutId}`,
}: Props) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [showChooser, setShowChooser] = useState(false);
  const [error, setError] = useState("");
  const continuingCurrentSession = latestSavedWorkout?.id === currentWorkoutId;

  async function handleCreateEmptySession() {
    setIsCreating(true);
    setError("");
    setShowChooser(false);

    try {
      const response = await fetch("/api/my-library/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceKind: "manual",
          draft: buildManualWorkoutEmptyDraft(),
        }),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as WorkoutSaveApiResponse | null;

      if (!response.ok || !responseBody?.ok) {
        setError(
          responseBody && !responseBody.ok ? responseBody.error : "Could not create session."
        );
        return;
      }

      router.push(`/my-library/workouts/${responseBody.workout.id}`);
      router.refresh();
    } catch {
      setError("Could not create session.");
    } finally {
      setIsCreating(false);
    }
  }

  function handleContinueLatestSession() {
    setError("");

    if (!latestSavedWorkout) {
      return;
    }

    if (continuingCurrentSession) {
      setShowChooser(false);
      return;
    }

    router.push(continueHrefBuilder(latestSavedWorkout.id));
    router.refresh();
  }

  function handlePrimaryAction() {
    if (latestSavedWorkout) {
      setShowChooser((current) => !current);
      setError("");
      return;
    }

    void handleCreateEmptySession();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        data-testid={testId}
        onClick={handlePrimaryAction}
        disabled={isCreating}
        className={className}
      >
        {isCreating ? pendingLabel : label}
      </button>
      {showChooser && latestSavedWorkout ? (
        <div
          data-testid={`${testId}-chooser`}
          className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4"
        >
          <p className="text-sm font-semibold text-blue-950">
            {continuingCurrentSession
              ? "Keep editing this current session, or start a clean new one from scratch."
              : "You already have a saved session. Continue it, or start a clean new one from scratch."}
          </p>
          <p className="mt-1 text-sm text-blue-900/90">
            {continuingCurrentSession
              ? `Current session: ${latestSavedWorkout.title}`
              : `Latest saved session: ${latestSavedWorkout.title}`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              data-testid={`${testId}-continue`}
              onClick={handleContinueLatestSession}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-blue-900 transition hover:bg-blue-100 active:bg-blue-200"
            >
              {continuingCurrentSession
                ? "Keep editing current session"
                : "Continue latest saved session"}
            </button>
            <button
              type="button"
              data-testid={`${testId}-start-scratch`}
              onClick={() => void handleCreateEmptySession()}
              disabled={isCreating}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isCreating ? pendingLabel : "Start from scratch"}
            </button>
            <button
              type="button"
              data-testid={`${testId}-cancel`}
              onClick={() => setShowChooser(false)}
              disabled={isCreating}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      {error ? (
        <p data-testid={`${testId}-error`} className="text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
