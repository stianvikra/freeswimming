export const MY_LIBRARY_CALENDAR_SOURCE_FILTERS = [
  "all",
  "habits",
  "micro_sessions",
  "dryland",
  "swimming",
] as const;

export type MyLibraryCalendarSourceFilter = (typeof MY_LIBRARY_CALENDAR_SOURCE_FILTERS)[number];

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

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_WINDOW_DAYS = 7;

function parseCalendarDate(value: string): Date | null {
  if (!DATE_PATTERN.test(value)) return null;
  const parsed = Date.parse(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed);
}

export function getTodayCalendarDate(now = new Date()): string {
  return now.toISOString().slice(0, 10);
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

export function buildMyLibraryCalendarWindow(
  selectedDate: string,
  windowDays = DEFAULT_WINDOW_DAYS
): MyLibraryCalendarWindow {
  const safeWindowDays = Math.max(1, Math.min(31, Math.round(windowDays)));
  const endDate = normalizeMyLibraryCalendarDateParam(selectedDate, selectedDate);
  const startDate = addCalendarDays(endDate, -(safeWindowDays - 1));
  const { weekNumber, weekYear } = getMyLibraryCalendarIsoWeek(endDate);

  return {
    selectedDate: endDate,
    startDate,
    endDate,
    weekNumber,
    weekYear,
    weekLabel: getMyLibraryCalendarWeekLabel(endDate),
    previousWindowDate: addCalendarDays(endDate, -safeWindowDays),
    nextWindowDate: addCalendarDays(endDate, safeWindowDays),
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
