import { NextResponse } from "next/server";
import { buildSwimCapabilityLimitUpserts } from "@/lib/athlete-profile/capabilities";
import { isSwimCapabilityLimitsSchemaMissing } from "@/lib/athlete-profile/schema";
import { loadAthleteProfileSnapshot } from "@/lib/athlete-profile/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import type { Json } from "@/types/database";

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

  const replaceResult = await supabase.rpc("replace_swim_capability_limits", {
    p_limits: nextLimits.value as unknown as Json,
  });

  if (isSwimCapabilityLimitsSchemaMissing(replaceResult.error)) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: SYNCING_ERROR }, { status: 503 }));
  }

  if (replaceResult.error) {
    console.error(
      "[AthleteProfileApi] Could not replace swim capability limits",
      replaceResult.error
    );
    return applySupabaseCookies(noStoreJson({ ok: false, error: SAVE_ERROR }, { status: 500 }));
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      snapshot: await loadAthleteProfileSnapshot(supabase, user.id),
    })
  );
}
