import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DrylandMicroPlanPanel from "@/components/my-library/dryland/DrylandMicroPlanPanel";
import type { DrylandMicroBlockSnapshot, DrylandMicroPlanRecord } from "@/lib/dryland/micro-plans";
import type { DrylandSessionSummary } from "@/lib/dryland/shared";

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
    title: "Micro session: Weekly strength",
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
    weekStartsAt: "2026-05-04T00:00:00.000Z",
    weekEndsAt: "2026-05-11T00:00:00.000Z",
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

describe("DrylandMicroPlanPanel", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
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
    expect(screen.getByRole("progressbar", { name: "Micro session progress" })).toHaveAttribute(
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
    expect(
      screen.getByTestId("dryland-micro-select-11111111-1111-4111-8111-111111111111")
    ).toBeVisible();
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
    expect(screen.getByRole("progressbar", { name: "Micro session progress" })).toHaveAttribute(
      "aria-valuenow",
      "100"
    );
    expect(screen.getAllByText("Complete")).toHaveLength(2);
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
    expect(
      screen.queryByTestId("dryland-micro-select-11111111-1111-4111-8111-111111111111")
    ).not.toBeInTheDocument();
  });
});
