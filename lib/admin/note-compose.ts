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

type AdminNotePreparedImageFileResult =
  | {
      ok: false;
      error: string;
    }
  | {
      ok: true;
      file: File;
    };

type ClipboardReadableItem = {
  types: readonly string[];
  getType: (type: string) => Promise<Blob>;
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

export function prepareAdminNoteImageFile(params: {
  file: Blob | File;
  fileName?: string;
}): AdminNotePreparedImageFileResult {
  const mimeType = params.file.type.trim().toLowerCase();
  if (!mimeType.startsWith("image/")) {
    return { ok: false, error: "Only PNG, JPEG, WEBP, and GIF images are allowed." };
  }

  const fileName =
    params.fileName?.trim() ||
    ("name" in params.file && typeof params.file.name === "string"
      ? params.file.name.trim()
      : "") ||
    buildClipboardFallbackName(mimeType);
  const validated = validateAdminNoteAttachment({
    fileName,
    mimeType,
    sizeBytes: params.file.size,
  });

  if (!validated.ok) {
    return {
      ok: false,
      error: validated.error,
    };
  }

  return {
    ok: true,
    file: new File([params.file], validated.value.fileName, {
      type: validated.value.mimeType,
      lastModified:
        "lastModified" in params.file && typeof params.file.lastModified === "number"
          ? params.file.lastModified
          : Date.now(),
    }),
  };
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

  const fileEntries = params.clipboardData?.files;
  const imageFile = fileEntries
    ? Array.from(fileEntries).find((file) => file.type.trim().toLowerCase().startsWith("image/"))
    : null;

  if (!imageItem && !imageFile) {
    return { matched: false };
  }

  const rawFile = imageItem?.getAsFile() ?? imageFile ?? null;
  if (!rawFile) {
    return {
      matched: true,
      ok: false,
      error: "Could not read the pasted image. Try again or use Upload image instead.",
    };
  }

  const prepared = prepareAdminNoteImageFile({
    file: rawFile,
    fileName: rawFile.name.trim() || buildClipboardFallbackName(rawFile.type),
  });

  return prepared.ok
    ? { matched: true, ok: true, file: prepared.file }
    : { matched: true, ok: false, error: prepared.error };
}

export async function readAdminNoteClipboardImageFromNavigator(params: {
  clipboard:
    | {
        read: () => Promise<readonly ClipboardReadableItem[]>;
      }
    | null
    | undefined;
  secureContext?: boolean;
}): Promise<AdminNotePreparedImageFileResult> {
  if (params.secureContext === false) {
    return {
      ok: false,
      error:
        "Clipboard image paste requires a secure browser context here. Use Upload image instead.",
    };
  }

  if (!params.clipboard?.read) {
    return {
      ok: false,
      error:
        "This browser cannot read clipboard images from a button here yet. Use Upload image instead.",
    };
  }

  try {
    const items = await params.clipboard.read();
    for (const item of items) {
      const imageMimeType = item.types.find((type) =>
        type.trim().toLowerCase().startsWith("image/")
      );
      if (!imageMimeType) {
        continue;
      }

      const blob = await item.getType(imageMimeType);
      return prepareAdminNoteImageFile({
        file: blob,
        fileName: buildClipboardFallbackName(blob.type || imageMimeType),
      });
    }

    return {
      ok: false,
      error: "Clipboard does not contain an image yet. Copy a screenshot first, then try again.",
    };
  } catch (error) {
    const errorName =
      error instanceof DOMException
        ? error.name
        : error && typeof error === "object" && "name" in error
          ? String(error.name)
          : "";

    if (errorName === "NotAllowedError") {
      return {
        ok: false,
        error:
          "Clipboard access was blocked. Allow paste access, then try again, or use Upload image instead.",
      };
    }

    return {
      ok: false,
      error: "Could not read an image from the clipboard right now. Use Upload image instead.",
    };
  }
}
