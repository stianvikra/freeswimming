import { validateAdminNoteAttachment } from "@/lib/admin/notes";

type AdminNoteClipboardImageResult =
  | {
      matched: false;
    }
  | {
      matched: true;
      ok: false;
      error: string;
    }
  | {
      matched: true;
      ok: true;
      file: File;
    };

function extensionForMimeType(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/png":
    default:
      return "png";
  }
}

function buildClipboardFallbackName(mimeType: string): string {
  return `pasted-image.${extensionForMimeType(mimeType)}`;
}

export function extractAdminNoteClipboardImage(params: {
  clipboardData: DataTransfer | null | undefined;
}): AdminNoteClipboardImageResult {
  const entries = params.clipboardData?.items;
  const imageItem = entries
    ? Array.from(entries).find(
        (entry) => entry.kind === "file" && entry.type.trim().toLowerCase().startsWith("image/")
      )
    : null;

  if (!imageItem) {
    return { matched: false };
  }

  const rawFile = imageItem.getAsFile();
  if (!rawFile) {
    return {
      matched: true,
      ok: false,
      error: "Could not read the pasted image. Try again or use screenshot capture instead.",
    };
  }

  const fileName = rawFile.name.trim() || buildClipboardFallbackName(rawFile.type);
  const validated = validateAdminNoteAttachment({
    fileName,
    mimeType: rawFile.type,
    sizeBytes: rawFile.size,
  });

  if (!validated.ok) {
    return {
      matched: true,
      ok: false,
      error: validated.error,
    };
  }

  return {
    matched: true,
    ok: true,
    file: new File([rawFile], validated.value.fileName, {
      type: validated.value.mimeType,
      lastModified: rawFile.lastModified || Date.now(),
    }),
  };
}
