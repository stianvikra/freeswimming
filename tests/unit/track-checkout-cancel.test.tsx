import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import TrackCheckoutCancel from "@/components/analytics/TrackCheckoutCancel";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";

const navigationState = vi.hoisted(() => ({
  pathname: "/plans",
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
  useSearchParams: () => navigationState.searchParams,
}));

vi.mock("@/lib/analytics/client", () => ({
  sendClientAnalyticsEvent: vi.fn(),
}));

describe("TrackCheckoutCancel", () => {
  afterEach(() => {
    vi.clearAllMocks();
    navigationState.pathname = "/plans";
    navigationState.searchParams = new URLSearchParams();
    window.sessionStorage.clear();
  });

  it("tracks upsell_declined when checkout return has cancelled flag", async () => {
    navigationState.pathname = "/plans";
    navigationState.searchParams = new URLSearchParams({
      checkout: "cancelled",
      source: "plans",
      product: "guide_0_1000m",
    });

    render(<TrackCheckoutCancel surface="plans" />);

    await waitFor(() => {
      expect(sendClientAnalyticsEvent).toHaveBeenCalledWith("upsell_declined", {
        surface: "plans",
        source: "plans",
        productId: "guide_0_1000m",
        reason: "checkout_cancelled",
      });
    });
  });

  it("tracks mapped workout-context checkout cancel only with approved dimensions", async () => {
    navigationState.pathname = "/plans";
    navigationState.searchParams = new URLSearchParams({
      checkout: "cancelled",
      source: "workout_context",
      placementId: "workout_saved_post_success",
      productId: "guide_poolside",
      surface: "plans_checkout_return",
      reason: "checkout_cancelled",
      rawUrl: "https://example.com/?email=user@example.com",
    });

    render(<TrackCheckoutCancel surface="plans" />);

    await waitFor(() => {
      expect(sendClientAnalyticsEvent).toHaveBeenCalledWith("upsell_declined", {
        surface: "plans_checkout_return",
        source: "workout_context",
        placementId: "workout_saved_post_success",
        productId: "guide_poolside",
        reason: "checkout_cancelled",
      });
    });
    expect(JSON.stringify(vi.mocked(sendClientAnalyticsEvent).mock.calls)).not.toContain(
      "user@example.com"
    );
  });

  it("keeps incomplete workout-context cancel attribution out of the mapped payload", async () => {
    navigationState.pathname = "/plans";
    navigationState.searchParams = new URLSearchParams({
      checkout: "cancelled",
      source: "workout_context",
      placementId: "workout_saved_post_success",
      product: "guide_poolside",
      productId: "guide_poolside",
      surface: "plans_checkout_return",
    });

    render(<TrackCheckoutCancel surface="plans" />);

    await waitFor(() => {
      expect(sendClientAnalyticsEvent).toHaveBeenCalledWith("upsell_declined", {
        surface: "plans",
        source: "workout_context",
        productId: "guide_poolside",
        reason: "checkout_cancelled",
      });
    });
    expect(sendClientAnalyticsEvent).not.toHaveBeenCalledWith(
      "upsell_declined",
      expect.objectContaining({
        placementId: "workout_saved_post_success",
        surface: "plans_checkout_return",
      })
    );
  });

  it("does not track when checkout query flag is missing", async () => {
    navigationState.pathname = "/plans";
    navigationState.searchParams = new URLSearchParams({
      source: "plans",
      product: "guide_0_1000m",
    });

    render(<TrackCheckoutCancel surface="plans" />);

    await waitFor(() => {
      expect(sendClientAnalyticsEvent).not.toHaveBeenCalled();
    });
  });

  it("deduplicates identical cancelled events in the same session", async () => {
    navigationState.pathname = "/plans";
    navigationState.searchParams = new URLSearchParams({
      checkout: "cancelled",
      source: "plans",
      product: "guide_0_1000m",
    });

    const { rerender } = render(<TrackCheckoutCancel surface="plans" />);

    await waitFor(() => {
      expect(sendClientAnalyticsEvent).toHaveBeenCalledTimes(1);
    });

    rerender(<TrackCheckoutCancel surface="plans" />);

    await waitFor(() => {
      expect(sendClientAnalyticsEvent).toHaveBeenCalledTimes(1);
    });
  });
});
