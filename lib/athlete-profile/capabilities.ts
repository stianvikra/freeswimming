import type { Database } from "@/types/database";

export const SWIM_CAPABILITY_LIMIT_KINDS = ["stroke", "drill", "kick"] as const;
export const SWIM_CAPABILITY_STROKES = [
  "freestyle",
  "backstroke",
  "breaststroke",
  "butterfly",
  "individual_medley",
] as const;

export type SwimCapabilityLimitKind = (typeof SWIM_CAPABILITY_LIMIT_KINDS)[number];
export type SwimCapabilityStroke = (typeof SWIM_CAPABILITY_STROKES)[number];
export type SwimCapabilityLimitRow = Database["public"]["Tables"]["swim_capability_limits"]["Row"];
export type SwimCapabilityLimitInsert =
  Database["public"]["Tables"]["swim_capability_limits"]["Insert"];

export type SwimCapabilityLimitInput = {
  kind?: string | null;
  stroke?: string | null;
  maxRepeatDistanceM?: number | string | null;
  maxTotalDistanceM?: number | string | null;
  targetTotalDistanceM?: number | string | null;
};

export type SwimCapabilityLimitDraftInput = {
  limits?: SwimCapabilityLimitInput[] | null;
};

type SwimCapabilityLimitSummaryInput = {
  kind: SwimCapabilityLimitKind;
  strokeLabel?: string | null;
  maxRepeatDistanceLabel?: string | null;
  maxTotalDistanceLabel?: string | null;
  targetTotalDistanceLabel?: string | null;
};

type BuildResult<T> = { kind: "invalid"; error: string } | { kind: "valid"; value: T[] };

const DISTANCE_PRECISION_FACTOR = 10000;

const STROKE_LABELS: Record<SwimCapabilityStroke, string> = {
  freestyle: "Freestyle",
  backstroke: "Backstroke",
  breaststroke: "Breaststroke",
  butterfly: "Butterfly",
  individual_medley: "Individual medley",
};

function normalizeDistance(value: number | string | null | undefined): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+(?:\.\d{1,2})?$/.test(value.trim())
        ? Number.parseFloat(value.trim())
        : Number.NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * DISTANCE_PRECISION_FACTOR) / DISTANCE_PRECISION_FACTOR;
}

function isLimitKind(value: unknown): value is SwimCapabilityLimitKind {
  return SWIM_CAPABILITY_LIMIT_KINDS.includes(value as SwimCapabilityLimitKind);
}

function isCapabilityStroke(value: unknown): value is SwimCapabilityStroke {
  return SWIM_CAPABILITY_STROKES.includes(value as SwimCapabilityStroke);
}

function buildLimitKey(kind: SwimCapabilityLimitKind, stroke: SwimCapabilityStroke | null) {
  return `${kind}:${stroke ?? "none"}`;
}

function assertDistanceRange(value: number | null, label: string): string | null {
  if (value === null) return null;
  if (value < 1 || value > 10000) return `${label} must be between 1 and 10000.`;
  return null;
}

export function getSwimCapabilityStrokeLabel(value: SwimCapabilityStroke) {
  return STROKE_LABELS[value];
}

export function formatSwimCapabilityDistance(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = Math.round(value * 100) / 100;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : String(rounded)}m`;
}

export function formatSwimCapabilityLimitSummary(limit: SwimCapabilityLimitSummaryInput) {
  const label =
    limit.kind === "drill"
      ? "Drills"
      : limit.kind === "kick"
        ? "Kick"
        : (limit.strokeLabel ?? "Stroke");
  const details = [
    limit.maxRepeatDistanceLabel ? `max length ${limit.maxRepeatDistanceLabel}` : null,
    limit.maxTotalDistanceLabel ? `max ${limit.maxTotalDistanceLabel}/session` : null,
    limit.targetTotalDistanceLabel ? `approx ${limit.targetTotalDistanceLabel}/session` : null,
  ].filter(Boolean);

  return details.length > 0 ? `${label}: ${details.join(", ")}` : label;
}

export function buildSwimCapabilityLimitUpserts(
  input: SwimCapabilityLimitDraftInput
): BuildResult<Omit<SwimCapabilityLimitInsert, "id" | "user_id" | "created_at" | "updated_at">> {
  const rawLimits = Array.isArray(input.limits) ? input.limits : [];
  const seenKeys = new Set<string>();
  const value: Omit<SwimCapabilityLimitInsert, "id" | "user_id" | "created_at" | "updated_at">[] =
    [];

  for (const rawLimit of rawLimits) {
    if (!isLimitKind(rawLimit.kind)) {
      return { kind: "invalid", error: "Capability limit type is not supported." };
    }

    const kind = rawLimit.kind;
    const stroke =
      kind === "stroke" && isCapabilityStroke(rawLimit.stroke) ? rawLimit.stroke : null;

    if (kind === "stroke" && !stroke) {
      return { kind: "invalid", error: "Choose a valid stroke for each stroke limit." };
    }

    if (kind !== "stroke" && rawLimit.stroke) {
      return { kind: "invalid", error: "Drill and kick limits cannot include a stroke." };
    }

    const maxRepeatDistanceM = normalizeDistance(rawLimit.maxRepeatDistanceM);
    const maxTotalDistanceM = normalizeDistance(rawLimit.maxTotalDistanceM);
    const targetTotalDistanceM = normalizeDistance(rawLimit.targetTotalDistanceM);
    const invalidDistance =
      assertDistanceRange(maxRepeatDistanceM, "Max repeat length") ??
      assertDistanceRange(maxTotalDistanceM, "Max total distance") ??
      assertDistanceRange(targetTotalDistanceM, "Target total distance");

    if (invalidDistance) {
      return { kind: "invalid", error: invalidDistance };
    }

    const hasValue =
      maxRepeatDistanceM !== null || maxTotalDistanceM !== null || targetTotalDistanceM !== null;

    if (!hasValue) continue;

    if (kind === "stroke" && targetTotalDistanceM !== null) {
      return {
        kind: "invalid",
        error: "Stroke limits use max total distance, not target total distance.",
      };
    }

    const key = buildLimitKey(kind, stroke);
    if (seenKeys.has(key)) {
      return { kind: "invalid", error: "Each capability limit can only be saved once." };
    }
    seenKeys.add(key);

    value.push({
      limit_kind: kind,
      stroke,
      max_repeat_distance_m: maxRepeatDistanceM,
      max_total_distance_m: maxTotalDistanceM,
      target_total_distance_m: targetTotalDistanceM,
    });
  }

  return { kind: "valid", value };
}
