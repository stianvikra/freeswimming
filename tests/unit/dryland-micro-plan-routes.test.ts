import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  cookiesMock,
  createRouteHandlerSupabaseClientMock,
  removeMicroSessionHabitCreditMock,
  recordMicroSessionHabitCreditMock,
  trackAnalyticsEventMock,
} = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  createRouteHandlerSupabaseClientMock: vi.fn(),
  removeMicroSessionHabitCreditMock: vi.fn(),
  recordMicroSessionHabitCreditMock: vi.fn(),
  trackAnalyticsEventMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/analytics/events", () => ({
  trackAnalyticsEvent: trackAnalyticsEventMock,
}));

vi.mock("@/lib/dryland/micro-habit-linkage", async () => {
  const actual = await vi.importActual<typeof import("@/lib/dryland/micro-habit-linkage")>(
    "@/lib/dryland/micro-habit-linkage"
  );
  return {
    ...actual,
    removeMicroSessionHabitCredit: removeMicroSessionHabitCreditMock,
    recordMicroSessionHabitCredit: recordMicroSessionHabitCreditMock,
  };
});

import { PATCH as patchDrylandMicroPlan } from "@/app/api/my-library/dryland/micro-plans/[planId]/route";
import { POST as postDrylandMicroPlan } from "@/app/api/my-library/dryland/micro-plans/route";
import type { Database } from "@/types/database";

type DrylandRow = Database["public"]["Tables"]["dryland_sessions"]["Row"];
type DrylandMicroPlanRow = Database["public"]["Tables"]["dryland_micro_plans"]["Row"];
type HabitDefinitionRow = Database["public"]["Tables"]["habit_definitions"]["Row"];
type MicroSessionHabitLinkRow = Database["public"]["Tables"]["micro_session_habit_links"]["Row"];

const MICRO_PLAN_ID = "22222222-2222-4222-8222-222222222222";
const MICRO_PLAN_URL = "http://127.0.0.1:3000/api/my-library/dryland/micro-plans";

function patchMicroPlan(body: unknown, planId = MICRO_PLAN_ID) {
  return patchDrylandMicroPlan(
    new Request(`${MICRO_PLAN_URL}/${planId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ planId }) }
  );
}

function mockAuthenticatedClient(from: (table: string) => unknown) {
  createRouteHandlerSupabaseClientMock.mockResolvedValue({
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      from,
    },
    applySupabaseCookies: applyResponseCookiesIdentity,
  });
}

function buildQueryResult(resultValue: { data: unknown; error: unknown }) {
  const result = Promise.resolve(resultValue);
  const query: Record<string, unknown> = {
    maybeSingle: vi.fn(() => result),
    single: vi.fn(() => result),
    then: result.then.bind(result),
  };
  for (const method of ["eq", "in", "limit", "order", "select"]) {
    query[method] = vi.fn(() => query);
  }
  return query;
}

function buildQuery(data: unknown) {
  return buildQueryResult({ data, error: null });
}

function buildTableFixture(reads: unknown[], inserted?: unknown, updated?: unknown) {
  const select = vi.fn(() => buildQuery(reads.shift()));
  const insert = vi.fn(() => buildQuery(inserted));
  const update = vi.fn(() => buildQuery(updated));
  return { table: { select, insert, update }, insert, update };
}

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildDrylandRow(overrides?: Partial<DrylandRow>): DrylandRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "user-1",
    source_kind: "manual",
    status: "draft",
    session_kind: "strength",
    title: "Weekly strength",
    description: "Simple dryland test session.",
    focus_text: "Brace the trunk first.",
    exercises: [
      {
        id: "exercise-1",
        source: "custom",
        bankExerciseId: null,
        title: "Single-leg squat",
        summary: "Controlled lower-body strength.",
        howTo: "Keep the knee tracking forward.",
        targetAreas: ["Quads", "Glutes"],
        accent: "amber",
        mediaType: "none",
        mediaUrl: null,
        mediaPosterUrl: null,
        mediaLabel: null,
        notes: "Slow down.",
        sets: [
          {
            id: "set-1",
            reps: 6,
            holdSeconds: null,
            loadKg: 12.5,
            restSeconds: 75,
            isCompleted: false,
            completedAt: null,
          },
        ],
      },
    ],
    started_at: null,
    completed_at: null,
    actual_duration_seconds: null,
    created_at: "2026-05-08T08:00:00.000Z",
    updated_at: "2026-05-08T08:00:00.000Z",
    ...overrides,
  };
}

function buildMicroPlanRow(overrides?: Partial<DrylandMicroPlanRow>): DrylandMicroPlanRow {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    user_id: "user-1",
    source_dryland_session_id: "11111111-1111-4111-8111-111111111111",
    status: "active",
    session_kind: "strength",
    source_session_title: "Weekly strength",
    title: "MS: Weekly strength",
    timezone: "UTC",
    week_starts_at: "2026-06-08T00:00:00.000Z",
    week_ends_at: "2026-06-15T00:00:00.000Z",
    blocks: [
      {
        id: "block-1-exercise-1",
        sourceExerciseId: "exercise-1",
        title: "Single-leg squat",
        summary: "Controlled lower-body strength.",
        targetLabel: "1 set · 6 @ 12.5kg P: 1 min 15 sec",
        coachCue: "Slow down.",
        status: "queued",
        completedAt: null,
        skippedAt: null,
      },
    ],
    created_at: "2026-05-08T08:00:00.000Z",
    updated_at: "2026-05-08T08:00:00.000Z",
    ...overrides,
  };
}

function buildHabitRow(overrides?: Partial<HabitDefinitionRow>): HabitDefinitionRow {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    user_id: "user-1",
    title: "Weekly strength",
    notes: null,
    habit_mode: "build",
    habit_type: "binary",
    category: "movement",
    target_operator: "at_least",
    target_value_numeric: null,
    target_unit: null,
    target_time: null,
    start_date: "2026-06-08",
    last_lapse_date: null,
    timer_enabled: false,
    timer_target_seconds: null,
    cadence_period: "daily",
    cadence_target_count: 1,
    cadence_day_policy: "fixed",
    schedule_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    is_perfect_day_item: false,
    status: "active",
    sort_order: 1,
    created_at: "2026-06-08T09:00:00.000Z",
    updated_at: "2026-06-08T09:00:00.000Z",
    ...overrides,
  };
}

function buildHabitLinkRow(
  overrides?: Partial<MicroSessionHabitLinkRow>
): MicroSessionHabitLinkRow {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    user_id: "user-1",
    dryland_micro_plan_id: "22222222-2222-4222-8222-222222222222",
    habit_id: "33333333-3333-4333-8333-333333333333",
    status: "active",
    starts_on: "2026-06-08",
    paused_at: null,
    resumed_at: "2026-06-08T09:00:00.000Z",
    ended_at: null,
    created_at: "2026-06-08T09:00:00.000Z",
    updated_at: "2026-06-08T09:00:00.000Z",
    ...overrides,
  };
}

function mockPatchTables(
  plan = buildMicroPlanRow(),
  updatedPlan?: DrylandMicroPlanRow,
  linkReads: Array<MicroSessionHabitLinkRow | null> = [buildHabitLinkRow()],
  habitRead: unknown = [],
  insertedHabit?: HabitDefinitionRow,
  insertedLink?: MicroSessionHabitLinkRow,
  habitReads?: unknown[]
) {
  const plans = buildTableFixture([plan], undefined, updatedPlan);
  const links = buildTableFixture(linkReads, insertedLink);
  const habits = buildTableFixture(habitReads ?? [habitRead], insertedHabit);
  const tables = {
    dryland_micro_plans: plans.table,
    micro_session_habit_links: links.table,
    habit_definitions: habits.table,
  };
  const from = vi.fn((table: string) => tables[table as keyof typeof tables] ?? {});
  mockAuthenticatedClient(from);
  return {
    planUpdate: plans.update,
    habitInsert: habits.insert,
    linkInsert: links.insert,
    linkUpdate: links.update,
  };
}

function buildPlanWithBlockStatus(
  status: "queued" | "completed",
  completedAt: string,
  overrides: Partial<DrylandMicroPlanRow>
) {
  const block = (buildMicroPlanRow().blocks as Array<Record<string, unknown>>)[0] ?? {};
  return buildMicroPlanRow({
    ...overrides,
    status: status === "completed" ? "completed" : "active",
    blocks: [{ ...block, status, completedAt: status === "completed" ? completedAt : null }],
  });
}

async function expectLinkedCurrentActionPatch(
  credit: "record" | "remove",
  selectedDate: string,
  timezone: string,
  expectedDate: string,
  planOverrides: Partial<DrylandMicroPlanRow> = {}
) {
  const currentStatus = credit === "record" ? "queued" : "completed";
  const blockStatus = credit === "record" ? "completed" : "queued";
  mockPatchTables(
    buildPlanWithBlockStatus(currentStatus, "2026-06-09T09:00:00.000Z", planOverrides),
    buildPlanWithBlockStatus(blockStatus, "2026-06-10T09:00:00.000Z", planOverrides),
    undefined,
    buildHabitRow()
  );
  const response = await patchMicroPlan({
    blockId: "block-1-exercise-1",
    blockStatus,
    selectedDate,
    timezone,
  });
  const creditMock =
    credit === "record" ? recordMicroSessionHabitCreditMock : removeMicroSessionHabitCreditMock;

  expect(response.status).toBe(200);
  expectHabitCredit(creditMock, expectedDate, credit === "record" ? timezone : undefined);
  expect(
    credit === "record" ? removeMicroSessionHabitCreditMock : recordMicroSessionHabitCreditMock
  ).not.toHaveBeenCalled();
}

function expectHabitCredit(
  creditMock: ReturnType<typeof vi.fn>,
  expectedDate: string,
  timezone?: string
) {
  expect(creditMock).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      selectedDate: expectedDate,
      todayDate: expectedDate,
      ...(timezone ? { timezone } : {}),
    })
  );
}

describe("dryland micro plan routes", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T09:00:00.000Z"));
    cookiesMock.mockReset();
    cookiesMock.mockResolvedValue({ get: vi.fn(() => undefined) });
    createRouteHandlerSupabaseClientMock.mockReset();
    removeMicroSessionHabitCreditMock.mockReset().mockResolvedValue({
      status: "removed",
      message: "Habit credit removed for this week.",
    });
    recordMicroSessionHabitCreditMock.mockReset().mockResolvedValue({
      status: "counted",
      message: "Habit completed for this week.",
    });
    trackAnalyticsEventMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("fails closed for unauthenticated micro plan create", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postDrylandMicroPlan(
      new Request("http://127.0.0.1:3000/api/my-library/dryland/micro-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceDrylandSessionId: "11111111-1111-4111-8111-111111111111",
        }),
      })
    );

    expect(response.status).toBe(401);
  });

  it.each([
    ["null JSON body", null, "json"],
    ["string JSON body", "invalid", "json"],
    ["array JSON body", [], "json"],
    ["invalid explicit timezone", { timezone: "Mars/Olympus_Mons" }, "timezone"],
    ["invalid selected date", { selectedDate: "2026-02-31" }, "selectedDate"],
    ["invalid Habit start date", { habitStartDate: "0000-01-01" }, "habitStartDate"],
  ] as const)("rejects %s before loading or writing plan data", async (_, body, kind) => {
    const [error, code] = {
      json: ["Invalid JSON body.", null],
      timezone: ["Invalid timezone.", "INVALID_TIMEZONE"],
      selectedDate: ["Invalid selected date.", "INVALID_DATE"],
      habitStartDate: ["Choose a valid start date.", "INVALID_DATE"],
    }[kind];
    const from = vi.fn();
    mockAuthenticatedClient(from);

    const response = await patchMicroPlan(body);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      ...(code ? { code } : {}),
      error,
    });
    expect(from).not.toHaveBeenCalled();
    if (kind === "json") expect(cookiesMock).not.toHaveBeenCalled();
  });

  it("returns a support-diagnosable sync response when the micro plan table is missing", async () => {
    const existingMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: {
        code: "42P01",
        message: 'relation "public.dryland_micro_plans" does not exist',
      },
    });
    const existingLimit = vi.fn(() => ({ maybeSingle: existingMaybeSingle }));
    const existingOrder = vi.fn(() => ({ limit: existingLimit }));
    const existingIn = vi.fn(() => ({ order: existingOrder }));
    const existingEq = vi.fn(() => ({ in: existingIn }));
    const microSelect = vi.fn(() => ({ eq: existingEq }));
    const from = vi.fn(() => ({ select: microSelect }));

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postDrylandMicroPlan(
      new Request("http://127.0.0.1:3000/api/my-library/dryland/micro-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceDrylandSessionId: "11111111-1111-4111-8111-111111111111",
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(503);
    expect(payload).toEqual({
      ok: false,
      error: "Micro Sessions are still syncing in this environment.",
    });
    expect(from).toHaveBeenCalledWith("dryland_micro_plans");
  });

  it("creates a micro plan from an owner-scoped dryland session snapshot", async () => {
    const existingMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const existingLimit = vi.fn(() => ({ maybeSingle: existingMaybeSingle }));
    const existingOrder = vi.fn(() => ({ limit: existingLimit }));
    const existingIn = vi.fn(() => ({ order: existingOrder }));
    const existingEq = vi.fn(() => ({ in: existingIn }));
    const microSelect = vi.fn(() => ({ eq: existingEq }));
    const insertSingle = vi.fn().mockResolvedValue({
      data: buildMicroPlanRow(),
      error: null,
    });
    const insertSelect = vi.fn(() => ({ single: insertSingle }));
    const insert = vi.fn(() => ({ select: insertSelect }));

    const sourceIn = vi.fn().mockResolvedValue({
      data: [buildDrylandRow()],
      error: null,
    });
    const sourceEqUser = vi.fn(() => ({ in: sourceIn }));
    const sourceSelect = vi.fn(() => ({ eq: sourceEqUser }));
    const from = vi.fn((table: string) =>
      table === "dryland_micro_plans" ? { select: microSelect, insert } : { select: sourceSelect }
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

    const response = await postDrylandMicroPlan(
      new Request("http://127.0.0.1:3000/api/my-library/dryland/micro-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceDrylandSessionIds: ["11111111-1111-4111-8111-111111111111"],
          timezone: "Europe/Oslo",
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean; plan: { id: string } };

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("dryland_sessions");
    expect(sourceEqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(sourceIn).toHaveBeenCalledWith("id", ["11111111-1111-4111-8111-111111111111"]);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        source_dryland_session_id: "11111111-1111-4111-8111-111111111111",
        source_session_title: "Weekly strength",
        title: "MS: Weekly strength",
        session_kind: "strength",
      })
    );
    expect(payload.ok).toBe(true);
    expect(payload.plan.id).toBe("22222222-2222-4222-8222-222222222222");
  });

  it("rejects invalid micro plan ids before auth work", async () => {
    const response = await patchDrylandMicroPlan(
      new Request("http://127.0.0.1:3000/api/my-library/dryland/micro-plans/not-a-plan-id", {
        method: "PATCH",
      }),
      {
        params: Promise.resolve({
          planId: "not-a-plan-id",
        }),
      }
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Invalid micro session plan id.");
    expect(createRouteHandlerSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("updates a micro block for the authenticated owner", async () => {
    const planMaybeSingle = vi.fn().mockResolvedValue({
      data: buildMicroPlanRow(),
      error: null,
    });
    const planEqId = vi.fn(() => ({ maybeSingle: planMaybeSingle }));
    const planEqUser = vi.fn(() => ({ eq: planEqId }));
    const select = vi.fn(() => ({ eq: planEqUser }));

    const updateMaybeSingle = vi.fn().mockResolvedValue({
      data: buildMicroPlanRow({
        status: "completed",
        blocks: [
          {
            ...((buildMicroPlanRow().blocks as Array<Record<string, unknown>>)[0] ?? {}),
            status: "completed",
            completedAt: "2026-05-08T09:00:00.000Z",
          },
        ],
      }),
      error: null,
    });
    const updateSelect = vi.fn(() => ({ maybeSingle: updateMaybeSingle }));
    const updateEqId = vi.fn(() => ({ select: updateSelect }));
    const updateEqUser = vi.fn(() => ({ eq: updateEqId }));
    const update = vi.fn(() => ({ eq: updateEqUser }));
    const from = vi.fn().mockReturnValue({ select, update });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchDrylandMicroPlan(
      new Request(
        "http://127.0.0.1:3000/api/my-library/dryland/micro-plans/22222222-2222-4222-8222-222222222222",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blockId: "block-1-exercise-1",
            blockStatus: "completed",
          }),
        }
      ),
      {
        params: Promise.resolve({
          planId: "22222222-2222-4222-8222-222222222222",
        }),
      }
    );
    const payload = (await response.json()) as {
      ok: boolean;
      plan: { status: string; progress: { progressPercent: number } };
    };

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("dryland_micro_plans");
    expect(planEqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(updateEqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "completed",
        blocks: [expect.objectContaining({ status: "completed" })],
      })
    );
    expect(payload.ok).toBe(true);
    expect(payload.plan.status).toBe("completed");
    expect(payload.plan.progress.progressPercent).toBe(100);
  });

  it("uses server local today for linked Habit credit when the client date is behind", async () => {
    await expectLinkedCurrentActionPatch("record", "2026-06-09", "UTC", "2026-06-10");
  });

  it("keeps a captured UTC+14 Sunday action inside the timezone-based Micro week", async () => {
    vi.setSystemTime(new Date("2026-05-10T06:00:00.000Z"));
    await expectLinkedCurrentActionPatch(
      "record",
      "2026-05-09",
      "Pacific/Kiritimati",
      "2026-05-10",
      {
        timezone: "Pacific/Kiritimati",
        week_starts_at: "2026-05-03T10:00:00.000Z",
        week_ends_at: "2026-05-10T10:00:00.000Z",
      }
    );
  });

  it("uses server local today for linked Habit credit removal when the client date is ahead", async () => {
    await expectLinkedCurrentActionPatch("remove", "2026-06-11", "UTC", "2026-06-10");
  });

  it("keeps Micro completion successful while unsupported linked Habit credit is blocked", async () => {
    const unsupportedHabit = buildHabitRow({
      habit_type: "future_type" as HabitDefinitionRow["habit_type"],
    });
    recordMicroSessionHabitCreditMock.mockResolvedValueOnce({
      status: "blocked",
      code: "UNSUPPORTED_HABIT_DEFINITION",
      message: "Micro Session saved, but the linked Habit needs review and did not count.",
    });
    mockPatchTables(
      buildPlanWithBlockStatus("queued", "2026-06-09T09:00:00.000Z", {}),
      buildPlanWithBlockStatus("completed", "2026-06-10T09:00:00.000Z", {}),
      undefined,
      unsupportedHabit
    );

    const response = await patchMicroPlan({
      blockId: "block-1-exercise-1",
      blockStatus: "completed",
      selectedDate: "2026-06-10",
      timezone: "UTC",
    });
    const payload = (await response.json()) as {
      ok: boolean;
      plan: { status: string };
      habitCredit: { status: string; code?: string };
    };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      plan: { status: "completed" },
      habitCredit: {
        status: "blocked",
        code: "UNSUPPORTED_HABIT_DEFINITION",
      },
    });
    expect(recordMicroSessionHabitCreditMock).toHaveBeenCalledOnce();
    expect(trackAnalyticsEventMock).not.toHaveBeenCalled();
    expect(JSON.stringify(payload)).not.toContain("future_type");
  });

  it.each([
    { name: "normal credit link load", completePausedHabitLink: false },
    { name: "required paused-link load", completePausedHabitLink: true },
  ])("keeps the saved Micro completion successful when $name fails", async (testCase) => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const plans = buildTableFixture(
      [buildPlanWithBlockStatus("queued", "2026-06-09T09:00:00.000Z", {})],
      undefined,
      buildPlanWithBlockStatus("completed", "2026-06-10T09:00:00.000Z", {})
    );
    const linkSelect = vi.fn(() =>
      buildQueryResult({ data: null, error: { message: "link load failed" } })
    );
    const from = vi.fn((table: string) => {
      if (table === "dryland_micro_plans") return plans.table;
      if (table === "micro_session_habit_links") return { select: linkSelect };
      return {};
    });
    mockAuthenticatedClient(from);

    const response = await patchMicroPlan({
      blockId: "block-1-exercise-1",
      blockStatus: "completed",
      selectedDate: "2026-06-10",
      timezone: "UTC",
      ...(testCase.completePausedHabitLink ? { completePausedHabitLink: true } : {}),
    });
    const payload = (await response.json()) as {
      ok: boolean;
      plan: { status: string };
      habitCredit: { status: string };
    };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      plan: { status: "completed" },
      habitCredit: { status: "blocked" },
    });
    expect(plans.update).toHaveBeenCalledOnce();
    expect(recordMicroSessionHabitCreditMock).not.toHaveBeenCalled();
    expect(trackAnalyticsEventMock).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
  });

  it("keeps the saved Micro completion successful when paused-link resume fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const plans = buildTableFixture(
      [buildPlanWithBlockStatus("queued", "2026-06-09T09:00:00.000Z", {})],
      undefined,
      buildPlanWithBlockStatus("completed", "2026-06-10T09:00:00.000Z", {})
    );
    const pausedLink = buildHabitLinkRow({
      status: "paused",
      paused_at: "2026-06-10T08:00:00.000Z",
    });
    const linkSelect = vi.fn(() => buildQuery(pausedLink));
    const linkUpdate = vi.fn(() =>
      buildQueryResult({ data: null, error: { message: "resume failed" } })
    );
    const habitSelect = vi.fn(() => buildQuery(buildHabitRow()));
    const from = vi.fn((table: string) => {
      if (table === "dryland_micro_plans") return plans.table;
      if (table === "micro_session_habit_links") {
        return { select: linkSelect, update: linkUpdate };
      }
      if (table === "habit_definitions") return { select: habitSelect };
      return {};
    });
    mockAuthenticatedClient(from);

    const response = await patchMicroPlan({
      blockId: "block-1-exercise-1",
      blockStatus: "completed",
      selectedDate: "2026-06-10",
      timezone: "UTC",
      completePausedHabitLink: true,
    });
    const payload = (await response.json()) as {
      ok: boolean;
      plan: { status: string };
      habitCredit: { status: string };
    };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      plan: { status: "completed" },
      habitCredit: { status: "blocked" },
    });
    expect(plans.update).toHaveBeenCalledOnce();
    expect(linkUpdate).toHaveBeenCalledOnce();
    expect(recordMicroSessionHabitCreditMock).not.toHaveBeenCalled();
    expect(trackAnalyticsEventMock).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
  });

  it("keeps a successfully resumed link active when its post-save refresh fails", async () => {
    const plans = buildTableFixture(
      [buildPlanWithBlockStatus("queued", "2026-06-09T09:00:00.000Z", {})],
      undefined,
      buildPlanWithBlockStatus("completed", "2026-06-10T09:00:00.000Z", {})
    );
    const pausedLink = buildHabitLinkRow({
      status: "paused",
      paused_at: "2026-06-10T08:00:00.000Z",
    });
    const linkSelect = vi
      .fn()
      .mockImplementationOnce(() => buildQuery(pausedLink))
      .mockImplementationOnce(() =>
        buildQueryResult({
          data: null,
          error: { code: "42P01", message: "link refresh unavailable" },
        })
      );
    const linkUpdate = vi.fn(() => buildQuery(null));
    const habitSelect = vi.fn(() => buildQuery(buildHabitRow()));
    const from = vi.fn((table: string) => {
      if (table === "dryland_micro_plans") return plans.table;
      if (table === "micro_session_habit_links") {
        return { select: linkSelect, update: linkUpdate };
      }
      if (table === "habit_definitions") return { select: habitSelect };
      return {};
    });
    mockAuthenticatedClient(from);

    const response = await patchMicroPlan({
      blockId: "block-1-exercise-1",
      blockStatus: "completed",
      selectedDate: "2026-06-10",
      timezone: "UTC",
      completePausedHabitLink: true,
    });
    const payload = (await response.json()) as {
      ok: boolean;
      plan: {
        status: string;
        habitLink: {
          status: string;
          resumedAt: string | null;
          endedAt: string | null;
          canCount: boolean;
        } | null;
      };
      habitCredit: { status: string };
    };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      plan: {
        status: "completed",
        habitLink: {
          status: "active",
          resumedAt: "2026-06-10T09:00:00.000Z",
          endedAt: null,
          canCount: true,
        },
      },
      habitCredit: { status: "blocked" },
    });
    expect(linkUpdate).toHaveBeenCalledWith({
      status: "active",
      resumed_at: "2026-06-10T09:00:00.000Z",
      ended_at: null,
    });
    expect(recordMicroSessionHabitCreditMock).not.toHaveBeenCalled();
    expect(trackAnalyticsEventMock).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: "current-week pause",
      plan: buildMicroPlanRow({ week_ends_at: "2099-06-15T00:00:00.000Z" }),
      link: buildHabitLinkRow({ status: "active" }),
      habitLinkStatus: "paused",
    },
    {
      name: "stale-week renewal",
      plan: buildMicroPlanRow({ week_ends_at: "2026-05-11T00:00:00.000Z" }),
      link: buildHabitLinkRow({ status: "paused" }),
      habitLinkStatus: "active",
    },
  ] as const)("blocks $name for an unsupported linked Habit before writes", async (testCase) => {
    const rawFutureValue = "future_mode";
    const { planUpdate, linkUpdate } = mockPatchTables(
      testCase.plan,
      undefined,
      [testCase.link],
      buildHabitRow({ habit_mode: rawFutureValue as HabitDefinitionRow["habit_mode"] })
    );

    const response = await patchMicroPlan({ habitLinkStatus: testCase.habitLinkStatus });
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload).toMatchObject({
      ok: false,
      code: "UNSUPPORTED_HABIT_DEFINITION",
    });
    expect(planUpdate).not.toHaveBeenCalled();
    expect(linkUpdate).not.toHaveBeenCalled();
    expect(recordMicroSessionHabitCreditMock).not.toHaveBeenCalled();
    expect(removeMicroSessionHabitCreditMock).not.toHaveBeenCalled();
    expect(trackAnalyticsEventMock).not.toHaveBeenCalled();
    expect(JSON.stringify(payload)).not.toContain(rawFutureValue);
  });

  it("does not reactivate a paused unsupported Habit when completing the Micro Session", async () => {
    const pausedLink = buildHabitLinkRow({
      status: "paused",
      paused_at: "2026-06-10T08:00:00.000Z",
    });
    const unsupportedHabit = buildHabitRow({
      habit_mode: "future_mode" as HabitDefinitionRow["habit_mode"],
    });
    recordMicroSessionHabitCreditMock.mockResolvedValueOnce({
      status: "blocked",
      code: "UNSUPPORTED_HABIT_DEFINITION",
      message: "Micro Session saved, but the linked Habit needs review and did not count.",
    });
    const { linkUpdate } = mockPatchTables(
      buildPlanWithBlockStatus("queued", "2026-06-09T09:00:00.000Z", {}),
      buildPlanWithBlockStatus("completed", "2026-06-10T09:00:00.000Z", {}),
      [pausedLink, pausedLink],
      unsupportedHabit,
      undefined,
      undefined,
      [unsupportedHabit, unsupportedHabit]
    );

    const response = await patchMicroPlan({
      blockId: "block-1-exercise-1",
      blockStatus: "completed",
      selectedDate: "2026-06-10",
      timezone: "UTC",
      completePausedHabitLink: true,
    });
    const payload = (await response.json()) as {
      ok: boolean;
      habitCredit: { status: string; code?: string };
    };

    expect(response.status).toBe(200);
    expect(payload.habitCredit).toMatchObject({
      status: "blocked",
      code: "UNSUPPORTED_HABIT_DEFINITION",
    });
    expect(linkUpdate).not.toHaveBeenCalled();
    expect(trackAnalyticsEventMock).not.toHaveBeenCalled();
  });

  it("keeps Micro undo successful while retracting unsupported linked Habit credit", async () => {
    const unsupportedHabit = buildHabitRow({
      status: "future_status" as HabitDefinitionRow["status"],
    });
    removeMicroSessionHabitCreditMock.mockResolvedValueOnce({
      status: "removed",
      code: "UNSUPPORTED_HABIT_DEFINITION",
      message: "Habit credit removed for this week. The linked Habit still needs review.",
    });
    mockPatchTables(
      buildPlanWithBlockStatus("completed", "2026-06-09T09:00:00.000Z", {}),
      buildPlanWithBlockStatus("queued", "2026-06-10T09:00:00.000Z", {}),
      undefined,
      unsupportedHabit
    );

    const response = await patchMicroPlan({
      blockId: "block-1-exercise-1",
      blockStatus: "queued",
      selectedDate: "2026-06-10",
      timezone: "UTC",
    });
    const payload = (await response.json()) as {
      ok: boolean;
      plan: { status: string };
      habitCredit: { status: string; code?: string };
    };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      plan: { status: "active" },
      habitCredit: {
        status: "removed",
        code: "UNSUPPORTED_HABIT_DEFINITION",
      },
    });
    expect(removeMicroSessionHabitCreditMock).toHaveBeenCalledOnce();
    expect(trackAnalyticsEventMock).not.toHaveBeenCalled();
    expect(JSON.stringify(payload)).not.toContain("future_status");
  });

  it("rejects stale micro unit updates instead of counting an earlier week", async () => {
    const planMaybeSingle = vi.fn().mockResolvedValue({
      data: buildMicroPlanRow({
        week_starts_at: "2026-05-04T00:00:00.000Z",
        week_ends_at: "2026-05-11T00:00:00.000Z",
      }),
      error: null,
    });
    const planEqId = vi.fn(() => ({ maybeSingle: planMaybeSingle }));
    const planEqUser = vi.fn(() => ({ eq: planEqId }));
    const select = vi.fn(() => ({ eq: planEqUser }));
    const update = vi.fn();
    const from = vi.fn().mockReturnValue({ select, update });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchDrylandMicroPlan(
      new Request(
        "http://127.0.0.1:3000/api/my-library/dryland/micro-plans/22222222-2222-4222-8222-222222222222",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blockId: "block-1-exercise-1",
            blockStatus: "completed",
            selectedDate: "2026-06-08",
          }),
        }
      ),
      {
        params: Promise.resolve({
          planId: "22222222-2222-4222-8222-222222222222",
        }),
      }
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      ok: false,
      error: "Start this week's Micro Session before updating old units.",
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("clears an active micro plan for the authenticated owner without deleting blocks", async () => {
    const existingBlocks = buildMicroPlanRow().blocks;
    const planMaybeSingle = vi.fn().mockResolvedValue({
      data: buildMicroPlanRow({ blocks: existingBlocks }),
      error: null,
    });
    const planEqId = vi.fn(() => ({ maybeSingle: planMaybeSingle }));
    const planEqUser = vi.fn(() => ({ eq: planEqId }));
    const select = vi.fn(() => ({ eq: planEqUser }));

    const updateMaybeSingle = vi.fn().mockResolvedValue({
      data: buildMicroPlanRow({
        status: "completed",
        blocks: existingBlocks,
      }),
      error: null,
    });
    const updateSelect = vi.fn(() => ({ maybeSingle: updateMaybeSingle }));
    const updateEqId = vi.fn(() => ({ select: updateSelect }));
    const updateEqUser = vi.fn(() => ({ eq: updateEqId }));
    const update = vi.fn(() => ({ eq: updateEqUser }));
    const from = vi.fn().mockReturnValue({ select, update });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchDrylandMicroPlan(
      new Request(
        "http://127.0.0.1:3000/api/my-library/dryland/micro-plans/22222222-2222-4222-8222-222222222222",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clearPlan: true,
          }),
        }
      ),
      {
        params: Promise.resolve({
          planId: "22222222-2222-4222-8222-222222222222",
        }),
      }
    );
    const payload = (await response.json()) as {
      ok: boolean;
      plan: { status: string; blocks: Array<unknown> };
    };

    expect(response.status).toBe(200);
    expect(updateEqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "completed",
        blocks: [expect.objectContaining({ id: "block-1-exercise-1" })],
      })
    );
    expect(payload.ok).toBe(true);
    expect(payload.plan.status).toBe("completed");
    expect(payload.plan.blocks).toHaveLength(1);
  });

  it("releases an upcoming micro unit for the authenticated owner", async () => {
    const planMaybeSingle = vi.fn().mockResolvedValue({
      data: buildMicroPlanRow({
        blocks: [
          {
            ...((buildMicroPlanRow().blocks as Array<Record<string, unknown>>)[0] ?? {}),
            releaseMode: "manual",
            releasedAt: null,
          },
        ],
      }),
      error: null,
    });
    const planEqId = vi.fn(() => ({ maybeSingle: planMaybeSingle }));
    const planEqUser = vi.fn(() => ({ eq: planEqId }));
    const select = vi.fn(() => ({ eq: planEqUser }));

    const updateMaybeSingle = vi.fn().mockResolvedValue({
      data: buildMicroPlanRow({
        blocks: [
          {
            ...((buildMicroPlanRow().blocks as Array<Record<string, unknown>>)[0] ?? {}),
            releaseMode: "manual",
            releasedAt: "2026-05-08T09:00:00.000Z",
          },
        ],
      }),
      error: null,
    });
    const updateSelect = vi.fn(() => ({ maybeSingle: updateMaybeSingle }));
    const updateEqId = vi.fn(() => ({ select: updateSelect }));
    const updateEqUser = vi.fn(() => ({ eq: updateEqId }));
    const update = vi.fn(() => ({ eq: updateEqUser }));
    const from = vi.fn().mockReturnValue({ select, update });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchDrylandMicroPlan(
      new Request(
        "http://127.0.0.1:3000/api/my-library/dryland/micro-plans/22222222-2222-4222-8222-222222222222",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blockId: "block-1-exercise-1",
            releaseNow: true,
          }),
        }
      ),
      {
        params: Promise.resolve({
          planId: "22222222-2222-4222-8222-222222222222",
        }),
      }
    );

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        blocks: [expect.objectContaining({ releasedAt: expect.any(String) })],
      })
    );
  });

  it("creates an explicit recurring Habit link for the authenticated owner", async () => {
    const planMaybeSingle = vi.fn().mockResolvedValue({
      data: buildMicroPlanRow(),
      error: null,
    });
    const planEqId = vi.fn(() => ({ maybeSingle: planMaybeSingle }));
    const planEqUser = vi.fn(() => ({ eq: planEqId }));
    const planSelect = vi.fn(() => ({ eq: planEqUser }));

    const linkMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const linkLimit = vi.fn(() => ({ maybeSingle: linkMaybeSingle }));
    const linkOrder = vi.fn(() => ({ limit: linkLimit }));
    const linkIn = vi.fn(() => ({ order: linkOrder }));
    const linkEqPlan = vi.fn(() => ({ in: linkIn }));
    const linkEqUser = vi.fn(() => ({ eq: linkEqPlan }));
    const linkSelect = vi.fn(() => ({ eq: linkEqUser }));

    const activeHabitEqStatus = vi.fn().mockResolvedValue({ data: [], error: null });
    const activeHabitEqUser = vi.fn(() => ({ eq: activeHabitEqStatus }));
    const habitSelect = vi.fn(() => ({ eq: activeHabitEqUser }));
    const habitRow = buildHabitRow({
      title: "Mobility reset",
      start_date: "2026-06-08",
      cadence_period: "weekly",
      cadence_target_count: 3,
      cadence_day_policy: "any",
    });
    const habitInsertSingle = vi.fn().mockResolvedValue({ data: habitRow, error: null });
    const habitInsertSelect = vi.fn(() => ({ single: habitInsertSingle }));
    const habitInsert = vi.fn(() => ({ select: habitInsertSelect }));

    const linkRow = buildHabitLinkRow({ starts_on: "2026-06-08" });
    const linkInsertSingle = vi.fn().mockResolvedValue({ data: linkRow, error: null });
    const linkInsertSelect = vi.fn(() => ({ single: linkInsertSingle }));
    const linkInsert = vi.fn(() => ({ select: linkInsertSelect }));

    const from = vi.fn((table: string) => {
      if (table === "dryland_micro_plans") return { select: planSelect };
      if (table === "habit_definitions") return { select: habitSelect, insert: habitInsert };
      if (table === "micro_session_habit_links") {
        return { select: linkSelect, insert: linkInsert };
      }
      return {};
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchDrylandMicroPlan(
      new Request(
        "http://127.0.0.1:3000/api/my-library/dryland/micro-plans/22222222-2222-4222-8222-222222222222",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            createRecurringHabit: true,
            habitTitle: "Mobility reset",
            habitStartDate: "2026-06-08",
            selectedDate: "2026-06-08",
            timezone: "Europe/Oslo",
          }),
        }
      ),
      {
        params: Promise.resolve({
          planId: "22222222-2222-4222-8222-222222222222",
        }),
      }
    );
    const payload = (await response.json()) as {
      ok: boolean;
      plan: { habitLink: { status: string; habitTitle: string | null } | null };
    };

    expect(response.status).toBe(200);
    expect(habitInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        title: "Mobility reset",
        habit_mode: "build",
        habit_type: "binary",
        category: "movement",
        start_date: "2026-06-08",
        cadence_period: "weekly",
        cadence_target_count: 1,
        cadence_day_policy: "any",
        is_perfect_day_item: false,
      })
    );
    expect(linkInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        dryland_micro_plan_id: "22222222-2222-4222-8222-222222222222",
        habit_id: "33333333-3333-4333-8333-333333333333",
        status: "active",
        starts_on: "2026-06-08",
      })
    );
    expect(payload.ok).toBe(true);
    expect(payload.plan.habitLink).toMatchObject({
      status: "active",
      habitTitle: "Mobility reset",
    });
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "micro_session_habit_link_created",
        payload: expect.objectContaining({
          cadencePeriod: "weekly",
          cadenceTargetCount: 1,
          countPolicy: "weekly_program_complete",
        }),
      })
    );
  });

  it("uses local today for an omitted linked Habit start and current-complete credit", async () => {
    vi.setSystemTime(new Date("2026-06-10T22:30:00.000Z"));
    const { habitInsert, linkInsert } = mockPatchTables(
      buildPlanWithBlockStatus("completed", "2026-06-10T21:30:00.000Z", {}),
      undefined,
      [null],
      [],
      buildHabitRow({ start_date: "2026-06-11" }),
      buildHabitLinkRow({ starts_on: "2026-06-11" })
    );

    const response = await patchMicroPlan({
      createRecurringHabit: true,
      habitTitle: "Local-day mobility",
      timezone: "Europe/Oslo",
    });

    expect(response.status).toBe(200);
    expect(habitInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Local-day mobility",
        start_date: "2026-06-11",
      })
    );
    expect(linkInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        starts_on: "2026-06-11",
      })
    );
    expectHabitCredit(recordMicroSessionHabitCreditMock, "2026-06-11", "Europe/Oslo");
  });

  it("counts unsupported active definitions toward the recurring Habit persisted limit", async () => {
    const rawFutureValue = "future_type";
    const unsupportedRows = Array.from({ length: 12 }, (_, index) =>
      buildHabitRow({
        id: `33333333-3333-4333-8333-${String(index + 1).padStart(12, "0")}`,
        habit_type: rawFutureValue as HabitDefinitionRow["habit_type"],
        sort_order: index + 1,
      })
    );
    const insertedHabit = buildHabitRow({
      id: "77777777-7777-4777-8777-777777777777",
      title: "Supported weekly habit",
      cadence_period: "weekly",
      cadence_day_policy: "any",
    });
    const insertedLink = buildHabitLinkRow({ habit_id: insertedHabit.id });
    const { habitInsert } = mockPatchTables(
      undefined,
      undefined,
      [null],
      unsupportedRows,
      insertedHabit,
      insertedLink
    );

    const response = await patchMicroPlan({
      createRecurringHabit: true,
      habitTitle: "Supported weekly habit",
      habitStartDate: "2026-06-08",
      selectedDate: "2026-06-10",
      timezone: "UTC",
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(habitInsert).not.toHaveBeenCalled();
    expect(JSON.stringify(payload)).not.toContain(rawFutureValue);
    expect(JSON.stringify(trackAnalyticsEventMock.mock.calls)).not.toContain(rawFutureValue);
  });

  it("rejects a matching future linked Habit start and selected date before insert", async () => {
    const { habitInsert } = mockPatchTables(undefined, undefined, [null]);

    const response = await patchMicroPlan({
      createRecurringHabit: true,
      habitTitle: "Future mobility",
      habitStartDate: "2026-06-11",
      selectedDate: "2026-06-11",
      timezone: "Europe/Oslo",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "Choose today or an earlier start date.",
    });
    expect(habitInsert).not.toHaveBeenCalled();
  });

  it("pauses a linked Habit without disabling the Micro Session plan", async () => {
    const planMaybeSingle = vi.fn().mockResolvedValue({
      data: buildMicroPlanRow({ status: "active" }),
      error: null,
    });
    const planEqId = vi.fn(() => ({ maybeSingle: planMaybeSingle }));
    const planEqUser = vi.fn(() => ({ eq: planEqId }));
    const planSelect = vi.fn(() => ({ eq: planEqUser }));

    const activeLink = buildHabitLinkRow({ status: "active" });
    const pausedLink = buildHabitLinkRow({
      status: "paused",
      paused_at: "2026-05-10T10:00:00.000Z",
    });
    const linkMaybeSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: activeLink, error: null })
      .mockResolvedValueOnce({ data: pausedLink, error: null });
    const linkLimit = vi.fn(() => ({ maybeSingle: linkMaybeSingle }));
    const linkOrder = vi.fn(() => ({ limit: linkLimit }));
    const linkIn = vi.fn(() => ({ order: linkOrder }));
    const linkEqPlan = vi.fn(() => ({ in: linkIn }));
    const linkEqUser = vi.fn(() => ({ eq: linkEqPlan }));
    const linkSelect = vi.fn(() => ({ eq: linkEqUser }));

    const habitMaybeSingle = vi.fn().mockResolvedValue({ data: buildHabitRow(), error: null });
    const habitEqId = vi.fn(() => ({ maybeSingle: habitMaybeSingle }));
    const habitEqUser = vi.fn(() => ({ eq: habitEqId }));
    const habitSelect = vi.fn(() => ({ eq: habitEqUser }));

    const linkUpdateMaybeSingle = vi.fn().mockResolvedValue({ data: pausedLink, error: null });
    const linkUpdateSelect = vi.fn(() => ({ maybeSingle: linkUpdateMaybeSingle }));
    const linkUpdateEqId = vi.fn(() => ({ select: linkUpdateSelect }));
    const linkUpdateEqUser = vi.fn(() => ({ eq: linkUpdateEqId }));
    const linkUpdate = vi.fn(() => ({ eq: linkUpdateEqUser }));

    const from = vi.fn((table: string) => {
      if (table === "dryland_micro_plans") return { select: planSelect };
      if (table === "habit_definitions") return { select: habitSelect };
      if (table === "micro_session_habit_links") {
        return { select: linkSelect, update: linkUpdate };
      }
      return {};
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchDrylandMicroPlan(
      new Request(
        "http://127.0.0.1:3000/api/my-library/dryland/micro-plans/22222222-2222-4222-8222-222222222222",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habitLinkStatus: "paused" }),
        }
      ),
      {
        params: Promise.resolve({
          planId: "22222222-2222-4222-8222-222222222222",
        }),
      }
    );
    const payload = (await response.json()) as {
      ok: boolean;
      plan: { status: string; habitLink: { status: string } | null };
    };

    expect(response.status).toBe(200);
    expect(linkUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "paused",
        paused_at: expect.any(String),
        ended_at: null,
      })
    );
    expect(payload.plan.status).toBe("active");
    expect(payload.plan.habitLink).toMatchObject({ status: "paused" });
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "micro_session_habit_link_status_updated",
        payload: expect.objectContaining({ status: "paused" }),
      })
    );
  });

  it("resumes a current-week linked Habit without backfilling missed weeks", async () => {
    const planMaybeSingle = vi.fn().mockResolvedValue({
      data: buildMicroPlanRow({
        status: "active",
        week_ends_at: "2099-05-11T00:00:00.000Z",
      }),
      error: null,
    });
    const planEqId = vi.fn(() => ({ maybeSingle: planMaybeSingle }));
    const planEqUser = vi.fn(() => ({ eq: planEqId }));
    const planSelect = vi.fn(() => ({ eq: planEqUser }));

    const pausedLink = buildHabitLinkRow({
      status: "paused",
      paused_at: "2026-05-10T10:00:00.000Z",
    });
    const activeLink = buildHabitLinkRow({
      status: "active",
      resumed_at: "2026-05-10T11:00:00.000Z",
    });
    const linkMaybeSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: pausedLink, error: null })
      .mockResolvedValueOnce({ data: activeLink, error: null });
    const linkLimit = vi.fn(() => ({ maybeSingle: linkMaybeSingle }));
    const linkOrder = vi.fn(() => ({ limit: linkLimit }));
    const linkIn = vi.fn(() => ({ order: linkOrder }));
    const linkEqPlan = vi.fn(() => ({ in: linkIn }));
    const linkEqUser = vi.fn(() => ({ eq: linkEqPlan }));
    const linkSelect = vi.fn(() => ({ eq: linkEqUser }));

    const habitMaybeSingle = vi.fn().mockResolvedValue({ data: buildHabitRow(), error: null });
    const habitEqId = vi.fn(() => ({ maybeSingle: habitMaybeSingle }));
    const habitEqUser = vi.fn(() => ({ eq: habitEqId }));
    const habitSelect = vi.fn(() => ({ eq: habitEqUser }));

    const linkUpdateMaybeSingle = vi.fn().mockResolvedValue({ data: activeLink, error: null });
    const linkUpdateSelect = vi.fn(() => ({ maybeSingle: linkUpdateMaybeSingle }));
    const linkUpdateEqId = vi.fn(() => ({ select: linkUpdateSelect }));
    const linkUpdateEqUser = vi.fn(() => ({ eq: linkUpdateEqId }));
    const linkUpdate = vi.fn(() => ({ eq: linkUpdateEqUser }));
    const planUpdate = vi.fn();

    const from = vi.fn((table: string) => {
      if (table === "dryland_micro_plans") return { select: planSelect, update: planUpdate };
      if (table === "habit_definitions") return { select: habitSelect };
      if (table === "micro_session_habit_links") {
        return { select: linkSelect, update: linkUpdate };
      }
      return {};
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchDrylandMicroPlan(
      new Request(
        "http://127.0.0.1:3000/api/my-library/dryland/micro-plans/22222222-2222-4222-8222-222222222222",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habitLinkStatus: "active" }),
        }
      ),
      {
        params: Promise.resolve({
          planId: "22222222-2222-4222-8222-222222222222",
        }),
      }
    );
    const payload = (await response.json()) as {
      ok: boolean;
      plan: { habitLink: { status: string } | null };
    };

    expect(response.status).toBe(200);
    expect(planUpdate).not.toHaveBeenCalled();
    expect(linkUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "active",
        resumed_at: expect.any(String),
        ended_at: null,
      })
    );
    expect(payload.plan.habitLink).toMatchObject({ status: "active" });
    expect(trackAnalyticsEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "micro_session_habit_link_status_updated",
        payload: expect.objectContaining({ status: "active" }),
      })
    );
  });

  it("returns a support-diagnosable sync response when updating before the table is applied", async () => {
    const planMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: {
        code: "42P01",
        message: 'relation "public.dryland_micro_plans" does not exist',
      },
    });
    const planEqId = vi.fn(() => ({ maybeSingle: planMaybeSingle }));
    const planEqUser = vi.fn(() => ({ eq: planEqId }));
    const select = vi.fn(() => ({ eq: planEqUser }));
    const from = vi.fn().mockReturnValue({ select });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchDrylandMicroPlan(
      new Request(
        "http://127.0.0.1:3000/api/my-library/dryland/micro-plans/22222222-2222-4222-8222-222222222222",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blockId: "block-1-exercise-1",
            blockStatus: "completed",
          }),
        }
      ),
      {
        params: Promise.resolve({
          planId: "22222222-2222-4222-8222-222222222222",
        }),
      }
    );
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(503);
    expect(payload).toEqual({
      ok: false,
      error: "Micro Sessions are still syncing in this environment.",
    });
    expect(from).toHaveBeenCalledWith("dryland_micro_plans");
  });
});
