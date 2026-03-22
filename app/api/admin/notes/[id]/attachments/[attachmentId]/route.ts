import { NextResponse } from "next/server";
import { loadHydratedAdminNoteById } from "@/lib/admin/notes-server";
import {
  ADMIN_NOTE_ATTACHMENT_BUCKET,
  isUuid,
  type AdminNoteAttachmentRow,
} from "@/lib/admin/notes";
import { getAdminSchemaSetupMessage, isAdminNotesSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type RouteContext = {
  params: Promise<{ id: string; attachmentId: string }>;
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

async function resolveParams(
  context: RouteContext
): Promise<{ noteId: string; attachmentId: string }> {
  const params = await context.params;
  return {
    noteId: params.id,
    attachmentId: params.attachmentId,
  };
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { noteId, attachmentId } = await resolveParams(context);
  if (!isUuid(noteId) || !isUuid(attachmentId)) {
    return noStoreJson({ ok: false, error: "Invalid note attachment id." }, { status: 400 });
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

  const existingResult = await supabase
    .from("admin_note_attachments")
    .select(selectAttachmentFields())
    .eq("id", attachmentId)
    .eq("note_id", noteId)
    .maybeSingle();

  if (existingResult.error) {
    if (isAdminNotesSchemaMissing(existingResult.error)) {
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

    console.error("[AdminNotes] Could not load attachment before delete", existingResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not delete attachment right now." }, { status: 500 })
    );
  }

  if (!existingResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Attachment not found." }, { status: 404 })
    );
  }

  const attachmentRow = existingResult.data as unknown as AdminNoteAttachmentRow;
  const deleteResult = await supabase
    .from("admin_note_attachments")
    .delete()
    .eq("id", attachmentId)
    .eq("note_id", noteId)
    .select(selectAttachmentFields())
    .maybeSingle();

  if (deleteResult.error) {
    if (isAdminNotesSchemaMissing(deleteResult.error)) {
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

    console.error("[AdminNotes] Could not delete attachment metadata", deleteResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not delete attachment right now." }, { status: 500 })
    );
  }

  const adminSupabase = createAdminSupabaseClient();
  const storageDelete = await adminSupabase.storage
    .from(ADMIN_NOTE_ATTACHMENT_BUCKET)
    .remove([attachmentRow.storage_path]);

  if (storageDelete.error) {
    const restoreResult = await supabase.from("admin_note_attachments").insert({
      ...attachmentRow,
    });

    if (restoreResult.error) {
      console.error("[AdminNotes] Could not restore attachment metadata after storage failure", {
        noteId,
        attachmentId,
        error: restoreResult.error,
      });
    }

    console.error("[AdminNotes] Could not remove attachment from storage", {
      noteId,
      attachmentId,
      error: storageDelete.error,
    });
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Could not delete attachment right now. Refresh and retry.",
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

    console.error("[AdminNotes] Could not hydrate note after attachment delete", refreshed.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not delete attachment right now." }, { status: 500 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      attachmentId,
      item: refreshed.item,
    })
  );
}
