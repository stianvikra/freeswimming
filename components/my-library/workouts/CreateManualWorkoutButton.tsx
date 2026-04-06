"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildManualOpenWaterWorkoutEmptyDraft,
  buildManualPoolWorkoutEmptyDraft,
  type ManualWorkoutBuilderMode,
} from "@/lib/workouts/manual";
import type { WorkoutSaveApiResponse } from "@/lib/workouts/shared";

type Props = {
  label?: string;
  pendingLabel?: string;
  className?: string;
  testId?: string;
  builderMode?: ManualWorkoutBuilderMode;
  createdWorkoutHrefBuilder?: (workoutId: string) => string;
};

export default function CreateManualWorkoutButton({
  label,
  pendingLabel,
  className = "",
  testId = "create-manual-workout",
  builderMode = "pool",
  createdWorkoutHrefBuilder,
}: Props) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const resolvedLabel =
    label ?? (builderMode === "pool" ? "Build pool session" : "Build open water session");
  const resolvedPendingLabel =
    pendingLabel ??
    (builderMode === "pool" ? "Building pool session..." : "Building open water session...");
  const buildDraft =
    builderMode === "pool"
      ? buildManualPoolWorkoutEmptyDraft
      : buildManualOpenWaterWorkoutEmptyDraft;
  const buildWorkoutHref =
    createdWorkoutHrefBuilder ??
    ((workoutId: string) =>
      `/my-library/workouts/${workoutId}?entry=${
        builderMode === "pool" ? "manual-pool" : "manual-open-water"
      }`);

  async function handleCreateManualSession() {
    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/my-library/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceKind: "manual",
          draft: buildDraft(),
        }),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as WorkoutSaveApiResponse | null;
      const genericFailureMessage =
        builderMode === "pool"
          ? "Could not build pool session."
          : "Could not build open water session.";

      if (!response.ok || !responseBody?.ok) {
        setError(responseBody && !responseBody.ok ? responseBody.error : genericFailureMessage);
        return;
      }

      router.push(buildWorkoutHref(responseBody.workout.id));
      router.refresh();
    } catch {
      setError(
        builderMode === "pool"
          ? "Could not build pool session."
          : "Could not build open water session."
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        data-testid={testId}
        onClick={() => void handleCreateManualSession()}
        disabled={isCreating}
        className={className}
      >
        {isCreating ? resolvedPendingLabel : resolvedLabel}
      </button>
      {error ? (
        <p data-testid={`${testId}-error`} className="text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
