import type React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LibraryItemPage from "@/app/my-library/item/[slug]/page";

const { getServerSupabaseUserIfAuthCookiePresentMock } = vi.hoisted(() => ({
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("@/components/SiteChrome", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="site-chrome">{children}</div>
  ),
}));

vi.mock("@/components/admin/AdminContextNotesPanel", () => ({
  default: ({
    contextType,
    contextRef,
    contextLabel,
    className = "",
  }: {
    contextType: string;
    contextRef: string;
    contextLabel: string;
    className?: string;
  }) => (
    <aside
      data-testid="admin-context-notes-panel"
      data-context-type={contextType}
      data-context-ref={contextRef}
      data-context-label={contextLabel}
      className={className}
    />
  ),
}));

vi.mock("@/components/guides/GuidePdfDownloadButton", () => ({
  default: ({
    apiPath,
    fallbackFileName,
    className = "",
  }: {
    apiPath: string;
    fallbackFileName?: string | null;
    className?: string;
  }) => (
    <button
      type="button"
      data-testid="guide-pdf-download"
      data-api-path={apiPath}
      data-fallback-file-name={fallbackFileName ?? ""}
      className={className}
    >
      Download PDF
    </button>
  ),
}));

vi.mock("@/components/analytics/TrackedLink", () => ({
  default: ({
    eventName,
    payload,
    href,
    className,
    children,
  }: {
    eventName: string;
    payload?: Record<string, unknown>;
    href: string;
    className?: string;
    children: React.ReactNode;
  }) => (
    <a
      href={href}
      className={className}
      data-event-name={eventName}
      data-payload={JSON.stringify(payload ?? {})}
    >
      {children}
    </a>
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

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

const signedInUser = {
  id: "user-123",
  email: "swimmer@example.com",
};

function stubProductEnv() {
  vi.stubEnv("STRIPE_PRICE_ID_0_1000M_GUIDE", "price_1000");
  vi.stubEnv("STRIPE_PRICE_ID_POOLSIDE_GUIDE", "price_poolside");
  vi.stubEnv("STRIPE_PRICE_ID_ANALYSIS", "price_analysis");
}

function createQuery(result: { data: unknown; error: Error | null }) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };

  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.limit.mockReturnValue(query);

  return query;
}

function buildSupabase({
  entitlement = { id: "entitlement-1" },
  entitlementError = null,
  productOverride = null,
  productOverrideError = null,
}: {
  entitlement?: unknown;
  entitlementError?: Error | null;
  productOverride?: unknown;
  productOverrideError?: Error | null;
} = {}) {
  const entitlementQuery = createQuery({ data: entitlement, error: entitlementError });
  const productQuery = createQuery({ data: productOverride, error: productOverrideError });
  const supabase = {
    from: vi.fn((table: string) => {
      if (table === "entitlements") return entitlementQuery;
      if (table === "products") return productQuery;
      throw new Error(`Unexpected table: ${table}`);
    }),
  };

  return { supabase, entitlementQuery, productQuery };
}

async function renderLibraryItem(slug: string, supabase = buildSupabase().supabase) {
  getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
    supabase,
    user: signedInUser,
  });

  render(
    await LibraryItemPage({
      params: Promise.resolve({ slug }),
    })
  );
}

describe("LibraryItemPage", () => {
  beforeEach(() => {
    stubProductEnv();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("renders owned guide details with My Library token actions and unchanged PDF/admin context wiring", async () => {
    const { supabase, entitlementQuery, productQuery } = buildSupabase({
      productOverride: { title: "Poolside guide plus" },
    });

    await renderLibraryItem("poolside-guide", supabase);

    const detail = screen.getByTestId("owned-library-item-detail");
    expect(detail).toHaveClass("fs-library-card", "fs-library-card-accent");
    expect(within(detail).getByText("Owned item")).toBeVisible();
    expect(within(detail).getByText("In your library")).toBeVisible();
    expect(within(detail).getByRole("heading", { name: "Poolside guide plus" })).toBeVisible();
    expect(
      within(detail).getByText(
        "Open one drill at a time with overview, next/forrige controls, swipe navigation, and visual fullscreen mode."
      )
    ).toBeVisible();

    const actions = within(detail).getByTestId("owned-library-item-actions");
    const primaryAction = within(actions).getByRole("link", { name: "Open interactive guide" });
    expect(primaryAction).toHaveAttribute("href", "/guides/poolside");
    expect(primaryAction).toHaveAttribute("data-event-name", "item_preview_opened");
    expect(primaryAction).toHaveClass("fs-cta-primary");
    expect(primaryAction.getAttribute("data-payload")).toContain("library_item_primary");
    expect(primaryAction.getAttribute("data-payload")).toContain("guide_poolside");

    const pdfButton = within(actions).getByTestId("guide-pdf-download");
    expect(pdfButton).toHaveAttribute("data-api-path", "/api/guides/poolside/pdf");
    expect(pdfButton).toHaveAttribute("data-fallback-file-name", "freeswimming-poolside-guide.pdf");

    expect(within(actions).getByRole("link", { name: "Back to My Library" })).toHaveAttribute(
      "href",
      "/my-library"
    );

    const adminPanel = screen.getByTestId("admin-context-notes-panel");
    expect(adminPanel).toHaveAttribute("data-context-type", "product");
    expect(adminPanel).toHaveAttribute("data-context-ref", "poolside-guide");
    expect(adminPanel).toHaveAttribute(
      "data-context-label",
      "Product: Poolside guide plus (poolside-guide)"
    );

    expect(supabase.from).toHaveBeenCalledWith("entitlements");
    expect(supabase.from).toHaveBeenCalledWith("products");
    expect(entitlementQuery.eq).toHaveBeenCalledWith("product_id", "guide_poolside");
    expect(entitlementQuery.eq).toHaveBeenCalledWith("user_id", signedInUser.id);
    expect(productQuery.eq).toHaveBeenCalledWith("id", "guide_poolside");
  });

  it("keeps analysis item support action analytics and omits PDF download", async () => {
    await renderLibraryItem("video-analysis");

    const actions = within(screen.getByTestId("owned-library-item-actions"));
    expect(actions.getByRole("link", { name: "Open video analysis" })).toHaveAttribute(
      "href",
      "/analysis"
    );
    const supportAction = actions.getByRole("link", { name: "Contact support" });
    expect(supportAction).toHaveAttribute("href", "/contact");
    expect(supportAction).toHaveAttribute("data-event-name", "support_clicked");
    expect(supportAction).toHaveClass("fs-cta-secondary");
    expect(supportAction.getAttribute("data-payload")).toContain("library_item_secondary_support");
    expect(actions.queryByTestId("guide-pdf-download")).not.toBeInTheDocument();
  });

  it("preserves anonymous redirect to the owned item return path", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: null,
      user: null,
    });

    await expect(
      LibraryItemPage({
        params: Promise.resolve({ slug: "poolside-guide" }),
      })
    ).rejects.toThrow("NEXT_REDIRECT:/auth/sign-in?next=%2Fmy-library%2Fitem%2Fpoolside-guide");
  });

  it("preserves missing-entitlement redirect back to My Library", async () => {
    const { supabase } = buildSupabase({ entitlement: null });

    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase,
      user: signedInUser,
    });

    await expect(
      LibraryItemPage({
        params: Promise.resolve({ slug: "poolside-guide" }),
      })
    ).rejects.toThrow("NEXT_REDIRECT:/my-library");
  });

  it("preserves not-found behavior for unknown product slugs", async () => {
    await expect(
      LibraryItemPage({
        params: Promise.resolve({ slug: "future-product" }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
