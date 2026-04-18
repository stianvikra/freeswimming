import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CreateManualWorkoutButton from "@/components/my-library/workouts/CreateManualWorkoutButton";

const navigationState = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationState,
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
  });
});
