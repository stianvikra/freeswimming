import BrandImage from "@/components/brand/BrandImage";
import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ActionButton from "@/components/ActionButton";
import PressLink from "@/components/ui/PressLink";
import { BRAND_USAGE } from "@/lib/brand";
import { resolveAdminRoleFromSupabase } from "@/lib/admin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let showDashboardCta = false;
  if (user) {
    const adminRole = await resolveAdminRoleFromSupabase(supabase, user, {
      allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
    });
    showDashboardCta = Boolean(adminRole);
  }

  const authHref = user ? "/my-library" : "/auth/sign-in?next=%2Fmy-library";
  const authLabel = user ? "Open My Library" : "Log in to My Library";

  return (
    <SiteChrome>
      <PageTemplate showBack={false} withBottomSafeArea={false} topInset="tight">
        <div className="space-y-5 sm:space-y-6">
          <section className="flex flex-col items-center space-y-4 text-center sm:items-start sm:space-y-5 sm:text-left">
            <BrandImage
              asset={BRAND_USAGE.methodLockup}
              priority
              className="mx-auto h-9 w-auto sm:mx-0 sm:h-11"
              sizes="(max-width: 640px) 260px, 340px"
            />

            <div className="mx-auto max-w-[34rem] sm:mx-0">
              <p className="text-[15px] font-medium leading-6 text-slate-700 sm:text-[16px]">
                Olympic dreams? <span className="font-semibold text-slate-900">Wrong channel.</span>
              </p>

              <h1 className="mx-auto mt-2 max-w-[13ch] text-[30px] font-semibold leading-[1.02] text-slate-900 sm:mx-0 sm:mt-2.5 sm:text-[40px]">
                Adult learner?
              </h1>

              <p className="mx-auto mt-2 max-w-[34ch] text-[15px] leading-6 text-slate-700 sm:mx-0 sm:max-w-[32ch] sm:text-[17px] sm:leading-7">
                You&apos;re exactly where you should be.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <ActionButton
              title="Free course"
              subtitle="Start swimming today"
              note="No signup. No paywall. Just swim."
              href="/course"
              variant="primary"
              compact
            />

            <ActionButton
              title="Swim programs"
              subtitle="Structured plans and PDFs"
              href="/programs"
              variant="secondary"
              compact
            />

            <ActionButton
              title="Video analysis"
              subtitle="Technique feedback when useful"
              href="/analysis"
              variant="secondary"
              compact
            />

            <ActionButton
              title="Contact"
              subtitle="Questions, requests, and early access"
              href="/contact"
              variant="secondary"
              compact
            />
          </section>

          <div className="flex items-center justify-center">
            <div className="flex flex-wrap items-center gap-2 sm:justify-center">
              <PressLink
                tier="nav"
                href={authHref}
                className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                {authLabel}
              </PressLink>
              {showDashboardCta ? (
                <PressLink
                  tier="nav"
                  href="/admin"
                  className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-blue-200/80 bg-blue-50/90 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-100/85 active:bg-blue-200/75"
                >
                  Open Dashboard
                </PressLink>
              ) : null}
            </div>
          </div>
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}
