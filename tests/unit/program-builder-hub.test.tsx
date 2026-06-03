import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
    previewSections: [
      {
        key: "warmup-0",
        title: "Warmup",
        category: "warmup",
        rows: [{ text: "400m freestyle easy" }],
      },
      {
        key: "main-1",
        title: "Main",
        category: "main",
        rows: [{ text: "6 x 100m threshold", secondaryText: "Rest 20 sec" }],
      },
      {
        key: "cooldown-2",
        title: "Cooldown",
        category: "cooldown",
        rows: [{ text: "200m choice easy" }],
      },
    ],
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

  it("renders route-level setup, load, missing-workout, and empty feedback with program semantics", () => {
    render(
      <ProgramBuilderHub
        programLibrary={buildProgramLibrary({
          schemaReady: false,
          loadError: "Could not load saved programs right now.",
          selectedProgram: null,
          missingWorkoutIds: ["missing-workout-1"],
          recentPrograms: [],
        })}
      />
    );

    expect(screen.getByTestId("program-builder-hub")).toHaveClass("min-w-0");
    expect(screen.queryByTestId("program-builder-overview-card")).not.toBeInTheDocument();

    const schemaWarning = screen.getByTestId("program-builder-schema-warning");
    expect(schemaWarning).toHaveAttribute("role", "status");
    expect(schemaWarning).toHaveAttribute("aria-live", "polite");
    expect(schemaWarning).toHaveAttribute("data-feedback-tone", "warning");
    expect(schemaWarning).toHaveTextContent("Program save is still syncing");

    const loadError = screen.getByTestId("program-builder-load-error");
    expect(loadError).toHaveAttribute("role", "alert");
    expect(loadError).toHaveAttribute("aria-live", "assertive");
    expect(loadError).toHaveAttribute("data-feedback-tone", "error");
    expect(loadError).toHaveTextContent("Could not load saved programs right now.");

    const missingWorkouts = screen.getByTestId("program-builder-missing-workouts-warning");
    expect(missingWorkouts).toHaveAttribute("role", "status");
    expect(missingWorkouts).toHaveAttribute("aria-live", "polite");
    expect(missingWorkouts).toHaveAttribute("data-feedback-tone", "warning");
    expect(missingWorkouts).toHaveTextContent(
      "One scheduled workout could not be loaded for this account."
    );

    const emptyState = screen.getByTestId("program-builder-empty-state");
    expect(emptyState).toHaveAttribute("data-feedback-tone", "empty");
    expect(emptyState).not.toHaveAttribute("role");
    expect(emptyState).not.toHaveAttribute("aria-live");
    expect(emptyState).toHaveTextContent("No saved program is open here.");
    const backLink = within(emptyState).getByRole("link", { name: "Back to My Library" });
    expect(backLink).toHaveAttribute("href", "/my-library");
    expect(backLink).toHaveClass("fs-cta-secondary", "rounded-[var(--fs-radius-control)]");
    expect(screen.queryByTestId("program-builder-empty-create-manual")).not.toBeInTheDocument();
  });

  it("keeps selected-missing program guidance as non-error warning feedback", () => {
    render(
      <ProgramBuilderHub
        programLibrary={buildProgramLibrary({
          selectedProgram: null,
          selectedProgramMissing: true,
          recentPrograms: [],
        })}
      />
    );

    const emptyState = screen.getByTestId("program-builder-empty-state");
    expect(emptyState).toHaveAttribute("role", "status");
    expect(emptyState).toHaveAttribute("aria-live", "polite");
    expect(emptyState).toHaveAttribute("data-feedback-tone", "warning");
    expect(emptyState).toHaveTextContent("That saved program could not be found.");
    expect(screen.getByTestId("program-builder-empty-create-manual")).toHaveClass(
      "fs-cta-primary",
      "rounded-[var(--fs-radius-control)]"
    );
  });

  it("adds a scheduled workout and saves program edits", async () => {
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
      "All changes are saved."
    );
    expect(screen.getByTestId("program-draft-title")).toHaveClass("ui-field");
    expect(screen.getByTestId("program-week-0")).toHaveClass("fs-library-card");
    expect(screen.getByTestId("program-day-picker-week-0-day-0")).toHaveClass(
      "ui-field",
      "appearance-none",
      "pr-12"
    );
    expect(screen.getByTestId("program-day-add-week-0-day-0")).toHaveClass(
      "fs-cta-secondary",
      "w-full"
    );
    expect(screen.getByTestId("program-editor-reset")).toHaveClass("fs-cta-secondary");
    expect(screen.getByTestId("program-builder-save")).toHaveClass("fs-cta-primary");
    expect(screen.getByTestId("program-builder-save")).toBeDisabled();

    fireEvent.change(screen.getByTestId("program-draft-title"), {
      target: { value: "Builder edited program" },
    });
    fireEvent.change(screen.getByTestId("program-day-picker-week-0-day-0"), {
      target: { value: "workout-1" },
    });
    fireEvent.click(screen.getByTestId("program-day-add-week-0-day-0"));

    const removeButton = screen.getByRole("button", { name: "Remove" });
    const assignmentCardTestId = removeButton
      .getAttribute("data-testid")
      ?.replace("program-assignment-remove", "program-assignment-card");
    expect(assignmentCardTestId).toBeTruthy();
    const assignmentCard = screen.getByTestId(assignmentCardTestId!);
    expect(assignmentCard).toHaveClass("fs-library-card");
    expect(within(assignmentCard).getByRole("combobox", { name: /move to day/i })).toHaveClass(
      "ui-field",
      "appearance-none",
      "pr-12"
    );
    expect(within(assignmentCard).getByRole("button", { name: "Move up" })).toHaveClass(
      "fs-cta-secondary",
      "w-full"
    );
    expect(within(assignmentCard).getByRole("button", { name: "Move down" })).toHaveClass(
      "fs-cta-secondary",
      "w-full"
    );
    expect(within(assignmentCard).getByRole("button", { name: "Remove" })).toHaveClass(
      "fs-cta-danger",
      "w-full"
    );
    expect(
      screen.getByLabelText("Scheduled workout step preview for Threshold builder workout")
    ).toBeVisible();
    expect(screen.getByText("Warmup")).toBeVisible();
    expect(screen.getByText("400m freestyle easy")).toBeVisible();
    expect(screen.getByText("6 x 100m threshold")).toBeVisible();
    expect(screen.getByText("Rest 20 sec")).toBeVisible();
    expect(screen.getByText("Cooldown")).toBeVisible();
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

    const successState = await screen.findByTestId("program-builder-action-success");
    expect(successState).toHaveAttribute("role", "status");
    expect(successState).toHaveAttribute("aria-live", "polite");
    expect(successState).toHaveAttribute("data-feedback-tone", "success");
    expect(successState).toHaveTextContent("Program saved.");

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

  it("announces program save failures without changing the save payload", async () => {
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const method = init?.method ?? "GET";
      const url = String(input);

      if (url === "/api/my-library/programs/program-1/export/garmin-ready" && method === "GET") {
        return {
          ok: true,
          json: async () => buildProgramExportPreview(),
        } as Response;
      }

      return {
        ok: false,
        json: async () => ({
          ok: false,
          error: "Could not save program right now.",
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

    fireEvent.change(screen.getByTestId("program-draft-title"), {
      target: { value: "Unsaved race prep shell" },
    });
    fireEvent.click(screen.getByTestId("program-builder-save"));

    const actionError = await screen.findByTestId("program-builder-action-error");
    expect(actionError).toHaveAttribute("role", "alert");
    expect(actionError).toHaveAttribute("aria-live", "assertive");
    expect(actionError).toHaveAttribute("data-feedback-tone", "error");
    expect(actionError).toHaveTextContent("Could not save program right now.");

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

    expect(fetchBody.title).toBe("Unsaved race prep shell");
    expect(fetchBody.weeks).toEqual(buildProgramRecord().weeks);
  });

  it("keeps scheduled cards useful when workout preview sections are missing", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => buildProgramExportPreview(),
    } as Response);

    render(
      <ProgramBuilderHub
        programLibrary={buildProgramLibrary({
          selectedProgram: buildProgramRecord({
            weeks: [
              {
                id: "week-1",
                label: "Week 1",
                assignments: [
                  {
                    id: "assignment-no-preview",
                    workoutId: "workout-1",
                    dayIndex: 0,
                    position: 0,
                  },
                ],
              },
            ],
          }),
          availableWorkouts: [buildWorkoutSummary({ previewSections: [] })],
        })}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("program-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    const assignmentCard = screen.getByTestId("program-assignment-card-assignment-no-preview");
    expect(within(assignmentCard).getByText("Threshold builder workout")).toBeVisible();
    expect(within(assignmentCard).getByText("2200m · ~45 min")).toBeVisible();
    expect(
      screen.queryByTestId("program-assignment-step-preview-assignment-no-preview")
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove" })).toBeVisible();
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

    expect(screen.queryByTestId("program-editor-garmin-export-preview")).not.toBeInTheDocument();
    const detailsToggle = screen.getByTestId("program-editor-garmin-export-details-toggle");
    expect(detailsToggle).toHaveTextContent("Show export details");
    expect(detailsToggle).toHaveAttribute("aria-expanded", "false");
    expect(detailsToggle).toHaveClass("fs-cta-secondary", "w-full");
    expect(screen.getByTestId("program-editor-garmin-export-download")).toHaveClass(
      "fs-cta-secondary",
      "w-full"
    );
    expect(screen.getByTestId("program-editor-pdf-open")).toHaveClass("fs-cta-secondary", "w-full");
    fireEvent.click(detailsToggle);
    expect(detailsToggle).toHaveTextContent("Hide export details");
    expect(detailsToggle).toHaveAttribute("aria-expanded", "true");

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
      const notice = screen.getByTestId("program-editor-garmin-export-notice");
      expect(notice).toHaveAttribute("role", "status");
      expect(notice).toHaveAttribute("aria-live", "polite");
      expect(notice).toHaveAttribute("data-feedback-tone", "success");
      expect(notice).toHaveTextContent("Export downloaded");
      expect(notice).toHaveTextContent(
        "Downloaded freeswimming-manual-race-prep-shell-garmin-ready.json."
      );
    });

    expect(screen.getByTestId("program-editor-garmin-export-download")).toHaveAttribute(
      "aria-describedby",
      screen.getByTestId("program-editor-garmin-export-notice").id
    );
    expect(createObjectUrlMock).toHaveBeenCalled();
    expect(anchorClickMock).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("program-editor-pdf-open"));

    expect(openMock).toHaveBeenCalledWith(
      "/api/my-library/programs/program-1/export/pdf",
      "_blank"
    );
    const pdfNotice = screen.getByTestId("program-editor-pdf-notice");
    expect(pdfNotice).toHaveAttribute("role", "status");
    expect(pdfNotice).toHaveAttribute("aria-live", "polite");
    expect(pdfNotice).toHaveAttribute("data-feedback-tone", "success");
    expect(pdfNotice).toHaveTextContent("Print view opened");
    expect(pdfNotice).toHaveTextContent(
      "Opened print view for freeswimming-manual-race-prep-shell-print.pdf."
    );
    expect(screen.getByTestId("program-editor-pdf-open")).toHaveAttribute(
      "aria-describedby",
      pdfNotice.id
    );
  });

  it("announces program export download and pdf popup failures accessibly", async () => {
    const openMock = vi.fn(() => null);
    vi.stubGlobal("open", openMock);

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => buildProgramExportPreview(),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          ok: false,
          error: "Could not download the program export right now.",
        }),
      } as Response);

    render(<ProgramBuilderHub programLibrary={buildProgramLibrary()} />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByTestId("program-editor-garmin-export-preview")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("program-editor-garmin-export-download"));

    await waitFor(() => {
      const exportError = screen.getByTestId("program-editor-garmin-export-error");
      expect(exportError).toHaveAttribute("role", "alert");
      expect(exportError).toHaveAttribute("aria-live", "assertive");
      expect(exportError).toHaveAttribute("data-feedback-tone", "error");
      expect(exportError).toHaveTextContent("Export failed");
      expect(exportError).toHaveTextContent("Could not download the program export right now.");
    });
    expect(screen.getByTestId("program-editor-garmin-export-download")).toHaveAttribute(
      "aria-describedby",
      screen.getByTestId("program-editor-garmin-export-error").id
    );

    fireEvent.click(screen.getByTestId("program-editor-pdf-open"));

    const pdfError = screen.getByTestId("program-editor-pdf-error");
    expect(pdfError).toHaveAttribute("role", "alert");
    expect(pdfError).toHaveAttribute("aria-live", "assertive");
    expect(pdfError).toHaveAttribute("data-feedback-tone", "error");
    expect(pdfError).toHaveTextContent("Print view blocked");
    expect(pdfError).toHaveTextContent(
      "Could not open the program PDF print view. Check whether pop-ups are blocked."
    );
  });

  it("retries the canonical export preview once after a transient session failure", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({
          ok: false,
          error: "Could not verify session right now.",
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => buildProgramExportPreview(),
      } as Response);

    render(<ProgramBuilderHub programLibrary={buildProgramLibrary()} />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    fireEvent.click(screen.getByTestId("program-editor-garmin-export-details-toggle"));
    await waitFor(() => {
      expect(screen.getByTestId("program-editor-garmin-export-preview")).toHaveTextContent(
        '"kind": "freeswimming_garmin_ready_program_v1"'
      );
    });

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "/api/my-library/programs/program-1/export/garmin-ready",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      })
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/my-library/programs/program-1/export/garmin-ready",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      })
    );
    expect(
      screen.queryByTestId("program-editor-garmin-export-preview-error")
    ).not.toBeInTheDocument();
  });
});
