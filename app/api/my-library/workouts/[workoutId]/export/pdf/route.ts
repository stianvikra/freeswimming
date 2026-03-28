import { NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import { buildWorkoutPdfHtmlDocument } from "@/lib/workouts/shared";
import { buildWorkoutEditorRecord, WORKOUT_SELECT } from "@/lib/workouts/server";
import { isWorkoutSchemaMissing } from "@/lib/workouts/schema";

type RouteContext = {
  params: Promise<{
    workoutId: string;
  }>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function noStoreHtml(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function noStoreText(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { workoutId } = await context.params;
  if (!UUID_PATTERN.test(workoutId)) {
    return noStoreText("Invalid workout id.", 400);
  }

  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(noStoreText("Unauthorized.", 401));
  }

  const result = await supabase
    .from("workouts")
    .select(WORKOUT_SELECT)
    .eq("user_id", user.id)
    .eq("id", workoutId)
    .maybeSingle();

  if (isWorkoutSchemaMissing(result.error)) {
    return applySupabaseCookies(
      noStoreText("Canonical workout save is still syncing in this environment.", 503)
    );
  }

  if (result.error) {
    console.error("[WorkoutExportPdfApi] Could not load canonical workout", result.error);
    return applySupabaseCookies(noStoreText("Could not load workout right now.", 500));
  }

  if (!result.data) {
    return applySupabaseCookies(noStoreText("Workout not found.", 404));
  }

  const workout = buildWorkoutEditorRecord(result.data);
  return applySupabaseCookies(
    noStoreHtml(buildWorkoutPdfHtmlDocument(workout.draft, { draftState: "canonical" }))
  );
}
