import { NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import { isWorkoutSchemaMissing } from "@/lib/workouts/schema";
import {
  buildWorkoutEditorRecord,
  buildWorkoutInsert,
  buildWorkoutSummary,
  WORKOUT_SELECT,
} from "@/lib/workouts/server";
import {
  WORKOUT_SOURCE_KINDS,
  type WorkoutSaveApiResponse,
  type WorkoutSaveRequestBody,
} from "@/lib/workouts/shared";

function noStoreJson(
  body: WorkoutSaveApiResponse | Record<string, unknown>,
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

function normalizeSourceKind(value: WorkoutSaveRequestBody["sourceKind"]) {
  if (value && WORKOUT_SOURCE_KINDS.includes(value)) {
    return value;
  }
  return "ai_session_v1";
}

export async function POST(request: Request) {
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

  let insertPayload;
  try {
    insertPayload = buildWorkoutInsert(
      user.id,
      body.draft ?? null,
      normalizeSourceKind(body.sourceKind)
    );
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
    .insert(insertPayload)
    .select(WORKOUT_SELECT)
    .single();

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
    console.error("[WorkoutsApi] Could not save accepted workout", result.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not save workout right now." }, { status: 500 })
    );
  }

  const workout = buildWorkoutEditorRecord(result.data);
  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      workout,
      summary: buildWorkoutSummary(result.data),
    })
  );
}
