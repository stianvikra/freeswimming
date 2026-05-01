import {
  buildSessionStepStructuredTargetLabel,
  getSessionDraftRepeatEndingRestModeLabel,
  getSessionStepCategoryLabel,
  getSessionStepDrillTypeLabel,
  getSessionStepDurationModeLabel,
  getSessionStepEquipmentLabel,
  getSessionStepIntensityLabel,
  getSessionStepStrokeLabel,
  getSessionStepTargetModeLabel,
  resolveSessionDraftRepeatEndingRestMode,
  type SessionDraftPoolLengthUnit,
  type SessionDraftRepeatEndingRestMode,
  type SessionDraftStep,
  type SessionDraftStepCategory,
  type SessionDraftStepDurationMode,
  type SessionGeneratorEnvironment,
} from "@/lib/session-generator-v1/shared";
import { buildWorkoutStepDurationOutputSummary } from "@/lib/workouts/shared";

export type StepRenderEntry = {
  step: SessionDraftStep;
  index: number;
};

export type StepRenderGroup =
  | {
      kind: "single";
      entries: [StepRenderEntry];
    }
  | {
      kind: "repeat";
      repeatGroupId: string;
      repeatCount: number | null;
      repeatEndingRestMode: SessionDraftRepeatEndingRestMode;
      entries: StepRenderEntry[];
      postSetRestEntry: StepRenderEntry | null;
    };

export type SessionStepViewSectionLine = {
  key: string;
  primaryText: string;
  secondaryText?: string | null;
  detailText?: string | null;
  target?:
    | {
        kind: "step";
        stepId: string;
      }
    | {
        kind: "repeat";
        repeatGroupId: string;
      };
};

export type SessionStepViewSection = {
  key: string;
  title: string;
  lines: SessionStepViewSectionLine[];
  category: SessionDraftStep["category"];
};

export type SessionStepTopLevelSectionDescriptor = {
  label: string;
  title: string;
  isRepeat: boolean;
  indexWithinCategory: number | null;
  totalWithinCategory: number;
};

export type SessionStepEditBlock =
  | {
      kind: "single";
      key: string;
      groupIndex: number;
      startIndex: number;
      endIndex: number;
      entry: StepRenderEntry;
      linkedRestEntry: StepRenderEntry | null;
      steps: SessionDraftStep[];
    }
  | {
      kind: "repeat";
      key: string;
      groupIndex: number;
      startIndex: number;
      endIndex: number;
      group: Extract<StepRenderGroup, { kind: "repeat" }>;
      steps: SessionDraftStep[];
    };

export const MANUAL_POOL_SWIM_DURATION_MODES: readonly SessionDraftStepDurationMode[] = [
  "distance",
  "time",
  "lap_button",
];

export const MANUAL_POOL_REST_DURATION_MODES: readonly SessionDraftStepDurationMode[] = [
  "fixed_rest",
  "lap_button",
  "send_off",
  "css_send_off",
];

export function isManualPoolRestCategory(category: SessionDraftStepCategory) {
  return category === "rest";
}

export function normalizeManualPoolStepCategory(category: SessionDraftStepCategory) {
  if (category === "drill") {
    return {
      category: "swim" as const,
      drillType: "drill" as const,
    };
  }

  if (category === "kick") {
    return {
      category: "swim" as const,
      drillType: "kick" as const,
    };
  }

  return {
    category,
    drillType: null,
  };
}

export function normalizeManualPoolStrokeForEditor(stroke: SessionDraftStep["stroke"]) {
  if (stroke === "drill") {
    return {
      stroke: "choice" as const,
      drillType: "drill" as const,
    };
  }

  return {
    stroke,
    drillType: null,
  };
}

export function getManualPoolDurationModesForCategory(
  category: SessionDraftStepCategory
): readonly SessionDraftStepDurationMode[] {
  return isManualPoolRestCategory(category)
    ? MANUAL_POOL_REST_DURATION_MODES
    : MANUAL_POOL_SWIM_DURATION_MODES;
}

export function getDefaultManualPoolDurationMode(
  category: SessionDraftStepCategory
): SessionDraftStepDurationMode {
  return isManualPoolRestCategory(category) ? "fixed_rest" : "distance";
}

export function isManualPoolDurationModeAllowed(
  category: SessionDraftStepCategory,
  durationMode: SessionDraftStepDurationMode
) {
  return getManualPoolDurationModesForCategory(category).includes(durationMode);
}

export function applyStepDurationModeDefaults(
  step: SessionDraftStep,
  nextMode: SessionDraftStepDurationMode
): SessionDraftStep {
  return {
    ...step,
    durationMode: nextMode,
    distanceM: nextMode === "distance" ? (step.distanceM ?? 100) : null,
    timeMin:
      nextMode === "time" || nextMode === "fixed_rest" || nextMode === "send_off"
        ? (step.timeMin ?? (nextMode === "send_off" ? 2 : 1))
        : null,
    cssSendOffOffsetSeconds:
      nextMode === "css_send_off" ? (step.cssSendOffOffsetSeconds ?? 0) : null,
  };
}

export function normalizeManualPoolStepForEditor(step: SessionDraftStep): SessionDraftStep {
  const normalizedCategory = normalizeManualPoolStepCategory(step.category);
  const normalizedStroke = normalizeManualPoolStrokeForEditor(step.stroke);
  const nextStep: SessionDraftStep = {
    ...step,
    category: normalizedCategory.category,
    stroke: normalizedStroke.stroke,
    drillType:
      step.drillType && step.drillType !== "none"
        ? step.drillType
        : (normalizedCategory.drillType ?? normalizedStroke.drillType ?? step.drillType ?? "none"),
  };

  if (isManualPoolDurationModeAllowed(nextStep.category, nextStep.durationMode)) {
    return nextStep;
  }

  return applyStepDurationModeDefaults(
    nextStep,
    getDefaultManualPoolDurationMode(nextStep.category)
  );
}

export function getRecommendedStepFocus(
  step: Pick<SessionDraftStep, "category" | "stroke">
): Exclude<NonNullable<SessionDraftStep["drillType"]>, "none"> | null {
  if (step.category === "kick") {
    return "kick";
  }

  if (step.category === "drill" || step.stroke === "drill") {
    return "drill";
  }

  return null;
}

export function buildStepContextLabel(
  step: SessionDraftStep,
  options?: {
    environment?: SessionGeneratorEnvironment | null;
  }
) {
  const contextParts =
    options?.environment === "pool" && step.category === "rest"
      ? []
      : [getSessionStepStrokeLabel(step.stroke)];

  if (step.drillType && step.drillType !== "none") {
    const drillLabel = getSessionStepDrillTypeLabel(step.drillType);
    if (
      !(
        (step.stroke === "drill" && drillLabel === "Drill") ||
        (step.category === "drill" && drillLabel === "Drill") ||
        (step.category === "kick" && drillLabel === "Kick")
      )
    ) {
      contextParts.push(drillLabel);
    }
  }

  if (step.equipment && step.equipment !== "none") {
    contextParts.push(getSessionStepEquipmentLabel(step.equipment));
  }

  return contextParts.join(" · ");
}

export function buildStepSummary(
  step: SessionDraftStep,
  basePaceSecondsPer100m: number,
  environment: SessionGeneratorEnvironment,
  poolLengthUnit: SessionDraftPoolLengthUnit = "m"
) {
  const structuredTarget = buildSessionStepStructuredTargetLabel(
    step,
    basePaceSecondsPer100m,
    environment === "pool" ? poolLengthUnit : "m"
  );

  return [
    buildWorkoutStepDurationOutputSummary(step, basePaceSecondsPer100m, {
      environment,
      poolLengthUnit,
    }),
    buildStepContextLabel(step, { environment }),
    structuredTarget ?? getSessionStepIntensityLabel(step.intensity),
  ]
    .filter(Boolean)
    .join(" · ");
}

export function resolveManualPoolSummaryUnitFromName(
  name: string
): SessionDraftPoolLengthUnit | null {
  const normalized = name.trim().toLowerCase();

  if (/^\d+(?:\.\d+)?yd\b/.test(normalized)) {
    return "yd";
  }

  if (/^\d+(?:\.\d+)?m\b/.test(normalized)) {
    return "m";
  }

  return null;
}

export function isManualPoolDrillNameRelevantStep(step: SessionDraftStep) {
  return step.category === "drill" || step.stroke === "drill" || step.drillType === "drill";
}

export function isLegacyManualPoolAutoSummaryName(name: string) {
  return name.includes("·");
}

export function getManualPoolDrillNameInputValue(step: SessionDraftStep) {
  return isLegacyManualPoolAutoSummaryName(step.name) ? "" : step.name;
}

export function resolveConcreteManualPoolDrillName(
  step: SessionDraftStep,
  durationLabel: string,
  targetLabel: string | null
) {
  const name = typeof step.name === "string" ? step.name.trim() : "";
  const normalizedName = name.toLowerCase();
  const genericNames = new Set(["drill", "drill step", "swim drill", "pool drill"]);
  const duplicateLabels = [
    durationLabel,
    targetLabel,
    getSessionStepIntensityLabel(step.intensity),
  ].filter(Boolean) as string[];

  if (
    !name ||
    isLegacyManualPoolAutoSummaryName(name) ||
    genericNames.has(normalizedName) ||
    duplicateLabels.some((label) => normalizedName === label.toLowerCase())
  ) {
    return null;
  }

  return name;
}

export function buildManualPoolStepContextLabel(
  step: SessionDraftStep,
  durationLabel: string,
  targetLabel: string | null
) {
  const drillName = isManualPoolDrillNameRelevantStep(step)
    ? resolveConcreteManualPoolDrillName(step, durationLabel, targetLabel)
    : null;

  if (!drillName) {
    return buildStepContextLabel(step, { environment: "pool" });
  }

  const parts: string[] = [];

  if (step.stroke && step.stroke !== "choice" && step.stroke !== "drill") {
    parts.push(getSessionStepStrokeLabel(step.stroke));
  }

  parts.push(drillName);

  if (step.drillType && step.drillType !== "none" && step.drillType !== "drill") {
    const drillTypeLabel = getSessionStepDrillTypeLabel(step.drillType);
    if (!parts.includes(drillTypeLabel)) {
      parts.push(drillTypeLabel);
    }
  }

  if (step.equipment && step.equipment !== "none") {
    parts.push(getSessionStepEquipmentLabel(step.equipment));
  }

  return parts.join(" · ");
}

export function resolveManualPoolSummaryUnit(
  step: SessionDraftStep,
  fallbackUnit: SessionDraftPoolLengthUnit
): SessionDraftPoolLengthUnit {
  if (step.durationMode !== "distance") {
    return fallbackUnit;
  }

  return resolveManualPoolSummaryUnitFromName(step.name) ?? fallbackUnit;
}

export function didManualPoolSummaryUnitInputsChange(
  previousStep: SessionDraftStep | null | undefined,
  nextStep: SessionDraftStep
) {
  if (!previousStep) {
    return true;
  }

  return (
    previousStep.durationMode !== nextStep.durationMode ||
    previousStep.distanceM !== nextStep.distanceM ||
    previousStep.targetMode !== nextStep.targetMode ||
    previousStep.targetPaceSecondsPer100m !== nextStep.targetPaceSecondsPer100m ||
    previousStep.cssTargetOffsetSeconds !== nextStep.cssTargetOffsetSeconds
  );
}

export function buildManualPoolStepSummary(
  step: SessionDraftStep,
  basePaceSecondsPer100m: number,
  poolLengthUnit: SessionDraftPoolLengthUnit,
  options?: {
    summaryUnit?: SessionDraftPoolLengthUnit;
  }
) {
  const normalizedStep = normalizeManualPoolStepForEditor(step);
  const summaryUnit = options?.summaryUnit ?? resolveManualPoolSummaryUnit(step, poolLengthUnit);
  const durationLabel = buildWorkoutStepDurationOutputSummary(
    normalizedStep,
    basePaceSecondsPer100m,
    {
      environment: "pool",
      poolLengthUnit: summaryUnit,
    }
  );
  const structuredTarget = buildSessionStepStructuredTargetLabel(
    normalizedStep,
    basePaceSecondsPer100m,
    summaryUnit
  );
  const targetLabel = structuredTarget ?? getSessionStepIntensityLabel(normalizedStep.intensity);

  return (
    [
      durationLabel,
      buildManualPoolStepContextLabel(normalizedStep, durationLabel, targetLabel),
      targetLabel,
    ]
      .filter(Boolean)
      .join(" · ") || `${getSessionStepCategoryLabel(normalizedStep.category)} step`
  );
}

export function buildManualPoolRestInlineSummary(
  step: SessionDraftStep,
  basePaceSecondsPer100m: number
) {
  const summary = buildWorkoutStepDurationOutputSummary(step, basePaceSecondsPer100m, {
    environment: "pool",
  });
  if (summary.startsWith("Fixed Rest Time ")) {
    return `Rest ${summary.replace("Fixed Rest Time ", "")}`;
  }

  return summary === "Fixed Rest Time not set" ? "Rest not set" : summary;
}

export function buildManualPoolRestValueSummary(
  step: SessionDraftStep,
  basePaceSecondsPer100m: number
) {
  const summary = buildWorkoutStepDurationOutputSummary(step, basePaceSecondsPer100m, {
    environment: "pool",
  });
  if (summary.startsWith("Fixed Rest Time ")) {
    return summary.replace("Fixed Rest Time ", "");
  }

  return summary === "Fixed Rest Time not set" ? "Not set" : summary;
}

export function buildManualPoolDisplaySummary(
  step: SessionDraftStep,
  basePaceSecondsPer100m: number,
  poolLengthUnit: SessionDraftPoolLengthUnit
) {
  const normalizedStep = normalizeManualPoolStepForEditor(step);

  if (normalizedStep.category === "rest") {
    return buildManualPoolRestValueSummary(normalizedStep, basePaceSecondsPer100m);
  }

  return buildManualPoolStepSummary(normalizedStep, basePaceSecondsPer100m, poolLengthUnit);
}

export function syncManualPoolEditableStep(
  step: SessionDraftStep,
  basePaceSecondsPer100m: number,
  poolLengthUnit: SessionDraftPoolLengthUnit,
  options?: {
    summaryUnit?: SessionDraftPoolLengthUnit;
  }
): SessionDraftStep {
  const normalizedStep = normalizeManualPoolStepForEditor(step);

  return {
    ...normalizedStep,
    name: isManualPoolDrillNameRelevantStep(normalizedStep)
      ? getManualPoolDrillNameInputValue(normalizedStep).slice(0, 120)
      : buildManualPoolStepSummary(normalizedStep, basePaceSecondsPer100m, poolLengthUnit, {
          summaryUnit: options?.summaryUnit,
        }).slice(0, 120),
    targetSummary: "",
  };
}

export function buildRepeatSummary(
  entries: StepRenderEntry[],
  repeatCount: number | null,
  basePaceSecondsPer100m: number,
  _repeatEndingRestMode: SessionDraftRepeatEndingRestMode,
  poolLengthUnit: SessionDraftPoolLengthUnit,
  postSetRestStep?: SessionDraftStep | null
) {
  if (repeatCount === null) {
    return "Set a repeat count to keep this block valid.";
  }

  const workStep = entries[0]?.step ?? null;
  const betweenStep = entries[1]?.step ?? null;

  if (!workStep) {
    return "Set the work interval for this repeat block.";
  }

  const normalizedWorkStep = normalizeManualPoolStepForEditor(workStep);
  const workLabel = buildManualPoolStepSummary(
    normalizedWorkStep,
    basePaceSecondsPer100m,
    resolveManualPoolSummaryUnit(normalizedWorkStep, poolLengthUnit)
  );
  const parts = [`${repeatCount} x ${workLabel}`];

  if (betweenStep) {
    if (betweenStep.category === "rest") {
      const restValue = buildManualPoolRestValueSummary(betweenStep, basePaceSecondsPer100m);
      parts.push(`Interval rest ${restValue}`);
    } else {
      parts.push(
        `Recovery ${buildManualPoolStepSummary(
          betweenStep,
          basePaceSecondsPer100m,
          poolLengthUnit
        )}`
      );
    }
  }

  if (postSetRestStep && postSetRestStep.category === "rest") {
    const restValue = buildManualPoolRestValueSummary(postSetRestStep, basePaceSecondsPer100m);
    parts.push(`Set rest ${restValue}`);
  }

  return parts.join(" · ");
}

export function getManualPoolTopLevelCategory(group: StepRenderGroup) {
  return normalizeManualPoolStepForEditor(group.entries[0].step).category;
}

export function buildLinkedRestLabel(_parentLabel: string, restKind: "rest" | "interval" | "set") {
  if (restKind === "interval") {
    return "REST BETWEEN REPEATS";
  }

  if (restKind === "set") {
    return "REST AFTER SET";
  }

  return "REST";
}

export function findTopLevelLinkedRestStep(
  steps: SessionDraftStep[],
  step: SessionDraftStep,
  index: number
) {
  const nextStep = steps[index + 1] ?? null;

  if (
    step.category === "rest" ||
    step.repeatGroupId ||
    step.postSetRestForRepeatGroupId ||
    !nextStep ||
    nextStep.category !== "rest" ||
    nextStep.repeatGroupId ||
    nextStep.postSetRestForRepeatGroupId
  ) {
    return null;
  }

  return nextStep;
}

export function buildManualPoolViewLineParts(
  step: SessionDraftStep,
  basePaceSecondsPer100m: number,
  poolLengthUnit: SessionDraftPoolLengthUnit,
  linkedRestStep?: SessionDraftStep | null
) {
  const normalizedStep = normalizeManualPoolStepForEditor(step);

  if (normalizedStep.category === "rest") {
    return {
      primaryText: buildManualPoolRestInlineSummary(normalizedStep, basePaceSecondsPer100m),
      secondaryText: null,
    };
  }

  const primaryText = buildManualPoolStepSummary(
    normalizedStep,
    basePaceSecondsPer100m,
    poolLengthUnit
  );

  if (!linkedRestStep || linkedRestStep.category !== "rest") {
    return {
      primaryText,
      secondaryText: null,
    };
  }

  return {
    primaryText,
    secondaryText: buildManualPoolRestInlineSummary(linkedRestStep, basePaceSecondsPer100m),
  };
}

export function buildManualPoolRepeatViewLine(
  group: Extract<StepRenderGroup, { kind: "repeat" }>,
  basePaceSecondsPer100m: number,
  poolLengthUnit: SessionDraftPoolLengthUnit
): SessionStepViewSectionLine {
  const workStep = group.entries[0]?.step ?? null;
  const betweenStep = group.entries[1]?.step ?? null;
  const normalizedWorkStep = workStep ? normalizeManualPoolStepForEditor(workStep) : null;

  if (!normalizedWorkStep) {
    return {
      key: group.repeatGroupId,
      primaryText: "Set the work interval for this repeat block.",
      secondaryText: null,
      target: {
        kind: "repeat",
        repeatGroupId: group.repeatGroupId,
      },
    };
  }

  const repeatCountLabel = group.repeatCount ? `${group.repeatCount} x ` : "";
  let primaryText = `${repeatCountLabel}${buildManualPoolStepSummary(
    normalizedWorkStep,
    basePaceSecondsPer100m,
    poolLengthUnit
  )}`;
  let secondaryText: string | null = null;

  if (betweenStep) {
    if (betweenStep.category === "rest") {
      const restValue = buildManualPoolRestValueSummary(betweenStep, basePaceSecondsPer100m);
      primaryText = `${primaryText} · Interval rest ${restValue}`;
    } else {
      primaryText = `${primaryText} · Recovery ${buildManualPoolStepSummary(
        betweenStep,
        basePaceSecondsPer100m,
        poolLengthUnit
      )}`;
    }
  }

  if (group.postSetRestEntry?.step) {
    const restValue = buildManualPoolRestValueSummary(
      group.postSetRestEntry.step,
      basePaceSecondsPer100m
    );
    secondaryText = `Set rest ${restValue}`;
  }

  return {
    key: group.repeatGroupId,
    primaryText,
    secondaryText,
    target: {
      kind: "repeat",
      repeatGroupId: group.repeatGroupId,
    },
  };
}

export function buildGeneratedSessionRestValueSummary(
  step: SessionDraftStep,
  basePaceSecondsPer100m: number,
  environment: SessionGeneratorEnvironment,
  poolLengthUnit: SessionDraftPoolLengthUnit
) {
  const summary = buildWorkoutStepDurationOutputSummary(step, basePaceSecondsPer100m, {
    environment,
    poolLengthUnit,
  });

  if (summary.startsWith("Fixed Rest Time ")) {
    return summary.replace("Fixed Rest Time ", "");
  }

  return summary === "Fixed Rest Time not set" ? "Not set" : summary;
}

export function buildGeneratedSessionRepeatViewLine(
  group: Extract<StepRenderGroup, { kind: "repeat" }>,
  basePaceSecondsPer100m: number,
  environment: SessionGeneratorEnvironment,
  poolLengthUnit: SessionDraftPoolLengthUnit
): SessionStepViewSectionLine {
  const workStep = group.entries[0]?.step ?? null;
  const betweenStep = group.entries[1]?.step ?? null;

  if (!workStep) {
    return {
      key: group.repeatGroupId,
      primaryText: "Set the work interval for this repeat block.",
      secondaryText: null,
      target: {
        kind: "repeat",
        repeatGroupId: group.repeatGroupId,
      },
    };
  }

  const repeatCountLabel = group.repeatCount ? `${group.repeatCount} x ` : "";
  let primaryText = `${repeatCountLabel}${buildStepSummary(
    workStep,
    basePaceSecondsPer100m,
    environment,
    poolLengthUnit
  )}`;
  let secondaryText: string | null = null;

  if (betweenStep) {
    if (betweenStep.category === "rest") {
      primaryText = `${primaryText} · Interval rest ${buildGeneratedSessionRestValueSummary(
        betweenStep,
        basePaceSecondsPer100m,
        environment,
        poolLengthUnit
      )}`;
    } else {
      primaryText = `${primaryText} · Recovery ${buildStepSummary(
        betweenStep,
        basePaceSecondsPer100m,
        environment,
        poolLengthUnit
      )}`;
    }
  }

  if (group.postSetRestEntry?.step) {
    secondaryText = `Set rest ${buildGeneratedSessionRestValueSummary(
      group.postSetRestEntry.step,
      basePaceSecondsPer100m,
      environment,
      poolLengthUnit
    )}`;
  }

  return {
    key: group.repeatGroupId,
    primaryText,
    secondaryText,
    target: {
      kind: "repeat",
      repeatGroupId: group.repeatGroupId,
    },
  };
}

export function getWorkoutEditorTopLevelCategory(
  group: StepRenderGroup,
  options?: {
    normalizeForManualPool?: boolean;
  }
) {
  return options?.normalizeForManualPool
    ? normalizeManualPoolStepForEditor(group.entries[0].step).category
    : group.entries[0].step.category;
}

export function buildTopLevelSectionDescriptors(
  stepGroups: StepRenderGroup[],
  options?: {
    normalizeForManualPool?: boolean;
  }
): SessionStepTopLevelSectionDescriptor[] {
  const totalByCategory = new Map<string, number>();
  const seenByCategory = new Map<string, number>();
  let lastPrimaryLabel: string | null = null;

  for (const group of stepGroups) {
    const category = getWorkoutEditorTopLevelCategory(group, options);
    if (category === "rest") continue;
    totalByCategory.set(category, (totalByCategory.get(category) ?? 0) + 1);
  }

  return stepGroups.map((group, index) => {
    const category = getWorkoutEditorTopLevelCategory(group, options);
    const title = getSessionStepCategoryLabel(category);
    const previousGroup = stepGroups[index - 1] ?? null;

    if (
      category === "rest" &&
      previousGroup &&
      getWorkoutEditorTopLevelCategory(previousGroup, options) !== "rest" &&
      lastPrimaryLabel
    ) {
      return {
        label: buildLinkedRestLabel(lastPrimaryLabel, "rest"),
        title,
        isRepeat: false,
        indexWithinCategory: null,
        totalWithinCategory: 0,
      };
    }

    if (category === "rest") {
      return {
        label: title,
        title,
        isRepeat: false,
        indexWithinCategory: null,
        totalWithinCategory: 0,
      };
    }

    const nextSeen = (seenByCategory.get(category) ?? 0) + 1;
    const sameTypeTotal = totalByCategory.get(category) ?? 1;
    const label = sameTypeTotal > 1 ? `${title} ${nextSeen} of ${sameTypeTotal}` : title;

    seenByCategory.set(category, nextSeen);
    lastPrimaryLabel = label;

    return {
      label,
      title,
      isRepeat: group.kind === "repeat",
      indexWithinCategory: nextSeen,
      totalWithinCategory: sameTypeTotal,
    };
  });
}

export function buildManualPoolTopLevelSectionDescriptors(
  stepGroups: StepRenderGroup[]
): SessionStepTopLevelSectionDescriptor[] {
  return buildTopLevelSectionDescriptors(stepGroups, { normalizeForManualPool: true });
}

export function buildGeneratedSessionTopLevelSectionDescriptors(
  stepGroups: StepRenderGroup[]
): SessionStepTopLevelSectionDescriptor[] {
  return buildTopLevelSectionDescriptors(stepGroups);
}

function getOrCreateContiguousSection(
  sections: SessionStepViewSection[],
  category: SessionDraftStep["category"]
) {
  const title = getSessionStepCategoryLabel(category);
  const currentSection = sections[sections.length - 1] ?? null;

  if (currentSection && currentSection.category === category && currentSection.title === title) {
    return currentSection;
  }

  const nextSection = {
    key: `${title.toLowerCase()}-${sections.length}`,
    title,
    lines: [],
    category,
  };
  sections.push(nextSection);
  return nextSection;
}

export function buildManualPoolViewSections(
  stepGroups: StepRenderGroup[],
  draftSteps: SessionDraftStep[],
  basePaceSecondsPer100m: number,
  poolLengthUnit: SessionDraftPoolLengthUnit
) {
  const sections: SessionStepViewSection[] = [];
  const consumedRestStepIds = new Set<string>();

  stepGroups.forEach((group) => {
    const category = getManualPoolTopLevelCategory(group);

    if (group.kind === "repeat") {
      const section = getOrCreateContiguousSection(sections, category);
      section.lines.push(
        buildManualPoolRepeatViewLine(group, basePaceSecondsPer100m, poolLengthUnit)
      );
      return;
    }

    const entry = group.entries[0];
    const linkedRestStep = findTopLevelLinkedRestStep(draftSteps, entry.step, entry.index);
    if (linkedRestStep) {
      consumedRestStepIds.add(linkedRestStep.id);
    }
    if (consumedRestStepIds.has(entry.step.id)) {
      return;
    }

    const normalizedStep = normalizeManualPoolStepForEditor(entry.step);
    const viewLineParts = buildManualPoolViewLineParts(
      normalizedStep,
      basePaceSecondsPer100m,
      poolLengthUnit,
      linkedRestStep
    );
    const section = getOrCreateContiguousSection(sections, category);
    section.lines.push({
      key: entry.step.id,
      primaryText: viewLineParts.primaryText,
      secondaryText: viewLineParts.secondaryText,
      target: {
        kind: "step",
        stepId: entry.step.id,
      },
    });
  });

  return sections;
}

export function buildGeneratedSessionViewSections(
  stepGroups: StepRenderGroup[],
  basePaceSecondsPer100m: number,
  environment: SessionGeneratorEnvironment,
  poolLengthUnit: SessionDraftPoolLengthUnit
) {
  const sections: SessionStepViewSection[] = [];
  const consumedRestStepIds = new Set<string>();

  stepGroups.forEach((group, groupIndex) => {
    const category = getWorkoutEditorTopLevelCategory(group);

    if (group.kind === "single" && consumedRestStepIds.has(group.entries[0].step.id)) {
      return;
    }

    const section = getOrCreateContiguousSection(sections, category);

    if (group.kind === "repeat") {
      section.lines.push(
        buildGeneratedSessionRepeatViewLine(
          group,
          basePaceSecondsPer100m,
          environment,
          poolLengthUnit
        )
      );
      return;
    }

    const entry = group.entries[0];
    const nextGroup = stepGroups[groupIndex + 1] ?? null;
    const linkedRestEntry =
      entry.step.category !== "rest" &&
      !entry.step.repeatGroupId &&
      !entry.step.postSetRestForRepeatGroupId &&
      nextGroup?.kind === "single" &&
      nextGroup.entries[0].step.category === "rest" &&
      !nextGroup.entries[0].step.repeatGroupId &&
      !nextGroup.entries[0].step.postSetRestForRepeatGroupId
        ? nextGroup.entries[0]
        : null;

    if (linkedRestEntry) {
      consumedRestStepIds.add(linkedRestEntry.step.id);
    }

    section.lines.push({
      key: entry.step.id,
      primaryText: buildStepSummary(
        entry.step,
        basePaceSecondsPer100m,
        environment,
        poolLengthUnit
      ),
      secondaryText: linkedRestEntry
        ? `Rest ${buildGeneratedSessionRestValueSummary(
            linkedRestEntry.step,
            basePaceSecondsPer100m,
            environment,
            poolLengthUnit
          )}`
        : null,
      target: {
        kind: "step",
        stepId: entry.step.id,
      },
    });
  });

  return sections;
}

export function getManualPoolCategoryRailClass(category: SessionDraftStep["category"]) {
  switch (category) {
    case "warmup":
      return "border-l-sky-400";
    case "swim":
      return "border-l-blue-400";
    case "drill":
      return "border-l-cyan-500";
    case "kick":
      return "border-l-emerald-500";
    case "main":
      return "border-l-blue-500";
    case "cooldown":
      return "border-l-teal-500";
    case "rest":
      return "border-l-slate-400";
    default:
      return "border-l-slate-300";
  }
}

export function getManualPoolCategoryLabelClass(category: SessionDraftStep["category"]) {
  switch (category) {
    case "warmup":
      return "text-sky-700";
    case "swim":
      return "text-blue-700";
    case "drill":
      return "text-cyan-700";
    case "kick":
      return "text-emerald-700";
    case "main":
      return "text-blue-700";
    case "cooldown":
      return "text-teal-700";
    case "rest":
      return "text-slate-600";
    default:
      return "text-slate-500";
  }
}

export function getManualPoolViewSectionToneClass(category: SessionDraftStep["category"]) {
  switch (category) {
    case "warmup":
      return "border-l-4 border-l-sky-400 border-sky-200";
    case "swim":
      return "border-l-4 border-l-blue-400 border-blue-200";
    case "drill":
      return "border-l-4 border-l-cyan-500 border-cyan-200";
    case "kick":
      return "border-l-4 border-l-emerald-500 border-emerald-200";
    case "main":
      return "border-l-4 border-l-blue-500 border-blue-200";
    case "cooldown":
      return "border-l-4 border-l-teal-500 border-teal-200";
    case "rest":
      return "border-l-4 border-l-slate-400 border-slate-200";
    default:
      return "border-l-4 border-l-slate-300 border-slate-200";
  }
}

export function getManualPoolViewSectionHeaderClass(category: SessionDraftStep["category"]) {
  switch (category) {
    case "warmup":
      return "border-b border-sky-100 bg-sky-50/70";
    case "swim":
      return "border-b border-blue-100 bg-blue-50/60";
    case "drill":
      return "border-b border-cyan-100 bg-cyan-50/70";
    case "kick":
      return "border-b border-emerald-100 bg-emerald-50/70";
    case "main":
      return "border-b border-blue-100 bg-blue-50/60";
    case "cooldown":
      return "border-b border-teal-100 bg-teal-50/70";
    case "rest":
      return "border-b border-slate-200 bg-slate-50/80";
    default:
      return "border-b border-slate-200 bg-slate-50/70";
  }
}

export function buildSessionStepEditBlocks(
  stepGroups: StepRenderGroup[],
  draftSteps: SessionDraftStep[]
): SessionStepEditBlock[] {
  const blocks: SessionStepEditBlock[] = [];
  const consumedRestStepIds = new Set<string>();

  stepGroups.forEach((group, groupIndex) => {
    if (group.kind === "repeat") {
      const steps = [
        ...group.entries.map((entry) => entry.step),
        ...(group.postSetRestEntry ? [group.postSetRestEntry.step] : []),
      ];
      const startIndex = group.entries[0]?.index ?? 0;
      const endIndex =
        group.postSetRestEntry?.index ??
        group.entries[group.entries.length - 1]?.index ??
        startIndex;

      blocks.push({
        kind: "repeat",
        key: group.repeatGroupId,
        groupIndex,
        startIndex,
        endIndex,
        group,
        steps,
      });
      return;
    }

    const entry = group.entries[0];
    if (consumedRestStepIds.has(entry.step.id)) {
      return;
    }

    const linkedRestStep = findTopLevelLinkedRestStep(draftSteps, entry.step, entry.index);
    const linkedRestEntry = linkedRestStep
      ? {
          step: linkedRestStep,
          index: entry.index + 1,
        }
      : null;

    if (linkedRestEntry) {
      consumedRestStepIds.add(linkedRestEntry.step.id);
    }

    blocks.push({
      kind: "single",
      key: entry.step.id,
      groupIndex,
      startIndex: entry.index,
      endIndex: linkedRestEntry?.index ?? entry.index,
      entry,
      linkedRestEntry,
      steps: linkedRestEntry ? [entry.step, linkedRestEntry.step] : [entry.step],
    });
  });

  return blocks;
}

export function buildStepRenderGroups(steps: SessionDraftStep[]): StepRenderGroup[] {
  const groups: StepRenderGroup[] = [];

  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];

    if (!step.repeatGroupId) {
      groups.push({
        kind: "single",
        entries: [{ step, index }],
      });
      continue;
    }

    const entries: StepRenderEntry[] = [{ step, index }];
    let nextIndex = index + 1;

    while (nextIndex < steps.length && steps[nextIndex].repeatGroupId === step.repeatGroupId) {
      entries.push({ step: steps[nextIndex], index: nextIndex });
      nextIndex += 1;
    }

    const postSetRestStep =
      steps[nextIndex]?.postSetRestForRepeatGroupId === step.repeatGroupId
        ? steps[nextIndex]
        : null;
    const postSetRestEntry = postSetRestStep ? { step: postSetRestStep, index: nextIndex } : null;

    groups.push({
      kind: "repeat",
      repeatGroupId: step.repeatGroupId,
      repeatCount: step.repeatCount ?? null,
      repeatEndingRestMode: resolveSessionDraftRepeatEndingRestMode(
        step.repeatEndingRestMode ?? null
      ),
      entries,
      postSetRestEntry,
    });
    index = postSetRestEntry ? nextIndex : nextIndex - 1;
  }

  return groups;
}

export function getStepDurationModeEditorLabel(
  value: SessionDraftStepDurationMode,
  isManualPoolMode: boolean
) {
  if (!isManualPoolMode) {
    return getSessionStepDurationModeLabel(value);
  }

  switch (value) {
    case "distance":
      return "Distance";
    case "time":
      return "Time";
    case "fixed_rest":
      return "Fixed Rest Time";
    case "lap_button":
      return "Lap Button Press";
    case "send_off":
      return "Send-Off Time";
    case "css_send_off":
      return "CSS-Based Send-Off Time";
    default:
      return getSessionStepDurationModeLabel(value);
  }
}

export function getStepTargetModeEditorLabel(
  value: NonNullable<SessionDraftStep["targetMode"]>,
  isManualPoolMode: boolean
) {
  if (!isManualPoolMode) {
    return getSessionStepTargetModeLabel(value);
  }

  switch (value) {
    case "effort":
      return "Effort";
    case "css_target_pace":
      return "CSS target pace";
    default:
      return getSessionStepTargetModeLabel(value);
  }
}

export function usesClockDurationInput(durationMode: SessionDraftStepDurationMode) {
  return durationMode === "time" || durationMode === "fixed_rest" || durationMode === "send_off";
}

export function applyRecommendedStepFocus(
  step: SessionDraftStep,
  overrides: Partial<SessionDraftStep>
): SessionDraftStep {
  const nextStep = {
    ...step,
    ...overrides,
  };

  if (Object.prototype.hasOwnProperty.call(overrides, "drillType")) {
    return nextStep;
  }

  const recommendedFocus = getRecommendedStepFocus(nextStep);
  if ((!step.drillType || step.drillType === "none") && recommendedFocus) {
    nextStep.drillType = recommendedFocus;
  }

  return nextStep;
}

export function getRepeatEndingRestModeLabel(mode: SessionDraftRepeatEndingRestMode) {
  return getSessionDraftRepeatEndingRestModeLabel(mode);
}
