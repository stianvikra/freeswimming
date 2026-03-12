#!/usr/bin/env node

import fs from "node:fs";

function normalizeReason(reason) {
  if (typeof reason !== "string") {
    return "";
  }
  return reason.replace(/\s+/g, " ").trim();
}

function collectTestsFromSuite(suite, sink) {
  if (!suite || typeof suite !== "object") {
    return;
  }

  const specs = Array.isArray(suite.specs) ? suite.specs : [];
  for (const spec of specs) {
    const tests = Array.isArray(spec?.tests) ? spec.tests : [];
    for (const test of tests) {
      sink.push({
        title: spec?.title ?? test?.title ?? "Untitled test",
        annotations: Array.isArray(test?.annotations) ? test.annotations : [],
        results: Array.isArray(test?.results) ? test.results : [],
      });
    }
  }

  const children = Array.isArray(suite.suites) ? suite.suites : [];
  for (const childSuite of children) {
    collectTestsFromSuite(childSuite, sink);
  }
}

function collectTestsFromReport(report) {
  const tests = [];
  if (!report || typeof report !== "object") {
    return tests;
  }
  const suites = Array.isArray(report.suites) ? report.suites : [];
  for (const suite of suites) {
    collectTestsFromSuite(suite, tests);
  }
  return tests;
}

function getFinalResult(test) {
  const results = Array.isArray(test?.results) ? test.results : [];
  for (let index = results.length - 1; index >= 0; index -= 1) {
    const result = results[index];
    if (result && typeof result.status === "string") {
      return result;
    }
  }
  return null;
}

function getSkipReason(test, finalResult) {
  const annotations = Array.isArray(test?.annotations) ? test.annotations : [];
  for (const annotation of annotations) {
    if (annotation?.type === "skip") {
      const fromAnnotation = normalizeReason(annotation?.description);
      if (fromAnnotation) {
        return fromAnnotation;
      }
    }
  }

  const fromError = normalizeReason(finalResult?.error?.message);
  if (fromError) {
    return fromError;
  }

  return "No explicit skip reason provided.";
}

export function summarizePlaywrightReport(report) {
  const tests = collectTestsFromReport(report);
  const counts = {
    passed: 0,
    skipped: 0,
    failed: 0,
    timedOut: 0,
    interrupted: 0,
    unknown: 0,
  };
  const skipReasonCounts = new Map();

  for (const test of tests) {
    const finalResult = getFinalResult(test);
    const status = finalResult?.status;

    if (status === "passed") {
      counts.passed += 1;
      continue;
    }
    if (status === "skipped") {
      counts.skipped += 1;
      const reason = getSkipReason(test, finalResult);
      const current = skipReasonCounts.get(reason) ?? 0;
      skipReasonCounts.set(reason, current + 1);
      continue;
    }
    if (status === "failed") {
      counts.failed += 1;
      continue;
    }
    if (status === "timedOut") {
      counts.timedOut += 1;
      continue;
    }
    if (status === "interrupted") {
      counts.interrupted += 1;
      continue;
    }
    counts.unknown += 1;
  }

  const skipReasons = [...skipReasonCounts.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }
      return left[0].localeCompare(right[0]);
    })
    .map(([reason, count]) => ({ reason, count }));

  return {
    total: tests.length,
    counts,
    skipReasons,
  };
}

export function formatAdminShortSessionSummary(summary) {
  const lines = [];
  lines.push(
    `[admin-short-session] Summary: total=${summary.total}, passed=${summary.counts.passed}, skipped=${summary.counts.skipped}, failed=${summary.counts.failed}, timedOut=${summary.counts.timedOut}, interrupted=${summary.counts.interrupted}, unknown=${summary.counts.unknown}`
  );

  if (summary.skipReasons.length === 0) {
    lines.push("[admin-short-session] Skip reasons: none.");
    return lines.join("\n");
  }

  lines.push("[admin-short-session] Skip reasons:");
  for (const item of summary.skipReasons) {
    lines.push(`[admin-short-session] - ${item.count}x ${item.reason}`);
  }
  return lines.join("\n");
}

function runCli() {
  const reportPath = process.argv[2];
  if (!reportPath) {
    console.error(
      "[admin-short-session] Missing report path argument. Usage: node scripts/summarize-admin-short-session.mjs <playwright-report.json>"
    );
    process.exit(1);
  }

  let parsedReport;
  try {
    parsedReport = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[admin-short-session] Could not read JSON report at ${reportPath}: ${message}`);
    process.exit(1);
  }

  const summary = summarizePlaywrightReport(parsedReport);
  console.log(formatAdminShortSessionSummary(summary));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli();
}
