import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock, trackAnalyticsEventMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
  trackAnalyticsEventMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/analytics/events", () => ({
  trackAnalyticsEvent: trackAnalyticsEventMock,
}));

import { PATCH as patchDrylandMicroPlan } from "@/app/api/my-library/dryland/micro-plans/[planId]/route";
import { POST as postDrylandMicroPlan } from "@/app/api/my-library/dryland/micro-plans/route";
import type { Database } from "@/types/database";

type DrylandRow = Database["public"]["Tables"]["dryland_sessions"]["Row"];
type DrylandMicroPlanRow = Database["public"]["Tables"]["dryland_micro_plans"]["Row"];
type HabitDefinitionRow = Database["public"]["Tables"]["habit_definitions"]["Row"];
type MicroSessionHabitLinkRow = Database["public"]["Tables"]["micro_session_habit_links"]["Row"];

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

describe("dryland micro plan routes", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
    trackAnalyticsEventMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
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
