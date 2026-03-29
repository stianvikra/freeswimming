import {
  SESSION_DRAFT_STEP_CATEGORIES,
  SESSION_DRAFT_STEP_CSS_TARGET_OFFSETS,
  SESSION_DRAFT_STEP_DRILL_TYPES,
  SESSION_DRAFT_STEP_DURATION_MODES,
  SESSION_DRAFT_STEP_EQUIPMENT,
  SESSION_DRAFT_REPEAT_MAX,
  SESSION_DRAFT_REPEAT_MIN,
  SESSION_DRAFT_STEP_STROKES,
  SESSION_DRAFT_STEP_TARGET_MODES,
  SESSION_GENERATOR_ENVIRONMENTS,
  SESSION_GENERATOR_EFFORT_PRESETS,
  SESSION_GENERATOR_EQUIPMENT,
  SESSION_GENERATOR_SESSION_TYPES,
  SESSION_GENERATOR_STROKES,
  computeSessionDraftDerivedTotals,
  buildSessionStepStructuredTargetLabel,
  buildSessionTargetSummary,
  formatPoolLengthLabel,
  getSessionEffortLabel,
  getSessionEnvironmentLabel,
  getSessionStepCategoryLabel,
  getSessionStepDrillTypeLabel,
  getSessionStepEquipmentLabel,
  getSessionStepStrokeLabel,
  getSessionStepDurationModeLabel,
  getSessionStepTargetModeLabel,
  getSessionTypeLabel,
  normalizeSessionDraftPoolLength,
  type SessionDraft,
  type SessionDraftStep,
  type SessionGeneratorEnvironment,
  type SessionGeneratorStroke,
} from "@/lib/session-generator-v1/shared";

export const WORKOUT_SOURCE_KINDS = ["ai_session_v1", "manual"] as const;
export const WORKOUT_STATUSES = ["accepted"] as const;

export type WorkoutSourceKind = (typeof WORKOUT_SOURCE_KINDS)[number];
export type WorkoutStatus = (typeof WORKOUT_STATUSES)[number];

export type WorkoutSummary = {
  id: string;
  title: string;
  environment: SessionGeneratorEnvironment;
  poolLengthM: SessionDraft["poolLengthM"];
  sessionType: SessionDraft["sessionType"];
  effort: SessionDraft["effort"];
  totalDistanceM: number | null;
  estimatedDurationMin: number | null;
  updatedAt: string;
  acceptedAt: string;
  sourceKind: WorkoutSourceKind;
  status: WorkoutStatus;
  previewText?: string | null;
};

export type WorkoutEditorRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string;
  sourceKind: WorkoutSourceKind;
  status: WorkoutStatus;
  draft: SessionDraft;
};

export type WorkoutSaveRequestBody = {
  draft?: SessionDraft | null;
  sourceKind?: WorkoutSourceKind | null;
};

export type WorkoutSaveApiSuccess = {
  ok: true;
  workout: WorkoutEditorRecord;
  summary: WorkoutSummary;
};

export type WorkoutSaveApiError = {
  ok: false;
  error: string;
};

export type WorkoutSaveApiResponse = WorkoutSaveApiSuccess | WorkoutSaveApiError;

export type WorkoutDeleteApiSuccess = {
  ok: true;
  deletedWorkoutId: string;
};

export type WorkoutDeleteApiError = {
  ok: false;
  error: string;
};

export type WorkoutDeleteApiResponse = WorkoutDeleteApiSuccess | WorkoutDeleteApiError;

export type WorkoutLibrarySnapshot = {
  schemaReady: boolean;
  loadError: string | null;
  selectedWorkout: WorkoutEditorRecord | null;
  selectedWorkoutMissing: boolean;
  recentWorkouts: WorkoutSummary[];
};

export type WorkoutGarminReadinessIssue = {
  id: string;
  stepId: string;
  stepIndex: number;
  detail: string;
};

export type WorkoutGarminReadinessReport = {
  status: "ready" | "review";
  summary: string;
  issues: WorkoutGarminReadinessIssue[];
};

export type WorkoutHandoffDraftState = "canonical" | "local_draft";
export type WorkoutPdfVariant = "standard" | "poolside";

export type WorkoutPdfModelStep = {
  label: string;
  title: string;
  summary: string;
  targetNotes: string | null;
  notes: string | null;
  reviewDetails: string[];
};

export type WorkoutPdfModelBlock =
  | {
      kind: "single";
      label: string;
      title: string;
      summary: string;
      targetNotes: string | null;
      notes: string | null;
      reviewDetails: string[];
    }
  | {
      kind: "repeat";
      label: string;
      title: string;
      summary: string;
      reviewDetails: string[];
      steps: WorkoutPdfModelStep[];
    };

export type WorkoutPdfModel = {
  fileName: string;
  draftState: WorkoutHandoffDraftState;
  variant: WorkoutPdfVariant;
  sourceLabel: string;
  title: string;
  sessionSummary: string;
  environmentSummary: string;
  sessionTypeLabel: string;
  effortLabel: string;
  description: string | null;
  goalTitle: string | null;
  focusText: string | null;
  focusPoints: string[];
  constraintText: string | null;
  warnings: string[];
  readiness: WorkoutGarminReadinessReport;
  blocks: WorkoutPdfModelBlock[];
  poolsideLines: string[];
  totalDistanceLabel: string | null;
};

type WorkoutPoolsideLineItem = {
  kind: "interval" | "pause";
  text: string;
};

type WorkoutGarminReadyExportLabeledValue<T extends string> = {
  value: T;
  label: string;
};

export type WorkoutGarminReadyExportStep = {
  id: string;
  position: number;
  name: string;
  mappingStatus: "ready" | "review";
  reviewIssueIds: string[];
  category: WorkoutGarminReadyExportLabeledValue<SessionDraftStep["category"]>;
  stroke: WorkoutGarminReadyExportLabeledValue<SessionDraftStep["stroke"]>;
  drillType: WorkoutGarminReadyExportLabeledValue<
    Exclude<SessionDraftStep["drillType"], null | undefined>
  > | null;
  equipment: WorkoutGarminReadyExportLabeledValue<
    Exclude<SessionDraftStep["equipment"], null | undefined>
  > | null;
  intensity: WorkoutGarminReadyExportLabeledValue<SessionDraftStep["intensity"]>;
  duration: {
    mode: SessionDraftStep["durationMode"];
    label: string;
    distanceM: number | null;
    timeMin: number | null;
    cssSendOffOffsetSeconds: number | null;
    summary: string;
  };
  target: {
    mode: NonNullable<SessionDraftStep["targetMode"]>;
    label: string;
    effortTarget: WorkoutGarminReadyExportLabeledValue<
      Exclude<SessionDraftStep["effortTarget"], null | undefined>
    > | null;
    targetPaceSecondsPer100m: number | null;
    cssTargetOffsetSeconds: number | null;
    structuredLabel: string | null;
    draftSummary: string | null;
  };
  notes: string | null;
  repeatGroupId: string | null;
  repeatCount: number | null;
};

export type WorkoutGarminReadyExportBlock =
  | {
      kind: "single";
      position: number;
      mappingStatus: "ready" | "review";
      reviewIssueIds: string[];
      step: WorkoutGarminReadyExportStep;
    }
  | {
      kind: "repeat";
      position: number;
      repeatGroupId: string;
      repeatCount: number | null;
      mappingStatus: "ready" | "review";
      reviewIssueIds: string[];
      roundSummary: string;
      roundDistanceM: number | null;
      roundDurationSeconds: number | null;
      steps: WorkoutGarminReadyExportStep[];
    };

export type WorkoutGarminReadyExport = {
  version: 1;
  kind: "freeswimming_garmin_ready_workout_v1";
  draftState: WorkoutHandoffDraftState;
  workoutId: string | null;
  diagnostics: {
    status: WorkoutGarminReadinessReport["status"];
    summary: string;
    issueCount: number;
    issues: WorkoutGarminReadinessIssue[];
  };
  workout: {
    title: string;
    description: string | null;
    summary: string;
    sourceFingerprint: string;
    createdAt: string;
    environment: {
      value: SessionDraft["environment"];
      label: string;
      subSport: "lap_swimming" | "open_water";
      poolLengthM: number | null;
    };
    sessionType: WorkoutGarminReadyExportLabeledValue<SessionDraft["sessionType"]>;
    effort: WorkoutGarminReadyExportLabeledValue<SessionDraft["effort"]>;
    sizeMode: SessionDraft["sizeMode"];
    targetDistanceM: number | null;
    targetTimeMin: number | null;
    totalDistanceM: number | null;
    estimatedDurationMin: number | null;
    basePaceSecondsPer100m: number;
    usedCssPaceLabel: string | null;
    allowedStrokes: SessionDraft["allowedStrokes"];
    equipmentAllowlist: SessionDraft["equipmentAllowlist"];
    goalTitle: string | null;
    focusText: string | null;
    constraintText: string | null;
    warnings: string[];
  } | null;
  blocks: WorkoutGarminReadyExportBlock[];
};

export function buildWorkoutDraftChangeSignature(
  draft: SessionDraft | null | undefined
): string | null {
  if (!draft) return null;
  return JSON.stringify(draft);
}

export function haveWorkoutDraftChanges(
  currentDraft: SessionDraft | null | undefined,
  savedDraft: SessionDraft | null | undefined
): boolean {
  const currentSignature = buildWorkoutDraftChangeSignature(currentDraft);
  const savedSignature = buildWorkoutDraftChangeSignature(savedDraft);

  if (currentSignature === null && savedSignature === null) return false;
  if (currentSignature === null || savedSignature === null) return true;

  return currentSignature !== savedSignature;
}

export function buildWorkoutGarminReadinessReport(
  draft: SessionDraft | null | undefined
): WorkoutGarminReadinessReport {
  if (!draft || !Array.isArray(draft.steps) || draft.steps.length === 0) {
    return {
      status: "review",
      summary: "Add workout steps before you rely on Garmin/export handoff readiness.",
      issues: [],
    };
  }

  const issues = draft.steps.flatMap((step, index) =>
    buildWorkoutGarminReadinessIssues(step, index)
  );

  if (issues.length === 0) {
    return {
      status: "ready",
      summary: "Ready for the planned Garmin/export handoff.",
      issues,
    };
  }

  return {
    status: "review",
    summary: `Review ${issues.length} Garmin/export mapping detail${
      issues.length === 1 ? "" : "s"
    } before you treat this workout as handoff-ready.`,
    issues,
  };
}

export function buildWorkoutHandoffFileName(
  draft: SessionDraft | null | undefined,
  options?: {
    draftState?: WorkoutHandoffDraftState;
  }
) {
  const title = normalizeFileNamePart(draft?.title ?? "");
  const draftState = options?.draftState ?? "local_draft";
  const suffix = draftState === "canonical" ? "" : "-draft";

  return `freeswimming-${title || "workout"}-handoff${suffix}.txt`;
}

export function buildWorkoutGarminReadyExportFileName(
  draft: SessionDraft | null | undefined,
  options?: {
    draftState?: WorkoutHandoffDraftState;
  }
) {
  const title = normalizeFileNamePart(draft?.title ?? "");
  const draftState = options?.draftState ?? "local_draft";
  const suffix = draftState === "canonical" ? "" : "-draft";

  return `freeswimming-${title || "workout"}-garmin-ready${suffix}.json`;
}

export function buildWorkoutPdfFileName(
  draft: SessionDraft | null | undefined,
  options?: {
    draftState?: WorkoutHandoffDraftState;
    variant?: WorkoutPdfVariant;
  }
) {
  const title = normalizeFileNamePart(draft?.title ?? "");
  const draftState = options?.draftState ?? "local_draft";
  const variant = options?.variant ?? "standard";
  const suffix = draftState === "canonical" ? "" : "-draft";
  const variantSuffix = variant === "poolside" ? "-poolside-note" : "";

  return `freeswimming-${title || "workout"}${variantSuffix}${suffix}.pdf`;
}

export function buildWorkoutGarminReadyExport(
  draft: SessionDraft | null | undefined,
  options?: {
    draftState?: WorkoutHandoffDraftState;
    workoutId?: string | null;
  }
): WorkoutGarminReadyExport {
  const draftState = options?.draftState ?? "local_draft";
  const workoutId = options?.workoutId ?? null;
  const diagnostics = buildWorkoutGarminReadinessReport(draft);

  if (!draft) {
    return {
      version: 1,
      kind: "freeswimming_garmin_ready_workout_v1",
      draftState,
      workoutId,
      diagnostics: {
        status: diagnostics.status,
        summary: diagnostics.summary,
        issueCount: diagnostics.issues.length,
        issues: diagnostics.issues,
      },
      workout: null,
      blocks: [],
    };
  }

  const totals = computeSessionDraftDerivedTotals(draft);
  const normalizedDraft = {
    ...draft,
    totalDistanceM: totals.totalDistanceM ?? draft.totalDistanceM,
    estimatedDurationMin: totals.estimatedDurationMin ?? draft.estimatedDurationMin,
  };
  const issueIdsByStepId = new Map<string, string[]>();

  for (const issue of diagnostics.issues) {
    const currentIssueIds = issueIdsByStepId.get(issue.stepId) ?? [];
    currentIssueIds.push(issue.id);
    issueIdsByStepId.set(issue.stepId, currentIssueIds);
  }

  const blocks = buildWorkoutHandoffGroups(draft.steps).map((group, index) => {
    if (group.kind === "single") {
      const entry = group.entries[0];
      const reviewIssueIds = issueIdsByStepId.get(entry?.step.id ?? "") ?? [];
      const step = buildWorkoutGarminReadyExportStep(
        entry.step,
        entry.index,
        draft.basePaceSecondsPer100m,
        reviewIssueIds
      );

      return {
        kind: "single" as const,
        position: index + 1,
        mappingStatus: reviewIssueIds.length > 0 ? ("review" as const) : ("ready" as const),
        reviewIssueIds,
        step,
      };
    }

    const reviewIssueIds = group.entries.flatMap(
      (entry) => issueIdsByStepId.get(entry.step.id) ?? []
    );
    const roundMetrics = buildWorkoutRepeatRoundMetrics(
      group.entries,
      draft.basePaceSecondsPer100m
    );

    return {
      kind: "repeat" as const,
      position: index + 1,
      repeatGroupId: group.repeatGroupId,
      repeatCount: group.repeatCount,
      mappingStatus: reviewIssueIds.length > 0 ? ("review" as const) : ("ready" as const),
      reviewIssueIds,
      roundSummary: buildWorkoutHandoffRepeatSummary(
        group.entries,
        group.repeatCount,
        draft.basePaceSecondsPer100m
      ),
      roundDistanceM: roundMetrics.roundDistanceM,
      roundDurationSeconds: roundMetrics.roundDurationSeconds,
      steps: group.entries.map((entry) =>
        buildWorkoutGarminReadyExportStep(
          entry.step,
          entry.index,
          draft.basePaceSecondsPer100m,
          issueIdsByStepId.get(entry.step.id) ?? []
        )
      ),
    };
  });

  return {
    version: 1,
    kind: "freeswimming_garmin_ready_workout_v1",
    draftState,
    workoutId,
    diagnostics: {
      status: diagnostics.status,
      summary: diagnostics.summary,
      issueCount: diagnostics.issues.length,
      issues: diagnostics.issues,
    },
    workout: {
      title: draft.title,
      description: draft.description || null,
      summary: buildSessionTargetSummary(normalizedDraft),
      sourceFingerprint: draft.sourceFingerprint,
      createdAt: draft.createdAt,
      environment: {
        value: draft.environment,
        label: getSessionEnvironmentLabel(draft.environment),
        subSport: draft.environment === "open_water" ? "open_water" : "lap_swimming",
        poolLengthM: draft.poolLengthM,
      },
      sessionType: {
        value: draft.sessionType,
        label: getSessionTypeLabel(draft.sessionType),
      },
      effort: {
        value: draft.effort,
        label: getSessionEffortLabel(draft.effort),
      },
      sizeMode: draft.sizeMode,
      targetDistanceM: normalizedDraft.targetDistanceM,
      targetTimeMin: normalizedDraft.targetTimeMin,
      totalDistanceM: normalizedDraft.totalDistanceM,
      estimatedDurationMin: normalizedDraft.estimatedDurationMin,
      basePaceSecondsPer100m: draft.basePaceSecondsPer100m,
      usedCssPaceLabel: draft.usedCssPaceLabel,
      allowedStrokes: draft.allowedStrokes,
      equipmentAllowlist: draft.equipmentAllowlist,
      goalTitle: draft.goalTitle,
      focusText: draft.focusText,
      constraintText: draft.constraintText,
      warnings: draft.warnings,
    },
    blocks,
  };
}

export function buildWorkoutHandoffText(
  draft: SessionDraft | null | undefined,
  options?: {
    draftState?: WorkoutHandoffDraftState;
  }
) {
  if (!draft) {
    return "No workout draft is available yet.";
  }

  const draftState = options?.draftState ?? "local_draft";
  const totals = computeSessionDraftDerivedTotals(draft);
  const normalizedDraft = {
    ...draft,
    totalDistanceM: totals.totalDistanceM ?? draft.totalDistanceM,
    estimatedDurationMin: totals.estimatedDurationMin ?? draft.estimatedDurationMin,
  };
  const readiness = buildWorkoutGarminReadinessReport(draft);
  const stepGroups = buildWorkoutHandoffGroups(draft.steps);
  const lines = [
    "FreeSwimming workout handoff",
    `Source: ${draftState === "canonical" ? "Canonical workout" : "Local draft"}`,
    `Title: ${draft.title}`,
    `Garmin/export readiness: ${readiness.status === "ready" ? "Ready" : "Review"}`,
    `Readiness summary: ${readiness.summary}`,
    "",
    "Use this handoff for manual Garmin Connect entry, coach review, or poolside notes until direct Garmin delivery exists.",
    "",
    "Workout",
    `- Session: ${buildSessionTargetSummary(normalizedDraft)}`,
    `- Environment: ${buildWorkoutEnvironmentSummary(draft)}`,
    `- Session type: ${getSessionTypeLabel(draft.sessionType)}`,
    `- Effort: ${getSessionEffortLabel(draft.effort)}`,
  ];

  if (draft.goalTitle) {
    lines.push(`- Goal: ${draft.goalTitle}`);
  }

  if (draft.focusText) {
    lines.push(`- Focus: ${draft.focusText}`);
  }

  if (draft.constraintText) {
    lines.push(`- Constraint: ${draft.constraintText}`);
  }

  if (draft.description) {
    lines.push(`- Description: ${draft.description}`);
  }

  if (draft.warnings.length > 0) {
    lines.push("", "Existing draft warnings");
    for (const warning of draft.warnings) {
      lines.push(`- ${warning}`);
    }
  }

  if (readiness.issues.length > 0) {
    lines.push("", "Review before export/send");
    for (const issue of readiness.issues) {
      lines.push(`- ${issue.detail}`);
    }
  }

  lines.push("", "Steps");

  stepGroups.forEach((group, groupIndex) => {
    const groupLabel = `${groupIndex + 1}.`;

    if (group.kind === "single") {
      const entry = group.entries[0];
      if (!entry) return;

      lines.push(`${groupLabel} ${entry.step.name}`);
      lines.push(
        `   - ${getSessionStepCategoryLabel(entry.step.category)} · ${buildWorkoutHandoffStepSummary(
          entry.step,
          draft.basePaceSecondsPer100m
        )}`
      );

      if (entry.step.targetSummary) {
        lines.push(`   - Target notes: ${entry.step.targetSummary}`);
      }

      if (entry.step.notes) {
        lines.push(`   - Notes: ${entry.step.notes}`);
      }

      return;
    }

    lines.push(
      `${groupLabel} Repeat block · ${buildWorkoutHandoffRepeatSummary(
        group.entries,
        group.repeatCount,
        draft.basePaceSecondsPer100m
      )}`
    );

    group.entries.forEach((entry, repeatIndex) => {
      lines.push(`   ${groupIndex + 1}.${repeatIndex + 1} ${entry.step.name}`);
      lines.push(
        `      - ${getSessionStepCategoryLabel(entry.step.category)} · ${buildWorkoutHandoffStepSummary(
          entry.step,
          draft.basePaceSecondsPer100m
        )}`
      );

      if (entry.step.targetSummary) {
        lines.push(`      - Target notes: ${entry.step.targetSummary}`);
      }

      if (entry.step.notes) {
        lines.push(`      - Notes: ${entry.step.notes}`);
      }
    });
  });

  return lines.join("\n");
}

export function buildWorkoutPdfModel(
  draft: SessionDraft | null | undefined,
  options?: {
    draftState?: WorkoutHandoffDraftState;
    variant?: WorkoutPdfVariant;
    focusPoints?: string[];
  }
): WorkoutPdfModel {
  const draftState = options?.draftState ?? "local_draft";
  const variant = options?.variant ?? "standard";
  const fileName = buildWorkoutPdfFileName(draft, { draftState, variant });
  const sourceLabel = draftState === "canonical" ? "Canonical workout" : "Local draft";
  const focusPoints = buildWorkoutPdfFocusPoints(draft, options?.focusPoints);
  const poolsideLines = buildWorkoutPoolsideLines(draft);

  if (!draft) {
    const readiness = buildWorkoutGarminReadinessReport(draft);
    return {
      fileName,
      draftState,
      variant,
      sourceLabel,
      title: variant === "poolside" ? "Poolside Note" : "Workout PDF",
      sessionSummary: "No workout draft is available yet.",
      environmentSummary: "Not set",
      sessionTypeLabel: "Not set",
      effortLabel: "Not set",
      description: null,
      goalTitle: null,
      focusText: null,
      focusPoints,
      constraintText: null,
      warnings: [],
      readiness,
      blocks: [],
      poolsideLines,
      totalDistanceLabel: null,
    };
  }

  const totals = computeSessionDraftDerivedTotals(draft);
  const normalizedDraft = {
    ...draft,
    totalDistanceM: totals.totalDistanceM ?? draft.totalDistanceM,
    estimatedDurationMin: totals.estimatedDurationMin ?? draft.estimatedDurationMin,
  };
  const readiness = buildWorkoutGarminReadinessReport(draft);
  const issuesByStepId = new Map<string, string[]>();
  const totalDistanceLabel =
    normalizedDraft.totalDistanceM && normalizedDraft.totalDistanceM > 0
      ? `Tot: ${normalizedDraft.totalDistanceM}m`
      : null;

  for (const issue of readiness.issues) {
    const current = issuesByStepId.get(issue.stepId) ?? [];
    current.push(issue.detail);
    issuesByStepId.set(issue.stepId, current);
  }

  const blocks = buildWorkoutHandoffGroups(draft.steps).map((group, groupIndex) => {
    if (group.kind === "single") {
      const entry = group.entries[0];
      return {
        kind: "single" as const,
        label: `${groupIndex + 1}.`,
        title: entry.step.name,
        summary: `${getSessionStepCategoryLabel(entry.step.category)} · ${buildWorkoutHandoffStepSummary(
          entry.step,
          draft.basePaceSecondsPer100m
        )}`,
        targetNotes: entry.step.targetSummary || null,
        notes: entry.step.notes || null,
        reviewDetails: issuesByStepId.get(entry.step.id) ?? [],
      };
    }

    const steps = group.entries.map((entry, repeatIndex) => ({
      label: `${groupIndex + 1}.${repeatIndex + 1}`,
      title: entry.step.name,
      summary: `${getSessionStepCategoryLabel(entry.step.category)} · ${buildWorkoutHandoffStepSummary(
        entry.step,
        draft.basePaceSecondsPer100m
      )}`,
      targetNotes: entry.step.targetSummary || null,
      notes: entry.step.notes || null,
      reviewDetails: issuesByStepId.get(entry.step.id) ?? [],
    }));

    return {
      kind: "repeat" as const,
      label: `${groupIndex + 1}.`,
      title: "Repeat block",
      summary: buildWorkoutHandoffRepeatSummary(
        group.entries,
        group.repeatCount,
        draft.basePaceSecondsPer100m
      ),
      reviewDetails: Array.from(new Set(steps.flatMap((step) => step.reviewDetails))),
      steps,
    };
  });

  return {
    fileName,
    draftState,
    variant,
    sourceLabel,
    title: draft.title,
    sessionSummary: buildSessionTargetSummary(normalizedDraft),
    environmentSummary: buildWorkoutEnvironmentSummary(draft),
    sessionTypeLabel: getSessionTypeLabel(draft.sessionType),
    effortLabel: getSessionEffortLabel(draft.effort),
    description: draft.description || null,
    goalTitle: draft.goalTitle || null,
    focusText: draft.focusText || null,
    focusPoints,
    constraintText: draft.constraintText || null,
    warnings: draft.warnings,
    readiness,
    blocks,
    poolsideLines,
    totalDistanceLabel,
  };
}

export function buildWorkoutPdfHtmlDocument(
  draft: SessionDraft | null | undefined,
  options?: {
    draftState?: WorkoutHandoffDraftState;
    variant?: WorkoutPdfVariant;
    focusPoints?: string[];
  }
) {
  const model = buildWorkoutPdfModel(draft, options);
  if (model.variant === "poolside") {
    return buildPoolsideWorkoutPdfHtmlDocument(model);
  }

  return buildStandardWorkoutPdfHtmlDocument(model);
}

function buildStandardWorkoutPdfHtmlDocument(model: WorkoutPdfModel) {
  const reviewDetailsHtml =
    model.readiness.issues.length > 0
      ? `
        <section class="notice notice-warn">
          <h2>Review before export/send</h2>
          <p>${escapeHtml(model.readiness.summary)}</p>
          <ul>
            ${model.readiness.issues.map((issue) => `<li>${escapeHtml(issue.detail)}</li>`).join("")}
          </ul>
        </section>
      `
      : "";
  const warningsHtml =
    model.warnings.length > 0
      ? `
        <section class="notice notice-neutral">
          <h2>Existing draft warnings</h2>
          <ul>
            ${model.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}
          </ul>
        </section>
      `
      : "";
  const contextCards = [
    {
      label: "Source",
      value: model.sourceLabel,
    },
    {
      label: "Environment",
      value: model.environmentSummary,
    },
    {
      label: "Session type",
      value: model.sessionTypeLabel,
    },
    {
      label: "Effort",
      value: model.effortLabel,
    },
    model.goalTitle
      ? {
          label: "Goal",
          value: model.goalTitle,
        }
      : null,
    model.focusText
      ? {
          label: "Focus",
          value: model.focusText,
        }
      : null,
    model.constraintText
      ? {
          label: "Constraint",
          value: model.constraintText,
        }
      : null,
  ]
    .filter((card): card is { label: string; value: string } => Boolean(card))
    .map(
      (card) => `
        <div class="meta-card">
          <p class="meta-label">${escapeHtml(card.label)}</p>
          <p class="meta-value">${escapeHtml(card.value)}</p>
        </div>
      `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(model.fileName)} - FreeSwimming</title>
    <style>
      :root {
        color-scheme: light;
        --ink: #172033;
        --muted: #51607a;
        --line: rgba(15, 23, 42, 0.12);
        --page: #e8eef8;
        --surface: #ffffff;
        --surface-soft: #eff6ff;
        --surface-muted: #f8fbff;
        --accent: #1d4ed8;
        --accent-soft: rgba(29, 78, 216, 0.1);
        --warn: #9a3412;
        --warn-soft: rgba(245, 158, 11, 0.14);
        --notice: rgba(29, 78, 216, 0.08);
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background: var(--page);
        color: var(--ink);
        font-family: "SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      }

      body {
        min-height: 100vh;
      }

      button {
        font: inherit;
      }

      .toolbar {
        position: sticky;
        top: 0;
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 16px 20px;
        background: rgba(255, 255, 255, 0.94);
        color: var(--ink);
        border-bottom: 1px solid var(--line);
      }

      .toolbar-copy {
        display: grid;
        gap: 4px;
      }

      .toolbar-kicker {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .toolbar-title {
        font-size: 15px;
        font-weight: 700;
      }

      .toolbar-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .toolbar-button {
        border: 1px solid var(--line);
        background: #fff;
        color: var(--ink);
        border-radius: 999px;
        padding: 10px 16px;
        cursor: pointer;
      }

      .toolbar-button-primary {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
      }

      .shell {
        padding: 24px 16px 40px;
      }

      .page {
        max-width: 920px;
        margin: 0 auto;
        background: var(--surface);
        border: 1px solid rgba(23, 32, 51, 0.08);
        border-radius: 28px;
        overflow: hidden;
        box-shadow: 0 28px 80px rgba(23, 32, 51, 0.14);
      }

      .hero {
        padding: 32px;
        background: linear-gradient(145deg, #eff6ff, #f8fbff 58%, #ffffff);
        border-bottom: 1px solid rgba(23, 32, 51, 0.08);
      }

      .eyebrow {
        margin: 0;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .source-pill {
        display: inline-flex;
        margin: 14px 0 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.88);
        padding: 8px 14px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent);
      }

      h1 {
        margin: 18px 0 0;
        font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
        font-size: clamp(2rem, 5vw, 3.2rem);
        line-height: 1.04;
      }

      .lede {
        margin: 14px 0 0;
        max-width: 42rem;
        font-size: 1rem;
        line-height: 1.65;
        color: var(--muted);
      }

      .meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-top: 24px;
      }

      .meta-card {
        border: 1px solid rgba(23, 32, 51, 0.08);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.82);
        padding: 14px 16px;
      }

      .meta-label {
        margin: 0;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .meta-value {
        margin: 8px 0 0;
        font-size: 15px;
        font-weight: 600;
        line-height: 1.5;
      }

      .body {
        padding: 28px 32px 36px;
      }

      .notice {
        border-radius: 22px;
        padding: 18px 20px;
        margin-bottom: 18px;
      }

      .notice h2 {
        margin: 0;
        font-size: 1rem;
      }

      .notice p {
        margin: 10px 0 0;
        line-height: 1.6;
      }

      .notice ul {
        margin: 12px 0 0;
        padding-left: 18px;
      }

      .notice li + li {
        margin-top: 8px;
      }

      .notice-warn {
        background: var(--warn-soft);
        border: 1px solid rgba(146, 64, 14, 0.18);
        color: var(--warn);
      }

      .notice-neutral {
        background: var(--notice);
        border: 1px solid rgba(82, 96, 121, 0.16);
      }

      .section-title {
        margin: 28px 0 16px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .steps {
        display: grid;
        gap: 14px;
      }

      .step-block {
        border: 1px solid var(--line);
        border-radius: 24px;
        background: #fff;
        overflow: hidden;
      }

      .step-block-head {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        padding: 18px 20px 14px;
        border-bottom: 1px solid rgba(23, 32, 51, 0.08);
        background: var(--surface-soft);
      }

      .step-kicker {
        margin: 0;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .step-title {
        margin: 8px 0 0;
        font-size: 1.1rem;
        font-weight: 700;
      }

      .step-summary {
        margin: 6px 0 0;
        color: var(--muted);
        line-height: 1.6;
      }

      .step-body {
        padding: 18px 20px 20px;
      }

      .step-list {
        display: grid;
        gap: 12px;
      }

      .repeat-step {
        border: 1px solid rgba(23, 32, 51, 0.08);
        border-radius: 18px;
        padding: 14px 16px;
        background: var(--surface-muted);
      }

      .detail-list,
      .review-list {
        margin: 12px 0 0;
        padding-left: 18px;
      }

      .detail-list li + li,
      .review-list li + li {
        margin-top: 6px;
      }

      .review-list {
        color: var(--warn);
      }

      .footer-note {
        margin-top: 28px;
        border-top: 1px solid var(--line);
        padding-top: 16px;
        font-size: 0.95rem;
        line-height: 1.6;
        color: var(--muted);
      }

      @media (max-width: 720px) {
        .toolbar {
          align-items: flex-start;
          flex-direction: column;
        }

        .meta-grid {
          grid-template-columns: 1fr;
        }

        .hero,
        .body {
          padding: 22px 20px 24px;
        }
      }

      @media print {
        html,
        body {
          background: #fff;
        }

        .toolbar {
          display: none;
        }

        .shell {
          padding: 0;
        }

        .page {
          max-width: none;
          border: none;
          border-radius: 0;
          box-shadow: none;
        }

        .step-block,
        .repeat-step,
        .meta-card,
        .notice {
          break-inside: avoid;
        }
      }

      @page {
        size: auto;
        margin: 12mm;
      }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <div class="toolbar-copy">
        <span class="toolbar-kicker">FreeSwimming</span>
        <span class="toolbar-title">Workout PDF</span>
      </div>
      <div class="toolbar-actions">
        <button class="toolbar-button toolbar-button-primary" type="button" onclick="window.print()">
          Print / Save PDF
        </button>
        <button class="toolbar-button" type="button" onclick="window.close()">
          Close
        </button>
      </div>
    </div>
    <main class="shell">
      <article class="page" data-testid="workout-pdf-print-view" data-pdf-variant="standard">
        <header class="hero">
          <p class="eyebrow">FreeSwimming PDF</p>
          <p class="source-pill" data-testid="workout-pdf-source">Source: ${escapeHtml(model.sourceLabel)}</p>
          <h1 data-testid="workout-pdf-title">${escapeHtml(model.title)}</h1>
          <p class="lede">${escapeHtml(model.sessionSummary)}</p>
          <div class="meta-grid">
            ${contextCards}
          </div>
        </header>
        <div class="body">
          ${
            model.description
              ? `
                <section class="notice notice-neutral">
                  <h2>Description</h2>
                  <p>${escapeHtml(model.description)}</p>
                </section>
              `
              : ""
          }
          ${warningsHtml}
          ${reviewDetailsHtml}
          <h2 class="section-title">Steps</h2>
          <section class="steps">
            ${model.blocks.map((block) => renderWorkoutPdfBlockHtml(block)).join("")}
          </section>
          <p class="footer-note">
            This print view reflects the ${
              model.draftState === "canonical" ? "saved canonical workout" : "current local draft"
            }. Use your browser&apos;s Print / Save PDF flow when you want the full session sheet.
          </p>
        </div>
      </article>
    </main>
  </body>
</html>`;
}

function buildPoolsideWorkoutPdfHtmlDocument(model: WorkoutPdfModel) {
  const focusPointsHtml =
    model.focusPoints.length > 0
      ? `
        <section class="callout">
          <p class="callout-label">Focus</p>
          <ul class="focus-list" data-testid="workout-pdf-focus-points">
            ${model.focusPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
          </ul>
        </section>
      `
      : "";
  const totalDistanceHtml = model.totalDistanceLabel
    ? `<p class="poolside-total">${escapeHtml(model.totalDistanceLabel)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(model.fileName)} - FreeSwimming</title>
    <style>
      :root {
        color-scheme: light;
        --ink: #10213c;
        --muted: #42506b;
        --line: rgba(16, 33, 60, 0.14);
        --page: #dbe8ff;
        --surface: #ffffff;
        --surface-soft: #eff5ff;
        --accent: #1d4ed8;
        --accent-strong: #163ea8;
        --accent-soft: rgba(29, 78, 216, 0.12);
        --warning: #92400e;
        --warning-soft: rgba(245, 158, 11, 0.16);
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background: var(--page);
        color: var(--ink);
        font-family: "SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      }

      .toolbar {
        position: sticky;
        top: 0;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        background: rgba(255, 255, 255, 0.95);
        border-bottom: 1px solid var(--line);
      }

      .toolbar-copy {
        display: grid;
        gap: 2px;
      }

      .toolbar-kicker,
      .section-kicker,
      .callout-label {
        margin: 0;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .toolbar-kicker,
      .section-kicker,
      .callout-label,
      .session-pill {
        color: var(--accent-strong);
      }

      .toolbar-title {
        font-size: 14px;
        font-weight: 700;
      }

      .toolbar-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .toolbar-button {
        border: 1px solid var(--line);
        background: #fff;
        color: var(--ink);
        border-radius: 999px;
        padding: 8px 12px;
        font: inherit;
        cursor: pointer;
      }

      .toolbar-button-primary {
        background: var(--accent);
        border-color: var(--accent);
        color: #fff;
      }

      .shell {
        padding: 14px;
      }

      .page {
        max-width: 420px;
        margin: 0 auto;
        border: 1px solid rgba(16, 33, 60, 0.08);
        border-radius: 24px;
        background: var(--surface);
        box-shadow: 0 20px 48px rgba(16, 33, 60, 0.14);
        overflow: hidden;
      }

      .hero {
        padding: 18px 18px 16px;
        background: linear-gradient(165deg, #eff5ff 0%, #f9fbff 68%, #ffffff 100%);
        border-bottom: 1px solid rgba(16, 33, 60, 0.08);
      }

      .source-pill {
        display: inline-flex;
        margin-top: 10px;
        border-radius: 999px;
        border: 1px solid rgba(29, 78, 216, 0.12);
        background: rgba(255, 255, 255, 0.92);
        padding: 6px 10px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent-strong);
      }

      h1 {
        margin: 12px 0 0;
        font-size: 22px;
        line-height: 1.15;
      }

      .lede {
        margin: 10px 0 0;
        font-size: 13px;
        line-height: 1.45;
        color: var(--muted);
      }

      .session-pill-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 12px;
      }

      .session-pill {
        display: inline-flex;
        border-radius: 999px;
        background: var(--accent-soft);
        padding: 5px 9px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .body {
        display: grid;
        gap: 10px;
        padding: 14px;
      }

      .callout,
      .review-note {
        border-radius: 16px;
        padding: 10px 12px;
      }

      .callout {
        border: 1px solid var(--line);
        background: var(--surface-soft);
      }

      .review-note {
        border: 1px solid rgba(146, 64, 14, 0.2);
        background: var(--warning-soft);
        color: var(--warning);
      }

      .review-title {
        margin: 0 0 4px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .focus-list {
        margin: 8px 0 0;
        padding-left: 18px;
        display: grid;
        gap: 4px;
        font-size: 12px;
        line-height: 1.45;
      }

      .section-title {
        margin: 2px 0 0;
        font-size: 15px;
        font-weight: 700;
      }

      .steps {
        display: grid;
        gap: 8px;
      }

      .step-group {
        border: 1px solid var(--line);
        border-radius: 18px;
        overflow: hidden;
        background: #fff;
      }

      .step-group-head {
        padding: 10px 12px;
        background: var(--surface-soft);
        border-bottom: 1px solid rgba(16, 33, 60, 0.08);
      }

      .step-group-title {
        margin: 4px 0 0;
        font-size: 12px;
        font-weight: 700;
      }

      .step-group-summary {
        margin: 4px 0 0;
        font-size: 11px;
        line-height: 1.4;
        color: var(--muted);
      }

      .poolside-line-list {
        list-style: none;
        margin: 0;
        padding: 0;
        border: 1px solid rgba(16, 33, 60, 0.08);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.88);
      }

      .poolside-line {
        display: block;
        padding: 10px 12px;
        border-top: 1px solid rgba(16, 33, 60, 0.08);
      }

      .poolside-line:first-child {
        border-top: none;
      }

      .poolside-line-text {
        font-size: 13px;
        line-height: 1.5;
        color: var(--ink);
      }

      .poolside-line-pause .poolside-line-text {
        font-weight: 700;
        color: var(--accent-strong);
      }

      .poolside-total {
        margin: 6px 0 0;
        font-size: 13px;
        font-weight: 700;
        color: var(--ink);
      }

      .footer-note {
        margin-top: 12px;
        font-size: 10px;
        line-height: 1.4;
        color: var(--muted);
      }

      @media print {
        html,
        body {
          background: #fff;
        }

        .toolbar {
          display: none;
        }

        .shell {
          padding: 0;
        }

        .page {
          max-width: none;
          border: none;
          border-radius: 0;
          box-shadow: none;
        }
      }

      @page {
        size: A6 portrait;
        margin: 6mm;
      }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <div class="toolbar-copy">
        <span class="toolbar-kicker">FreeSwimming</span>
        <span class="toolbar-title">Poolside Note</span>
      </div>
      <div class="toolbar-actions">
        <button class="toolbar-button toolbar-button-primary" type="button" onclick="window.print()">
          Print / Save PDF
        </button>
        <button class="toolbar-button" type="button" onclick="window.close()">
          Close
        </button>
      </div>
    </div>
    <main class="shell">
      <article class="page" data-testid="workout-pdf-print-view" data-pdf-variant="poolside">
        <header class="hero">
          <p class="section-kicker">freeswimming.org</p>
          <h1 data-testid="workout-pdf-title">Poolside Note</h1>
          <p class="lede">${escapeHtml(model.title)}</p>
        </header>
        <div class="body">
          <section>
            <ol class="poolside-line-list">
              ${model.poolsideLines
                .map((line) =>
                  renderWorkoutPoolsideLineHtml({
                    kind: line.startsWith("P:") ? "pause" : "interval",
                    text: line,
                  })
                )
                .join("")}
            </ol>
          </section>
          ${totalDistanceHtml}
          ${focusPointsHtml}
          <p class="footer-note">
            Compact lane-side note for the ${
              model.draftState === "canonical" ? "saved canonical workout" : "current local draft"
            }. Print at actual size on A6 or quarter-A4.
          </p>
        </div>
      </article>
    </main>
  </body>
</html>`;
}

export function normalizeSessionDraftForWorkoutPersistence(
  input: SessionDraft | null | undefined
): { ok: true; value: SessionDraft } | { ok: false; error: string } {
  if (!input) {
    return { ok: false, error: "Generate and review a session draft before saving it." };
  }

  const title = normalizeRequiredText(input.title, 120);
  if (!title) {
    return { ok: false, error: "Add a workout title before saving." };
  }

  const description = normalizeText(input.description, 600);
  if (input.description.trim().length > 600) {
    return { ok: false, error: "Workout description must stay under 600 characters." };
  }

  if (!SESSION_GENERATOR_ENVIRONMENTS.includes(input.environment)) {
    return { ok: false, error: "Choose a supported environment before saving." };
  }

  const poolLengthM = input.environment === "pool" ? normalizePoolLength(input.poolLengthM) : null;

  if (input.environment === "pool" && poolLengthM === null) {
    return { ok: false, error: "Choose a supported pool length before saving." };
  }

  if (!SESSION_GENERATOR_SESSION_TYPES.includes(input.sessionType)) {
    return { ok: false, error: "Choose a supported session type before saving." };
  }

  if (!SESSION_GENERATOR_EFFORT_PRESETS.includes(input.effort)) {
    return { ok: false, error: "Choose a supported session effort before saving." };
  }

  if (input.sizeMode !== "distance" && input.sizeMode !== "estimated_time") {
    return { ok: false, error: "Choose whether the workout is sized by distance or time." };
  }

  const allowedStrokes = uniqueEnumList(input.allowedStrokes, SESSION_GENERATOR_STROKES);
  if (allowedStrokes.length === 0) {
    return { ok: false, error: "Select at least one session stroke before saving." };
  }

  const equipmentAllowlist = uniqueEnumList(input.equipmentAllowlist, SESSION_GENERATOR_EQUIPMENT);

  const warnings = normalizeStringList(input.warnings, 160, 8);
  const titleSuggestions = normalizeStringList(input.titleSuggestions, 120, 5);

  const normalizedSteps: SessionDraftStep[] = [];

  if (!Array.isArray(input.steps) || input.steps.length === 0) {
    return { ok: false, error: "Add at least one workout step before saving." };
  }

  if (input.steps.length > 40) {
    return {
      ok: false,
      error: "This first canonical slice supports up to 40 workout steps per session.",
    };
  }

  for (const [index, rawStep] of input.steps.entries()) {
    const normalizedStep = normalizeStep(rawStep, index);
    if (!normalizedStep.ok) {
      return normalizedStep;
    }
    normalizedSteps.push(normalizedStep.value);
  }

  const explicitStepStrokes = normalizedSteps
    .map((step) => mapDraftStepStrokeToAllowedStroke(step.stroke))
    .filter((stroke): stroke is SessionGeneratorStroke => Boolean(stroke));
  const requiredEquipment = normalizedSteps
    .map((step) => mapDraftStepEquipmentToAllowlist(step.equipment))
    .filter((item): item is (typeof SESSION_GENERATOR_EQUIPMENT)[number] => Boolean(item));
  const canonicalAllowedStrokes = Array.from(new Set([...allowedStrokes, ...explicitStepStrokes]));
  const canonicalEquipmentAllowlist = Array.from(
    new Set([...equipmentAllowlist, ...requiredEquipment])
  );

  const repeatGroups = new Map<string, { repeatCount: number; lastIndex: number }>();

  for (const [index, step] of normalizedSteps.entries()) {
    if (!step.repeatGroupId || step.repeatCount == null) continue;

    const existing = repeatGroups.get(step.repeatGroupId);
    if (!existing) {
      repeatGroups.set(step.repeatGroupId, {
        repeatCount: step.repeatCount,
        lastIndex: index,
      });
      continue;
    }

    if (existing.repeatCount !== step.repeatCount) {
      return {
        ok: false,
        error: `Repeat block ${step.repeatGroupId} must use the same repeat count on every step.`,
      };
    }

    if (existing.lastIndex !== index - 1) {
      return {
        ok: false,
        error: `Repeat block ${step.repeatGroupId} must stay contiguous in the workout order.`,
      };
    }

    existing.lastIndex = index;
  }

  const createdAt = normalizeIsoDate(input.createdAt) ?? new Date().toISOString();
  const basePaceSecondsPer100m = normalizePositiveNumber(input.basePaceSecondsPer100m);

  if (basePaceSecondsPer100m === null) {
    return { ok: false, error: "Workout pace metadata is invalid. Regenerate the session draft." };
  }

  const normalizedDraft: SessionDraft = {
    version: 1,
    status: "draft",
    generatorKind: "rule_engine_v1",
    createdAt,
    sourceFingerprint: normalizeRequiredText(input.sourceFingerprint, 64) ?? "unknown",
    title,
    titleSuggestions: titleSuggestions.length > 0 ? titleSuggestions : [title],
    description,
    environment: input.environment,
    poolLengthM,
    sessionType: input.sessionType,
    effort: input.effort,
    sizeMode: input.sizeMode,
    targetDistanceM: normalizeNullableInteger(input.targetDistanceM),
    targetTimeMin: normalizeNullableInteger(input.targetTimeMin),
    totalDistanceM: null,
    estimatedDurationMin: null,
    basePaceSecondsPer100m,
    usedCssPaceLabel: normalizeNullableText(input.usedCssPaceLabel, 32),
    allowedStrokes: canonicalAllowedStrokes,
    equipmentAllowlist: canonicalEquipmentAllowlist,
    focusText: normalizeNullableText(input.focusText, 120),
    goalTitle: normalizeNullableText(input.goalTitle, 120),
    constraintText: normalizeNullableText(input.constraintText, 240),
    warnings,
    steps: normalizedSteps,
  };

  const totals = computeSessionDraftDerivedTotals(normalizedDraft);
  const targetDistanceM =
    normalizedDraft.sizeMode === "distance"
      ? (normalizedDraft.targetDistanceM ?? totals.totalDistanceM)
      : null;
  const targetTimeMin =
    normalizedDraft.sizeMode === "estimated_time"
      ? (normalizedDraft.targetTimeMin ?? totals.estimatedDurationMin)
      : null;
  if (normalizedDraft.sizeMode === "distance" && targetDistanceM === null) {
    return { ok: false, error: "Distance-based workouts need a target distance before saving." };
  }

  if (normalizedDraft.sizeMode === "estimated_time" && targetTimeMin === null) {
    return {
      ok: false,
      error: "Time-based workouts need an estimated workout time before saving.",
    };
  }

  return {
    ok: true,
    value: {
      ...normalizedDraft,
      targetDistanceM,
      targetTimeMin,
      totalDistanceM: totals.totalDistanceM,
      estimatedDurationMin: totals.estimatedDurationMin,
    },
  };
}

function buildWorkoutGarminReadinessIssues(
  step: SessionDraftStep,
  index: number
): WorkoutGarminReadinessIssue[] {
  const issues: WorkoutGarminReadinessIssue[] = [];
  const stepLabel = buildWorkoutStepReadinessLabel(step, index);

  if (step.stroke === "im_by_round") {
    issues.push({
      id: `${step.id}-im-by-round`,
      stepId: step.id,
      stepIndex: index,
      detail: `${stepLabel} uses IM by round, which is a FreeSwimming convenience stroke and will need later Garmin/export decomposition.`,
    });
  }

  if (step.stroke === "reverse_im_order") {
    issues.push({
      id: `${step.id}-reverse-im-order`,
      stepId: step.id,
      stepIndex: index,
      detail: `${stepLabel} uses Reverse IM order (RIMO), which is a FreeSwimming convenience stroke and will need later Garmin/export decomposition.`,
    });
  }

  if (step.drillType && step.drillType !== "none") {
    issues.push({
      id: `${step.id}-drill-focus`,
      stepId: step.id,
      stepIndex: index,
      detail: `${stepLabel} uses ${getSessionStepDrillTypeLabel(
        step.drillType
      )} drill focus. Garmin/PDF adapter support for drill metadata still needs explicit review.`,
    });
  }

  if (step.equipment && step.equipment !== "none") {
    issues.push({
      id: `${step.id}-equipment`,
      stepId: step.id,
      stepIndex: index,
      detail: `${stepLabel} uses ${getSessionStepEquipmentLabel(
        step.equipment
      )}. Garmin/PDF adapter support for equipment metadata still needs explicit review.`,
    });
  }

  return issues;
}

function buildWorkoutStepReadinessLabel(step: SessionDraftStep, index: number) {
  const name = typeof step.name === "string" ? step.name.trim() : "";
  return name ? `Step ${index + 1} (${name})` : `Step ${index + 1}`;
}

function renderWorkoutPdfBlockHtml(block: WorkoutPdfModelBlock) {
  if (block.kind === "single") {
    return `
      <article class="step-block">
        <div class="step-block-head">
          <div>
            <p class="step-kicker">${escapeHtml(block.label)}</p>
            <h3 class="step-title">${escapeHtml(block.title)}</h3>
            <p class="step-summary">${escapeHtml(block.summary)}</p>
          </div>
        </div>
        <div class="step-body">
          ${renderWorkoutPdfDetailList(block.targetNotes, block.notes)}
          ${renderWorkoutPdfReviewList(block.reviewDetails)}
        </div>
      </article>
    `;
  }

  return `
    <article class="step-block">
      <div class="step-block-head">
        <div>
          <p class="step-kicker">${escapeHtml(block.label)}</p>
          <h3 class="step-title">${escapeHtml(block.title)}</h3>
          <p class="step-summary">${escapeHtml(block.summary)}</p>
        </div>
      </div>
      <div class="step-body">
        ${renderWorkoutPdfReviewList(block.reviewDetails)}
        <div class="step-list">
          ${block.steps
            .map(
              (step) => `
                <section class="repeat-step">
                  <p class="step-kicker">${escapeHtml(step.label)}</p>
                  <h4 class="step-title">${escapeHtml(step.title)}</h4>
                  <p class="step-summary">${escapeHtml(step.summary)}</p>
                  ${renderWorkoutPdfDetailList(step.targetNotes, step.notes)}
                  ${renderWorkoutPdfReviewList(step.reviewDetails)}
                </section>
              `
            )
            .join("")}
        </div>
      </div>
    </article>
  `;
}

function renderWorkoutPoolsideLineHtml(line: WorkoutPoolsideLineItem) {
  return `
    <li class="poolside-line${line.kind === "pause" ? " poolside-line-pause" : ""}">
      <span class="poolside-line-text">${escapeHtml(line.text)}</span>
    </li>
  `;
}

function renderWorkoutPdfDetailList(targetNotes: string | null, notes: string | null) {
  const items = [
    targetNotes ? `<li>Target notes: ${escapeHtml(targetNotes)}</li>` : "",
    notes ? `<li>Notes: ${escapeHtml(notes)}</li>` : "",
  ].filter(Boolean);

  if (items.length === 0) {
    return "";
  }

  return `<ul class="detail-list">${items.join("")}</ul>`;
}

function renderWorkoutPdfReviewList(reviewDetails: string[]) {
  if (reviewDetails.length === 0) {
    return "";
  }

  return `<ul class="review-list">${reviewDetails
    .map((detail) => `<li>${escapeHtml(detail)}</li>`)
    .join("")}</ul>`;
}

function buildWorkoutPdfFocusPoints(
  draft: SessionDraft | null | undefined,
  rawFocusPoints: string[] | null | undefined
) {
  const seen = new Set<string>();
  const normalizedPoints: string[] = [];

  const pushPoint = (value: string | null | undefined) => {
    const normalized = normalizeNullableText(value, 120);
    if (!normalized) return;

    const dedupeKey = normalized.toLowerCase();
    if (seen.has(dedupeKey)) return;

    seen.add(dedupeKey);
    normalizedPoints.push(normalized);
  };

  for (const point of rawFocusPoints ?? []) {
    pushPoint(point);
  }

  pushPoint(draft?.focusText);

  return normalizedPoints;
}

export function buildWorkoutSummaryPreviewText(draft: SessionDraft | null | undefined) {
  const lines = buildWorkoutPoolsideLines(draft);

  if (lines.length === 0) {
    return "";
  }

  const totalDistanceLabel =
    draft?.totalDistanceM && draft.totalDistanceM > 0 ? `Tot: ${draft.totalDistanceM}m` : null;

  return [...lines, ...(totalDistanceLabel ? ["", totalDistanceLabel] : [])].join("\n");
}

function buildWorkoutPoolsideLines(draft: SessionDraft | null | undefined) {
  if (!draft) {
    return [];
  }

  const lineItems = buildWorkoutHandoffGroups(draft.steps).flatMap((group) => {
    if (group.kind === "single") {
      return buildWorkoutPoolsideLineItems(group.entries, null, draft.basePaceSecondsPer100m);
    }

    return buildWorkoutPoolsideLineItems(
      group.entries,
      group.repeatCount,
      draft.basePaceSecondsPer100m
    );
  });

  return lineItems.map((item) => item.text);
}

function buildWorkoutPoolsideLineItems(
  entries: WorkoutHandoffEntry[],
  repeatCount: number | null,
  basePaceSecondsPer100m: number
) {
  const lineItems: WorkoutPoolsideLineItem[] = [];

  for (const entry of entries) {
    const step = entry.step;

    if (isWorkoutPoolsidePauseStep(step)) {
      lineItems.push({
        kind: "pause",
        text: `P: ${buildWorkoutPoolsidePauseLabel(step, basePaceSecondsPer100m)}`,
      });
      continue;
    }

    const prefix = repeatCount ? `${repeatCount} x ` : "";
    lineItems.push({
      kind: "interval",
      text: `${prefix}${buildWorkoutPoolsideIntervalLabel(step, basePaceSecondsPer100m)}`,
    });
  }

  return lineItems;
}

function isWorkoutPoolsidePauseStep(step: SessionDraftStep) {
  return (
    step.category === "rest" ||
    step.durationMode === "fixed_rest" ||
    step.durationMode === "lap_button"
  );
}

function buildWorkoutPoolsidePauseLabel(step: SessionDraftStep, basePaceSecondsPer100m: number) {
  if (step.durationMode === "lap_button") {
    return "Lap button";
  }

  if (step.durationMode === "css_send_off" && typeof step.cssSendOffOffsetSeconds === "number") {
    return `CSS send-off ${formatClockDurationLabelFromSeconds(
      basePaceSecondsPer100m + step.cssSendOffOffsetSeconds
    )}`;
  }

  if (
    (step.durationMode === "time" ||
      step.durationMode === "fixed_rest" ||
      step.durationMode === "send_off") &&
    step.timeMin
  ) {
    return formatPoolsidePauseDuration(step.timeMin);
  }

  return buildWorkoutHandoffDurationSummary(step, basePaceSecondsPer100m);
}

function buildWorkoutPoolsideIntervalLabel(step: SessionDraftStep, basePaceSecondsPer100m: number) {
  return [
    buildWorkoutPoolsideDurationLabel(step, basePaceSecondsPer100m),
    buildWorkoutPoolsideDescriptor(step),
    getSessionEffortLabel(step.intensity),
    buildWorkoutPoolsideTargetLabel(step, basePaceSecondsPer100m),
  ]
    .filter(Boolean)
    .join(" · ");
}

function buildWorkoutPoolsideDurationLabel(step: SessionDraftStep, basePaceSecondsPer100m: number) {
  switch (step.durationMode) {
    case "distance":
      return step.distanceM ? `${step.distanceM}m` : "Distance not set";
    case "time":
      return step.timeMin ? formatMinutesLabel(step.timeMin) : "Time not set";
    case "send_off":
      return step.timeMin ? `SO ${formatClockDurationLabel(step.timeMin)}` : "SO not set";
    case "css_send_off":
      return typeof step.cssSendOffOffsetSeconds === "number"
        ? `CSS SO ${formatClockDurationLabelFromSeconds(
            basePaceSecondsPer100m + step.cssSendOffOffsetSeconds
          )}`
        : "CSS SO not set";
    case "lap_button":
      return "Lap button";
    default:
      return buildWorkoutHandoffDurationSummary(step, basePaceSecondsPer100m);
  }
}

function buildWorkoutPoolsideDescriptor(step: SessionDraftStep) {
  const parts: string[] = [];

  if (step.category === "kick") {
    if (step.stroke && step.stroke !== "choice" && step.stroke !== "drill") {
      parts.push(getSessionStepStrokeLabel(step.stroke));
    }
    parts.push("Kick");
  } else if (step.category === "drill" || step.stroke === "drill") {
    if (step.drillType && step.drillType !== "none") {
      parts.push(getSessionStepDrillTypeLabel(step.drillType));
    }
    parts.push("Drill");
  } else if (step.stroke && step.stroke !== "choice") {
    parts.push(getSessionStepStrokeLabel(step.stroke));
  }

  if (
    step.drillType &&
    step.drillType !== "none" &&
    !parts.includes(getSessionStepDrillTypeLabel(step.drillType))
  ) {
    parts.push(getSessionStepDrillTypeLabel(step.drillType));
  }

  if (step.equipment && step.equipment !== "none") {
    parts.push(getSessionStepEquipmentLabel(step.equipment));
  }

  return parts.length > 0 ? parts.join(" · ") : step.name;
}

function buildWorkoutPoolsideTargetLabel(step: SessionDraftStep, basePaceSecondsPer100m: number) {
  return buildSessionStepStructuredTargetLabel(step, basePaceSecondsPer100m) ?? null;
}

function formatPoolsidePauseDuration(valueMinutes: number) {
  const totalSeconds = getClockTotalSeconds(valueMinutes);

  if (totalSeconds > 0 && totalSeconds < 60) {
    return `${totalSeconds} sec`;
  }

  return formatClockDurationLabelFromSeconds(totalSeconds);
}

type WorkoutHandoffEntry = {
  step: SessionDraftStep;
  index: number;
};

type WorkoutHandoffGroup =
  | {
      kind: "single";
      entries: [WorkoutHandoffEntry];
    }
  | {
      kind: "repeat";
      repeatGroupId: string;
      repeatCount: number | null;
      entries: WorkoutHandoffEntry[];
    };

function buildWorkoutEnvironmentSummary(draft: SessionDraft) {
  if (draft.environment !== "pool") {
    return getSessionEnvironmentLabel(draft.environment);
  }

  const poolLength =
    typeof draft.poolLengthM === "number" && Number.isFinite(draft.poolLengthM)
      ? ` (${formatPoolLengthLabel(draft.poolLengthM)})`
      : "";

  return `${getSessionEnvironmentLabel(draft.environment)}${poolLength}`;
}

function buildWorkoutHandoffGroups(steps: SessionDraftStep[]): WorkoutHandoffGroup[] {
  const groups: WorkoutHandoffGroup[] = [];

  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];

    if (!step) continue;

    if (!step.repeatGroupId) {
      groups.push({
        kind: "single",
        entries: [{ step, index }],
      });
      continue;
    }

    const entries: WorkoutHandoffEntry[] = [{ step, index }];
    let nextIndex = index + 1;

    while (nextIndex < steps.length && steps[nextIndex]?.repeatGroupId === step.repeatGroupId) {
      const nextStep = steps[nextIndex];
      if (!nextStep) break;
      entries.push({ step: nextStep, index: nextIndex });
      nextIndex += 1;
    }

    groups.push({
      kind: "repeat",
      repeatGroupId: step.repeatGroupId,
      repeatCount: step.repeatCount ?? null,
      entries,
    });
    index = nextIndex - 1;
  }

  return groups;
}

function buildWorkoutHandoffRepeatSummary(
  entries: WorkoutHandoffEntry[],
  repeatCount: number | null,
  basePaceSecondsPer100m: number
) {
  if (repeatCount === null) {
    return "repeat count not set";
  }

  const roundMetrics = buildWorkoutRepeatRoundMetrics(entries, basePaceSecondsPer100m);

  const parts = [`${repeatCount} rounds`];

  if (roundMetrics.roundDistanceM !== null || roundMetrics.roundDurationSeconds !== null) {
    const roundParts: string[] = [];

    if (roundMetrics.roundDistanceM !== null) {
      roundParts.push(`${roundMetrics.roundDistanceM}m`);
    }

    if (roundMetrics.roundDurationSeconds !== null) {
      roundParts.push(formatClockDurationLabelFromSeconds(roundMetrics.roundDurationSeconds));
    }

    parts.push(`${roundParts.join(" + ")} per round`);
  }

  return parts.join(" · ");
}

function buildWorkoutRepeatRoundMetrics(
  entries: WorkoutHandoffEntry[],
  basePaceSecondsPer100m: number
) {
  let roundDistanceM = 0;
  let roundDurationSeconds = 0;

  for (const { step } of entries) {
    if (step.durationMode === "distance" && step.distanceM) {
      roundDistanceM += step.distanceM;
    }

    if (
      (step.durationMode === "time" ||
        step.durationMode === "fixed_rest" ||
        step.durationMode === "send_off") &&
      step.timeMin
    ) {
      roundDurationSeconds += getClockTotalSeconds(step.timeMin);
    }

    if (step.durationMode === "css_send_off" && typeof step.cssSendOffOffsetSeconds === "number") {
      roundDurationSeconds += Math.max(1, basePaceSecondsPer100m + step.cssSendOffOffsetSeconds);
    }
  }

  return {
    roundDistanceM: roundDistanceM > 0 ? roundDistanceM : null,
    roundDurationSeconds: roundDurationSeconds > 0 ? roundDurationSeconds : null,
  };
}

function buildWorkoutGarminReadyExportStep(
  step: SessionDraftStep,
  index: number,
  basePaceSecondsPer100m: number,
  reviewIssueIds: string[]
): WorkoutGarminReadyExportStep {
  const targetMode = step.targetMode ?? "none";
  const structuredTargetLabel = buildSessionStepStructuredTargetLabel(step, basePaceSecondsPer100m);

  return {
    id: step.id,
    position: index + 1,
    name: step.name,
    mappingStatus: reviewIssueIds.length > 0 ? "review" : "ready",
    reviewIssueIds,
    category: {
      value: step.category,
      label: getSessionStepCategoryLabel(step.category),
    },
    stroke: {
      value: step.stroke,
      label: getSessionStepStrokeLabel(step.stroke),
    },
    drillType:
      step.drillType && step.drillType !== "none"
        ? {
            value: step.drillType,
            label: getSessionStepDrillTypeLabel(step.drillType),
          }
        : null,
    equipment:
      step.equipment && step.equipment !== "none"
        ? {
            value: step.equipment,
            label: getSessionStepEquipmentLabel(step.equipment),
          }
        : null,
    intensity: {
      value: step.intensity,
      label: getSessionEffortLabel(step.intensity),
    },
    duration: {
      mode: step.durationMode,
      label: getSessionStepDurationModeLabel(step.durationMode),
      distanceM: step.distanceM ?? null,
      timeMin: step.timeMin ?? null,
      cssSendOffOffsetSeconds: step.cssSendOffOffsetSeconds ?? null,
      summary: buildWorkoutHandoffDurationSummary(step, basePaceSecondsPer100m),
    },
    target: {
      mode: targetMode,
      label: getSessionStepTargetModeLabel(targetMode),
      effortTarget: step.effortTarget
        ? {
            value: step.effortTarget,
            label: getSessionEffortLabel(step.effortTarget),
          }
        : null,
      targetPaceSecondsPer100m: step.targetPaceSecondsPer100m ?? null,
      cssTargetOffsetSeconds: step.cssTargetOffsetSeconds ?? null,
      structuredLabel: structuredTargetLabel ?? null,
      draftSummary: step.targetSummary || null,
    },
    notes: step.notes || null,
    repeatGroupId: step.repeatGroupId ?? null,
    repeatCount: step.repeatCount ?? null,
  };
}

function buildWorkoutHandoffStepSummary(step: SessionDraftStep, basePaceSecondsPer100m: number) {
  const structuredTarget = buildSessionStepStructuredTargetLabel(step, basePaceSecondsPer100m);
  const contextParts = [getSessionStepStrokeLabel(step.stroke)];

  if (step.drillType && step.drillType !== "none") {
    const drillLabel = getSessionStepDrillTypeLabel(step.drillType);
    if (!(step.stroke === "drill" && drillLabel === "Drill")) {
      contextParts.push(drillLabel);
    }
  }

  if (step.equipment && step.equipment !== "none") {
    contextParts.push(getSessionStepEquipmentLabel(step.equipment));
  }

  return [
    buildWorkoutHandoffDurationSummary(step, basePaceSecondsPer100m),
    contextParts.join(" · "),
    structuredTarget ?? getSessionEffortLabel(step.intensity),
  ]
    .filter(Boolean)
    .join(" · ");
}

function buildWorkoutHandoffDurationSummary(
  step: SessionDraftStep,
  basePaceSecondsPer100m: number
) {
  switch (step.durationMode) {
    case "distance":
      return step.distanceM ? `${step.distanceM}m` : "Distance not set";
    case "time":
      return step.timeMin ? formatMinutesLabel(step.timeMin) : "Time not set";
    case "fixed_rest":
      return step.timeMin
        ? `Fixed rest ${formatClockDurationLabel(step.timeMin)}`
        : "Fixed rest not set";
    case "send_off":
      return step.timeMin
        ? `Send-off ${formatClockDurationLabel(step.timeMin)}`
        : "Send-off not set";
    case "css_send_off":
      if (typeof step.cssSendOffOffsetSeconds !== "number") {
        return "CSS send-off not set";
      }

      return `CSS ${step.cssSendOffOffsetSeconds > 0 ? "+" : ""}${step.cssSendOffOffsetSeconds}s send-off (${formatClockDurationLabelFromSeconds(
        basePaceSecondsPer100m + step.cssSendOffOffsetSeconds
      )})`;
    case "lap_button":
      return "Lap button press";
    default:
      return getSessionStepDurationModeLabel(step.durationMode);
  }
}

function formatMinutesLabel(value: number) {
  return `${Number.isInteger(value) ? value : value.toFixed(1).replace(/\.0$/, "")} min`;
}

function getClockTotalSeconds(valueMinutes: number | null | undefined) {
  if (!valueMinutes || valueMinutes <= 0) return 0;
  return Math.max(0, Math.round(valueMinutes * 60));
}

function formatClockDurationLabel(valueMinutes: number | null | undefined) {
  return formatClockDurationLabelFromSeconds(getClockTotalSeconds(valueMinutes));
}

function formatClockDurationLabelFromSeconds(totalSeconds: number) {
  const normalizedSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(normalizedSeconds / 60);
  const seconds = normalizedSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function normalizeFileNamePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeStep(
  input: SessionDraftStep,
  index: number
): { ok: true; value: SessionDraftStep } | { ok: false; error: string } {
  if (!SESSION_DRAFT_STEP_CATEGORIES.includes(input.category)) {
    return {
      ok: false,
      error: `Step ${index + 1} uses an unsupported category.`,
    };
  }

  if (!SESSION_GENERATOR_EFFORT_PRESETS.includes(input.intensity)) {
    return {
      ok: false,
      error: `Step ${index + 1} uses an unsupported intensity.`,
    };
  }

  if (!SESSION_DRAFT_STEP_STROKES.includes(input.stroke as SessionDraftStep["stroke"])) {
    return {
      ok: false,
      error: `Step ${index + 1} uses an unsupported stroke.`,
    };
  }

  if (!SESSION_DRAFT_STEP_DURATION_MODES.includes(input.durationMode)) {
    return {
      ok: false,
      error: `Step ${index + 1} uses an unsupported duration mode.`,
    };
  }

  const name = normalizeRequiredText(input.name, 120);
  if (!name) {
    return { ok: false, error: `Step ${index + 1} needs a step name before saving.` };
  }

  const targetSummary = normalizeText(input.targetSummary, 160);
  const notes = normalizeText(input.notes, 400);
  const id = normalizeRequiredText(input.id, 80) ?? `step-${index + 1}`;
  const repeatGroupId = normalizeNullableText(input.repeatGroupId, 80);
  const repeatCount = normalizeNullableInteger(input.repeatCount);
  const drillType = normalizeStepDrillType(input.drillType);
  const equipment = normalizeStepEquipment(input.equipment);
  const targetMode = normalizeTargetMode(input.targetMode);
  const effortTarget = targetMode === "effort" ? normalizeEffortPreset(input.effortTarget) : null;
  const targetPaceSecondsPer100m =
    targetMode === "target_pace" ? normalizeNullableInteger(input.targetPaceSecondsPer100m) : null;
  const cssTargetOffsetSeconds =
    targetMode === "css_target_pace" ? normalizeCssOffset(input.cssTargetOffsetSeconds) : null;
  const cssSendOffOffsetSeconds =
    input.durationMode === "css_send_off"
      ? normalizeCssOffset(input.cssSendOffOffsetSeconds)
      : null;

  if (Boolean(repeatGroupId) !== Boolean(repeatCount)) {
    return {
      ok: false,
      error: `Step ${index + 1} must include both repeat metadata fields or neither.`,
    };
  }

  if (
    repeatCount !== null &&
    (repeatCount < SESSION_DRAFT_REPEAT_MIN || repeatCount > SESSION_DRAFT_REPEAT_MAX)
  ) {
    return {
      ok: false,
      error: `Step ${index + 1} repeat count must stay between ${SESSION_DRAFT_REPEAT_MIN} and ${SESSION_DRAFT_REPEAT_MAX}.`,
    };
  }

  if (targetMode === "effort" && !effortTarget) {
    return {
      ok: false,
      error: `Step ${index + 1} needs an effort target before saving.`,
    };
  }

  if (targetMode === "target_pace" && targetPaceSecondsPer100m === null) {
    return {
      ok: false,
      error: `Step ${index + 1} needs a target pace before saving.`,
    };
  }

  if (targetMode === "css_target_pace" && cssTargetOffsetSeconds === null) {
    return {
      ok: false,
      error: `Step ${index + 1} needs a CSS pace offset before saving.`,
    };
  }

  if (input.durationMode === "css_send_off" && cssSendOffOffsetSeconds === null) {
    return {
      ok: false,
      error: `Step ${index + 1} needs a CSS send-off offset before saving.`,
    };
  }

  if (input.durationMode === "distance") {
    const distanceM = normalizeNullableInteger(input.distanceM);

    if (distanceM === null) {
      return { ok: false, error: `Step ${index + 1} needs a distance target before saving.` };
    }

    return {
      ok: true,
      value: {
        id,
        category: input.category,
        name,
        stroke: input.stroke,
        drillType,
        equipment,
        intensity: input.intensity,
        durationMode: "distance",
        distanceM,
        timeMin: null,
        targetMode,
        effortTarget,
        targetPaceSecondsPer100m,
        cssTargetOffsetSeconds,
        cssSendOffOffsetSeconds: null,
        targetSummary,
        notes,
        repeatGroupId,
        repeatCount,
      },
    };
  }

  if (input.durationMode === "lap_button") {
    return {
      ok: true,
      value: {
        id,
        category: input.category,
        name,
        stroke: input.stroke,
        drillType,
        equipment,
        intensity: input.intensity,
        durationMode: "lap_button",
        distanceM: null,
        timeMin: null,
        targetMode,
        effortTarget,
        targetPaceSecondsPer100m,
        cssTargetOffsetSeconds,
        cssSendOffOffsetSeconds: null,
        targetSummary,
        notes,
        repeatGroupId,
        repeatCount,
      },
    };
  }

  if (input.durationMode === "css_send_off") {
    return {
      ok: true,
      value: {
        id,
        category: input.category,
        name,
        stroke: input.stroke,
        drillType,
        equipment,
        intensity: input.intensity,
        durationMode: "css_send_off",
        distanceM: null,
        timeMin: null,
        targetMode,
        effortTarget,
        targetPaceSecondsPer100m,
        cssTargetOffsetSeconds,
        cssSendOffOffsetSeconds,
        targetSummary,
        notes,
        repeatGroupId,
        repeatCount,
      },
    };
  }

  const timeMin = normalizePositiveNumber(input.timeMin);
  if (timeMin === null) {
    return { ok: false, error: `Step ${index + 1} needs a time target before saving.` };
  }

  return {
    ok: true,
    value: {
      id,
      category: input.category,
      name,
      stroke: input.stroke,
      drillType,
      equipment,
      intensity: input.intensity,
      durationMode:
        input.durationMode === "fixed_rest"
          ? "fixed_rest"
          : input.durationMode === "send_off"
            ? "send_off"
            : "time",
      distanceM: null,
      timeMin,
      targetMode,
      effortTarget,
      targetPaceSecondsPer100m,
      cssTargetOffsetSeconds,
      cssSendOffOffsetSeconds: null,
      targetSummary,
      notes,
      repeatGroupId,
      repeatCount,
    },
  };
}

function normalizePoolLength(value: SessionDraft["poolLengthM"]) {
  return normalizeSessionDraftPoolLength(value);
}

function normalizeRequiredText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > maxLength) return null;
  return normalized;
}

function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeNullableText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (normalized.length === 0) return null;
  return normalized.slice(0, maxLength);
}

function normalizeNullableInteger(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const normalized = Math.round(value);
  return normalized > 0 ? normalized : null;
}

function normalizePositiveNumber(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 10000) / 10000;
}

function normalizeEffortPreset(value: unknown) {
  return SESSION_GENERATOR_EFFORT_PRESETS.includes(value as SessionDraft["effort"])
    ? (value as SessionDraft["effort"])
    : null;
}

function normalizeTargetMode(value: unknown) {
  return SESSION_DRAFT_STEP_TARGET_MODES.includes(
    value as (typeof SESSION_DRAFT_STEP_TARGET_MODES)[number]
  )
    ? (value as (typeof SESSION_DRAFT_STEP_TARGET_MODES)[number])
    : "none";
}

function normalizeStepDrillType(value: unknown) {
  return SESSION_DRAFT_STEP_DRILL_TYPES.includes(
    value as (typeof SESSION_DRAFT_STEP_DRILL_TYPES)[number]
  )
    ? (value as (typeof SESSION_DRAFT_STEP_DRILL_TYPES)[number])
    : "none";
}

function normalizeStepEquipment(value: unknown) {
  return SESSION_DRAFT_STEP_EQUIPMENT.includes(
    value as (typeof SESSION_DRAFT_STEP_EQUIPMENT)[number]
  )
    ? (value as (typeof SESSION_DRAFT_STEP_EQUIPMENT)[number])
    : "none";
}

function mapDraftStepStrokeToAllowedStroke(value: SessionDraftStep["stroke"]) {
  return SESSION_GENERATOR_STROKES.includes(value as SessionGeneratorStroke)
    ? (value as SessionGeneratorStroke)
    : null;
}

function mapDraftStepEquipmentToAllowlist(value: SessionDraftStep["equipment"]) {
  return SESSION_GENERATOR_EQUIPMENT.includes(value as (typeof SESSION_GENERATOR_EQUIPMENT)[number])
    ? (value as (typeof SESSION_GENERATOR_EQUIPMENT)[number])
    : null;
}

function normalizeCssOffset(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const normalized = Math.round(value);
  return SESSION_DRAFT_STEP_CSS_TARGET_OFFSETS.includes(
    normalized as (typeof SESSION_DRAFT_STEP_CSS_TARGET_OFFSETS)[number]
  )
    ? normalized
    : null;
}

function normalizeIsoDate(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (normalized.length === 0) return null;
  return Number.isNaN(Date.parse(normalized)) ? null : new Date(normalized).toISOString();
}

function normalizeStringList(value: unknown, maxLength: number, maxItems: number) {
  if (!Array.isArray(value)) return [];

  const normalized = value
    .map((entry) => normalizeRequiredText(entry, maxLength))
    .filter((entry): entry is string => Boolean(entry));

  return Array.from(new Set(normalized)).slice(0, maxItems);
}

function uniqueEnumList<T extends string>(value: unknown, allowed: readonly T[]) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((entry): entry is T => allowed.includes(entry as T))));
}
