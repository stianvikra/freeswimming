import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DrylandBuilderPage from "@/app/my-library/dryland/[sessionId]/page";
import DrylandSessionsPage from "@/app/my-library/dryland/page";
import type { DrylandLibrarySnapshot } from "@/lib/dryland/shared";

const { getServerSupabaseUserIfAuthCookiePresentMock, loadDrylandLibrarySnapshotMock } = vi.hoisted(
  () => ({
    getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
    loadDrylandLibrarySnapshotMock: vi.fn(),
  })
);

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

vi.mock("@/components/my-library/dryland/DrylandBuilderHub", () => ({
  default: ({
    drylandLibrary,
    browseOnly,
    initialMicroPlanEditorOpen,
    isMicroFocused,
    preferMobileBubbles,
  }: {
    drylandLibrary: DrylandLibrarySnapshot;
    browseOnly?: boolean;
    initialMicroPlanEditorOpen?: boolean;
    isMicroFocused?: boolean;
    preferMobileBubbles?: boolean;
  }) => (
    <div
      data-testid="dryland-builder-hub"
      data-browse-only={browseOnly ? "true" : "false"}
      data-initial-micro-plan-editor-open={initialMicroPlanEditorOpen ? "true" : "false"}
      data-is-micro-focused={isMicroFocused ? "true" : "false"}
      data-prefer-mobile-bubbles={preferMobileBubbles ? "true" : "false"}
      data-recent-count={drylandLibrary.recentSessions.length}
    />
  ),
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/lib/dryland/server", () => ({
  loadDrylandLibrarySnapshot: loadDrylandLibrarySnapshotMock,
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

function buildDrylandLibrary(): DrylandLibrarySnapshot {
  return {
    schemaReady: true,
    microPlanSchemaReady: true,
    loadError: null,
    microPlanLoadError: null,
    selectedSession: null,
    selectedSessionMissing: false,
    recentSessions: [],
    microPlan: null,
  } as DrylandLibrarySnapshot;
}

describe("Dryland workspace pages", () => {
  beforeEach(() => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: { from: vi.fn() },
      user: signedInUser,
    });
    loadDrylandLibrarySnapshotMock.mockResolvedValue(buildDrylandLibrary());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("uses the My Library token shell on the Dryland Sessions route", async () => {
    render(await DrylandSessionsPage({ searchParams: Promise.resolve({}) }));

    const workspace = screen.getByTestId("dryland-workspace");
    expect(workspace).toHaveClass("max-w-[1080px]", "pt-20", "sm:pt-28");
    expect(screen.getByRole("heading", { name: "Dryland Sessions", level: 1 })).toHaveClass(
      "text-[color:var(--fs-color-ink-strong)]"
    );

    const actions = screen.getByTestId("dryland-route-actions");
    expect(actions).toHaveClass("grid", "w-full", "grid-cols-1");
    const backLink = within(actions).getByRole("link", { name: "Back to My Library" });
    expect(backLink).toHaveAttribute("href", "/my-library");
    expect(backLink).toHaveClass("fs-cta-secondary", "w-full", "sm:w-auto");

    expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute("data-browse-only", "true");
    expect(loadDrylandLibrarySnapshotMock).toHaveBeenCalledWith(
      expect.any(Object),
      signedInUser.id,
      null
    );
  });

  it("keeps the Micro Sessions focused route shell hidden on mobile", async () => {
    render(
      await DrylandSessionsPage({
        searchParams: Promise.resolve({ micro: "edit", view: "auto" }),
      })
    );

    const microHeadings = screen.getAllByRole("heading", { name: "Micro Sessions", level: 1 });
    expect(microHeadings[0]).toHaveClass("sr-only");
    expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute(
      "data-is-micro-focused",
      "true"
    );
    expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute(
      "data-prefer-mobile-bubbles",
      "true"
    );
    expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute(
      "data-initial-micro-plan-editor-open",
      "true"
    );
  });

  it("uses token route actions on the Dryland builder detail route", async () => {
    render(
      await DrylandBuilderPage({
        params: Promise.resolve({ sessionId: "11111111-1111-4111-8111-111111111111" }),
      })
    );

    const workspace = screen.getByTestId("dryland-builder-workspace");
    expect(workspace).toHaveClass("max-w-[1080px]", "pt-24", "sm:pt-28");
    expect(screen.getByRole("heading", { name: "Dryland builder", level: 1 })).toHaveClass(
      "text-[color:var(--fs-color-ink-strong)]"
    );

    const actions = screen.getByTestId("dryland-builder-route-actions");
    expect(actions).toHaveClass("grid", "w-full", "grid-cols-2");
    expect(within(actions).getByRole("link", { name: "Dryland Sessions" })).toHaveClass(
      "fs-cta-secondary",
      "w-full",
      "sm:w-auto"
    );
    expect(within(actions).getByRole("link", { name: "Back to My Library" })).toHaveClass(
      "fs-cta-secondary",
      "w-full",
      "sm:w-auto"
    );
    expect(screen.getByTestId("site-chrome")).toHaveAttribute("data-mobile-nav-mode", "hidden");
    expect(screen.getByTestId("dryland-builder-hub")).toHaveAttribute("data-browse-only", "false");
    expect(loadDrylandLibrarySnapshotMock).toHaveBeenCalledWith(
      expect.any(Object),
      signedInUser.id,
      "11111111-1111-4111-8111-111111111111"
    );
  });

  it("preserves anonymous redirects for Dryland routes", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: null,
      user: null,
    });

    await expect(DrylandSessionsPage({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      "NEXT_REDIRECT:/auth/sign-in?next=%2Fmy-library%2Fdryland"
    );
    await expect(
      DrylandBuilderPage({
        params: Promise.resolve({ sessionId: "11111111-1111-4111-8111-111111111111" }),
      })
    ).rejects.toThrow(
      "NEXT_REDIRECT:/auth/sign-in?next=%2Fmy-library%2Fdryland%2F11111111-1111-4111-8111-111111111111"
    );
  });
});
