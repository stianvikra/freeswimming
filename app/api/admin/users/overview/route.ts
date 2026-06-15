import { NextResponse } from "next/server";
import { getAdminSchemaSetupMessage, isAdminUsersSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import {
  ADMIN_USERS_MAX_ACTIVITY_ROWS,
  buildAdminUsersIlikePattern,
  buildAdminUsersOverview,
  parseAdminUsersOverviewSearchParams,
  type AdminUserActivitySourceRow,
  type AdminUserEntitlementSourceRow,
  type AdminUserProductSourceRow,
  type AdminUserProfileSourceRow,
} from "@/lib/admin/users";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

function getProfileOrder(sort: ReturnType<typeof parseAdminUsersOverviewSearchParams>["sort"]) {
  if (sort === "email_asc") return { column: "email", ascending: true };
  if (sort === "created_desc") return { column: "created_at", ascending: false };
  return { column: "updated_at", ascending: false };
}

export async function GET(request: Request) {
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

  const query = parseAdminUsersOverviewSearchParams(new URL(request.url).searchParams);
  const offset = (query.page - 1) * query.pageSize;
  const profileOrder = getProfileOrder(query.sort);

  let adminSupabase: ReturnType<typeof createAdminSupabaseClient>;
  try {
    adminSupabase = createAdminSupabaseClient();
  } catch (error) {
    console.error("[AdminUsersOverview] Service-role client unavailable", error);
    return applySupabaseCookies(
      noStoreJson(
        {
          ok: false,
          error: "Could not load user overview right now.",
        },
        { status: 500 }
      )
    );
  }

  let profileQuery = adminSupabase
    .from("profiles")
    .select("id, email, role, created_at, updated_at", { count: "exact" });

  if (query.search) {
    profileQuery = profileQuery.ilike("email", buildAdminUsersIlikePattern(query.search));
  }

  if (query.role !== "all") {
    profileQuery = profileQuery.eq("role", query.role);
  }

  const profilesResult = await profileQuery
    .order(profileOrder.column, { ascending: profileOrder.ascending })
    .range(offset, offset + query.pageSize);

  if (profilesResult.error) {
    if (isAdminUsersSchemaMissing(profilesResult.error)) {
      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          generatedAt: new Date().toISOString(),
          query,
          summary: {
            totalUsers: 0,
            visibleUsers: 0,
            usersWithAccess: 0,
            usersWithoutAccess: 0,
            adminUsers: 0,
            editorUsers: 0,
            viewerUsers: 0,
            unknownRoleUsers: 0,
            partialSummary: true,
          },
          pageInfo: {
            page: query.page,
            pageSize: query.pageSize,
            totalCount: 0,
            hasPreviousPage: query.page > 1,
            hasNextPage: false,
          },
          items: [],
          warnings: [getAdminSchemaSetupMessage("users")],
        })
      );
    }

    console.error("[AdminUsersOverview] Could not load profiles", profilesResult.error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load user overview right now." }, { status: 500 })
    );
  }

  const rawProfiles = (profilesResult.data ?? []) as unknown as AdminUserProfileSourceRow[];
  const profiles = rawProfiles.slice(0, query.pageSize);
  const userIds = profiles.map((profile) => profile.id);
  const warnings: string[] = [];
  let partialSummary = false;

  let entitlements: AdminUserEntitlementSourceRow[] = [];
  let products: AdminUserProductSourceRow[] = [];
  let activityRows: AdminUserActivitySourceRow[] = [];

  if (userIds.length > 0) {
    const entitlementsResult = await adminSupabase
      .from("entitlements")
      .select("id, user_id, product_id, source, granted_at, updated_at")
      .in("user_id", userIds)
      .order("granted_at", { ascending: false })
      .limit(500);

    if (entitlementsResult.error) {
      partialSummary = true;
      warnings.push(getAdminSchemaSetupMessage("users"));
      console.error("[AdminUsersOverview] Could not load entitlement summary", {
        message: entitlementsResult.error.message,
      });
    } else {
      entitlements = (entitlementsResult.data ?? []) as unknown as AdminUserEntitlementSourceRow[];
    }

    const activityResult = await adminSupabase
      .from("analytics_events")
      .select("user_id, occurred_at")
      .in("user_id", userIds)
      .eq("public_aggregate", false)
      .order("occurred_at", { ascending: false })
      .limit(ADMIN_USERS_MAX_ACTIVITY_ROWS);

    if (activityResult.error) {
      partialSummary = true;
      warnings.push("Last-activity summary is unavailable in this environment.");
      console.error("[AdminUsersOverview] Could not load user activity summary", {
        message: activityResult.error.message,
      });
    } else {
      activityRows = (activityResult.data ?? []) as unknown as AdminUserActivitySourceRow[];
    }
  }

  const productsResult = await adminSupabase
    .from("products")
    .select("id, title, kind, active")
    .order("title", { ascending: true })
    .limit(500);

  if (productsResult.error) {
    partialSummary = true;
    warnings.push("Product labels are unavailable; product IDs are shown as fallback.");
    console.error("[AdminUsersOverview] Could not load product labels", {
      message: productsResult.error.message,
    });
  } else {
    products = (productsResult.data ?? []) as unknown as AdminUserProductSourceRow[];
  }

  const totalCount = profilesResult.count ?? null;
  const hasNextPage =
    totalCount === null
      ? rawProfiles.length > query.pageSize
      : offset + profiles.length < totalCount;

  return applySupabaseCookies(
    noStoreJson(
      buildAdminUsersOverview({
        profiles,
        entitlements,
        products,
        activityRows,
        query,
        totalCount,
        hasNextPage,
        partialSummary,
        warnings: [...new Set(warnings)],
      })
    )
  );
}
