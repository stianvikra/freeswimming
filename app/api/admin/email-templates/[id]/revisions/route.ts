import { NextResponse } from "next/server";
import { isUuid } from "@/lib/admin/content";
import { getAdminSchemaSetupMessage, isAdminEmailTemplatesSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type RevisionListItem = {
  id: string;
  revisionNumber: number;
  action: string;
  changedByEmail: string | null;
  createdAt: string;
  snapshotStatus: string;
  snapshotVersion: number | null;
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

function parseSnapshotMeta(snapshot: unknown): {
  status: string;
  version: number | null;
} {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return { status: "unknown", version: null };
  }
  const record = snapshot as Record<string, unknown>;
  const status =
    typeof record.status === "string" && record.status.trim().length > 0
      ? record.status.trim()
      : "unknown";
  const versionRaw = record.version;
  const version =
    typeof versionRaw === "number" && Number.isFinite(versionRaw) ? Math.trunc(versionRaw) : null;
  return { status, version };
}

async function resolveTemplateId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.id;
}

export async function GET(_request: Request, context: RouteContext) {
  const templateId = await resolveTemplateId(context);
  if (!isUuid(templateId)) {
    return noStoreJson({ ok: false, error: "Invalid template id." }, { status: 400 });
  }

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

  const listResult = await supabase
    .from("admin_email_template_revisions")
    .select("id, revision_number, action, changed_by_email, created_at, snapshot")
    .eq("template_id", templateId)
    .order("revision_number", { ascending: false })
    .limit(25);

  if (listResult.error) {
    if (isAdminEmailTemplatesSchemaMissing(listResult.error)) {
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

    console.error("[AdminEmailTemplates] Could not load template revisions", listResult.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not load template revisions right now." },
        { status: 500 }
      )
    );
  }

  const items: RevisionListItem[] = (listResult.data ?? []).map((entry) => {
    const snapshotMeta = parseSnapshotMeta(entry.snapshot);
    return {
      id: entry.id,
      revisionNumber: entry.revision_number,
      action: entry.action,
      changedByEmail: entry.changed_by_email,
      createdAt: entry.created_at,
      snapshotStatus: snapshotMeta.status,
      snapshotVersion: snapshotMeta.version,
    };
  });

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      items,
    })
  );
}
