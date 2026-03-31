import { describe, expect, it } from "vitest";
import {
  extractAdminNoteClipboardImage,
  prepareAdminNoteImageFile,
  prepareAdminNoteImageFiles,
  readAdminNoteClipboardImageFromNavigator,
} from "@/lib/admin/note-compose";

function buildClipboardData(params: {
  kind?: string;
  type?: string;
  file?: File | null;
  files?: File[];
}): DataTransfer {
  return {
    items: [
      {
        kind: params.kind ?? "file",
        type: params.type ?? params.file?.type ?? "",
        getAsFile: () => params.file ?? null,
      },
    ],
    files: params.files ?? (params.file ? [params.file] : []),
  } as unknown as DataTransfer;
}

describe("extractAdminNoteClipboardImage", () => {
  it("ignores clipboard pastes with no image file", () => {
    const result = extractAdminNoteClipboardImage({
      clipboardData: buildClipboardData({
        kind: "string",
        type: "text/plain",
        file: null,
      }),
    });

    expect(result).toEqual({ matched: false });
  });

  it("normalizes pasted image files with a safe fallback filename", () => {
    const file = new File(["png"], "", { type: "image/png" });
    const result = extractAdminNoteClipboardImage({
      clipboardData: buildClipboardData({ file }),
    });

    expect(result.matched).toBe(true);
    if (!result.matched || !result.ok) {
      throw new Error("Expected clipboard image paste to succeed.");
    }
    expect(result.file.name).toBe("pasted-image.png");
    expect(result.file.type).toBe("image/png");
  });

  it("accepts clipboard images exposed only through DataTransfer.files", () => {
    const file = new File(["png"], "", { type: "image/png" });
    const result = extractAdminNoteClipboardImage({
      clipboardData: buildClipboardData({
        kind: "string",
        type: "text/plain",
        file: null,
        files: [file],
      }),
    });

    expect(result.matched).toBe(true);
    if (!result.matched || !result.ok) {
      throw new Error("Expected clipboard image fallback through files to succeed.");
    }
    expect(result.file.name).toBe("pasted-image.png");
    expect(result.file.type).toBe("image/png");
  });

  it("rejects unsupported pasted file types with the same attachment validation rules", () => {
    const file = new File(["pdf"], "notes.pdf", { type: "application/pdf" });
    const result = extractAdminNoteClipboardImage({
      clipboardData: buildClipboardData({ file }),
    });

    expect(result).toEqual({ matched: false });
  });

  it("surfaces attachment validation errors for oversized images", () => {
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "huge.png", {
      type: "image/png",
    });
    const result = extractAdminNoteClipboardImage({
      clipboardData: buildClipboardData({ file }),
    });

    expect(result.matched).toBe(true);
    if (!result.matched || result.ok) {
      throw new Error("Expected oversized clipboard image to fail validation.");
    }
    expect(result.error).toMatch(/5 MB or smaller/i);
  });
});

describe("prepareAdminNoteImageFile", () => {
  it("normalizes uploaded image files with the same attachment rules", () => {
    const file = new File(["png"], "evidence.png", { type: "image/png" });
    const result = prepareAdminNoteImageFile({ file });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected uploaded image preparation to succeed.");
    }

    expect(result.file.name).toBe("evidence.png");
    expect(result.file.type).toBe("image/png");
  });

  it("rejects non-image uploads before staging them locally", () => {
    const file = new File(["pdf"], "notes.pdf", { type: "application/pdf" });
    const result = prepareAdminNoteImageFile({ file });

    expect(result).toEqual({
      ok: false,
      error: "Only PNG, JPEG, WEBP, and GIF images are allowed.",
    });
  });
});

describe("prepareAdminNoteImageFiles", () => {
  it("prepares multiple uploaded images while preserving order", () => {
    const result = prepareAdminNoteImageFiles({
      files: [
        new File(["png"], "first.png", { type: "image/png" }),
        new File(["png"], "second.png", { type: "image/png" }),
      ],
      currentCount: 1,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected multiple image preparation to succeed.");
    }

    expect(result.files.map((file) => file.name)).toEqual(["first.png", "second.png"]);
  });

  it("rejects batches that would exceed the staged image cap", () => {
    const result = prepareAdminNoteImageFiles({
      files: [
        new File(["png"], "first.png", { type: "image/png" }),
        new File(["png"], "second.png", { type: "image/png" }),
      ],
      currentCount: 5,
    });

    expect(result).toEqual({
      ok: false,
      error: "You can stage up to 6 images per note. Remove one before adding more.",
    });
  });
});

describe("readAdminNoteClipboardImageFromNavigator", () => {
  it("reads an image from the async clipboard button flow", async () => {
    const result = await readAdminNoteClipboardImageFromNavigator({
      clipboard: {
        read: async () => [
          {
            types: ["image/png"],
            getType: async () => new Blob(["png"], { type: "image/png" }),
          },
        ],
      },
      secureContext: true,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected clipboard button image read to succeed.");
    }
    expect(result.file.name).toBe("pasted-image.png");
    expect(result.file.type).toBe("image/png");
  });

  it("explains when the clipboard button is unsupported in the current browser", async () => {
    await expect(
      readAdminNoteClipboardImageFromNavigator({
        clipboard: null,
        secureContext: true,
      })
    ).resolves.toEqual({
      ok: false,
      error:
        "This browser cannot read clipboard images from a button here yet. Use Upload image instead.",
    });
  });

  it("explains when no clipboard image is available for the button flow", async () => {
    await expect(
      readAdminNoteClipboardImageFromNavigator({
        clipboard: {
          read: async () => [
            {
              types: ["text/plain"],
              getType: async () => new Blob(["text"], { type: "text/plain" }),
            },
          ],
        },
        secureContext: true,
      })
    ).resolves.toEqual({
      ok: false,
      error: "Clipboard does not contain an image yet. Copy a screenshot first, then try again.",
    });
  });

  it("maps blocked clipboard access to actionable recovery guidance", async () => {
    await expect(
      readAdminNoteClipboardImageFromNavigator({
        clipboard: {
          read: async () => {
            throw new DOMException("blocked", "NotAllowedError");
          },
        },
        secureContext: true,
      })
    ).resolves.toEqual({
      ok: false,
      error:
        "Clipboard access was blocked. Allow paste access, then try again, or use Upload image instead.",
    });
  });
});
