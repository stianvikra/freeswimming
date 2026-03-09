#!/usr/bin/env node

import { readFileSync } from "node:fs";

const REQUIRED_HEADINGS = ["Summary", "Scope", "Risk", "Test Evidence", "Checklist"];
const SUMMARY_PLACEHOLDERS = new Set([
  "what changed and why?",
  "user-visible changes: describe the concrete user/admin behavior changed in this pr.",
  "technical changes: describe key files/services/contracts changed.",
]);
const SCOPE_IN_PLACEHOLDERS = new Set([
  "pr governance automation for structured pr body quality.",
  "tbd",
  "todo",
  "n/a",
  "na",
  "<fill-in>",
]);
const SCOPE_OUT_PLACEHOLDERS = new Set([
  "unrelated runtime behavior and content data changes.",
  "tbd",
  "todo",
  "n/a",
  "na",
  "<fill-in>",
]);
const RISK_PLACEHOLDERS = new Set([
  "strict pr-body validation can fail existing low-detail pr drafts.",
  "tbd",
  "todo",
  "n/a",
  "na",
  "<fill-in>",
]);
const ROLLBACK_PLACEHOLDERS = new Set(["tbd", "todo", "n/a", "na", "<fill-in>"]);

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

function normalizeFieldValue(value) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function isPlaceholderValue(value, placeholders) {
  if (!value) return true;
  const normalized = normalizeFieldValue(value);
  if (!normalized) return true;
  if (placeholders.has(normalized)) return true;
  return /^<.+>$/.test(normalized);
}

function fieldValue(content, label) {
  const regex = new RegExp(`^-\\s*${label}\\s*:\\s*(.+)$`, "im");
  const match = content.match(regex);
  return match?.[1]?.trim() ?? "";
}

function escapedRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractCheckedCommandCheckboxes(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*-\s*\[[xX]\]\s*`([^`]+)`/))
    .filter(Boolean)
    .map((match) => match[1].trim());
}

function hasStatusEvidenceForCommand(content, command) {
  const commandPattern = new RegExp(escapedRegExp(command), "i");
  return content.split(/\r?\n/).some((line) => {
    const trimmed = line.trim();
    if (!trimmed || /^-\s*\[[xX ]\]/.test(trimmed)) return false;
    return commandPattern.test(trimmed) && /\b(PASS|FAIL|PENDING|NOT RUN)\b/i.test(trimmed);
  });
}

function checkboxIsChecked(content, labelFragment) {
  const pattern = new RegExp(`^\\s*-\\s*\\[[xX]\\]\\s*.*${escapedRegExp(labelFragment)}`, "im");
  return pattern.test(content);
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
  if (summary) {
    const userVisible = fieldValue(summary, "User-visible changes");
    const technical = fieldValue(summary, "Technical changes");
    if (!userVisible) {
      errors.push('Section "## Summary" is missing a filled `User-visible changes` line.');
    } else if (
      isPlaceholderValue(userVisible, SUMMARY_PLACEHOLDERS) ||
      /describe the concrete user\/admin behavior/i.test(userVisible)
    ) {
      errors.push('Section "## Summary" has placeholder content in `User-visible changes`.');
    }
    if (!technical) {
      errors.push('Section "## Summary" is missing a filled `Technical changes` line.');
    } else if (
      isPlaceholderValue(technical, SUMMARY_PLACEHOLDERS) ||
      /describe key files\/services\/contracts/i.test(technical)
    ) {
      errors.push('Section "## Summary" has placeholder content in `Technical changes`.');
    }
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
    if (inScope && isPlaceholderValue(inScope, SCOPE_IN_PLACEHOLDERS)) {
      errors.push('Section "## Scope" has placeholder/generic content in `In scope`.');
    }
    if (outOfScope && isPlaceholderValue(outOfScope, SCOPE_OUT_PLACEHOLDERS)) {
      errors.push('Section "## Scope" has placeholder/generic content in `Out of scope`.');
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
    if (mainRisk && isPlaceholderValue(mainRisk, RISK_PLACEHOLDERS)) {
      errors.push('Section "## Risk" has placeholder/generic content in `Main risk`.');
    }
    if (rollback && isPlaceholderValue(rollback, ROLLBACK_PLACEHOLDERS)) {
      errors.push('Section "## Risk" has placeholder/generic content in `Rollback plan`.');
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

    const checkedCommands = extractCheckedCommandCheckboxes(testEvidence);
    for (const command of checkedCommands) {
      if (/verify:pre-pr/i.test(command)) {
        if (prePrEvidence.status !== "PASS") {
          errors.push("Checked `verify:pre-pr` checkbox requires PASS evidence in the same section.");
        }
        continue;
      }
      if (/verify:pre-merge/i.test(command)) {
        if (preMergeEvidence.status !== "PASS") {
          errors.push("Checked `verify:pre-merge` checkbox requires PASS evidence on current HEAD.");
        } else if (!lineContainsHeadSha(preMergeEvidence.line, headSha)) {
          errors.push("Checked `verify:pre-merge` checkbox requires PASS evidence line containing current HEAD SHA.");
        }
        continue;
      }

      if (/^npm run /i.test(command) && !hasStatusEvidenceForCommand(testEvidence, command)) {
        errors.push(
          `Checked checkbox for \`${command}\` requires a non-checkbox evidence line with status (PASS/FAIL/PENDING/NOT RUN).`
        );
      }
    }

    const hasAnyUrl = /https?:\/\/\S+/i.test(testEvidence);
    if (checkboxIsChecked(testEvidence, "Local manual QA done") && !hasAnyUrl) {
      errors.push("Checked `Local manual QA` checkbox requires a URL in `## Test Evidence`.");
    }
    if (checkboxIsChecked(testEvidence, "Vercel preview manual QA done") && !hasAnyUrl) {
      errors.push("Checked `Vercel preview manual QA` checkbox requires a preview URL in `## Test Evidence`.");
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
