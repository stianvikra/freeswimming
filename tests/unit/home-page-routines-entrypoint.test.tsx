import type React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";

const { getServerSupabaseUserIfAuthCookiePresentMock, resolveAdminRoleFromSupabaseMock } =
  vi.hoisted(() => ({
    getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
    resolveAdminRoleFromSupabaseMock: vi.fn(),
  }));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/lib/admin/server", () => ({
  resolveAdminRoleFromSupabase: resolveAdminRoleFromSupabaseMock,
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

vi.mock("@/components/SiteChrome", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/PageTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock("@/components/brand/BrandImage", () => ({
  default: () => <span data-testid="brand-image" />,
}));

function actionHrefs() {
  return within(screen.getByTestId("home-primary-actions"))
    .getAllByRole("link")
    .map((link) => link.getAttribute("href"));
}

describe("HomePage routines entrypoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveAdminRoleFromSupabaseMock.mockResolvedValue(null);
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps routines hidden for anonymous visitors", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: null,
      user: null,
    });

    render(await HomePage());

    expect(screen.queryByRole("link", { name: /My routines/i })).not.toBeInTheDocument();
    expect(actionHrefs()).toEqual(["/course", "/programs", "/analysis", "/contact"]);
    expect(resolveAdminRoleFromSupabaseMock).not.toHaveBeenCalled();
  });

  it("places signed-in routines directly below Free course", async () => {
    const supabase = {};
    const user = {
      id: "user-1",
      email: "learner@example.com",
    };
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase,
      user,
    });

    render(await HomePage());

    const routinesLink = screen.getByRole("link", {
      name: /My routines Today's habits and micro-sessions/i,
    });
    expect(routinesLink).toHaveAttribute("href", "/my-library#my-library-routines-heading");
    expect(actionHrefs()).toEqual([
      "/course",
      "/my-library#my-library-routines-heading",
      "/programs",
      "/analysis",
      "/contact",
    ]);
    expect(resolveAdminRoleFromSupabaseMock).toHaveBeenCalledWith(supabase, user, {
      allowlistedEmailsRaw: undefined,
    });
  });
});
