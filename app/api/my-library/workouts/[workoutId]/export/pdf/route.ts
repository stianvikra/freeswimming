import { NextResponse } from "next/server";
import { BRAND_FONT_PUBLIC_PATH, getWorkoutPdfLogoPath } from "@/lib/brand";
import { loadAthleteProfileSnapshot } from "@/lib/athlete-profile/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import { loadTrainingContextSnapshot } from "@/lib/training-context/server";
import {
  buildWorkoutPdfHtmlDocument,
  normalizeWorkoutPoolsideNotationMode,
  normalizeWorkoutPoolsidePrintLayout,
  normalizeWorkoutPoolsidePrintStyle,
  normalizeWorkoutPoolsideRestLayout,
  selectWorkoutPoolsideFocusPoints,
  type WorkoutPoolsideFocusOption,
} from "@/lib/workouts/shared";
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

export async function GET(request: Request, context: RouteContext) {
  const requestUrl = new URL(request.url);
  const pdfVariant =
    requestUrl.searchParams.get("variant") === "poolside" ? "poolside" : "standard";
  const requestedFocusIds = requestUrl.searchParams.getAll("focusId");
  const useExplicitPoolsideFocusSelection = requestUrl.searchParams.get("focusMode") === "custom";
  const poolsidePrintStyle = normalizeWorkoutPoolsidePrintStyle(
    requestUrl.searchParams.get("printStyle")
  );
  const poolsidePrintLayout = normalizeWorkoutPoolsidePrintLayout(
    requestUrl.searchParams.get("printLayout")
  );
  const poolsideNotationMode = normalizeWorkoutPoolsideNotationMode(
    requestUrl.searchParams.get("notationMode")
  );
  const poolsideRestLayout = normalizeWorkoutPoolsideRestLayout(
    requestUrl.searchParams.get("restLayout")
  );
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
  const [trainingContextSnapshot, athleteProfileSnapshot] =
    pdfVariant === "poolside"
      ? await Promise.all([
          loadTrainingContextSnapshot(supabase, user.id),
          loadAthleteProfileSnapshot(supabase, user.id),
        ])
      : [null, null];
  const focusOptions: WorkoutPoolsideFocusOption[] =
    trainingContextSnapshot?.schemaReady && !trainingContextSnapshot.loadError
      ? trainingContextSnapshot.openFocuses.map((focus) => ({
          id: focus.id,
          title: focus.title,
          description: focus.details,
          isPrimary: focus.isPrimary,
        }))
      : [];
  const focusPoints =
    requestedFocusIds.length > 0 || useExplicitPoolsideFocusSelection
      ? selectWorkoutPoolsideFocusPoints(focusOptions, requestedFocusIds)
      : focusOptions.map((focus) =>
          focus.description ? `${focus.title}: ${focus.description}` : focus.title
        );

  return applySupabaseCookies(
    noStoreHtml(
      buildWorkoutPdfHtmlDocument(workout.draft, {
        draftState: "canonical",
        variant: pdfVariant,
        focusPoints,
        poolsidePrintStyle,
        poolsidePrintLayout,
        poolsideNotationMode,
        poolsideRestLayout,
        swimmerName: athleteProfileSnapshot?.profile?.primaryName ?? null,
        logoUrl: new URL(
          getWorkoutPdfLogoPath({
            variant: pdfVariant,
            poolsidePrintStyle,
          }),
          requestUrl
        ).toString(),
        fontUrl: new URL(BRAND_FONT_PUBLIC_PATH, requestUrl).toString(),
      })
    )
  );
}
