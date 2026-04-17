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
        <div className="space-y-8">
          <section>
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <BrandImage
                  asset={BRAND_USAGE.heroLockup}
                  priority
                  className="h-8 w-auto sm:h-10"
                  sizes="(max-width: 640px) 240px, 360px"
                />

                <div className="mt-6 max-w-[34rem] [@media(max-height:820px)]:mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    Adult freestyle
                  </p>
                  <h1 className="mt-3 max-w-[13ch] text-[30px] font-semibold leading-[1.02] text-slate-900 sm:max-w-[12ch] sm:text-[40px] sm:leading-[1.02]">
                    Learn freestyle without the pressure.
                  </h1>
                  <p className="mt-4 max-w-[31ch] text-[16px] leading-7 text-slate-700 sm:max-w-[34ch] sm:text-[17px]">
                    Short lessons, calm practice structure, and optional feedback when you want it.
                  </p>
                </div>
              </div>

              <div className="flex justify-start sm:justify-end">
                <BrandImage
                  asset={BRAND_USAGE.heroTagline}
                  decorative
                  className="hidden h-20 w-auto sm:block sm:h-24"
                  sizes="(max-width: 640px) 140px, 180px"
                />
              </div>
            </div>
          </section>

          <section className="border-t border-blue-100/70 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <BrandImage
                asset={BRAND_USAGE.methodLockup}
                decorative
                className="h-5 w-auto sm:h-6"
                sizes="(max-width: 640px) 180px, 240px"
              />

              <p className="max-w-[35ch] text-sm leading-6 text-slate-600 sm:text-right">
                Build one skill at a time with short lessons, clear pool sessions, and optional
                feedback when useful.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3">
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
                subtitle="Questions, requests, and preview updates"
                href="/contact"
                variant="secondary"
                compact
              />
            </div>

            <div className="mt-4 flex items-center justify-start sm:justify-center">
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
          </section>
        </div>
      </PageTemplate>
    </SiteChrome>
  );
}
