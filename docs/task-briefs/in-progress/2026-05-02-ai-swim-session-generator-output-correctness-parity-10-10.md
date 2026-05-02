# Task Brief: AI Swim Session Generator Output Correctness And Parity (10/10)

## Metadata

- `id`: `2026-05-02-ai-swim-session-generator-output-correctness-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-02`
- `updated`: `2026-05-02`

## Goal

Make AI-generated swim-session drafts deterministically respect `Session Rules` from generation through save, reopen, and manual builder editing. The generator must prove pool size/unit handling, target size, selected strokes/equipment, drill/kick limits, stroke limits, and shared editor parity before the draft becomes a normal saved swim session.

## Why This Brief Exists

- The intake slice made `Session Rules` visible and trustworthy, but output correctness still depends on scattered generator and save-normalization behavior.
- Existing tests prove happy paths and some negative paths, but not the full contract from selected rules to generated draft to saved canonical workout.
- Manual builder is the mature reference surface; AI output must enter the same canonical `SessionDraft` and `WorkoutEditor` path without route-local exceptions.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                       | Evidence                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | AI session generation remains one-session V1 and hands into My Swim Sessions/manual builder with no competing AI-only workout model.                     | brief diff + route/component review      | `5/5`                   |
| UX flow clarity                               | `target`     | Impossible rule combinations fail with actionable messages; generated drafts still show normal save/edit/reopen actions.                                 | component/e2e tests                      | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: this is primarily contract hardening; any visible copy change must preserve current generator/editor layout.                            | screenshot review if UI layout changes   | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Generated output must satisfy deterministic invariants for target size tolerance, pool units, allowed strokes/equipment, drill/kick caps, stroke caps.   | domain/unit tests + route tests          | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes authenticated owner-facing generator/workout flows, not admin CRUD or publish workflows.                                        | explicit admin scope rationale           | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: no new custom interaction pattern is planned; changed errors/actions must keep existing semantics.                                      | component tests + code review            | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | No dependency added, no extra network waterfall, and no meaningful payload increase on `/my-library/generator` or `/my-library/workouts`.                | dependency diff + build/perf gate        | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Rules are request-scoped until generation; saved sessions remain server-canonical `workouts` rows; editor-local changes only persist on explicit save.   | data-contract tests + API review         | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: generator and workout APIs stay `no-store`; no route cache policy change.                                                               | route review                             | `4/5`                   |
| Reliability and failure handling              | `target`     | Invalid/overconstrained generation and save attempts return deterministic non-500 errors, with no partial save or corrupt draft.                         | negative unit/route tests                | `5/5`                   |
| Security and authz                            | `target`     | Protected generation/save/update routes continue to fail closed; new validation does not weaken owner-scoped workout writes.                             | existing + targeted negative route tests | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no expanded personal data in prompts/events/errors; rule validation must not log raw private context.                                   | payload/error review                     | `4/5`                   |
| Content governance                            | `target`     | Rule labels and errors use current product terms: Session Rules, Pool size, strokes, equipment, drill/kick max length, max per session.                  | copy assertions                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin status, publish, moderation, or support workflow is changed.                                                                        | explicit workflow scope rationale        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because private authenticated generator/workout routes change no public metadata, sitemap, robots, or crawlable content.                             | explicit SEO scope rationale             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this hardens private AI generation output, not public AI-discoverable pages or structured data.                                              | explicit AI-discovery scope rationale    | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing safe generation event remains; no raw rule details are added to analytics.                                                     | event payload review                     | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, subscription, or revenue workflow changes.                                                                | explicit commerce scope rationale        | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because no alerting, support queue, incident path, or operational runbook workflow changes in this user-flow hardening slice.                        | explicit support-ops scope rationale     | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, payout, refund, invoice, tax, reconciliation, or reporting data changes.                                                         | explicit finance scope rationale         | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: any new copy should stay concise and centralized enough for later localization; no locale routing or translation storage ships here.    | copy review                              | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `SessionDraft`, generator shared validation, workout persistence normalization, and shared `WorkoutEditor`; add no dependency or parallel adapter. | code review + dependency diff            | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused unit/domain/route/component/e2e coverage for rule invariants, yards, save-to-session roundtrip, and manual builder parity.                   | targeted tests + full gates              | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Rule validation remains deterministic and local to existing request/save paths with no provider call or background job expansion.                        | code review                              | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | One PR rollback restores previous generator/save behavior; no migration or data repair required.                                                         | PR diff + verify gates                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `SessionGeneratorPanel` and `WorkoutEditor`;
  - keep generation on `/api/my-library/generator/session-draft`;
  - keep save/update on `/api/my-library/workouts` and `/api/my-library/workouts/[workoutId]`;
  - preserve `no-store` API behavior.
- TypeScript/domain contracts:
  - use canonical `SessionDraft`, `SessionDraftStep`, and `SessionGeneratorInput`;
  - add deterministic generated-draft invariant helpers rather than ad hoc component checks;
  - errors must be stable and testable.
- Supabase/data layer:
  - no schema or RLS migration expected;
  - existing owner-scoped workout APIs remain the boundary;
  - negative authz tests stay in scope.
- UI system:
  - manual builder remains the reference surface through shared `WorkoutEditor` and session-step surface contract;
  - screenshot handoff is required only if this slice changes visible layout or step-surface presentation.
- Testing:
  - unit/domain tests for generation invariants;
  - route tests for protected API/failure paths;
  - component tests for save request shape and user-facing errors;
  - Playwright roundtrip for generated save and manual builder reopen.

## Data Placement And Sync Contract

- Server-canonical data:
  - accepted/saved swim sessions remain `workouts` rows with normalized `SessionDraft` fields.
- Request-scoped data:
  - generator Session Rules, skill overrides, selected strokes/equipment, and profile handoff are only used for the generation request until a draft is created.
- Local state:
  - unsaved generated draft edits live in `SessionGeneratorPanel`/`WorkoutEditor` state until explicit save.
- Sync policy:
  - generate creates a provisional draft;
  - save creates or updates the canonical workout;
  - reopen reads the saved canonical workout through existing workout routes.
- Retention and sensitivity:
  - no new storage;
  - no expanded analytics payload containing raw private rule text.
- Cache/invalidation:
  - generation and workout write APIs remain `Cache-Control: no-store`;
  - no route revalidation policy changes.

## Identity And Rename Contract

- Canonical stable ID:
  - saved workout IDs remain the stable identity for accepted sessions.
- Human-readable identifiers:
  - session titles and step names remain editable owner-facing labels.
- Mutability rules:
  - generated draft title and steps may be edited before and after save;
  - workout ID and step IDs are not repurposed by this slice.
- Rename vs repurpose policy:
  - editing title/steps updates the same workout;
  - materially new generated output should be created by generating/saving a new session, not silently repurposing an unrelated saved row.
- Compatibility contract:
  - existing saved sessions, manual drafts, poolside preview, PDF/export, and shared editor reads must continue using the same draft schema.
- Observability and repair:
  - validation errors are returned to the owner before save;
  - invalid stored rows continue to be skipped/reported by existing workout library guards.

## Scope

- Add generated-session output invariants for:
  - pool size + meter/yard handling,
  - target distance/duration tolerance,
  - selected strokes and selected equipment,
  - drill/kick max length and approx per session,
  - stroke max length and max per session,
  - generated draft save-to-session roundtrip,
  - manual builder/editor parity.
- Update generator construction when needed so generated steps satisfy those invariants.
- Update save/normalization paths only where needed to prevent generated AI drafts from bypassing the same correctness contract.
- Add targeted tests and run repo gates.

## Out Of Scope

- New AI provider, prompt, or streaming integration.
- Program/calendar/history generation.
- Garmin import/export expansion beyond preserving current readiness behavior.
- Database schema, migration, RLS, or generated DB type changes unless implementation proves an existing contract cannot be represented.
- Broad visual redesign of generator intake, profile, saved-session list, or manual builder.

## Acceptance Criteria

1. Generated pool drafts round pool size and distances in the selected unit while persisting canonical meters.
2. Distance-based generated drafts finish within one pool length of the requested target and never silently overshoot because drill/kick minimums crowd out main work.
3. Time-based generated drafts, including pool drafts, keep the requested duration as the target and produce deterministic duration totals.
4. Generated draft steps only use selected strokes unless the shared draft contract uses `choice` for non-stroke/rest semantics.
5. Generated equipment appears only when selected and is preserved through save/reopen.
6. Drill and kick generated blocks respect max length and approx-per-session limits.
7. Stroke max length and max-per-session limits shape generated work or fail before save when impossible.
8. Save-to-session and reopen in manual builder preserve canonical totals, pool unit, steps, allowed strokes, equipment, and shared editor parity.
9. Protected routes still fail closed for unauthenticated requests.
10. Targeted tests and `npm run verify:pre-pr` pass before PR update; `npm run verify:pre-merge` passes before merge readiness.

## Validation

- `npm run test:unit -- tests/unit/session-generator-server.test.ts tests/unit/session-generator-route.test.ts tests/unit/session-generator-panel.test.tsx tests/unit/workouts-server.test.ts tests/unit/workouts-shared.test.ts tests/unit/session-step-surface-contract.test.ts` - passed (`84` tests).
- `npm run typecheck` - passed.
- `npx playwright test tests/e2e/my-library-generator-intake.spec.ts --project=desktop-chromium` - passed (`2` tests; generator opens, generated draft saves and reopens in workout builder). Note: Next dev emitted one transient webpack TypeError log while assertions still passed; keep watching full gates/CI.

## Help/Guide And Operator Training Impact

- Help/Guide: `N/A` unless implementation changes visible workflow labels or recovery behavior beyond clearer validation errors.
- Operator training: this brief and targeted tests are the handoff artifact; no admin/operator runbook change expected.

## Rollback Plan

- Revert the PR to restore prior generator and save-normalization behavior.
- No migration rollback, cache purge, finance action, or customer communication should be required.

## Checkpoint Log

- `2026-05-02 | in-progress | created brief from owner-approved output-correctness/parity scope after audit identified generator/save invariant gaps | next: implement domain invariants and targeted coverage`
- `2026-05-02 | in-progress | implemented generated output invariants, pool target rebalance, drill/kick/stroke repeat shaping, route output fail-closed validation, yard persistence normalization, and targeted coverage | next: run brief lint and verify:pre-pr`
