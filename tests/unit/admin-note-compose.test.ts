import { describe, expect, it } from "vitest";
import { extractAdminNoteClipboardImage } from "@/lib/admin/note-compose";

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
