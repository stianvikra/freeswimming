import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MyLibraryTrainingPage from "@/app/my-library/training/page";
import type { TrainingContextSnapshot } from "@/lib/training-context/server";

const {
  getServerSupabaseUserIfAuthCookiePresentMock,
  loadTrainingContextSnapshotMock,
  trackEventOnMountMock,
} = vi.hoisted(() => ({
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
  loadTrainingContextSnapshotMock: vi.fn(),
  trackEventOnMountMock: vi.fn(),
}));

vi.mock("@/components/SiteChrome", () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="site-chrome">{children}</div>
  ),
}));

vi.mock("@/components/analytics/TrackEventOnMount", () => ({
  default: (props: { eventName: string; payload: Record<string, unknown> }) => {
    trackEventOnMountMock(props);
    return <div data-testid={`track-${props.eventName}`} />;
  },
}));

vi.mock("@/components/my-library/training/TrainingContextHub", () => ({
  default: ({
    initialGoalPrefill,
  }: {
    initialSnapshot: TrainingContextSnapshot;
    initialGoalPrefill?: { goalId: string; intent: "focus" | "note" } | null;
  }) => (
    <div
      data-testid="training-context-hub"
      data-prefill-goal={initialGoalPrefill?.goalId ?? ""}
      data-prefill-intent={initialGoalPrefill?.intent ?? ""}
    />
  ),
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/lib/training-context/server", () => ({
  loadTrainingContextSnapshot: loadTrainingContextSnapshotMock,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

function buildSnapshot(): TrainingContextSnapshot {
  return {
    schemaReady: true,
    loadError: null,
    activeFocus: null,
    primaryFocus: null,
    openFocuses: [
      {
        id: "focus-1",
        title: "Quiet catch",
        details: null,
        status: "open",
        statusLabel: "Open",
        isPrimary: false,
        goalId: null,
        goalTitle: null,
        contextType: null,
        contextRef: null,
        createdAt: "2026-05-26T10:00:00.000Z",
        updatedAt: "2026-05-26T10:00:00.000Z",
        completedAt: null,
        archivedAt: null,
      },
    ],
    focusHistory: [],
    focusNeedsPrimarySelection: false,
    recentNotes: [
      {
        id: "note-1",
        noteType: "question",
        noteTypeLabel: "Question",
        status: "unanswered",
        statusLabel: "Unanswered",
        body: "Where does the breath start?",
        answer: null,
        goalId: null,
        goalTitle: null,
        focusId: null,
        focusTitle: null,
        contextType: null,
        contextRef: null,
        isResolved: false,
        createdAt: "2026-05-26T10:00:00.000Z",
        updatedAt: "2026-05-26T10:00:00.000Z",
        resolvedAt: null,
      },
    ],
    unresolvedObservationCount: 0,
    unansweredQuestionCount: 1,
    goalOptions: [],
  };
}

const signedInUser = {
  id: "user-123",
  email: "swimmer@example.com",
};

describe("MyLibraryTrainingPage", () => {
  beforeEach(() => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: { from: vi.fn() },
      user: signedInUser,
    });
    loadTrainingContextSnapshotMock.mockResolvedValue(buildSnapshot());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("uses the My Library token shell while preserving route actions and analytics", async () => {
    render(await MyLibraryTrainingPage({ searchParams: Promise.resolve({}) }));

    const workspace = screen.getByTestId("my-training-workspace");
    expect(workspace).toHaveClass("max-w-[1040px]", "pt-24", "sm:pt-28");
    expect(screen.getByTestId("site-chrome")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "My Training", level: 1 })).toHaveClass(
      "text-[color:var(--fs-color-ink-strong)]"
    );

    const actions = screen.getByTestId("my-training-route-actions");
    const openGoals = within(actions).getByRole("link", { name: "Open goals" });
    expect(openGoals).toHaveAttribute("href", "/my-library/goals");
    expect(openGoals).toHaveClass("fs-cta-secondary");
    const backLink = within(actions).getByRole("link", { name: "Back to My Library" });
    expect(backLink).toHaveAttribute("href", "/my-library");
    expect(backLink).toHaveClass("fs-cta-secondary");

    expect(screen.getByTestId("training-context-hub")).toBeInTheDocument();
    expect(loadTrainingContextSnapshotMock).toHaveBeenCalledWith(
      expect.any(Object),
      signedInUser.id
    );
    expect(trackEventOnMountMock).toHaveBeenCalledWith({
      eventName: "training_context_viewed",
      payload: {
        hasPrimaryFocus: false,
        openFocusCount: 1,
        noteCount: 1,
      },
    });
  });

  it("keeps Goals bridge query parsing owned by the route", async () => {
    render(
      await MyLibraryTrainingPage({
        searchParams: Promise.resolve({ goalId: "goal-1", intent: "note" }),
      })
    );

    const hub = screen.getByTestId("training-context-hub");
    expect(hub).toHaveAttribute("data-prefill-goal", "goal-1");
    expect(hub).toHaveAttribute("data-prefill-intent", "note");
  });

  it("preserves the anonymous auth redirect", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: null,
      user: null,
    });

    await expect(MyLibraryTrainingPage({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      "NEXT_REDIRECT:/auth/sign-in?next=%2Fmy-library%2Ftraining"
    );
  });
});
