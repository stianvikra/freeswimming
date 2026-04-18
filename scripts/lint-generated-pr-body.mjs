#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { validatePullRequestBody } from "./lint-pr-body-sections.mjs";

function run(command) {
  try {
    return execFileSync("bash", ["-lc", command], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function resolveBaseRef() {
  return process.env.PR_BODY_BASE_REF || "main";
}

function listChangedFiles(baseRef) {
  const output =
    run(`git diff --name-only origin/${baseRef}...HEAD`) ||
    run(`git diff --name-only ${baseRef}...HEAD`) ||
    run("git diff --name-only HEAD~1...HEAD");
  if (!output) return [];
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function generateBody(baseRef) {
  try {
    return execFileSync(process.execPath, ["./scripts/generate-pr-body.mjs", "--base", baseRef], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function main() {
  const baseRef = resolveBaseRef();
  const body = generateBody(baseRef);
  const headSha = run("git rev-parse HEAD");
  const changedFiles = listChangedFiles(baseRef);

  const errors = validatePullRequestBody(body, { headSha, changedFiles });
  if (errors.length === 0) {
    console.log("[pr-body-generated-lint] PASS");
    return;
  }

  console.error("[pr-body-generated-lint] FAIL");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

main();
