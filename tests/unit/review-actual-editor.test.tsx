import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ReviewActualEditor from "@/components/my-library/ReviewActualEditor";
import type { ReviewActualEditorModel } from "@/lib/my-library/review-actual";
import { buildManualWorkoutEmptyDraft } from "@/lib/workouts/manual";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

function buildReadyModel(): Extract<ReviewActualEditorModel, { status: "ready" }> {
  const actualDraft = {
    ...buildManualWorkoutEmptyDraft(new Date("2026-06-20T08:00:00.000Z")),
    title: "Comeback threshold swim",
  };

  return {
    status: "ready",
    returnHref: "/my-library/calendar?view=plan&date=2026-06-22&programId=program-1",
    plan: {
      plannedWorkoutInstanceId: "33333333-3333-4333-8333-333333333333",
      plannedOn: "2026-06-22",
      plannedUpdatedAt: "2026-06-20T09:10:00.000Z",
      programId: "program-1",
      programTitle: "Swim comeback plan",
      workoutId: "workout-1",
      workoutTitle: "Comeback threshold swim",
      workout: {
        id: "workout-1",
        title: "Comeback threshold swim",
        environment: "pool",
        totalDistanceM: actualDraft.totalDistanceM,
        estimatedDurationMin: actualDraft.estimatedDurationMin,
        poolLengthM: 25,
        poolLengthUnit: "m",
        draft: actualDraft,
        previewSections: [
          {
            key: "warmup-0",
            title: "Warmup",
            category: "warmup",
            rows: [
              {
                key: "warmup-row",
                text: "300m · Freestyle · Easy",
                secondaryText: null,
              },
            ],
          },
          {
            key: "main-1",
            title: "Main",
            category: "main",
            rows: [
              {
                key: "threshold-repeat",
                text: "4 x 100m · Freestyle · Threshold · Interval rest 0:20",
                secondaryText: "Set rest 1:00",
              },
            ],
          },
        ],
      },
      sourceWorkoutMissing: false,
      sourceProgramMissing: false,
    },
    event: {
      id: "44444444-4444-4444-8444-444444444444",
      plannedWorkoutInstanceId: "33333333-3333-4333-8333-333333333333",
      workoutId: "workout-1",
      programId: "program-1",
      sourceKind: "manual",
      outcome: "completed_as_planned",
      isDoneOutcome: true,
      completedOn: "2026-06-22",
      actualStartedAt: null,
      actualDurationSeconds:
        typeof actualDraft.estimatedDurationMin === "number"
          ? actualDraft.estimatedDurationMin * 60
          : null,
      actualDistanceM: actualDraft.totalDistanceM,
      actualEnvironment: "pool",
      actualPoolLengthM: 25,
      actualPoolLengthUnit: "m",
      actualSessionDraft: actualDraft,
      correctionNote: null,
      createdAt: "2026-06-22T17:30:00.000Z",
      updatedAt: "2026-06-22T17:30:00.000Z",
    },
  };
}

describe("ReviewActualEditor", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    refreshMock.mockClear();
  });

  it("shows plan and manual actual source as separate truths", () => {
    render(<ReviewActualEditor model={buildReadyModel()} />);

    expect(screen.getByTestId("review-actual-editor")).toBeVisible();
    expect(screen.getByText("Source: Manual")).toBeVisible();
    expect(screen.getAllByText("Comeback threshold swim").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(
        "Actual history ID 44444444-4444-4444-8444-444444444444. Planned item 33333333-3333-4333-8333-333333333333."
      )
    ).toBeVisible();

    const plan = screen.getByTestId("review-actual-plan-summary");
    expect(within(plan).getByText("Swim comeback plan")).toBeVisible();
    expect(within(plan).getByText("1000m · ~25 min")).toBeVisible();

    const actual = screen.getByTestId("review-actual-current-summary");
    expect(within(actual).getByText("As planned")).toBeVisible();
    expect(within(actual).getByText("1000m · 25 min")).toBeVisible();
  });

  it("shows the planned step and repeat structure read-only and the actual session editable", () => {
    render(<ReviewActualEditor model={buildReadyModel()} />);

    const plannedSteps = screen.getByTestId("review-actual-planned-steps");
    expect(within(plannedSteps).getByText("Read-only")).toBeVisible();
    expect(within(plannedSteps).getByText("Warmup")).toBeVisible();
    expect(within(plannedSteps).getByText("300m · Freestyle · Easy")).toBeVisible();
    expect(within(plannedSteps).getByText("Main")).toBeVisible();
    expect(
      within(plannedSteps).getByText("4 x 100m · Freestyle · Threshold · Interval rest 0:20")
    ).toBeVisible();
    expect(within(plannedSteps).getByText("Set rest 1:00")).toBeVisible();
    expect(within(plannedSteps).queryByRole("button")).not.toBeInTheDocument();

    const actualSession = screen.getByTestId("review-actual-actual-session");
    expect(within(actualSession).getByText("Editable actual")).toBeVisible();
    expect(within(actualSession).getByText("Session steps")).toBeVisible();
    expect(
      within(actualSession).getByRole("button", { name: "Save actual session" })
    ).toBeVisible();
  });

  it("submits edited actual session steps through the owner-scoped completion endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        status: "corrected",
        event: {
          outcome: "partial",
          completedOn: "2026-06-23",
          actualStartedAt: "2026-06-23T16:15:00.000Z",
          actualDurationSeconds: 1800,
          actualDistanceM: 1200,
          actualEnvironment: "pool",
          actualPoolLengthM: 25,
          actualPoolLengthUnit: "m",
          actualSessionDraft: {
            ...buildManualWorkoutEmptyDraft(new Date("2026-06-20T08:00:00.000Z")),
            steps: buildManualWorkoutEmptyDraft(new Date("2026-06-20T08:00:00.000Z")).steps.map(
              (step, index) => (index === 0 ? { ...step, stroke: "butterfly" } : step)
            ),
          },
          correctionNote: "Stopped early.",
          updatedAt: "2026-06-23T17:00:00.000Z",
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ReviewActualEditor model={buildReadyModel()} />);

    fireEvent.change(screen.getByLabelText("Completion status"), {
      target: { value: "partial" },
    });
    fireEvent.change(screen.getByLabelText("Completion date"), {
      target: { value: "2026-06-23" },
    });
    fireEvent.change(screen.getByLabelText(/Start time/), { target: { value: "16:15" } });
    fireEvent.change(screen.getByLabelText(/Correction note/), {
      target: { value: "Stopped early." },
    });

    const actualSession = screen.getByTestId("review-actual-actual-session");
    fireEvent.click(within(actualSession).getByTestId("session-draft-step-toggle-0"));
    fireEvent.change(within(actualSession).getByTestId("session-draft-step-stroke-0"), {
      target: { value: "butterfly" },
    });
    fireEvent.click(within(actualSession).getByRole("button", { name: "Save actual session" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/my-library/calendar/planned-instances/33333333-3333-4333-8333-333333333333/completion"
    );
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toMatchObject({
      outcome: "partial",
      completedOn: "2026-06-23",
      actualStartedAt: "2026-06-23T16:15:00.000Z",
      expectedActualUpdatedAt: "2026-06-22T17:30:00.000Z",
    });
    const body = JSON.parse(String(init.body));
    expect(body).not.toHaveProperty("actualDistanceM");
    expect(body.actualSessionDraft.steps[0]).toMatchObject({ stroke: "butterfly" });
    expect(await screen.findByText("Actual updated.")).toBeVisible();
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("blocks invalid local fields before saving", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<ReviewActualEditor model={buildReadyModel()} />);

    fireEvent.change(screen.getByLabelText("Completion date"), { target: { value: "" } });

    expect(screen.getByText("Completion date is required.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Save actual session" })).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("surfaces stale-write errors without losing the editor", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: "This actual changed after the page loaded. Refresh Calendar and try again.",
        }),
      })
    );

    render(<ReviewActualEditor model={buildReadyModel()} />);
    fireEvent.click(screen.getByRole("button", { name: "Save actual session" }));

    expect(
      await screen.findByText(
        "This actual changed after the page loaded. Refresh Calendar and try again."
      )
    ).toBeVisible();
    expect(screen.getByTestId("review-actual-metadata-form")).toBeVisible();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("fails closed for unmapped provider-backed actual states", () => {
    render(
      <ReviewActualEditor
        model={{
          status: "review_required",
          eventId: "event-1",
          sourceKind: "garmin_activity_api",
          outcome: "provider_pending",
          returnHref: "/my-library/calendar?view=plan",
        }}
      />
    );

    expect(screen.getByTestId("review-actual-state-card")).toBeVisible();
    expect(screen.getByText(/garmin_activity_api/)).toBeVisible();
    expect(screen.getByRole("link", { name: "Back to Calendar" })).toHaveAttribute(
      "href",
      "/my-library/calendar?view=plan"
    );
  });
});
