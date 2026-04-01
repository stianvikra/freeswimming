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
      <PageTemplate showBack={false} withBottomSafeArea={false} topInset="compact">
        <div className="relative overflow-hidden rounded-[24px] border border-blue-100/70 bg-[radial-gradient(760px_280px_at_12%_0%,rgba(87,125,255,0.16),rgba(255,255,255,0)_66%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.82))] p-4 shadow-[0_16px_36px_rgba(15,23,42,0.08)] sm:p-6 [@media(max-height:820px)]:p-4 [@media(min-height:880px)]:p-5">
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 text-center sm:text-left">
              <BrandImage
                asset={BRAND_USAGE.heroLockup}
                priority
                className="mx-auto h-8 w-auto sm:mx-0 sm:h-10"
                sizes="(max-width: 640px) 240px, 360px"
              />

              <div className="mt-4 [@media(max-height:820px)]:mt-3">
                <p className="text-[15px] font-medium leading-6 text-slate-700 sm:text-[16px]">
                  Olympic dreams?{" "}
                  <span className="font-semibold text-slate-900">Wrong channel.</span>
                </p>

                <h1 className="mt-2.5 text-[28px] font-semibold leading-[1.05] tracking-[-0.03em] text-slate-900 sm:text-[34px] [@media(max-height:820px)]:mt-2">
                  Adult learner?
                </h1>

                <p className="mt-2 max-w-[34ch] text-[16px] leading-7 text-slate-700 sm:text-[17px]">
                  You&apos;re exactly where you should be.
                </p>
              </div>
            </div>

            <div className="flex justify-center sm:justify-end">
              <BrandImage
                asset={BRAND_USAGE.heroTagline}
                decorative
                className="h-24 w-auto sm:h-28"
                sizes="(max-width: 640px) 140px, 180px"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-[24px] border border-blue-100/60 bg-[radial-gradient(560px_220px_at_15%_0%,rgba(99,168,255,0.10),rgba(255,255,255,0)_66%),rgba(255,255,255,0.76)] p-3.5 shadow-[0_12px_30px_rgba(15,23,42,0.07)] sm:p-4 [@media(max-height:820px)]:mt-3 [@media(max-height:820px)]:p-3 [@media(min-height:880px)]:mt-2.5">
          <div className="bg-white/78 rounded-[20px] border border-blue-100/70 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
                  Method
                </p>
                <BrandImage
                  asset={BRAND_USAGE.methodLockup}
                  decorative
                  className="mt-2 h-5 w-auto sm:h-6"
                  sizes="(max-width: 640px) 180px, 240px"
                />
              </div>
              <p className="max-w-[34ch] text-sm leading-6 text-slate-600 sm:text-right">
                Calm skill-building, clear practice structure, and no performance theater.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <ActionButton
              title="FREE COURSE"
              subtitle="Start swimming today"
              note="No signup. No paywall. Just swim."
              href="/course"
              variant="primary"
              compact
            />

            <ActionButton
              title="SWIM PROGRAMS"
              subtitle="Structured plans & PDFs"
              href="/programs"
              variant="secondary"
              compact
            />

            <ActionButton
              title="VIDEO ANALYSIS"
              subtitle="Personal feedback — optional"
              href="/analysis"
              variant="secondary"
              compact
            />

            <ActionButton
              title="CONTACT"
              subtitle="Help us help you swim better"
              href="/contact"
              variant="secondary"
              compact
            />
          </div>

          <div className="mt-3 flex items-center justify-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
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
