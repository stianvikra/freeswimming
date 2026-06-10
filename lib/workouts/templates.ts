import {
  computeSessionDraftDerivedTotals,
  type SessionDraft,
  type SessionDraftStep,
  type SessionGeneratorEffortPreset,
  type SessionGeneratorSessionType,
} from "@/lib/session-generator-v1/shared";
import type { ManualWorkoutBuilderMode, ManualWorkoutDraftDefaults } from "@/lib/workouts/manual";

export type WorkoutTemplateLifecycleStatus = "active" | "deprecated";

export type WorkoutBuilderTemplate = {
  templateKey: string;
  status: WorkoutTemplateLifecycleStatus;
  title: string;
  description: string;
  category: string;
  sortOrder: number;
  environment: ManualWorkoutBuilderMode;
  sessionType: SessionGeneratorSessionType;
  effort: SessionGeneratorEffortPreset;
  sizeMode: "distance" | "time";
  targetDistanceM: number | null;
  targetTimeMin: number | null;
  summaryItems: string[];
  buildDraft: (now?: Date, defaults?: ManualWorkoutDraftDefaults) => SessionDraft;
};

export type WorkoutTemplateRegistryValidation = {
  ok: boolean;
  errors: string[];
};

export const WORKOUT_TEMPLATE_KEY_PATTERN = /^[a-z0-9][a-z0-9_-]{2,63}$/;

function buildSeed(now: Date) {
  return now
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
}

function buildTemplateStepId(seed: string, index: number) {
  return `manual-template-step-${seed}-${index + 1}`;
}

function buildTemplateRepeatGroupId(seed: string, index: number) {
  return `manual-template-repeat-${seed}-${index + 1}`;
}

function buildTemplateStep(
  seed: string,
  index: number,
  overrides: Partial<SessionDraftStep> = {}
): SessionDraftStep {
  return {
    id: buildTemplateStepId(seed, index),
    category: "main",
    name: "Template step",
    stroke: "freestyle",
    drillType: "none",
    equipment: "none",
    intensity: "moderate",
    durationMode: "distance",
    distanceM: 100,
    timeMin: null,
    targetMode: "effort",
    effortTarget: "moderate",
    targetSummary: "",
    notes: "",
    repeatGroupId: null,
    repeatCount: null,
    repeatEndingRestMode: null,
    postSetRestForRepeatGroupId: null,
    ...overrides,
  };
}

function withDerivedTotals(baseDraft: SessionDraft): SessionDraft {
  const totals = computeSessionDraftDerivedTotals(baseDraft);

  return {
    ...baseDraft,
    totalDistanceM: totals.totalDistanceM,
    estimatedDurationMin: totals.estimatedDurationMin,
  };
}

function buildPoolEnduranceBaseDraft(
  now = new Date(),
  defaults?: ManualWorkoutDraftDefaults
): SessionDraft {
  const createdAt = now.toISOString();
  const seed = buildSeed(now);
  const repeatGroupId = buildTemplateRepeatGroupId(seed, 0);
  const basePaceSecondsPer100m =
    typeof defaults?.basePaceSecondsPer100m === "number" &&
    Number.isFinite(defaults.basePaceSecondsPer100m) &&
    defaults.basePaceSecondsPer100m > 0
      ? defaults.basePaceSecondsPer100m
      : 120;
  const title = "Aerobic base 1000";
  const steps: SessionDraftStep[] = [
    buildTemplateStep(seed, 0, {
      category: "warmup",
      name: "Smooth warmup",
      intensity: "easy",
      durationMode: "distance",
      distanceM: 300,
      effortTarget: "easy",
      targetSummary: "Relaxed freestyle with long strokes.",
    }),
    buildTemplateStep(seed, 1, {
      id: `${repeatGroupId}-step-1`,
      category: "main",
      name: "Aerobic 100",
      intensity: "moderate",
      durationMode: "distance",
      distanceM: 100,
      effortTarget: "moderate",
      targetSummary: "Steady freestyle at a controlled aerobic effort.",
      repeatGroupId,
      repeatCount: 5,
      repeatEndingRestMode: "skip_last_rest",
    }),
    buildTemplateStep(seed, 2, {
      id: `${repeatGroupId}-step-2`,
      category: "rest",
      name: "Between-round rest",
      stroke: "choice",
      intensity: "easy",
      durationMode: "fixed_rest",
      distanceM: null,
      timeMin: 0.33,
      targetMode: "none",
      effortTarget: null,
      targetSummary: "Short reset before the next 100.",
      repeatGroupId,
      repeatCount: 5,
      repeatEndingRestMode: "skip_last_rest",
    }),
    buildTemplateStep(seed, 3, {
      category: "cooldown",
      name: "Easy cooldown",
      stroke: "choice",
      intensity: "easy",
      durationMode: "distance",
      distanceM: 200,
      effortTarget: "easy",
      targetSummary: "Easy choice swim to finish calm.",
    }),
  ];
  const baseDraft: SessionDraft = {
    version: 1,
    status: "draft",
    generatorKind: "rule_engine_v1",
    createdAt,
    sourceFingerprint: `manual-template-${seed}`,
    title,
    titleSuggestions: [title, "Steady aerobic pool session"],
    description: "Registry-backed workout template draft ready for editing.",
    environment: "pool",
    poolLengthUnit: "m",
    poolLengthM: 25,
    sessionType: "endurance",
    effort: "moderate",
    sizeMode: "distance",
    targetDistanceM: 1000,
    targetTimeMin: null,
    totalDistanceM: null,
    estimatedDurationMin: null,
    basePaceSecondsPer100m,
    usedCssPaceLabel: defaults?.usedCssPaceLabel?.trim() || null,
    allowedStrokes: ["freestyle"],
    equipmentAllowlist: [],
    focusText: null,
    goalTitle: null,
    constraintText: null,
    warnings: [],
    steps,
  };

  return withDerivedTotals(baseDraft);
}

function buildPoolTechniqueResetDraft(
  now = new Date(),
  defaults?: ManualWorkoutDraftDefaults
): SessionDraft {
  const createdAt = now.toISOString();
  const seed = buildSeed(now);
  const repeatGroupId = buildTemplateRepeatGroupId(seed, 0);
  const basePaceSecondsPer100m =
    typeof defaults?.basePaceSecondsPer100m === "number" &&
    Number.isFinite(defaults.basePaceSecondsPer100m) &&
    defaults.basePaceSecondsPer100m > 0
      ? defaults.basePaceSecondsPer100m
      : 125;
  const title = "Technique reset 900";
  const steps: SessionDraftStep[] = [
    buildTemplateStep(seed, 0, {
      category: "warmup",
      name: "Easy swim",
      intensity: "easy",
      durationMode: "distance",
      distanceM: 200,
      effortTarget: "easy",
      targetSummary: "Easy freestyle to prepare for drill focus.",
    }),
    buildTemplateStep(seed, 1, {
      id: `${repeatGroupId}-step-1`,
      category: "main",
      name: "Catch drill",
      stroke: "drill",
      drillType: "drill",
      equipment: "none",
      intensity: "easy",
      durationMode: "distance",
      distanceM: 50,
      effortTarget: "easy",
      targetSummary: "Slow drill work with clean catch shape.",
      repeatGroupId,
      repeatCount: 4,
      repeatEndingRestMode: "skip_last_rest",
    }),
    buildTemplateStep(seed, 2, {
      id: `${repeatGroupId}-step-2`,
      category: "main",
      name: "Freestyle reset",
      stroke: "freestyle",
      drillType: "none",
      intensity: "moderate",
      durationMode: "distance",
      distanceM: 50,
      effortTarget: "moderate",
      targetSummary: "Carry the drill feeling into smooth freestyle.",
      repeatGroupId,
      repeatCount: 4,
      repeatEndingRestMode: "skip_last_rest",
    }),
    buildTemplateStep(seed, 3, {
      id: `${repeatGroupId}-step-3`,
      category: "rest",
      name: "Reset rest",
      stroke: "choice",
      intensity: "easy",
      durationMode: "fixed_rest",
      distanceM: null,
      timeMin: 0.25,
      targetMode: "none",
      effortTarget: null,
      targetSummary: "Short reset before the next drill round.",
      repeatGroupId,
      repeatCount: 4,
      repeatEndingRestMode: "skip_last_rest",
    }),
    buildTemplateStep(seed, 4, {
      category: "cooldown",
      name: "Choice cooldown",
      stroke: "choice",
      intensity: "easy",
      durationMode: "distance",
      distanceM: 300,
      effortTarget: "easy",
      targetSummary: "Easy choice swim with relaxed breathing.",
    }),
  ];
  const baseDraft: SessionDraft = {
    version: 1,
    status: "draft",
    generatorKind: "rule_engine_v1",
    createdAt,
    sourceFingerprint: `manual-template-${seed}`,
    title,
    titleSuggestions: [title, "Freestyle technique reset"],
    description: "Registry-backed workout template draft ready for editing.",
    environment: "pool",
    poolLengthUnit: "m",
    poolLengthM: 25,
    sessionType: "technique",
    effort: "moderate",
    sizeMode: "distance",
    targetDistanceM: 900,
    targetTimeMin: null,
    totalDistanceM: null,
    estimatedDurationMin: null,
    basePaceSecondsPer100m,
    usedCssPaceLabel: defaults?.usedCssPaceLabel?.trim() || null,
    allowedStrokes: ["freestyle"],
    equipmentAllowlist: [],
    focusText: "Catch shape",
    goalTitle: null,
    constraintText: null,
    warnings: [],
    steps,
  };

  return withDerivedTotals(baseDraft);
}

export const WORKOUT_BUILDER_TEMPLATE_REGISTRY: WorkoutBuilderTemplate[] = [
  {
    templateKey: "pool_endurance_base_1000",
    status: "active",
    title: "Aerobic base 1000",
    description: "A steady pool session with warmup, aerobic repeats, and cooldown.",
    category: "Pool endurance",
    sortOrder: 10,
    environment: "pool",
    sessionType: "endurance",
    effort: "moderate",
    sizeMode: "distance",
    targetDistanceM: 1000,
    targetTimeMin: null,
    summaryItems: ["1000m", "Pool", "Warmup + 5 x 100 + cooldown"],
    buildDraft: buildPoolEnduranceBaseDraft,
  },
  {
    templateKey: "pool_technique_reset_900",
    status: "active",
    title: "Technique reset 900",
    description: "A drill-focused pool session for catch shape and smooth freestyle reset.",
    category: "Pool technique",
    sortOrder: 20,
    environment: "pool",
    sessionType: "technique",
    effort: "moderate",
    sizeMode: "distance",
    targetDistanceM: 900,
    targetTimeMin: null,
    summaryItems: ["900m", "Pool", "Drill + freestyle rounds"],
    buildDraft: buildPoolTechniqueResetDraft,
  },
];

export function parseWorkoutTemplateKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!WORKOUT_TEMPLATE_KEY_PATTERN.test(normalized)) return null;
  return normalized;
}

export function validateWorkoutTemplateRegistry(
  templates: readonly Pick<
    WorkoutBuilderTemplate,
    "templateKey" | "status" | "title"
  >[] = WORKOUT_BUILDER_TEMPLATE_REGISTRY
): WorkoutTemplateRegistryValidation {
  const errors: string[] = [];
  const seenKeys = new Set<string>();

  for (const template of templates) {
    const parsedKey = parseWorkoutTemplateKey(template.templateKey);

    if (!parsedKey) {
      errors.push(`Invalid templateKey: ${template.templateKey || "(empty)"}`);
    } else if (seenKeys.has(parsedKey)) {
      errors.push(`Duplicate templateKey: ${parsedKey}`);
    } else {
      seenKeys.add(parsedKey);
    }

    if (template.status !== "active" && template.status !== "deprecated") {
      errors.push(`Unsupported template status for ${template.templateKey}: ${template.status}`);
    }

    if (!template.title.trim()) {
      errors.push(`Missing title for ${template.templateKey || "(empty)"}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function getWorkoutTemplateByKey(templateKey: unknown): WorkoutBuilderTemplate | null {
  const parsedKey = parseWorkoutTemplateKey(templateKey);
  if (!parsedKey) return null;

  return (
    WORKOUT_BUILDER_TEMPLATE_REGISTRY.find((template) => template.templateKey === parsedKey) ?? null
  );
}

export function getActiveWorkoutTemplateByKey(templateKey: unknown): WorkoutBuilderTemplate | null {
  const template = getWorkoutTemplateByKey(templateKey);
  return template?.status === "active" ? template : null;
}

export function listActiveWorkoutTemplates(): WorkoutBuilderTemplate[] {
  return WORKOUT_BUILDER_TEMPLATE_REGISTRY.filter((template) => template.status === "active").sort(
    (left, right) => left.sortOrder - right.sortOrder
  );
}

export function buildWorkoutTemplateDraft(
  templateKey: unknown,
  now = new Date(),
  defaults?: ManualWorkoutDraftDefaults
): SessionDraft | null {
  const template = getActiveWorkoutTemplateByKey(templateKey);
  if (!template) return null;

  return template.buildDraft(now, defaults);
}
