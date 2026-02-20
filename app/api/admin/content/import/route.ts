import { NextResponse } from "next/server";
import { buildPlatformContentSeedItems } from "@/lib/admin/content-import";
import {
  getAdminSchemaSetupMessage,
  isAdminCommerceSchemaMissing,
  isAdminContentSchemaMissing,
} from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { getCatalogProductsSafe } from "@/lib/commerce/catalog";
import { upsertCatalogProducts } from "@/lib/commerce/entitlements";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import type { Database } from "@/types/database";

type AdminContentInsert = Database["public"]["Tables"]["admin_content_items"]["Insert"];

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

function toInsertRow(
  item: ReturnType<typeof buildPlatformContentSeedItems>["items"][number],
  options: {
    userId: string;
    publishedAt: string;
    parentId?: string | null;
  }
): AdminContentInsert {
  return {
    content_type: item.contentType,
    parent_id: options.parentId ?? null,
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    category: item.category,
    body: item.body as AdminContentInsert["body"],
    sort_order: item.sortOrder,
    status: item.status,
    published_at: item.status === "published" ? options.publishedAt : null,
    created_by: options.userId,
    updated_by: options.userId,
  };
}

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

  const seed = buildPlatformContentSeedItems();
  const publishedAt = new Date().toISOString();
  const parentItems = seed.items.filter((item) => !item.parentSlug);
  const childItems = seed.items.filter((item) => Boolean(item.parentSlug));

  const parentUpsert = await supabase
    .from("admin_content_items")
    .upsert(
      parentItems.map((item) =>
        toInsertRow(item, {
          userId: gate.user.id,
          publishedAt,
        })
      ),
      { onConflict: "slug" }
    )
    .select("id, slug");

  if (parentUpsert.error) {
    if (isAdminContentSchemaMissing(parentUpsert.error)) {
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
    console.error("[AdminContentImport] Could not upsert parent content items", parentUpsert.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not import platform content right now." },
        { status: 500 }
      )
    );
  }

  const parentSlugSet = new Set(parentItems.map((item) => item.slug));
  const parentLookup = await supabase
    .from("admin_content_items")
    .select("id, slug")
    .in("slug", Array.from(parentSlugSet));

  if (parentLookup.error) {
    if (isAdminContentSchemaMissing(parentLookup.error)) {
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
      "[AdminContentImport] Could not resolve parent ids after upsert",
      parentLookup.error
    );
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not import platform content right now." },
        { status: 500 }
      )
    );
  }

  const parentIdBySlug = new Map((parentLookup.data ?? []).map((item) => [item.slug, item.id]));
  const missingParent = childItems.find((item) => {
    if (!item.parentSlug) return false;
    return !parentIdBySlug.has(item.parentSlug);
  });
  if (missingParent?.parentSlug) {
    console.error("[AdminContentImport] Missing parent id for child content item", {
      slug: missingParent.slug,
      parentSlug: missingParent.parentSlug,
    });
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not import platform content right now." },
        { status: 500 }
      )
    );
  }

  const childUpsert = await supabase.from("admin_content_items").upsert(
    childItems.map((item) =>
      toInsertRow(item, {
        userId: gate.user.id,
        publishedAt,
        parentId: item.parentSlug ? (parentIdBySlug.get(item.parentSlug) ?? null) : null,
      })
    ),
    { onConflict: "slug" }
  );

  if (childUpsert.error) {
    if (isAdminContentSchemaMissing(childUpsert.error)) {
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
    console.error("[AdminContentImport] Could not upsert child content items", childUpsert.error);
    return applySupabaseCookies(
      noStoreJson(
        { ok: false, error: "Could not import platform content right now." },
        { status: 500 }
      )
    );
  }

  const catalogProducts = getCatalogProductsSafe();
  let productSyncWarning: string | null = null;
  let productsSynced = 0;

  if (catalogProducts.length > 0) {
    try {
      await upsertCatalogProducts(supabase, catalogProducts);
      productsSynced = catalogProducts.length;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown product sync error.";
      if (isAdminCommerceSchemaMissing({ message })) {
        productSyncWarning = getAdminSchemaSetupMessage("commerce");
      } else {
        productSyncWarning = "Content import succeeded, but product sync was skipped.";
      }
      console.error("[AdminContentImport] Product sync failed", error);
    }
  } else {
    productSyncWarning =
      "Content import succeeded, but product sync was skipped (missing catalog env).";
  }

  return applySupabaseCookies(
    noStoreJson({
      ok: true,
      imported: seed.summary,
      productsSynced,
      warning: productSyncWarning,
    })
  );
}
