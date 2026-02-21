import { NextResponse } from "next/server";
import {
  deriveCourseModuleRefFromLessonRef,
  parseAdminNoteContextInput,
} from "@/lib/admin/note-context";
import { parseCreateAdminNotePayload, type AdminNoteRow } from "@/lib/admin/notes";
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

function sortAdminNotesByNewest(
  a: { note_date: string; created_at: string },
  b: {
    note_date: string;
    created_at: string;
  }
): number {
  if (a.note_date !== b.note_date) {
    return b.note_date.localeCompare(a.note_date);
  }
  return b.created_at.localeCompare(a.created_at);
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
  const includeModuleContext = searchParams.get("includeModuleContext") === "1";

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

  if (
    contextFilter.value &&
    includeModuleContext &&
    contextFilter.value.contextType === "course_lesson"
  ) {
    const lessonRef = contextFilter.value.contextRef;
    const moduleRef = deriveCourseModuleRefFromLessonRef(lessonRef);

    const lessonResult = await supabase
      .from("admin_notes")
      .select(selectedFields())
      .eq("context_type", "course_lesson")
      .eq("context_ref", lessonRef)
      .order("note_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(120);

    if (lessonResult.error) {
      const resultError = lessonResult.error;
      if (isAdminNotesSchemaMissing(resultError)) {
        return applySupabaseCookies(
          noStoreJson({
            ok: true,
            items: [],
            schemaReady: false,
            warning: getAdminSchemaSetupMessage("notes"),
          })
        );
      }

      console.error("[AdminNotes] Could not load notes", resultError);
      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          items: [],
          schemaReady: false,
          warning: getAdminSchemaSetupMessage("notes"),
        })
      );
    }

    const lessonRows = (lessonResult.data ?? []) as unknown as AdminNoteRow[];
    let moduleRows: AdminNoteRow[] = [];
    if (moduleRef) {
      const moduleResult = await supabase
        .from("admin_notes")
        .select(selectedFields())
        .eq("context_type", "course_module")
        .eq("context_ref", moduleRef)
        .order("note_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(120);

      if (moduleResult.error) {
        const resultError = moduleResult.error;
        if (isAdminNotesSchemaMissing(resultError)) {
          return applySupabaseCookies(
            noStoreJson({
              ok: true,
              items: [],
              schemaReady: false,
              warning: getAdminSchemaSetupMessage("notes"),
            })
          );
        }

        console.error("[AdminNotes] Could not load notes", resultError);
        return applySupabaseCookies(
          noStoreJson({
            ok: true,
            items: [],
            schemaReady: false,
            warning: getAdminSchemaSetupMessage("notes"),
          })
        );
      }

      moduleRows = (moduleResult.data ?? []) as unknown as AdminNoteRow[];
    }

    const merged: AdminNoteRow[] = [...lessonRows, ...moduleRows];
    const deduped = Array.from(new Map(merged.map((item) => [item.id, item])).values()).sort(
      sortAdminNotesByNewest
    );

    return applySupabaseCookies(
      noStoreJson({
        ok: true,
        items: deduped,
        schemaReady: true,
        warning: null,
      })
    );
  }

  let query = supabase.from("admin_notes").select(selectedFields());

  if (contextFilter.value) {
    query = query
      .eq("context_type", contextFilter.value.contextType)
      .eq("context_ref", contextFilter.value.contextRef)
      .order("note_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(120);
  } else {
    query = query
      .order("note_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(300);
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
