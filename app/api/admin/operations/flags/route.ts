import { NextResponse } from "next/server";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import { getSiteLockConfig } from "@/lib/site-lock/config";

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

function getSafeSiteLockSnapshot() {
  try {
    const config = getSiteLockConfig();
    return {
      configured: true,
      enabled: config.enabled,
      mode: config.mode,
      cookieName: config.cookieName,
      sessionMaxAgeSeconds: config.sessionMaxAgeSeconds,
    };
  } catch {
    return {
      configured: false,
      enabled: false,
      mode: "password",
      cookieName: "fs_preview_access",
      sessionMaxAgeSeconds: 0,
    };
  }
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
    .from("admin_runtime_flags")
    .select("key, enabled, description, is_public, updated_at, updated_by")
    .order("key", { ascending: true });

  if (result.error) {
    console.error("[AdminOperations] Could not load runtime flags", result.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load operations flags right now." }, { status: 500 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      siteLock: getSafeSiteLockSnapshot(),
      flags: result.data ?? [],
    })
  );
}
