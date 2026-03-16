import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ensurePlatformContentSeeded } from "@/lib/admin/content-import-apply";
import { buildAdminContentMirrorSnapshot } from "@/lib/admin/content-mirror";
import { parseCreateAdminContentPayload } from "@/lib/admin/content";
import { resolveNextCourseStructureSortOrder } from "@/lib/admin/course-structure-sync";
import {
  applyGuideRuntimeIdDefaults,
  canonicalizeGuideDrillRuntimeId,
  canonicalizeGuideSessionRuntimeId,
  resolveNextGuideRuntimeId,
  type GuideRuntimeContentType,
} from "@/lib/guides/runtime-identity";
import { getAdminSchemaSetupMessage, isAdminContentSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import type { Database } from "@/types/database";

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

type GuideIdentityRow = Pick<
  Database["public"]["Tables"]["admin_content_items"]["Row"],
  "slug" | "body" | "sort_order"
>;

async function loadGuideIdentityRows(params: {
  supabase: SupabaseClient<Database>;
  contentType: GuideRuntimeContentType;
}) {
  return params.supabase
    .from("admin_content_items")
    .select("slug, body, sort_order")
    .eq("content_type", params.contentType);
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

  let schemaReady = true;
  let warning: string | null = null;
  let items: Database["public"]["Tables"]["admin_content_items"]["Row"][] = [];

  const ensureSeedResult = await ensurePlatformContentSeeded({
    supabase,
    actorUserId: gate.role === "admin" ? gate.user.id : null,
  });

  if (!ensureSeedResult.ok) {
    if (!ensureSeedResult.schemaReady) {
      schemaReady = false;
      warning = ensureSeedResult.error;
    } else {
      console.error("[AdminContent] Could not auto-seed baseline content", {
        error: ensureSeedResult.error,
      });
    }
  }

  if (schemaReady) {
    const result = await supabase
      .from("admin_content_items")
      .select(
        `
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
      `
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(250);

    if (result.error) {
      if (isAdminContentSchemaMissing(result.error)) {
        schemaReady = false;
        warning = getAdminSchemaSetupMessage("content");
      } else {
        console.error("[AdminContent] Could not load content items", result.error);
        schemaReady = false;
        warning = getAdminSchemaSetupMessage("content");
      }
      items = [];
    } else {
      items = result.data ?? [];
    }
  }

  let mirror: ReturnType<typeof buildAdminContentMirrorSnapshot> | null = null;
  if (schemaReady) {
    const productsResult = await supabase.from("products").select("id, active").eq("active", true);
    let productRows: Array<Pick<Database["public"]["Tables"]["products"]["Row"], "id" | "active">> =
      [];
    if (productsResult.error) {
      console.error("[AdminContent] Could not load products mirror snapshot", productsResult.error);
    } else {
      productRows = productsResult.data ?? [];
    }

    mirror = buildAdminContentMirrorSnapshot(items, productRows);
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      role: gate.role,
      items,
      schemaReady,
      warning,
      mirror,
    })
  );
}

export async function POST(request: Request) {
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

  const parsed = parseCreateAdminContentPayload((payload ?? {}) as Record<string, unknown>);
  if (!parsed.ok) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: parsed.error }, { status: 400 }));
  }

  const hasExplicitSortOrder = Object.prototype.hasOwnProperty.call(
    (payload ?? {}) as Record<string, unknown>,
    "sortOrder"
  );

  if (parsed.value.parentId) {
    const parentResult = await supabase
      .from("admin_content_items")
      .select("id")
      .eq("id", parsed.value.parentId)
      .maybeSingle();

    if (parentResult.error) {
      if (isAdminContentSchemaMissing(parentResult.error)) {
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
      console.error("[AdminContent] Could not validate parent item", parentResult.error);
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Could not validate parent content." }, { status: 500 })
      );
    }

    if (!parentResult.data) {
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Parent content item not found." }, { status: 400 })
      );
    }
  }

  let createSortOrder = parsed.value.sortOrder;
  if (
    !hasExplicitSortOrder &&
    (parsed.value.contentType === "course_module" || parsed.value.contentType === "course_lesson")
  ) {
    const nextSortOrder = await resolveNextCourseStructureSortOrder({
      supabase,
      contentType: parsed.value.contentType,
      parentId: parsed.value.parentId,
    });

    if (!nextSortOrder.ok) {
      if (isAdminContentSchemaMissing(nextSortOrder.error)) {
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

      console.error("[AdminContent] Could not resolve next course sort order", nextSortOrder.error);
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Could not resolve content order right now." },
          { status: 500 }
        )
      );
    }

    createSortOrder = nextSortOrder.sortOrder;
  }

  let createBody = parsed.value.body;
  if (parsed.value.contentType === "guide_session" || parsed.value.contentType === "guide_drill") {
    const guideRowsResult = await loadGuideIdentityRows({
      supabase,
      contentType: parsed.value.contentType,
    });

    if (guideRowsResult.error) {
      if (isAdminContentSchemaMissing(guideRowsResult.error)) {
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
        "[AdminContent] Could not resolve guide identity defaults",
        guideRowsResult.error
      );
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Could not resolve guide identity defaults right now." },
          { status: 500 }
        )
      );
    }

    const guideRows = (guideRowsResult.data ?? []) as GuideIdentityRow[];
    if (!hasExplicitSortOrder) {
      createSortOrder =
        guideRows.reduce((maxOrder, row) => Math.max(maxOrder, row.sort_order), -1) + 1;
    }

    const explicitRuntimeId =
      parsed.value.contentType === "guide_session"
        ? canonicalizeGuideSessionRuntimeId(parsed.value.body.sessionId)
        : canonicalizeGuideDrillRuntimeId(parsed.value.body.drillId);

    const inputHasRuntimeId = Object.prototype.hasOwnProperty.call(
      parsed.value.body,
      parsed.value.contentType === "guide_session" ? "sessionId" : "drillId"
    );

    if (inputHasRuntimeId && !explicitRuntimeId) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error:
              parsed.value.contentType === "guide_session"
                ? "Guide session runtime ID must look like S01."
                : "Guide drill runtime ID must look like D01.",
          },
          { status: 400 }
        )
      );
    }

    const nextGuideRuntimeId = explicitRuntimeId
      ? {
          runtimeId: explicitRuntimeId,
          legacySlugFallbackCount: 0,
          unresolvedCount: 0,
        }
      : resolveNextGuideRuntimeId({
          contentType: parsed.value.contentType,
          rows: guideRows,
        });

    if (nextGuideRuntimeId.legacySlugFallbackCount > 0 || nextGuideRuntimeId.unresolvedCount > 0) {
      console.warn("[AdminContent] Guide identity defaults relied on legacy rows", {
        contentType: parsed.value.contentType,
        legacySlugFallbackCount: nextGuideRuntimeId.legacySlugFallbackCount,
        unresolvedCount: nextGuideRuntimeId.unresolvedCount,
      });
    }

    createBody = applyGuideRuntimeIdDefaults({
      contentType: parsed.value.contentType,
      body: parsed.value.body,
      runtimeId: nextGuideRuntimeId.runtimeId,
    });
  }

  const insertResult = await supabase
    .from("admin_content_items")
    .insert({
      content_type: parsed.value.contentType,
      parent_id: parsed.value.parentId,
      slug: parsed.value.slug,
      title: parsed.value.title,
      summary: parsed.value.summary,
      category: parsed.value.category,
      body: createBody as Database["public"]["Tables"]["admin_content_items"]["Insert"]["body"],
      sort_order: createSortOrder,
      status: parsed.value.status,
      published_at: parsed.value.status === "published" ? new Date().toISOString() : null,
      created_by: gate.user.id,
      updated_by: gate.user.id,
    })
    .select(
      `
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
    `
    )
    .single();

  if (insertResult.error || !insertResult.data) {
    if (isAdminContentSchemaMissing(insertResult.error)) {
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

    if (insertResult.error?.code === "23505") {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Slug already exists. Choose a unique slug." },
          { status: 409 }
        )
      );
    }

    console.error("[AdminContent] Could not create content item", insertResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not create content item right now." }, { status: 500 })
    );
  }

  return applySupabaseCookies(
    noStoreJson(
      {
        ok: true,
        item: insertResult.data,
      },
      { status: 201 }
    )
  );
}
