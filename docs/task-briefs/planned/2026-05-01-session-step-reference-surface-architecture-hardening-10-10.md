# Task Brief: Session Step Reference Surface Architecture Hardening (10/10)

## Metadata

- `id`: `2026-05-01-session-step-reference-surface-architecture-hardening-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-01`
- `updated`: `2026-05-01`

## Goal

Make swim-session step UI architecture reuse one shared display/view-model contract across manual builder, AI generated drafts, poolside notes, previews, and future planner surfaces.

## Why This Brief Exists

- The manual pool session builder is the mature reference surface for session-step `Edit`, `Rearrange`, and `View`.
- The AI swim session generator exposed a predictable risk: visually similar step surfaces can drift when route-local markup evolves separately.
- React best practice here is not to visually copy a finished surface; it is to reuse a shared component, adapter, or view-model contract so future changes propagate deliberately.
- The current AI generator slice adds the reference-surface gate and aligns the generated draft UI, but `WorkoutEditor` still owns too much session-step rendering logic in one large component.
- This follow-up is the right place for a focused architecture pass without expanding the V1 generator slice past screenshot review.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                | Evidence                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Session-step surfaces must identify one reference surface and share the same mode contract for `Edit`, `Rearrange`, and `View`.                                   | architecture docs + screenshot after/reference QA  | `5/5`                   |
| UX flow clarity                               | `target`     | Manual builder and generated-session step flows must expose equivalent actions, hierarchy, rest summaries, and mode behavior unless an exception is documented.   | component tests + local screenshot review          | `5/5`                   |
| Visual design quality                         | `target`     | Shared section cards, rails, labels, tabs, spacing, and secondary-note treatment must come from a shared renderer or shared tokens, not route-local visual forks. | visual diff review + screenshot handoff            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Step grouping, linked rests, repeat rests, standalone rests, and generated coach notes must map deterministically without changing canonical workout data.        | unit tests for view-model adapters                 | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin-like editing ergonomics benefit from the shared contract, but no admin CRUD surface is redesigned in this brief.                           | scope review                                       | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Shared controls preserve keyboard, labels, focus, and screen-reader semantics across all reused session-step modes.                                               | Testing Library assertions + Playwright spot check | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Refactor must not add a dependency, large client payload, duplicate render pass, or measurable route regression for `/my-library/*` builder surfaces.             | bundle/build review + local QA                     | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Shared view-model code must keep server-canonical workout drafts separate from local editor state and presentation-only derived summaries.                        | code review + tests                                | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: the work should not change route caching, but shared derived summaries must recompute when draft state changes.                                  | component tests                                    | `4/5`                   |
| Reliability and failure handling              | `target`     | Empty, malformed, partial, and generated draft step states must render deterministic fallback text instead of blank cards or crashes.                             | negative-path unit tests                           | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected workout routes and save APIs remain unchanged and must continue to fail closed through existing coverage.                              | existing auth tests + scope review                 | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: rendered profile/session context must remain owner-facing and must not expand personal-data exposure.                                            | copy/data review                                   | `4/5`                   |
| Content governance                            | `target`     | Session-step terminology, mode labels, rest wording, and coach-note wording must have one documented source of truth.                                             | docs/design contract + tests                       | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: editability improves through shared step rendering, but no admin status/publish workflow changes.                                                | scope review                                       | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is private authenticated app UI and changes no public metadata, sitemap, robots, or crawlable route content.                                     | explicit SEO scope rationale                       | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this brief changes no public semantic content or crawl-safe AI-discoverable entity surface.                                                           | explicit AI discovery scope rationale              | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no new analytics taxonomy is required, but the refactor should preserve existing events and test IDs used for QA.                                | event/test-id diff review                          | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, checkout, billing, or revenue workflow changes.                                                                              | explicit commerce scope rationale                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this is a component architecture hardening slice with no new alert, incident, or support-operation workflow.                                          | explicit support-ops scope rationale               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, payout, refund, invoice, reconciliation, or reporting data changes.                                                                       | explicit finance scope rationale                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: shared labels should make later translation easier, but this brief does not introduce locale routing or translation storage.                     | code review + label centralization review          | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use React/TypeScript composition, adapters, and existing Tailwind/UI primitives; add no new dependency or parallel design system.                                 | dependency diff + code review                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused unit/component coverage for shared view-model output plus Playwright screenshot handoff comparing changed surfaces against the reference surface.     | tests + screenshot artifacts + gates               | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Shared renderer/view-model must reduce duplicated UI maintenance and avoid future copy-paste drift across planner, PDF, and poolside surfaces.                    | diff review + architecture closeout note           | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Refactor must be code-only, reversible as one PR, and should preserve existing API/schema contracts with no migration rollback needs.                             | PR diff + verification gates                       | `5/5`                   |

## Data Placement And Sync Contract

- Server-canonical data:
  - saved workout/session draft JSON and persisted workout records remain the source of truth.
- Local-only data:
  - editor mode, expanded card state, rearrange focus state, and transient derived display summaries.
- Sync policy:
  - shared view-model adapters derive display-only data from the current draft on render,
  - adapters must not mutate draft steps,
  - save/update APIs remain responsible for canonical persistence.
- Retention and sensitivity:
  - no new storage,
  - no expanded profile or coach-note retention.
- Cache/invalidation:
  - derived summaries recompute from current props/state;
  - no route cache or server invalidation policy changes.

## Identity And Rename Contract

- Canonical stable ID:
  - workout/session IDs and step IDs remain unchanged.
- Human-readable identifiers:
  - titles, step names, and labels remain editable presentation fields where already editable.
- Mutability rules:
  - the refactor may rename internal components/types but must not repurpose persisted IDs or saved workout records.
- Rename vs repurpose policy:
  - visual contract extraction is an in-place implementation refactor, not a new workout entity.
- Compatibility contract:
  - existing saved workouts, generated drafts, manual drafts, exports, and tests must keep reading the same draft schema.
- Observability and repair:
  - tests must catch missing step labels, missing rest summaries, blank view sections, and mode/action regressions.

## Scope

- Extract or isolate a shared session-step display contract for `Edit`, `Rearrange`, and `View`.
- Create adapters from manual pool builder data and AI generated draft data into the shared display model.
- Keep manual builder as the reference surface unless the owner approves a new reference.
- Move route-specific copy and special cases into typed adapter inputs instead of route-local duplicated markup.
- Define a controlled rationale surface for generated coaching prose before showing it in step cards; keep rearrange mode focused on ordering.
- Preserve linked rest and repeat-rest summaries across manual and generated sessions.
- Update tests and screenshots to prove after/reference parity.

## Out Of Scope

- Calendar, program planner, Garmin import, and post-session feedback.
- Database schema or workout draft schema changes.
- New design system package or dependency.
- Full app-wide component audit outside session-step surfaces.
- Changing public SEO, commerce, finance, or incident workflows.

## Acceptance Criteria

1. Manual builder and AI generated draft steps share the same display/view-model contract for mode tabs, labels, rails, summaries, rest display, and secondary notes.
2. `Rearrange` mode never shows bulky coaching prose unless needed to identify a block.
3. `View` mode embeds linked rests like the manual builder and only shows coach notes if a controlled rationale contract exists.
4. The architecture docs identify the reference surface and the allowed exception process.
5. New session-step surfaces must be able to consume the shared contract rather than starting with copied route-local cards.
6. Targeted unit/component tests cover manual and generated adapters.
7. Screenshot handoff includes `after/reference` desktop and mobile artifacts.

## Validation

- `npm run lint:briefs`
- targeted unit/component tests for session-step adapters and `WorkoutEditor`
- targeted Playwright screenshot handoff for manual reference vs generated session
- `npm run typecheck`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Help/Guide And Operator Training Impact

- Help/Guide content: `N/A` unless the implementation changes visible user labels or workflow actions beyond parity alignment.
- Operator training: architecture docs and this brief are the primary training artifacts.

## Rollback Plan

- Revert the refactor PR to restore the prior `WorkoutEditor` rendering implementation.
- No data migration, schema repair, cache purge, finance action, or customer communication should be required.

## Checkpoint Log

- `2026-05-01 | planned | created from the AI swim session V1 screenshot-review findings: generated session UI should reuse the manual pool builder's session-step contract systemically instead of drifting through route-local visual copies | next: execute after the V1 generator screenshot-gated slice is approved or split if the V1 PR needs to stay smaller`
