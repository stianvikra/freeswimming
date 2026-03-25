import { describe, expect, it } from "vitest";
import type { SessionDraft } from "@/lib/session-generator-v1/shared";
import {
  buildProgramGarminReadyExport,
  buildProgramGarminReadyExportFileName,
  buildProgramPdfFileName,
  buildProgramPdfHtmlDocument,
} from "@/lib/programs/export";
import type { ProgramEditorRecord } from "@/lib/programs/shared";
import type { WorkoutEditorRecord } from "@/lib/workouts/shared";

function buildDraft(overrides?: Partial<SessionDraft>): SessionDraft {
  return {
    version: 1,
    status: "draft",
    generatorKind: "rule_engine_v1",
    createdAt: "2026-03-25T18:10:00.000Z",
    sourceFingerprint: "fingerprint-1",
    title: "Program export workout",
    titleSuggestions: ["Program export workout"],
    description: "Canonical workout for program export coverage.",
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
    focusText: "Race-pace breathing",
    goalTitle: "Ship canonical program export",
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
        notes: "Keep it long.",
      },
    ],
    ...overrides,
  };
}

function buildWorkoutRecord(overrides?: Partial<WorkoutEditorRecord>): WorkoutEditorRecord {
  return {
    id: "workout-1",
    createdAt: "2026-03-25T18:00:00.000Z",
    updatedAt: "2026-03-25T18:05:00.000Z",
    acceptedAt: "2026-03-25T18:05:00.000Z",
    sourceKind: "manual",
    status: "accepted",
    draft: buildDraft(),
    ...overrides,
  };
}

function buildProgramRecord(overrides?: Partial<ProgramEditorRecord>): ProgramEditorRecord {
  return {
    id: "program-1",
    createdAt: "2026-03-25T18:00:00.000Z",
    updatedAt: "2026-03-25T18:05:00.000Z",
    sourceKind: "manual",
    status: "draft",
    title: "Race prep week",
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
    ...overrides,
  };
}

describe("program exports", () => {
  it("builds a canonical garmin-ready program bundle with nested workout exports", () => {
    const program = buildProgramRecord();
    const workoutsById = new Map<string, WorkoutEditorRecord>([
      [program.weeks[0]!.assignments[0]!.workoutId, buildWorkoutRecord()],
    ]);

    const exportPayload = buildProgramGarminReadyExport(program, workoutsById, {
      exportedAt: "2026-03-25T18:30:00.000Z",
    });

    expect(buildProgramGarminReadyExportFileName(program)).toBe(
      "freeswimming-race-prep-week-garmin-ready.json"
    );
    expect(exportPayload.kind).toBe("freeswimming_garmin_ready_program_v1");
    expect(exportPayload.source).toBe("canonical_program");
    expect(exportPayload.program.assignmentCount).toBe(1);
    expect(exportPayload.diagnostics.status).toBe("ready");
    expect(exportPayload.diagnostics.issues).toEqual([]);
    expect(exportPayload.weeks[0]?.days[0]?.assignments[0]).toMatchObject({
      id: "assignment-1",
      workoutTitle: "Program export workout",
      mappingStatus: "ready",
    });
    expect(exportPayload.weeks[0]?.days[0]?.assignments[0]?.workout?.kind).toBe(
      "freeswimming_garmin_ready_workout_v1"
    );
  });

  it("keeps review diagnostics when a scheduled workout is missing or still needs workout-level review", () => {
    const reviewWorkout = buildWorkoutRecord({
      draft: buildDraft({
        title: "Review workout",
        steps: [
          {
            id: "step-1",
            category: "main",
            name: "Review block",
            stroke: "reverse_im_order",
            drillType: "pull",
            equipment: "fins",
            intensity: "moderate",
            durationMode: "distance",
            distanceM: 200,
            timeMin: null,
            targetSummary: "Truthful diagnostics",
            notes: "",
          },
        ],
      }),
    });
    const program = buildProgramRecord({
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
              dayIndex: 2,
              position: 0,
            },
          ],
        },
      ],
    });
    const workoutsById = new Map<string, WorkoutEditorRecord>([["workout-1", reviewWorkout]]);

    const exportPayload = buildProgramGarminReadyExport(program, workoutsById, {
      exportedAt: "2026-03-25T18:30:00.000Z",
    });

    expect(exportPayload.diagnostics.status).toBe("review");
    expect(exportPayload.diagnostics.issueCount).toBe(2);
    expect(exportPayload.diagnostics.issues[0]?.detail).toContain("Review workout");
    expect(exportPayload.diagnostics.issues[1]?.detail).toContain("could not be loaded");
    expect(exportPayload.weeks[0]?.days[0]?.assignments[0]?.mappingStatus).toBe("review");
    expect(exportPayload.weeks[0]?.days[2]?.assignments[0]).toMatchObject({
      workoutTitle: null,
      workout: null,
      mappingStatus: "review",
    });
  });

  it("builds a printable program PDF html document with schedule and review details", () => {
    const reviewWorkout = buildWorkoutRecord({
      draft: buildDraft({
        title: "Printable review workout",
        steps: [
          {
            id: "step-1",
            category: "main",
            name: "Review block",
            stroke: "reverse_im_order",
            intensity: "moderate",
            durationMode: "distance",
            distanceM: 200,
            timeMin: null,
            targetSummary: "Print coverage",
            notes: "",
          },
        ],
      }),
    });
    const program = buildProgramRecord({
      title: "Printable race prep",
    });
    const html = buildProgramPdfHtmlDocument(program, new Map([["workout-1", reviewWorkout]]), {
      exportedAt: "2026-03-25T18:30:00.000Z",
    });

    expect(buildProgramPdfFileName(program)).toBe("freeswimming-printable-race-prep-print.pdf");
    expect(html).toContain("Program PDF print view");
    expect(html).toContain("Print / Save PDF");
    expect(html).toContain("Printable race prep");
    expect(html).toContain("Canonical program");
    expect(html).toContain("Week 1");
    expect(html).toContain("Monday");
    expect(html).toContain("Printable review workout");
    expect(html).toContain("Reverse IM order (RIMO)");
  });
});
