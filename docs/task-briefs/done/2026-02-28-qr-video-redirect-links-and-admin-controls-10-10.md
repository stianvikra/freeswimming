# Task Brief: QR Video Redirect Links And Admin Controls (10/10)

## Metadata

- `id`: `2026-02-28-qr-video-redirect-links-and-admin-controls-10-10`
- `status`: `done`
- `priority`: `P1`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-03-06`

## Goal

Ship a secure, admin-controlled QR link system where every QR points to a stable freeswimming.org URL (`/go/v/[slug]`), destinations can be changed without reprinting QR assets, and editors can manage link ownership/placement from one admin overview.

## Why This Brief Exists

- Content production will create many new lessons and share links; manual off-platform QR handling will become error-prone.
- We currently have no dedicated QR redirect route, no in-app QR generation, and no admin registry showing what each link is attached to and where it displays.
- We want a 10/10 operational model before scale-up of content sharing.

## Decision For This Cycle

- Recommended next implementation brief: **this one**.
- Sequence:
  1. QR redirect + admin controls foundation.
  2. Continue content production with QR tooling available for new lessons.
  3. SEO/performance/ops briefs remain follow-up tracks.

## Dependencies And Boundaries

- Parent track:
  - `docs/task-briefs/in-progress/2026-02-25-content-production-v1-admin-editorial-run.md`
- Adjacent planned tracks:
  - `docs/task-briefs/planned/2026-02-18-seo-ai-discoverability-and-admin-seo-controls.md`
  - `docs/task-briefs/planned/2026-02-19-performance-budgets-and-security-negative-path-hardening.md`
  - `docs/task-briefs/planned/2026-03-04-operations-finance-i18n-readiness-baseline-10-10.md`
- Scope here is redirect + admin operations + QR placement behavior; no broad marketing redesign.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Business logic correctness and data integrity`
- `Security and authz`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                        | Evidence                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin has one clear QR registry page with ownership + placement columns and filters.                  | e2e + manual QA                               | `5`                     |
| UX flow clarity                               | `target`     | Scan/redirect/edit flows have no dead ends and include deterministic fallback states.                 | e2e + manual QA                               | `5`                     |
| Visual design quality                         | `supporting` | QR cards and admin controls align with existing admin/site visual language.                           | visual QA                                     | `4`                     |
| Business logic correctness and data integrity | `target`     | Unique active slug invariant, deterministic redirect resolution, idempotent update operations.        | unit + integration tests                      | `5`                     |
| Admin editor ergonomics                       | `target`     | Create/edit/disable/copy/generate QR in <= 3 focused actions for common cases.                        | e2e + timed manual QA                         | `5`                     |
| Accessibility (a11y)                          | `target`     | Keyboard-operable admin flows + labeled controls + meaningful QR alternative text.                    | Playwright + manual SR check                  | `5`                     |
| Performance (CWV + payloads)                  | `supporting` | No material regression on changed routes (`/admin`, affected learner pages).                          | verify + route smoke                          | `4`                     |
| Data placement and sync boundaries            | `target`     | Link mapping/attachments are server-canonical; no client canonical drift.                             | contract review + tests                       | `5`                     |
| Caching and invalidation strategy             | `target`     | Destination updates take effect immediately after save (no stale redirects).                          | integration test + manual QA                  | `5`                     |
| Reliability and failure handling              | `target`     | Missing/disabled/invalid slug returns controlled non-500 fallback with retry/help action.             | route tests + e2e                             | `5`                     |
| Security and authz                            | `target`     | Fail-closed host/protocol allowlist and role-gated admin mutations.                                   | negative-path tests + code review             | `5`                     |
| Privacy and compliance                        | `target`     | Redirect analytics excludes PII/secrets and follows existing redaction rules.                         | payload tests + docs                          | `5`                     |
| Content governance                            | `target`     | Every QR link has owner, status, attachment reference, and revision/audit trace.                      | admin UI + API assertions                     | `5`                     |
| Admin workflow and editability                | `target`     | Editors can find all QR links by status/content/placement from one overview surface.                  | e2e + manual QA                               | `5`                     |
| SEO and crawlability                          | `supporting` | Redirect/fallback metadata/canonical/noindex behavior is explicit and consistent.                     | metadata checks                               | `4`                     |
| AI discoverability                            | `N/A`        | N/A                                                                                                   | N/A                                           | N/A                     |
| Analytics and KPI observability               | `target`     | Redirect hit + admin mutation events emitted with stable taxonomy.                                    | unit/event tests + log verification           | `5`                     |
| Commerce and revenue ops                      | `supporting` | Product-related QR links do not break entitlement or checkout-linked routes.                          | targeted QA                                   | `4`                     |
| Incident response and support operations      | `supporting` | Runbook exists for broken slug, wrong destination, and rollback steps.                                | docs/runbook                                  | `4`                     |
| Finance and reporting operations              | `N/A`        | N/A because this QR redirect/admin slice does not change billing, payouts, or finance reconciliation. | explicit scope rationale                      | N/A                     |
| i18n operational readiness                    | `supporting` | Data model and labels do not block later locale expansion.                                            | schema/copy review                            | `4`                     |
| Stack-fit and dependency discipline           | `target`     | Uses current Next.js/Supabase stack; new dependency only with explicit rationale.                     | dependency diff                               | `5`                     |
| Testing and QA automation                     | `target`     | Unit + e2e + negative-path coverage added for route/admin/placement behavior.                         | CI green + `verify:pre-pr`/`verify:pre-merge` | `5`                     |
| Scalability and cost efficiency               | `supporting` | Indexed slug lookup and low-cost event pipeline; no obvious cost explosion.                           | index/query review                            | `4`                     |
| DevOps and rollback readiness                 | `target`     | Feature-flag and rollback path documented; migration impact reversible.                               | runbook + migration notes                     | `5`                     |

## Data Placement And Sync Contract (Required For Stateful Features)

- Server-canonical data:
  - QR registry records (slug, destination config, status, ownership, attachment metadata, placement metadata).
  - Redirect resolution reads from canonical active records only.
  - Audit history for admin create/update/disable/enable operations.
- Local-only data:
  - transient admin form draft/edit state.
  - no client-side canonical redirect mapping cache.
- Sync policy:
  - admin save writes canonical record and refreshes list/detail immediately.
  - learner redirect route always resolves current canonical active record.
  - placement reads are derived from canonical record + current page context.
- Conflict/invalidation:
  - slug collision or stale update fails with explicit deterministic error.
  - redirect resolution is `no-store`/fresh read (or explicit equivalent) for immediate effect.
- Retention/sensitivity:
  - no PII in redirect records.
  - analytics payload excludes secrets/query tokens and user identifiers unless explicitly approved in existing analytics policy.

## Scope

- Add stable redirect namespace:
  - `/go/v/[slug]` runtime route for mutable redirect destinations.
- Add secure destination policy:
  - `https` only,
  - hostname allowlist (configurable),
  - fail-closed validation errors.
- Add admin QR registry + controls:
  - list view with filters (status/content type/placement/search),
  - create/edit/disable/enable link,
  - copy stable URL,
  - QR preview and download (`svg` + `png`),
  - attachment fields showing what link belongs to (module/lesson/guide/product/other),
  - placement fields showing where link is rendered.
- Add “new lesson flow” support:
  - from lesson context, create prefilled QR link in <= 2 actions,
  - generate QR assets in-app (no external manual tooling required for normal flow).
- Add learner-facing placement behavior:
  - desktop/tablet: show scannable `Open on phone` QR card on selected placements.
  - mobile: hide static QR by default, show `Share` + `Copy link` alternative.
- Add observability:
  - redirect hit events,
  - admin mutation events,
  - structured logs for fallback/error reasons.
- Add runbook/docs:
  - operations guide for adding/updating/rolling back links and debugging broken scans.

## Out Of Scope

- Personalized per-user QR codes.
- Marketing landing-page redesign unrelated to redirect/QR behavior.
- Full SEO strategy expansion (handled in SEO brief).
- Bulk campaign automation beyond core registry/admin controls.

## UX Placement Contract (Desktop vs Mobile)

- Desktop/tablet:
  - QR visible only where cross-device continuation is meaningful.
  - must include label, short explanation, and fallback copy/share actions.
  - minimum contrast + quiet-zone/scannability quality bar.
- Mobile:
  - no redundant static QR by default.
  - primary actions: `Share link` and `Copy link`.
  - optional explicit “Show QR” only if a clear use case is proven later.

## Admin Overview Contract (Operational Control)

The registry must answer at a glance:

- What is the stable link?
- What does it currently resolve to?
- What content item is it attached to?
- Where is it displayed in the product?
- Is it active/draft/disabled?
- When was it last changed and by whom?

## Acceptance Criteria

1. `/go/v/[slug]` resolves active links with temporary redirect and deterministic fallback for missing/disabled links.
2. Unsafe redirect inputs (protocol/host violations) are blocked; no open redirect behavior.
3. Admin has one QR registry overview with status/content/placement visibility and filtering.
4. Admin can create, edit, enable/disable, copy, and QR-download (`svg`/`png`) for links.
5. Each link can be attached to content and placement metadata; this relation is visible in overview.
6. From lesson workflow, editor can create a prefilled QR link quickly and generate QR in-app.
7. Desktop/tablet shows scannable QR on selected placements; mobile defaults to share/copy UX without QR clutter.
8. Redirect and mutation events are emitted with safe payloads.
9. Required negative-path tests cover unauthorized admin access, bad slug, and unsafe destination attempts.
10. Help/Guide and runbook governance is respected:

- if QR workflow labels/actions/recovery behavior changed, Help/Guide and QR runbook are updated in same PR,
- otherwise explicit `N/A` rationale is documented.

## Validation

- `npm ci`
- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`
- `npm run verify`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite (Required)

- Node.js LTS + npm.
- `gh` CLI authenticated for automation-first PR flow.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin`
  - `http://127.0.0.1:3000/go/v/<test-slug>`
- Preview:
  - Vercel preview URL from PR checks.
- Device/browser matrix:
  - iOS Safari (scan/open/share),
  - Android Chromium (scan/open/share),
  - desktop Chrome/Safari/Firefox (admin + desktop QR visibility),
  - tablet viewport.

## Constraints

- No secrets or signed tokens in public QR URLs.
- No direct unvalidated passthrough redirects from query params.
- Keep existing design language; avoid UI clutter on mobile.
- Prefer stack-native implementation and minimal new dependencies.

## 10/10 Quality Bar

- Core flows must be predictable:
  - create link -> attach -> place -> scan -> land -> track.
- Required UI states for changed surfaces:
  - `loading`, `empty`, `error`, `retry`, `success`.
- Admin should be able to add/update one link safely in <30 seconds.
- Desktop QR must be reliably scannable; mobile should prioritize share ergonomics.
- Security and data integrity are fail-closed by default.

## Security, Privacy, And Compliance

- Role-gated admin mutations.
- Strict destination policy and input validation.
- No PII/secrets in redirect telemetry.
- Audit events for sensitive mutations.

## Observability And KPI Contract

- Events:
  - `qr_redirect_hit`
  - `qr_link_created`
  - `qr_link_updated`
  - `qr_link_status_changed`
- Metrics:
  - redirect success rate,
  - fallback-hit rate per slug,
  - top-used links by placement.
- KPI:
  - destination can be changed without reprinting QR and without broken learner path.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. Reopen this brief and continue from latest checkpoint.

## Git Rhythm Defaults

- Commit/push per validated slice.
- Before PR update: `npm run verify:pre-pr`.
- Before merge recommendation: `npm run verify:pre-merge`.

## Branch Hygiene Defaults

- Post-merge:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - `git fetch --prune origin`

## PR Browser Rule

- Open PR links in Safari.

## Final Closeout Gate

- Confirm all acceptance criteria complete or explicitly deferred.
- Record `0-5` score for each `target` category.
- If any target category `<4`, defer/fix plan is mandatory before moving brief to `done`.

## Implementation Slices

1. Redirect foundation:
   - canonical model + `/go/v/[slug]` + fallback + security validation.
2. Admin registry:
   - overview list + CRUD + attachment/placement metadata.
3. QR generation in app:
   - preview + SVG/PNG download + lesson-prefill flow.
4. Learner placements:
   - desktop QR cards + mobile share/copy behavior.
5. Observability and hardening:
   - analytics/audit/logging + negative-path tests + runbook.
6. QR admin UX polish:
   - list-first information architecture, collapsible `New link` panel, `Required` vs `Advanced` create fields, clearer empty-state onboarding, and stricter per-row action hierarchy.

## Checkpoint Log

- `2026-03-06 | ece15c3 (main) | PR #140 merged and closed; QR redirect/admin controls track completed through Slice 6 (list-first QR registry UX polish) with required CI green and local verify:pre-merge PASS | next: brief moved to done`
- `2026-03-06 | working tree | Slice 6 delivered locally: refactored QR registry to list-first flow with collapsible New link panel, required vs advanced create sections, first-link empty-state onboarding with example prefill, and cleaner per-row action hierarchy; updated Help/Guide QR workflow/button glossary + admin e2e contracts; npm run verify:pre-pr PASS | next: commit, push, open/update PR in Safari, then monitor required checks`
- `2026-03-06 | kickoff | started Slice 6 (QR admin UX polish): list-first registry, collapsible New link, required/advanced form split, improved empty state, and action hierarchy cleanup; next: implement UI + e2e/help updates and run verify:pre-pr`
- `2026-03-06 | working tree | Slice 5 delivered locally: added admin QR mutation analytics events (`qr_link_created`, `qr_link_updated`, `qr_link_status_changed`), standardized structured fallback logging for `/go/v/[slug]` fallback paths, expanded negative-path coverage (unit + e2e) for unauthorized/malformed/unsafe QR admin API calls, and added ops runbook docs/runbooks/qr-redirect-operations.md | next: run full npm run verify:pre-pr, push branch, and open/update PR in Safari`
- `2026-03-06 | working tree | Slice 3 delivered locally: added in-app QR asset generation utility (`svg`+`png`) with unit coverage, shipped QR preview + download actions in admin QR registry rows, added lesson-context prefill flow (`Create QR link`from lesson rows ->`/admin?tab=qr-links` prefilled form), and extended admin foundation e2e with prefill assertion | next: run full npm run verify:pre-pr, push branch, and open/update PR in Safari`
- `2026-03-06 | working tree | Slice 1 delivered locally: added Supabase QR redirect foundation migration (`qr_redirect_links`+`qr_link_status`+ RLS + audit trigger), implemented`/go/v/[slug]` secure redirect route with deterministic fallback (`/go/unavailable`) and strict HTTPS/host allowlist policy, added unit coverage for redirect/policy/analytics event name, and ran full npm run verify:pre-pr PASS | next: commit/push slice and open/update PR in Safari`
- `2026-03-06 | working tree | brief approved and moved planned -> in-progress; final scope locked for secure redirect foundation + admin registry + in-app QR generation + desktop/mobile placement contract | next: implement Slice 1 (redirect foundation + fallback + security validation) with tests`

## Completion Record

- `PR`: `https://github.com/stianvikra/freeswimming/pull/140`
- `merge`: `PR #140` -> `main`
- `result`: end-to-end QR redirect/admin registry system shipped, including secure redirect policy, admin CRUD + QR assets, learner placements, observability hardening, and list-first QR admin UX.
