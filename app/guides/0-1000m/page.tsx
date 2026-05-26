import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import GuideAccessRequiredState from "@/components/guides/GuideAccessRequiredState";
import GuidePdfDownloadButton from "@/components/guides/GuidePdfDownloadButton";
import Guide0To1000Tracker from "@/components/guides/Guide0To1000Tracker";
import {
  guideTrackerMutedPanelClass,
  guideTrackerSecondaryActionClass,
} from "@/components/guides/guideTrackerShellStyles";
import { loadPublishedGuide0To1000Sessions } from "@/lib/admin/content-published";
import { attachGuestEntitlementsByEmail } from "@/lib/commerce/entitlements";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";
import {
  GUIDE_0_TO_1000M_PDF_DOWNLOAD_FILENAME,
  GUIDE_0_TO_1000M_PRODUCT_ID,
  GUIDE_0_TO_1000M_SLUG,
} from "@/lib/guides/guide-0-1000m";

export const dynamic = "force-dynamic";

export default async function Guide0To1000Page() {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect("/auth/sign-in?next=%2Fguides%2F0-1000m");
  }

  if (user.email) {
    try {
      const adminSupabase = createAdminSupabaseClient();
      await attachGuestEntitlementsByEmail(adminSupabase, user.id, user.email);
    } catch (error) {
      console.error("[Guide0To1000] Could not attach guest entitlements", error);
    }
  }

  const { data: entitlement, error } = await supabase
    .from("entitlements")
    .select("id")
    .eq("product_id", GUIDE_0_TO_1000M_PRODUCT_ID)
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[Guide0To1000] Could not load entitlement", error);
  }

  if (!entitlement) {
    return (
      <SiteChrome>
        <GuideAccessRequiredState
          guideLabel="0-1000m guide"
          description="Add 0-1000m guide to your library to open the interactive plan and download the offline PDF."
        />
      </SiteChrome>
    );
  }

  const sessions = await loadPublishedGuide0To1000Sessions();

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pt-28 pb-20">
        <div
          className={`${guideTrackerMutedPanelClass} mb-4 flex flex-wrap items-start justify-between gap-3`}
          data-testid="guide-0-1000m-route-actions"
        >
          <p className="max-w-[600px] text-sm text-slate-600">
            Keep training in the interactive tracker and download the PDF whenever you need an
            offline version.
          </p>
          <div className="flex flex-wrap items-start gap-2">
            <GuidePdfDownloadButton
              apiPath="/api/guides/0-1000m/pdf"
              fallbackFileName={GUIDE_0_TO_1000M_PDF_DOWNLOAD_FILENAME}
            />
            <Link href="/my-library" className={guideTrackerSecondaryActionClass}>
              Back to My Library
            </Link>
          </div>
        </div>
        <Guide0To1000Tracker guideSlug={GUIDE_0_TO_1000M_SLUG} sessions={sessions} />
      </section>
    </SiteChrome>
  );
}
