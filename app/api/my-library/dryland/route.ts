import { NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import { isDrylandSchemaMissing } from "@/lib/dryland/schema";
import {
  buildDrylandInsert,
  DRYLAND_SELECT,
  normalizeDrylandSessionKindInput,
  normalizeDrylandSourceKind,
} from "@/lib/dryland/server";
import {
  buildDrylandSessionRecord,
  buildDrylandSessionSummary,
  type DrylandSaveApiResponse,
  type DrylandSaveRequestBody,
} from "@/lib/dryland/shared";

function noStoreJson(
  body: DrylandSaveApiResponse | Record<string, unknown>,
  init?: { status?: number }
) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
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

  let body: DrylandSaveRequestBody;
  try {
    body = (await request.json()) as DrylandSaveRequestBody;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }

  let insertPayload;
  try {
    insertPayload = buildDrylandInsert(
      user.id,
      body.draft ?? null,
      normalizeDrylandSessionKindInput(body.sessionKind),
      normalizeDrylandSourceKind(body.sourceKind)
    );
  } catch (error) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error:
            error instanceof Error ? error.message : "Could not create dryland session right now.",
        },
        { status: 400 }
      )
    );
  }

  const result = await supabase
    .from("dryland_sessions")
    .insert(insertPayload)
    .select(DRYLAND_SELECT)
    .single();

  if (isDrylandSchemaMissing(result.error)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Dryland builder is still syncing in this environment.",
        },
        { status: 503 }
      )
    );
  }

  if (result.error) {
    console.error("[DrylandApi] Could not create dryland session", result.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not create dryland session right now." },
        { status: 500 }
      )
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      session: buildDrylandSessionRecord(result.data),
      summary: buildDrylandSessionSummary(result.data),
    })
  );
}
