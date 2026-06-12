# Task Brief: Workout Context Save Success Poolside CTA Removal V1 (10/10)

## Metadata

- `id`: `2026-06-12-workout-context-save-success-poolside-cta-removal-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-12`
- `updated`: `2026-06-12`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-11-workout-context-cta-runtime-event-callsites-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-workout-context-cta-admin-analytics-mapping-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-12-workout-context-stage-summary-decline-denominator-rate-v1-10-10.md`
  - `docs/architecture/workout-context-cta-measurement-contract.md`
  - `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`
- `execution_mode`: `end-to-end-after-explicit-execute`
- `branch`: `workout-context-save-success-poolside-cta-removal-v1`

## Brief Audit Record

- `last_audited`: `2026-06-12`
- `base`: clean synced `main@c7498c1b` after PR `#1105` and repo-managed closeout PR `#1106`; post-merge preflight was reported clean.
- `audit_status`: `pivoted-after-owner-review`
- `decision`: Replace the explicit dismiss child with a removal/defer child for the saved-workout Poolside guide CTA placement.
- `reason`: Owner review found the saved-workout success message makes the separate paid Poolside guide look like part of the saved workout or Poolside Note workflow. That product-context mismatch is a UX issue, so this child removes the prompt instead of adding dismiss telemetry.
- `must_refresh_before_execution_if`: Refresh before continuing if AGENTS.md, task brief template, scorecard categories, `components/my-library/workouts/WorkoutBuilderHub.tsx`, workout routes, commerce checkout attribution, Admin Analytics historical CTA panels, Help/Guide contracts, product catalog IDs, or screenshot handoff rules change.

## Goal

Remove the saved-workout post-success Poolside guide upsell placement from the workout builder so the success message only confirms the save. Keep the Poolside guide product, `/guides/poolside`, Plans presentation, entitlement, PDF, and historical Admin Analytics/checkout attribution behavior intact.

## Pre-Implementation Owner Explanation

For en ikke-teknisk bruker skal "Changes saved" bare bety at okten er lagret. "Poolside guide" er et separat betalt guideprodukt, ikke en del av denne lagrede okten, ikke Poolside Note og ikke en eksport av treningen. Derfor fjerner vi denne prompten fra lagre-suksessen i stedet for a legge til "Not now".

Utenfor scope er a fjerne Poolside guide-produktet, endre `/guides/poolside`, endre Plans/Stripe/checkout/entitlement/finance, slette historiske Admin Analytics-paneler, lage ny kommersiell plassering, eller endre workout-generatoren.

Forward-compatibility-intent: future product prompts must be explicitly placed with clear product copy and tests; unknown or historical workout-context telemetry stays read-only and must not create new UI prompts automatically.

## Product Decision

- Remove `See Poolside guide` from the workout save success feedback.
- Do not add `Not now` or `cta_dismissed`.
- Stop runtime `upsell_presented` and `upsell_accepted` emission from the saved-workout success placement.
- Remove the saved-workout CTA product-availability prop/loading path because there is no CTA to guard.
- Keep existing Poolside guide product surfaces and historical Admin Analytics/checkout mappings.
- Keep future Poolside guide promotion as a separate owner-approved placement decision with clearer context.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Data placement and sync boundaries
- Reliability and failure handling
- Privacy and compliance
- Analytics and KPI observability
- Commerce and revenue ops
- Incident response and support operations
- Finance and reporting operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                    | Evidence                                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Save success feedback must only confirm saved workout state and must not introduce an unexplained paid guide prompt.                                                  | component tests + screenshot handoff                           | `5/5`                   |
| UX flow clarity                               | `target`     | Users see no Poolside guide choice inside the save confirmation; future guide promotion requires clearer product context.                                             | component tests + Help/Guide/docs copy                         | `5/5`                   |
| Visual design quality                         | `target`     | Success message has no confusing action row, no layout overlap, and preserves existing spacing/responsive behavior.                                                   | desktop/mobile screenshot artifacts                            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Successful save emits workout-save analytics only; it does not emit Poolside upsell shown/clicked/declined events from this surface.                                  | component tests + helper/callsite removal review               | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this child adds no admin editor, placement config, CRUD workflow, publish flow, or editable CTA setting.                                                  | explicit admin-editor scope rationale                          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Removing the ambiguous CTA removes extra controls from the live region and keeps the save status simple for screen-reader and keyboard users.                         | Testing Library role/query assertions + screenshot review      | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Remove an unnecessary catalog availability read from workout routes and add no dependency, route, image, font, or vendor script.                                      | changed-files review + typecheck/pre-pr gate                   | `5/5`                   |
| Data placement and sync boundaries            | `target`     | No local or persisted CTA dismissal state is introduced; historical analytics remains server-canonical read-only telemetry.                                           | code review + docs caveat                                      | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: removing the CTA availability loader reduces route work; no new cache, invalidation, or revalidation behavior is added.                              | route/cache review                                             | `4/5`                   |
| Reliability and failure handling              | `target`     | Workout save success cannot be affected by product catalog lookup or upsell analytics failure from this placement.                                                    | route/component tests + removed loader evidence                | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no protected route or access boundary changes; guide entitlement and checkout auth contracts remain unchanged.                                       | changed-files review                                           | `4/5`                   |
| Privacy and compliance                        | `target`     | Removing the callsite prevents this surface from sending product-prompt telemetry tied to workout save context.                                                       | component negative assertions + no new payload helper          | `5/5`                   |
| Content governance                            | `target`     | Architecture/API/Help guidance and parent checkpoint state that saved-workout promotion is removed/deferred, not reinterpreted as dismiss.                            | docs updates + route/label/support sweep                       | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin mutation, role-gated workflow, editable config, recovery action, or operator workflow changes are added.                                         | explicit admin-workflow scope rationale                        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this child adds no public route, metadata, sitemap, robots, canonical URL, structured data, or crawlable landing copy.                                    | explicit SEO scope rationale                                   | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this child adds no public semantic page, structured data, public docs page, or AI-facing crawl surface.                                                   | explicit AI-discoverability scope rationale                    | `N/A`                   |
| Analytics and KPI observability               | `target`     | Runtime no longer emits saved-workout CTA shown/clicked/declined from this surface; historical dashboard fields remain read-only and clearly bounded.                 | component tests + Admin Analytics docs caveat                  | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Poolside guide commerce surfaces remain on Plans/guide routes; save success no longer looks like checkout or product access.                                          | no Stripe/checkout/product diff except removed CTA loader      | `5/5`                   |
| Incident response and support operations      | `target`     | Support guidance distinguishes removed/deferred saved-workout prompt from guide access, checkout cancel, revenue, and finance evidence.                               | Help/Guide/API/architecture copy + sweep evidence              | `5/5`                   |
| Finance and reporting operations              | `target`     | No analytics from this save-success surface may be used as revenue, refund, payout, invoice, accounting export, Stripe reconciliation, or finance reporting evidence. | finance caveat docs + no finance/export changed-files evidence | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: removing visible commercial copy reduces untranslated copy; future placement copy requires explicit localization path.                               | copy review + future mapping rule                              | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse current React/routes/test stack; remove dead CTA helper/loader paths; add no dependency, vendor, migration, config, or route.                                   | changed-files/package diff + tests                             | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted negative tests, run route/label/support sweep, capture screenshot handoff, then run broad gates after owner visual approval.                             | targeted Vitest + screenshot artifacts + later verify gates    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: fewer route calls and no new event dimensions, raw drilldown, vendor forwarding, warehouse, or export cost.                                          | code review                                                    | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Change is revertable without migration, provider config, env var, dependency, or schema change; rollback would restore only the saved-workout CTA callsite.           | PR rollback notes + no migration/env/dependency evidence       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

Skill/capability audit:

- Available now: repo task-brief patterns, scorecard, existing workout-builder tests, analytics/commerce contracts, Playwright screenshot tooling.
- Stripe plugin: not used because this child does not change Stripe, Checkout Sessions, webhooks, billing, refunds, payouts, invoices, or finance reconciliation.
- Install/config changes: none.

Systemic findings:

| Surface                               | Finding                                                                                        | Severity | Recommended Type               | Owner Decision Needed | Follow-Up Brief Path |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- | -------- | ------------------------------ | --------------------- | -------------------- |
| Workout save success UX               | The existing Poolside guide prompt makes a separate paid guide look tied to the saved workout. | high     | bounded implementation child   | no                    | this brief           |
| Future Poolside guide promotion       | A clearer placement needs product context, not a bare success-message CTA.                     | medium   | deferred architecture decision | yes                   | TBD                  |
| Historical Admin Analytics CTA panels | Existing aggregate panels may still describe historical shown/clicked rows.                    | low      | safe process/docs update       | no                    | this brief           |

React/Next.js:

- Reference surface: reuse `components/my-library/workouts/WorkoutBuilderHub.tsx` and its existing
  `WorkoutBuilderFeedback` save-success status surface.
- Remove the CTA action from the existing save success feedback instead of adding new markup.
- Remove workout-route CTA availability loading because no saved-workout CTA renders.

TypeScript/domain contracts:

- Keep historical workout-context constants used by Admin Analytics.
- Remove runtime CTA payload/link helpers that no longer have a callsite.
- Keep checkout attribution parsing for historical and externally linked plans URLs.

Supabase/data layer:

- No migration, RLS change, generated DB type update, rollup job, index, entitlement mutation, raw drilldown, or export path.
- No new persisted analytics row is introduced.
- API/server negative-path evidence: this child adds no API route or server action. Existing
  workout save negative path behavior remains covered by component tests; removing the CTA
  availability loader removes one possible support lookup failure and creates no new 401, 403, or
  no unexpected 500 path.

External services/tools:

- No Stripe Session, webhook, billing portal, provider metadata, refund, payout, invoice, pricing, subscription, product catalog, vendor analytics, secret, or env-var change.

UI system:

- Screenshot handoff is required because this removes visible UI from the save success surface.
- Session-step reference contract: `docs/design/session-step-surface-contract.md` is not touched because this child changes only the save success feedback, not `Edit`, `Rearrange`, `View`, step rendering, step data contracts, or pool/open-water session content.

Testing:

- Add/update component tests that successful save does not render Poolside guide upsell controls or emit upsell events.
- Update commerce/checkout/analytics tests for removed dead helpers.
- Run route/label/support sweep before broad gates.

## Data Placement And Sync Contract

- Server-canonical:
  - Workout save remains server-canonical through existing workout APIs.
  - Historical `analytics_events` rows remain server-canonical read-only telemetry for Admin Analytics.
  - Product, checkout, entitlement, provider, and finance truth remain in their existing systems.
- Local/browser:
  - No saved-workout CTA dismissal state, localStorage, cookie, visitor ID, ad click ID, or user preference is added.
  - Save success UI is local render state only.
- Sync policy:
  - Removing this CTA does not mutate workout, product catalog, checkout, entitlement, provider, support, or finance truth.
  - Existing checkout/entitlement flows continue to own their own attribution and recovery behavior.
- Retention and sensitivity:
  - Existing analytics retention applies to historical rows.
  - This child sends no new saved-workout guide prompt payload from the save success surface.
- Cache/invalidation:
  - No new cache or invalidation mechanism.
  - Workout routes no longer load the CTA product-availability guard for this placement.

## Identity And Rename Contract

- Canonical stable IDs kept for historical reporting:
  - Event identities: `upsell_presented`, `upsell_accepted`, `upsell_declined`.
  - Source identity: `workout_context`.
  - Placement identity: `workout_saved_post_success`.
  - Product identity: `guide_poolside`.
- Runtime behavior changed:
  - The saved-workout success surface no longer emits the above prompt events.
  - No `cta_dismissed` identity is shipped in this child.
- Human-readable identifiers:
  - Poolside guide product labels, Plans copy, guide page copy, and Admin Analytics labels remain display-only and renameable when meaning is unchanged.
- Rename vs repurpose:
  - Removing the prompt from save success is placement removal.
  - Reusing the same IDs for a new visible placement, direct checkout, persistent opt-out, or decline KPI is repurpose and requires a new child.
- Compatibility contract:
  - Historical Admin Analytics can still read old rows.
  - Future prompt placements must be explicitly mapped with copy, tests, and screenshot handoff.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Products/catalog items, CTA placement IDs, event payload dimensions, Admin Analytics modules, Help/Guide copy, locales, future shop routes, providers, exports, and finance/reporting surfaces.
- Source of truth:
  - Event names come from `ANALYTICS_EVENT_NAMES`.
  - Product IDs come from the catalog.
  - Admin counts come from `/api/admin/analytics/insights` and remain historical/read-only for this removed placement.
  - Finance truth comes from reconciliation/export evidence, not analytics.
- Additive behavior:
  - Existing Plans, guide, checkout, entitlement, and historical dashboard behavior continue to work.
  - Removing this callsite does not automatically create a new replacement placement.
- Explicit mapping requirements:
  - New Poolside guide prompts, new products, placements, surfaces, reason keys, persistent suppression, direct checkout, dedicated dismiss/decline KPIs, finance reporting, CSV/export, raw drilldown, vendor analytics, localized commercial claims, or public landing/SEO copy require explicit mapping, tests, docs, and owner decision.
- Unknown or deprecated values:
  - Unknown historical values stay out of dedicated KPI counts unless already approved by existing contracts.
  - Unknown future values must not imply conversion, entitlement, revenue, or finance truth.
- Test/evidence:
  - Tests must prove save success has no Poolside guide link/button and emits no upsell shown/clicked/declined event from this surface.
  - Route/label/support sweep must confirm no dead CTA prop/loader/helper remains in workout routes.

## Scope

- Remove the saved-workout post-success Poolside guide CTA from `WorkoutBuilderHub`.
- Remove the `workoutContextCtaProductAvailable` prop and route-level availability loading used only for that CTA.
- Remove runtime CTA payload/link helpers that no longer have a callsite.
- Update targeted unit/component tests.
- Update Help/Guide/API/architecture docs and parent brief to describe the placement as removed/deferred.
- Capture screenshot handoff and stop for owner approval before `npm run verify:pre-pr`.

## Out Of Scope

- Removing Poolside guide product, `/guides/poolside`, PDF download, entitlement, Plans card, Stripe checkout, checkout attribution parsing, historical Admin Analytics panels, product catalog rows, prices, finance/export, vendor analytics, raw drilldown, migration, RLS, or builder/generator algorithm changes.
- Creating a new Poolside guide promotion placement.
- Adding `Not now`, `cta_dismissed`, persistent opt-out, user preference, or Admin Analytics dismiss mapping.
- Treating historical prompt data as revenue, purchase intent, unique-user conversion, entitlement truth, or finance truth.
- Merging without explicit owner approval.

## Acceptance Criteria

1. Save success shows only the save confirmation, with no `See Poolside guide` link and no `Not now` button.
2. Successful workout save does not emit `upsell_presented`, `upsell_accepted`, or `upsell_declined` from the saved-workout success surface.
3. Workout routes no longer load or pass a saved-workout CTA product-availability guard.
4. Poolside guide product, guide route, PDF, Plans presentation, checkout, entitlement, and historical Admin Analytics panels remain intact.
5. Docs/Help clarify that this placement is removed/deferred and future promotion requires a separate mapped placement.
6. Targeted tests pass.
7. Screenshot handoff is captured with desktop/mobile artifacts and owner approval is received before `npm run verify:pre-pr`.

## Validation

Targeted during implementation:

- Relevant Vitest tests for `WorkoutBuilderHub`
- Relevant analytics/commerce tests touched by removed helpers
- `npm run typecheck`
- `npm run lint:briefs:all`
- `npm run lint:quality-gates`
- Route/label/support sweep
- `git diff --check`
- Screenshot handoff following repo visual rules

After owner screenshot approval:

- `npm run verify:pre-pr` - PASS on 2026-06-12, full lane
- commit, push, open/update PR
- required CI checks green
- `npm run verify:pre-merge`

## Route / Label / Support Surface Sweep

Run before broad gates because this child removes visible CTA copy, route props, and runtime event callsites.

Search at minimum:

- `workoutContextCtaProductAvailable`
- `loadWorkoutContextCtaProductAvailable`
- `buildWorkoutContextPlansHref`
- `workout-context-cta-link`
- `workout-context-cta-dismiss`
- `See Poolside guide`
- `Not now`
- `cta_dismissed`
- `workout_saved_post_success`
- `guide_poolside`
- `upsell_presented`
- `upsell_accepted`
- `upsell_declined`
- `Admin Analytics`
- `Help/Guide`
- `finance`
- `revenue`
- `workout-context`

Check at minimum:

- `app/`
- `components/`
- `lib/analytics/`
- `lib/commerce/`
- `tests/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- active/planned/done task briefs when relevant
- Help/Guide assertions when relevant

Initial sweep result:

- Completed on 2026-06-12. Identifiers searched included `workoutContextCtaProductAvailable`,
  `loadWorkoutContextCtaProductAvailable`, `buildWorkoutContextPlansHref`,
  `workout-context-cta-link`, `workout-context-cta-dismiss`, `See Poolside guide`, `Not now`,
  `cta_dismissed`, `workout_saved_post_success`, `guide_poolside`, `upsell_presented`,
  `upsell_accepted`, `upsell_declined`, `Admin Analytics`, `Help/Guide`, `finance`, `revenue`, and
  `workout-context`.
- Surfaces checked included `app/`, `components/`, `lib/analytics/`, `lib/commerce/`, `tests/`,
  `docs/api-contracts.md`, `docs/architecture/`, active/planned task briefs, and Help/Guide
  assertions. Fallout handled: live workout CTA callsites/props/loaders/helpers were removed,
  tests now assert no save-success upsell controls/events, and docs/Help explain the prompt is
  removed/deferred while historical Admin Analytics remains read-only.

## Help / Guide Impact

- Required: update Admin Help/Guide or relevant support docs so operators know the saved-workout Poolside guide prompt is removed/deferred from the current runtime surface.
- Must state historical prompt metrics are not purchases, access grants, revenue, accounting evidence, unique people, or approval for vendor tracking.

## Screenshot Handoff Plan

- Required because this is visible UI work.
- Comparison type: `after/reference`.
- Required representative screenshots:
  - changed saved-workout success feedback desktop with no Poolside guide CTA,
  - changed saved-workout success feedback mobile with no Poolside guide CTA,
  - reference surrounding builder/editor surface where practical.
- Stop after screenshot handoff for owner approval before `npm run verify:pre-pr`.

## Checkpoint Log

- `2026-06-12 | in-progress | owner originally approved explicit dismiss child from clean main@c7498c1b, but screenshot review identified that the existing saved-workout Poolside guide prompt itself is unclear for non-technical users because Poolside guide is a separate paid product, not part of the saved workout or Poolside Note | next: pivot to removing/defering the saved-workout success prompt`
- `2026-06-12 | pivot implemented | active child renamed/rescoped to save-success Poolside CTA removal. Removed the save-success CTA callsite, route product-availability loader/prop, dead CTA payload/link helpers, and tests for explicit dismiss. Historical Admin Analytics and checkout attribution contracts remain intact | next: finish docs sweep, targeted validation, screenshots, and wait for owner visual approval before verify:pre-pr`
- `2026-06-12 | screenshot stop | targeted Vitest, npm run typecheck, npm run lint:briefs:all, npm run lint:quality-gates, route/label/support sweep, and git diff --check passed. Captured after/reference artifacts at output/workout-context-save-success-poolside-cta-removal-2026-06-12-231452. Temporary capture route/script were removed after generation, no scoped product-rendering source changed after final capture, and owner visual approval is pending before verify:pre-pr | next: wait for owner screenshot approval or visual corrections`
- `2026-06-12 | pre-pr pass | owner approved screenshot handoff, then npm run verify:pre-pr passed the full lane. Gate covered branch-current, quality gates, lint, typecheck, unit tests, build, perf budgets, and Playwright e2e. Known local dev-login/Supabase fallback logs only caused supported skips, not failures | next: commit, push, open PR, and monitor CI`
- `2026-06-12 | CI test hardening | PR #1107 CI verify exposed an unrelated HabitPerfectDayHub unit-test race where the test waited for fetch instead of the rendered success notice. Hardened the test to await the card-local success message; isolated and full habit test file pass locally | next: rerun verify:pre-pr, push follow-up, and re-monitor CI`
