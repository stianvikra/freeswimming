import { NextResponse } from "next/server";
import type { AdminMessagesSummaryResponse } from "@/lib/admin/messages";
import { getAdminSchemaSetupMessage, isAdminMessagesSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";

function noStoreJson(
  body: AdminMessagesSummaryResponse,
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
    .from("admin_messages")
    .select("id", { count: "exact", head: true })
    .eq("status", "needs_reply");

  if (result.error) {
    if (isAdminMessagesSchemaMissing(result.error)) {
      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          role: gate.role,
          schemaReady: false,
          warning: getAdminSchemaSetupMessage("messages"),
          needsReplyCount: 0,
        })
      );
    }

    console.error("[AdminMessages] Could not load message summary", result.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not load message summary right now." },
        { status: 500 }
      )
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      role: gate.role,
      schemaReady: true,
      warning: null,
      needsReplyCount: Math.max(0, result.count ?? 0),
    })
  );
}
