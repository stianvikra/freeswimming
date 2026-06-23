import { NextResponse } from "next/server";
import {
  isAthleteProfileSchemaMissing,
  isPersonalRecordsSchemaMissing,
  isTrainingMetricSchemaMissing,
  isTrainingPreferencesSchemaMissing,
} from "@/lib/athlete-profile/schema";
import { loadPublishedCourseModulesCached } from "@/lib/admin/content-course";
import { normalizeCourseProgressRows } from "@/lib/course/progress";
import {
  PROVIDER_ACTIVITY_EVIDENCE_SELECT,
  PROVIDER_CONNECTION_SELECT,
  PROVIDER_IMPORT_RUN_SELECT,
  isProviderEvidenceSchemaMissing,
} from "@/lib/my-library/provider-evidence";
import {
  TRAINING_ACTIVITY_EVENT_SELECT,
  isTrainingActivityEventSchemaMissing,
} from "@/lib/my-library/training-activity-events";
import {
  buildCanonicalCourseLessonIdMap,
  canonicalizeCourseLessonRuntimeId,
} from "@/lib/course/runtime-identity";
import { isDrylandSchemaMissing } from "@/lib/dryland/schema";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isTrainingContextSchemaMissing } from "@/lib/training-context/schema";
import { buildUserExportPayload } from "@/lib/user/export";
import { isWorkoutSchemaMissing } from "@/lib/workouts/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonNoStore({ ok: false, error: "Unauthorized." }, 401);
  }

  const userId = user.id;
  const generatedAt = new Date().toISOString();
  const courseModules = await loadPublishedCourseModulesCached();
  const canonicalLessonIdByAlias = buildCanonicalCourseLessonIdMap(courseModules);
  const resolveLessonId = (lessonId: string) =>
    canonicalizeCourseLessonRuntimeId(lessonId, canonicalLessonIdByAlias);

  const [
    profileResult,
    athleteProfileResult,
    trainingMetricsResult,
    trainingPreferencesResult,
    personalRecordsResult,
    entitlementsResult,
    courseProgressResult,
    guideProgressResult,
    guideSessionProgressResult,
    goalsResult,
    trainingFocusesResult,
    trainingNotesResult,
    downloadLinksResult,
    drylandSessionsResult,
    habitDefinitionsResult,
    habitCheckInsResult,
    workoutsResult,
    trainingActivityEventsResult,
    providerConnectionsResult,
    providerActivityEvidenceResult,
    providerImportRunsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("athlete_profiles")
      .select("id, display_name, first_name, last_name, age_band, created_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("training_metrics")
      .select(
        "id, metric_key, unit, value_seconds, recorded_on, source_note, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("training_preferences")
      .select(
        "id, pool_length_m, available_days, preferred_weekly_session_count, preferred_session_minutes, created_at, updated_at"
      )
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("personal_records")
      .select(
        "id, distance_m, stroke, course, time_centiseconds, recorded_on, source_note, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("distance_m", { ascending: true }),
    supabase
      .from("entitlements")
      .select(
        "id, product_id, purchaser_email, source, stripe_customer_id, stripe_checkout_session_id, granted_at, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("granted_at", { ascending: false }),
    supabase
      .from("course_progress")
      .select("lesson_id, done, video_seconds, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("guide_progress")
      .select("guide_slug, section_id, completed, notes, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("guide_session_progress")
      .select("guide_slug, session_number, completed, notes, completed_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("goals")
      .select(
        "id, title, target_value, target_unit, target_date, status, celebrated_at, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("training_focuses")
      .select(
        "id, goal_id, title, details, status, is_primary, context_type, context_ref, completed_at, archived_at, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("training_notes")
      .select(
        "id, goal_id, focus_id, note_type, status, body, answer, context_type, context_ref, resolved_at, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("download_links")
      .select("id, entitlement_id, expires_at, used_at, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("dryland_sessions")
      .select(
        "id, source_kind, status, session_kind, title, description, focus_text, exercises, started_at, completed_at, actual_duration_seconds, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("habit_definitions")
      .select(
        "id, title, notes, habit_mode, habit_type, category, target_operator, target_value_numeric, target_unit, target_time, start_date, last_lapse_date, timer_enabled, timer_target_seconds, cadence_period, cadence_target_count, cadence_day_policy, schedule_days, is_perfect_day_item, status, sort_order, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("habit_check_ins")
      .select(
        "id, habit_id, check_in_date, timezone, value_numeric, value_boolean, value_time, note, status, source_kind, source_dryland_micro_plan_id, source_micro_block_id, source_completed_at, completed_at, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("check_in_date", { ascending: false }),
    supabase
      .from("workouts")
      .select(
        "id, source_kind, status, generator_kind, source_fingerprint, title, title_suggestions, description, environment, pool_length_m, session_type, effort, size_mode, target_distance_m, target_time_min, total_distance_m, estimated_duration_min, base_pace_seconds_per_100, used_css_pace_label, allowed_strokes, equipment_allowlist, focus_text, goal_title, constraint_text, warnings, steps, generated_at, accepted_at, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("training_activity_events")
      .select(TRAINING_ACTIVITY_EVENT_SELECT)
      .eq("user_id", userId)
      .order("activity_local_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("provider_connections")
      .select(PROVIDER_CONNECTION_SELECT)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("provider_activity_evidence")
      .select(PROVIDER_ACTIVITY_EVIDENCE_SELECT)
      .eq("user_id", userId)
      .order("activity_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("provider_import_runs")
      .select(PROVIDER_IMPORT_RUN_SELECT)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const normalizedAthleteProfile =
    athleteProfileResult.error && isAthleteProfileSchemaMissing(athleteProfileResult.error)
      ? null
      : (athleteProfileResult.data ?? null);
  const normalizedTrainingMetrics =
    trainingMetricsResult.error && isTrainingMetricSchemaMissing(trainingMetricsResult.error)
      ? []
      : (trainingMetricsResult.data ?? []);
  const normalizedTrainingPreferences =
    trainingPreferencesResult.error &&
    isTrainingPreferencesSchemaMissing(trainingPreferencesResult.error)
      ? null
      : (trainingPreferencesResult.data ?? null);
  const normalizedPersonalRecords =
    personalRecordsResult.error && isPersonalRecordsSchemaMissing(personalRecordsResult.error)
      ? []
      : (personalRecordsResult.data ?? []);
  const normalizedTrainingFocuses =
    trainingFocusesResult.error && isTrainingContextSchemaMissing(trainingFocusesResult.error)
      ? []
      : (trainingFocusesResult.data ?? []);
  const normalizedTrainingNotes =
    trainingNotesResult.error && isTrainingContextSchemaMissing(trainingNotesResult.error)
      ? []
      : (trainingNotesResult.data ?? []);
  const normalizedWorkouts =
    workoutsResult.error && isWorkoutSchemaMissing(workoutsResult.error)
      ? []
      : (workoutsResult.data ?? []);
  const normalizedTrainingActivityEvents =
    trainingActivityEventsResult.error &&
    isTrainingActivityEventSchemaMissing(trainingActivityEventsResult.error)
      ? []
      : (trainingActivityEventsResult.data ?? []);
  const normalizedDrylandSessions =
    drylandSessionsResult.error && isDrylandSchemaMissing(drylandSessionsResult.error)
      ? []
      : (drylandSessionsResult.data ?? []);
  const normalizedHabitDefinitions =
    habitDefinitionsResult.error && isHabitsSchemaMissing(habitDefinitionsResult.error)
      ? []
      : (habitDefinitionsResult.data ?? []);
  const normalizedHabitCheckIns =
    habitCheckInsResult.error && isHabitsSchemaMissing(habitCheckInsResult.error)
      ? []
      : (habitCheckInsResult.data ?? []);
  const normalizedProviderConnections =
    providerConnectionsResult.error &&
    isProviderEvidenceSchemaMissing(providerConnectionsResult.error)
      ? []
      : (providerConnectionsResult.data ?? []);
  const normalizedProviderActivityEvidence =
    providerActivityEvidenceResult.error &&
    isProviderEvidenceSchemaMissing(providerActivityEvidenceResult.error)
      ? []
      : (providerActivityEvidenceResult.data ?? []);
  const normalizedProviderImportRuns =
    providerImportRunsResult.error &&
    isProviderEvidenceSchemaMissing(providerImportRunsResult.error)
      ? []
      : (providerImportRunsResult.data ?? []);

  const failedQuery =
    profileResult.error ??
    (athleteProfileResult.error && !isAthleteProfileSchemaMissing(athleteProfileResult.error)
      ? athleteProfileResult.error
      : null) ??
    (trainingMetricsResult.error && !isTrainingMetricSchemaMissing(trainingMetricsResult.error)
      ? trainingMetricsResult.error
      : null) ??
    (trainingPreferencesResult.error &&
    !isTrainingPreferencesSchemaMissing(trainingPreferencesResult.error)
      ? trainingPreferencesResult.error
      : null) ??
    (personalRecordsResult.error && !isPersonalRecordsSchemaMissing(personalRecordsResult.error)
      ? personalRecordsResult.error
      : null) ??
    entitlementsResult.error ??
    courseProgressResult.error ??
    guideProgressResult.error ??
    guideSessionProgressResult.error ??
    goalsResult.error ??
    (trainingFocusesResult.error && !isTrainingContextSchemaMissing(trainingFocusesResult.error)
      ? trainingFocusesResult.error
      : null) ??
    (trainingNotesResult.error && !isTrainingContextSchemaMissing(trainingNotesResult.error)
      ? trainingNotesResult.error
      : null) ??
    downloadLinksResult.error ??
    (drylandSessionsResult.error && !isDrylandSchemaMissing(drylandSessionsResult.error)
      ? drylandSessionsResult.error
      : null) ??
    (habitDefinitionsResult.error && !isHabitsSchemaMissing(habitDefinitionsResult.error)
      ? habitDefinitionsResult.error
      : null) ??
    (habitCheckInsResult.error && !isHabitsSchemaMissing(habitCheckInsResult.error)
      ? habitCheckInsResult.error
      : null) ??
    (workoutsResult.error && !isWorkoutSchemaMissing(workoutsResult.error)
      ? workoutsResult.error
      : null) ??
    (trainingActivityEventsResult.error &&
    !isTrainingActivityEventSchemaMissing(trainingActivityEventsResult.error)
      ? trainingActivityEventsResult.error
      : null) ??
    (providerConnectionsResult.error &&
    !isProviderEvidenceSchemaMissing(providerConnectionsResult.error)
      ? providerConnectionsResult.error
      : null) ??
    (providerActivityEvidenceResult.error &&
    !isProviderEvidenceSchemaMissing(providerActivityEvidenceResult.error)
      ? providerActivityEvidenceResult.error
      : null) ??
    (providerImportRunsResult.error &&
    !isProviderEvidenceSchemaMissing(providerImportRunsResult.error)
      ? providerImportRunsResult.error
      : null);

  if (failedQuery) {
    console.error("[UserExportApi] Could not build user export", failedQuery);
    return jsonNoStore({ ok: false, error: "Could not export user data." }, 500);
  }

  return jsonNoStore({
    ok: true,
    export: buildUserExportPayload({
      userId,
      userEmail: user.email ?? null,
      profile: profileResult.data ?? null,
      athleteProfile: normalizedAthleteProfile,
      trainingMetrics: normalizedTrainingMetrics,
      trainingPreferences: normalizedTrainingPreferences,
      personalRecords: normalizedPersonalRecords,
      entitlements: entitlementsResult.data ?? [],
      courseProgress: normalizeCourseProgressRows(courseProgressResult.data ?? [], {
        resolveLessonId,
      }).map((row) => ({
        lesson_id: row.lessonId,
        done: row.done,
        video_seconds: row.videoSeconds,
        updated_at: row.updatedAt,
      })),
      guideProgress: guideProgressResult.data ?? [],
      guideSessionProgress: guideSessionProgressResult.data ?? [],
      goals: goalsResult.data ?? [],
      trainingFocuses: normalizedTrainingFocuses,
      trainingNotes: normalizedTrainingNotes,
      downloadLinks: downloadLinksResult.data ?? [],
      drylandSessions: normalizedDrylandSessions,
      habitDefinitions: normalizedHabitDefinitions,
      habitCheckIns: normalizedHabitCheckIns,
      workouts: normalizedWorkouts,
      trainingActivityEvents: normalizedTrainingActivityEvents,
      providerConnections: normalizedProviderConnections,
      providerActivityEvidence: normalizedProviderActivityEvidence,
      providerImportRuns: normalizedProviderImportRuns,
      generatedAt,
    }),
  });
}
