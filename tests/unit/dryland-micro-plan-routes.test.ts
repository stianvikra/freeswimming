import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

import { PATCH as patchDrylandMicroPlan } from "@/app/api/my-library/dryland/micro-plans/[planId]/route";
import { POST as postDrylandMicroPlan } from "@/app/api/my-library/dryland/micro-plans/route";
import type { Database } from "@/types/database";

type DrylandRow = Database["public"]["Tables"]["dryland_sessions"]["Row"];
type DrylandMicroPlanRow = Database["public"]["Tables"]["dryland_micro_plans"]["Row"];

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
    title: "Micro plan: Weekly strength",
    timezone: "UTC",
    week_starts_at: "2026-05-04T00:00:00.000Z",
    week_ends_at: "2026-05-11T00:00:00.000Z",
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

describe("dryland micro plan routes", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
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

    const sourceMaybeSingle = vi.fn().mockResolvedValue({
      data: buildDrylandRow(),
      error: null,
    });
    const sourceEqId = vi.fn(() => ({ maybeSingle: sourceMaybeSingle }));
    const sourceEqUser = vi.fn(() => ({ eq: sourceEqId }));
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
          sourceDrylandSessionId: "11111111-1111-4111-8111-111111111111",
          timezone: "Europe/Oslo",
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean; plan: { id: string } };

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("dryland_sessions");
    expect(sourceEqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(sourceEqId).toHaveBeenCalledWith("id", "11111111-1111-4111-8111-111111111111");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        source_dryland_session_id: "11111111-1111-4111-8111-111111111111",
        source_session_title: "Weekly strength",
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
});
