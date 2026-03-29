import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateManualDrylandSessionButton from "@/components/my-library/dryland/CreateManualDrylandSessionButton";

const navigationState = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationState,
}));

describe("CreateManualDrylandSessionButton", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("creates a strength session and routes into the dryland builder", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        session: {
          id: "11111111-1111-4111-8111-111111111111",
        },
      }),
    } as Response);

    render(
      <CreateManualDrylandSessionButton sessionKind="strength" label="Create strength session" />
    );

    fireEvent.click(screen.getByRole("button", { name: "Create strength session" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/my-library/dryland",
        expect.objectContaining<Record<string, unknown>>({
          method: "POST",
          body: expect.stringContaining('"sessionKind":"strength"'),
        })
      );
    });

    await waitFor(() => {
      expect(navigationState.push).toHaveBeenCalledWith(
        "/my-library/dryland/11111111-1111-4111-8111-111111111111"
      );
    });
    expect(navigationState.refresh).toHaveBeenCalled();
  });

  it("shows an inline error when dryland creation fails", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({
        ok: false,
        error: "Could not create dryland session right now.",
      }),
    } as Response);

    render(
      <CreateManualDrylandSessionButton
        sessionKind="stretching"
        label="Create stretching session"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Create stretching session" }));

    await waitFor(() => {
      expect(screen.getByText("Could not create dryland session right now.")).toBeVisible();
    });
    expect(navigationState.push).not.toHaveBeenCalled();
  });
});
