import type React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CheckoutSuccessPage from "@/app/checkout/success/page";

const { getServerSupabaseUserIfAuthCookiePresentMock } = vi.hoisted(() => ({
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/components/SiteChrome", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/commerce/DownloadResendForm", () => ({
  default: ({
    initialEmail = "",
    nextPath = "/my-library",
    source = "checkout_success",
    className = "",
  }: {
    initialEmail?: string;
    nextPath?: string;
    source?: string;
    className?: string;
  }) => (
    <form
      data-testid="download-resend-form"
      data-initial-email={initialEmail}
      data-next-path={nextPath}
      data-source={source}
      className={className}
    >
      <label>Purchase email</label>
      <button type="submit">Email me access link</button>
    </form>
  ),
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

describe("CheckoutSuccessPage", () => {
  beforeEach(() => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({ user: null });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("gives signed-out buyers a sign-in and claim recovery path without promising access", async () => {
    render(
      await CheckoutSuccessPage({
        searchParams: Promise.resolve({ session_id: "cs_test_123" }),
      })
    );

    expect(
      screen.getByRole("heading", { name: "Open My Library when access is ready." })
    ).toBeVisible();
    expect(
      screen.getByText(/entitlement checks decide what appears in your library/i)
    ).toBeVisible();

    expect(screen.getByRole("link", { name: "Sign in to My Library" })).toHaveAttribute(
      "href",
      "/auth/sign-in?next=%2Fmy-library&source=checkout_success"
    );
    expect(screen.getByRole("link", { name: "Open claim access" })).toHaveAttribute(
      "href",
      "/claim?next=%2Fmy-library"
    );
    expect(screen.getByText(/Payment reference for support:/)).toBeVisible();
    expect(screen.getByText("cs_test_123")).toBeVisible();

    const resendForm = screen.getByTestId("download-resend-form");
    expect(resendForm).toHaveAttribute("data-source", "checkout_success");
    expect(resendForm).toHaveAttribute("data-next-path", "/my-library");
    expect(resendForm).toHaveAttribute("data-initial-email", "");
  });

  it("keeps signed-in buyers on My Library and does not show placeholder session references", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      user: { id: "user-1", email: "buyer@example.com" },
    });

    render(
      await CheckoutSuccessPage({
        searchParams: Promise.resolve({ session_id: "{CHECKOUT_SESSION_ID}" }),
      })
    );

    expect(screen.getByRole("link", { name: "Continue to My Library" })).toHaveAttribute(
      "href",
      "/my-library"
    );
    expect(screen.queryByRole("link", { name: "Open claim access" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Payment reference for support:/)).not.toBeInTheDocument();

    const resendForm = screen.getByTestId("download-resend-form");
    expect(resendForm).toHaveAttribute("data-source", "checkout_success");
    expect(resendForm).toHaveAttribute("data-initial-email", "buyer@example.com");
  });
});
