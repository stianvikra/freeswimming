import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import { isHabitsSchemaMissing } from "@/lib/habits/schema";
import { HABIT_ABSENCE_REVIEW_SELECT, loadHabitSnapshot } from "@/lib/habits/server";
import {
  getHabitAbsenceReviewCandidateDates,
  type HabitDayStatus,
  type HabitSnapshot,
} from "@/lib/habits/shared";
import { isLocalDayDateKey, validateRenderedLocalDayDate } from "@/lib/my-library/local-day";
import { getRequestLocalDayContext } from "@/lib/my-library/local-day-server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ABSENCE_REVIEW_SCOPE = "weekly_absence_review";
const MAX_REVIEW_DATES_PER_REQUEST = 7;

const ABSENCE_REVIEW_ACTIONS = [
  "mark",
  "finish",
  "not_tracked_single",
  "not_tracked_visible_batch",
  "not_tracked_undo",
] as const;

type AbsenceReviewAction = (typeof ABSENCE_REVIEW_ACTIONS)[number];

type AbsenceReviewRequestBody = {
  dates?: unknown;
  selectedDate?: unknown;
  renderedTodayDate?: unknown;
  action?: unknown;
  dayStatus?: unknown;
  timezone?: unknown;
};

type PostgrestLikeError = {
  code?: string | null;
  message?: string | null;
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
    return {
      ok: false as const,
      code: "INVALID_REVIEW_DATES" as const,
      error: "Review dates are required.",
    };
  }
  if (value.some((date) => typeof date !== "string")) {
    return { ok: false as const, code: "INVALID_DATE" as const, error: "Invalid review date." };
  }

  const inputDates = value as string[];
  if (inputDates.length === 0) {
    return {
      ok: false as const,
      code: "INVALID_REVIEW_DATES" as const,
      error: "Review dates are required.",
    };
  }
  if (inputDates.length > MAX_REVIEW_DATES_PER_REQUEST) {
    return {
      ok: false as const,
      code: "TOO_MANY_REVIEW_DATES" as const,
      error: "Too many review dates.",
    };
  }
  if (new Set(inputDates).size !== inputDates.length) {
    return {
      ok: false as const,
      code: "DUPLICATE_REVIEW_DATE" as const,
      error: "Review dates must be unique.",
    };
  }

  const hasInvalidDate = inputDates.some(
    (date) => !ISO_DATE_PATTERN.test(date) || !isLocalDayDateKey(date)
  );
  if (hasInvalidDate) {
    return { ok: false as const, code: "INVALID_DATE" as const, error: "Invalid review date." };
  }
  if (inputDates.some((date) => date > todayDate)) {
    return {
      ok: false as const,
      code: "FUTURE_REVIEW_DATE" as const,
      error: "Review dates cannot be in the future.",
    };
  }

  return {
    ok: true as const,
    dates: [...inputDates].sort((left, right) => left.localeCompare(right)),
  };
}

function parseSelectedDate(value: unknown, todayDate: string) {
  if (value === undefined) return { ok: true as const, selectedDate: todayDate };
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value) || !isLocalDayDateKey(value)) {
    return {
      ok: false as const,
      code: "INVALID_DATE" as const,
      error: "The selected review date is invalid.",
    };
  }
  if (value > todayDate) {
    return {
      ok: false as const,
      code: "FUTURE_REVIEW_DATE" as const,
      error: "The selected review date cannot be in the future.",
    };
  }
  return { ok: true as const, selectedDate: value };
}

function parseReviewAction(value: unknown): AbsenceReviewAction | null {
  return typeof value === "string" && (ABSENCE_REVIEW_ACTIONS as readonly string[]).includes(value)
    ? (value as AbsenceReviewAction)
    : null;
}

function isNotTrackedMutation(action: AbsenceReviewAction) {
  return action.startsWith("not_tracked_");
}

function hasValidDayStatus(action: AbsenceReviewAction, body: AbsenceReviewRequestBody) {
  if (action === "not_tracked_single" || action === "not_tracked_visible_batch") {
    return body.dayStatus === "not_tracked";
  }
  if (action === "not_tracked_undo") {
    return body.dayStatus === null;
  }
  return body.dayStatus === undefined || body.dayStatus === null;
}

function haveSameDates(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((date, index) => date === right[index]);
}

function validateCandidateDates(
  action: AbsenceReviewAction,
  requestedDates: readonly string[],
  candidateDates: readonly string[],
  snapshot: HabitSnapshot
) {
  const candidateSet = new Set(candidateDates);
  const selectedWeekDates = new Set(snapshot.weekSummary.days.map((day) => day.date));
  const selectedWeekNotTrackedDates = new Set(
    (snapshot.dayStatuses ?? [])
      .filter(
        (status) => status.dayStatus === "not_tracked" && selectedWeekDates.has(status.reviewDate)
      )
      .map((status) => status.reviewDate)
  );
  if (action === "finish") {
    return haveSameDates(requestedDates, candidateDates);
  }
  if (action === "not_tracked_single") {
    if (requestedDates.length !== 1) return false;
    const date = requestedDates[0]!;
    return candidateSet.has(date) || selectedWeekNotTrackedDates.has(date);
  }
  if (action === "not_tracked_visible_batch") {
    const requestedDateSet = new Set(requestedDates);
    return (
      candidateDates.every((date) => requestedDateSet.has(date)) &&
      requestedDates.every(
        (date) => candidateSet.has(date) || selectedWeekNotTrackedDates.has(date)
      )
    );
  }
  if (action === "not_tracked_undo") {
    if (requestedDates.length !== 1) return false;
    const date = requestedDates[0]!;
    if (!snapshot.weekSummary.days.some((day) => day.date === date)) return false;
    return (
      snapshot.dayStatuses?.some(
        (status) => status.reviewDate === date && status.dayStatus === "not_tracked"
      ) === true || snapshot.absenceReviewAcknowledgedDates?.includes(date) === true
    );
  }
  return requestedDates.every((date) => candidateSet.has(date));
}

function getDayStatusForAction(action: AbsenceReviewAction): HabitDayStatus | null {
  return action === "not_tracked_undo" ? null : "not_tracked";
}

function getMutationConflict(error: PostgrestLikeError | null | undefined) {
  if (error?.code !== "P0001") return null;
  if (error.message?.includes("HABIT_ABSENCE_REVIEW_CHECK_IN_EXISTS")) {
    return {
      code: "ABSENCE_REVIEW_CHECK_IN_CONFLICT",
      error: "That day now has a Habit check-in. Refresh and review the recorded activity.",
    };
  }
  if (error.message?.includes("HABIT_ABSENCE_REVIEW_NOT_FOUND")) {
    return {
      code: "ABSENCE_REVIEW_STATUS_CONFLICT",
      error: "That review status changed. Refresh and try again.",
    };
  }
  if (error.message?.includes("HABIT_ABSENCE_REVIEW_WORKFLOW_STATUS_UNSUPPORTED")) {
    return {
      code: "ABSENCE_REVIEW_STATUS_UNSUPPORTED",
      error: "A review day has a status this version cannot safely change.",
    };
  }
  return null;
}

function isSnapshotReadyForReview(snapshot: HabitSnapshot) {
  if (!snapshot.schemaReady || snapshot.loadError) return false;
  if (snapshot.absenceReviewAcknowledgementsReady === false) return false;
  if (snapshot.absenceReviewRecordedCheckInDates === undefined) return false;
  return snapshot.dayStatusesReady === true;
}

function hasUnsupportedExistingDayStatus(
  snapshot: HabitSnapshot,
  requestedDates: readonly string[]
) {
  const requestedDateSet = new Set(requestedDates);
  return (
    snapshot.dayStatuses?.some(
      (status) => requestedDateSet.has(status.reviewDate) && status.dayStatus === "unsupported"
    ) === true
  );
}

export async function POST(request: Request) {
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, code: "UNAUTHORIZED", error: "Unauthorized." }, { status: 401 })
    );
  }

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, code: "INVALID_JSON", error: "Invalid JSON body." }, { status: 400 })
    );
  }
  if (typeof parsedBody !== "object" || parsedBody === null || Array.isArray(parsedBody)) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, code: "INVALID_JSON", error: "Invalid JSON body." }, { status: 400 })
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

  const action = parseReviewAction(body.action);
  if (!action) {
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, code: "INVALID_REVIEW_ACTION", error: "Choose a supported review action." },
        { status: 400 }
      )
    );
  }
  if (!hasValidDayStatus(action, body)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          code: "INVALID_DAY_STATUS",
          error: "Choose a supported review day status.",
        },
        { status: 400 }
      )
    );
  }

  const todayDate = localDayContext.todayDate;
  const parsedSelectedDate = parseSelectedDate(body.selectedDate, todayDate);
  if (!parsedSelectedDate.ok) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          code: parsedSelectedDate.code,
          error: parsedSelectedDate.error,
        },
        { status: 400 }
      )
    );
  }
  const selectedDate = parsedSelectedDate.selectedDate;
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

  const currentSnapshot = await loadHabitSnapshot(supabase, user.id, {
    selectedDate,
    todayDate,
  });
  if (!isSnapshotReadyForReview(currentSnapshot)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          code: "ABSENCE_REVIEW_UNAVAILABLE",
          error: "Habits review history is still syncing in this environment.",
        },
        { status: 503 }
      )
    );
  }

  if (hasUnsupportedExistingDayStatus(currentSnapshot, parsedDates.dates)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          code: "ABSENCE_REVIEW_STATUS_UNSUPPORTED",
          error: "A review day has a status this version cannot safely change.",
        },
        { status: 409 }
      )
    );
  }

  const visibleCandidateDates = getHabitAbsenceReviewCandidateDates(currentSnapshot, todayDate);
  if (!validateCandidateDates(action, parsedDates.dates, visibleCandidateDates, currentSnapshot)) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          code: "ABSENCE_REVIEW_CANDIDATE_CONFLICT",
          error: "Visible review days changed. Refresh and try again.",
          visibleCandidateDates,
        },
        { status: 409 }
      )
    );
  }

  let affectedDates = parsedDates.dates;

  if (isNotTrackedMutation(action)) {
    const dayStatus = getDayStatusForAction(action);
    let mutationResult;
    try {
      mutationResult = await createAdminSupabaseClient().rpc(
        "habit_absence_review_set_day_status",
        {
          p_user_id: user.id,
          p_review_dates: parsedDates.dates,
          p_day_status: dayStatus,
        }
      );
    } catch {
      console.error("[HabitsApi] Absence review day-status writer unavailable");
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            code: "ABSENCE_REVIEW_UNAVAILABLE",
            error: "Could not save that review right now.",
          },
          { status: 503 }
        )
      );
    }
    const mutationConflict = getMutationConflict(mutationResult.error);
    if (mutationConflict) {
      return applySupabaseCookies(noStoreJson({ ok: false, ...mutationConflict }, { status: 409 }));
    }
    if (isHabitsSchemaMissing(mutationResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            code: "ABSENCE_REVIEW_UNAVAILABLE",
            error: "Habits review history is still syncing in this environment.",
          },
          { status: 503 }
        )
      );
    }
    if (mutationResult.error) {
      console.error("[HabitsApi] Absence review day-status mutation unavailable", {
        code: mutationResult.error.code ?? null,
      });
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            code: "ABSENCE_REVIEW_UNAVAILABLE",
            error: "Could not save that review right now.",
          },
          { status: 503 }
        )
      );
    }

    const rows = mutationResult.data ?? [];
    const sortedRows = [...rows].sort((left, right) =>
      left.review_date.localeCompare(right.review_date)
    );
    const expectedDayStatus = getDayStatusForAction(action);
    const hasInvalidResult =
      rows.length !== parsedDates.dates.length ||
      !haveSameDates(
        sortedRows.map((row) => row.review_date),
        parsedDates.dates
      ) ||
      sortedRows.some(
        (row) => row.day_status !== expectedDayStatus || typeof row.was_changed !== "boolean"
      );
    if (hasInvalidResult) {
      console.error("[HabitsApi] Absence review day-status result was incomplete");
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            code: "ABSENCE_REVIEW_UNAVAILABLE",
            error: "Could not confirm that review right now.",
          },
          { status: 503 }
        )
      );
    }
    affectedDates = sortedRows.filter((row) => row.was_changed).map((row) => row.review_date);
  } else {
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
          {
            ok: false,
            code: "ABSENCE_REVIEW_UNAVAILABLE",
            error: "Habits review history is still syncing in this environment.",
          },
          { status: 503 }
        )
      );
    }
    if (upsertResult.error) {
      console.error("[HabitsApi] Could not save absence review acknowledgement", {
        code: upsertResult.error.code ?? null,
      });
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            code: "ABSENCE_REVIEW_UNAVAILABLE",
            error: "Could not save that review right now.",
          },
          { status: 503 }
        )
      );
    }
  }

  const snapshot = await loadHabitSnapshot(supabase, user.id, {
    selectedDate,
    todayDate,
  });

  if (!isNotTrackedMutation(action) || affectedDates.length > 0) {
    void trackAnalyticsEvent({
      eventName: "habit_absence_review_acknowledged",
      channel: "server",
      userId: user.id,
      payload: {
        selectedDate,
        reviewDateCount: affectedDates.length,
        reviewAction: action,
        reviewScope: ABSENCE_REVIEW_SCOPE,
      },
    });
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      action,
      affectedDates,
      affectedCount: affectedDates.length,
      reviewedDates: parsedDates.dates,
      visibleCandidateDates,
      snapshot,
    })
  );
}
