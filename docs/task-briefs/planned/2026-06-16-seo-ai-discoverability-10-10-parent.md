# Task Brief: SEO And AI Discoverability 10/10 Parent

## Metadata

- `id`: `2026-06-16-seo-ai-discoverability-10-10-parent`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-16`
- `updated`: `2026-06-16`
- `execution_mode`: `plan-only parent; implementation only through explicit child briefs`
- `supersedes_for_planning`: [SEO AI Discoverability And Admin SEO Controls](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-02-18-seo-ai-discoverability-and-admin-seo-controls.md)

## Brief Audit Record

- `last_audited`: `2026-06-16`
- `base`: clean synced `main@45aaecad` with unrelated untracked local `Ja.docx` intentionally left untouched; planning branch `docs/seo-ai-discoverability-parent-2026-06-16`.
- `audit_status`: `ready`
- `decision`: Use this as the refreshed parent for public SEO, AI discoverability, canonical route, sitemap/robots, structured data, and multilingual readiness work; execute only through bounded child briefs.
- `reason`: The older SEO/admin brief predates current scorecard/radar/i18n requirements and mixes public SEO, admin controls, redirects, and broad operations. Recent course lesson work made `/course` the strongest public learning surface, so the first implementation child should lock course lesson canonical routes and AI-discoverable SEO before distribution or admin SEO controls expand.
- `must_refresh_before_execution_if`: Refresh if Google Search Central, OpenAI crawler docs, Next.js App Router i18n/metadata behavior, sitemap/robots policy, site-lock/private-mode rules, course runtime identity, route patterns, supported locales, scorecard categories, or verification lanes change.

## Goal

Make Freeswimming's public learning content easy for search engines, AI search systems, and users to discover, understand, cite, share, and route to, while preserving private-mode protections and future multilingual growth.

## Pre-Implementation Owner Explanation

Vi lager foerst reglene for hvordan Freeswimming skal bli funnet og forstaatt av Google, Bing og AI-soek. Det betyr at URL-er, canonical, sitemap, robots, strukturert data, spraak og AI-crawlere faar en tydelig kontrakt foer vi endrer kode. Utenfor scope i parenten er runtime-implementering, admin SEO-kontroller, full oversettelse, backlinks, betalt SEO, PRO, checkout, Habits og innholdsproduksjon.

Forward-compatibility-intent: nye offentlige routes, kursleksjoner og senere spraakversjoner skal arve canonical, metadata, sitemap og structured-data-regler fra en felles kontrakt. Nye route-familier, locale-koder, schema-typer, crawler-policyvalg eller kommersielle destinasjoner krever eksplisitt mapping, tester og brief-oppdatering.

## Product Principle

- Public educational content must be indexable, text-first, canonical, and useful before any upgrade path.
- One public learning object gets one canonical URL per locale.
- Human-readable slugs are presentation and SEO affordances; stable runtime IDs remain the source of truth.
- AI discoverability is not a separate trick layer. It depends on crawlable pages, clear entities, visible text, valid metadata, structured data that matches the page, and a deliberate crawler policy.
- Private/site-lock behavior must remain fail-closed: no public sitemap leakage, no accidental indexing, and no protected URLs in AI/search discovery assets.

## Source Baseline Checked On 2026-06-16

- Google canonicalization: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google structured data: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Google AI features: https://developers.google.com/search/docs/appearance/ai-features
- Google multilingual/hreflang: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google multilingual site management: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- OpenAI crawlers: https://platform.openai.com/docs/bots
- Next.js App Router internationalization: https://nextjs.org/docs/app/guides/internationalization
- Schema.org `inLanguage`: https://schema.org/inLanguage
- Schema.org `LearningResource`: https://schema.org/LearningResource

## Canonical Route Policy

- Recommended route model for new public learning pages:
  - `/{locale}/course` for the localized course overview.
  - `/{locale}/course/<module-slug>/<lesson-slug>` for localized course lesson canonical pages.
- First supported locale should be documented explicitly before implementation. Current recommendation:
  - `en`: first crawlable locale.
  - `nb`: planned locale, not published as crawlable lesson pages until Norwegian main content exists.
- Legacy/current app links remain supported:
  - `/course`
  - `/course?lesson=<runtime-or-legacy-id>`
- Legacy/query URLs must not become the long-term sitemap canonical for individual lessons.
- Canonical signals must align:
  - internal links,
  - share links,
  - QR defaults where practical,
  - `rel=canonical`,
  - sitemap URLs,
  - redirect/alias behavior.
- Do not use `robots.txt`, `noindex`, or URL removal as a canonicalization substitute.

## i18n SEO Contract

- Use subpath locale routing, not cookies or query params, for crawlable localized public pages.
- Each localized page has a self-canonical URL.
- Localized alternates must use `hreflang` with fully qualified URLs.
- Each alternate set must include self-reference and bidirectional links for active locales.
- Use `x-default` for the neutral/default entry where appropriate.
- Sitemap should include active locale URLs and alternate annotations when the implementation child owns sitemap changes.
- Do not publish a localized URL with untranslated main content. A page with translated shell but English lesson body should remain absent/noindex until content is genuinely localized.
- Localized slugs are renameable presentation values; stable lesson runtime IDs are locale-independent.
- Slug rename requires alias/redirect coverage per locale.
- JSON-LD should include `inLanguage` for page-level educational content where structured data is emitted.
- Future locale additions require explicit content readiness, route mapping, metadata copy, `hreflang`, sitemap, tests, and screenshot/crawl evidence if visible text layout changes.

## AI Search And Crawler Policy

- Google AI Overviews / AI Mode:
  - no special AI markup is required beyond normal SEO fundamentals,
  - pages must be indexable and eligible for snippets,
  - important content must be visible as text,
  - structured data must match visible text.
- ChatGPT Search:
  - recommend allowing `OAI-SearchBot` for public learning pages so Freeswimming can appear in ChatGPT search answers.
  - `ChatGPT-User` is user-initiated and not the search indexing opt-out mechanism.
  - decide `GPTBot` separately because it relates to training use, not search appearance.
- Initial recommendation:
  - allow `Googlebot`, `Bingbot`, and `OAI-SearchBot` for public pages,
  - keep private/admin/member routes disallowed or noindexed through existing private-mode controls,
  - make `GPTBot` a documented owner decision before any crawler-specific allow/block rule is added.

## Child Brief Plan

| Child                                                                                                                                                                                                                        | Status    | Purpose                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Course Lesson Canonical Routes And Multilingual AI-Discoverable SEO V1](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-16-course-lesson-canonical-routes-and-multilingual-ai-discoverable-seo-v1-10-10.md) | `planned` | First implementation slice for route/canonical/i18n-ready course lesson SEO.                                                                        |
| Public SEO Crawl Evidence And Tooling V1                                                                                                                                                                                     | `future`  | Add repeatable crawl evidence using Search Console, Rich Results, PageSpeed, Screaming Frog/Ahrefs, or local equivalent after route implementation. |
| Admin SEO Controls And Redirect Governance V1                                                                                                                                                                                | `future`  | Refresh the older admin SEO controls scope after public route contracts are stable and admin content foundations are current.                       |
| SEO Distribution Measurement And Search Console Ops V1                                                                                                                                                                       | `future`  | Establish monthly measurement across Search Console, Bing Webmaster Tools, AI visibility, crawl errors, and content opportunity review.             |

## Codex Skill + Stack Readiness Radar

Capability audit:

| Capability           | Evidence                                                                    | Current Status         | Recommended Trigger                                                | Boundary                                               |
| -------------------- | --------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| `playwright`         | `/Users/stianvikra/.codex/skills/playwright/SKILL.md`                       | `installed`            | route, metadata, sitemap, rendered-head, and screenshot validation | does not replace release gates or owner approval stops |
| `openai-docs`        | session skill metadata                                                      | `available`            | OpenAI crawler, ChatGPT Search, or Codex/OpenAI doc questions      | official OpenAI sources only                           |
| `imagegen`           | session skill metadata                                                      | `available`            | only if future social/OG bitmap assets are explicitly needed       | not for route/schema/metadata work                     |
| Stripe plugin skills | session plugin metadata                                                     | `available`            | future checkout/commerce SEO if pricing or payment pages change    | not relevant to this parent or first child             |
| External SEO tools   | Google Search Console, Rich Results Test, PageSpeed, Screaming Frog, Ahrefs | `available externally` | crawl/index/structured-data/AI-visibility evidence                 | external dashboards may require owner credentials      |

Systemic findings:

| Surface                      | Finding                                                                                                                                                                                           | Severity | Recommended Type                 | Owner Decision Needed                                        | Follow-Up Brief Path                                                                                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public route/canonical model | Course lessons currently have a working query route, but 10/10 SEO needs stable canonical lesson URLs that can carry locale, sitemap, metadata, internal links, and structured data consistently. | `high`   | `bounded implementation child`   | `no` for planning; implementation still needs child approval | [Course Lesson Canonical Routes And Multilingual AI-Discoverable SEO V1](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-16-course-lesson-canonical-routes-and-multilingual-ai-discoverable-seo-v1-10-10.md) |
| Multilingual growth          | If locale routing is deferred from the route contract, later language rollout risks canonical migration and signal splitting.                                                                     | `high`   | `bounded implementation child`   | `yes`, supported locales and publish timing                  | [Course Lesson Canonical Routes And Multilingual AI-Discoverable SEO V1](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-16-course-lesson-canonical-routes-and-multilingual-ai-discoverable-seo-v1-10-10.md) |
| Admin SEO controls           | The older broad SEO/admin brief mixes public crawl behavior with admin SEO CRUD; executing it directly would be too broad and stale.                                                              | `medium` | `deferred architecture decision` | `yes`, after public route contract                           | `Admin SEO Controls And Redirect Governance V1`                                                                                                                                                                              |

Return path:

- Current parent: this brief.
- First planned child: [Course Lesson Canonical Routes And Multilingual AI-Discoverable SEO V1](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-16-course-lesson-canonical-routes-and-multilingual-ai-discoverable-seo-v1-10-10.md).
- Prior related work: Course lesson experience, metadata, learning cards, and legacy field cleanup are done through PRs `#1140`, `#1142`, and closeout PR `#1143`.
- Exact next planning step: owner reviews this parent and first child scope, then explicitly says execute/build/implement the child before a runtime implementation branch starts.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the parent 10/10 claim gate:

- Product goals and IA
- Business logic correctness and data integrity
- SEO and crawlability
- AI discoverability
- i18n operational readiness
- Security and authz
- Privacy and compliance
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                     | Evidence                          | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Parent defines public SEO/AI route hierarchy, child sequencing, and free learning purpose without mixing admin/commerce work.                                          | parent + child brief review       | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting because this parent changes no UI; future route changes must preserve clear public navigation and share paths.                                              | child acceptance criteria         | `4/5`                   |
| Visual design quality                         | `supporting` | Supporting because no visual implementation is in scope; future visible SEO/social preview or route UI changes require screenshot handoff.                             | screenshot rule in children       | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Stable IDs, slugs, locale routes, aliases, canonical URLs, and unknown-route fallbacks have explicit invariants before implementation.                                 | identity contract + child tests   | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin SEO controls are deferred and must be refreshed separately before any operator workflow changes.                                                | deferred child plan               | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Future route changes must keep visible public content semantic and keyboard-safe; no UI changes here.                                                                  | child QA requirements             | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | SEO implementation children must not add heavy client JS, request-time fetches, or payload bloat to public routes.                                                     | build/perf gates in children      | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Public SEO metadata derives from canonical content/route data; no local user state or private data enters crawl surfaces.                                              | data contract + tests             | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Crawlable metadata/sitemap/schema cache behavior is explicit per child and avoids stale public/private mode mismatches.                                                | child cache contract              | `5/5`                   |
| Reliability and failure handling              | `target`     | Unknown slugs, legacy IDs, missing translations, private mode, and sitemap/robots edge cases have safe fallback rules.                                                 | negative-path tests in children   | `5/5`                   |
| Security and authz                            | `target`     | Private/admin/member routes stay excluded/noindexed/fail-closed; public SEO assets must not leak protected URLs.                                                       | private-mode tests + route review | `5/5`                   |
| Privacy and compliance                        | `target`     | Metadata, schema, sitemap, crawler policy, and AI/search surfaces expose public learning content only.                                                                 | diff review + tests               | `5/5`                   |
| Content governance                            | `target`     | SEO copy, slugs, schema, locale readiness, and crawler policy have named source-of-truth and owner decision points.                                                    | brief contracts + child evidence  | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting because admin SEO editability is deferred; future admin child must include Help/Guide and authz/audit tests.                                                | deferred child rationale          | `4/5`                   |
| SEO and crawlability                          | `target`     | Canonicals, redirects/aliases, metadata, sitemap, robots, hreflang, internal links, and indexability rules are defined and tested per route family.                    | child route/sitemap/schema tests  | `5/5`                   |
| AI discoverability                            | `target`     | Public pages expose clear text, stable entities, structured data, and deliberate `OAI-SearchBot`/AI crawler policy.                                                    | crawler policy + schema tests     | `5/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting because this parent defines measurement but does not add event taxonomy; future ops child owns Search Console/Bing/Ahrefs reporting.                        | future measurement child          | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting because public course SEO may later affect PRO interest, but no pricing, checkout, entitlement, invoice, payout, or revenue truth changes here.             | commerce no-change rationale      | `4/5`                   |
| Incident response and support operations      | `target`     | Support can diagnose index/canonical/private-mode/crawler issues from runbook or brief evidence before release.                                                        | child runbook/PR notes            | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this parent changes no payment, refund, invoice, payout, tax, entitlement reconciliation, or finance reporting behavior.                                   | explicit finance scope rationale  | `N/A`                   |
| i18n operational readiness                    | `target`     | Locale routing, hreflang, self-canonical per language, translation readiness, slug aliasing, and missing-translation policy are defined before route implementation.   | i18n SEO contract + child tests   | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use Next.js App Router metadata/i18n patterns, existing course identity helpers, TypeScript contracts, and no new dependency by default.                               | stack gate + dependency diff      | `5/5`                   |
| Testing and QA automation                     | `target`     | Each child must include unit/route/e2e/crawl tests for metadata, canonical, sitemap, robots, private mode, aliases, unknown values, and structured data where touched. | child validation gates            | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Future lessons/locales derive URLs and metadata from canonical data without manual per-page hardcoding or external paid fetches.                                       | future-value fixtures             | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Route/canonical changes include rollback, redirect/alias policy, Search Console/Bing resubmission notes, and pre-pr/pre-merge gates.                                   | child rollback notes + gates      | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Use Next.js App Router route groups/layouts/metadata APIs for server-rendered metadata.
  - Use subpath locale routing for crawlable localized pages when locale routing is implemented.
  - Avoid high-risk file moves or route rewrites without tests and a route/label/support sweep.
- TypeScript/domain contracts:
  - Keep stable route identity in typed helpers.
  - Separate stable runtime ID from localized slug and title.
  - Add canonical URL, alias, unknown, and locale tests before route release.
- Supabase/data layer:
  - Parent does not require migrations.
  - Future admin SEO controls may touch admin content storage and must use migrations/RLS/authz/audit tests.
- External services/tools:
  - Use official Google, OpenAI, schema.org, and Next.js docs for current rules.
  - Search Console/Bing/Ahrefs/Screaming Frog evidence may require owner credentials and should be treated as external manual evidence when needed.
- UI system:
  - No UI changes in this parent.
  - Future public navigation/language switcher/social preview UI requires screenshot handoff.
- Testing:
  - Child briefs must define unit, route, e2e, sitemap/robots, private-mode, schema, and crawl evidence appropriate to the changed surface.

## Data Placement And Sync Contract

- Server-canonical:
  - Public route metadata and sitemap data derive from checked-in canonical route/content helpers until an admin SEO content source is explicitly implemented.
  - Future admin SEO fields, if added, become server-canonical only through a separate admin child with migrations and RLS/authz.
- Local-only:
  - No SEO truth should live in browser-only state.
  - Locale preference may be local UX state, but crawlable locale URLs must remain addressable without cookies.
- Sync policy:
  - No write/sync behavior in this parent.
  - Future admin-published SEO fields must define publish/revalidate behavior.
- Retention and sensitivity:
  - SEO assets contain public content only.
  - No private admin notes, member data, analytics identifiers, raw env values, or secrets in metadata/schema/sitemap.
- Cache/invalidation:
  - Each implementation child must document static/dynamic cache behavior for metadata, sitemap, robots, and private-mode changes.

## Identity And Rename Contract

- Canonical stable ID:
  - Course lesson runtime IDs and future public entity IDs are source-of-truth across progress, analytics, QR, admin links, redirects, and canonical URL generation.
- Human-readable identifiers:
  - Slugs, titles, metadata titles, descriptions, and locale route segment labels are presentation values.
- Mutability rules:
  - Runtime IDs are immutable.
  - Slugs are renameable only with alias/redirect coverage and tests.
  - Locale slugs may differ by language.
- Rename vs repurpose:
  - A renamed lesson keeps the same stable ID and redirects from old slug.
  - A materially different lesson requires a new stable ID/entity, not reuse of an old canonical route.
- Compatibility:
  - Legacy query URLs and known runtime aliases must resolve deterministically to canonical routes.
  - Unknown/deprecated route values fail to a safe fallback or 404/noindex according to child scope.
- Observability and repair:
  - Children must include tests or logs/support diagnostics for unresolved aliases and invalid route params.

## Forward Compatibility Contract

- Extensibility surfaces:
  - public route families, course modules, course lessons, runtime IDs, localized slugs, locale codes, hreflang alternates, sitemap entries, structured-data types, crawler user agents, AI/search measurement tools, admin SEO fields, redirects, and future commerce/support destinations.
- Source of truth:
  - Route and metadata values derive from typed route/content helpers and stable IDs, not hardcoded today's lesson list in multiple places.
- Additive behavior:
  - New course lessons should automatically receive canonical URL, metadata defaults, sitemap inclusion, internal link shape, and structured-data base fields when content is crawl-ready.
  - New active locales should automatically add alternate metadata/sitemap entries only when content readiness is explicit.
- Explicit mapping requirements:
  - New locale, route family, schema type, crawler policy, commerce destination, admin SEO field, or redirect family requires code/copy/test/doc updates before release.
- Unknown or deprecated values:
  - Unknown slugs/IDs should not create indexable duplicate pages.
  - Deprecated aliases redirect or canonicalize to the stable entity when known.
  - Missing translations should not publish indexable localized pages with wrong-language main content.
- Test/evidence:
  - Future child briefs must include future-value fixtures, unknown-value negative paths, sitemap/robots checks, route/label/support sweeps, and schema validation evidence where relevant.

## Help / Guide Impact

- Parent-only impact: no Help/Guide product update required because this file changes planning rules only.
- Future admin SEO controls, redirect editors, language publishing workflow, or support-facing recovery behavior must update Help/Guide and relevant runbooks in the same PR.
- Future public route/label changes require the route/label/support-surface impact sweep before broad gates.

## Scope

- Define the public SEO/AI/i18n governance contract.
- Define canonical route, locale, sitemap, robots, structured-data, crawler, and measurement policies.
- Create the first planned course lesson implementation child.
- Preserve private/site-lock boundaries.
- Record official-doc baseline and future refresh triggers.

## Out Of Scope

- Runtime implementation.
- Admin SEO CRUD, redirect editor, SEO preview UI, or admin workflow changes.
- Full content translation or language switcher UI.
- Backlink outreach, paid SEO, PR campaigns, social distribution, YouTube strategy, or email capture.
- PRO, checkout, pricing, entitlements, finance, Stripe, Habits, My Swim Sessions, or workout-builder changes.
- New dependencies or external dashboard setup.

## Acceptance Criteria

1. Parent defines the public SEO/AI/i18n route and quality contract.
2. Parent records current official-source baseline and refresh triggers.
3. Parent separates public SEO from future admin SEO controls.
4. Parent includes i18n/hreflang/canonical/slug policy before route work starts.
5. First planned child exists and is linked.
6. Scorecard mapping includes every canonical category with measurable target thresholds.
7. Changed briefs pass `npm run lint:briefs` and docs-only validation.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`
- `npm run verify:docs-only`
- `npm run verify:pre-pr`
- PR CI required checks
- `npm run verify:pre-merge` before merge readiness

## Checkpoint Log

- `2026-06-16 | planned | created refreshed SEO/AI discoverability parent from clean synced main@45aaecad after owner approved a docs-only parent + first child planning package; runtime implementation is not approved yet | next: validate docs-only gates, open PR, and wait for owner scope approval before executing the first child`
