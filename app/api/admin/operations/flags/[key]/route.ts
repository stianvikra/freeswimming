import { NextResponse } from "next/server";
import {
  isAdminRuntimeFlagKey,
  parseUpdateAdminRuntimeFlagPayload,
} from "@/lib/admin/runtime-flags";
import { getAdminSchemaSetupMessage, isAdminRuntimeFlagsSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type RouteContext = {
  params: Promise<{ key: string }>;
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

export async function PATCH(request: Request, context: RouteContext) {
  const params = await context.params;
  const key = params.key;
  if (!isAdminRuntimeFlagKey(key)) {
    return noStoreJson({ ok: false, error: "Unknown runtime flag." }, { status: 404 });
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

  const parsed = parseUpdateAdminRuntimeFlagPayload((payload ?? {}) as Record<string, unknown>);
  if (!parsed.ok) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: parsed.error }, { status: 400 }));
  }

  const updateResult = await supabase
    .from("admin_runtime_flags")
    .update({
      enabled: parsed.value.enabled,
      updated_by: gate.user.id,
    })
    .eq("key", key)
    .select("key, enabled, description, is_public, updated_at, updated_by")
    .maybeSingle();

  if (updateResult.error) {
    if (isAdminRuntimeFlagsSchemaMissing(updateResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("operations"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error("[AdminOperations] Could not update runtime flag", updateResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not update runtime flag right now." }, { status: 500 })
    );
  }

  if (!updateResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Runtime flag not found." }, { status: 404 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      item: updateResult.data,
    })
  );
}
