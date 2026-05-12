import BrandImage from "@/components/brand/BrandImage";
import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ActionButton from "@/components/ActionButton";
import PressLink from "@/components/ui/PressLink";
import { BRAND_USAGE } from "@/lib/brand";
import { resolveAdminRoleFromSupabase } from "@/lib/admin/server";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  let showDashboardCta = false;
  if (supabase && user) {
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
        <div className="space-y-4 sm:space-y-5">
          <section className="flex flex-col items-center space-y-3 text-center sm:space-y-4">
            <BrandImage
              asset={BRAND_USAGE.methodLockup}
              priority
              className="mx-auto h-9 w-auto sm:h-11"
              sizes="(max-width: 640px) 260px, 340px"
            />

            <div className="mx-auto max-w-[34rem]">
              <p className="text-[15px] leading-6 font-medium text-slate-700 sm:text-[16px]">
                Olympic dreams? <span className="font-semibold text-slate-900">Wrong channel.</span>
              </p>

              <h1 className="mx-auto mt-1.5 max-w-[13ch] text-[30px] leading-[1.02] font-semibold text-slate-900 sm:mt-2 sm:text-[40px]">
                Adult learner?
              </h1>

              <p className="mx-auto mt-1.5 max-w-[34ch] text-[15px] leading-6 text-slate-700 sm:mt-2 sm:max-w-[32ch] sm:text-[17px] sm:leading-7">
                You&apos;re exactly where you should be.
              </p>
            </div>
          </section>

          <section data-testid="home-primary-actions" className="flex flex-col gap-2.5">
            <ActionButton
              title="Free course"
              subtitle="Start swimming today"
              note="No signup. No paywall. Just swim."
              href="/course"
              variant="primary"
              compact
            />

            {user ? (
              <ActionButton
                title="My routines"
                subtitle="Today's habits and micro-sessions"
                href="/my-library#my-library-routines-heading"
                variant="secondary"
                compact
              />
            ) : null}

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
