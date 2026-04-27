import { NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";
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
const MAX_BULK_QA_TEST_REVISION_DELETE = 2_000;
const QA_TEST_DELETE_BATCH_SIZE = 100;
const QA_TEST_TEMPLATE_KEY_FILTER =
  "template_key.ilike.e2e_admin_email_template_%,template_key.ilike.aw012_publish_fallback_%";

type RouteHandlerSupabaseClient = Awaited<
  ReturnType<typeof createRouteHandlerSupabaseClient>
>["supabase"];

type CleanupTemplateRow = {
  id: string;
  template_key: string;
  locale: string;
};

type CleanupRevisionRow = CleanupTemplateRow & {
  template_id: string | null;
};

function chunkIds(ids: string[], size: number) {
  const chunks: string[][] = [];

  for (let index = 0; index < ids.length; index += size) {
    chunks.push(ids.slice(index, index + size));
  }

  return chunks;
}

async function deleteRowsInBatches<T extends CleanupTemplateRow>({
  supabase,
  table,
  column,
  ids,
  select,
}: {
  supabase: RouteHandlerSupabaseClient;
  table: "admin_email_templates" | "admin_email_template_revisions";
  column: "id" | "template_id";
  ids: string[];
  select: string;
}): Promise<{ data: T[]; error: PostgrestError | null }> {
  const deletedRows: T[] = [];

  for (const idBatch of chunkIds(ids, QA_TEST_DELETE_BATCH_SIZE)) {
    const result = await supabase.from(table).delete().in(column, idBatch).select(select);

    if (result.error) {
      return { data: deletedRows, error: result.error };
    }

    deletedRows.push(...((result.data ?? []) as unknown as T[]));
  }

  return { data: deletedRows, error: null };
}

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
    .or(QA_TEST_TEMPLATE_KEY_FILTER)
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
  const revisionCandidateResult = await supabase
    .from("admin_email_template_revisions")
    .select("id, template_id, template_key, locale", { count: "exact" })
    .or(QA_TEST_TEMPLATE_KEY_FILTER)
    .order("created_at", { ascending: false });

  if (revisionCandidateResult.error) {
    if (isAdminEmailTemplatesSchemaMissing(revisionCandidateResult.error)) {
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
      "[AdminEmailTemplates] Could not load QA/test cleanup revision candidates",
      revisionCandidateResult.error
    );
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not load QA/test email template revision records." },
        { status: 500 }
      )
    );
  }

  const revisionCandidates = (revisionCandidateResult.data ?? []).filter((item) =>
    isAdminEmailTemplateQaTestRecord(item)
  );

  if (candidates.length === 0 && revisionCandidates.length === 0) {
    return applySupabaseCookies(
      noStoreJson({
        ok: true,
        deletedCount: 0,
        deletedIds: [],
        deletedTemplateKeys: [],
        deletedRevisionCount: 0,
        deletedRevisionIds: [],
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

  if (revisionCandidates.length > MAX_BULK_QA_TEST_REVISION_DELETE) {
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Refusing revision cleanup because candidate count exceeds the safety limit.",
          candidateCount: revisionCandidates.length,
        },
        { status: 409 }
      )
    );
  }

  const candidateIds = candidates.map((item) => item.id);
  const revisionCandidateIds = revisionCandidates.map((item) => item.id);
  const deleteRevisionResult = revisionCandidateIds.length
    ? await deleteRowsInBatches<CleanupRevisionRow>({
        supabase,
        table: "admin_email_template_revisions",
        column: "id",
        ids: revisionCandidateIds,
        select: "id, template_id, template_key, locale",
      })
    : { data: [], error: null };

  if (deleteRevisionResult.error) {
    if (isAdminEmailTemplatesSchemaMissing(deleteRevisionResult.error)) {
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
      "[AdminEmailTemplates] Could not delete pre-existing QA/test revision records",
      deleteRevisionResult.error
    );
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not delete QA/test email template revisions right now." },
        { status: 500 }
      )
    );
  }

  const deleteResult = candidateIds.length
    ? await deleteRowsInBatches<CleanupTemplateRow>({
        supabase,
        table: "admin_email_templates",
        column: "id",
        ids: candidateIds,
        select: "id, template_key, locale",
      })
    : { data: [], error: null };

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
  const deletedTemplateIds = deletedRows.map((item) => item.id);
  const deletePostTemplateRevisionResult = deletedTemplateIds.length
    ? await deleteRowsInBatches<CleanupRevisionRow>({
        supabase,
        table: "admin_email_template_revisions",
        column: "template_id",
        ids: deletedTemplateIds,
        select: "id, template_id, template_key, locale",
      })
    : { data: [], error: null };

  if (deletePostTemplateRevisionResult.error) {
    if (isAdminEmailTemplatesSchemaMissing(deletePostTemplateRevisionResult.error)) {
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
      "[AdminEmailTemplates] Could not delete post-delete QA/test revision records",
      deletePostTemplateRevisionResult.error
    );
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not finalize QA/test email template revision cleanup." },
        { status: 500 }
      )
    );
  }

  const deletedRevisionRows = [
    ...(deleteRevisionResult.data ?? []),
    ...(deletePostTemplateRevisionResult.data ?? []),
  ].filter(
    (item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index
  );

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      deletedCount: deletedRows.length,
      deletedIds: deletedRows.map((item) => item.id),
      deletedTemplateKeys: deletedRows.map((item) => item.template_key),
      deletedRevisionCount: deletedRevisionRows.length,
      deletedRevisionIds: deletedRevisionRows.map((item) => item.id),
    })
  );
}
