import type React from "react";
import { cleanup, render, screen } from "@testing-library/react";
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

    render(await PlansPage());

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
      eventName: "plans_viewed",
      payload: {
        productCount: 3,
        availableCount: 3,
        activeCount: 3,
        productIds: "guide_0_1000m,guide_poolside,analysis_video",
        availableProductIds: "guide_0_1000m,guide_poolside,analysis_video",
        unavailableProductIds: null,
      },
    });
    expect(trackEventOnMountMock).toHaveBeenCalledWith({
      eventName: "upsell_presented",
      payload: {
        surface: "plans",
        offerCount: 3,
        productCount: 3,
        availableCount: 3,
        activeCount: 3,
        productIds: "guide_0_1000m,guide_poolside,analysis_video",
        availableProductIds: "guide_0_1000m,guide_poolside,analysis_video",
        unavailableProductIds: null,
      },
    });
  });

  it("keeps unavailable products recoverable without checkout buttons", async () => {
    stubUnavailableProducts();

    render(await PlansPage());

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
        productCount: 3,
        availableCount: 0,
        activeCount: 3,
        productIds: "guide_0_1000m,guide_poolside,analysis_video",
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
