import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import { HABIT_CHECK_IN_SELECT, loadHabitSnapshot } from "@/lib/habits/server";
import {
  buildHabitCheckInInsert,
  normalizeHabitDate,
  type HabitCheckInRequestBody,
} from "@/lib/habits/shared";
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

  let body: HabitCheckInRequestBody;
  try {
    body = (await request.json()) as HabitCheckInRequestBody;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }

  if (typeof body.habitId !== "string" || !UUID_PATTERN.test(body.habitId)) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid habit id." }, { status: 400 })
    );
  }

  const checkInDate = normalizeHabitDate(body.checkInDate);
  const habitResult = await supabase
    .from("habit_definitions")
    .select("id, habit_mode, start_date")
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

  const habit = habitResult.data as {
    id: string;
    habit_mode?: string | null;
    start_date?: string | null;
  };
  const habitMode = habit.habit_mode ?? "build";
  const isQuitHabit = habitMode === "quit";

  if (habit.start_date && checkInDate < habit.start_date) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Choose a check-in date on or after the habit start date." },
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

    const snapshot = await loadHabitSnapshot(supabase, user.id, checkInDate);
    trackAnalyticsEvent({
      eventName: "habit_check_in_reset",
      channel: "server",
      userId: user.id,
      payload: {
        habitMode,
        checkInDate,
      },
    });
    return applySupabaseCookies(noStoreJson({ ok: true, snapshot }));
  }

  if (isQuitHabit && body.valueBoolean !== false) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Log a lapse or reset this quit habit." }, { status: 400 })
    );
  }

  let upsertPayload;
  try {
    upsertPayload = buildHabitCheckInInsert(user.id, { ...body, checkInDate });
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

  const snapshot = await loadHabitSnapshot(supabase, user.id, checkInDate);
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
      hasNumericValue: upsertPayload.value_numeric !== null,
      hasBooleanValue: upsertPayload.value_boolean !== null,
      hasTimeValue: upsertPayload.value_time !== null,
      status: upsertPayload.status,
    },
  });
  return applySupabaseCookies(noStoreJson({ ok: true, snapshot }));
}
