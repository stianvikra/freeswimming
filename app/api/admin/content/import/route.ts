import { NextResponse } from "next/server";
import { applyPlatformContentSeed } from "@/lib/admin/content-import-apply";
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

export async function POST() {
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const gate = await requireAdminRoleFromSupabase(supabase, {
    allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
    minimumRole: "admin",
  });

  if (!gate.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: gate.error }, { status: gate.status })
    );
  }

  const result = await applyPlatformContentSeed({
    supabase,
    actorUserId: gate.user.id,
    syncProducts: true,
  });

  if (!result.ok) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: result.error,
          code: result.code === "ADMIN_SCHEMA_NOT_READY" ? result.code : undefined,
        },
        { status: result.code === "ADMIN_SCHEMA_NOT_READY" ? 503 : 500 }
      )
    );
  }

  return applySupabaseCookies(noStoreJson({ ok: true, ...result.result }));
}
