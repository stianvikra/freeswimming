"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import { buildWorkoutBuilderStartedPayload } from "@/lib/analytics/workout-builder";
import type { ManualWorkoutBuilderMode } from "@/lib/workouts/manual";

type Props = {
  label?: string;
  pendingLabel?: string;
  className?: string;
  testId?: string;
  builderMode?: ManualWorkoutBuilderMode;
  manualPoolCssMetricSecondsPer100m?: number | null;
  manualPoolCssPaceLabel?: string | null;
  draftHrefBuilder?: (builderMode: ManualWorkoutBuilderMode) => string;
};

export default function CreateManualWorkoutButton({
  label,
  pendingLabel,
  className = "",
  testId = "create-manual-workout",
  builderMode = "pool",
  manualPoolCssMetricSecondsPer100m = null,
  draftHrefBuilder,
}: Props) {
  const router = useRouter();
  const [clientReady, setClientReady] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState("");
  const errorId = `${testId}-error`;
  const navigationFallbackTimeoutRef = useRef<number | null>(null);
  const resolvedLabel =
    label ?? (builderMode === "pool" ? "Build pool session" : "Build open water session");
  const resolvedPendingLabel =
    pendingLabel ??
    (builderMode === "pool" ? "Opening pool session..." : "Opening open water session...");
  const buildDraftHref =
    draftHrefBuilder ??
    ((mode: ManualWorkoutBuilderMode) =>
      `/my-library/workouts?draft=${mode}&entry=${
        mode === "pool" ? "manual-pool" : "manual-open-water"
      }`);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    return () => {
      if (navigationFallbackTimeoutRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(navigationFallbackTimeoutRef.current);
      }
    };
  }, []);

  function handleCreateManualSession() {
    setIsOpening(true);
    setError("");

    try {
      const draftHref = buildDraftHref(builderMode);
      const hasCssPaceDefault =
        builderMode === "pool" &&
        typeof manualPoolCssMetricSecondsPer100m === "number" &&
        Number.isFinite(manualPoolCssMetricSecondsPer100m) &&
        manualPoolCssMetricSecondsPer100m > 0;

      void sendClientAnalyticsEvent(
        "workout_builder_started",
        buildWorkoutBuilderStartedPayload({
          builderMode,
          hasCssPaceDefault,
        })
      );

      startTransition(() => {
        router.push(draftHref);
        router.refresh();
      });

      if (typeof window !== "undefined") {
        if (navigationFallbackTimeoutRef.current !== null) {
          window.clearTimeout(navigationFallbackTimeoutRef.current);
        }

        navigationFallbackTimeoutRef.current = window.setTimeout(() => {
          if (typeof window === "undefined") {
            return;
          }

          const resolvedHref = new URL(draftHref, window.location.origin).toString();

          if (window.location.href !== resolvedHref) {
            window.location.assign(draftHref);
          }
        }, 250);
      }
    } catch {
      setError(
        builderMode === "pool"
          ? "Could not open pool session builder."
          : "Could not open open-water session builder."
      );
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        data-testid={testId}
        data-client-ready={clientReady ? "true" : "false"}
        onClick={handleCreateManualSession}
        disabled={!clientReady || isOpening}
        aria-describedby={error ? errorId : undefined}
        className={className}
      >
        {isOpening ? resolvedPendingLabel : resolvedLabel}
      </button>
      {error ? (
        <div
          id={errorId}
          role="alert"
          aria-live="assertive"
          data-feedback-tone="error"
          data-testid={errorId}
          className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-sm leading-6 text-rose-900"
        >
          <p>{error}</p>
        </div>
      ) : null}
    </div>
  );
}
