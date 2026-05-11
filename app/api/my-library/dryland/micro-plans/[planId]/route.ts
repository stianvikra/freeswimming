import { NextResponse } from "next/server";
import {
  applyDrylandMicroBlockStatus,
  applyDrylandMicroBlockReleaseNow,
  buildDrylandMicroBlocksFromSources,
  buildDrylandMicroPlanRecord,
  deriveDrylandMicroPlanStatus,
  isMicroBlockStatus,
  mergeDrylandMicroBlocksForPlanEdit,
  normalizeDrylandMicroBlocks,
  normalizeDrylandMicroSourceIds,
  normalizeDrylandMicroReleaseMode,
  normalizeDrylandMicroReleaseTime,
  type DrylandMicroPlanApiResponse,
  type DrylandMicroPlanPatchRequestBody,
  type DrylandMicroPlanStatus,
} from "@/lib/dryland/micro-plans";
import { isDrylandSchemaMissing } from "@/lib/dryland/schema";
import { DRYLAND_MICRO_PLAN_SELECT, DRYLAND_SELECT } from "@/lib/dryland/server";
import { buildDrylandSessionRecord } from "@/lib/dryland/shared";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import type { Database, Json } from "@/types/database";

type DrylandMicroPlanRow = Database["public"]["Tables"]["dryland_micro_plans"]["Row"];
type DrylandRow = Database["public"]["Tables"]["dryland_sessions"]["Row"];
type DrylandMicroPlanUpdate = Database["public"]["Tables"]["dryland_micro_plans"]["Update"];

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
  const updatePayload: DrylandMicroPlanUpdate = {};

  if (body.clearPlan === true) {
    nextStatus = "completed";
  } else if (typeof body.blockId === "string" || body.blockStatus !== undefined) {
    const blockId = typeof body.blockId === "string" ? body.blockId.trim() : "";
    if (body.releaseNow === true) {
      if (!blockId) {
        return applySupabaseCookies(
          noStoreJson({ ok: false, error: "Invalid micro unit release update." }, { status: 400 })
        );
      }

      const applied = applyDrylandMicroBlockReleaseNow(nextBlocks, blockId);
      if (!applied.ok) {
        return applySupabaseCookies(
          noStoreJson({ ok: false, error: applied.error }, { status: 400 })
        );
      }
      nextBlocks = applied.value;
    } else {
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
    }
  } else if (body.planStatus !== undefined) {
    if (!isPlanStatusPatch(body.planStatus)) {
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Invalid micro plan status." }, { status: 400 })
      );
    }
    nextStatus = deriveDrylandMicroPlanStatus(nextBlocks, body.planStatus);
  } else if (
    body.title !== undefined ||
    body.sourceDrylandSessionIds !== undefined ||
    body.releaseMode !== undefined ||
    body.releaseTime !== undefined ||
    body.sourceReleaseOffsetDays !== undefined
  ) {
    if (body.title !== undefined) {
      const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
      if (!title) {
        return applySupabaseCookies(
          noStoreJson({ ok: false, error: "Micro session title is required." }, { status: 400 })
        );
      }
      updatePayload.title = title;
    }

    if (body.sourceDrylandSessionIds !== undefined) {
      const sourceIds = normalizeDrylandMicroSourceIds(body.sourceDrylandSessionIds);
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
          "[DrylandMicroPlanApi] Could not load source dryland sessions for edit",
          sourceResult.error
        );
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Could not update micro session plan right now." },
            { status: 500 }
          )
        );
      }

      const sourceRows = ((sourceResult.data ?? []) as DrylandRow[])
        .slice()
        .sort((first, second) => {
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

      const sourceRecords = sourceRows.map((sourceRow) => buildDrylandSessionRecord(sourceRow));
      const generatedBlocks = buildDrylandMicroBlocksFromSources(
        sourceRecords.map((sourceRecord) => ({
          sourceDrylandSessionId: sourceRecord.id,
          draft: sourceRecord.draft,
        })),
        {
          releaseMode: body.releaseMode !== undefined ? body.releaseMode : currentPlan.releaseMode,
          releaseTime: body.releaseTime !== undefined ? body.releaseTime : currentPlan.releaseTime,
          sourceReleaseOffsetDays: body.sourceReleaseOffsetDays,
        }
      );
      if (!generatedBlocks.ok) {
        return applySupabaseCookies(
          noStoreJson({ ok: false, error: generatedBlocks.error }, { status: 400 })
        );
      }

      nextBlocks = mergeDrylandMicroBlocksForPlanEdit(currentPlan.blocks, generatedBlocks.value);
      const primarySource = sourceRows[0];
      const primaryRecord = sourceRecords[0];
      if (primarySource && primaryRecord) {
        updatePayload.source_dryland_session_id = primarySource.id;
        updatePayload.session_kind = primaryRecord.draft.sessionKind;
        updatePayload.source_session_title =
          sourceRecords.length === 1
            ? primaryRecord.draft.title.slice(0, 120)
            : `${sourceRecords.length} source sessions`;
      }
    } else if (body.releaseMode !== undefined || body.releaseTime !== undefined) {
      const releaseMode =
        body.releaseMode !== undefined
          ? normalizeDrylandMicroReleaseMode(body.releaseMode)
          : currentPlan.releaseMode;
      const releaseTime =
        body.releaseTime !== undefined
          ? normalizeDrylandMicroReleaseTime(body.releaseTime)
          : currentPlan.releaseTime;

      nextBlocks = currentPlan.blocks.map((block) =>
        block.isArchived
          ? block
          : {
              ...block,
              releaseMode,
              releaseTime,
              releaseOffsetDays: releaseMode === "weekday" ? (block.releaseOffsetDays ?? 0) : null,
              releasedAt:
                releaseMode === "available_now"
                  ? (block.releasedAt ?? new Date(0).toISOString())
                  : null,
            }
      );
    }
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
      ...updatePayload,
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
