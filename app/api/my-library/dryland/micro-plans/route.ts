import { NextResponse } from "next/server";
import { isDrylandSchemaMissing } from "@/lib/dryland/schema";
import {
  buildDrylandMicroPlanInsert,
  DRYLAND_MICRO_PLAN_SELECT,
  DRYLAND_SELECT,
} from "@/lib/dryland/server";
import {
  buildDrylandMicroPlanRecord,
  type DrylandMicroPlanApiResponse,
  type DrylandMicroPlanCreateRequestBody,
} from "@/lib/dryland/micro-plans";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import type { Database } from "@/types/database";

type DrylandRow = Database["public"]["Tables"]["dryland_sessions"]["Row"];
type DrylandMicroPlanRow = Database["public"]["Tables"]["dryland_micro_plans"]["Row"];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function noStoreJson(
  body: DrylandMicroPlanApiResponse | Record<string, unknown>,
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

  let body: DrylandMicroPlanCreateRequestBody;
  try {
    body = (await request.json()) as DrylandMicroPlanCreateRequestBody;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }

  const sourceDrylandSessionId =
    typeof body.sourceDrylandSessionId === "string" ? body.sourceDrylandSessionId.trim() : "";
  if (!UUID_PATTERN.test(sourceDrylandSessionId)) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid dryland session id." }, { status: 400 })
    );
  }

  const existingPlanResult = await supabase
    .from("dryland_micro_plans")
    .select(DRYLAND_MICRO_PLAN_SELECT)
    .eq("user_id", user.id)
    .in("status", ["active", "paused"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (isDrylandSchemaMissing(existingPlanResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Micro Sessions are still syncing in this environment.",
        },
        { status: 503 }
      )
    );
  }

  if (existingPlanResult.error) {
    console.error(
      "[DrylandMicroPlanApi] Could not load active micro plan",
      existingPlanResult.error
    );
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not start a micro session plan right now." },
        { status: 500 }
      )
    );
  }

  if (existingPlanResult.data) {
    return applySupabaseCookies(
      noStoreJson({
        ok: true,
        plan: buildDrylandMicroPlanRecord(existingPlanResult.data as DrylandMicroPlanRow),
        reusedExisting: true,
      })
    );
  }

  const sourceResult = await supabase
    .from("dryland_sessions")
    .select(DRYLAND_SELECT)
    .eq("user_id", user.id)
    .eq("id", sourceDrylandSessionId)
    .maybeSingle();

  if (isDrylandSchemaMissing(sourceResult.error)) {
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

  if (sourceResult.error) {
    console.error(
      "[DrylandMicroPlanApi] Could not load source dryland session",
      sourceResult.error
    );
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not start a micro session plan right now." },
        { status: 500 }
      )
    );
  }

  if (!sourceResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Dryland session not found." }, { status: 404 })
    );
  }

  let insertPayload;
  try {
    insertPayload = buildDrylandMicroPlanInsert(
      user.id,
      sourceResult.data as DrylandRow,
      body.timezone
    );
  } catch (error) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Could not start a micro session plan right now.",
        },
        { status: 400 }
      )
    );
  }

  const insertResult = await supabase
    .from("dryland_micro_plans")
    .insert(insertPayload)
    .select(DRYLAND_MICRO_PLAN_SELECT)
    .single();

  if (isDrylandSchemaMissing(insertResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Micro Sessions are still syncing in this environment.",
        },
        { status: 503 }
      )
    );
  }

  if (insertResult.error) {
    console.error("[DrylandMicroPlanApi] Could not create micro plan", insertResult.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not start a micro session plan right now." },
        { status: 500 }
      )
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      plan: buildDrylandMicroPlanRecord(insertResult.data as DrylandMicroPlanRow),
    })
  );
}
