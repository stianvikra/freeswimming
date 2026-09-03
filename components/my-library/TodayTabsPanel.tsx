"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  buildTodayHabitsState,
  buildTodayMicroSessionsState,
  TODAY_SURFACE_TABS,
  type TodaySurfaceState,
  type TodaySurfaceTabId,
} from "@/lib/my-library/today";
import type { DrylandLibrarySnapshot } from "@/lib/dryland/shared";
import type { HabitSnapshot } from "@/lib/habits/shared";

type Props = {
  drylandLibrary: Pick<
    DrylandLibrarySnapshot,
    "microPlan" | "microPlanLoadError" | "microPlanSchemaReady" | "recentSessions"
  >;
  habitSnapshot: HabitSnapshot;
  nowIso: string;
  headingId?: string;
  showHeader?: boolean;
};

const cardHeadingClass = "text-base font-semibold text-[color:var(--fs-color-ink-strong)]";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";
const primaryActionClass =
  "fs-cta-primary inline-flex min-h-11 shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const secondaryActionClass =
  "fs-cta-secondary inline-flex min-h-11 shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

function TodayPanelContent({ state }: { state: TodaySurfaceState }) {
  const isReview = state.state === "review";
  const showsDetail =
    isReview || state.state === "not_tracked" || state.state === "tracking_incomplete";

  return (
    <div className="flex min-h-[88px] flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h3 className={cardHeadingClass}>{state.title}</h3>
        <p className={mutedTextClass} role={isReview ? "status" : undefined}>
          {state.progressLabel}
          {state.progressPercent === null ? null : ` · ${state.progressPercent}%`}
        </p>
        {showsDetail ? <p className={`mt-1 ${mutedTextClass}`}>{state.detail}</p> : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <Link href={state.href} className={primaryActionClass}>
          {state.actionLabel}
        </Link>
        {state.editHref ? (
          <Link href={state.editHref} className={secondaryActionClass}>
            Edit
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function TodayTabsPanel({
  drylandLibrary,
  habitSnapshot,
  nowIso,
  headingId = "my-library-routines-heading",
  showHeader = true,
}: Props) {
  const [activeTab, setActiveTab] = useState<TodaySurfaceTabId>("micro-sessions");
  const now = useMemo(() => {
    const parsed = new Date(nowIso);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [nowIso]);
  const microSessionsState = useMemo(
    () => buildTodayMicroSessionsState(drylandLibrary, now),
    [drylandLibrary, now]
  );
  const habitsState = useMemo(() => buildTodayHabitsState(habitSnapshot), [habitSnapshot]);
  const activeState = activeTab === "micro-sessions" ? microSessionsState : habitsState;

  return (
    <section
      aria-labelledby={headingId}
      data-testid="my-library-today-tabs"
      data-routine-state={activeState.state}
      data-routine-tab={activeTab}
      className="fs-library-card p-4 sm:p-5"
    >
      {showHeader ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
              Routines
            </p>
            <h2
              id={headingId}
              className="mt-2 text-lg font-semibold text-[color:var(--fs-color-ink-strong)]"
            >
              My Routines
            </h2>
          </div>
        </div>
      ) : null}

      <div
        role="tablist"
        aria-label="Routine views"
        className="mt-5 grid w-full max-w-[380px] grid-cols-2 gap-1 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/75 p-1 sm:inline-grid"
      >
        {TODAY_SURFACE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`my-library-today-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`my-library-today-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex min-h-10 items-center justify-center rounded-[var(--fs-radius-control)] px-3 text-sm font-semibold transition-colors sm:px-4 ${
                isActive
                  ? "bg-[color:var(--fs-color-brand-700)] text-white shadow-sm"
                  : "text-[color:var(--fs-color-muted)] hover:bg-[color:var(--fs-color-brand-50)] hover:text-[color:var(--fs-color-brand-700)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        id={`my-library-today-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`my-library-today-tab-${activeTab}`}
        className="mt-5 border-t border-[color:var(--fs-border-soft)] pt-5"
      >
        <TodayPanelContent state={activeState} />
      </div>
    </section>
  );
}
