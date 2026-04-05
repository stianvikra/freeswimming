"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildManualWorkoutEmptyDraft } from "@/lib/workouts/manual";
import type { WorkoutSaveApiResponse } from "@/lib/workouts/shared";

type Props = {
  label?: string;
  pendingLabel?: string;
  className?: string;
  testId?: string;
  createdWorkoutHrefBuilder?: (workoutId: string) => string;
};

export default function CreateManualWorkoutButton({
  label = "Build manual session",
  pendingLabel = "Building manual session...",
  className = "",
  testId = "create-manual-workout",
  createdWorkoutHrefBuilder = (workoutId) =>
    `/my-library/workouts/${workoutId}?entry=manual-create`,
}: Props) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

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
          draft: buildManualWorkoutEmptyDraft(),
        }),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as WorkoutSaveApiResponse | null;

      if (!response.ok || !responseBody?.ok) {
        setError(
          responseBody && !responseBody.ok ? responseBody.error : "Could not build manual session."
        );
        return;
      }

      router.push(createdWorkoutHrefBuilder(responseBody.workout.id));
      router.refresh();
    } catch {
      setError("Could not build manual session.");
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
        {isCreating ? pendingLabel : label}
      </button>
      {error ? (
        <p data-testid={`${testId}-error`} className="text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
