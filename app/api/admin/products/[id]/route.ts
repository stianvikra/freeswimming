import { NextResponse } from "next/server";
import { parseUpdateAdminProductPayload } from "@/lib/admin/products";
import { getAdminSchemaSetupMessage, isAdminCommerceSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

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

export async function PATCH(request: Request, context: RouteContext) {
  const params = await context.params;
  const productId = params.id;
  if (!productId.trim()) {
    return noStoreJson({ ok: false, error: "Invalid product id." }, { status: 400 });
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

  const parsed = parseUpdateAdminProductPayload((payload ?? {}) as Record<string, unknown>);
  if (!parsed.ok) {
    return applySupabaseCookies(noStoreJson({ ok: false, error: parsed.error }, { status: 400 }));
  }

  const updateResult = await supabase
    .from("products")
    .update({
      title: parsed.value.title,
      active: parsed.value.active,
    })
    .eq("id", productId)
    .select("id, slug, title, kind, stripe_price_id, active, created_at, updated_at")
    .maybeSingle();

  if (updateResult.error) {
    if (isAdminCommerceSchemaMissing(updateResult.error)) {
      return applySupabaseCookies(
        noStoreJson(
          {
            ok: false,
            error: getAdminSchemaSetupMessage("commerce"),
            code: "ADMIN_SCHEMA_NOT_READY",
          },
          { status: 503 }
        )
      );
    }

    console.error("[AdminProducts] Could not update product", updateResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not update product right now." }, { status: 500 })
    );
  }

  if (!updateResult.data) {
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Product not found." }, { status: 404 })
    );
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      item: updateResult.data,
    })
  );
}
