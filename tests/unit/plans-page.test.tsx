import type React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PlansPage from "@/app/plans/page";

const { loadPublicCatalogOverridesCachedMock } = vi.hoisted(() => ({
  loadPublicCatalogOverridesCachedMock: vi.fn(),
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
  default: () => null,
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
    expect(screen.getByText("One-time checkout")).toBeVisible();
    expect(screen.getByText("Hosted by Stripe")).toBeVisible();
    expect(screen.getByText("Receipt and invoice")).toBeVisible();

    expect(screen.getByRole("heading", { name: "0-1000m guide" })).toBeVisible();
    expect(screen.getByText("Interactive plan + PDF guide")).toBeVisible();
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
    expect(screen.getAllByRole("button", { name: "Open secure checkout" })).toHaveLength(3);
    expect(
      screen.getAllByText(
        "Opens secure Stripe Checkout. Final price, promo code field, and payment details are confirmed before you pay."
      )
    ).toHaveLength(3);
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
    expect(screen.queryByRole("button", { name: "Open secure checkout" })).not.toBeInTheDocument();
  });
});
