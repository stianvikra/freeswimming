import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import { HABIT_MOTIVATION_RESET_SELECT, loadHabitSnapshot } from "@/lib/habits/server";
import {
  buildHabitMotivationResetInsert,
  classifyHabitDefinition,
  UNSUPPORTED_HABIT_DEFINITION_CODE,
  type HabitMotivationResetRequestBody,
} from "@/lib/habits/shared";
import {
  clampLocalDayDateToToday,
  isLocalDayDateKey,
  validateRenderedLocalDayDate,
} from "@/lib/my-library/local-day";
import { getRequestLocalDayContext } from "@/lib/my-library/local-day-server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type Props = {
  params: Promise<{
    habitId: string;
  }>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function noStoreJson(body: Record<string, unknown>, init?: { status?: number }) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function getHabitMutationActionSource(value: unknown) {
  return value === "catch_up" ? "catch_up" : "habits";
}

export async function POST(request: Request, { params }: Props) {
  const { habitId } = await params;
  if (!UUID_PATTERN.test(habitId)) {
    return noStoreJson({ ok: false, error: "Invalid habit id." }, { status: 400 });
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
  const body = parsedBody as HabitMotivationResetRequestBody;

  const effectiveDateInput =
    body.effectiveDate !== undefined ? body.effectiveDate : body.selectedDate;
  if (effectiveDateInput !== undefined && !isLocalDayDateKey(effectiveDateInput)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, code: "INVALID_DATE", error: "Choose a valid reset date." },
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

  const habitResult = await supabase
    .from("habit_definitions")
    .select("id, title, habit_type, habit_mode, start_date, status")
    .eq("user_id", user.id)
    .eq("id", habitId)
    .maybeSingle();

  if (isHabitsSchemaMissing(habitResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Habits are still syncing in this environment." },
        { status: 503 }
      )
    );
  }

  if (habitResult.error) {
    console.error("[HabitsApi] Could not load habit before resetting stats", habitResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not reset habit stats right now." }, { status: 500 })
    );
  }

  if (!habitResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Habit not found." }, { status: 404 })
    );
  }

  const habitDefinition = classifyHabitDefinition(habitResult.data);
  if (habitDefinition.kind === "unsupported") {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          code: UNSUPPORTED_HABIT_DEFINITION_CODE,
          error: "This Habit needs review before its stats can change.",
        },
        { status: 409 }
      )
    );
  }

  const habit = habitDefinition.row;
  if (!isLocalDayDateKey(habit.start_date)) {
    console.error("[HabitsApi] Habit has an invalid persisted start date", { habitId });
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not reset habit stats right now." }, { status: 500 })
    );
  }

  let insertPayload;
  try {
    insertPayload = buildHabitMotivationResetInsert(
      user.id,
      {
        id: habit.id,
        startDate: habit.start_date,
        status: habit.status,
      },
      body,
      localDayContext.todayDate
    );
  } catch (error) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: error instanceof Error ? error.message : "Could not reset habit stats.",
        },
        { status: 400 }
      )
    );
  }

  const insertResult = await supabase
    .from("habit_motivation_resets")
    .insert(insertPayload)
    .select(HABIT_MOTIVATION_RESET_SELECT)
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
    console.error("[HabitsApi] Could not create habit motivation reset", insertResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not reset habit stats right now." }, { status: 500 })
    );
  }

  const selectedDate = clampLocalDayDateToToday(
    body.selectedDate ?? insertPayload.effective_date,
    localDayContext.todayDate
  );
  const actionSource = getHabitMutationActionSource(body.actionSource);
  const snapshot = await loadHabitSnapshot(supabase, user.id, {
    selectedDate,
    todayDate: localDayContext.todayDate,
  });
  trackAnalyticsEvent({
    eventName: "habit_stats_reset_created",
    channel: "server",
    userId: user.id,
    payload: {
      habitMode: habit.habit_mode,
      effectiveDate: insertPayload.effective_date,
      selectedDate,
      actionSource,
    },
  });

  return applySupabaseCookies(noStoreJson({ ok: true, snapshot }));
}
