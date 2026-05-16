# Task Brief: My Swim Profile Action-First Setup And Capability Safety (10/10)

## Metadata

- `id`: `2026-05-16-my-swim-profile-action-first-setup-and-capability-safety-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-16`
- `updated`: `2026-05-16`
- `execution mode`: `end-to-end implementation after owner explicitly asked to execute brief`

## Brief Audit Record

- `last_audited`: `2026-05-16`
- `base`: `main@37718c4`
- `audit_status`: `ready`
- `decision`: Use this focused Profile brief after the Goals Action-First Simplification and closeout, before any broader My Library redesign.
- `reason`: Audit found `main` clean, My Swim Profile visually and structurally behind Habits/Micro Sessions, and the capabilities save route has a data-safety risk because it deletes existing limits before reinserting replacements.
- `must_refresh_before_execution_if`: Refresh before execution if AGENTS.md, scorecard categories, `/my-library/profile`, `AthleteProfileHub`, swim capability limit contracts, Supabase profile/capability routes, My Library reference surfaces, Help/Guide/support runbooks, screenshot rules, or validation lanes change.

## Goal

Make My Swim Profile an action-first setup surface that shows the next useful profile action quickly, keeps advanced generator limits out of the first-use path, and makes swim capability saves data-safe under failure.

## Product Decisions

- My Swim Profile should take interaction clarity from Habits and Micro Sessions, not copy their playful bubble treatment.
- First-use should not open every missing section at once; it should show one recommended next setup action and compact readiness summaries.
- `Swim capabilities` is an advanced generator-limits setup area, not equal-weight first-run profile identity content.
- Profile identity, CSS, preferences, records, and capability limits remain owner-scoped private data.
- Capability write safety is a prerequisite for visual polish because UI cleanup must not hide a destructive mutation risk.
- Any screenshot handoff for this brief is required before `npm run verify:pre-pr`, PR creation/update, and `npm run verify:pre-merge`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode for this brief:

- every `target` category must close at `5/5`,
- no target category may close at `4/5` and still claim 10/10.

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping  | Target Threshold / Scope Rationale                                                                                                                                                                                     | Evidence                                                                                       | Expected Closeout Score |
| --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target` | My Swim Profile has a compact readiness summary, one recommended next action, and a clear hierarchy for profile, CSS, preferences, records, and advanced generator limits.                                             | product audit + route review + screenshot handoff                                              | `5/5`                   |
| UX flow clarity                               | `target` | Empty/first-use users do not receive every section opened at once; only the most important missing setup action is expanded, with secondary sections reachable and understandable.                                     | component tests + manual flow QA + screenshots                                                 | `5/5`                   |
| Visual design quality                         | `target` | Profile page avoids card-inside-card overload, text-only collapse clutter, inconsistent primary button colors, and mobile crowding while staying consistent with My Library/Habits/Micro visual language.              | before/after or after/reference screenshots for mobile and desktop                             | `5/5`                   |
| Business logic correctness and data integrity | `target` | Capability saves cannot silently erase existing limits on partial write failure; profile, CSS, preferences, and records preserve existing save/delete invariants.                                                      | route/API negative tests + component tests + implementation review                             | `5/5`                   |
| Admin editor ergonomics                       | `N/A`    | N/A because this changes authenticated owner Profile setup, not admin editing, publishing, moderation, or operator CRUD.                                                                                               | explicit admin editor scope rationale                                                          | `N/A`                   |
| Accessibility (a11y)                          | `target` | Summary actions, section toggles, save buttons, status/error messaging, advanced limits, and record controls remain keyboard reachable, labelled, focus-visible, and screen-reader understandable.                     | Testing Library assertions + Playwright/semantic review + screenshot review                    | `5/5`                   |
| Performance (CWV + payloads)                  | `target` | `/my-library/profile` keeps existing private-route budgets, adds no dependency, and avoids increasing first-use render cost beyond bounded summary/section state.                                                      | dependency diff + build evidence + route review                                                | `5/5`                   |
| Data placement and sync boundaries            | `target` | Profile entities and capability limits remain server-canonical; disclosure state remains local-only; draft restore behavior is explicit and does not become business truth.                                            | data-boundary review + tests for save/draft behavior                                           | `5/5`                   |
| Caching and invalidation strategy             | `target` | Successful saves refresh local route state without stale readiness summaries or stale capability limits; private route cache behavior remains explicit.                                                                | component/route tests + manual refresh QA                                                      | `5/5`                   |
| Reliability and failure handling              | `target` | Failed profile/capability saves leave previous server data intact, show recoverable UI, and do not collapse/mark sections complete incorrectly.                                                                        | negative-path tests + failure-mode QA                                                          | `5/5`                   |
| Security and authz                            | `target` | Protected profile and capability writes stay authenticated, owner-scoped, fail-closed, and input-validated; client readiness state cannot bypass server authorization.                                                 | route tests for unauthenticated/forbidden/error paths + auth boundary review                   | `5/5`                   |
| Privacy and compliance                        | `target` | No private profile values, records, CSS, preferences, or capability details are emitted into unsafe logs/events; UI does not expose data outside the authenticated owner context.                                      | analytics/log payload review + route privacy review                                            | `5/5`                   |
| Content governance                            | `target` | Labels for `My Swim Profile`, readiness, advanced generator limits, save states, and support docs use one consistent terminology contract.                                                                             | route/label/support sweep + docs/test assertions                                               | `5/5`                   |
| Admin workflow and editability                | `N/A`    | N/A because no admin role, support console, publish workflow, admin mutation, or operator editability changes in this slice.                                                                                           | explicit admin workflow scope rationale                                                        | `N/A`                   |
| SEO and crawlability                          | `N/A`    | N/A because `/my-library/profile` is authenticated/private and this brief changes no public metadata, robots, sitemap, canonical, or crawlable content.                                                                | explicit private-route rationale                                                               | `N/A`                   |
| AI discoverability                            | `N/A`    | N/A because this brief creates no public AI-discoverable content, structured data, public docs page, or crawl-safe entity surface.                                                                                     | explicit private-route rationale                                                               | `N/A`                   |
| Analytics and KPI observability               | `target` | Existing profile view/action events remain safe and include enough non-sensitive context to distinguish setup readiness and capability-limit presence when instrumentation is touched.                                 | event taxonomy review + analytics payload tests if events change                               | `5/5`                   |
| Commerce and revenue ops                      | `N/A`    | N/A because this changes no pricing, checkout, entitlement, subscription, refund, payout, invoice, or revenue operation.                                                                                               | explicit commerce scope rationale                                                              | `N/A`                   |
| Incident response and support operations      | `target` | Support docs can diagnose hidden sections, failed capability saves, stale readiness summaries, missing records, and local draft restore without exposing private profile data.                                         | `docs/runbooks/auth-account-support.md` update or explicit no-change rationale + support sweep | `5/5`                   |
| Finance and reporting operations              | `N/A`    | N/A because private Profile setup has no finance, payout, refund, entitlement, invoice, subscription, reporting export, or reconciliation impact.                                                                      | explicit finance scope rationale tied to this private profile slice                            | `N/A`                   |
| i18n operational readiness                    | `target` | New or changed labels remain short, stable, and locale-ready without grammar-coupled string composition.                                                                                                               | copy review + tests for key labels                                                             | `5/5`                   |
| Stack-fit and dependency discipline           | `target` | Reuse existing `AthleteProfileHub`, My Library/Habits/Micro reference patterns, current API route structure, Tailwind/UI primitives, Supabase patterns, and test stack; add no dependency unless separately justified. | architecture review + no-dependency diff                                                       | `5/5`                   |
| Testing and QA automation                     | `target` | Unit/component/API tests cover first-use disclosure, readiness actions, capability save success/failure, auth negative paths, and no-data-loss failure behavior; screenshots cover mobile and desktop.                 | targeted Vitest/API tests + screenshot handoff + `verify:pre-pr`/`verify:pre-merge`            | `5/5`                   |
| Scalability and cost efficiency               | `target` | Readiness and capability logic stay bounded by current profile sections and capability limit count; no polling, broad history scans, or new background jobs.                                                           | code review + tests for bounded state                                                          | `5/5`                   |
| DevOps and rollback readiness                 | `target` | Prefer no migration unless atomic capability replacement requires a small additive RPC/migration; rollback path and migration safety are documented before PR handoff.                                                 | no-migration review or migration/rollback notes + gate logs                                    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces are `components/my-library/habits/HabitPerfectDayHub.tsx` for action-first row behavior and `components/my-library/dryland/DrylandMicroPlanPanel.tsx` for compact mode controls.
  - Changed route remains `/my-library/profile` through `app/my-library/profile/page.tsx`.
  - Keep server loading and owner authentication on existing route/API boundaries.
  - Prefer extracting small view-model/helpers from `AthleteProfileHub` if needed instead of adding more large inline logic to the 2300+ line component.
- TypeScript/domain contracts:
  - Reuse existing athlete profile, CSS, preference, personal record, and swim capability types.
  - Add deterministic section/readiness helpers only when they reduce repeated rendering logic.
  - Capability payload validation must be explicit and parse-safe.
- Supabase/data layer:
  - Capability limits are server-canonical and owner-scoped.
  - Fix capability replacement so a partial write cannot erase prior limits.
  - Acceptable implementation patterns include a transaction-safe RPC/migration or another deterministic write sequence that preserves existing rows on failure.
  - If a migration/RPC is used, include generated type/update evidence and rollback notes.
- External services/tools:
  - No external service, wearable, analytics vendor, payment, email, or notification integration is in scope.
- UI system:
  - Use existing Tailwind tokens, button/chip/status patterns, and My Library layout language.
  - Blue is the main action color; green is reserved for saved/success/complete status.
  - Replace repetitive text-only `Collapse` controls with a more compact accessible toggle pattern where practical.
  - Screenshot handoff should be `before/after` for My Swim Profile and `after/reference` where comparing against Habits/Micro is useful.
- Testing:
  - Component tests for first-use/open-section behavior, readiness next action, save state, and advanced limits placement.
  - API/route tests for capability save success, validation failure, auth failure, and write-failure no-data-loss behavior.
  - Screenshot handoff before PR gates.

## Data Placement And Sync Contract

- Server-canonical data:
  - athlete profile identity fields,
  - CSS value and related training setup,
  - training preferences,
  - personal records,
  - swim capability limits.
- Local-only data:
  - disclosure/open-section state,
  - transient unsaved form drafts,
  - client-side readiness presentation,
  - focus/scroll target after a save or section action.
- Sync policy:
  - server saves become truth only after successful authenticated mutation and returned/loaded state refresh.
  - readiness summaries derive from the latest loaded server state plus explicit local unsaved/draft state.
  - local drafts can help recovery but must never mark a setup item complete until server save succeeds.
  - capability writes must preserve the last known server-canonical limits if validation or persistence fails.
- Conflict policy:
  - if server data changes while local drafts are open, the UI must not silently overwrite user edits or mark old data as newly saved.
  - after failed save, keep the relevant section open with actionable error copy.
- Retention and sensitivity:
  - local draft retention must remain bounded and owner-scoped.
  - do not log raw profile values, medical-like limits, private notes, or personal records.
- Cache/invalidation:
  - authenticated profile route remains dynamic/private.
  - successful writes refresh the affected local state and section readiness.

## Identity And Rename Contract

- Canonical stable ID:
  - owner/user id remains the profile ownership boundary.
  - personal records and capability rows use their existing stable database ids where available.
  - capability limit identity is the stable stroke/distance/limit key contract already used by the domain.
- Human-readable identifiers:
  - section titles, action labels, stroke names, distance labels, and readiness copy are display labels and may be revised without changing stored identity.
- Mutability rules:
  - page/section labels are renameable UI copy.
  - profile, preference, record, and capability values are mutable through their existing authenticated save flows.
- Rename vs repurpose policy:
  - changing a display label does not repurpose stored profile data.
  - materially different record/capability semantics require a new domain key or migration, not silent reuse of an old key.
- Compatibility contract:
  - existing saved profile data, records, and capability limits remain readable after this change.
  - no route rename is planned.
- Observability and repair:
  - failures should distinguish validation error, auth error, persistence error, stale local draft, and capability write failure without exposing private data.

## Scope

- My Swim Profile IA and first-use behavior:
  - add a compact readiness/summary area for profile setup status,
  - show one recommended next action,
  - open only the highest-priority missing section by default for empty/first-use users,
  - keep secondary missing sections collapsed but discoverable.
- Section hierarchy and visual rhythm:
  - reduce nested card/card visual weight,
  - align primary/secondary/save/status button styles,
  - simplify repeated `Collapse` controls into a compact accessible pattern,
  - keep all edit controls reachable on mobile and desktop.
- Capability limits placement:
  - move or relabel `Swim capabilities` as advanced generator limits,
  - collapse it by default unless it is the selected next action or the user already manages those limits,
  - update docs/runbooks that describe Profile contents.
- Capability write safety:
  - fix the replacement mutation so failed writes do not delete existing limits,
  - add negative tests around auth, validation, and partial persistence failure.
- Observability/support:
  - update safe analytics/page-view context if needed,
  - update support/user-flow docs for readiness, advanced limits, and failed save diagnosis.

## Out Of Scope

- New public route, route rename, or My Library navigation redesign outside `/my-library/profile`.
- Full Habits or Micro Sessions redesign.
- Turning Profile into a playful bubbles/game surface.
- New profile schema fields except the smallest additive database/RPC change needed for capability write safety.
- New reminders, notifications, wearables, Apple Health/Garmin/Strava/Fitbit, email, or analytics vendor.
- Admin, commerce, checkout, entitlements, public SEO, or finance/reporting changes.
- Merge or release without explicit owner approval.

## Acceptance Criteria

1. Empty/first-use My Swim Profile no longer opens profile, CSS, preferences, capabilities, and records all at once.
2. The page shows a compact readiness summary with a single clear recommended next action.
3. Profile, CSS, preferences, records, and advanced generator limits remain discoverable from the first viewport or immediately below it on mobile.
4. `Swim capabilities` is clearly positioned as advanced generator limits or equivalent, not equal-weight first-run setup.
5. A user with existing data sees useful status summaries instead of unnecessary expanded forms.
6. Save buttons use consistent action semantics and colors; green is reserved for saved/success/status.
7. Section toggles are accessible and less visually noisy than repeated full text `Collapse` buttons.
8. Mobile layout avoids card-inside-card crowding, overlapping controls, and bottom-nav obstruction.
9. Desktop layout keeps scan-friendly density without marketing/hero treatment.
10. Existing profile, CSS, preference, record, and capability edit flows remain available.
11. Capability save success persists the requested limits.
12. Capability validation failure leaves existing server limits unchanged.
13. Capability persistence failure after validation leaves existing server limits unchanged.
14. Unauthenticated capability/profile writes fail closed with `401`/`403`, not destructive behavior or `500`.
15. Failed saves keep the relevant section open with actionable error feedback.
16. Readiness summaries update only after successful save or loaded server state refresh.
17. Local drafts do not mark setup complete by themselves.
18. Analytics/log payloads do not include raw private profile values or capability details.
19. Docs/runbooks that describe My Swim Profile include advanced generator limits where relevant.
20. Screenshot handoff includes mobile and desktop My Swim Profile before/after, plus optional Habits/Micro reference artifacts if useful.

## Validation

Planning/brief validation:

- `npm run lint:briefs`

Implementation validation when this brief is executed:

- targeted component tests for `AthleteProfileHub`
- targeted API/route tests for profile and capability routes
- targeted route/label/support sweep before broad gates
- screenshot handoff before `npm run verify:pre-pr`
- owner screenshot approval or correction pass before PR creation/update and broad gates
- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e` if changed flow needs browser coverage beyond screenshots
- `npm run build`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local authenticated `/my-library/profile`.
- Empty/first-use profile state.
- Existing populated profile state with CSS, preferences, records, and capability limits.
- Mobile and desktop viewport screenshots.
- Vercel preview after PR checks are green.

## Completion Record

- `merged_pr`: `#728`
- `merge_commit`: `a9daafb Make profile setup action-first and capability saves atomic (#728)`
- `completed`: `2026-05-16`
- `implementation_commit`: `c4d0c78`
- `validation`: targeted Vitest PASS for `tests/unit/athlete-profile-hub.test.tsx`, `tests/unit/athlete-profile-routes.test.ts`, and `tests/unit/swim-capability-limits.test.ts`; `npm run lint`, `npm run typecheck`, and `npm run verify:pre-pr` PASS full lane on `c4d0c78`; `npm run verify:pre-merge` PASS on `c4d0c78`; GitHub required checks PASS including `verify`.
- `screenshot_handoff`: owner-approved before PR gates; artifacts at `output/my-swim-profile-action-first-2026-05-16-193012`; no product-rendering files changed after final capture.
- `support_impact`: `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, and related registry docs updated for readiness, advanced generator limits, and failed save diagnosis.
- `policy_impact`: PASS in PR body; no privacy/cookie/GDPR policy text change required because the slice adds no new processor, consent boundary, retention category, or public data surface.
- `perf_budget_decision`: `hold`; full gate reported repeated green weekly runs, but this Profile slice changed no route budget and deferred tightening to a separate performance-governance slice.
- `10/10 claim`: yes for the scoped My Swim Profile action-first setup and capability-save safety workstream.

Critical target categories for `10/10` claim all achieved `5/5`:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Achieved Score | Evidence                                                                                                                        | Remaining Gap                                  |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Product goals and IA                          | `5/5`          | Profile now opens around setup readiness, one recommended action, compact status rows, and advanced generator limits hierarchy. | None for scoped Profile setup.                 |
| UX flow clarity                               | `5/5`          | First-use disclosure, readiness actions, advanced limits placement, and existing-data summaries are covered by tests/screens.   | None.                                          |
| Visual design quality                         | `5/5`          | Owner-approved mobile/desktop before/after screenshot handoff confirms reduced clutter and scan-friendly layout.                | None.                                          |
| Business logic correctness and data integrity | `5/5`          | Capability save route uses atomic replacement RPC; tests cover success, validation failure, and persistence failure no-loss.    | None.                                          |
| Accessibility (a11y)                          | `5/5`          | Section toggles/actions remain labelled and keyboard reachable; component tests assert accessible controls and status copy.     | None.                                          |
| Performance (CWV + payloads)                  | `5/5`          | No new dependency or broad data fetch; build/perf budgets passed in `verify:pre-pr` and `verify:pre-merge`.                     | Budget tightening deferred outside this slice. |
| Data placement and sync boundaries            | `5/5`          | Server-canonical profile/capability data and local-only disclosure/draft state stayed explicit in code, tests, and docs.        | None.                                          |
| Caching and invalidation strategy             | `5/5`          | Successful saves refresh local route state/readiness; failed saves keep prior server truth and actionable recovery state.       | None.                                          |
| Reliability and failure handling              | `5/5`          | Failed saves preserve existing capability rows and keep the relevant section open with recoverable error behavior.              | None.                                          |
| Security and authz                            | `5/5`          | Authenticated owner-scoped API routes remain fail-closed; unauthenticated and invalid payload paths are covered by tests.       | None.                                          |
| Privacy and compliance                        | `5/5`          | Analytics/log review kept raw profile, record, CSS, preference, and capability values out of unsafe payloads.                   | None.                                          |
| Content governance                            | `5/5`          | Route/label/support sweep aligned Profile, readiness, advanced generator limits, docs, and test assertions.                     | None.                                          |
| Analytics and KPI observability               | `5/5`          | Safe profile action/readiness context remained non-sensitive and adequate for setup flow observation.                           | None.                                          |
| Incident response and support operations      | `5/5`          | Auth/account support runbook documents hidden sections, failed saves, stale readiness, draft restore, and advanced limits.      | None.                                          |
| i18n operational readiness                    | `5/5`          | Changed labels are short, stable, and not grammar-coupled; key copy is asserted in component tests.                             | None.                                          |
| Stack-fit and dependency discipline           | `5/5`          | Reused `AthleteProfileHub`, existing API/test/Supabase patterns, Tailwind tokens, and generated DB type workflow; no dep added. | None.                                          |
| Testing and QA automation                     | `5/5`          | Targeted unit/API tests, screenshot handoff, full `verify:pre-pr`, full `verify:pre-merge`, and green CI covered the slice.     | None.                                          |
| Scalability and cost efficiency               | `5/5`          | Readiness and limits logic stay bounded by existing profile sections and capability row count; no polling/background job added. | None.                                          |
| DevOps and rollback readiness                 | `5/5`          | Additive Supabase RPC migration was applied before final gate; rollback is revert of `a9daafb` plus migration review.           | None.                                          |

## Help / Guide Impact

Required unless implementation proves labels and support behavior did not change:

- update `docs/user-flow-map.md` to include capability limits as advanced generator setup for `/my-library/profile`,
- update `docs/runbooks/auth-account-support.md` so support can diagnose Profile readiness, failed profile saves, failed capability saves, local draft restore, and advanced generator limits without requesting private values,
- update Help/Guide assertions only if in-app Help/Guide content changes.

## Route / Label / Support Surface Sweep

Run a targeted sweep before broad verification for:

- `My Swim Profile`
- `AthleteProfileHub`
- `Swim capabilities`
- `capability`
- `capability limits`
- `generator limits`
- `Advanced`
- `Collapse`
- `Save profile`
- `Save CSS`
- `Save preferences`
- `Save records`
- `personal records`
- `/my-library/profile`
- `athlete_profile_viewed`

Minimum surfaces:

- `app/`
- `components/`
- `lib/`
- `tests/`
- `docs/`
- `docs/runbooks/`
- `docs/task-briefs/planned/`
- `docs/task-briefs/in-progress/`
- `docs/task-briefs/done/`

Evidence:

- Identifiers searched: `My Swim Profile`, `AthleteProfileHub`, `Swim capabilities`, `capability limits`, `generator limits`, `Advanced`, `Collapse`, `Save profile`, `Save CSS`, `Save preferences`, `Save records`, `personal records`, `/my-library/profile`, `athlete_profile_viewed`, `replace_swim_capability_limits`, and `swim_capability_limits`.
- Surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/architecture/`, `docs/task-briefs/planned/`, `docs/task-briefs/in-progress/`, `docs/task-briefs/done/`, `supabase/`, and `types/`.
- Fallout handled: Profile page analytics payload, `AthleteProfileHub` labels and section behavior, capability API route, Supabase RPC migration, generated DB type contract, route/component/API tests, Profile e2e section-opening helper, `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, data-access/authz/cache registry, and this brief.

## Screenshot Handoff Requirement

- Use `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.
- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000` unless an approved equivalent is already running.
- Capture against `http://127.0.0.1:3000`.
- Artifact folder must be date/time stamped, for example `output/my-swim-profile-action-first-YYYY-MM-DD-HHMMSS`.
- Required representative artifacts:
  - `before-my-swim-profile-mobile.*`
  - `after-my-swim-profile-mobile.*`
  - `before-my-swim-profile-desktop.*`
  - `after-my-swim-profile-desktop.*`
  - optional `reference-habits-mobile.*` or `reference-micro-sessions-mobile.*` if comparing against reference surfaces.
- Handoff text must state whether the set is `before/after` or `after/reference`, include a clickable `Screenshot artifacts` folder link, and stop for owner approval before PR gates.

## Checkpoint Log

- `2026-05-16 | planned | created after owner asked to turn Profile/Habits/Micro audit into a brief; base main@37718c4 was clean; next: owner may say execute/build/implement this brief to move it to in-progress and start implementation`
- `2026-05-16 | in-progress | owner explicitly said "execute brief"; branch profile-action-first-capability-safety created from main@37718c4 after fetch confirmed origin/main@37718c4; next: implement action-first Profile UI/IA, capability write-safety, tests, docs, and screenshot handoff`
- `2026-05-16 | in-progress | implemented Profile readiness summary, one-section default setup disclosure, advanced generator limits positioning, atomic capability replacement RPC, safe analytics payload additions, route/support/registry docs, and targeted component/API tests; targeted validation passed: \`./node_modules/.bin/vitest run tests/unit/athlete-profile-hub.test.tsx tests/unit/athlete-profile-routes.test.ts tests/unit/swim-capability-limits.test.ts\` (3 files, 17 tests), \`npm run typecheck\`, and \`npm run lint\`; route/label/support sweep ran for the required Profile/capability terms across app/components/lib/tests/docs; next: capture required before/after screenshots and stop for owner visual approval before pre-PR gates`
- `2026-05-16 | screenshot handoff stop | captured required before/after mobile and desktop screenshots in \`output/my-swim-profile-action-first-2026-05-16-193012\` after regenerating after-screenshots for the final mobile readiness-row adjustment; no product-rendering files changed after the final capture; next: wait for owner screenshot approval before \`npm run verify:pre-pr\`, commit/push, and PR flow`
- `2026-05-16 | owner approved screenshots | owner approved the screenshot handoff; the linked Supabase remote database was updated with \`20260516120000_replace_swim_capability_limits_rpc.sql\` after the first pre-PR run found migration drift; next: rerun \`npm run verify:pre-pr\` after adding explicit route/label/support sweep evidence`
- `2026-05-16 | pre-pr gate passed | \`npm run verify:pre-pr\` passed full lane after the Supabase migration was applied and route/label/support evidence was added; result included lint, typecheck, unit tests, build, perf budgets, and Playwright (84 passed, 408 skipped in existing dev-login-gated matrix); perf trend reported 5 consecutive weekly green runs, and this Profile slice records a hold/defer decision for budget tightening because no route budget is being changed here; next: commit, push, open PR, monitor CI, then run \`npm run verify:pre-merge\` before merge recommendation`
- `2026-05-16 | done | PR #728 merged to main as \`a9daafb\` after owner approval, green GitHub CI, green local \`verify:pre-pr\`, and green local \`verify:pre-merge\`; post-merge preflight surfaced this repo-managed docs-only closeout, moved brief from in-progress to done, and recorded achieved 10/10 target evidence | next: validate, merge, sync, and rerun post-merge preflight for the closeout PR`
