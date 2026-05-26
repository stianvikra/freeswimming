import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import TodayTabsPanel from "@/components/my-library/TodayTabsPanel";
import type { DrylandLibrarySnapshot } from "@/lib/dryland/shared";
import type { HabitSnapshot } from "@/lib/habits/shared";

type Props = {
  drylandLibrary: Pick<
    DrylandLibrarySnapshot,
    "microPlan" | "microPlanLoadError" | "microPlanSchemaReady" | "recentSessions"
  >;
  habitSnapshot: HabitSnapshot;
  nowIso: string;
};

const quietActionClass =
  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/75 px-4 text-sm font-semibold text-[color:var(--fs-color-ink)] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

export default function MyLibraryRoutinesWorkspace({
  drylandLibrary,
  habitSnapshot,
  nowIso,
}: Props) {
  return (
    <SiteChrome>
      <section
        data-testid="my-library-routines-workspace"
        className="mx-auto min-h-screen w-full max-w-[1040px] px-4 pt-24 pb-20 sm:px-6 sm:pt-28"
      >
        <header className="border-b border-[color:var(--fs-border-brand)] pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
                My Library
              </p>
              <h1
                id="my-library-routines-page-heading"
                className="mt-2 text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]"
              >
                My Routines
              </h1>
            </div>
            <Link href="/my-library" className={quietActionClass}>
              Back to My Library
            </Link>
          </div>
        </header>

        <div className="mt-6">
          <TodayTabsPanel
            drylandLibrary={drylandLibrary}
            habitSnapshot={habitSnapshot}
            nowIso={nowIso}
            headingId="my-library-routines-page-heading"
            showHeader={false}
          />
        </div>
      </section>
    </SiteChrome>
  );
}
