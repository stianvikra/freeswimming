"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bubbles, CheckCircle2, ListChecks } from "lucide-react";
import {
  buildTodayBubblesState,
  buildTodayHabitsState,
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

const TONE_BY_STATE: Record<TodaySurfaceState["state"], string> = {
  ready: "border-blue-200 bg-blue-50 text-blue-800",
  complete: "border-emerald-200 bg-emerald-50 text-emerald-800",
  setup: "border-slate-200 bg-slate-50 text-slate-700",
  paused: "border-amber-200 bg-amber-50 text-amber-800",
  syncing: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
};

function getProgressColor(state: TodaySurfaceState["state"]) {
  if (state === "complete") return "bg-emerald-500";
  if (state === "paused" || state === "syncing") return "bg-amber-500";
  if (state === "error") return "bg-rose-500";
  return "bg-blue-600";
}

function renderProgress(state: TodaySurfaceState) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{state.progressLabel}</p>
        <p className="text-sm text-slate-600">{state.progressPercent}%</p>
      </div>
      <div
        role="progressbar"
        aria-label={`${state.eyebrow} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={state.progressPercent}
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className={`h-full rounded-full transition-[width] ${getProgressColor(state.state)}`}
          style={{ width: `${state.progressPercent}%` }}
        />
      </div>
    </div>
  );
}

function TodayPanelContent({
  state,
  icon,
}: {
  state: TodaySurfaceState;
  icon: "bubbles" | "habits";
}) {
  const Icon = icon === "bubbles" ? Bubbles : ListChecks;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex min-h-8 items-center gap-2 rounded-full border px-3 text-xs font-semibold tracking-wide uppercase ${TONE_BY_STATE[state.state]}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {state.eyebrow}
          </span>
        </div>
        <h3 className="mt-3 text-xl font-semibold text-slate-950">{state.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{state.detail}</p>
        <div className="mt-4">
          <Link
            href={state.href}
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
          >
            {state.actionLabel}
          </Link>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        {renderProgress(state)}
      </div>
    </div>
  );
}

export default function TodayTabsPanel({ drylandLibrary, habitSnapshot, nowIso }: Props) {
  const [activeTab, setActiveTab] = useState<TodaySurfaceTabId>("bubbles");
  const now = useMemo(() => {
    const parsed = new Date(nowIso);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [nowIso]);
  const bubblesState = useMemo(
    () => buildTodayBubblesState(drylandLibrary, now),
    [drylandLibrary, now]
  );
  const habitsState = useMemo(() => buildTodayHabitsState(habitSnapshot), [habitSnapshot]);
  const activeState = activeTab === "bubbles" ? bubblesState : habitsState;

  return (
    <section
      aria-labelledby="my-library-today-heading"
      data-testid="my-library-today-tabs"
      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">Today</p>
          <h2 id="my-library-today-heading" className="mt-2 text-lg font-semibold text-slate-900">
            Daily work
          </h2>
          <p className="mt-2 text-sm text-slate-600">Perfect Day: {habitsState.progressLabel}</p>
        </div>
        <span
          className={`inline-flex min-h-8 items-center gap-2 rounded-full border px-3 text-xs font-semibold tracking-wide uppercase ${TONE_BY_STATE[habitsState.state]}`}
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {habitsState.title}
        </span>
      </div>

      <div
        role="tablist"
        aria-label="Today views"
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
              className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 text-sm font-semibold transition ${
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
        <TodayPanelContent state={activeState} icon={activeTab} />
      </div>
    </section>
  );
}
