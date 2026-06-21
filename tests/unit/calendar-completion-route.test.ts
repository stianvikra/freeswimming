import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildManualWorkoutEmptyDraft } from "@/lib/workouts/manual";

const { createRouteHandlerSupabaseClientMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

import { POST as postCompletion } from "@/app/api/my-library/calendar/planned-instances/[instanceId]/completion/route";
import type { Database } from "@/types/database";

type CompletedActivityEventRow = Database["public"]["Tables"]["completed_activity_events"]["Row"];
type PlannedWorkoutInstanceRow = Database["public"]["Tables"]["planned_workout_instances"]["Row"];
type ProgramRow = Database["public"]["Tables"]["programs"]["Row"];
type WorkoutRow = Database["public"]["Tables"]["workouts"]["Row"];

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
    program_id: "22222222-2222-4222-8222-222222222222",
    program_week_id: "week-1",
    program_week_index: 0,
    program_assignment_id: "assignment-1",
    workout_id: "33333333-3333-4333-8333-333333333333",
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

function buildProgramRow(overrides?: Partial<ProgramRow>): ProgramRow {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    user_id: "user-1",
    source_kind: "manual",
    status: "draft",
    starts_on: "2026-06-22",
    title: "Swim comeback plan",
    weeks: [],
    created_at: "2026-06-20T09:00:00.000Z",
    updated_at: "2026-06-20T09:05:00.000Z",
    ...overrides,
  };
}

function buildWorkoutRow(overrides?: Partial<WorkoutRow>): WorkoutRow {
  const draft = buildManualWorkoutEmptyDraft(new Date("2026-06-20T08:00:00.000Z"));

  return {
    id: "33333333-3333-4333-8333-333333333333",
    user_id: "user-1",
    source_kind: "manual",
    status: "accepted",
    generator_kind: draft.generatorKind,
    source_fingerprint: draft.sourceFingerprint,
    title: "Comeback threshold swim",
    title_suggestions: ["Comeback threshold swim"],
    description: draft.description,
    environment: draft.environment,
    pool_length_m: draft.poolLengthM,
    pool_length_unit: draft.poolLengthUnit ?? "m",
    session_type: draft.sessionType,
    effort: draft.effort,
    size_mode: draft.sizeMode,
    target_distance_m: draft.targetDistanceM,
    target_time_min: draft.targetTimeMin,
    total_distance_m: 1800,
    estimated_duration_min: 38,
    base_pace_seconds_per_100: draft.basePaceSecondsPer100m,
    used_css_pace_label: draft.usedCssPaceLabel,
    allowed_strokes: draft.allowedStrokes,
    equipment_allowlist: draft.equipmentAllowlist,
    focus_text: draft.focusText,
    goal_title: draft.goalTitle,
    constraint_text: draft.constraintText,
    warnings: draft.warnings,
    steps: draft.steps,
    generated_at: draft.createdAt,
    accepted_at: "2026-06-20T08:01:00.000Z",
    created_at: "2026-06-20T08:01:00.000Z",
    updated_at: "2026-06-20T08:02:00.000Z",
    ...overrides,
  };
}

function buildCompletionRow(
  overrides?: Partial<CompletedActivityEventRow>
): CompletedActivityEventRow {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    user_id: "user-1",
    planned_workout_instance_id: INSTANCE_ID,
    workout_id: "33333333-3333-4333-8333-333333333333",
    program_id: "22222222-2222-4222-8222-222222222222",
    outcome: "completed",
    source_kind: "manual",
    completed_on: "2026-06-22",
    planned_snapshot: {},
    created_at: "2026-06-22T17:30:00.000Z",
    updated_at: "2026-06-22T17:30:00.000Z",
    ...overrides,
  };
}

function buildRequest(body: Record<string, unknown>) {
  return new Request(
    `http://127.0.0.1:3000/api/my-library/calendar/planned-instances/${INSTANCE_ID}/completion`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
}

function buildEqEqMaybeSingleChain(result: unknown) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eqId = vi.fn(() => ({ maybeSingle }));
  const eqUser = vi.fn(() => ({ eq: eqId }));
  const select = vi.fn(() => ({ eq: eqUser }));
  return { select, eqUser, eqId, maybeSingle };
}

function buildSupabaseMock(input: {
  user?: { id: string } | null;
  instanceRow?: PlannedWorkoutInstanceRow | null;
  existingCompletionRows?: Array<CompletedActivityEventRow | null>;
  insertRow?: CompletedActivityEventRow | null;
  insertError?: { code?: string; message: string } | null;
  programRow?: ProgramRow | null;
  workoutRow?: WorkoutRow | null;
  completionLoadError?: { code?: string; message: string } | null;
}) {
  const plannedChain = buildEqEqMaybeSingleChain({
    data: input.instanceRow === undefined ? buildPlannedInstanceRow() : input.instanceRow,
    error: null,
  });
  const programChain = buildEqEqMaybeSingleChain({
    data: input.programRow === undefined ? buildProgramRow() : input.programRow,
    error: null,
  });
  const workoutChain = buildEqEqMaybeSingleChain({
    data: input.workoutRow === undefined ? buildWorkoutRow() : input.workoutRow,
    error: null,
  });

  const existingRows = input.existingCompletionRows ?? [null];
  const completedMaybeSingle = vi.fn();
  for (const row of existingRows) {
    completedMaybeSingle.mockResolvedValueOnce({
      data: row,
      error: input.completionLoadError ?? null,
    });
  }
  completedMaybeSingle.mockResolvedValue({
    data: existingRows[existingRows.length - 1] ?? null,
    error: input.completionLoadError ?? null,
  });
  const completedEqPlanned = vi.fn(() => ({ maybeSingle: completedMaybeSingle }));
  const completedEqUser = vi.fn(() => ({ eq: completedEqPlanned }));
  const completedSelect = vi.fn(() => ({ eq: completedEqUser }));

  const insertSingle = vi.fn().mockResolvedValue({
    data: input.insertRow === undefined ? buildCompletionRow() : input.insertRow,
    error: input.insertError ?? null,
  });
  const insertSelect = vi.fn(() => ({ single: insertSingle }));
  const insert = vi.fn(() => ({ select: insertSelect }));

  const from = vi.fn((table: string) => {
    if (table === "planned_workout_instances") {
      return { select: plannedChain.select };
    }
    if (table === "completed_activity_events") {
      return { select: completedSelect, insert };
    }
    if (table === "programs") {
      return { select: programChain.select };
    }
    if (table === "workouts") {
      return { select: workoutChain.select };
    }
    throw new Error(`Unexpected table ${table}`);
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

  return { from, insert, insertSingle };
}

async function post(body: Record<string, unknown>) {
  return postCompletion(buildRequest(body), {
    params: Promise.resolve({ instanceId: INSTANCE_ID }),
  });
}

describe("calendar completion route", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated completion attempts", async () => {
    buildSupabaseMock({ user: null });

    const response = await post({
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });

    expect(response.status).toBe(401);
  });

  it("creates a canonical manual completed activity event for an eligible planned swim", async () => {
    const { insert } = buildSupabaseMock({});

    const response = await post({
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });
    const payload = (await response.json()) as {
      ok: boolean;
      status: string;
      event: { plannedWorkoutInstanceId: string; completedOn: string };
    };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      status: "completed",
      event: {
        plannedWorkoutInstanceId: INSTANCE_ID,
        completedOn: "2026-06-22",
      },
    });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        planned_workout_instance_id: INSTANCE_ID,
        workout_id: "33333333-3333-4333-8333-333333333333",
        program_id: "22222222-2222-4222-8222-222222222222",
        outcome: "completed",
        source_kind: "manual",
        completed_on: "2026-06-22",
        planned_snapshot: expect.objectContaining({
          kind: "calendar_manual_completion_planned_snapshot_v1",
        }),
      })
    );
  });

  it("returns the existing event for repeat submissions without inserting again", async () => {
    const { insert } = buildSupabaseMock({
      existingCompletionRows: [buildCompletionRow()],
    });

    const response = await post({
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });
    const payload = (await response.json()) as { ok: boolean; status: string };

    expect(response.status).toBe(200);
    expect(payload.status).toBe("already_completed");
    expect(insert).not.toHaveBeenCalled();
  });

  it("returns an existing event after a unique-conflict race", async () => {
    buildSupabaseMock({
      existingCompletionRows: [null, buildCompletionRow()],
      insertError: {
        code: "23505",
        message: "duplicate key value violates completed_activity_events_planned_unique",
      },
    });

    const response = await post({
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });
    const payload = (await response.json()) as { ok: boolean; status: string };

    expect(response.status).toBe(200);
    expect(payload.status).toBe("already_completed");
  });

  it("rejects stale completion attempts before insert", async () => {
    const { insert } = buildSupabaseMock({});

    const response = await post({
      expectedUpdatedAt: "2026-06-20T09:09:00.000Z",
    });
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(409);
    expect(payload.error).toContain("changed after the page loaded");
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects skipped, cancelled, and future unknown planned statuses", async () => {
    const skipped = buildSupabaseMock({
      instanceRow: buildPlannedInstanceRow({ status: "skipped" }),
    });
    const skippedResponse = await post({
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });
    expect(skippedResponse.status).toBe(409);
    expect(skipped.insert).not.toHaveBeenCalled();

    createRouteHandlerSupabaseClientMock.mockReset();
    const unknown = buildSupabaseMock({
      instanceRow: buildPlannedInstanceRow({ status: "provider_completed" }),
    });
    const unknownResponse = await post({
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });
    const payload = (await unknownResponse.json()) as { error: string };
    expect(unknownResponse.status).toBe(409);
    expect(payload.error).toContain("needs review");
    expect(unknown.insert).not.toHaveBeenCalled();
  });

  it("rejects missing workout or missing reference rows", async () => {
    const missingWorkoutId = buildSupabaseMock({
      instanceRow: buildPlannedInstanceRow({ workout_id: null }),
    });
    const missingWorkoutIdResponse = await post({
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });
    expect(missingWorkoutIdResponse.status).toBe(409);
    expect(missingWorkoutId.insert).not.toHaveBeenCalled();

    createRouteHandlerSupabaseClientMock.mockReset();
    const missingReference = buildSupabaseMock({ workoutRow: null });
    const missingReferenceResponse = await post({
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });
    expect(missingReferenceResponse.status).toBe(409);
    expect(missingReference.insert).not.toHaveBeenCalled();
  });

  it("returns not found without leaking cross-user rows", async () => {
    buildSupabaseMock({ instanceRow: null });

    const response = await post({
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });

    expect(response.status).toBe(404);
  });

  it("fails closed when completion history schema is missing or unmapped", async () => {
    const missingSchema = buildSupabaseMock({
      completionLoadError: {
        code: "42P01",
        message: "relation completed_activity_events missing",
      },
    });
    const missingSchemaResponse = await post({
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });
    expect(missingSchemaResponse.status).toBe(503);
    expect(missingSchema.insert).not.toHaveBeenCalled();

    createRouteHandlerSupabaseClientMock.mockReset();
    const unmapped = buildSupabaseMock({
      existingCompletionRows: [
        buildCompletionRow({
          outcome: "provider_pending",
          source_kind: "garmin_activity_api",
        }),
      ],
    });
    const unmappedResponse = await post({
      expectedUpdatedAt: "2026-06-20T09:10:00.000Z",
    });
    const payload = (await unmappedResponse.json()) as { error: string };
    expect(unmappedResponse.status).toBe(409);
    expect(payload.error).toContain("needs review");
    expect(unmapped.insert).not.toHaveBeenCalled();
  });
});
