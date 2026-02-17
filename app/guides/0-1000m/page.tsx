import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import GuidePdfDownloadButton from "@/components/guides/GuidePdfDownloadButton";
import Guide0To1000Tracker from "@/components/guides/Guide0To1000Tracker";
import { attachGuestEntitlementsByEmail } from "@/lib/commerce/entitlements";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  GUIDE_0_TO_1000M_PDF_DOWNLOAD_FILENAME,
  GUIDE_0_TO_1000M_PRODUCT_ID,
  GUIDE_0_TO_1000M_SESSIONS,
  GUIDE_0_TO_1000M_SLUG,
} from "@/lib/guides/guide-0-1000m";

export const dynamic = "force-dynamic";

export default async function Guide0To1000Page() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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
        <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pb-20 pt-28">
          <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-8 shadow-[0_14px_45px_rgba(15,23,42,0.10)]">
            <h1 className="text-3xl font-bold text-slate-900">Guide access required</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              This interactive plan appears when `0-1000m guide` is in your library.
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

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pb-20 pt-28">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4">
          <p className="max-w-[600px] text-sm text-slate-600">
            Keep training in the interactive tracker and download the PDF whenever you need an
            offline version.
          </p>
          <div className="flex flex-wrap items-start gap-2">
            <GuidePdfDownloadButton
              apiPath="/api/guides/0-1000m/pdf"
              fallbackFileName={GUIDE_0_TO_1000M_PDF_DOWNLOAD_FILENAME}
            />
            <Link
              href="/my-library"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to My Library
            </Link>
          </div>
        </div>
        <Guide0To1000Tracker
          guideSlug={GUIDE_0_TO_1000M_SLUG}
          sessions={GUIDE_0_TO_1000M_SESSIONS}
        />
      </section>
    </SiteChrome>
  );
}
