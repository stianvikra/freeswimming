import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MyLibraryProfilePage from "@/app/my-library/profile/page";
import type { AthleteProfileSnapshot } from "@/lib/athlete-profile/server";

const {
  getServerSupabaseUserIfAuthCookiePresentMock,
  loadAthleteProfileSnapshotMock,
  trackEventOnMountMock,
} = vi.hoisted(() => ({
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
  loadAthleteProfileSnapshotMock: vi.fn(),
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

vi.mock("@/components/my-library/profile/AthleteProfileHub", () => ({
  default: ({ userId }: { initialSnapshot: AthleteProfileSnapshot; userId: string }) => (
    <div data-testid="athlete-profile-hub" data-user-id={userId} />
  ),
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/lib/athlete-profile/server", () => ({
  loadAthleteProfileSnapshot: loadAthleteProfileSnapshotMock,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

function buildSnapshot(): AthleteProfileSnapshot {
  return {
    profileSchemaReady: true,
    metricsSchemaReady: true,
    preferencesSchemaReady: true,
    personalRecordsSchemaReady: true,
    swimCapabilityLimitsSchemaReady: true,
    loadError: null,
    metricsLoadError: null,
    preferencesLoadError: null,
    personalRecordsLoadError: null,
    swimCapabilityLimitsLoadError: null,
    profile: null,
    cssMetric: null,
    preferences: null,
    personalRecords: [],
    swimCapabilityLimits: [],
  };
}

const signedInUser = {
  id: "user-123",
  email: "swimmer@example.com",
};

describe("MyLibraryProfilePage", () => {
  beforeEach(() => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: { from: vi.fn() },
      user: signedInUser,
    });
    loadAthleteProfileSnapshotMock.mockResolvedValue(buildSnapshot());
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("uses the My Library token shell while preserving route action and analytics", async () => {
    render(await MyLibraryProfilePage());

    const workspace = screen.getByTestId("my-swim-profile-workspace");
    expect(workspace).toHaveClass("max-w-[1040px]", "pt-24", "sm:pt-28");
    expect(screen.getByTestId("site-chrome")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "My Swim Profile", level: 1 })).toHaveClass(
      "text-[color:var(--fs-color-ink-strong)]"
    );

    const actions = screen.getByTestId("my-swim-profile-route-actions");
    const backLink = within(actions).getByRole("link", { name: "Back to My Library" });
    expect(backLink).toHaveAttribute("href", "/my-library");
    expect(backLink).toHaveClass("fs-cta-secondary");

    expect(screen.getByTestId("athlete-profile-hub")).toHaveAttribute(
      "data-user-id",
      signedInUser.id
    );
    expect(loadAthleteProfileSnapshotMock).toHaveBeenCalledWith(
      expect.any(Object),
      signedInUser.id
    );
    expect(trackEventOnMountMock).toHaveBeenCalledWith({
      eventName: "athlete_profile_viewed",
      payload: {
        hasProfile: false,
        hasCssMetric: false,
        hasPreferences: false,
        personalRecordCount: 0,
        hasSwimCapabilityLimits: false,
        swimCapabilityLimitCount: 0,
        profileSchemaReady: true,
        metricsSchemaReady: true,
        preferencesSchemaReady: true,
        personalRecordsSchemaReady: true,
        swimCapabilityLimitsSchemaReady: true,
      },
    });
  });

  it("preserves the anonymous auth redirect", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: null,
      user: null,
    });

    await expect(MyLibraryProfilePage()).rejects.toThrow(
      "NEXT_REDIRECT:/auth/sign-in?next=%2Fmy-library%2Fprofile"
    );
  });
});
