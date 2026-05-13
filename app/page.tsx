import BrandImage from "@/components/brand/BrandImage";
import SiteChrome from "@/components/SiteChrome";
import PageTemplate from "@/components/PageTemplate";
import ActionButton from "@/components/ActionButton";
import PressLink from "@/components/ui/PressLink";
import { BRAND_USAGE } from "@/lib/brand";
import { resolveAdminRoleFromSupabase } from "@/lib/admin/server";
import { loadDrylandLibrarySnapshot } from "@/lib/dryland/server";
import { loadHabitSnapshot } from "@/lib/habits/server";
import {
  buildTodayRoutineQuickActions,
  type TodayRoutineQuickAction,
} from "@/lib/my-library/today";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function RoutineQuickActionLink({ action }: { action: TodayRoutineQuickAction }) {
  return (
    <PressLink
      tier="cta"
      href={action.href}
      data-testid={`home-routine-action-${action.id}`}
      aria-label={`${action.title}: ${action.subtitle}`}
      className="group relative flex min-h-[70px] min-w-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/92 px-3 text-center text-slate-900 shadow-[0_10px_26px_rgba(15,23,42,0.085)] backdrop-blur transition hover:bg-white active:bg-slate-50 sm:min-h-[74px] sm:px-4"
    >
      <span className="flex min-w-0 flex-col items-center justify-center">
        <span className="max-w-full truncate text-[14px] leading-tight font-semibold sm:text-[15px]">
          {action.title}
        </span>
        <span className="mt-1 max-w-full truncate text-[12px] leading-snug font-medium text-slate-600 sm:text-[13px]">
          {action.subtitle}
        </span>
      </span>
    </PressLink>
  );
}

export default async function HomePage() {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  let showDashboardCta = false;
  let routineQuickActions: TodayRoutineQuickAction[] = [];
  if (supabase && user) {
    const [adminRole, drylandLibrarySnapshot, habitSnapshot] = await Promise.all([
      resolveAdminRoleFromSupabase(supabase, user, {
        allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
      }),
      loadDrylandLibrarySnapshot(supabase, user.id, null),
      loadHabitSnapshot(supabase, user.id),
    ]);
    showDashboardCta = Boolean(adminRole);
    routineQuickActions = buildTodayRoutineQuickActions(
      {
        microPlan: drylandLibrarySnapshot.microPlan,
        microPlanLoadError: drylandLibrarySnapshot.microPlanLoadError,
        microPlanSchemaReady: drylandLibrarySnapshot.microPlanSchemaReady,
        recentSessions: drylandLibrarySnapshot.recentSessions,
      },
      habitSnapshot
    );
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
              <div className="grid grid-cols-2 gap-2.5" aria-label="Routine quick actions">
                {routineQuickActions.map((action) => (
                  <RoutineQuickActionLink key={action.id} action={action} />
                ))}
              </div>
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
