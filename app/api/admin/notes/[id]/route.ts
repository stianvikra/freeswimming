import { NextResponse } from "next/server";
import { hydrateAdminNoteRows, selectAdminNoteFields } from "@/lib/admin/notes-server";
import {
  ADMIN_NOTE_ATTACHMENT_BUCKET,
  isUuid,
  parseUpdateAdminNotePayload,
  type AdminNoteAttachmentRow,
  type AdminNoteRow,
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

function selectAttachmentMutationFields() {
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

export async function PATCH(request: Request, context: RouteContext) {
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
  if (!contentType.includes("application/json")) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Unsupported content type." }, { status: 415 })
    );
  }

  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Invalid JSON." }, { status: 400 })
    );
  }

  const parsed = parseUpdateAdminNotePayload((payload ?? {}) as Record<string, unknown>);
  if (!parsed.ok) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: parsed.error }, { status: 400 }));
  }

  const updateResult = await supabase
    .from("admin_notes")
    .update({
      ...(parsed.value.title !== undefined ? { title: parsed.value.title } : {}),
      ...(parsed.value.body !== undefined ? { body: parsed.value.body } : {}),
      ...(parsed.value.category !== undefined ? { category: parsed.value.category } : {}),
      ...(parsed.value.noteDate !== undefined ? { note_date: parsed.value.noteDate } : {}),
      ...(parsed.value.priority !== undefined ? { priority: parsed.value.priority } : {}),
      ...(parsed.value.isDone !== undefined ? { is_done: parsed.value.isDone } : {}),
      ...(parsed.value.contextType !== undefined ? { context_type: parsed.value.contextType } : {}),
      ...(parsed.value.contextRef !== undefined ? { context_ref: parsed.value.contextRef } : {}),
      updated_by: gate.user.id,
    })
    .eq("id", noteId)
    .select(selectAdminNoteFields())
    .maybeSingle();

  if (updateResult.error) {
    if (isAdminNotesSchemaMissing(updateResult.error)) {
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

    console.error("[AdminNotes] Could not update note", updateResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not update note right now." }, { status: 500 })
    );
  }

  if (!updateResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Note not found." }, { status: 404 })
    );
  }

  const hydrated = await hydrateAdminNoteRows({
    supabase,
    rows: [updateResult.data as unknown as AdminNoteRow],
  });

  if (!hydrated.ok) {
    if (isAdminNotesSchemaMissing(hydrated.error)) {
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

    console.error("[AdminNotes] Could not hydrate updated note", hydrated.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not update note right now." }, { status: 500 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      item: hydrated.items[0],
    })
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
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

  const attachmentsResult = await supabase
    .from("admin_note_attachments")
    .select(selectAttachmentMutationFields())
    .eq("note_id", noteId)
    .order("created_at", { ascending: true });

  if (attachmentsResult.error) {
    if (isAdminNotesSchemaMissing(attachmentsResult.error)) {
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

    console.error("[AdminNotes] Could not load note attachments", attachmentsResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not delete note right now." }, { status: 500 })
    );
  }

  const attachmentRows = (attachmentsResult.data ?? []) as unknown as AdminNoteAttachmentRow[];

  if (attachmentRows.length > 0) {
    const deleteAttachmentsResult = await supabase
      .from("admin_note_attachments")
      .delete()
      .eq("note_id", noteId)
      .select(selectAttachmentMutationFields());

    if (deleteAttachmentsResult.error) {
      if (isAdminNotesSchemaMissing(deleteAttachmentsResult.error)) {
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

      console.error(
        "[AdminNotes] Could not delete note attachments",
        deleteAttachmentsResult.error
      );
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Could not delete note right now." }, { status: 500 })
      );
    }

    const adminSupabase = createAdminSupabaseClient();
    const storageDelete = await adminSupabase.storage
      .from(ADMIN_NOTE_ATTACHMENT_BUCKET)
      .remove(attachmentRows.map((row) => row.storage_path));

    if (storageDelete.error) {
      const restoreResult = await supabase
        .from("admin_note_attachments")
        .insert(attachmentRows.map((row) => ({ ...row })));

      if (restoreResult.error) {
        console.error("[AdminNotes] Could not restore attachment metadata after storage failure", {
          noteId,
          attachmentIds: attachmentRows.map((row) => row.id),
          error: restoreResult.error,
        });
      }

      console.error("[AdminNotes] Could not remove note attachments from storage", {
        noteId,
        attachmentIds: attachmentRows.map((row) => row.id),
        error: storageDelete.error,
      });
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error:
              "Could not delete note attachments right now. Refresh and retry so storage cleanup stays complete.",
          },
          { status: 500 }
        )
      );
    }
  }

  const deleteResult = await supabase
    .from("admin_notes")
    .delete()
    .eq("id", noteId)
    .select("id")
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

    console.error("[AdminNotes] Could not delete note", deleteResult.error);
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error:
            attachmentRows.length > 0
              ? "Attachments were removed, but the note could not be deleted. Refresh and retry delete."
              : "Could not delete note right now.",
        },
        { status: 500 }
      )
    );
  }

  if (!deleteResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Note not found." }, { status: 404 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      id: deleteResult.data.id,
    })
  );
}
