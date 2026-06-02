import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DownloadResendForm from "@/components/commerce/DownloadResendForm";
import { RESEND_DOWNLOAD_GENERIC_MESSAGE } from "@/lib/commerce/download-resend";

describe("DownloadResendForm", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("uses shared field and action tokens without changing labels", () => {
    render(<DownloadResendForm initialEmail="buyer@example.com" source="checkout_success" />);

    const input = screen.getByLabelText("Purchase email");
    const button = screen.getByRole("button", { name: "Email me access link" });

    expect(input).toHaveClass("ui-field", "min-h-12");
    expect(button).toHaveClass("fs-cta-primary", "w-full", "sm:w-auto");
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

    const feedback = screen.getByTestId("download-resend-feedback");
    expect(feedback).toHaveAttribute("role", "status");
    expect(feedback).toHaveAttribute("aria-live", "polite");
    expect(feedback).toHaveAttribute("data-feedback-tone", "success");
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

    const feedback = screen.getByTestId("download-resend-feedback");
    expect(feedback).toHaveAttribute("role", "status");
    expect(feedback).toHaveAttribute("aria-live", "polite");
    expect(feedback).toHaveAttribute("data-feedback-tone", "error");
  });

  it("sends claim source from claim entry flow", async () => {
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
        initialEmail="buyer@example.com"
        nextPath="/my-library"
        source="claim_entry"
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
          source: "claim_entry",
        }),
      });
    });
  });

  it("shows validation feedback without submitting an empty purchase email", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<DownloadResendForm initialEmail="   " source="checkout_success" />);

    fireEvent.click(screen.getByRole("button", { name: "Email me access link" }));

    const feedback = screen.getByTestId("download-resend-feedback");
    const input = screen.getByLabelText("Purchase email");
    const button = screen.getByRole("button", { name: "Email me access link" });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(feedback).toHaveAttribute("role", "status");
    expect(feedback).toHaveAttribute("aria-live", "polite");
    expect(feedback).toHaveAttribute("data-feedback-tone", "error");
    expect(feedback).toHaveTextContent("Enter your purchase email.");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", feedback.id);
    expect(button).toHaveAttribute("aria-describedby", feedback.id);
  });

  it("announces pending resend state while keeping the existing submit label", async () => {
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}));
    vi.stubGlobal("fetch", fetchMock);

    render(<DownloadResendForm initialEmail="buyer@example.com" source="checkout_success" />);

    fireEvent.click(screen.getByRole("button", { name: "Email me access link" }));

    const feedback = await screen.findByTestId("download-resend-feedback");
    const button = screen.getByRole("button", { name: "Sending..." });

    expect(feedback).toHaveAttribute("role", "status");
    expect(feedback).toHaveAttribute("aria-live", "polite");
    expect(feedback).toHaveAttribute("data-feedback-tone", "pending");
    expect(feedback).toHaveTextContent("Sending access link...");
    expect(button).toHaveAttribute("aria-describedby", feedback.id);
  });
});
