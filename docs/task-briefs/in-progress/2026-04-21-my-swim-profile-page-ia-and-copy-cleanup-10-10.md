# Task Brief: My Swim Profile Page IA And Copy Cleanup (10/10)

## Metadata

- `id`: `2026-04-21-my-swim-profile-page-ia-and-copy-cleanup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-21`
- `updated`: `2026-04-24`

## Goal

Turn the current athlete profile/training setup/records page into a cleaner `My Swim Profile` surface with less explanatory copy and clearer navigation back to My Library.

## Sequencing Lock

- Run before maintenance baseline unless explicitly deferred.
- Account & Security audit removes the dedicated account/security entrypoint; do not reintroduce that button while cleaning the profile page.
- Keep this as page IA/copy cleanup, not a profile-data schema redesign.

## Why This Brief Exists

- The current title and copy over-explain the page.
- `Athlete profile, training setup & records` should become the simpler product-facing label `My Swim Profile`.
- The page should feel consistent with the cleaner surfaces already established in:
  - Swim session builder action hierarchy,
  - poolside preview settings,
  - early-access/test-user contact form visual polish.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                      | Evidence                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Page title, hierarchy, and back navigation clearly communicate `My Swim Profile` without redundant explanatory sections.            | route review and screenshots           | `5/5`                   |
| UX flow clarity                               | `target`     | Primary page jobs are obvious and users are not distracted by low-value helper copy or redundant nav buttons.                       | manual QA                              | `5/5`                   |
| Visual design quality                         | `target`     | Layout matches the current clean My Library/swim builder card rhythm and avoids floating explanatory blocks.                        | before/after screenshot review         | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Removing or moving copy/nav does not remove profile data, records, training preferences, or saved state.                            | targeted tests and code review         | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes owner-facing My Library profile UI, not admin editor workflows.                                            | explicit scope rationale               | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Heading hierarchy, focus order, link/button labels, and keyboard navigation remain clear after IA cleanup.                          | semantic review and targeted QA        | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: copy/layout removal should not add JS or payload and must not regress `/my-library`.                               | build output and route QA              | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Profile data remains server-canonical or existing local-state ownership as currently implemented; cleanup changes no data boundary. | code review                            | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no cache or invalidation behavior changes unless discovered and explicitly documented.                             | route diff review                      | `4/5`                   |
| Reliability and failure handling              | `target`     | Empty/loading/error states for profile sections remain reachable and understandable after removing explanatory copy.                | targeted QA                            | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected profile route stays inside existing auth boundary and exposes no new account data.                       | auth boundary review                   | `4/5`                   |
| Privacy and compliance                        | `target`     | No private profile, preferences, or records are newly exposed or made more prominent outside the authenticated owner context.       | privacy review                         | `5/5`                   |
| Content governance                            | `target`     | Product labels are canonicalized to `My Swim Profile`; removed explanatory copy is either deleted or moved to Help only if needed.  | copy review                            | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, role-gated content mutation, or publishing state changes.                                            | explicit scope rationale               | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated My Library surface with no public crawl contract.                                              | explicit scope rationale               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public content semantics or structured data change.                                                                  | explicit scope rationale               | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: if existing page-view/action events exist, labels should not create broken analytics names.                        | event diff review                      | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, or billing path changes.                                                             | explicit scope rationale               | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this IA cleanup introduces no new support operation or incident runbook path.                                           | explicit scope rationale tied to scope | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, billing, payout, or reconciliation behavior changes.                                                        | explicit scope rationale tied to scope | `N/A`                   |
| i18n operational readiness                    | `target`     | New canonical labels avoid hard-coded inconsistent terminology and are easy to translate later.                                     | copy inventory review                  | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Cleanup reuses existing components and design tokens with no new dependency.                                                        | dependency diff                        | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted tests and screenshot handoff cover desktop/mobile profile page and preserved section behavior.                             | targeted tests and screenshots         | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: simpler IA reduces future support/content maintenance burden.                                                      | scope review                           | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: narrow UI/copy diff with no schema or migration keeps rollback straightforward.                                    | PR review                              | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - existing profile, training preferences, records, goals/focus/notes data as currently implemented.
- Local-only:
  - transient UI state only.
- Sync policy:
  - no changed write semantics.
- Retention and sensitivity:
  - no new retention or disclosure path.
- Cache/invalidation:
  - no cache changes planned.

## Identity And Rename Contract

- Human-readable page label changes to `My Swim Profile`.
- No persisted entity rename is planned.
- Existing route identifiers should remain compatible unless a follow-up IA brief explicitly changes routing.

## Scope

- Rename visible page title to `My Swim Profile`.
- Remove the long intro paragraph under the title.
- Remove `How this fits` if it remains low-value explanatory content.
- Right-align or preserve `Back to My Library` as the useful top-level navigation action.
- Audit whether `Refresh all` has a clear job; remove if it is redundant or confusing.

## Out Of Scope

- Account & Security deletion or auth policy changes.
- Profile schema changes.
- New goals/focus/notes authoring work.
- Commerce or billing changes.

## Acceptance Criteria

1. Page title reads `My Swim Profile`.
2. Redundant explanatory paragraph is gone.
3. `How this fits` is removed unless implementation discovers a measurable user job it uniquely serves.
4. `Back to My Library` remains clear and visually aligned with the header.
5. No profile data or edit capability is lost.
6. Desktop and mobile remain visually consistent with current My Library/builder design.

## Validation

- `npm run lint:briefs`
- targeted unit/component tests if route content is covered
- targeted Playwright or visual QA for desktop/mobile
- screenshot handoff before `verify:pre-pr`
- owner screenshot approval before PR gate
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local and Vercel preview.
- Mobile and desktop My Swim Profile route.
- Authenticated owner context with existing profile data and empty-state profile data.

## Design Constraints

- Follow the cleaner swim session builder and poolside preview action hierarchy.
- Avoid explanatory cards inside cards.
- Keep copy product-facing and short.

## Help/Guide Impact

- Move only genuinely useful explanation to Help/Guide.
- Do not keep permanent page copy just to document architecture.

## Checkpoint Log

- `2026-04-21 | planned | created from owner finding that Athlete Profile page is over-explained and should become My Swim Profile | next: implement or defer before maintenance baseline`
- `2026-04-24 | in-progress | route/page scope patched to My Swim Profile label, entrypoint cleanup, and redundant explainer/refresh action removal | next: run targeted QA, capture screenshots, then full gates`
- `2026-04-24 | in-progress | desktop/mobile screenshots captured in output/playwright/my-swim-profile-ia and verify:pre-pr passed on rerun after one transient 3100 connection-refused flake in verify-open | next: owner screenshot approval, then commit/push/open PR`
- `2026-04-24 | in-progress | perf-budget trend recommended tightening one stretch target after two green weekly runs; decision deferred to maintenance baseline because this brief is narrow IA/copy cleanup, not perf-baseline scope | next: record same defer note in PR summary`
- `2026-04-24 | in-progress | owner approved screenshots, My Swim Profile card fallback summary noise was removed, and support-surface tests were hardened by removing unnecessary full-route settle in account-security plus treating local connection reset/refused as transient goto retries | next: rerun full verify:pre-pr and proceed to PR flow`
- `2026-04-24 | in-progress | full verify:pre-pr green after support-surface hardening (`106 passed`, `344 skipped`); no new product-surface regressions found in desktop/mobile profile flows | next: commit, push, open PR, then run verify:pre-merge before merge recommendation`
