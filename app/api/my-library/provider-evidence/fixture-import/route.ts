import { NextResponse } from "next/server";
import {
  importManualFixtureProviderEvidence,
  isProviderEvidenceFixtureImportEnabled,
  parseManualFixtureProviderEvidenceImportPayload,
} from "@/lib/my-library/provider-evidence";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  if (!isProviderEvidenceFixtureImportEnabled()) {
    return jsonNoStore(
      {
        ok: false,
        code: "fixture_import_disabled",
        error: "Provider evidence fixture import is disabled.",
      },
      403
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  const mediaType = contentType.split(";")[0]?.trim().toLowerCase();
  if (mediaType !== "application/json") {
    return jsonNoStore(
      {
        ok: false,
        code: "unsupported_content_type",
        error: "Unsupported content type.",
      },
      415
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonNoStore(
      {
        ok: false,
        code: "invalid_json",
        error: "Invalid JSON.",
      },
      400
    );
  }

  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applySupabaseCookies(
      jsonNoStore(
        {
          ok: false,
          code: "unauthorized",
          error: "Unauthorized.",
        },
        401
      )
    );
  }

  const preflight = parseManualFixtureProviderEvidenceImportPayload(body);
  if (!preflight.ok) {
    return applySupabaseCookies(
      jsonNoStore(
        {
          ok: false,
          code: preflight.code,
          error: preflight.error,
        },
        preflight.status
      )
    );
  }

  const adminSupabase = createAdminSupabaseClient();
  const result = await importManualFixtureProviderEvidence({
    supabase: adminSupabase,
    userId: user.id,
    payload: body,
  });

  if (!result.ok) {
    return applySupabaseCookies(
      jsonNoStore(
        {
          ok: false,
          code: result.code,
          error: result.error,
        },
        result.status
      )
    );
  }

  return applySupabaseCookies(
    jsonNoStore({
      ok: true,
      status: result.status,
      providerKey: result.providerKey,
      providerConnectionId: result.providerConnectionId,
      importRunId: result.importRunId,
      evidenceIds: result.evidenceIds,
      counts: result.counts,
      warnings: result.warnings,
    })
  );
}
