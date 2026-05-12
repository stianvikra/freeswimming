import type { Database } from "@/types/database";

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "email" | "created_at" | "updated_at"
>;

type EntitlementRow = Pick<
  Database["public"]["Tables"]["entitlements"]["Row"],
  | "id"
  | "product_id"
  | "purchaser_email"
  | "source"
  | "stripe_customer_id"
  | "stripe_checkout_session_id"
  | "granted_at"
  | "created_at"
  | "updated_at"
>;

type AthleteProfileRow = Pick<
  Database["public"]["Tables"]["athlete_profiles"]["Row"],
  "id" | "display_name" | "first_name" | "last_name" | "age_band" | "created_at" | "updated_at"
>;

type TrainingMetricRow = Pick<
  Database["public"]["Tables"]["training_metrics"]["Row"],
  | "id"
  | "metric_key"
  | "unit"
  | "value_seconds"
  | "recorded_on"
  | "source_note"
  | "created_at"
  | "updated_at"
>;

type TrainingPreferencesRow = Pick<
  Database["public"]["Tables"]["training_preferences"]["Row"],
  | "id"
  | "pool_length_m"
  | "available_days"
  | "preferred_weekly_session_count"
  | "preferred_session_minutes"
  | "created_at"
  | "updated_at"
>;

type PersonalRecordRow = Pick<
  Database["public"]["Tables"]["personal_records"]["Row"],
  | "id"
  | "distance_m"
  | "stroke"
  | "course"
  | "time_centiseconds"
  | "recorded_on"
  | "source_note"
  | "created_at"
  | "updated_at"
>;

type CourseProgressRow = Pick<
  Database["public"]["Tables"]["course_progress"]["Row"],
  "lesson_id" | "done" | "video_seconds" | "updated_at"
>;

type GuideProgressRow = Pick<
  Database["public"]["Tables"]["guide_progress"]["Row"],
  "guide_slug" | "section_id" | "completed" | "notes" | "updated_at"
>;

type GuideSessionProgressRow = Pick<
  Database["public"]["Tables"]["guide_session_progress"]["Row"],
  "guide_slug" | "session_number" | "completed" | "notes" | "completed_at" | "updated_at"
>;

type GoalRow = Pick<
  Database["public"]["Tables"]["goals"]["Row"],
  | "id"
  | "title"
  | "target_value"
  | "target_unit"
  | "target_date"
  | "status"
  | "celebrated_at"
  | "created_at"
  | "updated_at"
>;

type TrainingFocusRow = Pick<
  Database["public"]["Tables"]["training_focuses"]["Row"],
  | "id"
  | "goal_id"
  | "title"
  | "details"
  | "status"
  | "is_primary"
  | "context_type"
  | "context_ref"
  | "completed_at"
  | "archived_at"
  | "created_at"
  | "updated_at"
>;

type TrainingNoteRow = Pick<
  Database["public"]["Tables"]["training_notes"]["Row"],
  | "id"
  | "goal_id"
  | "focus_id"
  | "note_type"
  | "status"
  | "body"
  | "answer"
  | "context_type"
  | "context_ref"
  | "resolved_at"
  | "created_at"
  | "updated_at"
>;

type DownloadLinkRow = Pick<
  Database["public"]["Tables"]["download_links"]["Row"],
  "id" | "entitlement_id" | "expires_at" | "used_at" | "created_at"
>;

type DrylandSessionRow = Pick<
  Database["public"]["Tables"]["dryland_sessions"]["Row"],
  | "id"
  | "source_kind"
  | "status"
  | "session_kind"
  | "title"
  | "description"
  | "focus_text"
  | "exercises"
  | "started_at"
  | "completed_at"
  | "actual_duration_seconds"
  | "created_at"
  | "updated_at"
>;

type HabitDefinitionRow = Pick<
  Database["public"]["Tables"]["habit_definitions"]["Row"],
  | "id"
  | "title"
  | "notes"
  | "habit_mode"
  | "habit_type"
  | "category"
  | "target_operator"
  | "target_value_numeric"
  | "target_unit"
  | "target_time"
  | "start_date"
  | "last_lapse_date"
  | "timer_enabled"
  | "timer_target_seconds"
  | "schedule_days"
  | "is_perfect_day_item"
  | "status"
  | "sort_order"
  | "created_at"
  | "updated_at"
>;

type HabitCheckInRow = Pick<
  Database["public"]["Tables"]["habit_check_ins"]["Row"],
  | "id"
  | "habit_id"
  | "check_in_date"
  | "timezone"
  | "value_numeric"
  | "value_boolean"
  | "value_time"
  | "note"
  | "status"
  | "completed_at"
  | "created_at"
  | "updated_at"
>;

type WorkoutRow = Pick<
  Database["public"]["Tables"]["workouts"]["Row"],
  | "id"
  | "source_kind"
  | "status"
  | "generator_kind"
  | "source_fingerprint"
  | "title"
  | "title_suggestions"
  | "description"
  | "environment"
  | "pool_length_m"
  | "session_type"
  | "effort"
  | "size_mode"
  | "target_distance_m"
  | "target_time_min"
  | "total_distance_m"
  | "estimated_duration_min"
  | "base_pace_seconds_per_100"
  | "used_css_pace_label"
  | "allowed_strokes"
  | "equipment_allowlist"
  | "focus_text"
  | "goal_title"
  | "constraint_text"
  | "warnings"
  | "steps"
  | "generated_at"
  | "accepted_at"
  | "created_at"
  | "updated_at"
>;

export type BuildUserExportPayloadInput = {
  userId: string;
  userEmail: string | null;
  profile: ProfileRow | null;
  athleteProfile: AthleteProfileRow | null;
  trainingMetrics: TrainingMetricRow[];
  trainingPreferences: TrainingPreferencesRow | null;
  personalRecords: PersonalRecordRow[];
  entitlements: EntitlementRow[];
  courseProgress: CourseProgressRow[];
  guideProgress: GuideProgressRow[];
  guideSessionProgress: GuideSessionProgressRow[];
  goals: GoalRow[];
  trainingFocuses: TrainingFocusRow[];
  trainingNotes: TrainingNoteRow[];
  downloadLinks: DownloadLinkRow[];
  drylandSessions: DrylandSessionRow[];
  habitDefinitions: HabitDefinitionRow[];
  habitCheckIns: HabitCheckInRow[];
  workouts: WorkoutRow[];
  generatedAt?: string;
};

export function buildUserExportPayload(input: BuildUserExportPayloadInput) {
  const generatedAt = input.generatedAt ?? new Date().toISOString();

  return {
    generatedAt,
    schemaVersion: "2026-05-12-habits-v2-export",
    user: {
      id: input.userId,
      email: input.userEmail,
    },
    profile: input.profile
      ? {
          id: input.profile.id,
          email: input.profile.email,
          createdAt: input.profile.created_at,
          updatedAt: input.profile.updated_at,
        }
      : null,
    athleteProfile: input.athleteProfile
      ? {
          id: input.athleteProfile.id,
          displayName: input.athleteProfile.display_name,
          firstName: input.athleteProfile.first_name,
          lastName: input.athleteProfile.last_name,
          ageBand: input.athleteProfile.age_band,
          createdAt: input.athleteProfile.created_at,
          updatedAt: input.athleteProfile.updated_at,
        }
      : null,
    trainingMetrics: input.trainingMetrics.map((row) => ({
      id: row.id,
      metricKey: row.metric_key,
      unit: row.unit,
      valueSeconds: row.value_seconds,
      recordedOn: row.recorded_on,
      sourceNote: row.source_note,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    trainingPreferences: input.trainingPreferences
      ? {
          id: input.trainingPreferences.id,
          poolLengthM: input.trainingPreferences.pool_length_m,
          availableDays: input.trainingPreferences.available_days,
          preferredWeeklySessionCount: input.trainingPreferences.preferred_weekly_session_count,
          preferredSessionMinutes: input.trainingPreferences.preferred_session_minutes,
          createdAt: input.trainingPreferences.created_at,
          updatedAt: input.trainingPreferences.updated_at,
        }
      : null,
    personalRecords: input.personalRecords.map((row) => ({
      id: row.id,
      distanceM: row.distance_m,
      stroke: row.stroke,
      course: row.course,
      timeCentiseconds: row.time_centiseconds,
      recordedOn: row.recorded_on,
      sourceNote: row.source_note,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    entitlements: input.entitlements.map((row) => ({
      id: row.id,
      productId: row.product_id,
      purchaserEmail: row.purchaser_email,
      source: row.source,
      stripeCustomerId: row.stripe_customer_id,
      stripeCheckoutSessionId: row.stripe_checkout_session_id,
      grantedAt: row.granted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    courseProgress: input.courseProgress.map((row) => ({
      lessonId: row.lesson_id,
      done: row.done,
      videoSeconds: row.video_seconds,
      updatedAt: row.updated_at,
    })),
    guideProgress: input.guideProgress.map((row) => ({
      guideSlug: row.guide_slug,
      sectionId: row.section_id,
      completed: row.completed,
      notes: row.notes,
      updatedAt: row.updated_at,
    })),
    guideSessionProgress: input.guideSessionProgress.map((row) => ({
      guideSlug: row.guide_slug,
      sessionNumber: row.session_number,
      completed: row.completed,
      notes: row.notes,
      completedAt: row.completed_at,
      updatedAt: row.updated_at,
    })),
    goals: input.goals.map((row) => ({
      id: row.id,
      title: row.title,
      targetValue: row.target_value,
      targetUnit: row.target_unit,
      targetDate: row.target_date,
      status: row.status,
      celebratedAt: row.celebrated_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    trainingFocuses: input.trainingFocuses.map((row) => ({
      id: row.id,
      goalId: row.goal_id,
      title: row.title,
      details: row.details,
      status: row.status,
      isPrimary: row.is_primary,
      contextType: row.context_type,
      contextRef: row.context_ref,
      completedAt: row.completed_at,
      archivedAt: row.archived_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    trainingNotes: input.trainingNotes.map((row) => ({
      id: row.id,
      goalId: row.goal_id,
      focusId: row.focus_id,
      noteType: row.note_type,
      status: row.status,
      body: row.body,
      answer: row.answer,
      contextType: row.context_type,
      contextRef: row.context_ref,
      resolvedAt: row.resolved_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    downloadLinks: input.downloadLinks.map((row) => ({
      id: row.id,
      entitlementId: row.entitlement_id,
      expiresAt: row.expires_at,
      usedAt: row.used_at,
      createdAt: row.created_at,
    })),
    drylandSessions: input.drylandSessions.map((row) => ({
      id: row.id,
      sourceKind: row.source_kind,
      status: row.status,
      sessionKind: row.session_kind,
      title: row.title,
      description: row.description,
      legacyFocusText: row.focus_text,
      exercises: row.exercises,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      actualDurationSeconds: row.actual_duration_seconds,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    habitDefinitions: input.habitDefinitions.map((row) => ({
      id: row.id,
      title: row.title,
      notes: row.notes,
      habitMode: row.habit_mode,
      habitType: row.habit_type,
      category: row.category,
      targetOperator: row.target_operator,
      targetValueNumeric: row.target_value_numeric,
      targetUnit: row.target_unit,
      targetTime: row.target_time,
      startDate: row.start_date,
      lastLapseDate: row.last_lapse_date,
      timerEnabled: row.timer_enabled,
      timerTargetSeconds: row.timer_target_seconds,
      scheduleDays: row.schedule_days,
      isPerfectDayItem: row.is_perfect_day_item,
      status: row.status,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    habitCheckIns: input.habitCheckIns.map((row) => ({
      id: row.id,
      habitId: row.habit_id,
      checkInDate: row.check_in_date,
      timezone: row.timezone,
      valueNumeric: row.value_numeric,
      valueBoolean: row.value_boolean,
      valueTime: row.value_time,
      note: row.note,
      status: row.status,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    workouts: input.workouts.map((row) => ({
      id: row.id,
      sourceKind: row.source_kind,
      status: row.status,
      generatorKind: row.generator_kind,
      sourceFingerprint: row.source_fingerprint,
      title: row.title,
      titleSuggestions: row.title_suggestions,
      description: row.description,
      environment: row.environment,
      poolLengthM: row.pool_length_m,
      sessionType: row.session_type,
      effort: row.effort,
      sizeMode: row.size_mode,
      targetDistanceM: row.target_distance_m,
      targetTimeMin: row.target_time_min,
      totalDistanceM: row.total_distance_m,
      estimatedDurationMin: row.estimated_duration_min,
      basePaceSecondsPer100m: row.base_pace_seconds_per_100,
      usedCssPaceLabel: row.used_css_pace_label,
      allowedStrokes: row.allowed_strokes,
      equipmentAllowlist: row.equipment_allowlist,
      focusText: row.focus_text,
      goalTitle: row.goal_title,
      constraintText: row.constraint_text,
      warnings: row.warnings,
      steps: row.steps,
      generatedAt: row.generated_at,
      acceptedAt: row.accepted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  };
}
