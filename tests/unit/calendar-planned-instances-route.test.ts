import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

import { PATCH as patchPlannedInstance } from "@/app/api/my-library/calendar/planned-instances/[instanceId]/route";
import type { Database } from "@/types/database";

type PlannedWorkoutInstanceRow = Database["public"]["Tables"]["planned_workout_instances"]["Row"];

const INSTANCE_ID = "11111111-1111-4111-8111-111111111111";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildPlannedInstanceRow(
  overrides?: Partial<PlannedWorkoutInstanceRow>
): PlannedWorkoutInstanceRow {
  return {
    id: INSTANCE_ID,
    user_id: "user-1",
    program_id: "11111111-1111-4111-8111-111111111111",
    program_week_id: "week-1",
    program_week_index: 0,
    program_assignment_id: "assignment-1",
    workout_id: "22222222-2222-4222-8222-222222222222",
    planned_on: "2026-06-22",
    day_index: 0,
    position: 0,
    status: "planned",
    date_override_kind: "program_assignment",
    source_kind: "program_assignment",
    created_at: "2026-06-20T09:10:00.000Z",
    updated_at: "2026-06-20T09:10:00.000Z",
    ...overrides,
  };
}

function buildRequest(body: Record<string, unknown>) {
  return new Request(
    `http://127.0.0.1:3000/api/my-library/calendar/planned-instances/${INSTANCE_ID}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
}

function buildSupabaseMock(input: {
  user?: { id: string } | null;
  currentRow?: PlannedWorkoutInstanceRow | null;
  updateRow?: PlannedWorkoutInstanceRow | null;
  loadError?: { message: string } | null;
  updateError?: { message: string } | null;
}) {
  const currentRow = input.currentRow === undefined ? buildPlannedInstanceRow() : input.currentRow;
  const updateRow =
    input.updateRow === undefined
      ? buildPlannedInstanceRow({ updated_at: "2026-06-20T09:11:00.000Z" })
      : input.updateRow;

  const loadMaybeSingle = vi
    .fn()
    .mockResolvedValue(
      input.loadError ? { data: null, error: input.loadError } : { data: currentRow, error: null }
    );
  const loadEqId = vi.fn(() => ({ maybeSingle: loadMaybeSingle }));
  const loadEqUser = vi.fn(() => ({ eq: loadEqId }));
  const select = vi.fn(() => ({ eq: loadEqUser }));

  const updateMaybeSingle = vi
    .fn()
    .mockResolvedValue(
      input.updateError
        ? { data: null, error: input.updateError }
        : { data: updateRow, error: null }
    );
  const updateSelect = vi.fn(() => ({ maybeSingle: updateMaybeSingle }));
  const updateEqUpdatedAt = vi.fn(() => ({ select: updateSelect }));
  const updateEqStatus = vi.fn(() => ({ eq: updateEqUpdatedAt }));
  const updateEqId = vi.fn(() => ({ eq: updateEqStatus }));
  const updateEqUser = vi.fn(() => ({ eq: updateEqId }));
  const update = vi.fn(() => ({ eq: updateEqUser }));

  const from = vi.fn((table: string) => {
    if (table !== "planned_workout_instances") {
      throw new Error(`Unexpected table ${table}`);
    }

    return { select, update };
  });

  createRouteHandlerSupabaseClientMock.mockResolvedValue({
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: input.user === undefined ? { id: "user-1" } : input.user },
        }),
      },
      from,
    },
    applySupabaseCookies: applyResponseCookiesIdentity,
  });

  return {
    from,
    update,
    updateEqUser,
    updateEqId,
    updateEqStatus,
    updateEqUpdatedAt,
  };
}

async function patch(body: Record<string, unknown>) {
  return patchPlannedInstance(buildRequest(body), {
    params: Promise.resolve({ instanceId: INSTANCE_ID }),
  });
}

describe("calendar planned instance route", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated planned instance mutations", async () => {
    buildSupabaseMock({ user: null });

    const response = await patch({
      action: "skip",
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });

    expect(response.status).toBe(401);
  });

  it("reschedules a planned-only instance with a manual date override", async () => {
    const { update, updateEqUser, updateEqId, updateEqStatus, updateEqUpdatedAt } =
      buildSupabaseMock({
        updateRow: buildPlannedInstanceRow({
          planned_on: "2026-06-24",
          day_index: 2,
          date_override_kind: "manual",
          updated_at: "2026-06-20T09:12:00.000Z",
        }),
      });

    const response = await patch({
      action: "move",
      plannedOn: "2026-06-24",
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });
    const payload = (await response.json()) as {
      ok: boolean;
      instance: { plannedOn: string; status: string; updatedAt: string };
    };

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      planned_on: "2026-06-24",
      day_index: 2,
      date_override_kind: "manual",
    });
    expect(updateEqUser).toHaveBeenCalledWith("user_id", "user-1");
    expect(updateEqId).toHaveBeenCalledWith("id", INSTANCE_ID);
    expect(updateEqStatus).toHaveBeenCalledWith("status", "planned");
    expect(updateEqUpdatedAt).toHaveBeenCalledWith("updated_at", "2026-06-20T09:10:00.000Z");
    expect(payload).toMatchObject({
      ok: true,
      instance: {
        plannedOn: "2026-06-24",
        status: "planned",
        updatedAt: "2026-06-20T09:12:00.000Z",
      },
    });
  });

  it("skips and recovers planned-only instances without marking them done", async () => {
    const skipMock = buildSupabaseMock({
      updateRow: buildPlannedInstanceRow({
        status: "skipped",
        updated_at: "2026-06-20T09:13:00.000Z",
      }),
    });
    const skipResponse = await patch({
      action: "skip",
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });
    expect(skipResponse.status).toBe(200);
    expect(skipMock.update).toHaveBeenCalledWith({ status: "skipped" });

    createRouteHandlerSupabaseClientMock.mockReset();
    const recoverMock = buildSupabaseMock({
      currentRow: buildPlannedInstanceRow({
        status: "cancelled",
        updated_at: "2026-06-20T09:13:00.000Z",
      }),
      updateRow: buildPlannedInstanceRow({
        status: "planned",
        updated_at: "2026-06-20T09:14:00.000Z",
      }),
    });
    const recoverResponse = await patch({
      action: "recover",
      expectedUpdatedAt: "2026-06-20T09:13:00.000Z",
    });
    expect(recoverResponse.status).toBe(200);
    expect(recoverMock.update).toHaveBeenCalledWith({ status: "planned" });
  });

  it("rejects stale mutations before update", async () => {
    const { update } = buildSupabaseMock({});

    const response = await patch({
      action: "skip",
      expectedUpdatedAt: "2026-06-20T09:09:00.000Z",
    });
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(409);
    expect(payload.error).toContain("changed after the page loaded");
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects unknown future statuses before update", async () => {
    const { update } = buildSupabaseMock({
      currentRow: buildPlannedInstanceRow({ status: "provider_completed" }),
    });

    const response = await patch({
      action: "skip",
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(409);
    expect(payload.error).toContain("needs review");
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects invalid reschedule dates before update", async () => {
    const { update } = buildSupabaseMock({});

    const response = await patch({
      action: "move",
      plannedOn: "not-a-date",
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });

    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it("returns not found without leaking cross-user rows", async () => {
    buildSupabaseMock({ currentRow: null });

    const response = await patch({
      action: "skip",
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });

    expect(response.status).toBe(404);
  });

  it("returns a bounded 500 when loading the planned instance fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { update } = buildSupabaseMock({ loadError: { message: "database unavailable" } });

    const response = await patch({
      action: "skip",
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Could not load this plan item right now.");
    expect(update).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("returns a bounded 500 when updating the planned instance fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    buildSupabaseMock({ updateError: { message: "write failed" } });

    const response = await patch({
      action: "skip",
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Could not update this plan item right now.");
    consoleError.mockRestore();
  });
});
