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
    });
  });

  it("allows a clearer visible checkout label without changing the default contract", () => {
    render(<CheckoutButton productId="guide_poolside" label="Open secure checkout" />);

    expect(screen.getByRole("button", { name: "Open secure checkout" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Buy now" })).not.toBeInTheDocument();
  });
});
