import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MyLibraryGeneratorPage from "@/app/my-library/generator/page";
import type { GeneratorIntakeSnapshot } from "@/lib/generator-intake/shared";
import type { WorkoutLibrarySnapshot } from "@/lib/workouts/shared";

const {
  getServerSupabaseUserIfAuthCookiePresentMock,
  loadGeneratorIntakeSnapshotMock,
  loadWorkoutLibrarySnapshotMock,
  trackEventOnMountMock,
} = vi.hoisted(() => ({
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
  loadGeneratorIntakeSnapshotMock: vi.fn(),
  loadWorkoutLibrarySnapshotMock: vi.fn(),
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

vi.mock("@/components/my-library/generator/GeneratorIntakeHub", () => ({
  default: ({
    initialSnapshot,
    userId,
    workoutLibrary,
  }: {
    initialSnapshot: GeneratorIntakeSnapshot;
    userId: string;
    workoutLibrary: WorkoutLibrarySnapshot;
  }) => (
    <div
      data-testid="generator-intake-hub"
      data-loaded-at={initialSnapshot.loadedAt}
      data-user-id={userId}
      data-workout-load-error={workoutLibrary.loadError ?? ""}
    />
  ),
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/lib/generator-intake/server", () => ({
  loadGeneratorIntakeSnapshot: loadGeneratorIntakeSnapshotMock,
}));

vi.mock("@/lib/workouts/server", () => ({
  loadWorkoutLibrarySnapshot: loadWorkoutLibrarySnapshotMock,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

const signedInUser = {
  id: "user-123",
  email: "swimmer@example.com",
};

function buildSnapshot(): GeneratorIntakeSnapshot {
  return {
    loadedAt: "2026-03-20T10:00:00.000Z",
    notesIncluded: false,
    openGoals: [{ id: "goal-1" }],
    activeFocus: { id: "focus-1" },
    blocks: {
      preferences: { available: true },
      css: { available: true },
      personal_records: { available: false },
      goals: { available: true },
      capability_limits: { available: false },
    },
  } as unknown as GeneratorIntakeSnapshot;
}

function buildWorkoutLibrary(): WorkoutLibrarySnapshot {
  return {
    schemaReady: true,
    loadError: null,
    selectedWorkout: null,
    selectedWorkoutMissing: false,
    recentWorkouts: [],
  };
}

describe("MyLibraryGeneratorPage", () => {
  beforeEach(() => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: { from: vi.fn() },
      user: signedInUser,
    });
    loadGeneratorIntakeSnapshotMock.mockResolvedValue(buildSnapshot());
    loadWorkoutLibrarySnapshotMock.mockResolvedValue(buildWorkoutLibrary());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("uses the My Library token shell while preserving actions and analytics", async () => {
    render(await MyLibraryGeneratorPage({ searchParams: Promise.resolve({}) }));

    const workspace = screen.getByTestId("ai-session-generator-workspace");
    expect(workspace).toHaveClass("max-w-[1040px]", "pt-24", "sm:pt-28");
    expect(screen.getByTestId("site-chrome")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "AI swim session generator", level: 1 })
    ).toHaveClass("text-[color:var(--fs-color-ink-strong)]");

    const actions = screen.getByTestId("generator-route-actions");
    const swimSessionsLink = within(actions).getByRole("link", { name: "My Swim Sessions" });
    const backLink = within(actions).getByRole("link", { name: "Back to My Library" });
    expect(swimSessionsLink).toHaveAttribute("href", "/my-library/workouts");
    expect(swimSessionsLink).toHaveClass("fs-cta-secondary");
    expect(backLink).toHaveAttribute("href", "/my-library");
    expect(backLink).toHaveClass("fs-cta-secondary");

    expect(screen.getByTestId("generator-intake-hub")).toHaveAttribute("data-user-id", "user-123");
    expect(loadGeneratorIntakeSnapshotMock).toHaveBeenCalledWith(
      expect.any(Object),
      signedInUser.id
    );
    expect(loadWorkoutLibrarySnapshotMock).toHaveBeenCalledWith(
      expect.any(Object),
      signedInUser.id,
      null
    );
    expect(trackEventOnMountMock).toHaveBeenCalledWith({
      eventName: "generator_intake_viewed",
      payload: {
        availableBlockCount: 3,
        hasOpenGoals: true,
        hasPrimaryFocus: true,
        notesIncluded: false,
      },
    });
  });

  it("keeps selected workout links routed to the workout builder", async () => {
    const workoutId = "123e4567-e89b-12d3-a456-426614174000";

    await expect(
      MyLibraryGeneratorPage({ searchParams: Promise.resolve({ workout: workoutId }) })
    ).rejects.toThrow(`NEXT_REDIRECT:/my-library/workouts/${workoutId}`);
    expect(getServerSupabaseUserIfAuthCookiePresentMock).not.toHaveBeenCalled();
  });

  it("preserves the anonymous auth redirect", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: null,
      user: null,
    });

    await expect(MyLibraryGeneratorPage({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      "NEXT_REDIRECT:/auth/sign-in?next=%2Fmy-library%2Fgenerator"
    );
  });
});
