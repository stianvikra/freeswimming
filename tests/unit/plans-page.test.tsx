import type React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PlansPage from "@/app/plans/page";
import {
  getCheckoutCtaLabel,
  getPlanCopy,
  getPurchaseModelCopy,
  type PlansProductPresentationInput,
} from "@/app/plans/plansPresentation";

const { loadPublicCatalogOverridesCachedMock, trackEventOnMountMock } = vi.hoisted(() => ({
  loadPublicCatalogOverridesCachedMock: vi.fn(),
  trackEventOnMountMock: vi.fn(),
}));

vi.mock("@/lib/commerce/catalog-server", () => ({
  loadPublicCatalogOverridesCached: loadPublicCatalogOverridesCachedMock,
}));

vi.mock("@/components/SiteChrome", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/PageTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock("@/components/PageIntro", () => ({
  default: ({
    title,
    subtitle,
    belowDivider,
  }: {
    title: string;
    subtitle?: string;
    belowDivider?: React.ReactNode;
  }) => (
    <header>
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
      {belowDivider}
    </header>
  ),
}));

vi.mock("@/components/analytics/TrackEventOnMount", () => ({
  default: (props: { eventName: string; payload?: Record<string, unknown> }) => {
    trackEventOnMountMock(props);
    return null;
  },
}));

vi.mock("@/components/analytics/TrackCheckoutCancel", () => ({
  default: () => null,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function stubAvailableProducts() {
  vi.stubEnv("STRIPE_PRICE_ID_0_1000M_GUIDE", "price_1000");
  vi.stubEnv("STRIPE_PRICE_ID_POOLSIDE_GUIDE", "price_poolside");
  vi.stubEnv("STRIPE_PRICE_ID_ANALYSIS", "price_analysis");
}

function stubUnavailableProducts() {
  vi.stubEnv("STRIPE_PRICE_ID_0_1000M_GUIDE", "");
  vi.stubEnv("STRIPE_PRICE_ID_POOLSIDE_GUIDE", "");
  vi.stubEnv("STRIPE_PRICE_ID_ANALYSIS", "");
}

describe("PlansPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadPublicCatalogOverridesCachedMock.mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it("presents value proof and secure checkout expectations for available plans", async () => {
    stubAvailableProducts();

    render(await PlansPage({}));

    expect(
      screen.getByRole("heading", {
        name: "Plans",
      })
    ).toBeVisible();
    expect(screen.getByText("Guides and feedback.")).toBeVisible();
    expect(
      screen.getByText(
        "Choose what fits this week. Stripe shows the final price and payment details before you pay."
      )
    ).toBeVisible();
    expect(screen.getByText("Model shown per offer")).toBeVisible();
    expect(screen.getByText("Check each card before checkout.")).toBeVisible();
    expect(screen.getByText("Hosted by Stripe")).toBeVisible();
    expect(screen.getByText("Receipt and invoice")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Compare the options" })).toBeVisible();
    expect(
      screen.getByText("Pick by current need first; checkout details stay inside Stripe.")
    ).toBeVisible();

    expect(screen.getByRole("heading", { name: "0-1000m guide" })).toBeVisible();
    expect(screen.getByText("Interactive plan + PDF guide")).toBeVisible();
    expect(
      screen.getByText("Choose this when you want the clearest progression path.")
    ).toBeVisible();
    expect(screen.getByText("20-session structure you can follow in order")).toBeVisible();
    expect(
      screen.getByText(
        "Built to pair with the free course so drills, sessions, and progression use the same method language."
      )
    ).toBeVisible();

    expect(screen.getByRole("heading", { name: "Poolside guide" })).toBeVisible();
    expect(screen.getByText("Drill library + printable guide")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Video analysis" })).toBeVisible();
    expect(screen.getByText("Technique review")).toBeVisible();

    expect(screen.getAllByText("One-time purchase")).toHaveLength(3);
    expect(screen.getAllByText("Purchase model")).toHaveLength(3);
    expect(screen.getAllByText("One-time")).toHaveLength(3);
    expect(screen.getAllByText("Pay once for this offer. No subscription.")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Buy 0-1000m guide" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Buy Poolside guide" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Buy Video analysis" })).toBeVisible();
    expect(
      screen.getAllByText(
        "Opens secure Stripe Checkout. Final price, promo code field, and payment details are confirmed before you pay."
      )
    ).toHaveLength(3);
    expect(trackEventOnMountMock).toHaveBeenCalledWith({
      eventName: "public_page_viewed",
      payload: {
        routeTemplate: "/plans",
        routeCategory: "pricing",
        routeStatus: "active",
        routeCountable: true,
        utm_source: undefined,
        utm_medium: undefined,
        utm_campaign: undefined,
        utm_content: undefined,
        utm_term: undefined,
        ref: undefined,
      },
    });
    expect(trackEventOnMountMock).toHaveBeenCalledWith({
      eventName: "plans_viewed",
      payload: {
        source: "plans",
        routeTemplate: "/plans",
        routeCategory: "pricing",
        routeStatus: "active",
        routeCountable: true,
        utm_source: undefined,
        utm_medium: undefined,
        utm_campaign: undefined,
        utm_content: undefined,
        utm_term: undefined,
        ref: undefined,
        productCount: 3,
        availableCount: 3,
        activeCount: 3,
        productIds: "guide_0_1000m,guide_poolside,analysis_video",
        productTypes: "course_addon,analysis",
        availableProductIds: "guide_0_1000m,guide_poolside,analysis_video",
        unavailableProductIds: null,
      },
    });
    expect(trackEventOnMountMock).toHaveBeenCalledWith({
      eventName: "upsell_presented",
      payload: {
        surface: "plans",
        offerCount: 3,
        source: "plans",
        routeTemplate: "/plans",
        routeCategory: "pricing",
        routeStatus: "active",
        routeCountable: true,
        utm_source: undefined,
        utm_medium: undefined,
        utm_campaign: undefined,
        utm_content: undefined,
        utm_term: undefined,
        ref: undefined,
        productCount: 3,
        availableCount: 3,
        activeCount: 3,
        productIds: "guide_0_1000m,guide_poolside,analysis_video",
        productTypes: "course_addon,analysis",
        availableProductIds: "guide_0_1000m,guide_poolside,analysis_video",
        unavailableProductIds: null,
      },
    });
  });

  it("passes mapped workout-context checkout attribution only to the approved Poolside plan", async () => {
    stubAvailableProducts();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, error: "qa-test-checkout-error" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      await PlansPage({
        searchParams: Promise.resolve({
          source: "workout_context",
          placementId: "workout_saved_post_success",
          productId: "guide_poolside",
        }),
      })
    );

    fireEvent.click(screen.getByRole("button", { name: "Buy Poolside guide" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/checkout/session",
        expect.objectContaining({
          body: expect.any(String),
        })
      );
    });

    const poolsideCheckoutCall = fetchMock.mock.calls.find((call) => {
      const body = JSON.parse(String(call[1]?.body ?? "{}")) as Record<string, unknown>;
      return body.productId === "guide_poolside";
    });
    const requestBody = JSON.parse(String(poolsideCheckoutCall?.[1]?.body ?? "{}"));

    expect(requestBody).toMatchObject({
      productId: "guide_poolside",
      cancelPath:
        "/plans?checkout=cancelled&product=guide_poolside&source=workout_context&placementId=workout_saved_post_success&productId=guide_poolside&surface=plans_checkout_return&reason=checkout_cancelled",
      source: "workout_context",
      placementId: "workout_saved_post_success",
    });

    fetchMock.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Buy 0-1000m guide" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/checkout/session",
        expect.objectContaining({
          body: expect.any(String),
        })
      );
    });

    const guideCheckoutCall = fetchMock.mock.calls.find((call) => {
      const body = JSON.parse(String(call[1]?.body ?? "{}")) as Record<string, unknown>;
      return body.productId === "guide_0_1000m";
    });
    const guideRequestBody = JSON.parse(String(guideCheckoutCall?.[1]?.body ?? "{}"));

    expect(guideRequestBody).toMatchObject({
      productId: "guide_0_1000m",
      cancelPath: "/plans?checkout=cancelled&product=guide_0_1000m&source=plans",
      source: "plans",
    });
    expect(guideRequestBody).not.toHaveProperty("placementId");
  });

  it("keeps unavailable products recoverable without checkout buttons", async () => {
    stubUnavailableProducts();

    render(await PlansPage({}));

    expect(
      screen.getByText(
        "Plans are temporarily unavailable while checkout configuration is being finalized."
      )
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Contact support" })).toHaveAttribute(
      "href",
      "/contact"
    );
    expect(screen.getAllByRole("button", { name: "Temporarily unavailable" })).toHaveLength(3);
    expect(screen.queryByRole("button", { name: /^Buy / })).not.toBeInTheDocument();
    expect(trackEventOnMountMock).toHaveBeenCalledWith({
      eventName: "plans_viewed",
      payload: {
        source: "plans",
        routeTemplate: "/plans",
        routeCategory: "pricing",
        routeStatus: "active",
        routeCountable: true,
        utm_source: undefined,
        utm_medium: undefined,
        utm_campaign: undefined,
        utm_content: undefined,
        utm_term: undefined,
        ref: undefined,
        productCount: 3,
        availableCount: 0,
        activeCount: 3,
        productIds: "guide_0_1000m,guide_poolside,analysis_video",
        productTypes: "course_addon,analysis",
        availableProductIds: null,
        unavailableProductIds: "guide_0_1000m,guide_poolside,analysis_video",
      },
    });
    expect(trackEventOnMountMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "upsell_presented",
      })
    );
  });

  it("uses safe generic presentation copy for unmapped future products", () => {
    const futureProduct: PlansProductPresentationInput = {
      id: "membership_subscription",
      slug: "membership",
      title: "Membership",
      kind: "course_addon",
      active: true,
      available: true,
      stripePriceId: "price_membership",
      missingEnvVar: null,
    };

    expect(getPlanCopy(futureProduct)).toMatchObject({
      eyebrow: "Paid plan",
      format: "Freeswimming product",
      comparisonCue: "Choose this when the offer matches the next step you need.",
    });
    expect(getPurchaseModelCopy(futureProduct)).toMatchObject({
      badge: "Checkout details",
      label: "Confirmed in Stripe",
      detail: "The payment model is confirmed before purchase.",
      checkoutExpectation:
        "Opens secure Stripe Checkout. Final price, payment model, and payment details are confirmed before you pay.",
    });
    expect(getCheckoutCtaLabel(futureProduct)).toBe("Buy Membership");
    expect(getCheckoutCtaLabel({ ...futureProduct, title: "   " })).toBe("Buy this plan");
  });
});
