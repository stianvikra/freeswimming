import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DrylandMicroPlanPanel from "@/components/my-library/dryland/DrylandMicroPlanPanel";
import type { DrylandMicroBlockSnapshot, DrylandMicroPlanRecord } from "@/lib/dryland/micro-plans";
import type { DrylandSessionSummary } from "@/lib/dryland/shared";

const navigationState = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationState,
}));

function buildSummary(overrides?: Partial<DrylandSessionSummary>): DrylandSessionSummary {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Weekly strength",
    sessionKind: "strength",
    status: "draft",
    updatedAt: "2026-05-08T08:00:00.000Z",
    completedAt: null,
    exerciseCount: 2,
    setCount: 3,
    actualDurationSeconds: null,
    ...overrides,
  };
}

function buildPlan(overrides?: Partial<DrylandMicroPlanRecord>): DrylandMicroPlanRecord {
  const blocks: DrylandMicroBlockSnapshot[] = [
    {
      id: "unit-11111111-1111-4111-8111-111111111111-exercise-1-set-1-1",
      sourceDrylandSessionId: "11111111-1111-4111-8111-111111111111",
      sourceSessionTitle: "Weekly strength",
      sourceSessionKind: "strength",
      sourceSessionIndex: 0,
      sourceExerciseId: "exercise-1",
      sourceExerciseIndex: 0,
      sourceSetId: "set-1",
      setIndex: 0,
      title: "Single-leg squat",
      summary: "Controlled lower-body strength.",
      targetLabel: "6 reps · 12.5kg · 1 min 15 sec rest",
      targetType: "reps",
      targetValue: 6,
      targetUnit: "reps",
      loadKg: 12.5,
      restSeconds: 75,
      coachCue: "Slow down.",
      releaseMode: "available_now",
      releaseOffsetDays: null,
      releaseTime: "06:00",
      releasedAt: "1970-01-01T00:00:00.000Z",
      isArchived: false,
      status: "queued",
      completedAt: null,
      skippedAt: null,
    },
    {
      id: "unit-11111111-1111-4111-8111-111111111111-exercise-2-set-1-1",
      sourceDrylandSessionId: "11111111-1111-4111-8111-111111111111",
      sourceSessionTitle: "Weekly strength",
      sourceSessionKind: "strength",
      sourceSessionIndex: 0,
      sourceExerciseId: "exercise-2",
      sourceExerciseIndex: 1,
      sourceSetId: "set-1",
      setIndex: 0,
      title: "Dead bug",
      summary: "Core",
      targetLabel: "8 reps · 45 sec rest",
      targetType: "reps",
      targetValue: 8,
      targetUnit: "reps",
      loadKg: null,
      restSeconds: 45,
      coachCue: "Brace first.",
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
    sourceDrylandSessionId: "11111111-1111-4111-8111-111111111111",
    sourceSessionTitle: "Weekly strength",
    title: "MS: Weekly strength",
    sessionKind: "strength",
    sourceSessionSnapshots: [
      {
        sourceDrylandSessionId: "11111111-1111-4111-8111-111111111111",
        sourceSessionTitle: "Weekly strength",
        sourceSessionKind: "strength",
        sourceSessionIndex: 0,
        releaseOffsetDays: null,
        releaseTime: "06:00",
        unitCount: 2,
        completedUnitCount: 0,
        skippedUnitCount: 0,
      },
    ],
    releaseMode: "available_now",
    releaseTime: "06:00",
    status: "active",
    timezone: "UTC",
    weekStartsAt: "2026-05-11T00:00:00.000Z",
    weekEndsAt: "2026-05-18T00:00:00.000Z",
    blocks,
    createdAt: "2026-05-08T08:00:00.000Z",
    updatedAt: "2026-05-08T08:00:00.000Z",
    progress: {
      totalBlockCount: 2,
      completedBlockCount: 0,
      skippedBlockCount: 0,
      remainingBlockCount: 2,
      progressPercent: 0,
    },
    ...overrides,
  };
}

function getBubbleBackgroundClass(element: HTMLElement) {
  return Array.from(element.classList).find((className) => /^bg-\w+-50$/.test(className));
}

describe("DrylandMicroPlanPanel", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(new Date("2026-05-12T10:00:00.000Z").getTime());
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("creates a weekly micro session from selected saved dryland sessions", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        plan: buildPlan(),
      }),
    } as Response);

    render(
      <DrylandMicroPlanPanel
        initialPlan={null}
        sessions={[buildSummary()]}
        schemaReady
        loadError={null}
      />
    );

    fireEvent.click(screen.getByTestId("dryland-micro-start-create"));
    fireEvent.click(
      screen.getByTestId("dryland-micro-select-11111111-1111-4111-8111-111111111111")
    );
    fireEvent.click(screen.getByTestId("dryland-micro-create"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/dryland/micro-plans",
        expect.objectContaining<Record<string, unknown>>({
          method: "POST",
          body: expect.stringContaining(
            '"sourceDrylandSessionIds":["11111111-1111-4111-8111-111111111111"]'
          ),
        })
      );
    });

    expect(await screen.findByText("Micro session created.")).toBeVisible();
    const success = screen.getByTestId("dryland-micro-action-success");
    expect(success).toHaveAttribute("role", "status");
    expect(success).toHaveAttribute("aria-live", "polite");
    expect(success).toHaveAttribute("data-feedback-tone", "success");
    expect(screen.getByRole("progressbar", { name: "Progress" })).toHaveAttribute(
      "aria-valuenow",
      "0"
    );
    expect(screen.getByTestId("dryland-micro-unit-group-0")).toHaveTextContent("Single-leg squat");
  });

  it("shows start choices instead of sync warning when the micro schema is ready", () => {
    render(
      <DrylandMicroPlanPanel
        initialPlan={null}
        sessions={[buildSummary()]}
        schemaReady
        loadError={null}
      />
    );

    expect(screen.queryByText(/Micro Sessions are still syncing/)).not.toBeInTheDocument();
    const emptyState = screen.getByTestId("dryland-micro-empty");
    expect(emptyState).toHaveAttribute("data-feedback-tone", "empty");
    expect(emptyState).not.toHaveAttribute("role");
    expect(emptyState).not.toHaveAttribute("aria-live");
    expect(screen.getByTestId("dryland-micro-start-create")).toBeVisible();
    expect(
      screen.queryByTestId("dryland-micro-select-11111111-1111-4111-8111-111111111111")
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("dryland-micro-start-create"));
    expect(
      screen.getByTestId("dryland-micro-select-11111111-1111-4111-8111-111111111111")
    ).toBeVisible();
    expect(screen.getByText("Choose source sessions")).toBeVisible();
  });

  it("marks a micro block complete and updates the percent", async () => {
    const completedPlan = buildPlan({
      status: "completed",
      blocks: buildPlan().blocks.map((block) => ({
        ...block,
        status: "completed",
        completedAt: "2026-05-08T09:00:00.000Z",
      })),
      progress: {
        totalBlockCount: 2,
        completedBlockCount: 2,
        skippedBlockCount: 0,
        remainingBlockCount: 0,
        progressPercent: 100,
      },
    });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        plan: completedPlan,
      }),
    } as Response);

    render(
      <DrylandMicroPlanPanel
        initialPlan={buildPlan()}
        sessions={[buildSummary()]}
        schemaReady
        loadError={null}
      />
    );

    fireEvent.click(screen.getByTestId("dryland-micro-complete-0"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/dryland/micro-plans/22222222-2222-4222-8222-222222222222",
        expect.objectContaining<Record<string, unknown>>({
          method: "PATCH",
          body: expect.stringContaining('"blockStatus":"completed"'),
        })
      );
    });

    expect(await screen.findByText("All micro units are complete for this week.")).toBeVisible();
    expect(screen.getByRole("progressbar", { name: "Progress" })).toHaveAttribute(
      "aria-valuenow",
      "100"
    );
    expect(screen.getByTestId("dryland-micro-collapsed-state")).toHaveTextContent("Week complete");
    expect(screen.getByTestId("dryland-micro-clear-open")).toBeVisible();
  });

  it("clears an active micro session without deleting saved dryland sessions", async () => {
    const onPlanChange = vi.fn();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        plan: buildPlan({ status: "completed" }),
      }),
    } as Response);

    render(
      <DrylandMicroPlanPanel
        initialPlan={buildPlan()}
        sessions={[buildSummary()]}
        schemaReady
        loadError={null}
        onPlanChange={onPlanChange}
      />
    );

    fireEvent.click(screen.getByTestId("dryland-micro-clear-open"));
    expect(screen.getByTestId("dryland-micro-clear-confirm")).toHaveTextContent(
      "Only the active micro session is cleared."
    );
    fireEvent.click(screen.getByTestId("dryland-micro-clear-confirm-action"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/dryland/micro-plans/22222222-2222-4222-8222-222222222222",
        expect.objectContaining<Record<string, unknown>>({
          method: "PATCH",
          body: expect.stringContaining('"clearPlan":true'),
        })
      );
    });

    expect(await screen.findByText("Micro session cleared.")).toBeVisible();
    expect(screen.getByText("No active micro session")).toBeVisible();
    expect(onPlanChange).toHaveBeenLastCalledWith(null);
  });

  it("edits a created micro session without changing the saved dryland session", async () => {
    const secondSession = buildSummary({
      id: "33333333-3333-4333-8333-333333333333",
      title: "Mobility reset",
      sessionKind: "stretching",
      exerciseCount: 1,
      setCount: 2,
    });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        plan: buildPlan({
          sourceSessionSnapshots: [
            ...buildPlan().sourceSessionSnapshots,
            {
              sourceDrylandSessionId: "33333333-3333-4333-8333-333333333333",
              sourceSessionTitle: "Mobility reset",
              sourceSessionKind: "stretching",
              sourceSessionIndex: 1,
              releaseOffsetDays: 2,
              releaseTime: "06:00",
              unitCount: 2,
              completedUnitCount: 0,
              skippedUnitCount: 0,
            },
          ],
          releaseMode: "weekday",
        }),
      }),
    } as Response);

    render(
      <DrylandMicroPlanPanel
        initialPlan={buildPlan()}
        sessions={[buildSummary(), secondSession]}
        schemaReady
        loadError={null}
      />
    );

    fireEvent.click(screen.getByTestId("dryland-micro-edit-plan"));
    expect(screen.getByText("Choose source sessions")).toBeVisible();
    expect(screen.queryByText("Available units")).not.toBeInTheDocument();
    expect(screen.queryByTestId("dryland-micro-unit-group-0")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Skip today" })).toBeNull();
    expect(screen.getByTestId("dryland-micro-save-edit")).toHaveTextContent("Update micro session");
    expect(screen.queryByText(/exercise[s]? · .*set unit/)).toBeNull();
    expect(
      screen.getByTestId("dryland-micro-select-11111111-1111-4111-8111-111111111111").closest("div")
    ).toHaveClass("min-h-12", "grid-cols-[auto_minmax(0,1fr)]");
    expect(screen.queryByText("STRENGTH SESSION")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Edit" })).toHaveLength(2);

    fireEvent.click(
      screen.getByTestId("dryland-micro-select-33333333-3333-4333-8333-333333333333")
    );
    fireEvent.click(screen.getByRole("button", { name: "Weekday release" }));
    fireEvent.click(screen.getByTestId("dryland-micro-save-edit"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/dryland/micro-plans/22222222-2222-4222-8222-222222222222",
        expect.objectContaining<Record<string, unknown>>({
          method: "PATCH",
          body: expect.stringContaining(
            '"sourceDrylandSessionIds":["11111111-1111-4111-8111-111111111111","33333333-3333-4333-8333-333333333333"]'
          ),
        })
      );
    });
    expect(await screen.findByText("Micro session updated.")).toBeVisible();
  });

  it("groups ordered execution units by exercise without source-session provenance", () => {
    const basePlan = buildPlan();
    const blocks: DrylandMicroBlockSnapshot[] = Array.from({ length: 3 }, (_, index) => ({
      ...basePlan.blocks[0]!,
      id: `unit-push-ups-set-${index + 1}`,
      sourceExerciseId: "push-ups",
      sourceSetId: `push-up-set-${index + 1}`,
      setIndex: index,
      title: "Push ups",
      summary: "Chest and core",
      targetLabel: "12 reps · 30 sec rest",
      targetValue: 12,
      loadKg: null,
      restSeconds: 30,
    }));

    render(
      <DrylandMicroPlanPanel
        initialPlan={buildPlan({
          sourceSessionSnapshots: [
            {
              ...basePlan.sourceSessionSnapshots[0]!,
              unitCount: 3,
            },
          ],
          blocks,
          progress: {
            totalBlockCount: 3,
            completedBlockCount: 0,
            skippedBlockCount: 0,
            remainingBlockCount: 3,
            progressPercent: 0,
          },
        })}
        sessions={[buildSummary({ setCount: 3 })]}
        schemaReady
        loadError={null}
      />
    );

    expect(screen.getByText("Weekly micro plan")).toBeVisible();
    expect(
      screen.getByText("Split dryland sessions into manageable micro sessions.")
    ).toBeVisible();
    expect(screen.queryByText("Ordered and bubbles execution")).toBeNull();

    const group = screen.getByTestId("dryland-micro-unit-group-0");
    expect(within(group).getByText("Push ups")).toBeVisible();
    expect(within(group).getByText("3 sets · 12 reps · Rest 30 sec")).toBeVisible();
    expect(within(group).queryByText(/Weekly strength/)).toBeNull();
    expect(within(group).getByRole("button", { name: "Complete Set 1 · 12 reps" })).toBeVisible();
    expect(within(group).getByRole("button", { name: "Complete Set 2 · 12 reps" })).toBeVisible();
    expect(within(group).getByRole("button", { name: "Complete Set 3 · 12 reps" })).toBeVisible();
    expect(within(group).queryByRole("button", { name: "Skip today" })).toBeNull();
  });

  it("groups completed history without redundant unit count", () => {
    const basePlan = buildPlan();
    const blocks: DrylandMicroBlockSnapshot[] = [
      ...Array.from({ length: 3 }, (_, index) => ({
        ...basePlan.blocks[0]!,
        id: `completed-push-ups-set-${index + 1}`,
        sourceExerciseId: "push-ups",
        sourceSetId: `push-up-set-${index + 1}`,
        setIndex: index,
        title: "Push ups",
        summary: "Chest and core",
        targetLabel: "5 reps · 30 sec rest",
        targetValue: 5,
        loadKg: null,
        restSeconds: 30,
        status: "completed" as const,
        completedAt: `2026-05-11T10:0${index}:00.000Z`,
      })),
      basePlan.blocks[1]!,
    ];

    render(
      <DrylandMicroPlanPanel
        initialPlan={buildPlan({
          blocks,
          progress: {
            totalBlockCount: 4,
            completedBlockCount: 3,
            skippedBlockCount: 0,
            remainingBlockCount: 1,
            progressPercent: 75,
          },
        })}
        sessions={[buildSummary({ setCount: 3 })]}
        schemaReady
        loadError={null}
      />
    );

    expect(screen.getByText("Completed and skipped")).toBeVisible();
    expect(screen.getByText("Reps: 5 + 5 + 5")).toBeVisible();
    expect(screen.queryByText("3 units")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Completed Push ups. Undo latest completion" })
    ).toBeVisible();
  });

  it("keeps completed duration history compact", () => {
    const basePlan = buildPlan();
    const blocks: DrylandMicroBlockSnapshot[] = [
      ...[0, 1].map((index) => ({
        ...basePlan.blocks[0]!,
        id: `completed-wall-sit-set-${index + 1}`,
        sourceExerciseId: "wall-sit",
        sourceSetId: `wall-sit-set-${index + 1}`,
        setIndex: index,
        title: "Wall Sit",
        targetLabel: "30 sec · 45 sec rest",
        targetType: "duration" as const,
        targetValue: 30,
        targetUnit: "sec" as const,
        loadKg: null,
        restSeconds: 45,
        status: "completed" as const,
        completedAt: `2026-05-11T10:1${index}:00.000Z`,
      })),
      basePlan.blocks[1]!,
    ];

    render(
      <DrylandMicroPlanPanel
        initialPlan={buildPlan({
          blocks,
          progress: {
            totalBlockCount: 3,
            completedBlockCount: 2,
            skippedBlockCount: 0,
            remainingBlockCount: 1,
            progressPercent: 67,
          },
        })}
        sessions={[buildSummary({ setCount: 2 })]}
        schemaReady
        loadError={null}
      />
    );

    expect(screen.getByText("Time: 30 + 30 sec")).toBeVisible();
  });

  it("renders bubbles mode as a direct task surface with armed bubble confirmation", () => {
    render(
      <DrylandMicroPlanPanel
        initialPlan={buildPlan()}
        sessions={[buildSummary()]}
        schemaReady
        loadError={null}
      />
    );

    fireEvent.click(screen.getByTestId("dryland-micro-mode-bubbles"));

    expect(screen.getByTestId("dryland-micro-bubble-board")).toBeVisible();
    expect(screen.getByTestId("dryland-micro-bubble-0")).toHaveAccessibleName(
      "Complete Single-leg squat, 6 reps"
    );
    expect(screen.queryByTestId("dryland-micro-bubble-detail")).not.toBeInTheDocument();
    expect(screen.queryByText("Complete?")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("dryland-micro-bubble-1"));

    expect(
      within(screen.getByTestId("dryland-micro-bubble-1")).getByText("Complete?")
    ).toBeVisible();
    expect(screen.getByTestId("dryland-micro-bubble-1")).toHaveAttribute("aria-pressed", "true");
    expect(
      within(screen.getByTestId("dryland-micro-bubble-0")).queryByText("Complete?")
    ).toBeNull();

    fireEvent.keyDown(screen.getByTestId("dryland-micro-bubble-1"), { key: "Escape" });

    expect(screen.queryByText("Complete?")).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByTestId("dryland-micro-bubble-0"), { key: "Enter" });
    expect(
      within(screen.getByTestId("dryland-micro-bubble-0")).getByText("Complete?")
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Skip today" })).toBeNull();
  });

  it("can default Home mobile entry to bubbles mode", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query === "(max-width: 767px)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );

    render(
      <DrylandMicroPlanPanel
        initialPlan={buildPlan()}
        sessions={[buildSummary()]}
        schemaReady
        loadError={null}
        preferMobileBubbles
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("dryland-micro-mode-bubbles")).toHaveClass("bg-blue-600");
    });
    expect(screen.getByTestId("dryland-micro-bubble-board")).toBeVisible();
  });

  it("renders one bubble per repeated exercise set", () => {
    const basePlan = buildPlan();
    const blocks: DrylandMicroBlockSnapshot[] = Array.from({ length: 3 }, (_, index) => ({
      ...basePlan.blocks[0]!,
      id: `unit-push-ups-set-${index + 1}`,
      sourceExerciseId: "push-ups",
      sourceSetId: `push-up-set-${index + 1}`,
      setIndex: index,
      title: "Push ups",
      summary: "Chest and core",
      targetLabel: "12 reps · 30 sec rest",
      targetValue: 12,
      loadKg: null,
      restSeconds: 30,
    }));

    render(
      <DrylandMicroPlanPanel
        initialPlan={buildPlan({
          sourceSessionSnapshots: [
            {
              ...basePlan.sourceSessionSnapshots[0]!,
              unitCount: 3,
            },
          ],
          blocks,
          progress: {
            totalBlockCount: 3,
            completedBlockCount: 0,
            skippedBlockCount: 0,
            remainingBlockCount: 3,
            progressPercent: 0,
          },
        })}
        sessions={[buildSummary({ setCount: 3 })]}
        schemaReady
        loadError={null}
      />
    );

    fireEvent.click(screen.getByTestId("dryland-micro-mode-bubbles"));
    expect(screen.getByTestId("dryland-micro-mode-bubbles")).toHaveClass("bg-blue-600");
    expect(screen.getByTestId("dryland-micro-mode-bubbles")).not.toHaveClass("bg-slate-950");
    expect(screen.getByText("Manage micro session")).toBeVisible();

    const board = screen.getByTestId("dryland-micro-bubble-board");
    expect(board).toHaveClass("flex", "flex-wrap", "gap-x-2", "gap-y-2");
    expect(
      within(board).getAllByRole("button", {
        name: "Complete Push ups, 12 reps",
      })
    ).toHaveLength(3);
    expect(within(board).queryByText(/30 sec rest/)).toBeNull();
    const bubbleBgClasses: Array<string | undefined> = [];
    for (let index = 0; index < 3; index += 1) {
      const bubble = screen.getByTestId(`dryland-micro-bubble-${index}`);
      expect(bubble).toBeVisible();
      expect(bubble).toHaveClass("dryland-micro-bubble-float", "relative", "min-h-24", "min-w-24");
      expect(bubble).not.toHaveClass("absolute");
      expect(bubble.getAttribute("style")).toMatch(/width:\s*[56]\.\d+rem/);
      expect(within(bubble).getByText("Push ups")).toHaveClass("text-[13px]", "sm:text-[15px]");
      expect(within(bubble).getByText("12 reps")).toHaveClass("text-xs", "sm:text-[13px]");
      bubbleBgClasses.push(getBubbleBackgroundClass(bubble));
    }
    expect(bubbleBgClasses[0]).toBeDefined();
    expect(bubbleBgClasses[1]).toBe(bubbleBgClasses[0]);
    expect(bubbleBgClasses[2]).toBe(bubbleBgClasses[0]);
  });

  it("keeps different exercises visually distinct before reusing bubble colors", () => {
    const basePlan = buildPlan();
    const titles = [
      "Wall Sit",
      "Plank",
      "Stabilizing Push-Ups",
      "Nordic Curl",
      "Bird Dog",
      "Superman",
    ];
    const blocks: DrylandMicroBlockSnapshot[] = titles.map((title, index) => ({
      ...basePlan.blocks[0]!,
      id: `unit-color-${index}`,
      sourceExerciseId: `exercise-color-${index}`,
      sourceExerciseIndex: index,
      sourceSetId: `set-color-${index}`,
      setIndex: 0,
      title,
      targetLabel: index < 2 ? "30 sec · 30 sec rest" : "5 reps · 30 sec rest",
      targetType: index < 2 ? "duration" : "reps",
      targetValue: index < 2 ? 30 : 5,
      targetUnit: index < 2 ? "sec" : "reps",
      restSeconds: 30,
    }));

    render(
      <DrylandMicroPlanPanel
        initialPlan={buildPlan({
          sourceSessionSnapshots: [
            {
              ...basePlan.sourceSessionSnapshots[0]!,
              unitCount: titles.length,
            },
          ],
          blocks,
          progress: {
            totalBlockCount: titles.length,
            completedBlockCount: 0,
            skippedBlockCount: 0,
            remainingBlockCount: titles.length,
            progressPercent: 0,
          },
        })}
        sessions={[buildSummary({ setCount: titles.length })]}
        schemaReady
        loadError={null}
      />
    );

    fireEvent.click(screen.getByTestId("dryland-micro-mode-bubbles"));

    const bubbleBackgroundClasses = titles.map((_, index) =>
      getBubbleBackgroundClass(screen.getByTestId(`dryland-micro-bubble-${index}`))
    );

    expect(bubbleBackgroundClasses.every(Boolean)).toBe(true);
    expect(new Set(bubbleBackgroundClasses).size).toBe(titles.length);
  });

  it("shows reps or duration inside each bubble based on the unit target", () => {
    const basePlan = buildPlan();
    const blocks: DrylandMicroBlockSnapshot[] = [
      {
        ...basePlan.blocks[0]!,
        id: "unit-hang-ups",
        sourceExerciseId: "hang-ups",
        sourceSetId: "hang-up-set-1",
        title: "Hang ups",
        targetLabel: "8 reps · 45 sec rest",
        targetType: "reps",
        targetValue: 8,
        targetUnit: "reps",
        restSeconds: 45,
      },
      {
        ...basePlan.blocks[1]!,
        id: "unit-plank",
        sourceSessionKind: "stretching",
        sourceExerciseId: "plank",
        sourceSetId: "plank-hold-1",
        title: "Plank",
        targetLabel: "30 sec · 20 sec rest",
        targetType: "duration",
        targetValue: 30,
        targetUnit: "sec",
        restSeconds: 20,
      },
    ];

    render(
      <DrylandMicroPlanPanel
        initialPlan={buildPlan({
          blocks,
          progress: {
            totalBlockCount: 2,
            completedBlockCount: 0,
            skippedBlockCount: 0,
            remainingBlockCount: 2,
            progressPercent: 0,
          },
        })}
        sessions={[buildSummary({ setCount: 2 })]}
        schemaReady
        loadError={null}
      />
    );

    fireEvent.click(screen.getByTestId("dryland-micro-mode-bubbles"));

    const board = screen.getByTestId("dryland-micro-bubble-board");
    expect(
      within(board).getByRole("button", {
        name: "Complete Hang ups, 8 reps",
      })
    ).toBeVisible();
    expect(
      within(board).getByRole("button", {
        name: "Open timer for Plank, 30 sec",
      })
    ).toBeVisible();
    expect(within(board).getByText("8 reps")).toBeVisible();
    expect(within(board).getByText("30 sec")).toBeVisible();
    expect(within(board).queryByText(/45 sec rest|20 sec rest/)).toBeNull();
  });

  it("opens timed bubbles with a lightweight countdown and early completion confirmation", async () => {
    vi.useFakeTimers({ now: new Date("2026-05-11T10:00:00.000Z") });
    const basePlan = buildPlan();
    const completedPlan = buildPlan({
      blocks: basePlan.blocks.map((block, index) =>
        index === 1
          ? {
              ...block,
              status: "completed",
              completedAt: "2026-05-11T10:01:00.000Z",
            }
          : block
      ),
      progress: {
        totalBlockCount: 2,
        completedBlockCount: 1,
        skippedBlockCount: 0,
        remainingBlockCount: 1,
        progressPercent: 50,
      },
    });
    const blocks: DrylandMicroBlockSnapshot[] = [
      basePlan.blocks[0]!,
      {
        ...basePlan.blocks[1]!,
        id: "unit-plank",
        title: "Plank",
        targetLabel: "30 sec · 20 sec rest",
        targetType: "duration",
        targetValue: 30,
        targetUnit: "sec",
        restSeconds: 20,
      },
    ];
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        plan: completedPlan,
      }),
    } as Response);

    render(
      <DrylandMicroPlanPanel
        initialPlan={buildPlan({ blocks })}
        sessions={[buildSummary({ setCount: 2 })]}
        schemaReady
        loadError={null}
      />
    );

    fireEvent.click(screen.getByTestId("dryland-micro-mode-bubbles"));
    fireEvent.click(screen.getByTestId("dryland-micro-bubble-1"));

    expect(screen.getByTestId("dryland-micro-bubble-1")).toHaveAccessibleName(
      "Start Plank timer, 30 sec"
    );
    expect(within(screen.getByTestId("dryland-micro-bubble-1")).getByText("Start")).toBeVisible();

    fireEvent.click(screen.getByTestId("dryland-micro-bubble-1"));
    expect(within(screen.getByTestId("dryland-micro-bubble-1")).getByText("0:30")).toBeVisible();

    fireEvent.click(screen.getByTestId("dryland-micro-bubble-1"));
    expect(
      within(screen.getByTestId("dryland-micro-bubble-1")).getByText("Complete?")
    ).toBeVisible();
    expect(within(screen.getByTestId("dryland-micro-bubble-1")).queryByText("Done")).toBeNull();
    expect(fetch).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(within(screen.getByTestId("dryland-micro-bubble-1")).getByText("0:30")).toBeVisible();
    expect(
      within(screen.getByTestId("dryland-micro-bubble-1")).queryByText("Complete?")
    ).toBeNull();
    expect(fetch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("dryland-micro-bubble-1"));
    expect(
      within(screen.getByTestId("dryland-micro-bubble-1")).getByText("Complete?")
    ).toBeVisible();
    fireEvent.click(screen.getByTestId("dryland-micro-bubble-1"));

    await act(async () => {
      await Promise.resolve();
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/my-library/dryland/micro-plans/22222222-2222-4222-8222-222222222222",
      expect.objectContaining<Record<string, unknown>>({
        method: "PATCH",
        body: expect.stringContaining('"blockId":"unit-plank"'),
      })
    );
  });

  it("auto-completes timed bubbles when the countdown reaches zero", async () => {
    vi.useFakeTimers({ now: new Date("2026-05-11T10:00:00.000Z") });
    const basePlan = buildPlan();
    const blocks: DrylandMicroBlockSnapshot[] = [
      {
        ...basePlan.blocks[0]!,
        id: "unit-plank",
        title: "Plank",
        targetLabel: "30 sec · 20 sec rest",
        targetType: "duration",
        targetValue: 30,
        targetUnit: "sec",
        restSeconds: 20,
      },
      basePlan.blocks[1]!,
    ];
    const completedPlan = buildPlan({
      blocks: blocks.map((block, index) =>
        index === 0
          ? {
              ...block,
              status: "completed",
              completedAt: "2026-05-11T10:00:30.000Z",
            }
          : block
      ),
      progress: {
        totalBlockCount: 2,
        completedBlockCount: 1,
        skippedBlockCount: 0,
        remainingBlockCount: 1,
        progressPercent: 50,
      },
    });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        plan: completedPlan,
      }),
    } as Response);

    render(
      <DrylandMicroPlanPanel
        initialPlan={buildPlan({ blocks })}
        sessions={[buildSummary({ setCount: 2 })]}
        schemaReady
        loadError={null}
      />
    );

    fireEvent.click(screen.getByTestId("dryland-micro-mode-bubbles"));
    fireEvent.click(screen.getByTestId("dryland-micro-bubble-0"));
    fireEvent.click(screen.getByTestId("dryland-micro-bubble-0"));

    await act(async () => {
      vi.advanceTimersByTime(30_000);
      await Promise.resolve();
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/my-library/dryland/micro-plans/22222222-2222-4222-8222-222222222222",
      expect.objectContaining<Record<string, unknown>>({
        method: "PATCH",
        body: expect.stringContaining('"blockId":"unit-plank"'),
      })
    );
  });

  it("double taps a bubble through the existing server-confirmed completion mutation", async () => {
    const completedPlan = buildPlan({
      blocks: buildPlan().blocks.map((block, index) =>
        index === 0
          ? {
              ...block,
              status: "completed",
              completedAt: "2026-05-08T09:00:00.000Z",
            }
          : block
      ),
      progress: {
        totalBlockCount: 2,
        completedBlockCount: 1,
        skippedBlockCount: 0,
        remainingBlockCount: 1,
        progressPercent: 50,
      },
    });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        plan: completedPlan,
      }),
    } as Response);

    render(
      <DrylandMicroPlanPanel
        initialPlan={buildPlan()}
        sessions={[buildSummary()]}
        schemaReady
        loadError={null}
      />
    );

    fireEvent.click(screen.getByTestId("dryland-micro-mode-bubbles"));
    fireEvent.click(screen.getByTestId("dryland-micro-bubble-0"));
    fireEvent.click(screen.getByTestId("dryland-micro-bubble-0"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/dryland/micro-plans/22222222-2222-4222-8222-222222222222",
        expect.objectContaining<Record<string, unknown>>({
          method: "PATCH",
          body: expect.stringContaining('"blockStatus":"completed"'),
        })
      );
    });
    expect(screen.queryByText("Bubble completed.")).not.toBeInTheDocument();
    expect(await screen.findByTestId("dryland-micro-global-undo")).toHaveTextContent("Undo");
    expect(screen.getByTestId("dryland-micro-global-undo")).toHaveAccessibleName(
      "Undo last completed micro unit: Single-leg squat"
    );
    await waitFor(() => {
      expect(screen.getByRole("progressbar", { name: "Progress" })).toHaveAttribute(
        "aria-valuenow",
        "50"
      );
    });
  });

  it("stacks bubble undo actions in completion order", async () => {
    const basePlan = buildPlan();
    const firstCompletedPlan = buildPlan({
      blocks: basePlan.blocks.map((block, index) =>
        index === 0
          ? {
              ...block,
              status: "completed",
              completedAt: "2026-05-11T10:00:00.000Z",
            }
          : block
      ),
      progress: {
        totalBlockCount: 2,
        completedBlockCount: 1,
        skippedBlockCount: 0,
        remainingBlockCount: 1,
        progressPercent: 50,
      },
    });
    const fullyCompletedPlan = buildPlan({
      status: "completed",
      blocks: firstCompletedPlan.blocks.map((block, index) =>
        index === 1
          ? {
              ...block,
              status: "completed",
              completedAt: "2026-05-11T10:01:00.000Z",
            }
          : block
      ),
      progress: {
        totalBlockCount: 2,
        completedBlockCount: 2,
        skippedBlockCount: 0,
        remainingBlockCount: 0,
        progressPercent: 100,
      },
    });
    const secondRestoredPlan = buildPlan({
      blocks: fullyCompletedPlan.blocks.map((block, index) =>
        index === 1
          ? {
              ...block,
              status: "queued",
              completedAt: null,
            }
          : block
      ),
      progress: {
        totalBlockCount: 2,
        completedBlockCount: 1,
        skippedBlockCount: 0,
        remainingBlockCount: 1,
        progressPercent: 50,
      },
    });
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          plan: firstCompletedPlan,
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          plan: fullyCompletedPlan,
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          plan: secondRestoredPlan,
        }),
      } as Response);

    render(
      <DrylandMicroPlanPanel
        initialPlan={basePlan}
        sessions={[buildSummary()]}
        schemaReady
        loadError={null}
      />
    );

    fireEvent.click(screen.getByTestId("dryland-micro-mode-bubbles"));
    fireEvent.click(screen.getByTestId("dryland-micro-bubble-0"));
    fireEvent.click(screen.getByTestId("dryland-micro-bubble-0"));

    await waitFor(() => {
      expect(screen.queryByTestId("dryland-micro-bubble-0")).not.toBeInTheDocument();
    });

    fireEvent.click(await screen.findByTestId("dryland-micro-bubble-1"));
    fireEvent.click(screen.getByTestId("dryland-micro-bubble-1"));

    await waitFor(() => {
      expect(screen.getByTestId("dryland-micro-global-undo")).toHaveTextContent("Undo · 2");
    });

    fireEvent.click(screen.getByTestId("dryland-micro-global-undo"));

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith(
        "/api/my-library/dryland/micro-plans/22222222-2222-4222-8222-222222222222",
        expect.objectContaining<Record<string, unknown>>({
          method: "PATCH",
          body: expect.stringContaining(`"blockId":"${basePlan.blocks[1]!.id}"`),
        })
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("dryland-micro-global-undo")).toHaveTextContent("Undo");
    });
    expect(screen.getByTestId("dryland-micro-global-undo")).toHaveAccessibleName(
      "Undo last completed micro unit: Single-leg squat"
    );
  });

  it("keeps a bubble visible when server completion fails", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({
        ok: false,
        error: "Could not update micro session right now.",
      }),
    } as Response);

    render(
      <DrylandMicroPlanPanel
        initialPlan={buildPlan()}
        sessions={[buildSummary()]}
        schemaReady
        loadError={null}
      />
    );

    fireEvent.click(screen.getByTestId("dryland-micro-mode-bubbles"));
    fireEvent.click(screen.getByTestId("dryland-micro-bubble-0"));
    fireEvent.click(screen.getByTestId("dryland-micro-bubble-0"));

    expect(await screen.findByText("Could not update micro session right now.")).toBeVisible();
    const alert = screen.getByTestId("dryland-micro-action-error");
    expect(alert).toHaveAttribute("role", "alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveAttribute("data-feedback-tone", "error");
    expect(screen.getByTestId("dryland-micro-bubble-0")).toBeVisible();
    expect(screen.getByRole("progressbar", { name: "Progress" })).toHaveAttribute(
      "aria-valuenow",
      "0"
    );
  });

  it("disables bubble completion while a micro session is paused", () => {
    render(
      <DrylandMicroPlanPanel
        initialPlan={buildPlan({ status: "paused" })}
        sessions={[buildSummary()]}
        schemaReady
        loadError={null}
      />
    );

    expect(screen.getByTestId("dryland-micro-collapsed-state")).toHaveTextContent(
      "Micro session paused"
    );
    expect(screen.getByTestId("dryland-micro-resume-collapsed")).toBeVisible();
    expect(screen.queryByTestId("dryland-micro-bubble-0")).not.toBeInTheDocument();
  });

  it("shows syncing state without hiding the dryland surface", () => {
    render(
      <DrylandMicroPlanPanel
        initialPlan={null}
        sessions={[buildSummary()]}
        schemaReady={false}
        loadError={null}
      />
    );

    expect(screen.getByText(/Micro Sessions are still syncing/)).toBeVisible();
    const schemaWarning = screen.getByTestId("dryland-micro-schema-warning");
    expect(schemaWarning).toHaveAttribute("role", "status");
    expect(schemaWarning).toHaveAttribute("aria-live", "polite");
    expect(schemaWarning).toHaveAttribute("data-feedback-tone", "warning");
    expect(within(schemaWarning).getByRole("button", { name: "Retry" })).toBeVisible();
    expect(
      screen.queryByTestId("dryland-micro-select-11111111-1111-4111-8111-111111111111")
    ).not.toBeInTheDocument();
  });

  it("announces micro session load errors with retry semantics", () => {
    render(
      <DrylandMicroPlanPanel
        initialPlan={null}
        sessions={[buildSummary()]}
        schemaReady
        loadError="Could not load Micro Sessions right now."
      />
    );

    const alert = screen.getByTestId("dryland-micro-load-error");
    expect(alert).toHaveAttribute("role", "alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveAttribute("data-feedback-tone", "error");
    expect(alert).toHaveTextContent("Could not load Micro Sessions right now.");
    expect(within(alert).getByRole("button", { name: "Retry" })).toBeVisible();
  });

  it("keeps manual release as legacy state without offering it for new edits", () => {
    const manualPlan = buildPlan({
      releaseMode: "manual",
      sourceSessionSnapshots: [
        {
          ...buildPlan().sourceSessionSnapshots[0]!,
          releaseOffsetDays: null,
        },
      ],
      blocks: buildPlan().blocks.map((block) => ({
        ...block,
        releaseMode: "manual",
        releaseOffsetDays: null,
        releasedAt: null,
      })),
    });

    render(
      <DrylandMicroPlanPanel
        initialPlan={manualPlan}
        sessions={[buildSummary()]}
        schemaReady
        loadError={null}
      />
    );

    expect(screen.getByTestId("dryland-micro-collapsed-state")).toHaveTextContent(
      "No units are ready today"
    );
    expect(screen.getByRole("button", { name: "Move next to today" })).toBeVisible();
    fireEvent.click(screen.getByTestId("dryland-micro-edit-from-collapsed"));

    expect(screen.queryByRole("button", { name: "Manual release" })).toBeNull();
    expect(screen.getByRole("button", { name: "Available now" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Weekday release" })).toBeVisible();
    expect(screen.getByText(/legacy manual release/i)).toBeVisible();
    expect(screen.getByTestId("dryland-micro-save-edit")).toBeDisabled();
  });
});
