import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DrylandMicroPlanPanel from "@/components/my-library/dryland/DrylandMicroPlanPanel";
import type { DrylandMicroPlanRecord } from "@/lib/dryland/micro-plans";
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
  const blocks = [
    {
      id: "block-1-exercise-1",
      sourceExerciseId: "exercise-1",
      title: "Single-leg squat",
      summary: "Controlled lower-body strength.",
      targetLabel: "2 sets · 6 @ 12.5kg P: 1 min 15 sec",
      coachCue: "Slow down.",
      status: "queued" as const,
      completedAt: null,
      skippedAt: null,
    },
    {
      id: "block-2-exercise-2",
      sourceExerciseId: "exercise-2",
      title: "Dead bug",
      summary: "Core",
      targetLabel: "1 set · 8 P: 45 sec",
      coachCue: "Brace first.",
      status: "queued" as const,
      completedAt: null,
      skippedAt: null,
    },
  ];

  return {
    id: "22222222-2222-4222-8222-222222222222",
    sourceDrylandSessionId: "11111111-1111-4111-8111-111111111111",
    sourceSessionTitle: "Weekly strength",
    title: "Micro plan: Weekly strength",
    sessionKind: "strength",
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

  it("starts a weekly micro plan from a saved dryland session", async () => {
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

    fireEvent.click(screen.getByTestId("dryland-micro-start-11111111-1111-4111-8111-111111111111"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/dryland/micro-plans",
        expect.objectContaining<Record<string, unknown>>({
          method: "POST",
          body: expect.stringContaining(
            '"sourceDrylandSessionId":"11111111-1111-4111-8111-111111111111"'
          ),
        })
      );
    });

    expect(await screen.findByText("Micro plan started for this week.")).toBeVisible();
    expect(screen.getByRole("progressbar", { name: "Micro session progress" })).toHaveAttribute(
      "aria-valuenow",
      "0"
    );
    expect(screen.getByTestId("dryland-micro-block-0")).toHaveTextContent("Single-leg squat");
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

    expect(await screen.findByText("All micro blocks are complete for this week.")).toBeVisible();
    expect(screen.getByRole("progressbar", { name: "Micro session progress" })).toHaveAttribute(
      "aria-valuenow",
      "100"
    );
    expect(screen.getAllByText("Complete")).toHaveLength(2);
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
      screen.queryByTestId("dryland-micro-start-11111111-1111-4111-8111-111111111111")
    ).not.toBeInTheDocument();
  });
});
