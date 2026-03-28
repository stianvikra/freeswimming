import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LibrarySectionTabs from "@/components/my-library/LibrarySectionTabs";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";

vi.mock("@/lib/analytics/client", () => ({
  sendClientAnalyticsEvent: vi.fn(),
}));

describe("LibrarySectionTabs", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("tracks section-nav switches to library and explore", () => {
    render(<LibrarySectionTabs showExploreTab />);

    expect(screen.getByText("Owned")).toBeVisible();
    expect(screen.getByText("Explore")).toBeVisible();

    fireEvent.click(screen.getByRole("link", { name: "Jump to owned items" }));
    fireEvent.click(screen.getByRole("link", { name: "Jump to explore section" }));

    expect(sendClientAnalyticsEvent).toHaveBeenNthCalledWith(1, "library_tab_switched", {
      tab: "library",
      source: "library_section_nav",
    });
    expect(sendClientAnalyticsEvent).toHaveBeenNthCalledWith(2, "library_tab_switched", {
      tab: "explore",
      source: "library_section_nav",
    });
  });

  it("hides explore link when disabled", () => {
    render(<LibrarySectionTabs showExploreTab={false} />);

    expect(screen.getByRole("link", { name: "Jump to owned items" })).toBeInTheDocument();
    expect(screen.getByText("Owned")).toBeVisible();
    expect(screen.queryByText("Explore")).toBeNull();
    expect(screen.queryByRole("link", { name: "Jump to explore section" })).toBeNull();
  });
});
