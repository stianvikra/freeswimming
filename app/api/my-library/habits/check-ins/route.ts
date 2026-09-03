import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import {
  HABIT_CHECK_IN_SELECT,
  HABIT_DEFINITION_WRITE_GUARD_SELECT,
  loadHabitSnapshot,
} from "@/lib/habits/server";
import {
  buildTimedTotalMinutes,
  buildHabitCheckInInsert,
  classifyHabitDefinition,
  UNSUPPORTED_HABIT_DEFINITION_CODE,
  type HabitCheckInRequestBody,
} from "@/lib/habits/shared";
import {
  clampLocalDayDateToToday,
  isLocalDayDateKey,
  validateRenderedLocalDayDate,
} from "@/lib/my-library/local-day";
import { getRequestLocalDayContext } from "@/lib/my-library/local-day-server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

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

async function refreshQuitLastLapseDate(
  supabase: Awaited<ReturnType<typeof createRouteHandlerSupabaseClient>>["supabase"],
  userId: string,
  habitId: string,
  checkInDate: string
) {
  const latestResult = await supabase
    .from("habit_check_ins")
    .select("check_in_date")
    .eq("user_id", userId)
    .eq("habit_id", habitId)
    .lte("check_in_date", checkInDate)
    .eq("value_boolean", false)
    .order("check_in_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestResult.error) return latestResult;

  return supabase
    .from("habit_definitions")
    .update({ last_lapse_date: latestResult.data?.check_in_date ?? null })
    .eq("user_id", userId)
    .eq("id", habitId);
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
  const body = parsedBody as HabitCheckInRequestBody;

  if (typeof body.habitId !== "string" || !UUID_PATTERN.test(body.habitId)) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid habit id." }, { status: 400 })
    );
  }

  if (body.checkInDate !== undefined && !isLocalDayDateKey(body.checkInDate)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, code: "INVALID_DATE", error: "Choose a valid check-in date." },
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

  const todayDate = localDayContext.todayDate;
  const checkInDate = isLocalDayDateKey(body.checkInDate) ? body.checkInDate : todayDate;
  const snapshotDate = clampLocalDayDateToToday(body.selectedDate ?? checkInDate, todayDate);
  if (checkInDate > todayDate) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Choose today or a past date for habit check-ins." },
        { status: 400 }
      )
    );
  }

  const actionSource = getHabitMutationActionSource(body.actionSource);
  const habitResult = await supabase
    .from("habit_definitions")
    .select(HABIT_DEFINITION_WRITE_GUARD_SELECT)
    .eq("user_id", user.id)
    .eq("id", body.habitId)
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
    console.error("[HabitsApi] Could not load habit before check-in", habitResult.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not update that check-in right now." },
        { status: 500 }
      )
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
          error: "This Habit needs review before check-ins can change.",
        },
        { status: 409 }
      )
    );
  }

  const habit = habitDefinition.row;
  const habitMode = habit.habit_mode;
  const isQuitHabit = habitMode === "quit";
  const hasTimedSourceValues = "timerSeconds" in body || "manualMinutes" in body;
  const clearsTimedCompletion = body.clearTimedCompletion === true;

  if (habit.start_date && checkInDate < habit.start_date) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Choose a check-in date on or after the habit start date." },
        { status: 400 }
      )
    );
  }

  if (
    clearsTimedCompletion &&
    (body.clear === true ||
      hasTimedSourceValues ||
      "valueNumeric" in body ||
      typeof body.valueBoolean === "boolean" ||
      typeof body.valueTime === "string" ||
      typeof body.status === "string")
  ) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Timed completion undo cannot include other check-in values." },
        { status: 400 }
      )
    );
  }

  if (body.clear === true) {
    const deleteResult = await supabase
      .from("habit_check_ins")
      .delete()
      .eq("user_id", user.id)
      .eq("habit_id", body.habitId)
      .eq("check_in_date", checkInDate);

    if (isHabitsSchemaMissing(deleteResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Habits are still syncing in this environment." },
          { status: 503 }
        )
      );
    }

    if (deleteResult.error) {
      console.error("[HabitsApi] Could not reset habit check-in", deleteResult.error);
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Could not reset that check-in right now." },
          { status: 500 }
        )
      );
    }

    if (isQuitHabit) {
      const refreshResult = await refreshQuitLastLapseDate(
        supabase,
        user.id,
        body.habitId,
        checkInDate
      );
      if (isHabitsSchemaMissing(refreshResult.error)) {
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Habits are still syncing in this environment." },
            { status: 503 }
          )
        );
      }

      if (refreshResult.error) {
        console.error("[HabitsApi] Could not refresh quit habit after reset", refreshResult.error);
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Could not reset that check-in right now." },
            { status: 500 }
          )
        );
      }
    }

    const snapshot = await loadHabitSnapshot(supabase, user.id, {
      selectedDate: snapshotDate,
      todayDate,
    });
    trackAnalyticsEvent({
      eventName: "habit_check_in_reset",
      channel: "server",
      userId: user.id,
      payload: {
        habitMode,
        checkInDate,
        selectedDate: snapshotDate,
        actionSource,
      },
    });
    return applySupabaseCookies(noStoreJson({ ok: true, snapshot }));
  }

  if (clearsTimedCompletion) {
    if (habitMode !== "timed") {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Timed completion undo requires a timed habit." },
          { status: 400 }
        )
      );
    }

    const checkInResult = await supabase
      .from("habit_check_ins")
      .select(HABIT_CHECK_IN_SELECT)
      .eq("user_id", user.id)
      .eq("habit_id", body.habitId)
      .eq("check_in_date", checkInDate)
      .maybeSingle();

    if (isHabitsSchemaMissing(checkInResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Habits are still syncing in this environment." },
          { status: 503 }
        )
      );
    }

    if (checkInResult.error) {
      console.error("[HabitsApi] Could not load timed completion before undo", checkInResult.error);
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Could not undo that completion right now." },
          { status: 500 }
        )
      );
    }

    const checkIn = checkInResult.data as {
      timer_seconds?: number | null;
      manual_minutes?: number | null;
      status?: string | null;
    } | null;
    const timerSeconds =
      typeof checkIn?.timer_seconds === "number" && Number.isFinite(checkIn.timer_seconds)
        ? Math.max(0, Math.floor(checkIn.timer_seconds))
        : 0;
    const manualMinutes =
      typeof checkIn?.manual_minutes === "number" && Number.isFinite(checkIn.manual_minutes)
        ? Math.max(0, Math.floor(checkIn.manual_minutes))
        : 0;

    if (!checkIn || checkIn.status === "skipped" || timerSeconds <= 0) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "No timed completion is available to undo." },
          { status: 400 }
        )
      );
    }

    if (manualMinutes > 0) {
      const updateResult = await supabase
        .from("habit_check_ins")
        .update({
          value_numeric: buildTimedTotalMinutes(0, manualMinutes),
          timer_seconds: 0,
          manual_minutes: manualMinutes,
          source_kind: "manual",
        })
        .eq("user_id", user.id)
        .eq("habit_id", body.habitId)
        .eq("check_in_date", checkInDate);

      if (isHabitsSchemaMissing(updateResult.error)) {
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Habits are still syncing in this environment." },
            { status: 503 }
          )
        );
      }

      if (updateResult.error) {
        console.error("[HabitsApi] Could not undo timed completion", updateResult.error);
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Could not undo that completion right now." },
            { status: 500 }
          )
        );
      }
    } else {
      const deleteResult = await supabase
        .from("habit_check_ins")
        .delete()
        .eq("user_id", user.id)
        .eq("habit_id", body.habitId)
        .eq("check_in_date", checkInDate);

      if (isHabitsSchemaMissing(deleteResult.error)) {
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Habits are still syncing in this environment." },
            { status: 503 }
          )
        );
      }

      if (deleteResult.error) {
        console.error("[HabitsApi] Could not delete timed completion", deleteResult.error);
        return applySupabaseCookies(
          noStoreJson(
            { ok: false, error: "Could not undo that completion right now." },
            { status: 500 }
          )
        );
      }
    }

    const snapshot = await loadHabitSnapshot(supabase, user.id, {
      selectedDate: snapshotDate,
      todayDate,
    });
    trackAnalyticsEvent({
      eventName: "habit_check_in_reset",
      channel: "server",
      userId: user.id,
      payload: {
        habitMode,
        checkInDate,
        selectedDate: snapshotDate,
        actionSource,
        resetKind: "timed_completion_source",
        hadManualMinutes: manualMinutes > 0,
        timedSourceKind: "timer",
      },
    });
    return applySupabaseCookies(noStoreJson({ ok: true, snapshot }));
  }

  if (isQuitHabit && body.valueBoolean !== false) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Log a lapse or reset this quit habit." }, { status: 400 })
    );
  }

  if (hasTimedSourceValues && habitMode !== "timed") {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Timed source values require a timed habit." },
        { status: 400 }
      )
    );
  }

  if (
    hasTimedSourceValues &&
    ("valueNumeric" in body ||
      typeof body.valueBoolean === "boolean" ||
      typeof body.valueTime === "string")
  ) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Timed source updates cannot include other check-in values." },
        { status: 400 }
      )
    );
  }

  let upsertPayload;
  try {
    upsertPayload = buildHabitCheckInInsert(
      user.id,
      { ...body, checkInDate, timezone: localDayContext.timezone },
      {
        now: localDayContext.now,
        todayDate,
      }
    );
  } catch (error) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: error instanceof Error ? error.message : "Could not update that check-in.",
        },
        { status: 400 }
      )
    );
  }

  const upsertResult = await supabase
    .from("habit_check_ins")
    .upsert(upsertPayload, { onConflict: "user_id,habit_id,check_in_date" })
    .select(HABIT_CHECK_IN_SELECT)
    .single();

  if (isHabitsSchemaMissing(upsertResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Habits are still syncing in this environment." },
        { status: 503 }
      )
    );
  }

  if (upsertResult.error) {
    console.error("[HabitsApi] Could not upsert habit check-in", upsertResult.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not update that check-in right now." },
        { status: 500 }
      )
    );
  }

  if (isQuitHabit) {
    const updateResult = await supabase
      .from("habit_definitions")
      .update({ last_lapse_date: checkInDate })
      .eq("user_id", user.id)
      .eq("id", body.habitId);

    if (isHabitsSchemaMissing(updateResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Habits are still syncing in this environment." },
          { status: 503 }
        )
      );
    }

    if (updateResult.error) {
      console.error("[HabitsApi] Could not update quit habit lapse date", updateResult.error);
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Could not update that check-in right now." },
          { status: 500 }
        )
      );
    }
  }

  const snapshot = await loadHabitSnapshot(supabase, user.id, {
    selectedDate: snapshotDate,
    todayDate,
  });
  trackAnalyticsEvent({
    eventName:
      upsertPayload.status === "skipped"
        ? "habit_rest_day_logged"
        : isQuitHabit
          ? "habit_lapse_logged"
          : habitMode === "timed" && upsertPayload.value_numeric !== null
            ? "habit_timer_saved"
            : "habit_check_in_logged",
    channel: "server",
    userId: user.id,
    payload: {
      habitMode,
      checkInDate,
      selectedDate: snapshotDate,
      actionSource,
      hasNumericValue: upsertPayload.value_numeric !== null,
      hasBooleanValue: upsertPayload.value_boolean !== null,
      hasTimeValue: upsertPayload.value_time !== null,
      hasTimerSeconds: (upsertPayload.timer_seconds ?? 0) > 0,
      hasManualMinutes: (upsertPayload.manual_minutes ?? 0) > 0,
      timedSourceKind:
        habitMode === "timed" && hasTimedSourceValues
          ? (upsertPayload.timer_seconds ?? 0) > 0 && (upsertPayload.manual_minutes ?? 0) > 0
            ? "timer_and_manual"
            : (upsertPayload.timer_seconds ?? 0) > 0
              ? "timer"
              : "manual"
          : null,
      status: upsertPayload.status,
    },
  });
  return applySupabaseCookies(noStoreJson({ ok: true, snapshot }));
}
