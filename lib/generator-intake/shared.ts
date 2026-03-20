import type {
  AthleteProfileSnapshot,
  AthleteProfileView,
  PersonalRecordView,
  TrainingMetricView,
  TrainingPreferencesView,
} from "@/lib/athlete-profile/server";
import { GOAL_ACTIVE_STATUS_VALUES, type GoalView } from "@/lib/goals/mvp";
import type { TrainingContextSnapshot, TrainingFocusView } from "@/lib/training-context/server";

export const GENERATOR_INTAKE_BLOCK_KEYS = [
  "profile",
  "css",
  "preferences",
  "personal_records",
  "goals",
  "focus",
] as const;

export const GENERATOR_TARGET_TYPES = ["session", "program"] as const;

export type GeneratorIntakeBlockKey = (typeof GENERATOR_INTAKE_BLOCK_KEYS)[number];
export type GeneratorTargetType = (typeof GENERATOR_TARGET_TYPES)[number];

export type GeneratorIntakeBlockState = "available" | "empty" | "syncing" | "error";

export type GeneratorIntakeBlockSummary = {
  key: GeneratorIntakeBlockKey;
  label: string;
  description: string;
  state: GeneratorIntakeBlockState;
  available: boolean;
  includedByDefault: boolean;
  summary: string;
  missingReason: string | null;
  sourceIds: string[];
  lastUpdatedAt: string | null;
  manageHref: string;
  manageLabel: string;
};

export type GeneratorIntakeSelection = Record<GeneratorIntakeBlockKey, boolean>;

export type GeneratorIntakeOverrides = {
  targetType: GeneratorTargetType;
  desiredSessionCount: string;
  desiredSessionMinutes: string;
  focusText: string;
  constraintText: string;
};

export type GeneratorIntakeSnapshot = {
  loadedAt: string;
  sourceFingerprint: string;
  loadError: string | null;
  notesIncluded: false;
  profileSchemaReady: boolean;
  metricsSchemaReady: boolean;
  preferencesSchemaReady: boolean;
  personalRecordsSchemaReady: boolean;
  trainingContextSchemaReady: boolean;
  goalsLoadError: string | null;
  profile: AthleteProfileView | null;
  cssMetric: TrainingMetricView | null;
  preferences: TrainingPreferencesView | null;
  personalRecords: PersonalRecordView[];
  openGoals: GoalView[];
  activeFocus: TrainingFocusView | null;
  blocks: Record<GeneratorIntakeBlockKey, GeneratorIntakeBlockSummary>;
};

export type GeneratorIntakeHandoffPayload = {
  version: 1;
  createdAt: string;
  sourceFingerprint: string;
  notesIncluded: false;
  includedBlocks: GeneratorIntakeBlockKey[];
  omittedBlocks: GeneratorIntakeBlockKey[];
  source: {
    profile: AthleteProfileView | null;
    cssMetric: TrainingMetricView | null;
    preferences: TrainingPreferencesView | null;
    personalRecords: PersonalRecordView[];
    openGoals: GoalView[];
    activeFocus: TrainingFocusView | null;
  };
  overrides: {
    targetType: GeneratorTargetType;
    desiredSessionCount: number | null;
    desiredSessionMinutes: number | null;
    focusText: string | null;
    constraintText: string | null;
  };
  effectiveDefaults: {
    targetType: GeneratorTargetType;
    sessionCount: number | null;
    sessionMinutes: number | null;
    focusText: string | null;
  };
};

const BLOCK_META: Record<
  GeneratorIntakeBlockKey,
  Pick<GeneratorIntakeBlockSummary, "label" | "description" | "manageHref" | "manageLabel">
> = {
  profile: {
    label: "Athlete profile",
    description: "Stable swimmer context that should not change from one run override to another.",
    manageHref: "/my-library/profile",
    manageLabel: "Edit athlete profile",
  },
  css: {
    label: "CSS pace",
    description: "Trusted current CSS from My Library for pace-aware generation later.",
    manageHref: "/my-library/profile",
    manageLabel: "Edit CSS",
  },
  preferences: {
    label: "Training preferences",
    description: "Pool length and practical scheduling defaults from My Library.",
    manageHref: "/my-library/profile",
    manageLabel: "Edit preferences",
  },
  personal_records: {
    label: "Personal records",
    description: "Saved benchmark swims that can inform later generator difficulty and pacing.",
    manageHref: "/my-library/profile",
    manageLabel: "Edit personal records",
  },
  goals: {
    label: "Open goals",
    description: "Longer-horizon targets that can shape what later generator work aims toward.",
    manageHref: "/my-library/goals",
    manageLabel: "Edit goals",
  },
  focus: {
    label: "Active focus",
    description: "Your current swim focus, kept separate from Notes in v1.",
    manageHref: "/my-library/training",
    manageLabel: "Edit focus",
  },
};

export function getDefaultGeneratorIntakeOverrides(): GeneratorIntakeOverrides {
  return {
    targetType: "session",
    desiredSessionCount: "",
    desiredSessionMinutes: "",
    focusText: "",
    constraintText: "",
  };
}

export function normalizeGeneratorIntakeOverrides(
  overrides: Partial<GeneratorIntakeOverrides> | null | undefined
): GeneratorIntakeOverrides {
  const defaults = getDefaultGeneratorIntakeOverrides();
  if (!overrides) return defaults;

  const targetType =
    overrides.targetType === "program" || overrides.targetType === "session"
      ? overrides.targetType
      : defaults.targetType;

  return {
    targetType,
    desiredSessionCount: normalizeIntegerDraft(overrides.desiredSessionCount),
    desiredSessionMinutes: normalizeIntegerDraft(overrides.desiredSessionMinutes),
    focusText: normalizeFreeText(overrides.focusText, 120),
    constraintText: normalizeFreeText(overrides.constraintText, 280),
  };
}

export function getDefaultGeneratorIntakeSelection(
  snapshot: GeneratorIntakeSnapshot
): GeneratorIntakeSelection {
  return normalizeGeneratorIntakeSelection(snapshot, null);
}

export function normalizeGeneratorIntakeSelection(
  snapshot: GeneratorIntakeSnapshot,
  selection: Partial<GeneratorIntakeSelection> | null | undefined
): GeneratorIntakeSelection {
  return {
    profile: snapshot.blocks.profile.available && Boolean(selection?.profile ?? true),
    css: snapshot.blocks.css.available && Boolean(selection?.css ?? true),
    preferences: snapshot.blocks.preferences.available && Boolean(selection?.preferences ?? true),
    personal_records:
      snapshot.blocks.personal_records.available && Boolean(selection?.personal_records ?? true),
    goals: snapshot.blocks.goals.available && Boolean(selection?.goals ?? true),
    focus: snapshot.blocks.focus.available && Boolean(selection?.focus ?? true),
  };
}

export function buildGeneratorIntakeSnapshot(input: {
  athleteProfileSnapshot: AthleteProfileSnapshot;
  trainingContextSnapshot: TrainingContextSnapshot;
  openGoals: GoalView[];
  goalsLoadError: string | null;
  loadedAt?: string;
}): GeneratorIntakeSnapshot {
  const loadedAt = input.loadedAt ?? new Date().toISOString();
  const blocks = buildGeneratorIntakeBlocks({
    athleteProfileSnapshot: input.athleteProfileSnapshot,
    trainingContextSnapshot: input.trainingContextSnapshot,
    openGoals: input.openGoals,
    goalsLoadError: input.goalsLoadError,
  });

  const loadErrors = [
    input.athleteProfileSnapshot.loadError,
    input.athleteProfileSnapshot.metricsLoadError,
    input.athleteProfileSnapshot.preferencesLoadError,
    input.athleteProfileSnapshot.personalRecordsLoadError,
    input.trainingContextSnapshot.loadError,
    input.goalsLoadError,
  ].filter((value): value is string => Boolean(value));

  return {
    loadedAt,
    sourceFingerprint: buildSourceFingerprint({
      profile: input.athleteProfileSnapshot.profile,
      cssMetric: input.athleteProfileSnapshot.cssMetric,
      preferences: input.athleteProfileSnapshot.preferences,
      personalRecords: input.athleteProfileSnapshot.personalRecords,
      openGoals: input.openGoals,
      activeFocus: input.trainingContextSnapshot.activeFocus,
    }),
    loadError:
      loadErrors.length > 0
        ? "Some generator context could not be loaded. Review missing sections below or refresh."
        : null,
    notesIncluded: false,
    profileSchemaReady: input.athleteProfileSnapshot.profileSchemaReady,
    metricsSchemaReady: input.athleteProfileSnapshot.metricsSchemaReady,
    preferencesSchemaReady: input.athleteProfileSnapshot.preferencesSchemaReady,
    personalRecordsSchemaReady: input.athleteProfileSnapshot.personalRecordsSchemaReady,
    trainingContextSchemaReady: input.trainingContextSnapshot.schemaReady,
    goalsLoadError: input.goalsLoadError,
    profile: input.athleteProfileSnapshot.profile,
    cssMetric: input.athleteProfileSnapshot.cssMetric,
    preferences: input.athleteProfileSnapshot.preferences,
    personalRecords: input.athleteProfileSnapshot.personalRecords,
    openGoals: input.openGoals,
    activeFocus: input.trainingContextSnapshot.activeFocus,
    blocks,
  };
}

export function buildGeneratorHandoffPayload(
  snapshot: GeneratorIntakeSnapshot,
  selection: Partial<GeneratorIntakeSelection> | null | undefined,
  overrides: Partial<GeneratorIntakeOverrides> | null | undefined,
  options?: {
    createdAt?: string;
  }
): GeneratorIntakeHandoffPayload {
  const normalizedSelection = normalizeGeneratorIntakeSelection(snapshot, selection);
  const normalizedOverrides = normalizeGeneratorIntakeOverrides(overrides);
  const includedBlocks = GENERATOR_INTAKE_BLOCK_KEYS.filter((key) => normalizedSelection[key]);
  const omittedBlocks = GENERATOR_INTAKE_BLOCK_KEYS.filter((key) => !normalizedSelection[key]);
  const desiredSessionCount = parsePositiveInteger(normalizedOverrides.desiredSessionCount);
  const desiredSessionMinutes = parsePositiveInteger(normalizedOverrides.desiredSessionMinutes);
  const focusText = normalizeNullableText(normalizedOverrides.focusText);
  const constraintText = normalizeNullableText(normalizedOverrides.constraintText);

  const source = {
    profile: normalizedSelection.profile ? snapshot.profile : null,
    cssMetric: normalizedSelection.css ? snapshot.cssMetric : null,
    preferences: normalizedSelection.preferences ? snapshot.preferences : null,
    personalRecords: normalizedSelection.personal_records ? snapshot.personalRecords : [],
    openGoals: normalizedSelection.goals ? snapshot.openGoals : [],
    activeFocus: normalizedSelection.focus ? snapshot.activeFocus : null,
  };

  return {
    version: 1,
    createdAt: options?.createdAt ?? new Date().toISOString(),
    sourceFingerprint: snapshot.sourceFingerprint,
    notesIncluded: false,
    includedBlocks,
    omittedBlocks,
    source,
    overrides: {
      targetType: normalizedOverrides.targetType,
      desiredSessionCount,
      desiredSessionMinutes,
      focusText,
      constraintText,
    },
    effectiveDefaults: {
      targetType: normalizedOverrides.targetType,
      sessionCount:
        desiredSessionCount ??
        (normalizedSelection.preferences
          ? (snapshot.preferences?.preferredWeeklySessionCount ?? null)
          : null),
      sessionMinutes:
        desiredSessionMinutes ??
        (normalizedSelection.preferences
          ? (snapshot.preferences?.preferredSessionMinutes ?? null)
          : null),
      focusText:
        focusText ?? (normalizedSelection.focus ? (snapshot.activeFocus?.title ?? null) : null),
    },
  };
}

const ACTIVE_GOAL_STATUS_SET = new Set<string>(GOAL_ACTIVE_STATUS_VALUES);

export function isGeneratorActiveGoalStatus(status: string) {
  return ACTIVE_GOAL_STATUS_SET.has(status);
}

function buildGeneratorIntakeBlocks(input: {
  athleteProfileSnapshot: AthleteProfileSnapshot;
  trainingContextSnapshot: TrainingContextSnapshot;
  openGoals: GoalView[];
  goalsLoadError: string | null;
}): Record<GeneratorIntakeBlockKey, GeneratorIntakeBlockSummary> {
  const { athleteProfileSnapshot, trainingContextSnapshot, openGoals, goalsLoadError } = input;

  return {
    profile: buildBlockSummary("profile", {
      available: Boolean(athleteProfileSnapshot.profile),
      summary: athleteProfileSnapshot.profile
        ? [
            athleteProfileSnapshot.profile.primaryName ?? "Private swimmer",
            athleteProfileSnapshot.profile.ageBandLabel,
          ]
            .filter(Boolean)
            .join(" · ")
        : "No athlete profile saved yet.",
      missingReason: resolveMissingReason({
        available: Boolean(athleteProfileSnapshot.profile),
        schemaReady: athleteProfileSnapshot.profileSchemaReady,
        loadError: athleteProfileSnapshot.loadError,
        emptyReason: "Add a saved athlete profile before you want it to prefill later generation.",
      }),
      sourceIds: athleteProfileSnapshot.profile ? [athleteProfileSnapshot.profile.id] : [],
      lastUpdatedAt: athleteProfileSnapshot.profile?.updatedAt ?? null,
    }),
    css: buildBlockSummary("css", {
      available: Boolean(athleteProfileSnapshot.cssMetric),
      summary: athleteProfileSnapshot.cssMetric
        ? `CSS ${athleteProfileSnapshot.cssMetric.paceLabel}/100m`
        : "No CSS pace saved yet.",
      missingReason: resolveMissingReason({
        available: Boolean(athleteProfileSnapshot.cssMetric),
        schemaReady: athleteProfileSnapshot.metricsSchemaReady,
        loadError: athleteProfileSnapshot.metricsLoadError,
        emptyReason: "Save a current CSS pace if you want later generator work to use it.",
      }),
      sourceIds: athleteProfileSnapshot.cssMetric ? [athleteProfileSnapshot.cssMetric.id] : [],
      lastUpdatedAt: athleteProfileSnapshot.cssMetric?.updatedAt ?? null,
    }),
    preferences: buildBlockSummary("preferences", {
      available: Boolean(athleteProfileSnapshot.preferences),
      summary: athleteProfileSnapshot.preferences
        ? [
            athleteProfileSnapshot.preferences.poolLengthLabel,
            athleteProfileSnapshot.preferences.preferredWeeklySessionCount
              ? `${athleteProfileSnapshot.preferences.preferredWeeklySessionCount} sessions/week`
              : null,
            athleteProfileSnapshot.preferences.preferredSessionMinutesLabel,
          ]
            .filter(Boolean)
            .join(" · ")
        : "No training preferences saved yet.",
      missingReason: resolveMissingReason({
        available: Boolean(athleteProfileSnapshot.preferences),
        schemaReady: athleteProfileSnapshot.preferencesSchemaReady,
        loadError: athleteProfileSnapshot.preferencesLoadError,
        emptyReason:
          "Save pool length or weekly preferences if you want reusable generator defaults later.",
      }),
      sourceIds: athleteProfileSnapshot.preferences ? [athleteProfileSnapshot.preferences.id] : [],
      lastUpdatedAt: athleteProfileSnapshot.preferences?.updatedAt ?? null,
    }),
    personal_records: buildBlockSummary("personal_records", {
      available: athleteProfileSnapshot.personalRecords.length > 0,
      summary:
        athleteProfileSnapshot.personalRecords.length > 0
          ? `${athleteProfileSnapshot.personalRecords.length} saved record${
              athleteProfileSnapshot.personalRecords.length === 1 ? "" : "s"
            }, latest benchmark ${athleteProfileSnapshot.personalRecords[0]?.eventLabel ?? "available"}.`
          : "No personal records saved yet.",
      missingReason: resolveMissingReason({
        available: athleteProfileSnapshot.personalRecords.length > 0,
        schemaReady: athleteProfileSnapshot.personalRecordsSchemaReady,
        loadError: athleteProfileSnapshot.personalRecordsLoadError,
        emptyReason: "Add personal records if later generation should see benchmark events.",
      }),
      sourceIds: athleteProfileSnapshot.personalRecords.map((record) => record.id),
      lastUpdatedAt: athleteProfileSnapshot.personalRecords[0]?.updatedAt ?? null,
    }),
    goals: buildBlockSummary("goals", {
      available: openGoals.length > 0,
      summary:
        openGoals.length > 0
          ? `${openGoals.length} open goal${openGoals.length === 1 ? "" : "s"} ready for intake.`
          : "No open goals ready for intake.",
      missingReason: resolveMissingReason({
        available: openGoals.length > 0,
        schemaReady: true,
        loadError: goalsLoadError,
        emptyReason: "Open goals are optional. Add one if you want generation tied to a target.",
      }),
      sourceIds: openGoals.map((goal) => goal.id),
      lastUpdatedAt: null,
    }),
    focus: buildBlockSummary("focus", {
      available: Boolean(trainingContextSnapshot.activeFocus),
      summary: trainingContextSnapshot.activeFocus
        ? [
            trainingContextSnapshot.activeFocus.title,
            trainingContextSnapshot.activeFocus.goalTitle
              ? `linked to ${trainingContextSnapshot.activeFocus.goalTitle}`
              : null,
          ]
            .filter(Boolean)
            .join(" · ")
        : "No active focus set right now.",
      missingReason: resolveMissingReason({
        available: Boolean(trainingContextSnapshot.activeFocus),
        schemaReady: trainingContextSnapshot.schemaReady,
        loadError: trainingContextSnapshot.loadError,
        emptyReason: "Set one active focus if you want a current technical priority in intake.",
      }),
      sourceIds: trainingContextSnapshot.activeFocus
        ? [trainingContextSnapshot.activeFocus.id]
        : [],
      lastUpdatedAt: trainingContextSnapshot.activeFocus?.updatedAt ?? null,
    }),
  };
}

function buildBlockSummary(
  key: GeneratorIntakeBlockKey,
  input: {
    available: boolean;
    summary: string;
    missingReason: string | null;
    sourceIds: string[];
    lastUpdatedAt: string | null;
  }
): GeneratorIntakeBlockSummary {
  const state: GeneratorIntakeBlockState = input.available
    ? "available"
    : input.missingReason?.includes("syncing in this environment")
      ? "syncing"
      : input.missingReason?.includes("Could not load")
        ? "error"
        : "empty";

  return {
    key,
    label: BLOCK_META[key].label,
    description: BLOCK_META[key].description,
    state,
    available: input.available,
    includedByDefault: input.available,
    summary: input.summary,
    missingReason: input.missingReason,
    sourceIds: input.sourceIds,
    lastUpdatedAt: input.lastUpdatedAt,
    manageHref: BLOCK_META[key].manageHref,
    manageLabel: BLOCK_META[key].manageLabel,
  };
}

function resolveMissingReason(input: {
  available: boolean;
  schemaReady: boolean;
  loadError: string | null;
  emptyReason: string;
}): string | null {
  if (input.available) return null;
  if (!input.schemaReady) return "This source is still syncing in this environment.";
  if (input.loadError) return input.loadError;
  return input.emptyReason;
}

function buildSourceFingerprint(value: Record<string, unknown>): string {
  const serialized = JSON.stringify(value);
  let hash = 5381;

  for (let index = 0; index < serialized.length; index += 1) {
    hash = (hash * 33) ^ serialized.charCodeAt(index);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function normalizeIntegerDraft(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[^\d]/g, "").slice(0, 2);
}

function normalizeFreeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeNullableText(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function parsePositiveInteger(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}
