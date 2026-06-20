import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

import { PATCH as patchProgram } from "@/app/api/my-library/programs/[programId]/route";
import { POST as postProgram } from "@/app/api/my-library/programs/route";
import type { ProgramSaveRequestBody } from "@/lib/programs/shared";
import type { Database } from "@/types/database";

type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildProgramRow(overrides?: Partial<ProgramRow>): ProgramRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "user-1",
    source_kind: "manual",
    status: "draft",
    starts_on: "2026-06-22",
    title: "Manual race prep shell",
    weeks: [
      {
        id: "week-1",
        label: "Week 1",
        assignments: [
          {
            id: "assignment-1",
            workoutId: "workout-1",
            dayIndex: 0,
            position: 0,
          },
        ],
      },
    ],
    created_at: "2026-03-25T12:00:00.000Z",
    updated_at: "2026-03-25T12:05:00.000Z",
    ...overrides,
  };
}

function buildProgramBody(overrides?: Partial<ProgramSaveRequestBody>): ProgramSaveRequestBody {
  return {
    title: "Manual race prep shell",
    startsOn: "2026-06-22",
    weeks: [
      {
        id: "week-1",
        label: "Week 1",
        assignments: [
          {
            id: "assignment-1",
            workoutId: "workout-1",
            dayIndex: 0,
            position: 0,
          },
        ],
      },
    ],
    sourceKind: "manual",
    ...overrides,
  };
}

describe("programs routes", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated canonical program save", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postProgram(
      new Request("http://127.0.0.1:3000/api/my-library/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })
    );

    expect(response.status).toBe(401);
  });

  it("creates canonical programs for the authenticated owner", async () => {
    const single = vi.fn().mockResolvedValue({
      data: buildProgramRow({ weeks: [{ id: "week-1", label: "Week 1", assignments: [] }] }),
      error: null,
    });
    const selectPrograms = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select: selectPrograms }));
    const selectWorkouts = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });
    const workoutsFrom = vi.fn(() => ({ select: selectWorkouts }));
    const plannedInstancesEqStatus = vi.fn().mockResolvedValue({ data: [], error: null });
    const plannedInstancesEqProgram = vi.fn(() => ({ eq: plannedInstancesEqStatus }));
    const plannedInstancesEqUser = vi.fn(() => ({ eq: plannedInstancesEqProgram }));
    const plannedInstancesSelect = vi.fn(() => ({ eq: plannedInstancesEqUser }));
    const plannedInstancesFrom = vi.fn(() => ({ select: plannedInstancesSelect }));
    const programsFrom = vi.fn(() => ({ insert }));
    const from = vi.fn((table: string) => {
      if (table === "workouts") {
        return workoutsFrom();
      }
      if (table === "planned_workout_instances") {
        return plannedInstancesFrom();
      }
      if (table === "programs") {
        return programsFrom();
      }
      throw new Error(`Unexpected table ${table}`);
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

    const response = await postProgram(
      new Request("http://127.0.0.1:3000/api/my-library/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })
    );
    const payload = (await response.json()) as {
      ok: boolean;
      program: { id: string };
      summary: { title: string };
    };

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("programs");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        source_kind: "manual",
        status: "draft",
        starts_on: expect.any(String),
        title: "New program",
      })
    );
    expect(payload.ok).toBe(true);
    expect(payload.program.id).toBe("11111111-1111-4111-8111-111111111111");
    expect(payload.summary.title).toBe("Manual race prep shell");
  });

  it("rejects scheduled workouts that do not belong to the authenticated owner", async () => {
    const selectWorkouts = vi.fn().mockResolvedValue({
      data: [{ id: "workout-1" }],
      error: null,
    });
    const inClause = vi.fn(() => Promise.resolve({ data: [{ id: "workout-1" }], error: null }));
    const eqUser = vi.fn(() => ({ in: inClause }));
    const from = vi.fn((table: string) => {
      if (table === "workouts") {
        return {
          select: selectWorkouts,
        };
      }
      throw new Error(`Unexpected table ${table}`);
    });
    selectWorkouts.mockImplementation(() => ({ eq: eqUser }));

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchProgram(
      new Request(
        "http://127.0.0.1:3000/api/my-library/programs/11111111-1111-4111-8111-111111111111",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            buildProgramBody({
              weeks: [
                {
                  id: "week-1",
                  label: "Week 1",
                  assignments: [
                    {
                      id: "assignment-1",
                      workoutId: "workout-1",
                      dayIndex: 0,
                      position: 0,
                    },
                    {
                      id: "assignment-2",
                      workoutId: "missing-workout",
                      dayIndex: 1,
                      position: 0,
                    },
                  ],
                },
              ],
            })
          ),
        }
      ),
      {
        params: Promise.resolve({
          programId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );

    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toContain("scheduled workout");
  });

  it("saves canonical program edits for the authenticated owner", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: buildProgramRow({
        title: "Updated manual race prep shell",
        weeks: [
          {
            id: "week-1",
            label: "Week 1",
            assignments: [
              {
                id: "assignment-1",
                workoutId: "workout-1",
                dayIndex: 2,
                position: 0,
              },
            ],
          },
        ],
      }),
      error: null,
    });
    const selectPrograms = vi.fn(() => ({ maybeSingle }));
    const eqProgramId = vi.fn(() => ({ select: selectPrograms }));
    const eqUserPrograms = vi.fn(() => ({ eq: eqProgramId }));
    const update = vi.fn(() => ({ eq: eqUserPrograms }));

    const plannedInstancesEqStatus = vi.fn().mockResolvedValue({ data: [], error: null });
    const plannedInstancesEqProgram = vi.fn(() => ({ eq: plannedInstancesEqStatus }));
    const plannedInstancesEqUser = vi.fn(() => ({ eq: plannedInstancesEqProgram }));
    const plannedInstancesSelect = vi.fn(() => ({ eq: plannedInstancesEqUser }));
    const plannedInstancesUpsert = vi.fn().mockResolvedValue({ error: null });

    const inClause = vi.fn().mockResolvedValue({
      data: [{ id: "workout-1" }],
      error: null,
    });
    const eqUserWorkouts = vi.fn(() => ({ in: inClause }));
    const selectWorkouts = vi.fn(() => ({ eq: eqUserWorkouts }));
    const from = vi.fn((table: string) => {
      if (table === "programs") {
        return { update };
      }
      if (table === "planned_workout_instances") {
        return {
          select: plannedInstancesSelect,
          upsert: plannedInstancesUpsert,
        };
      }
      if (table === "workouts") {
        return { select: selectWorkouts };
      }
      throw new Error(`Unexpected table ${table}`);
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

    const response = await patchProgram(
      new Request(
        "http://127.0.0.1:3000/api/my-library/programs/11111111-1111-4111-8111-111111111111",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            buildProgramBody({
              title: "Updated manual race prep shell",
              weeks: [
                {
                  id: "week-1",
                  label: "Week 1",
                  assignments: [
                    {
                      id: "assignment-1",
                      workoutId: "workout-1",
                      dayIndex: 2,
                      position: 0,
                    },
                  ],
                },
              ],
            })
          ),
        }
      ),
      {
        params: Promise.resolve({
          programId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = (await response.json()) as {
      ok: boolean;
      program: { title: string };
      summary: { assignmentCount: number };
    };

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        starts_on: "2026-06-22",
        title: "Updated manual race prep shell",
      })
    );
    expect(plannedInstancesUpsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          program_assignment_id: "assignment-1",
          workout_id: "workout-1",
          planned_on: "2026-06-24",
          day_index: 2,
          status: "planned",
        }),
      ],
      {
        onConflict: "program_id,program_assignment_id",
      }
    );
    expect(payload.ok).toBe(true);
    expect(payload.program.title).toBe("Updated manual race prep shell");
    expect(payload.summary.assignmentCount).toBe(1);
  });
});
