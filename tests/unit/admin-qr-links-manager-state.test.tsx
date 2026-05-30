import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminQrLinksManager from "@/components/admin/AdminQrLinksManager";
import type { QrRedirectLinkRow } from "@/lib/qr-links/admin";

const generateQrAssetsMock = vi.hoisted(() => vi.fn());

vi.mock("next/image", () => ({
  default: () => null,
}));

vi.mock("@/lib/qr-links/codegen", () => ({
  generateQrAssets: generateQrAssetsMock,
}));

const qrLink: QrRedirectLinkRow = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  slug: "intro-video",
  destination_url: "https://freeswimming.org/course",
  status: "active",
  content_item_id: null,
  content_label: "",
  placement_key: "",
  owner_user_id: null,
  created_by: "admin-user-id",
  updated_by: "admin-user-id",
  created_at: "2026-05-19T10:00:00.000Z",
  updated_at: "2026-05-19T10:00:00.000Z",
  last_resolved_at: null,
};

function qrLinksResponse(items: QrRedirectLinkRow[]) {
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

function contentResponse() {
  return {
    ok: true,
    json: async () => ({
      ok: true,
      items: [],
    }),
  };
}

describe("AdminQrLinksManager state rendering", () => {
  afterEach(() => {
    cleanup();
    generateQrAssetsMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("renders no-results state from existing filters and clears back to the list", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(qrLinksResponse([qrLink]))
      .mockResolvedValueOnce(contentResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminQrLinksManager />);

    await screen.findByText("intro-video");
    expect(screen.getByTestId("admin-qr-links-manager-header")).toHaveClass(
      "fs-library-card",
      "fs-library-card-accent"
    );
    expect(screen.getByTestId("admin-qr-links-filter-panel")).toHaveClass(
      "fs-library-card",
      "fs-library-card-muted"
    );
    expect(screen.getByRole("button", { name: "New link" })).toHaveClass("fs-cta-primary");
    expect(screen.getByRole("button", { name: "Refresh" })).toHaveClass("fs-cta-secondary");

    const row = screen.getByTestId("admin-qr-link-item");
    expect(row).toHaveClass("fs-library-card");
    expect(within(row).getByRole("button", { name: "Copy link" })).toHaveClass("fs-cta-primary");
    expect(within(row).getByRole("button", { name: "Show QR" })).toHaveClass("fs-cta-secondary");
    expect(within(row).getByRole("button", { name: "Edit" })).toHaveClass("fs-cta-secondary");
    expect(within(row).getByRole("button", { name: "More actions" }).className).toContain(
      "rounded-[var(--fs-radius-control)]"
    );

    fireEvent.change(screen.getByLabelText("Filter by status"), {
      target: { value: "archived" },
    });

    await screen.findByText("No QR links match current filters.");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    await waitFor(() => {
      expect(screen.getByText("intro-video")).toBeInTheDocument();
    });
    expect(screen.queryByText("No QR links match current filters.")).not.toBeInTheDocument();
  });

  it("keeps the empty QR state action slots wired", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(qrLinksResponse([]))
      .mockResolvedValueOnce(contentResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminQrLinksManager />);

    const emptyState = await screen.findByTestId("admin-qr-empty-state");
    expect(emptyState).toHaveTextContent("No QR links yet");
    expect(emptyState).toHaveTextContent("Start with one stable slug.");
    expect(emptyState).not.toHaveAttribute("role");
    expect(emptyState).not.toHaveAttribute("aria-live");
    expect(screen.getByRole("button", { name: "Create first QR link" })).toHaveAttribute(
      "type",
      "button"
    );
    expect(within(emptyState).getByRole("button", { name: "Create first QR link" })).toHaveClass(
      "fs-cta-primary"
    );
    expect(within(emptyState).getByRole("button", { name: "Use example values" })).toHaveClass(
      "fs-cta-secondary"
    );

    fireEvent.click(within(emptyState).getByRole("button", { name: "Use example values" }));

    expect(screen.getByLabelText("Slug")).toHaveValue("intro-video");
    expect((screen.getByLabelText(/Destination URL/) as HTMLInputElement).value).toContain(
      "/course?lesson=mod1-l1"
    );
  });

  it("announces QR asset generation while preview assets are loading", async () => {
    generateQrAssetsMock.mockReturnValue(new Promise(() => {}));
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(qrLinksResponse([qrLink]))
      .mockResolvedValueOnce(contentResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminQrLinksManager />);

    await screen.findByText("intro-video");
    fireEvent.click(screen.getByRole("button", { name: "Show QR" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent(/Generating QR assets/);
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(generateQrAssetsMock).toHaveBeenCalledWith("http://localhost:3000/go/v/intro-video");
  });

  it("keeps QR asset generation errors retryable without changing the generation path", async () => {
    generateQrAssetsMock
      .mockRejectedValueOnce(new Error("QR generation failed."))
      .mockResolvedValueOnce({
        svgDataUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C/svg%3E",
        pngDataUrl: "data:image/png;base64,AAAA",
      });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(qrLinksResponse([qrLink]))
      .mockResolvedValueOnce(contentResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminQrLinksManager />);

    await screen.findByText("intro-video");
    fireEvent.click(screen.getByRole("button", { name: "Show QR" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Could not generate QR assets right now.");
    expect(alert).toHaveAttribute("aria-live", "assertive");

    fireEvent.click(within(alert).getByRole("button", { name: "Retry" }));

    expect(await screen.findByRole("button", { name: "Download SVG" })).toHaveClass(
      "fs-cta-secondary"
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(generateQrAssetsMock).toHaveBeenCalledTimes(2);
  });
});
