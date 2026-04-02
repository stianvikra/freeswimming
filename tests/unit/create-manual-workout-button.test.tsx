import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateManualWorkoutButton from "@/components/my-library/workouts/CreateManualWorkoutButton";

const navigationState = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationState,
}));

describe("CreateManualWorkoutButton", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("creates a manual workout and routes into the builder", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        workout: {
          id: "11111111-1111-4111-8111-111111111111",
        },
      }),
    } as Response);

    render(<CreateManualWorkoutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Create session" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/workouts",
        expect.objectContaining<Record<string, unknown>>({
          method: "POST",
          body: expect.stringContaining('"title":"Untitled swim session"'),
        })
      );
    });

    await waitFor(() => {
      expect(navigationState.push).toHaveBeenCalledWith(
        "/my-library/workouts/11111111-1111-4111-8111-111111111111"
      );
    });
    expect(navigationState.refresh).toHaveBeenCalled();
  });

  it("shows an inline error when manual creation fails", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({
        ok: false,
        error: "Could not create workout right now.",
      }),
    } as Response);

    render(<CreateManualWorkoutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Create session" }));

    await waitFor(() => {
      expect(screen.getByText("Could not create workout right now.")).toBeVisible();
    });
    expect(navigationState.push).not.toHaveBeenCalled();
  });

  it("offers continue-or-start-new when a saved session already exists", async () => {
    render(
      <CreateManualWorkoutButton
        latestSavedWorkout={{
          id: "22222222-2222-4222-8222-222222222222",
          title: "Saved threshold session",
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Create session" }));

    expect(screen.getByTestId("create-manual-workout-chooser")).toBeVisible();
    expect(screen.getByText("Edit your latest saved session or start a fresh one.")).toBeVisible();
    expect(screen.getByText("Latest saved session: Saved threshold session")).toBeVisible();

    fireEvent.click(screen.getByTestId("create-manual-workout-continue"));

    expect(navigationState.push).toHaveBeenCalledWith(
      "/my-library/workouts/22222222-2222-4222-8222-222222222222"
    );
    expect(navigationState.refresh).toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("can start a clean new session from the chooser", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        workout: {
          id: "33333333-3333-4333-8333-333333333333",
        },
      }),
    } as Response);

    render(
      <CreateManualWorkoutButton
        latestSavedWorkout={{
          id: "22222222-2222-4222-8222-222222222222",
          title: "Saved threshold session",
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Create session" }));
    fireEvent.click(screen.getByTestId("create-manual-workout-start-scratch"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/workouts",
        expect.objectContaining<Record<string, unknown>>({
          method: "POST",
          body: expect.stringContaining('"title":"Untitled swim session"'),
        })
      );
    });
    await waitFor(() => {
      expect(navigationState.push).toHaveBeenCalledWith(
        "/my-library/workouts/33333333-3333-4333-8333-333333333333"
      );
    });
  });
});
