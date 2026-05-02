import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildAthleteProfilePrimaryName,
  getAthleteAgeBandLabel,
  type AthleteAgeBand,
  type AthleteProfileRow,
} from "@/lib/athlete-profile/mvp";
import {
  formatSwimCapabilityDistance,
  getSwimCapabilityStrokeLabel,
  type SwimCapabilityLimitKind,
  type SwimCapabilityLimitRow,
  type SwimCapabilityStroke,
} from "@/lib/athlete-profile/capabilities";
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
  buildPersonalRecordEventLabel,
  comparePersonalRecordRows,
  formatPersonalRecordTime,
  getPersonalRecordCourseLabel,
  getPersonalRecordStrokeLabel,
  type PersonalRecordCourse,
  type PersonalRecordRow,
  type PersonalRecordStroke,
} from "@/lib/athlete-profile/personal-records";
import {
  isAthleteProfileSchemaMissing,
  isPersonalRecordsSchemaMissing,
  isSwimCapabilityLimitsSchemaMissing,
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

export const PERSONAL_RECORD_SELECT = `
  id,
  user_id,
  distance_m,
  stroke,
  course,
  time_centiseconds,
  recorded_on,
  source_note,
  created_at,
  updated_at
`;

export const SWIM_CAPABILITY_LIMIT_SELECT = `
  id,
  user_id,
  limit_kind,
  stroke,
  max_repeat_distance_m,
  max_total_distance_m,
  target_total_distance_m,
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

export type PersonalRecordView = {
  id: string;
  distanceM: number;
  stroke: PersonalRecordStroke;
  strokeLabel: string;
  course: PersonalRecordCourse;
  courseLabel: string;
  eventLabel: string;
  timeCentiseconds: number;
  timeLabel: string;
  recordedOn: string | null;
  sourceNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SwimCapabilityLimitView = {
  id: string;
  kind: SwimCapabilityLimitKind;
  stroke: SwimCapabilityStroke | null;
  strokeLabel: string | null;
  maxRepeatDistanceM: number | null;
  maxRepeatDistanceLabel: string | null;
  maxTotalDistanceM: number | null;
  maxTotalDistanceLabel: string | null;
  targetTotalDistanceM: number | null;
  targetTotalDistanceLabel: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AthleteProfileSnapshot = {
  profileSchemaReady: boolean;
  metricsSchemaReady: boolean;
  preferencesSchemaReady: boolean;
  personalRecordsSchemaReady: boolean;
  swimCapabilityLimitsSchemaReady: boolean;
  loadError: string | null;
  metricsLoadError: string | null;
  preferencesLoadError: string | null;
  personalRecordsLoadError: string | null;
  swimCapabilityLimitsLoadError: string | null;
  profile: AthleteProfileView | null;
  cssMetric: TrainingMetricView | null;
  preferences: TrainingPreferencesView | null;
  personalRecords: PersonalRecordView[];
  swimCapabilityLimits: SwimCapabilityLimitView[];
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

export function buildPersonalRecordView(row: PersonalRecordRow): PersonalRecordView {
  const stroke = row.stroke as PersonalRecordStroke;
  const course = row.course as PersonalRecordCourse;

  return {
    id: row.id,
    distanceM: row.distance_m,
    stroke,
    strokeLabel: getPersonalRecordStrokeLabel(stroke) ?? row.stroke,
    course,
    courseLabel: getPersonalRecordCourseLabel(course) ?? row.course,
    eventLabel: buildPersonalRecordEventLabel({
      distanceM: row.distance_m,
      stroke,
      course,
    }),
    timeCentiseconds: row.time_centiseconds,
    timeLabel: formatPersonalRecordTime(row.time_centiseconds) ?? "0.00",
    recordedOn: row.recorded_on,
    sourceNote: row.source_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function buildSwimCapabilityLimitView(row: SwimCapabilityLimitRow): SwimCapabilityLimitView {
  const kind = row.limit_kind as SwimCapabilityLimitKind;
  const stroke = (row.stroke as SwimCapabilityStroke | null) ?? null;
  const maxRepeatDistanceM =
    row.max_repeat_distance_m === null ? null : Number(row.max_repeat_distance_m);
  const maxTotalDistanceM =
    row.max_total_distance_m === null ? null : Number(row.max_total_distance_m);
  const targetTotalDistanceM =
    row.target_total_distance_m === null ? null : Number(row.target_total_distance_m);

  return {
    id: row.id,
    kind,
    stroke,
    strokeLabel: stroke ? getSwimCapabilityStrokeLabel(stroke) : null,
    maxRepeatDistanceM,
    maxRepeatDistanceLabel: formatSwimCapabilityDistance(maxRepeatDistanceM),
    maxTotalDistanceM,
    maxTotalDistanceLabel: formatSwimCapabilityDistance(maxTotalDistanceM),
    targetTotalDistanceM,
    targetTotalDistanceLabel: formatSwimCapabilityDistance(targetTotalDistanceM),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function loadAthleteProfileSnapshot(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<AthleteProfileSnapshot> {
  const [
    profileResult,
    cssMetricResult,
    preferencesResult,
    personalRecordsResult,
    swimCapabilityLimitsResult,
  ] = await Promise.all([
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
    supabase.from("personal_records").select(PERSONAL_RECORD_SELECT).eq("user_id", userId),
    supabase
      .from("swim_capability_limits")
      .select(SWIM_CAPABILITY_LIMIT_SELECT)
      .eq("user_id", userId),
  ]);

  const profileSchemaReady = !isAthleteProfileSchemaMissing(profileResult.error);
  const metricsSchemaReady = !isTrainingMetricSchemaMissing(cssMetricResult.error);
  const preferencesSchemaReady = !isTrainingPreferencesSchemaMissing(preferencesResult.error);
  const personalRecordsSchemaReady = !isPersonalRecordsSchemaMissing(personalRecordsResult.error);
  const swimCapabilityLimitsSchemaReady = !isSwimCapabilityLimitsSchemaMissing(
    swimCapabilityLimitsResult.error
  );

  const loadError =
    profileResult.error && profileSchemaReady ? "Could not load swimmer profile right now." : null;
  const metricsLoadError =
    cssMetricResult.error && metricsSchemaReady
      ? "Could not load training metrics right now."
      : null;
  const preferencesLoadError =
    preferencesResult.error && preferencesSchemaReady
      ? "Could not load training preferences right now."
      : null;
  const personalRecordsLoadError =
    personalRecordsResult.error && personalRecordsSchemaReady
      ? "Could not load personal records right now."
      : null;
  const swimCapabilityLimitsLoadError =
    swimCapabilityLimitsResult.error && swimCapabilityLimitsSchemaReady
      ? "Could not load stroke and skill limits right now."
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

  if (personalRecordsLoadError) {
    console.error(
      "[AthleteProfile] Failed loading personal records snapshot",
      personalRecordsResult.error
    );
  }

  if (swimCapabilityLimitsLoadError) {
    console.error(
      "[AthleteProfile] Failed loading swim capability limits snapshot",
      swimCapabilityLimitsResult.error
    );
  }

  return {
    profileSchemaReady,
    metricsSchemaReady,
    preferencesSchemaReady,
    personalRecordsSchemaReady,
    swimCapabilityLimitsSchemaReady,
    loadError,
    metricsLoadError,
    preferencesLoadError,
    personalRecordsLoadError,
    swimCapabilityLimitsLoadError,
    profile: profileResult.data ? buildAthleteProfileView(profileResult.data) : null,
    cssMetric: cssMetricResult.data ? buildTrainingMetricView(cssMetricResult.data) : null,
    preferences: preferencesResult.data
      ? buildTrainingPreferencesView(preferencesResult.data)
      : null,
    personalRecords:
      personalRecordsResult.data && personalRecordsSchemaReady
        ? [...personalRecordsResult.data]
            .sort(comparePersonalRecordRows)
            .map((row) => buildPersonalRecordView(row))
        : [],
    swimCapabilityLimits:
      swimCapabilityLimitsResult.data && swimCapabilityLimitsSchemaReady
        ? swimCapabilityLimitsResult.data.map((row) => buildSwimCapabilityLimitView(row))
        : [],
  };
}
