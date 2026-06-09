import { NextResponse } from "next/server";
import { trackAndPersistAnalyticsEvent } from "@/lib/analytics/persistence";
import { buildWorkoutBuilderSavedPayload } from "@/lib/analytics/workout-builder";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import { isWorkoutSchemaMissing } from "@/lib/workouts/schema";
import {
  buildWorkoutEditorRecord,
  buildWorkoutSummary,
  buildWorkoutUpdate,
  WORKOUT_SELECT,
} from "@/lib/workouts/server";
import type {
  WorkoutDeleteApiResponse,
  WorkoutSaveApiResponse,
  WorkoutSaveRequestBody,
} from "@/lib/workouts/shared";

type RouteContext = {
  params: Promise<{
    workoutId: string;
  }>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function noStoreJson(
  body: WorkoutSaveApiResponse | WorkoutDeleteApiResponse | Record<string, unknown>,
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

export async function PATCH(request: Request, context: RouteContext) {
  const { workoutId } = await context.params;
  if (!UUID_PATTERN.test(workoutId)) {
    return noStoreJson({ ok: false, error: "Invalid workout id." }, { status: 400 });
  }

  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unauthorized." }, { status: 401 })
    );
  }

  let body: WorkoutSaveRequestBody;
  try {
    body = (await request.json()) as WorkoutSaveRequestBody;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }

  let patch;
  try {
    patch = buildWorkoutUpdate(body.draft ?? null);
  } catch (error) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: error instanceof Error ? error.message : "Could not save workout right now.",
        },
        { status: 400 }
      )
    );
  }

  const result = await supabase
    .from("workouts")
    .update(patch)
    .eq("user_id", user.id)
    .eq("id", workoutId)
    .select(WORKOUT_SELECT)
    .maybeSingle();

  if (isWorkoutSchemaMissing(result.error)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Canonical workout save is still syncing in this environment.",
        },
        { status: 503 }
      )
    );
  }

  if (result.error) {
    console.error("[WorkoutsApi] Could not update canonical workout", result.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not save workout right now." }, { status: 500 })
    );
  }

  if (!result.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Workout not found." }, { status: 404 })
    );
  }

  const workout = buildWorkoutEditorRecord(result.data);
  await trackAndPersistAnalyticsEvent({
    eventName: "workout_builder_saved",
    channel: "server",
    userId: user.id,
    payload: buildWorkoutBuilderSavedPayload({
      draft: workout.draft,
      sourceKind: workout.sourceKind,
      saveKind: "existing_workout_update",
    }),
  });

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      workout,
      summary: buildWorkoutSummary(result.data),
    })
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { workoutId } = await context.params;
  if (!UUID_PATTERN.test(workoutId)) {
    return noStoreJson({ ok: false, error: "Invalid workout id." }, { status: 400 });
  }

  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unauthorized." }, { status: 401 })
    );
  }

  const result = await supabase
    .from("workouts")
    .delete()
    .eq("user_id", user.id)
    .eq("id", workoutId)
    .select("id")
    .maybeSingle();

  if (isWorkoutSchemaMissing(result.error)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Canonical workout save is still syncing in this environment.",
        },
        { status: 503 }
      )
    );
  }

  if (result.error) {
    console.error("[WorkoutsApi] Could not delete canonical workout", result.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not delete workout right now." }, { status: 500 })
    );
  }

  if (!result.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Workout not found." }, { status: 404 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      deletedWorkoutId: workoutId,
    })
  );
}
