# Task Brief: Security And Resume Baseline (10/10)

## Metadata

- `id`: `2026-08-31-security-and-resume-baseline-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-08-31`
- `updated`: `2026-08-31`
- `mode`: `end-to-end implementation maintenance`

## Brief Audit Record

- `last_audited`: `2026-08-31`
- `base`: `main@9dec3baa`
- `audit_status`: `ready`
- `decision`: Execute one bounded security and release-baseline repair before new product work.
- `reason`: Fresh audit evidence found security-patched direct dependencies, two open CodeQL high alerts, repeatedly failing Admin nightly E2E, and overly broad local secret-file permissions while local `main` remains clean and equal to `origin/main`.
- `must_refresh_before_execution_if`: `origin/main`, the affected dependency advisories, the two CodeQL alerts, Admin E2E workflow/contracts, or the repo release-gate scripts change before execution completes.

## Goal

Restore a trustworthy security and CI baseline by applying the smallest compatible dependency patches, closing the known CodeQL findings, stabilizing current Admin E2E contracts, restoring the already-authored lesson-create success feedback and unchanged-save behavior exposed by the authenticated gate, and proving the result through the full release-gate lane.

## Pre-Implementation Owner Explanation

Codex will secure the local environment files, update the concrete security-exposed packages, fix the two known CodeQL findings, and make the Admin nightly tests reflect the current product safely. The authenticated gate also exposed that the existing lesson-create confirmation was cleared while opening the editor and that an unchanged lesson save created an unnecessary request/revision; this bounded repair restores both intended feedback contracts without changing their copy, action, or layout. This matters because feature work should not continue on top of known security, data-integrity, and CI debt. TypeScript 7, Node 26, ESLint 10, redesign, new product behavior beyond those existing feedback contracts, broad dependency modernization, secret rotation, and environment-value consolidation are intentionally out of scope.

## Why This Brief Exists

- `npm audit --omit=dev` on the audited base reported six high-severity affected packages, including direct `next` and `nodemailer` dependencies plus transitive `nanoid`, `postcss`, `sharp`, and `ws` paths.
- Next `16.3.3` and current compatible Supabase patch versions provide bounded same-major remediation. Nodemailer has no patched `8.x`; owner-approved `9.0.6` is required because the reviewed high-severity advisory affects every release through `9.0.0`.
- Next `16.3+` also writes a canonical managed agent-rules block during `next dev`; committing that block is the documented way to avoid a recurring dirty worktree while preserving all Freeswimming rules outside its markers.
- GitHub has two open `js/polynomial-redos` CodeQL alerts in `lib/guides/runtime-identity.ts`.
- The latest fourteen observed scheduled Admin E2E runs failed, with three stable contract/readiness mismatches in the latest inspected run.
- The first authenticated branch run then exposed two deterministic follow-on failures: an Operations eyebrow incorrectly asserted as a heading, and the existing lesson-create success notice being cleared by the immediate editor transition.
- The authenticated remainder-of-flow audit exposed that course-lesson payload construction bypassed the existing dirty-state contract: a second unchanged save sent one extra PATCH/revision instead of reporting the existing no-op notice locally.
- Local ignored environment files were mode `0644`; the minimum local hardening is mode `0600` without reading, printing, moving, deleting, consolidating, or rotating their values.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this brief:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                    | Evidence                                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Complete one security/resume baseline with no route, IA, navigation, or user-job change; restore the existing lesson-create confirmation and unchanged-save no-op contract.       | brief scope + runtime diff review                        | `5/5`                   |
| UX flow clarity                               | `target`     | Create opens the lesson editor with its polite success status; an unchanged save shows `No changes to save.` and keeps the editor open with `0` additional PATCH requests.        | unit + Admin E2E + screenshot                            | `5/5`                   |
| Visual design quality                         | `supporting` | Existing tokens, copy, spacing, and layout remain unchanged; current screenshot evidence shows only the intended create and no-op statuses.                                       | screenshot handoff                                       | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Runtime identity/auth behavior stays stable; one changed lesson save persists once, while a following unchanged save produces exactly `0` extra PATCH requests or revisions.      | unit tests + Admin E2E + full gate                       | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Current headings/metrics remain testable; create hands off with feedback, and a second unchanged lesson save returns the existing no-op status without another write.             | targeted unit/Admin E2E + screenshot                     | `5/5`                   |
| Accessibility (a11y)                          | `supporting` | Admin locator repair uses unambiguous roles/names and does not remove semantic or accessibility assertions.                                                                       | E2E locator diff + full gate                             | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | Production build and existing performance budgets pass with no new direct dependency and no measured budget regression.                                                           | build/performance stages in `verify:pre-pr`              | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Edit state remains local until dirty; changed saves use one server-canonical PATCH and reset the baseline from its response; unchanged saves issue exactly `0` PATCH requests.    | direct PATCH-count unit test + existing API/E2E gates    | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, revalidation event, CDN rule, or freshness contract changes.                                                                                     | explicit cache scope rationale                           | `N/A`                   |
| Reliability and failure handling              | `target`     | Known Admin nightly failures reproduce as current-contract issues, receive deterministic assertions/readiness handling, and pass targeted plus full gates without skips.          | targeted E2E + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Security and authz                            | `target`     | Production high audit findings in the named dependency paths are remediated or explicitly proven non-remediable; both CodeQL alerts are fixed without weakening fail-closed code. | `npm audit --omit=dev`, unit tests, CodeQL CI            | `5/5`                   |
| Privacy and compliance                        | `target`     | Local environment files are `0600`; no secret values appear in output, diffs, logs, artifacts, or commits; no processor/data-purpose change occurs.                               | permission-only stat check + secret/diff review          | `5/5`                   |
| Content governance                            | `target`     | Scope, advisories, decisions, gate evidence, deferred majors, and return path are recorded in this lifecycle brief and PR.                                                        | brief lint + PR summary                                  | `5/5`                   |
| Admin workflow and editability                | `target`     | Tests prove create-to-edit, publish, recovery, mirror visibility, normalized module order, and unchanged-save `0`-write behavior without weakened assertions or new skips.        | unit + Admin E2E assertions                              | `5/5`                   |
| SEO and crawlability                          | `supporting` | Next patch retains existing metadata, sitemap, robots, and site-lock checks through the full gate.                                                                                | build + existing Playwright coverage                     | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because no public content model, structured data, semantic copy, or AI-facing route content changes.                                                                          | explicit discoverability scope rationale                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Existing CI artifacts, CodeQL alerts, npm audit output, and Admin nightly evidence remain the diagnostics source; no product analytics event changes.                             | local/CI logs                                            | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Next/Supabase dependency patches must preserve existing checkout, entitlement, portal, and protected-route gates without changing commerce contracts.                             | existing unit/E2E/full-gate coverage                     | `4/5`                   |
| Incident response and support operations      | `target`     | PR evidence names advisory, CodeQL, Admin E2E, rollback, and residual-risk status so a regression can be triaged and reverted as one bounded change.                              | brief/PR evidence + CI artifacts                         | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no invoice, payout, refund, reconciliation, export, accounting, or finance-reporting contract changes.                                                                | explicit finance scope rationale                         | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translatable copy, language metadata, or translation workflow changes.                                                                             | explicit i18n scope rationale                            | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Take only reviewed security releases for existing packages, including owner-approved Nodemailer `9.0.6`; no TypeScript 7, Node 26, ESLint 10, broad npm update, or new package.   | manifest/lock review + resolved-version check            | `5/5`                   |
| Testing and QA automation                     | `target`     | Direct unit coverage proves `1` changed PATCH plus `0` unchanged PATCH; Admin E2E proves canonical continuous module order; all full gates pass without new skip/weakening.       | command logs + GitHub checks                             | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Remediation adds no service, runtime polling, database query, scheduled job, or material CI expansion.                                                                            | diff/build review                                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Branch starts from fresh `origin/main`; change is reversible as one PR with no migration or secret-value mutation; required checks and pre-merge gate pass.                       | git evidence + PR checks + rollback note                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - keep the existing App Router boundaries, component composition, cache behavior, metadata, and site-lock behavior unchanged;
  - update `next` and `eslint-config-next` together to the same secure `16.x` patch.
  - retain the canonical Next-managed `AGENTS.md` block generated by `next dev`, and use the version-matched documentation under `node_modules/next/dist/docs/`.
- TypeScript/domain contracts:
  - preserve strict typing and the canonical runtime identity output contract;
  - replace unsafe unbounded regex behavior with deterministic bounded parsing and unit coverage for hostile/long inputs.
- Supabase/data layer:
  - dependency compatibility update with one typed fail-safe normalization for the widened authenticator-assurance-level contract; known `aal1`/`aal2` values remain unchanged and unknown future values become `null`;
  - no migration, RLS, generated database type, authz, storage, or persistence change;
  - keep the server response canonical after a dirty lesson PATCH, reset the local edit baseline from that response, and make an unchanged normalized form a local no-op with no request/revision;
  - existing auth/protected-path negative tests remain the proof boundary.
- External services/tools:
  - use official package/advisory sources and existing SDKs only;
  - Nodemailer `9.0.6` keeps the existing plain SMTP transport/message contract; its stricter TLS behavior for remote content, OAuth2 endpoints, and HTTP proxies is not exercised by this app;
  - do not print, move, delete, consolidate, or rotate secret values;
  - no webhook, retry, idempotency, or provider contract change.
- UI system:
  - preserve the current rendered component, copy, tokens, and layout; visible behavior repairs only retain the already-authored create success state and make the already-authored unchanged-save notice reachable;
  - Admin E2E locators must target the mature current surface through precise accessible semantics and observable readiness.
- Testing:
  - targeted regex unit tests, exact Admin E2E spec, dependency audit/resolution checks, full local release gate, CodeQL/CI, then pre-merge gate.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: repository shell/git/npm tooling, GitHub CLI, existing CodeQL workflow, and installed Playwright skill/browser tooling for targeted Admin E2E.
- Evaluate later: `Codex Security` plugin may help a future broader threat-model or ownership audit, but it is not needed for these already identified bounded findings.
- Install/config changes: none; no local skill, plugin, MCP server, or app configuration is changed in this slice.

Systemic findings:

| Surface                    | Finding                                                                                                                                                          | Severity | Recommended Type                 | Owner Decision Needed | Follow-Up Brief Path     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | --------------------- | ------------------------ |
| Dependency security        | Direct Next/Supabase and related transitive paths have compatible patches; Nodemailer requires an owner-approved controlled `9.0.6` major to clear the advisory. | `high`   | `bounded implementation child`   | `resolved: approved`  | this brief               |
| Static analysis / Admin CI | Two open CodeQL regex alerts and a repeatedly red Admin nightly baseline block a trustworthy return to product work.                                             | `high`   | `bounded implementation child`   | `no`                  | this brief               |
| Major/tooling migrations   | TypeScript 7, Node 26, ESLint 10, Vercel CLI 59, and Supabase SSR 0.12 still need independent compatibility/owner decisions.                                     | `medium` | `deferred architecture decision` | `yes; separate scope` | future maintenance queue |

Return path:

- Base/last merged workstream: `main@9dec3baa`, after runtime PR `#1239` and docs closeout PR `#1240`.
- Current active maintenance child: this brief.
- Parked unrelated in-progress brief: `docs/task-briefs/in-progress/2026-05-08-visual-coaching-manual-fcp-motion-pilot-template-system-10-10.md`.
- Product return path after this baseline is green: re-audit `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md` and select one bounded child; do not start it inside this PR.

## Domain Granularity Gate

- User/operator mental object: the existing Admin content/commerce dashboard, its mirror-status evidence, and a lesson through create, edit, save, and unchanged-save feedback.
- Canonical objects: current Admin routes, content-item identifiers, course lesson mirror metric, created/updated lesson server responses, and their existing server/UI contracts; no schema or persisted-shape change.
- Relevant levels: section heading (`view` test coverage), page heading (`view` test coverage), mirror metric (`view`/readiness test coverage), workspace lesson `create` followed by immediate `edit`, changed save (`edit`/one PATCH), and unchanged save (local no-op/zero PATCH); delete/reorder/reconcile remain out of scope except the existing E2E normalization proof.
- Mature reference surface: the current rendered Admin UI itself plus `tests/e2e/admin-foundation.spec.ts`.
- Child-structure rule: the test continues to verify the existing child metric rather than replacing it with a summary-only assertion.

## Data Placement And Sync Contract

- Local-only: the open lesson form and its normalized dirty/baseline comparison remain React state; an unchanged validated form shows the existing no-op notice and performs no network write.
- Server-canonical: a dirty save sends one PATCH; the returned content item replaces the list row and becomes the new local edit baseline before another save is evaluated.
- Sync/conflict/invalidation: the existing request, response, error, and course-order normalization contracts remain unchanged; this slice adds no offline sync or conflict-resolution policy.
- Schema/RLS/cache: unchanged. Direct unit evidence requires exactly one PATCH for a changed save followed by zero additional PATCH/revisions for the unchanged save.

## Identity And Rename Contract

- The runtime identity helper keeps its existing canonical return contract; no ID, slug, title, route param, analytics ID, or operator-visible identifier is renamed or repurposed.
- Unknown or malformed runtime identity input must resolve through the existing safe fallback without excessive regex work.

## Forward Compatibility Contract

- Future compatible security patches inside the declared Next `16.x`, Nodemailer `9.x`, Supabase JS `2.x`, and approved Supabase SSR range should remain reviewable through the same audit/full-gate process.
- Future Next versions may update only the content between the managed `nextjs-agent-rules` markers; repository-specific instructions remain outside those markers.
- Major versions and pre-`1.0` Supabase SSR behavior changes require an explicit mapping/migration brief rather than following automatically.
- New Admin sections or mirror metrics must use precise accessible/test IDs or readiness contracts; unknown/missing metrics must fail with diagnostic evidence rather than being silently skipped.
- New runtime identity variants follow the canonical bounded parser/fallback contract; malformed or unknown values fail safely.
- Evidence is supplied by long/malformed input unit fixtures, exact Admin E2E coverage, dependency resolution/audit output, and full release gates.

## Scope

- Create and execute this bounded in-progress brief from fresh `origin/main`.
- Change only the permissions of the existing ignored `.env.local`, `app/.env.local`, and `.vercel/.env.preview.local` files from `0644` to `0600`; never read or print values.
- Update `next` and `eslint-config-next` together to a secure compatible `16.x` patch.
- Commit the canonical Next `16.3.3` managed agent-rules block generated in the existing root `AGENTS.md`; do not disable the supported feature in `next.config.ts`.
- Update `nodemailer` to owner-approved `9.0.6`, the current clean release, and validate the existing plain SMTP transport contract.
- Update `@supabase/supabase-js` within `2.x` and `@supabase/ssr` only within the audited compatible pre-migration range.
- Normalize Supabase's widened authenticator-assurance-level response into the app's existing `aal1`/`aal2` contract and fail closed to `null` for unknown future values.
- Refresh the npm lockfile and confirm production audit remediation, including relevant transitive paths.
- Fix both open `js/polynomial-redos` findings in `lib/guides/runtime-identity.ts` with regression tests.
- Stabilize the three known Admin E2E contract/readiness failures without weakening product assertions or adding skips.
- Repair the authenticated follow-on failures by asserting the actual `Runtime controls` heading and retaining the existing lesson-created success notice after the editor opens; add direct regression coverage and screenshot evidence.
- Preserve the existing lesson-editor no-op contract: an unchanged save must show `No changes to save.` without sending a duplicate PATCH or creating an unnecessary revision; add direct regression coverage and refreshed screenshot evidence.
- Run targeted validation, `verify:pre-pr`, required GitHub CI, and `verify:pre-merge`; prepare but do not merge the PR.

## Out Of Scope

- TypeScript 7, Node 26, npm 12, ESLint 10, lint-staged 17, jest-dom 7, Vercel CLI major migration, Supabase CLI pinning, or a broad `npm update`/`npm audit fix`.
- Supabase SSR behavior/cookie migration beyond the audited compatible range.
- Secret inspection, value output, consolidation, deletion, rotation, or Vercel environment mutation.
- Product features, UI redesign, Admin workflow redesign beyond the existing create/no-op feedback repairs, route/label changes, database/schema/RLS changes, analytics, commerce contracts, Help/Guide content, or performance-budget tightening.
- Opting out of Next agent-rule generation or changing Freeswimming instructions outside the generated markers.
- Dependabot configuration, branch cleanup, stash cleanup, quarterly governance registry refresh, launch-readiness work, or merging without explicit owner approval.

## Acceptance Criteria

1. Work branch is based on fresh `origin/main@9dec3baa`, and this brief is in `in-progress`.
2. The three existing local ignored environment files are mode `0600`, with no value read/output and no secret-bearing diff.
3. Named direct dependencies resolve to secure compatible versions; Next/config versions match; no deferred major is introduced without an explicit scope decision; the canonical Next-managed `AGENTS.md` block is committed and idempotent under `next dev`.
4. `npm audit --omit=dev` has no remaining high/critical vulnerability in the remediated production paths, or an upstream-blocked exception is documented with exact evidence and owner decision before merge recommendation.
5. Both runtime-identity CodeQL findings are removed through bounded deterministic parsing and regression coverage, not suppression.
6. The original three and authenticated follow-on Admin E2E failures pass with precise current-contract assertions and no new skip; workspace lesson create opens the new editor while its existing polite success state remains visible, and an unchanged lesson save sends no duplicate PATCH while showing the existing no-op notice.
7. The lesson-create and no-op save feedback repairs have approved, current screenshot evidence, then lint, strict typecheck, all unit tests, build, performance budgets, full E2E, and relevant private/security gates pass through `npm run verify:pre-pr`.
8. Required GitHub checks, including CodeQL analysis, pass and the two alerts are resolved/closed by the branch analysis or confirmed resolved after PR processing.
9. `npm run verify:pre-merge` passes on a branch current with `origin/main` before merge recommendation.
10. PR remains unmerged until explicit owner approval.

## Route, Label, And Support-Surface Impact Sweep

- Identifiers searched: stale Commerce content heading `Commerce`, canonical `Product catalog`, Operations eyebrow and canonical `Runtime controls` heading, unscoped/scoped Content heading `Content`, `admin-commerce-manager-header`, `admin-operations-manager-header`, `admin-content-manager-header`, `admin-content-action-notice-state`, `Lesson created in selected module. Opening editor.`, `admin-mirror-summary`, `admin-mirror-details`, and `admin-mirror-metric-course_lesson`.
- Canonical current identifiers: Commerce remains the tab/section label while its manager heading is `Product catalog`; Operations remains the tab/eyebrow while its manager heading is `Runtime controls`; Content heading is scoped to `admin-content-manager-header` with an exact accessible name; the lesson-created notice is a polite status that remains visible after the new editor opens; mirror child metrics become visible after `admin-mirror-summary` expands `admin-mirror-details`.
- Surfaces checked: `app/`, `components/`, `tests/`, `docs/` including runbooks and all brief lifecycle folders, `scripts/`, and `package.json`.
- Fallout handled: no product label, route, Help/Guide, or operator guidance changed; stale/ambiguous heading contracts were updated and the existing create success state was preserved across its editor transition. Historical brief references and intentional Commerce/Operations tab labels remain unchanged.
- Targeted evidence: local Admin Playwright completed `2 passed / 3 skipped`; skips were caused by unavailable local authenticated Supabase dev login. The first authenticated branch run completed `7 passed / 2 failed / 1 skipped` and provided deterministic evidence for the two follow-on repairs; the corrected branch must pass the authenticated `Admin E2E` workflow before merge readiness.

## Validation

- `stat` permission check for the three exact local environment files, without content access.
- `npm ls next eslint-config-next nodemailer @supabase/supabase-js @supabase/ssr --depth=0`
- `npm audit --omit=dev --audit-level=high`
- focused runtime-identity Vitest files selected from repository coverage
- focused `AdminContentManager` success-state unit coverage
- targeted `tests/e2e/admin-foundation.spec.ts` Admin project/run profile
- before/after screenshot capture of the unchanged lesson-save state plus refreshed lesson create-to-edit success evidence
- `npm run lint:briefs`
- `git diff --check`
- `npm run verify:pre-pr`
- GitHub required checks and CodeQL alert review
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Use `.nvmrc` Node `24.x` and repo package manager npm `11.11.0` unless the existing repo bootstrap intentionally resolves a newer npm `11.x` in CI.
- Bootstrap through `nvm use --silent` before reporting Node/npm missing.

## Manual QA Environments

- Screenshot review is required because the repairs make the existing success status visible after workspace lesson creation and restore the existing no-op save feedback without a duplicate write.
- Capture true before/after desktop evidence against the same synthetic lesson/module state for the no-op save, and refresh the current lesson-create success evidence. If local Admin auth remains blocked, use the documented temporary harness with the real `AdminContentManager`, deterministic mock responses, no cloud writes, and remove the harness before validation/PR diff.
- Admin behavioral validation otherwise uses the repository Playwright configuration and current local/CI environment contracts.

## Constraints

- Never expose secret values.
- Do not suppress CodeQL, loosen assertions, add test skips, or accept rerun-only evidence for deterministic failures.
- Keep direct dependency changes limited to the named packages and compatible ranges.
- Keep runtime and user-visible Admin behavior unchanged except for retaining the already-authored lesson-create success state through the immediate editor transition and honoring the already-authored no-op notice without an unnecessary save request.
- Do not touch unrelated dirty or generated files.

## Help/Guide And Operator Training Contract

`N/A` because no user/admin label, action, recovery path, Help/Guide assertion, or support procedure changes; the existing create-to-edit workflow, success copy, and unchanged-save feedback are only made internally consistent. Test locators are aligned to the current surface.

## Security, Privacy, And Compliance

- Secret files receive least-readable practical local permissions (`0600`) without content access.
- Dependency advisories are remediated with compatible package patches and full regression gates.
- CodeQL findings are fixed in code with hostile-input coverage, not hidden or dismissed.
- No authz, PII, consent, processor, retention, or logging contract changes.

## Observability And KPI Contract

- npm audit JSON/summary, Vitest/Playwright artifacts, GitHub required checks, CodeQL alert state, and the brief checkpoint log are the evidence trail.
- No product analytics or KPI payload changes.

## Session Continuity And Recovery

- Canonical source of truth: this in-progress brief.
- Recovery order:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Git Rhythm Defaults

- Work on `codex/security-resume-baseline-2026-08-31` from fresh `main`.
- Run targeted checks after each repair, then full `npm run verify:pre-pr` before commit/push handoff.
- Commit, push, open/update the PR, monitor required CI, and run `npm run verify:pre-merge` before merge recommendation.
- Do not merge without explicit owner approval.

## Automation Mode

- Automation-first end-to-end execution.
- Pause only for a sandbox approval, missing credentials/context, a real product/compatibility decision, or explicit merge approval.
- Pause after the required before/after success-state screenshot handoff for owner approval before rerunning `verify:pre-pr`, pushing the corrective commit, or continuing pre-merge.

## Branch Hygiene Defaults

- Do not clean unrelated local branches or the existing stash in this slice.
- Post-merge branch/worktree cleanup is authorized only after explicit merge approval under repository rules.

## PR Browser Rule

- Use the repository PR creation flow and open the PR without replacing an unrelated active browser tab when browser handoff is required.

## Manual QA URL Rule

Use `http://127.0.0.1:3000` with the temporary local visual-harness route only for deterministic screenshot capture when `/admin` dev login remains blocked; remove the route before validation and PR diff.

## 10/10 Quality Bar

- No known in-scope high/critical production dependency advisory remains without an explicit upstream-blocked decision.
- Both CodeQL findings are fixed with direct regression proof.
- The repeatedly red Admin E2E baseline is deterministic and green without new skips or weakened object-level coverage, and the create-to-edit success status has approved before/after evidence.
- All critical target categories must reach `5/5` for a `10/10` claim; otherwise record the gap and recommend fix/defer before merge.

## Checkpoint Log

- `2026-08-31 | in-progress` - owner approved the recommended security/resume baseline; fresh fetch confirmed clean `main@9dec3baa` equals `origin/main` (`0` ahead / `0` behind); branch `codex/security-resume-baseline-2026-08-31` created; scope split into dependency, CodeQL, and Admin E2E workstreams | next: harden exact local env-file permissions, apply bounded patches, run targeted validation, then full release gates.
- `2026-08-31 | working tree` - exact ignored env files are now `0600` without value access; Next `16.3.3`, Supabase JS `2.112.4`/SSR `0.10.3`, canonical Next-managed `AGENTS.md` block, CodeQL linear-parser fix, and Admin E2E contract repairs are in the shared working tree; registry audit disproved the original Nodemailer assumption because `8.0.11` remains affected by `GHSA-p6gq-j5cr-w38f` and the first fixed release is `9.0.1` | next: finish read-only Nodemailer 9 compatibility assessment, obtain the required major-scope decision, then run final targeted/full gates.
- `2026-08-31 | owner decision` - owner approved Nodemailer `9.0.6`; compatibility review found the app uses only plain SMTP with fixed text fields, while the documented v9 breaking change is stricter TLS validation for remote content/OAuth2/proxy paths not used here | next: install `9.0.6`, prove audit/type/message-delivery compatibility, then run full pre-PR and PR/CI flow.
- `2026-08-31 | targeted validation` - lock-clean `npm ci` passed; resolved versions are Next/config `16.3.3`, Nodemailer `9.0.6`, Supabase JS `2.112.4`, and SSR `0.10.3`; production audit is fully clean (`0` total), while full audit retains `4 high / 1 low` dev-transitive findings for a separate maintenance wave; Supabase's widened assurance type required a fail-safe `aal1`/`aal2` normalizer; targeted dependency/security tests pass (`48/48` before the guard, then `20/20` including new guard tests), targeted ESLint and formatting pass, and strict typecheck now passes | next: run quality-gate lint, full `verify:pre-pr`, then commit/push and authenticated Admin CI.
- `2026-08-31 | pre-PR validation` - the first full gate proved all non-browser stages green but stopped because the updated Playwright package had no matching local Firefox/WebKit binaries; `npx playwright install` restored the version-matched matrix, and the clean rerun passed in `artifacts/test-runs/20260831-133500/verify.log`: quality gates, lint (`0` errors; `8` pre-existing/generated warnings), strict typecheck, `261/261` unit files with `1738/1738` tests, Next `16.3.3` production build with `72/72` pages, all route performance budgets (worst margin `16.8%`, recommendation `hold`, weekly run `1/2`), and Playwright (`111` passed / `567` matrix- or environment-gated skips) | next: commit/push, open the PR, then run required CI plus the authenticated `Admin E2E` workflow.
- `2026-08-31 | PR and authenticated Admin follow-up` - commit `ae6868af` passed final local `verify:pre-pr`, was pushed, and opened as PR `#1246`; all nine automatic PR checks, including CodeQL, CI verify, E2E smoke, site-lock, deployment, size, and Vercel, passed. The manually dispatched authenticated Admin E2E run `33389274208` completed `7 passed / 2 failed / 1 skipped` and proved two deterministic follow-on causes: stale heading semantics (`Operations` eyebrow vs `Runtime controls` heading) and the lesson-create success notice being cleared by the immediate edit transition. The smallest repairs and direct unit/E2E assertions are now in the working tree | next: targeted validation, true before/after screenshot handoff, then wait for owner approval before a new full pre-PR/commit/push/CI cycle.
- `2026-08-31 | corrective screenshot stop` - the semantic heading assertions now target exact `Runtime controls`; the create-to-edit state clears any old notice first and then retains the existing lesson-created success status. Targeted validation passes: `AdminContentManager` unit suite `21/21`, strict typecheck, targeted ESLint, all `558` brief files, and `git diff --check`. True before/after desktop evidence is stored in `output/security-resume-admin-success-2026-08-31-142231`; capture used the real production component with deterministic local mocks because local Admin auth is blocked, the temporary harness/script and generated `.next/dev` cache were removed, and no product-rendering file changed after the final after capture | next: wait for owner screenshot approval before `verify:pre-pr`, corrective commit/push, CI, authenticated Admin E2E, and `verify:pre-merge`.
- `2026-08-31 | corrective screenshot approved` - owner approved the true before/after Admin lesson-create success-state handoff; no product-rendering files changed after the final capture | next: run `verify:pre-pr`, commit and push the corrective patch, then require fresh CI, authenticated Admin E2E, and `verify:pre-merge` before merge recommendation.
- `2026-08-31 | authenticated Admin contract follow-up` - corrective commit `e01db2c1` passed full local `verify:pre-pr` (`261/261` unit files, `1739/1739` tests, build/performance budgets, and `111` Playwright tests) and was pushed; fresh automatic checks proved code, CodeQL, smoke, size, and deployment green, while CI verify stopped only on stale PR-body headings that are now locally contract-linted. Authenticated Admin run `33393379271` proved both original failures fixed (`8 passed / 1 failed / 1 skipped`) and exposed one further stale assertion: the test expected only the old short QR suffix although the correct create contract uses `<moduleRuntimeId>--<lessonSlug>`. The assertion now verifies the complete deterministic QR slug and matching destination; no product-rendering file changed after the approved screenshot | next: run targeted contract validation, commit the test-only correction, rerun full pre-PR, then push and require fresh CI/Admin E2E/pre-merge evidence.
- `2026-08-31 | authenticated Admin label follow-up` - commit `42e80d55` passed full local `verify:pre-pr` and fresh Admin run `33395102499` proved the complete QR runtime ID plus destination contract green. The same long lifecycle test then reached a second hidden stale label assumption: it reused the module select option text, which intentionally adds a dynamic lesson count, for scope and focus surfaces whose canonical identity label intentionally excludes that count. All four scope/focus assertions now use the unique fixture module title while the adjacent select-value assertion continues to prove stable module identity; no production/rendering file changed after the approved screenshot | next: complete a static remainder-of-flow assertion sweep, run targeted validation, commit, rerun full pre-PR, then require fresh CI/Admin E2E/pre-merge evidence.
- `2026-08-31 | authenticated Admin remainder-of-flow audit` - the static assertion sweep found one deterministic product/data-integrity defect before another remote run: every course-lesson save always rebuilt `body`, so the existing unchanged-save notice was unreachable and a second click created an unnecessary PATCH/revision. The minimal guard now checks the existing normalized dirty contract before building the payload, direct unit coverage proves one changed save followed by one no-op click sends exactly one PATCH, and the course-module sort assertion now validates normalization feedback plus the resulting numeric order instead of assuming a fixed database-dependent value. Because production rendering changed, current true before/after no-op evidence and refreshed create-success evidence are required before the next full gate | next: complete screenshot review and targeted validation, then wait for owner visual approval before `verify:pre-pr` and push.
- `2026-08-31 | no-op screenshot approved` - owner approved the current true before/after unchanged-save evidence and refreshed lesson create-to-edit success state in `output/security-resume-admin-noop-2026-08-31-152341` (captured `2026-08-31 15:38 CEST`). The production component was exercised with deterministic local responses and no cloud data or writes; the temporary harness/scripts were removed, targeted Admin unit coverage is `21/21`, and ESLint, strict typecheck, brief lint, and `git diff --check` pass. No product-rendering file changed after the final capture | next: run full `verify:pre-pr`, commit/push the bounded correction, then require fresh PR CI, authenticated Admin E2E, and `verify:pre-merge` before merge recommendation.
- `2026-08-31 | no-op pre-PR green` - the owner-approved final diff passed the full `verify:pre-pr` lane in `artifacts/test-runs/20260831-173726/verify.log`: branch-current/quality gates, `261/261` unit files with `1739/1739` tests, Next `16.3.3` build with `72/72` generated pages, route performance budgets (worst margin `16.8%`, weekly hold `1/2`), and Playwright `111 passed / 567 expected skips`. The only post-gate change is this docs-only evidence checkpoint; no product-rendering file changed after the approved capture | next: lint the evidence checkpoint, commit/push the bounded correction, then require fresh PR CI, authenticated Admin E2E, and `verify:pre-merge`.

## Completion Record

- `status`: pending implementation, PR, CI, and pre-merge evidence.
- `10/10 claim`: no; closeout evidence not complete.
