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

function extractVerifyEvidence(content, commandName) {
  const lines = content.split(/\r?\n/);
  const evidenceLine = lines.find((line) => new RegExp(commandName, "i").test(line)) ?? "";
  if (!evidenceLine) {
    return { line: "", status: "" };
  }

  const statusMatch = evidenceLine.match(/\b(PASS|FAIL|PENDING|NOT RUN)\b/i);
  if (statusMatch) {
    return {
      line: evidenceLine,
      status: statusMatch[1].toUpperCase(),
    };
  }

  if (/\[[xX]\]/.test(evidenceLine)) {
    return {
      line: evidenceLine,
      status: "PASS",
    };
  }

  return { line: evidenceLine, status: "" };
}

function lineContainsHeadSha(line, headSha) {
  if (!line || !headSha) return false;
  const shortSha = headSha.slice(0, 7);
  const normalized = line.toLowerCase();
  return normalized.includes(headSha.toLowerCase()) || normalized.includes(shortSha.toLowerCase());
}

function validatePullRequestBody(body, options = {}) {
  const errors = [];
  const sections = extractSections(body);
  const headSha = options.headSha ?? "";

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
    const prePrEvidence = extractVerifyEvidence(testEvidence, "verify:pre-pr");
    if (!prePrEvidence.status) {
      errors.push(
        'Section "## Test Evidence" must include `verify:pre-pr` with status (PASS/FAIL/PENDING/NOT RUN or checked box).'
      );
    }

    const preMergeEvidence = extractVerifyEvidence(testEvidence, "verify:pre-merge");
    if (!preMergeEvidence.status) {
      errors.push(
        'Section "## Test Evidence" must include `verify:pre-merge` with status (PASS/FAIL/PENDING/NOT RUN or checked box).'
      );
    } else if (preMergeEvidence.status === "PASS" && !lineContainsHeadSha(preMergeEvidence.line, headSha)) {
      errors.push(
        'When `verify:pre-merge` is `PASS`, the same evidence line must include current PR head SHA (short or full).'
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

  const errors = validatePullRequestBody(pullRequest.body ?? "", {
    headSha: pullRequest.head?.sha ?? "",
  });
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
