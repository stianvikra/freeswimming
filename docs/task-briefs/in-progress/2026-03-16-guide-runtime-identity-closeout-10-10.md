# Task Brief: Guide Runtime Identity Closeout (10/10)

## Metadata

- `id`: `2026-03-16-guide-runtime-identity-closeout-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-16`
- `updated`: `2026-03-16`

## Goal

Finish the live identity closeout for guide sessions and poolside drills so runtime IDs are explicit, write-once, and no longer silently derived from slug fallback during normal operation.

## Why This Brief Exists

- Course runtime-identity work is merged, but guide sessions/drills still rely on slug fallback in published-content and note-context paths.
- Admin can still create guide rows without explicit `sessionId` / `drillId`, which makes slug an accidental identity source.
- Guide progress should normalize to canonical section IDs so legacy/lowercase payloads do not split history.
- Products and future workout/program entities are not the same live migration problem and should stay out of this closeout slice.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - `admin_content_items.id` remains the relational key,
  - `admin_content_items.body.sessionId` is the canonical runtime ID for `guide_session`,
  - `admin_content_items.body.drillId` is the canonical runtime ID for `guide_drill`,
  - `guide_progress.guide_slug + section_id` remains the persisted user-progress key, but `section_id` must be canonicalized before writeback,
  - guide note-context refs remain normalized lower-case runtime refs derived from canonical IDs.
- Local-only:
  - tracker in-memory state,
  - tracker localStorage cache before sync,
  - transient admin form state.
- Sync policy:
  - guide runtime IDs are write-once in normal editorial flows,
  - slug/title edits must not mutate guide runtime IDs,
  - guide progress reads/writes canonicalize known guide section IDs before merge/upsert,
  - legacy slug inference is compatibility-only and must emit operator-visible logs when used.
- Retention and sensitivity:
  - fallback/unresolved logs must avoid PII and raw auth/session data,
  - no new user data tables are introduced in this slice.
- Cache/invalidation:
  - invalidate admin content reads, guide pages, note catalogs, and guide progress reads after guide identity writes.

## Scope

- Make `guide_session.body.sessionId` and `guide_drill.body.drillId` explicit on create when omitted.
- Preserve guide runtime IDs as immutable on PATCH in normal admin content editing.
- Replace slug fallback as the primary guide identity source in published-content and note-context readers.
- Canonicalize guide progress `sectionId` values for known live guides before merge/upsert.
- Add lightweight observability for legacy slug-fallback hits and unresolved guide IDs.
- Update Help/Guide copy so operators understand guide slug vs runtime ID and rename vs repurpose policy.

## Out Of Scope

- Course runtime-ID work already merged on `main`.
- Product slug migrations or aliasing.
- Workout/program-builder identity migrations.
- Broad guide copy rewrites unrelated to identity safety.
- Manual production DB edits outside deterministic code paths and tests.

## Identity And Rename Contract

- `title` is editorial and may change.
- `slug` is human-readable and may be renamed carefully.
- `sessionId` / `drillId` are internal runtime IDs and must not change after creation.
- `rename in place` is allowed only when the guide item is still the same underlying learning object.
- `repurpose` is not allowed in place; materially different content should use a new guide row with a new runtime ID.
- Legacy slug-derived runtime lookup is compatibility-only and should trend to zero.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                  | Evidence                                |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Product goals and IA                          | `target`     | Guide identity rules are explicit so editors do not need to infer runtime behavior from slugs.    | brief contract + Help/Guide update      |
| UX flow clarity                               | `target`     | Guide create/edit flows do not hide runtime-ID side effects or ambiguous rename behavior.         | admin/manual QA + Help assertions       |
| Visual design quality                         | `supporting` | N/A                                                                                               | existing admin patterns preserved       |
| Business logic correctness and data integrity | `target`     | Known guide IDs resolve canonically and no new guide rows ship without explicit runtime IDs.      | unit tests + route tests + invariants   |
| Admin editor ergonomics                       | `target`     | Editors do not need to hand-manage guide runtime IDs during routine create/edit flows.            | admin UX review + Help/Guide text       |
| Accessibility (a11y)                          | `supporting` | N/A                                                                                               | changed help/admin UI remains semantic  |
| Performance (CWV + payloads)                  | `supporting` | N/A                                                                                               | verify outputs                          |
| Data placement and sync boundaries            | `target`     | Guide runtime-ID ownership and guide-progress canonicalization rules are explicit and enforced.   | brief contract + integration/unit tests |
| Caching and invalidation strategy             | `supporting` | N/A for this low-scope identity slice; no new cache layer introduced.                             | route behavior review                   |
| Reliability and failure handling              | `target`     | Legacy fallback and unresolved guide IDs are logged without causing silent wrong-item resolution. | tests + structured log coverage         |
| Security and authz                            | `target`     | Guide identity writes remain admin/editor gated and fail closed on malformed payloads.            | API tests                               |
| Privacy and compliance                        | `supporting` | N/A                                                                                               | log-review checklist                    |
| Content governance                            | `target`     | Guide items keep stable identities across title/slug updates and repurpose is explicitly blocked. | Help/Guide + runtime guards             |
| Admin workflow and editability                | `target`     | Admin content workflows still create, edit, publish, and note-link guide content safely.          | route tests + admin QA                  |
| SEO and crawlability                          | `supporting` | N/A                                                                                               | guide URLs unchanged                    |
| AI discoverability                            | `supporting` | `N/A` because guide identity stabilization does not change AI/LLM crawl surfaces or AI metadata.  | scope rationale                         |
| Analytics and KPI observability               | `target`     | Legacy slug-fallback hits and unresolved guide IDs are visible in logs for operational follow-up. | log assertions + operator notes         |
| Commerce and revenue ops                      | `supporting` | `N/A` because guide runtime-ID changes do not alter checkout, entitlements, or product pricing.   | scope rationale                         |
| Stack-fit and dependency discipline           | `target`     | No new dependencies; identity logic stays in existing admin/guide layers.                         | diff review                             |
| Scalability and cost efficiency               | `supporting` | `N/A` because this slice adds only lightweight normalization/logging with no new persistent jobs. | scope rationale                         |
| Testing and QA automation                     | `target`     | Targeted unit/route coverage proves canonicalization, immutability, and fallback behavior.        | vitest + verify evidence                |
| DevOps and rollback readiness                 | `target`     | Slice is reversible by code revert; decommission criteria for slug fallback are documented.       | brief/runbook note + PR summary         |
| Incident response and support operations      | `supporting` | `N/A` for new operational surface; existing admin/content support flow is reused for guide rows.  | scope rationale                         |
| Finance and reporting operations              | `supporting` | `N/A` because guide identity changes do not affect finance or payout/reporting data paths.        | scope rationale                         |
| i18n operational readiness                    | `supporting` | `N/A` because this slice does not change locale routing, translation workflow, or locale IDs.     | scope rationale                         |

## Acceptance Criteria

1. Creating a `guide_session` without explicit `body.sessionId` stores a deterministic runtime ID in `body.sessionId`.
2. Creating a `guide_drill` without explicit `body.drillId` stores a deterministic runtime ID in `body.drillId`.
3. Normal PATCH flows reject guide runtime-ID rewrites and preserve existing IDs when body patches omit them.
4. Published guide-content mapping uses body runtime IDs first and only uses slug inference as a logged compatibility fallback.
5. Guide progress normalization canonicalizes known live guide section IDs before merge/upsert.
6. Note-context catalog uses canonical guide runtime refs and does not treat slug as the preferred identity.
7. Help/Guide explains guide slug vs runtime ID and rename vs repurpose behavior.
8. Target categories reach at least `4/5` for release; if claiming `10/10`, critical target categories must reach `5/5`.

## Validation

- `npm run lint:briefs -- docs/task-briefs/in-progress/2026-03-16-guide-runtime-identity-closeout-10-10.md`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for guide runtime-ID resolution, progress canonicalization, and admin immutability
- targeted route tests for guide content create defaults
- targeted admin/help tests if Help/Guide assertions change
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Constraints

- No destructive DB migration is needed for this slice; prefer compatibility-safe guards and canonicalization.
- Do not widen scope to products or future workout/program entities in this PR.
- Avoid new dependencies.
- If guide rows with unresolved runtime identity are discovered, log and preserve safety rather than guessing a wrong canonical ref.

## Help/Guide And Operator Training Contract

- Required in the same PR:
  - explain that guide session/drill runtime IDs are locked after creation,
  - explain that slug is not the canonical guide runtime identity,
  - reiterate `rename` vs `repurpose` for guide items.

## Observability and KPI Contract

- Required logs/events:
  - legacy guide slug-fallback hits,
  - unresolved guide runtime-ID rows,
  - guide-progress canonicalization fallback hits when known legacy identifiers are rewritten.
- Success thresholds:
  - zero new guide rows created without explicit canonical runtime IDs in body,
  - zero silent wrong-item resolution on covered guide paths,
  - fallback-hit logs can be audited and trended down toward decommission.

## Risks And Mitigations

- Risk: manual guide rows without body IDs continue to leak slug-derived identity.
  - Mitigation: create-time runtime-ID assignment + route tests.
- Risk: guide progress splits when clients send lowercase or legacy section IDs.
  - Mitigation: canonicalize section IDs before merge/upsert and test merge behavior.
- Risk: operator confusion about renaming guide rows.
  - Mitigation: Help/Guide warning and immutable runtime-ID guard.
- Risk: unresolved legacy guide rows silently map to the wrong item.
  - Mitigation: structured warning + safe fallback policy, with tests.

## Checkpoint Log

- `2026-03-16 | in-progress | opened dedicated guide closeout brief after course runtime-ID work merged and remaining live gap was isolated to guide_session/guide_drill slug fallback + guide-progress canonicalization; explicit scope decision: keep products and future workout/program entities out of this slice | next: implement explicit guide runtime-ID create/patch guards and replace guide slug fallback as primary identity source`
- `2026-03-16 | in-progress | implemented guide runtime-ID closeout on admin create/patch, published guide mapping, note-context catalog, note-context canonicalization, guide-progress canonicalization, and Help/Guide copy; targeted vitest, targeted eslint, npm run typecheck, npm run test:e2e:admin:short (5 passed, 1 skipped), and targeted admin-help-center Playwright all passed | next: commit slice and rerun npm run verify:pre-pr on branch HEAD so generated PR-body lint uses the actual branch diff instead of the fallback previous-commit diff`
- `2026-03-16 | in-progress | hardened install-prompt e2e done-gate helper to use the stable course mark-done test id/checklist contract after a verify-only timeout in unrelated Playwright coverage; reran targeted failing case (1 passed) and full npm run verify:pre-pr passed with lint/typecheck/unit/build/perf/e2e green (81 passed, 207 skipped) | next: commit branch head, push, and open PR; perf trend recommended tighten, decision: hold for this non-perf guide identity closeout slice`
