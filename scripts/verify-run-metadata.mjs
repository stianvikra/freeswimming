#!/usr/bin/env node

import { existsSync, lstatSync, readFileSync, readdirSync, readlinkSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function normalizeLane(value) {
  const lane = String(value ?? "").trim().toLowerCase();
  if (!lane) return "";
  if (lane === "full") return "full-public";
  return lane;
}

function findLatestRunDir(runsRoot = "artifacts/test-runs") {
  if (!existsSync(runsRoot)) return "";

  const latestLinkPath = path.join(runsRoot, "latest");
  if (existsSync(latestLinkPath)) {
    try {
      if (lstatSync(latestLinkPath).isSymbolicLink()) {
        const latestRef = readlinkSync(latestLinkPath);
        const linkedDir = path.join(runsRoot, latestRef);
        if (existsSync(linkedDir)) {
          return linkedDir;
        }
      }
    } catch {
      // Fall through to directory scan.
    }
  }

  const candidates = readdirSync(runsRoot)
    .map((entry) => path.join(runsRoot, entry))
    .filter((candidate) => existsSync(candidate) && statSync(candidate).isDirectory())
    .sort((left, right) => left.localeCompare(right));
  return candidates[candidates.length - 1] ?? "";
}

export function readVerifyRunMetadata(runDir) {
  if (!runDir || !existsSync(runDir)) return null;

  const metadataPath = path.join(runDir, "meta.json");
  if (existsSync(metadataPath)) {
    try {
      const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
      return {
        runDir,
        status: String(metadata?.status ?? "UNKNOWN").toUpperCase(),
        headSha: String(metadata?.headSha ?? "").trim(),
        shortSha: String(metadata?.shortSha ?? "").trim(),
        verificationLane: normalizeLane(metadata?.verificationLane),
        timestampUtc: String(metadata?.timestampUtc ?? "").trim(),
        exitCode: Number(metadata?.exitCode ?? NaN),
        sourceCommand: String(metadata?.sourceCommand ?? "").trim(),
      };
    } catch {
      return null;
    }
  }

  const exitCodePath = path.join(runDir, "exit-code.txt");
  const modePath = path.join(runDir, "mode.txt");
  const exitCode = existsSync(exitCodePath) ? readFileSync(exitCodePath, "utf8").trim() : "";
  const lane = existsSync(modePath) ? readFileSync(modePath, "utf8").trim() : "";

  if (!exitCode && !lane) {
    return null;
  }

  return {
    runDir,
    status: exitCode === "0" ? "PASS" : exitCode ? "FAIL" : "UNKNOWN",
    headSha: "",
    shortSha: "",
    verificationLane: normalizeLane(lane),
    timestampUtc: "",
    exitCode: exitCode ? Number(exitCode) : NaN,
    sourceCommand: "",
  };
}

export function readLatestVerifyRunMetadata(runsRoot = "artifacts/test-runs") {
  const runDir = findLatestRunDir(runsRoot);
  return readVerifyRunMetadata(runDir);
}

export function buildPreMergeReuseDecision(options = {}) {
  const latestRun = options.latestRun ?? null;
  const headSha = String(options.headSha ?? "").trim().toLowerCase();
  const verificationLane = normalizeLane(options.verificationLane);

  if (!latestRun) {
    return {
      decision: "rerun",
      reason: "No local verify artifact metadata was found.",
      runDir: "",
    };
  }

  if (String(latestRun.status ?? "").toUpperCase() !== "PASS") {
    return {
      decision: "rerun",
      reason: `Latest local verify artifact is \`${latestRun.status || "UNKNOWN"}\`, not \`PASS\`.`,
      runDir: latestRun.runDir ?? "",
    };
  }

  if (normalizeLane(latestRun.verificationLane) !== verificationLane) {
    return {
      decision: "rerun",
      reason: `Latest local verify artifact lane is \`${latestRun.verificationLane || "unknown"}\`, expected \`${verificationLane || "unknown"}\`.`,
      runDir: latestRun.runDir ?? "",
    };
  }

  const latestHead = String(latestRun.headSha ?? "").trim().toLowerCase();
  if (!latestHead || !headSha) {
    return {
      decision: "rerun",
      reason: "Latest local verify artifact is missing HEAD metadata.",
      runDir: latestRun.runDir ?? "",
    };
  }

  if (latestHead !== headSha) {
    return {
      decision: "rerun",
      reason: `Latest local verify artifact belongs to \`${latestRun.shortSha || latestRun.headSha.slice(0, 7)}\`, not current HEAD.`,
      runDir: latestRun.runDir ?? "",
    };
  }

  return {
    decision: "reuse",
    reason: `Latest local verify artifact is a PASS for current HEAD and lane \`${verificationLane}\`.`,
    runDir: latestRun.runDir ?? "",
  };
}

function parseArgs(argv) {
  let printJson = false;
  let printDecision = false;
  let headSha = "";
  let verificationLane = "";
  let runDir = "";

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--json") {
      printJson = true;
      continue;
    }

    if (token === "--decision") {
      printDecision = true;
      continue;
    }

    if (token === "--head") {
      headSha = argv[index + 1] ?? headSha;
      index += 1;
      continue;
    }

    if (token === "--lane") {
      verificationLane = argv[index + 1] ?? verificationLane;
      index += 1;
      continue;
    }

    if (token === "--run-dir") {
      runDir = argv[index + 1] ?? runDir;
      index += 1;
      continue;
    }
  }

  return { printJson, printDecision, headSha, verificationLane, runDir };
}

function printSummary(metadata) {
  if (!metadata) {
    console.log("[verify-run-metadata] No local verify artifact metadata found.");
    return;
  }

  console.log(`[verify-run-metadata] Run: ${metadata.runDir}`);
  console.log(`[verify-run-metadata] Status: ${metadata.status}`);
  console.log(`[verify-run-metadata] Lane: ${metadata.verificationLane || "unknown"}`);
  console.log(`[verify-run-metadata] HEAD: ${metadata.shortSha || "unknown"}`);
  if (metadata.timestampUtc) {
    console.log(`[verify-run-metadata] Timestamp: ${metadata.timestampUtc}`);
  }
}

function printDecision(decision) {
  console.log(`decision=${decision.decision}`);
  console.log(`reason=${decision.reason}`);
  console.log(`run_dir=${decision.runDir}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const metadata = args.runDir ? readVerifyRunMetadata(args.runDir) : readLatestVerifyRunMetadata();

  if (args.printDecision) {
    const decision = buildPreMergeReuseDecision({
      latestRun: metadata,
      headSha: args.headSha,
      verificationLane: args.verificationLane,
    });
    printDecision(decision);
    return;
  }

  if (args.printJson) {
    console.log(JSON.stringify(metadata, null, 2));
    return;
  }

  printSummary(metadata);
}

const entryHref = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entryHref) {
  main();
}
