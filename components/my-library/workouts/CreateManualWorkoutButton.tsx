"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildManualOpenWaterWorkoutEmptyDraft,
  buildManualPoolWorkoutEmptyDraft,
  type ManualWorkoutDraftDefaults,
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
  manualPoolCssMetricSecondsPer100m?: number | null;
  manualPoolCssPaceLabel?: string | null;
};

export default function CreateManualWorkoutButton({
  label,
  pendingLabel,
  className = "",
  testId = "create-manual-workout",
  builderMode = "pool",
  createdWorkoutHrefBuilder,
  manualPoolCssMetricSecondsPer100m = null,
  manualPoolCssPaceLabel = null,
}: Props) {
  const router = useRouter();
  const [clientReady, setClientReady] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const resolvedLabel =
    label ?? (builderMode === "pool" ? "Build pool session" : "Build open water session");
  const resolvedPendingLabel =
    pendingLabel ??
    (builderMode === "pool" ? "Building pool session..." : "Building open water session...");
  const manualPoolDefaults: ManualWorkoutDraftDefaults | undefined =
    builderMode === "pool" &&
    typeof manualPoolCssMetricSecondsPer100m === "number" &&
    Number.isFinite(manualPoolCssMetricSecondsPer100m) &&
    manualPoolCssMetricSecondsPer100m > 0
      ? {
          basePaceSecondsPer100m: manualPoolCssMetricSecondsPer100m,
          usedCssPaceLabel: manualPoolCssPaceLabel,
        }
      : undefined;
  const buildWorkoutHref =
    createdWorkoutHrefBuilder ??
    ((workoutId: string) =>
      `/my-library/workouts/${workoutId}?entry=${
        builderMode === "pool" ? "manual-pool" : "manual-open-water"
      }`);

  useEffect(() => {
    setClientReady(true);
  }, []);

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
          draft:
            builderMode === "pool"
              ? buildManualPoolWorkoutEmptyDraft(new Date(), manualPoolDefaults)
              : buildManualOpenWaterWorkoutEmptyDraft(),
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

      const workoutHref = buildWorkoutHref(responseBody.workout.id);

      startTransition(() => {
        router.push(workoutHref);
        router.refresh();
      });

      window.setTimeout(() => {
        if (window.location.pathname === "/my-library") {
          window.location.assign(workoutHref);
        }
      }, 250);
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
        data-client-ready={clientReady ? "true" : "false"}
        onClick={() => void handleCreateManualSession()}
        disabled={!clientReady || isCreating}
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
