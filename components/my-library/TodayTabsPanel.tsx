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
};

function TodayPanelContent({ state }: { state: TodaySurfaceState }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-slate-950">{state.title}</h3>
        <p className="mt-1 text-sm text-slate-600">
          {state.progressLabel} · {state.progressPercent}%
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <Link
          href={state.editHref}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
        >
          Edit
        </Link>
        <Link
          href={state.href}
          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
        >
          {state.actionLabel}
        </Link>
      </div>
    </div>
  );
}

export default function TodayTabsPanel({ drylandLibrary, habitSnapshot, nowIso }: Props) {
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
      aria-labelledby="my-library-routines-heading"
      data-testid="my-library-today-tabs"
      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">Routines</p>
          <h2
            id="my-library-routines-heading"
            className="mt-2 text-lg font-semibold text-slate-900"
          >
            My routines
          </h2>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Routine views"
        className="mt-5 inline-flex rounded-full border border-slate-200 bg-white p-1"
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
              className={`inline-flex min-h-9 items-center justify-center rounded-full px-3 text-sm font-semibold transition sm:px-4 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
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
        className="mt-5 rounded-2xl border border-slate-200 bg-white/90 p-4"
      >
        <TodayPanelContent state={activeState} />
      </div>
    </section>
  );
}
