import { NextResponse } from "next/server";
import {
  parseAdminContentRevisionSnapshot,
  parseRestoreAdminContentRevisionPayload,
} from "@/lib/admin/content-revisions";
import { isUuid } from "@/lib/admin/content";
import { getAdminSchemaSetupMessage, isAdminContentSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import type { Database } from "@/types/database";

type RouteContext = {
  params: Promise<{ id: string }>;
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

function selectedItemFields() {
  return `
    id,
    content_type,
    parent_id,
    slug,
    title,
    summary,
    category,
    body,
    sort_order,
    status,
    published_at,
    created_by,
    updated_by,
    created_at,
    updated_at
  `;
}

type RevisionListItem = {
  id: string;
  revisionNumber: number;
  action: string;
  changedByEmail: string | null;
  createdAt: string;
  snapshotTitle: string;
  snapshotStatus: string;
};

function parseSnapshotMeta(snapshot: unknown): { title: string; status: string } {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return { title: "Unknown title", status: "unknown" };
  }
  const record = snapshot as Record<string, unknown>;
  const title =
    typeof record.title === "string" && record.title.trim().length > 0
      ? record.title.trim()
      : "Untitled";
  const status =
    typeof record.status === "string" && record.status.trim().length > 0
      ? record.status.trim()
      : "unknown";
  return { title, status };
}

async function resolveItemId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.id;
}

export async function GET(_request: Request, context: RouteContext) {
  const itemId = await resolveItemId(context);
  if (!isUuid(itemId)) {
    return noStoreJson({ ok: false, error: "Invalid content item id." }, { status: 400 });
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
    .from("admin_content_revisions")
    .select("id, revision_number, action, changed_by_email, created_at, snapshot")
    .eq("content_item_id", itemId)
    .order("revision_number", { ascending: false })
    .limit(25);

  if (listResult.error) {
    if (isAdminContentSchemaMissing(listResult.error)) {
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
    console.error("[AdminContent] Could not load content revisions", listResult.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not load content revisions right now." },
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
      snapshotTitle: snapshotMeta.title,
      snapshotStatus: snapshotMeta.status,
    };
  });

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      canRestore: gate.role === "admin",
      items,
    })
  );
}

export async function POST(request: Request, context: RouteContext) {
  const itemId = await resolveItemId(context);
  if (!isUuid(itemId)) {
    return noStoreJson({ ok: false, error: "Invalid content item id." }, { status: 400 });
  }

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

  const parsedPayload = parseRestoreAdminContentRevisionPayload(
    (payload ?? {}) as Record<string, unknown>
  );
  if (!parsedPayload.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: parsedPayload.error }, { status: 400 })
    );
  }

  const revisionResult = await supabase
    .from("admin_content_revisions")
    .select("id, content_item_id, snapshot")
    .eq("id", parsedPayload.value.revisionId)
    .eq("content_item_id", itemId)
    .maybeSingle();

  if (revisionResult.error) {
    if (isAdminContentSchemaMissing(revisionResult.error)) {
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
    console.error("[AdminContent] Could not load revision for restore", revisionResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load revision right now." }, { status: 500 })
    );
  }

  if (!revisionResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Revision not found." }, { status: 404 })
    );
  }

  const parsedSnapshot = parseAdminContentRevisionSnapshot(revisionResult.data.snapshot);
  if (!parsedSnapshot.ok) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: parsedSnapshot.error }, { status: 400 })
    );
  }

  const updatePayload: Database["public"]["Tables"]["admin_content_items"]["Update"] = {
    ...parsedSnapshot.value,
    updated_by: gate.user.id,
  };

  const restoreResult = await supabase
    .from("admin_content_items")
    .update(updatePayload)
    .eq("id", itemId)
    .select(selectedItemFields())
    .maybeSingle();

  if (restoreResult.error) {
    if (isAdminContentSchemaMissing(restoreResult.error)) {
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
    if (restoreResult.error.code === "23505") {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error:
              "Could not restore this revision because slug conflicts with another content item.",
          },
          { status: 409 }
        )
      );
    }
    console.error("[AdminContent] Could not restore revision", restoreResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not restore revision right now." }, { status: 500 })
    );
  }

  if (!restoreResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Content item not found for restore." }, { status: 404 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      item: restoreResult.data,
      restoredRevisionId: parsedPayload.value.revisionId,
    })
  );
}
