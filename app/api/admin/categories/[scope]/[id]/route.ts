import { NextResponse } from "next/server";
import {
  isAdminCategoryScope,
  isUuid,
  parseUpdateAdminCategoryPayload,
  type AdminCategoryScope,
} from "@/lib/admin/categories";
import { getAdminSchemaSetupMessage, isAdminCategoriesSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type RouteContext = {
  params: Promise<{ scope: string; id: string }>;
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

async function resolveParams(
  context: RouteContext
): Promise<{ scope: AdminCategoryScope; id: string } | null> {
  const params = await context.params;
  if (!isAdminCategoryScope(params.scope)) return null;
  if (!isUuid(params.id)) return null;
  return {
    scope: params.scope,
    id: params.id,
  };
}

function selectedFields() {
  return "id, scope, slug, title, sort_order, is_active, created_by, updated_by, created_at, updated_at";
}

export async function PATCH(request: Request, context: RouteContext) {
  const params = await resolveParams(context);
  if (!params) {
    return noStoreJson({ ok: false, error: "Invalid category reference." }, { status: 400 });
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

  const parsed = parseUpdateAdminCategoryPayload((payload ?? {}) as Record<string, unknown>);
  if (!parsed.ok) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: parsed.error }, { status: 400 }));
  }

  const updateResult = await supabase
    .from("admin_categories")
    .update({
      ...(parsed.value.title !== undefined ? { title: parsed.value.title } : {}),
      ...(parsed.value.slug !== undefined ? { slug: parsed.value.slug } : {}),
      ...(parsed.value.sortOrder !== undefined ? { sort_order: parsed.value.sortOrder } : {}),
      ...(parsed.value.isActive !== undefined ? { is_active: parsed.value.isActive } : {}),
      updated_by: gate.user.id,
    })
    .eq("scope", params.scope)
    .eq("id", params.id)
    .select(selectedFields())
    .maybeSingle();

  if (updateResult.error) {
    if (isAdminCategoriesSchemaMissing(updateResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("categories"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    if (updateResult.error.code === "23505") {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Category slug already exists for this scope." },
          { status: 409 }
        )
      );
    }

    console.error("[AdminCategories] Could not update category", updateResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not update category right now." }, { status: 500 })
    );
  }

  if (!updateResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Category not found." }, { status: 404 })
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
  const params = await resolveParams(context);
  if (!params) {
    return noStoreJson({ ok: false, error: "Invalid category reference." }, { status: 400 });
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
    .from("admin_categories")
    .delete()
    .eq("scope", params.scope)
    .eq("id", params.id)
    .select("id")
    .maybeSingle();

  if (deleteResult.error) {
    if (isAdminCategoriesSchemaMissing(deleteResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("categories"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }
    console.error("[AdminCategories] Could not delete category", deleteResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not delete category right now." }, { status: 500 })
    );
  }

  if (!deleteResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Category not found." }, { status: 404 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      id: deleteResult.data.id,
    })
  );
}
