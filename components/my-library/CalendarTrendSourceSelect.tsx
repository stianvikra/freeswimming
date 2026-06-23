"use client";

import { useId, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  buildMyLibraryCalendarComparisonHref,
  getCalendarSourceFilterLabel,
  MY_LIBRARY_CALENDAR_SOURCE_FILTERS,
  type MyLibraryCalendarPeriod,
  type MyLibraryCalendarSourceSelection,
} from "@/lib/my-library/calendar";

type Props = {
  selectedDate: string;
  selectedSource: MyLibraryCalendarSourceSelection;
  period: MyLibraryCalendarPeriod;
};

export default function CalendarTrendSourceSelect({ selectedDate, selectedSource, period }: Props) {
  const router = useRouter();
  const selectId = useId();
  const safeSource = selectedSource === "unmapped" ? "all" : selectedSource;

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const source = event.target.value;
    if (!MY_LIBRARY_CALENDAR_SOURCE_FILTERS.includes(source as typeof safeSource)) return;
    router.push(
      buildMyLibraryCalendarComparisonHref({
        source: source as typeof safeSource,
        period,
        selectedDate,
      })
    );
  }

  return (
    <div className="mt-2 sm:hidden">
      <label className="sr-only" htmlFor={selectId}>
        Source
      </label>
      <select
        id={selectId}
        name="source"
        defaultValue={safeSource}
        onChange={handleChange}
        className="min-h-11 w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 text-sm font-semibold text-[color:var(--fs-color-ink-strong)] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
      >
        {MY_LIBRARY_CALENDAR_SOURCE_FILTERS.map((source) => (
          <option key={source} value={source}>
            {getCalendarSourceFilterLabel(source)}
          </option>
        ))}
      </select>
    </div>
  );
}
