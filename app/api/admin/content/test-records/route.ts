import { NextResponse } from "next/server";
import { getAdminSchemaSetupMessage, isAdminContentSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { isAdminContentQaTestRecord } from "@/lib/admin/content-test-records";
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

const MAX_BULK_QA_TEST_RECORD_DELETE = 100;

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

  const candidateResult = await supabase
    .from("admin_content_items")
    .select("id, slug")
    .ilike("slug", "e2e-admin-content-%");

  if (candidateResult.error) {
    if (isAdminContentSchemaMissing(candidateResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("content"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }
    console.error(
      "[AdminContent] Could not load QA/test cleanup candidates",
      candidateResult.error
    );
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load QA/test content records." }, { status: 500 })
    );
  }

  const candidates = (candidateResult.data ?? []).filter(isAdminContentQaTestRecord);
  if (candidates.length === 0) {
    return applySupabaseCookies(
      noStoreJson({
        ok: true,
        deletedCount: 0,
        deletedIds: [],
        deletedSlugs: [],
      })
    );
  }

  if (candidates.length > MAX_BULK_QA_TEST_RECORD_DELETE) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Refusing bulk cleanup because candidate count exceeds the safety limit.",
          candidateCount: candidates.length,
        },
        { status: 409 }
      )
    );
  }

  const candidateIds = candidates.map((item) => item.id);
  const deleteResult = await supabase
    .from("admin_content_items")
    .delete()
    .in("id", candidateIds)
    .select("id, slug");

  if (deleteResult.error) {
    if (isAdminContentSchemaMissing(deleteResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("content"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }
    console.error("[AdminContent] Could not delete QA/test content records", deleteResult.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not delete QA/test content records right now." },
        { status: 500 }
      )
    );
  }

  const deletedRows = deleteResult.data ?? [];
  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      deletedCount: deletedRows.length,
      deletedIds: deletedRows.map((item) => item.id),
      deletedSlugs: deletedRows.map((item) => item.slug),
    })
  );
}
