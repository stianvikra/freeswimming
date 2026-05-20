import type React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ClaimPage from "@/app/claim/page";

const { getServerSupabaseUserIfAuthCookiePresentMock, redirectMock } = vi.hoisted(() => ({
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
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

describe("ClaimPage", () => {
  beforeEach(() => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({ user: null });
    redirectMock.mockImplementation((path: string) => {
      throw new Error(`NEXT_REDIRECT:${path}`);
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders privacy-safe claim recovery with checkout email context", async () => {
    render(
      await ClaimPage({
        searchParams: Promise.resolve({
          next: "/my-library/workouts",
          email: "Buyer@Example.com",
        }),
      })
    );

    expect(screen.getByRole("heading", { name: "Recover My Library access." })).toBeVisible();
    expect(
      screen.getByText(/never reveals whether a specific email has a purchase/i)
    ).toBeVisible();
    expect(screen.getByText(/Sign-in and claim links do not grant purchases/i)).toBeVisible();

    const resendForm = screen.getByTestId("download-resend-form");
    expect(resendForm).toHaveAttribute("data-source", "claim_entry");
    expect(resendForm).toHaveAttribute("data-next-path", "/my-library/workouts");
    expect(resendForm).toHaveAttribute("data-initial-email", "Buyer@Example.com");

    const signInLink = screen.getByRole("link", { name: "Sign in to My Library" });
    const signInUrl = new URL(signInLink.getAttribute("href") ?? "", "https://freeswimming.test");
    expect(signInUrl.pathname).toBe("/auth/sign-in");
    expect(signInUrl.searchParams.get("next")).toBe("/my-library/workouts");
    expect(signInUrl.searchParams.get("source")).toBe("claim_entry");
    expect(signInUrl.searchParams.get("email")).toBe("Buyer@Example.com");
  });

  it("redirects signed-in users to the safe next path", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      user: { id: "user-1", email: "buyer@example.com" },
    });

    await expect(
      ClaimPage({
        searchParams: Promise.resolve({
          next: "https://evil.example/my-library",
        }),
      })
    ).rejects.toThrow("NEXT_REDIRECT:/my-library");

    expect(redirectMock).toHaveBeenCalledWith("/my-library");
  });
});
