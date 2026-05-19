import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminQrLinksManager from "@/components/admin/AdminQrLinksManager";
import type { QrRedirectLinkRow } from "@/lib/qr-links/admin";

vi.mock("next/image", () => ({
  default: () => null,
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

    fireEvent.click(within(emptyState).getByRole("button", { name: "Use example values" }));

    expect(screen.getByLabelText("Slug")).toHaveValue("intro-video");
    expect((screen.getByLabelText(/Destination URL/) as HTMLInputElement).value).toContain(
      "/course?lesson=mod1-l1"
    );
  });
});
