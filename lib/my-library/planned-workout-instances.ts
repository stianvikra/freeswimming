export const PLANNED_WORKOUT_INSTANCE_STATUSES = ["planned", "skipped", "cancelled"] as const;

export type PlannedWorkoutInstanceStatus = (typeof PLANNED_WORKOUT_INSTANCE_STATUSES)[number];
export type PlannedWorkoutInstanceStatusSelection = PlannedWorkoutInstanceStatus | "unmapped";

export const PLANNED_WORKOUT_INSTANCE_DATE_OVERRIDE_KINDS = [
  "program_assignment",
  "manual",
] as const;

export type PlannedWorkoutInstanceDateOverrideKind =
  (typeof PLANNED_WORKOUT_INSTANCE_DATE_OVERRIDE_KINDS)[number];

export function isPlannedWorkoutInstanceStatus(
  value: unknown
): value is PlannedWorkoutInstanceStatus {
  return (
    typeof value === "string" &&
    PLANNED_WORKOUT_INSTANCE_STATUSES.includes(value as PlannedWorkoutInstanceStatus)
  );
}

export function normalizePlannedWorkoutInstanceStatus(
  value: unknown
): PlannedWorkoutInstanceStatusSelection {
  return isPlannedWorkoutInstanceStatus(value) ? value : "unmapped";
}

export function isPlannedWorkoutInstanceDateOverrideKind(
  value: unknown
): value is PlannedWorkoutInstanceDateOverrideKind {
  return (
    typeof value === "string" &&
    PLANNED_WORKOUT_INSTANCE_DATE_OVERRIDE_KINDS.includes(
      value as PlannedWorkoutInstanceDateOverrideKind
    )
  );
}

export function normalizePlannedWorkoutInstanceDateOverrideKind(
  value: unknown
): PlannedWorkoutInstanceDateOverrideKind {
  return isPlannedWorkoutInstanceDateOverrideKind(value) ? value : "program_assignment";
}
