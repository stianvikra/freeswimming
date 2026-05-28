import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProgramBuilderPage from "@/app/my-library/programs/[programId]/page";
import type { ProgramLibrarySnapshot } from "@/lib/programs/shared";

const {
  getServerSupabaseUserIfAuthCookiePresentMock,
  loadProgramLibrarySnapshotMock,
  notFoundMock,
  redirectMock,
} = vi.hoisted(() => ({
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
  loadProgramLibrarySnapshotMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirectMock: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock("@/components/SiteChrome", () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="site-chrome">{children}</div>
  ),
}));

vi.mock("@/components/my-library/programs/CreateManualProgramButton", () => ({
  default: ({ className, testId }: { className?: string; testId?: string }) => (
    <button type="button" data-testid={testId} className={className}>
      Create program
    </button>
  ),
}));

vi.mock("@/components/my-library/programs/ProgramBuilderHub", () => ({
  default: ({ programLibrary }: { programLibrary: ProgramLibrarySnapshot }) => (
    <div
      data-testid="program-builder-hub"
      data-recent-count={programLibrary.recentPrograms.length}
      data-selected-program-id={programLibrary.selectedProgram?.id ?? ""}
    />
  ),
}));

vi.mock("@/lib/programs/server", () => ({
  loadProgramLibrarySnapshot: loadProgramLibrarySnapshotMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
  redirect: redirectMock,
}));

const programId = "11111111-1111-4111-8111-111111111111";
const signedInUser = {
  id: "user-123",
  email: "swimmer@example.com",
};

function buildProgramLibrary(): ProgramLibrarySnapshot {
  return {
    schemaReady: true,
    loadError: null,
    selectedProgram: {
      id: programId,
      createdAt: "2026-03-25T12:00:00.000Z",
      updatedAt: "2026-03-25T12:05:00.000Z",
      sourceKind: "manual",
      status: "draft",
      title: "Manual race prep shell",
      weeks: [{ id: "week-1", label: "Week 1", assignments: [] }],
    },
    selectedProgramMissing: false,
    recentPrograms: [
      {
        id: programId,
        title: "Manual race prep shell",
        weekCount: 1,
        assignmentCount: 0,
        updatedAt: "2026-03-25T12:05:00.000Z",
        sourceKind: "manual",
        status: "draft",
      },
    ],
    availableWorkouts: [],
    missingWorkoutIds: [],
  };
}

describe("Program Builder workspace page", () => {
  beforeEach(() => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: { from: vi.fn() },
      user: signedInUser,
    });
    loadProgramLibrarySnapshotMock.mockResolvedValue(buildProgramLibrary());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the authenticated program builder route with My Library token actions", async () => {
    render(await ProgramBuilderPage({ params: Promise.resolve({ programId }) }));

    expect(screen.getByTestId("site-chrome")).toBeInTheDocument();
    expect(screen.getByTestId("program-builder-route-shell")).toHaveClass(
      "max-w-[1120px]",
      "pt-24"
    );
    expect(screen.getByTestId("program-builder-page-card")).toHaveClass("space-y-6");
    expect(screen.getByRole("heading", { level: 1, name: "Program builder" })).toHaveClass(
      "text-2xl",
      "text-[color:var(--fs-color-ink-strong)]"
    );

    const actions = screen.getByTestId("program-builder-route-actions");
    expect(within(actions).getByRole("button", { name: "Create program" })).toHaveClass(
      "fs-cta-primary",
      "min-h-10"
    );
    const backLink = within(actions).getByRole("link", { name: "Back to My Library" });
    expect(backLink).toHaveAttribute("href", "/my-library");
    expect(backLink).toHaveClass("fs-cta-secondary", "min-h-10");

    expect(screen.getByTestId("program-builder-hub")).toHaveAttribute(
      "data-selected-program-id",
      programId
    );
    expect(loadProgramLibrarySnapshotMock).toHaveBeenCalledWith(
      expect.anything(),
      signedInUser.id,
      programId
    );
  });

  it("redirects anonymous users to sign in with the program route as next target", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: null,
      user: null,
    });

    await expect(ProgramBuilderPage({ params: Promise.resolve({ programId }) })).rejects.toThrow(
      `NEXT_REDIRECT:/auth/sign-in?next=${encodeURIComponent(`/my-library/programs/${programId}`)}`
    );
    expect(loadProgramLibrarySnapshotMock).not.toHaveBeenCalled();
  });

  it("rejects invalid program route params before loading protected data", async () => {
    await expect(
      ProgramBuilderPage({ params: Promise.resolve({ programId: "not-a-program" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(getServerSupabaseUserIfAuthCookiePresentMock).not.toHaveBeenCalled();
    expect(loadProgramLibrarySnapshotMock).not.toHaveBeenCalled();
  });
});
