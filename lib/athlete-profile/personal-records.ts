import type { Database } from "@/types/database";

export const PERSONAL_RECORD_STROKE_VALUES = [
  "freestyle",
  "backstroke",
  "breaststroke",
  "butterfly",
  "individual_medley",
] as const;
export type PersonalRecordStroke = (typeof PERSONAL_RECORD_STROKE_VALUES)[number];

export const PERSONAL_RECORD_COURSE_VALUES = ["pool_25m", "pool_50m", "open_water"] as const;
export type PersonalRecordCourse = (typeof PERSONAL_RECORD_COURSE_VALUES)[number];

export const PERSONAL_RECORD_STROKE_OPTIONS: readonly {
  value: PersonalRecordStroke;
  label: string;
}[] = [
  { value: "freestyle", label: "Freestyle" },
  { value: "backstroke", label: "Backstroke" },
  { value: "breaststroke", label: "Breaststroke" },
  { value: "butterfly", label: "Butterfly" },
  { value: "individual_medley", label: "Individual medley" },
] as const;

export const PERSONAL_RECORD_COURSE_OPTIONS: readonly {
  value: PersonalRecordCourse;
  label: string;
}[] = [
  { value: "pool_25m", label: "25m pool" },
  { value: "pool_50m", label: "50m pool" },
  { value: "open_water", label: "Open water" },
] as const;

export type PersonalRecordRow = Database["public"]["Tables"]["personal_records"]["Row"];
export type PersonalRecordInsert = Database["public"]["Tables"]["personal_records"]["Insert"];

type PersonalRecordInput = {
  distanceM?: number | string | null;
  stroke?: string | null;
  course?: string | null;
  time?: string | null;
  recordedOn?: string | null;
  sourceNote?: string | null;
};

type BuildResult<T> =
  | { kind: "empty" }
  | { kind: "invalid"; error: string }
  | { kind: "valid"; value: T };

const STROKE_SORT_ORDER: Record<PersonalRecordStroke, number> = {
  freestyle: 1,
  backstroke: 2,
  breaststroke: 3,
  butterfly: 4,
  individual_medley: 5,
};

const COURSE_SORT_ORDER: Record<PersonalRecordCourse, number> = {
  pool_25m: 1,
  pool_50m: 2,
  open_water: 3,
};

function normalizeText(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function normalizeNullableText(value: string | null | undefined): string | null {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : null;
}

function normalizeInteger(value: number | string | null | undefined): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || !/^\d+$/.test(normalized)) return null;
  return Number.parseInt(normalized, 10);
}

function isValidIsoDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
  const asDate = new Date(Date.UTC(year, month - 1, day));
  return (
    asDate.getUTCFullYear() === year &&
    asDate.getUTCMonth() === month - 1 &&
    asDate.getUTCDate() === day
  );
}

export function getPersonalRecordStrokeLabel(value: PersonalRecordStroke | null): string | null {
  if (!value) return null;
  return PERSONAL_RECORD_STROKE_OPTIONS.find((option) => option.value === value)?.label ?? null;
}

export function getPersonalRecordCourseLabel(value: PersonalRecordCourse | null): string | null {
  if (!value) return null;
  return PERSONAL_RECORD_COURSE_OPTIONS.find((option) => option.value === value)?.label ?? null;
}

export function buildPersonalRecordEventLabel(input: {
  distanceM: number;
  stroke: PersonalRecordStroke;
  course: PersonalRecordCourse;
}): string {
  return `${input.distanceM}m ${getPersonalRecordStrokeLabel(input.stroke)} · ${getPersonalRecordCourseLabel(input.course)}`;
}

export function formatPersonalRecordTime(valueCentiseconds: number | null): string | null {
  if (!valueCentiseconds || valueCentiseconds <= 0) return null;

  const hours = Math.floor(valueCentiseconds / 360000);
  const minutes = Math.floor((valueCentiseconds % 360000) / 6000);
  const seconds = Math.floor((valueCentiseconds % 6000) / 100);
  const centiseconds = valueCentiseconds % 100;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
  }

  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
  }

  return `${seconds}.${String(centiseconds).padStart(2, "0")}`;
}

export function parsePersonalRecordTimeToCentiseconds(
  value: string | null | undefined
): number | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;

  const hoursPattern = /^(\d{1,2}):([0-5]\d):([0-5]\d)(?:\.(\d{1,2}))?$/;
  const minutesPattern = /^(\d{1,3}):([0-5]\d)(?:\.(\d{1,2}))?$/;
  const secondsPattern = /^(\d{1,2})(?:\.(\d{1,2}))$/;

  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let centiseconds = 0;

  const hoursMatch = hoursPattern.exec(normalized);
  if (hoursMatch) {
    hours = Number.parseInt(hoursMatch[1] ?? "0", 10);
    minutes = Number.parseInt(hoursMatch[2] ?? "0", 10);
    seconds = Number.parseInt(hoursMatch[3] ?? "0", 10);
    centiseconds = Number.parseInt((hoursMatch[4] ?? "0").padEnd(2, "0"), 10);
  } else {
    const minutesMatch = minutesPattern.exec(normalized);
    if (minutesMatch) {
      minutes = Number.parseInt(minutesMatch[1] ?? "0", 10);
      seconds = Number.parseInt(minutesMatch[2] ?? "0", 10);
      centiseconds = Number.parseInt((minutesMatch[3] ?? "0").padEnd(2, "0"), 10);
    } else {
      const secondsMatch = secondsPattern.exec(normalized);
      if (!secondsMatch) return null;
      seconds = Number.parseInt(secondsMatch[1] ?? "0", 10);
      centiseconds = Number.parseInt((secondsMatch[2] ?? "0").padEnd(2, "0"), 10);
    }
  }

  const totalCentiseconds = hours * 360000 + minutes * 6000 + seconds * 100 + centiseconds;
  if (totalCentiseconds <= 0 || totalCentiseconds > 8639999) return null;
  return totalCentiseconds;
}

export function comparePersonalRecordRows(
  left: Pick<PersonalRecordRow, "distance_m" | "stroke" | "course" | "recorded_on" | "updated_at">,
  right: Pick<PersonalRecordRow, "distance_m" | "stroke" | "course" | "recorded_on" | "updated_at">
): number {
  const byDistance = left.distance_m - right.distance_m;
  if (byDistance !== 0) return byDistance;

  const byStroke =
    STROKE_SORT_ORDER[left.stroke as PersonalRecordStroke] -
    STROKE_SORT_ORDER[right.stroke as PersonalRecordStroke];
  if (byStroke !== 0) return byStroke;

  const byCourse =
    COURSE_SORT_ORDER[left.course as PersonalRecordCourse] -
    COURSE_SORT_ORDER[right.course as PersonalRecordCourse];
  if (byCourse !== 0) return byCourse;

  const leftDate = left.recorded_on ?? left.updated_at;
  const rightDate = right.recorded_on ?? right.updated_at;
  return leftDate.localeCompare(rightDate) * -1;
}

export function buildPersonalRecordUpsert(
  input: PersonalRecordInput
): BuildResult<Omit<PersonalRecordInsert, "id" | "user_id" | "created_at" | "updated_at">> {
  const distanceM = normalizeInteger(input.distanceM);
  const stroke = normalizeNullableText(input.stroke) as PersonalRecordStroke | null;
  const course = normalizeNullableText(input.course) as PersonalRecordCourse | null;
  const timeCentiseconds = parsePersonalRecordTimeToCentiseconds(input.time);
  const recordedOn = normalizeNullableText(input.recordedOn);
  const sourceNote = normalizeNullableText(input.sourceNote);

  const hasAnyValue =
    distanceM !== null ||
    stroke !== null ||
    course !== null ||
    timeCentiseconds !== null ||
    recordedOn !== null ||
    sourceNote !== null;

  if (!hasAnyValue) {
    return { kind: "empty" };
  }

  if (distanceM === null || distanceM < 25 || distanceM > 100000) {
    return { kind: "invalid", error: "Distance must be a whole number between 25m and 100000m." };
  }

  if (!stroke || !PERSONAL_RECORD_STROKE_VALUES.some((value) => value === stroke)) {
    return { kind: "invalid", error: "Choose a supported stroke before saving." };
  }

  if (!course || !PERSONAL_RECORD_COURSE_VALUES.some((value) => value === course)) {
    return { kind: "invalid", error: "Choose a supported course before saving." };
  }

  if (timeCentiseconds === null) {
    return {
      kind: "invalid",
      error: "Use time format ss.hh, m:ss.hh, or h:mm:ss.hh before saving.",
    };
  }

  if (recordedOn && !isValidIsoDateOnly(recordedOn)) {
    return { kind: "invalid", error: "Use a valid date in YYYY-MM-DD format." };
  }

  if (sourceNote && sourceNote.length > 280) {
    return { kind: "invalid", error: "Source note must be 280 characters or fewer." };
  }

  return {
    kind: "valid",
    value: {
      distance_m: distanceM,
      stroke,
      course,
      time_centiseconds: timeCentiseconds,
      recorded_on: recordedOn,
      source_note: sourceNote,
    },
  };
}
