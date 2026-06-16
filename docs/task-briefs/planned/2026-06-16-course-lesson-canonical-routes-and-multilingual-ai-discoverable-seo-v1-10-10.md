# Task Brief: Course Lesson Canonical Routes And Multilingual AI-Discoverable SEO V1 (10/10)

## Metadata

- `id`: `2026-06-16-course-lesson-canonical-routes-and-multilingual-ai-discoverable-seo-v1-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-16`
- `updated`: `2026-06-16`
- `parent_brief`: [SEO And AI Discoverability 10/10 Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-16-seo-ai-discoverability-10-10-parent.md)
- `course_parent_reference`: [Course Lesson Experience 10/10 Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-13-course-lesson-experience-10-10-parent.md)
- `execution_mode`: `planned implementation child; no runtime implementation until owner explicitly says execute/build/implement this child`

## Brief Audit Record

- `last_audited`: `2026-06-16`
- `base`: clean synced `main@45aaecad` with unrelated untracked local `Ja.docx` intentionally left untouched; planning branch `docs/seo-ai-discoverability-parent-2026-06-16`.
- `audit_status`: `ready`
- `decision`: Use this as the first bounded implementation child under the SEO/AI parent after owner scope approval.
- `reason`: Course lessons are the most important public learning surface and recent work stabilized lesson content, metadata, learning cards, admin parity, progress, and legacy field normalization. The remaining 10/10 discoverability gap is a canonical, multilingual-ready route contract with sitemap/robots/schema/AI crawler evidence.
- `must_refresh_before_execution_if`: Refresh if `app/course`, course route metadata helpers, runtime identity aliases, `app/sitemap`, `app/robots`, site-lock/private-mode logic, supported locale decisions, Next.js i18n/metadata docs, Google SEO docs, OpenAI crawler docs, schema.org guidance, scorecard categories, or verification lanes change.

## Goal

Make each crawl-ready course lesson have one stable, multilingual-ready, AI-discoverable canonical URL with aligned metadata, sitemap, structured data, private-mode protection, and legacy route compatibility.

## Pre-Implementation Owner Explanation

Denne childen skal gjoere kursleksjonene lette aa finne, dele og sitere i Google, Bing og AI-soek. Det betyr at hver leksjon faar en tydelig canonical URL, metadata, sitemap-plass, strukturert data og trygg overgang fra dagens `/course?lesson=...`-lenker. Utenfor scope er full norsk oversettelse, admin SEO-kontroller, backlinks, betalt SEO, PRO, checkout, Habits og nytt kursinnhold.

Forward-compatibility-intent: nye leksjoner skal automatisk faa canonical URL, metadata, sitemap og structured-data defaults fra stabil course data. Nye spraak, nye route-familier, nye schema-typer eller nye crawler-policyvalg krever eksplisitt mapping, tester og brief-oppdatering.

## Recommended Product Decision

Use locale-ready canonical paths for course lessons:

- `/{locale}/course` for the course overview.
- `/{locale}/course/<module-slug>/<lesson-slug>` for lesson pages.

Initial implementation should make the route model `en`-ready and `nb`-ready without publishing incomplete Norwegian lesson pages. If the first runtime slice keeps visible English-only content, `nb` should remain planned and absent from the indexable sitemap until real Norwegian main content exists.

Legacy/current URLs remain supported:

- `/course`
- `/course?lesson=<canonical-or-legacy-runtime-id>`

The implementation should choose the least risky compatibility behavior after code audit:

- preferred for SEO: permanent redirect from known legacy/query lesson URLs to the canonical path when this does not break app-state flows,
- acceptable transition: render route with `rel=canonical` to the path route and keep canonical internal links/sitemap on the path route,
- never acceptable: allow query URLs and path URLs to become competing indexable canonicals for the same lesson.

## Scope

- Course overview and lesson canonical route model.
- Locale-ready route helpers for `en` and planned `nb`.
- Stable ID to localized slug mapping.
- Legacy query/runtime alias compatibility.
- Server-rendered metadata for course overview and lessons.
- `rel=canonical` and alternate/hreflang metadata where active locales exist.
- Sitemap and robots behavior for public/private modes.
- JSON-LD for course/lesson/breadcrumb/organization or equivalent schema that matches visible content.
- Internal course navigation/share/QR defaults where practical to avoid linking to duplicate URLs.
- Tests and evidence for canonical, legacy, unknown, private-mode, sitemap, robots, metadata, structured data, and future-locale readiness.

## Out Of Scope

- Full Norwegian translation or publishing indexable `nb` lesson pages without real Norwegian main content.
- Admin SEO field CRUD, redirect editor, SEO preview UI, or Help/Guide admin workflow changes.
- Backlink outreach, paid SEO, PR, YouTube, email capture, or broad distribution funnel.
- PRO, checkout, pricing, entitlement, Stripe, finance, Habits, My Swim Sessions, workout-builder, or analytics vendor changes.
- New media assets, OG image generation, or social image design unless a broken existing reference is discovered and explicitly approved.
- Database migrations, Supabase RLS/generated types, or live data rewrites.

## Codex Skill + Stack Readiness Radar

Capability audit:

| Capability            | Evidence                                                        | Current Status         | Recommended Trigger                                                   | Boundary                               |
| --------------------- | --------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------- | -------------------------------------- |
| `playwright`          | `/Users/stianvikra/.codex/skills/playwright/SKILL.md`           | `installed`            | metadata/head, route redirect, private-mode, and rendered page checks | does not replace local verify gates    |
| `openai-docs`         | session skill metadata                                          | `available`            | OpenAI crawler policy or ChatGPT Search doc refresh                   | official OpenAI sources only           |
| Next.js official docs | checked `2026-06-16`                                            | `available`            | route/metadata/i18n App Router behavior                               | use primary docs before implementation |
| Google/Search docs    | checked `2026-06-16`                                            | `available`            | canonical, sitemap, robots, hreflang, structured data, AI features    | use primary docs before implementation |
| External SEO tools    | Search Console, Rich Results, PageSpeed, Screaming Frog, Ahrefs | `available externally` | post-implementation crawl/index/schema evidence                       | owner credentials may be needed        |

Systemic findings:

| Surface                | Finding                                                                                                                                           | Severity | Recommended Type               | Owner Decision Needed                                  | Follow-Up Brief Path                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------ | ------------------------------------------------------ | ------------------------------------------ |
| Course lesson routes   | Current query-param route is functional but not the best long-term canonical for lesson SEO, sharing, sitemap, locale alternates, or AI citation. | `high`   | `bounded implementation child` | `no`, this child owns it after execution approval      | this brief                                 |
| Multilingual readiness | Locale routing and missing-translation policy must be set before canonical route implementation to avoid later URL migration.                     | `high`   | `bounded implementation child` | `yes`, confirm first active locales and publish timing | this brief                                 |
| Broader SEO tooling    | Search Console/Bing/Screaming Frog/Ahrefs evidence is valuable but should not block route implementation when credentials are missing.            | `medium` | `safe process/docs update`     | `yes` only for external account access                 | `Public SEO Crawl Evidence And Tooling V1` |

Return path:

- Parent: [SEO And AI Discoverability 10/10 Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-16-seo-ai-discoverability-10-10-parent.md).
- Related course parent: [Course Lesson Experience 10/10 Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-13-course-lesson-experience-10-10-parent.md).
- Current child status: planned only.
- Exact next step after planning PR: wait for owner to approve scope and explicitly request execution before branch implementation starts.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- Product goals and IA
- Business logic correctness and data integrity
- SEO and crawlability
- AI discoverability
- i18n operational readiness
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                     | Evidence                                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/course` overview and lesson canonical routes have clear public-learning purpose, hierarchy, and internal navigation role.                                            | route tests + screenshot/crawl review if UI changes | `5/5`                   |
| UX flow clarity                               | `target`     | Users can share/open/continue lessons without duplicate route confusion; legacy links land on the correct lesson.                                                      | e2e route and share-link tests                      | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only unless route changes visible navigation/language UI; any visible UI change requires screenshot handoff.                                                | screenshot handoff or no-UI-change rationale        | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Stable runtime IDs, localized slugs, aliases, redirects/canonicals, and unknown IDs resolve deterministically without duplicate indexable lessons.                     | unit + route tests                                  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because admin editor routes, fields, CRUD, workflow labels, and recovery behavior are not changed in this child.                                                   | explicit admin scope rationale                      | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only unless visible route UI changes; public content remains semantic and keyboard-safe.                                                                    | e2e/screenshot if UI changes                        | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | Route/metadata/schema work adds no new dependency, no request-time external fetch, and no meaningful client JS bloat.                                                  | build/perf budgets + dependency diff                | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Canonical URLs and metadata derive from course data/typed helpers, not browser state or private/admin data.                                                            | code review + tests                                 | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Metadata, sitemap, robots, and schema cache/static behavior is explicit and preserves private/public mode expectations.                                                | route tests + build review                          | `5/5`                   |
| Reliability and failure handling              | `target`     | Unknown slugs, invalid locales, legacy aliases, missing translations, and private mode fail safely without indexable duplicates.                                       | negative-path tests                                 | `5/5`                   |
| Security and authz                            | `target`     | No private/admin/member URLs leak into sitemap/schema/metadata; private-mode indexing remains fail-closed.                                                             | private-mode tests + route review                   | `5/5`                   |
| Privacy and compliance                        | `target`     | Metadata/schema/crawler surfaces contain public lesson copy only and no user/admin/private note data.                                                                  | metadata/schema tests + diff review                 | `5/5`                   |
| Content governance                            | `target`     | Slugs, metadata fields, schema fields, locale readiness, and crawler policy have clear source-of-truth and update rules.                                               | brief + helper contracts                            | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow or editability behavior changes; admin SEO controls are deferred to a separate child.                                                    | explicit admin workflow scope rationale             | `N/A`                   |
| SEO and crawlability                          | `target`     | Canonicals, redirects or canonical mappings, sitemap, robots, metadata, internal links, and indexability are aligned for course lessons.                               | unit/route/e2e/schema/crawl evidence                | `5/5`                   |
| AI discoverability                            | `target`     | Lesson pages expose visible text, stable entities, JSON-LD that matches content, and deliberate `OAI-SearchBot` policy.                                                | schema tests + crawler policy review                | `5/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no new analytics events are required, but canonical route changes must not break existing course analytics IDs.                                       | analytics no-change or regression tests             | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, subscriptions, refunds, invoices, payouts, entitlements, revenue reporting, or finance paths change.                                 | explicit commerce scope rationale                   | `N/A`                   |
| Incident response and support operations      | `target`     | Route/canonical/private-mode SEO issues have support-safe diagnosis and rollback notes in PR/brief.                                                                    | rollback/support notes                              | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child changes no payments, finance reports, refunds, invoices, payouts, tax, entitlement reconciliation, or revenue truth.                            | explicit finance scope rationale                    | `N/A`                   |
| i18n operational readiness                    | `target`     | Locale route policy, `hreflang`, self-canonical per language, missing-translation behavior, localized slug aliases, and future `nb` readiness are explicit and tested. | i18n route/metadata tests                           | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use Next.js App Router metadata/i18n patterns, TypeScript route helpers, existing course runtime identity, and no new dependency by default.                           | code review + dependency diff                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Coverage includes canonical, legacy, unknown, locale, private-mode, sitemap, robots, structured data, metadata, and existing course route smoke.                       | targeted tests + `verify:pre-pr` + CI               | `5/5`                   |
| Scalability and cost efficiency               | `target`     | New lessons/locales derive SEO artifacts automatically without one-off route files or paid/external runtime services.                                                  | future-value fixtures                               | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback path, redirect/alias risk, Search Console/Bing resubmission notes, and pre-pr/pre-merge gates are documented.                                                 | PR notes + gates                                    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Use App Router server routes/layout metadata for indexable lesson pages.
  - Keep the existing course experience as the mature reference surface.
  - Avoid a high-risk course client file move unless a code audit proves it is necessary.
  - Use canonical path routes for SEO while preserving current app-state query compatibility.
- TypeScript/domain:
  - Add typed helpers for stable ID -> localized slug -> canonical URL -> metadata/schema.
  - Preserve `resolveCanonicalCourseLessonRuntimeId` or equivalent runtime identity behavior.
  - Unknown locale/slug/ID behavior must be deterministic.
- Supabase/data:
  - No DB migration/RLS/generated type change in this child.
  - If live admin-managed slugs are discovered as required, pause and refresh scope.
- External services/tools:
  - Use official Google/OpenAI/Next.js/schema.org docs as source baseline.
  - External crawl dashboards may be evidence but should not require committing credentials.
- UI system:
  - No UI redesign intended.
  - If adding a visible language switcher or route UI, use existing course/navigation primitives and screenshot handoff.
- Testing:
  - Unit tests for route helpers and metadata/schema output.
  - Route/e2e tests for canonical path, legacy query, unknown route, sitemap, robots, private mode, and active locale behavior.
  - Schema validation through deterministic local assertions; external Rich Results evidence if credentials/network allow.

## Data Placement And Sync Contract

- Server-canonical:
  - Course modules/lessons/runtime IDs from existing course data and published admin course content read path.
  - SEO route helpers and metadata derived from canonical course data.
- Local-only:
  - Existing local course progress and UI state remain local/synced as before.
  - No local-only SEO truth.
- Sync policy:
  - No new write or sync behavior.
  - Existing course progress sync must keep stable runtime IDs and not depend on slugs.
- Retention and sensitivity:
  - SEO surfaces include public lesson data only.
  - No personal progress, admin note, auth, or analytics payload data in metadata/schema/sitemap.
- Cache/invalidation:
  - Document whether metadata and sitemap are static or revalidated.
  - Preserve site-lock/private-mode sitemap/robots behavior.

## Identity And Rename Contract

- Canonical stable ID:
  - Course lesson runtime ID is immutable source-of-truth for progress, analytics, notes, QR, admin preview, route aliasing, and canonical URL lookup.
- Human-readable identifiers:
  - Module and lesson slugs are SEO/display values and may be localized.
  - Titles/descriptions are content values and may change for the same learning object.
- Mutability rules:
  - Runtime IDs are immutable.
  - Slugs are renameable only with redirect/alias support.
  - Locale slugs can differ by language.
- Rename vs repurpose:
  - Rename: same runtime ID, old slug redirects/aliases to new canonical.
  - Repurpose: materially different lesson requires a new runtime ID and new route.
- Compatibility:
  - Known legacy IDs and `/course?lesson=<id>` links resolve to the canonical lesson.
  - Unknown IDs do not create new indexable pages.
- Observability and repair:
  - Add tests for unresolved aliases and invalid slugs.
  - PR notes should explain how to diagnose a bad canonical or missing redirect.

## Forward Compatibility Contract

- Extensibility surfaces:
  - course modules, lessons, locale codes, localized slugs, route params, metadata, sitemap entries, robots rules, structured data, internal links, QR/share defaults, analytics route templates, and future AI crawler policies.
- Source of truth:
  - Stable course data/runtime identity helpers are the source for lesson identity.
  - Locale publish readiness is explicit config or typed mapping, not inferred from browser language.
- Additive behavior:
  - New English lessons with stable IDs and slugs should automatically receive canonical URLs, metadata defaults, sitemap entries, and schema base fields.
  - Future `nb` lessons should become indexable only when Norwegian main content and metadata are present.
- Explicit mapping requirements:
  - New locale, route family, schema type, crawler user agent policy, slug rename, or support/QR destination requires code/test/doc updates.
- Unknown or deprecated values:
  - Unknown locale returns not found or safe fallback without indexable duplicate.
  - Unknown lesson slug/ID does not index.
  - Deprecated slugs redirect or canonicalize to the active slug when mapped.
- Test/evidence:
  - Future-like lesson fixture.
  - Unknown route/locale negative paths.
  - Legacy query alias test.
  - Sitemap/private-mode tests.
  - Schema/metadata assertions.

## Help / Guide Impact

- Public Help/Guide update: not required unless visible route labels, learner navigation, language switching, or share/recovery behavior changes.
- Admin Help/Guide update: `N/A` because admin SEO controls and workflows are out of scope.
- Runbook/PR notes: required if redirects, private-mode diagnostics, crawler policy, Search Console/Bing resubmission, or support recovery behavior change.

## Route / Label / Support-Surface Impact Sweep

Required before the first broad gate because this child changes public routes/canonical behavior.

Minimum surfaces:

- `app/`
- `components/`
- `lib/`
- `tests/`
- `docs/`
- `docs/runbooks/`
- `docs/task-briefs/planned`
- `docs/task-briefs/in-progress`
- `docs/task-briefs/done`

Minimum identifiers:

- `/course`
- `lesson=`
- `canonical`
- `sitemap`
- `robots`
- `hreflang`
- `OAI-SearchBot`
- `GPTBot`
- `Course outline`
- `Open course`
- `Share`
- `QR`
- `resolveCanonicalCourseLessonRuntimeId`

## Visual Artifact Rule

- No screenshot handoff is required if implementation changes only metadata, sitemap, robots, redirects, and tests.
- Screenshot handoff is required if public route UI, navigation labels, language switching, social preview UI, or visible course/share components change.
- If required, artifact folder pattern:
  - `output/course-lesson-canonical-routes-seo-YYYY-MM-DD-HHMMSS`

## Acceptance Criteria

1. Course overview has one canonical localized URL policy.
2. Each crawl-ready course lesson has one canonical path URL per active locale.
3. Current `/course?lesson=<id>` and known legacy IDs remain compatible without creating duplicate indexable pages.
4. Internal links, share links, QR defaults where practical, `rel=canonical`, and sitemap agree on canonical URLs.
5. Server-rendered metadata exists for canonical course overview and lesson pages.
6. JSON-LD matches visible lesson content and includes language information where relevant.
7. Sitemap includes only active/indexable public lesson URLs; private/site-lock mode remains locked.
8. Robots policy allows intended search/AI search crawlers for public content and preserves protected-route boundaries.
9. `nb`/future-language readiness is explicit without publishing untranslated Norwegian lesson pages.
10. Unknown locale/slug/lesson values fail safely and are tested.
11. Route/label/support sweep is completed before broad gates.
12. `npm run verify:pre-pr`, PR CI, and `npm run verify:pre-merge` pass before merge readiness.

## Validation

Planning validation:

- `npm run lint:briefs`

Implementation validation after owner execution approval:

- Official-doc freshness check for Google canonical/hreflang/sitemap/robots/AI features, OpenAI crawler docs, Next.js i18n/metadata, and schema.org.
- Targeted unit tests for route helpers, locale mapping, metadata, JSON-LD, sitemap, robots, aliases, and unknown values.
- Targeted Playwright/e2e for canonical route, legacy query compatibility, private-mode indexing, and visible route behavior if changed.
- `git diff --check`
- `npm run lint:briefs`
- `npm run verify:pre-pr`
- PR CI required checks.
- `npm run verify:pre-merge`
- Optional external evidence after deploy/preview when credentials allow:
  - Google Rich Results Test,
  - Schema.org validator,
  - PageSpeed,
  - Search Console URL Inspection/Sitemap,
  - Bing Webmaster Tools,
  - Screaming Frog or Ahrefs crawl.

## Checkpoint Log

- `2026-06-16 | planned | created as first child under the refreshed SEO/AI discoverability parent after owner agreed to the recommended docs-only planning package; implementation is not approved until owner explicitly says execute/build/implement this child | next: validate docs-only planning PR and wait for owner scope approval`
