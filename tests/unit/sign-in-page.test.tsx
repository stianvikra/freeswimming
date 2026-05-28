import type React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SignInPage from "@/app/auth/sign-in/page";

const { getServerSupabaseUserIfAuthCookiePresentMock, redirectMock } = vi.hoisted(() => ({
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/app/auth/sign-in/actions", () => ({
  requestMagicLink: vi.fn(),
  verifySignInCode: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/components/SiteChrome", () => ({
  default: ({ children, mobileNavMode }: { children: React.ReactNode; mobileNavMode?: string }) => (
    <div data-testid="site-chrome" data-mobile-nav-mode={mobileNavMode ?? ""}>
      {children}
    </div>
  ),
}));

describe("SignInPage", () => {
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

  it("uses the AW-006 token shell while preserving email-link request mode", async () => {
    render(
      await SignInPage({
        searchParams: Promise.resolve({ next: "/my-library", source: "checkout_success" }),
      })
    );

    expect(screen.getByTestId("site-chrome")).toHaveAttribute("data-mobile-nav-mode", "hidden");
    expect(screen.getByTestId("auth-sign-in-workspace")).toHaveClass(
      "max-w-[760px]",
      "pt-24",
      "sm:pt-28"
    );
    expect(screen.getByTestId("auth-sign-in-shell")).toHaveClass(
      "fs-library-card",
      "fs-library-card-accent"
    );
    expect(screen.getByTestId("auth-sign-in-form-panel")).toHaveClass(
      "fs-library-card",
      "fs-library-card-muted"
    );
    expect(screen.getByRole("heading", { name: "Sign in to My Library", level: 1 })).toHaveClass(
      "text-[color:var(--fs-color-ink-strong)]"
    );
    expect(screen.getByTestId("auth-context-copy")).toHaveTextContent(
      "Use the same email you used at checkout."
    );

    const formPanel = screen.getByTestId("auth-sign-in-form-panel");
    expect(within(formPanel).getByRole("heading", { name: "Email sign-in link" })).toBeVisible();
    expect(screen.getByTestId("auth-submit-request")).toHaveClass("fs-cta-primary");
    expect(screen.getByLabelText("Email")).toHaveClass(
      "rounded-[var(--fs-radius-control)]",
      "border-[color:var(--fs-border-soft)]"
    );
    expect(screen.getByDisplayValue("checkout_success")).toHaveAttribute("name", "source");
  });

  it("keeps sent/code-entry mode and resend action on the token hierarchy", async () => {
    render(
      await SignInPage({
        searchParams: Promise.resolve({
          next: "/my-library",
          sent: "1",
          email: "buyer@example.com",
          source: "claim_entry",
        }),
      })
    );

    expect(
      screen.getByRole("heading", { name: "Sign in to claim access", level: 1 })
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveClass("rounded-[var(--fs-radius-control)]");
    expect(screen.getByRole("heading", { name: "Check your email" })).toBeVisible();
    expect(screen.getByTestId("auth-submit-code")).toHaveClass("fs-cta-primary");
    expect(screen.getByTestId("auth-resend-button")).toHaveClass("fs-cta-secondary");
    expect(screen.getByLabelText("One-time code")).toHaveClass(
      "rounded-[var(--fs-radius-control)]"
    );
    expect(screen.getAllByDisplayValue("claim_entry")[0]).toHaveAttribute("name", "source");
  });

  it("preserves signed-in redirect behavior", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      user: { id: "user-1", email: "buyer@example.com" },
    });

    await expect(
      SignInPage({
        searchParams: Promise.resolve({ next: "/my-library/workouts" }),
      })
    ).rejects.toThrow("NEXT_REDIRECT:/my-library/workouts");

    expect(redirectMock).toHaveBeenCalledWith("/my-library/workouts");
  });
});
