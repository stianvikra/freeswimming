import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import { HABIT_DEFINITION_SELECT, loadHabitSnapshot } from "@/lib/habits/server";
import { buildHabitDefinitionInsert, type HabitCreateRequestBody } from "@/lib/habits/shared";
import { isLocalDayDateKey, validateRenderedLocalDayDate } from "@/lib/my-library/local-day";
import { getRequestLocalDayContext } from "@/lib/my-library/local-day-server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import type { Database } from "@/types/database";

type HabitDefinitionRow = Database["public"]["Tables"]["habit_definitions"]["Row"];

function noStoreJson(body: Record<string, unknown>, init?: { status?: number }) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request) {
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unauthorized." }, { status: 401 })
    );
  }

  const selectedDate = new URL(request.url).searchParams.get("date");
  const localDayContext = await getRequestLocalDayContext({ now: new Date() });
  if (localDayContext.status !== "resolved") {
    throw new Error("Read-only local-day context cannot contain an invalid explicit timezone.");
  }
  const snapshot = await loadHabitSnapshot(supabase, user.id, {
    selectedDate,
    todayDate: localDayContext.todayDate,
  });
  return applySupabaseCookies(noStoreJson({ ok: true, snapshot }));
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

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }
  if (typeof parsedBody !== "object" || parsedBody === null || Array.isArray(parsedBody)) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }
  const body = parsedBody as HabitCreateRequestBody;

  if (body.startDate !== undefined && !isLocalDayDateKey(body.startDate)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, code: "INVALID_DATE", error: "Choose a valid start date." },
        { status: 400 }
      )
    );
  }
  if (
    body.startDate === undefined &&
    body.selectedDate !== undefined &&
    !isLocalDayDateKey(body.selectedDate)
  ) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, code: "INVALID_DATE", error: "Choose a valid start date." },
        { status: 400 }
      )
    );
  }

  const localDayContext = await getRequestLocalDayContext({
    explicitTimezone: body.timezone,
    now: new Date(),
  });
  if (localDayContext.status === "invalid_explicit") {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, code: "INVALID_TIMEZONE", error: "Choose a valid timezone." },
        { status: 400 }
      )
    );
  }

  const renderedLocalDay = validateRenderedLocalDayDate(
    body.renderedTodayDate,
    localDayContext.todayDate
  );
  if (renderedLocalDay.status === "invalid") {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          code: "INVALID_DATE",
          error: "The rendered local day is invalid. Refresh the page and try again.",
        },
        { status: 400 }
      )
    );
  }
  if (renderedLocalDay.status !== "current") {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          code: "STALE_LOCAL_DAY_CONTEXT",
          error: "Your local day changed. Refresh the page and try again.",
        },
        { status: 409 }
      )
    );
  }

  const existingResult = await supabase
    .from("habit_definitions")
    .select("id, sort_order, status")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (isHabitsSchemaMissing(existingResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Habits are still syncing in this environment." },
        { status: 503 }
      )
    );
  }

  if (existingResult.error) {
    console.error("[HabitsApi] Could not load active habits before create", existingResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not create that habit right now." }, { status: 500 })
    );
  }

  const activeRows = (existingResult.data ?? []) as Pick<
    HabitDefinitionRow,
    "id" | "sort_order" | "status"
  >[];
  if (activeRows.length >= 12) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Archive one habit before adding another." }, { status: 400 })
    );
  }

  let insertPayload;
  try {
    const nextSortOrder =
      activeRows.reduce((max, row) => Math.max(max, row.sort_order ?? 0), 0) + 1;
    insertPayload = buildHabitDefinitionInsert(
      user.id,
      body,
      nextSortOrder,
      localDayContext.todayDate
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

  const insertResult = await supabase
    .from("habit_definitions")
    .insert(insertPayload)
    .select(HABIT_DEFINITION_SELECT)
    .single();

  if (isHabitsSchemaMissing(insertResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Habits are still syncing in this environment." },
        { status: 503 }
      )
    );
  }

  if (insertResult.error) {
    console.error("[HabitsApi] Could not create habit", insertResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not create that habit right now." }, { status: 500 })
    );
  }

  trackAnalyticsEvent({
    eventName: "habit_created",
    channel: "server",
    userId: user.id,
    payload: {
      habitMode: insertPayload.habit_mode,
      habitType: insertPayload.habit_type,
      category: insertPayload.category,
      hasTargetValue: insertPayload.target_value_numeric !== null,
      targetUnit: insertPayload.target_unit,
      timerEnabled: insertPayload.timer_enabled,
      cadencePeriod: insertPayload.cadence_period,
      cadenceDayPolicy: insertPayload.cadence_day_policy,
      cadenceTargetCount: insertPayload.cadence_target_count,
      activeHabitCountBefore: activeRows.length,
    },
  });

  const snapshot = await loadHabitSnapshot(supabase, user.id, {
    selectedDate: body.selectedDate,
    todayDate: localDayContext.todayDate,
  });
  return applySupabaseCookies(noStoreJson({ ok: true, snapshot }));
}
