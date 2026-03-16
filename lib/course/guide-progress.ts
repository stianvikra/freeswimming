import { canonicalizeGuideProgressSectionId } from "@/lib/guides/runtime-identity";

export const MAX_GUIDE_PROGRESS_ROWS = 600;
const MAX_GUIDE_SLUG_LENGTH = 120;
const MAX_GUIDE_SECTION_ID_LENGTH = 160;
const MAX_GUIDE_NOTES_LENGTH = 4000;

export type GuideProgressRow = {
  guideSlug: string;
  sectionId: string;
  completed: boolean;
  notes: string;
  updatedAt: string;
};

type NormalizeRowsOptions = {
  fallbackUpdatedAt?: string;
  maxRows?: number;
};

export type GuideProgressNormalizationStats = {
  canonicalizedSectionIds: number;
  unresolvedKnownGuideRows: number;
};

type GuideProgressLike = {
  guideSlug?: unknown;
  guide_slug?: unknown;
  sectionId?: unknown;
  section_id?: unknown;
  completed?: unknown;
  notes?: unknown;
  updatedAt?: unknown;
  updated_at?: unknown;
};

function normalizeIdentifier(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized.length > maxLength) return null;
  return normalized;
}

function normalizeNotes(value: unknown): string {
  if (typeof value !== "string") return "";
  if (value.length <= MAX_GUIDE_NOTES_LENGTH) return value;
  return value.slice(0, MAX_GUIDE_NOTES_LENGTH);
}

function normalizeUpdatedAt(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const ts = Date.parse(value);
  if (!Number.isFinite(ts)) return fallback;
  return new Date(ts).toISOString();
}

function compareIso(a: string, b: string): number {
  const at = Date.parse(a);
  const bt = Date.parse(b);
  if (!Number.isFinite(at) && !Number.isFinite(bt)) return 0;
  if (!Number.isFinite(at)) return -1;
  if (!Number.isFinite(bt)) return 1;
  return at - bt;
}

function mergeGuideRow(existing: GuideProgressRow, incoming: GuideProgressRow): GuideProgressRow {
  if (compareIso(existing.updatedAt, incoming.updatedAt) >= 0) {
    return existing;
  }

  return incoming;
}

export function normalizeGuideProgressRowsWithStats(
  input: unknown,
  options?: NormalizeRowsOptions
): {
  rows: GuideProgressRow[];
  stats: GuideProgressNormalizationStats;
} {
  if (!Array.isArray(input)) {
    return {
      rows: [],
      stats: {
        canonicalizedSectionIds: 0,
        unresolvedKnownGuideRows: 0,
      },
    };
  }

  const fallback = normalizeUpdatedAt(options?.fallbackUpdatedAt, new Date().toISOString());
  const maxRows = Math.max(0, options?.maxRows ?? input.length);
  const merged = new Map<string, GuideProgressRow>();
  const stats: GuideProgressNormalizationStats = {
    canonicalizedSectionIds: 0,
    unresolvedKnownGuideRows: 0,
  };

  for (let i = 0; i < input.length && i < maxRows; i += 1) {
    const candidate = input[i];
    if (!candidate || typeof candidate !== "object") continue;

    const row = candidate as GuideProgressLike;
    const rawGuideSlug = normalizeIdentifier(
      row.guideSlug ?? row.guide_slug,
      MAX_GUIDE_SLUG_LENGTH
    );
    if (!rawGuideSlug) continue;
    const guideSlug = rawGuideSlug.toLowerCase();

    const rawSectionId = normalizeIdentifier(
      row.sectionId ?? row.section_id,
      MAX_GUIDE_SECTION_ID_LENGTH
    );
    if (!rawSectionId) continue;

    const sectionResolution = canonicalizeGuideProgressSectionId({
      guideSlug,
      sectionId: rawSectionId,
    });
    const sectionId = sectionResolution.runtimeId;
    if (!sectionId) {
      if (sectionResolution.source === "unresolved") {
        stats.unresolvedKnownGuideRows += 1;
      }
      continue;
    }

    if (sectionId !== rawSectionId && sectionResolution.source !== "unknown_guide") {
      stats.canonicalizedSectionIds += 1;
    }

    const normalizedRow: GuideProgressRow = {
      guideSlug,
      sectionId,
      completed: row.completed === true,
      notes: normalizeNotes(row.notes),
      updatedAt: normalizeUpdatedAt(row.updatedAt ?? row.updated_at, fallback),
    };

    const compositeId = `${guideSlug}::${sectionId}`;
    const existing = merged.get(compositeId);
    if (!existing) {
      merged.set(compositeId, normalizedRow);
      continue;
    }

    merged.set(compositeId, mergeGuideRow(existing, normalizedRow));
  }

  return {
    rows: Array.from(merged.values()).sort((a, b) => {
      const guideCmp = a.guideSlug.localeCompare(b.guideSlug);
      if (guideCmp !== 0) return guideCmp;
      return a.sectionId.localeCompare(b.sectionId);
    }),
    stats,
  };
}

export function normalizeGuideProgressRows(
  input: unknown,
  options?: NormalizeRowsOptions
): GuideProgressRow[] {
  return normalizeGuideProgressRowsWithStats(input, options).rows;
}
