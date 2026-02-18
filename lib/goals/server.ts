import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  GOAL_ACTIVE_STATUS_VALUES,
  GOALS_ACTIVE_LIMIT,
  GoalRow,
  GoalView,
  buildDerivedGoalSyncUpdate,
  buildEmptyGoalProgressContext,
  buildGoalView,
  type GoalProgressContext,
} from "@/lib/goals/mvp";
import { isGoalsMvpSchemaMissing } from "@/lib/goals/schema";

type TypedSupabaseClient = SupabaseClient<Database>;

const GOALS_SELECT = `
  id,
  user_id,
  title,
  goal_type,
  source,
  target_value,
  target_unit,
  target_date,
  target_distance_m,
  target_time_seconds,
  target_count,
  target_ref,
  progress_value,
  status,
  achieved_at,
  celebrated_at,
  created_at,
  updated_at
`;

const LEGACY_GOALS_SELECT = `
  id,
  user_id,
  title,
  target_value,
  target_unit,
  target_date,
  status,
  celebrated_at,
  created_at,
  updated_at
`;

type LegacyGoalRow = {
  id: string;
  user_id: string;
  title: string;
  target_value: number | null;
  target_unit: string;
  target_date: string | null;
  status: "active" | "achieved" | "archived";
  celebrated_at: string | null;
  created_at: string;
  updated_at: string;
};

function extractModuleId(lessonId: string): string | null {
  const match = /^([a-z0-9]+)-/i.exec(lessonId);
  if (!match) return null;
  return match[1].toLowerCase();
}

function toSafeStatus(status: string | null | undefined): GoalRow["status"] {
  if (status === "active") return "active";
  if (status === "achieved") return "achieved";
  if (status === "archived") return "archived";
  return "active";
}

function mapLegacyGoalRowToGoalRow(row: LegacyGoalRow): GoalRow {
  const targetValue = typeof row.target_value === "number" ? row.target_value : null;
  const unit = row.target_unit ?? "";
  const normalizedUnit = unit.trim().toLowerCase();

  const inferredGoalType: GoalRow["goal_type"] =
    normalizedUnit === "seconds_at_distance"
      ? "distance_time"
      : normalizedUnit === "meters_continuous"
        ? "distance_continuous"
        : "custom";

  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    goal_type: inferredGoalType,
    source: "custom",
    target_value: targetValue,
    target_unit: row.target_unit,
    target_date: row.target_date,
    target_distance_m:
      inferredGoalType === "distance_continuous" && targetValue !== null
        ? Math.round(targetValue)
        : null,
    target_time_seconds:
      inferredGoalType === "distance_time" && targetValue !== null ? Math.round(targetValue) : null,
    target_count:
      normalizedUnit === "count" && targetValue !== null ? Math.round(targetValue) : null,
    target_ref: null,
    progress_value: 0,
    status: toSafeStatus(row.status),
    achieved_at: row.status === "achieved" ? row.updated_at : null,
    celebrated_at: row.celebrated_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function loadGoalProgressContext(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<GoalProgressContext> {
  const context = buildEmptyGoalProgressContext();

  const [drillResult, courseResult] = await Promise.all([
    supabase
      .from("guide_progress")
      .select("section_id")
      .eq("user_id", userId)
      .eq("guide_slug", "poolside")
      .eq("completed", true),
    supabase.from("course_progress").select("lesson_id").eq("user_id", userId).eq("done", true),
  ]);

  if (drillResult.error) {
    console.error("[Goals] Failed loading drill progress context", drillResult.error);
  } else {
    for (const row of drillResult.data ?? []) {
      context.completedDrillIds.add(row.section_id.toUpperCase());
    }
  }

  if (courseResult.error) {
    console.error("[Goals] Failed loading module progress context", courseResult.error);
  } else {
    for (const row of courseResult.data ?? []) {
      const moduleId = extractModuleId(row.lesson_id);
      if (!moduleId) continue;
      const existing = context.completedModuleLessonCounts.get(moduleId) ?? 0;
      context.completedModuleLessonCounts.set(moduleId, existing + 1);
    }
  }

  return context;
}

export async function loadUserGoals(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<GoalRow[]> {
  const result = await supabase
    .from("goals")
    .select(GOALS_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (result.error) {
    if (isGoalsMvpSchemaMissing(result.error)) {
      const legacyResult = await supabase
        .from("goals")
        .select(LEGACY_GOALS_SELECT)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (legacyResult.error) {
        console.error("[Goals] Failed loading legacy goals", legacyResult.error);
        return [];
      }

      return (legacyResult.data ?? []).map((row) =>
        mapLegacyGoalRowToGoalRow(row as LegacyGoalRow)
      );
    }

    console.error("[Goals] Failed loading goals", result.error);
    return [];
  }

  return result.data ?? [];
}

export async function countActiveGoals(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<number> {
  const result = await supabase
    .from("goals")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", [...GOAL_ACTIVE_STATUS_VALUES]);

  if (result.error) {
    console.error("[Goals] Failed counting active goals", result.error);
    return GOALS_ACTIVE_LIMIT;
  }

  return result.count ?? 0;
}

export async function syncDerivedGoals(
  supabase: TypedSupabaseClient,
  userId: string,
  rows: GoalRow[],
  context: GoalProgressContext
): Promise<GoalRow[]> {
  const mergedRows = [...rows];

  for (let index = 0; index < mergedRows.length; index += 1) {
    const row = mergedRows[index];
    const patch = buildDerivedGoalSyncUpdate(row, context);
    if (!patch) continue;

    const result = await supabase
      .from("goals")
      .update(patch)
      .eq("id", row.id)
      .eq("user_id", userId)
      .select(GOALS_SELECT)
      .single();

    if (result.error) {
      console.error("[Goals] Failed syncing derived goal state", result.error);
      continue;
    }

    if (result.data) {
      mergedRows[index] = result.data;
    }
  }

  return mergedRows;
}

export async function loadGoalViews(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<GoalView[]> {
  const context = await loadGoalProgressContext(supabase, userId);
  const rows = await loadUserGoals(supabase, userId);
  const syncedRows = await syncDerivedGoals(supabase, userId, rows, context);
  return syncedRows.map((goal) => buildGoalView(goal, context));
}
