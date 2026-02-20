import { NextResponse } from "next/server";
import { isUuid, parseUpdateAdminContentPayload } from "@/lib/admin/content";
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

function mapSelectedFields() {
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

async function resolveItemId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.id;
}

export async function PATCH(request: Request, context: RouteContext) {
  const itemId = await resolveItemId(context);
  if (!isUuid(itemId)) {
    return noStoreJson({ ok: false, error: "Invalid content item id." }, { status: 400 });
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

  const parsed = parseUpdateAdminContentPayload((payload ?? {}) as Record<string, unknown>, {
    itemId,
  });
  if (!parsed.ok) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: parsed.error }, { status: 400 }));
  }

  if (parsed.value.hasParentId && parsed.value.parentId) {
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

  const existingResult = await supabase
    .from("admin_content_items")
    .select("id, published_at")
    .eq("id", itemId)
    .maybeSingle();

  if (existingResult.error) {
    if (isAdminContentSchemaMissing(existingResult.error)) {
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
    console.error("[AdminContent] Could not load existing content item", existingResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load content item right now." }, { status: 500 })
    );
  }

  if (!existingResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Content item not found." }, { status: 404 })
    );
  }

  const updatePayload: Database["public"]["Tables"]["admin_content_items"]["Update"] = {
    updated_by: gate.user.id,
  };

  if (parsed.value.contentType !== undefined) {
    updatePayload.content_type = parsed.value.contentType;
  }
  if (parsed.value.title !== undefined) {
    updatePayload.title = parsed.value.title;
  }
  if (parsed.value.slug !== undefined) {
    updatePayload.slug = parsed.value.slug;
  }
  if (parsed.value.summary !== undefined) {
    updatePayload.summary = parsed.value.summary;
  }
  if (parsed.value.category !== undefined) {
    updatePayload.category = parsed.value.category;
  }
  if (parsed.value.body !== undefined) {
    updatePayload.body = parsed.value
      .body as Database["public"]["Tables"]["admin_content_items"]["Update"]["body"];
  }
  if (parsed.value.sortOrder !== undefined) {
    updatePayload.sort_order = parsed.value.sortOrder;
  }
  if (parsed.value.hasParentId) {
    updatePayload.parent_id = parsed.value.parentId ?? null;
  }
  if (parsed.value.hasStatus && parsed.value.status) {
    updatePayload.status = parsed.value.status;
    updatePayload.published_at =
      parsed.value.status === "published"
        ? (existingResult.data.published_at ?? new Date().toISOString())
        : null;
  }

  const updateResult = await supabase
    .from("admin_content_items")
    .update(updatePayload)
    .eq("id", itemId)
    .select(mapSelectedFields())
    .single();

  if (updateResult.error || !updateResult.data) {
    if (isAdminContentSchemaMissing(updateResult.error)) {
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

    if (updateResult.error?.code === "23505") {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Slug already exists. Choose a unique slug." },
          { status: 409 }
        )
      );
    }

    console.error("[AdminContent] Could not update content item", updateResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not update content item right now." }, { status: 500 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      item: updateResult.data,
    })
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
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

  const deleteResult = await supabase
    .from("admin_content_items")
    .delete()
    .eq("id", itemId)
    .select("id")
    .maybeSingle();

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
    console.error("[AdminContent] Could not delete content item", deleteResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not delete content item right now." }, { status: 500 })
    );
  }

  if (!deleteResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Content item not found." }, { status: 404 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      id: deleteResult.data.id,
    })
  );
}
