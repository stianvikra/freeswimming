import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock, loadHabitSnapshotMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
  loadHabitSnapshotMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/habits/server", () => ({
  HABIT_DEFINITION_SELECT: "habit definition select",
  HABIT_CHECK_IN_SELECT: "habit check-in select",
  loadHabitSnapshot: loadHabitSnapshotMock,
}));

import { POST as postHabitCheckIn } from "@/app/api/my-library/habits/check-ins/route";
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

describe("habits routes", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
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

  it("creates an owner-scoped habit definition", async () => {
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
          title: "No sugar",
          habitType: "avoidance",
          category: "nutrition",
          targetValueNumeric: 0,
          targetUnit: "times",
          selectedDate: "2026-05-10",
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        title: "No sugar",
        habit_type: "avoidance",
        target_operator: "at_most",
        target_value_numeric: 0,
      })
    );
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

  it("upserts one owner-scoped check-in per habit date", async () => {
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
          valueBoolean: true,
        }),
      })
    );
    const payload = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(habitEqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(habitEqId).toHaveBeenCalledWith("id", "11111111-1111-4111-8111-111111111111");
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        habit_id: "11111111-1111-4111-8111-111111111111",
        check_in_date: "2026-05-10",
        value_boolean: true,
      }),
      { onConflict: "user_id,habit_id,check_in_date" }
    );
  });
});
