import { appendFile, mkdir, readFile } from "node:fs/promises";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_TIGHTEN_MIN_MARGIN_PCT = 15;
const DEFAULT_TIGHTEN_MIN_WEEKLY_GREEN_RUNS = 2;

const METRIC_SPECS = [
  { key: "lcpMs", label: "LCP" },
  { key: "cls", label: "CLS" },
  { key: "tbtMs", label: "TBT" },
  { key: "jsTransferKb", label: "JS transfer" },
  { key: "cssTransferKb", label: "CSS transfer" },
  { key: "requestCount", label: "Request count" },
];

function toFiniteNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function roundToOneDecimal(value) {
  if (!Number.isFinite(value)) return null;
  return Number(value.toFixed(1));
}

function parseDateOrNull(value) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function getIsoWeekStartMs(isoTimestamp) {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return null;
  const utcDay = date.getUTCDay() || 7;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - utcDay + 1);
}

function sortEntriesDescending(entries) {
  return [...entries].sort((left, right) => {
    const leftTimestamp = parseDateOrNull(left.generatedAt) ?? 0;
    const rightTimestamp = parseDateOrNull(right.generatedAt) ?? 0;
    return rightTimestamp - leftTimestamp;
  });
}

export function deriveReportMarginSummary(report) {
  const budgets = report?.budgets ?? {};
  const routes = Array.isArray(report?.routes) ? report.routes : [];

  const routeSummaries = [];
  const globalMargins = [];

  for (const routeRow of routes) {
    const metrics = routeRow?.metrics ?? {};
    const metricMargins = [];

    for (const metric of METRIC_SPECS) {
      const threshold = toFiniteNumber(budgets[metric.key]);
      const actual = toFiniteNumber(metrics[metric.key]);
      if (threshold === null || actual === null) continue;

      const margin = threshold - actual;
      const marginPct = threshold === 0 ? (margin >= 0 ? 0 : -100) : (margin / threshold) * 100;

      metricMargins.push({
        metric: metric.label,
        threshold,
        actual,
        margin,
        marginPct,
        pass: margin >= 0,
      });
      globalMargins.push(marginPct);
    }

    const worstRouteMarginPct = metricMargins.length
      ? Math.min(...metricMargins.map((entry) => entry.marginPct))
      : null;

    routeSummaries.push({
      route: typeof routeRow?.route === "string" ? routeRow.route : "(unknown)",
      worstMarginPct: roundToOneDecimal(worstRouteMarginPct),
      metrics: metricMargins.map((entry) => ({
        metric: entry.metric,
        pass: entry.pass,
        marginPct: roundToOneDecimal(entry.marginPct),
      })),
    });
  }

  const worstMarginPct = globalMargins.length ? Math.min(...globalMargins) : null;

  return {
    routeSummaries,
    worstMarginPct: roundToOneDecimal(worstMarginPct),
  };
}

export function buildTrendEntry({ report, pass, commitSha }) {
  const summary = deriveReportMarginSummary(report);
  const failureCount = Array.isArray(report?.failures) ? report.failures.length : 0;

  return {
    generatedAt: report?.generatedAt ?? new Date().toISOString(),
    profile: report?.profile ?? "public",
    commitSha: typeof commitSha === "string" && commitSha.trim() ? commitSha.trim() : "unknown",
    pass: Boolean(pass),
    failureCount,
    worstMarginPct: summary.worstMarginPct,
    samplesPerRoute: toFiniteNumber(report?.samplesPerRoute) ?? null,
    routes: summary.routeSummaries,
  };
}

export function parseTrendLogLines(rawText) {
  if (!rawText.trim()) return [];

  const entries = [];
  for (const rawLine of rawText.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    try {
      const parsed = JSON.parse(line);
      if (!parsed || typeof parsed !== "object") continue;
      if (typeof parsed.generatedAt !== "string") continue;
      if (typeof parsed.profile !== "string") continue;
      entries.push(parsed);
    } catch {
      // Ignore malformed historical lines rather than failing trend analysis.
    }
  }

  return sortEntriesDescending(entries);
}

export async function loadTrendLogEntries(filePath) {
  try {
    const raw = await readFile(filePath, "utf8");
    return parseTrendLogLines(raw);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function appendTrendLogEntry(filePath, entry) {
  const outputDir = filePath.includes("/") ? filePath.slice(0, filePath.lastIndexOf("/")) : ".";
  await mkdir(outputDir, { recursive: true });
  await appendFile(filePath, `${JSON.stringify(entry)}\n`, "utf8");
}

export function countConsecutiveWeeklyGreenRuns(entries, profile) {
  const profileEntries = sortEntriesDescending(entries).filter((entry) => entry.profile === profile);
  const weeklyResults = [];
  const seenWeeks = new Set();

  for (const entry of profileEntries) {
    const weekStartMs = getIsoWeekStartMs(entry.generatedAt);
    if (weekStartMs === null) continue;
    if (seenWeeks.has(weekStartMs)) continue;
    seenWeeks.add(weekStartMs);
    weeklyResults.push({
      weekStartMs,
      pass: Boolean(entry.pass),
    });
  }

  let consecutive = 0;
  let previousWeekStartMs = null;
  for (const weekResult of weeklyResults) {
    if (!weekResult.pass) break;

    if (previousWeekStartMs === null) {
      consecutive = 1;
      previousWeekStartMs = weekResult.weekStartMs;
      continue;
    }

    if (previousWeekStartMs - weekResult.weekStartMs !== 7 * DAY_IN_MS) break;
    consecutive += 1;
    previousWeekStartMs = weekResult.weekStartMs;
  }

  return consecutive;
}

export function recommendTrendDecision(entries, options = {}) {
  const profile = options.profile ?? "public";
  const tightenMinMarginPct =
    toFiniteNumber(options.tightenMinMarginPct) ?? DEFAULT_TIGHTEN_MIN_MARGIN_PCT;
  const tightenMinWeeklyGreenRuns =
    toFiniteNumber(options.tightenMinWeeklyGreenRuns) ?? DEFAULT_TIGHTEN_MIN_WEEKLY_GREEN_RUNS;

  const profileEntries = sortEntriesDescending(entries).filter((entry) => entry.profile === profile);
  const latestEntry = profileEntries[0] ?? null;
  if (!latestEntry) {
    return {
      decision: "hold",
      consecutiveWeeklyGreenRuns: 0,
      latestEntry: null,
      rationale: "No trend history found for this profile yet.",
    };
  }

  const consecutiveWeeklyGreenRuns = countConsecutiveWeeklyGreenRuns(profileEntries, profile);
  const latestMargin = toFiniteNumber(latestEntry.worstMarginPct);

  if (!latestEntry.pass) {
    return {
      decision: "revert",
      consecutiveWeeklyGreenRuns,
      latestEntry,
      rationale: "Latest run failed perf budget thresholds.",
    };
  }

  if (consecutiveWeeklyGreenRuns >= tightenMinWeeklyGreenRuns && latestMargin !== null) {
    if (latestMargin >= tightenMinMarginPct) {
      return {
        decision: "tighten",
        consecutiveWeeklyGreenRuns,
        latestEntry,
        rationale: `Detected ${consecutiveWeeklyGreenRuns} consecutive weekly green runs with ${latestMargin.toFixed(1)}% margin.`,
      };
    }
  }

  return {
    decision: "hold",
    consecutiveWeeklyGreenRuns,
    latestEntry,
    rationale: `Keep current thresholds until weekly green runs and margin meet tighten criteria (runs: ${consecutiveWeeklyGreenRuns}/${tightenMinWeeklyGreenRuns}, margin: ${latestMargin === null ? "n/a" : `${latestMargin.toFixed(1)}%`}/${tightenMinMarginPct.toFixed(1)}%).`,
  };
}
