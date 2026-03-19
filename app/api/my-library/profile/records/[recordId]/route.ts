import { NextResponse } from "next/server";
import { buildPersonalRecordUpsert } from "@/lib/athlete-profile/personal-records";
import { PERSONAL_RECORD_SELECT, loadAthleteProfileSnapshot } from "@/lib/athlete-profile/server";
import { isPersonalRecordsSchemaMissing } from "@/lib/athlete-profile/schema";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type PersonalRecordRequestBody = {
  distanceM?: number | string | null;
  stroke?: string | null;
  course?: string | null;
  time?: string | null;
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

function isDuplicateEventError(error: { code?: string | null } | null | undefined) {
  return error?.code === "23505";
}

export async function PUT(
  request: Request,
  context: {
    params: Promise<{ recordId: string }>;
  }
) {
  const { recordId } = await context.params;
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unauthorized." }, { status: 401 })
    );
  }

  let body: PersonalRecordRequestBody;
  try {
    body = (await request.json()) as PersonalRecordRequestBody;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }

  const nextRecord = buildPersonalRecordUpsert(body);
  if (nextRecord.kind === "empty") {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Add distance, stroke, course, and time before saving." },
        { status: 400 }
      )
    );
  }

  if (nextRecord.kind === "invalid") {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: nextRecord.error }, { status: 400 })
    );
  }

  const result = await supabase
    .from("personal_records")
    .update(nextRecord.value)
    .eq("id", recordId)
    .eq("user_id", user.id)
    .select(PERSONAL_RECORD_SELECT)
    .maybeSingle();

  if (isPersonalRecordsSchemaMissing(result.error)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Personal records are still syncing in this environment." },
        { status: 503 }
      )
    );
  }

  if (isDuplicateEventError(result.error)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "A personal record for this event already exists. Update that record instead.",
        },
        { status: 409 }
      )
    );
  }

  if (result.error) {
    console.error("[PersonalRecordsApi] Could not update personal record", result.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not update personal record right now." },
        { status: 500 }
      )
    );
  }

  if (!result.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Personal record not found." }, { status: 404 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      recordId: result.data.id,
      snapshot: await loadAthleteProfileSnapshot(supabase, user.id),
    })
  );
}

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{ recordId: string }>;
  }
) {
  const { recordId } = await context.params;
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
    .from("personal_records")
    .delete()
    .eq("id", recordId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (isPersonalRecordsSchemaMissing(result.error)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Personal records are still syncing in this environment." },
        { status: 503 }
      )
    );
  }

  if (result.error) {
    console.error("[PersonalRecordsApi] Could not delete personal record", result.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not delete personal record right now." },
        { status: 500 }
      )
    );
  }

  if (!result.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Personal record not found." }, { status: 404 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      snapshot: await loadAthleteProfileSnapshot(supabase, user.id),
    })
  );
}
