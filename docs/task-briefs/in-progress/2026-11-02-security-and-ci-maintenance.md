# Task Brief: Security And CI Maintenance

## Metadata

- `id`: `2026-11-02-security-and-ci-maintenance`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-11-02`
- `updated`: `2026-11-02`
- `mode`: `end-to-end`
- `maintenance_issue`: `https://github.com/stianvikra/freeswimming/issues/1260`

## Brief Audit Record

- `last_audited`: `2026-11-02`
- `base`: `main@18fca537`
- `audit_status`: `ready`
- `decision`: Execute the owner-approved bounded security and CI maintenance round.
- `reason`: A fresh production audit reports five affected packages (one critical, three high, one moderate). Both nightly workflows fail before tests because Playwright 1.59.1 does not support the new Ubuntu 26.04 hosted runner.
- `must_refresh_before_execution_if`: Base, advisories, selected package versions, email transport contract, runner support, or release gates change.

## Goal

Remove the known production dependency vulnerabilities and restore the supported CI browser environment, with meaningful regression evidence and no product behavior redesign.

## Pre-Implementation Owner Explanation

Vi oppdaterer Next.js og e-postbiblioteket og retter miljøfeilen som stopper testene. Det tetter kjente sikkerhetshull og gjør kontrollene brukbare igjen. Øvrige oppgraderinger, produktendringer, nye avhengigheter og nye lokale verktøy holdes utenfor. Eier har bedt om gjennomføring og godkjent merge etter gode tester og grønne påkrevde kontroller.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`.
Critical targets: Business logic correctness and data integrity; Reliability and failure handling; Security and authz; Stack-fit and dependency discipline; Testing and QA automation; DevOps and rollback readiness.
Release gate: every target at least 4/5. `10/10 claim: no` until completion evidence establishes all critical targets at 5/5.

| Category                                      | Mapping    | Target threshold                                                                                                                                                                          | Evidence                                                             | Expected closeout score |
| --------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | supporting | No new product flow or route.                                                                                                                                                             | Scoped diff review.                                                  | 4/5                     |
| UX flow clarity                               | supporting | Existing email delivery states and errors preserved.                                                                                                                                      | Provider tests.                                                      | 4/5                     |
| Visual design quality                         | N/A        | No markup, CSS, assets, copy, or intentional rendering change.                                                                                                                            | Scope review.                                                        | N/A                     |
| Business logic correctness and data integrity | target     | Existing message IDs, provider selection, delivery outcomes and privacy-safe failures pass; real mail composition delivers only to the intended recipient for malicious address fixtures. | Email unit/integration regression tests; full gates.                 | 5/5                     |
| Admin editor ergonomics                       | N/A        | No editor or operator interaction change.                                                                                                                                                 | Scope review.                                                        | N/A                     |
| Accessibility (a11y)                          | supporting | Existing accessibility assertions remain enabled.                                                                                                                                         | Full Playwright gate.                                                | 4/5                     |
| Performance (CWV + payloads)                  | target     | Every existing public route budget passes with no threshold relaxation or new dependency; performance trend remains hold until fresh qualifying weekly evidence.                          | Production performance gate; trend command.                          | 5/5                     |
| Data placement and sync boundaries            | supporting | No schema, browser persistence, sync or ownership change.                                                                                                                                 | Lockfile/workflow-only runtime diff.                                 | 4/5                     |
| Caching and invalidation strategy             | supporting | Retain existing cache configuration; install upstream security fixes without adding a cache mode.                                                                                         | Next upgrade review; full gate.                                      | 4/5                     |
| Reliability and failure handling              | target     | Browser installation and all existing test assertions run on supported Ubuntu 24.04; no new skips, disabled assertions, or rerun-only fix.                                                | Original failure logs; branch Nightly E2E and Admin E2E.             | 5/5                     |
| Security and authz                            | target     | Production audit has zero findings; full-tree audit has zero high/critical findings; protected negative paths pass. Development-only moderate findings have an owner and review date.     | Fresh audit; mail adversarial fixtures; security/private-gate tests. | 4/5                     |
| Privacy and compliance                        | supporting | No real email sent, no secret output, and no processor or data-purpose change.                                                                                                            | In-memory stream transport; diff review.                             | 4/5                     |
| Content governance                            | supporting | Brief records scope, provider references, holds, tests, rollback and checkpoint.                                                                                                          | Brief lint; PR evidence.                                             | 4/5                     |
| Admin workflow and editability                | supporting | Existing authenticated admin tests continue without workflow changes.                                                                                                                     | Branch Admin E2E.                                                    | 4/5                     |
| SEO and crawlability                          | supporting | Existing sitemap, metadata and site-lock assertions remain enabled.                                                                                                                       | Full gate.                                                           | 4/5                     |
| AI discoverability                            | N/A        | No structured data or public content change.                                                                                                                                              | Scope review.                                                        | N/A                     |
| Analytics and KPI observability               | N/A        | No telemetry taxonomy, payload or metric change.                                                                                                                                          | Scope review.                                                        | N/A                     |
| Commerce and revenue ops                      | N/A        | No payment, entitlement, invoice or Stripe change.                                                                                                                                        | Scope review.                                                        | N/A                     |
| Incident response and support operations      | target     | Record original runner failure, supported-image recovery, dependency audit path and rollback; no secrets/raw provider messages in evidence.                                               | Maintenance runbook; debug log; gate results.                        | 5/5                     |
| Finance and reporting operations              | N/A        | This scope changes packages and CI only; no pricing, payments, refunds, invoices or financial reports.                                                                                    | Explicit finance scope exclusion.                                    | N/A                     |
| i18n operational readiness                    | N/A        | No locale, user-facing string, content model or translated route change; mail recipient fixtures use protocol addresses only.                                                             | Explicit locale scope exclusion.                                     | N/A                     |
| Stack-fit and dependency discipline           | target     | Next and eslint-config-next match at 16.4.3; Nodemailer 10.3.1 migration is explicit; no new direct dependencies or unrelated major upgrade.                                              | Installed tree; lockfile; official references; full gates.           | 5/5                     |
| Testing and QA automation                     | target     | Relevant mail regression tests, all unit tests, public/private/security browser gates, required CI, pre-PR and pre-merge pass with no new skip.                                           | Test logs and GitHub runs.                                           | 5/5                     |
| Scalability and cost efficiency               | supporting | Restore actual browser tests without extra scheduled jobs or more frequent execution.                                                                                                     | Workflow diff.                                                       | 4/5                     |
| DevOps and rollback readiness                 | target     | Branch current with origin/main; full pre-PR/pre-merge and required CI green; rollback is one commit revert with no database migration.                                                   | Git history; gates; PR checks.                                       | 5/5                     |

## Stack / Architecture Best-Practice Gate

- React/Next: update existing App Router runtime and matching lint configuration together. Read installed version-matched upgrade documentation before editing and after package installation. Reuse all existing components/routes; no cache configuration or server/client boundary changes.
- TypeScript: keep the typed `MessageDeliveryProvider` / `SmtpTransport` adapter and existing validation/error model. Exercise the real Nodemailer composer through its public stream transport, without external SMTP or private SDK internals.
- External services: Nodemailer 10 is a deliberate security migration from 9.0.6, since fixes extend past the 9.x line. Existing SMTP timeouts, deterministic attempt message IDs, credential boundaries, retry classification and redaction remain canonical. No credentials, webhooks, delivery retry policy, or live provider writes change.
- Supabase: N/A; no schema, migration, auth/RLS, generated types or operational data write in this implementation. The earlier owner-requested Habit reset was a separate completed operation.
- CI: update Playwright within 1.x to 1.64.1 with matching browser builds after the full local matrix exposed old WebKit fixture teardown hangs. Preserve the existing browser matrix, assertions and skip eligibility. Pin browser-dependent jobs to supported Ubuntu 24.04 instead of accepting an unreviewed `ubuntu-latest` distribution migration. Unrelated non-browser jobs stay unchanged.
- Tests: real mail composition adversarial fixtures plus existing provider success/failure tests; existing full local/CI gates. No rendered-product change means screenshot approval is N/A; do not fix new product UI under this brief.
- Lint compatibility exception: Next 16.4.3 requires Hooks plugin >=7.1, whose updated compiler analysis exposes 124 existing component errors. These rule names already existed in 7.0.1; this is an explicit temporary deferral of five diagnostic families, not a claim that the rules were previously absent. Retain the core Rules of Hooks error, exhaustive-deps warning and every other current/future preset rule; prove the core checks with a real ESLint fixture. No product component refactor or runtime compiler adoption belongs here. Architectural destination and acceptance criteria live in `docs/task-briefs/planned/2026-11-02-react-compiler-lint-adoption.md`.
- Performance: `/`, `/plans`, `/course`, `/my-library` must retain the canonical `scripts/run-perf-budget-check.mjs` limits: LCP <=2500 ms, CLS <=0.1, TBT <=200 ms, JS <=380 KB, CSS <=150 KB, requests <=130. No relaxation or stretch-target tightening in this round.

## Official Compatibility References

- [Next security advisory](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr) and [16.4.3 release](https://github.com/vercel/next.js/releases/tag/v16.4.3); installed version-matched Next 16 upgrade guide read before and after installation.
- [Nodemailer 10 migration](https://github.com/nodemailer/nodemailer/releases/tag/v10.0.0): Node >=20, TypeScript/CommonJS/ESM distribution; repository Node 24 already satisfies the requirement and the existing public SMTP adapter remains applicable.
- [Nodemailer nested-comment advisory](https://github.com/nodemailer/nodemailer/security/advisories/GHSA-8c8m-p3m8-cjg8), [group-delimiter advisory](https://github.com/nodemailer/nodemailer/security/advisories/GHSA-m943-m63m-w62w), and [10.3.1 release](https://github.com/nodemailer/nodemailer/releases/tag/v10.3.1). Fixtures inspect the envelope rather than only the display header.
- Installed Playwright 1.59.1 platform support and failed job logs explain the original Ubuntu 26.04 failure. [Playwright 1.64.1](https://github.com/microsoft/playwright/releases/tag/v1.64.1) and current system requirements support Ubuntu 24.04/26.04; retain the explicit 24.04 image after updating the tool rather than restoring a moving OS alias.

## Capability And Stack Radar

| Capability              | Evidence                           | Status    | Use                                               | Boundary                                        |
| ----------------------- | ---------------------------------- | --------- | ------------------------------------------------- | ----------------------------------------------- |
| Shell, Node 24, npm, gh | Current session and repo bootstrap | available | Install exact packages, test, git and Actions API | No credential output or local tool installation |
| GitHub connector        | Session metadata                   | available | Read PRs/jobs/logs                                | No configuration capability for security alerts |
| Official web sources    | Maintainer advisories/releases     | available | Current package and runner evidence               | Primary sources only                            |
| Native browser          | Earlier session evidence           | blocked   | PR opening only if available                      | No browser needed for implementation or CI      |

| Finding                                                   | Classification               | Decision / return path                                                                                           |
| --------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Vulnerable Next/Nodemailer and transitive packages        | bounded implementation child | Execute this brief, then return to monthly issue #1260.                                                          |
| Playwright unsupported Ubuntu 26.04 runner                | bounded implementation child | Repair supported CI environment in this brief.                                                                   |
| Three stale dependency PRs and disabled Dependabot alerts | safe process/docs update     | Record as deferred maintenance evidence; do not merge stale updates or silently expand GitHub token permissions. |

No new Codex skills/plugins/MCP servers are installed or configured.

## Domain Granularity Contract

- Mental object: one outbound admin notification/reply, represented by `MessageDeliveryPayload` and an append-only delivery attempt.
- Canonical objects: existing message and attempt IDs; SMTP envelope recipients, sender/reply-to, headers, text and deterministic message ID are child fields.
- Reference: `lib/admin/message-delivery.ts` and `tests/unit/admin-message-delivery.test.ts`.
- Levels: provider configuration and delivery outcome (`view`/`reconcile` in tests); envelope recipient/header/message child fields (`view`/`reconcile` in real composer tests). Product create/edit/delete/reorder and persisted attempt mutation are out of scope.
- No summary-only substitute: tests inspect actual composed envelope and MIME output using in-memory transport. No real mailbox receives test messages.

## Data Placement And Sync Contract

Server-canonical message/attempt records and existing provider writes remain unchanged. Test-only fixtures and composed mail stay in process memory. No new local persistence, sync, conflict resolution, cache invalidation, retention, or operational database mutation.

## Identity And Rename Contract

Existing immutable message, attempt and provider identifiers retain their meaning and deterministic SMTP message-ID mapping. No identifiers, routes, workflow names, labels or support actions are renamed or repurposed; no alias or migration is required.

## Forward Compatibility Contract

- Existing generic delivery adapter handles future subjects, message text, configured display names and validated recipients without a current-user/product allowlist. Adversarial recipient fixtures and the existing invalid-provider/invalid-payload cases prove the boundary.
- Future dependency majors, pre-1.0 API changes, new provider adapters and runner OS upgrades require an explicit compatibility review and mapping/test updates; npm `latest` is discovery evidence, not automatic approval.
- Pinning Ubuntu 24.04 makes future `ubuntu-latest` changes irrelevant to browser jobs. A future runner upgrade must be paired with a Playwright-supported image and fresh full-matrix/negative-path evidence.
- Unknown provider/config/payload values retain the existing fail-closed disabled/failure outcome and redacted diagnostics. No silent fallback to another recipient or provider.
- Checklist source: `docs/runbooks/task-brief-forward-compatibility-contract.md`.

## Scope

- `package.json` / lockfile: Next and lint config 16.4.3, Nodemailer 10.3.1, Playwright 1.64.1 with matching managed browsers, their required dependency closure, and targeted compatible transitive security refreshes (`sharp`, `source-map-js`, `baseline-browser-mapping`; development-only `brace-expansion`, `js-yaml`, `undici`, `vite`). Other direct toolchain versions remain unchanged.
- Browser-dependent jobs in CI, Nightly E2E and Admin E2E use Ubuntu 24.04.
- Meaningful real-composer recipient regression tests in the existing email test surface.
- An explicit bounded React Compiler lint exception and a real lint-baseline fixture; record the component migration as a planned follow-up rather than rewriting unrelated UI.
- Maintenance/testing documentation, repeated-failure debug log and this brief.
- Retain the canonical Next-generated `AGENTS.md` heading normalization inside its managed markers; repository-specific instructions are unchanged.
- Full validation, commit, push, PR, required checks, pre-merge, owner-authorized merge and non-destructive cleanup. Exactly one repo-managed docs-only closeout may follow under repository rules.

## Out Of Scope

React, Tailwind, Supabase, Stripe, TypeScript, Node, ESLint, GitHub Action or other broad update waves; new product UI; runtime behavior redesign; DB/auth/commerce changes; secret rotation; credential scope expansion; dependency-queue closure or merge; new CI skips; performance-budget changes.

## Help/Guide And Support Impact

Help/Guide N/A: no user/admin action, label, recovery behavior or product workflow changes. Maintainer runbooks and testing strategy document the supported CI image and audit-first package maintenance path. Sweep the touched workflow/image and maintenance references before the first broad gate.

## Route, Label, And Support-Surface Impact Sweep

- Identifiers searched: `ubuntu-latest`, `ubuntu-24.04`, `16.3.3`, `9.0.6`, `Monthly Maintenance Reminder`, and `Playwright 1.59.1`.
- Directories/surfaces checked: `app/`, `components/`, `tests/`, `docs/` including Help/Guide, runbooks and all brief lifecycle folders, `scripts/`, `.github/` and `package.json`. No product/test/runtime identifier references need migration; matches are in workflows and maintainer/historical documentation.
- Fallout handled: browser-dependent runner images updated together; testing strategy, maintenance cadence and debug log explain the supported environment and audit path. Workflow names, routes, labels, product actions and Help/Guide assertions stay valid.
- Intentional leftovers: historical completed briefs retain the versions they actually shipped; non-browser workflows and lightweight sentinel/preflight jobs may continue using `ubuntu-latest`.
- Targeted tests: 18 email provider/composer tests pass. A separate in-memory comparison confirms all four attack fixtures fail the recipient/domain boundary under old Nodemailer 9.0.6 and pass under 10.3.1.
- The first pre-PR attempt stopped at missing explicit sweep evidence in this brief, before runtime gates; the sweep is now recorded here for the confirming run.

## Acceptance Criteria

1. Fresh branch from main@18fca537 with scoped package/workflow/docs/test diff.
2. Next/config resolve at 16.4.3 and Nodemailer at 10.3.1; production audit has no high/critical finding and named moderate transitive finding is removed.
3. Existing SMTP/provider success, invalid-config, invalid-payload, authentication-failure and diagnostic-redaction tests pass, plus real-composer recipient attack fixtures.
4. Browser-dependent CI jobs use a supported fixed image; branch nightly/admin runs actually reach and pass their existing test steps.
5. `npm run verify:pre-pr`, required CI and `npm run verify:pre-merge` pass without weakening assertions, adding skips or relaxing budgets.
6. Merge only after the owner's explicit instruction and green gates; record final SHA, sync, cleanup, post-merge preflight and chat-handoff decision.

## Validation And Rollback

- Exact package install / clean `npm ci` under repo Node 24; installed-tree and production audit check.
- Targeted Vitest email tests; lint:briefs; diff check; full pre-PR/pre-merge lanes (including build, performance budgets, unit and browser coverage).
- GitHub required CI/CodeQL/Vercel checks plus branch-dispatched Nightly E2E and Admin E2E.
- Existing perf trend: hold (one fresh qualifying weekly run; no tightening).
- Rollback: revert the maintenance merge commit, restore locked dependencies and reinstall. No data rollback or schema migration; reverting packages restores known vulnerability exposure and is emergency-only pending a corrected patch.

## Checkpoint Log

- `2026-11-02 | main@18fca537 | Fresh audit: five affected production packages; three open dependency PRs (grouped PR #1243 conflicts and is outdated); CodeQL zero open alerts; Dependabot alert endpoint reports disabled (403); perf trend hold. Latest Nightly/Admin logs prove Ubuntu 26.04 + Playwright 1.59.1 mismatch before tests. Owner approved execution and merge after good tests. | Next: scoped package install, mail regression fixtures and supported CI image.`
- `2026-11-02 | working tree on main@18fca537 | Next/config 16.4.3 and Nodemailer 10.3.1 installed; production audit now zero vulnerabilities; 18 email tests and strict typecheck pass. Real-composer fixtures prove ordinary/future display names, nested comments, group delimiters and quoted-local-part domain safety. A clean npm ci exposed four development-only high transitive findings; include only their compatible lockfile fixes, without changing direct toolchain versions. | Next: verify complete audit, clean install and full release gates.`
- `2026-11-02 | working tree on main@18fca537 | Clean npm ci passes. Production audit: 0 vulnerabilities. Full-tree audit: 0 high/critical, 20 moderate development-only affected packages, largely propagated lint/test toolchain findings; do not apply npm's suggested ESLint 4 / eslint-config-next 0.2.4 downgrade. Hold remaining toolchain migrations for owner stianvikra at the next maintenance review, no later than 2026-12-01. Direct toolchain majors remain unchanged. Scope/support sweep confirms unchanged workflow names, routes, labels and product actions; only browser-dependent runner images and maintainer guidance change. | Next: full verify:pre-pr, PR checks and pre-merge.`
- `2026-11-02 | working tree on main@18fca537 | Full pre-PR reaches lint and exposes 124 pre-existing component diagnostics newly enabled by the mandatory Hooks 7.1 preset (111 effect-state, 6 purity, 3 refs, 2 immutability, 2 manual-memoization). Preserve existing baseline controls, keep remaining preset rules enabled, and record a dated component-migration follow-up; no broad product rewrite. Separate old/new package comparison proves all four malicious mail fixtures fail under 9.0.6 and pass under 10.3.1. | Next: targeted real ESLint regression test, then full gate.`
- `2026-11-02 | working tree on main@18fca537 | First runtime pre-PR: 266 unit files / 2074 tests pass; build and all public performance budgets pass. Full browser matrix: 111 pass, 570 pre-existing skips, 3 failures, all WebKit context.close teardown timeouts after existing project-ineligible skips. No product assertion ran in those three cases. One targeted unchanged rerun gives the expected 6 skipped cases with no teardown failure, confirming fixture instability. Extend only the test-tool scope to Playwright 1.64.1 and matching browsers; preserve test bodies, assertions, eligibility and timeouts. | Next: clean install, targeted browser validation and a fresh full gate.`
- `2026-11-02 | implementation checkpoint | Playwright 1.64.1 and matching Chromium/Firefox/WebKit install cleanly. Targeted unit/lint-fixture tests: 19 pass; TypeScript passes; targeted browser setup/mobile smoke: 4 pass / 26 existing eligibility skips. No E2E assertion, timeout, retry or eligibility changed. Rechecked Hooks 7.0.1 source: rule names already existed, so the five diagnostic-family exceptions are recorded explicitly as a temporary architectural gap, with no blanket exclusion of other/future rules. | Next: commit the scoped checkpoint, run full verify:pre-pr on that exact commit, then push/PR/CI/pre-merge.`
