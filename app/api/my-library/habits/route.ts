import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import { HABIT_DEFINITION_SELECT, loadHabitSnapshot } from "@/lib/habits/server";
import {
  buildHabitDefinitionInsert,
  normalizeHabitDate,
  type HabitCreateRequestBody,
} from "@/lib/habits/shared";
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
  const snapshot = await loadHabitSnapshot(supabase, user.id, selectedDate);
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

  let body: HabitCreateRequestBody;
  try {
    body = (await request.json()) as HabitCreateRequestBody;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
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
    insertPayload = buildHabitDefinitionInsert(user.id, body, nextSortOrder);
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

  const snapshot = await loadHabitSnapshot(
    supabase,
    user.id,
    normalizeHabitDate(body.selectedDate)
  );
  return applySupabaseCookies(noStoreJson({ ok: true, snapshot }));
}
