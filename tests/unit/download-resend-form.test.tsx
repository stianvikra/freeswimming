import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DownloadResendForm from "@/components/commerce/DownloadResendForm";
import { RESEND_DOWNLOAD_GENERIC_MESSAGE } from "@/lib/commerce/download-resend";

describe("DownloadResendForm", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("posts resend request and shows non-enumerating success message", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        message: RESEND_DOWNLOAD_GENERIC_MESSAGE,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <DownloadResendForm
        initialEmail="  Buyer@Example.com "
        nextPath="/my-library"
        source="checkout_success"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Email me access link" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/download/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "buyer@example.com",
          nextPath: "/my-library",
          source: "checkout_success",
        }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText(RESEND_DOWNLOAD_GENERIC_MESSAGE)).toBeInTheDocument();
    });
  });

  it("shows API error when resend endpoint fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        ok: false,
        error: "Too many requests. Please try again shortly.",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<DownloadResendForm initialEmail="buyer@example.com" source="library_recovery" />);

    fireEvent.click(screen.getByRole("button", { name: "Email me access link" }));

    await waitFor(() => {
      expect(screen.getByText("Too many requests. Please try again shortly.")).toBeInTheDocument();
    });
  });
});
