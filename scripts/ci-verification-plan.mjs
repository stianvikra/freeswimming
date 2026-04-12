#!/usr/bin/env node

import { pathToFileURL } from "node:url";

import { collectChangedFiles, explainVerificationScope, resolveBaseRef } from "./verification-scope.mjs";

export function resolveCiVerificationPlan(options = {}) {
  const eventName = String(options.eventName ?? process.env.GITHUB_EVENT_NAME ?? "").trim();
  const requestedBase = String(options.base ?? process.env.GITHUB_BASE_REF ?? process.env.VERIFICATION_BASE_REF ?? "main").trim() || "main";

  if (eventName !== "pull_request") {
    return {
      eventName: eventName || "unknown",
      requestedBase,
      baseRef: null,
      lane: "full",
      reason: `CI event ${eventName || "unknown"} uses the full verification lane.`,
      changedFiles: [],
      disallowedPaths: [],
    };
  }

  const baseRef = options.baseRef ?? resolveBaseRef(requestedBase);
  const changedFiles = options.changedFiles ?? collectChangedFiles(baseRef);
  const scope = explainVerificationScope(changedFiles, { env: options.env ?? process.env });

  return {
    eventName,
    requestedBase,
    baseRef,
    lane: scope.lane,
    reason: scope.reason,
    changedFiles: scope.changedFiles,
    disallowedPaths: scope.disallowedPaths,
  };
}

function parseArgs(argv) {
  let eventName = process.env.GITHUB_EVENT_NAME ?? "";
  let base = process.env.GITHUB_BASE_REF ?? process.env.VERIFICATION_BASE_REF ?? "main";
  let printLane = false;
  let printSummary = false;
  let printJson = false;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--event") {
      eventName = argv[index + 1] ?? eventName;
      index += 1;
      continue;
    }

    if (token === "--base") {
      base = argv[index + 1] ?? base;
      index += 1;
      continue;
    }

    if (token === "--lane") {
      printLane = true;
      continue;
    }

    if (token === "--summary") {
      printSummary = true;
      continue;
    }

    if (token === "--json") {
      printJson = true;
      continue;
    }
  }

  return { eventName, base, printLane, printSummary, printJson };
}

function printSummary(plan) {
  console.log(`[ci-verification-plan] Event: ${plan.eventName}`);
  console.log(`[ci-verification-plan] Requested base: ${plan.requestedBase}`);
  if (plan.baseRef) {
    console.log(`[ci-verification-plan] Resolved base: ${plan.baseRef}`);
  }
  console.log(`[ci-verification-plan] Lane: ${plan.lane}`);
  console.log(`[ci-verification-plan] Reason: ${plan.reason}`);

  if (plan.changedFiles.length > 0) {
    console.log(`[ci-verification-plan] Changed files (${plan.changedFiles.length}):`);
    for (const filePath of plan.changedFiles) {
      const label = plan.disallowedPaths.includes(filePath) ? "full-only" : "allowed";
      console.log(`- ${filePath} [${label}]`);
    }
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const plan = resolveCiVerificationPlan({
    eventName: args.eventName,
    base: args.base,
  });

  if (args.printJson) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  if (args.printSummary) {
    printSummary(plan);
    return;
  }

  if (args.printLane) {
    console.log(plan.lane);
    return;
  }

  console.log(plan.reason);
}

const entryHref = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entryHref) {
  main();
}
