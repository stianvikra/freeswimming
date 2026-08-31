import { GUIDE_0_TO_1000M_SLUG } from "@/lib/guides/guide-0-1000m";
import { GUIDE_POOLSIDE_SLUG } from "@/lib/guides/guide-poolside";

export type GuideRuntimeContentType = "guide_session" | "guide_drill";

export type GuideRuntimeResolutionSource = "body" | "legacy_slug" | "unknown_guide" | "unresolved";

export type GuideRuntimeResolution = {
  runtimeId: string | null;
  source: GuideRuntimeResolutionSource;
};

type GuideRuntimeRowLike = {
  slug: string;
  body: unknown;
};

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeGuideSlug(value: unknown): string | null {
  const normalized = normalizeText(value);
  return normalized ? normalized.toLowerCase() : null;
}

function getBodyRecord(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  return body as Record<string, unknown>;
}

function getBodyString(body: unknown, key: "guideSlug" | "sessionId" | "drillId"): string | null {
  const record = getBodyRecord(body);
  if (!record) return null;
  return normalizeText(record[key]);
}

function canonicalizeIndexedGuideRuntimeId(value: string, prefix: "S" | "D"): string | null {
  const directMatch = new RegExp(`^${prefix}0*([1-9][0-9]*)$`, "i").exec(value);
  if (directMatch?.[1]) {
    const numericPart = Number.parseInt(directMatch[1], 10);
    if (!Number.isFinite(numericPart) || numericPart <= 0) return null;
    return `${prefix}${String(numericPart).padStart(2, "0")}`;
  }

  return null;
}

function isLegacySlugTokenCharacter(characterCode: number): boolean {
  return (
    characterCode === 45 ||
    (characterCode >= 48 && characterCode <= 57) ||
    (characterCode >= 65 && characterCode <= 90) ||
    (characterCode >= 97 && characterCode <= 122)
  );
}

function inferIndexedGuideRuntimeIdFromSlug(
  slug: string,
  marker: "-session-" | "-drill-",
  prefix: "S" | "D"
): string | null {
  let trailingTokenStart = slug.length;
  while (
    trailingTokenStart > 0 &&
    isLegacySlugTokenCharacter(slug.charCodeAt(trailingTokenStart - 1))
  ) {
    trailingTokenStart -= 1;
  }

  const trailingToken = slug.slice(trailingTokenStart);
  const markerIndex = trailingToken.toLowerCase().indexOf(marker);
  if (markerIndex < 0) return null;

  return canonicalizeIndexedGuideRuntimeId(
    trailingToken.slice(markerIndex + marker.length),
    prefix
  );
}

function inferGuideSessionIdFromSlug(slug: string): string | null {
  return inferIndexedGuideRuntimeIdFromSlug(slug, "-session-", "S");
}

function inferGuideDrillIdFromSlug(slug: string): string | null {
  return inferIndexedGuideRuntimeIdFromSlug(slug, "-drill-", "D");
}

function nextIndexedGuideRuntimeId(prefix: "S" | "D", maxNumber: number): string {
  return `${prefix}${String(maxNumber + 1).padStart(2, "0")}`;
}

export function canonicalizeGuideSessionRuntimeId(value: unknown): string | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  return canonicalizeIndexedGuideRuntimeId(normalized, "S");
}

export function canonicalizeGuideDrillRuntimeId(value: unknown): string | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  return canonicalizeIndexedGuideRuntimeId(normalized, "D");
}

export function resolveGuideSessionRuntimeId(body: unknown, slug: string): GuideRuntimeResolution {
  const explicitRuntimeId = canonicalizeGuideSessionRuntimeId(getBodyString(body, "sessionId"));
  if (explicitRuntimeId) {
    return {
      runtimeId: explicitRuntimeId,
      source: "body",
    };
  }

  const legacyRuntimeId = inferGuideSessionIdFromSlug(slug);
  if (legacyRuntimeId) {
    return {
      runtimeId: legacyRuntimeId,
      source: "legacy_slug",
    };
  }

  return {
    runtimeId: null,
    source: "unresolved",
  };
}

export function resolveGuideDrillRuntimeId(body: unknown, slug: string): GuideRuntimeResolution {
  const explicitRuntimeId = canonicalizeGuideDrillRuntimeId(getBodyString(body, "drillId"));
  if (explicitRuntimeId) {
    return {
      runtimeId: explicitRuntimeId,
      source: "body",
    };
  }

  const legacyRuntimeId = inferGuideDrillIdFromSlug(slug);
  if (legacyRuntimeId) {
    return {
      runtimeId: legacyRuntimeId,
      source: "legacy_slug",
    };
  }

  return {
    runtimeId: null,
    source: "unresolved",
  };
}

export function resolveGuideRuntimeId(params: {
  contentType: GuideRuntimeContentType;
  body: unknown;
  slug: string;
}): GuideRuntimeResolution {
  if (params.contentType === "guide_session") {
    return resolveGuideSessionRuntimeId(params.body, params.slug);
  }

  return resolveGuideDrillRuntimeId(params.body, params.slug);
}

export function resolveNextGuideRuntimeId(params: {
  contentType: GuideRuntimeContentType;
  rows: GuideRuntimeRowLike[];
}): {
  runtimeId: string;
  legacySlugFallbackCount: number;
  unresolvedCount: number;
} {
  let maxNumber = 0;
  let legacySlugFallbackCount = 0;
  let unresolvedCount = 0;

  for (const row of params.rows) {
    const resolution = resolveGuideRuntimeId({
      contentType: params.contentType,
      body: row.body,
      slug: row.slug,
    });

    if (resolution.source === "legacy_slug") {
      legacySlugFallbackCount += 1;
    } else if (resolution.source === "unresolved") {
      unresolvedCount += 1;
    }

    const numericPart = resolution.runtimeId
      ? Number.parseInt(resolution.runtimeId.slice(1), 10)
      : Number.NaN;
    if (Number.isFinite(numericPart)) {
      maxNumber = Math.max(maxNumber, numericPart);
    }
  }

  return {
    runtimeId: nextIndexedGuideRuntimeId(
      params.contentType === "guide_session" ? "S" : "D",
      maxNumber
    ),
    legacySlugFallbackCount,
    unresolvedCount,
  };
}

export function applyGuideRuntimeIdDefaults(params: {
  contentType: GuideRuntimeContentType;
  body: Record<string, unknown>;
  runtimeId: string;
}): Record<string, unknown> {
  if (params.contentType === "guide_session") {
    return {
      ...params.body,
      guideSlug: normalizeGuideSlug(params.body.guideSlug) ?? GUIDE_0_TO_1000M_SLUG,
      sessionId: params.runtimeId,
    };
  }

  return {
    ...params.body,
    guideSlug: normalizeGuideSlug(params.body.guideSlug) ?? GUIDE_POOLSIDE_SLUG,
    drillId: params.runtimeId,
  };
}

export function canonicalizeGuideProgressSectionId(params: {
  guideSlug: unknown;
  sectionId: unknown;
}): GuideRuntimeResolution {
  const guideSlug = normalizeGuideSlug(params.guideSlug);
  const sectionId = normalizeText(params.sectionId);

  if (!guideSlug || !sectionId) {
    return {
      runtimeId: null,
      source: "unresolved",
    };
  }

  if (guideSlug === GUIDE_0_TO_1000M_SLUG) {
    return resolveGuideSessionRuntimeId({ sessionId: sectionId }, sectionId);
  }

  if (guideSlug === GUIDE_POOLSIDE_SLUG) {
    return resolveGuideDrillRuntimeId({ drillId: sectionId }, sectionId);
  }

  return {
    runtimeId: sectionId,
    source: "unknown_guide",
  };
}
