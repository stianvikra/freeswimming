import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProgramBuilderHub from "@/components/my-library/programs/ProgramBuilderHub";
import type {
  ProgramEditorRecord,
  ProgramLibrarySnapshot,
  ProgramSummary,
} from "@/lib/programs/shared";
import type { WorkoutSummary } from "@/lib/workouts/shared";

const navigationState = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationState,
}));

function buildWorkoutSummary(overrides?: Partial<WorkoutSummary>): WorkoutSummary {
  return {
    id: "workout-1",
    title: "Threshold builder workout",
    environment: "pool",
    poolLengthM: 25,
    sessionType: "threshold_css",
    effort: "moderate",
    totalDistanceM: 2200,
    estimatedDurationMin: 45,
    updatedAt: "2026-03-25T12:10:00.000Z",
    acceptedAt: "2026-03-25T12:05:00.000Z",
    sourceKind: "manual",
    status: "accepted",
    ...overrides,
  };
}

function buildProgramRecord(overrides?: Partial<ProgramEditorRecord>): ProgramEditorRecord {
  return {
    id: "program-1",
    createdAt: "2026-03-25T12:00:00.000Z",
    updatedAt: "2026-03-25T12:05:00.000Z",
    sourceKind: "manual",
    status: "draft",
    title: "Manual race prep shell",
    weeks: [
      {
        id: "week-1",
        label: "Week 1",
        assignments: [],
      },
    ],
    ...overrides,
  };
}

function buildProgramSummary(overrides?: Partial<ProgramSummary>): ProgramSummary {
  return {
    id: "program-1",
    title: "Manual race prep shell",
    weekCount: 1,
    assignmentCount: 0,
    updatedAt: "2026-03-25T12:05:00.000Z",
    sourceKind: "manual",
    status: "draft",
    ...overrides,
  };
}

function buildProgramLibrary(overrides?: Partial<ProgramLibrarySnapshot>): ProgramLibrarySnapshot {
  return {
    schemaReady: true,
    loadError: null,
    selectedProgram: buildProgramRecord(),
    selectedProgramMissing: false,
    recentPrograms: [buildProgramSummary()],
    availableWorkouts: [buildWorkoutSummary()],
    missingWorkoutIds: [],
    ...overrides,
  };
}

function buildProgramExportPreview(overrides?: Record<string, unknown>) {
  return {
    version: 1,
    kind: "freeswimming_garmin_ready_program_v1",
    source: "canonical_program",
    programId: "program-1",
    exportedAt: "2026-03-25T12:20:00.000Z",
    diagnostics: {
      status: "ready",
      summary: "Ready for the planned Garmin/export handoff.",
      issueCount: 0,
      issues: [],
    },
    program: {
      title: "Manual race prep shell",
      weekCount: 1,
      assignmentCount: 0,
    },
    weeks: [],
    ...overrides,
  };
}

describe("ProgramBuilderHub", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("adds a scheduled workout and saves canonical program edits", async () => {
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const method = init?.method ?? "GET";
      const url = String(input);

      if (url === "/api/my-library/programs/program-1/export/garmin-ready" && method === "GET") {
        return {
          ok: true,
          json: async () => buildProgramExportPreview(),
        } as Response;
      }

      const body = JSON.parse(String(init?.body ?? "{}")) as {
        title: string;
        weeks: ProgramEditorRecord["weeks"];
      };

      return {
        ok: true,
        json: async () => ({
          ok: true,
          program: buildProgramRecord({
            title: body.title,
            weeks: body.weeks,
          }),
          summary: buildProgramSummary({
            title: body.title,
            assignmentCount: body.weeks[0]?.assignments.length ?? 0,
          }),
        }),
      } as Response;
    });

    render(<ProgramBuilderHub programLibrary={buildProgramLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("program-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("program-editor-save-state")).toHaveTextContent(
      "All program changes are saved to the canonical program."
    );
    expect(screen.getByTestId("program-builder-save")).toBeDisabled();

    fireEvent.change(screen.getByTestId("program-draft-title"), {
      target: { value: "Builder edited program" },
    });
    fireEvent.change(screen.getByTestId("program-day-picker-week-0-day-0"), {
      target: { value: "workout-1" },
    });
    fireEvent.click(screen.getByTestId("program-day-add-week-0-day-0"));

    expect(screen.getByRole("button", { name: "Remove" })).toBeVisible();
    expect(screen.getByTestId("program-editor-save-state")).toHaveTextContent(
      "Unsaved changes stay local until you save this program."
    );
    expect(screen.getByTestId("program-builder-save")).toBeEnabled();

    fireEvent.click(screen.getByTestId("program-builder-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/programs/program-1",
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Program changes saved to the canonical program.")).toBeVisible();
    });

    const patchCall = vi
      .mocked(fetch)
      .mock.calls.find(
        ([input, init]) =>
          String(input) === "/api/my-library/programs/program-1" && init?.method === "PATCH"
      );
    const fetchBody = JSON.parse(String(patchCall?.[1]?.body ?? "{}")) as {
      title: string;
      weeks: ProgramEditorRecord["weeks"];
    };

    expect(fetchBody.title).toBe("Builder edited program");
    expect(fetchBody.weeks[0]?.assignments).toHaveLength(1);
    expect(fetchBody.weeks[0]?.assignments[0]).toMatchObject({
      workoutId: "workout-1",
      dayIndex: 0,
      position: 0,
    });
    expect(screen.getByTestId("program-builder-save")).toBeDisabled();
  });

  it("shows canonical export preview, downloads json, and opens the program pdf print view", async () => {
    const openMock = vi.fn(() => ({ focus: vi.fn() }));
    const createObjectUrlMock = vi.fn(() => "blob:program-export");
    const revokeObjectUrlMock = vi.fn();
    const anchorClickMock = vi.fn();

    vi.stubGlobal("open", openMock);
    vi.stubGlobal("URL", {
      createObjectURL: createObjectUrlMock,
      revokeObjectURL: revokeObjectUrlMock,
    });
    HTMLAnchorElement.prototype.click = anchorClickMock;

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () =>
        buildProgramExportPreview({
          weeks: [
            {
              id: "week-1",
              label: "Week 1",
              assignmentCount: 1,
              days: [
                {
                  dayIndex: 0,
                  dayLabel: "Monday",
                  assignmentCount: 1,
                  assignments: [
                    {
                      id: "assignment-1",
                      workoutId: "workout-1",
                      dayIndex: 0,
                      dayLabel: "Monday",
                      position: 0,
                      mappingStatus: "ready",
                      reviewIssueIds: [],
                      workoutTitle: "Threshold builder workout",
                      workoutSummary: "2200m · ~45 min",
                      workoutEnvironmentLabel: "Pool",
                      workoutSessionTypeLabel: "Threshold / CSS",
                      workoutEffortLabel: "Moderate",
                      workout: null,
                    },
                  ],
                },
              ],
            },
          ],
        }),
    } as Response);

    render(<ProgramBuilderHub programLibrary={buildProgramLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("program-editor-garmin-export-preview")).toHaveTextContent(
        '"kind": "freeswimming_garmin_ready_program_v1"'
      );
    });

    expect(screen.getByTestId("program-editor-garmin-export-source")).toHaveAttribute(
      "data-export-state",
      "canonical"
    );
    expect(screen.getByTestId("program-editor-pdf-source")).toHaveAttribute(
      "data-pdf-state",
      "canonical"
    );

    fireEvent.click(screen.getByTestId("program-editor-garmin-export-download"));

    await waitFor(() => {
      expect(screen.getByTestId("program-editor-garmin-export-notice")).toHaveTextContent(
        "Downloaded freeswimming-manual-race-prep-shell-garmin-ready.json."
      );
    });

    expect(createObjectUrlMock).toHaveBeenCalled();
    expect(anchorClickMock).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("program-editor-pdf-open"));

    expect(openMock).toHaveBeenCalledWith(
      "/api/my-library/programs/program-1/export/pdf",
      "_blank"
    );
    expect(screen.getByTestId("program-editor-pdf-notice")).toHaveTextContent(
      "Opened print view for freeswimming-manual-race-prep-shell-print.pdf."
    );
  });
});
