import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminContextQrPanel from "@/components/admin/AdminContextQrPanel";
import type { QrRedirectLinkRow } from "@/lib/qr-links/admin";

const contextQrLink: QrRedirectLinkRow = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  slug: "breathing-and-floating--first-breaths",
  destination_url: "https://freeswimming.org/course?lesson=breathing-and-floating--first-breaths",
  status: "draft",
  content_item_id: "123e4567-e89b-42d3-a456-426614174000",
  content_label: "First breaths",
  placement_key: "course.lesson.share",
  owner_user_id: null,
  created_by: "admin-user-id",
  updated_by: "admin-user-id",
  created_at: "2026-05-20T10:00:00.000Z",
  updated_at: "2026-05-20T10:00:00.000Z",
  last_resolved_at: null,
};

function qrLinksResponse(params?: {
  items?: QrRedirectLinkRow[];
  schemaReady?: boolean;
  warning?: string | null;
}) {
  return {
    ok: true,
    json: async () => ({
      ok: true,
      items: params?.items ?? [],
      schemaReady: params?.schemaReady ?? true,
      warning: params?.warning ?? null,
    }),
  };
}

describe("AdminContextQrPanel", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("prefills lesson QR defaults from edit context", async () => {
    const fetchMock = vi.fn().mockResolvedValue(qrLinksResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminContextQrPanel
        contentItemId="123e4567-e89b-42d3-a456-426614174000"
        contentLabel="First breaths"
        slugHint="breathing-and-floating--first-breaths"
        destinationPath="/course?lesson=breathing-and-floating--first-breaths"
        placementKey="course.lesson.share"
      />
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/qr-links?contentItemId=123e4567-e89b-42d3-a456-426614174000",
        expect.objectContaining({
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        })
      );
    });

    expect(await screen.findByTestId("admin-context-qr-create-form")).toBeVisible();
    const emptyState = screen.getByTestId("admin-context-qr-empty-state");
    expect(emptyState).toHaveTextContent("No QR links attached yet");
    expect(emptyState).toHaveTextContent("Create the first stable `/go/v/` link from this editor.");
    expect(emptyState).not.toHaveAttribute("role");
    expect(emptyState).not.toHaveAttribute("aria-live");
    expect(screen.getByLabelText("Slug")).toHaveValue("breathing-and-floating--first-breaths");
    expect(screen.getByLabelText("Placement key")).toHaveValue("course.lesson.share");
    expect(screen.getByRole("textbox", { name: /Destination URL \(https\)/i })).toHaveValue(
      "http://localhost:3000/course?lesson=breathing-and-floating--first-breaths"
    );
    expect(screen.getByRole("link", { name: "Open full QR registry" })).toHaveAttribute(
      "href",
      expect.stringContaining("qrContentItemId=123e4567-e89b-42d3-a456-426614174000")
    );
  });

  it("uses AW-006 token cards and actions for contextual QR links", async () => {
    const fetchMock = vi.fn().mockResolvedValue(qrLinksResponse({ items: [contextQrLink] }));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminContextQrPanel
        contentItemId="123e4567-e89b-42d3-a456-426614174000"
        contentLabel="First breaths"
        slugHint="breathing-and-floating--first-breaths"
        destinationPath="/course?lesson=breathing-and-floating--first-breaths"
        placementKey="course.lesson.share"
      />
    );

    await screen.findByText("breathing-and-floating--first-breaths");

    const panel = screen.getByTestId("admin-context-qr-panel");
    expect(panel).toHaveClass("fs-library-card", "fs-library-card-muted");
    expect(screen.getByRole("link", { name: "Open full QR registry" })).toHaveClass(
      "fs-cta-secondary"
    );

    const item = screen.getByTestId("admin-context-qr-item");
    expect(item).toHaveClass("fs-library-card");
    expect(within(item).getByRole("button", { name: "Copy stable link" })).toHaveClass(
      "fs-cta-primary"
    );
    expect(within(item).getByRole("link", { name: "Open redirect" })).toHaveClass(
      "fs-cta-secondary"
    );
    expect(within(item).getByRole("link", { name: "Open destination" })).toHaveClass(
      "fs-cta-secondary"
    );
    expect(within(item).getByRole("button", { name: "Edit QR" })).toHaveClass("fs-cta-secondary");
    expect(within(item).getByRole("button", { name: "Set active" }).className).toContain(
      "rounded-[var(--fs-radius-control)]"
    );
    expect(within(item).getByRole("button", { name: "Delete" })).toHaveClass("text-rose-700");

    fireEvent.click(within(item).getByRole("button", { name: "Edit QR" }));

    expect(within(item).getByRole("button", { name: "Save QR changes" })).toHaveClass(
      "fs-cta-primary"
    );
    expect(within(item).getByRole("button", { name: "Cancel" })).toHaveClass("fs-cta-secondary");
    expect(screen.getByRole("button", { name: "Create QR link" })).toHaveClass("fs-cta-primary");
    expect(screen.getByRole("button", { name: "Reset defaults" })).toHaveClass("fs-cta-secondary");
  });

  it("announces contextual QR loading politely", () => {
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminContextQrPanel
        contentItemId="123e4567-e89b-42d3-a456-426614174000"
        contentLabel="First breaths"
      />
    );

    const loadingState = screen.getByRole("status");
    expect(loadingState).toHaveAttribute("aria-live", "polite");
    expect(loadingState).toHaveTextContent("Loading QR links for this content…");
  });

  it("renders schema warnings with the admin state helper", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      qrLinksResponse({
        schemaReady: false,
        warning: "QR schema is not ready.",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminContextQrPanel
        contentItemId="123e4567-e89b-42d3-a456-426614174000"
        contentLabel="First breaths"
      />
    );

    const warning = await screen.findByText("QR schema is not ready.");
    const warningState = warning.closest('[role="status"]');
    expect(warningState).toHaveAttribute("aria-live", "polite");
    expect(warningState).toHaveClass("border-amber-200", "bg-amber-50", "text-amber-800");
  });

  it("keeps contextual QR load errors retryable", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          ok: false,
          error: "Could not load QR links for this content.",
        }),
      })
      .mockResolvedValueOnce(qrLinksResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminContextQrPanel
        contentItemId="123e4567-e89b-42d3-a456-426614174000"
        contentLabel="First breaths"
      />
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveTextContent("Could not load QR links for this content.");

    fireEvent.click(within(alert).getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByTestId("admin-context-qr-create-form")).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("announces contextual QR action feedback politely without changing the create payload", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(qrLinksResponse())
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          item: contextQrLink,
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminContextQrPanel
        contentItemId="123e4567-e89b-42d3-a456-426614174000"
        contentLabel="First breaths"
        slugHint="breathing-and-floating--first-breaths"
        destinationPath="/course?lesson=breathing-and-floating--first-breaths"
        placementKey="course.lesson.share"
      />
    );

    await screen.findByTestId("admin-context-qr-create-form");

    fireEvent.click(screen.getByRole("button", { name: "Create QR link" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/admin/qr-links",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        body: expect.stringContaining("breathing-and-floating--first-breaths"),
      })
    );

    const notice = await screen.findByRole("status", { name: "" });
    expect(notice).toHaveAttribute("aria-live", "polite");
    expect(notice).toHaveTextContent("QR link created.");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
