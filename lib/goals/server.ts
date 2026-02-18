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

function extractModuleId(lessonId: string): string | null {
  const match = /^([a-z0-9]+)-/i.exec(lessonId);
  if (!match) return null;
  return match[1].toLowerCase();
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
