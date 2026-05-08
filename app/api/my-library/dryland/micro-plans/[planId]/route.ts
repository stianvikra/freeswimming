import { NextResponse } from "next/server";
import {
  applyDrylandMicroBlockStatus,
  buildDrylandMicroPlanRecord,
  deriveDrylandMicroPlanStatus,
  isMicroBlockStatus,
  normalizeDrylandMicroBlocks,
  type DrylandMicroPlanApiResponse,
  type DrylandMicroPlanPatchRequestBody,
  type DrylandMicroPlanStatus,
} from "@/lib/dryland/micro-plans";
import { isDrylandSchemaMissing } from "@/lib/dryland/schema";
import { DRYLAND_MICRO_PLAN_SELECT } from "@/lib/dryland/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import type { Database, Json } from "@/types/database";

type DrylandMicroPlanRow = Database["public"]["Tables"]["dryland_micro_plans"]["Row"];

type RouteContext = {
  params: Promise<{
    planId: string;
  }>;
};

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

function isPlanStatusPatch(
  value: unknown
): value is Extract<DrylandMicroPlanStatus, "active" | "paused"> {
  return value === "active" || value === "paused";
}

export async function PATCH(request: Request, context: RouteContext) {
  const { planId } = await context.params;
  if (!UUID_PATTERN.test(planId)) {
    return noStoreJson({ ok: false, error: "Invalid micro session plan id." }, { status: 400 });
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

  let body: DrylandMicroPlanPatchRequestBody;
  try {
    body = (await request.json()) as DrylandMicroPlanPatchRequestBody;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }

  const planResult = await supabase
    .from("dryland_micro_plans")
    .select(DRYLAND_MICRO_PLAN_SELECT)
    .eq("user_id", user.id)
    .eq("id", planId)
    .maybeSingle();

  if (isDrylandSchemaMissing(planResult.error)) {
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

  if (planResult.error) {
    console.error("[DrylandMicroPlanApi] Could not load micro plan", planResult.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not update micro session plan right now." },
        { status: 500 }
      )
    );
  }

  if (!planResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Micro session plan not found." }, { status: 404 })
    );
  }

  const currentPlan = buildDrylandMicroPlanRecord(planResult.data as DrylandMicroPlanRow);
  let nextBlocks = currentPlan.blocks;
  let nextStatus: DrylandMicroPlanStatus = currentPlan.status;

  if (typeof body.blockId === "string" || body.blockStatus !== undefined) {
    const blockId = typeof body.blockId === "string" ? body.blockId.trim() : "";
    if (!blockId || !isMicroBlockStatus(body.blockStatus)) {
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Invalid micro block update." }, { status: 400 })
      );
    }

    const applied = applyDrylandMicroBlockStatus(nextBlocks, blockId, body.blockStatus);
    if (!applied.ok) {
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: applied.error }, { status: 400 })
      );
    }
    nextBlocks = applied.value;
    nextStatus = deriveDrylandMicroPlanStatus(nextBlocks, nextStatus);
  } else if (body.planStatus !== undefined) {
    if (!isPlanStatusPatch(body.planStatus)) {
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Invalid micro plan status." }, { status: 400 })
      );
    }
    nextStatus = deriveDrylandMicroPlanStatus(nextBlocks, body.planStatus);
  } else {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "No micro plan change was provided." }, { status: 400 })
    );
  }

  const normalizedBlocks = normalizeDrylandMicroBlocks(nextBlocks);
  if (!normalizedBlocks.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: normalizedBlocks.error }, { status: 400 })
    );
  }

  const updateResult = await supabase
    .from("dryland_micro_plans")
    .update({
      blocks: normalizedBlocks.value as unknown as Json,
      status: nextStatus,
    })
    .eq("user_id", user.id)
    .eq("id", planId)
    .select(DRYLAND_MICRO_PLAN_SELECT)
    .maybeSingle();

  if (isDrylandSchemaMissing(updateResult.error)) {
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

  if (updateResult.error) {
    console.error("[DrylandMicroPlanApi] Could not update micro plan", updateResult.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not update micro session plan right now." },
        { status: 500 }
      )
    );
  }

  if (!updateResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Micro session plan not found." }, { status: 404 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      plan: buildDrylandMicroPlanRecord(updateResult.data as DrylandMicroPlanRow),
    })
  );
}
