import { redirect } from "next/navigation";
import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import TrackCheckoutCancel from "@/components/analytics/TrackCheckoutCancel";
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signOutFromLibrary } from "@/app/my-library/actions";
import CheckoutButton from "@/components/my-library/CheckoutButton";
import ContinueCourseCard from "@/components/my-library/ContinueCourseCard";
import LibrarySectionTabs from "@/components/my-library/LibrarySectionTabs";
import MyLibraryNewContentNotice from "@/components/my-library/MyLibraryNewContentNotice";
import PortalButton from "@/components/my-library/PortalButton";
import DownloadResendForm from "@/components/commerce/DownloadResendForm";
import { getCatalogProductsSafe, type CatalogProduct } from "@/lib/commerce/catalog";
import { buildCatalogOverridesFromRows } from "@/lib/commerce/catalog-overrides";
import { buildLibrarySections } from "@/lib/commerce/library";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { attachGuestEntitlementsByEmail } from "@/lib/commerce/entitlements";

export const dynamic = "force-dynamic";

function getKindCopy(product: CatalogProduct) {
  if (product.kind === "analysis") {
    return "Personal video feedback and tailored focus points.";
  }

  return "Structured training plan with practical guidance.";
}

export default async function MyLibraryPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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

  const { count: activeGoalCount, error: activeGoalCountError } = await supabase
    .from("goals")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ["active", "on_track", "at_risk"]);

  if (activeGoalCountError) {
    console.error("[MyLibrary] Could not load active goal count", activeGoalCountError);
  }

  const claimQuery = new URLSearchParams({ next: "/my-library" });
  if (user.email) {
    claimQuery.set("email", user.email);
  }
  const claimHref = `/claim?${claimQuery.toString()}`;

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pb-20 pt-28">
        <TrackEventOnMount
          eventName="library_viewed"
          payload={{
            ownedCount: sections.owned.length + sections.unknownOwnedProductIds.length,
            exploreCount: sections.explore.length,
          }}
        />
        {sections.explore.length > 0 ? (
          <TrackEventOnMount
            eventName="upsell_presented"
            payload={{
              surface: "library_explore",
              offerCount: sections.explore.length,
            }}
          />
        ) : null}
        <TrackCheckoutCancel surface="my_library" />
        <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.14)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Library</h1>
              <p className="mt-2 text-sm text-slate-600">Signed in as {user.email}</p>
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <PortalButton returnPath="/my-library" />
              <form action={signOutFromLibrary}>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>

          <div className="mt-8 space-y-8">
            <ContinueCourseCard />
            <MyLibraryNewContentNotice userId={user.id} />
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Goals</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {(activeGoalCount ?? 0) > 0
                      ? `${activeGoalCount} active goal${activeGoalCount === 1 ? "" : "s"} in progress.`
                      : "Set your first measurable swim goal and keep momentum with clear next actions."}
                  </p>
                </div>
                <Link
                  href="/my-library/goals"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
                >
                  Open goals hub
                </Link>
              </div>
            </section>
            <LibrarySectionTabs showExploreTab={sections.explore.length > 0} />

            <div id="my-library-owned" className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Owned</h2>

              {sections.owned.length === 0 && sections.unknownOwnedProductIds.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6">
                  <p className="text-sm text-slate-600">
                    You have no purchased items yet. Browse available options below.
                  </p>
                  <div className="mt-4 border-t border-slate-200/80 pt-4">
                    <p className="text-xs leading-relaxed text-slate-600">
                      Already bought with another email? Request an access link and we&apos;ll
                      restore your library when you sign in.
                    </p>
                    <DownloadResendForm
                      initialEmail={user.email ?? ""}
                      nextPath="/my-library"
                      source="library_recovery"
                      className="mt-3"
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                {sections.owned.map((product) => (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Owned
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-slate-900">{product.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{getKindCopy(product)}</p>
                    {!product.active ? (
                      <p className="mt-2 text-xs text-amber-700">
                        This item remains available in your library, but it is currently hidden from
                        new sales.
                      </p>
                    ) : null}
                    <div className="mt-4">
                      <Link
                        href={`/my-library/item/${product.slug}`}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Open
                      </Link>
                    </div>
                  </article>
                ))}

                {sections.unknownOwnedProductIds.map((productId) => (
                  <article
                    key={productId}
                    className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                      Owned
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-slate-900">Purchased item</h3>
                    <p className="mt-2 text-xs text-slate-500">Product id: {productId}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      This item is owned but not yet mapped in your current catalog view.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={claimHref}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Email me access link
                      </Link>
                      <Link
                        href="/contact"
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Contact support
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div id="my-library-explore" className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Explore More</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {sections.explore.map((product) => (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <h3 className="text-base font-semibold text-slate-900">{product.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{getKindCopy(product)}</p>
                    <div className="mt-4">
                      <CheckoutButton productId={product.id} analyticsSource="library_explore" />
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-600">
              Privacy and cookie details:{" "}
              <Link href="/privacy" className="font-semibold text-blue-700 hover:text-blue-600">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/cookies" className="font-semibold text-blue-700 hover:text-blue-600">
                Cookie Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
