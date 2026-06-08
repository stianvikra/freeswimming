import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import {
  applyDrylandMicroBlockStatus,
  applyDrylandMicroBlockReleaseNow,
  buildDrylandMicroBlocksFromSources,
  buildDrylandMicroPlanRecord,
  deriveDrylandMicroPlanStatus,
  getDrylandMicroWeeklyProgramCreditBlockId,
  isDrylandMicroWeeklyProgramComplete,
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
import {
  buildDrylandMicroHabitLinkRecord,
  loadDrylandMicroHabitLinkRecord,
  MICRO_SESSION_HABIT_LINK_SELECT,
  removeMicroSessionHabitCredit,
  recordMicroSessionHabitCredit,
} from "@/lib/dryland/micro-habit-linkage";
import { isDrylandSchemaMissing } from "@/lib/dryland/schema";
import {
  buildDrylandMicroPlanInsert,
  DRYLAND_MICRO_PLAN_SELECT,
  DRYLAND_SELECT,
} from "@/lib/dryland/server";
import { buildDrylandSessionRecord } from "@/lib/dryland/shared";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import { HABIT_DEFINITION_SELECT } from "@/lib/habits/server";
import {
  buildHabitDefinitionInsert,
  normalizeHabitDate,
  type HabitDefinitionRow,
} from "@/lib/habits/shared";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import type { Database, Json } from "@/types/database";

type DrylandMicroPlanRow = Database["public"]["Tables"]["dryland_micro_plans"]["Row"];
type DrylandRow = Database["public"]["Tables"]["dryland_sessions"]["Row"];
type DrylandMicroPlanUpdate = Database["public"]["Tables"]["dryland_micro_plans"]["Update"];
type MicroSessionHabitLinkRow = Database["public"]["Tables"]["micro_session_habit_links"]["Row"];

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

function isHabitLinkStatusPatch(value: unknown): value is "active" | "paused" {
  return value === "active" || value === "paused";
}

function buildMicroHabitTitle(bodyTitle: unknown, fallbackTitle: string) {
  const explicitTitle = typeof bodyTitle === "string" ? bodyTitle.trim() : "";
  const fallback = fallbackTitle.replace(/^MS:\s*/i, "").trim() || fallbackTitle.trim();
  return (explicitTitle || fallback || "Weekly Micro Sessions").slice(0, 80);
}

function getSourceReleaseOffsets(plan: ReturnType<typeof buildDrylandMicroPlanRecord>) {
  return plan.sourceSessionSnapshots.reduce<Record<string, number>>((offsets, source) => {
    if (source.sourceDrylandSessionId && source.releaseOffsetDays !== null) {
      offsets[source.sourceDrylandSessionId] = source.releaseOffsetDays;
    }
    return offsets;
  }, {});
}

function isStaleMicroPlan(plan: ReturnType<typeof buildDrylandMicroPlanRecord>, now: Date) {
  const weekEndsAtMs = Date.parse(plan.weekEndsAt);
  return Number.isFinite(weekEndsAtMs) && weekEndsAtMs <= now.getTime();
}

function isDateInMicroPlanWeek(
  plan: ReturnType<typeof buildDrylandMicroPlanRecord>,
  selectedDate: unknown
) {
  if (typeof selectedDate !== "string") return false;
  const normalizedDate = normalizeHabitDate(selectedDate);
  const selectedDateNoonMs = Date.parse(`${normalizedDate}T12:00:00.000Z`);
  const weekStartsAtMs = Date.parse(plan.weekStartsAt);
  const weekEndsAtMs = Date.parse(plan.weekEndsAt);
  return (
    Number.isFinite(selectedDateNoonMs) &&
    Number.isFinite(weekStartsAtMs) &&
    Number.isFinite(weekEndsAtMs) &&
    selectedDateNoonMs >= weekStartsAtMs &&
    selectedDateNoonMs < weekEndsAtMs
  );
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

  const currentPlan = buildDrylandMicroPlanRecord(planResult.data as DrylandMicroPlanRow, null);
  let nextBlocks = currentPlan.blocks;
  let nextStatus: DrylandMicroPlanStatus = currentPlan.status;
  const updatePayload: DrylandMicroPlanUpdate = {};
  const mutationNow = new Date();
  let shouldAttemptHabitCredit = false;
  let shouldRemoveHabitCredit = false;
  let shouldResumePausedHabitLinkForCredit = false;
  let creditBlockId: string | null = null;

  if (body.createRecurringHabit === true) {
    if (isStaleMicroPlan(currentPlan, mutationNow)) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Start this week's Micro Session before linking a Habit." },
          { status: 400 }
        )
      );
    }

    let existingLink;
    try {
      existingLink = await loadDrylandMicroHabitLinkRecord(supabase, user.id, planId, {
        required: true,
      });
    } catch (error) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error:
              error instanceof Error ? error.message : "Could not create a linked habit right now.",
          },
          { status: 503 }
        )
      );
    }

    if (existingLink) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "This Micro Session is already linked to a Habit." },
          { status: 400 }
        )
      );
    }

    const activeHabitResult = await supabase
      .from("habit_definitions")
      .select("id, sort_order, status")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (isHabitsSchemaMissing(activeHabitResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Habits are still syncing in this environment." },
          { status: 503 }
        )
      );
    }

    if (activeHabitResult.error) {
      console.error("[DrylandMicroPlanApi] Could not load habits before linkage", {
        planId,
        error: activeHabitResult.error,
      });
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Could not create a linked habit right now." },
          { status: 500 }
        )
      );
    }

    const activeHabitRows = (activeHabitResult.data ?? []) as Array<{
      id: string;
      sort_order: number | null;
      status: string | null;
    }>;
    if (activeHabitRows.length >= 12) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Archive one habit before adding another." },
          { status: 400 }
        )
      );
    }

    const selectedDate = normalizeHabitDate(body.selectedDate);
    let habitInsertPayload;
    try {
      habitInsertPayload = buildHabitDefinitionInsert(
        user.id,
        {
          title: buildMicroHabitTitle(body.habitTitle, currentPlan.title),
          habitMode: "build",
          habitType: "binary",
          category: "movement",
          startDate: body.habitStartDate ?? selectedDate,
          selectedDate,
          cadencePeriod: "weekly",
          cadenceTargetCount: 1,
          cadenceDayPolicy: "any",
          scheduleDays: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
          isPerfectDayItem: false,
        },
        activeHabitRows.reduce((max, row) => Math.max(max, row.sort_order ?? 0), 0) + 1
      );
    } catch (error) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: error instanceof Error ? error.message : "Could not create that habit.",
          },
          { status: 400 }
        )
      );
    }

    if (
      isDrylandMicroWeeklyProgramComplete(currentPlan.blocks) &&
      !isDateInMicroPlanWeek(currentPlan, selectedDate)
    ) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "This completion does not belong to the Micro Session week." },
          { status: 400 }
        )
      );
    }

    const habitInsertResult = await supabase
      .from("habit_definitions")
      .insert(habitInsertPayload)
      .select(HABIT_DEFINITION_SELECT)
      .single();

    if (isHabitsSchemaMissing(habitInsertResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Habits are still syncing in this environment." },
          { status: 503 }
        )
      );
    }

    if (habitInsertResult.error) {
      console.error("[DrylandMicroPlanApi] Could not create linked habit", {
        planId,
        error: habitInsertResult.error,
      });
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Could not create a linked habit right now." },
          { status: 500 }
        )
      );
    }

    const habitRow = habitInsertResult.data as HabitDefinitionRow;
    const linkInsertResult = await supabase
      .from("micro_session_habit_links")
      .insert({
        user_id: user.id,
        dryland_micro_plan_id: planId,
        habit_id: habitRow.id,
        status: "active",
        starts_on: habitInsertPayload.start_date ?? selectedDate,
        resumed_at: mutationNow.toISOString(),
      })
      .select(MICRO_SESSION_HABIT_LINK_SELECT)
      .single();

    if (isDrylandSchemaMissing(linkInsertResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Micro Session habit linkage is still syncing in this environment." },
          { status: 503 }
        )
      );
    }

    if (linkInsertResult.error) {
      console.error("[DrylandMicroPlanApi] Could not create micro habit link", {
        planId,
        habitId: habitRow.id,
        error: linkInsertResult.error,
      });
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Could not link that habit right now." }, { status: 500 })
      );
    }

    const linkRecord = buildDrylandMicroHabitLinkRecord(
      linkInsertResult.data as MicroSessionHabitLinkRow,
      habitRow
    );
    let habitCredit;
    if (isDrylandMicroWeeklyProgramComplete(currentPlan.blocks)) {
      const completedBlockId = getDrylandMicroWeeklyProgramCreditBlockId(currentPlan.blocks);
      habitCredit = completedBlockId
        ? await recordMicroSessionHabitCredit(supabase, {
            userId: user.id,
            planId,
            blockId: completedBlockId,
            link: linkRecord,
            selectedDate,
            timezone: body.timezone,
            completedAt: mutationNow.toISOString(),
          })
        : {
            status: "blocked" as const,
            message: "Complete the weekly Micro Session before counting this Habit.",
          };
    }

    trackAnalyticsEvent({
      eventName: "micro_session_habit_link_created",
      channel: "server",
      userId: user.id,
      payload: {
        cadencePeriod: "weekly",
        cadenceDayPolicy: "any",
        cadenceTargetCount: 1,
        countPolicy: "weekly_program_complete",
        habitCreditStatus: habitCredit?.status ?? null,
      },
    });

    return applySupabaseCookies(
      noStoreJson({
        ok: true,
        plan: buildDrylandMicroPlanRecord(planResult.data as DrylandMicroPlanRow, linkRecord),
        habitCredit,
      })
    );
  } else if (body.habitLinkStatus !== undefined) {
    if (!isHabitLinkStatusPatch(body.habitLinkStatus)) {
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Invalid linked habit status." }, { status: 400 })
      );
    }

    let existingLink;
    try {
      existingLink = await loadDrylandMicroHabitLinkRecord(supabase, user.id, planId, {
        required: true,
      });
    } catch (error) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error:
              error instanceof Error
                ? error.message
                : "Could not update the linked habit right now.",
          },
          { status: 503 }
        )
      );
    }

    if (!existingLink) {
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Linked habit not found." }, { status: 404 })
      );
    }

    const nextLinkStatus = body.habitLinkStatus;
    const shouldRenewStaleLinkedPlan =
      nextLinkStatus === "active" &&
      (existingLink.status === "paused" || existingLink.status === "active") &&
      isStaleMicroPlan(currentPlan, mutationNow);

    if (shouldRenewStaleLinkedPlan) {
      const sourceIds = currentPlan.sourceSessionSnapshots
        .map((source) => source.sourceDrylandSessionId)
        .filter((sourceId): sourceId is string => Boolean(sourceId));

      if (sourceIds.length === 0) {
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Linked source sessions are unavailable." },
            { status: 400 }
          )
        );
      }

      const sourceResult = await supabase
        .from("dryland_sessions")
        .select(DRYLAND_SELECT)
        .eq("user_id", user.id)
        .in("id", sourceIds);

      if (isDrylandSchemaMissing(sourceResult.error)) {
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Dryland builder is still syncing in this environment." },
            { status: 503 }
          )
        );
      }

      if (sourceResult.error) {
        console.error("[DrylandMicroPlanApi] Could not load sources for linked renewal", {
          planId,
          error: sourceResult.error,
        });
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Could not resume the linked habit right now." },
            { status: 500 }
          )
        );
      }

      const sourceRows = ((sourceResult.data ?? []) as DrylandRow[])
        .slice()
        .sort((first, second) => sourceIds.indexOf(first.id) - sourceIds.indexOf(second.id));
      if (sourceRows.length !== sourceIds.length) {
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "One or more linked source sessions were not found." },
            { status: 404 }
          )
        );
      }

      let newPlanInsertPayload;
      try {
        newPlanInsertPayload = buildDrylandMicroPlanInsert(
          user.id,
          sourceRows,
          body.timezone ?? currentPlan.timezone,
          {
            title: currentPlan.title,
            releaseMode: currentPlan.releaseMode,
            releaseTime: currentPlan.releaseTime,
            sourceReleaseOffsetDays: getSourceReleaseOffsets(currentPlan),
          },
          mutationNow
        );
      } catch (error) {
        return applySupabaseCookies(
          noStoreJson(
            {
              ok: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Could not resume the linked habit right now.",
            },
            { status: 400 }
          )
        );
      }

      const completeOldPlanResult = await supabase
        .from("dryland_micro_plans")
        .update({ status: "completed" })
        .eq("user_id", user.id)
        .eq("id", planId);

      if (completeOldPlanResult.error) {
        console.error("[DrylandMicroPlanApi] Could not archive stale linked micro plan", {
          planId,
          error: completeOldPlanResult.error,
        });
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Could not resume the linked habit right now." },
            { status: 500 }
          )
        );
      }

      const endOldLinkResult = await supabase
        .from("micro_session_habit_links")
        .update({
          status: "ended",
          ended_at: mutationNow.toISOString(),
        })
        .eq("user_id", user.id)
        .eq("id", existingLink.id);

      if (endOldLinkResult.error) {
        await supabase
          .from("dryland_micro_plans")
          .update({ status: currentPlan.status })
          .eq("user_id", user.id)
          .eq("id", planId);
        console.error("[DrylandMicroPlanApi] Could not end stale micro habit link", {
          planId,
          linkId: existingLink.id,
          error: endOldLinkResult.error,
        });
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Could not resume the linked habit right now." },
            { status: 500 }
          )
        );
      }

      const newPlanResult = await supabase
        .from("dryland_micro_plans")
        .insert(newPlanInsertPayload)
        .select(DRYLAND_MICRO_PLAN_SELECT)
        .single();

      if (newPlanResult.error) {
        await supabase
          .from("micro_session_habit_links")
          .update({
            status: existingLink.status === "active" ? "active" : "paused",
            paused_at:
              existingLink.status === "paused"
                ? (existingLink.pausedAt ?? mutationNow.toISOString())
                : existingLink.pausedAt,
            resumed_at:
              existingLink.status === "active"
                ? (existingLink.resumedAt ?? mutationNow.toISOString())
                : existingLink.resumedAt,
            ended_at: null,
          })
          .eq("user_id", user.id)
          .eq("id", existingLink.id);
        await supabase
          .from("dryland_micro_plans")
          .update({ status: currentPlan.status })
          .eq("user_id", user.id)
          .eq("id", planId);
        console.error("[DrylandMicroPlanApi] Could not create renewed linked micro plan", {
          planId,
          error: newPlanResult.error,
        });
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Could not create this week's Micro Session right now." },
            { status: 500 }
          )
        );
      }

      const newPlanRow = newPlanResult.data as DrylandMicroPlanRow;
      const newLinkInsertResult = await supabase
        .from("micro_session_habit_links")
        .insert({
          user_id: user.id,
          dryland_micro_plan_id: newPlanRow.id,
          habit_id: existingLink.habitId,
          status: "active",
          starts_on: existingLink.startsOn,
          resumed_at: mutationNow.toISOString(),
        })
        .select(MICRO_SESSION_HABIT_LINK_SELECT)
        .single();

      if (newLinkInsertResult.error) {
        await supabase
          .from("dryland_micro_plans")
          .update({ status: "completed" })
          .eq("user_id", user.id)
          .eq("id", newPlanRow.id);
        await supabase
          .from("micro_session_habit_links")
          .update({
            status: existingLink.status === "active" ? "active" : "paused",
            paused_at:
              existingLink.status === "paused"
                ? (existingLink.pausedAt ?? mutationNow.toISOString())
                : existingLink.pausedAt,
            resumed_at:
              existingLink.status === "active"
                ? (existingLink.resumedAt ?? mutationNow.toISOString())
                : existingLink.resumedAt,
            ended_at: null,
          })
          .eq("user_id", user.id)
          .eq("id", existingLink.id);
        await supabase
          .from("dryland_micro_plans")
          .update({ status: currentPlan.status })
          .eq("user_id", user.id)
          .eq("id", planId);
        console.error("[DrylandMicroPlanApi] Could not link renewed micro plan", {
          planId,
          newPlanId: newPlanRow.id,
          habitId: existingLink.habitId,
          error: newLinkInsertResult.error,
        });
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Could not link this week's Micro Session right now." },
            { status: 500 }
          )
        );
      }

      const renewedLink = await loadDrylandMicroHabitLinkRecord(supabase, user.id, newPlanRow.id, {
        required: true,
      });

      trackAnalyticsEvent({
        eventName: "micro_session_habit_link_status_updated",
        channel: "server",
        userId: user.id,
        payload: {
          status: "active",
          renewedCurrentWeek: true,
        },
      });

      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          plan: buildDrylandMicroPlanRecord(newPlanRow, renewedLink),
        })
      );
    }

    const linkUpdateResult = await supabase
      .from("micro_session_habit_links")
      .update(
        nextLinkStatus === "paused"
          ? {
              status: "paused",
              paused_at: mutationNow.toISOString(),
              ended_at: null,
            }
          : {
              status: "active",
              resumed_at: mutationNow.toISOString(),
              ended_at: null,
            }
      )
      .eq("user_id", user.id)
      .eq("id", existingLink.id)
      .select(MICRO_SESSION_HABIT_LINK_SELECT)
      .maybeSingle();

    if (isDrylandSchemaMissing(linkUpdateResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Micro Session habit linkage is still syncing in this environment." },
          { status: 503 }
        )
      );
    }

    if (linkUpdateResult.error || !linkUpdateResult.data) {
      console.error("[DrylandMicroPlanApi] Could not update micro habit link", {
        planId,
        linkId: existingLink.id,
        error: linkUpdateResult.error,
      });
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Could not update the linked habit right now." },
          { status: 500 }
        )
      );
    }

    const updatedLink = await loadDrylandMicroHabitLinkRecord(supabase, user.id, planId, {
      required: true,
    });

    trackAnalyticsEvent({
      eventName: "micro_session_habit_link_status_updated",
      channel: "server",
      userId: user.id,
      payload: {
        status: nextLinkStatus,
      },
    });

    return applySupabaseCookies(
      noStoreJson({
        ok: true,
        plan: buildDrylandMicroPlanRecord(planResult.data as DrylandMicroPlanRow, updatedLink),
      })
    );
  } else if (body.clearPlan === true) {
    nextStatus = "completed";
  } else if (typeof body.blockId === "string" || body.blockStatus !== undefined) {
    if (isStaleMicroPlan(currentPlan, mutationNow)) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Start this week's Micro Session before updating old units." },
          { status: 400 }
        )
      );
    }

    const blockId = typeof body.blockId === "string" ? body.blockId.trim() : "";
    if (body.releaseNow === true) {
      if (!blockId) {
        return applySupabaseCookies(
          noStoreJson({ ok: false, error: "Invalid micro unit release update." }, { status: 400 })
        );
      }

      const applied = applyDrylandMicroBlockReleaseNow(nextBlocks, blockId, mutationNow);
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
      const applied = applyDrylandMicroBlockStatus(
        nextBlocks,
        blockId,
        body.blockStatus,
        mutationNow
      );
      if (!applied.ok) {
        return applySupabaseCookies(
          noStoreJson({ ok: false, error: applied.error }, { status: 400 })
        );
      }
      const wasWeeklyProgramComplete = isDrylandMicroWeeklyProgramComplete(currentPlan.blocks);
      nextBlocks = applied.value;
      nextStatus = deriveDrylandMicroPlanStatus(nextBlocks, nextStatus);
      const isWeeklyProgramComplete = isDrylandMicroWeeklyProgramComplete(nextBlocks);
      if (
        body.blockStatus === "completed" &&
        body.selectedDate !== undefined &&
        !wasWeeklyProgramComplete &&
        isWeeklyProgramComplete
      ) {
        if (!isDateInMicroPlanWeek(currentPlan, body.selectedDate)) {
          return applySupabaseCookies(
            noStoreJson(
              { ok: false, error: "This completion does not belong to the Micro Session week." },
              { status: 400 }
            )
          );
        }
        shouldAttemptHabitCredit = true;
        shouldResumePausedHabitLinkForCredit = body.completePausedHabitLink === true;
        creditBlockId = getDrylandMicroWeeklyProgramCreditBlockId(nextBlocks);
      } else if (
        body.blockStatus !== "completed" &&
        body.selectedDate !== undefined &&
        wasWeeklyProgramComplete &&
        !isWeeklyProgramComplete
      ) {
        if (!isDateInMicroPlanWeek(currentPlan, body.selectedDate)) {
          return applySupabaseCookies(
            noStoreJson(
              { ok: false, error: "This update does not belong to the Micro Session week." },
              { status: 400 }
            )
          );
        }
        shouldRemoveHabitCredit = true;
      }
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

  const updatedPlanRow = updateResult.data as DrylandMicroPlanRow;
  if (shouldResumePausedHabitLinkForCredit) {
    let existingLink;
    try {
      existingLink = await loadDrylandMicroHabitLinkRecord(supabase, user.id, planId, {
        required: true,
      });
    } catch (error) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error:
              error instanceof Error
                ? error.message
                : "Could not resume the linked Habit right now.",
          },
          { status: 503 }
        )
      );
    }
    if (existingLink?.status === "paused") {
      const linkUpdateResult = await supabase
        .from("micro_session_habit_links")
        .update({
          status: "active",
          resumed_at: mutationNow.toISOString(),
          ended_at: null,
        })
        .eq("user_id", user.id)
        .eq("id", existingLink.id);

      if (linkUpdateResult.error) {
        console.error("[DrylandMicroPlanApi] Could not resume paused link for credit", {
          planId,
          linkId: existingLink.id,
          error: linkUpdateResult.error,
        });
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Could not resume the linked Habit right now." },
            { status: 500 }
          )
        );
      }
    }
  }

  const shouldLoadHabitLink =
    shouldAttemptHabitCredit || shouldRemoveHabitCredit || body.selectedDate !== undefined;
  const updatedHabitLink = shouldLoadHabitLink
    ? await loadDrylandMicroHabitLinkRecord(supabase, user.id, planId)
    : null;
  const habitCredit =
    shouldAttemptHabitCredit && creditBlockId && updatedHabitLink
      ? await recordMicroSessionHabitCredit(supabase, {
          userId: user.id,
          planId,
          blockId: creditBlockId,
          link: updatedHabitLink,
          selectedDate: body.selectedDate,
          timezone: body.timezone,
          completedAt: mutationNow.toISOString(),
        })
      : shouldRemoveHabitCredit && updatedHabitLink
        ? await removeMicroSessionHabitCredit(supabase, {
            userId: user.id,
            planId,
            link: updatedHabitLink,
            selectedDate: body.selectedDate,
          })
        : undefined;

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      plan: buildDrylandMicroPlanRecord(updatedPlanRow, updatedHabitLink),
      habitCredit,
    })
  );
}
