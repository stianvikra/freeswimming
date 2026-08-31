import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  createRouteHandlerSupabaseClientMock,
  getRequestLocalDayContextMock,
  loadHabitSnapshotMock,
  trackAnalyticsEventMock,
} = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
  getRequestLocalDayContextMock: vi.fn(),
  loadHabitSnapshotMock: vi.fn(),
  trackAnalyticsEventMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/habits/server", () => ({
  HABIT_DEFINITION_SELECT: "habit definition select",
  HABIT_CHECK_IN_SELECT: "habit check-in select",
  HABIT_MOTIVATION_RESET_SELECT: "habit motivation reset select",
  HABIT_ABSENCE_REVIEW_SELECT: "habit absence review select",
  loadHabitSnapshot: loadHabitSnapshotMock,
}));

vi.mock("@/lib/my-library/local-day-server", () => ({
  getRequestLocalDayContext: getRequestLocalDayContextMock,
}));

vi.mock("@/lib/analytics/events", () => ({
  trackAnalyticsEvent: trackAnalyticsEventMock,
}));

import { POST as postHabitCheckIn } from "@/app/api/my-library/habits/check-ins/route";
import { POST as postHabitAbsenceReview } from "@/app/api/my-library/habits/absence-review/route";
import { POST as postHabitResetStats } from "@/app/api/my-library/habits/[habitId]/reset-stats/route";
import { PATCH as patchHabit } from "@/app/api/my-library/habits/[habitId]/route";
import { POST as postHabit } from "@/app/api/my-library/habits/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildSnapshot() {
  return {
    schemaReady: true,
    loadError: null,
    selectedDate: "2026-05-10",
    activeHabits: [],
    archivedHabits: [],
    daySummary: {
      date: "2026-05-10",
      scheduledHabitCount: 0,
      perfectDayItemCount: 0,
      satisfiedPerfectDayItemCount: 0,
      completionPercent: 0,
      isPerfectDay: false,
      completedDurationMinutes: 0,
      completedCountTotal: 0,
      items: [],
    },
    weekSummary: {
      days: [],
      perfectDayCount: 0,
      averageCompletionPercent: 0,
      totalDurationMinutes: 0,
      totalCount: 0,
    },
  };
}

const HABIT_ID = "11111111-1111-4111-8111-111111111111";
const HABITS_API_URL = "http://127.0.0.1:3000/api/my-library/habits";

const HABIT_MUTATION_ROUTES = [
  ["create", "POST", "", { title: "Read" }],
  ["update", "PATCH", `/${HABIT_ID}`, { title: "Read" }],
  ["check-in", "POST", "/check-ins", { habitId: HABIT_ID, valueBoolean: true }],
  ["absence-review", "POST", "/absence-review", { dates: ["2026-05-10"] }],
  ["reset-stats", "POST", `/${HABIT_ID}/reset-stats`, { effectiveDate: "2026-05-10" }],
] as const;
type HabitMutationRoute = (typeof HABIT_MUTATION_ROUTES)[number];
type HabitMutationKind = HabitMutationRoute[0];

function mockAuthenticatedRouteClient(from = vi.fn()) {
  const client = {
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      from,
    },
    applySupabaseCookies: applyResponseCookiesIdentity,
  };
  createRouteHandlerSupabaseClientMock.mockResolvedValue(client);
  return from;
}

function callHabitMutation(route: HabitMutationRoute, serializedBody: string) {
  const [kind, method, path] = route;
  const request = new Request(`${HABITS_API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: serializedBody,
  });
  if (kind === "update") {
    return patchHabit(request, { params: Promise.resolve({ habitId: HABIT_ID }) });
  }
  if (kind === "reset-stats") {
    return postHabitResetStats(request, { params: Promise.resolve({ habitId: HABIT_ID }) });
  }
  if (kind === "check-in") return postHabitCheckIn(request);
  if (kind === "absence-review") return postHabitAbsenceReview(request);
  return postHabit(request);
}

function callHabitMutationJson(route: HabitMutationRoute, overrides: Record<string, unknown> = {}) {
  return callHabitMutation(route, JSON.stringify({ ...route[3], ...overrides }));
}

function getHabitMutationRoute(kind: HabitMutationKind) {
  return HABIT_MUTATION_ROUTES.find((route) => route[0] === kind)!;
}

function mockHabitDefinitionCreateClient() {
  const existingEqStatus = vi.fn().mockResolvedValue({ data: [], error: null });
  const existingEqUser = vi.fn(() => ({ eq: existingEqStatus }));
  const existingSelect = vi.fn(() => ({ eq: existingEqUser }));
  const insert = vi.fn();
  const from = vi.fn(() => ({ select: existingSelect, insert }));
  mockAuthenticatedRouteClient(from);
  return { from, insert };
}

function mockResetStatsClient(startDate: string) {
  const habitMaybeSingle = vi.fn().mockResolvedValue({
    data: { id: HABIT_ID, habit_mode: "timed", start_date: startDate, status: "active" },
    error: null,
  });
  const habitEqId = vi.fn(() => ({ maybeSingle: habitMaybeSingle }));
  const habitEqUser = vi.fn(() => ({ eq: habitEqId }));
  const habitSelect = vi.fn(() => ({ eq: habitEqUser }));
  const insert = vi.fn();
  const from = vi.fn(() => ({ select: habitSelect, insert }));
  mockAuthenticatedRouteClient(from);
  return { from, insert };
}

describe("habits routes", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
    getRequestLocalDayContextMock.mockReset();
    getRequestLocalDayContextMock.mockImplementation(({ now }: { now: Date }) =>
      Promise.resolve({
        status: "resolved",
        source: "utc_fallback",
        timezone: "UTC",
        todayDate: "2026-05-10",
        now,
      })
    );
    loadHabitSnapshotMock.mockResolvedValue(buildSnapshot());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated habit create", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabit(
      new Request("http://127.0.0.1:3000/api/my-library/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Read" }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("rejects non-object JSON bodies before every Habits mutation write", async () => {
    for (const route of HABIT_MUTATION_ROUTES) {
      for (const payload of [null, "invalid", []]) {
        const from = mockAuthenticatedRouteClient();
        const response = await callHabitMutation(route, JSON.stringify(payload));

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toMatchObject({
          ok: false,
          error: "Invalid JSON body.",
        });
        expect(from).not.toHaveBeenCalled();
      }
    }

    expect(getRequestLocalDayContextMock).not.toHaveBeenCalled();
    expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
  });

  it("rejects missing, stale, and malformed rendered local-day context before every write", async () => {
    const renderedCases = [
      [undefined, 409, "STALE_LOCAL_DAY_CONTEXT"],
      ["2026-05-09", 409, "STALE_LOCAL_DAY_CONTEXT"],
      ["2026-02-30", 400, "INVALID_DATE"],
    ] as const;

    for (const [renderedTodayDate, status, code] of renderedCases) {
      const renderedContext = renderedTodayDate === undefined ? {} : { renderedTodayDate };
      for (const route of HABIT_MUTATION_ROUTES) {
        const from = mockAuthenticatedRouteClient();
        const response = await callHabitMutationJson(route, renderedContext);

        expect(response.status).toBe(status);
        await expect(response.json()).resolves.toMatchObject({
          ok: false,
          code,
        });
        expect(from).not.toHaveBeenCalled();
      }
    }

    expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
  });

  it("rejects invalid explicit timezones before every Habits mutation write", async () => {
    const invalidTimezone = {
      status: "invalid_explicit",
      reason: "unsupported",
      now: new Date("2026-05-10T12:00:00.000Z"),
    } as const;

    for (const route of HABIT_MUTATION_ROUTES) {
      const from = mockAuthenticatedRouteClient();
      getRequestLocalDayContextMock.mockResolvedValueOnce(invalidTimezone);
      const response = await callHabitMutationJson(route, { timezone: "Mars/Olympus" });
      const payload = (await response.json()) as { ok: boolean; code: string };

      expect(response.status).toBe(400);
      expect(payload).toMatchObject({ ok: false, code: "INVALID_TIMEZONE" });
      expect(from).not.toHaveBeenCalled();
      expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
    }
  });

  it("saves absence review acknowledgements without writing habit check-ins", async () => {
    const select = vi.fn().mockResolvedValue({ data: [], error: null });
    const upsert = vi.fn(() => ({ select }));
    const from = vi.fn((table: string) =>
      table === "habit_absence_review_acknowledgements" ? { upsert } : {}
    );

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabitAbsenceReview(
      new Request("http://127.0.0.1:3000/api/my-library/habits/absence-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dates: ["2026-05-06", "2026-05-05"],
          selectedDate: "2026-05-10",
          renderedTodayDate: "2026-05-10",
          action: "finish",
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean; reviewedDates: string[] };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.reviewedDates).toEqual(["2026-05-05", "2026-05-06"]);
    expect(from).toHaveBeenCalledWith("habit_absence_review_acknowledgements");
    expect(from).not.toHaveBeenCalledWith("habit_check_ins");
    expect(upsert).toHaveBeenCalledWith(
      [
        {
          user_id: "user-1",
          review_scope: "weekly_absence_review",
          review_date: "2026-05-05",
          status: "reviewed",
        },
        {
          user_id: "user-1",
          review_scope: "weekly_absence_review",
          review_date: "2026-05-06",
          status: "reviewed",
        },
      ],
      { onConflict: "user_id,review_scope,review_date" }
    );
    expect(select).toHaveBeenCalledWith("habit absence review select");
    expect(loadHabitSnapshotMock).toHaveBeenCalledWith(expect.anything(), "user-1", {
      selectedDate: "2026-05-10",
      todayDate: "2026-05-10",
    });
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "habit_absence_review_acknowledged",
        channel: "server",
        userId: "user-1",
        payload: expect.objectContaining({
          selectedDate: "2026-05-10",
          reviewDateCount: 2,
          reviewAction: "finish",
        }),
      })
    );
  });

  it.each([
    {
      name: "future",
      body: { dates: ["2026-05-11"], selectedDate: "2026-05-11" },
      expected: { ok: false, error: "Review dates cannot be in the future." },
      checksSnapshot: true,
    },
    {
      name: "impossible",
      body: { dates: ["2026-02-31"] },
      expected: { ok: false, code: "INVALID_DATE", error: "Invalid review date." },
      checksSnapshot: false,
    },
  ])("rejects $name absence-review dates before database writes", async (testCase) => {
    const from = mockAuthenticatedRouteClient();
    const response = await callHabitMutationJson(getHabitMutationRoute("absence-review"), {
      ...testCase.body,
      renderedTodayDate: "2026-05-10",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject(testCase.expected);
    expect(from).not.toHaveBeenCalled();
    if (testCase.checksSnapshot) expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
  });

  it("rejects future habit check-ins before database writes", async () => {
    const from = vi.fn();

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabitCheckIn(
      new Request("http://127.0.0.1:3000/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: "11111111-1111-4111-8111-111111111111",
          checkInDate: "2999-01-01",
          renderedTodayDate: "2026-05-10",
          valueBoolean: true,
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Choose today or a past date for habit check-ins.");
    expect(from).not.toHaveBeenCalled();
    expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
  });

  it("creates an owner-scoped litres habit definition", async () => {
    const existingEqStatus = vi.fn().mockResolvedValue({ data: [], error: null });
    const existingEqUser = vi.fn(() => ({ eq: existingEqStatus }));
    const existingSelect = vi.fn(() => ({ eq: existingEqUser }));
    const insertSingle = vi.fn().mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
      },
      error: null,
    });
    const insertSelect = vi.fn(() => ({ single: insertSingle }));
    const insert = vi.fn(() => ({ select: insertSelect }));
    const from = vi.fn(() => ({ select: existingSelect, insert }));

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabit(
      new Request("http://127.0.0.1:3000/api/my-library/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Drink water",
          habitType: "count",
          category: "nutrition",
          targetValueNumeric: 2,
          targetUnit: "litres",
          selectedDate: "2026-05-10",
          renderedTodayDate: "2026-05-10",
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        title: "Drink water",
        habit_type: "count",
        target_operator: "at_least",
        target_value_numeric: 2,
        target_unit: "litres",
        cadence_period: "daily",
        cadence_target_count: 1,
        cadence_day_policy: "fixed",
      })
    );
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "habit_created",
        userId: "user-1",
        payload: expect.objectContaining({
          habitMode: "build",
          habitType: "count",
          category: "nutrition",
          cadencePeriod: "daily",
          cadenceDayPolicy: "fixed",
          cadenceTargetCount: 1,
        }),
      })
    );
  });

  it.each([
    {
      name: "rejects matching future start and selected dates before habit creation",
      body: { title: "Future habit", startDate: "2026-05-11", selectedDate: "2026-05-11" },
      expected: { ok: false, error: "Choose today or an earlier start date." },
      needsDefinitionLookup: true,
      checksContext: false,
      checksSnapshot: true,
    },
    {
      name: "rejects impossible habit start dates before database access",
      body: { title: "Impossible date", startDate: "2026-02-31" },
      expected: { ok: false, code: "INVALID_DATE", error: "Choose a valid start date." },
      needsDefinitionLookup: false,
      checksContext: true,
      checksSnapshot: false,
    },
    {
      name: "rejects PostgreSQL-incompatible year-zero dates before database access",
      body: { title: "Year zero", startDate: "0000-01-01" },
      expected: { ok: false, code: "INVALID_DATE", error: "Choose a valid start date." },
      needsDefinitionLookup: false,
      checksContext: true,
      checksSnapshot: true,
    },
    {
      name: "rejects an impossible selected date used as the implicit start before database access",
      body: { title: "Implicit impossible date", selectedDate: "2026-02-31" },
      expected: { ok: false, code: "INVALID_DATE", error: "Choose a valid start date." },
      needsDefinitionLookup: false,
      checksContext: true,
      checksSnapshot: true,
    },
  ])("$name", async (testCase) => {
    const client = testCase.needsDefinitionLookup
      ? mockHabitDefinitionCreateClient()
      : { from: mockAuthenticatedRouteClient(), insert: null };
    const response = await callHabitMutationJson(getHabitMutationRoute("create"), {
      ...testCase.body,
      renderedTodayDate: "2026-05-10",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject(testCase.expected);
    if (client.insert) expect(client.insert).not.toHaveBeenCalled();
    else expect(client.from).not.toHaveBeenCalled();
    if (testCase.checksContext) expect(getRequestLocalDayContextMock).not.toHaveBeenCalled();
    if (testCase.checksSnapshot) expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
  });

  it("rejects unsupported monthly fixed-date cadence before writes", async () => {
    const existingEqStatus = vi.fn().mockResolvedValue({ data: [], error: null });
    const existingEqUser = vi.fn(() => ({ eq: existingEqStatus }));
    const existingSelect = vi.fn(() => ({ eq: existingEqUser }));
    const insert = vi.fn();
    const from = vi.fn(() => ({ select: existingSelect, insert }));

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabit(
      new Request("http://127.0.0.1:3000/api/my-library/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Review technique",
          cadencePeriod: "monthly",
          cadenceTargetCount: 5,
          cadenceDayPolicy: "fixed",
          selectedDate: "2026-05-10",
          renderedTodayDate: "2026-05-10",
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Monthly fixed dates are not available yet.");
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects invalid habit ids before auth work", async () => {
    const response = await patchHabit(
      new Request("http://127.0.0.1:3000/api/my-library/habits/not-a-habit-id", {
        method: "PATCH",
      }),
      {
        params: Promise.resolve({
          habitId: "not-a-habit-id",
        }),
      }
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Invalid habit id.");
    expect(createRouteHandlerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("rejects invalid reset-stats habit ids before auth work", async () => {
    const response = await postHabitResetStats(
      new Request("http://127.0.0.1:3000/api/my-library/habits/not-a-habit-id/reset-stats", {
        method: "POST",
      }),
      {
        params: Promise.resolve({
          habitId: "not-a-habit-id",
        }),
      }
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Invalid habit id.");
    expect(createRouteHandlerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("fails closed for unauthenticated reset-stats requests", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabitResetStats(
      new Request(
        "http://127.0.0.1:3000/api/my-library/habits/11111111-1111-4111-8111-111111111111/reset-stats",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            effectiveDate: "2026-05-10",
            renderedTodayDate: "2026-05-10",
          }),
        }
      ),
      {
        params: Promise.resolve({
          habitId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );

    expect(response.status).toBe(401);
    expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
    expect(trackAnalyticsEventMock).not.toHaveBeenCalled();
  });

  it("fails closed for cross-owner reset-stats requests", async () => {
    const habitMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const habitEqId = vi.fn(() => ({ maybeSingle: habitMaybeSingle }));
    const habitEqUser = vi.fn(() => ({ eq: habitEqId }));
    const habitSelect = vi.fn(() => ({ eq: habitEqUser }));
    const insert = vi.fn();
    const from = vi.fn(() => ({ select: habitSelect, insert }));

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabitResetStats(
      new Request(
        "http://127.0.0.1:3000/api/my-library/habits/11111111-1111-4111-8111-111111111111/reset-stats",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            effectiveDate: "2026-05-10",
            renderedTodayDate: "2026-05-10",
          }),
        }
      ),
      {
        params: Promise.resolve({
          habitId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(404);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Habit not found.");
    expect(habitEqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(insert).not.toHaveBeenCalled();
    expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
    expect(trackAnalyticsEventMock).not.toHaveBeenCalled();
  });

  it("fails closed for unauthenticated habit updates", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchHabit(
      new Request(
        "http://127.0.0.1:3000/api/my-library/habits/11111111-1111-4111-8111-111111111111",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Read" }),
        }
      ),
      {
        params: Promise.resolve({
          habitId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );

    expect(response.status).toBe(401);
  });

  it("updates an owner-scoped habit definition without touching check-ins", async () => {
    const updateMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        habit_mode: "build",
        status: "active",
      },
      error: null,
    });
    const updateSelect = vi.fn(() => ({ maybeSingle: updateMaybeSingle }));
    const updateEqId = vi.fn(() => ({ select: updateSelect }));
    const updateEqUser = vi.fn(() => ({ eq: updateEqId }));
    const update = vi.fn(() => ({ eq: updateEqUser }));
    const from = vi.fn(() => ({ update }));

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchHabit(
      new Request(
        "http://127.0.0.1:3000/api/my-library/habits/11111111-1111-4111-8111-111111111111",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "W: Fasting",
            habitMode: "build",
            habitType: "count",
            category: "nutrition",
            targetValueNumeric: 1,
            targetUnit: "litres",
            startDate: "2026-05-04",
            scheduleDays: ["monday", "wednesday", "friday"],
            selectedDate: "2026-05-10",
            renderedTodayDate: "2026-05-10",
          }),
        }
      ),
      {
        params: Promise.resolve({
          habitId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "W: Fasting",
        habit_mode: "build",
        habit_type: "count",
        target_value_numeric: 1,
        target_unit: "litres",
        cadence_period: "weekly",
        cadence_target_count: 3,
        cadence_day_policy: "fixed",
        schedule_days: ["monday", "wednesday", "friday"],
      })
    );
    expect(from).toHaveBeenCalledWith("habit_definitions");
    expect(from).not.toHaveBeenCalledWith("habit_check_ins");
    expect(updateEqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(updateEqId).toHaveBeenCalledWith("id", "11111111-1111-4111-8111-111111111111");
  });

  it("rejects matching future start and selected dates before habit updates", async () => {
    const from = mockAuthenticatedRouteClient();
    const response = await callHabitMutationJson(getHabitMutationRoute("update"), {
      startDate: "2026-05-11",
      selectedDate: "2026-05-11",
      renderedTodayDate: "2026-05-10",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "Choose today or an earlier start date.",
    });
    expect(from).not.toHaveBeenCalled();
    expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
  });

  it("rejects unsupported habit lifecycle status before writes", async () => {
    const from = vi.fn();

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchHabit(
      new Request(
        "http://127.0.0.1:3000/api/my-library/habits/11111111-1111-4111-8111-111111111111",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "deleted", renderedTodayDate: "2026-05-10" }),
        }
      ),
      {
        params: Promise.resolve({
          habitId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Unsupported habit status.");
    expect(from).not.toHaveBeenCalled();
    expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
    expect(trackAnalyticsEventMock).not.toHaveBeenCalled();
  });

  it("restores archived habits without touching check-ins", async () => {
    const currentMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        status: "archived",
      },
      error: null,
    });
    const currentEqId = vi.fn(() => ({ maybeSingle: currentMaybeSingle }));
    const currentEqUser = vi.fn(() => ({ eq: currentEqId }));
    const currentSelect = vi.fn(() => ({ eq: currentEqUser }));
    const activeEqStatus = vi.fn().mockResolvedValue({ count: 3, error: null });
    const activeEqUser = vi.fn(() => ({ eq: activeEqStatus }));
    const activeSelect = vi.fn(() => ({ eq: activeEqUser }));
    const updateMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        habit_mode: "build",
        status: "active",
        cadence_period: "daily",
        cadence_day_policy: "fixed",
        cadence_target_count: 1,
      },
      error: null,
    });
    const updateSelect = vi.fn(() => ({ maybeSingle: updateMaybeSingle }));
    const updateEqId = vi.fn(() => ({ select: updateSelect }));
    const updateEqUser = vi.fn(() => ({ eq: updateEqId }));
    const update = vi.fn(() => ({ eq: updateEqUser }));
    const from = vi
      .fn()
      .mockReturnValueOnce({ select: currentSelect })
      .mockReturnValueOnce({ select: activeSelect })
      .mockReturnValueOnce({ update });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchHabit(
      new Request(
        "http://127.0.0.1:3000/api/my-library/habits/11111111-1111-4111-8111-111111111111",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "active",
            selectedDate: "2026-05-10",
            renderedTodayDate: "2026-05-10",
          }),
        }
      ),
      {
        params: Promise.resolve({
          habitId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(currentEqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(currentEqId).toHaveBeenCalledWith("id", "11111111-1111-4111-8111-111111111111");
    expect(activeSelect).toHaveBeenCalledWith("id", { count: "exact", head: true });
    expect(activeEqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(activeEqStatus).toHaveBeenCalledWith("status", "active");
    expect(update).toHaveBeenCalledWith({ status: "active" });
    expect(from).toHaveBeenCalledWith("habit_definitions");
    expect(from).not.toHaveBeenCalledWith("habit_check_ins");
    expect(loadHabitSnapshotMock).toHaveBeenCalledWith(expect.anything(), "user-1", {
      selectedDate: "2026-05-10",
      todayDate: "2026-05-10",
    });
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "habit_updated",
        payload: expect.objectContaining({
          status: "active",
          archived: false,
          changedStatus: true,
        }),
      })
    );
  });

  it("fails closed for cross-owner habit restore requests", async () => {
    const currentMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const currentEqId = vi.fn(() => ({ maybeSingle: currentMaybeSingle }));
    const currentEqUser = vi.fn(() => ({ eq: currentEqId }));
    const currentSelect = vi.fn(() => ({ eq: currentEqUser }));
    const update = vi.fn();
    const from = vi.fn().mockReturnValueOnce({ select: currentSelect }).mockReturnValue({ update });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchHabit(
      new Request(
        "http://127.0.0.1:3000/api/my-library/habits/11111111-1111-4111-8111-111111111111",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "active", renderedTodayDate: "2026-05-10" }),
        }
      ),
      {
        params: Promise.resolve({
          habitId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(404);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Habit not found.");
    expect(update).not.toHaveBeenCalled();
    expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
    expect(trackAnalyticsEventMock).not.toHaveBeenCalled();
  });

  it("blocks restore when the active habit limit is already reached", async () => {
    const currentMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        status: "archived",
      },
      error: null,
    });
    const currentEqId = vi.fn(() => ({ maybeSingle: currentMaybeSingle }));
    const currentEqUser = vi.fn(() => ({ eq: currentEqId }));
    const currentSelect = vi.fn(() => ({ eq: currentEqUser }));
    const activeEqStatus = vi.fn().mockResolvedValue({ count: 12, error: null });
    const activeEqUser = vi.fn(() => ({ eq: activeEqStatus }));
    const activeSelect = vi.fn(() => ({ eq: activeEqUser }));
    const update = vi.fn();
    const from = vi
      .fn()
      .mockReturnValueOnce({ select: currentSelect })
      .mockReturnValueOnce({ select: activeSelect })
      .mockReturnValue({ update });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchHabit(
      new Request(
        "http://127.0.0.1:3000/api/my-library/habits/11111111-1111-4111-8111-111111111111",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "active", renderedTodayDate: "2026-05-10" }),
        }
      ),
      {
        params: Promise.resolve({
          habitId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Archive one active habit before restoring another.");
    expect(update).not.toHaveBeenCalled();
    expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
    expect(trackAnalyticsEventMock).not.toHaveBeenCalled();
  });

  it("returns a stable failure-mode response when habit update storage fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const updateMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "write failed" },
    });
    const updateSelect = vi.fn(() => ({ maybeSingle: updateMaybeSingle }));
    const updateEqId = vi.fn(() => ({ select: updateSelect }));
    const updateEqUser = vi.fn(() => ({ eq: updateEqId }));
    const update = vi.fn(() => ({ eq: updateEqUser }));
    const from = vi.fn(() => ({ update }));

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchHabit(
      new Request(
        "http://127.0.0.1:3000/api/my-library/habits/11111111-1111-4111-8111-111111111111",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Read", renderedTodayDate: "2026-05-10" }),
        }
      ),
      {
        params: Promise.resolve({
          habitId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(500);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Could not update that habit right now.");
    expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      "[HabitsApi] Could not update habit",
      expect.objectContaining({ message: "write failed" })
    );
  });

  it("creates owner-scoped reset-stats events without deleting check-ins", async () => {
    const habitMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        habit_mode: "timed",
        start_date: "2026-05-01",
        status: "active",
      },
      error: null,
    });
    const habitEqId = vi.fn(() => ({ maybeSingle: habitMaybeSingle }));
    const habitEqUser = vi.fn(() => ({ eq: habitEqId }));
    const habitSelect = vi.fn(() => ({ eq: habitEqUser }));
    const resetSingle = vi.fn().mockResolvedValue({
      data: {
        id: "99999999-9999-4999-8999-999999999999",
      },
      error: null,
    });
    const resetSelect = vi.fn(() => ({ single: resetSingle }));
    const insert = vi.fn(() => ({ select: resetSelect }));
    const upsert = vi.fn();
    const from = vi.fn((table: string) =>
      table === "habit_motivation_resets" ? { insert } : { select: habitSelect, upsert }
    );

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabitResetStats(
      new Request(
        "http://127.0.0.1:3000/api/my-library/habits/11111111-1111-4111-8111-111111111111/reset-stats",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            effectiveDate: "2026-05-10",
            selectedDate: "2026-05-10",
            renderedTodayDate: "2026-05-10",
          }),
        }
      ),
      {
        params: Promise.resolve({
          habitId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(habitEqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(habitEqId).toHaveBeenCalledWith("id", "11111111-1111-4111-8111-111111111111");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        habit_id: "11111111-1111-4111-8111-111111111111",
        reset_type: "reset_stats",
        status: "active",
        effective_date: "2026-05-10",
        created_by: "user-1",
      })
    );
    expect(upsert).not.toHaveBeenCalled();
    expect(loadHabitSnapshotMock).toHaveBeenCalledWith(expect.anything(), "user-1", {
      selectedDate: "2026-05-10",
      todayDate: "2026-05-10",
    });
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "habit_stats_reset_created",
        userId: "user-1",
        payload: expect.objectContaining({
          habitMode: "timed",
          effectiveDate: "2026-05-10",
        }),
      })
    );
  });

  it("rejects future reset boundaries before reset-event writes", async () => {
    const { insert } = mockResetStatsClient("2026-05-01");
    const response = await callHabitMutationJson(getHabitMutationRoute("reset-stats"), {
      effectiveDate: "2026-05-11",
      selectedDate: "2026-05-11",
      renderedTodayDate: "2026-05-10",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "Choose today or an earlier reset date.",
    });
    expect(insert).not.toHaveBeenCalled();
    expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
  });

  it("fails closed without reset writes when the persisted habit start date is invalid", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { insert } = mockResetStatsClient("not-a-date");
    const response = await callHabitMutationJson(getHabitMutationRoute("reset-stats"), {
      renderedTodayDate: "2026-05-10",
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Could not reset habit stats right now.",
    });
    expect(insert).not.toHaveBeenCalled();
    expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      "[HabitsApi] Habit has an invalid persisted start date",
      { habitId: HABIT_ID }
    );
  });

  it("returns a stable failure-mode response when reset-stats storage fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const habitMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        habit_mode: "timed",
        start_date: "2026-05-01",
        status: "active",
      },
      error: null,
    });
    const habitEqId = vi.fn(() => ({ maybeSingle: habitMaybeSingle }));
    const habitEqUser = vi.fn(() => ({ eq: habitEqId }));
    const habitSelect = vi.fn(() => ({ eq: habitEqUser }));
    const resetSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "insert failed" },
    });
    const resetSelect = vi.fn(() => ({ single: resetSingle }));
    const insert = vi.fn(() => ({ select: resetSelect }));
    const from = vi.fn((table: string) =>
      table === "habit_motivation_resets" ? { insert } : { select: habitSelect }
    );

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabitResetStats(
      new Request(
        "http://127.0.0.1:3000/api/my-library/habits/11111111-1111-4111-8111-111111111111/reset-stats",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            effectiveDate: "2026-05-10",
            selectedDate: "2026-05-10",
            renderedTodayDate: "2026-05-10",
          }),
        }
      ),
      {
        params: Promise.resolve({
          habitId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(500);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Could not reset habit stats right now.");
    expect(loadHabitSnapshotMock).not.toHaveBeenCalled();
    expect(trackAnalyticsEventMock).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      "[HabitsApi] Could not create habit motivation reset",
      expect.objectContaining({ message: "insert failed" })
    );
  });

  it("accepts and stores a check-in on an opposite positive local-date boundary", async () => {
    const habitMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: "11111111-1111-4111-8111-111111111111" },
      error: null,
    });
    const habitEqId = vi.fn(() => ({ maybeSingle: habitMaybeSingle }));
    const habitEqUser = vi.fn(() => ({ eq: habitEqId }));
    const habitSelect = vi.fn(() => ({ eq: habitEqUser }));
    const upsertSingle = vi.fn().mockResolvedValue({
      data: { id: "22222222-2222-4222-8222-222222222222" },
      error: null,
    });
    const upsertSelect = vi.fn(() => ({ single: upsertSingle }));
    const upsert = vi.fn(() => ({ select: upsertSelect }));
    const from = vi.fn((table: string) =>
      table === "habit_check_ins" ? { upsert } : { select: habitSelect }
    );

    mockAuthenticatedRouteClient(from);
    getRequestLocalDayContextMock.mockImplementationOnce(({ now }: { now: Date }) =>
      Promise.resolve({
        status: "resolved",
        source: "explicit",
        timezone: "Pacific/Kiritimati",
        todayDate: "2026-05-11",
        now,
      })
    );

    const response = await callHabitMutationJson(getHabitMutationRoute("check-in"), {
      checkInDate: "2026-05-11",
      renderedTodayDate: "2026-05-11",
      timezone: "Pacific/Kiritimati",
    });
    const payload = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(habitEqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(habitEqId).toHaveBeenCalledWith("id", "11111111-1111-4111-8111-111111111111");
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        habit_id: "11111111-1111-4111-8111-111111111111",
        check_in_date: "2026-05-11",
        timezone: "Pacific/Kiritimati",
        value_boolean: true,
      }),
      { onConflict: "user_id,habit_id,check_in_date" }
    );
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "habit_check_in_logged",
        userId: "user-1",
        payload: expect.objectContaining({
          habitMode: "build",
          hasBooleanValue: true,
        }),
      })
    );
    expect(loadHabitSnapshotMock).toHaveBeenCalledWith(expect.anything(), "user-1", {
      selectedDate: "2026-05-11",
      todayDate: "2026-05-11",
    });
  });

  it("keeps the selected snapshot date after a catch-up check-in writes a past day", async () => {
    const habitMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        habit_mode: "build",
        start_date: "2026-05-01",
      },
      error: null,
    });
    const habitEqId = vi.fn(() => ({ maybeSingle: habitMaybeSingle }));
    const habitEqUser = vi.fn(() => ({ eq: habitEqId }));
    const habitSelect = vi.fn(() => ({ eq: habitEqUser }));
    const upsertSingle = vi.fn().mockResolvedValue({
      data: { id: "22222222-2222-4222-8222-222222222222" },
      error: null,
    });
    const upsertSelect = vi.fn(() => ({ single: upsertSingle }));
    const upsert = vi.fn(() => ({ select: upsertSelect }));
    const from = vi.fn((table: string) =>
      table === "habit_check_ins" ? { upsert } : { select: habitSelect }
    );

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabitCheckIn(
      new Request("http://127.0.0.1:3000/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: "11111111-1111-4111-8111-111111111111",
          checkInDate: "2026-05-08",
          selectedDate: "2026-05-10",
          renderedTodayDate: "2026-05-10",
          valueBoolean: true,
          actionSource: "catch_up",
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(loadHabitSnapshotMock).toHaveBeenCalledWith(expect.anything(), "user-1", {
      selectedDate: "2026-05-10",
      todayDate: "2026-05-10",
    });
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "habit_check_in_logged",
        userId: "user-1",
        payload: expect.objectContaining({
          checkInDate: "2026-05-08",
          selectedDate: "2026-05-10",
          actionSource: "catch_up",
        }),
      })
    );
  });

  it("upserts timed check-ins with separate timer and manual sources", async () => {
    const habitMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        habit_mode: "timed",
        start_date: "2026-05-01",
      },
      error: null,
    });
    const habitEqId = vi.fn(() => ({ maybeSingle: habitMaybeSingle }));
    const habitEqUser = vi.fn(() => ({ eq: habitEqId }));
    const habitSelect = vi.fn(() => ({ eq: habitEqUser }));
    const upsertSingle = vi.fn().mockResolvedValue({
      data: { id: "22222222-2222-4222-8222-222222222222" },
      error: null,
    });
    const upsertSelect = vi.fn(() => ({ single: upsertSingle }));
    const upsert = vi.fn(() => ({ select: upsertSelect }));
    const from = vi.fn((table: string) =>
      table === "habit_check_ins" ? { upsert } : { select: habitSelect }
    );

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabitCheckIn(
      new Request("http://127.0.0.1:3000/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: "11111111-1111-4111-8111-111111111111",
          checkInDate: "2026-05-10",
          renderedTodayDate: "2026-05-10",
          timerSeconds: 125,
          manualMinutes: 5,
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        habit_id: "11111111-1111-4111-8111-111111111111",
        check_in_date: "2026-05-10",
        value_numeric: 7.08,
        timer_seconds: 125,
        manual_minutes: 5,
      }),
      { onConflict: "user_id,habit_id,check_in_date" }
    );
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "habit_timer_saved",
        userId: "user-1",
        payload: expect.objectContaining({
          habitMode: "timed",
          hasTimerSeconds: true,
          hasManualMinutes: true,
          timedSourceKind: "timer_and_manual",
        }),
      })
    );
  });

  it("undoes timed completion sources while preserving manual minutes", async () => {
    const habitMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        habit_mode: "timed",
        start_date: "2026-05-01",
      },
      error: null,
    });
    const habitEqId = vi.fn(() => ({ maybeSingle: habitMaybeSingle }));
    const habitEqUser = vi.fn(() => ({ eq: habitEqId }));
    const habitSelect = vi.fn(() => ({ eq: habitEqUser }));
    const checkInMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "22222222-2222-4222-8222-222222222222",
        timer_seconds: 480,
        manual_minutes: 5,
        status: "logged",
      },
      error: null,
    });
    const checkInEqDate = vi.fn(() => ({ maybeSingle: checkInMaybeSingle }));
    const checkInEqHabit = vi.fn(() => ({ eq: checkInEqDate }));
    const checkInEqUser = vi.fn(() => ({ eq: checkInEqHabit }));
    const checkInSelect = vi.fn(() => ({ eq: checkInEqUser }));
    const updateEqDate = vi.fn().mockResolvedValue({ error: null });
    const updateEqHabit = vi.fn(() => ({ eq: updateEqDate }));
    const updateEqUser = vi.fn(() => ({ eq: updateEqHabit }));
    const update = vi.fn(() => ({ eq: updateEqUser }));
    const deleteRows = vi.fn();
    const from = vi.fn((table: string) =>
      table === "habit_check_ins"
        ? { select: checkInSelect, update, delete: deleteRows }
        : { select: habitSelect }
    );

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabitCheckIn(
      new Request("http://127.0.0.1:3000/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: "11111111-1111-4111-8111-111111111111",
          checkInDate: "2026-05-10",
          renderedTodayDate: "2026-05-10",
          clearTimedCompletion: true,
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        value_numeric: 5,
        timer_seconds: 0,
        manual_minutes: 5,
        source_kind: "manual",
      })
    );
    expect(deleteRows).not.toHaveBeenCalled();
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "habit_check_in_reset",
        userId: "user-1",
        payload: expect.objectContaining({
          habitMode: "timed",
          checkInDate: "2026-05-10",
          resetKind: "timed_completion_source",
          hadManualMinutes: true,
          timedSourceKind: "timer",
        }),
      })
    );
  });

  it("deletes timer-only rows when undoing a timed completion", async () => {
    const habitMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        habit_mode: "timed",
        start_date: "2026-05-01",
      },
      error: null,
    });
    const habitEqId = vi.fn(() => ({ maybeSingle: habitMaybeSingle }));
    const habitEqUser = vi.fn(() => ({ eq: habitEqId }));
    const habitSelect = vi.fn(() => ({ eq: habitEqUser }));
    const checkInMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "22222222-2222-4222-8222-222222222222",
        timer_seconds: 480,
        manual_minutes: 0,
        status: "logged",
      },
      error: null,
    });
    const checkInEqDate = vi.fn(() => ({ maybeSingle: checkInMaybeSingle }));
    const checkInEqHabit = vi.fn(() => ({ eq: checkInEqDate }));
    const checkInEqUser = vi.fn(() => ({ eq: checkInEqHabit }));
    const checkInSelect = vi.fn(() => ({ eq: checkInEqUser }));
    const deleteEqDate = vi.fn().mockResolvedValue({ error: null });
    const deleteEqHabit = vi.fn(() => ({ eq: deleteEqDate }));
    const deleteEqUser = vi.fn(() => ({ eq: deleteEqHabit }));
    const deleteRows = vi.fn(() => ({ eq: deleteEqUser }));
    const update = vi.fn();
    const from = vi.fn((table: string) =>
      table === "habit_check_ins"
        ? { select: checkInSelect, update, delete: deleteRows }
        : { select: habitSelect }
    );

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabitCheckIn(
      new Request("http://127.0.0.1:3000/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: "11111111-1111-4111-8111-111111111111",
          checkInDate: "2026-05-10",
          renderedTodayDate: "2026-05-10",
          clearTimedCompletion: true,
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(update).not.toHaveBeenCalled();
    expect(deleteRows).toHaveBeenCalledTimes(1);
    expect(deleteEqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(deleteEqHabit).toHaveBeenCalledWith("habit_id", "11111111-1111-4111-8111-111111111111");
    expect(deleteEqDate).toHaveBeenCalledWith("check_in_date", "2026-05-10");
  });

  it("rejects mixed timed source and legacy numeric payloads before writes", async () => {
    const habitMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        habit_mode: "timed",
        start_date: "2026-05-01",
      },
      error: null,
    });
    const habitEqId = vi.fn(() => ({ maybeSingle: habitMaybeSingle }));
    const habitEqUser = vi.fn(() => ({ eq: habitEqId }));
    const habitSelect = vi.fn(() => ({ eq: habitEqUser }));
    const upsert = vi.fn();
    const from = vi.fn((table: string) =>
      table === "habit_check_ins" ? { upsert } : { select: habitSelect }
    );

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabitCheckIn(
      new Request("http://127.0.0.1:3000/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: "11111111-1111-4111-8111-111111111111",
          checkInDate: "2026-05-10",
          renderedTodayDate: "2026-05-10",
          timerSeconds: 120,
          manualMinutes: 5,
          valueNumeric: 99,
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Timed source updates cannot include other check-in values.");
    expect(upsert).not.toHaveBeenCalled();
  });

  it("rejects timed source values for non-timed habits before writes", async () => {
    const habitMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        habit_mode: "build",
        start_date: "2026-05-01",
      },
      error: null,
    });
    const habitEqId = vi.fn(() => ({ maybeSingle: habitMaybeSingle }));
    const habitEqUser = vi.fn(() => ({ eq: habitEqId }));
    const habitSelect = vi.fn(() => ({ eq: habitEqUser }));
    const upsert = vi.fn();
    const from = vi.fn((table: string) =>
      table === "habit_check_ins" ? { upsert } : { select: habitSelect }
    );

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabitCheckIn(
      new Request("http://127.0.0.1:3000/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: "11111111-1111-4111-8111-111111111111",
          checkInDate: "2026-05-10",
          renderedTodayDate: "2026-05-10",
          timerSeconds: 0,
          manualMinutes: 5,
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Timed source values require a timed habit.");
    expect(upsert).not.toHaveBeenCalled();
  });

  it("logs rest days as skipped owner-scoped check-ins without completion time", async () => {
    const habitMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: "11111111-1111-4111-8111-111111111111", habit_mode: "build" },
      error: null,
    });
    const habitEqId = vi.fn(() => ({ maybeSingle: habitMaybeSingle }));
    const habitEqUser = vi.fn(() => ({ eq: habitEqId }));
    const habitSelect = vi.fn(() => ({ eq: habitEqUser }));
    const upsertSingle = vi.fn().mockResolvedValue({
      data: { id: "22222222-2222-4222-8222-222222222222" },
      error: null,
    });
    const upsertSelect = vi.fn(() => ({ single: upsertSingle }));
    const upsert = vi.fn(() => ({ select: upsertSelect }));
    const from = vi.fn((table: string) =>
      table === "habit_check_ins" ? { upsert } : { select: habitSelect }
    );

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabitCheckIn(
      new Request("http://127.0.0.1:3000/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: "11111111-1111-4111-8111-111111111111",
          checkInDate: "2026-05-10",
          renderedTodayDate: "2026-05-10",
          status: "skipped",
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        habit_id: "11111111-1111-4111-8111-111111111111",
        check_in_date: "2026-05-10",
        status: "skipped",
        value_boolean: null,
        value_numeric: null,
        value_time: null,
        completed_at: null,
      }),
      { onConflict: "user_id,habit_id,check_in_date" }
    );
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "habit_rest_day_logged",
        userId: "user-1",
        payload: expect.objectContaining({
          habitMode: "build",
          checkInDate: "2026-05-10",
          status: "skipped",
        }),
      })
    );
  });

  it("logs quit habit lapses and updates the fast days-since anchor", async () => {
    const habitMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        habit_mode: "quit",
        start_date: "2026-05-07",
      },
      error: null,
    });
    const habitEqId = vi.fn(() => ({ maybeSingle: habitMaybeSingle }));
    const habitEqUser = vi.fn(() => ({ eq: habitEqId }));
    const habitSelect = vi.fn(() => ({ eq: habitEqUser }));
    const habitUpdateEqId = vi.fn().mockResolvedValue({ error: null });
    const habitUpdateEqUser = vi.fn(() => ({ eq: habitUpdateEqId }));
    const habitUpdate = vi.fn(() => ({ eq: habitUpdateEqUser }));
    const upsertSingle = vi.fn().mockResolvedValue({
      data: { id: "22222222-2222-4222-8222-222222222222" },
      error: null,
    });
    const upsertSelect = vi.fn(() => ({ single: upsertSingle }));
    const upsert = vi.fn(() => ({ select: upsertSelect }));
    const from = vi.fn((table: string) =>
      table === "habit_check_ins" ? { upsert } : { select: habitSelect, update: habitUpdate }
    );

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postHabitCheckIn(
      new Request("http://127.0.0.1:3000/api/my-library/habits/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: "11111111-1111-4111-8111-111111111111",
          checkInDate: "2026-05-10",
          renderedTodayDate: "2026-05-10",
          valueBoolean: false,
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        habit_id: "11111111-1111-4111-8111-111111111111",
        check_in_date: "2026-05-10",
        value_boolean: false,
      }),
      { onConflict: "user_id,habit_id,check_in_date" }
    );
    expect(habitUpdate).toHaveBeenCalledWith({ last_lapse_date: "2026-05-10" });
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "habit_lapse_logged",
        userId: "user-1",
        payload: expect.objectContaining({
          habitMode: "quit",
          checkInDate: "2026-05-10",
        }),
      })
    );
  });
});
