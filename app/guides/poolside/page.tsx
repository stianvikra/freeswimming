import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import GuidePdfDownloadButton from "@/components/guides/GuidePdfDownloadButton";
import PoolsideGuideTracker from "@/components/guides/PoolsideGuideTracker";
import { loadPublishedPoolsideDrills } from "@/lib/admin/content-published";
import { attachGuestEntitlementsByEmail } from "@/lib/commerce/entitlements";
import {
  GUIDE_POOLSIDE_PDF_DOWNLOAD_FILENAME,
  GUIDE_POOLSIDE_PRODUCT_ID,
  GUIDE_POOLSIDE_SLUG,
} from "@/lib/guides/guide-poolside";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function GuidePoolsidePage() {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect("/auth/sign-in?next=%2Fguides%2Fpoolside");
  }

  if (user.email) {
    try {
      const adminSupabase = createAdminSupabaseClient();
      await attachGuestEntitlementsByEmail(adminSupabase, user.id, user.email);
    } catch (error) {
      console.error("[GuidePoolside] Could not attach guest entitlements", error);
    }
  }

  const { data: entitlement, error } = await supabase
    .from("entitlements")
    .select("id")
    .eq("product_id", GUIDE_POOLSIDE_PRODUCT_ID)
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[GuidePoolside] Could not load entitlement", error);
  }

  if (!entitlement) {
    return (
      <SiteChrome>
        <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pt-28 pb-20">
          <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-8 shadow-[0_14px_45px_rgba(15,23,42,0.10)]">
            <h1 className="text-3xl font-bold text-slate-900">Guide access required</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              This interactive poolside guide appears when `Poolside guide` is in your library.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/plans"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                View plans
              </Link>
              <Link
                href="/my-library"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back to My Library
              </Link>
            </div>
          </div>
        </section>
      </SiteChrome>
    );
  }

  const drills = await loadPublishedPoolsideDrills();

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pt-28 pb-20">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4">
          <p className="max-w-[660px] text-sm text-slate-600">
            Open drills one by one in the interactive guide and keep the PDF for offline access at
            the pool.
          </p>
          <div className="flex flex-wrap items-start gap-2">
            <GuidePdfDownloadButton
              apiPath="/api/guides/poolside/pdf"
              fallbackFileName={GUIDE_POOLSIDE_PDF_DOWNLOAD_FILENAME}
            />
            <Link
              href="/my-library"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to My Library
            </Link>
          </div>
        </div>

        <PoolsideGuideTracker guideSlug={GUIDE_POOLSIDE_SLUG} drills={drills} />
      </section>
    </SiteChrome>
  );
}
