import { describe, expect, it } from "vitest";
import {
  buildMyLibraryCalendarComparisonHref,
  buildMyLibraryCalendarComparisonWindow,
  buildMyLibraryCalendarHref,
  buildMyLibraryCalendarWindow,
  getMyLibraryCalendarPeriodEndDate,
  getMyLibraryCalendarPeriodStartDate,
  getCalendarSourceFilterLabel,
  getMyLibraryCalendarIsoWeek,
  getMyLibraryCalendarWeekLabel,
  MY_LIBRARY_CALENDAR_PERIODS,
  MY_LIBRARY_CALENDAR_SOURCE_FILTERS,
  normalizeMyLibraryCalendarDateParam,
  normalizeMyLibraryCalendarPeriodParam,
  normalizeMyLibraryCalendarSourceParam,
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

  it("defines period filters and fails unsupported params closed", () => {
    expect(MY_LIBRARY_CALENDAR_PERIODS).toEqual(["week", "month", "year"]);
    expect(normalizeMyLibraryCalendarSourceParam(undefined)).toBe("all");
    expect(normalizeMyLibraryCalendarSourceParam("dryland")).toBe("dryland");
    expect(normalizeMyLibraryCalendarSourceParam("bike")).toBe("unmapped");
    expect(normalizeMyLibraryCalendarPeriodParam(undefined)).toBe("week");
    expect(normalizeMyLibraryCalendarPeriodParam("month")).toBe("month");
    expect(normalizeMyLibraryCalendarPeriodParam("quarter")).toBe("unmapped");
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
    expect(
      buildMyLibraryCalendarComparisonHref({
        source: "habits",
        period: "week",
        selectedDate: "2026-05-03",
      })
    ).toBe("/my-library/calendar?source=habits&period=week&date=2026-05-03");
  });

  it("keeps seven-day windows aligned to ISO Monday-Sunday weeks", () => {
    expect(buildMyLibraryCalendarWindow("2026-06-05")).toEqual({
      selectedDate: "2026-06-05",
      startDate: "2026-06-01",
      endDate: "2026-06-07",
      weekNumber: 23,
      weekYear: 2026,
      weekLabel: "Week 23, 2026",
      previousWindowDate: "2026-05-29",
      nextWindowDate: "2026-06-12",
    });
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

  it("builds week, month, and year period boundaries", () => {
    expect(getMyLibraryCalendarPeriodStartDate("2026-06-05", "week")).toBe("2026-06-01");
    expect(getMyLibraryCalendarPeriodEndDate("2026-06-05", "week")).toBe("2026-06-07");
    expect(getMyLibraryCalendarPeriodStartDate("2026-06-05", "month")).toBe("2026-06-01");
    expect(getMyLibraryCalendarPeriodEndDate("2026-06-05", "month")).toBe("2026-06-30");
    expect(getMyLibraryCalendarPeriodStartDate("2026-06-05", "year")).toBe("2026-01-01");
    expect(getMyLibraryCalendarPeriodEndDate("2026-06-05", "year")).toBe("2026-12-31");
  });

  it("builds comparison ranges without counting future dates", () => {
    expect(
      buildMyLibraryCalendarComparisonWindow({
        selectedDate: "2026-06-05",
        todayDate: "2026-06-05",
        period: "month",
      })
    ).toMatchObject({
      selectedDate: "2026-06-05",
      period: "month",
      current: {
        startDate: "2026-06-01",
        endDate: "2026-06-05",
        dayCount: 5,
      },
      comparison: {
        startDate: "2026-05-01",
        endDate: "2026-05-05",
        dayCount: 5,
      },
      previousPeriodDate: "2026-05-05",
      nextPeriodDate: "2026-06-05",
      canGoNext: false,
    });
  });
});
