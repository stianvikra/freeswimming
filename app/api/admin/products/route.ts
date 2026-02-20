import { NextResponse } from "next/server";
import { getAdminSchemaSetupMessage, isAdminCommerceSchemaMissing } from "@/lib/admin/schema";
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
    .from("products")
    .select("id, slug, title, kind, stripe_price_id, active, created_at, updated_at")
    .order("created_at", { ascending: true });

  if (result.error) {
    if (isAdminCommerceSchemaMissing(result.error)) {
      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          items: [],
          schemaReady: false,
          warning: getAdminSchemaSetupMessage("commerce"),
        })
      );
    }

    console.error("[AdminProducts] Could not load products", result.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load products right now." }, { status: 500 })
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
