import type { AdminNoteItem } from "@/lib/admin/notes";

type AdminNoteMutationResponse =
  | {
      ok: true;
      item: AdminNoteItem;
    }
  | {
      ok: false;
      error?: string;
    };

export async function uploadAdminNoteFiles(params: {
  noteId: string;
  files: File[];
}): Promise<AdminNoteItem> {
  const formData = new FormData();
  params.files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`/api/admin/notes/${params.noteId}/attachments`, {
    method: "POST",
    credentials: "same-origin",
    body: formData,
  });

  const payload = (await response.json()) as AdminNoteMutationResponse;
  if (!response.ok || !payload.ok || !payload.item) {
    throw new Error(
      payload.ok
        ? "Could not upload attachments."
        : (payload.error ?? "Could not upload attachments.")
    );
  }

  return payload.item;
}
