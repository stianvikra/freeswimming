export const LOCAL_DAY_TIMEZONE_COOKIE_NAME = "fs_timezone";
export const LOCAL_DAY_TIMEZONE_MAX_LENGTH = 80;
export const LOCAL_DAY_UTC_TIMEZONE = "UTC";

const LOCAL_DAY_DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type LocalDayTimezoneValidationReason =
  | "invalid_type"
  | "empty"
  | "too_long"
  | "unsupported";

export type LocalDayTimezoneValidation =
  | { status: "valid"; timezone: string }
  | { status: "missing" }
  | { status: "invalid"; reason: LocalDayTimezoneValidationReason };

export type LocalDayContextSource = "explicit" | "cookie" | "utc_fallback";

export type ResolvedLocalDayContext = {
  status: "resolved";
  source: LocalDayContextSource;
  timezone: string;
  todayDate: string;
  now: Date;
};

export type InvalidExplicitLocalDayContext = {
  status: "invalid_explicit";
  reason: LocalDayTimezoneValidationReason;
  now: Date;
};

export type LocalDayContextResolution = ResolvedLocalDayContext | InvalidExplicitLocalDayContext;

export type RenderedLocalDayDateValidation =
  | { status: "current"; renderedTodayDate: string }
  | { status: "missing" }
  | { status: "invalid" }
  | { status: "stale"; renderedTodayDate: string };

type ResolveLocalDayContextInput = {
  now: Date;
  explicitTimezone?: unknown;
  cookieTimezone?: unknown;
};

function assertValidLocalDayInstant(now: Date): void {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new RangeError("Local-day instant must be a valid Date.");
  }
}

function requireLocalDayDateKey(value: string, label: string): string {
  if (!isLocalDayDateKey(value)) {
    throw new RangeError(`${label} must be a real YYYY-MM-DD date.`);
  }
  return value;
}

export function validateLocalDayTimezone(value: unknown): LocalDayTimezoneValidation {
  if (value === undefined) {
    return { status: "missing" };
  }
  if (typeof value !== "string") {
    return { status: "invalid", reason: "invalid_type" };
  }
  if (value.length === 0) {
    return { status: "invalid", reason: "empty" };
  }
  if (value.length > LOCAL_DAY_TIMEZONE_MAX_LENGTH) {
    return { status: "invalid", reason: "too_long" };
  }

  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: value }).format(0);
    return { status: "valid", timezone: value };
  } catch {
    return { status: "invalid", reason: "unsupported" };
  }
}

export function getBrowserLocalDayTimezone(): string {
  try {
    const validation = validateLocalDayTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    return validation.status === "valid" ? validation.timezone : LOCAL_DAY_UTC_TIMEZONE;
  } catch {
    return LOCAL_DAY_UTC_TIMEZONE;
  }
}

export function getLocalDayDateKey(now: Date, timezone: string): string {
  assertValidLocalDayInstant(now);
  const validation = validateLocalDayTimezone(timezone);
  if (validation.status !== "valid") {
    throw new RangeError("Local-day timezone must be a valid runtime-supported timezone.");
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: validation.timezone,
    calendar: "iso8601",
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(now)
      .filter((part) => part.type === "year" || part.type === "month" || part.type === "day")
      .map((part) => [part.type, part.value])
  );
  const dateKey = `${parts.year ?? ""}-${parts.month ?? ""}-${parts.day ?? ""}`;
  return requireLocalDayDateKey(dateKey, "Derived local-day date");
}

export function resolveLocalDayContext({
  now,
  explicitTimezone,
  cookieTimezone,
}: ResolveLocalDayContextInput): LocalDayContextResolution {
  assertValidLocalDayInstant(now);
  const explicitValidation = validateLocalDayTimezone(explicitTimezone);

  if (explicitValidation.status === "invalid") {
    return {
      status: "invalid_explicit",
      reason: explicitValidation.reason,
      now,
    };
  }

  if (explicitValidation.status === "valid") {
    return {
      status: "resolved",
      source: "explicit",
      timezone: explicitValidation.timezone,
      todayDate: getLocalDayDateKey(now, explicitValidation.timezone),
      now,
    };
  }

  const cookieValidation = validateLocalDayTimezone(cookieTimezone);
  const timezone =
    cookieValidation.status === "valid" ? cookieValidation.timezone : LOCAL_DAY_UTC_TIMEZONE;
  const source: LocalDayContextSource =
    cookieValidation.status === "valid" ? "cookie" : "utc_fallback";

  return {
    status: "resolved",
    source,
    timezone,
    todayDate: getLocalDayDateKey(now, timezone),
    now,
  };
}

export function isLocalDayDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !LOCAL_DAY_DATE_KEY_PATTERN.test(value)) {
    return false;
  }
  if (value.startsWith("0000-")) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function addLocalDayDateKey(dateKey: string, days: number): string {
  const validDateKey = requireLocalDayDateKey(dateKey, "Local-day date");
  if (!Number.isSafeInteger(days)) {
    throw new RangeError("Local-day offset must be a safe integer.");
  }
  const date = new Date(`${validDateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return requireLocalDayDateKey(date.toISOString().slice(0, 10), "Shifted local-day date");
}

export function clampLocalDayDateToToday(value: unknown, todayDate: string): string {
  const validTodayDate = requireLocalDayDateKey(todayDate, "Local today");
  const candidate = Array.isArray(value) ? value[0] : value;
  return isLocalDayDateKey(candidate) && candidate <= validTodayDate ? candidate : validTodayDate;
}

export function validateRenderedLocalDayDate(
  renderedTodayDate: unknown,
  serverTodayDate: string
): RenderedLocalDayDateValidation {
  const validServerTodayDate = requireLocalDayDateKey(serverTodayDate, "Server local today");
  if (renderedTodayDate === undefined) return { status: "missing" };
  if (!isLocalDayDateKey(renderedTodayDate)) return { status: "invalid" };
  if (renderedTodayDate !== validServerTodayDate) {
    return { status: "stale", renderedTodayDate };
  }
  return { status: "current", renderedTodayDate };
}
