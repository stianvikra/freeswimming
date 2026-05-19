import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminCommerceManager from "@/components/admin/AdminCommerceManager";
import type { Database } from "@/types/database";

type AdminProductRow = Database["public"]["Tables"]["products"]["Row"];

const product: AdminProductRow = {
  id: "product-poolside-pdf",
  title: "Poolside PDF",
  active: true,
  kind: "digital",
  slug: "poolside-pdf",
  stripe_price_id: "price_123",
  created_at: "2026-05-19T10:00:00.000Z",
  updated_at: "2026-05-19T10:00:00.000Z",
};

function productsResponse(items: AdminProductRow[] = [product]) {
  return {
    ok: true,
    json: async () => ({
      ok: true,
      items,
      schemaReady: true,
      warning: null,
    }),
  };
}

function productsErrorResponse(error = "Could not load products.") {
  return {
    ok: false,
    json: async () => ({
      ok: false,
      error,
    }),
  };
}

describe("AdminCommerceManager state rendering", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows a polite loading state before products resolve", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(productsResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminCommerceManager />);

    const loading = screen.getByRole("status");
    expect(loading).toHaveTextContent("Loading product catalog…");
    expect(loading).toHaveAttribute("aria-live", "polite");

    await screen.findByDisplayValue("Poolside PDF");
  });

  it("keeps load error retry wired to the original product loader", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(productsErrorResponse())
      .mockResolvedValueOnce(productsResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminCommerceManager />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Could not load products.");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await screen.findByDisplayValue("Poolside PDF");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/admin/products", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
  });

  it("renders the unchanged empty product catalog guidance", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(productsResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminCommerceManager />);

    await waitFor(() => {
      expect(
        screen.getByText("Product catalog is empty. Checkout flows depend on seeded products.")
      ).toBeInTheDocument();
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
