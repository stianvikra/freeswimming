import { NextResponse } from "next/server";
import { buildCssMetricUpsert } from "@/lib/athlete-profile/training-setup";
import { loadAthleteProfileSnapshot } from "@/lib/athlete-profile/server";
import { isTrainingMetricSchemaMissing } from "@/lib/athlete-profile/schema";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type TrainingMetricRequestBody = {
  pace?: string | null;
  recordedOn?: string | null;
  sourceNote?: string | null;
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

  let body: TrainingMetricRequestBody;
  try {
    body = (await request.json()) as TrainingMetricRequestBody;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }

  const nextMetric = buildCssMetricUpsert(body);

  if (nextMetric.kind === "invalid") {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: nextMetric.error }, { status: 400 })
    );
  }

  if (nextMetric.kind === "empty") {
    const deleteResult = await supabase
      .from("training_metrics")
      .delete()
      .eq("user_id", user.id)
      .eq("metric_key", "css");

    if (isTrainingMetricSchemaMissing(deleteResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Training metrics are still syncing in this environment." },
          { status: 503 }
        )
      );
    }

    if (deleteResult.error) {
      console.error("[AthleteProfileApi] Could not clear training metric", deleteResult.error);
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Could not clear CSS right now." }, { status: 500 })
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
    .from("training_metrics")
    .upsert(
      {
        user_id: user.id,
        ...nextMetric.value,
      },
      { onConflict: "user_id,metric_key" }
    )
    .select("id")
    .single();

  if (isTrainingMetricSchemaMissing(result.error)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Training metrics are still syncing in this environment.",
        },
        { status: 503 }
      )
    );
  }

  if (result.error) {
    console.error("[AthleteProfileApi] Could not save training metric", result.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not save CSS right now." }, { status: 500 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      snapshot: await loadAthleteProfileSnapshot(supabase, user.id),
    })
  );
}
