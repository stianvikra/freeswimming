import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CheckoutButton from "@/components/my-library/CheckoutButton";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";

vi.mock("@/lib/analytics/client", () => ({
  sendClientAnalyticsEvent: vi.fn(),
}));

describe("CheckoutButton", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("uses the shared primary action token contract by default", () => {
    render(<CheckoutButton productId="guide_poolside" />);

    const button = screen.getByRole("button", { name: "Buy now" });
    expect(button).toHaveClass(
      "fs-cta-primary",
      "min-h-11",
      "w-full",
      "sm:w-auto",
      "focus-visible:ring-blue-700",
      "disabled:opacity-60"
    );
    expect(button).not.toHaveClass("rounded-xl", "bg-blue-600");
  });

  it("tracks upsell_accepted and enriches cancel path tags before checkout request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, error: "qa-test-checkout-error" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <CheckoutButton productId="guide_poolside" cancelPath="/plans" analyticsSource="plans" />
    );

    fireEvent.click(screen.getByRole("button", { name: "Buy now" }));

    await waitFor(() => {
      expect(sendClientAnalyticsEvent).toHaveBeenCalledWith("upsell_accepted", {
        productId: "guide_poolside",
        source: "plans",
      });
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const requestBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(requestBody).toMatchObject({
      productId: "guide_poolside",
      cancelPath: "/plans?checkout=cancelled&product=guide_poolside&source=plans",
      source: "plans",
    });

    const feedback = await screen.findByTestId("checkout-feedback");
    expect(feedback).toHaveAttribute("role", "status");
    expect(feedback).toHaveAttribute("aria-live", "polite");
    expect(feedback).toHaveAttribute("data-feedback-tone", "error");
    expect(feedback).toHaveTextContent("qa-test-checkout-error");
  });

  it("keeps plans client telemetry separate from mapped server checkout attribution", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, error: "qa-test-checkout-error" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <CheckoutButton
        productId="guide_poolside"
        cancelPath="/plans"
        analyticsSource="plans"
        checkoutAttributionSource="workout_context"
        checkoutAttributionPlacementId="workout_saved_post_success"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Buy now" }));

    await waitFor(() => {
      expect(sendClientAnalyticsEvent).toHaveBeenCalledWith("upsell_accepted", {
        productId: "guide_poolside",
        source: "plans",
      });
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const requestBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(requestBody).toMatchObject({
      productId: "guide_poolside",
      cancelPath:
        "/plans?checkout=cancelled&product=guide_poolside&source=workout_context&placementId=workout_saved_post_success&productId=guide_poolside&surface=plans_checkout_return&reason=checkout_cancelled",
      source: "workout_context",
      placementId: "workout_saved_post_success",
    });
  });

  it("does not add workout-context cancel attribution for unrelated products", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, error: "qa-test-checkout-error" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <CheckoutButton
        productId="guide_0_1000m"
        cancelPath="/plans"
        analyticsSource="plans"
        checkoutAttributionSource="workout_context"
        checkoutAttributionPlacementId="workout_saved_post_success"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Buy now" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const requestBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(requestBody).toMatchObject({
      productId: "guide_0_1000m",
      cancelPath: "/plans?checkout=cancelled&product=guide_0_1000m&source=plans",
      source: "workout_context",
      placementId: "workout_saved_post_success",
    });
  });

  it("allows a clearer visible checkout label without changing the default contract", () => {
    render(
      <CheckoutButton productId="guide_poolside" label="Buy Poolside guide" className="max-w-xs" />
    );

    const button = screen.getByRole("button", { name: "Buy Poolside guide" });
    expect(button).toBeVisible();
    expect(button).toHaveClass("fs-cta-primary", "max-w-xs");
    expect(screen.queryByRole("button", { name: "Buy now" })).not.toBeInTheDocument();
  });

  it("announces pending checkout handoff without changing the button label", async () => {
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}));
    vi.stubGlobal("fetch", fetchMock);

    render(<CheckoutButton productId="guide_poolside" label="Buy Poolside guide" />);

    fireEvent.click(screen.getByRole("button", { name: "Buy Poolside guide" }));

    const feedback = await screen.findByTestId("checkout-feedback");
    const button = screen.getByRole("button", { name: "Opening checkout..." });

    expect(feedback).toHaveAttribute("role", "status");
    expect(feedback).toHaveAttribute("aria-live", "polite");
    expect(feedback).toHaveAttribute("data-feedback-tone", "pending");
    expect(feedback).toHaveTextContent("Opening secure checkout...");
    expect(button).toHaveAttribute("aria-describedby", feedback.id);
    expect(button).toHaveClass("fs-cta-primary", "w-full", "sm:w-auto");
  });
});
