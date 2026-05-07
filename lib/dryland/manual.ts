import { buildCustomDrylandExercise } from "@/lib/dryland/exercise-bank";
import type { DrylandSessionDraft, DrylandSessionKind } from "@/lib/dryland/shared";

export function buildManualDrylandStarterDraft(
  sessionKind: DrylandSessionKind,
  now = new Date()
): DrylandSessionDraft {
  const label = sessionKind === "strength" ? "Strength session" : "Stretching session";
  const starterExercise = buildCustomDrylandExercise(sessionKind);

  return {
    version: 1,
    sessionKind,
    title: `${label} ${now.toISOString().slice(0, 10)}`,
    description: "",
    focusText: null,
    startedAt: null,
    completedAt: null,
    actualDurationSeconds: null,
    exercises: [starterExercise],
  };
}
