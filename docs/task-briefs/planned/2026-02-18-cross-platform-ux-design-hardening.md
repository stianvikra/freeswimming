# Task Brief: Cross Platform UX Design Hardening

## Metadata

- `id`: `2026-02-18-cross-platform-ux-design-hardening`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-18`
- `updated`: `2026-02-19`

## Goal

Core user journeys should feel polished, fast, and consistent across iPhone, Android, iPad/tablet, Windows PC, and macOS browsers at all major viewport sizes.

## Scope

- Define and execute a cross-platform UX/design hardening pass for core routes:
  - home, plans, course, guides, my-library, auth, checkout entry/return states, policy pages.
- Build a verified responsive matrix:
  - phone portrait/landscape,
  - tablet portrait/landscape,
  - desktop small/medium/large viewports.
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

## Platform 10/10 Scorecard Linkage

- Canonical reference: `docs/quality/platform-10-10-scorecard.md`.
- This brief must mark scorecard categories as `target`/`supporting`/`N/A` and define measurable thresholds for each `target`.
- Closeout must record achieved score (`0-5`) for each target category.
