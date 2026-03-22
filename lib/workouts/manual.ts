import {
  computeSessionDraftDerivedTotals,
  type SessionDraft,
  type SessionDraftStep,
} from "@/lib/session-generator-v1/shared";

function buildStepId(seed: string, index: number) {
  return `manual-step-${seed}-${index + 1}`;
}

function buildStarterSteps(seed: string): SessionDraftStep[] {
  return [
    {
      id: buildStepId(seed, 0),
      category: "warmup",
      name: "Warmup swim",
      stroke: "freestyle",
      intensity: "easy",
      durationMode: "distance",
      distanceM: 400,
      timeMin: null,
      targetSummary: "Easy freestyle to settle into the session.",
      notes: "Keep the first 200m relaxed and long.",
    },
    {
      id: buildStepId(seed, 1),
      category: "rest",
      name: "Reset rest",
      stroke: "choice",
      intensity: "easy",
      durationMode: "time",
      distanceM: null,
      timeMin: 1,
      targetSummary: "Easy reset before the main set.",
      notes: "Use this as a simple fixed rest block.",
    },
    {
      id: buildStepId(seed, 2),
      category: "main",
      name: "Main swim set",
      stroke: "freestyle",
      intensity: "moderate",
      durationMode: "distance",
      distanceM: 1000,
      timeMin: null,
      targetSummary: "Steady aerobic main work.",
      notes: "Replace this with your exact set structure.",
    },
    {
      id: buildStepId(seed, 3),
      category: "rest",
      name: "Recovery rest",
      stroke: "choice",
      intensity: "easy",
      durationMode: "time",
      distanceM: null,
      timeMin: 1,
      targetSummary: "Short recovery before cooldown.",
      notes: "Adjust or remove when you refine the workout.",
    },
    {
      id: buildStepId(seed, 4),
      category: "cooldown",
      name: "Cooldown swim",
      stroke: "choice",
      intensity: "easy",
      durationMode: "distance",
      distanceM: 200,
      timeMin: null,
      targetSummary: "Easy swim to finish calmer than you started.",
      notes: "Swap stroke or distance as needed.",
    },
  ];
}

export function buildManualWorkoutStarterDraft(now = new Date()): SessionDraft {
  const createdAt = now.toISOString();
  const seed = createdAt.replace(/[^0-9]/g, "").slice(0, 14);
  const title = "Manual pool workout";
  const steps = buildStarterSteps(seed);
  const baseDraft: SessionDraft = {
    version: 1,
    status: "draft",
    generatorKind: "rule_engine_v1",
    createdAt,
    sourceFingerprint: `manual-${seed}`,
    title,
    titleSuggestions: [title, "Manual endurance workout"],
    description: "Starter manual workout scaffold ready for editing in the builder.",
    environment: "pool",
    poolLengthM: 25,
    sessionType: "endurance",
    effort: "moderate",
    sizeMode: "distance",
    targetDistanceM: 1600,
    targetTimeMin: null,
    totalDistanceM: null,
    estimatedDurationMin: null,
    basePaceSecondsPer100m: 120,
    usedCssPaceLabel: null,
    allowedStrokes: ["freestyle"],
    equipmentAllowlist: [],
    focusText: null,
    goalTitle: null,
    constraintText: null,
    warnings: [],
    steps,
  };
  const totals = computeSessionDraftDerivedTotals(baseDraft);

  return {
    ...baseDraft,
    totalDistanceM: totals.totalDistanceM,
    estimatedDurationMin: totals.estimatedDurationMin,
  };
}
