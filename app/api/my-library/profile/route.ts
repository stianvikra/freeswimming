import { NextResponse } from "next/server";
import { buildAthleteProfileUpsert, type AthleteAgeBand } from "@/lib/athlete-profile/mvp";
import { ATHLETE_PROFILE_SELECT, loadAthleteProfileSnapshot } from "@/lib/athlete-profile/server";
import { isAthleteProfileSchemaMissing } from "@/lib/athlete-profile/schema";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type AthleteProfileRequestBody = {
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  ageBand?: AthleteAgeBand | "" | null;
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

export async function GET() {
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unauthorized." }, { status: 401 })
    );
  }

  const snapshot = await loadAthleteProfileSnapshot(supabase, user.id);
  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      snapshot,
    })
  );
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

  let body: AthleteProfileRequestBody;
  try {
    body = (await request.json()) as AthleteProfileRequestBody;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }

  const nextProfile = buildAthleteProfileUpsert(body);
  if (!nextProfile) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Add at least one valid swimmer profile detail before saving.",
        },
        { status: 400 }
      )
    );
  }

  const result = await supabase
    .from("athlete_profiles")
    .upsert(
      {
        user_id: user.id,
        ...nextProfile,
      },
      { onConflict: "user_id" }
    )
    .select(ATHLETE_PROFILE_SELECT)
    .single();

  if (isAthleteProfileSchemaMissing(result.error)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Swimmer profile is still syncing in this environment.",
        },
        { status: 503 }
      )
    );
  }

  if (result.error) {
    console.error("[AthleteProfileApi] Could not save swimmer profile", result.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not save swimmer profile right now." },
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
