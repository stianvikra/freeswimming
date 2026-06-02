import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CourseOpenOnPhoneCard from "@/components/course/CourseOpenOnPhoneCard";

const generateQrAssetsMock = vi.hoisted(() => vi.fn());

vi.mock("next/image", () => ({
  default: () => null,
}));

vi.mock("@/lib/qr-links/codegen", () => ({
  generateQrAssets: generateQrAssetsMock,
}));

function renderCard() {
  render(<CourseOpenOnPhoneCard lessonTitle="Fixture lesson" sharePath="/course?lesson=mod1-l1" />);
}

function stubClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText,
    },
  });
}

function stubShare(share: ReturnType<typeof vi.fn> | undefined) {
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: share,
  });
}

describe("CourseOpenOnPhoneCard", () => {
  afterEach(() => {
    cleanup();
    generateQrAssetsMock.mockReset();
    vi.clearAllMocks();
  });

  it("uses AW-006 card, action, and mobile layout tokens", () => {
    generateQrAssetsMock.mockReturnValue(new Promise(() => {}));

    renderCard();

    expect(screen.getByTestId("course-open-on-phone-card")).toHaveClass(
      "fs-library-card",
      "fs-library-card-muted"
    );
    expect(screen.getByTestId("course-open-on-phone-actions")).toHaveClass(
      "grid",
      "grid-cols-2",
      "sm:flex",
      "sm:justify-start"
    );
    expect(screen.getByTestId("course-open-on-phone-share")).toHaveClass(
      "fs-cta-secondary",
      "w-full",
      "sm:w-auto"
    );
    expect(screen.getByTestId("course-open-on-phone-copy")).toHaveClass(
      "fs-cta-secondary",
      "w-full",
      "sm:w-auto"
    );
  });

  it("announces QR generation while preserving the generated share URL", async () => {
    generateQrAssetsMock.mockReturnValue(new Promise(() => {}));

    renderCard();

    const status = await screen.findByTestId("course-open-on-phone-qr-loading");
    expect(status).toHaveAttribute("role", "status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("data-feedback-tone", "loading");
    expect(generateQrAssetsMock).toHaveBeenCalledWith(
      "http://localhost:3000/course?lesson=mod1-l1"
    );
  });

  it("keeps QR generation errors retryable with alert semantics", async () => {
    generateQrAssetsMock
      .mockRejectedValueOnce(new Error("QR generation failed."))
      .mockResolvedValueOnce({
        svgDataUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C/svg%3E",
        pngDataUrl: "data:image/png;base64,AAAA",
      });

    renderCard();

    const alert = await screen.findByTestId("course-open-on-phone-qr-error");
    expect(alert).toHaveAttribute("role", "alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveAttribute("data-feedback-tone", "error");
    expect(alert).toHaveTextContent("Could not generate QR image right now.");

    const retryButton = screen.getByRole("button", { name: "Retry" });
    expect(retryButton).toHaveAttribute("aria-describedby", alert.id);
    expect(retryButton).toHaveClass("fs-cta-secondary");

    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(generateQrAssetsMock).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(screen.queryByTestId("course-open-on-phone-qr-error")).not.toBeInTheDocument();
    });
  });

  it("announces copy success and connects feedback to the action", async () => {
    generateQrAssetsMock.mockResolvedValue({
      svgDataUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C/svg%3E",
      pngDataUrl: "data:image/png;base64,AAAA",
    });
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);

    renderCard();

    const copyButton = screen.getByRole("button", { name: "Copy link" });
    fireEvent.click(copyButton);

    const feedback = await screen.findByTestId("course-open-on-phone-action-feedback");
    expect(feedback).toHaveAttribute("role", "status");
    expect(feedback).toHaveAttribute("aria-live", "polite");
    expect(feedback).toHaveAttribute("data-feedback-tone", "success");
    expect(feedback).toHaveTextContent("Link copied.");
    expect(screen.getByRole("button", { name: "Copied" })).toHaveAttribute(
      "aria-describedby",
      feedback.id
    );
    expect(writeText).toHaveBeenCalledWith("http://localhost:3000/course?lesson=mod1-l1");
  });

  it("announces copy failures as recoverable alerts", async () => {
    generateQrAssetsMock.mockResolvedValue({
      svgDataUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C/svg%3E",
      pngDataUrl: "data:image/png;base64,AAAA",
    });
    stubClipboard(vi.fn().mockRejectedValue(new Error("Clipboard denied.")));

    renderCard();

    const copyButton = screen.getByRole("button", { name: "Copy link" });
    fireEvent.click(copyButton);

    const feedback = await screen.findByTestId("course-open-on-phone-action-feedback");
    expect(feedback).toHaveAttribute("role", "alert");
    expect(feedback).toHaveAttribute("aria-live", "assertive");
    expect(feedback).toHaveAttribute("data-feedback-tone", "error");
    expect(feedback).toHaveTextContent("Could not copy link automatically.");
    expect(copyButton).toHaveAttribute("aria-describedby", feedback.id);
  });

  it("keeps unsupported native share falling back to copy feedback", async () => {
    generateQrAssetsMock.mockResolvedValue({
      svgDataUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C/svg%3E",
      pngDataUrl: "data:image/png;base64,AAAA",
    });
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    stubShare(undefined);

    renderCard();

    fireEvent.click(screen.getByRole("button", { name: "Share link" }));

    const feedback = await screen.findByTestId("course-open-on-phone-action-feedback");
    expect(feedback).toHaveAttribute("role", "status");
    expect(feedback).toHaveAttribute("data-feedback-tone", "success");
    expect(feedback).toHaveTextContent("Link copied.");
    expect(writeText).toHaveBeenCalledWith("http://localhost:3000/course?lesson=mod1-l1");
  });

  it("announces share sheet failures without treating cancelled shares as errors", async () => {
    generateQrAssetsMock.mockResolvedValue({
      svgDataUrl: "data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C/svg%3E",
      pngDataUrl: "data:image/png;base64,AAAA",
    });
    const share = vi
      .fn()
      .mockRejectedValueOnce(new Error("Share failed."))
      .mockRejectedValueOnce(new Error("AbortError: user cancelled"));
    stubShare(share);

    renderCard();

    const shareButton = screen.getByRole("button", { name: "Share link" });
    fireEvent.click(shareButton);

    const feedback = await screen.findByTestId("course-open-on-phone-action-feedback");
    expect(feedback).toHaveAttribute("role", "alert");
    expect(feedback).toHaveAttribute("data-feedback-tone", "error");
    expect(feedback).toHaveTextContent("Could not open share sheet right now.");
    expect(shareButton).toHaveAttribute("aria-describedby", feedback.id);

    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.queryByTestId("course-open-on-phone-action-feedback")).not.toBeInTheDocument();
    });
    expect(share).toHaveBeenCalledTimes(2);
  });
});
