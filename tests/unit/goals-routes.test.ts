import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock, loadGoalProgressContextMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
  loadGoalProgressContextMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/goals/server", () => ({
  loadGoalProgressContext: loadGoalProgressContextMock,
}));

import { PATCH as patchGoal } from "@/app/api/goals/[goalId]/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildGoalRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "goal-1",
    user_id: "user-1",
    title: "400m under 10:00",
    goal_type: "distance_time",
    source: "custom",
    target_value: 600,
    target_unit: "seconds_at_distance",
    target_date: null,
    target_distance_m: 400,
    target_time_seconds: 600,
    target_count: null,
    target_ref: null,
    progress_value: 585,
    status: "achieved",
    achieved_at: "2026-03-20T10:00:00.000Z",
    celebrated_at: "2026-03-20T10:05:00.000Z",
    created_at: "2026-03-20T09:00:00.000Z",
    updated_at: "2026-03-20T10:05:00.000Z",
    ...overrides,
  };
}

describe("goals routes", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
    loadGoalProgressContextMock.mockResolvedValue({
      completedDrillIds: new Set(),
      completedModuleLessonCounts: new Map(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated goal patch", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchGoal(
      new Request("http://127.0.0.1:3000/api/goals/goal-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reset_result" }),
      }),
      { params: Promise.resolve({ goalId: "goal-1" }) }
    );

    expect(response.status).toBe(401);
  });

  it("clears logged-result progress for a signed-in owner", async () => {
    const goalRow = buildGoalRow();
    const update = vi.fn((patch) => {
      expect(patch).toEqual({
        progress_value: 0,
        status: "active",
        achieved_at: null,
        celebrated_at: null,
      });
      return {
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: buildGoalRow({
                  progress_value: 0,
                  status: "active",
                  achieved_at: null,
                  celebrated_at: null,
                }),
                error: null,
              }),
            })),
          })),
        })),
      };
    });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: goalRow,
                  error: null,
                }),
              })),
            })),
          })),
          update,
        })),
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchGoal(
      new Request("http://127.0.0.1:3000/api/goals/goal-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reset_result" }),
      }),
      { params: Promise.resolve({ goalId: "goal-1" }) }
    );

    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      ok?: boolean;
      goal?: {
        progressPercent: number;
        status: string;
      };
    };
    expect(payload.ok).toBe(true);
    expect(payload.goal?.progressPercent).toBe(0);
    expect(payload.goal?.status).toBe("active");
  });
});
