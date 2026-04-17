"use client";

import type { ReactNode } from "react";
import type {
  WorkoutPoolsideFocusOption,
  WorkoutPoolsidePrintLayout,
  WorkoutPoolsidePrintStyle,
} from "@/lib/workouts/shared";

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
  actionSlot,
}: Props) {
  return (
    <div className={className} data-testid={`${testIdPrefix}-panel`} data-containment-style="split">
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

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] lg:items-start">
        <div className="min-w-0 space-y-3 lg:border-r lg:border-blue-200/70 lg:pr-5">
          <p className="text-sm font-semibold text-slate-900">Session Focus</p>
          {focusOptions.length > 0 ? (
            <div
              data-testid={`${testIdPrefix}-focus-list`}
              className="grid max-h-72 gap-3 overflow-y-auto pr-1"
            >
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

        <div className="min-w-0 space-y-4 lg:pl-5">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Print options</p>

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
                    <span className="mt-1 block text-xs text-slate-500">Uses white surfaces.</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
