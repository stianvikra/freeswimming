import { NextResponse } from "next/server";
import { loadHydratedAdminNoteById, selectAdminNoteFields } from "@/lib/admin/notes-server";
import {
  ADMIN_NOTE_ATTACHMENT_BUCKET,
  ADMIN_NOTE_ATTACHMENT_MAX_FILES,
  buildAdminNoteAttachmentStoragePath,
  isUuid,
  validateAdminNoteAttachment,
} from "@/lib/admin/notes";
import { getAdminSchemaSetupMessage, isAdminNotesSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function noStoreJson(
  body: Record<string, unknown>,
  init?: {
    status?: number;
  }
) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function selectAttachmentFields() {
  return `
    id,
    note_id,
    file_name,
    mime_type,
    size_bytes,
    storage_path,
    created_at,
    created_by
  `;
}

async function resolveNoteId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.id;
}

export async function POST(request: Request, context: RouteContext) {
  const noteId = await resolveNoteId(context);
  if (!isUuid(noteId)) {
    return noStoreJson({ ok: false, error: "Invalid note id." }, { status: 400 });
  }

  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const gate = await requireAdminRoleFromSupabase(supabase, {
    allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
    minimumRole: "editor",
  });

  if (!gate.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: gate.error }, { status: gate.status })
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unsupported content type." }, { status: 415 })
    );
  }

  const noteResult = await supabase
    .from("admin_notes")
    .select(selectAdminNoteFields())
    .eq("id", noteId)
    .maybeSingle();

  if (noteResult.error) {
    if (isAdminNotesSchemaMissing(noteResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("notes"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error("[AdminNotes] Could not load note before attachment upload", noteResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not upload attachments right now." }, { status: 500 })
    );
  }

  if (!noteResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Note not found." }, { status: 404 })
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid form data." }, { status: 400 })
    );
  }

  const listedFiles = formData.getAll("files");
  const fileEntries = listedFiles.length > 0 ? listedFiles : [formData.get("file")].filter(Boolean);
  if (fileEntries.length === 0) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Attach at least one image." }, { status: 400 })
    );
  }

  if (fileEntries.length > ADMIN_NOTE_ATTACHMENT_MAX_FILES) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: `Upload at most ${ADMIN_NOTE_ATTACHMENT_MAX_FILES} images at a time.`,
        },
        { status: 400 }
      )
    );
  }

  const adminSupabase = createAdminSupabaseClient();
  const attachmentRows: Array<{
    id: string;
    note_id: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
    storage_path: string;
    created_by: string;
  }> = [];
  const uploadedPaths: string[] = [];

  for (const entry of fileEntries) {
    if (!(entry instanceof File)) {
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Attach valid image files only." }, { status: 400 })
      );
    }

    const validated = validateAdminNoteAttachment({
      fileName: entry.name,
      mimeType: entry.type,
      sizeBytes: entry.size,
    });

    if (!validated.ok) {
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: validated.error }, { status: 400 })
      );
    }

    const attachmentId = crypto.randomUUID();
    const storagePath = buildAdminNoteAttachmentStoragePath({
      noteId,
      attachmentId,
      fileName: validated.value.fileName,
    });
    const uploadResult = await adminSupabase.storage
      .from(ADMIN_NOTE_ATTACHMENT_BUCKET)
      .upload(storagePath, entry, {
        contentType: validated.value.mimeType,
        upsert: false,
      });

    if (uploadResult.error) {
      if (uploadedPaths.length > 0) {
        await adminSupabase.storage.from(ADMIN_NOTE_ATTACHMENT_BUCKET).remove(uploadedPaths);
      }

      console.error("[AdminNotes] Could not upload attachment", {
        noteId,
        fileName: validated.value.fileName,
        error: uploadResult.error,
      });
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: "Could not upload attachments right now. Refresh and retry.",
          },
          { status: 500 }
        )
      );
    }

    uploadedPaths.push(storagePath);
    attachmentRows.push({
      id: attachmentId,
      note_id: noteId,
      file_name: validated.value.fileName,
      mime_type: validated.value.mimeType,
      size_bytes: validated.value.sizeBytes,
      storage_path: storagePath,
      created_by: gate.user.id,
    });
  }

  const insertResult = await supabase
    .from("admin_note_attachments")
    .insert(attachmentRows)
    .select(selectAttachmentFields());

  if (insertResult.error) {
    await adminSupabase.storage.from(ADMIN_NOTE_ATTACHMENT_BUCKET).remove(uploadedPaths);

    if (isAdminNotesSchemaMissing(insertResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("notes"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error("[AdminNotes] Could not save attachment metadata", insertResult.error);
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Could not save attachment metadata right now. Refresh and retry.",
        },
        { status: 500 }
      )
    );
  }

  const refreshed = await loadHydratedAdminNoteById({
    supabase,
    noteId,
  });

  if (!refreshed.ok) {
    if (isAdminNotesSchemaMissing(refreshed.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("notes"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error("[AdminNotes] Could not hydrate note after attachment upload", refreshed.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not upload attachments right now." }, { status: 500 })
    );
  }

  if (!refreshed.item) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Note not found." }, { status: 404 })
    );
  }

  return applySupabaseCookies(
    noStoreJson(
      {
        ok: true,
        item: refreshed.item,
      },
      { status: 201 }
    )
  );
}
