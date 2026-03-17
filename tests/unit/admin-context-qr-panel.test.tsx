import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminContextQrPanel from "@/components/admin/AdminContextQrPanel";

describe("AdminContextQrPanel", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("prefills lesson QR defaults from edit context", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        items: [],
        schemaReady: true,
        warning: null,
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
});
