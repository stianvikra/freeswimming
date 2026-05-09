import { NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import {
  buildGoalView,
  normalizeLogResultValue,
  type GoalRow,
  type GoalUpdate,
} from "@/lib/goals/mvp";
import { loadGoalProgressContext } from "@/lib/goals/server";
import { isGoalsMvpSchemaMissing } from "@/lib/goals/schema";

type Params = Promise<{ goalId: string }>;

type PatchPayload =
  | {
      action: "archive";
    }
  | {
      action: "restore";
    }
  | {
      action: "reset_result";
    }
  | {
      action: "mark_celebrated";
    }
  | {
      action: "log_result";
      timeSeconds?: number;
      distanceM?: number;
      count?: number;
    };

const GOAL_SELECT = `
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

function noStoreJson(
  body: Record<string, unknown>,
  init?: {
    status?: number;
  }
) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function toNumber(value: number | null | undefined): number {
  if (!Number.isFinite(value)) return 0;
  return Number(value);
}

function computeLogResultPatch(goal: GoalRow, payload: PatchPayload): GoalUpdate | null {
  if (payload.action !== "log_result") return null;
  if (goal.status === "archived") return null;

  const existingProgress = toNumber(goal.progress_value);

  if (goal.goal_type === "distance_time") {
    const value = normalizeLogResultValue("time_seconds", payload.timeSeconds);
    if (!value) return null;

    const bestTime = existingProgress > 0 ? Math.min(existingProgress, value) : value;
    const achieved = goal.target_time_seconds ? bestTime <= goal.target_time_seconds : false;
    return {
      progress_value: bestTime,
      status: achieved ? "achieved" : "active",
      achieved_at: achieved ? (goal.achieved_at ?? new Date().toISOString()) : goal.achieved_at,
    };
  }

  if (goal.goal_type === "distance_continuous") {
    const value = normalizeLogResultValue("distance_m", payload.distanceM);
    if (!value) return null;

    const bestDistance = Math.max(existingProgress, value);
    const achieved = goal.target_distance_m ? bestDistance >= goal.target_distance_m : false;
    return {
      progress_value: bestDistance,
      status: achieved ? "achieved" : "active",
      achieved_at: achieved ? (goal.achieved_at ?? new Date().toISOString()) : goal.achieved_at,
    };
  }

  if (goal.goal_type === "custom") {
    if (goal.target_count !== null) {
      const value = normalizeLogResultValue("count", payload.count);
      if (!value) return null;
      const bestCount = Math.max(existingProgress, value);
      const achieved = bestCount >= goal.target_count;
      return {
        progress_value: bestCount,
        status: achieved ? "achieved" : "active",
        achieved_at: achieved ? (goal.achieved_at ?? new Date().toISOString()) : goal.achieved_at,
      };
    }

    if (goal.target_time_seconds !== null) {
      const value = normalizeLogResultValue("time_seconds", payload.timeSeconds);
      if (!value) return null;
      const bestTime = existingProgress > 0 ? Math.min(existingProgress, value) : value;
      const achieved = bestTime <= goal.target_time_seconds;
      return {
        progress_value: bestTime,
        status: achieved ? "achieved" : "active",
        achieved_at: achieved ? (goal.achieved_at ?? new Date().toISOString()) : goal.achieved_at,
      };
    }

    if (goal.target_distance_m !== null) {
      const value = normalizeLogResultValue("distance_m", payload.distanceM);
      if (!value) return null;
      const bestDistance = Math.max(existingProgress, value);
      const achieved = bestDistance >= goal.target_distance_m;
      return {
        progress_value: bestDistance,
        status: achieved ? "achieved" : "active",
        achieved_at: achieved ? (goal.achieved_at ?? new Date().toISOString()) : goal.achieved_at,
      };
    }
  }

  return null;
}

function computeResetResultPatch(goal: GoalRow): GoalUpdate | null {
  if (goal.status === "archived") return null;

  if (
    goal.goal_type !== "distance_time" &&
    goal.goal_type !== "distance_continuous" &&
    goal.goal_type !== "custom"
  ) {
    return null;
  }

  return {
    progress_value: 0,
    status: "active",
    achieved_at: null,
    celebrated_at: null,
  };
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { goalId } = await params;
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unauthorized." }, { status: 401 })
    );
  }

  let payload: PatchPayload | null = null;
  try {
    payload = (await request.json()) as PatchPayload;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON." }, { status: 400 })
    );
  }

  const goalResult = await supabase
    .from("goals")
    .select(GOAL_SELECT)
    .eq("id", goalId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (goalResult.error) {
    if (isGoalsMvpSchemaMissing(goalResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: "Goals setup is still syncing. Please try again in a minute.",
            code: "GOALS_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error("[Goals] Failed loading goal for patch", goalResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load goal right now." }, { status: 500 })
    );
  }

  const goal = goalResult.data as GoalRow | null;
  if (!goal) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Goal not found." }, { status: 404 })
    );
  }

  let patch: GoalUpdate | null = null;
  if (payload?.action === "archive") {
    patch = {
      status: "archived",
    };
  } else if (payload?.action === "restore") {
    patch = {
      status: goal.status === "achieved" ? "achieved" : "active",
    };
  } else if (payload?.action === "reset_result") {
    patch = computeResetResultPatch(goal);
  } else if (payload?.action === "mark_celebrated") {
    patch = {
      celebrated_at: new Date().toISOString(),
    };
  } else if (payload?.action === "log_result") {
    patch = computeLogResultPatch(goal, payload);
  }

  if (!patch) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid goal update payload." }, { status: 400 })
    );
  }

  const updateResult = await supabase
    .from("goals")
    .update(patch)
    .eq("id", goalId)
    .eq("user_id", user.id)
    .select(GOAL_SELECT)
    .single();

  if (updateResult.error || !updateResult.data) {
    if (isGoalsMvpSchemaMissing(updateResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: "Goals setup is still syncing. Please try again in a minute.",
            code: "GOALS_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error("[Goals] Failed updating goal", updateResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not update goal right now." }, { status: 500 })
    );
  }

  const context = await loadGoalProgressContext(supabase, user.id);
  const goalView = buildGoalView(updateResult.data as GoalRow, context);

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      goal: goalView,
    })
  );
}
