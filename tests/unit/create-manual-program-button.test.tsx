import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateManualProgramButton from "@/components/my-library/programs/CreateManualProgramButton";

const navigationState = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationState,
}));

describe("CreateManualProgramButton", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("creates a manual program and routes into the builder", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        program: {
          id: "11111111-1111-4111-8111-111111111111",
        },
      }),
    } as Response);

    render(<CreateManualProgramButton />);

    fireEvent.click(screen.getByRole("button", { name: "Create program shell" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/programs",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    await waitFor(() => {
      expect(navigationState.push).toHaveBeenCalledWith(
        "/my-library/programs/11111111-1111-4111-8111-111111111111"
      );
    });
    expect(navigationState.refresh).toHaveBeenCalled();
  });

  it("shows an inline error when manual creation fails", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({
        ok: false,
        error: "Could not create program right now.",
      }),
    } as Response);

    render(<CreateManualProgramButton />);

    fireEvent.click(screen.getByRole("button", { name: "Create program shell" }));

    await waitFor(() => {
      expect(screen.getByText("Could not create program right now.")).toBeVisible();
    });
    expect(navigationState.push).not.toHaveBeenCalled();
  });
});
