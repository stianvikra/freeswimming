import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import { HABIT_ABSENCE_REVIEW_SELECT, loadHabitSnapshot } from "@/lib/habits/server";
import {
  clampLocalDayDateToToday,
  isLocalDayDateKey,
  validateRenderedLocalDayDate,
} from "@/lib/my-library/local-day";
import { getRequestLocalDayContext } from "@/lib/my-library/local-day-server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ABSENCE_REVIEW_SCOPE = "weekly_absence_review";
const MAX_REVIEW_DATES_PER_REQUEST = 31;

type AbsenceReviewRequestBody = {
  dates?: unknown;
  selectedDate?: unknown;
  renderedTodayDate?: unknown;
  action?: unknown;
  timezone?: unknown;
};

function noStoreJson(body: Record<string, unknown>, init?: { status?: number }) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function parseReviewDates(value: unknown, todayDate: string) {
  if (!Array.isArray(value)) {
    return { ok: false as const, error: "Review dates are required." };
  }

  if (value.some((date) => typeof date !== "string")) {
    return { ok: false as const, code: "INVALID_DATE" as const, error: "Invalid review date." };
  }

  const dates = [...new Set(value as string[])];
  if (dates.length === 0) {
    return { ok: false as const, error: "Review dates are required." };
  }

  if (dates.length > MAX_REVIEW_DATES_PER_REQUEST) {
    return { ok: false as const, error: "Too many review dates." };
  }

  const hasInvalidDate = dates.some(
    (date) => !ISO_DATE_PATTERN.test(date) || !isLocalDayDateKey(date)
  );
  if (hasInvalidDate) {
    return { ok: false as const, code: "INVALID_DATE" as const, error: "Invalid review date." };
  }

  const hasFutureDate = dates.some((date) => date > todayDate);
  if (hasFutureDate) {
    return { ok: false as const, error: "Review dates cannot be in the future." };
  }

  return {
    ok: true as const,
    dates: dates.sort((left, right) => left.localeCompare(right)),
  };
}

function getReviewAction(value: unknown) {
  return value === "finish" ? "finish" : "mark";
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
  const body = parsedBody as AbsenceReviewRequestBody;

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
  const selectedDate = clampLocalDayDateToToday(body.selectedDate, todayDate);
  const parsedDates = parseReviewDates(body.dates, todayDate);
  if (!parsedDates.ok) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          ...("code" in parsedDates ? { code: parsedDates.code } : {}),
          error: parsedDates.error,
        },
        { status: 400 }
      )
    );
  }

  const upsertResult = await supabase
    .from("habit_absence_review_acknowledgements")
    .upsert(
      parsedDates.dates.map((date) => ({
        user_id: user.id,
        review_scope: ABSENCE_REVIEW_SCOPE,
        review_date: date,
        status: "reviewed",
      })),
      { onConflict: "user_id,review_scope,review_date" }
    )
    .select(HABIT_ABSENCE_REVIEW_SELECT);

  if (isHabitsSchemaMissing(upsertResult.error)) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Habits review history is still syncing in this environment." },
        { status: 503 }
      )
    );
  }

  if (upsertResult.error) {
    console.error("[HabitsApi] Could not save absence review acknowledgement", upsertResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not save that review right now." }, { status: 500 })
    );
  }

  void trackAnalyticsEvent({
    eventName: "habit_absence_review_acknowledged",
    channel: "server",
    userId: user.id,
    payload: {
      selectedDate,
      reviewDateCount: parsedDates.dates.length,
      reviewAction: getReviewAction(body.action),
    },
  });

  const snapshot = await loadHabitSnapshot(supabase, user.id, {
    selectedDate,
    todayDate,
  });

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      reviewedDates: parsedDates.dates,
      snapshot,
    })
  );
}
