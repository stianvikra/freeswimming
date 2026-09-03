type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

const HABIT_SCHEMA_MARKERS = [
  "habit_definitions",
  "habit_check_ins",
  "habit_absence_review_acknowledgements",
  "habit_absence_review_set_day_status",
  "day_status",
  "habit_type",
  "habit_mode",
  "check_in_date",
  "target_operator",
  "is_perfect_day_item",
  "start_date",
  "timer_enabled",
  "timer_seconds",
  "manual_minutes",
  "habit_motivation_resets",
  "source_kind",
  "source_dryland_micro_plan_id",
  "source_micro_block_id",
  "source_completed_at",
  "reset_type",
  "effective_date",
  "created_by",
  "cadence_period",
  "cadence_target_count",
  "cadence_day_policy",
];

export function isHabitsSchemaMissing(error: PostgrestLikeError | null | undefined): boolean {
  if (!error) return false;

  if (error.code === "42P01" || error.code === "42703" || error.code === "PGRST204") {
    return true;
  }

  const blob = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return HABIT_SCHEMA_MARKERS.some((marker) => blob.includes(marker));
}
