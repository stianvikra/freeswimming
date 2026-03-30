# Task Brief: Cross Platform UX Design Hardening

## Metadata

- `id`: `2026-02-18-cross-platform-ux-design-hardening`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-18`
- `updated`: `2026-02-21`

## Goal

Core user journeys should feel polished, fast, and consistent across iPhone, Android, iPad/tablet, Windows PC, and macOS browsers at all major viewport sizes.

## Scope

- Define and execute a cross-platform UX/design hardening pass for core routes:
  - home, plans, course, guides, my-library, auth, checkout entry/return states, policy pages.
- Build a verified responsive matrix:
  - phone portrait/landscape,
  - tablet portrait/landscape,
  - desktop small/medium/large viewports.
- Include explicit readability audits:
  - text hierarchy and paragraph width,
  - contrast and legibility at each breakpoint,
  - content density and scannability on all supported OS/browser combinations.
- Improve interaction consistency:
  - tap target sizes,
  - sticky actions and nav behavior,
  - keyboard/focus behavior,
  - safe-area handling on iOS,
  - orientation and fullscreen behavior for guide visuals.
- Resolve browser-specific UX bugs:
  - Safari/WebKit text/input quirks,
  - mobile drawer/scroll locking edge cases,
  - hydration mismatch regressions,
  - font/layout shifts.
- Formalize visual system quality:
  - typography rhythm,
  - spacing scale,
  - contrast and component states,
  - empty/error/retry patterns.
- Add regression guardrails:
  - screenshot baselines for critical surfaces,
  - visual snapshot diff assertions in CI for stable key routes,
  - route-level manual QA checklist with expected outcomes,
  - E2E assertions for top navigation and core task flows.

## Ownership Split (No Overlap)

- This brief owns:
  - cross-platform UX consistency and visual diff/snapshot baselines.
  - AW-006 backlog delivery for full visual/UX/readability hardening.
- Related work owned elsewhere:
  - SEO metadata/indexing assertions:
    - `docs/task-briefs/planned/2026-02-18-seo-ai-discoverability-and-admin-seo-controls.md`
  - performance budget gates and security negative-path hardening:
    - `docs/task-briefs/planned/2026-02-19-performance-budgets-and-security-negative-path-hardening.md`

## Out Of Scope

- Full brand redesign from scratch.
- Native apps.
- New feature modules unrelated to cross-platform UX stability.

## Acceptance Criteria

- No P1 layout breaks on core flows across required device/browser matrix.
- Navigation, auth, and primary CTAs are usable with one-handed mobile interaction.
- All critical forms/buttons meet tap target and contrast requirements.
- Guide/program interactive views work in both portrait and landscape where intended.
- Hydration/runtime UI mismatch errors on target surfaces are resolved.
- UX states (`loading`, `empty`, `error`, `offline`, `retry`) are implemented and visually coherent.
- Cross-platform QA checklist is documented and repeatable.

## Validation

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`
- `npm run verify`

## Local Tooling Prerequisite (Required)

- Node.js LTS + npm installed.
- Run `npm ci` + `npm run verify` before PR handoff.

## Manual QA Environments

- Local URLs:
  - `http://127.0.0.1:3000/`
  - `http://127.0.0.1:3000/plans`
  - `http://127.0.0.1:3000/course`
  - `http://127.0.0.1:3000/guides/0-1000m`
  - `http://127.0.0.1:3000/guides/poolside`
  - `http://127.0.0.1:3000/my-library`
  - `http://127.0.0.1:3000/auth/sign-in?next=%2Fmy-library`
- Vercel preview:
  - validate same flows on preview URL before merge.
- Required device/browser matrix:
  - iPhone Safari (latest iOS)
  - Android Chrome
  - iPad Safari
  - Windows Chrome + Edge
  - macOS Safari + Chrome + Firefox

## Constraints

- Preserve existing design language while improving quality and consistency.
- Avoid visual churn that harms conversion or user familiarity.
- Keep performance stable (no heavy UI dependencies without clear benefit).

## 10/10 Cross-Cut Categories (Apply When Relevant)

State scope or `N/A` for each category during implementation and closeout:

- Content governance and source-of-truth: canonical model, required fields, owner assignment, revision/rollback policy.
- Taxonomy and category management: naming rules, sorting, and active/archive lifecycle.
- Workflow and publishing safety: status model (`draft/review/published/archived`), publish safeguards, destructive confirmation.
- Business logic correctness and data integrity: deterministic state transitions, invariant validation, idempotent critical mutations, and no silent data corruption paths.
- RBAC and auditability: role boundaries per endpoint/UI action and audit trail for sensitive mutations.
- UX/UI quality contract: clear primary action and required states (`loading`, `empty`, `error`, `retry`).
- Performance contract: latency/render/payload guardrails for changed surfaces.
- Testing contract: unit + e2e coverage for critical and negative paths; avoid duplicate tests.
- Observability and KPI tracking: required events/logs and measurable thresholds.
- Migration and rollback readiness: rollout plan, compatibility window, rollback path.
- Definition-of-done quant targets: explicit measurable pass criteria.

## 10/10 Quality Bar (Required For User-Facing Work)

- Crisp hierarchy and spacing at every breakpoint.
- No ambiguous CTAs; primary action remains obvious above the fold where possible.
- Motion and transitions are intentional and not distracting.
- Error and retry messages are actionable and polite.
- Accessibility: keyboard, focus visibility, labels, semantic landmarks, contrast.

## Security, Privacy, And Compliance (Required For Auth/Data/Payments)

- UX changes must not weaken auth/payment constraints.
- No leakage of private data in UI states or debug overlays.
- Keep consent/privacy messaging readable and reachable on all viewports.

## Observability And KPI Contract

- Track UX health indicators:
  - route-level JS error rate,
  - hydration warning incidence,
  - key action completion rates (sign-in, open guide, checkout start),
  - rage-click/drop-off proxies where available.
- KPI goals:
  - reduced mobile drop-off on core journeys,
  - improved task completion on My Library and guides.

## Session Continuity And Recovery (Required)

- Canonical source: git branch + this brief.
- Checkpoint cadence: per validated slice or every 60-90 min.
- Recovery:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. continue from recorded next step.

## Git Rhythm Defaults (Required)

- Commit + push per UX slice:
  - layout/styling fixes,
  - interaction/focus fixes,
  - platform-specific bug fixes,
  - test/QA evidence updates.

## Branch Hygiene Defaults (Required)

- Post-merge:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - `git fetch --prune origin`

## PR Browser Rule (Required)

- Open PR links in Safari by default.

## Manual QA URL Rule (Required)

- Assistant opens each QA URL in Safari as active tab, then asks for `done`.

## Final Closeout Gate (Required Before Move To `done`)

- Completion audit against acceptance criteria.
- Final 10/10 UX sweep across required device/browser matrix.
- Regression/performance sanity check on adjacent flows.

## Completion Record (fill when done)

- `PR`: link
- `merge`: source -> target
- `result`: short summary

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                 | Evidence                             |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Product goals and IA                          | `target`     | Core routes preserve one clear primary action and readable structure across the supported device/browser matrix. | goal + acceptance criteria           |
| UX flow clarity                               | `target`     | Navigation, auth, checkout entry, guides, and library flows remain understandable on phone, tablet, and desktop. | scope + manual QA matrix             |
| Visual design quality                         | `target`     | Typography, spacing, contrast, and component states remain polished and consistent at every breakpoint.          | scope + quality bar                  |
| Business logic correctness and data integrity | `supporting` | UX hardening does not introduce hidden state changes or contradictory UI behavior.                               | acceptance criteria                  |
| Admin editor ergonomics                       | `N/A`        | N/A                                                                                                              | N/A                                  |
| Accessibility (a11y)                          | `target`     | Keyboard access, focus visibility, semantics, contrast, and tap-target quality stay intact across devices.       | scope + quality bar                  |
| Performance (CWV + payloads)                  | `target`     | Cross-platform polish avoids measurable regression on changed core routes.                                       | constraints + validation             |
| Data placement and sync boundaries            | `supporting` | UX fixes preserve existing local-vs-server ownership rather than introducing new data authority.                 | scope review                         |
| Caching and invalidation strategy             | `supporting` | Responsive and device-specific fixes avoid stale or mode-specific rendering regressions.                         | regression guardrails                |
| Reliability and failure handling              | `target`     | Changed routes keep coherent `loading`, `empty`, `error`, `offline`, and `retry` states across the full matrix.  | acceptance criteria + quality bar    |
| Security and authz                            | `supporting` | UX changes do not weaken auth or payment boundaries.                                                             | security contract                    |
| Privacy and compliance                        | `supporting` | Responsive/debug fixes do not leak private data in UI states or overlays.                                        | security contract                    |
| Content governance                            | `supporting` | Cross-platform copy and structure remain consistent with canonical route intent.                                 | scope review                         |
| Admin workflow and editability                | `N/A`        | N/A                                                                                                              | N/A                                  |
| SEO and crawlability                          | `supporting` | Public-route UX hardening preserves existing crawlable structure and metadata output.                            | ownership split                      |
| AI discoverability                            | `supporting` | Public-route clarity and readable structure support stable AI-consumable surface semantics.                      | ownership split                      |
| Analytics and KPI observability               | `supporting` | Cross-platform regressions remain observable through UX health indicators and completion-rate signals.           | observability and KPI contract       |
| Commerce and revenue ops                      | `N/A`        | N/A                                                                                                              | N/A                                  |
| Incident response and support operations      | `supporting` | Device/browser QA checklist becomes repeatable enough for ongoing support and regression triage.                 | acceptance criteria + final closeout |
| Finance and reporting operations              | `N/A`        | N/A because this cross-platform UX brief does not change billing, payouts, or finance reconciliation.            | explicit scope rationale             |
| i18n operational readiness                    | `supporting` | Layout and hierarchy hardening preserve room for later localization across breakpoints.                          | scope + quality bar                  |
| Stack-fit and dependency discipline           | `target`     | UX hardening relies on current stack patterns and avoids heavy new UI dependencies.                              | constraints                          |
| Testing and QA automation                     | `target`     | Screenshot baselines, visual diffs, and e2e/manual matrix together protect cross-platform regressions.           | scope + validation                   |
| Scalability and cost efficiency               | `supporting` | Visual/interaction hardening avoids introducing expensive client/runtime overhead.                               | constraints                          |
| DevOps and rollback readiness                 | `supporting` | Changes remain sliceable and reversible without data or schema rollback.                                         | git rhythm + final closeout gate     |

## Automation Execution Contract

- Mode: `automation-first`.
- Assistant executes implementation, validation, commit/push, PR open/update, and check follow-up by default.
- Required gates:
  - before PR update/push: `npm run verify:pre-pr`
  - before merge recommendation: `npm run verify:pre-merge` and required CI green.
- Manual owner steps only when blocked by credentials, UI-only actions, or sandbox/escalation limits.
