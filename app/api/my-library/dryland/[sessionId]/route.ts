import { NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import { isDrylandSchemaMissing } from "@/lib/dryland/schema";
import { buildDrylandUpdate, DRYLAND_SELECT } from "@/lib/dryland/server";
import {
  buildDrylandSessionRecord,
  buildDrylandSessionSummary,
  DrylandDeleteApiResponse,
  DrylandSaveApiResponse,
  DrylandSaveRequestBody,
} from "@/lib/dryland/shared";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function noStoreJson(
  body: DrylandSaveApiResponse | DrylandDeleteApiResponse | Record<string, unknown>,
  init?: { status?: number }
) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  if (!UUID_PATTERN.test(sessionId)) {
    return noStoreJson({ ok: false, error: "Invalid dryland session id." }, { status: 400 });
  }

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

  let patch;
  try {
    patch = buildDrylandUpdate(body.draft ?? null);
  } catch (error) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error:
            error instanceof Error ? error.message : "Could not save dryland session right now.",
        },
        { status: 400 }
      )
    );
  }

  const result = await supabase
    .from("dryland_sessions")
    .update(patch)
    .eq("user_id", user.id)
    .eq("id", sessionId)
    .select(DRYLAND_SELECT)
    .maybeSingle();

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
    console.error("[DrylandApi] Could not update dryland session", result.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not save dryland session right now." },
        { status: 500 }
      )
    );
  }

  if (!result.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Dryland session not found." }, { status: 404 })
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

export async function DELETE(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  if (!UUID_PATTERN.test(sessionId)) {
    return noStoreJson({ ok: false, error: "Invalid dryland session id." }, { status: 400 });
  }

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
    .from("dryland_sessions")
    .delete()
    .eq("user_id", user.id)
    .eq("id", sessionId)
    .select("id")
    .maybeSingle();

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
    console.error("[DrylandApi] Could not delete dryland session", result.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not delete dryland session right now." },
        { status: 500 }
      )
    );
  }

  if (!result.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Dryland session not found." }, { status: 404 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      deletedSessionId: sessionId,
    })
  );
}
