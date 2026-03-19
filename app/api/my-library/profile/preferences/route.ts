import { NextResponse } from "next/server";
import { buildTrainingPreferencesUpsert } from "@/lib/athlete-profile/training-setup";
import { loadAthleteProfileSnapshot } from "@/lib/athlete-profile/server";
import { isTrainingPreferencesSchemaMissing } from "@/lib/athlete-profile/schema";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type TrainingPreferencesRequestBody = {
  poolLengthM?: number | string | null;
  availableDays?: string[] | null;
  preferredWeeklySessionCount?: number | string | null;
  preferredSessionMinutes?: number | string | null;
};

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

export async function PUT(request: Request) {
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unauthorized." }, { status: 401 })
    );
  }

  let body: TrainingPreferencesRequestBody;
  try {
    body = (await request.json()) as TrainingPreferencesRequestBody;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }

  const nextPreferences = buildTrainingPreferencesUpsert(body);

  if (nextPreferences.kind === "invalid") {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: nextPreferences.error }, { status: 400 })
    );
  }

  if (nextPreferences.kind === "empty") {
    const deleteResult = await supabase
      .from("training_preferences")
      .delete()
      .eq("user_id", user.id);

    if (isTrainingPreferencesSchemaMissing(deleteResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: "Training preferences are still syncing in this environment.",
          },
          { status: 503 }
        )
      );
    }

    if (deleteResult.error) {
      console.error("[AthleteProfileApi] Could not clear training preferences", deleteResult.error);
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Could not clear training preferences right now." },
          { status: 500 }
        )
      );
    }

    return applySupabaseCookies(
      noStoreJson({
        ok: true,
        snapshot: await loadAthleteProfileSnapshot(supabase, user.id),
      })
    );
  }

  const result = await supabase
    .from("training_preferences")
    .upsert(
      {
        user_id: user.id,
        ...nextPreferences.value,
      },
      { onConflict: "user_id" }
    )
    .select("id")
    .single();

  if (isTrainingPreferencesSchemaMissing(result.error)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Training preferences are still syncing in this environment.",
        },
        { status: 503 }
      )
    );
  }

  if (result.error) {
    console.error("[AthleteProfileApi] Could not save training preferences", result.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not save training preferences right now." },
        { status: 500 }
      )
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      snapshot: await loadAthleteProfileSnapshot(supabase, user.id),
    })
  );
}
