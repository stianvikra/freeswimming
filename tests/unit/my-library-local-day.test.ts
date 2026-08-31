import { describe, expect, it, vi } from "vitest";
import {
  LOCAL_DAY_TIMEZONE_MAX_LENGTH,
  addLocalDayDateKey,
  clampLocalDayDateToToday,
  getBrowserLocalDayTimezone,
  getLocalDayDateKey,
  isLocalDayDateKey,
  resolveLocalDayContext,
  validateLocalDayTimezone,
  validateRenderedLocalDayDate,
} from "@/lib/my-library/local-day";
import { resolveLocalDayContextFromCookieReader } from "@/lib/my-library/local-day-server";
import { getMyLibraryCalendarIsoWeek } from "@/lib/my-library/calendar";

describe("canonical local-day contract", () => {
  it.each([
    ["UTC boundary", "2026-01-15T23:30:00.000Z", "UTC", "2026-01-15"],
    ["next Oslo day", "2026-01-15T23:30:00.000Z", "Europe/Oslo", "2026-01-16"],
    ["Oslo before DST start", "2026-03-28T22:30:00.000Z", "Europe/Oslo", "2026-03-28"],
    ["Oslo DST start", "2026-03-28T23:30:00.000Z", "Europe/Oslo", "2026-03-29"],
    ["Oslo after DST start", "2026-03-29T22:30:00.000Z", "Europe/Oslo", "2026-03-30"],
    ["Oslo DST end", "2026-10-24T22:30:00.000Z", "Europe/Oslo", "2026-10-25"],
    ["Oslo after DST end", "2026-10-25T23:30:00.000Z", "Europe/Oslo", "2026-10-26"],
    ["previous Los Angeles day", "2026-01-01T03:30:00.000Z", "America/Los_Angeles", "2025-12-31"],
  ])("derives the $0 date key", (_, instant, timezone, expected) => {
    expect(getLocalDayDateKey(new Date(instant), timezone)).toBe(expected);
  });

  it("composes with existing ISO-week arithmetic at the week-year edge", () => {
    const localDate = getLocalDayDateKey(new Date("2025-12-28T23:30:00.000Z"), "Europe/Oslo");
    expect(localDate).toBe("2025-12-29");
    expect(getMyLibraryCalendarIsoWeek(localDate)).toEqual({ weekNumber: 1, weekYear: 2026 });
  });

  it.each([
    ["UTC", { status: "valid", timezone: "UTC" }],
    ["Europe/Oslo", { status: "valid", timezone: "Europe/Oslo" }],
    [undefined, { status: "missing" }],
    [null, { status: "invalid", reason: "invalid_type" }],
    [42, { status: "invalid", reason: "invalid_type" }],
    ["", { status: "invalid", reason: "empty" }],
    ["x".repeat(LOCAL_DAY_TIMEZONE_MAX_LENGTH + 1), { status: "invalid", reason: "too_long" }],
    ["Mars/Olympus_Mons", { status: "invalid", reason: "unsupported" }],
  ])("validates timezone input %# without a hardcoded allowlist", (input, expected) => {
    expect(validateLocalDayTimezone(input)).toEqual(expected);
  });

  it("resolves explicit timezone before cookie and preserves the injected instant", () => {
    const now = new Date("2026-01-01T03:30:00.000Z");
    const context = resolveLocalDayContext({
      now,
      explicitTimezone: "America/Los_Angeles",
      cookieTimezone: "Europe/Oslo",
    });
    expect(context).toEqual({
      status: "resolved",
      source: "explicit",
      timezone: "America/Los_Angeles",
      todayDate: "2025-12-31",
      now,
    });
    expect(context.now).toBe(now);
  });

  it.each([
    ["valid cookie", "Europe/Oslo", "cookie", "Europe/Oslo", "2026-01-16"],
    ["missing cookie", undefined, "utc_fallback", "UTC", "2026-01-15"],
    ["invalid cookie", "Not/A_Zone", "utc_fallback", "UTC", "2026-01-15"],
  ])("resolves a $0 safely", (_, cookieTimezone, source, timezone, todayDate) => {
    expect(
      resolveLocalDayContext({ now: new Date("2026-01-15T23:30:00.000Z"), cookieTimezone })
    ).toMatchObject({ status: "resolved", source, timezone, todayDate });
  });

  it.each([
    [null, "invalid_type"],
    ["Not/A_Zone", "unsupported"],
  ])(
    "rejects invalid explicit timezone %# even with a valid cookie",
    (explicitTimezone, reason) => {
      const now = new Date("2026-01-15T23:30:00.000Z");
      expect(
        resolveLocalDayContext({ now, explicitTimezone, cookieTimezone: "Europe/Oslo" })
      ).toEqual({ status: "invalid_explicit", reason, now });
    }
  );

  it("keeps cookie access injectable and ignores malformed cookie values safely", () => {
    const now = new Date("2026-01-15T23:30:00.000Z");
    const cookieReader = { get: vi.fn(() => ({ value: "Europe/Oslo" })) };
    expect(resolveLocalDayContextFromCookieReader(cookieReader, { now })).toMatchObject({
      status: "resolved",
      source: "cookie",
      timezone: "Europe/Oslo",
      todayDate: "2026-01-16",
    });
    expect(cookieReader.get).toHaveBeenCalledWith("fs_timezone");
    expect(
      resolveLocalDayContextFromCookieReader({ get: () => ({ value: "Not/A_Zone" }) }, { now })
    ).toMatchObject({
      status: "resolved",
      source: "utc_fallback",
      timezone: "UTC",
      todayDate: "2026-01-15",
    });
  });

  it.each([
    ["2024-02-29", true],
    ["0000-01-01", false],
    ["2026-02-29", false],
    ["2026-02-30", false],
    ["2026-2-01", false],
  ])("validates real date key %s", (date, expected) => {
    expect(isLocalDayDateKey(date)).toBe(expected);
  });

  it.each([
    ["2024-02-28", 1, "2024-02-29"],
    ["2025-12-31", 1, "2026-01-01"],
    ["2026-01-01", -1, "2025-12-31"],
  ])("applies UTC-safe arithmetic to %s", (date, days, expected) => {
    expect(addLocalDayDateKey(date, days)).toBe(expected);
  });

  it.each([
    ["2025-12-31", "2025-12-31"],
    ["2026-01-02", "2026-01-01"],
    ["invalid", "2026-01-01"],
    [["2025-12-31", "2026-01-02"], "2025-12-31"],
  ])("clamps view date %# to today", (input, expected) => {
    expect(clampLocalDayDateToToday(input, "2026-01-01")).toBe(expected);
  });

  it.each([
    ["2026-01-01", { status: "current", renderedTodayDate: "2026-01-01" }],
    [undefined, { status: "missing" }],
    ["2026-02-30", { status: "invalid" }],
    ["2025-12-31", { status: "stale", renderedTodayDate: "2025-12-31" }],
  ])("validates rendered server day %#", (renderedTodayDate, expected) => {
    expect(validateRenderedLocalDayDate(renderedTodayDate, "2026-01-01")).toEqual(expected);
  });

  it("rejects invalid dates and server-controlled instants", () => {
    expect(() => addLocalDayDateKey("2026-02-30", 1)).toThrow(RangeError);
    expect(() => clampLocalDayDateToToday("2026-01-01", "2026-02-30")).toThrow(RangeError);
    expect(() => validateRenderedLocalDayDate("2026-01-01", "2026-02-30")).toThrow(RangeError);
    expect(() => getLocalDayDateKey(new Date("invalid"), "UTC")).toThrow(RangeError);
    expect(() => resolveLocalDayContext({ now: new Date("invalid") })).toThrow(RangeError);
  });

  it("falls back to UTC when browser timezone detection is unavailable", () => {
    const dateTimeFormat = Intl.DateTimeFormat;
    const spy = vi.spyOn(Intl, "DateTimeFormat").mockImplementationOnce(() => {
      throw new RangeError("timezone unavailable");
    });
    expect(getBrowserLocalDayTimezone()).toBe("UTC");
    spy.mockRestore();
    expect(Intl.DateTimeFormat).toBe(dateTimeFormat);
  });
});
