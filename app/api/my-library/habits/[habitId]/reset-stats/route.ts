import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import { HABIT_MOTIVATION_RESET_SELECT, loadHabitSnapshot } from "@/lib/habits/server";
import {
  buildHabitMotivationResetInsert,
  normalizeHabitDate,
  type HabitMotivationResetRequestBody,
} from "@/lib/habits/shared";
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

  let body: HabitMotivationResetRequestBody;
  try {
    body = (await request.json()) as HabitMotivationResetRequestBody;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }

  const habitResult = await supabase
    .from("habit_definitions")
    .select("id, habit_mode, start_date, status")
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

  let insertPayload;
  try {
    insertPayload = buildHabitMotivationResetInsert(
      user.id,
      {
        id: habitResult.data.id,
        startDate: normalizeHabitDate(habitResult.data.start_date),
        status: habitResult.data.status === "archived" ? "archived" : "active",
      },
      body
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

  const selectedDate = normalizeHabitDate(body.selectedDate ?? insertPayload.effective_date);
  const actionSource = getHabitMutationActionSource(body.actionSource);
  const snapshot = await loadHabitSnapshot(supabase, user.id, selectedDate);
  trackAnalyticsEvent({
    eventName: "habit_stats_reset_created",
    channel: "server",
    userId: user.id,
    payload: {
      habitMode: habitResult.data.habit_mode ?? "build",
      effectiveDate: insertPayload.effective_date,
      selectedDate,
      actionSource,
    },
  });

  return applySupabaseCookies(noStoreJson({ ok: true, snapshot }));
}
