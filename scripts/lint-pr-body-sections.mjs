#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const REQUIRED_HEADINGS = ["Summary", "Scope", "Risk", "Test Evidence", "Checklist"];
const SUMMARY_PLACEHOLDERS = new Set([
  "what changed and why?",
  "user-visible changes: describe the concrete user/admin behavior changed in this pr.",
  "technical changes: describe key files/services/contracts changed.",
]);
const PLAIN_LANGUAGE_SUMMARY_PLACEHOLDERS = new Set([
  "what changed and why it matters?",
  "what changed and why this matters?",
  "what changed and why it matters in owner-readable language",
  "tbd",
  "todo",
  "n/a",
  "na",
  "<fill-in>",
]);
const RECOMMENDED_NEXT_STEP_PLACEHOLDERS = new Set([
  "tbd",
  "todo",
  "n/a",
  "na",
  "none",
  "no next step",
  "one concrete action, or `no next step: <rationale>`",
  "one concrete action, or no next step: <rationale>",
  "<fill-in>",
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
const RETRYABLE_PR_BODY_ERROR_PATTERNS = [
  /same evidence line must include current pr head sha/i,
  /requires pass evidence line containing current head sha/i,
];
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

function runGit(args) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
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

function buildPullRequestApiUrl(pullRequest, env = process.env) {
  const directUrl = pullRequest?.url?.trim();
  if (directUrl) return directUrl;

  const repository = env.GITHUB_REPOSITORY?.trim();
  const pullRequestNumber = pullRequest?.number;
  const apiBase = (env.GITHUB_API_URL?.trim() || "https://api.github.com").replace(/\/$/, "");

  if (!repository || !pullRequestNumber) return "";
  return `${apiBase}/repos/${repository}/pulls/${pullRequestNumber}`;
}

export async function hydratePullRequestFromApi(pullRequest, options = {}) {
  if (!pullRequest || typeof pullRequest !== "object") {
    return pullRequest;
  }

  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    return pullRequest;
  }

  const env = options.env ?? process.env;
  const apiUrl = buildPullRequestApiUrl(pullRequest, env);
  if (!apiUrl) {
    return pullRequest;
  }

  const token =
    env.GITHUB_TOKEN?.trim() || env.GH_TOKEN?.trim() || env.GITHUB_API_TOKEN?.trim() || "";
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "freeswimming-pr-body-lint",
    "X-GitHub-Api-Version": env.GITHUB_API_VERSION?.trim() || "2022-11-28",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetchImpl(apiUrl, { headers });
    if (!response?.ok) {
      return pullRequest;
    }

    const latestPullRequest = await response.json();
    if (!latestPullRequest || typeof latestPullRequest !== "object") {
      return pullRequest;
    }

    return {
      ...pullRequest,
      ...latestPullRequest,
    };
  } catch {
    return pullRequest;
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

function fieldValues(content, label) {
  const regex = new RegExp(`^-\\s*${label}\\s*:\\s*(.+)$`, "gim");
  return [...content.matchAll(regex)].map((match) => match?.[1]?.trim() ?? "").filter(Boolean);
}

function escapedRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeCommandName(value) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function extractCheckedCommandCheckboxes(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*-\s*\[[xX]\]\s*`([^`]+)`/))
    .filter(Boolean)
    .map((match) => match[1].trim());
}

function parseStructuredCommandEvidenceLine(line) {
  const match = line.match(/^\s*-\s*`([^`]+)`\s*:\s*(.+)$/);
  if (!match) return null;

  const statusMatch = match[2].match(/\b(PASS|FAIL|PENDING|NOT RUN)\b/i);
  return {
    command: normalizeCommandName(match[1]),
    line,
    status: statusMatch ? statusMatch[1].toUpperCase() : "",
  };
}

function hasStatusEvidenceForCommand(content, command) {
  const normalizedCommand = normalizeCommandName(command);
  return content
    .split(/\r?\n/)
    .map((line) => parseStructuredCommandEvidenceLine(line))
    .filter(Boolean)
    .some((evidence) => evidence.command === normalizedCommand && Boolean(evidence.status));
}

function checkboxIsChecked(content, labelFragment) {
  const pattern = new RegExp(`^\\s*-\\s*\\[[xX]\\]\\s*.*${escapedRegExp(labelFragment)}`, "im");
  return pattern.test(content);
}

function extractVerifyEvidence(content, commandName) {
  const normalizedCommand = normalizeCommandName(commandName);
  const evidence = content
    .split(/\r?\n/)
    .map((line) => parseStructuredCommandEvidenceLine(line))
    .filter(Boolean)
    .find((entry) => entry.command === normalizedCommand);

  if (!evidence) {
    return { line: "", status: "" };
  }

  return { line: evidence.line, status: evidence.status };
}

function findCommandMentionLine(content, commandName) {
  const normalizedCommand = normalizeCommandName(commandName);
  return (
    content
      .split(/\r?\n/)
      .find((line) => normalizeCommandName(line).includes(normalizedCommand)) ?? ""
  );
}

function buildStructuredEvidenceHint(commandName) {
  return `- \`${commandName}\`: **PASS|FAIL|PENDING|NOT RUN** ...`;
}

function buildMissingVerifyEvidenceMessage(content, commandName) {
  const mentionLine = findCommandMentionLine(content, commandName);
  const formatHint = buildStructuredEvidenceHint(commandName);

  if (mentionLine) {
    return `Section "## Test Evidence" mentions \`${commandName}\` but not in the required evidence format. Use: ${formatHint}`;
  }

  return `Section "## Test Evidence" must include ${formatHint}`;
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

function isTooShortForOwnerSummary(rawValue) {
  return normalizeFieldValue(rawValue).length < 24;
}

function hasNoNextStepRationale(rawValue) {
  const normalized = normalizeFieldValue(rawValue);
  const match = normalized.match(/^no next step\s*(?::|-|because)\s*(.*)$/);
  return Boolean(match && match[1].trim().length >= 12);
}

function listChangedFilesForPullRequest(pullRequest) {
  if (!pullRequest) return [];

  const baseSha = pullRequest.base?.sha ?? "";
  const headSha = pullRequest.head?.sha ?? "";
  const baseRef = pullRequest.base?.ref ?? "";

  let diffOutput = "";
  if (baseSha && headSha) {
    diffOutput = runGit(["diff", "--name-only", `${baseSha}...${headSha}`]);
  }
  if (!diffOutput && baseRef) {
    diffOutput =
      runGit(["diff", "--name-only", `origin/${baseRef}...HEAD`]) ||
      runGit(["diff", "--name-only", `${baseRef}...HEAD`]) ||
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

function sleep(ms) {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryablePullRequestBodyError(error) {
  if (!error) return false;
  return RETRYABLE_PR_BODY_ERROR_PATTERNS.some((pattern) => pattern.test(error));
}

export function shouldRetryPullRequestBodyValidation(errors) {
  if (!Array.isArray(errors) || errors.length === 0) return false;
  return errors.every((error) => isRetryablePullRequestBodyError(error));
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
    const plainLanguageSummaries = fieldValues(summary, "Plain-language done summary");
    const recommendedNextSteps = fieldValues(summary, "Recommended next step");
    const userVisible = fieldValue(summary, "User-visible changes");
    const technical = fieldValue(summary, "Technical changes");
    const policyImpactRaw = fieldValue(summary, "Policy impact");
    policyVersionNote = fieldValue(summary, "Policy version note");
    if (plainLanguageSummaries.length !== 1) {
      errors.push(
        'Section "## Summary" must include exactly one `Plain-language done summary` line explaining what changed and why it matters.'
      );
    } else if (
      isPlaceholderValue(plainLanguageSummaries[0], PLAIN_LANGUAGE_SUMMARY_PLACEHOLDERS) ||
      isTooShortForOwnerSummary(plainLanguageSummaries[0])
    ) {
      errors.push('Section "## Summary" has placeholder or too-thin content in `Plain-language done summary`.');
    }
    if (recommendedNextSteps.length !== 1) {
      errors.push(
        'Section "## Summary" must include exactly one `Recommended next step` line, or one `No next step: <rationale>` line.'
      );
    } else if (
      isPlaceholderValue(recommendedNextSteps[0], RECOMMENDED_NEXT_STEP_PLACEHOLDERS) &&
      !hasNoNextStepRationale(recommendedNextSteps[0])
    ) {
      errors.push(
        'Section "## Summary" has placeholder content in `Recommended next step`; use one concrete action or `No next step: <rationale>`.'
      );
    }
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

    const prePrCommand = "npm run verify:pre-pr";
    const preMergeCommand = "npm run verify:pre-merge";
    const checkedCommands = extractCheckedCommandCheckboxes(testEvidence);
    const checkedCommandSet = new Set(checkedCommands.map((command) => normalizeCommandName(command)));
    const prePrEvidence = extractVerifyEvidence(testEvidence, prePrCommand);
    const prePrChecked = checkedCommandSet.has(normalizeCommandName(prePrCommand));
    if (!prePrEvidence.status && !prePrChecked) {
      errors.push(buildMissingVerifyEvidenceMessage(testEvidence, prePrCommand));
    }

    const preMergeEvidence = extractVerifyEvidence(testEvidence, preMergeCommand);
    const preMergeChecked = checkedCommandSet.has(normalizeCommandName(preMergeCommand));
    if (!preMergeEvidence.status && !preMergeChecked) {
      errors.push(buildMissingVerifyEvidenceMessage(testEvidence, preMergeCommand));
    } else if (preMergeEvidence.status === "PASS" && !lineContainsHeadSha(preMergeEvidence.line, headSha)) {
      errors.push(
        'When `verify:pre-merge` is `PASS`, the same evidence line must include current PR head SHA (short or full).'
      );
    }

    for (const command of checkedCommands) {
      if (/verify:pre-pr/i.test(command)) {
        if (prePrEvidence.status !== "PASS") {
          errors.push(
            `Checked \`verify:pre-pr\` checkbox requires a matching PASS evidence line in the form ${buildStructuredEvidenceHint(
              prePrCommand
            )}`
          );
        }
        continue;
      }
      if (/verify:pre-merge/i.test(command)) {
        if (preMergeEvidence.status !== "PASS") {
          errors.push(
            `Checked \`verify:pre-merge\` checkbox requires a matching PASS evidence line on current HEAD in the form ${buildStructuredEvidenceHint(
              preMergeCommand
            )}`
          );
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

export async function validatePullRequestBodyWithApiRefresh(pullRequest, options = {}) {
  const maxAttempts = Math.max(1, options.maxAttempts ?? 4);
  const refreshDelayMs = Math.max(0, options.refreshDelayMs ?? 3000);
  const env = options.env ?? process.env;
  const onRetry = typeof options.onRetry === "function" ? options.onRetry : null;
  const fetchImpl = options.fetchImpl;
  const changedFilesOverride = options.changedFiles;
  let currentPullRequest = pullRequest;
  let attempts = 0;
  let errors = [];

  while (attempts < maxAttempts) {
    attempts += 1;
    currentPullRequest = await hydratePullRequestFromApi(currentPullRequest, {
      fetchImpl,
      env,
    });
    const changedFiles = changedFilesOverride ?? listChangedFilesForPullRequest(currentPullRequest);
    errors = validatePullRequestBody(currentPullRequest.body ?? "", {
      headSha: currentPullRequest.head?.sha ?? "",
      changedFiles,
    });

    if (errors.length === 0 || !shouldRetryPullRequestBodyValidation(errors) || attempts >= maxAttempts) {
      return {
        errors,
        attempts,
        pullRequest: currentPullRequest,
      };
    }

    onRetry?.({
      attempt: attempts,
      maxAttempts,
      errors,
      headSha: currentPullRequest.head?.sha ?? "",
    });
    await sleep(refreshDelayMs);
  }

  return {
    errors,
    attempts,
    pullRequest: currentPullRequest,
  };
}

async function main() {
  const payload = parseEventPayload();
  let pullRequest = payload?.pull_request;

  if (!pullRequest) {
    console.log("[pr-body-lint] No pull_request payload detected. Skipping.");
    return;
  }

  const { errors } = await validatePullRequestBodyWithApiRefresh(pullRequest, {
    onRetry: ({ attempt, maxAttempts }) => {
      console.log(
        `[pr-body-lint] Detected a stale PR body snapshot after push; retrying GitHub API refresh (${attempt}/${maxAttempts - 1}).`
      );
    },
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
  await main();
}
