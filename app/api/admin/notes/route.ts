import { NextResponse } from "next/server";
import { parseAdminNoteContextInput } from "@/lib/admin/note-context";
import { parseCreateAdminNotePayload } from "@/lib/admin/notes";
import { getAdminSchemaSetupMessage, isAdminNotesSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

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

export async function GET(request: Request) {
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const gate = await requireAdminRoleFromSupabase(supabase, {
    allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
    minimumRole: "viewer",
  });

  if (!gate.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: gate.error }, { status: gate.status })
    );
  }

  const { searchParams } = new URL(request.url);
  const hasContextFilter = searchParams.has("contextType") || searchParams.has("contextRef");

  const contextFilter = hasContextFilter
    ? parseAdminNoteContextInput({
        contextType: searchParams.get("contextType"),
        contextRef: searchParams.get("contextRef"),
      })
    : { ok: true as const, value: null };

  if (!contextFilter.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: contextFilter.error }, { status: 400 })
    );
  }

  if (hasContextFilter && !contextFilter.value) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Context type and reference are required for contextual note queries.",
        },
        { status: 400 }
      )
    );
  }

  let query = supabase
    .from("admin_notes")
    .select(selectedFields())
    .order("note_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (contextFilter.value) {
    query = query
      .eq("context_type", contextFilter.value.contextType)
      .eq("context_ref", contextFilter.value.contextRef)
      .limit(120);
  } else {
    query = query.limit(300);
  }

  const result = await query;

  if (result.error) {
    if (isAdminNotesSchemaMissing(result.error)) {
      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          items: [],
          schemaReady: false,
          warning: getAdminSchemaSetupMessage("notes"),
        })
      );
    }

    console.error("[AdminNotes] Could not load notes", result.error);
    return applySupabaseCookies(
      noStoreJson({
        ok: true,
        items: [],
        schemaReady: false,
        warning: getAdminSchemaSetupMessage("notes"),
      })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      items: result.data ?? [],
      schemaReady: true,
      warning: null,
    })
  );
}

export async function POST(request: Request) {
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

  const parsed = parseCreateAdminNotePayload((payload ?? {}) as Record<string, unknown>);
  if (!parsed.ok) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: parsed.error }, { status: 400 }));
  }

  const insertResult = await supabase
    .from("admin_notes")
    .insert({
      title: parsed.value.title,
      body: parsed.value.body,
      category: parsed.value.category,
      note_date: parsed.value.noteDate,
      is_done: parsed.value.isDone,
      context_type: parsed.value.contextType,
      context_ref: parsed.value.contextRef,
      created_by: gate.user.id,
      updated_by: gate.user.id,
    })
    .select(selectedFields())
    .single();

  if (insertResult.error || !insertResult.data) {
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

    console.error("[AdminNotes] Could not create note", insertResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not save note right now." }, { status: 500 })
    );
  }

  return applySupabaseCookies(
    noStoreJson(
      {
        ok: true,
        item: insertResult.data,
      },
      { status: 201 }
    )
  );
}
