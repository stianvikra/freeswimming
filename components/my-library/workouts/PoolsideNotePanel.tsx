"use client";

import { useState, type ReactNode } from "react";
import {
  WORKOUT_POOLSIDE_ABBREVIATION_LEGEND,
  type WorkoutPoolsideFocusOption,
} from "@/lib/workouts/shared";

type Props = {
  className?: string;
  testIdPrefix: string;
  swimmerName?: string | null;
  focusOptions: WorkoutPoolsideFocusOption[];
  selectedFocusIds: string[];
  onToggleFocus: (focusId: string) => void;
  actionSlot: ReactNode;
};

export default function PoolsideNotePanel({
  className = "",
  testIdPrefix,
  swimmerName = null,
  focusOptions,
  selectedFocusIds,
  onToggleFocus,
  actionSlot,
}: Props) {
  const [abbreviationsOpen, setAbbreviationsOpen] = useState(false);
  const hasVerboseFocusDescription = focusOptions.some(
    (focus) => (focus.description?.trim().length ?? 0) >= 56
  );
  const prefersStackedLayout =
    focusOptions.length === 0 || focusOptions.length >= 6 || hasVerboseFocusDescription;
  const layoutMode = prefersStackedLayout ? "stacked" : "split";
  const contentLayoutClass = prefersStackedLayout
    ? "mt-5 space-y-5"
    : "mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,1fr)] xl:items-start";
  const focusSectionClass = prefersStackedLayout
    ? "min-w-0 space-y-3"
    : "min-w-0 space-y-3 xl:border-r xl:border-blue-200/70 xl:pr-5";
  const referenceSectionClass = prefersStackedLayout ? "min-w-0" : "min-w-0 xl:pl-5";
  const legendGridClass = prefersStackedLayout
    ? "mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
    : "mt-3 grid gap-2 sm:grid-cols-2";

  return (
    <div
      className={className}
      data-testid={`${testIdPrefix}-panel`}
      data-containment-style={layoutMode}
      data-layout-mode={layoutMode}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Poolside Note
          </p>
          {swimmerName ? (
            <p className="mt-2 text-sm font-medium text-slate-900">Swimmer: {swimmerName}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">{actionSlot}</div>
      </div>

      <div className={contentLayoutClass} data-testid={`${testIdPrefix}-content-layout`}>
        <div className={focusSectionClass}>
          <p className="text-sm font-semibold text-slate-900">Session Focus</p>
          {focusOptions.length > 0 ? (
            <div data-testid={`${testIdPrefix}-focus-list`} className="grid gap-3">
              {focusOptions.map((focus) => (
                <label
                  key={focus.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedFocusIds.includes(focus.id)}
                    onChange={() => onToggleFocus(focus.id)}
                    data-testid={`${testIdPrefix}-focus-${focus.id}`}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-slate-900">{focus.title}</span>
                    {focus.description ? (
                      <span className="mt-1 block text-xs text-slate-500">{focus.description}</span>
                    ) : null}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              No open focuses are available, so the poolside note will only include the workout and
              totals.
            </p>
          )}
        </div>

        <div
          className={referenceSectionClass}
          data-testid={`${testIdPrefix}-reference-panel`}
          data-layout-mode={layoutMode}
        >
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-700">
            <button
              type="button"
              onClick={() => setAbbreviationsOpen((current) => !current)}
              data-testid={`${testIdPrefix}-abbreviations-toggle`}
              aria-expanded={abbreviationsOpen}
              aria-controls={`${testIdPrefix}-abbreviations-panel`}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              <span className="min-w-0">
                <span className="block font-medium text-slate-900">Abbreviations</span>
              </span>
              <span
                aria-hidden="true"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition duration-200 motion-reduce:transform-none ${
                  abbreviationsOpen ? "rotate-180" : ""
                }`}
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
                  <path d="M4.22 5.97a.75.75 0 0 1 1.06 0L8 8.69l2.72-2.72a.75.75 0 1 1 1.06 1.06L8.53 10.28a.75.75 0 0 1-1.06 0L4.22 7.03a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </span>
            </button>

            {abbreviationsOpen ? (
              <div
                id={`${testIdPrefix}-abbreviations-panel`}
                data-testid={`${testIdPrefix}-abbreviations-panel`}
                className="border-t border-slate-200 px-3 pb-3 pt-3"
              >
                <dl
                  className={legendGridClass}
                  data-testid={`${testIdPrefix}-abbreviations-list`}
                  data-column-mode={prefersStackedLayout ? "up-to-3" : "up-to-2"}
                >
                  {WORKOUT_POOLSIDE_ABBREVIATION_LEGEND.map((entry) => (
                    <div
                      key={entry.short}
                      className="grid grid-cols-[56px_minmax(0,1fr)] gap-2 rounded-lg bg-white px-3 py-2"
                    >
                      <dt className="font-semibold text-blue-800">{entry.short}</dt>
                      <dd className="m-0 text-slate-600">{entry.full}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
