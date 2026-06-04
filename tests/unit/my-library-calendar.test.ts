import { describe, expect, it } from "vitest";
import {
  buildMyLibraryCalendarHref,
  buildMyLibraryCalendarWindow,
  getCalendarSourceFilterLabel,
  getMyLibraryCalendarIsoWeek,
  getMyLibraryCalendarWeekLabel,
  MY_LIBRARY_CALENDAR_SOURCE_FILTERS,
  normalizeMyLibraryCalendarDateParam,
} from "@/lib/my-library/calendar";

describe("my library calendar contract", () => {
  it("defines the shared source filters before a global calendar exists", () => {
    expect(MY_LIBRARY_CALENDAR_SOURCE_FILTERS).toEqual([
      "all",
      "habits",
      "micro_sessions",
      "dryland",
      "swimming",
    ]);
    expect(getCalendarSourceFilterLabel("all")).toBe("All");
    expect(getCalendarSourceFilterLabel("habits")).toBe("Habits");
    expect(getCalendarSourceFilterLabel("micro_sessions")).toBe("Micro Sessions");
    expect(getCalendarSourceFilterLabel("dryland")).toBe("Dryland");
    expect(getCalendarSourceFilterLabel("swimming")).toBe("Swimming");
  });

  it("normalizes invalid and future dates to today", () => {
    expect(normalizeMyLibraryCalendarDateParam("2026-05-04", "2026-05-10")).toBe("2026-05-04");
    expect(normalizeMyLibraryCalendarDateParam("2026-05-11", "2026-05-10")).toBe("2026-05-10");
    expect(normalizeMyLibraryCalendarDateParam("not-a-date", "2026-05-10")).toBe("2026-05-10");
    expect(normalizeMyLibraryCalendarDateParam(undefined, "2026-05-10")).toBe("2026-05-10");
  });

  it("builds a seven-day selected-date window and route hrefs", () => {
    expect(buildMyLibraryCalendarWindow("2026-05-10")).toEqual({
      selectedDate: "2026-05-10",
      startDate: "2026-05-04",
      endDate: "2026-05-10",
      weekNumber: 19,
      weekYear: 2026,
      weekLabel: "Week 19, 2026",
      previousWindowDate: "2026-05-03",
      nextWindowDate: "2026-05-17",
    });
    expect(
      buildMyLibraryCalendarHref({
        path: "/my-library/habits",
        selectedDate: "2026-05-03",
        view: "active",
        hash: "today-habits",
      })
    ).toBe("/my-library/habits?view=active&date=2026-05-03#today-habits");
  });

  it("uses ISO week numbers and week years", () => {
    expect(getMyLibraryCalendarIsoWeek("2026-05-10")).toEqual({
      weekNumber: 19,
      weekYear: 2026,
    });
    expect(getMyLibraryCalendarWeekLabel("2026-05-10")).toBe("Week 19, 2026");
    expect(getMyLibraryCalendarIsoWeek("2025-12-31")).toEqual({
      weekNumber: 1,
      weekYear: 2026,
    });
  });
});
