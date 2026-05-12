import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DrylandBuilderHub from "@/components/my-library/dryland/DrylandBuilderHub";
import type { DrylandMicroBlockSnapshot, DrylandMicroPlanRecord } from "@/lib/dryland/micro-plans";
import type {
  DrylandLibrarySnapshot,
  DrylandSessionDraft,
  DrylandSessionRecord,
  DrylandSessionSummary,
} from "@/lib/dryland/shared";

const navigationState = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationState,
}));

function buildDraft(overrides?: Partial<DrylandSessionDraft>): DrylandSessionDraft {
  return {
    version: 1,
    sessionKind: "strength",
    title: "Strength session 2026-03-29",
    description: "Simple dryland test session.",
    focusText: null,
    startedAt: null,
    completedAt: null,
    actualDurationSeconds: null,
    exercises: [
      {
        id: "exercise-1",
        source: "bank",
        bankExerciseId: "strength-air-squat",
        title: "Air squat",
        summary: "Lower-body strength.",
        howTo: "Sit back and stand tall.",
        targetAreas: ["Quads", "Glutes"],
        accent: "blue",
        mediaType: "none",
        mediaUrl: null,
        mediaPosterUrl: null,
        mediaLabel: null,
        notes: "",
        sets: [
          {
            id: "set-1",
            reps: 12,
            holdSeconds: null,
            loadKg: null,
            restSeconds: 90,
            isCompleted: false,
            completedAt: null,
          },
        ],
      },
    ],
    ...overrides,
  };
}

function buildRecord(overrides?: Partial<DrylandSessionRecord>): DrylandSessionRecord {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    createdAt: "2026-03-29T10:00:00.000Z",
    updatedAt: "2026-03-29T10:00:00.000Z",
    sourceKind: "manual",
    status: "draft",
    draft: buildDraft(),
    ...overrides,
  };
}

function buildSummary(overrides?: Partial<DrylandSessionSummary>): DrylandSessionSummary {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Strength session 2026-03-29",
    sessionKind: "strength",
    status: "draft",
    updatedAt: "2026-03-29T10:00:00.000Z",
    completedAt: null,
    exerciseCount: 1,
    setCount: 1,
    actualDurationSeconds: null,
    ...overrides,
  };
}

function buildMicroPlan(overrides?: Partial<DrylandMicroPlanRecord>): DrylandMicroPlanRecord {
  const summary = buildSummary();
  const blocks: DrylandMicroBlockSnapshot[] = [
    {
      id: "unit-1",
      sourceDrylandSessionId: summary.id,
      sourceSessionTitle: summary.title,
      sourceSessionKind: summary.sessionKind,
      sourceSessionIndex: 0,
      sourceExerciseId: "exercise-1",
      sourceExerciseIndex: 0,
      sourceSetId: "set-1",
      setIndex: 0,
      title: "Air squat",
      summary: "Lower-body strength.",
      targetLabel: "12 reps",
      targetType: "reps",
      targetValue: 12,
      targetUnit: "reps",
      loadKg: null,
      restSeconds: null,
      coachCue: "Stand tall.",
      releaseMode: "available_now",
      releaseOffsetDays: null,
      releaseTime: "06:00",
      releasedAt: "1970-01-01T00:00:00.000Z",
      isArchived: false,
      status: "queued",
      completedAt: null,
      skippedAt: null,
    },
  ];

  return {
    id: "22222222-2222-4222-8222-222222222222",
    sourceDrylandSessionId: summary.id,
    sourceSessionTitle: summary.title,
    title: "Micro session: Strength session",
    sessionKind: summary.sessionKind,
    sourceSessionSnapshots: [
      {
        sourceDrylandSessionId: summary.id,
        sourceSessionTitle: summary.title,
        sourceSessionKind: summary.sessionKind,
        sourceSessionIndex: 0,
        releaseOffsetDays: null,
        releaseTime: "06:00",
        unitCount: 1,
        completedUnitCount: 0,
        skippedUnitCount: 0,
      },
    ],
    releaseMode: "available_now",
    releaseTime: "06:00",
    status: "active",
    timezone: "UTC",
    weekStartsAt: "2026-03-23T00:00:00.000Z",
    weekEndsAt: "2026-03-30T00:00:00.000Z",
    blocks,
    createdAt: "2026-03-29T10:00:00.000Z",
    updatedAt: "2026-03-29T10:00:00.000Z",
    progress: {
      totalBlockCount: 1,
      completedBlockCount: 0,
      skippedBlockCount: 0,
      remainingBlockCount: 1,
      progressPercent: 0,
    },
    ...overrides,
  };
}

function buildLibrary(overrides?: Partial<DrylandLibrarySnapshot>): DrylandLibrarySnapshot {
  return {
    schemaReady: true,
    microPlanSchemaReady: true,
    loadError: null,
    microPlanLoadError: null,
    selectedSession: buildRecord(),
    selectedSessionMissing: false,
    recentSessions: [buildSummary()],
    microPlan: null,
    ...overrides,
  };
}

describe("DrylandBuilderHub", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("loads a dryland session, lets the owner update it, and saves the canonical session", async () => {
    vi.mocked(fetch).mockImplementation(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as {
        draft: DrylandSessionDraft;
      };

      return {
        ok: true,
        json: async () => ({
          ok: true,
          session: buildRecord({
            status: body.draft.completedAt
              ? "completed"
              : body.draft.startedAt
                ? "in_progress"
                : "draft",
            draft: body.draft,
          }),
          summary: buildSummary({
            title: body.draft.title,
            status: body.draft.completedAt
              ? "completed"
              : body.draft.startedAt
                ? "in_progress"
                : "draft",
            actualDurationSeconds: body.draft.actualDurationSeconds,
          }),
        }),
      } as Response;
    });

    render(<DrylandBuilderHub drylandLibrary={buildLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("dryland-session-kind-locked")).toHaveTextContent("Strength session");
    expect(screen.queryByTestId("dryland-draft-kind")).not.toBeInTheDocument();
    expect(screen.getByTestId("dryland-mode-train")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("dryland-train-mode")).toBeInTheDocument();
    expect(screen.getByText("Workout player")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Execution progress" })).toHaveAttribute(
      "aria-valuenow",
      "0"
    );
    expect(screen.getByTestId("dryland-next-set-label")).toHaveTextContent("Air squat · Set 1");
    expect(screen.getByTestId("dryland-set-chip-0-0")).toHaveTextContent("Now");

    fireEvent.click(screen.getByTestId("dryland-complete-next-set"));

    await waitFor(() => {
      expect(screen.getByTestId("dryland-next-set-label")).toHaveTextContent("All sets complete");
    });
    expect(screen.getByRole("progressbar", { name: "Execution progress" })).toHaveAttribute(
      "aria-valuenow",
      "100"
    );

    fireEvent.click(screen.getByTestId("dryland-mode-build"));

    await waitFor(() => {
      expect(screen.getByTestId("dryland-build-mode")).toBeInTheDocument();
    });
    expect(screen.getByTestId("dryland-mode-build")).toHaveAttribute("aria-selected", "true");

    fireEvent.click(
      within(screen.getByTestId("dryland-simple-exercise-row-0")).getByRole("button", {
        name: "Edit sets",
      })
    );

    const exerciseDetails = screen.getByTestId("dryland-exercise-card-0");
    expect(exerciseDetails).toBeInTheDocument();
    expect(within(exerciseDetails).getByText("Air squat details")).toBeVisible();
    expect(within(exerciseDetails).getByText("Air squat notes")).toBeVisible();
    expect(within(exerciseDetails).getByText("Air squat sets")).toBeVisible();
    expect(screen.queryByText("Common mistake")).not.toBeInTheDocument();
    expect(screen.queryByText("Focus cue")).not.toBeInTheDocument();
    expect(screen.queryByText("Detail title")).not.toBeInTheDocument();
    expect(screen.queryByText("Summary")).not.toBeInTheDocument();
    expect(screen.queryByText("How-to")).not.toBeInTheDocument();
    expect(screen.queryByText("Guidance")).not.toBeInTheDocument();
    expect(screen.queryByText("Target areas")).not.toBeInTheDocument();
    expect(screen.getByText("Session details")).toBeVisible();
    expect(screen.queryByTestId("dryland-draft-title")).not.toBeInTheDocument();
    expect(screen.queryByText("Timing not set")).not.toBeInTheDocument();
    expect(screen.queryByText("Timing")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("dryland-session-details-toggle"));
    expect(screen.getByTestId("dryland-session-details-panel")).toBeVisible();
    expect(screen.queryByTestId("dryland-draft-start-timer")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dryland-draft-actual-duration")).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId("dryland-draft-title"), {
      target: { value: "Updated dryland session" },
    });
    fireEvent.click(screen.getByTestId("dryland-add-custom-exercise"));

    expect(screen.getByTestId("dryland-builder-save")).toHaveTextContent("Save");

    fireEvent.click(screen.getByTestId("dryland-builder-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/dryland/11111111-1111-4111-8111-111111111111",
        expect.objectContaining<Record<string, unknown>>({
          method: "PATCH",
          body: expect.stringContaining('"title":"Updated dryland session"'),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Dryland session changes saved.")).toBeVisible();
    });
  });

  it("warns when a saved session feeds the active micro session and can update current queued units", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        plan: buildMicroPlan({
          blocks: buildMicroPlan().blocks.map((block) => ({
            ...block,
            targetLabel: "14 reps",
            targetValue: 14,
          })),
        }),
      }),
    } as Response);

    render(
      <DrylandBuilderHub
        drylandLibrary={buildLibrary({
          microPlan: buildMicroPlan(),
        })}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("dryland-source-impact-warning")).toHaveTextContent(
      "Saving this Dryland Session applies to future Micro Sessions by default"
    );
    expect(screen.getByText("Use from next micro session")).toBeVisible();

    fireEvent.click(screen.getByTestId("dryland-update-current-micro-session"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/dryland/micro-plans/22222222-2222-4222-8222-222222222222",
        expect.objectContaining<Record<string, unknown>>({
          method: "PATCH",
          body: expect.stringContaining(
            '"sourceDrylandSessionIds":["11111111-1111-4111-8111-111111111111"]'
          ),
        })
      );
    });
    expect(
      await screen.findByText(
        "Current micro session updated. Completed and skipped units were preserved."
      )
    ).toBeVisible();
  });

  it("opens custom-only drafts in the simple build flow and saves row targets", async () => {
    vi.mocked(fetch).mockImplementation(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as {
        draft: DrylandSessionDraft;
      };

      return {
        ok: true,
        json: async () => ({
          ok: true,
          session: buildRecord({
            draft: body.draft,
          }),
          summary: buildSummary({
            title: body.draft.title,
            exerciseCount: body.draft.exercises.length,
            setCount: body.draft.exercises.reduce(
              (total, exercise) => total + exercise.sets.length,
              0
            ),
          }),
        }),
      } as Response;
    });

    const baseDraft = buildDraft();
    const customDraft = buildDraft({
      exercises: [
        {
          ...baseDraft.exercises[0],
          source: "custom",
          bankExerciseId: null,
          title: "Custom strength exercise",
          summary: "Owner-authored dryland exercise.",
          targetAreas: [],
          sets: [
            {
              id: "set-1",
              reps: 8,
              holdSeconds: null,
              loadKg: null,
              restSeconds: 60,
              isCompleted: false,
              completedAt: null,
            },
          ],
        },
      ],
    });

    render(
      <DrylandBuilderHub
        drylandLibrary={buildLibrary({
          selectedSession: buildRecord({ draft: customDraft }),
          recentSessions: [buildSummary({ setCount: 1 })],
        })}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByTestId("dryland-mode-build")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("dryland-manual-exercises")).toBeVisible();
    expect(screen.getByText("Quick session")).toBeVisible();
    expect(screen.getByText("Manually enter the exercises and their details.")).toBeVisible();
    expect(screen.queryByText("Focus cue")).not.toBeInTheDocument();
    expect(screen.queryByText("Advanced: add from exercise bank")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dryland-advanced-bank")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dryland-manual-exercise-notes-0")).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId("dryland-manual-exercise-name-0"), {
      target: { value: "Single-leg squat" },
    });
    fireEvent.change(screen.getByTestId("dryland-manual-exercise-set-count-0"), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByTestId("dryland-manual-exercise-target-0"), {
      target: { value: "6" },
    });
    fireEvent.change(screen.getByTestId("dryland-manual-exercise-rest-0"), {
      target: { value: "75" },
    });
    fireEvent.change(screen.getByTestId("dryland-manual-exercise-load-0"), {
      target: { value: "12.5" },
    });
    fireEvent.click(
      within(screen.getByTestId("dryland-simple-exercise-row-0")).getByRole("button", {
        name: "Edit sets",
      })
    );
    fireEvent.change(screen.getByTestId("dryland-manual-exercise-notes-0"), {
      target: { value: "Slow down." },
    });
    fireEvent.change(screen.getByTestId("dryland-set-target-0-1"), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByTestId("dryland-make-sets-equal-0"));

    fireEvent.click(screen.getByTestId("dryland-builder-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    const saveBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body ?? "{}")) as {
      draft: DrylandSessionDraft;
    };
    const savedExercise = saveBody.draft.exercises[0];

    expect(savedExercise?.source).toBe("custom");
    expect(savedExercise?.bankExerciseId).toBeNull();
    expect(savedExercise?.title).toBe("Single-leg squat");
    expect(savedExercise?.notes).toBe("Slow down.");
    expect(savedExercise?.sets).toHaveLength(4);
    expect(
      savedExercise?.sets.every(
        (set) => set.reps === 6 && set.loadKg === 12.5 && set.restSeconds === 75
      )
    ).toBe(true);
  });

  it("supports time targets for strength quick-session rows and appends rows from load Enter", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        session: buildRecord(),
        summary: buildSummary({ setCount: 6 }),
      }),
    } as Response);

    const baseDraft = buildDraft();
    const customDraft = buildDraft({
      exercises: [
        {
          ...baseDraft.exercises[0],
          source: "custom",
          bankExerciseId: null,
          title: "Custom strength exercise",
          sets: [
            {
              id: "set-1",
              reps: 8,
              holdSeconds: null,
              loadKg: null,
              restSeconds: 60,
              isCompleted: false,
              completedAt: null,
            },
          ],
        },
      ],
    });

    render(
      <DrylandBuilderHub
        drylandLibrary={buildLibrary({
          selectedSession: buildRecord({ draft: customDraft }),
          recentSessions: [buildSummary({ setCount: 1 })],
        })}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    fireEvent.change(screen.getByTestId("dryland-manual-exercise-name-0"), {
      target: { value: "Plank" },
    });

    const targetUnitButton = screen.getByTestId("dryland-manual-exercise-target-unit-0");
    expect(targetUnitButton).toHaveTextContent("sec");
    expect(targetUnitButton).toHaveAccessibleName("Switch Plank target to reps");
    expect(screen.getByTestId("dryland-manual-exercise-target-0")).toHaveValue("45");

    fireEvent.click(targetUnitButton);
    expect(screen.getByTestId("dryland-manual-exercise-target-unit-0")).toHaveTextContent("reps");
    expect(screen.getByTestId("dryland-manual-exercise-target-0")).toHaveValue("8");

    fireEvent.click(screen.getByTestId("dryland-manual-exercise-target-unit-0"));
    expect(screen.getByTestId("dryland-manual-exercise-target-unit-0")).toHaveTextContent("sec");
    expect(screen.getByTestId("dryland-manual-exercise-target-0")).toHaveValue("45");

    fireEvent.change(screen.getByTestId("dryland-manual-exercise-target-0"), {
      target: { value: "60" },
    });
    fireEvent.keyDown(screen.getByTestId("dryland-manual-exercise-load-0"), {
      key: "Enter",
      code: "Enter",
    });

    expect(screen.getByTestId("dryland-simple-exercise-row-1")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("dryland-manual-exercise-name-1")).toHaveFocus();
    });

    fireEvent.click(screen.getByTestId("dryland-builder-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    const saveBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body ?? "{}")) as {
      draft: DrylandSessionDraft;
    };
    const savedSet = saveBody.draft.exercises[0]?.sets[0];

    expect(savedSet).toMatchObject({
      reps: null,
      holdSeconds: 60,
      restSeconds: 60,
    });
  });

  it("restores unsaved dryland edits from browser storage until save clears them", async () => {
    const savedSession = buildRecord();
    const localDraft = buildDraft({
      title: "Browser draft session",
      exercises: [
        {
          ...buildDraft().exercises[0]!,
          title: "Plank",
          sets: [
            {
              id: "set-1",
              reps: null,
              holdSeconds: 45,
              loadKg: null,
              restSeconds: 60,
              isCompleted: false,
              completedAt: null,
            },
          ],
        },
      ],
    });
    const localDraftKey = `freeswimming:dryland:draft:${savedSession.id}:v1`;

    window.localStorage.setItem(
      localDraftKey,
      JSON.stringify({
        savedUpdatedAt: savedSession.updatedAt,
        draft: localDraft,
      })
    );

    vi.mocked(fetch).mockImplementation(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as {
        draft: DrylandSessionDraft;
      };

      return {
        ok: true,
        json: async () => ({
          ok: true,
          session: buildRecord({
            updatedAt: "2026-03-29T10:05:00.000Z",
            draft: body.draft,
          }),
          summary: buildSummary({
            title: body.draft.title,
          }),
        }),
      } as Response;
    });

    render(
      <DrylandBuilderHub
        drylandLibrary={buildLibrary({
          selectedSession: savedSession,
          recentSessions: [buildSummary()],
        })}
      />
    );

    expect(await screen.findByRole("heading", { name: "Browser draft session" })).toBeVisible();

    fireEvent.click(screen.getByTestId("dryland-builder-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    expect(window.localStorage.getItem(localDraftKey)).toBeNull();
  });

  it("lets numeric simple-row fields be cleared before replacement typing", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        session: buildRecord(),
        summary: buildSummary({ setCount: 6 }),
      }),
    } as Response);

    const baseDraft = buildDraft();
    const customDraft = buildDraft({
      exercises: [
        {
          ...baseDraft.exercises[0],
          source: "custom",
          bankExerciseId: null,
          title: "Custom strength exercise",
          sets: [
            {
              id: "set-1",
              reps: 8,
              holdSeconds: null,
              loadKg: null,
              restSeconds: 60,
              isCompleted: false,
              completedAt: null,
            },
            {
              id: "set-2",
              reps: 8,
              holdSeconds: null,
              loadKg: null,
              restSeconds: 60,
              isCompleted: false,
              completedAt: null,
            },
          ],
        },
      ],
    });

    render(
      <DrylandBuilderHub
        drylandLibrary={buildLibrary({
          selectedSession: buildRecord({ draft: customDraft }),
          recentSessions: [buildSummary({ setCount: 2 })],
        })}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    const setCountInput = screen.getByTestId("dryland-manual-exercise-set-count-0");
    fireEvent.change(setCountInput, { target: { value: "" } });
    expect(setCountInput).toHaveValue("");
    expect(screen.getByText("Exercise 1 needs 1-20 sets.")).toBeVisible();

    fireEvent.change(setCountInput, { target: { value: "6" } });
    expect(setCountInput).toHaveValue("6");
    expect(screen.queryByText("Exercise 1 needs 1-20 sets.")).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId("dryland-manual-exercise-target-0"), {
      target: { value: "" },
    });
    expect(screen.getByTestId("dryland-manual-exercise-target-0")).toHaveValue("");
    expect(screen.getByText("Exercise 1 needs reps.")).toBeVisible();

    fireEvent.change(screen.getByTestId("dryland-manual-exercise-target-0"), {
      target: { value: "6" },
    });
    fireEvent.click(screen.getByTestId("dryland-builder-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    const saveBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body ?? "{}")) as {
      draft: DrylandSessionDraft;
    };

    expect(saveBody.draft.exercises[0]?.sets).toHaveLength(6);
    expect(saveBody.draft.exercises[0]?.sets.every((set) => set.reps === 6)).toBe(true);
  });

  it("browses and deletes a dryland session from the list view", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        deletedSessionId: "11111111-1111-4111-8111-111111111111",
      }),
    } as Response);

    render(
      <DrylandBuilderHub drylandLibrary={buildLibrary({ selectedSession: null })} browseOnly />
    );

    await waitFor(() => {
      expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByRole("link", { name: "Edit" })).toBeVisible();
    fireEvent.click(
      screen.getByTestId("dryland-delete-session-11111111-1111-4111-8111-111111111111")
    );
    fireEvent.click(
      screen.getByTestId("dryland-confirm-delete-session-11111111-1111-4111-8111-111111111111")
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/dryland/11111111-1111-4111-8111-111111111111",
        expect.objectContaining<Record<string, unknown>>({
          method: "DELETE",
        })
      );
    });
  });

  it("hides the normal saved-session list while choosing micro plan sources", async () => {
    render(
      <DrylandBuilderHub drylandLibrary={buildLibrary({ selectedSession: null })} browseOnly />
    );

    await waitFor(() => {
      expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByRole("link", { name: "Open" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Edit" })).toBeVisible();
    expect(
      screen.getByTestId("dryland-delete-session-11111111-1111-4111-8111-111111111111")
    ).toBeVisible();

    fireEvent.click(screen.getByTestId("dryland-micro-start-create"));

    expect(screen.getByText("Choose source sessions")).toBeVisible();
    expect(screen.queryByTestId("dryland-source-selection-active-note")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Open" })).toBeNull();
    expect(
      screen.queryByTestId("dryland-delete-session-11111111-1111-4111-8111-111111111111")
    ).not.toBeInTheDocument();
  });

  it("hides the normal saved-session list when direct-opening the micro plan editor", async () => {
    render(
      <DrylandBuilderHub
        drylandLibrary={buildLibrary({
          selectedSession: null,
          microPlan: buildMicroPlan(),
        })}
        browseOnly
        initialMicroPlanEditorOpen
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.getByText("Choose source sessions")).toBeVisible();
    expect(screen.queryByTestId("dryland-source-selection-active-note")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Open" })).toBeNull();
    expect(
      screen.queryByTestId("dryland-delete-session-11111111-1111-4111-8111-111111111111")
    ).not.toBeInTheDocument();
  });

  it("keeps destructive delete actions in the dryland list instead of the focused editor", async () => {
    render(<DrylandBuilderHub drylandLibrary={buildLibrary()} />);

    await waitFor(() => {
      expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute(
        "data-client-ready",
        "true"
      );
    });

    expect(screen.queryByTestId("dryland-session-more")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dryland-delete-current-session")).not.toBeInTheDocument();
  });
});
