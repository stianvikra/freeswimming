#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import process from "node:process";
import { chromium } from "@playwright/test";
import {
  appendTrendLogEntry,
  buildTrendEntry,
  loadTrendLogEntries,
  recommendTrendDecision,
} from "./perf-budget-trend-utils.mjs";

const ROUTES = ["/", "/plans", "/course", "/my-library"];
const PERF_BUDGET_PORT = Number(process.env.PERF_BUDGET_PORT ?? 3200);
const PERF_BUDGET_HOST = process.env.PERF_BUDGET_HOST ?? "127.0.0.1";
const PERF_BUDGET_BASE_URL =
  process.env.PERF_BUDGET_BASE_URL ?? `http://${PERF_BUDGET_HOST}:${PERF_BUDGET_PORT}`;
const PERF_BUDGET_OUTPUT = process.env.PERF_BUDGET_OUTPUT ?? "";
const PERF_BUDGET_SITE_LOCK_ENABLED =
  process.env.PERF_BUDGET_SITE_LOCK_ENABLED ?? process.env.SITE_LOCK_ENABLED ?? "0";
const PERF_BUDGET_SITE_LOCK_BYPASS_TOKEN =
  process.env.PERF_BUDGET_SITE_LOCK_BYPASS_TOKEN ?? process.env.PW_SITE_LOCK_BYPASS_TOKEN ?? "";
const PERF_BUDGET_PROFILE =
  process.env.PERF_BUDGET_PROFILE ??
  (PERF_BUDGET_SITE_LOCK_ENABLED === "1"
    ? PERF_BUDGET_SITE_LOCK_BYPASS_TOKEN
      ? "gated-bypass"
      : "gated-shell"
    : "public");
const PERF_BUDGET_SETTLE_MS = Number(process.env.PERF_BUDGET_SETTLE_MS ?? 1500);
const PERF_BUDGET_SAMPLES_PER_ROUTE = Math.max(
  1,
  Number(process.env.PERF_BUDGET_SAMPLES_PER_ROUTE ?? 3)
);
const SERVER_READY_TIMEOUT_MS = Number(process.env.PERF_BUDGET_SERVER_TIMEOUT_MS ?? 60_000);
const PERF_BUDGET_TREND_LOG =
  process.env.PERF_BUDGET_TREND_LOG ?? "artifacts/perf-budgets/trend-log.ndjson";
const PERF_BUDGET_TREND_WRITE = (process.env.PERF_BUDGET_TREND_WRITE ?? "1") !== "0";
const PERF_BUDGET_TIGHTEN_MIN_MARGIN_PCT = Number(
  process.env.PERF_BUDGET_TIGHTEN_MIN_MARGIN_PCT ?? 15
);
const PERF_BUDGET_TIGHTEN_MIN_WEEKLY_GREENS = Math.max(
  1,
  Number(process.env.PERF_BUDGET_TIGHTEN_MIN_WEEKLY_GREENS ?? 2)
);

const BUDGETS = {
  lcpMs: Number(process.env.PERF_BUDGET_LCP_MS ?? 2500),
  cls: Number(process.env.PERF_BUDGET_CLS ?? 0.1),
  tbtMs: Number(process.env.PERF_BUDGET_TBT_MS ?? 200),
  jsTransferKb: Number(process.env.PERF_BUDGET_JS_TRANSFER_KB ?? 450),
  cssTransferKb: Number(process.env.PERF_BUDGET_CSS_TRANSFER_KB ?? 160),
  requestCount: Number(process.env.PERF_BUDGET_REQUEST_COUNT ?? 130),
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function resolveCommitSha() {
  const fromEnv = (
    process.env.PERF_BUDGET_COMMIT_SHA ??
    process.env.GITHUB_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    ""
  ).trim();
  if (fromEnv) return fromEnv.slice(0, 12);

  const command = spawnSync("git", ["rev-parse", "--short=12", "HEAD"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  if (command.status === 0 && command.stdout.trim()) {
    return command.stdout.trim();
  }
  return "unknown";
}

function formatTrendMargin(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "n/a";
  return `${value.toFixed(1)}%`;
}

async function waitForServerReady(baseUrl, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(baseUrl, { redirect: "manual" });
      if (response.status >= 200 && response.status < 500) {
        return;
      }
    } catch {
      // Keep polling until timeout.
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for Next.js server at ${baseUrl}`);
}

function toKb(valueBytes) {
  return Number((valueBytes / 1024).toFixed(1));
}

function toFiniteNumber(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

function median(values, fallback = 0) {
  const finite = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (finite.length === 0) return fallback;
  const center = Math.floor(finite.length / 2);
  if (finite.length % 2 === 1) return finite[center];
  return (finite[center - 1] + finite[center]) / 2;
}

function normalizeRouteMetrics(metrics) {
  return {
    lcpMs:
      typeof metrics.lcpMs === "number" && Number.isFinite(metrics.lcpMs) ? metrics.lcpMs : null,
    cls: toFiniteNumber(metrics.cls),
    tbtMs: toFiniteNumber(metrics.tbtMs),
    longTaskCount: toFiniteNumber(metrics.longTaskCount),
    jsTransferKb: toKb(toFiniteNumber(metrics.jsTransferKb) * 1024),
    cssTransferKb: toKb(toFiniteNumber(metrics.cssTransferKb) * 1024),
    requestCount: toFiniteNumber(metrics.requestCount),
    fcpMs: metrics.fcpMs,
    domContentLoadedMs: metrics.domContentLoadedMs,
    loadMs: metrics.loadMs,
    observerSetupError: metrics.observerSetupError,
  };
}

function aggregateRouteMetricSamples(samples) {
  return {
    lcpMs: median(samples.map((sample) => sample.lcpMs), null),
    cls: median(samples.map((sample) => sample.cls)),
    tbtMs: median(samples.map((sample) => sample.tbtMs)),
    longTaskCount: median(samples.map((sample) => sample.longTaskCount)),
    jsTransferKb: median(samples.map((sample) => sample.jsTransferKb)),
    cssTransferKb: median(samples.map((sample) => sample.cssTransferKb)),
    requestCount: median(samples.map((sample) => sample.requestCount)),
    fcpMs: median(samples.map((sample) => toFiniteNumber(sample.fcpMs, NaN)), null),
    domContentLoadedMs: median(
      samples.map((sample) => toFiniteNumber(sample.domContentLoadedMs, NaN)),
      null
    ),
    loadMs: median(samples.map((sample) => toFiniteNumber(sample.loadMs, NaN)), null),
    observerSetupError: samples.find((sample) => sample.observerSetupError)?.observerSetupError ?? null,
  };
}

function formatMs(value) {
  return `${value.toFixed(1)}ms`;
}

function formatMetric(value, type) {
  if (type === "time") return formatMs(value);
  if (type === "ratio") return value.toFixed(3);
  if (type === "count") return String(Math.round(value));
  if (type === "kb") return `${value.toFixed(1)}kb`;
  return String(value);
}

async function installPerformanceObservers(page) {
  await page.addInitScript(() => {
    window.__fsPerfBudget = {
      cls: 0,
      lcp: null,
      tbt: 0,
      longTaskCount: 0,
      observerSetupError: null,
    };

    try {
      const state = window.__fsPerfBudget;

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          state.lcp = entry.startTime;
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            state.cls += entry.value;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const blockingTime = Math.max(0, entry.duration - 50);
          state.tbt += blockingTime;
          state.longTaskCount += 1;
        }
      }).observe({ type: "longtask", buffered: true });
    } catch (error) {
      window.__fsPerfBudget.observerSetupError =
        error instanceof Error ? error.message : "unknown-observer-error";
    }
  });
}

async function collectRouteMetrics(page, route) {
  await page.goto(route, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
  await page.waitForTimeout(PERF_BUDGET_SETTLE_MS);

  return page.evaluate(() => {
    const perf = window.performance;
    const nav = perf.getEntriesByType("navigation")[0];
    const resources = perf.getEntriesByType("resource");
    const state = window.__fsPerfBudget ?? {
      cls: 0,
      lcp: null,
      tbt: 0,
      longTaskCount: 0,
      observerSetupError: "observers-not-initialized",
    };

    const jsTransferBytes = resources
      .filter((entry) => {
        const name = entry.name.toLowerCase();
        return (
          entry.initiatorType === "script" ||
          name.includes(".js") ||
          name.includes("_next/static/chunks")
        );
      })
      .reduce((sum, entry) => sum + (entry.transferSize || entry.encodedBodySize || 0), 0);

    const cssTransferBytes = resources
      .filter((entry) => {
        const name = entry.name.toLowerCase();
        return entry.initiatorType === "link" || name.includes(".css");
      })
      .reduce((sum, entry) => sum + (entry.transferSize || entry.encodedBodySize || 0), 0);

    return {
      lcpMs: state.lcp,
      cls: state.cls,
      tbtMs: state.tbt,
      longTaskCount: state.longTaskCount,
      observerSetupError: state.observerSetupError,
      jsTransferKb: jsTransferBytes / 1024,
      cssTransferKb: cssTransferBytes / 1024,
      requestCount: resources.length,
      fcpMs:
        perf
          .getEntriesByName("first-contentful-paint")
          .map((entry) => entry.startTime)
          .at(-1) ?? null,
      domContentLoadedMs: nav?.domContentLoadedEventEnd ?? null,
      loadMs: nav?.loadEventEnd ?? null,
    };
  });
}

async function collectRouteMetricsSample(context, route) {
  const page = await context.newPage();
  try {
    await installPerformanceObservers(page);
    return await collectRouteMetrics(page, route);
  } finally {
    await page.close().catch(() => {});
  }
}

function buildFailures(route, metrics) {
  const failures = [];

  if (typeof metrics.lcpMs !== "number" || !Number.isFinite(metrics.lcpMs)) {
    failures.push({
      route,
      metric: "LCP",
      actual: "missing",
      threshold: `<= ${BUDGETS.lcpMs}ms`,
    });
  } else if (metrics.lcpMs > BUDGETS.lcpMs) {
    failures.push({
      route,
      metric: "LCP",
      actual: formatMs(metrics.lcpMs),
      threshold: `<= ${BUDGETS.lcpMs}ms`,
    });
  }

  if (metrics.cls > BUDGETS.cls) {
    failures.push({
      route,
      metric: "CLS",
      actual: metrics.cls.toFixed(3),
      threshold: `<= ${BUDGETS.cls.toFixed(3)}`,
    });
  }

  if (metrics.tbtMs > BUDGETS.tbtMs) {
    failures.push({
      route,
      metric: "TBT",
      actual: formatMs(metrics.tbtMs),
      threshold: `<= ${BUDGETS.tbtMs}ms`,
    });
  }

  if (metrics.jsTransferKb > BUDGETS.jsTransferKb) {
    failures.push({
      route,
      metric: "JS transfer",
      actual: `${metrics.jsTransferKb.toFixed(1)}kb`,
      threshold: `<= ${BUDGETS.jsTransferKb.toFixed(1)}kb`,
    });
  }

  if (metrics.cssTransferKb > BUDGETS.cssTransferKb) {
    failures.push({
      route,
      metric: "CSS transfer",
      actual: `${metrics.cssTransferKb.toFixed(1)}kb`,
      threshold: `<= ${BUDGETS.cssTransferKb.toFixed(1)}kb`,
    });
  }

  if (metrics.requestCount > BUDGETS.requestCount) {
    failures.push({
      route,
      metric: "Request count",
      actual: `${metrics.requestCount}`,
      threshold: `<= ${BUDGETS.requestCount}`,
    });
  }

  return failures;
}

function printSummary(routeRows) {
  console.log(
    `[perf-budget] Profile: ${PERF_BUDGET_PROFILE} (SITE_LOCK_ENABLED=${PERF_BUDGET_SITE_LOCK_ENABLED}, bypass-token=${PERF_BUDGET_SITE_LOCK_BYPASS_TOKEN ? "yes" : "no"})`
  );
  console.log(`[perf-budget] Route metrics (median of ${PERF_BUDGET_SAMPLES_PER_ROUTE} sample(s)):`);
  for (const row of routeRows) {
    const cells = [
      `${row.route.padEnd(12)}`,
      `LCP ${formatMetric(row.metrics.lcpMs ?? NaN, "time").padStart(8)}`,
      `CLS ${formatMetric(row.metrics.cls, "ratio").padStart(6)}`,
      `TBT ${formatMetric(row.metrics.tbtMs, "time").padStart(8)}`,
      `JS ${formatMetric(row.metrics.jsTransferKb, "kb").padStart(9)}`,
      `CSS ${formatMetric(row.metrics.cssTransferKb, "kb").padStart(9)}`,
      `REQ ${formatMetric(row.metrics.requestCount, "count").padStart(4)}`,
    ];
    console.log(`  ${cells.join(" | ")}`);
  }
}

async function writeReportIfRequested(report) {
  if (!PERF_BUDGET_OUTPUT) return;
  const outputPath = PERF_BUDGET_OUTPUT;
  const outputDir = outputPath.includes("/") ? outputPath.slice(0, outputPath.lastIndexOf("/")) : ".";
  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`[perf-budget] Wrote JSON report: ${outputPath}`);
}

async function run() {
  const server = spawn(
    "npx",
    ["next", "start", "-H", PERF_BUDGET_HOST, "-p", String(PERF_BUDGET_PORT)],
    {
      env: {
        ...process.env,
        NODE_ENV: "production",
        SITE_LOCK_ENABLED: PERF_BUDGET_SITE_LOCK_ENABLED,
      },
      stdio: "pipe",
    }
  );

  server.stdout.on("data", (chunk) => {
    process.stdout.write(`[perf-budget-server] ${String(chunk)}`);
  });

  server.stderr.on("data", (chunk) => {
    process.stderr.write(`[perf-budget-server] ${String(chunk)}`);
  });

  const waitForServerClose = async (timeoutMs) => {
    if (server.exitCode !== null || server.signalCode !== null) {
      return true;
    }

    return new Promise((resolve) => {
      let settled = false;

      const onClose = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(true);
      };

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        server.off("close", onClose);
        resolve(false);
      }, timeoutMs);

      server.once("close", onClose);
    });
  };

  const closeServer = async () => {
    if (server.exitCode !== null || server.signalCode !== null) return;

    try {
      server.kill("SIGTERM");
    } catch {
      return;
    }

    const closedGracefully = await waitForServerClose(5_000);
    if (closedGracefully) return;

    try {
      server.kill("SIGKILL");
    } catch {
      return;
    }

    await waitForServerClose(5_000);
  };

  try {
    await waitForServerReady(PERF_BUDGET_BASE_URL, SERVER_READY_TIMEOUT_MS);

    const browser = await chromium.launch({ headless: true });
    const contextOptions = {
      baseURL: PERF_BUDGET_BASE_URL,
      extraHTTPHeaders: PERF_BUDGET_SITE_LOCK_BYPASS_TOKEN
        ? {
            "x-site-lock-bypass-token": PERF_BUDGET_SITE_LOCK_BYPASS_TOKEN,
          }
        : undefined,
    };
    const context = await browser.newContext(contextOptions);

    const routeRows = [];
    const failures = [];

    for (const route of ROUTES) {
      const samples = [];
      for (let sampleIndex = 0; sampleIndex < PERF_BUDGET_SAMPLES_PER_ROUTE; sampleIndex += 1) {
        const metrics = await collectRouteMetricsSample(context, route);
        samples.push(normalizeRouteMetrics(metrics));
      }
      const normalizedMetrics = aggregateRouteMetricSamples(samples);

      routeRows.push({
        route,
        samples,
        metrics: normalizedMetrics,
      });
      failures.push(...buildFailures(route, normalizedMetrics));
    }

    await context.close();
    await browser.close();

    printSummary(routeRows);

    const pass = failures.length === 0;
    const commitSha = resolveCommitSha();
    const report = {
      generatedAt: new Date().toISOString(),
      commitSha,
      pass,
      profile: PERF_BUDGET_PROFILE,
      siteLockEnabled: PERF_BUDGET_SITE_LOCK_ENABLED,
      bypassTokenHeaderUsed: Boolean(PERF_BUDGET_SITE_LOCK_BYPASS_TOKEN),
      baseUrl: PERF_BUDGET_BASE_URL,
      samplesPerRoute: PERF_BUDGET_SAMPLES_PER_ROUTE,
      budgets: BUDGETS,
      routes: routeRows,
      failures,
    };

    await writeReportIfRequested(report);

    if (PERF_BUDGET_TREND_WRITE) {
      const trendEntry = buildTrendEntry({ report, pass, commitSha });
      await appendTrendLogEntry(PERF_BUDGET_TREND_LOG, trendEntry);
      const trendEntries = await loadTrendLogEntries(PERF_BUDGET_TREND_LOG);
      const recommendation = recommendTrendDecision(trendEntries, {
        profile: PERF_BUDGET_PROFILE,
        tightenMinMarginPct: PERF_BUDGET_TIGHTEN_MIN_MARGIN_PCT,
        tightenMinWeeklyGreenRuns: PERF_BUDGET_TIGHTEN_MIN_WEEKLY_GREENS,
      });

      console.log(
        `[perf-budget-trend] Recorded ${PERF_BUDGET_TREND_LOG} (${trendEntry.pass ? "PASS" : "FAIL"} @ ${trendEntry.commitSha}, worst margin ${formatTrendMargin(trendEntry.worstMarginPct)}).`
      );
      console.log(
        `[perf-budget-trend] Recommendation: ${recommendation.decision} (${recommendation.rationale})`
      );
      if (recommendation.decision === "tighten") {
        console.log(
          "[perf-budget-trend] Action: tighten one stretch target step and record the decision in AW-010 checkpoint/PR summary."
        );
      }
    }

    if (!pass) {
      console.error("[perf-budget] FAIL: budget regressions detected.");
      for (const failure of failures) {
        console.error(
          `  - ${failure.route} | ${failure.metric}: actual ${failure.actual}, expected ${failure.threshold}`
        );
      }
      process.exitCode = 1;
      return;
    }

    console.log("[perf-budget] PASS");
  } finally {
    const serverClosed = await Promise.race([
      closeServer().then(() => true),
      sleep(12_000).then(() => false),
    ]);

    if (!serverClosed) {
      console.warn("[perf-budget] Timed out while closing perf-budget server; continuing shutdown.");
    }
  }
}

run()
  .then(() => {
    process.exit(process.exitCode ?? 0);
  })
  .catch((error) => {
    console.error("[perf-budget] Fatal error", error);
    process.exit(1);
  });
