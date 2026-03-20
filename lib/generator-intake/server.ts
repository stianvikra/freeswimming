import type { SupabaseClient } from "@supabase/supabase-js";
import { loadAthleteProfileSnapshot } from "@/lib/athlete-profile/server";
import {
  GOAL_ACTIVE_STATUS_VALUES,
  buildGoalView,
  type GoalView,
  type GoalRow,
} from "@/lib/goals/mvp";
import { GOALS_SELECT, loadGoalProgressContext, syncDerivedGoals } from "@/lib/goals/server";
import { loadTrainingContextSnapshot } from "@/lib/training-context/server";
import {
  buildGeneratorIntakeSnapshot,
  isGeneratorActiveGoalStatus,
  type GeneratorIntakeSnapshot,
} from "@/lib/generator-intake/shared";
import type { Database } from "@/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;
export * from "@/lib/generator-intake/shared";

export async function loadGeneratorIntakeSnapshot(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<GeneratorIntakeSnapshot> {
  const [athleteProfileSnapshot, trainingContextSnapshot, goalViewsResult] = await Promise.all([
    loadAthleteProfileSnapshot(supabase, userId),
    loadTrainingContextSnapshot(supabase, userId),
    loadOpenGoalViews(supabase, userId),
  ]);

  return buildGeneratorIntakeSnapshot({
    athleteProfileSnapshot,
    trainingContextSnapshot,
    openGoals: goalViewsResult.openGoals,
    goalsLoadError: goalViewsResult.loadError,
  });
}

async function loadOpenGoalViews(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<{
  openGoals: GoalView[];
  loadError: string | null;
}> {
  const context = await loadGoalProgressContext(supabase, userId);
  const result = await supabase
    .from("goals")
    .select(GOALS_SELECT)
    .eq("user_id", userId)
    .in("status", [...GOAL_ACTIVE_STATUS_VALUES])
    .order("created_at", { ascending: false });

  if (result.error) {
    console.error("[GeneratorIntake] Failed loading open goals", result.error);
    return {
      openGoals: [],
      loadError: "Could not load open goals right now.",
    };
  }

  const syncedRows = await syncDerivedGoals(
    supabase,
    userId,
    (result.data ?? []) as GoalRow[],
    context
  );
  return {
    openGoals: syncedRows
      .map((goal) => buildGoalView(goal, context))
      .filter((goal) => isGeneratorActiveGoalStatus(goal.status)),
    loadError: null,
  };
}
