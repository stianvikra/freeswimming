#!/usr/bin/env node

import { readFileSync } from "node:fs";

const REQUIRED_HEADINGS = ["Summary", "Scope", "Risk", "Test Evidence", "Checklist"];
const SUMMARY_PLACEHOLDERS = new Set([
  "what changed and why?",
  "user-visible changes: describe the concrete user/admin behavior changed in this pr.",
  "technical changes: describe key files/services/contracts changed.",
]);

function parseEventPayload() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) return null;

  try {
    const raw = readFileSync(eventPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function extractSections(body) {
  const sections = new Map();
  const lines = body.split(/\r?\n/);
  let activeHeading = "";
  let buffer = [];

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+?)\s*$/);
    if (headingMatch) {
      if (activeHeading) {
        sections.set(activeHeading, buffer.join("\n").trim());
      }
      activeHeading = headingMatch[1].trim();
      buffer = [];
      continue;
    }
    if (activeHeading) {
      buffer.push(line);
    }
  }

  if (activeHeading) {
    sections.set(activeHeading, buffer.join("\n").trim());
  }

  return sections;
}

function sectionContent(sections, heading) {
  return sections.get(heading) ?? "";
}

function hasInformativeSummary(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim().toLowerCase())
    .filter(Boolean);
  if (lines.length === 0) return false;
  return lines.some((line) => !SUMMARY_PLACEHOLDERS.has(line) && /[a-z0-9]/i.test(line));
}

function fieldValue(content, label) {
  const regex = new RegExp(`^-\\s*${label}\\s*:\\s*(.+)$`, "im");
  const match = content.match(regex);
  return match?.[1]?.trim() ?? "";
}

function hasVerifyStatus(content, commandName) {
  const regex = new RegExp(`${commandName}[^\\n]*(PASS|FAIL|PENDING|NOT RUN|\\[x\\])`, "i");
  return regex.test(content);
}

function validatePullRequestBody(body) {
  const errors = [];
  const sections = extractSections(body);

  if (!body || !body.trim()) {
    return ["PR body is empty. Fill the required sections from the template."];
  }

  for (const heading of REQUIRED_HEADINGS) {
    const content = sectionContent(sections, heading);
    if (!content) {
      errors.push(`Missing or empty section: "## ${heading}".`);
    }
  }

  const summary = sectionContent(sections, "Summary");
  if (summary && !hasInformativeSummary(summary)) {
    errors.push('Section "## Summary" has no informative content.');
  }

  const scope = sectionContent(sections, "Scope");
  if (scope) {
    const inScope = fieldValue(scope, "In scope");
    const outOfScope = fieldValue(scope, "Out of scope");
    if (!inScope) {
      errors.push('Section "## Scope" is missing a filled `In scope` line.');
    }
    if (!outOfScope) {
      errors.push('Section "## Scope" is missing a filled `Out of scope` line.');
    }
  }

  const risk = sectionContent(sections, "Risk");
  if (risk) {
    const mainRisk = fieldValue(risk, "Main risk");
    const rollback = fieldValue(risk, "Rollback plan");
    if (!mainRisk) {
      errors.push('Section "## Risk" is missing a filled `Main risk` line.');
    }
    if (!rollback) {
      errors.push('Section "## Risk" is missing a filled `Rollback plan` line.');
    }
  }

  const testEvidence = sectionContent(sections, "Test Evidence");
  if (testEvidence) {
    if (!hasVerifyStatus(testEvidence, "verify:pre-pr")) {
      errors.push(
        'Section "## Test Evidence" must include `verify:pre-pr` with status (PASS/FAIL/PENDING/NOT RUN or checked box).'
      );
    }
    if (!hasVerifyStatus(testEvidence, "verify:pre-merge")) {
      errors.push(
        'Section "## Test Evidence" must include `verify:pre-merge` with status (PASS/FAIL/PENDING/NOT RUN or checked box).'
      );
    }
  }

  if (!/brief link\(s\)/i.test(body) && !/docs\/task-briefs\//i.test(body)) {
    errors.push("PR body must include brief link information (`Brief link(s)` or `docs/task-briefs/...`).");
  }

  return errors;
}

function main() {
  const payload = parseEventPayload();
  const pullRequest = payload?.pull_request;

  if (!pullRequest) {
    console.log("[pr-body-lint] No pull_request payload detected. Skipping.");
    return;
  }

  const errors = validatePullRequestBody(pullRequest.body ?? "");
  if (errors.length === 0) {
    console.log("[pr-body-lint] PASS");
    return;
  }

  console.error("[pr-body-lint] FAIL");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

main();
