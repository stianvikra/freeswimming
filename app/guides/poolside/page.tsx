import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import GuideAccessRequiredState from "@/components/guides/GuideAccessRequiredState";
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
        <GuideAccessRequiredState
          guideLabel="Poolside guide"
          description="Add Poolside guide to your library to open the interactive poolside drills and download the offline PDF."
        />
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
