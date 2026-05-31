import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminNoteScreenshotCaptureButton from "@/components/admin/AdminNoteScreenshotCaptureButton";

type CaptureOverride = NonNullable<Window["__FS_ADMIN_SCREENSHOT_CAPTURE_OVERRIDE__"]>;

function setCaptureOverride(override: CaptureOverride) {
  window.__FS_ADMIN_SCREENSHOT_CAPTURE_OVERRIDE__ = override;
}

function clearCaptureOverride() {
  delete window.__FS_ADMIN_SCREENSHOT_CAPTURE_OVERRIDE__;
}

function buildFrame() {
  return {
    blob: new Blob(["capture"], { type: "image/png" }),
    width: 400,
    height: 240,
    fileName: "captured-proof.png",
  };
}

describe("AdminNoteScreenshotCaptureButton", () => {
  afterEach(() => {
    cleanup();
    clearCaptureOverride();
    vi.restoreAllMocks();
  });

  it("captures a preview and forwards the cropped file on save", async () => {
    const onCaptureReady = vi.fn().mockResolvedValue(undefined);
    const croppedFile = new File(["cropped"], "captured-proof.png", { type: "image/png" });
    setCaptureOverride({
      isSupported: () => true,
      capture: async () => buildFrame(),
      cropToFile: async () => croppedFile,
    });

    render(<AdminNoteScreenshotCaptureButton onCaptureReady={onCaptureReady} />);

    const trigger = screen.getByTestId("admin-note-screenshot-capture-trigger");
    expect(trigger).toHaveClass("fs-cta-secondary");
    fireEvent.click(trigger);

    await screen.findByTestId("admin-note-screenshot-capture-dialog");
    await screen.findByTestId("admin-note-screenshot-preview-image");
    expect(screen.getByTestId("admin-note-screenshot-preview-panel")).toHaveClass(
      "rounded-[var(--fs-radius-control)]",
      "border-[color:var(--fs-border-soft)]"
    );
    expect(screen.getByTestId("admin-note-screenshot-preview-surface")).toHaveClass(
      "rounded-[var(--fs-radius-card)]",
      "border-[color:var(--fs-border-soft)]"
    );
    expect(screen.getByRole("button", { name: "Use full capture" })).toHaveClass(
      "fs-cta-secondary"
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveClass("fs-cta-secondary");
    expect(screen.getByRole("button", { name: "Save screenshot" })).toHaveClass("fs-cta-primary");

    fireEvent.click(screen.getByRole("button", { name: "Save screenshot" }));

    await waitFor(() => {
      expect(onCaptureReady).toHaveBeenCalledWith(croppedFile);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("admin-note-screenshot-capture-dialog")).not.toBeInTheDocument();
    });
  });

  it("hides marked note surfaces while the capture frame is being collected", async () => {
    const capture = vi.fn(async () => {
      const hiddenTarget = screen.getByTestId("screenshot-hide-target");
      expect(hiddenTarget.style.visibility).toBe("hidden");
      expect(hiddenTarget.style.pointerEvents).toBe("none");
      return buildFrame();
    });

    setCaptureOverride({
      isSupported: () => true,
      capture,
      cropToFile: async () =>
        new File(["cropped"], "captured-proof.png", {
          type: "image/png",
        }),
    });

    render(
      <div data-testid="screenshot-hide-target" data-admin-screenshot-hide-during-capture="true">
        <AdminNoteScreenshotCaptureButton onCaptureReady={vi.fn()} />
      </div>
    );

    fireEvent.click(screen.getByTestId("admin-note-screenshot-capture-trigger"));

    await waitFor(() => {
      expect(capture).toHaveBeenCalledTimes(1);
    });
    await screen.findByTestId("admin-note-screenshot-preview-image");

    const hiddenTarget = screen.getByTestId("screenshot-hide-target");
    expect(hiddenTarget.style.visibility).toBe("");
    expect(hiddenTarget.style.pointerEvents).toBe("");
  });

  it("shows permission recovery when browser access is denied", async () => {
    setCaptureOverride({
      isSupported: () => true,
      capture: async () => {
        const error = new Error("Permission denied");
        error.name = "NotAllowedError";
        throw error;
      },
    });

    render(<AdminNoteScreenshotCaptureButton onCaptureReady={vi.fn()} />);

    fireEvent.click(screen.getByTestId("admin-note-screenshot-capture-trigger"));

    await screen.findByTestId("admin-note-screenshot-capture-dialog");
    await screen.findByText(/Screenshot permission was denied/i);
    const recoveryStatus = screen.getByRole("status");
    expect(recoveryStatus).toHaveAttribute("aria-live", "polite");
    expect(recoveryStatus).toHaveTextContent("Capture did not start");
    expect(recoveryStatus).toHaveClass("border-amber-200", "bg-amber-50", "text-amber-800");
    expect(screen.getByRole("button", { name: "Retry capture" })).toHaveClass("fs-cta-primary");
    expect(screen.getByRole("button", { name: "Use image upload instead" })).toHaveClass(
      "fs-cta-secondary"
    );
  });

  it("shows unsupported capture feedback with the admin state primitive", async () => {
    setCaptureOverride({
      isSupported: () => false,
      capture: vi.fn(),
    });

    render(<AdminNoteScreenshotCaptureButton onCaptureReady={vi.fn()} />);

    fireEvent.click(screen.getByTestId("admin-note-screenshot-capture-trigger"));

    await screen.findByTestId("admin-note-screenshot-capture-dialog");

    const recoveryStatus = screen.getByRole("status");
    expect(recoveryStatus).toHaveAttribute("aria-live", "polite");
    expect(recoveryStatus).toHaveTextContent("Capture is not available here");
    expect(recoveryStatus).toHaveTextContent(/does not support in-app screenshot capture/i);
    expect(screen.queryByRole("button", { name: "Retry capture" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Use image upload instead" })).toHaveClass(
      "fs-cta-secondary"
    );
  });

  it("keeps the preview open when save fails", async () => {
    const onCaptureReady = vi.fn().mockRejectedValue(new Error("Could not upload screenshot."));
    setCaptureOverride({
      isSupported: () => true,
      capture: async () => buildFrame(),
      cropToFile: async () =>
        new File(["cropped"], "captured-proof.png", {
          type: "image/png",
        }),
    });

    render(<AdminNoteScreenshotCaptureButton onCaptureReady={onCaptureReady} />);

    fireEvent.click(screen.getByTestId("admin-note-screenshot-capture-trigger"));

    await screen.findByTestId("admin-note-screenshot-preview-image");
    fireEvent.click(screen.getByRole("button", { name: "Save screenshot" }));

    await screen.findByText("Could not upload screenshot.");
    const saveErrorStatus = screen.getByRole("status");
    expect(saveErrorStatus).toHaveAttribute("aria-live", "polite");
    expect(saveErrorStatus).toHaveClass("border-rose-200", "bg-rose-50", "text-rose-700");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByTestId("admin-note-screenshot-capture-dialog")).toBeInTheDocument();
  });

  it("cancels preview without forwarding a file", async () => {
    const onCaptureReady = vi.fn();
    setCaptureOverride({
      isSupported: () => true,
      capture: async () => buildFrame(),
      cropToFile: async () =>
        new File(["cropped"], "captured-proof.png", {
          type: "image/png",
        }),
    });

    render(<AdminNoteScreenshotCaptureButton onCaptureReady={onCaptureReady} />);

    fireEvent.click(screen.getByTestId("admin-note-screenshot-capture-trigger"));

    await screen.findByTestId("admin-note-screenshot-preview-image");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByTestId("admin-note-screenshot-capture-dialog")).not.toBeInTheDocument();
    });
    expect(onCaptureReady).not.toHaveBeenCalled();
  });
});
