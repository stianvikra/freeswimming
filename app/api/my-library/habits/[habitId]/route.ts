import { NextResponse } from "next/server";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import { HABIT_DEFINITION_SELECT, loadHabitSnapshot } from "@/lib/habits/server";
import {
  buildHabitDefinitionUpdate,
  normalizeHabitDate,
  type HabitUpdateRequestBody,
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

export async function PATCH(request: Request, { params }: Props) {
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

  let body: HabitUpdateRequestBody;
  try {
    body = (await request.json()) as HabitUpdateRequestBody;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }

  let updatePayload;
  try {
    updatePayload = buildHabitDefinitionUpdate(body);
  } catch (error) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: error instanceof Error ? error.message : "Could not update that habit.",
        },
        { status: 400 }
      )
    );
  }

  const updateResult = await supabase
    .from("habit_definitions")
    .update(updatePayload)
    .eq("user_id", user.id)
    .eq("id", habitId)
    .select(HABIT_DEFINITION_SELECT)
    .maybeSingle();

  if (isHabitsSchemaMissing(updateResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Habits are still syncing in this environment." },
        { status: 503 }
      )
    );
  }

  if (updateResult.error) {
    console.error("[HabitsApi] Could not update habit", updateResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not update that habit right now." }, { status: 500 })
    );
  }

  if (!updateResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Habit not found." }, { status: 404 })
    );
  }

  const snapshot = await loadHabitSnapshot(
    supabase,
    user.id,
    normalizeHabitDate(body.selectedDate)
  );
  return applySupabaseCookies(noStoreJson({ ok: true, snapshot }));
}
