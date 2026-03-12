#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const REQUIRED_HEADINGS = ["Summary", "Scope", "Risk", "Test Evidence", "Checklist"];
const SUMMARY_PLACEHOLDERS = new Set([
  "what changed and why?",
  "user-visible changes: describe the concrete user/admin behavior changed in this pr.",
  "technical changes: describe key files/services/contracts changed.",
]);
const POLICY_IMPACT_PLACEHOLDERS = new Set(["yes/no", "tbd", "todo", "<fill-in>"]);
const POLICY_VERSION_PLACEHOLDERS = new Set(["tbd", "todo", "<fill-in>"]);
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
const POLICY_CHECKLIST_STATUSES = new Set(["PASS", "FAIL", "PENDING", "N/A"]);
const POLICY_IMPACT_RULES = [
  {
    id: "auth",
    label: "auth/session/account",
    patterns: [
      /(^|\/)app\/auth(\/|$)/i,
      /(^|\/)app\/api\/auth(\/|$)/i,
      /(^|\/)auth\/sign-in(\/|\.|$)/i,
      /(^|\/)(session|account)(\/|\.|$)/i,
      /(^|\/)(dev-login|preview-access)(\/|\.|$)/i,
    ],
  },
  {
    id: "analytics",
    label: "analytics/tracking/consent",
    patterns: [/(^|\/)(analytics|cookie|cookies|consent)(\/|\.|$)/i],
  },
  {
    id: "data-rights",
    label: "user data rights (export/delete/privacy)",
    patterns: [
      /(^|\/)app\/api\/user\/(export|delete)(\/|\.|$)/i,
      /(^|\/)(privacy|gdpr|data-rights|user-export|user-delete)(\/|\.|$)/i,
    ],
  },
  {
    id: "processor",
    label: "third-party processors (Stripe/Supabase/Resend/Vercel)",
    patterns: [/(stripe|supabase|resend|vercel)/i],
  },
];

function run(command) {
  try {
    return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

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

function parsePolicyImpactDecision(rawValue) {
  const normalized = normalizeFieldValue(rawValue);
  if (/^yes\b/.test(normalized)) return "yes";
  if (/^no\b/.test(normalized)) return "no";
  return "";
}

function parsePolicyChecklistStatus(rawValue) {
  const normalized = normalizeFieldValue(rawValue);
  if (!normalized) return "";
  if (/^(n\/a|na)\b/.test(normalized)) return "N/A";
  if (/^pass\b/.test(normalized)) return "PASS";
  if (/^fail\b/.test(normalized)) return "FAIL";
  if (/^pending\b/.test(normalized)) return "PENDING";
  return "";
}

function hasNaRationale(rawValue) {
  const normalized = normalizeFieldValue(rawValue);
  const match = normalized.match(/^(n\/a|na)\s*[:\-]?\s*(.*)$/);
  if (!match) return false;
  return match[2].trim().length >= 6;
}

function isBareNa(rawValue) {
  const normalized = normalizeFieldValue(rawValue);
  return normalized === "n/a" || normalized === "na";
}

function listChangedFilesForPullRequest(pullRequest) {
  if (!pullRequest) return [];

  const baseSha = pullRequest.base?.sha ?? "";
  const headSha = pullRequest.head?.sha ?? "";
  const baseRef = pullRequest.base?.ref ?? "";

  let diffOutput = "";
  if (baseSha && headSha) {
    diffOutput = run(`git diff --name-only ${baseSha}...${headSha}`);
  }
  if (!diffOutput && baseRef) {
    diffOutput =
      run(`git diff --name-only origin/${baseRef}...HEAD`) ||
      run(`git diff --name-only ${baseRef}...HEAD`) ||
      "";
  }

  if (!diffOutput) return [];
  return diffOutput
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function policyRuleMatchesFile(rule, filePath) {
  return rule.patterns.some((pattern) => pattern.test(filePath));
}

export function inferPolicyImpactFromChangedFiles(changedFiles) {
  const matches = [];
  for (const filePath of changedFiles) {
    const categories = POLICY_IMPACT_RULES.filter((rule) => policyRuleMatchesFile(rule, filePath)).map(
      (rule) => rule.label
    );
    if (categories.length > 0) {
      matches.push({ filePath, categories });
    }
  }

  const categorySet = new Set();
  for (const match of matches) {
    for (const category of match.categories) {
      categorySet.add(category);
    }
  }

  return {
    required: matches.length > 0,
    categories: [...categorySet],
    matches,
  };
}

function summarizePolicyImpactMatches(matches) {
  if (matches.length === 0) return "";
  const compact = matches.slice(0, 3).map((match) => `\`${match.filePath}\` (${match.categories.join(", ")})`);
  const remainder = matches.length - compact.length;
  return remainder > 0 ? `${compact.join("; ")}; +${remainder} more` : compact.join("; ");
}

function lineContainsHeadSha(line, headSha) {
  if (!line || !headSha) return false;
  const shortSha = headSha.slice(0, 7);
  const normalized = line.toLowerCase();
  return normalized.includes(headSha.toLowerCase()) || normalized.includes(shortSha.toLowerCase());
}

export function validatePullRequestBody(body, options = {}) {
  const errors = [];
  const sections = extractSections(body);
  const headSha = options.headSha ?? "";
  const changedFiles = options.changedFiles ?? [];
  const inferredPolicyImpact = inferPolicyImpactFromChangedFiles(changedFiles);
  let policyImpactDecision = "";
  let policyVersionNote = "";

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
    const policyImpactRaw = fieldValue(summary, "Policy impact");
    policyVersionNote = fieldValue(summary, "Policy version note");
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

    if (!policyImpactRaw) {
      errors.push('Section "## Summary" is missing a filled `Policy impact` line (`yes` or `no` + rationale).');
    } else if (isPlaceholderValue(policyImpactRaw, POLICY_IMPACT_PLACEHOLDERS)) {
      errors.push('Section "## Summary" has placeholder content in `Policy impact`.');
    } else {
      policyImpactDecision = parsePolicyImpactDecision(policyImpactRaw);
      if (!policyImpactDecision) {
        errors.push('Section "## Summary" `Policy impact` must start with `yes` or `no`.');
      }
    }

    if (!policyVersionNote) {
      errors.push('Section "## Summary" is missing a filled `Policy version note` line.');
    } else if (isPlaceholderValue(policyVersionNote, POLICY_VERSION_PLACEHOLDERS)) {
      errors.push('Section "## Summary" has placeholder content in `Policy version note`.');
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
    const policyChecklist = fieldValue(testEvidence, "Policy-impact checklist");
    const policyChecklistStatus = parsePolicyChecklistStatus(policyChecklist);

    if (!policyChecklist) {
      errors.push(
        'Section "## Test Evidence" is missing `Policy-impact checklist` (PASS/FAIL/PENDING/N/A + rationale).'
      );
    } else if (!policyChecklistStatus || !POLICY_CHECKLIST_STATUSES.has(policyChecklistStatus)) {
      errors.push(
        'Section "## Test Evidence" `Policy-impact checklist` must start with PASS/FAIL/PENDING/N/A.'
      );
    }

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

    if (policyImpactDecision === "yes") {
      if (policyChecklistStatus === "N/A") {
        errors.push("`Policy impact: yes` cannot use `Policy-impact checklist: N/A`.");
      }
      if (isBareNa(policyVersionNote)) {
        errors.push("`Policy impact: yes` requires a concrete `Policy version note` or explicit N/A rationale.");
      }
      if (!/policy-impact-release-review\.md/i.test(body)) {
        errors.push(
          "`Policy impact: yes` requires explicit reference to `docs/checklists/policy-impact-release-review.md` in PR body."
        );
      }
    }

    if (policyImpactDecision === "no") {
      if (policyChecklistStatus !== "N/A") {
        errors.push("`Policy impact: no` requires `Policy-impact checklist: N/A (...)`.");
      } else if (!hasNaRationale(policyChecklist)) {
        errors.push("`Policy impact: no` requires a short N/A rationale in `Policy-impact checklist`.");
      }
    }
  }

  if (policyImpactDecision === "no" && inferredPolicyImpact.required) {
    errors.push(
      `Summary declares \`Policy impact: no\`, but changed file scope matches policy-impact paths: ${summarizePolicyImpactMatches(
        inferredPolicyImpact.matches
      )}.`
    );
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

  const changedFiles = listChangedFilesForPullRequest(pullRequest);
  const errors = validatePullRequestBody(pullRequest.body ?? "", {
    headSha: pullRequest.head?.sha ?? "",
    changedFiles,
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

const isCliEntrypoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCliEntrypoint) {
  main();
}
