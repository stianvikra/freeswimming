#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { collectChangedFiles, resolveBaseRef } from "./verification-scope.mjs";

const DOCS_ONLY_ALLOWED_PATTERNS = [
  /^docs\//,
  /^AGENTS\.md$/,
  /^README\.md$/,
  /^CONTRIBUTING\.md$/,
  /^\.github\/pull_request_template\.md$/,
  /^supabase\/README\.md$/,
];

const IN_PROGRESS_BRIEF_PATTERN = /^docs\/task-briefs\/in-progress\/.+\.md$/;

function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "").trim();
}

function uniqueSorted(items) {
  return Array.from(new Set(items.filter(Boolean).map(normalizePath))).sort((left, right) =>
    left.localeCompare(right)
  );
}

function normalizeText(text) {
  return text.toLowerCase().replace(/\s+/g, " ");
}

function matchesAny(filePath, patterns) {
  return patterns.some((pattern) => pattern.test(filePath));
}

export function isDocsOnlyEligibleQualityGatePath(filePath) {
  const normalizedPath = normalizePath(filePath);
  return DOCS_ONLY_ALLOWED_PATTERNS.some((pattern) => pattern.test(normalizedPath));
}

export const CHANGE_CLASSES = [
  {
    id: "docs_governance",
    label: "Docs and governance",
    patterns: [
      /^docs\//,
      /^AGENTS\.md$/,
      /^README\.md$/,
      /^CONTRIBUTING\.md$/,
      /^\.github\/pull_request_template\.md$/,
    ],
    scorecardCategories: ["Content governance", "Testing and QA automation"],
  },
  {
    id: "quality_policy",
    label: "Quality policy and scorecard",
    patterns: [
      /^docs\/quality\//,
      /^docs\/task-brief-template\.md$/,
      /^scripts\/quality-gate-evidence\.mjs$/,
      /^scripts\/lint-task-brief-scorecard\.mjs$/,
    ],
    scorecardCategories: [
      "Product goals and IA",
      "Stack-fit and dependency discipline",
      "Testing and QA automation",
      "DevOps and rollback readiness",
    ],
  },
  {
    id: "ui_layout_brand",
    label: "UI, layout, and brand",
    patterns: [
      /^app\/(?!api\/).+\.(tsx|ts|css)$/,
      /^components\/.+\.(tsx|ts|css)$/,
      /^public\/(logos|images|fonts)\//,
      /^tailwind\.config\./,
      /^app\/globals\.css$/,
    ],
    scorecardCategories: [
      "UX flow clarity",
      "Visual design quality",
      "Accessibility (a11y)",
      "Performance (CWV + payloads)",
    ],
  },
  {
    id: "print_export_screenshot",
    label: "Print, PDF, export, and screenshot",
    patterns: [
      /(^|\/)(export|pdf|print|screenshot|poolside-preview|poolside-image)/i,
      /^tests\/e2e\/.*(export|pdf|print|screenshot|poolside)/i,
      /^tests\/unit\/.*(export|pdf|print|screenshot|poolside)/i,
    ],
    scorecardCategories: [
      "Visual design quality",
      "Reliability and failure handling",
      "Testing and QA automation",
    ],
  },
  {
    id: "session_step_domain",
    label: "Session-step, workout, and program domain",
    patterns: [
      /^components\/my-library\/workouts\//,
      /^components\/my-library\/programs\//,
      /^lib\/workouts\//,
      /^lib\/programs\//,
      /^lib\/session-generator-v1\//,
      /^docs\/design\/session-step-surface-contract\.md$/,
      /^tests\/unit\/.*(session-step|workout|program|session-generator)/,
      /^tests\/e2e\/.*(workout|program|session)/,
    ],
    scorecardCategories: [
      "Business logic correctness and data integrity",
      "Content governance",
      "Stack-fit and dependency discipline",
    ],
  },
  {
    id: "route_label_support",
    label: "Route, label, support, and Help/Guide surfaces",
    patterns: [
      /^app\/(?!api\/)/,
      /^docs\/runbooks\//,
      /^docs\/guides\//,
      /^components\/guides\//,
      /^tests\/.*(route|nav|help|guide|support|label)/i,
    ],
    scorecardCategories: [
      "Product goals and IA",
      "UX flow clarity",
      "Content governance",
      "Incident response and support operations",
    ],
  },
  {
    id: "api_server",
    label: "API and server actions",
    patterns: [/^app\/api\//, /^lib\/.+server/, /\/route\.ts$/],
    scorecardCategories: [
      "Business logic correctness and data integrity",
      "Reliability and failure handling",
      "Security and authz",
    ],
  },
  {
    id: "auth_security",
    label: "Auth, RBAC, RLS, and security",
    patterns: [
      /auth|rbac|rls|security|site-lock|middleware|origin|csrf|password|passkey/i,
      /^supabase\/migrations\//,
      /^tests\/.*(auth|security|site-lock|private-gate|access)/i,
    ],
    scorecardCategories: [
      "Security and authz",
      "Privacy and compliance",
      "Reliability and failure handling",
    ],
  },
  {
    id: "data_schema",
    label: "Data, schema, migration, and sync",
    patterns: [/^supabase\//, /^types\/database\.ts$/, /schema|migration|database|sync/i],
    scorecardCategories: [
      "Data placement and sync boundaries",
      "Caching and invalidation strategy",
      "Business logic correctness and data integrity",
    ],
  },
  {
    id: "external_services",
    label: "External services and SDK integrations",
    patterns: [/stripe|resend|garmin|openai|webhook|sdk|email|checkout|portal/i],
    scorecardCategories: [
      "Commerce and revenue ops",
      "Security and authz",
      "Incident response and support operations",
    ],
  },
  {
    id: "analytics_kpi",
    label: "Analytics and KPI",
    patterns: [/analytics|kpi|tracked|event/i],
    scorecardCategories: [
      "Analytics and KPI observability",
      "Privacy and compliance",
      "Content governance",
    ],
  },
  {
    id: "commerce_finance",
    label: "Commerce, finance, entitlement, and reporting",
    patterns: [/stripe|checkout|billing|invoice|refund|entitlement|finance|reconcile|catalog|price/i],
    scorecardCategories: [
      "Commerce and revenue ops",
      "Finance and reporting operations",
      "Security and authz",
    ],
  },
  {
    id: "performance_cost",
    label: "Performance, payload, scale, and cost",
    patterns: [/perf|budget|lighthouse|bundle|payload|cost|scale|next\.config|package\.json/i],
    scorecardCategories: [
      "Performance (CWV + payloads)",
      "Scalability and cost efficiency",
      "DevOps and rollback readiness",
    ],
  },
  {
    id: "i18n_content",
    label: "i18n and copy readiness",
    patterns: [/i18n|locale|language|metadata|copy|label|email-template/i],
    scorecardCategories: ["i18n operational readiness", "Content governance", "SEO and crawlability"],
  },
  {
    id: "devops_tooling",
    label: "DevOps, scripts, config, and tooling",
    patterns: [
      /^scripts\//,
      /^package\.json$/,
      /^package-lock\.json$/,
      /^\.github\/workflows\//,
      /^playwright\.config\./,
      /^vitest\.config\./,
      /^eslint\.config\./,
      /^tsconfig\.json$/,
    ],
    scorecardCategories: [
      "Testing and QA automation",
      "Stack-fit and dependency discipline",
      "DevOps and rollback readiness",
    ],
  },
  {
    id: "testing_qa",
    label: "Testing and QA automation",
    patterns: [/^tests\//, /^playwright\.config\./, /^vitest\.config\./],
    scorecardCategories: ["Testing and QA automation", "Reliability and failure handling"],
  },
];

const POLICY_REQUIREMENTS = {
  quality_policy: [
    {
      label: "quality policy matrix",
      any: ["policy matrix", "quality-gate", "scorecard", "gate matrix"],
    },
    {
      label: "rollback/devops evidence",
      any: ["rollback", "devops", "reversible"],
    },
  ],
  ui_layout_brand: [
    {
      label: "reference surface or shared UI contract",
      any: ["reference surface", "reference-surface", "shared component", "view-model"],
    },
    {
      label: "screenshot evidence path",
      any: ["screenshot", "artifact", "visual qa"],
    },
  ],
  print_export_screenshot: [
    {
      label: "artifact-level validation",
      any: ["artifact", "screenshot", "pdf", "export", "print"],
    },
    {
      label: "high-cost UI/export debug path",
      any: ["ui-debug-hypothesis-and-handoff", "high-cost", "actual consumed artifact"],
    },
  ],
  session_step_domain: [
    {
      label: "session-step reference contract",
      any: ["docs/design/session-step-surface-contract.md", "session-step", "shared renderer"],
    },
    {
      label: "domain invariant evidence",
      any: ["invariant", "deterministic", "canonical"],
    },
  ],
  route_label_support: [
    {
      label: "route/label/support sweep",
      any: [
        "route-label-support-surface-impact-sweep",
        "impact sweep",
        "help/guide",
        "support surface",
      ],
    },
  ],
  api_server: [
    {
      label: "failure and negative-path evidence",
      any: ["negative-path", "negative path", "fail-closed", "401", "403"],
    },
    {
      label: "validation/invariant contract",
      any: ["validation", "invariant", "deterministic"],
    },
  ],
  auth_security: [
    {
      label: "fail-closed security evidence",
      any: ["fail-closed", "negative-path", "negative path", "authz", "unauthorized"],
    },
    {
      label: "privacy/secrets boundary",
      any: ["secret", "privacy", "sensitive", "no secrets"],
    },
  ],
  data_schema: [
    {
      label: "data boundary and migration evidence",
      any: ["server-canonical", "migration", "rls", "data placement", "sync"],
    },
    {
      label: "cache/invalidation evidence",
      any: ["cache", "invalidation", "freshness"],
    },
  ],
  external_services: [
    {
      label: "official integration pattern",
      any: ["official", "sdk", "webhook", "idempotency", "retry"],
    },
    {
      label: "support diagnostics",
      any: ["observability", "diagnostic", "support"],
    },
  ],
  analytics_kpi: [
    {
      label: "safe event evidence",
      any: ["event", "analytics", "kpi", "no-pii", "safe payload"],
    },
  ],
  commerce_finance: [
    {
      label: "commerce and reconciliation evidence",
      any: ["stripe", "entitlement", "checkout", "reconciliation", "finance"],
    },
  ],
  performance_cost: [
    {
      label: "performance and cost evidence",
      any: ["performance", "budget", "payload", "cost", "scale"],
    },
  ],
  i18n_content: [
    {
      label: "i18n readiness evidence",
      any: ["i18n", "locale", "localization", "translation"],
    },
  ],
  devops_tooling: [
    {
      label: "tooling validation evidence",
      any: ["targeted unit", "script tests", "verify:pre-pr", "testing"],
    },
    {
      label: "rollback/devops evidence",
      any: ["rollback", "devops", "reversible"],
    },
  ],
  testing_qa: [
    {
      label: "test evidence mapping",
      any: ["targeted tests", "targeted unit", "testing", "qa automation"],
    },
  ],
};

function classifyFile(filePath) {
  const normalizedPath = normalizePath(filePath);
  const matchedClasses = CHANGE_CLASSES.filter((changeClass) =>
    matchesAny(normalizedPath, changeClass.patterns)
  );

  if (matchedClasses.length === 0) {
    return [
      {
        id: "unknown_runtime",
        label: "Unknown runtime or repository surface",
        scorecardCategories: [
          "Stack-fit and dependency discipline",
          "Testing and QA automation",
          "DevOps and rollback readiness",
        ],
      },
    ];
  }

  return matchedClasses.map(({ id, label, scorecardCategories }) => ({
    id,
    label,
    scorecardCategories,
  }));
}

export function classifyQualityGateChanges(changedFiles) {
  const normalizedFiles = uniqueSorted(changedFiles);
  const classMap = new Map();

  for (const filePath of normalizedFiles) {
    for (const changeClass of classifyFile(filePath)) {
      const current = classMap.get(changeClass.id) ?? {
        id: changeClass.id,
        label: changeClass.label,
        files: [],
        scorecardCategories: changeClass.scorecardCategories,
      };
      current.files.push(filePath);
      classMap.set(changeClass.id, current);
    }
  }

  return Array.from(classMap.values()).sort((left, right) => left.id.localeCompare(right.id));
}

function readBriefRecordsFromChangedFiles(changedFiles) {
  return uniqueSorted(changedFiles)
    .filter((filePath) => IN_PROGRESS_BRIEF_PATTERN.test(filePath) && existsSync(filePath))
    .map((filePath) => ({
      path: filePath,
      content: readFileSync(filePath, "utf8"),
    }));
}

function hasAnyKeyword(text, keywords) {
  const normalized = normalizeText(text);
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function getRequiredEvidence(classes, options = {}) {
  const docsOnly = options.docsOnly === true;
  const enforceableClasses = docsOnly
    ? classes.filter((changeClass) => changeClass.id === "quality_policy")
    : classes;

  return enforceableClasses.flatMap((changeClass) =>
    (POLICY_REQUIREMENTS[changeClass.id] ?? []).map((requirement) => ({
      changeClassId: changeClass.id,
      changeClassLabel: changeClass.label,
      ...requirement,
    }))
  );
}

export function buildQualityGateReport(options) {
  const changedFiles = uniqueSorted(options.changedFiles ?? []);
  const classes = classifyQualityGateChanges(changedFiles);
  const briefRecords = options.briefRecords ?? readBriefRecordsFromChangedFiles(changedFiles);
  const activeBriefText = briefRecords.map((brief) => brief.content).join("\n\n");
  const nonDocsFiles = changedFiles.filter(
    (filePath) => !isDocsOnlyEligibleQualityGatePath(filePath)
  );
  const requiredEvidence = getRequiredEvidence(classes, { docsOnly: nonDocsFiles.length === 0 });
  const errors = [];
  const missingEvidence = [];
  const humanJudgmentRequired = [];

  if (changedFiles.length === 0) {
    return {
      ok: true,
      changedFiles,
      classes,
      briefRecords,
      nonDocsFiles,
      requiredEvidence,
      missingEvidence,
      humanJudgmentRequired: [
        "No changed files were detected; no quality evidence requirements were triggered.",
      ],
      errors,
    };
  }

  if (nonDocsFiles.length > 0 && briefRecords.length === 0) {
    errors.push(
      "Non-docs changes require a changed `docs/task-briefs/in-progress/...` brief so quality evidence is reviewable."
    );
  }

  for (const evidence of requiredEvidence) {
    if (!activeBriefText) {
      missingEvidence.push(evidence);
      continue;
    }

    if (!hasAnyKeyword(activeBriefText, evidence.any)) {
      missingEvidence.push(evidence);
    }
  }

  if (missingEvidence.length > 0) {
    for (const evidence of missingEvidence) {
      errors.push(
        `${evidence.changeClassLabel} is missing brief evidence for ${evidence.label}. Expected one of: ${evidence.any.join(
          ", "
        )}.`
      );
    }
  }

  const triggeredCategoryNames = Array.from(
    new Set(classes.flatMap((changeClass) => changeClass.scorecardCategories))
  ).sort((left, right) => left.localeCompare(right));

  for (const category of triggeredCategoryNames) {
    humanJudgmentRequired.push(
      `${category}: confirm the evidence is materially sufficient, not only keyword-present.`
    );
  }

  return {
    ok: errors.length === 0,
    changedFiles,
    classes,
    briefRecords,
    nonDocsFiles,
    requiredEvidence,
    missingEvidence,
    humanJudgmentRequired,
    errors,
  };
}

function parseArgs(argv) {
  let base = process.env.VERIFICATION_BASE_REF || "main";
  let printJson = false;
  let printSummary = false;
  let assertGate = false;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--base") {
      base = argv[index + 1] ?? base;
      index += 1;
      continue;
    }

    if (token === "--json") {
      printJson = true;
      continue;
    }

    if (token === "--summary") {
      printSummary = true;
      continue;
    }

    if (token === "--assert") {
      assertGate = true;
      continue;
    }
  }

  return { base, printJson, printSummary, assertGate };
}

function printSummary(report, baseRef) {
  console.log(`[quality-gate] Base ref: ${baseRef}`);
  console.log(`[quality-gate] Changed files: ${report.changedFiles.length}`);
  console.log(`[quality-gate] Active in-progress briefs: ${report.briefRecords.length}`);

  if (report.classes.length > 0) {
    console.log("[quality-gate] Change classes:");
    for (const changeClass of report.classes) {
      console.log(`- ${changeClass.label} (${changeClass.id}): ${changeClass.files.length} file(s)`);
    }
  }

  if (report.requiredEvidence.length > 0) {
    console.log("[quality-gate] Required evidence:");
    for (const evidence of report.requiredEvidence) {
      const missing = report.missingEvidence.includes(evidence) ? "missing" : "present";
      console.log(`- ${evidence.changeClassLabel}: ${evidence.label} [${missing}]`);
    }
  }

  if (report.humanJudgmentRequired.length > 0) {
    console.log("[quality-gate] Human judgment still required:");
    for (const item of report.humanJudgmentRequired) {
      console.log(`- ${item}`);
    }
  }

  if (report.errors.length > 0) {
    console.log("[quality-gate] FAIL");
    for (const error of report.errors) {
      console.log(`- ${error}`);
    }
    return;
  }

  console.log("[quality-gate] PASS");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseRef = resolveBaseRef(args.base);
  const report = buildQualityGateReport({
    changedFiles: collectChangedFiles(baseRef),
  });

  if (args.printJson) {
    console.log(JSON.stringify({ baseRef, ...report }, null, 2));
  } else if (args.printSummary || args.assertGate) {
    printSummary(report, baseRef);
  } else {
    console.log(report.ok ? "Quality gate evidence requirements passed." : report.errors[0]);
  }

  if (args.assertGate && !report.ok) {
    process.exit(1);
  }
}

const entryHref = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entryHref) {
  main();
}
