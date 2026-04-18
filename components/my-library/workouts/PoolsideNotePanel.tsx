"use client";

import { useState, type ReactNode } from "react";
import type {
  WorkoutPoolsideNotationMode,
  WorkoutPoolsideFocusOption,
  WorkoutPoolsideRestLayout,
  WorkoutPoolsidePrintLayout,
  WorkoutPoolsidePrintStyle,
} from "@/lib/workouts/shared";
import { WORKOUT_POOLSIDE_ABBREVIATION_LEGEND } from "@/lib/workouts/shared";

type Props = {
  className?: string;
  testIdPrefix: string;
  swimmerName?: string | null;
  focusOptions: WorkoutPoolsideFocusOption[];
  selectedFocusIds: string[];
  onToggleFocus: (focusId: string) => void;
  printStyle: WorkoutPoolsidePrintStyle;
  onPrintStyleChange: (style: WorkoutPoolsidePrintStyle) => void;
  printLayout: WorkoutPoolsidePrintLayout;
  onPrintLayoutChange: (layout: WorkoutPoolsidePrintLayout) => void;
  notationMode: WorkoutPoolsideNotationMode;
  onNotationModeChange: (mode: WorkoutPoolsideNotationMode) => void;
  restLayout: WorkoutPoolsideRestLayout;
  onRestLayoutChange: (layout: WorkoutPoolsideRestLayout) => void;
  actionSlot: ReactNode;
};

export default function PoolsideNotePanel({
  className = "",
  testIdPrefix,
  swimmerName = null,
  focusOptions,
  selectedFocusIds,
  onToggleFocus,
  printStyle,
  onPrintStyleChange,
  printLayout,
  onPrintLayoutChange,
  notationMode,
  onNotationModeChange,
  restLayout,
  onRestLayoutChange,
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
  const optionsSectionClass = prefersStackedLayout ? "min-w-0" : "min-w-0 xl:pl-5";
  const printOptionsGridClass = prefersStackedLayout ? "grid gap-4 xl:grid-cols-2" : "space-y-4";
  const abbreviationsPreview = ["Free", "IR", "SR", "Mod"]
    .filter((short) => WORKOUT_POOLSIDE_ABBREVIATION_LEGEND.some((entry) => entry.short === short))
    .join(", ");
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

        <div className={optionsSectionClass}>
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Print options</p>
            <div
              className={printOptionsGridClass}
              data-testid={`${testIdPrefix}-print-options-grid`}
              data-layout-mode={layoutMode}
            >
              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Style
                </legend>
                <div className="grid gap-3">
                  <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                    <input
                      type="radio"
                      name={`${testIdPrefix}-print-style`}
                      checked={printStyle === "color"}
                      onChange={() => onPrintStyleChange("color")}
                      data-testid={`${testIdPrefix}-style-color`}
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                    />
                    <span>
                      <span className="block font-medium text-slate-900">Color mode</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        Keeps the blue surfaces
                      </span>
                    </span>
                  </label>
                  <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                    <input
                      type="radio"
                      name={`${testIdPrefix}-print-style`}
                      checked={printStyle === "ink_saver"}
                      onChange={() => onPrintStyleChange("ink_saver")}
                      data-testid={`${testIdPrefix}-style-ink-saver`}
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                    />
                    <span>
                      <span className="block font-medium text-slate-900">Ink saver</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        Uses white surfaces.
                      </span>
                    </span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Layout
                </legend>
                <div className="grid gap-3">
                  <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                    <input
                      type="radio"
                      name={`${testIdPrefix}-print-layout`}
                      checked={printLayout === "portrait"}
                      onChange={() => onPrintLayoutChange("portrait")}
                      data-testid={`${testIdPrefix}-layout-portrait`}
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                    />
                    <span className="block font-medium text-slate-900">Portrait</span>
                  </label>
                  <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                    <input
                      type="radio"
                      name={`${testIdPrefix}-print-layout`}
                      checked={printLayout === "landscape"}
                      onChange={() => onPrintLayoutChange("landscape")}
                      data-testid={`${testIdPrefix}-layout-landscape`}
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                    />
                    <span className="block font-medium text-slate-900">Landscape</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Notation
                </legend>
                <div className="grid gap-3">
                  <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                    <input
                      type="radio"
                      name={`${testIdPrefix}-notation-mode`}
                      checked={notationMode === "auto"}
                      onChange={() => onNotationModeChange("auto")}
                      data-testid={`${testIdPrefix}-notation-auto`}
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                    />
                    <span>
                      <span className="block font-medium text-slate-900">Auto</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        Keeps full labels until the line needs shorthand.
                      </span>
                    </span>
                  </label>
                  <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                    <input
                      type="radio"
                      name={`${testIdPrefix}-notation-mode`}
                      checked={notationMode === "full"}
                      onChange={() => onNotationModeChange("full")}
                      data-testid={`${testIdPrefix}-notation-full`}
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                    />
                    <span className="block font-medium text-slate-900">Full</span>
                  </label>
                  <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                    <input
                      type="radio"
                      name={`${testIdPrefix}-notation-mode`}
                      checked={notationMode === "abbreviated"}
                      onChange={() => onNotationModeChange("abbreviated")}
                      data-testid={`${testIdPrefix}-notation-abbreviated`}
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                    />
                    <span className="block font-medium text-slate-900">Abbreviated</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rest layout
                </legend>
                <div className="grid gap-3">
                  <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                    <input
                      type="radio"
                      name={`${testIdPrefix}-rest-layout`}
                      checked={restLayout === "auto"}
                      onChange={() => onRestLayoutChange("auto")}
                      data-testid={`${testIdPrefix}-rest-layout-auto`}
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                    />
                    <span>
                      <span className="block font-medium text-slate-900">Auto</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        Keeps rests inline when they fit.
                      </span>
                    </span>
                  </label>
                  <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                    <input
                      type="radio"
                      name={`${testIdPrefix}-rest-layout`}
                      checked={restLayout === "inline"}
                      onChange={() => onRestLayoutChange("inline")}
                      data-testid={`${testIdPrefix}-rest-layout-inline`}
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                    />
                    <span className="block font-medium text-slate-900">Inline</span>
                  </label>
                  <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                    <input
                      type="radio"
                      name={`${testIdPrefix}-rest-layout`}
                      checked={restLayout === "below_step"}
                      onChange={() => onRestLayoutChange("below_step")}
                      data-testid={`${testIdPrefix}-rest-layout-below`}
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                    />
                    <span className="block font-medium text-slate-900">Below step</span>
                  </label>
                </div>
              </fieldset>
            </div>

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
                  <span className="mt-1 block text-xs text-slate-500">{abbreviationsPreview}</span>
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
    </div>
  );
}
