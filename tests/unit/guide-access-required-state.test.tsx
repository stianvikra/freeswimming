import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Guide0To1000Page from "@/app/guides/0-1000m/page";
import GuidePoolsidePage from "@/app/guides/poolside/page";
import GuideAccessRequiredState from "@/components/guides/GuideAccessRequiredState";
import { GUIDE_0_TO_1000M_PRODUCT_ID } from "@/lib/guides/guide-0-1000m";
import { GUIDE_POOLSIDE_PRODUCT_ID } from "@/lib/guides/guide-poolside";

const {
  attachGuestEntitlementsByEmailMock,
  createAdminSupabaseClientMock,
  getServerSupabaseUserIfAuthCookiePresentMock,
} = vi.hoisted(() => ({
  attachGuestEntitlementsByEmailMock: vi.fn(),
  createAdminSupabaseClientMock: vi.fn(),
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
}));

vi.mock("@/components/SiteChrome", () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="site-chrome">{children}</div>
  ),
}));

vi.mock("@/components/guides/GuidePdfDownloadButton", () => ({
  default: () => <button type="button">Download PDF</button>,
}));

vi.mock("@/components/guides/Guide0To1000Tracker", () => ({
  default: () => <div data-testid="guide-0-1000m-tracker" />,
}));

vi.mock("@/components/guides/PoolsideGuideTracker", () => ({
  default: () => <div data-testid="guide-poolside-tracker" />,
}));

vi.mock("@/lib/admin/content-published", () => ({
  loadPublishedGuide0To1000Sessions: vi.fn().mockResolvedValue([]),
  loadPublishedPoolsideDrills: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/commerce/entitlements", () => ({
  attachGuestEntitlementsByEmail: attachGuestEntitlementsByEmailMock,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: createAdminSupabaseClientMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

function buildEntitlementSupabase(result: { data: unknown; error: Error | null }) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };

  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.limit.mockReturnValue(query);

  const supabase = {
    from: vi.fn(() => query),
  };

  return { supabase, query };
}

const signedInUser = {
  id: "user_123",
  email: "swimmer@example.com",
};

describe("GuideAccessRequiredState", () => {
  beforeEach(() => {
    createAdminSupabaseClientMock.mockReturnValue({ from: vi.fn() });
    attachGuestEntitlementsByEmailMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders 0-1000m access copy, token card, and safe actions", () => {
    render(
      <GuideAccessRequiredState
        guideLabel="0-1000m guide"
        description="Add 0-1000m guide to your library to open the interactive plan and download the offline PDF."
      />
    );

    const state = screen.getByTestId("guide-access-required-state");
    expect(state).toHaveAttribute("data-guide-label", "0-1000m guide");
    expect(state).toHaveClass("fs-library-card", "fs-library-card-accent");
    expect(within(state).getByText("Guide access")).toBeInTheDocument();
    expect(within(state).getByRole("heading", { level: 1 })).toHaveTextContent(
      "Guide access required"
    );
    expect(
      within(state).getByText(
        "Add 0-1000m guide to your library to open the interactive plan and download the offline PDF."
      )
    ).toBeInTheDocument();
    expect(within(state).getByRole("link", { name: "View plans" })).toHaveAttribute(
      "href",
      "/plans"
    );
    expect(within(state).getByRole("link", { name: "Back to My Library" })).toHaveAttribute(
      "href",
      "/my-library"
    );
  });

  it("renders Poolside-specific access copy through the same presentation contract", () => {
    render(
      <GuideAccessRequiredState
        guideLabel="Poolside guide"
        description="Add Poolside guide to your library to open the interactive poolside drills and download the offline PDF."
      />
    );

    const state = screen.getByTestId("guide-access-required-state");
    expect(state).toHaveAttribute("data-guide-label", "Poolside guide");
    expect(
      within(state).getByText(
        "Add Poolside guide to your library to open the interactive poolside drills and download the offline PDF."
      )
    ).toBeInTheDocument();
  });

  it("falls back to generic copy for future or unknown guide configs", () => {
    render(<GuideAccessRequiredState guideLabel=" " description=" " />);

    const state = screen.getByTestId("guide-access-required-state");
    expect(state).toHaveAttribute("data-guide-label", "this guide");
    expect(
      within(state).getByText("This guide appears when it is in your library.")
    ).toBeInTheDocument();
  });

  it("keeps the 0-1000m route fail-closed for signed-in users without entitlement", async () => {
    const { supabase, query } = buildEntitlementSupabase({ data: null, error: null });
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase,
      user: signedInUser,
    });

    render(await Guide0To1000Page());

    expect(screen.getByTestId("site-chrome")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Guide access required" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Add 0-1000m guide to your library to open the interactive plan and download the offline PDF."
      )
    ).toBeInTheDocument();
    expect(supabase.from).toHaveBeenCalledWith("entitlements");
    expect(query.eq).toHaveBeenCalledWith("product_id", GUIDE_0_TO_1000M_PRODUCT_ID);
    expect(query.eq).toHaveBeenCalledWith("user_id", signedInUser.id);
    expect(attachGuestEntitlementsByEmailMock).toHaveBeenCalledWith(
      expect.any(Object),
      signedInUser.id,
      signedInUser.email
    );
  });

  it("keeps the Poolside route fail-closed for signed-in users without entitlement", async () => {
    const { supabase, query } = buildEntitlementSupabase({ data: null, error: null });
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase,
      user: signedInUser,
    });

    render(await GuidePoolsidePage());

    expect(screen.getByTestId("site-chrome")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Guide access required" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Add Poolside guide to your library to open the interactive poolside drills and download the offline PDF."
      )
    ).toBeInTheDocument();
    expect(supabase.from).toHaveBeenCalledWith("entitlements");
    expect(query.eq).toHaveBeenCalledWith("product_id", GUIDE_POOLSIDE_PRODUCT_ID);
    expect(query.eq).toHaveBeenCalledWith("user_id", signedInUser.id);
  });

  it("preserves anonymous redirects on guide routes", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: null,
      user: null,
    });

    await expect(Guide0To1000Page()).rejects.toThrow(
      "NEXT_REDIRECT:/auth/sign-in?next=%2Fguides%2F0-1000m"
    );
    await expect(GuidePoolsidePage()).rejects.toThrow(
      "NEXT_REDIRECT:/auth/sign-in?next=%2Fguides%2Fpoolside"
    );
  });
});
