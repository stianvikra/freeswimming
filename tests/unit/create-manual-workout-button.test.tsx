import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CreateManualWorkoutButton from "@/components/my-library/workouts/CreateManualWorkoutButton";

const navigationState = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));
const { sendClientAnalyticsEventMock } = vi.hoisted(() => ({
  sendClientAnalyticsEventMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationState,
}));
vi.mock("@/lib/analytics/client", () => ({
  sendClientAnalyticsEvent: sendClientAnalyticsEventMock,
}));

describe("CreateManualWorkoutButton", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("routes a pool entry into the local-draft builder flow", async () => {
    render(<CreateManualWorkoutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Build pool session" }));

    await waitFor(() => {
      expect(navigationState.push).toHaveBeenCalledWith(
        "/my-library/workouts?draft=pool&entry=manual-pool"
      );
    });
    expect(navigationState.refresh).toHaveBeenCalled();
    expect(sendClientAnalyticsEventMock).toHaveBeenCalledWith("workout_builder_started", {
      source: "workout_builder",
      surface: "my_library_workouts",
      builderMode: "pool",
      builderEntry: "manual-pool",
      hasCssPaceDefault: false,
    });
  });

  it("supports a custom href builder for manual draft entry", async () => {
    render(
      <CreateManualWorkoutButton
        draftHrefBuilder={(builderMode) =>
          `/my-library/workouts?draft=${builderMode}&from=overview`
        }
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Build pool session" }));

    await waitFor(() => {
      expect(navigationState.push).toHaveBeenCalledWith(
        "/my-library/workouts?draft=pool&from=overview"
      );
    });
    expect(navigationState.refresh).toHaveBeenCalled();
    expect(sendClientAnalyticsEventMock).toHaveBeenCalledWith("workout_builder_started", {
      source: "workout_builder",
      surface: "my_library_workouts",
      builderMode: "pool",
      builderEntry: "manual-pool",
      hasCssPaceDefault: false,
    });
  });

  it("routes an open-water entry into the local-draft builder flow", async () => {
    render(<CreateManualWorkoutButton builderMode="open_water" />);

    fireEvent.click(screen.getByRole("button", { name: "Build open water session" }));

    await waitFor(() => {
      expect(navigationState.push).toHaveBeenCalledWith(
        "/my-library/workouts?draft=open_water&entry=manual-open-water"
      );
    });
    expect(navigationState.refresh).toHaveBeenCalled();
    expect(sendClientAnalyticsEventMock).toHaveBeenCalledWith("workout_builder_started", {
      source: "workout_builder",
      surface: "my_library_workouts",
      builderMode: "open_water",
      builderEntry: "manual-open-water",
      hasCssPaceDefault: false,
    });
  });

  it("marks pool CSS defaults in the manual builder start event", async () => {
    render(<CreateManualWorkoutButton manualPoolCssMetricSecondsPer100m={118} />);

    fireEvent.click(screen.getByRole("button", { name: "Build pool session" }));

    await waitFor(() => {
      expect(sendClientAnalyticsEventMock).toHaveBeenCalledWith("workout_builder_started", {
        source: "workout_builder",
        surface: "my_library_workouts",
        builderMode: "pool",
        builderEntry: "manual-pool",
        hasCssPaceDefault: true,
      });
    });
  });

  it("announces manual builder open failures as recoverable alerts", async () => {
    render(
      <CreateManualWorkoutButton
        draftHrefBuilder={() => {
          throw new Error("draft route unavailable");
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Build pool session" }));

    const feedback = await screen.findByTestId("create-manual-workout-error");
    expect(feedback).toHaveAttribute("role", "alert");
    expect(feedback).toHaveAttribute("aria-live", "assertive");
    expect(feedback).toHaveAttribute("data-feedback-tone", "error");
    expect(feedback).toHaveTextContent("Could not open pool session builder.");
    expect(screen.getByRole("button", { name: "Build pool session" })).toHaveAttribute(
      "aria-describedby",
      "create-manual-workout-error"
    );
    expect(navigationState.push).not.toHaveBeenCalled();
    expect(sendClientAnalyticsEventMock).not.toHaveBeenCalled();
  });
});
