import {
  buildCustomDrylandExercise,
  buildDrylandExerciseFromBankItem,
  DRYLAND_EXERCISE_BANK,
} from "@/lib/dryland/exercise-bank";
import type { DrylandSessionDraft, DrylandSessionKind } from "@/lib/dryland/shared";

export function buildManualDrylandStarterDraft(
  sessionKind: DrylandSessionKind,
  now = new Date()
): DrylandSessionDraft {
  const label = sessionKind === "strength" ? "Strength session" : "Stretching session";
  const bankStarter =
    DRYLAND_EXERCISE_BANK.find((item) => item.sessionKinds.includes(sessionKind)) ?? null;
  const starterExercise = bankStarter
    ? buildDrylandExerciseFromBankItem(bankStarter)
    : buildCustomDrylandExercise(sessionKind);

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
