import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock, loadProgramExportSnapshotMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
  loadProgramExportSnapshotMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/programs/server", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/programs/server")>("@/lib/programs/server");
  return {
    ...actual,
    loadProgramExportSnapshot: loadProgramExportSnapshotMock,
  };
});

import { GET as getProgramGarminReady } from "@/app/api/my-library/programs/[programId]/export/garmin-ready/route";
import { GET as getProgramPdf } from "@/app/api/my-library/programs/[programId]/export/pdf/route";
import type { ProgramEditorRecord } from "@/lib/programs/shared";
import type { WorkoutEditorRecord } from "@/lib/workouts/shared";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildWorkoutRecord(): WorkoutEditorRecord {
  return {
    id: "workout-1",
    createdAt: "2026-03-25T12:00:00.000Z",
    updatedAt: "2026-03-25T12:05:00.000Z",
    acceptedAt: "2026-03-25T12:05:00.000Z",
    sourceKind: "manual",
    status: "accepted",
    draft: {
      version: 1,
      status: "draft",
      generatorKind: "rule_engine_v1",
      createdAt: "2026-03-25T12:00:00.000Z",
      sourceFingerprint: "fingerprint-1",
      title: "Exportable workout",
      titleSuggestions: ["Exportable workout"],
      description: "Saved workout for export route tests.",
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
      usedCssPaceLabel: "2:08",
      allowedStrokes: ["freestyle"],
      equipmentAllowlist: [],
      focusText: "Route coverage",
      goalTitle: "Secure program export",
      constraintText: "",
      warnings: [],
      steps: [
        {
          id: "step-1",
          category: "warmup",
          name: "Warmup swim",
          stroke: "freestyle",
          intensity: "easy",
          durationMode: "distance",
          distanceM: 400,
          timeMin: null,
          targetSummary: "Easy settle-in.",
          notes: "",
        },
      ],
    },
  };
}

function buildProgramRecord(): ProgramEditorRecord {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    createdAt: "2026-03-25T12:00:00.000Z",
    updatedAt: "2026-03-25T12:05:00.000Z",
    sourceKind: "manual",
    status: "draft",
    startsOn: "2026-06-22",
    title: "Program export shell",
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
  };
}

describe("program export routes", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
    loadProgramExportSnapshotMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated program export requests", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const garminResponse = await getProgramGarminReady(
      new Request(
        "http://127.0.0.1:3000/api/my-library/programs/11111111-1111-4111-8111-111111111111/export/garmin-ready"
      ),
      {
        params: Promise.resolve({
          programId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const pdfResponse = await getProgramPdf(
      new Request(
        "http://127.0.0.1:3000/api/my-library/programs/11111111-1111-4111-8111-111111111111/export/pdf"
      ),
      {
        params: Promise.resolve({
          programId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );

    expect(garminResponse.status).toBe(401);
    expect(pdfResponse.status).toBe(401);
  });

  it("returns canonical garmin-ready program export json for the authenticated owner", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });
    loadProgramExportSnapshotMock.mockResolvedValue({
      ok: true,
      value: {
        program: buildProgramRecord(),
        workoutsById: new Map([["workout-1", buildWorkoutRecord()]]),
      },
    });

    const response = await getProgramGarminReady(
      new Request(
        "http://127.0.0.1:3000/api/my-library/programs/11111111-1111-4111-8111-111111111111/export/garmin-ready"
      ),
      {
        params: Promise.resolve({
          programId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = (await response.json()) as {
      kind: string;
      source: string;
      program: { title: string };
    };

    expect(response.status).toBe(200);
    expect(payload.kind).toBe("freeswimming_garmin_ready_program_v1");
    expect(payload.source).toBe("canonical_program");
    expect(payload.program.title).toBe("Program export shell");
  });

  it("returns printable canonical program pdf html for the authenticated owner", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });
    loadProgramExportSnapshotMock.mockResolvedValue({
      ok: true,
      value: {
        program: buildProgramRecord(),
        workoutsById: new Map([["workout-1", buildWorkoutRecord()]]),
      },
    });

    const response = await getProgramPdf(
      new Request(
        "http://127.0.0.1:3000/api/my-library/programs/11111111-1111-4111-8111-111111111111/export/pdf"
      ),
      {
        params: Promise.resolve({
          programId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(body).toContain("Program PDF print view");
    expect(body).toContain("Print / Save PDF");
    expect(body).toContain("Program export shell");
    expect(body).toContain('aria-label="Scheduled workout steps"');
    expect(body).toContain('data-step-category="warmup"');
    expect(body).toContain("400m · Freestyle · Easy");
  });
});
