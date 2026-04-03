# Task Brief: Brand Logo System And Site Typography (10/10)

## Metadata

- `id`: `2026-04-01-brand-logo-system-and-site-typography-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-01`
- `updated`: `2026-04-03`

## Goal

Ship a coherent FreeSwimming brand system where the new canonical symbol, standalone wordmarks, tagline lockups, apparel-ready exports, website typography, and PDF/export surfaces all feel like the same deliberate product.

## Why This Brief Exists

- The product currently mixes an older swimmer icon, generic browser typography, and PDF/export branding that do not feel like one clear brand system.
- A new canonical symbol now exists in:
  - `/Users/stianvikra/freeswimming/public/logos/logo_master_symbol.png`
- The owner wants a complete reusable pack, not a one-off asset:
  - symbol-only,
  - `freeswimming` only,
  - `freeswimming.org` only,
  - `Learn. Drill. Swim.` one-line standalone,
  - symbol + `freeswimming.org`,
  - symbol + `Learn. Drill. Swim.`,
  - symbol + `freeswimming` + `Learn. Drill. Swim.` in both horizontal and vertical arrangements,
  - `Learn. Drill. Swim.` stacked line by line,
  - blue / dark / white variants,
  - website-ready, PDF-ready, and apparel-ready usage.
- The visual bar is explicitly `10/10`; this is a product-brand slice, not just a file-export task.

## Dependencies And Boundaries

- Canonical source symbol for this slice:
  - `/Users/stianvikra/freeswimming/public/logos/logo_master_symbol.png`
- Existing old logo assets may be replaced or remapped:
  - `/Users/stianvikra/freeswimming/public/logos/01_icon_transparent.png`
  - `/Users/stianvikra/freeswimming/public/logos/01_icon_white_transparent.png`
  - `/Users/stianvikra/freeswimming/public/logos/03_stacked_transparent.png`
- Canonical usage guidance for this slice:
  - `/Users/stianvikra/freeswimming/docs/design/brand-logo-usage.md`
- Website surfaces expected to align to the new system:
  - top navigation / site chrome,
  - home hero,
  - page intro cards,
  - contextual course card logo usage,
  - favicon / app icons / apple touch icon,
  - workout/program PDF print surfaces.
- This slice may update site typography if that materially improves brand coherence.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                              | Evidence                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Brand usage becomes intentional: cramped surfaces use symbol-only, primary site navigation uses symbol + wordmark, and hero/support surfaces use lockups that fit context.  | design review + code review + manual QA       | `5/5`                   |
| UX flow clarity                               | `target`     | New lockups improve recognition and reduce visual confusion without making core app navigation or PDFs feel heavier or harder to scan.                                      | manual QA on key surfaces + visual comparison | `5/5`                   |
| Visual design quality                         | `target`     | Symbol, wordmark, stacked tagline, and mixed-color lockups feel premium, consistent, balanced, and legible across website, PDF, and transparent export use cases.           | asset review + manual browser/PDF QA          | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: branding changes must not break route logic, export logic, or existing builder/program state behavior.                                                     | code review + regression tests                | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes end-user/public brand surfaces rather than admin authoring workflow.                                                                         | explicit scope rationale                      | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Logo swaps and typography changes preserve alt text, contrast, focus visibility, and readable hierarchy on all changed surfaces.                                            | manual keyboard QA + existing e2e/a11y smoke  | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Brand asset updates do not materially regress route payloads or rendering, and font loading uses a local, optimized source with stable fallback behavior.                   | build output + perf budgets + code review     | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because branding assets are static repository artifacts and do not introduce stateful sync behavior.                                                                    | explicit scope rationale                      | `N/A`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: asset paths and static font usage must remain deterministic and cache-friendly.                                                                            | code review + build output                    | `4/5`                   |
| Reliability and failure handling              | `target`     | If an asset is missing, fallback text/alt handling stays truthful and the site still renders without broken navigation or unusable print views.                             | code review + runtime checks + manual QA      | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because the slice changes no auth boundaries, permissions, or sensitive API behavior.                                                                                   | explicit scope rationale                      | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because the slice changes branding and typography only; no user data collection or disclosure changes occur.                                                            | explicit scope rationale                      | `N/A`                   |
| Content governance                            | `target`     | The repo gains a canonical brand-asset set and usage guidance so future surfaces do not drift back to mixed legacy logos or ad hoc text treatments.                         | docs + asset pack review                      | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin labels, publishing workflow, or operator status model changes are part of this slice.                                                                  | explicit scope rationale                      | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: brand/title treatments on public pages remain readable and truthful, with no regressions in metadata structure.                                            | code review + manual QA                       | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because this slice does not change public structured metadata or public AI-discoverable content contracts.                                                              | explicit scope rationale                      | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because the brand slice does not add or remove tracked business events.                                                                                                 | explicit scope rationale                      | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, entitlement, billing, or reporting logic changes in this slice.                                                                                    | explicit scope rationale                      | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: brand asset naming and usage documentation should make it easy to identify the canonical assets if future visual regressions or missing-file issues occur. | asset docs + explicit usage guidance          | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice changes no finance reconciliation, payout, or reporting workflows.                                                                                   | explicit scope rationale                      | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: typography and lockups must not block later localization on the website, and tagline assets should remain optional rather than hard-coded everywhere.      | code review + explicit usage rules            | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | The solution uses stack-native local fonts, generated static assets, and existing Next.js/Tailwind patterns without adding unnecessary dependencies.                        | dependency diff + code review                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed brand surfaces are covered by focused tests where appropriate, and full `npm run verify:pre-pr` passes on the final tree.                                           | focused checks + `npm run verify:pre-pr`      | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: asset generation is reproducible, and runtime avoids repeated heavyweight image work or remote font fetches.                                               | generation script + code review               | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: canonical files, script-driven generation, and isolated brand references make rollback straightforward if the new brand direction needs adjustment.        | PR diff + script + asset naming               | `4/5`                   |

Score gate policy:

- release gate: all `target` categories must close at `>=4/5`
- `10/10` claim gate: all critical target categories must close at `5/5`

## Data Placement And Sync Contract

- `N/A` because this slice introduces no persisted runtime state.
- Brand assets, font files, and generation scripts are static repository artifacts only.

## Identity And Rename Contract

- Canonical stable IDs:
  - canonical brand symbol source is `public/logos/logo_master_symbol.png`,
  - canonical local website font source is the vendored `Manrope` font file used for brand/UI typography,
  - canonical generated logo-pack outputs live under `public/logos/brand/`.
- Human-readable identifiers:
  - `freeswimming.org` and `Learn. Drill. Swim.` are presentation-level brand strings and may appear in different lockups,
  - filenames should distinguish `symbol`, `wordmark`, `horizontal`, `stacked`, `tagline`, and color tone clearly.
- Mutability rules:
  - the canonical source symbol may be replaced only by explicit owner decision,
  - generated assets should be reproducible from script rather than hand-edited one by one.
- Rename vs repurpose policy:
  - if the brand direction changes again, add a new canonical source symbol and regenerate,
  - do not silently repurpose unrelated old logo files without keeping a documented canonical mapping.
- Compatibility contract:
  - existing site references to legacy icon filenames may be remapped to the new symbol for compatibility,
  - changed UI surfaces should use new canonical brand assets/components going forward.
- Observability and repair:
  - asset docs should make the canonical source + generated outputs explicit so future regressions are easy to repair.

## Scope

- Create a canonical FreeSwimming brand pack from `public/logos/logo_master_symbol.png`.
- Generate these asset families in the colors needed for web/app/PDF use:
  - symbol-only,
  - wordmark-only for `freeswimming`,
  - wordmark-only for `freeswimming.org`,
  - standalone one-line `Learn. Drill. Swim.`,
  - horizontal lockup: symbol + `freeswimming.org`,
  - horizontal lockup: symbol + `Learn. Drill. Swim.`,
  - full horizontal lockup: symbol + `freeswimming` + `Learn. Drill. Swim.`,
  - stacked tagline: `Learn.` / `Drill.` / `Swim.`,
  - stacked lockup: symbol over `freeswimming.org`,
  - full vertical lockup: symbol + `freeswimming` + `Learn. Drill. Swim.`.
- Provide at least these tones:
  - primary mixed tone (blue symbol + dark wordmark/accent),
  - full blue,
  - dark/ink,
  - white/reverse.
- Generate higher-resolution transparent apparel exports for every asset family so clothing and signage can stay inside the same style system.
- Vendor and apply a matching local font so the website typography and logo family feel coherent.
- Update the key site surfaces to the new brand system:
  - site chrome/header,
  - homepage hero,
  - page intro component,
  - selected course/logo touchpoints,
  - favicon / app icon / apple-touch-icon surfaces,
  - workout/program PDF print views.
- Document usage guidance for when to use:
  - symbol-only,
  - `freeswimming` alone,
  - `freeswimming.org` alone,
  - `Learn. Drill. Swim.` alone,
  - symbol + wordmark,
  - symbol + tagline,
  - symbol + name + tagline,
  - stacked tagline,
  - apparel-ready exports.

## Out Of Scope

- Rewriting broad page layouts unrelated to brand/logo placement.
- New business logic or auth changes.
- Full marketing-site copy rewrite.
- Replacing every single icon or illustration in the product.
- Building a design system from scratch beyond the surfaces directly affected by brand/logo/typography usage.

## Acceptance Criteria

1. `public/logos/logo_master_symbol.png` is treated as the canonical source symbol for the new brand system.
2. The repo contains a documented, reusable logo pack with symbol-only, standalone wordmarks, standalone tagline outputs, horizontal lockups, vertical lockups, and stacked tagline outputs.
3. The logo pack includes blue, dark, and white/reverse variants, plus a primary mixed-tone lockup for the default website brand.
4. The repo includes a `Learn. Drill. Swim.` stacked asset where each word sits on its own line and feels intentional as standalone brand copy.
5. The repo includes standalone `freeswimming`, standalone `freeswimming.org`, and standalone one-line `Learn. Drill. Swim.` assets.
6. The repo includes a horizontal asset with symbol + `Learn. Drill. Swim.` and a horizontal asset with symbol + `freeswimming.org`.
7. The repo includes full horizontal and full vertical assets with symbol + `freeswimming` + `Learn. Drill. Swim.`.
8. The repo includes higher-resolution transparent apparel exports for every approved family so clothing-ready files exist in the same system.
9. The website adopts a local font direction that fits the new symbol and improves brand coherence without harming readability.
10. The top navigation/header uses the new brand system rather than the legacy icon treatment.
11. The homepage hero feels more intentional and branded with the new symbol/font system.
12. Secondary intro surfaces no longer mix the new brand direction with legacy iconography.
13. Favicon, PWA icons, and apple-touch icon adopt the new symbol system so the website identity is consistent beyond the page body.
14. Program and workout/PDF surfaces use the new brand direction where space allows and remain print-legible.
15. Accessibility semantics, alt text, contrast, and keyboard/focus behavior remain intact on changed surfaces.
16. The asset-generation process is reproducible from repo-local source files and documented.
17. Focused validation plus full `npm run verify:pre-pr` pass before PR handoff.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- focused validation for generated asset references and changed UI surfaces
- `npm run build`
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Python 3 is available locally for deterministic asset generation scripts.

## Manual QA Environments

- Local iteration:
  - `http://127.0.0.1:3000`
  - browsers/devices:
    - Desktop Safari
    - Desktop Chrome
    - mobile viewport for header/home sanity
- Preview:
  - PR Vercel preview URL
  - browsers/devices:
    - Desktop Safari
    - Desktop Chrome
- Required manual checks:
  - top bar brand reads clearly and feels premium,
  - home hero branding looks intentional rather than generic,
  - page intro cards use the new mark consistently,
  - favicon, installed-app icon, and apple-touch icon reflect the new symbol rather than the retired swimmer logo,
  - workout/program PDF brand treatment remains legible in browser print preview,
  - white/reverse mark reads clearly on dark surfaces,
  - apparel-ready exports open with transparent background and sufficient resolution for print placement.

## Constraints

- Use the new symbol exactly as the canonical brand source; do not substitute the retired swimmer icon.
- Keep new brand assets transparent-background ready where appropriate.
- Keep clothing/signage assets in the same system rather than creating a second ad hoc apparel style.
- Prefer stack-native/local-font solutions; avoid remote font fetches at runtime.
- Do not add unnecessary dependencies just to generate brand assets.
- Preserve readable text hierarchy and performance on all changed surfaces.
- Keep asset naming clean enough that future contributors can pick the right lockup without guesswork.

## 10/10 Quality Bar

- The new brand should feel deliberate, modern, calm, and premium rather than generic startup-blue or accidental browser-default.
- The symbol and typography should complement each other:
  - angular/structural symbol,
  - warmer human sans typography,
  - restrained blue + dark palette,
  - clear reverse/white handling.
- Required UI states:
  - `default` light surfaces,
  - `inverse` dark surfaces,
  - `compact` use where only the symbol fits,
  - `print` use where wordmark/logo must remain legible in export views.
- Accessibility:
  - alt text remains truthful,
  - decorative marks remain hidden when appropriate,
  - contrast stays sufficient in light and dark contexts,
  - typography remains readable on mobile and desktop.
- Performance:
  - local font loading only,
  - no material brand asset payload bloat,
  - no broken image flashes on critical navigation surfaces.
- Visual consistency:
  - the same color logic and wordmark treatment apply across header, hero, page intros, icons, apparel exports, and PDFs,
  - no legacy swimmer logo remains on changed surfaces.
- Business correctness:
  - no changed route or export flow should fail because of missing logo wiring,
  - generated asset paths must be deterministic and checked into the repo.

## Git Rhythm Defaults

- Commit + push after the logo pack and site/PDF integration are validated.

## Checkpoint Log

- `2026-04-01 | in-progress | new brand slice started on feat/logo-system-brand-pack-2026-04-01 using public/logos/logo_master_symbol.png as canonical symbol source; direction locked to Manrope + mixed blue/ink lockups before asset generation and site rollout | next: generate the full pack, wire the font, and update the key website/PDF surfaces`
- `2026-04-01 | in-progress | generated full PNG + SVG wrapper brand pack under public/logos/brand, added reproducible generator script, vendored Manrope locally, replaced key site chrome/home/page-intro/course surfaces with the new lockups, and wired workout/program PDF views to the new brand/font stack | next: run build + brief lint, then full verify:pre-pr and visual QA`
- `2026-04-01 | in-progress | expanded the pack to include standalone freeswimming/freeswimming.org/tagline assets, full horizontal and vertical symbol+name+tagline lockups, apparel-ready transparent exports, and symbol-driven favicon/PWA/apple-touch icons so the brand system covers web, PDF, and clothing in one style language | next: rerun generation, validate brand contracts, and complete full verify:pre-pr`
- `2026-04-01 | in-progress | softened the domain lockup so .org reads as a calm suffix instead of a blue accent, regenerated the pack and icon set, and reran full npm run verify:pre-pr successfully (95 passed, 301 skipped) on the calmer wordmark direction | next: stage only the canonical brand files, push the branch, and open the PR`
