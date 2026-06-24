import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import { HABIT_ABSENCE_REVIEW_SELECT, loadHabitSnapshot } from "@/lib/habits/server";
import { normalizeHabitDate } from "@/lib/habits/shared";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ABSENCE_REVIEW_SCOPE = "weekly_absence_review";
const MAX_REVIEW_DATES_PER_REQUEST = 31;

type AbsenceReviewRequestBody = {
  dates?: unknown;
  selectedDate?: unknown;
  action?: unknown;
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

  const dates = [...new Set(value)].filter((date): date is string => typeof date === "string");
  if (dates.length === 0) {
    return { ok: false as const, error: "Review dates are required." };
  }

  if (dates.length > MAX_REVIEW_DATES_PER_REQUEST) {
    return { ok: false as const, error: "Too many review dates." };
  }

  const hasInvalidDate = dates.some((date) => !ISO_DATE_PATTERN.test(date));
  if (hasInvalidDate) {
    return { ok: false as const, error: "Invalid review date." };
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

  let body: AbsenceReviewRequestBody;
  try {
    body = (await request.json()) as AbsenceReviewRequestBody;
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON body." }, { status: 400 })
    );
  }

  const todayDate = normalizeHabitDate(undefined);
  const selectedDate = normalizeHabitDate(
    body.selectedDate,
    new Date(`${todayDate}T00:00:00.000Z`)
  );
  const parsedDates = parseReviewDates(body.dates, todayDate);
  if (!parsedDates.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: parsedDates.error }, { status: 400 })
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

  const snapshot = await loadHabitSnapshot(supabase, user.id, selectedDate);

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      reviewedDates: parsedDates.dates,
      snapshot,
    })
  );
}
