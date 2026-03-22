import { NextResponse } from "next/server";
import { loadHydratedAdminNoteById } from "@/lib/admin/notes-server";
import { canonicalizeAdminNoteLinkPair, isUuid } from "@/lib/admin/notes";
import { getAdminSchemaSetupMessage, isAdminNotesSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type RouteContext = {
  params: Promise<{ id: string; relatedNoteId: string }>;
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

async function resolveParams(
  context: RouteContext
): Promise<{ noteId: string; relatedNoteId: string }> {
  const params = await context.params;
  return {
    noteId: params.id,
    relatedNoteId: params.relatedNoteId,
  };
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { noteId, relatedNoteId } = await resolveParams(context);
  if (!isUuid(noteId) || !isUuid(relatedNoteId)) {
    return noStoreJson({ ok: false, error: "Invalid related note id." }, { status: 400 });
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

  const canonical = canonicalizeAdminNoteLinkPair(noteId, relatedNoteId);
  if (!canonical.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: canonical.error }, { status: 400 })
    );
  }

  const deleteResult = await supabase
    .from("admin_note_links")
    .delete()
    .eq("note_id", canonical.value.noteId)
    .eq("related_note_id", canonical.value.relatedNoteId)
    .select("note_id, related_note_id")
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

    console.error("[AdminNotes] Could not remove related note link", deleteResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not unlink notes right now." }, { status: 500 })
    );
  }

  if (!deleteResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Related note link not found." }, { status: 404 })
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

    console.error("[AdminNotes] Could not hydrate note after unlink", refreshed.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not unlink notes right now." }, { status: 500 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      relatedNoteId,
      item: refreshed.item,
    })
  );
}
