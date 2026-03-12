#!/usr/bin/env node

import process from "node:process";
import { pathToFileURL } from "node:url";
import { loadTrendLogEntries, recommendTrendDecision } from "./perf-budget-trend-utils.mjs";

const DEFAULT_TREND_LOG_PATH = "artifacts/perf-budgets/trend-log.ndjson";

function parseCliArgs(argv) {
  const args = {
    filePath: DEFAULT_TREND_LOG_PATH,
    profile: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--help" || token === "-h") {
      return { ...args, help: true };
    }
    if (token === "--file") {
      args.filePath = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (token === "--profile") {
      args.profile = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${token}`);
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node ./scripts/perf-budget-trend-status.mjs [options]

Options:
  --file <path>      Trend log file path (default: ${DEFAULT_TREND_LOG_PATH})
  --profile <name>   Optional profile filter (public | gated-shell | gated-bypass)
  --help             Show help
`);
}

function printRecommendation(profile, recommendation) {
  const latestEntry = recommendation.latestEntry;
  if (!latestEntry) {
    console.log(`[perf-budget-trend] ${profile}: no entries found.`);
    return;
  }

  const latestStatus = latestEntry.pass ? "PASS" : "FAIL";
  const marginLabel =
    typeof latestEntry.worstMarginPct === "number"
      ? `${latestEntry.worstMarginPct.toFixed(1)}%`
      : "n/a";

  console.log(
    `[perf-budget-trend] ${profile}: latest ${latestStatus} @ ${latestEntry.commitSha} (${latestEntry.generatedAt})`
  );
  console.log(
    `[perf-budget-trend] ${profile}: weekly-green-runs=${recommendation.consecutiveWeeklyGreenRuns}, worst-margin=${marginLabel}, recommendation=${recommendation.decision}`
  );
  console.log(`[perf-budget-trend] ${profile}: ${recommendation.rationale}`);
}

export async function runCli(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);

  if (args.help) {
    printHelp();
    return 0;
  }

  if (!args.filePath.trim()) {
    throw new Error("--file must not be empty.");
  }

  const entries = await loadTrendLogEntries(args.filePath.trim());
  const profiles = args.profile.trim()
    ? [args.profile.trim()]
    : [...new Set(entries.map((entry) => entry.profile))];

  if (profiles.length === 0) {
    console.log(`[perf-budget-trend] No trend entries found in ${args.filePath}.`);
    return 0;
  }

  for (const profile of profiles) {
    const recommendation = recommendTrendDecision(entries, { profile });
    printRecommendation(profile, recommendation);
  }

  return 0;
}

const isCliEntrypoint =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCliEntrypoint) {
  runCli().catch((error) => {
    console.error("[perf-budget-trend] Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
