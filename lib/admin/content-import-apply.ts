import type { SupabaseClient } from "@supabase/supabase-js";
import { repairCourseRuntimeIdentityRows } from "@/lib/admin/course-runtime-id-repair";
import { buildPlatformContentSeedItems } from "@/lib/admin/content-import";
import {
  getAdminSchemaSetupMessage,
  isAdminCommerceSchemaMissing,
  isAdminContentSchemaMissing,
} from "@/lib/admin/schema";
import { getCatalogProductsSafe } from "@/lib/commerce/catalog";
import { upsertCatalogProducts } from "@/lib/commerce/entitlements";
import type { Database } from "@/types/database";

type AdminContentInsert = Database["public"]["Tables"]["admin_content_items"]["Insert"];
type AdminContentRow = Database["public"]["Tables"]["admin_content_items"]["Row"];
type AdminContentCompareRow = Pick<
  AdminContentRow,
  | "slug"
  | "content_type"
  | "parent_id"
  | "title"
  | "summary"
  | "category"
  | "body"
  | "sort_order"
  | "status"
  | "published_at"
>;

type SeedItem = ReturnType<typeof buildPlatformContentSeedItems>["items"][number];

function toInsertRow(
  item: SeedItem,
  options: {
    userId: string | null;
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

function normalizeStableJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeStableJson(entry));
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([entryKey, entryValue]) => [entryKey, normalizeStableJson(entryValue)] as const);
    return Object.fromEntries(entries);
  }
  return value;
}

function sameBody(a: unknown, b: unknown): boolean {
  return JSON.stringify(normalizeStableJson(a)) === JSON.stringify(normalizeStableJson(b));
}

function matchesSeedRow(
  existing: AdminContentCompareRow | undefined,
  desired: AdminContentInsert
): boolean {
  if (!existing) return false;
  return (
    existing.content_type === desired.content_type &&
    existing.parent_id === (desired.parent_id ?? null) &&
    existing.slug === desired.slug &&
    existing.title === desired.title &&
    existing.summary === desired.summary &&
    existing.category === desired.category &&
    existing.sort_order === desired.sort_order &&
    existing.status === desired.status &&
    Boolean(existing.published_at) === Boolean(desired.published_at) &&
    sameBody(existing.body, desired.body)
  );
}

function withStablePublishedAt(
  desired: AdminContentInsert,
  existing: AdminContentCompareRow | undefined,
  fallbackPublishedAt: string
): AdminContentInsert {
  if (desired.status !== "published") {
    return { ...desired, published_at: null };
  }
  return {
    ...desired,
    published_at: existing?.published_at ?? fallbackPublishedAt,
  };
}

export type PlatformContentImportResult = {
  imported: ReturnType<typeof buildPlatformContentSeedItems>["summary"];
  changes: {
    courseRuntimeRowsRepaired: number;
    parentRowsUpdated: number;
    childRowsUpdated: number;
    unchangedRows: number;
  };
  productsSynced: number;
  warning: string | null;
};

type ApplyPlatformContentSeedOptions = {
  supabase: SupabaseClient<Database>;
  actorUserId?: string | null;
  syncProducts?: boolean;
};

type ApplyPlatformContentSeedFailure =
  | {
      ok: false;
      code: "ADMIN_SCHEMA_NOT_READY";
      error: string;
    }
  | {
      ok: false;
      code: "IMPORT_FAILED";
      error: string;
    };

type ApplyPlatformContentSeedSuccess = {
  ok: true;
  result: PlatformContentImportResult;
};

export type ApplyPlatformContentSeedResponse =
  | ApplyPlatformContentSeedFailure
  | ApplyPlatformContentSeedSuccess;

export async function applyPlatformContentSeed({
  supabase,
  actorUserId = null,
  syncProducts = true,
}: ApplyPlatformContentSeedOptions): Promise<ApplyPlatformContentSeedResponse> {
  const repairResult = await repairCourseRuntimeIdentityRows({
    supabase,
    actorUserId,
  });
  if (!repairResult.ok) {
    return {
      ok: false,
      code: "IMPORT_FAILED",
      error: repairResult.error,
    };
  }

  const seed = buildPlatformContentSeedItems();
  const publishedAt = new Date().toISOString();
  const parentItems = seed.items.filter((item) => !item.parentSlug);
  const childItems = seed.items.filter((item) => Boolean(item.parentSlug));

  const parentSlugs = parentItems.map((item) => item.slug);
  const existingParentsResult = await supabase
    .from("admin_content_items")
    .select(
      "slug, content_type, parent_id, title, summary, category, body, sort_order, status, published_at"
    )
    .in("slug", parentSlugs);

  if (existingParentsResult.error) {
    if (isAdminContentSchemaMissing(existingParentsResult.error)) {
      return {
        ok: false,
        code: "ADMIN_SCHEMA_NOT_READY",
        error: getAdminSchemaSetupMessage("content"),
      };
    }
    console.error(
      "[AdminContentImport] Could not load existing parent items before import",
      existingParentsResult.error
    );
    return {
      ok: false,
      code: "IMPORT_FAILED",
      error: "Could not import platform content right now.",
    };
  }

  const existingParentsBySlug = new Map(
    (existingParentsResult.data ?? []).map((row) => [row.slug, row] as const)
  );
  const desiredParentRows = parentItems.map((item) => {
    const existing = existingParentsBySlug.get(item.slug);
    return withStablePublishedAt(
      toInsertRow(item, {
        userId: actorUserId,
        publishedAt,
      }),
      existing,
      publishedAt
    );
  });
  const parentRowsToUpsert = desiredParentRows.filter((row) => {
    const existing = existingParentsBySlug.get(row.slug);
    return !matchesSeedRow(existing, row);
  });

  if (parentRowsToUpsert.length > 0) {
    const parentUpsert = await supabase
      .from("admin_content_items")
      .upsert(parentRowsToUpsert, { onConflict: "slug" });

    if (parentUpsert.error) {
      if (isAdminContentSchemaMissing(parentUpsert.error)) {
        return {
          ok: false,
          code: "ADMIN_SCHEMA_NOT_READY",
          error: getAdminSchemaSetupMessage("content"),
        };
      }
      console.error(
        "[AdminContentImport] Could not upsert parent content items",
        parentUpsert.error
      );
      return {
        ok: false,
        code: "IMPORT_FAILED",
        error: "Could not import platform content right now.",
      };
    }
  }

  const parentSlugSet = new Set(parentItems.map((item) => item.slug));
  const parentLookup = await supabase
    .from("admin_content_items")
    .select("id, slug")
    .in("slug", Array.from(parentSlugSet));

  if (parentLookup.error) {
    if (isAdminContentSchemaMissing(parentLookup.error)) {
      return {
        ok: false,
        code: "ADMIN_SCHEMA_NOT_READY",
        error: getAdminSchemaSetupMessage("content"),
      };
    }
    console.error(
      "[AdminContentImport] Could not resolve parent ids after upsert",
      parentLookup.error
    );
    return {
      ok: false,
      code: "IMPORT_FAILED",
      error: "Could not import platform content right now.",
    };
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
    return {
      ok: false,
      code: "IMPORT_FAILED",
      error: "Could not import platform content right now.",
    };
  }

  const childSlugs = childItems.map((item) => item.slug);
  const existingChildrenResult = await supabase
    .from("admin_content_items")
    .select(
      "slug, content_type, parent_id, title, summary, category, body, sort_order, status, published_at"
    )
    .in("slug", childSlugs);

  if (existingChildrenResult.error) {
    if (isAdminContentSchemaMissing(existingChildrenResult.error)) {
      return {
        ok: false,
        code: "ADMIN_SCHEMA_NOT_READY",
        error: getAdminSchemaSetupMessage("content"),
      };
    }
    console.error(
      "[AdminContentImport] Could not load existing child items before import",
      existingChildrenResult.error
    );
    return {
      ok: false,
      code: "IMPORT_FAILED",
      error: "Could not import platform content right now.",
    };
  }

  const existingChildrenBySlug = new Map(
    (existingChildrenResult.data ?? []).map((row) => [row.slug, row] as const)
  );
  const desiredChildRows = childItems.map((item) => {
    const existing = existingChildrenBySlug.get(item.slug);
    return withStablePublishedAt(
      toInsertRow(item, {
        userId: actorUserId,
        publishedAt,
        parentId: item.parentSlug ? (parentIdBySlug.get(item.parentSlug) ?? null) : null,
      }),
      existing,
      publishedAt
    );
  });
  const childRowsToUpsert = desiredChildRows.filter((row) => {
    const existing = existingChildrenBySlug.get(row.slug);
    return !matchesSeedRow(existing, row);
  });

  if (childRowsToUpsert.length > 0) {
    const childUpsert = await supabase
      .from("admin_content_items")
      .upsert(childRowsToUpsert, { onConflict: "slug" });

    if (childUpsert.error) {
      if (isAdminContentSchemaMissing(childUpsert.error)) {
        return {
          ok: false,
          code: "ADMIN_SCHEMA_NOT_READY",
          error: getAdminSchemaSetupMessage("content"),
        };
      }
      console.error("[AdminContentImport] Could not upsert child content items", childUpsert.error);
      return {
        ok: false,
        code: "IMPORT_FAILED",
        error: "Could not import platform content right now.",
      };
    }
  }

  let productsSynced = 0;
  let warning: string | null = null;

  if (syncProducts) {
    const catalogProducts = getCatalogProductsSafe();
    if (catalogProducts.length > 0) {
      try {
        await upsertCatalogProducts(supabase, catalogProducts);
        productsSynced = catalogProducts.length;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown product sync error.";
        if (isAdminCommerceSchemaMissing({ message })) {
          warning = getAdminSchemaSetupMessage("commerce");
        } else {
          warning = "Content import succeeded, but product sync was skipped.";
        }
        console.error("[AdminContentImport] Product sync failed", error);
      }
    } else {
      warning = "Content import succeeded, but product sync was skipped (missing catalog env).";
    }
  }

  return {
    ok: true,
    result: {
      imported: seed.summary,
      changes: {
        courseRuntimeRowsRepaired: repairResult.repairedRows,
        parentRowsUpdated: parentRowsToUpsert.length,
        childRowsUpdated: childRowsToUpsert.length,
        unchangedRows:
          seed.summary.totalItems - (parentRowsToUpsert.length + childRowsToUpsert.length),
      },
      productsSynced,
      warning,
    },
  };
}

type EnsurePlatformContentSeededOptions = {
  supabase: SupabaseClient<Database>;
  actorUserId?: string | null;
};

export type EnsurePlatformContentSeededResult =
  | {
      ok: true;
      seeded: boolean;
      repairedCourseRuntimeRows?: number;
    }
  | {
      ok: false;
      schemaReady: boolean;
      error: string;
    };

export async function ensurePlatformContentSeeded({
  supabase,
  actorUserId = null,
}: EnsurePlatformContentSeededOptions): Promise<EnsurePlatformContentSeededResult> {
  const probeResult = await supabase.from("admin_content_items").select("id").limit(1);
  if (probeResult.error) {
    if (isAdminContentSchemaMissing(probeResult.error)) {
      return {
        ok: false,
        schemaReady: false,
        error: getAdminSchemaSetupMessage("content"),
      };
    }
    console.error("[AdminContentImport] Could not probe existing content rows", probeResult.error);
    return {
      ok: false,
      schemaReady: true,
      error: "Could not verify content catalog readiness.",
    };
  }

  if ((probeResult.data ?? []).length > 0) {
    const repairResult = await repairCourseRuntimeIdentityRows({
      supabase,
      actorUserId,
    });
    if (!repairResult.ok) {
      return {
        ok: false,
        schemaReady: true,
        error: repairResult.error,
      };
    }

    return {
      ok: true,
      seeded: false,
      repairedCourseRuntimeRows: repairResult.repairedRows,
    };
  }

  const applyResult = await applyPlatformContentSeed({
    supabase,
    actorUserId,
    syncProducts: false,
  });
  if (!applyResult.ok) {
    return {
      ok: false,
      schemaReady: applyResult.code !== "ADMIN_SCHEMA_NOT_READY",
      error: applyResult.error,
    };
  }

  return { ok: true, seeded: true, repairedCourseRuntimeRows: 0 };
}
