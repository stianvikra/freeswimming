import { NextResponse } from "next/server";
import { loadHydratedAdminNoteById, selectAdminNoteFields } from "@/lib/admin/notes-server";
import { canonicalizeAdminNoteLinkPair, isUuid } from "@/lib/admin/notes";
import { getAdminSchemaSetupMessage, isAdminNotesSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
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

async function resolveNoteId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.id;
}

function selectLinkFields() {
  return `
    note_id,
    related_note_id,
    created_at,
    created_by
  `;
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

  const relatedNoteId =
    payload && typeof payload === "object" && "relatedNoteId" in payload
      ? (payload as { relatedNoteId?: unknown }).relatedNoteId
      : null;

  const canonical = canonicalizeAdminNoteLinkPair(
    noteId,
    typeof relatedNoteId === "string" ? relatedNoteId : ""
  );
  if (!canonical.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: canonical.error }, { status: 400 })
    );
  }

  const notesResult = await supabase
    .from("admin_notes")
    .select(selectAdminNoteFields())
    .in("id", [canonical.value.noteId, canonical.value.relatedNoteId]);

  if (notesResult.error) {
    if (isAdminNotesSchemaMissing(notesResult.error)) {
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

    console.error("[AdminNotes] Could not validate related note ids", notesResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not link notes right now." }, { status: 500 })
    );
  }

  if ((notesResult.data ?? []).length !== 2) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Related note not found." }, { status: 404 })
    );
  }

  const insertResult = await supabase
    .from("admin_note_links")
    .insert({
      note_id: canonical.value.noteId,
      related_note_id: canonical.value.relatedNoteId,
      created_by: gate.user.id,
    })
    .select(selectLinkFields())
    .maybeSingle();

  if (insertResult.error && insertResult.error.code !== "23505") {
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

    console.error("[AdminNotes] Could not insert related note link", insertResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not link notes right now." }, { status: 500 })
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

    console.error("[AdminNotes] Could not hydrate note after linking", refreshed.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not link notes right now." }, { status: 500 })
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
