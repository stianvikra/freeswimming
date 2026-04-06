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

    fireEvent.click(screen.getByRole("button", { name: "Build pool session" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/workouts",
        expect.objectContaining<Record<string, unknown>>({
          method: "POST",
          body: expect.stringContaining('"title":"Untitled pool session"'),
        })
      );
    });

    await waitFor(() => {
      expect(navigationState.push).toHaveBeenCalledWith(
        "/my-library/workouts/11111111-1111-4111-8111-111111111111?entry=manual-pool"
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

    fireEvent.click(screen.getByRole("button", { name: "Build pool session" }));

    await waitFor(() => {
      expect(screen.getByText("Could not create workout right now.")).toBeVisible();
    });
    expect(navigationState.push).not.toHaveBeenCalled();
  });

  it("supports a custom href builder for fresh manual entry", async () => {
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
        createdWorkoutHrefBuilder={(workoutId) => `/my-library/workouts/${workoutId}?from=overview`}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Build pool session" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/workouts",
        expect.objectContaining<Record<string, unknown>>({
          method: "POST",
          body: expect.stringContaining('"title":"Untitled pool session"'),
        })
      );
    });
    await waitFor(() => {
      expect(navigationState.push).toHaveBeenCalledWith(
        "/my-library/workouts/33333333-3333-4333-8333-333333333333?from=overview"
      );
    });
  });

  it("creates an open water workout from the dedicated open-water entry", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        workout: {
          id: "44444444-4444-4444-8444-444444444444",
        },
      }),
    } as Response);

    render(<CreateManualWorkoutButton builderMode="open_water" />);

    fireEvent.click(screen.getByRole("button", { name: "Build open water session" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/workouts",
        expect.objectContaining<Record<string, unknown>>({
          method: "POST",
          body: expect.stringContaining('"title":"Untitled open water session"'),
        })
      );
    });

    await waitFor(() => {
      expect(navigationState.push).toHaveBeenCalledWith(
        "/my-library/workouts/44444444-4444-4444-8444-444444444444?entry=manual-open-water"
      );
    });
  });
});
