import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateManualDrylandSessionButton from "@/components/my-library/dryland/CreateManualDrylandSessionButton";
import type { DrylandSessionDraft } from "@/lib/dryland/shared";

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

    const createBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body ?? "{}")) as {
      draft: DrylandSessionDraft;
      sessionKind: string;
    };
    expect(createBody.sessionKind).toBe("strength");
    expect(createBody.draft.exercises[0]?.source).toBe("custom");
    expect(createBody.draft.exercises[0]?.bankExerciseId).toBeNull();

    await waitFor(() => {
      expect(navigationState.push).toHaveBeenCalledWith(
        "/my-library/dryland/11111111-1111-4111-8111-111111111111"
      );
    });
    expect(navigationState.refresh).toHaveBeenCalled();
  });

  it("creates a stretching session with a custom-only starter draft", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        session: {
          id: "22222222-2222-4222-8222-222222222222",
        },
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
      expect(fetch).toHaveBeenCalled();
    });

    const createBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body ?? "{}")) as {
      draft: DrylandSessionDraft;
      sessionKind: string;
    };

    expect(createBody.sessionKind).toBe("stretching");
    expect(createBody.draft.exercises[0]?.source).toBe("custom");
    expect(createBody.draft.exercises[0]?.bankExerciseId).toBeNull();
    expect(createBody.draft.exercises[0]?.sets.every((set) => set.holdSeconds === 30)).toBe(true);
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
    const feedback = screen.getByTestId("create-manual-dryland-session-error");
    expect(feedback).toHaveAttribute("role", "alert");
    expect(feedback).toHaveAttribute("aria-live", "assertive");
    expect(feedback).toHaveAttribute("data-feedback-tone", "error");
    expect(screen.getByRole("button", { name: "Create stretching session" })).toHaveAttribute(
      "aria-describedby",
      "create-manual-dryland-session-error"
    );
    expect(navigationState.push).not.toHaveBeenCalled();
  });
});
