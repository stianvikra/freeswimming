import { redirect } from "next/navigation";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";
import MyLibraryHub from "@/components/my-library/MyLibraryHub";
import { getCatalogProductsSafe } from "@/lib/commerce/catalog";
import { buildCatalogOverridesFromRows } from "@/lib/commerce/catalog-overrides";
import { buildLibrarySections } from "@/lib/commerce/library";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { attachGuestEntitlementsByEmail } from "@/lib/commerce/entitlements";
import { loadProgramLibrarySnapshot } from "@/lib/programs/server";
import { loadWorkoutLibrarySnapshot } from "@/lib/workouts/server";
import { loadDrylandLibrarySnapshot } from "@/lib/dryland/server";

export const dynamic = "force-dynamic";

export default async function MyLibraryPage() {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect("/auth/sign-in?next=%2Fmy-library");
  }

  if (user.email) {
    try {
      const adminSupabase = createAdminSupabaseClient();
      await attachGuestEntitlementsByEmail(adminSupabase, user.id, user.email);
    } catch (error) {
      console.error("[MyLibrary] Could not attach guest entitlements", error);
    }
  }

  const { data: entitlements, error: entitlementsError } = await supabase
    .from("entitlements")
    .select("product_id")
    .order("granted_at", { ascending: false });

  if (entitlementsError) {
    console.error("[MyLibrary] Could not load entitlements", entitlementsError);
  }

  const { data: productRows, error: productRowsError } = await supabase
    .from("products")
    .select("id, slug, title, kind, active")
    .order("created_at", { ascending: true });

  if (productRowsError) {
    console.error("[MyLibrary] Could not load product catalog overrides", productRowsError);
  }

  const catalogOverrides = buildCatalogOverridesFromRows(productRows ?? []);
  const catalogProducts = getCatalogProductsSafe(process.env, catalogOverrides);
  const sections = buildLibrarySections(
    catalogProducts,
    (entitlements ?? []).map((entitlement) => entitlement.product_id)
  );

  const { error: activeGoalCountError } = await supabase
    .from("goals")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ["active", "on_track", "at_risk"]);

  if (activeGoalCountError) {
    console.error("[MyLibrary] Could not load active goal count", activeGoalCountError);
  }

  const [workoutLibrarySnapshot, programLibrarySnapshot, drylandLibrarySnapshot] =
    await Promise.all([
      loadWorkoutLibrarySnapshot(supabase, user.id, null),
      loadProgramLibrarySnapshot(supabase, user.id, null),
      loadDrylandLibrarySnapshot(supabase, user.id, null),
    ]);

  const claimQuery = new URLSearchParams({ next: "/my-library" });
  if (user.email) {
    claimQuery.set("email", user.email);
  }
  const claimHref = `/claim?${claimQuery.toString()}`;

  return (
    <MyLibraryHub
      userId={user.id}
      userEmail={user.email ?? null}
      sections={sections}
      activeGoalCountError={Boolean(activeGoalCountError)}
      workoutLibrarySnapshot={workoutLibrarySnapshot}
      programLibrarySnapshot={programLibrarySnapshot}
      drylandLibrarySnapshot={drylandLibrarySnapshot}
      claimHref={claimHref}
    />
  );
}
