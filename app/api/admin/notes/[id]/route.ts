import { NextResponse } from "next/server";
import { parseUpdateAdminNotePayload } from "@/lib/admin/notes";
import { getAdminSchemaSetupMessage, isAdminNotesSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function selectedFields() {
  return `
    id,
    title,
    body,
    category,
    note_date,
    is_done,
    context_type,
    context_ref,
    created_by,
    updated_by,
    created_at,
    updated_at
  `;
}

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
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
      ...(parsed.value.isDone !== undefined ? { is_done: parsed.value.isDone } : {}),
      ...(parsed.value.contextType !== undefined ? { context_type: parsed.value.contextType } : {}),
      ...(parsed.value.contextRef !== undefined ? { context_ref: parsed.value.contextRef } : {}),
      updated_by: gate.user.id,
    })
    .eq("id", noteId)
    .select(selectedFields())
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

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      item: updateResult.data,
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
      noStoreJson({ ok: false, error: "Could not delete note right now." }, { status: 500 })
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
