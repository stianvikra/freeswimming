"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildManualWorkoutStarterDraft } from "@/lib/workouts/manual";
import type { WorkoutSaveApiResponse } from "@/lib/workouts/shared";

type Props = {
  label?: string;
  pendingLabel?: string;
  className?: string;
  testId?: string;
};

export default function CreateManualWorkoutButton({
  label = "Create manual workout",
  pendingLabel = "Creating manual workout...",
  className = "",
  testId = "create-manual-workout",
}: Props) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
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
          draft: buildManualWorkoutStarterDraft(),
        }),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as WorkoutSaveApiResponse | null;

      if (!response.ok || !responseBody?.ok) {
        setError(
          responseBody && !responseBody.ok ? responseBody.error : "Could not create workout."
        );
        return;
      }

      router.push(`/my-library/workouts/${responseBody.workout.id}`);
      router.refresh();
    } catch {
      setError("Could not create workout.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        data-testid={testId}
        onClick={handleCreate}
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
