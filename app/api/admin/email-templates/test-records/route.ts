import { NextResponse } from "next/server";
import { getAdminSchemaSetupMessage, isAdminEmailTemplatesSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { isAdminEmailTemplateQaTestRecord } from "@/lib/admin/email-template-test-records";
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

const MAX_BULK_QA_TEST_TEMPLATE_DELETE = 500;

export async function POST() {
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

  const candidateResult = await supabase
    .from("admin_email_templates")
    .select("id, template_key, locale", { count: "exact" })
    .or("template_key.ilike.e2e_admin_email_template_%,template_key.ilike.aw012_publish_fallback_%")
    .order("created_at", { ascending: false });

  if (candidateResult.error) {
    if (isAdminEmailTemplatesSchemaMissing(candidateResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("emailTemplates"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error(
      "[AdminEmailTemplates] Could not load QA/test cleanup candidates",
      candidateResult.error
    );
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not load QA/test email template records." },
        { status: 500 }
      )
    );
  }

  const candidates = (candidateResult.data ?? []).filter(isAdminEmailTemplateQaTestRecord);

  if (candidates.length === 0) {
    return applySupabaseCookies(
      noStoreJson({
        ok: true,
        deletedCount: 0,
        deletedIds: [],
        deletedTemplateKeys: [],
      })
    );
  }

  if (candidates.length > MAX_BULK_QA_TEST_TEMPLATE_DELETE) {
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
    .from("admin_email_templates")
    .delete()
    .in("id", candidateIds)
    .select("id, template_key, locale");

  if (deleteResult.error) {
    if (isAdminEmailTemplatesSchemaMissing(deleteResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("emailTemplates"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error(
      "[AdminEmailTemplates] Could not delete QA/test email template records",
      deleteResult.error
    );
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not delete QA/test email template records right now." },
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
      deletedTemplateKeys: deletedRows.map((item) => item.template_key),
    })
  );
}
