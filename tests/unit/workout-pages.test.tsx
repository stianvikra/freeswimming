import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import WorkoutBuilderPage from "@/app/my-library/workouts/[workoutId]/page";
import WorkoutSessionsPage from "@/app/my-library/workouts/page";
import type { AthleteProfileSnapshot } from "@/lib/athlete-profile/server";
import type { TrainingContextSnapshot } from "@/lib/training-context/server";
import type { ManualWorkoutBuilderMode } from "@/lib/workouts/manual";
import type { WorkoutLibrarySnapshot, WorkoutPoolsideFocusOption } from "@/lib/workouts/shared";

const {
  getServerSupabaseUserIfAuthCookiePresentMock,
  loadAthleteProfileSnapshotMock,
  loadTrainingContextSnapshotMock,
  loadWorkoutLibrarySnapshotMock,
} = vi.hoisted(() => ({
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
  loadAthleteProfileSnapshotMock: vi.fn(),
  loadTrainingContextSnapshotMock: vi.fn(),
  loadWorkoutLibrarySnapshotMock: vi.fn(),
}));

vi.mock("@/components/SiteChrome", () => ({
  default: ({
    children,
    mobileNavMode,
  }: {
    children: ReactNode;
    mobileNavMode?: "default" | "hidden";
  }) => (
    <div data-mobile-nav-mode={mobileNavMode ?? "default"} data-testid="site-chrome">
      {children}
    </div>
  ),
}));

vi.mock("@/components/my-library/workouts/WorkoutBuilderHub", () => ({
  default: ({
    browseOnly,
    hideShellIntro,
    manualLocalDraftMode,
    preferExpandedDetailsOnLoad,
    trainingFocusOptions,
    workoutLibrary,
  }: {
    workoutLibrary: WorkoutLibrarySnapshot;
    trainingFocusOptions: WorkoutPoolsideFocusOption[];
    browseOnly?: boolean;
    hideShellIntro?: boolean;
    preferExpandedDetailsOnLoad?: boolean;
    manualLocalDraftMode?: ManualWorkoutBuilderMode | null;
  }) => (
    <div
      data-testid="workout-builder-hub"
      data-browse-only={browseOnly ? "true" : "false"}
      data-hide-shell-intro={hideShellIntro ? "true" : "false"}
      data-manual-local-draft-mode={manualLocalDraftMode ?? ""}
      data-prefer-expanded-details-on-load={preferExpandedDetailsOnLoad ? "true" : "false"}
      data-recent-count={workoutLibrary.recentWorkouts.length}
      data-selected-workout-id={workoutLibrary.selectedWorkout?.id ?? ""}
      data-training-focus-count={trainingFocusOptions.length}
    />
  ),
}));

vi.mock("@/lib/athlete-profile/server", () => ({
  loadAthleteProfileSnapshot: loadAthleteProfileSnapshotMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/lib/training-context/server", () => ({
  loadTrainingContextSnapshot: loadTrainingContextSnapshotMock,
}));

vi.mock("@/lib/workouts/server", () => ({
  loadWorkoutLibrarySnapshot: loadWorkoutLibrarySnapshotMock,
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

const signedInUser = {
  id: "user-123",
  email: "swimmer@example.com",
};

function buildWorkoutLibrary(
  overrides: Partial<WorkoutLibrarySnapshot> = {}
): WorkoutLibrarySnapshot {
  return {
    schemaReady: true,
    loadError: null,
    selectedWorkout: null,
    selectedWorkoutMissing: false,
    recentWorkouts: [],
    ...overrides,
  };
}

function buildSelectedWorkout(environment: "pool" | "open_water" = "pool") {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    draft: { environment },
  } as unknown as WorkoutLibrarySnapshot["selectedWorkout"];
}

function buildTrainingSnapshot(): TrainingContextSnapshot {
  return {
    schemaReady: true,
    loadError: null,
    openFocuses: [
      {
        id: "focus-1",
        title: "Quiet catch",
        details: "Hold shape through the pull.",
        isPrimary: true,
      },
    ],
  } as unknown as TrainingContextSnapshot;
}

function buildAthleteProfileSnapshot(): AthleteProfileSnapshot {
  return {
    profile: { primaryName: "Stian" },
    cssMetric: { valueSeconds: 92, paceLabel: "1:32 / 100m" },
  } as unknown as AthleteProfileSnapshot;
}

describe("My Swim Sessions workspace pages", () => {
  beforeEach(() => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: { from: vi.fn() },
      user: signedInUser,
    });
    loadWorkoutLibrarySnapshotMock.mockResolvedValue(buildWorkoutLibrary());
    loadTrainingContextSnapshotMock.mockResolvedValue(buildTrainingSnapshot());
    loadAthleteProfileSnapshotMock.mockResolvedValue(buildAthleteProfileSnapshot());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("uses the My Library token shell on the My Swim Sessions browse route", async () => {
    render(await WorkoutSessionsPage({ searchParams: Promise.resolve({}) }));

    const workspace = screen.getByTestId("workout-builder-route-shell");
    expect(workspace).toHaveClass("max-w-[1040px]", "pt-24", "sm:pt-28");
    expect(screen.getByTestId("workout-builder-page-card")).toHaveClass("space-y-6");
    expect(screen.getByRole("heading", { name: "My Swim Sessions", level: 1 })).toHaveClass(
      "text-[color:var(--fs-color-ink-strong)]"
    );

    const actions = screen.getByTestId("workout-route-actions");
    expect(actions).toHaveClass("grid", "w-full", "grid-cols-1");
    const backLink = within(actions).getByRole("link", { name: "Back to My Library" });
    expect(backLink).toHaveAttribute("href", "/my-library");
    expect(backLink).toHaveClass("fs-cta-secondary", "w-full", "sm:w-auto");

    expect(screen.getByTestId("site-chrome")).toHaveAttribute("data-mobile-nav-mode", "default");
    expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute("data-browse-only", "true");
    expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
      "data-training-focus-count",
      "1"
    );
    expect(loadWorkoutLibrarySnapshotMock).toHaveBeenCalledWith(
      expect.any(Object),
      signedInUser.id,
      null
    );
  });

  it("keeps manual draft modes focused while using token route actions", async () => {
    render(
      await WorkoutSessionsPage({
        searchParams: Promise.resolve({ draft: "pool", entry: "manual-pool" }),
      })
    );

    expect(screen.getByRole("heading", { name: "Pool session builder", level: 1 })).toHaveClass(
      "text-[color:var(--fs-color-ink-strong)]"
    );
    const backLink = within(screen.getByTestId("workout-route-actions")).getByRole("link", {
      name: "Back to My Swim Sessions",
    });
    expect(backLink).toHaveAttribute("href", "/my-library/workouts");
    expect(backLink).toHaveClass("fs-cta-secondary", "w-full", "sm:w-auto");
    expect(screen.getByTestId("site-chrome")).toHaveAttribute("data-mobile-nav-mode", "hidden");
    expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute("data-browse-only", "false");
    expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
      "data-hide-shell-intro",
      "true"
    );
    expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
      "data-manual-local-draft-mode",
      "pool"
    );
    expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
      "data-prefer-expanded-details-on-load",
      "true"
    );
  });

  it("uses the My Library token shell on the focused workout builder route", async () => {
    loadWorkoutLibrarySnapshotMock.mockResolvedValue(
      buildWorkoutLibrary({ selectedWorkout: buildSelectedWorkout("pool") })
    );

    render(
      await WorkoutBuilderPage({
        params: Promise.resolve({ workoutId: "11111111-1111-4111-8111-111111111111" }),
        searchParams: Promise.resolve({}),
      })
    );

    const workspace = screen.getByTestId("workout-builder-route-shell");
    expect(workspace).toHaveClass("max-w-[1040px]", "pt-24", "sm:pt-28");
    expect(screen.getByRole("heading", { name: "Pool session builder", level: 1 })).toHaveClass(
      "text-[color:var(--fs-color-ink-strong)]"
    );

    const actions = screen.getByTestId("workout-builder-route-actions");
    expect(actions).toHaveClass("grid", "w-full", "grid-cols-1");
    const backLink = within(actions).getByRole("link", { name: "Back to My Swim Sessions" });
    expect(backLink).toHaveAttribute("href", "/my-library/workouts");
    expect(backLink).toHaveClass("fs-cta-secondary", "w-full", "sm:w-auto");
    expect(screen.getByTestId("site-chrome")).toHaveAttribute("data-mobile-nav-mode", "hidden");
    expect(screen.getByTestId("workout-builder-hub")).toHaveAttribute(
      "data-selected-workout-id",
      "11111111-1111-4111-8111-111111111111"
    );
    expect(loadWorkoutLibrarySnapshotMock).toHaveBeenCalledWith(
      expect.any(Object),
      signedInUser.id,
      "11111111-1111-4111-8111-111111111111"
    );
  });

  it("preserves anonymous redirects and invalid workout id handling", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: null,
      user: null,
    });

    await expect(WorkoutSessionsPage({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      "NEXT_REDIRECT:/auth/sign-in?next=%2Fmy-library%2Fworkouts"
    );
    await expect(
      WorkoutBuilderPage({
        params: Promise.resolve({ workoutId: "11111111-1111-4111-8111-111111111111" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow(
      "NEXT_REDIRECT:/auth/sign-in?next=%2Fmy-library%2Fworkouts%2F11111111-1111-4111-8111-111111111111"
    );
    await expect(
      WorkoutBuilderPage({
        params: Promise.resolve({ workoutId: "not-a-workout-id" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
