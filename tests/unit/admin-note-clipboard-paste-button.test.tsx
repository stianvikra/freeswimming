import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminNoteClipboardPasteButton from "@/components/admin/AdminNoteClipboardPasteButton";

describe("AdminNoteClipboardPasteButton", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("uses the shared secondary action fallback while preserving caller class composition", () => {
    const onPasteReady = vi.fn();

    render(
      <AdminNoteClipboardPasteButton
        onPasteReady={onPasteReady}
        className="w-full justify-start"
        buttonTestId="paste-image"
      />
    );

    const button = screen.getByTestId("paste-image");
    expect(button).toHaveClass("fs-cta-secondary");
    expect(button).toHaveClass("min-h-9");
    expect(button).toHaveClass("min-w-0");
    expect(button).toHaveClass("focus-visible:ring-blue-700");
    expect(button).toHaveClass("w-full");
    expect(button).toHaveClass("sm:w-auto");
    expect(button).toHaveClass("justify-start");
    expect(button).not.toHaveClass("rounded-lg");
    expect(button).not.toHaveClass("border-slate-200");
    expect(button).not.toHaveClass("text-slate-700");
  });

  it("reads an image from the clipboard and forwards it to the caller", async () => {
    const user = userEvent.setup();
    const onPasteReady = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    const read = vi.fn().mockResolvedValue([
      {
        types: ["image/png"],
        getType: async () => new Blob(["png"], { type: "image/png" }),
      },
    ]);

    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { read },
    });

    render(<AdminNoteClipboardPasteButton onPasteReady={onPasteReady} onSuccess={onSuccess} />);

    await user.click(screen.getByRole("button", { name: "Paste image from clipboard" }));

    await waitFor(() => {
      expect(onPasteReady).toHaveBeenCalledTimes(1);
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);

    const firstArg = onPasteReady.mock.calls[0]?.[0];
    expect(firstArg).toBeInstanceOf(File);
    expect(firstArg?.name).toBe("pasted-image.png");
    expect(firstArg?.type).toBe("image/png");
  });

  it("surfaces actionable recovery when the clipboard button cannot read an image", async () => {
    const user = userEvent.setup();
    const onPasteReady = vi.fn();
    const onError = vi.fn();

    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { read: undefined },
    });

    render(<AdminNoteClipboardPasteButton onPasteReady={onPasteReady} onError={onError} />);

    await user.click(screen.getByRole("button", { name: "Paste image from clipboard" }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        "This browser cannot read clipboard images from a button here yet. Use Upload image instead."
      );
    });
    expect(onPasteReady).not.toHaveBeenCalled();
  });
});
