# Task Brief: Browser Tab Identity Metadata Sweep (10/10)

## Metadata

- `id`: `2026-06-16-browser-tab-identity-metadata-sweep-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-16`
- `updated`: `2026-06-16`
- `parent_intake`: `docs/task-briefs/planned/2026-06-15-admin-notes-june-15-disposition-intake-10-10.md`
- `source_note`: `089310a1-bd63-4642-9487-9440cc5f6e1c`
- `execution_mode`: `end-to-end after owner approval; pause after screenshot/metadata handoff before pre-PR gate`

## Brief Audit Record

- `last_audited`: `2026-06-16`
- `base`: `main@b6b60652`
- `audit_status`: `ready`
- `decision`: Execute this child as the selected Package C slice for browser tab identity, course metadata, canonical course URLs, and install icon consistency.
- `reason`: Parent intake left the duplicate-tab/favicon finding as a separate small technical child. A metadata sweep gives the finding enough value without mixing Habits, bulk deletion, pricing, admin, or data-mutation work.
- `must_refresh_before_execution_if`: Refresh if Next.js metadata behavior, `app/layout.tsx`, `app/manifest.ts`, `app/course/page.tsx`, `app/course/courseData.ts`, course route identity helpers, sitemap behavior, site-lock metadata rules, or screenshot handoff rules change before this PR lands.

## Goal

Make Freeswimming browser-tab identity consistent for the public course route and course lessons: stable app icons, meaningful titles, canonical metadata, and regression tests that future course lessons inherit.

## Pre-Implementation Owner Explanation

Vi rydder opp i hvordan Freeswimming ser ut i nettleserfanen og i metadata for kurs/leksjoner. Det betyr noe fordi faner, deling og sokemotor-signaler skal vise riktig kursidentitet i stedet for aa se generiske eller uferdige ut. Utenfor scope er kursinnhold, admin, Habits, betaling, dataendringer og visuelt redesign av selve siden.

Fremoverkompatibilitet: nye kursleksjoner skal automatisk faa tittel og canonical fra kanoniske kursdata. Nye merkeikoner eller en ny URL-modell for kurs krever eksplisitt mapping, tester og brief-oppdatering.

## Codex Skill + Stack Readiness Radar

Capability audit:

| Capability                     | Evidence                                              | Current Status | Recommended Trigger                                          | Boundary                                      |
| ------------------------------ | ----------------------------------------------------- | -------------- | ------------------------------------------------------------ | --------------------------------------------- |
| `playwright`                   | `/Users/stianvikra/.codex/skills/playwright/SKILL.md` | `installed`    | Screenshot/metadata handoff and targeted browser validation. | Does not replace owner screenshot approval.   |
| `imagegen`                     | session skill metadata                                | `available`    | Only if new bitmap icon assets are explicitly requested.     | Not used for this metadata-only icon sweep.   |
| `openai-docs`                  | session skill metadata                                | `available`    | OpenAI/Codex questions only.                                 | Not relevant to app metadata implementation.  |
| `stripe:stripe-best-practices` | Stripe plugin skill metadata                          | `available`    | Pricing/checkout child only.                                 | Not relevant to this non-commerce child.      |
| Next.js official docs          | `nextjs.org` metadata docs checked on 2026-06-16      | `available`    | Metadata, icons, manifest, canonical behavior.               | Use only current official docs for framework. |

Systemic findings:

| Surface                          | Finding                                                                                                                                                                               | Severity | Recommended Type                 | Owner Decision Needed | Follow-Up Brief Path |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | --------------------- | -------------------- |
| Course route metadata            | `/course` is a client route using `lesson` query params, so stable overview metadata should live in the route layout and lesson tab identity should sync from the client query state. | `medium` | `bounded implementation child`   | `no`                  | This brief           |
| Browser icon / manifest identity | Root favicon and manifest exist, but course metadata lacks explicit lesson title/canonical test coverage.                                                                             | `medium` | `bounded implementation child`   | `no`                  | This brief           |
| Broader Package C backlog        | Habits history, bulk workout deletion, and pricing touch separate data/product/commerce surfaces.                                                                                     | `medium` | `deferred architecture decision` | `yes`                 | `TBD`                |

Return path:

- Parent: `docs/task-briefs/planned/2026-06-15-admin-notes-june-15-disposition-intake-10-10.md`
- Completed Package A: `docs/task-briefs/done/2026-06-15-admin-dashboard-editor-simplification-10-10.md`
- Current child: this in-progress brief.
- Next planning step after this child closes: choose whether to keep Package C idle or promote one of Habits history, My Swim Sessions bulk delete, or pricing into a separate owner-approved child.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `Business logic correctness and data integrity`
- `SEO and crawlability`
- `AI discoverability`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                     | Evidence                                           | Expected score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | -------------- |
| Product goals and IA                          | `target`     | Course browser/tab identity uses course/lesson purpose, not generic site-only copy, while preserving current `/course` IA.                                         | metadata helper tests + browser handoff            | 5/5            |
| UX flow clarity                               | `supporting` | Supporting only: no page-flow changes; duplicate/browser tab recognition should improve without changing navigation.                                               | screenshot/metadata handoff                        | 5/5            |
| Visual design quality                         | `target`     | App icon/fane identity remains stable and recognizable; no page layout visual changes are introduced.                                                              | screenshot handoff of course tab/head output       | 5/5            |
| Business logic correctness and data integrity | `target`     | Lesson metadata resolves from canonical lesson IDs, canonicalizes legacy IDs, and falls back deterministically for unknowns.                                       | unit tests                                         | 5/5            |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor route, workflow, labels, or controls change in this slice.                                                                             | diff review                                        | N/A            |
| Accessibility (a11y)                          | `supporting` | Supporting only: no interactive UI changes; existing page semantics must remain untouched by the server/client split.                                              | targeted render/e2e smoke or diff review           | 5/5            |
| Performance (CWV + payloads)                  | `target`     | No new dependency and no meaningful route payload growth; metadata generation uses local course constants only.                                                    | dependency diff + build/pre-PR gate                | 5/5            |
| Data placement and sync boundaries            | `target`     | Metadata is derived locally from canonical course source data; no browser/local/server user state is added.                                                        | brief contract + code review                       | 5/5            |
| Caching and invalidation strategy             | `target`     | Course metadata stays static/local and does not add request-time fetches or cache invalidation complexity.                                                         | code review + build                                | 5/5            |
| Reliability and failure handling              | `target`     | Unknown or malformed lesson query params fall back to course overview metadata and canonical `/course`.                                                            | unit tests                                         | 5/5            |
| Security and authz                            | `supporting` | Supporting only: no protected routes or authz paths change; metadata must not expose private/admin data.                                                           | diff review                                        | 5/5            |
| Privacy and compliance                        | `target`     | Metadata includes public course copy only and no user/admin/private note content.                                                                                  | metadata tests + diff review                       | 5/5            |
| Content governance                            | `target`     | Browser copy is sourced from course titles/goals and shared helpers, not duplicated ad hoc in page markup.                                                         | helper tests + code review                         | 5/5            |
| Admin workflow and editability                | `N/A`        | N/A because admin CRUD/workflow/editability is not touched.                                                                                                        | diff review                                        | N/A            |
| SEO and crawlability                          | `target`     | `/course` exposes deterministic server metadata; valid `lesson` params update browser title, description, Open Graph, Twitter, and canonical tags after hydration. | unit tests + browser metadata e2e                  | 5/5            |
| AI discoverability                            | `target`     | Public course overview metadata is server-rendered, and lesson tab identity describes the lesson entity without private data when site lock is off.                | metadata tests + existing site-lock metadata tests | 5/5            |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics events, dashboards, or KPI payloads change.                                                                                               | explicit scope rationale                           | N/A            |
| Commerce and revenue ops                      | `N/A`        | N/A because pricing, checkout, entitlements, invoices, payouts, and revenue reporting are untouched.                                                               | explicit scope rationale                           | N/A            |
| Incident response and support operations      | `supporting` | Supporting only: no support workflow changes; browser identity is validated through tests and handoff evidence.                                                    | PR notes + test evidence                           | 5/5            |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not touch payments, finance reports, products, refunds, invoices, payouts, or reconciliation.                                          | explicit scope rationale                           | N/A            |
| i18n operational readiness                    | `target`     | Metadata helper composes from current English course data and keeps one helper boundary for future locale-specific mapping.                                        | unit tests + forward compatibility contract        | 5/5            |
| Stack-fit and dependency discipline           | `target`     | Use Next.js App Router layout metadata, existing course constants, client query-state sync, and no new dependency or route model.                                  | official docs check + dependency diff + typecheck  | 5/5            |
| Testing and QA automation                     | `target`     | Add/update unit coverage for course metadata and run targeted tests, `lint:briefs`, screenshot handoff, then `verify:pre-pr`.                                      | local command output + CI                          | 5/5            |
| Scalability and cost efficiency               | `target`     | Metadata generation remains O(local course list) and uses no external fetch, DB read, or per-request paid service.                                                 | code review + tests                                | 5/5            |
| DevOps and rollback readiness                 | `target`     | Change is reversible without migration or data cleanup; pre-PR/pre-merge gates and CI validate the PR.                                                             | git diff + verify gates + PR CI                    | 5/5            |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Use the official App Router metadata API in `app/course/layout.tsx` for stable course overview metadata.
  - Keep the existing large course page as the client page to avoid a high-risk file split and CI size failure.
  - Preserve the `/course?lesson=<id>` route model and current client canonicalization behavior.
  - Sync browser tab title, description, Open Graph/Twitter tags, robots preview state, and canonical link from the client query state after hydration.
  - Use `alternates.canonical` for the server-rendered course overview URL.
- TypeScript/domain:
  - Derive metadata from `COURSE_LESSONS_FLAT`, `DEFAULT_LESSON_ID`, and runtime identity helpers.
  - Legacy lesson IDs must resolve to canonical lesson IDs for metadata and canonical URLs.
  - Unknown/deprecated lesson IDs must fall back to course overview metadata.
- Supabase/data:
  - N/A: no schema, RLS, generated types, storage, or persisted user data changes.
- External services/tools:
  - Next.js official docs checked for metadata, icons, and manifest behavior on 2026-06-16.
  - No third-party provider, SDK, secret, webhook, or network integration changes.
- UI system:
  - No page UI redesign.
  - Because this changes browser/app identity, provide screenshot/metadata handoff before `verify:pre-pr`.
- Testing:
  - Unit tests for metadata helper/default, valid lesson, legacy ID, unknown ID, canonical URL, manifest/icon references.
  - Existing site-lock/sitemap metadata tests should remain green.

## Data Placement And Sync Contract

- Server-canonical data:
  - N/A for user data. Course metadata source is the checked-in canonical course data.
- Local data:
  - No new local browser state.
- Sync policy:
  - No writes, sync, conflict handling, or retries are added.
- Retention and sensitivity:
  - Metadata may contain public course titles/goals only.
  - No private admin notes, user data, auth data, or analytics identifiers may enter metadata.
- Cache/invalidation:
  - Metadata generation uses static local imports and does not add request-time fetches.

## Identity And Rename Contract

- Canonical stable ID:
  - Course lesson runtime ID from `COURSE_LESSONS_FLAT`.
- Human-readable identifiers:
  - Lesson title and goal are editable course content labels, used only as display metadata.
- Mutability rules:
  - Lesson IDs remain routing-critical; metadata must canonicalize legacy IDs rather than treating title as identity.
- Rename vs repurpose policy:
  - Renaming a lesson title updates metadata automatically for the same canonical ID.
  - Repurposing a materially different lesson should create/update canonical lesson identity through the existing course identity process.
- Compatibility contract:
  - Legacy IDs resolve to canonical IDs in metadata URLs.
  - Unknown IDs fall back to `/course`.
- Observability and repair:
  - Unit tests cover canonicalization and unknown fallback.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Course lesson IDs, lesson titles, lesson goals, route query params, public metadata fields, app icons, manifest icon list, and future locales.
- Source of truth:
  - Course metadata derives from `COURSE_LESSONS_FLAT` and runtime identity helpers.
  - App icon metadata derives from `app/layout.tsx`, `app/favicon.ico`, `app/manifest.ts`, and public icon assets.
- Additive behavior:
  - New lessons added to canonical course data should get metadata automatically.
  - Legacy aliases added through the runtime identity manifest should canonicalize automatically.
- Explicit mapping requirements:
  - New route shapes, locale-specific metadata, new icon assets, or a different browser-tab naming policy require explicit code/test/doc updates.
- Unknown or deprecated values:
  - Unknown lesson query params fall back to course overview metadata and canonical `/course`.
  - Deprecated/legacy IDs resolve through the canonical runtime identity map when known.
- Test/evidence:
  - Unit tests for future-like lessons or canonical data-driven resolution.
  - Unit tests for legacy and unknown values.
  - Screenshot/metadata handoff before broad gates.

## Scope

- `app/course` route metadata and server/client boundary if needed.
- Shared course metadata helper if useful.
- Root app icon/manifest metadata references if consistency gaps are found.
- Unit/e2e metadata tests.
- Parent intake checkpoint update for the selected Package C child.

## Out Of Scope

- Course lesson content edits.
- Admin UI or admin note mutations.
- Habits, My Swim Sessions bulk deletion, pricing, checkout, entitlements, analytics, or auth.
- Database migrations, Supabase RLS, generated types, storage, or persisted user data.
- Large UI redesign or new visual asset generation unless needed to fix an existing icon reference.

## Acceptance Criteria

1. `/course` has deterministic course overview metadata.
2. `/course?lesson=<canonical-id>` has deterministic browser title, description, Open Graph/Twitter title, and canonical URL after hydration.
3. `/course?lesson=<legacy-id>` browser metadata canonicalizes to the canonical lesson URL.
4. Unknown lesson values fall back to course overview metadata and canonical `/course`.
5. App icon and manifest references stay internally consistent.
6. Changed behavior is covered by targeted tests.
7. Screenshot/metadata handoff is provided before `npm run verify:pre-pr`.
8. `npm run verify:pre-pr` passes before PR update; `npm run verify:pre-merge` passes before merge readiness.

## Validation

- `npm run lint:briefs`
- targeted unit tests for course metadata and manifest/site-lock metadata
- targeted browser metadata/screenshot handoff
- `npm run verify:pre-pr`
- PR CI required checks
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-16`: Branch `browser-tab-identity-metadata-sweep` created from clean synced `main@b6b60652`; brief created; next step is implementation.
- `2026-06-16`: Implemented the first metadata helper and targeted tests. Validation at that checkpoint: `./node_modules/.bin/vitest run tests/unit/course-page-metadata.test.ts tests/unit/site-lock-metadata-routes.test.ts` passed, `npm run lint:briefs:all` passed, and `npm run typecheck` passed. Screenshot/metadata handoff captured in `output/browser-tab-identity-metadata-sweep-2026-06-16-010820`; local dev-server logs included expected Supabase egress-guard skips for screenshot-only API/analytics fallback, with no cloud write required.
- `2026-06-16`: Owner screenshot review flagged the mid-page course learning cards as not 10/10 design. Added explicit UI correction child `docs/task-briefs/in-progress/2026-06-16-course-lesson-learning-cards-polish-10-10.md`; next step is refreshed implementation and screenshot handoff before `verify:pre-pr`.
- `2026-06-16`: UI correction child executed through the owner-requested 10/10 pass. The refreshed screenshot handoff is in `output/course-lesson-learning-cards-10-10-2026-06-16-143216`; targeted e2e for course lesson learning cards/pass criteria passed with `3 passed`. Next step remains owner screenshot approval before `npm run verify:pre-pr`.
- `2026-06-16`: CI `size-check` rejected the first PR shape because moving the 4k-line course client into a new file made GitHub count 9,272 changed lines. Reworked metadata implementation to keep `app/course/page.tsx` as the client page, add `app/course/layout.tsx` for server overview metadata, and sync lesson browser metadata from the existing query state. Targeted validation after rework: `npm run typecheck` passed, `./node_modules/.bin/vitest run tests/unit/course-page-metadata.test.ts tests/unit/supabase-egress-cache-contract.test.ts` passed with `9 passed`, and `npx playwright test tests/e2e/course-lesson-experience.spec.ts tests/e2e/course-pass-criteria-visibility.spec.ts --project=desktop-chromium` passed with `4 passed`.

## Completion Record

- `completed`: `2026-06-16`
- `merged_pr`: `#1140`
- `squash_commit`: `e2700977`
- `result`: Closed Browser Tab Identity Metadata Sweep. The course route now has stable overview metadata, lesson query state updates browser title/canonical tags from canonical course data, legacy IDs canonicalize, unknown lesson values fall back safely, and app manifest icon coverage remains tested.
- `validation`: `npm run verify:pre-pr` passed on `3e6f4ff4`; PR CI passed including `size-check`, `verify`, `e2e-smoke`, `site-lock-smoke`, CodeQL, deploy preview, and Vercel; `npm run verify:pre-merge` passed before merge.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                  | Gaps / Notes                                                              |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | Course overview metadata, lesson browser metadata e2e, PR #1140 CI.                                       | None.                                                                     |
| Visual design quality                         | `5/5`          | Screenshot handoff in `output/course-lesson-learning-cards-10-10-2026-06-16-143216`; no visual caveat.    | None.                                                                     |
| Business logic correctness and data integrity | `5/5`          | `tests/unit/course-page-metadata.test.ts` covers canonical, legacy, unknown, preview, and manifest cases. | None.                                                                     |
| Performance (CWV + payloads)                  | `5/5`          | No dependency added; perf budgets passed with `/course` in local full gate.                               | Budget tightening held for separate owner-approved slice.                 |
| Data placement and sync boundaries            | `5/5`          | Metadata derives from checked-in course data only; no user state or server write added.                   | None.                                                                     |
| Caching and invalidation strategy             | `5/5`          | Course overview metadata is static layout metadata; client sync uses local query state only.              | None.                                                                     |
| Reliability and failure handling              | `5/5`          | Unknown lesson fallback and preview robots behavior covered by unit/e2e tests.                            | None.                                                                     |
| Privacy and compliance                        | `5/5`          | Public course titles/goals only; no private/admin/user data in metadata.                                  | None.                                                                     |
| Content governance                            | `5/5`          | Metadata copy composes from canonical course data and helper boundary.                                    | None.                                                                     |
| SEO and crawlability                          | `5/5`          | Server overview metadata plus hydrated lesson canonical/title e2e coverage.                               | Query-based lesson SEO remains intentionally tied to current route model. |
| AI discoverability                            | `5/5`          | Public overview metadata and lesson identity helper describe public lesson entities only.                 | None.                                                                     |
| i18n operational readiness                    | `5/5`          | One helper boundary keeps future locale mapping explicit.                                                 | Future locales require mapping.                                           |
| Stack-fit and dependency discipline           | `5/5`          | App Router layout metadata, existing client page, no new dependency, no route model change.               | None.                                                                     |
| Testing and QA automation                     | `5/5`          | Targeted unit/e2e, full `verify:pre-pr`, PR CI, and `verify:pre-merge` passed.                            | None.                                                                     |
| Scalability and cost efficiency               | `5/5`          | O(local course list), no external fetch or paid service.                                                  | None.                                                                     |
| DevOps and rollback readiness                 | `5/5`          | Code-only rollback; PR size check fixed; CI and pre-merge gates passed.                                   | None.                                                                     |
