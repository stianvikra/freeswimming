import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import { HABIT_DEFINITION_SELECT, loadHabitSnapshot } from "@/lib/habits/server";
import {
  buildHabitDefinitionUpdate,
  classifyHabitDefinition,
  UNSUPPORTED_HABIT_DEFINITION_CODE,
  UnsupportedHabitDefinitionValueError,
  validateHabitDefinitionCoreInput,
  type HabitUpdateRequestBody,
} from "@/lib/habits/shared";
import { isLocalDayDateKey, validateRenderedLocalDayDate } from "@/lib/my-library/local-day";
import { getRequestLocalDayContext } from "@/lib/my-library/local-day-server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import type { Database } from "@/types/database";

type Props = {
  params: Promise<{
    habitId: string;
  }>;
};

type HabitDefinitionRow = Database["public"]["Tables"]["habit_definitions"]["Row"];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_ACTIVE_HABITS = 12;

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
  const body = parsedBody as HabitUpdateRequestBody;

  if (body.startDate !== undefined && !isLocalDayDateKey(body.startDate)) {
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

  try {
    validateHabitDefinitionCoreInput(body);
    if (typeof body.startDate === "string" && body.startDate > localDayContext.todayDate) {
      throw new Error("Choose today or an earlier start date.");
    }
  } catch (error) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          ...(error instanceof UnsupportedHabitDefinitionValueError ? { code: error.code } : {}),
          error: error instanceof Error ? error.message : "Could not update that habit.",
        },
        { status: 400 }
      )
    );
  }

  const currentHabitResult = await supabase
    .from("habit_definitions")
    .select(HABIT_DEFINITION_SELECT)
    .eq("user_id", user.id)
    .eq("id", habitId)
    .maybeSingle();

  if (isHabitsSchemaMissing(currentHabitResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Habits are still syncing in this environment." },
        { status: 503 }
      )
    );
  }

  if (currentHabitResult.error) {
    console.error("[HabitsApi] Could not load habit before update", currentHabitResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not update that habit right now." }, { status: 500 })
    );
  }

  if (!currentHabitResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Habit not found." }, { status: 404 })
    );
  }

  const currentDefinition = classifyHabitDefinition(currentHabitResult.data as HabitDefinitionRow);
  if (currentDefinition.kind === "unsupported") {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          code: UNSUPPORTED_HABIT_DEFINITION_CODE,
          error: "This Habit needs review before it can be changed.",
        },
        { status: 409 }
      )
    );
  }

  let updatePayload;
  try {
    updatePayload = buildHabitDefinitionUpdate(
      body,
      localDayContext.todayDate,
      currentDefinition.row
    );
  } catch (error) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          ...(error instanceof UnsupportedHabitDefinitionValueError ? { code: error.code } : {}),
          error: error instanceof Error ? error.message : "Could not update that habit.",
        },
        { status: 400 }
      )
    );
  }

  if (updatePayload.status === "active" && currentDefinition.row.status === "archived") {
    const activeCountResult = await supabase
      .from("habit_definitions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "active");

    if (isHabitsSchemaMissing(activeCountResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Habits are still syncing in this environment." },
          { status: 503 }
        )
      );
    }

    if (activeCountResult.error) {
      console.error(
        "[HabitsApi] Could not count active habits before restore",
        activeCountResult.error
      );
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Could not restore that habit right now." },
          { status: 500 }
        )
      );
    }

    if ((activeCountResult.count ?? 0) >= MAX_ACTIVE_HABITS) {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Archive one active habit before restoring another." },
          { status: 400 }
        )
      );
    }
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

  const updatedDefinition = classifyHabitDefinition(updateResult.data as HabitDefinitionRow);
  const snapshot = await loadHabitSnapshot(supabase, user.id, {
    selectedDate: body.selectedDate,
    todayDate: localDayContext.todayDate,
  });
  if (updatedDefinition.kind === "supported") {
    trackAnalyticsEvent({
      eventName: "habit_updated",
      channel: "server",
      userId: user.id,
      payload: {
        habitMode: updatedDefinition.row.habit_mode,
        status: updatedDefinition.row.status,
        archived: updatedDefinition.row.status === "archived",
        changedStatus: typeof body.status === "string",
        cadencePeriod: updatedDefinition.row.cadence_period ?? "daily",
        cadenceDayPolicy: updatedDefinition.row.cadence_day_policy ?? "fixed",
        cadenceTargetCount: updatedDefinition.row.cadence_target_count ?? 1,
      },
    });
  }
  return applySupabaseCookies(noStoreJson({ ok: true, snapshot }));
}
