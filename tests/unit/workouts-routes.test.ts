import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
}));
const { loadTrainingContextSnapshotMock } = vi.hoisted(() => ({
  loadTrainingContextSnapshotMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));
vi.mock("@/lib/training-context/server", () => ({
  loadTrainingContextSnapshot: loadTrainingContextSnapshotMock,
}));

import {
  DELETE as deleteWorkout,
  PATCH as patchWorkout,
} from "@/app/api/my-library/workouts/[workoutId]/route";
import { GET as getWorkoutPdf } from "@/app/api/my-library/workouts/[workoutId]/export/pdf/route";
import { POST as postWorkout } from "@/app/api/my-library/workouts/route";
import type { SessionDraft } from "@/lib/session-generator-v1/shared";
import type { Database } from "@/types/database";

type WorkoutRow = Database["public"]["Tables"]["workouts"]["Row"];

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildWorkoutRow(overrides?: Partial<WorkoutRow>): WorkoutRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "user-1",
    source_kind: "ai_session_v1",
    status: "accepted",
    generator_kind: "rule_engine_v1",
    source_fingerprint: "fingerprint-1",
    title: "Threshold / CSS 25m Pool draft",
    title_suggestions: ["Threshold / CSS 25m Pool draft"],
    description: "Threshold session in pool mode.",
    environment: "pool",
    pool_length_m: 25,
    session_type: "threshold_css",
    effort: "moderate",
    size_mode: "distance",
    target_distance_m: 2200,
    target_time_min: null,
    total_distance_m: 2200,
    estimated_duration_min: 45,
    base_pace_seconds_per_100: 128,
    used_css_pace_label: "1:58",
    allowed_strokes: ["freestyle"],
    equipment_allowlist: ["kickboard"],
    focus_text: "Breathing timing",
    goal_title: "Swim 1500m stronger",
    constraint_text: "Keep the first half controlled.",
    warnings: [],
    steps: [
      {
        id: "step-1",
        category: "warmup",
        name: "Easy warmup swim",
        stroke: "freestyle",
        intensity: "easy",
        durationMode: "distance",
        distanceM: 400,
        timeMin: null,
        targetSummary: "Easy swimming with relaxed breathing.",
        notes: "Start smooth.",
      },
    ],
    generated_at: "2026-03-20T12:10:00.000Z",
    accepted_at: "2026-03-20T12:18:00.000Z",
    created_at: "2026-03-20T12:18:00.000Z",
    updated_at: "2026-03-20T12:20:00.000Z",
    ...overrides,
  };
}

function buildDraftBody(overrides?: Partial<{ sourceKind: "ai_session_v1" | "manual" }>): {
  sourceKind: "ai_session_v1" | "manual";
  draft: SessionDraft;
} {
  return {
    sourceKind: "ai_session_v1" as const,
    draft: {
      version: 1,
      status: "draft",
      generatorKind: "rule_engine_v1",
      createdAt: "2026-03-20T12:10:00.000Z",
      sourceFingerprint: "fingerprint-1",
      title: "Threshold / CSS 25m Pool draft",
      titleSuggestions: ["Threshold / CSS 25m Pool draft"],
      description: "Threshold session in pool mode.",
      environment: "pool",
      poolLengthM: 25,
      sessionType: "threshold_css",
      effort: "moderate",
      sizeMode: "distance",
      targetDistanceM: 2200,
      targetTimeMin: null,
      totalDistanceM: 2200,
      estimatedDurationMin: 45,
      basePaceSecondsPer100m: 128,
      usedCssPaceLabel: "1:58",
      allowedStrokes: ["freestyle"],
      equipmentAllowlist: ["kickboard"],
      focusText: "Breathing timing",
      goalTitle: "Swim 1500m stronger",
      constraintText: "Keep the first half controlled.",
      warnings: [],
      steps: [
        {
          id: "step-1",
          category: "warmup",
          name: "Easy warmup swim",
          stroke: "freestyle",
          intensity: "easy",
          durationMode: "distance",
          distanceM: 400,
          timeMin: null,
          targetSummary: "Easy swimming with relaxed breathing.",
          notes: "Start smooth.",
        },
      ],
    },
    ...overrides,
  };
}

describe("workouts routes", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
    loadTrainingContextSnapshotMock.mockReset();
    loadTrainingContextSnapshotMock.mockResolvedValue({
      schemaReady: true,
      loadError: null,
      activeFocus: null,
      primaryFocus: null,
      openFocuses: [],
      focusHistory: [],
      focusNeedsPrimarySelection: false,
      recentNotes: [],
      unresolvedObservationCount: 0,
      unansweredQuestionCount: 0,
      goalOptions: [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated canonical workout save", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postWorkout(
      new Request("http://127.0.0.1:3000/api/my-library/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildDraftBody()),
      })
    );

    expect(response.status).toBe(401);
  });

  it("fails closed for unauthenticated workout pdf export", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await getWorkoutPdf(
      new Request(
        "http://127.0.0.1:3000/api/my-library/workouts/11111111-1111-4111-8111-111111111111/export/pdf"
      ),
      {
        params: Promise.resolve({
          workoutId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );

    expect(response.status).toBe(401);
  });

  it("creates canonical workouts for the authenticated owner", async () => {
    const single = vi.fn().mockResolvedValue({
      data: buildWorkoutRow(),
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn().mockReturnValue({ insert });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postWorkout(
      new Request("http://127.0.0.1:3000/api/my-library/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildDraftBody()),
      })
    );
    const payload = (await response.json()) as {
      ok: boolean;
      workout: { id: string };
      summary: { title: string };
    };

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("workouts");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        source_kind: "ai_session_v1",
        status: "accepted",
        title: "Threshold / CSS 25m Pool draft",
      })
    );
    expect(payload.ok).toBe(true);
    expect(payload.workout.id).toBe("11111111-1111-4111-8111-111111111111");
    expect(payload.summary.title).toBe("Threshold / CSS 25m Pool draft");
  });

  it("returns printable canonical workout pdf html for the authenticated owner", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: buildWorkoutRow({
        title: "Poolside QA workout",
      }),
      error: null,
    });
    const eqId = vi.fn(() => ({ maybeSingle }));
    const eqUser = vi.fn(() => ({ eq: eqId }));
    const select = vi.fn(() => ({ eq: eqUser }));
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

    const response = await getWorkoutPdf(
      new Request(
        "http://127.0.0.1:3000/api/my-library/workouts/11111111-1111-4111-8111-111111111111/export/pdf"
      ),
      {
        params: Promise.resolve({
          workoutId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(body).toContain("Workout PDF");
    expect(body).toContain("Poolside QA workout");
    expect(body).toContain("Source: Canonical workout");
  });

  it("returns a compact poolside note with focus points for the authenticated owner", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: buildWorkoutRow({
        title: "Poolside QA workout",
      }),
      error: null,
    });
    const eqId = vi.fn(() => ({ maybeSingle }));
    const eqUser = vi.fn(() => ({ eq: eqId }));
    const select = vi.fn(() => ({ eq: eqUser }));
    const from = vi.fn().mockReturnValue({ select });

    loadTrainingContextSnapshotMock.mockResolvedValue({
      schemaReady: true,
      loadError: null,
      activeFocus: null,
      primaryFocus: null,
      openFocuses: [
        {
          id: "focus-1",
          title: "High elbow catch",
          isPrimary: true,
        },
        {
          id: "focus-2",
          title: "Calm exhale",
          isPrimary: false,
        },
      ],
      focusHistory: [],
      focusNeedsPrimarySelection: false,
      recentNotes: [],
      unresolvedObservationCount: 0,
      unansweredQuestionCount: 0,
      goalOptions: [],
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

    const response = await getWorkoutPdf(
      new Request(
        "http://127.0.0.1:3000/api/my-library/workouts/11111111-1111-4111-8111-111111111111/export/pdf?variant=poolside&printStyle=ink_saver&focusId=focus-2"
      ),
      {
        params: Promise.resolve({
          workoutId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("Poolside Note");
    expect(body).toContain('data-pdf-variant="poolside"');
    expect(body).toContain('data-poolside-print-style="ink_saver"');
    expect(body).toContain("Calm exhale");
    expect(body).not.toContain("High elbow catch");
    expect(body).toContain("Breathing timing");
    expect(body).toContain("lockup-domain-ink.png");
  });

  it("creates manual canonical workouts when the request source kind is manual", async () => {
    const body = buildDraftBody({ sourceKind: "manual" });
    body.draft.title = "Manual pool workout";
    body.draft.titleSuggestions = ["Manual pool workout"];
    body.draft.poolLengthM = 33.33;
    body.draft.steps = [
      {
        id: "step-1",
        category: "swim",
        name: "Pace hold",
        stroke: "backstroke",
        drillType: "pull",
        equipment: "fins",
        intensity: "moderate",
        durationMode: "distance",
        distanceM: 400,
        timeMin: null,
        targetMode: "css_target_pace",
        cssTargetOffsetSeconds: 2,
        targetSummary: "Hold CSS +2 seconds.",
        notes: "Stay controlled.",
      },
      {
        id: "step-2",
        category: "rest",
        name: "Send-off reset",
        stroke: "choice",
        intensity: "easy",
        durationMode: "send_off",
        distanceM: null,
        timeMin: 1.6333,
        targetMode: "none",
        targetSummary: "Send-off keeps the next round honest.",
        notes: "Leave on 1:38.",
      },
      {
        id: "step-3",
        category: "rest",
        name: "CSS send-off reset",
        stroke: "choice",
        intensity: "easy",
        durationMode: "css_send_off",
        distanceM: null,
        timeMin: null,
        cssSendOffOffsetSeconds: 2,
        targetMode: "none",
        targetSummary: "CSS +2 seconds send-off.",
        notes: "Hold the send-off rhythm off CSS.",
      },
      {
        id: "step-4",
        category: "rest",
        name: "Open reset",
        stroke: "choice",
        intensity: "easy",
        durationMode: "lap_button",
        distanceM: null,
        timeMin: null,
        targetMode: "none",
        targetSummary: "Advance manually when ready.",
        notes: "Lap button rest.",
      },
    ];

    const single = vi.fn().mockResolvedValue({
      data: buildWorkoutRow({
        source_kind: "manual",
        title: "Manual pool workout",
        steps: body.draft.steps as WorkoutRow["steps"],
      }),
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn().mockReturnValue({ insert });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postWorkout(
      new Request("http://127.0.0.1:3000/api/my-library/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
    );
    const payload = (await response.json()) as {
      ok: boolean;
      workout: { id: string };
      summary: { title: string };
    };

    expect(response.status).toBe(200);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        source_kind: "manual",
        pool_length_m: 33.33,
        allowed_strokes: ["freestyle", "backstroke"],
        equipment_allowlist: ["kickboard", "fins"],
        steps: expect.arrayContaining([
          expect.objectContaining({
            stroke: "backstroke",
            drillType: "pull",
            equipment: "fins",
          }),
          expect.objectContaining({
            durationMode: "send_off",
            timeMin: 1.6333,
            targetMode: "none",
          }),
          expect.objectContaining({
            durationMode: "css_send_off",
            timeMin: null,
            cssSendOffOffsetSeconds: 2,
            targetMode: "none",
          }),
          expect.objectContaining({
            durationMode: "lap_button",
            timeMin: null,
            targetMode: "none",
          }),
          expect.objectContaining({
            durationMode: "distance",
            targetMode: "css_target_pace",
            cssTargetOffsetSeconds: 2,
          }),
        ]),
      })
    );
    expect(payload.ok).toBe(true);
    expect(payload.summary.title).toBe("Manual pool workout");
  });

  it("rejects structured target steps that are missing target pace metadata", async () => {
    const insert = vi.fn();
    const from = vi.fn().mockReturnValue({ insert });
    const body = buildDraftBody({ sourceKind: "manual" });

    body.draft.steps = [
      {
        id: "step-1",
        category: "main",
        name: "Broken pace step",
        stroke: "freestyle",
        intensity: "moderate",
        durationMode: "distance",
        distanceM: 200,
        timeMin: null,
        targetMode: "target_pace",
        targetSummary: "Should fail without a pace.",
        notes: "Missing pace metadata.",
      },
    ];

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postWorkout(
      new Request("http://127.0.0.1:3000/api/my-library/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
    );
    const payload = (await response.json()) as { ok: false; error: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toContain("needs a target pace");
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects CSS send-off steps that are missing CSS offset metadata", async () => {
    const insert = vi.fn();
    const from = vi.fn().mockReturnValue({ insert });
    const body = buildDraftBody({ sourceKind: "manual" });

    body.draft.steps = [
      {
        id: "step-1",
        category: "rest",
        name: "Broken CSS send-off",
        stroke: "choice",
        intensity: "easy",
        durationMode: "css_send_off",
        distanceM: null,
        timeMin: null,
        targetMode: "none",
        targetSummary: "Should fail without CSS send-off metadata.",
        notes: "Missing CSS send-off offset.",
      },
    ];

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postWorkout(
      new Request("http://127.0.0.1:3000/api/my-library/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
    );
    const payload = (await response.json()) as { ok: false; error: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toContain("CSS-Based Send-Off Time offset");
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects non-contiguous repeat blocks before mutating canonical workouts", async () => {
    const insert = vi.fn();
    const from = vi.fn().mockReturnValue({ insert });
    const body = buildDraftBody();

    body.draft.steps = [
      {
        id: "repeat-1-step-1",
        category: "main",
        name: "Repeat swim",
        stroke: "freestyle",
        intensity: "moderate",
        durationMode: "distance",
        distanceM: 100,
        timeMin: null,
        targetSummary: "Hold pace.",
        notes: "Round one.",
        repeatGroupId: "repeat-1",
        repeatCount: 4,
      },
      {
        id: "step-2",
        category: "cooldown",
        name: "Cooldown swim",
        stroke: "choice",
        intensity: "easy",
        durationMode: "distance",
        distanceM: 200,
        timeMin: null,
        targetSummary: "Easy finish.",
        notes: "Breaks the repeat block.",
      },
      {
        id: "repeat-1-step-2",
        category: "rest",
        name: "Repeat rest",
        stroke: "choice",
        intensity: "easy",
        durationMode: "time",
        distanceM: null,
        timeMin: 1,
        targetSummary: "Reset.",
        notes: "Should have stayed contiguous.",
        repeatGroupId: "repeat-1",
        repeatCount: 4,
      },
    ] as typeof body.draft.steps;

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postWorkout(
      new Request("http://127.0.0.1:3000/api/my-library/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
    );
    const payload = (await response.json()) as { ok: false; error: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toContain("must stay contiguous");
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects invalid workout ids before attempting update", async () => {
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

    const response = await patchWorkout(
      new Request("http://127.0.0.1:3000/api/my-library/workouts/not-a-uuid", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildDraftBody()),
      }),
      { params: Promise.resolve({ workoutId: "not-a-uuid" }) }
    );

    expect(response.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns 404 when the owner does not have that canonical workout", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const select = vi.fn(() => ({ maybeSingle }));
    const eqWorkoutId = vi.fn(() => ({ select }));
    const eqUserId = vi.fn(() => ({ eq: eqWorkoutId }));
    const update = vi.fn(() => ({ eq: eqUserId }));
    const from = vi.fn().mockReturnValue({ update });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchWorkout(
      new Request(
        "http://127.0.0.1:3000/api/my-library/workouts/11111111-1111-4111-8111-111111111111",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildDraftBody()),
        }
      ),
      {
        params: Promise.resolve({
          workoutId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );

    expect(response.status).toBe(404);
    expect(from).toHaveBeenCalledWith("workouts");
  });

  it("fails closed for unauthenticated workout delete", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await deleteWorkout(
      new Request(
        "http://127.0.0.1:3000/api/my-library/workouts/11111111-1111-4111-8111-111111111111",
        {
          method: "DELETE",
        }
      ),
      {
        params: Promise.resolve({
          workoutId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );

    expect(response.status).toBe(401);
  });

  it("deletes canonical workouts for the authenticated owner", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: "11111111-1111-4111-8111-111111111111" },
      error: null,
    });
    const select = vi.fn(() => ({ maybeSingle }));
    const eqWorkoutId = vi.fn(() => ({ select }));
    const eqUserId = vi.fn(() => ({ eq: eqWorkoutId }));
    const deleteRows = vi.fn(() => ({ eq: eqUserId }));
    const from = vi.fn().mockReturnValue({ delete: deleteRows });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await deleteWorkout(
      new Request(
        "http://127.0.0.1:3000/api/my-library/workouts/11111111-1111-4111-8111-111111111111",
        {
          method: "DELETE",
        }
      ),
      {
        params: Promise.resolve({
          workoutId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = (await response.json()) as {
      ok: boolean;
      deletedWorkoutId: string;
    };

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("workouts");
    expect(eqUserId).toHaveBeenCalledWith("user_id", "user-1");
    expect(eqWorkoutId).toHaveBeenCalledWith("id", "11111111-1111-4111-8111-111111111111");
    expect(select).toHaveBeenCalledWith("id");
    expect(payload).toEqual({
      ok: true,
      deletedWorkoutId: "11111111-1111-4111-8111-111111111111",
    });
  });
});
