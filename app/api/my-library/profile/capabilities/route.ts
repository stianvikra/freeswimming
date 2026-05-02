import { NextResponse } from "next/server";
import { buildSwimCapabilityLimitUpserts } from "@/lib/athlete-profile/capabilities";
import { isSwimCapabilityLimitsSchemaMissing } from "@/lib/athlete-profile/schema";
import { loadAthleteProfileSnapshot } from "@/lib/athlete-profile/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type SwimCapabilityLimitsRequestBody = Parameters<typeof buildSwimCapabilityLimitUpserts>[0];

const SYNCING_ERROR = "Stroke and skill limits are still syncing in this environment.";
const SAVE_ERROR = "Could not save stroke and skill limits right now.";

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

  let body: SwimCapabilityLimitsRequestBody;
  try {
    body = (await request.json()) as SwimCapabilityLimitsRequestBody;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }

  const nextLimits = buildSwimCapabilityLimitUpserts(body);
  if (nextLimits.kind === "invalid") {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: nextLimits.error }, { status: 400 })
    );
  }

  const deleteResult = await supabase
    .from("swim_capability_limits")
    .delete()
    .eq("user_id", user.id);

  if (isSwimCapabilityLimitsSchemaMissing(deleteResult.error)) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: SYNCING_ERROR }, { status: 503 }));
  }

  if (deleteResult.error) {
    console.error("[AthleteProfileApi] Could not clear swim capability limits", deleteResult.error);
    return applySupabaseCookies(noStoreJson({ ok: false, error: SAVE_ERROR }, { status: 500 }));
  }

  if (nextLimits.value.length > 0) {
    const insertResult = await supabase.from("swim_capability_limits").insert(
      nextLimits.value.map((limit) => ({
        user_id: user.id,
        ...limit,
      }))
    );

    if (isSwimCapabilityLimitsSchemaMissing(insertResult.error)) {
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: SYNCING_ERROR }, { status: 503 })
      );
    }

    if (insertResult.error) {
      console.error(
        "[AthleteProfileApi] Could not save swim capability limits",
        insertResult.error
      );
      return applySupabaseCookies(noStoreJson({ ok: false, error: SAVE_ERROR }, { status: 500 }));
    }
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      snapshot: await loadAthleteProfileSnapshot(supabase, user.id),
    })
  );
}
