import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildAthleteProfilePrimaryName,
  getAthleteAgeBandLabel,
  type AthleteAgeBand,
  type AthleteProfileRow,
} from "@/lib/athlete-profile/mvp";
import {
  formatCssSecondsPer100m,
  getPoolLengthLabel,
  getSessionDurationLabel,
  getWeekdayLabel,
  type TrainingMetricKey,
  type TrainingMetricRow,
  type TrainingPoolLength,
  type TrainingPreferencesRow,
  type TrainingSessionDuration,
  type TrainingWeekday,
} from "@/lib/athlete-profile/training-setup";
import {
  isAthleteProfileSchemaMissing,
  isTrainingMetricSchemaMissing,
  isTrainingPreferencesSchemaMissing,
} from "@/lib/athlete-profile/schema";
import type { Database } from "@/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

export const ATHLETE_PROFILE_SELECT = `
  id,
  user_id,
  display_name,
  first_name,
  last_name,
  age_band,
  created_at,
  updated_at
`;

export const TRAINING_METRIC_SELECT = `
  id,
  user_id,
  metric_key,
  unit,
  value_seconds,
  recorded_on,
  source_note,
  created_at,
  updated_at
`;

export const TRAINING_PREFERENCES_SELECT = `
  id,
  user_id,
  pool_length_m,
  available_days,
  preferred_weekly_session_count,
  preferred_session_minutes,
  created_at,
  updated_at
`;

export type AthleteProfileView = {
  id: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  primaryName: string | null;
  ageBand: AthleteAgeBand | null;
  ageBandLabel: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TrainingMetricView = {
  id: string;
  metricKey: TrainingMetricKey;
  unit: "seconds_per_100m";
  valueSeconds: number;
  paceLabel: string;
  recordedOn: string | null;
  sourceNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TrainingPreferencesView = {
  id: string;
  poolLengthM: TrainingPoolLength | null;
  poolLengthLabel: string | null;
  availableDays: TrainingWeekday[];
  availableDayLabels: string[];
  preferredWeeklySessionCount: number | null;
  preferredSessionMinutes: TrainingSessionDuration | null;
  preferredSessionMinutesLabel: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AthleteProfileSnapshot = {
  profileSchemaReady: boolean;
  metricsSchemaReady: boolean;
  preferencesSchemaReady: boolean;
  loadError: string | null;
  metricsLoadError: string | null;
  preferencesLoadError: string | null;
  profile: AthleteProfileView | null;
  cssMetric: TrainingMetricView | null;
  preferences: TrainingPreferencesView | null;
};

export function buildAthleteProfileView(row: AthleteProfileRow): AthleteProfileView {
  const primaryName = buildAthleteProfilePrimaryName({
    displayName: row.display_name,
    firstName: row.first_name,
    lastName: row.last_name,
  });

  return {
    id: row.id,
    displayName: row.display_name,
    firstName: row.first_name,
    lastName: row.last_name,
    primaryName,
    ageBand: row.age_band,
    ageBandLabel: getAthleteAgeBandLabel(row.age_band),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function buildTrainingMetricView(row: TrainingMetricRow): TrainingMetricView {
  return {
    id: row.id,
    metricKey: row.metric_key as TrainingMetricKey,
    unit: "seconds_per_100m",
    valueSeconds: row.value_seconds,
    paceLabel: formatCssSecondsPer100m(row.value_seconds) ?? "0:00",
    recordedOn: row.recorded_on,
    sourceNote: row.source_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function buildTrainingPreferencesView(row: TrainingPreferencesRow): TrainingPreferencesView {
  const availableDays = (row.available_days ?? []) as TrainingWeekday[];
  return {
    id: row.id,
    poolLengthM: (row.pool_length_m as TrainingPoolLength | null) ?? null,
    poolLengthLabel: getPoolLengthLabel((row.pool_length_m as TrainingPoolLength | null) ?? null),
    availableDays,
    availableDayLabels: availableDays.map((value) => getWeekdayLabel(value)),
    preferredWeeklySessionCount: row.preferred_weekly_session_count,
    preferredSessionMinutes:
      (row.preferred_session_minutes as TrainingSessionDuration | null) ?? null,
    preferredSessionMinutesLabel: getSessionDurationLabel(
      (row.preferred_session_minutes as TrainingSessionDuration | null) ?? null
    ),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function loadAthleteProfileSnapshot(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<AthleteProfileSnapshot> {
  const [profileResult, cssMetricResult, preferencesResult] = await Promise.all([
    supabase
      .from("athlete_profiles")
      .select(ATHLETE_PROFILE_SELECT)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("training_metrics")
      .select(TRAINING_METRIC_SELECT)
      .eq("user_id", userId)
      .eq("metric_key", "css")
      .maybeSingle(),
    supabase
      .from("training_preferences")
      .select(TRAINING_PREFERENCES_SELECT)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const profileSchemaReady = !isAthleteProfileSchemaMissing(profileResult.error);
  const metricsSchemaReady = !isTrainingMetricSchemaMissing(cssMetricResult.error);
  const preferencesSchemaReady = !isTrainingPreferencesSchemaMissing(preferencesResult.error);

  const loadError =
    profileResult.error && profileSchemaReady ? "Could not load athlete profile right now." : null;
  const metricsLoadError =
    cssMetricResult.error && metricsSchemaReady
      ? "Could not load training metrics right now."
      : null;
  const preferencesLoadError =
    preferencesResult.error && preferencesSchemaReady
      ? "Could not load training preferences right now."
      : null;

  if (loadError) {
    console.error("[AthleteProfile] Failed loading profile snapshot", profileResult.error);
  }

  if (metricsLoadError) {
    console.error(
      "[AthleteProfile] Failed loading training metrics snapshot",
      cssMetricResult.error
    );
  }

  if (preferencesLoadError) {
    console.error(
      "[AthleteProfile] Failed loading training preferences snapshot",
      preferencesResult.error
    );
  }

  return {
    profileSchemaReady,
    metricsSchemaReady,
    preferencesSchemaReady,
    loadError,
    metricsLoadError,
    preferencesLoadError,
    profile: profileResult.data ? buildAthleteProfileView(profileResult.data) : null,
    cssMetric: cssMetricResult.data ? buildTrainingMetricView(cssMetricResult.data) : null,
    preferences: preferencesResult.data
      ? buildTrainingPreferencesView(preferencesResult.data)
      : null,
  };
}
