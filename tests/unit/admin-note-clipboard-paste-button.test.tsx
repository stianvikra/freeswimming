import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminNoteClipboardPasteButton from "@/components/admin/AdminNoteClipboardPasteButton";

describe("AdminNoteClipboardPasteButton", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
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
