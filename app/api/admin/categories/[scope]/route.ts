import { NextResponse } from "next/server";
import {
  isAdminCategoryScope,
  parseCreateAdminCategoryPayload,
  type AdminCategoryScope,
} from "@/lib/admin/categories";
import { getAdminSchemaSetupMessage, isAdminCategoriesSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

type RouteContext = {
  params: Promise<{ scope: string }>;
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

async function resolveScope(context: RouteContext): Promise<AdminCategoryScope | null> {
  const params = await context.params;
  return isAdminCategoryScope(params.scope) ? params.scope : null;
}

function selectedFields() {
  return "id, scope, slug, title, sort_order, is_active, created_by, updated_by, created_at, updated_at";
}

export async function GET(_request: Request, context: RouteContext) {
  const scope = await resolveScope(context);
  if (!scope) {
    return noStoreJson({ ok: false, error: "Unknown category scope." }, { status: 404 });
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

  const result = await supabase
    .from("admin_categories")
    .select(selectedFields())
    .eq("scope", scope)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (result.error) {
    if (isAdminCategoriesSchemaMissing(result.error)) {
      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          items: [],
          schemaReady: false,
          warning: getAdminSchemaSetupMessage("categories"),
        })
      );
    }
    console.error("[AdminCategories] Could not load categories", result.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load categories right now." }, { status: 500 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      items: result.data ?? [],
      schemaReady: true,
      warning: null,
    })
  );
}

export async function POST(request: Request, context: RouteContext) {
  const scope = await resolveScope(context);
  if (!scope) {
    return noStoreJson({ ok: false, error: "Unknown category scope." }, { status: 404 });
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

  const parsed = parseCreateAdminCategoryPayload((payload ?? {}) as Record<string, unknown>);
  if (!parsed.ok) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: parsed.error }, { status: 400 }));
  }

  const insertResult = await supabase
    .from("admin_categories")
    .insert({
      scope,
      slug: parsed.value.slug,
      title: parsed.value.title,
      sort_order: parsed.value.sortOrder,
      is_active: parsed.value.isActive,
      created_by: gate.user.id,
      updated_by: gate.user.id,
    })
    .select(selectedFields())
    .single();

  if (insertResult.error || !insertResult.data) {
    if (isAdminCategoriesSchemaMissing(insertResult.error)) {
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

    if (insertResult.error?.code === "23505") {
      return applySupabaseCookies(
        noStoreJson(
          { ok: false, error: "Category slug already exists for this scope." },
          { status: 409 }
        )
      );
    }

    console.error("[AdminCategories] Could not create category", insertResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not create category right now." }, { status: 500 })
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
