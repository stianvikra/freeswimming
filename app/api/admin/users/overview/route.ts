import { NextResponse } from "next/server";
import { getAdminSchemaSetupMessage, isAdminUsersSchemaMissing } from "@/lib/admin/schema";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import {
  ADMIN_USERS_AUTH_PAGE_SIZE,
  ADMIN_USERS_MAX_ACTIVITY_ROWS,
  ADMIN_USERS_MAX_AUTH_ROWS,
  ADMIN_USERS_QUERY_CHUNK_SIZE,
  buildAdminUsersOverview,
  parseAdminUsersOverviewSearchParams,
  type AdminUserActivitySourceRow,
  type AdminUserAthleteProfileSourceRow,
  type AdminUserAuthSourceRow,
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

function uniqueWarnings(warnings: string[]): string[] {
  return [...new Set(warnings)];
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function loadAuthUsers(adminSupabase: ReturnType<typeof createAdminSupabaseClient>) {
  const users: AdminUserAuthSourceRow[] = [];
  const warnings: string[] = [];
  let partialSummary = false;
  let nextPage: number | null = 1;

  while (nextPage !== null && users.length < ADMIN_USERS_MAX_AUTH_ROWS) {
    const result = await adminSupabase.auth.admin.listUsers({
      page: nextPage,
      perPage: ADMIN_USERS_AUTH_PAGE_SIZE,
    });

    if (result.error) {
      throw result.error;
    }

    users.push(...((result.data.users ?? []) as AdminUserAuthSourceRow[]));

    if (result.data.nextPage && users.length >= ADMIN_USERS_MAX_AUTH_ROWS) {
      partialSummary = true;
      warnings.push(
        `Auth user summary is capped at ${ADMIN_USERS_MAX_AUTH_ROWS} users; narrow filters or add a directory index before relying on full counts.`
      );
      break;
    }

    nextPage = result.data.nextPage ?? null;
  }

  return { users, warnings, partialSummary };
}

async function loadProfilesForUsers(
  adminSupabase: ReturnType<typeof createAdminSupabaseClient>,
  userIds: string[],
  warnings: string[]
) {
  const profiles: AdminUserProfileSourceRow[] = [];
  let partialSummary = false;

  for (const chunk of chunkArray(userIds, ADMIN_USERS_QUERY_CHUNK_SIZE)) {
    const result = await adminSupabase
      .from("profiles")
      .select("id, email, role, created_at, updated_at")
      .in("id", chunk);

    if (result.error) {
      partialSummary = true;
      warnings.push(getAdminSchemaSetupMessage("users"));
      console.error("[AdminUsersOverview] Could not load profile summary", {
        message: result.error.message,
      });
      if (isAdminUsersSchemaMissing(result.error)) break;
      continue;
    }

    profiles.push(...((result.data ?? []) as unknown as AdminUserProfileSourceRow[]));
  }

  return { profiles, partialSummary };
}

async function loadAthleteProfilesForUsers(
  adminSupabase: ReturnType<typeof createAdminSupabaseClient>,
  userIds: string[],
  warnings: string[]
) {
  const athleteProfiles: AdminUserAthleteProfileSourceRow[] = [];
  let partialSummary = false;

  for (const chunk of chunkArray(userIds, ADMIN_USERS_QUERY_CHUNK_SIZE)) {
    const result = await adminSupabase
      .from("athlete_profiles")
      .select("user_id, display_name, first_name, last_name, updated_at")
      .in("user_id", chunk);

    if (result.error) {
      partialSummary = true;
      warnings.push("Athlete profile names are unavailable in this environment.");
      console.error("[AdminUsersOverview] Could not load athlete profile summary", {
        message: result.error.message,
      });
      continue;
    }

    athleteProfiles.push(...((result.data ?? []) as unknown as AdminUserAthleteProfileSourceRow[]));
  }

  return { athleteProfiles, partialSummary };
}

async function loadEntitlementsForUsers(
  adminSupabase: ReturnType<typeof createAdminSupabaseClient>,
  userIds: string[],
  warnings: string[]
) {
  const entitlements: AdminUserEntitlementSourceRow[] = [];
  let partialSummary = false;

  for (const chunk of chunkArray(userIds, ADMIN_USERS_QUERY_CHUNK_SIZE)) {
    const result = await adminSupabase
      .from("entitlements")
      .select("id, user_id, product_id, source, granted_at, updated_at")
      .in("user_id", chunk)
      .order("granted_at", { ascending: false })
      .limit(2000);

    if (result.error) {
      partialSummary = true;
      warnings.push(getAdminSchemaSetupMessage("users"));
      console.error("[AdminUsersOverview] Could not load entitlement summary", {
        message: result.error.message,
      });
      continue;
    }

    entitlements.push(...((result.data ?? []) as unknown as AdminUserEntitlementSourceRow[]));
  }

  return { entitlements, partialSummary };
}

async function loadActivityForUsers(
  adminSupabase: ReturnType<typeof createAdminSupabaseClient>,
  userIds: string[],
  warnings: string[]
) {
  const activityRows: AdminUserActivitySourceRow[] = [];
  let partialSummary = false;

  for (const chunk of chunkArray(userIds, ADMIN_USERS_QUERY_CHUNK_SIZE)) {
    const result = await adminSupabase
      .from("analytics_events")
      .select("user_id, occurred_at")
      .in("user_id", chunk)
      .eq("public_aggregate", false)
      .order("occurred_at", { ascending: false })
      .limit(ADMIN_USERS_MAX_ACTIVITY_ROWS);

    if (result.error) {
      partialSummary = true;
      warnings.push("Last-activity summary is unavailable in this environment.");
      console.error("[AdminUsersOverview] Could not load user activity summary", {
        message: result.error.message,
      });
      continue;
    }

    activityRows.push(...((result.data ?? []) as unknown as AdminUserActivitySourceRow[]));
  }

  return { activityRows, partialSummary };
}

async function loadProducts(
  adminSupabase: ReturnType<typeof createAdminSupabaseClient>,
  warnings: string[]
) {
  const result = await adminSupabase
    .from("products")
    .select("id, title, kind, active")
    .order("title", { ascending: true })
    .limit(500);

  if (result.error) {
    warnings.push("Product labels are unavailable; product IDs are shown as fallback.");
    console.error("[AdminUsersOverview] Could not load product labels", {
      message: result.error.message,
    });
    return { products: [] as AdminUserProductSourceRow[], partialSummary: true };
  }

  return {
    products: (result.data ?? []) as unknown as AdminUserProductSourceRow[],
    partialSummary: false,
  };
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

  const warnings: string[] = [];
  let partialSummary = false;
  let authUsers: AdminUserAuthSourceRow[] = [];

  try {
    const authResult = await loadAuthUsers(adminSupabase);
    authUsers = authResult.users;
    warnings.push(...authResult.warnings);
    partialSummary = partialSummary || authResult.partialSummary;
  } catch (error) {
    console.error("[AdminUsersOverview] Could not load auth users", error);
    return applySupabaseCookies(
      noStoreJson({ ok: false, error: "Could not load auth users right now." }, { status: 500 })
    );
  }

  const userIds = authUsers.map((user) => user.id);
  let profiles: AdminUserProfileSourceRow[] = [];
  let athleteProfiles: AdminUserAthleteProfileSourceRow[] = [];
  let entitlements: AdminUserEntitlementSourceRow[] = [];
  let activityRows: AdminUserActivitySourceRow[] = [];

  if (userIds.length > 0) {
    const profilesResult = await loadProfilesForUsers(adminSupabase, userIds, warnings);
    profiles = profilesResult.profiles;
    partialSummary = partialSummary || profilesResult.partialSummary;

    const athleteProfilesResult = await loadAthleteProfilesForUsers(
      adminSupabase,
      userIds,
      warnings
    );
    athleteProfiles = athleteProfilesResult.athleteProfiles;
    partialSummary = partialSummary || athleteProfilesResult.partialSummary;

    const entitlementsResult = await loadEntitlementsForUsers(adminSupabase, userIds, warnings);
    entitlements = entitlementsResult.entitlements;
    partialSummary = partialSummary || entitlementsResult.partialSummary;

    const activityResult = await loadActivityForUsers(adminSupabase, userIds, warnings);
    activityRows = activityResult.activityRows;
    partialSummary = partialSummary || activityResult.partialSummary;
  }

  const productsResult = await loadProducts(adminSupabase, warnings);
  partialSummary = partialSummary || productsResult.partialSummary;

  return applySupabaseCookies(
    noStoreJson(
      buildAdminUsersOverview({
        authUsers,
        profiles,
        athleteProfiles,
        entitlements,
        products: productsResult.products,
        activityRows,
        query,
        partialSummary,
        warnings: uniqueWarnings(warnings),
        allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
      })
    )
  );
}
