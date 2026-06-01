import type React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CookiesPage, { metadata as cookiesMetadata } from "@/app/cookies/page";
import GoUnavailablePage, { metadata as goUnavailableMetadata } from "@/app/go/unavailable/page";
import PrivacyPage, { metadata as privacyMetadata } from "@/app/privacy/page";

vi.mock("@/components/SiteChrome", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="site-chrome">{children}</div>
  ),
}));

vi.mock("@/components/PageTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
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

describe("public policy and QR fallback pages", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the privacy policy with token-backed cards while preserving policy content", () => {
    render(<PrivacyPage />);

    const page = screen.getByTestId("privacy-policy-page");
    expect(within(page).getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
    expect(within(page).getByText("Last updated: February 17, 2026")).toBeVisible();

    const controllerCard = screen.getByTestId("privacy-controller-card");
    expect(controllerCard).toHaveClass("fs-library-card", "fs-library-card-accent");
    expect(
      within(controllerCard).getByRole("heading", { name: "Who controls your data" })
    ).toBeVisible();

    expect(screen.getByText("Supabase")).toBeVisible();
    expect(screen.getByText("Stripe")).toBeVisible();
    expect(screen.getByText("Payment records")).toBeVisible();

    const contactLink = screen.getByRole("link", { name: "Contact" });
    expect(contactLink).toHaveAttribute("href", "/contact");
    expect(contactLink.getAttribute("class")).toContain("text-[color:var(--fs-color-brand-700)]");

    const cookiesLink = screen.getByRole("link", { name: "Cookie Policy" });
    expect(cookiesLink).toHaveAttribute("href", "/cookies");
    expect(privacyMetadata.alternates?.canonical).toBe("/privacy");
  });

  it("renders the cookie policy with token-backed cards while preserving storage guidance", () => {
    render(<CookiesPage />);

    const page = screen.getByTestId("cookie-policy-page");
    expect(within(page).getByRole("heading", { name: "Cookie Policy" })).toBeVisible();
    expect(within(page).getByText("Last updated: February 17, 2026")).toBeVisible();

    const essentialStorageCard = screen.getByTestId("cookie-essential-storage-card");
    expect(essentialStorageCard).toHaveClass("fs-library-card", "fs-library-card-accent");
    expect(screen.getByText("Session cookies used by Supabase authentication.")).toBeVisible();
    expect(screen.getByText("Consent boundary")).toBeVisible();

    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "href",
      "/privacy"
    );
    expect(cookiesMetadata.alternates?.canonical).toBe("/cookies");
  });

  it("keeps QR fallback safe retry and support exits while using token actions", async () => {
    render(
      await GoUnavailablePage({
        searchParams: Promise.resolve({
          reason: "not_found",
          slug: "intro-video",
          retry: "/go/v/intro-video",
        }),
      })
    );

    const card = screen.getByTestId("go-unavailable-card");
    expect(card).toHaveClass("fs-library-card", "fs-library-card-accent");
    const heading = within(card).getByRole("heading", { name: "This QR link is not active" });
    expect(heading).toBeVisible();
    expect(heading).toHaveClass("text-[26px]", "sm:text-[34px]");
    expect(within(card).getByText(/Link slug:/)).toBeVisible();
    expect(within(card).getByText("intro-video")).toBeVisible();

    const actionGroup = screen.getByTestId("go-unavailable-actions");
    expect(actionGroup).toHaveClass("grid", "grid-cols-2", "sm:flex", "sm:flex-wrap");

    const retryLink = screen.getByRole("link", { name: "Retry QR link" });
    expect(retryLink).toHaveAttribute("href", "/go/v/intro-video");
    expect(retryLink).toHaveClass("fs-cta-primary", "col-span-2", "w-full", "sm:w-auto");

    const courseLink = screen.getByRole("link", { name: "Open course" });
    const supportLink = screen.getByRole("link", { name: "Contact support" });
    expect(courseLink).toHaveAttribute("href", "/course");
    expect(supportLink).toHaveAttribute("href", "/contact");
    expect(courseLink).toHaveClass("fs-cta-secondary", "w-full", "sm:w-auto");
    expect(supportLink).toHaveClass("fs-cta-secondary", "w-full", "sm:w-auto");
    expect(goUnavailableMetadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("suppresses unsafe QR retry values and keeps the unknown-reason fallback copy", async () => {
    render(
      await GoUnavailablePage({
        searchParams: Promise.resolve({
          reason: "future_reason",
          retry: "https://evil.example/go/v/intro-video",
        }),
      })
    );

    expect(
      screen.getByRole("heading", { name: "We could not load this QR link right now" })
    ).toBeVisible();
    expect(screen.queryByRole("link", { name: "Retry QR link" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open course" })).toHaveAttribute("href", "/course");
    expect(screen.getByRole("link", { name: "Contact support" })).toHaveAttribute(
      "href",
      "/contact"
    );
  });
});
