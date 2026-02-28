# Task Brief: QR Video Redirect Links And Admin Controls (10/10)

## Metadata

- `id`: `2026-02-28-qr-video-redirect-links-and-admin-controls-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-02-28`

## Goal

QR codes should point to stable freeswimming.org links that can be re-targeted in admin without reprinting QR assets, while remaining secure, measurable, and fast.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Class        | Target threshold                                                                                  | Evidence                           | Target score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------ |
| UX flow clarity                               | `target`     | QR scan always lands in a deterministic destination/fallback with no dead-end.                    | E2E + manual QA                    | `5`          |
| Visual design quality                         | `supporting` | Redirect/fallback pages follow current design language and readable hierarchy.                    | Manual QA                          | `4`          |
| Business logic correctness and data integrity | `target`     | Slug resolution deterministic; update operations idempotent; no duplicate active slug collisions. | Unit tests + DB constraints        | `5`          |
| Admin editor ergonomics                       | `target`     | Admin can create/update/disable redirect links in <= 3 actions with clear validation feedback.    | E2E admin flow + manual QA         | `5`          |
| Security and authz                            | `target`     | Redirect destinations restricted by protocol/hostname policy; no open redirect vector.            | Negative-path tests + code review  | `5`          |
| Privacy and compliance                        | `supporting` | Tracking payload contains no PII and follows analytics redaction rules.                           | Event payload test + docs          | `4`          |
| Data placement and sync boundaries            | `target`     | Canonical redirect mapping server-side only; no client-side source-of-truth drift.                | Brief contract + tests             | `5`          |
| Caching and invalidation strategy             | `target`     | Redirect updates become effective immediately after admin save (or explicit documented TTL).      | Integration test + manual QA       | `5`          |
| Reliability and failure handling              | `target`     | Invalid/missing slug gives safe fallback page (`404` or controlled help route), not `500`.        | E2E + API/route tests              | `5`          |
| SEO and crawlability                          | `supporting` | Redirect paths excluded from unwanted indexing where relevant and canonicals remain coherent.     | Route metadata checks              | `4`          |
| AI discoverability                            | `N/A`        | N/A                                                                                               | N/A                                | N/A          |
| Analytics and KPI observability               | `target`     | Each redirect hit emits a safe event (`qr_redirect_hit`) with slug, destination key, timestamp.   | Unit test + event log verification | `5`          |
| Testing and QA automation                     | `target`     | Unit + E2E + negative path coverage for route/admin/security.                                     | CI green + test artifacts          | `5`          |
| DevOps and rollback readiness                 | `target`     | Migration and rollback steps documented; feature can be disabled by flag if needed.               | Runbook + migration notes          | `5`          |
| Stack-fit and dependency discipline           | `target`     | Implement with current Next.js/Supabase stack; no new dependency unless justified.                | Dependency diff + review           | `5`          |
| Scalability and cost efficiency               | `supporting` | Route lookup is O(1) by indexed slug and low-cost analytics emit path.                            | DB/index review + runtime logs     | `4`          |

## Data Placement And Sync Contract (Required For Stateful Features)

- Server-canonical data:
  - QR link registry and redirect targets (`slug`, `destination_type`, `destination_url`, `status`, `updated_by`, `updated_at`) stored in DB.
  - Audit events for admin mutations and runtime hits.
- Local data:
  - No client-side canonical store for redirect mapping.
  - Optional transient admin form draft state in browser only.
- Sync policy:
  - Admin save writes server canonical record.
  - Runtime route reads latest active record (with explicit invalidation/revalidation policy).
- Retention and sensitivity:
  - No personal data in redirect records.
  - Analytics event payload redacted (no email/token/query secret values).
- Cache/invalidation:
  - Route-level cache strategy must guarantee updates become active immediately or within documented bounded TTL.

## Scope

- Add stable QR redirect route namespace on freeswimming.org (example: `/go/v/[slug]`).
- Add admin management UI for QR links:
  - list, create, edit, disable/archive, copy URL.
- Add secure destination validation rules:
  - protocol allowlist (`https` only),
  - hostname allowlist (YouTube/Vimeo/freeswimming-owned domains configurable),
  - optional destination type enum for safer templates.
- Add runtime redirect behavior:
  - temporary redirect (`302`/`307`) for mutable targets.
- Add fallback behavior:
  - inactive/missing slug -> controlled fallback page (`404` or help page).
- Add analytics instrumentation for redirect hits.
- Add QR asset generation tooling:
  - generate SVG + PNG from stable `/go/...` URLs.
- Add docs/runbook:
  - how to add/update links,
  - how to regenerate QR assets,
  - rollback and incident response.

## Ownership Split (No Overlap)

- This brief owns:
  - QR redirect infrastructure and admin operational controls.
  - QR asset generation from stable internal links.
- Related work owned elsewhere:
  - SEO metadata/editor strategy:
    - `docs/task-briefs/planned/2026-02-18-seo-ai-discoverability-and-admin-seo-controls.md`
  - Admin full content editorial workflow:
    - `docs/task-briefs/in-progress/2026-02-22-admin-full-content-edit-workflow-10-10.md`

## Out Of Scope

- Video content production quality and editorial script decisions.
- Public marketing landing-page redesign unrelated to redirect behavior.
- Dynamic per-user QR personalization in this phase.

## Acceptance Criteria

- Stable QR links under `/go/...` resolve correctly and can be changed in admin without changing QR image.
- Redirects use temporary status code (`302` or `307`) so destination remains swappable.
- Open-redirect attempts are blocked with safe errors (no redirect to untrusted host).
- Missing/inactive slugs do not throw `500`; controlled fallback is shown.
- Admin can:
  - create a slug,
  - set destination,
  - disable/enable/update slug,
  - copy stable link.
- QR generation outputs deterministic files for configured slugs (`.svg`, `.png`).
- Analytics event emitted on redirect hit with safe payload.

## Validation

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`
- `npm run verify`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite (Required)

- Node.js LTS and npm installed on machine running validation.
- `gh` CLI authenticated for automation-first PR workflow.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin`
  - `http://127.0.0.1:3000/go/v/<test-slug>`
- Vercel preview:
  - verify redirects and fallback behavior in production-like environment.
- Browser/device matrix:
  - iOS Safari scan/open flow,
  - Android Chromium scan/open flow,
  - desktop Chrome/Safari/Firefox for admin controls.

## Constraints

- No secrets or signed tokens in QR URLs.
- No direct unvalidated URL passthrough from query params.
- Maintain current design language in admin.

## 10/10 Quality Bar (Required For User-Facing Work)

- Admin copy is plain language and action-first.
- Required UI states implemented:
  - `loading`, `empty`, `error`, `retry`, `success`.
- Fast operational flow:
  - add or update one QR target in under 30 seconds.
- Security-first defaults:
  - reject unsafe destination inputs by default.
- Accessibility:
  - keyboard and screen-reader support for full admin flow.

## Security, Privacy, And Compliance (Required For Auth/Data/Payments)

- Admin mutations role-gated to allowlisted admin/editor role.
- Destination validation is fail-closed (untrusted hosts blocked).
- Redirect event payloads exclude PII and secret query params.
- Audit log entries for create/update/disable actions.

## Observability And KPI Contract

- Events:
  - `qr_redirect_hit`,
  - `qr_link_created`,
  - `qr_link_updated`,
  - `qr_link_disabled`.
- Metrics:
  - redirect success rate,
  - fallback-hit rate per slug,
  - top scanned slugs.
- KPI:
  - ability to swap destination for an existing slug without QR reprint and with no broken scans.

## Session Continuity And Recovery (Required)

- Canonical source: git branch + this brief.
- Checkpoint cadence: per validated slice.
- Recovery:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from latest checkpoint.

## Git Rhythm Defaults (Required)

- Commit/push per slice:
  1. schema + route,
  2. admin UI,
  3. security validation + analytics,
  4. QR generation tooling + docs/tests.
- Before PR updates: `npm run verify:pre-pr`.
- Before merge recommendation: `npm run verify:pre-merge`.

## Branch Hygiene Defaults (Required)

- Post-merge:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - `git fetch --prune origin`

## PR Browser Rule (Required)

- Open PR links in Safari and keep Safari tab active.

## Final Closeout Gate (Required Before Move To `done`)

- Confirm each acceptance criterion is met or explicitly deferred.
- Record score (`0-5`) for each target scorecard category.
- If any target score `<4`, document defer/fix plan before moving brief to `done`.

## Implementation Slices (Planned)

1. Data model + secure redirect route (`/go/v/[slug]`) + fallback behavior.
2. Admin CRUD for QR links + copy stable URL UX.
3. Analytics events + audit logs + security negative-path tests.
4. QR asset generation command and runbook.

## Completion Record (fill when done)

- `PR`: link
- `merge`: source -> target
- `result`: short summary
