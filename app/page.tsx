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

const homeSecondaryActionClass =
  "fs-cta-secondary inline-flex min-h-10 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

function RoutineQuickActionLink({ action }: { action: TodayRoutineQuickAction }) {
  return (
    <PressLink
      tier="cta"
      href={action.href}
      data-testid={`home-routine-action-${action.id}`}
      aria-label={`${action.title}: ${action.subtitle}`}
      className="fs-library-card fs-library-card-muted group relative flex min-h-[68px] min-w-0 items-center justify-center px-3 text-center transition-colors hover:bg-white active:bg-slate-50 sm:min-h-[72px] sm:px-4"
    >
      <span className="flex min-w-0 flex-col items-center justify-center">
        <span className="max-w-full truncate text-[14px] leading-tight font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[15px]">
          {action.title}
        </span>
        <span className="mt-1 max-w-full truncate text-[12px] leading-snug font-medium text-[color:var(--fs-color-muted)] sm:text-[13px]">
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
                data-testid="home-auth-link"
                className={homeSecondaryActionClass}
              >
                {authLabel}
              </PressLink>
              {showDashboardCta ? (
                <PressLink
                  tier="nav"
                  href="/admin"
                  data-testid="home-admin-link"
                  className={`${homeSecondaryActionClass} border-[color:var(--fs-border-brand)] bg-[color:var(--fs-color-brand-50)] text-[color:var(--fs-color-brand-700)] hover:bg-white`}
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
