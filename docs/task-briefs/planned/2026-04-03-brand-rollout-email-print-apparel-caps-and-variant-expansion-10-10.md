# Task Brief: Brand Rollout Across Email, Print, Apparel, Caps, And Variant Expansion (10/10)

## Metadata

- `id`: `2026-04-03-brand-rollout-email-print-apparel-caps-and-variant-expansion-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-04-03`
- `updated`: `2026-04-03`

## Brief Audit Record

- `last_audited`: `2026-05-15`
- `base`: `main@b2a211f`
- `audit_status`: `revise-before-use`
- `decision`: Refresh this brief before execution.
- `reason`: Existing lifecycle brief predates the Brief Audit Record standard and was not fully re-audited in this governance slice; current scope, paths, scorecard mapping, validation lane, Help/Guide impact, and support-surface impact must be checked before use.
- `must_refresh_before_execution_if`: Always refresh before use, and refresh again if AGENTS.md, scorecard categories, verification lanes, route labels, Help/Guide, runbooks, support surfaces, provider facts, or relevant repo paths change.

## Goal

Take the merged FreeSwimming brand pack from a strong website/PDF foundation to a complete 10/10 rollout system that also covers email, print collateral, apparel/clothing, swim caps, and vendor-ready production variants without letting the brand drift into ad hoc one-off exports.

## Why This Brief Exists

- The core brand system already shipped through PR `#336` and now gives the repo:
  - a canonical source symbol,
  - a generated web/app/apparel logo pack,
  - a local typography direction,
  - website/PDF/app-icon usage rules,
  - a reproducible generation script and manifest.
- That shipped pack is good enough for current website/PDF use, but it is not yet the full production operating system for every brand surface the owner wants to use.
- The owner explicitly wants planning for:
  - printed things,
  - emails,
  - apparel/clothing,
  - swim caps,
  - many deliberate 10/10 design variations that can be reused later instead of improvised each time.
- Existing brand governance still has important gaps:
  - no explicit email-brand mapping,
  - no swim-cap-specific micro variants,
  - no embroidery/stitch-safe production family,
  - no vendor-ready policy for path-native/vector production masters,
  - no audit matrix proving current live surfaces actually match the intended usage system,
  - an editable PSD source had drifted under `public/` instead of a non-public design-source path.
- This brief is planning only:
  - no implementation is authorized by this brief alone,
  - the next step after approval is to split into small execution slices.

## Existing State Audit

What is already in good shape on `main`:

- Canonical source symbol exists at:
  - `/Users/stianvikra/freeswimming/public/logos/logo_master_symbol.png`
- Brand generator and manifest already exist:
  - `/Users/stianvikra/freeswimming/scripts/generate-brand-assets.py`
  - `/Users/stianvikra/freeswimming/public/logos/brand/manifest.json`
- Canonical usage guidance already exists:
  - `/Users/stianvikra/freeswimming/docs/design/brand-logo-usage.md`
- Website/PDF/apparel foundations already exist:
  - website lockups via `/Users/stianvikra/freeswimming/lib/brand.ts`
  - header/home/page-intro usage via `BrandImage`
  - PDF/program/workout usage via `BRAND_PDF_LOGO_PATH`
  - apparel-ready transparent exports under `/Users/stianvikra/freeswimming/public/logos/brand/apparel/`
- App identity assets already exist:
  - `favicon.ico`
  - `apple-touch-icon.png`
  - PWA icons

Audit findings and gaps to resolve in a follow-up implementation program:

- Email branding is not yet governed:
  - `docs/design/brand-logo-usage.md` defines website/PDF/apparel mapping, but not email header/footer/notification rules.
  - the admin email-template system exists, but there is no brand rollout contract tied to it yet.
- Production-ready small-format variants are missing from governance:
  - no explicit swim-cap side/paired/micro-lockup rules,
  - no embroidery-safe simplified family,
  - no stitch/foil/vinyl/one-color production guidance.
- Current SVG outputs are wrapper SVGs around raster exports:
  - this is acceptable for current repo usage,
  - but not yet a full vendor-production answer for embroidery, signage, or specialty printing.
- There is no full audit matrix yet that lists:
  - every current live brand surface,
  - intended asset family,
  - current actual asset,
  - whether that surface is compliant or needs correction.
- Editable source governance needed cleanup:
  - `logo_black.psd` should not live under `public/`,
  - it now belongs under `/Users/stianvikra/freeswimming/docs/design/source-assets/logo_black.psd`.

## Dependencies And Boundaries

- Existing completed foundation brief:
  - [2026-04-01-brand-logo-system-and-site-typography-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-01-brand-logo-system-and-site-typography-10-10.md)
- Current usage and generation sources:
  - [brand-logo-usage.md](/Users/stianvikra/freeswimming/docs/design/brand-logo-usage.md)
  - [generate-brand-assets.py](/Users/stianvikra/freeswimming/scripts/generate-brand-assets.py)
  - [manifest.json](/Users/stianvikra/freeswimming/public/logos/brand/manifest.json)
- Current non-public editable source folder:
  - [README.md](/Users/stianvikra/freeswimming/docs/design/source-assets/README.md)
  - [logo_black.psd](/Users/stianvikra/freeswimming/docs/design/source-assets/logo_black.psd)
- Existing brand rollout surfaces that future slices may update:
  - site chrome/header
  - homepage hero and supporting strips
  - page intro component
  - course touchpoints
  - app icon surfaces
  - workout/program/poolside PDFs
  - admin email-template previews and outbound email renders
  - printable collateral and apparel exports
- This brief does not itself authorize:
  - redesigning unrelated page layouts,
  - changing product logic unrelated to branding,
  - launching a new email delivery stack,
  - silent replacement of current canonical asset IDs without migration rules.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this brief:

- `Product goals and IA`
- `Visual design quality`
- `Accessibility (a11y)`
- `Content governance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                        | Evidence                                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Every owned brand surface is assigned one approved family/variant with no orphan surfaces and no conflicting usage rules between web, email, print, and apparel.      | audit matrix + design review + code review             | `5/5`                   |
| UX flow clarity                               | `target`     | Brand choices improve recognition and trust on every changed surface without making navigation, emails, or printed materials harder to scan or understand.            | manual QA across target surfaces                       | `5/5`                   |
| Visual design quality                         | `target`     | Digital, print, apparel, cap, and production variants all feel premium, coherent, and intentionally differentiated by use case rather than by arbitrary file naming.  | design review + exported pack review + live surface QA | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: rollout changes must not break existing route logic, export logic, email-template lifecycle, or static asset resolution.                             | regression tests + code review                         | `4/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: if operators choose or preview branded email assets/templates, the workflow stays simple and deterministic.                                          | admin QA + scope rationale                             | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Alt text, contrast, focus handling, email readability, print legibility, and small-format cap/apparel readability remain truthful and accessible.                     | manual QA + targeted tests + assistive review          | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Website and email-ready asset choices do not materially regress payloads or render paths; heavy production assets stay out of critical web runtime paths.             | build output + perf budgets + asset review             | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Editable masters live only in non-public design-source locations, derived runtime assets live in canonical public paths, and vendor-only exports have explicit homes. | brief contract + repo path audit + code review         | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: canonical runtime asset filenames and manifests remain deterministic and cache-friendly, with additive rollout for new variants where possible.      | asset manifest diff + code review                      | `4/5`                   |
| Reliability and failure handling              | `target`     | Missing assets, bad variant keys, or unavailable email/print assets fail gracefully with deterministic fallbacks instead of broken UI or broken exports.              | negative-path review + targeted tests                  | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: non-public source assets never leak through `public/`, and any admin/email tooling changes preserve current access-control boundaries.               | path audit + code review + negative-path review        | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this rollout changes brand assets and presentation rules only; it does not add new user-data collection or disclosure behaviors.                          | explicit scope rationale                               | `N/A`                   |
| Content governance                            | `target`     | The repo ends with one canonical brand system, one audit matrix, one source-asset policy, and explicit usage rules for web, email, print, apparel, and caps.          | docs review + asset review + checklist                 | `5/5`                   |
| Admin workflow and editability                | `target`     | If email or operator-facing brand choices are surfaced, they use canonical IDs and predictable defaults instead of freeform asset hunting.                            | workflow QA + component review                         | `5/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public brand updates preserve truthful metadata, icon references, and noindex/canonical behavior where relevant.                                     | metadata review + manual QA                            | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: public brand rollouts preserve semantic structure and stable naming so AI-facing discoverability does not regress.                                   | code review + markup review                            | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because the brand rollout does not require new analytics events unless a later execution slice explicitly adds them.                                              | explicit scope rationale                               | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: commerce emails, receipts, and trust-critical surfaces should receive brand treatment that increases clarity without changing entitlement logic.     | copy review + surface audit                            | `4/5`                   |
| Incident response and support operations      | `target`     | Operators can quickly identify the right brand asset family for urgent print/email/export fixes because the audit matrix, source policy, and usage docs are explicit. | runbook/docs review + operator walkthrough             | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because the rollout does not alter finance reconciliation or reporting workflows.                                                                                 | explicit scope rationale                               | `N/A`                   |
| i18n operational readiness                    | `target`     | Tagline and wordmark rules explicitly define what localizes, what stays canonical, and what fallback is used for locale-specific email/print variants.                | brief contract + docs review + implementation QA       | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Future slices extend the existing generator, manifest, static asset, and local-font patterns without introducing unnecessary dependencies or manual asset drift.      | dependency diff + code review                          | `5/5`                   |
| Testing and QA automation                     | `target`     | Audit assertions, asset contracts, and critical changed surfaces gain targeted test coverage, and final implementation slices still pass full verify gates.           | focused tests + `verify:pre-pr` + `verify:pre-merge`   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: new variants do not create uncontrolled asset duplication or force oversized web payloads for production-only files.                                 | asset review + manifest policy                         | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | New families are additive, versionable, script-generated where possible, and easy to revert without leaving the site or exports on broken brand references.           | PR diff + script + rollback notes                      | `5/5`                   |

Score gate policy:

- release gate: all `target` categories must close at `>=4/5`
- `10/10` claim gate: all critical target categories must close at `5/5`

## Data Placement And Sync Contract

- Canonical editable source assets live in non-public repo locations:
  - `docs/design/source-assets/`
  - future sibling source-asset directories are allowed if they remain outside `public/`
- Canonical runtime assets live in:
  - `public/logos/brand/`
  - `public/logos/brand/apparel/`
  - `public/icons/`
  - other explicit public output paths approved by the brief
- Email-safe assets must be:
  - embedded derived assets, or
  - approved public assets explicitly intended for email use
- Vendor-only or specialty-production exports may live outside runtime paths, but they must have:
  - a canonical folder,
  - a manifest or naming convention,
  - explicit ownership in docs.
- No runtime component, PDF renderer, or email renderer may reference PSDs or non-public design-source files directly.

## Identity And Rename Contract

- Canonical stable IDs that should remain additive-first:
  - `symbol-*`
  - `wordmark-name-*`
  - `wordmark-domain-*`
  - `tagline-inline-*`
  - `tagline-stacked-*`
  - `lockup-domain-*`
  - `lockup-tagline-*`
  - `stacked-domain-*`
  - `full-lockup-horizontal-*`
  - `full-lockup-vertical-*`
- Existing tones `blue`, `ink`, `primary`, and `white` are stable IDs once published.
- New tones or production families must be added with new explicit IDs rather than silently repurposing old ones.
- Rename vs repurpose policy:
  - if a surface needs a materially different geometry, spacing model, or production behavior, create a new family instead of overloading an existing file family.
  - if a tone simply evolves within the same approved family, regeneration may update the asset in place only if the brief explicitly allows it.
- Compatibility policy:
  - currently referenced runtime asset IDs in `lib/brand.ts` should remain valid until a child slice explicitly migrates them.
  - legacy compatibility files may continue to exist, but only when their lineage back to canonical assets is documented.

## Scope

- Audit all current owned brand surfaces against the intended system:
  - website
  - PDFs and print routes
  - email templates/outbound email rendering
  - apparel/clothing
  - swim caps
  - small-format/single-color production use cases
- Define the next approved asset families/variant families, including at minimum:
  - website/digital default variants
  - email header/footer variants
  - print-safe variants
  - monochrome one-color variants
  - inverse/dark-surface variants
  - embroidery-safe simplified variants
  - swim-cap micro variants
  - apparel chest/back/sleeve placements
  - signage/poster/banner-ready variants
- Define clear usage rules for:
  - minimum size
  - clear space
  - background suitability
  - one-color vs mixed-tone use
  - when to use symbol-only vs lockup vs tagline-only
  - when `.org` should appear and when it should not
- Define explicit email rollout rules:
  - transactional email header
  - support/ops email footer
  - admin template preview behavior
  - plain-text fallback signature language
- Define explicit print rollout rules:
  - poolside notes
  - program/workout PDFs
  - handouts/coach sheets
  - QR sheets/certificates/signage if approved later
- Define explicit apparel/clothing rules:
  - front chest
  - full chest
  - back print
  - sleeve/cuff small mark
  - tonal/inverse placements
- Define explicit swim-cap rules:
  - left/right-side placement options
  - mirrored paired options if approved
  - one-color cap-safe variants for small curved surfaces
- Decide whether the next production step requires:
  - path-native vector masters,
  - simplified embroidery masters,
  - or an explicit statement that current raster-derived exports remain acceptable for certain media only.

## Out Of Scope

- Full marketing copy rewrite.
- Rebuilding the entire public website layout around the brand.
- Launching a new outbound email provider or lifecycle engine.
- Replacing every icon/illustration in the product.
- Silent asset swaps on runtime surfaces without explicit audit/disposition.
- Implementing the actual rollout in this planning slice.

## Acceptance Criteria

1. The repo contains one approved planned brief for full brand rollout across website, email, print, apparel/clothing, and swim caps.
2. The brief includes an explicit audit of what already exists on `main` and what still does not.
3. The brief explicitly records that `logo_black.psd` is a non-public design-source file, not a runtime/public asset.
4. The brief defines a canonical home for editable source assets outside `public/`.
5. The brief defines additive naming/identity rules for future brand families and tones.
6. The brief defines email-specific brand requirements rather than leaving email branding implicit.
7. The brief defines print-specific brand requirements beyond the current PDF basics.
8. The brief defines apparel/clothing-specific variant families and placement expectations.
9. The brief defines swim-cap-specific micro/small-format requirements.
10. The brief defines whether single-color, embroidery-safe, and vendor-ready families are required.
11. The brief defines a surface-audit matrix expectation so implementation can verify actual live usage against intended mapping.
12. The brief preserves the existing strong parts of the current brand pack instead of resetting direction from scratch.
13. The brief states that current website/PDF/app-icon brand foundations already exist and should be extended, not duplicated.
14. Every scorecard category is mapped with explicit threshold/evidence where required.
15. The planned brief passes brief lint with no category omissions.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all`

Future implementation slices must additionally satisfy:

- targeted visual/asset validation
- targeted tests for changed runtime surfaces
- `npm run build`
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed for future implementation validation.
- Python 3 remains available for generator-backed asset work.
- Any future vendor-prep/vector tooling must be justified explicitly before being introduced.

## Manual QA Environments

For future implementation slices:

- Local iteration:
  - `http://127.0.0.1:3000`
- Preview:
  - PR Vercel preview URL
- Manual review must cover:
  - website/header/home/page intro surfaces
  - email preview/render surfaces
  - PDF/print preview surfaces
  - apparel exports
  - swim-cap mock or production-spec review

## Constraints

- Do not put editable source assets under `public/`.
- Do not let vendor-only or print-only files bloat critical website runtime payloads.
- Do not overwrite current stable family/tone IDs casually.
- Keep website runtime references on canonical generated assets/components rather than hard-coded random file picks.
- Preserve current a11y semantics and runtime truthfulness while extending the brand system.
- Keep the brand direction calm, premium, structural, and recognizably FreeSwimming rather than noisy or over-styled.

## 10/10 Quality Bar

- The brand should feel like one intentional system across:
  - website
  - PDFs and print
  - email
  - apparel
  - caps
  - production/vendor handoff
- Variants should solve real surface constraints rather than being arbitrary color swaps.
- Swim-cap and clothing variants should feel purpose-designed for their medium, not like shrunken website exports.
- Email branding should look trustworthy and calm, not marketing-heavy or template-generic.
- Print variants should remain legible in grayscale/ink-limited contexts where needed.
- Vendor/export rules should reduce back-and-forth rather than creating uncertainty about which file family is correct.

## Checkpoint Log

- `2026-04-03` — planning brief created after a cleanup pass confirmed that the core brand pack is already merged on `main`, that email/swim-cap/production-governance gaps still remain, and that `logo_black.psd` needed to move out of `public/` into a non-public design-source folder before any further rollout work.
