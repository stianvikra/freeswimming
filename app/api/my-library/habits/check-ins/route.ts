import { NextResponse } from "next/server";
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
    .select("id")
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

    const snapshot = await loadHabitSnapshot(supabase, user.id, checkInDate);
    return applySupabaseCookies(noStoreJson({ ok: true, snapshot }));
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

  const snapshot = await loadHabitSnapshot(supabase, user.id, checkInDate);
  return applySupabaseCookies(noStoreJson({ ok: true, snapshot }));
}
