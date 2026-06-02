import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import GoalsHub from "@/components/my-library/goals/GoalsHub";
import { getMobileActionGroupClass, mobileActionItemClass } from "@/components/ui/actionLayout";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";
import { GOALS_ACTIVE_LIMIT, GOAL_TEMPLATES } from "@/lib/goals/mvp";
import { loadGoalViews } from "@/lib/goals/server";

export const dynamic = "force-dynamic";

const routeActionClass =
  "fs-cta-secondary inline-flex min-h-11 shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

export default async function MyLibraryGoalsPage() {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Fgoals");
  }

  const initialGoals = await loadGoalViews(supabase, user.id);

  return (
    <SiteChrome>
      <section
        data-testid="goals-workspace"
        className="mx-auto min-h-screen w-full max-w-[1040px] px-4 pt-24 pb-20 sm:px-6 sm:pt-28"
      >
        <header className="border-b border-[color:var(--fs-border-brand)] pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
                My Library
              </p>
              <h1 className="mt-2 text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]">
                Goals
              </h1>
              <p className="mt-3 max-w-[54ch] text-sm leading-6 text-[color:var(--fs-color-muted)]">
                Track current swim targets and take the next action.
              </p>
            </div>
            <div data-testid="goals-route-actions" className={getMobileActionGroupClass(1)}>
              <Link href="/my-library" className={`${routeActionClass} ${mobileActionItemClass}`}>
                Back to My Library
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-6 sm:mt-8">
          <GoalsHub
            initialGoals={initialGoals}
            templates={GOAL_TEMPLATES}
            activeLimit={GOALS_ACTIVE_LIMIT}
          />
        </div>
      </section>
    </SiteChrome>
  );
}
