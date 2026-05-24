# Task Brief: AW-006 My Swim Profile Section Feedback Semantics (10/10)

## Metadata

- `id`: `2026-05-24-aw-006-my-swim-profile-section-feedback-semantics-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-24`
- `updated`: `2026-05-24`
- `parent_review_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-my-swim-profile-feedback`
- `execution mode`: `end-to-end implementation after owner approved the selected AW-006 slice`

## Brief Audit Record

- `last_audited`: `2026-05-24`
- `base`: `main@db65a06`
- `audit_status`: `ready`
- `decision`: Execute a bounded member/profile feedback semantics slice on My Swim Profile section feedback.
- `reason`: PR `#828` and repo-managed closeout `#829` left no active AW-006 implementation slice. A fresh queue/design/code re-audit found `AthleteProfileHub` still repeats local success/error feedback markup across five profile sections while adjacent member/export surfaces now use clearer accessible feedback contracts.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/profile`, `AthleteProfileHub`, athlete profile storage/API contracts, local draft recovery, My Library reference surfaces, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Make My Swim Profile section success/error feedback consistent, accessible, and easier to extend without changing profile data, API behavior, local draft recovery, analytics, or section workflow.

## Pre-Implementation Owner Explanation

Jeg skal bare rydde opp i meldingene som vises naar My Swim Profile lagrer, feiler eller nullstiller en seksjon. Det betyr noe fordi brukeren raskere forstaar hva som skjedde, og skjermlesere faar riktigere status/feil-semantikk. Utenfor scope er profil-data, API-er, Supabase, localStorage-utkast, analytics, seksjonslogikk, copy-endringer og bred redesign. Fremoverkompatibilitet ivaretas ved at nye profilseksjoner kan bruke samme lokale feedback-kontrakt; nye status-typer maa faa eksplisitt mapping foer release.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Reliability and failure handling
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                              | Evidence                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | My Swim Profile remains the canonical private profile/training setup surface; feedback stays attached to existing section actions with no new route or workflow fork.           | focused tests + screenshot handoff               | `5/5`                   |
| UX flow clarity                               | `target`     | Success/error outcomes for profile, CSS, preferences, advanced limits, and records are visible, recoverable, and do not create dead-end states.                                 | focused tests + screenshot handoff               | `5/5`                   |
| Visual design quality                         | `target`     | Feedback uses consistent profile/member styling, stable spacing, readable contrast, and no broad profile redesign.                                                              | screenshot handoff + class review                | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Profile snapshot updates, pending flags, section collapse/open rules, local draft recovery, reset behavior, personal record CRUD, analytics, and API payloads remain unchanged. | focused unit tests + diff review                 | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice touches no admin editor, admin CRUD, publishing, notes, QR, or operator editing workflow.                                                                | changed-files review                             | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Error feedback uses assertive alert semantics, success feedback uses polite status semantics, and duplicate section feedback remains screen-reader safe.                        | unit tests + screenshot/DOM review               | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, asset, route fetch, polling loop, or heavy client library is added; `/my-library/profile` keeps existing route budgets.                         | dependency diff + broad gates                    | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical profile records and local-only unsaved drafts remain in their existing boundaries; this slice adds only transient presentation state/markup.                   | data contract review + tests                     | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, fetch cache, mutation response, revalidation, or invalidation behavior changes.                                                                | cache scope rationale                            | `N/A`                   |
| Reliability and failure handling              | `target`     | Save/reset/delete failure messages keep sections open for recovery and retry without corrupting drafts or snapshots.                                                            | focused failure tests                            | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected member access and owner-scoped API behavior remain unchanged; feedback exposes no raw diagnostics, secrets, or cross-user details.                   | diff review + route-boundary review              | `4/5`                   |
| Privacy and compliance                        | `target`     | Feedback does not include private profile values, user identifiers, entitlement details, raw provider diagnostics, secrets, or env values.                                      | copy/error review                                | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and notice/empty-state inventory record this active My Swim Profile feedback slice.                                                                      | docs diff                                        | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, workflow action, status, mutation, Help/Guide surface, or operator editability path changes.                                                         | explicit admin workflow scope rationale          | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this touches a protected/member utility UI and changes no public metadata, sitemap, robots, canonical URL, or structured public content.                            | changed-files review                             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this protected member surface changes no crawl-safe public entity model, structured data, or AI-facing documentation contract.                                      | changed-files review                             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no analytics event taxonomy, payload, logging, dashboard, KPI, or consent behavior.                                                              | analytics scope rationale                        | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no pricing, checkout, entitlement, Stripe object, invoice, refund, payout, or revenue report.                                                    | explicit commerce scope rationale                | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or support escalation behavior.                         | explicit support-ops scope rationale             | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                        | explicit finance scope rationale                 | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: touched feedback strings stay existing or short and avoid layout assumptions that block later localization.                                                    | copy/layout review                               | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `AthleteProfileHub`, My Library/member state references, Tailwind tokens, and focused tests; add no package, API layer, or broad primitive.                      | changed-files/dependency diff                    | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused unit coverage, brief lint, route/label/support sweep, screenshot handoff, pre-PR gate, CI, and pre-merge gate cover the changed surface.                                | test commands + screenshot handoff + later gates | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: feedback rendering adds no service call, database query, asset, polling loop, background job, or traffic-dependent infrastructure cost.                        | diff review                                      | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert rollback; no migrations, env changes, package changes, workflow changes, generated assets, or provider changes.                                               | git diff + validation evidence                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: existing `AthleteProfileHub` section state model, member/export feedback semantics from `WorkoutEditor`, and compact member action feedback from commerce/export slices.
  - Keep implementation inside the existing client component or a profile-local helper in `components/my-library/profile/`.
  - Do not change route boundaries, server components, API routes, auth redirects, cache mode, or profile snapshot loading.
- TypeScript/domain contracts:
  - Preserve `ProfileSectionKey`, `AthleteProfileSnapshot`, profile/CSS/preferences/records/capability draft types, API payload parsing, and local draft serialization.
  - Add only local presentation helpers/types for feedback tone/message semantics if needed.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, SDK, secret, webhook, retry, or idempotency contract change.
- UI system:
  - Use existing My Library/member visual language and recent AW-006 feedback semantics.
  - Do not create a broad app-wide notice primitive in this slice.
  - Screenshot handoff comparison type: `after/reference`, comparing changed My Swim Profile feedback to mature My Library/Habits/export feedback references where practical.
- Testing:
  - Update focused Vitest coverage for success/error live-region semantics and unchanged section behavior.
  - Keep existing e2e aligned unless selectors/semantics require a focused update.

## Data Placement And Sync Contract

- Server-canonical data:
  - Athlete profile, CSS metric, training preferences, personal records, and swim capability limits remain server-canonical through existing owner-scoped API routes and snapshot refreshes.
- Local data:
  - Unsaved drafts and disclosure state remain local-only in existing localStorage keys.
  - This slice adds no new persisted local data.
- Sync policy:
  - Existing save/delete/reset flows and snapshot refresh behavior remain unchanged.
  - Failed saves keep the affected section open and preserve the draft for retry.
- Retention and sensitivity:
  - Existing draft retention/deletion behavior stays unchanged; feedback must not expose private raw profile data or secrets.
- Cache/invalidation:
  - `/my-library/profile` remains dynamically loaded through the existing route and snapshot helpers; no cache or revalidation behavior changes.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose rule, alias, redirect, or migration behavior. Existing profile IDs, personal record IDs, labels, and analytics names remain unchanged.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Touched: My Swim Profile section feedback for `profile`, `css`, `preferences`, `capabilities`, and `records`.
  - Not touched: profile data contracts, API routes, localStorage key names, analytics payloads, auth, Supabase, route labels, or Help/Guide.
- Source of truth:
  - Section identity remains the typed `ProfileSectionKey` union and existing section state in `AthleteProfileHub`.
- Additive behavior:
  - A new profile section can reuse the same local feedback renderer when it is added to `ProfileSectionKey` and its section rendering.
  - Existing success/error copy continues to come from the owning save/reset/delete handlers.
- Explicit mapping requirements:
  - New feedback tones, section types, workflow labels, server-canonical entities, localStorage keys, analytics events, or support promises require explicit code/test/doc review before release.
- Unknown or deprecated values:
  - Unknown section keys should fail closed at TypeScript compile time through the typed section union rather than silently rendering an unmapped state.
  - Deprecated section feedback must remain recoverable until the section is removed in a separate scoped brief.
- Test/evidence:
  - Focused tests assert feedback semantics for at least one success and one error path while preserving section collapse/open behavior.
  - Route/label/support sweep checks My Swim Profile feedback identifiers across code, tests, docs, and runbooks before broad gates.

## Help / Guide Impact

N/A with rationale: this changes only visual/accessibility treatment of existing My Swim Profile feedback. It does not change Help/Guide content, workflow labels, recovery procedures, entitlement rules, support/operator instructions, or admin procedures.

## Route / Label / Support Surface Sweep

Required as a targeted member/profile feedback sweep because this slice changes user-facing feedback semantics.

- Identifiers to search before broad gates:
  - `AthleteProfileHub`
  - `My Swim Profile`
  - `Swimmer profile saved`
  - `CSS saved`
  - `Training preferences saved`
  - `Stroke and skill limits saved`
  - `Best time saved`
  - `Best time deleted`
  - `Could not save swimmer profile`
  - `Could not save CSS`
  - `Could not save training preferences`
  - `Could not save stroke and skill limits`
  - `Could not save best time`
  - `Could not delete best time`
- Surfaces to check:
  - `components/my-library/profile/AthleteProfileHub.tsx`
  - `tests/unit/athlete-profile-hub.test.tsx`
  - `tests/e2e/my-library-athlete-profile.spec.ts` if selectors/semantics change
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - canonical AW-006 queue
  - `docs/runbooks/`
- Expected fallout:
  - Athlete profile component, focused unit tests, active brief, canonical AW-006 queue, notice inventory, and screenshot artifacts only.
  - No profile API, Supabase, auth, analytics, Help/Guide, support-procedure, or admin workflow fallout.

## Scope

- Improve `components/my-library/profile/AthleteProfileHub.tsx` feedback presentation and accessibility semantics for existing section success/error messages.
- Preserve profile editing, CSS editing, preferences editing, advanced capability limits editing, personal record create/update/delete, local draft recovery, disclosure persistence, pending flags, analytics events, API payloads, and copy.
- Update focused tests in `tests/unit/athlete-profile-hub.test.tsx`.
- Update the canonical AW-006 queue and notice/empty-state inventory.
- Capture required screenshot handoff before broad gates.

## Out Of Scope

- Profile data model, API routes, Supabase, generated database types, migrations, auth, analytics, localStorage key names, profile copy rewrites, section order, readiness scoring, My Library hub, Habits, Training Context, Dryland, Workout Editor, Program Builder, commerce, packages, new dependencies, Help/Guide updates, broad member notice primitive, app-wide design-system primitive, and merge without explicit owner approval.

## Acceptance Criteria

1. All five My Swim Profile section feedback renderings use one profile-local feedback contract/helper.
2. Error feedback is announced as an alert/assertive live region and keeps the affected section recoverable.
3. Success feedback is announced politely and preserves the existing section collapse behavior.
4. Existing save/reset/delete payloads, local draft recovery, pending flags, section disclosure persistence, and analytics events remain unchanged.
5. Focused unit tests cover changed feedback semantics and unchanged section behavior.
6. Canonical AW-006 queue and notice/empty-state inventory record this active slice.
7. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

Targeted before screenshot handoff:

- `./node_modules/.bin/vitest run tests/unit/athlete-profile-hub.test.tsx` passed on 2026-05-24.
- `npm run typecheck` passed on 2026-05-24 after removing stale generated `.next/dev/types` output that referenced the prior Workout Editor screenshot fixture route.
- `git diff --check` passed on 2026-05-24.
- `npm run lint:briefs:all` passed on 2026-05-24.
- targeted route/label/support sweep for My Swim Profile feedback identifiers found only expected fallout in `AthleteProfileHub`, focused tests, AW-006 queue, notice inventory, this brief, existing e2e/support references, and historical done briefs.

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Captured representative `after/reference` screenshots against `http://127.0.0.1:3000` in `output/aw-006-my-swim-profile-feedback-2026-05-24-154445`.
- Temporary screenshot fixture route/script were removed after capture; no shipped product-rendering files changed after capture.
- Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.

After screenshot approval:

- `npm run verify:pre-pr` passed on 2026-05-24 after owner screenshot approval.
- open/update PR
- required CI checks green
- `npm run verify:pre-merge`

## Manual QA / Screenshot Plan

- Capture My Swim Profile feedback on desktop and mobile/tablet where practical:
  - reference idle My Swim Profile section state,
  - after profile save success,
  - after one forced save failure or existing tested error state where practical.
- Use `after/reference` naming because the handoff compares changed My Swim Profile feedback to mature My Library/member feedback references rather than a true before-state.

## Completion Record

To be completed after merge and repo-managed closeout.

## Checkpoint Log

- `2026-05-24 | in-progress | owner approved the AW-006 My Swim Profile Section Feedback Semantics slice after fresh queue/design/code re-audit on clean main@db65a06; created branch aw-006-my-swim-profile-feedback and active brief; next: implement the profile-local feedback helper and focused tests, then capture screenshot handoff before broad gates`
- `2026-05-24 | implemented + targeted validation | added a profile-local feedback renderer for My Swim Profile section success/error messages, updated focused unit assertions for polite status and assertive alert semantics, updated AW-006 queue/inventory, and passed targeted Vitest, typecheck, diff check, brief lint, and route/label/support sweep; next: capture required screenshot handoff and stop for owner approval before verify:pre-pr`
- `2026-05-24 | screenshot stop | captured after/reference screenshot artifacts in output/aw-006-my-swim-profile-feedback-2026-05-24-154445, removed the temporary fixture route/script, reran typecheck after clearing stale generated Next dev types, and stopped before verify:pre-pr as required for UI work | next: owner reviews screenshot handoff and either approves or requests visual corrections`
- `2026-05-24 | pre-pr ready | owner approved screenshot handoff; npm run verify:pre-pr passed full lane with branch-current, lint, typecheck, unit, build, perf budgets, and Playwright e2e | next: commit, push, open PR, monitor CI, then run verify:pre-merge before merge recommendation`
