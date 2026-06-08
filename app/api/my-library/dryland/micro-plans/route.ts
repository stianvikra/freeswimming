import { NextResponse } from "next/server";
import { isDrylandSchemaMissing } from "@/lib/dryland/schema";
import { loadDrylandMicroHabitLinkRecord } from "@/lib/dryland/micro-habit-linkage";
import {
  buildDrylandMicroPlanInsert,
  DRYLAND_MICRO_PLAN_SELECT,
  DRYLAND_SELECT,
} from "@/lib/dryland/server";
import {
  buildDrylandMicroPlanRecord,
  normalizeDrylandMicroSourceIds,
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

function isStaleMicroPlan(plan: ReturnType<typeof buildDrylandMicroPlanRecord>, now: Date) {
  const weekEndsAtMs = Date.parse(plan.weekEndsAt);
  return Number.isFinite(weekEndsAtMs) && weekEndsAtMs <= now.getTime();
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

  const sourceIds = normalizeDrylandMicroSourceIds(
    body.sourceDrylandSessionIds,
    body.sourceDrylandSessionId
  );
  if (!sourceIds.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: sourceIds.error }, { status: 400 })
    );
  }

  if (sourceIds.value.some((sourceId) => !UUID_PATTERN.test(sourceId))) {
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
    const existingPlanRow = existingPlanResult.data as DrylandMicroPlanRow;
    const habitLink = await loadDrylandMicroHabitLinkRecord(supabase, user.id, existingPlanRow.id);
    const existingPlan = buildDrylandMicroPlanRecord(existingPlanRow, habitLink);
    if (!isStaleMicroPlan(existingPlan, new Date()) || habitLink) {
      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          plan: existingPlan,
          reusedExisting: true,
        })
      );
    }

    const archiveResult = await supabase
      .from("dryland_micro_plans")
      .update({ status: "completed" })
      .eq("user_id", user.id)
      .eq("id", existingPlanRow.id);

    if (archiveResult.error) {
      console.error("[DrylandMicroPlanApi] Could not archive stale micro plan", {
        planId: existingPlanRow.id,
        error: archiveResult.error,
      });
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Could not start this week's Micro Session right now." },
          { status: 500 }
        )
      );
    }
  }

  const sourceResult = await supabase
    .from("dryland_sessions")
    .select(DRYLAND_SELECT)
    .eq("user_id", user.id)
    .in("id", sourceIds.value);

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

  const sourceRows = ((sourceResult.data ?? []) as DrylandRow[]).slice().sort((first, second) => {
    return sourceIds.value.indexOf(first.id) - sourceIds.value.indexOf(second.id);
  });

  if (sourceRows.length !== sourceIds.value.length) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "One or more dryland sessions were not found." },
        { status: 404 }
      )
    );
  }

  let insertPayload;
  try {
    insertPayload = buildDrylandMicroPlanInsert(user.id, sourceRows, body.timezone, {
      title: body.title,
      releaseMode: body.releaseMode,
      releaseTime: body.releaseTime,
      sourceReleaseOffsetDays: body.sourceReleaseOffsetDays,
    });
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
      plan: buildDrylandMicroPlanRecord(insertResult.data as DrylandMicroPlanRow, null),
    })
  );
}
