import type { GeneratorIntakeHandoffPayload } from "@/lib/generator-intake/shared";
import {
  buildSessionTargetSummary,
  computeSessionDraftDerivedTotals,
  formatDistanceMetersLabel,
  formatPoolLengthLabel,
  getSessionEffortLabel,
  getSessionEnvironmentLabel,
  getSessionStepStrokeLabel,
  getSessionTypeLabel,
  roundDistanceForEnvironment,
  SESSION_GENERATOR_EQUIPMENT,
  SESSION_GENERATOR_STROKES,
  type SessionDraft,
  type SessionDraftStep,
  type SessionDraftStepCategory,
  type SessionGeneratorInput,
  type SessionGeneratorSessionType,
  type SessionGeneratorStroke,
} from "@/lib/session-generator-v1/shared";

type BuildSessionDraftOptions = {
  createdAt?: string;
};

type SegmentPlan = {
  warmup: number;
  drill: number;
  kick: number;
  main: number;
  rest: number;
  cooldown: number;
  swim: number;
};

const DISTANCE_EPSILON = 0.001;
const DISTANCE_PRECISION_FACTOR = 10000;

export function buildSessionDraft(
  handoff: GeneratorIntakeHandoffPayload,
  input: SessionGeneratorInput,
  options?: BuildSessionDraftOptions
): SessionDraft {
  const createdAt = options?.createdAt ?? new Date().toISOString();
  const goalTitle =
    handoff.source.openGoals[0]?.title ?? handoff.source.activeFocus?.goalTitle ?? null;
  const focusText = handoff.overrides.focusText ?? handoff.source.activeFocus?.title ?? null;
  const constraintText = handoff.overrides.constraintText;
  const warnings: string[] = [];

  const adjustedInput = applyGuardrails(input, warnings);
  const basePaceSecondsPer100m = estimateBasePaceSecondsPer100m(handoff, adjustedInput);
  const usedCssPaceLabel = handoff.source.cssMetric?.paceLabel ?? null;

  let totalDistanceM =
    adjustedInput.sizeMode === "distance"
      ? adjustedInput.targetDistanceM
      : estimateDistanceFromTime(
          adjustedInput.targetTimeMin ?? 45,
          basePaceSecondsPer100m,
          adjustedInput
        );
  let estimatedDurationMin =
    adjustedInput.sizeMode === "estimated_time"
      ? adjustedInput.targetTimeMin
      : estimateDurationFromDistance(totalDistanceM ?? 0, basePaceSecondsPer100m);

  const segmentPlan = buildSegmentPlan(adjustedInput);
  const steps =
    adjustedInput.environment === "open_water" && adjustedInput.sizeMode === "estimated_time"
      ? buildTimeBasedSteps({
          input: adjustedInput,
          totalMinutes: adjustedInput.targetTimeMin ?? estimatedDurationMin ?? 45,
          focusText,
          constraintText,
          basePaceSecondsPer100m,
        })
      : buildDistanceStepsForTarget({
          input: adjustedInput,
          totalDistanceM: totalDistanceM ?? 2000,
          targetTimeMin: adjustedInput.targetTimeMin,
          segmentPlan,
          focusText,
          constraintText,
          usedCssPaceLabel,
          basePaceSecondsPer100m,
          createdAt,
        });
  if (adjustedInput.sizeMode === "estimated_time" && adjustedInput.environment === "pool") {
    const candidateTotals = computeSessionDraftDerivedTotals(
      buildTotalsCandidateDraft({
        input: adjustedInput,
        createdAt,
        basePaceSecondsPer100m,
        usedCssPaceLabel,
        steps,
      })
    );
    totalDistanceM = candidateTotals.totalDistanceM ?? totalDistanceM;
    estimatedDurationMin = candidateTotals.estimatedDurationMin ?? estimatedDurationMin;
  }

  const titleSuggestions = buildTitleSuggestions(adjustedInput, goalTitle, focusText);
  const description = buildDraftDescription({
    input: adjustedInput,
    goalTitle,
    focusText,
    constraintText,
    usedCssPaceLabel,
  });

  const draft: SessionDraft = {
    version: 1,
    status: "draft",
    generatorKind: "rule_engine_v1",
    createdAt,
    sourceFingerprint: handoff.sourceFingerprint,
    title: titleSuggestions[0],
    titleSuggestions,
    description,
    environment: adjustedInput.environment,
    poolLengthUnit: adjustedInput.poolLengthUnit,
    poolLengthM: adjustedInput.poolLengthM,
    sessionType: adjustedInput.sessionType,
    effort: adjustedInput.effort,
    sizeMode: adjustedInput.sizeMode,
    targetDistanceM: adjustedInput.targetDistanceM,
    targetTimeMin: adjustedInput.targetTimeMin,
    totalDistanceM,
    estimatedDurationMin,
    basePaceSecondsPer100m,
    usedCssPaceLabel,
    allowedStrokes: adjustedInput.allowedStrokes,
    equipmentAllowlist: adjustedInput.equipmentAllowlist,
    focusText,
    goalTitle,
    constraintText,
    warnings,
    steps,
  };

  const totals = computeSessionDraftDerivedTotals(draft);
  return {
    ...draft,
    totalDistanceM: totals.totalDistanceM ?? draft.totalDistanceM,
    estimatedDurationMin: totals.estimatedDurationMin ?? draft.estimatedDurationMin,
  };
}

function applyGuardrails(input: SessionGeneratorInput, warnings: string[]): SessionGeneratorInput {
  if (input.environment === "pool") return input;

  const next = {
    ...input,
    includeDrills: false,
    includeKick: false,
    poolLengthUnit: "m" as const,
    poolLengthM: null,
  };

  if (input.includeDrills) {
    warnings.push("Open-water draft review skips dedicated drill blocks in this first slice.");
  }

  if (input.includeKick) {
    warnings.push("Open-water draft review skips dedicated kick blocks in this first slice.");
  }

  return next;
}

function estimateBasePaceSecondsPer100m(
  handoff: GeneratorIntakeHandoffPayload,
  input: SessionGeneratorInput
) {
  const cssSeconds = handoff.source.cssMetric?.valueSeconds ?? null;

  if (cssSeconds) {
    switch (input.effort) {
      case "easy":
        return cssSeconds + 18;
      case "moderate":
        return cssSeconds + 10;
      case "hard":
        return cssSeconds + 4;
      case "very_hard":
        return Math.max(55, cssSeconds);
      case "race_pace":
        return Math.max(52, cssSeconds - 2);
    }
  }

  switch (input.effort) {
    case "easy":
      return 140;
    case "moderate":
      return 132;
    case "hard":
      return 124;
    case "very_hard":
      return 118;
    case "race_pace":
      return 114;
  }
}

function estimateDistanceFromTime(
  targetTimeMin: number,
  basePaceSecondsPer100m: number,
  input: SessionGeneratorInput
) {
  const rawDistance = (targetTimeMin * 60 * 100) / basePaceSecondsPer100m;
  return roundDistanceForEnvironment(rawDistance, input.environment, input.poolLengthM);
}

function estimateDurationFromDistance(distanceM: number, basePaceSecondsPer100m: number) {
  return Math.max(1, Math.round(((distanceM / 100) * basePaceSecondsPer100m) / 60));
}

function buildDistanceStepsForTarget(input: {
  input: SessionGeneratorInput;
  totalDistanceM: number;
  targetTimeMin: number | null;
  segmentPlan: SegmentPlan;
  focusText: string | null;
  constraintText: string | null;
  usedCssPaceLabel: string | null;
  basePaceSecondsPer100m: number;
  createdAt: string;
}) {
  const {
    input: sessionInput,
    segmentPlan,
    focusText,
    constraintText,
    usedCssPaceLabel,
    basePaceSecondsPer100m,
    createdAt,
  } = input;

  if (sessionInput.sizeMode !== "estimated_time" || sessionInput.environment !== "pool") {
    return buildDistanceBasedSteps({
      input: sessionInput,
      totalDistanceM: input.totalDistanceM,
      segmentPlan,
      focusText,
      constraintText,
      usedCssPaceLabel,
    });
  }

  const targetTimeMin = input.targetTimeMin ?? 45;
  let candidateDistance = input.totalDistanceM;
  let candidateSteps = buildDistanceBasedSteps({
    input: sessionInput,
    totalDistanceM: candidateDistance,
    segmentPlan,
    focusText,
    constraintText,
    usedCssPaceLabel,
  });

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const totals = computeSessionDraftDerivedTotals(
      buildTotalsCandidateDraft({
        input: sessionInput,
        createdAt,
        basePaceSecondsPer100m,
        usedCssPaceLabel,
        steps: candidateSteps,
      })
    );
    const estimatedMinutes = totals.estimatedDurationMin ?? targetTimeMin;

    if (Math.abs(estimatedMinutes - targetTimeMin) <= 1) {
      break;
    }

    const nextDistance = roundDistanceForEnvironment(
      Math.max(
        sessionInput.poolLengthM ?? 25,
        candidateDistance * (targetTimeMin / estimatedMinutes)
      ),
      sessionInput.environment,
      sessionInput.poolLengthM
    );

    if (Math.abs(nextDistance - candidateDistance) < DISTANCE_EPSILON) {
      break;
    }

    candidateDistance = nextDistance;
    candidateSteps = buildDistanceBasedSteps({
      input: sessionInput,
      totalDistanceM: candidateDistance,
      segmentPlan,
      focusText,
      constraintText,
      usedCssPaceLabel,
    });
  }

  return candidateSteps;
}

function buildTotalsCandidateDraft(input: {
  input: SessionGeneratorInput;
  createdAt: string;
  basePaceSecondsPer100m: number;
  usedCssPaceLabel: string | null;
  steps: SessionDraftStep[];
}): SessionDraft {
  return {
    version: 1,
    status: "draft",
    generatorKind: "rule_engine_v1",
    createdAt: input.createdAt,
    sourceFingerprint: "totals-candidate",
    title: "Totals candidate",
    titleSuggestions: ["Totals candidate"],
    description: "",
    environment: input.input.environment,
    poolLengthUnit: input.input.poolLengthUnit,
    poolLengthM: input.input.poolLengthM,
    sessionType: input.input.sessionType,
    effort: input.input.effort,
    sizeMode: input.input.sizeMode,
    targetDistanceM: input.input.targetDistanceM,
    targetTimeMin: input.input.targetTimeMin,
    totalDistanceM: null,
    estimatedDurationMin: null,
    basePaceSecondsPer100m: input.basePaceSecondsPer100m,
    usedCssPaceLabel: input.usedCssPaceLabel,
    allowedStrokes: input.input.allowedStrokes,
    equipmentAllowlist: input.input.equipmentAllowlist,
    focusText: null,
    goalTitle: null,
    constraintText: null,
    warnings: [],
    steps: input.steps,
  };
}

function buildSegmentPlan(input: SessionGeneratorInput): SegmentPlan {
  const baseByType: Record<SessionGeneratorSessionType, SegmentPlan> = {
    recovery: { warmup: 30, drill: 0, kick: 0, main: 45, rest: 0, cooldown: 25, swim: 0 },
    endurance: { warmup: 20, drill: 0, kick: 0, main: 60, rest: 0, cooldown: 20, swim: 0 },
    technique: { warmup: 20, drill: 30, kick: 0, main: 30, rest: 0, cooldown: 20, swim: 0 },
    technical_fault_correction: {
      warmup: 20,
      drill: 35,
      kick: 0,
      main: 25,
      rest: 0,
      cooldown: 20,
      swim: 0,
    },
    threshold_css: {
      warmup: 20,
      drill: 0,
      kick: 0,
      main: 60,
      rest: 0,
      cooldown: 20,
      swim: 0,
    },
    speed: { warmup: 20, drill: 10, kick: 0, main: 50, rest: 0, cooldown: 20, swim: 0 },
    race_pace: { warmup: 20, drill: 5, kick: 0, main: 55, rest: 0, cooldown: 20, swim: 0 },
  };

  const plan = { ...baseByType[input.sessionType] };

  if (input.includeDrills && input.drillVolumeMode === "explicit") {
    plan.drill = 0;
  }

  if (input.includeDrills && plan.drill === 0) {
    plan.drill = 10;
    plan.main -= 10;
  }

  if (input.includeKick && input.kickVolumeMode === "explicit") {
    plan.kick = 0;
  }

  if (input.includeKick) {
    plan.kick = 10;
    plan.main -= 5;
    plan.warmup -= 5;
  }

  return plan;
}

function buildDistanceBasedSteps(input: {
  input: SessionGeneratorInput;
  totalDistanceM: number;
  segmentPlan: SegmentPlan;
  focusText: string | null;
  constraintText: string | null;
  usedCssPaceLabel: string | null;
}): SessionDraftStep[] {
  const {
    input: sessionInput,
    totalDistanceM,
    segmentPlan,
    focusText,
    constraintText,
    usedCssPaceLabel,
  } = input;
  const roundingUnit = sessionInput.environment === "pool" ? (sessionInput.poolLengthM ?? 25) : 50;
  const segments = allocateRoundedValues(totalDistanceM, segmentPlan, roundingUnit);
  if (
    sessionInput.includeDrills &&
    sessionInput.drillVolumeMode === "explicit" &&
    sessionInput.drillTargetMeters
  ) {
    const explicitDrill = roundDistanceForEnvironment(
      sessionInput.drillTargetMeters,
      sessionInput.environment,
      sessionInput.poolLengthM
    );
    const difference = explicitDrill - segments.drill;
    segments.drill = explicitDrill;
    segments.main = Math.max(roundingUnit, segments.main - difference);
  }
  if (
    sessionInput.includeKick &&
    sessionInput.kickVolumeMode === "explicit" &&
    sessionInput.kickTargetMeters
  ) {
    const explicitKick = roundDistanceForEnvironment(
      sessionInput.kickTargetMeters,
      sessionInput.environment,
      sessionInput.poolLengthM
    );
    const difference = explicitKick - segments.kick;
    segments.kick = explicitKick;
    segments.main = Math.max(roundingUnit, segments.main - difference);
  }
  applySkillLimitSegmentTargets(sessionInput, segments);
  rebalanceSegmentsToTotal(segments, totalDistanceM, roundingUnit);
  const coreDistanceM = segments.warmup + segments.main + segments.cooldown + segments.swim;
  const strokeChoice = selectStrokeChoice(sessionInput.allowedStrokes, sessionInput, coreDistanceM);
  const restSeconds =
    sessionInput.environment === "pool" ? resolvePoolRestSeconds(sessionInput) : null;
  const steps: SessionDraftStep[] = [];

  const warmupStep: SessionDraftStep = {
    id: "warmup-1",
    category: "warmup",
    name: "Easy warmup swim",
    stroke: strokeChoice,
    intensity: "easy",
    durationMode: "distance",
    distanceM: segments.warmup,
    timeMin: null,
    targetMode: "effort",
    effortTarget: "easy",
    targetSummary: "Easy swimming with relaxed breathing and long strokes.",
    notes: focusText
      ? `Keep ${focusText.toLowerCase()} present from the first length.`
      : "Start smooth and settle the stroke before the main work.",
  };
  const warmupRepeatSteps = buildPoolRepeatBlocks({
    baseStep: warmupStep,
    groupId: "warmup-repeat-1",
    repeatDistanceM: chooseRepeatDistanceWhenStrokeLimited(
      sessionInput,
      segments.warmup,
      strokeChoice
    ),
    totalDistanceM: segments.warmup,
    restSeconds,
    restName: "Warmup interval rest",
    restTargetSummary: "Reset enough to keep the warmup relaxed.",
    postSetRestName: "Post-warmup rest",
    postSetRestTargetSummary: "Easy reset before the technique block.",
  });

  if (warmupRepeatSteps) {
    steps.push(...warmupRepeatSteps);
  } else {
    steps.push(warmupStep);
    appendStandaloneRestStep(steps, restSeconds, {
      id: "warmup-rest-1",
      name: "Reset rest",
      targetSummary: "Easy reset before the technique block.",
    });
  }

  if (segments.drill > 0) {
    const drillStep: SessionDraftStep = {
      id: "drill-1",
      category: "drill",
      name: "Drill",
      stroke: strokeChoice,
      intensity: "easy",
      durationMode: "distance",
      distanceM: segments.drill,
      timeMin: null,
      targetMode: "effort",
      effortTarget: "easy",
      targetSummary: "Alternate drill and swim to keep form ahead of speed.",
      drillType: "drill",
      notes: buildDrillNote(sessionInput, focusText),
    };
    const drillRepeatSteps = buildPoolRepeatBlocks({
      baseStep: drillStep,
      groupId: "drill-repeat-1",
      repeatDistanceM: chooseDrillRepeatDistance(sessionInput, segments.drill),
      totalDistanceM: segments.drill,
      restSeconds,
      restName: "Drill reset rest",
      restTargetSummary: "Reset form quality before the next drill repeat.",
      postSetRestName: "Post-drill rest",
      postSetRestTargetSummary: "Reset before the next block.",
    });

    if (drillRepeatSteps) {
      steps.push(...drillRepeatSteps);
    } else {
      steps.push(drillStep);
      appendStandaloneRestStep(steps, restSeconds, {
        id: "drill-rest-1",
        name: "Drill reset rest",
        targetSummary: "Reset before the next block.",
      });
    }
  }

  if (segments.kick > 0) {
    const kickStep: SessionDraftStep = {
      id: "kick-1",
      category: "kick",
      name: "Kick set",
      stroke: "choice",
      intensity: "moderate",
      durationMode: "distance",
      distanceM: segments.kick,
      timeMin: null,
      drillType: "kick",
      equipment: sessionInput.equipmentAllowlist.includes("kickboard") ? "kickboard" : null,
      targetMode: "effort",
      effortTarget: "moderate",
      targetSummary: "Controlled kick that supports body line without spiking fatigue.",
      notes: buildKickNote(sessionInput, constraintText),
    };
    const kickRepeatSteps = buildPoolRepeatBlocks({
      baseStep: kickStep,
      groupId: "kick-repeat-1",
      repeatDistanceM: chooseKickRepeatDistance(sessionInput, segments.kick),
      totalDistanceM: segments.kick,
      restSeconds,
      restName: "Kick interval rest",
      restTargetSummary: "Short recovery before the next kick repeat.",
      postSetRestName: "Post-kick rest",
      postSetRestTargetSummary: "Reset before returning to swim work.",
    });

    if (kickRepeatSteps) {
      steps.push(...kickRepeatSteps);
    } else {
      steps.push(kickStep);
      appendStandaloneRestStep(steps, restSeconds, {
        id: "kick-rest-1",
        name: "Kick reset rest",
        targetSummary: "Reset before returning to swim work.",
      });
    }
  }

  const mainStep: SessionDraftStep = {
    id: "main-1",
    category: "main",
    name: buildMainStepName(sessionInput.sessionType),
    stroke: strokeChoice,
    intensity: sessionInput.effort,
    durationMode: "distance",
    distanceM: segments.main,
    timeMin: null,
    targetMode: "effort",
    effortTarget: sessionInput.effort,
    targetSummary: buildMainTargetSummary(
      sessionInput.sessionType,
      sessionInput.effort,
      usedCssPaceLabel
    ),
    notes: buildDistanceMainSetNote({
      input: sessionInput,
      mainDistanceM: segments.main,
      usedCssPaceLabel,
      focusText,
    }),
  };
  const mainRepeatSteps = buildPoolRepeatBlocks({
    baseStep: mainStep,
    groupId: "main-repeat-1",
    repeatDistanceM: chooseRepeatDistanceWhenStrokeLimited(
      sessionInput,
      segments.main,
      strokeChoice
    ),
    totalDistanceM: segments.main,
    restSeconds,
    restName: "Main interval rest",
    restTargetSummary: "Recover enough to hold the intended main-set quality.",
    postSetRestName: "Post-main rest",
    postSetRestTargetSummary: "Reset after the main set.",
  });

  if (mainRepeatSteps) {
    steps.push(...mainRepeatSteps);
  } else {
    steps.push(mainStep);
    appendStandaloneRestStep(steps, restSeconds, {
      id: "main-rest-1",
      name: "Main set rest",
      targetSummary: "Reset after the main set.",
    });
  }

  const cooldownStep: SessionDraftStep = {
    id: "cooldown-1",
    category: "cooldown",
    name: "Cooldown swim",
    stroke: strokeChoice,
    intensity: "easy",
    durationMode: "distance",
    distanceM: segments.cooldown,
    timeMin: null,
    targetMode: "effort",
    effortTarget: "easy",
    targetSummary: "Easy swim to bring the heart rate and tension down.",
    notes: "Finish smoother than you started and leave the water feeling controlled.",
  };
  const cooldownRepeatSteps = buildPoolRepeatBlocks({
    baseStep: cooldownStep,
    groupId: "cooldown-repeat-1",
    repeatDistanceM: chooseRepeatDistanceWhenStrokeLimited(
      sessionInput,
      segments.cooldown,
      strokeChoice
    ),
    totalDistanceM: segments.cooldown,
    restSeconds,
    restName: "Cooldown interval rest",
    restTargetSummary: "Keep the easy finish calm.",
    postSetRestName: "Finish rest",
    postSetRestTargetSummary: "Final reset after cooldown.",
  });

  if (cooldownRepeatSteps) {
    steps.push(...cooldownRepeatSteps);
  } else {
    steps.push(cooldownStep);
    appendStandaloneRestStep(steps, restSeconds, {
      id: "cooldown-rest-1",
      name: "Finish rest",
      targetSummary: "Final reset after cooldown.",
    });
  }

  return steps;
}

function resolvePoolRestSeconds(sessionInput: SessionGeneratorInput) {
  if (sessionInput.restMode === "explicit" && sessionInput.restSeconds) {
    return sessionInput.restSeconds;
  }

  switch (sessionInput.sessionType) {
    case "recovery":
      return 20;
    case "endurance":
      return 30;
    case "technique":
    case "technical_fault_correction":
      return 30;
    case "threshold_css":
      return 20;
    case "speed":
      return 45;
    case "race_pace":
      return 30;
  }
}

function appendStandaloneRestStep(
  steps: SessionDraftStep[],
  restSeconds: number | null,
  input: {
    id: string;
    name: string;
    targetSummary: string;
  }
) {
  if (!restSeconds) return;

  steps.push(
    buildPoolRestStep(input.id, {
      name: input.name,
      restSeconds,
      targetSummary: input.targetSummary,
    })
  );
}

function buildPoolRestStep(
  id: string,
  input: {
    name: string;
    restSeconds: number;
    targetSummary: string;
    repeatGroupId?: string | null;
    repeatCount?: number | null;
    postSetRestForRepeatGroupId?: string | null;
  }
): SessionDraftStep {
  return {
    id,
    category: "rest",
    name: input.name,
    stroke: "choice",
    intensity: "recovery",
    durationMode: "fixed_rest",
    distanceM: null,
    timeMin: input.restSeconds / 60,
    targetMode: "none",
    effortTarget: null,
    targetSummary: input.targetSummary,
    notes: "",
    repeatGroupId: input.repeatGroupId ?? null,
    repeatCount: input.repeatCount ?? null,
    repeatEndingRestMode: input.repeatGroupId ? "skip_last_rest" : null,
    postSetRestForRepeatGroupId: input.postSetRestForRepeatGroupId ?? null,
  };
}

function buildPoolRepeatBlock(input: {
  baseStep: SessionDraftStep;
  groupId: string;
  repeatDistanceM: number | null;
  totalDistanceM: number;
  restSeconds: number | null;
  restName: string;
  restTargetSummary: string;
  postSetRestName: string;
  postSetRestTargetSummary: string;
}) {
  const repeatDistanceM = input.repeatDistanceM;
  if (!repeatDistanceM || repeatDistanceM <= 0) return null;
  if (!isDistanceDivisibleBy(input.totalDistanceM, repeatDistanceM)) return null;

  const repeatCount = Math.round(input.totalDistanceM / repeatDistanceM);
  if (repeatCount < 2 || repeatCount > 20) return null;

  const repeatEndingRestMode = input.restSeconds ? "skip_last_rest" : "use_last_rest";
  const workStep: SessionDraftStep = {
    ...input.baseStep,
    id: `${input.groupId}-step-1`,
    distanceM: repeatDistanceM,
    repeatGroupId: input.groupId,
    repeatCount,
    repeatEndingRestMode,
    postSetRestForRepeatGroupId: null,
  };

  if (!input.restSeconds) {
    return [workStep];
  }

  return [
    workStep,
    buildPoolRestStep(`${input.groupId}-step-2`, {
      name: input.restName,
      restSeconds: input.restSeconds,
      targetSummary: input.restTargetSummary,
      repeatGroupId: input.groupId,
      repeatCount,
    }),
    buildPoolRestStep(`${input.groupId}-post-set-rest`, {
      name: input.postSetRestName,
      restSeconds: input.restSeconds,
      targetSummary: input.postSetRestTargetSummary,
      postSetRestForRepeatGroupId: input.groupId,
    }),
  ];
}

function buildPoolRepeatBlocks(input: {
  baseStep: SessionDraftStep;
  groupId: string;
  repeatDistanceM: number | null;
  totalDistanceM: number;
  restSeconds: number | null;
  restName: string;
  restTargetSummary: string;
  postSetRestName: string;
  postSetRestTargetSummary: string;
}) {
  const repeatDistanceM = input.repeatDistanceM;
  if (!repeatDistanceM || repeatDistanceM <= 0) return null;
  if (!isDistanceDivisibleBy(input.totalDistanceM, repeatDistanceM)) return null;

  const repeatCount = Math.round(input.totalDistanceM / repeatDistanceM);
  if (repeatCount < 2) return null;

  if (repeatCount <= 20) {
    return buildPoolRepeatBlock(input);
  }

  const groupCount = Math.ceil(repeatCount / 20);
  const baseRepeatCount = Math.floor(repeatCount / groupCount);
  let remainder = repeatCount % groupCount;
  const blocks: SessionDraftStep[] = [];

  for (let index = 0; index < groupCount; index += 1) {
    const chunkRepeatCount = baseRepeatCount + (remainder > 0 ? 1 : 0);
    remainder = Math.max(0, remainder - 1);

    if (chunkRepeatCount < 2 || chunkRepeatCount > 20) return null;

    const groupId = replaceTrailingNumber(input.groupId, index + 1);
    const block = buildPoolRepeatBlock({
      ...input,
      groupId,
      totalDistanceM: chunkRepeatCount * repeatDistanceM,
    });

    if (!block) return null;
    blocks.push(...block);
  }

  return blocks;
}

function replaceTrailingNumber(value: string, nextNumber: number) {
  return /\d+$/.test(value) ? value.replace(/\d+$/, String(nextNumber)) : `${value}-${nextNumber}`;
}

function chooseDrillRepeatDistance(sessionInput: SessionGeneratorInput, totalDistanceM: number) {
  const poolLength = sessionInput.poolLengthM ?? 25;
  const preferred = poolLength >= 50 ? 100 : 50;
  return chooseCappedRepeatDistance({
    totalDistanceM,
    preferredDistanceM: preferred,
    poolLengthM: poolLength,
    maxRepeatDistanceM: sessionInput.skillLimits.drill.maxRepeatDistanceM,
  });
}

function chooseKickRepeatDistance(sessionInput: SessionGeneratorInput, totalDistanceM: number) {
  const maxRepeatDistanceM =
    sessionInput.skillLimits.kick.maxRepeatDistanceM ?? sessionInput.kickIntervalMeters;
  if (
    sessionInput.kickIntervalMeters &&
    isDistanceDivisibleBy(totalDistanceM, sessionInput.kickIntervalMeters) &&
    (!maxRepeatDistanceM || sessionInput.kickIntervalMeters <= maxRepeatDistanceM)
  ) {
    return sessionInput.kickIntervalMeters;
  }

  const poolLength = sessionInput.poolLengthM ?? 25;
  const preferred = poolLength >= 50 ? 50 : 25;
  return chooseCappedRepeatDistance({
    totalDistanceM,
    preferredDistanceM: preferred,
    poolLengthM: poolLength,
    maxRepeatDistanceM,
  });
}

function applySkillLimitSegmentTargets(
  sessionInput: SessionGeneratorInput,
  segments: Record<SessionDraftStepCategory, number>
) {
  if (
    segments.drill > 0 &&
    sessionInput.drillVolumeMode === "coach_decides" &&
    sessionInput.skillLimits.drill.targetTotalDistanceM
  ) {
    segments.drill = roundDistanceForEnvironment(
      sessionInput.skillLimits.drill.targetTotalDistanceM,
      sessionInput.environment,
      sessionInput.poolLengthM
    );
  }

  if (
    segments.kick > 0 &&
    sessionInput.kickVolumeMode === "coach_decides" &&
    sessionInput.skillLimits.kick.targetTotalDistanceM
  ) {
    segments.kick = roundDistanceForEnvironment(
      sessionInput.skillLimits.kick.targetTotalDistanceM,
      sessionInput.environment,
      sessionInput.poolLengthM
    );
  }
}

function rebalanceSegmentsToTotal(
  segments: Record<SessionDraftStepCategory, number>,
  targetTotalDistanceM: number,
  roundingUnit: number
) {
  const categories: SessionDraftStepCategory[] = [
    "warmup",
    "drill",
    "kick",
    "main",
    "rest",
    "cooldown",
    "swim",
  ];
  let currentTotal = sumSegmentDistances(segments, categories);
  const targetTolerance = Math.max(DISTANCE_EPSILON, roundingUnit / 2);
  let adjustmentCount = 0;

  while (
    Math.abs(currentTotal - targetTotalDistanceM) > targetTolerance &&
    adjustmentCount < 1000
  ) {
    const diff = roundGeneratorDistance(targetTotalDistanceM - currentTotal);

    if (diff > 0) {
      segments.main = roundGeneratorDistance(segments.main + roundingUnit);
    } else {
      const reduced = reduceFirstAvailableSegment(segments, roundingUnit);
      if (!reduced) break;
    }

    currentTotal = sumSegmentDistances(segments, categories);
    adjustmentCount += 1;
  }
}

function reduceFirstAvailableSegment(
  segments: Record<SessionDraftStepCategory, number>,
  roundingUnit: number
) {
  const reductionOrder: SessionDraftStepCategory[] = ["main", "cooldown", "warmup", "swim"];

  for (const category of reductionOrder) {
    if (segments[category] > roundingUnit) {
      segments[category] = roundGeneratorDistance(segments[category] - roundingUnit);
      return true;
    }
  }

  return false;
}

function chooseCappedRepeatDistance(input: {
  totalDistanceM: number;
  preferredDistanceM: number;
  poolLengthM: number;
  maxRepeatDistanceM: number | null | undefined;
}) {
  const maxRepeatDistanceM = input.maxRepeatDistanceM ?? null;
  const maxCandidate = Math.max(
    input.poolLengthM,
    Math.min(input.preferredDistanceM, maxRepeatDistanceM ?? input.preferredDistanceM)
  );
  const candidates = new Set<number>();

  candidates.add(input.preferredDistanceM);
  candidates.add(input.poolLengthM);
  if (maxRepeatDistanceM) candidates.add(maxRepeatDistanceM);

  for (
    let candidate = input.poolLengthM;
    candidate <= maxCandidate + DISTANCE_EPSILON;
    candidate = roundGeneratorDistance(candidate + input.poolLengthM)
  ) {
    candidates.add(candidate);
  }

  const sortedCandidates = Array.from(candidates)
    .filter((value) => typeof value === "number" && Number.isFinite(value) && value > 0)
    .filter((value) => !maxRepeatDistanceM || value <= maxRepeatDistanceM)
    .sort((a, b) => b - a);

  for (const candidate of sortedCandidates) {
    if (isDistanceDivisibleBy(input.totalDistanceM, candidate)) return candidate;
  }

  return null;
}

function isDistanceDivisibleBy(totalDistanceM: number, repeatDistanceM: number) {
  if (repeatDistanceM <= 0) return false;
  const quotient = totalDistanceM / repeatDistanceM;
  return Math.abs(quotient - Math.round(quotient)) < 0.001;
}

function buildTimeBasedSteps(input: {
  input: SessionGeneratorInput;
  totalMinutes: number;
  focusText: string | null;
  constraintText: string | null;
  basePaceSecondsPer100m: number;
}): SessionDraftStep[] {
  const {
    input: sessionInput,
    totalMinutes,
    focusText,
    constraintText,
    basePaceSecondsPer100m,
  } = input;
  const segments = allocateMinuteSegments(totalMinutes, buildSegmentPlan(sessionInput));
  const strokeChoice = selectStrokeChoice(sessionInput.allowedStrokes);

  return [
    {
      id: "warmup-1",
      category: "warmup",
      name: "Easy entry and warmup",
      stroke: strokeChoice,
      intensity: "easy",
      durationMode: "time",
      distanceM: null,
      timeMin: segments.warmup,
      targetMode: "effort",
      effortTarget: "easy",
      targetSummary: "Easy swim with relaxed breathing and sighting setup.",
      notes: focusText
        ? `Keep ${focusText.toLowerCase()} present while finding rhythm.`
        : "Settle rhythm, breathing, and sighting before the main work.",
    },
    {
      id: "main-1",
      category: "main",
      name: buildMainStepName(sessionInput.sessionType),
      stroke: strokeChoice,
      intensity: sessionInput.effort,
      durationMode: "time",
      distanceM: null,
      timeMin: segments.main,
      targetMode: "effort",
      effortTarget: sessionInput.effort,
      targetSummary: buildMainTargetSummary(sessionInput.sessionType, sessionInput.effort, null),
      notes: buildOpenWaterMainSetNote({
        input: sessionInput,
        mainMinutes: segments.main,
        focusText,
        constraintText,
        basePaceSecondsPer100m,
      }),
    },
    {
      id: "cooldown-1",
      category: "cooldown",
      name: "Cooldown swim",
      stroke: strokeChoice,
      intensity: "easy",
      durationMode: "time",
      distanceM: null,
      timeMin: segments.cooldown,
      targetMode: "effort",
      effortTarget: "easy",
      targetSummary: "Easy swimming to reset stroke length before finishing.",
      notes: "Ease off the pressure and finish with calm breathing.",
    },
  ];
}

function allocateRoundedValues(
  total: number,
  plan: SegmentPlan,
  roundingUnit: number
): Record<SessionDraftStepCategory, number> {
  const categories: SessionDraftStepCategory[] = [
    "warmup",
    "drill",
    "kick",
    "main",
    "rest",
    "cooldown",
    "swim",
  ];
  const result = {
    warmup: 0,
    drill: 0,
    kick: 0,
    main: 0,
    rest: 0,
    cooldown: 0,
    swim: 0,
  } satisfies Record<SessionDraftStepCategory, number>;

  for (const category of categories) {
    if (plan[category] <= 0) continue;
    result[category] = Math.max(
      roundingUnit,
      Math.round((total * plan[category]) / 100 / roundingUnit) * roundingUnit
    );
  }

  let currentTotal = sumSegmentDistances(result, categories);
  const targetTolerance = Math.max(DISTANCE_EPSILON, roundingUnit / 2);
  let adjustmentCount = 0;

  while (Math.abs(currentTotal - total) > targetTolerance && adjustmentCount < 1000) {
    const diff = total - currentTotal;
    const targetCategory: SessionDraftStepCategory =
      diff > 0 ? "main" : result.cooldown > roundingUnit ? "cooldown" : "main";
    const nextValue = roundGeneratorDistance(
      result[targetCategory] + Math.sign(diff) * roundingUnit
    );
    if (nextValue < 0) break;
    result[targetCategory] = nextValue;
    currentTotal = sumSegmentDistances(result, categories);
    adjustmentCount += 1;
  }

  return result;
}

function sumSegmentDistances(
  result: Record<SessionDraftStepCategory, number>,
  categories: SessionDraftStepCategory[]
) {
  return roundGeneratorDistance(categories.reduce((sum, category) => sum + result[category], 0));
}

function roundGeneratorDistance(value: number) {
  return Math.round(value * DISTANCE_PRECISION_FACTOR) / DISTANCE_PRECISION_FACTOR;
}

function allocateMinuteSegments(totalMinutes: number, plan: SegmentPlan) {
  const warmup = Math.max(5, Math.round((totalMinutes * plan.warmup) / 100));
  const main = Math.max(10, Math.round((totalMinutes * plan.main) / 100));
  const cooldown = Math.max(5, totalMinutes - warmup - main);

  return {
    warmup,
    main,
    cooldown,
  };
}

function buildMainStepName(sessionType: SessionGeneratorSessionType) {
  switch (sessionType) {
    case "recovery":
      return "Recovery main set";
    case "endurance":
      return "Endurance main set";
    case "technique":
      return "Technique integration set";
    case "technical_fault_correction":
      return "Fault-correction integration set";
    case "threshold_css":
      return "Threshold / CSS main set";
    case "speed":
      return "Speed main set";
    case "race_pace":
      return "Race-pace main set";
  }
}

function buildMainTargetSummary(
  sessionType: SessionGeneratorSessionType,
  effort: SessionDraft["effort"],
  usedCssPaceLabel: string | null
) {
  switch (sessionType) {
    case "recovery":
      return "Relaxed aerobic swimming with clean timing and no pressure to force the pace.";
    case "endurance":
      return "Steady aerobic work that stays repeatable from start to finish.";
    case "technique":
      return "Hold form quality while swimming at a controllable working pace.";
    case "technical_fault_correction":
      return "Correct the named technical fault first, then integrate it into relaxed swimming.";
    case "threshold_css":
      return usedCssPaceLabel
        ? `Swim around CSS-derived pacing using ${usedCssPaceLabel}/100m as the anchor.`
        : "Swim at strong sustainable threshold effort even without a saved CSS anchor.";
    case "speed":
      return "Short fast repeats with enough recovery to keep the speed clean.";
    case "race_pace":
      return `Touch ${getSessionEffortLabel(effort).toLowerCase()} race-specific speed without losing control.`;
  }
}

function buildDistanceMainSetNote(input: {
  input: SessionGeneratorInput;
  mainDistanceM: number;
  usedCssPaceLabel: string | null;
  focusText: string | null;
}) {
  const { input: sessionInput, mainDistanceM, usedCssPaceLabel, focusText } = input;
  const strokeChoice = selectStrokeChoice(sessionInput.allowedStrokes, sessionInput, mainDistanceM);
  const repeatDistance = chooseRepeatDistance(sessionInput, mainDistanceM, strokeChoice);
  const repeatDistanceLabel = formatDistanceMetersLabel(
    repeatDistance,
    sessionInput.poolLengthUnit
  );
  const repeats = Math.max(1, Math.round(mainDistanceM / repeatDistance));
  const focusSentence = focusText ? ` Keep ${focusText.toLowerCase()} in every repeat.` : "";

  if (sessionInput.sessionType === "threshold_css") {
    if (usedCssPaceLabel) {
      return `Suggested structure: ${repeats} x ${repeatDistanceLabel} holding around CSS (${usedCssPaceLabel}/100m) with 15-20s easy rest.${focusSentence}`;
    }

    return `Suggested structure: ${repeats} x ${repeatDistanceLabel} at strong sustainable effort with 15-20s easy rest.${focusSentence}`;
  }

  if (sessionInput.sessionType === "speed") {
    return `Suggested structure: ${repeats} x ${repeatDistanceLabel} fast, clean, and controlled with generous easy rest between repeats.${focusSentence}`;
  }

  if (sessionInput.sessionType === "race_pace") {
    return `Suggested structure: ${repeats} x ${repeatDistanceLabel} around goal race rhythm with short controlled rest between repeats.${focusSentence}`;
  }

  if (sessionInput.sessionType === "technique") {
    return `Suggested structure: ${repeats} x ${repeatDistanceLabel} as drill + swim or cue-led swimming, keeping form quality higher than raw speed.${focusSentence}`;
  }

  if (sessionInput.sessionType === "technical_fault_correction") {
    return `Suggested structure: ${repeats} x ${repeatDistanceLabel} as fault cue + swim, stopping any repeat where the old pattern returns.${focusSentence}${buildRestPreferenceText(sessionInput)}`;
  }

  return `Suggested structure: ${repeats} x ${repeatDistanceLabel} at a ${getSessionEffortLabel(sessionInput.effort).toLowerCase()} aerobic rhythm with consistent pacing.${focusSentence}${buildRestPreferenceText(sessionInput)}`;
}

function buildOpenWaterMainSetNote(input: {
  input: SessionGeneratorInput;
  mainMinutes: number;
  focusText: string | null;
  constraintText: string | null;
  basePaceSecondsPer100m: number;
}) {
  const { mainMinutes, focusText, constraintText, basePaceSecondsPer100m } = input;
  const segments = Math.max(2, Math.min(4, Math.round(mainMinutes / 8)));
  const minutesPerSegment = Math.max(4, Math.round(mainMinutes / segments));
  const estimatedMeters = roundDistanceForEnvironment(
    (mainMinutes * 60 * 100) / basePaceSecondsPer100m,
    "open_water",
    null
  );

  return `Suggested structure: ${segments} x ${minutesPerSegment} min steady work with 1 min very easy between segments (~${estimatedMeters}m total main work).${focusText ? ` Keep ${focusText.toLowerCase()} present while sighting.` : ""}${constraintText ? ` Constraint: ${constraintText}` : ""}`;
}

function buildKickNote(sessionInput: SessionGeneratorInput, constraintText: string | null) {
  const { equipmentAllowlist } = sessionInput;
  const hasKickboard = equipmentAllowlist.includes("kickboard");
  const equipmentText = hasKickboard
    ? "Use the kickboard if that feels useful today."
    : "Kick on the side or back if you do not want a board.";
  const volumeText =
    sessionInput.kickVolumeMode === "explicit" &&
    sessionInput.kickTargetMeters &&
    sessionInput.kickIntervalMeters
      ? ` Planned as ${formatDistanceMetersLabel(
          sessionInput.kickTargetMeters,
          sessionInput.poolLengthUnit
        )} total in ${formatDistanceMetersLabel(
          sessionInput.kickIntervalMeters,
          sessionInput.poolLengthUnit
        )} max repeats.`
      : " Coach decided the kick volume from the session size and effort.";

  return `${equipmentText}${volumeText}${constraintText ? ` Keep this aligned with the run constraint: ${constraintText}` : ""}`;
}

function buildDrillNote(sessionInput: SessionGeneratorInput, focusText: string | null) {
  const focusCue =
    sessionInput.sessionType === "technical_fault_correction"
      ? (focusText ?? "the named fault")
      : focusText;
  const volumeText =
    sessionInput.drillVolumeMode === "explicit" && sessionInput.drillTargetMeters
      ? `${formatDistanceMetersLabel(
          sessionInput.drillTargetMeters,
          sessionInput.poolLengthUnit
        )} drill target from this request.`
      : "Coach decided the drill volume from the session type and total size.";

  if (focusCue) {
    return `${volumeText} Suggested format: 25 drill / 25 swim with ${focusCue.toLowerCase()} as the main cue.`;
  }

  return `${volumeText} Suggested format: 25 drill / 25 swim on short rest.`;
}

function buildRestPreferenceText(sessionInput: SessionGeneratorInput) {
  if (sessionInput.restMode === "explicit" && sessionInput.restSeconds) {
    return ` Use about ${sessionInput.restSeconds}s rest unless form breaks earlier.`;
  }

  return " Rest is coach-decided: take enough recovery to keep the intended quality.";
}

function buildTitleSuggestions(
  input: SessionGeneratorInput,
  goalTitle: string | null,
  focusText: string | null
) {
  const environmentLabel =
    input.environment === "pool" && input.poolLengthM
      ? `${formatPoolLengthLabel(input.poolLengthM, input.poolLengthUnit)} ${getSessionEnvironmentLabel(input.environment)}`
      : getSessionEnvironmentLabel(input.environment);
  const sessionLabel = getSessionTypeLabel(input.sessionType);
  const primary = `${sessionLabel} ${environmentLabel} draft`;
  const secondary = `${getSessionEffortLabel(input.effort)} ${sessionLabel} session`;
  const tertiary = goalTitle
    ? `${sessionLabel} for ${goalTitle}`
    : focusText
      ? `${sessionLabel}: ${focusText}`
      : `${sessionLabel} swim session`;

  return Array.from(new Set([primary, secondary, tertiary]));
}

function buildDraftDescription(input: {
  input: SessionGeneratorInput;
  goalTitle: string | null;
  focusText: string | null;
  constraintText: string | null;
  usedCssPaceLabel: string | null;
}) {
  const parts = [
    `${getSessionTypeLabel(input.input.sessionType)} session in ${getSessionEnvironmentLabel(input.input.environment).toLowerCase()} mode.`,
    input.usedCssPaceLabel ? `CSS anchor available: ${input.usedCssPaceLabel}/100m.` : null,
    input.goalTitle ? `Goal context: ${input.goalTitle}.` : null,
    input.focusText ? `Focus cue: ${input.focusText}.` : null,
    input.input.drillVolumeMode === "coach_decides" && input.input.includeDrills
      ? "Drill volume: coach decides."
      : input.input.drillTargetMeters
        ? `Drill volume: ${formatDistanceMetersLabel(input.input.drillTargetMeters, input.input.poolLengthUnit)} requested.`
        : null,
    input.input.kickVolumeMode === "coach_decides" && input.input.includeKick
      ? "Kick volume: coach decides."
      : input.input.kickTargetMeters
        ? `Kick volume: ${formatDistanceMetersLabel(input.input.kickTargetMeters, input.input.poolLengthUnit)} requested.`
        : null,
    input.input.restMode === "coach_decides"
      ? "Rest: coach decides."
      : input.input.restSeconds
        ? `Rest: ${input.input.restSeconds}s requested.`
        : null,
    input.constraintText ? `Constraint: ${input.constraintText}.` : null,
  ].filter(Boolean);

  return parts.join(" ");
}

function chooseRepeatDistance(
  sessionInput: SessionGeneratorInput,
  totalDistanceM: number,
  strokeChoice: SessionGeneratorStroke | "choice"
) {
  const poolLength = sessionInput.poolLengthM ?? 25;
  const sessionType = sessionInput.sessionType;
  const strokeLimit =
    strokeChoice !== "choice" ? sessionInput.skillLimits.strokes[strokeChoice] : null;
  const maxRepeatDistanceM = strokeLimit?.maxRepeatDistanceM ?? null;
  const preferred = (() => {
    if (sessionType === "speed") return poolLength >= 50 ? 50 : 25;
    if (sessionType === "technique" || sessionType === "technical_fault_correction") {
      return poolLength >= 50 ? 100 : 50;
    }
    if (sessionType === "threshold_css" || sessionType === "race_pace") return 100;
    return poolLength >= 50 ? 200 : 100;
  })();

  return (
    chooseCappedRepeatDistance({
      totalDistanceM,
      preferredDistanceM: preferred,
      poolLengthM: poolLength,
      maxRepeatDistanceM,
    }) ?? poolLength
  );
}

function chooseRepeatDistanceWhenStrokeLimited(
  sessionInput: SessionGeneratorInput,
  totalDistanceM: number,
  strokeChoice: SessionGeneratorStroke | "choice"
) {
  if (strokeChoice === "choice") return null;

  const maxRepeatDistanceM = sessionInput.skillLimits.strokes[strokeChoice]?.maxRepeatDistanceM;
  if (!maxRepeatDistanceM || totalDistanceM <= maxRepeatDistanceM) return null;

  return chooseRepeatDistance(sessionInput, totalDistanceM, strokeChoice);
}

function selectStrokeChoice(
  allowedStrokes: SessionGeneratorStroke[],
  sessionInput?: SessionGeneratorInput,
  expectedDistanceM?: number
): SessionGeneratorStroke | "choice" {
  const viableStrokes = allowedStrokes.filter((stroke) => {
    const limit = sessionInput?.skillLimits.strokes[stroke];
    if (!limit || !expectedDistanceM) return true;
    if (limit.maxTotalDistanceM && limit.maxTotalDistanceM < expectedDistanceM) return false;
    if (
      sessionInput?.poolLengthM &&
      limit.maxRepeatDistanceM &&
      limit.maxRepeatDistanceM < sessionInput.poolLengthM
    ) {
      return false;
    }
    return true;
  });
  const candidates = viableStrokes.length > 0 ? viableStrokes : allowedStrokes;

  if (candidates.length === 1) return candidates[0] ?? "choice";
  if (candidates.includes("freestyle")) return "freestyle";
  return candidates[0] ?? "choice";
}

export function buildSessionDraftSummary(draft: SessionDraft) {
  return [
    buildSessionTargetSummary(draft),
    draft.goalTitle ? `Goal: ${draft.goalTitle}` : null,
    draft.focusText ? `Focus: ${draft.focusText}` : null,
    draft.usedCssPaceLabel ? `CSS ${draft.usedCssPaceLabel}/100m` : "Fallback pace guidance",
    draft.steps.length > 0
      ? `Steps: ${draft.steps
          .map((step) => `${step.name} (${getSessionStepStrokeLabel(step.stroke)})`)
          .join(" · ")}`
      : null,
  ]
    .filter(Boolean)
    .join(" | ");
}

export function validateGeneratedSessionDraftOutput(
  input: SessionGeneratorInput,
  draft: SessionDraft
): { ok: true } | { ok: false; error: string } {
  const expectedInput = normalizeInputForOutputValidation(input);
  const totals = computeSessionDraftDerivedTotals(draft);
  const tolerance = expectedInput.environment === "pool" ? (expectedInput.poolLengthM ?? 25) : 50;

  if (draft.environment !== expectedInput.environment) {
    return { ok: false, error: "Generated draft changed the selected swim environment." };
  }

  if (expectedInput.environment === "pool") {
    if (draft.poolLengthUnit !== expectedInput.poolLengthUnit) {
      return { ok: false, error: "Generated draft changed the selected pool unit." };
    }
    if (
      typeof draft.poolLengthM !== "number" ||
      Math.abs(draft.poolLengthM - (expectedInput.poolLengthM ?? 0)) > DISTANCE_EPSILON
    ) {
      return { ok: false, error: "Generated draft changed the selected pool size." };
    }

    for (const step of draft.steps) {
      if (step.durationMode !== "distance" || !step.distanceM) continue;
      if (!isDistanceDivisibleBy(step.distanceM, draft.poolLengthM)) {
        return {
          ok: false,
          error:
            "Generated draft contains a pool distance that does not match the selected pool size.",
        };
      }
    }
  }

  if (
    expectedInput.sizeMode === "distance" &&
    expectedInput.targetDistanceM &&
    totals.totalDistanceM !== null &&
    Math.abs(totals.totalDistanceM - expectedInput.targetDistanceM) > tolerance
  ) {
    return {
      ok: false,
      error: "Generated draft could not stay within one pool length of the target distance.",
    };
  }

  if (
    expectedInput.sizeMode === "estimated_time" &&
    expectedInput.targetTimeMin &&
    totals.estimatedDurationMin !== null &&
    Math.abs(totals.estimatedDurationMin - expectedInput.targetTimeMin) > 1
  ) {
    return {
      ok: false,
      error: "Generated draft could not stay within one minute of the target duration.",
    };
  }

  const allowedStrokes = new Set(expectedInput.allowedStrokes);
  const allowedEquipment = new Set(expectedInput.equipmentAllowlist);

  for (const step of draft.steps) {
    if (
      SESSION_GENERATOR_STROKES.includes(step.stroke as SessionGeneratorStroke) &&
      !allowedStrokes.has(step.stroke as SessionGeneratorStroke)
    ) {
      return { ok: false, error: "Generated draft used a stroke that was not selected." };
    }

    if (
      step.equipment &&
      SESSION_GENERATOR_EQUIPMENT.includes(
        step.equipment as (typeof SESSION_GENERATOR_EQUIPMENT)[number]
      ) &&
      !allowedEquipment.has(step.equipment as (typeof SESSION_GENERATOR_EQUIPMENT)[number])
    ) {
      return { ok: false, error: "Generated draft used equipment that was not selected." };
    }
  }

  const drillValidation = validateCategoryVolumeAndRepeatLimit({
    draft,
    category: "drill",
    includeCategory: expectedInput.includeDrills,
    expectedTotalDistanceM:
      expectedInput.drillVolumeMode === "explicit"
        ? expectedInput.drillTargetMeters
        : expectedInput.skillLimits.drill.targetTotalDistanceM,
    maxRepeatDistanceM: expectedInput.skillLimits.drill.maxRepeatDistanceM,
    tolerance,
    label: "Drill",
  });
  if (!drillValidation.ok) return drillValidation;

  const kickValidation = validateCategoryVolumeAndRepeatLimit({
    draft,
    category: "kick",
    includeCategory: expectedInput.includeKick,
    expectedTotalDistanceM:
      expectedInput.kickVolumeMode === "explicit"
        ? expectedInput.kickTargetMeters
        : expectedInput.skillLimits.kick.targetTotalDistanceM,
    maxRepeatDistanceM: expectedInput.skillLimits.kick.maxRepeatDistanceM,
    tolerance,
    label: "Kick",
  });
  if (!kickValidation.ok) return kickValidation;

  const strokeValidation = validateStrokeLimits(expectedInput, draft, tolerance);
  if (!strokeValidation.ok) return strokeValidation;

  return { ok: true };
}

function normalizeInputForOutputValidation(input: SessionGeneratorInput): SessionGeneratorInput {
  if (input.environment === "pool") return input;

  return {
    ...input,
    includeDrills: false,
    includeKick: false,
    poolLengthUnit: "m",
    poolLengthM: null,
  };
}

function validateCategoryVolumeAndRepeatLimit(input: {
  draft: SessionDraft;
  category: "drill" | "kick";
  includeCategory: boolean;
  expectedTotalDistanceM: number | null;
  maxRepeatDistanceM: number | null;
  tolerance: number;
  label: "Drill" | "Kick";
}): { ok: true } | { ok: false; error: string } {
  const categorySteps = input.draft.steps.filter((step) => step.category === input.category);
  const totalDistanceM = sumStepDistances(categorySteps);

  if (!input.includeCategory && totalDistanceM > DISTANCE_EPSILON) {
    return {
      ok: false,
      error: `${input.label} work appeared even though it was not selected.`,
    };
  }

  if (
    input.includeCategory &&
    input.expectedTotalDistanceM &&
    Math.abs(totalDistanceM - input.expectedTotalDistanceM) > input.tolerance
  ) {
    return {
      ok: false,
      error: `${input.label} work did not match the requested approximate per-session distance.`,
    };
  }

  if (input.maxRepeatDistanceM) {
    for (const step of categorySteps) {
      if (
        step.durationMode === "distance" &&
        step.distanceM &&
        step.distanceM - input.maxRepeatDistanceM > DISTANCE_EPSILON
      ) {
        return {
          ok: false,
          error: `${input.label} work exceeded the requested max length.`,
        };
      }
    }
  }

  return { ok: true };
}

function validateStrokeLimits(
  input: SessionGeneratorInput,
  draft: SessionDraft,
  tolerance: number
): { ok: true } | { ok: false; error: string } {
  for (const stroke of input.allowedStrokes) {
    const limit = input.skillLimits.strokes[stroke];
    if (!limit?.maxRepeatDistanceM && !limit?.maxTotalDistanceM) continue;

    const strokeSteps = draft.steps.filter(
      (step) =>
        step.stroke === stroke &&
        step.category !== "rest" &&
        step.category !== "drill" &&
        step.category !== "kick"
    );
    const totalDistanceM = sumStepDistances(strokeSteps);

    if (limit.maxTotalDistanceM && totalDistanceM - limit.maxTotalDistanceM > tolerance) {
      return {
        ok: false,
        error: "Generated draft exceeded a selected stroke max per-session limit.",
      };
    }

    if (limit.maxRepeatDistanceM) {
      for (const step of strokeSteps) {
        if (
          step.durationMode === "distance" &&
          step.distanceM &&
          step.distanceM - limit.maxRepeatDistanceM > DISTANCE_EPSILON
        ) {
          return {
            ok: false,
            error: "Generated draft exceeded a selected stroke max length.",
          };
        }
      }
    }
  }

  return { ok: true };
}

function sumStepDistances(steps: SessionDraftStep[]) {
  return steps.reduce((total, step) => {
    if (step.durationMode !== "distance" || !step.distanceM) return total;
    const repeatCount =
      step.repeatGroupId && step.repeatCount && step.repeatCount >= 2 ? step.repeatCount : 1;
    return roundGeneratorDistance(total + step.distanceM * repeatCount);
  }, 0);
}
