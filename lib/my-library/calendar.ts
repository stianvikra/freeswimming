export const MY_LIBRARY_CALENDAR_SOURCE_FILTERS = [
  "all",
  "habits",
  "micro_sessions",
  "dryland",
  "swimming",
] as const;

export type MyLibraryCalendarSourceFilter = (typeof MY_LIBRARY_CALENDAR_SOURCE_FILTERS)[number];
export type MyLibraryCalendarSourceSelection = MyLibraryCalendarSourceFilter | "unmapped";

export const MY_LIBRARY_CALENDAR_PERIODS = ["week", "month", "year"] as const;

export type MyLibraryCalendarPeriod = (typeof MY_LIBRARY_CALENDAR_PERIODS)[number];
export type MyLibraryCalendarPeriodSelection = MyLibraryCalendarPeriod | "unmapped";

export const MY_LIBRARY_CALENDAR_VIEWS = ["compare", "plan"] as const;

export type MyLibraryCalendarView = (typeof MY_LIBRARY_CALENDAR_VIEWS)[number];

export type MyLibraryCalendarWindow = {
  selectedDate: string;
  startDate: string;
  endDate: string;
  weekNumber: number;
  weekYear: number;
  weekLabel: string;
  previousWindowDate: string;
  nextWindowDate: string;
};

export type MyLibraryCalendarMonthWindow = {
  selectedDate: string;
  todayDate: string;
  startDate: string;
  endDate: string;
  gridStartDate: string;
  gridEndDate: string;
  label: string;
  previousMonthDate: string;
  nextMonthDate: string;
  containsToday: boolean;
};

export type MyLibraryCalendarPeriodRange = {
  period: MyLibraryCalendarPeriod;
  anchorDate: string;
  startDate: string;
  endDate: string;
  fullStartDate: string;
  fullEndDate: string;
  dayCount: number;
  label: string;
  shortLabel: string;
};

export type MyLibraryCalendarComparisonWindow = {
  selectedDate: string;
  todayDate: string;
  period: MyLibraryCalendarPeriod;
  current: MyLibraryCalendarPeriodRange;
  comparison: MyLibraryCalendarPeriodRange;
  comparisonMode: "previous" | "explicit";
  previousPeriodDate: string;
  nextPeriodDate: string;
  canGoNext: boolean;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_WINDOW_DAYS = 7;
const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const FULL_MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function parseCalendarDate(value: string): Date | null {
  if (!DATE_PATTERN.test(value)) return null;
  const parsed = Date.parse(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed);
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDaysInUtcMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function countCalendarDaysInclusive(startDate: string, endDate: string): number {
  const start = parseCalendarDate(startDate);
  const end = parseCalendarDate(endDate);
  if (!start || !end || end < start) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
}

function minCalendarDate(left: string, right: string): string {
  return left <= right ? left : right;
}

function maxCalendarDate(left: string, right: string): string {
  return left >= right ? left : right;
}

export function getTodayCalendarDate(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function isValidMyLibraryCalendarDateKey(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parsed = parseCalendarDate(value);
  return Boolean(parsed && toDateKey(parsed) === value);
}

export function getMyLibraryCalendarDayIndex(dateKey: string): number {
  const parsed = parseCalendarDate(dateKey);
  if (!parsed) return 0;
  return (parsed.getUTCDay() + 6) % 7;
}

export function addCalendarDays(dateKey: string, days: number): string {
  const parsed = parseCalendarDate(dateKey);
  const date = parsed ?? new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function isAfterCalendarDate(left: string, right: string): boolean {
  return left > right;
}

export function isMyLibraryCalendarSourceFilter(
  value: unknown
): value is MyLibraryCalendarSourceFilter {
  return (
    typeof value === "string" &&
    MY_LIBRARY_CALENDAR_SOURCE_FILTERS.includes(value as MyLibraryCalendarSourceFilter)
  );
}

export function normalizeMyLibraryCalendarSourceParam(
  value: unknown
): MyLibraryCalendarSourceSelection {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (rawValue === undefined || rawValue === null || rawValue === "") return "all";
  return isMyLibraryCalendarSourceFilter(rawValue) ? rawValue : "unmapped";
}

export function isMyLibraryCalendarPeriod(value: unknown): value is MyLibraryCalendarPeriod {
  return (
    typeof value === "string" &&
    MY_LIBRARY_CALENDAR_PERIODS.includes(value as MyLibraryCalendarPeriod)
  );
}

export function normalizeMyLibraryCalendarPeriodParam(
  value: unknown
): MyLibraryCalendarPeriodSelection {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (rawValue === undefined || rawValue === null || rawValue === "") return "week";
  return isMyLibraryCalendarPeriod(rawValue) ? rawValue : "unmapped";
}

export function normalizeMyLibraryCalendarViewParam(value: unknown): MyLibraryCalendarView {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (rawValue === "plan") return "plan";
  return "compare";
}

export function normalizeMyLibraryCalendarProgramIdParam(value: unknown): string | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (typeof rawValue !== "string") return null;
  const normalized = rawValue.trim();
  if (normalized.length === 0 || normalized.length > 120) return null;
  return normalized;
}

export function getMyLibraryCalendarIsoWeek(dateKey: string): {
  weekNumber: number;
  weekYear: number;
} {
  const parsed = parseCalendarDate(dateKey) ?? new Date();
  const date = new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  );
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - weekday);

  const weekYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const weekNumber = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return { weekNumber, weekYear };
}

export function getMyLibraryCalendarWeekLabel(dateKey: string): string {
  const { weekNumber, weekYear } = getMyLibraryCalendarIsoWeek(dateKey);
  return `Week ${weekNumber}, ${weekYear}`;
}

export function getMyLibraryCalendarPeriodLabel(period: MyLibraryCalendarPeriod): string {
  switch (period) {
    case "week":
      return "Week";
    case "month":
      return "Month";
    case "year":
      return "Year";
    default:
      return "Week";
  }
}

export function normalizeMyLibraryCalendarDateParam(
  value: unknown,
  todayDate = getTodayCalendarDate()
): string {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (typeof rawValue !== "string") return todayDate;
  const parsed = parseCalendarDate(rawValue);
  if (!parsed) return todayDate;
  const dateKey = parsed.toISOString().slice(0, 10);
  return dateKey > todayDate ? todayDate : dateKey;
}

export function normalizeOptionalMyLibraryCalendarDateParam(
  value: unknown,
  todayDate = getTodayCalendarDate()
): string | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (typeof rawValue !== "string") return null;
  const parsed = parseCalendarDate(rawValue);
  if (!parsed) return null;
  const dateKey = parsed.toISOString().slice(0, 10);
  return dateKey > todayDate ? todayDate : dateKey;
}

export function normalizeMyLibraryCalendarPlanDateParam(
  value: unknown,
  fallbackDate = getTodayCalendarDate()
): string {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (typeof rawValue !== "string") return fallbackDate;
  const parsed = parseCalendarDate(rawValue);
  if (!parsed) return fallbackDate;
  return parsed.toISOString().slice(0, 10);
}

export function buildMyLibraryCalendarWindow(
  selectedDate: string,
  windowDays = DEFAULT_WINDOW_DAYS
): MyLibraryCalendarWindow {
  const safeWindowDays = Math.max(1, Math.min(31, Math.round(windowDays)));
  const normalizedDate = normalizeMyLibraryCalendarDateParam(selectedDate, selectedDate);
  const startDate =
    safeWindowDays === DEFAULT_WINDOW_DAYS
      ? getMyLibraryCalendarPeriodStartDate(normalizedDate, "week")
      : addCalendarDays(normalizedDate, -(safeWindowDays - 1));
  const endDate =
    safeWindowDays === DEFAULT_WINDOW_DAYS
      ? addCalendarDays(startDate, safeWindowDays - 1)
      : normalizedDate;
  const { weekNumber, weekYear } = getMyLibraryCalendarIsoWeek(normalizedDate);

  return {
    selectedDate: normalizedDate,
    startDate,
    endDate,
    weekNumber,
    weekYear,
    weekLabel: getMyLibraryCalendarWeekLabel(normalizedDate),
    previousWindowDate: addCalendarDays(normalizedDate, -safeWindowDays),
    nextWindowDate: addCalendarDays(normalizedDate, safeWindowDays),
  };
}

export function getMyLibraryCalendarPeriodStartDate(
  dateKey: string,
  period: MyLibraryCalendarPeriod
): string {
  const parsed = parseCalendarDate(dateKey) ?? new Date();
  if (period === "year") {
    return `${parsed.getUTCFullYear()}-01-01`;
  }
  if (period === "month") {
    return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}-01`;
  }

  const date = new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  );
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - (weekday - 1));
  return toDateKey(date);
}

export function getMyLibraryCalendarPeriodEndDate(
  dateKey: string,
  period: MyLibraryCalendarPeriod
): string {
  const parsed = parseCalendarDate(dateKey) ?? new Date();
  if (period === "year") {
    return `${parsed.getUTCFullYear()}-12-31`;
  }
  if (period === "month") {
    return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}-${String(
      getDaysInUtcMonth(parsed.getUTCFullYear(), parsed.getUTCMonth())
    ).padStart(2, "0")}`;
  }

  return addCalendarDays(getMyLibraryCalendarPeriodStartDate(dateKey, period), 6);
}

export function addMyLibraryCalendarPeriods(
  dateKey: string,
  period: MyLibraryCalendarPeriod,
  amount: number
): string {
  const parsed = parseCalendarDate(dateKey) ?? new Date();
  const date = new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  );
  if (period === "week") {
    date.setUTCDate(date.getUTCDate() + amount * 7);
    return toDateKey(date);
  }

  const originalDay = date.getUTCDate();
  if (period === "month") {
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + amount);
    date.setUTCDate(
      Math.min(originalDay, getDaysInUtcMonth(date.getUTCFullYear(), date.getUTCMonth()))
    );
    return toDateKey(date);
  }

  date.setUTCDate(1);
  date.setUTCFullYear(date.getUTCFullYear() + amount);
  date.setUTCDate(
    Math.min(originalDay, getDaysInUtcMonth(date.getUTCFullYear(), date.getUTCMonth()))
  );
  return toDateKey(date);
}

export function buildMyLibraryCalendarMonthWindow({
  selectedDate,
  todayDate = getTodayCalendarDate(),
}: {
  selectedDate: string;
  todayDate?: string;
}): MyLibraryCalendarMonthWindow {
  const safeSelectedDate = normalizeMyLibraryCalendarPlanDateParam(selectedDate, todayDate);
  const safeTodayDate = normalizeMyLibraryCalendarPlanDateParam(todayDate, todayDate);
  const startDate = getMyLibraryCalendarPeriodStartDate(safeSelectedDate, "month");
  const endDate = getMyLibraryCalendarPeriodEndDate(safeSelectedDate, "month");
  const gridStartDate = getMyLibraryCalendarPeriodStartDate(startDate, "week");
  const gridEndDate = getMyLibraryCalendarPeriodEndDate(endDate, "week");

  return {
    selectedDate: safeSelectedDate,
    todayDate: safeTodayDate,
    startDate,
    endDate,
    gridStartDate,
    gridEndDate,
    label: FULL_MONTH_LABEL_FORMATTER.format(parseCalendarDate(safeSelectedDate) ?? new Date()),
    previousMonthDate: addMyLibraryCalendarPeriods(safeSelectedDate, "month", -1),
    nextMonthDate: addMyLibraryCalendarPeriods(safeSelectedDate, "month", 1),
    containsToday: safeTodayDate >= startDate && safeTodayDate <= endDate,
  };
}

function formatCalendarDateLabel(dateKey: string): string {
  const parsed = parseCalendarDate(dateKey) ?? new Date();
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function formatCalendarRangeLabel(startDate: string, endDate: string): string {
  if (startDate === endDate) return formatCalendarDateLabel(startDate);
  return `${formatCalendarDateLabel(startDate)} - ${formatCalendarDateLabel(endDate)}`;
}

function buildCalendarPeriodRange(
  anchorDate: string,
  period: MyLibraryCalendarPeriod,
  options: {
    dayCount?: number;
    todayDate: string;
  }
): MyLibraryCalendarPeriodRange {
  const fullStartDate = getMyLibraryCalendarPeriodStartDate(anchorDate, period);
  const fullEndDate = getMyLibraryCalendarPeriodEndDate(anchorDate, period);
  const maxEndDate = minCalendarDate(minCalendarDate(anchorDate, fullEndDate), options.todayDate);
  const uncappedEndDate =
    options.dayCount && options.dayCount > 0
      ? minCalendarDate(addCalendarDays(fullStartDate, options.dayCount - 1), fullEndDate)
      : maxEndDate;
  const endDate = minCalendarDate(uncappedEndDate, options.todayDate);
  const safeEndDate = maxCalendarDate(fullStartDate, endDate);
  const dayCount = countCalendarDaysInclusive(fullStartDate, safeEndDate);
  const label =
    period === "week"
      ? `${getMyLibraryCalendarWeekLabel(anchorDate)} (${formatCalendarRangeLabel(
          fullStartDate,
          safeEndDate
        )})`
      : period === "month"
        ? `${MONTH_LABEL_FORMATTER.format(parseCalendarDate(anchorDate) ?? new Date())} (${formatCalendarRangeLabel(
            fullStartDate,
            safeEndDate
          )})`
        : `${anchorDate.slice(0, 4)} (${formatCalendarRangeLabel(fullStartDate, safeEndDate)})`;

  return {
    period,
    anchorDate,
    startDate: fullStartDate,
    endDate: safeEndDate,
    fullStartDate,
    fullEndDate,
    dayCount,
    label,
    shortLabel: formatCalendarRangeLabel(fullStartDate, safeEndDate),
  };
}

export function buildMyLibraryCalendarComparisonWindow({
  selectedDate,
  period,
  todayDate = getTodayCalendarDate(),
  compareToDate,
}: {
  selectedDate: string;
  period: MyLibraryCalendarPeriod;
  todayDate?: string;
  compareToDate?: string | null;
}): MyLibraryCalendarComparisonWindow {
  const safeSelectedDate = normalizeMyLibraryCalendarDateParam(selectedDate, todayDate);
  const current = buildCalendarPeriodRange(safeSelectedDate, period, { todayDate });
  const defaultComparisonDate = addMyLibraryCalendarPeriods(safeSelectedDate, period, -1);
  const safeComparisonDate = compareToDate
    ? normalizeMyLibraryCalendarDateParam(compareToDate, todayDate)
    : defaultComparisonDate;
  const comparison = buildCalendarPeriodRange(safeComparisonDate, period, {
    dayCount: current.dayCount,
    todayDate,
  });
  const nextPeriodDate = normalizeMyLibraryCalendarDateParam(
    addMyLibraryCalendarPeriods(safeSelectedDate, period, 1),
    todayDate
  );

  return {
    selectedDate: safeSelectedDate,
    todayDate,
    period,
    current,
    comparison,
    comparisonMode: compareToDate ? "explicit" : "previous",
    previousPeriodDate: addMyLibraryCalendarPeriods(safeSelectedDate, period, -1),
    nextPeriodDate,
    canGoNext: nextPeriodDate !== safeSelectedDate,
  };
}

export function getCalendarSourceFilterLabel(source: MyLibraryCalendarSourceFilter): string {
  switch (source) {
    case "all":
      return "All";
    case "habits":
      return "Habits";
    case "micro_sessions":
      return "Micro Sessions";
    case "dryland":
      return "Dryland";
    case "swimming":
      return "Swimming";
    default:
      return "All";
  }
}

export function getCalendarSourceSelectionLabel(source: MyLibraryCalendarSourceSelection): string {
  return source === "unmapped" ? "Unmapped source" : getCalendarSourceFilterLabel(source);
}

export function buildMyLibraryCalendarHref({
  path,
  selectedDate,
  view,
  hash,
}: {
  path: string;
  selectedDate: string;
  view?: string;
  hash?: string;
}) {
  const params = new URLSearchParams();
  if (view) params.set("view", view);
  params.set("date", selectedDate);
  const query = params.toString();
  return `${path}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

export function buildMyLibraryCalendarPlanHref({
  selectedDate,
  programId,
}: {
  selectedDate: string;
  programId?: string | null;
}) {
  const params = new URLSearchParams();
  params.set("view", "plan");
  params.set("date", selectedDate);
  if (programId) params.set("programId", programId);
  return `/my-library/calendar?${params.toString()}`;
}

export function buildMyLibraryCalendarComparisonHref({
  source,
  period,
  selectedDate,
  compareTo,
}: {
  source: MyLibraryCalendarSourceFilter;
  period: MyLibraryCalendarPeriod;
  selectedDate: string;
  compareTo?: string | null;
}) {
  const params = new URLSearchParams();
  params.set("view", "compare");
  params.set("source", source);
  params.set("period", period);
  params.set("date", selectedDate);
  if (compareTo) params.set("compareTo", compareTo);
  return `/my-library/calendar?${params.toString()}`;
}
