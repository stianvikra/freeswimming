# Task Brief: Public SEO Crawl Evidence And Tooling V1 (10/10)

## Metadata

- `id`: `2026-06-17-public-seo-crawl-evidence-and-tooling-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-17`
- `updated`: `2026-06-17`
- `parent_brief`: [SEO And AI Discoverability 10/10 Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-16-seo-ai-discoverability-10-10-parent.md)
- `completed_route_child`: [Course Lesson Canonical Routes And Multilingual AI-Discoverable SEO V1](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-06-16-course-lesson-canonical-routes-and-multilingual-ai-discoverable-seo-v1-10-10.md)
- `execution_mode`: `automation-first implementation child`

## Brief Audit Record

- `last_audited`: `2026-06-17`
- `base`: clean synced `main@92174a63` with unrelated untracked local `Ja.docx` intentionally left untouched; implementation branch `feat/public-seo-crawl-evidence-2026-06-17`.
- `audit_status`: `in-progress`
- `decision`: Execute this as the next bounded child under the SEO/AI parent after canonical course lesson routes shipped.
- `reason`: Canonical course lesson routes, metadata, sitemap, robots, structured data, and legacy compatibility are now merged through PR `#1145/#1146`; the remaining 10/10 gap is repeatable evidence that public search/AI systems can crawl, understand, and diagnose those routes without leaking private surfaces.
- `must_refresh_before_execution_if`: Refresh if Google Search Central AI/canonical/sitemap/robots/structured-data/Search Console guidance, OpenAI crawler docs, Next.js metadata/sitemap/robots behavior, IndexNow guidance, site-lock/private-mode behavior, route patterns, course runtime identity, scorecard categories, or verification lanes change before implementation.

## Goal

Create repeatable local and external evidence that Freeswimming public learning pages are crawlable, indexable, canonical-consistent, AI-discoverable, private-mode-safe, and operable over time.

## Pre-Implementation Owner Explanation

Vi lager en kontrollpakke for SEO og AI-soek, ikke nye kurs eller redesign. Den skal bevise at offentlige kursleksjoner kan finnes, forstaas og feilsokes av Google, Bing-lignende crawlers og ChatGPT Search, samtidig som private/admin/member-flater holdes ute. Utenfor scope er nytt innhold, full oversettelse, admin SEO-editor, checkout/PRO, backlinks, betalt distribusjon og visuell redesign.

Forward-compatibility-intent: nye offentlige leksjoner skal automatisk komme med i crawl-evidens fra kanonisk kursdata. Nye route-familier, locale-koder, schema-typer, crawler-policyvalg eller eksterne SEO-verktøy krever eksplisitt mapping, fallback, tester og brief-oppdatering.

## Source Baseline Checked On 2026-06-17

- Google AI features: https://developers.google.com/search/docs/appearance/ai-features
- Google canonicalization: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Google structured data: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Google localized versions and `hreflang`: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google robots.txt limitations: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Google URL Inspection: https://support.google.com/webmasters/answer/9012289
- Google Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- OpenAI crawlers: https://platform.openai.com/docs/bots
- Next.js sitemap metadata file convention: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- IndexNow documentation: https://www.indexnow.org/documentation
- Schema.org `LearningResource`: https://schema.org/LearningResource
- Schema.org `Course`: https://schema.org/Course

## Product Principle

- Public learning pages should be discoverable because they are useful, text-visible, canonical, and technically clean.
- AI discoverability is evidence-driven normal SEO: visible text, stable entities, crawlable URLs, matching structured data, and deliberate crawler policy.
- External dashboards are evidence, not source-of-truth for route behavior.
- Private-mode/site-lock behavior remains fail-closed: protected URLs never appear in sitemap, schema, public metadata, or AI/search discovery assets.

## Scope

- Add or refresh local crawl evidence tooling for public SEO surfaces.
- Produce a repeatable crawl evidence report covering representative course overview and course lesson URLs.
- Check rendered HTML/head output for title, description, canonical, robots meta, Open Graph/Twitter metadata, structured data, visible text, and internal canonical links.
- Check `robots.txt` and `sitemap.xml` in public and private/site-lock modes.
- Validate canonical route, legacy/query route, unknown route, and planned-locale behavior against the shipped route contract.
- Fix the owner-surfaced deprecated public course URL family `breathing-and-floating/floating-back` as a bounded canonical redirect alias when the crawl audit proves it is a renamed lesson, not an unknown fake lesson.
- Validate JSON-LD/schema objects are parseable and match visible public content.
- Record external evidence steps for Google Search Console URL Inspection, Rich Results Test, PageSpeed Insights, and Bing/IndexNow-style discovery where credentials or manual access are required.
- Create or update a support/runbook note for diagnosing crawl, canonical, schema, private-mode, and Search Console evidence issues.
- Apply bounded non-visual accessibility reliability hardening if release gates expose an existing focus-restore timing failure that blocks merge readiness.
- Preserve `Ja.docx` as unrelated local untracked owner file.

## Out Of Scope

- New public lesson content, new modules, new media, or content rewrites beyond the explicit legacy alias needed to keep the renamed `breathing-and-floating/floating-back` URL from 404ing.
- Visual redesign, route UI redesign, language switcher UI, screenshots, or brand/social image generation unless a broken existing rendered surface is discovered and owner explicitly expands scope.
- Admin SEO controls, redirect editor, SEO preview UI, or admin workflow changes.
- Full Norwegian translation or publishing incomplete localized lesson pages.
- Checkout, PRO, pricing, entitlements, Stripe, finance reporting, refunds, payouts, or subscription behavior.
- Backlink outreach, paid SEO, YouTube strategy, PR campaigns, email capture, or distribution experiments.
- New analytics vendor integration or external paid SEO service integration.
- Secrets, raw `.env` values, Search Console tokens, Bing tokens, Ahrefs/Screaming Frog credentials, or private dashboard screenshots in repo.

## Evidence Matrix

The implementation child should produce a durable table covering at least:

| Surface                             | Required Evidence                                                                            | Pass Threshold                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `/course` overview                  | status, canonical, metadata, robots, visible text, sitemap inclusion or documented rationale | no crawl/indexing blocker                          |
| Representative canonical lesson URL | status, canonical, metadata, JSON-LD, visible text, internal links, sitemap inclusion        | all signals point to canonical URL                 |
| Legacy `/course?lesson=...` URL     | redirect or self-render with canonical to path route, no duplicate canonical                 | no competing indexable duplicate                   |
| Unknown lesson/slug                 | 404/noindex/safe fallback according to current contract                                      | no indexable fake lesson                           |
| Planned locale route                | not indexable until real translated main content exists                                      | no wrong-language crawl surface                    |
| `robots.txt` public mode            | public crawl allowed where intended; sitemap declared when appropriate                       | no protected URL exposure                          |
| `sitemap.xml` public mode           | canonical crawl-ready URLs only                                                              | no private/admin/member URLs                       |
| Private/site-lock mode              | sitemap/robots/indexing behavior stays fail-closed                                           | no public crawl leakage                            |
| Structured data                     | parseable JSON-LD, matches visible content                                                   | zero schema-content mismatch                       |
| External evidence                   | Search Console/Rich Results/PageSpeed/manual dashboard steps                                 | clear owner action if credentials block automation |

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict `10/10` mode for this brief: every category mapped `target` must close at `5/5`. Critical target categories for `10/10` claim are all categories mapped `target` below.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                            | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Evidence map clearly separates course overview, canonical lessons, legacy URLs, planned locales, private surfaces, and external dashboards.                                                   | crawl evidence report + parent/child linkage                       | `5/5`                   |
| UX flow clarity                               | `target`     | User-facing share/open routes remain understandable: canonical links are primary, legacy links resolve safely, and no dead-end route is introduced.                                           | route evidence + legacy/unknown URL checks                         | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only because this slice should not change visible layout; any discovered visible route defect gets screenshot handoff or a follow-up brief.                                        | no-UI-change diff review or screenshot handoff if scope changes    | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Stable lesson IDs, slugs, aliases, sitemap inclusion, private-mode switches, and unknown values resolve deterministically without duplicate indexable entities.                               | route/helper tests + crawl evidence                                | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this child changes no admin editor fields, CRUD, publish flow, status controls, or operator editing surface.                                                                      | explicit admin editor no-change review                             | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Public learning pages expose semantic headings, visible text, meaningful links, language attributes, and no SEO-only hidden content that harms assistive technology.                          | rendered HTML audit + existing a11y/e2e evidence where relevant    | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Evidence tooling verifies public route budgets or PageSpeed/CWV handoff targets: LCP <= 2.5s, INP < 200ms, CLS < 0.1 where measurable, with no new client dependency bloat.                   | perf budget output + PageSpeed/manual evidence notes               | `5/5`                   |
| Data placement and sync boundaries            | `target`     | SEO truth derives from canonical course data, route helpers, and generated metadata/sitemap output; no browser-only state or private dashboard data becomes source-of-truth.                  | code/tooling review + data boundary section                        | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Evidence records whether metadata/sitemap/robots are static, dynamic, or private-mode conditional, and how stale crawl artifacts are refreshed.                                               | route/cache review + runbook                                       | `5/5`                   |
| Reliability and failure handling              | `target`     | Tooling/report handles local server unavailable, external credential missing, private-mode blocked, malformed schema, missing sitemap entry, and unknown URL without false green results.     | negative-path tests or deterministic script failure examples       | `5/5`                   |
| Security and authz                            | `target`     | Protected/admin/member URLs are excluded from sitemap/schema/evidence artifacts; private-mode remains fail-closed; no secret-bearing URL or token is committed.                               | sitemap/robots/private-mode checks + diff review                   | `5/5`                   |
| Privacy and compliance                        | `target`     | Evidence artifacts include only public URLs/content and redacted external dashboard notes; no user progress, admin notes, raw env, tokens, or private identifiers are stored.                 | artifact review + secret/PII no-change check                       | `5/5`                   |
| Content governance                            | `target`     | Crawl report names the source-of-truth for titles/descriptions/slugs/schema and defines what owner review is needed when content changes.                                                     | runbook + evidence report                                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, Help/Guide admin action, role-gated editability, or operator mutation behavior changes in this child.                                                          | explicit admin workflow no-change rationale                        | `N/A`                   |
| SEO and crawlability                          | `target`     | Canonical, sitemap, robots, metadata, legacy URL, unknown URL, structured data, and Search Console evidence are complete for representative public routes.                                    | local crawl audit + external evidence checklist                    | `5/5`                   |
| AI discoverability                            | `target`     | Public pages expose visible text, stable learning entities, schema matching visible content, and documented `OAI-SearchBot`/`GPTBot` policy boundaries.                                       | schema/text audit + crawler policy review                          | `5/5`                   |
| Analytics and KPI observability               | `target`     | Evidence defines monthly crawl/index/AI visibility review metrics and separates Search Console/Bing/IndexNow evidence from first-party product analytics.                                     | runbook metrics table + manual dashboard checklist                 | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this child changes no pricing, catalog, checkout, entitlements, invoices, refunds, payouts, revenue attribution, or PRO conversion flow.                                          | explicit commerce no-change review                                 | `N/A`                   |
| Incident response and support operations      | `target`     | Support/runbook documents how to diagnose missing indexing, wrong canonical, sitemap omission, robots/private-mode blockage, schema mismatch, and external-dashboard credential blockers.     | runbook + failure-mode checklist                                   | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child changes no payments, finance reports, refunds, invoices, payouts, tax, entitlement reconciliation, or revenue truth.                                                   | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `target`     | Evidence proves planned locales do not publish untranslated main content, active locales have self-canonical/alternate rules, and future locale additions require explicit readiness mapping. | locale route/sitemap checks + forward compatibility evidence       | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use Next.js route/metadata outputs, TypeScript parsing, Playwright or Node standard tooling already in repo; no new dependency unless justified by measurable evidence quality.               | dependency diff + implementation review                            | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed brief passes lint; implementation adds deterministic tests/tooling for route/head/schema/sitemap/robots/private-mode evidence plus `verify:pre-pr` before PR.                         | `npm run lint:briefs`, targeted tests, `npm run verify:pre-pr`, CI | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Audit derives URLs from canonical data, supports future lessons/locales without hand-maintained duplicate URL lists, and avoids paid/external runtime dependencies.                           | future-value fixture + no-new-paid-service review                  | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | PR handoff records how to rerun evidence locally, what external checks are manual, how to interpret failures, and how to revert tooling/report changes without route behavior risk.           | validation commands + rollback/runbook notes                       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Treat App Router rendered output as the evidence target: route status, head metadata, sitemap, robots, and visible HTML.
  - Do not introduce route behavior changes unless the audit discovers a deterministic bug and the owner surfaces/approves the specific scope expansion.
- TypeScript/domain:
  - Reuse existing course route/identity helpers to enumerate representative and future-like lesson URLs.
  - Parse HTML/schema/metadata with structured parsers or DOM APIs where practical, not brittle string-only checks.
  - Model failures as explicit report rows with status `pass`, `warn`, `fail`, or `blocked-external`.
- Supabase/data:
  - No schema, migration, RLS, generated type, or live data change in this child.
  - If live admin SEO fields become necessary, stop and create/refresh a separate admin SEO controls child.
- External services/tools:
  - Use official Google, OpenAI, Next.js, Schema.org, and IndexNow docs as current baseline.
  - Search Console, Rich Results Test, PageSpeed Insights, Bing Webmaster Tools, Ahrefs, or Screaming Frog evidence may be manual/external and must not require committing credentials.
  - `OAI-SearchBot` policy is separate from `GPTBot`; do not conflate search visibility with training opt-in.
- UI system:
  - No UI change intended.
  - If release gates expose a non-visual focus/accessibility reliability failure in shared primitives, keep the fix minimal, preserve existing visual layout, and validate with targeted Playwright focus coverage.
  - Shared component/reference surface: `components/SiteChrome.tsx` is the established global shell owner for header menu trigger focus and route-change blur behavior; the bounded fix only prevents initial/remount blur from competing with drawer focus restoration and does not change markup, styling, layout, copy, routes, or visible state.
  - Screenshot approval stop: `N/A` for this bounded focus-only fix because there is no visual/rendering/layout/brand output change to review. Screenshot comparison naming: `N/A`; no `before/after` or `after/reference` screenshot artifacts are created for this non-visual accessibility timing change.
  - If a visible SEO/debug page or public route UI is added, use existing repo UI primitives and follow screenshot handoff rules.
- Testing:
  - Cover generated evidence logic with unit tests where possible.
  - Cover local rendered output with route/e2e or script-level checks.
  - Include negative paths for unknown route, private mode, malformed schema, and external credentials unavailable.

## Data Placement And Sync Contract

- Server-canonical data:
  - Course route identity, lesson/module data, metadata helpers, sitemap/robots output, and public/private mode config.
- Local data:
  - Temporary crawl artifacts may be written under `output/` or a documented generated-artifact path and should not become source-of-truth.
  - Committed evidence should be concise docs/runbook/report summaries, not raw private dashboard exports.
- Sync policy:
  - No user data sync or write behavior.
  - External dashboard evidence is manually refreshed and clearly timestamped when credentials are required.
- Retention and sensitivity:
  - Commit public URL/report summaries only.
  - Do not commit Search Console screenshots containing account identifiers, query PII, raw env values, tokens, cookies, or private URLs.
- Cache/invalidation:
  - Evidence must record whether tested pages were local dev, production preview, or production.
  - Rerun evidence after metadata, route, sitemap, robots, schema, private-mode, or lesson identity changes.

## Identity And Rename Contract

- Canonical stable ID:
  - Course lesson runtime ID remains the stable identity for route lookup, progress, analytics, QR/share compatibility, admin context, and crawl evidence.
- Human-readable identifiers:
  - Module and lesson slugs are SEO/display identifiers and may change with alias/redirect coverage.
  - Titles/descriptions are content values and can be edited without changing stable identity.
- Mutability rules:
  - Runtime IDs are immutable.
  - Slugs are renameable only when old values redirect/canonicalize safely.
  - Locale slugs require locale readiness and translated main content.
- Rename vs repurpose:
  - Rename keeps the same stable runtime ID and updates alias evidence.
  - A materially different lesson must get a new runtime ID and its own route.
- Compatibility contract:
  - Legacy/query URLs must resolve to the stable lesson or fail non-indexably.
  - Unknown/deprecated values must not generate crawlable duplicate pages.
- Observability and repair:
  - Evidence report should identify missing canonical, missing sitemap entry, unexpected private URL, unresolved alias, and schema mismatch with enough route context to repair.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Course modules, lessons, runtime IDs, module/lesson slugs, route families, locales, hreflang alternates, sitemap entries, robots rules, structured-data types, crawler user agents, external SEO tools, evidence artifact formats, and support runbook diagnostics.
- Source of truth:
  - Crawl target lists derive from canonical course route/content helpers and explicit locale readiness mapping.
  - External dashboard evidence is observational, not the source of truth for app routes.
- Additive behavior:
  - New crawl-ready English course lessons should automatically appear in local evidence checks and sitemap/canonical assertions.
  - Future active locales should enter evidence only after translated main content and metadata are marked ready.
- Explicit mapping requirements:
  - New route families, locale codes, schema types, AI crawler policies, IndexNow submission behavior, support diagnostics, or paid SEO tools require explicit code/doc/test updates.
- Unknown or deprecated values:
  - Unknown routes fail as noindex/404/safe fallback.
  - Deprecated aliases redirect or canonicalize to active routes when mapped.
  - Missing translation readiness blocks indexable localized pages.
- Test/evidence:
  - Include a future-like course lesson fixture or derived enumeration assertion.
  - Include unknown route/private-mode negative paths.
  - Include route/label/support sweep evidence if implementation changes route labels, support runbooks, or crawler policy surfaces.

## Help / Guide Impact

- User Help/Guide update: `N/A` unless public navigation, share behavior, learner-visible route labels, or recovery copy changes.
- Admin Help/Guide update: `N/A` because no admin workflow or admin SEO controls change.
- Runbook update: required, because support/ops need a durable way to diagnose crawl/index/schema/private-mode issues after this child.

## Route / Label / Support-Surface Impact Sweep

Required if implementation changes any route, route label, crawler policy, support runbook, Help/Guide assertion, or recovery instruction.

Minimum targeted sweep terms:

- `/course`
- `/en/course`
- `sitemap`
- `robots`
- `canonical`
- `hreflang`
- `OAI-SearchBot`
- `GPTBot`
- `noindex`
- `LearningResource`
- `Search Console`
- `Rich Results`
- `IndexNow`

Minimum directories:

- `app/`
- `components/`
- `lib/`
- `tests/`
- `docs/`
- `docs/runbooks/`
- `docs/task-briefs/planned/`
- `docs/task-briefs/done/`

## Acceptance Criteria

1. Planned child remains scoped to crawl evidence/tooling/runbook plus the owner-surfaced deprecated course URL alias; any further runtime route behavior requires explicit scope expansion.
2. Local evidence covers course overview, representative canonical lesson, legacy/query lesson, deprecated renamed lesson alias, unknown lesson/slug, planned locale route, public sitemap, public robots, and private/site-lock mode.
3. JSON-LD/schema checks prove parseability and visible-content alignment for representative public learning pages.
4. `OAI-SearchBot`, `GPTBot`, Googlebot, robots, noindex, and private-mode policy are recorded without conflating search inclusion and model training.
5. External evidence handoff lists Search Console URL Inspection, Rich Results Test, PageSpeed Insights, Bing/IndexNow-style checks, required credentials, expected result, and exact owner step if automation cannot access them.
6. Runbook/support notes explain how to diagnose missing indexing, unexpected canonical, sitemap omission, schema mismatch, private-mode leak, and external credential blocker.
7. Forward compatibility is proven by derived route enumeration or future-value fixture, not today's hardcoded lesson list only.
8. Changed brief passes `npm run lint:briefs`; implementation child later runs targeted checks plus `npm run verify:pre-pr` before PR.

## Validation

Planning-only validation for creating this brief:

- `npm run lint:briefs`
- `git diff --check`

Implementation validation when this child is executed:

- `npm run lint:briefs`
- targeted unit/script tests for crawl evidence tooling
- targeted route/head/schema/sitemap/robots/private-mode checks
- route/label/support sweep when triggered
- `git diff --check`
- `npm run verify:pre-pr`
- PR CI required checks
- `npm run verify:pre-merge` before merge readiness

Executed implementation validation on `2026-06-17`:

- `./node_modules/.bin/vitest run tests/unit/public-seo-crawl-evidence.test.ts tests/unit/course-canonical-routes.test.ts tests/unit/course-page-metadata.test.ts tests/unit/site-lock-metadata-routes.test.ts` passed: 4 files, 16 tests.
- `node --check scripts/public-seo-crawl-evidence.mjs` passed.
- `npm run typecheck` passed.
- `npm run seo:crawl-evidence -- --help` passed.
- `npm run seo:crawl-evidence -- --base-url http://127.0.0.1:3000` passed with 9 pass / 0 fail against local dev server; generated local ignored artifact `output/public-seo-crawl-evidence-20260617T124400Z`.
- Route/label/support sweep completed for `/course`, `/en/course`, `sitemap`, `robots`, `canonical`, `hreflang`, `OAI-SearchBot`, `GPTBot`, `noindex`, `LearningResource`, `Search Console`, `Rich Results`, and `IndexNow` across `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/task-briefs/planned/`, `docs/task-briefs/done/`, and `docs/task-briefs/in-progress/`; no unexpected fallout found.
- `npm run lint:quality-gates` passed after recording explicit route/label/support sweep surfaces.
- `npm run lint:briefs:all` passed for all 511 briefs.
- `git diff --check --cached` passed.
- `npm run lint` passed with existing warnings only in ignored/generated `output/` files.
- `npm run verify:pre-pr` first full run hit one Playwright focus-restoration flake in `tests/e2e/core-flow-a11y-audit.spec.ts`; targeted rerun passed: `env SITE_LOCK_ENABLED=0 PW_PORT=3100 NEXT_DIST_DIR=.next-playwright npx playwright test tests/e2e/core-flow-a11y-audit.spec.ts --project=desktop-chromium --grep "header navigation menu is keyboard operable"`.
- `npm run verify:pre-pr` rerun passed: 110 passed, 568 skipped. Gate selected full lane because unrelated local untracked `Ja.docx` exists; it remains untouched and is not staged.
- Performance budget gate passed with route metrics under targets. Trend recommendation was `tighten` after 10 consecutive weekly green runs; decision for this non-performance SEO/tooling child is `hold` and defer target tightening to a dedicated performance budget follow-up.
- PR `#1149` initial CodeQL check reported three high alerts in `scripts/public-seo-crawl-evidence.mjs`: HTML script-end filtering and Markdown table escaping. Patch tightened closing-tag matching and added `markdownTableCell()` to escape backslash, pipe, and newlines.
- Post-CodeQL-fix targeted validation passed: `node --check scripts/public-seo-crawl-evidence.mjs`, `./node_modules/.bin/vitest run tests/unit/public-seo-crawl-evidence.test.ts`, and `npm run seo:crawl-evidence -- --help`.
- Post-CodeQL-fix `npm run verify:pre-pr` passed: 110 passed, 568 skipped. Unrelated local untracked `Ja.docx` remained untouched and unstaged.
- Second CodeQL rerun still flagged script end-tag matching. Patch replaced the script/style closing-tag regex with bounded tag scanning for raw text blocks, then `node --check scripts/public-seo-crawl-evidence.mjs`, `./node_modules/.bin/vitest run tests/unit/public-seo-crawl-evidence.test.ts`, `npm run seo:crawl-evidence -- --help`, and `npm run seo:crawl-evidence -- --base-url http://127.0.0.1:3000 --no-write` passed; the live local crawl reported 9 pass / 0 fail.
- Post-scanner-fix `npm run verify:pre-pr` passed: 110 passed, 568 skipped. Performance trend again recommended `tighten`; decision remains `hold/defer` for this non-performance child.
- PR CI after scanner fix passed all required checks, including CodeQL, verify, e2e-smoke, site-lock-smoke, size-check, and Vercel preview checks.
- `npm run verify:pre-merge` exposed a repeatable desktop-chromium focus-restore timing failure in `tests/e2e/core-flow-a11y-audit.spec.ts` under the full E2E suite. Root cause was a competing initial/remount route-change blur in `components/SiteChrome.tsx`, so the fix was kept to bounded non-visual blur timing hardening.
- Owner surfaced a live 404 for an old `breathing-and-floating/floating-back` public course URL. The renamed lesson is now mapped as a legacy ID/slug alias to the current `body-position--body-position-back` canonical route, with explicit route and crawl evidence.
- Post-alias/focus targeted validation passed: `./node_modules/.bin/vitest run tests/unit/course-canonical-routes.test.ts tests/unit/public-seo-crawl-evidence.test.ts` with 2 files / 8 tests; `node --check scripts/public-seo-crawl-evidence.mjs`; local `curl -I` confirmed the deprecated URL returns `308` to `/en/course/course-module-body-position-drills/course-lesson-body-position-drills-body-position-back`; `npm run seo:crawl-evidence -- --base-url http://127.0.0.1:3000 --no-write` reported 10 pass / 0 fail; `npx playwright test tests/e2e/core-flow-a11y-audit.spec.ts tests/e2e/drawer-focus-trap.spec.ts --project=desktop-chromium` passed with 3 passed and 1 skipped.
- Post-alias/focus `npm run verify:pre-pr` passed full lane: branch current with `origin/main`, lint/quality/typecheck/unit/build/performance/E2E gates passed, Playwright reported 110 passed and 568 skipped, and `verify-open` passed. Unrelated local untracked `Ja.docx` remained untouched and unstaged.
- UI quality-gate evidence for the bounded `SiteChrome` change: reference surface/shared component is the existing global shell/menu focus contract; owner screenshot approval stop is `N/A` because no visual output changed; screenshot comparison naming is `N/A` because no `before/after` or `after/reference` screenshot artifacts apply to non-visual focus timing.

## Manual External Evidence Contract

If credentials or web dashboards are required, give the owner exactly one actionable manual step at a time.

Minimum external checks:

- Google Search Console URL Inspection for one canonical lesson URL.
- Google Search Console URL Inspection for one legacy/query lesson URL when available.
- Google Rich Results Test for one canonical lesson URL or rendered HTML.
- PageSpeed Insights or equivalent Lighthouse evidence for `/course` and one canonical lesson URL.
- Bing Webmaster Tools or IndexNow-style evidence when account access exists; otherwise record as `blocked-external` with exact missing credential/account step.

Do not commit raw dashboard screenshots unless they are redacted and contain no account/private query data.

## Session Continuity And Recovery

- Canonical source of truth: this brief path plus implementation branch
  `feat/public-seo-crawl-evidence-2026-06-17`.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.
- When implementation starts, move this file to `docs/task-briefs/in-progress/` and append checkpoint log entries at each meaningful milestone.

## Checkpoint Log

- `2026-06-17 | main@92174a63 | created planned Public SEO Crawl Evidence And Tooling V1 child under the SEO/AI parent; no implementation branch or runtime code started | next: owner confirms execute/build/implement before moving brief to in-progress and starting implementation`
- `2026-06-17 | working tree | owner explicitly said execute; created branch feat/public-seo-crawl-evidence-2026-06-17, moved brief to in-progress, and started implementation | next: audit existing SEO routes/tooling before patching`
- `2026-06-17 | working tree | added public SEO crawl evidence module, CLI script, runbook, npm command, and unit coverage; targeted Vitest passed 4 files / 16 tests, typecheck passed, CLI help passed, and local dev crawl audit passed 9/9 rows against http://127.0.0.1:3000 with artifact output/public-seo-crawl-evidence-20260617T124400Z | next: run lint/quality gates, full pre-pr gate, then commit/push/open PR if green`
- `2026-06-17 | working tree | completed route/label/support sweep; identifiers searched: /course, /en/course, sitemap, robots, canonical, hreflang, OAI-SearchBot, GPTBot, noindex, LearningResource, Search Console, Rich Results, and IndexNow; directories/surfaces checked: app, components, lib, tests, docs, docs/runbooks, docs/task-briefs/planned, docs/task-briefs/done, and docs/task-briefs/in-progress; fallout handled: no unexpected route rename, Help/Guide, admin workflow, private-route leak, or crawler-policy fallout found beyond the new runbook/tool/test/brief surfaces | next: run lint/quality gates and pre-pr gate`
- `2026-06-17 | working tree | completed pre-PR validation: lint/quality gates, typecheck, targeted tests, local crawl evidence, lint:briefs:all, diff check, and npm run verify:pre-pr passed after one isolated Playwright focus flake passed targeted rerun; performance budget trend recommended tighten but this child records hold/defer because no performance-budget scope is included | next: commit, push, open PR, monitor CI, then run verify:pre-merge before merge readiness`
- `2026-06-17 | PR #1149 | CodeQL reported three high alerts in the new SEO evidence script; fixed bad HTML filtering regexp and Markdown escaping, then reran node check, targeted Vitest, and CLI help successfully | next: amend/push commit, monitor CI again, rerun verify:pre-pr if commit changes require full local gate, then run verify:pre-merge before merge readiness`
- `2026-06-17 | PR #1149 | post-CodeQL-fix npm run verify:pre-pr passed with 110 passed and 568 skipped; Ja.docx remains unrelated untracked local owner file and is not staged | next: amend commit, force-push with lease, refresh PR body, monitor CI, then run verify:pre-merge before merge readiness`
- `2026-06-17 | PR #1149 | second CodeQL rerun still flagged script end-tag matching; replaced script/style end-tag regex with bounded tag scanning and verified node check, targeted Vitest, CLI help, and no-write local crawl evidence at 9 pass / 0 fail | next: amend commit, force-push with lease, refresh PR body, monitor CI, then run verify:pre-merge before merge readiness`
- `2026-06-17 | PR #1149 | post-scanner-fix npm run verify:pre-pr passed with 110 passed and 568 skipped; performance trend again recommended tighten and this brief keeps hold/defer because performance-budget tightening is out of scope | next: amend commit, force-push with lease, refresh PR body, monitor CI, then run verify:pre-merge before merge readiness`
- `2026-06-17 | PR #1149 | GitHub CI passed after scanner fix; local npm run verify:pre-merge found a repeatable full-suite desktop-chromium focus-restore timing failure, fixed by preventing SiteChrome initial/remount route blur from competing with drawer focus restore; owner also surfaced a live old course URL 404, fixed as a bounded breathing-and-floating/floating-back legacy alias to the current body-position-back canonical route; targeted route/SEO/script/live-crawl/Playwright checks passed | next: rerun local verify:pre-pr, amend/push, monitor CI, then rerun verify:pre-merge before merge readiness`
- `2026-06-17 | PR #1149 | post-alias/focus npm run verify:pre-pr passed full lane with 110 Playwright passed and 568 skipped; unrelated Ja.docx remains untouched and unstaged | next: amend commit, force-push with lease, refresh PR body, monitor CI, then rerun verify:pre-merge before merge readiness`

## Completion Record

- `completed`: `2026-06-17`
- `merged_pr`: `#1149`
- `squash_commit`: `7413ac60`
- `result`: Closed Public SEO Crawl Evidence And Tooling V1. The platform now has a repo-run crawl evidence command and runbook for public course SEO signals, the owner-surfaced old `breathing-and-floating/floating-back` course URL redirects to the current Body Position on the Back canonical route instead of 404ing, and the shared header menu focus restore behavior is hardened without visual changes.
- `validation`: `npm run verify:pre-pr` passed full lane, GitHub PR checks passed (`CodeQL`, `verify`, `e2e-smoke`, `site-lock-smoke`, `size-check`, Vercel), and `npm run verify:pre-merge` passed full lane with 110 Playwright passed / 568 skipped. Targeted route, script, SEO crawl, and focus tests also passed as recorded above.
- `10/10 claim`: yes - all critical target categories reached `5/5`; non-target `N/A` categories remained explicitly out of scope.

| Category                                      | Achieved Score | Evidence                                                                                                                                                                               | Gaps / Notes                                                                                                      |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | Crawl evidence map covers course overview, canonical lesson, legacy/query route, deprecated redirect alias, unknown route, planned locale, sitemap, robots, and private-mode behavior. | None.                                                                                                             |
| UX flow clarity                               | `5/5`          | Old shared lesson URL now redirects to the current canonical lesson; unknown URLs still fail closed.                                                                                   | None.                                                                                                             |
| Business logic correctness and data integrity | `5/5`          | Runtime identity aliases, canonical route helpers, and route tests prove deterministic canonical resolution.                                                                           | None.                                                                                                             |
| Accessibility (a11y)                          | `5/5`          | Existing a11y/E2E coverage passed; SiteChrome focus restore timing was hardened and the desktop focus regression passed in full pre-merge.                                             | None.                                                                                                             |
| Performance (CWV + payloads)                  | `5/5`          | `test:perf:budgets` passed in `verify:pre-pr` and `verify:pre-merge`; no new runtime dependency was added.                                                                             | Trend recommended tightening after 10 green weeks; held/deferred because this was not a performance-budget slice. |
| Data placement and sync boundaries            | `5/5`          | SEO truth derives from canonical course data, route helpers, metadata/sitemap output, and public artifacts only.                                                                       | None.                                                                                                             |
| Caching and invalidation strategy             | `5/5`          | Runbook records how crawl artifacts are regenerated and how sitemap/robots/private-mode outputs are validated.                                                                         | None.                                                                                                             |
| Reliability and failure handling              | `5/5`          | Tooling reports failed rows for missing metadata, bad redirects, private-mode leakage, schema mismatch, and unavailable local server conditions.                                       | None.                                                                                                             |
| Security and authz                            | `5/5`          | Sitemap/robots/private-mode checks passed; no protected/admin/member URL is intentionally exposed by the new evidence path.                                                            | None.                                                                                                             |
| Privacy and compliance                        | `5/5`          | Evidence artifacts are public-content only; no secrets, raw env values, user progress, admin notes, or private identifiers were committed.                                             | None.                                                                                                             |
| Content governance                            | `5/5`          | Runbook identifies source-of-truth content and external evidence review steps for future content changes.                                                                              | None.                                                                                                             |
| SEO and crawlability                          | `5/5`          | Local crawl evidence and PR checks cover canonical, sitemap, robots, metadata, structured data, legacy redirects, unknown URLs, and planned locales.                                   | External dashboard checks remain manual because they require account access.                                      |
| AI discoverability                            | `5/5`          | Evidence separates search crawler policy from training crawler policy and validates visible public learning content/schema alignment.                                                  | None.                                                                                                             |
| Analytics and KPI observability               | `5/5`          | Runbook documents monthly crawl/index/AI visibility review metrics and separates external dashboards from first-party product analytics.                                               | Manual dashboard access remains operational follow-up.                                                            |
| Incident response and support operations      | `5/5`          | Runbook troubleshooting covers missing indexing, wrong canonical, sitemap omission, robots/private-mode blockage, schema mismatch, and credential blockers.                            | None.                                                                                                             |
| i18n operational readiness                    | `5/5`          | Planned locale route behavior is checked so untranslated Norwegian lesson pages do not become indexable.                                                                               | None.                                                                                                             |
| Stack-fit and dependency discipline           | `5/5`          | Implementation reused Next.js route/metadata outputs, existing route helpers, TypeScript, Vitest, and Node tooling; no new dependency.                                                 | None.                                                                                                             |
| Testing and QA automation                     | `5/5`          | Unit tests, script checks, local crawl evidence, `verify:pre-pr`, CI, and `verify:pre-merge` passed.                                                                                   | None.                                                                                                             |
| Scalability and cost efficiency               | `5/5`          | Evidence derives canonical lesson routes from course data and helper contracts, avoiding paid services or hand-maintained duplicate URL lists.                                         | None.                                                                                                             |
| DevOps and rollback readiness                 | `5/5`          | PR/runbook records rerun commands, external blockers, artifact expectations, and deterministic failure interpretation.                                                                 | None.                                                                                                             |
