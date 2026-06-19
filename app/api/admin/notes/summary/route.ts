import { NextResponse } from "next/server";
import type { AdminNotesSummaryResponse } from "@/lib/admin/notes";
import { getAdminSchemaSetupMessage, isAdminNotesSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";

function noStoreJson(
  body: AdminNotesSummaryResponse,
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

export async function GET() {
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

  const result = await supabase
    .from("admin_notes")
    .select("id", { count: "exact", head: true })
    .eq("is_done", false);

  if (result.error) {
    if (isAdminNotesSchemaMissing(result.error)) {
      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          role: gate.role,
          schemaReady: false,
          warning: getAdminSchemaSetupMessage("notes"),
          openCount: 0,
        })
      );
    }

    console.error("[AdminNotes] Could not load notes summary", result.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load notes summary right now." }, { status: 500 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      role: gate.role,
      schemaReady: true,
      warning: null,
      openCount: Math.max(0, result.count ?? 0),
    })
  );
}
