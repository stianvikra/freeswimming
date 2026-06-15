# Task Brief: Course Lesson Design Readability And Completion (10/10)

## Metadata

- `id`: `2026-06-15-course-lesson-design-readability-and-completion-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-15`
- `updated`: `2026-06-15`
- `execution_mode`: `implementation authorized by owner on 2026-06-15`
- `parent_intake`: `docs/task-briefs/planned/2026-06-15-admin-notes-june-15-disposition-intake-10-10.md`
- `source`: live admin-note audit from `2026-06-15`

## Brief Audit Record

- `last_audited`: `2026-06-15`
- `base`: clean synced `main@43cd34ce`
- `audit_status`: `ready`
- `decision`: Use this as the first implementation child from the June 15 admin-notes intake, scoped to public course lesson design/readability/completion, one admin edit-entry decision, and an explicit lesson-container choice for all lessons. Use the existing `lessonExperience.variant` / display flags instead of introducing a separate "mark this as intro" model. Do not finalize intro lesson content without owner approval after the proposal is reviewed.
- `reason`: The source notes cluster around the public lesson page feeling visually flat, hard to scan on desktop, unclear around pass criteria / mark-done, missing an obvious admin edit entry, and needing a clearer intro-lesson container policy. Recent PRs `#1126/#1135` already improved course lesson structure, so this child must audit current behavior first and make only the remaining targeted fixes.
- `must_refresh_before_execution_if`: Refresh if `AGENTS.md`, scorecard categories, `/course`, `app/course/page.tsx`, `lib/course/lesson-experience.ts`, `components/admin/AdminContentManager.tsx`, `components/admin/AdminHelpCenter.tsx`, course progress/done tests, screenshot handoff rules, route/label/support sweep rules, or verification lanes change before implementation starts.

## Goal

Make the public course lesson page easier to read, more visually intentional, and clearer about pass criteria / mark-done status, while preserving current lesson data contracts and deferring unresolved content/product decisions.

## Pre-Implementation Owner Explanation

Vi tar forst leksjonssiden som brukeren ser: bedre lesbarhet, mindre rot, tydeligere progresjon, bedre visuell rytme og tryggere "mark done" opplevelse. I tillegg lager vi et konkret forslag til hvilke containere en introduksjonsleksjon bor ha sammenlignet med en vanlig ovelsesleksjon. Dette betyr noe fordi intro-siden skal forklare systemet uten a tvinges inn i drill-layout. Utenfor scope er endelig intro-innhold uten din godkjenning, kamera/split-screen, PRO/prising, admin-dashboard cleanup, mediaopplasting og ny kursmodell.

Fremoverkompatibilitet: forbedringen skal gjelde via de delte course-renderer- og view-model-kontraktene, ikke bare dagens to eksempel-leksjoner. Nye leksjoner skal arve layouten automatisk nar de bruker de samme feltene; nye section-typer, salgsbudskap eller innholdsvalg krever eksplisitt mapping.

## Source Note Disposition

These source notes are moved from live admin notes into this child. After this brief exists, mark these source notes `done` / `completed` in admin notes so live admin notes do not duplicate repo backlog state.

| Note ID                                | Context                                                 | Disposition                                                                                                         |
| -------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `b0384cda-7701-4a3c-9fe9-e25cab0aef95` | `course_lesson: breathing-and-floating--floating-back`  | Whole-page design/readability audit and targeted 10/10 polish.                                                      |
| `6b41357d-ec48-41c8-9eef-b2f316e74687` | same lesson                                             | Improve flat/boring container treatment and contact/action energy without adding marketing clutter.                 |
| `74050c35-38c6-49da-9ee7-d041d7bfa97d` | same lesson                                             | Reduce overly grey section feel and improve readability/contrast.                                                   |
| `acbb6c1d-1441-40c4-ac50-8a6a051010ec` | same lesson                                             | Make points/bullets/criteria visually useful instead of dull decoration.                                            |
| `2e2241ee-abf8-4601-975a-a427933f3b83` | same lesson                                             | Repair mark-done/pass-criteria copy and visual hierarchy inside the completion container.                           |
| `93c05556-e17b-4d99-81da-660e14e7e670` | same lesson                                             | Use available desktop width better for headings/subheadings.                                                        |
| `70cfe188-f566-4ec8-a543-efabd11b6039` | same lesson                                             | Re-audit desktop lesson layout, total progress/menu separation, outline placement, and optional collapse need.      |
| `8b624ef8-7778-417e-bf0d-2f4d96b97fd0` | same lesson                                             | Add or improve a 10/10 admin edit entry on lesson pages for admin users only.                                       |
| `f463a29b-a798-48e1-bb94-6e4186974742` | `course_lesson: intro-course--welcome-course-structure` | Verify and fix duplicate done button / done-band behavior if still present.                                         |
| `488f7290-a4e0-4440-bbff-58382b6c1e3b` | same lesson                                             | Audit focus pill purpose, numbering, and label/value treatment.                                                     |
| `042757a0-2de3-4a04-baf4-c4bb9dcc8254` | same lesson                                             | Improve pill/number visual treatment only; defer PRO/trial/sales wording.                                           |
| `9aa31814-ce91-4c97-a548-4d2fa3ebf6c1` | same lesson                                             | Include an intro-lesson container audit/proposal; owner reviews intro lessons before final content selection ships. |
| `8593d718-31a8-4e1e-a44d-d5034915e017` | same lesson                                             | Improve lesson info under video, goal/quick-explanation width, and weak focus labeling.                             |
| `49043378-ca6f-49be-8451-00dcd52bd788` | same lesson                                             | Make mark-as-done disabled/enabled/done states deterministic and visually primary only when appropriate.            |

Explicitly deferred from this child:

- `1559b908-dd4c-41c7-83b2-366879ed9ca0` and `d20cb2a1-2626-454a-ac9b-cf2f9c529881` / split-screen training: future product feature, not visual cleanup.
- PRO/trial/commercial wording from `042757a0...`: pricing/conversion decision, not included here.

## Scope

- Public `/course` lesson page shared renderer and view-model behavior needed to address:
  - whole-page visual/readability audit,
  - desktop line length and section rhythm,
  - section contrast so the page does not read as one flat grey stack,
  - points/bullets/pass-criteria presentation,
  - lesson info under video,
  - focus/pill label clarity,
  - total progress versus course outline/menu readability,
  - mark-done/pass-criteria copy, enabled/disabled/done states, and visual priority,
  - duplicate done button/band regression if still present,
  - admin edit entry for admin/editor users on lesson pages.
- Lesson container choice / introduction audit:
  - make the existing all-lesson `lessonExperience.variant` choice easier to understand and use,
  - compare current `concept` defaults against a normal practice lesson,
  - propose that introduction-style lessons use `Concept` unless manual `Custom` display choices are needed,
  - produce owner-reviewable recommendations before final intro content changes ship,
  - reuse existing `lessonExperience.variant = concept` and display flags; do not introduce a separate intro marker.
- Representative QA fixtures:
  - `breathing-and-floating--floating-back`,
  - `intro-course--welcome-course-structure`.
- Admin-only entry behavior:
  - use existing admin/preview/edit contracts where possible,
  - hidden from non-admin users,
  - no public admin data leak.
- Help/Guide or runbook updates if labels, workflow actions, admin edit entry, or recovery behavior changes.
- Screenshot handoff before any pre-PR gate because this is visible UI work.

## Out Of Scope

- Final introduction lesson content selection without owner review after the audit/proposal.
- Split-screen camera/video comparison.
- New PRO trial, pricing, checkout, Stripe, entitlement, or commercial CTA policy.
- Admin dashboard/editor cleanup outside the course lesson page.
- Media upload, media picker, new asset storage, generated images, or media library.
- New database schema, RLS, migrations, generated DB types, or new provider integrations.
- Canonical course route migration, sitemap, structured data, SEO rewrite, or public distribution funnel.
- Rewriting all course content.
- Merging or closing PRs; implementation requires explicit owner execution instruction.

## Product Decisions Already Made

| Decision                                    | Outcome                                                                                                                                                                                |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First child from the intake                 | Course lesson design/readability/completion.                                                                                                                                           |
| `Select Lesson Content`                     | Use one explicit lesson-container choice available on all lessons through existing `Lesson experience layout` + display flags; final intro content selection still needs owner review. |
| Separate "intro lesson" marker              | Do not add a separate marker; use `Concept` layout for introduction-style lessons and `Custom` when the section mix needs manual override.                                             |
| Split-screen training                       | Deferred as future product feature.                                                                                                                                                    |
| PRO/trial/sales wording inside lesson pills | Deferred until commercial decision.                                                                                                                                                    |
| Admin dashboard/editor cleanup              | Separate later child.                                                                                                                                                                  |

## Course Outline 10/10 Menu Contract

For the desktop course outline to be treated as `10/10`, it must behave like a calm curriculum map rather than a competing content card:

- Progress header is explicit: total completed count, percentage, and current module context.
- Only the active module is expanded by default; inactive modules are compact but expandable.
- Active lesson is a selected row with a single brand-blue indicator, not a floating white card/input-like control.
- Completed lessons use an icon-first status with accessible text; visible repeated green `Done` labels are avoided.
- Lesson rows use fixed columns for status, title, and duration so long titles do not shift the layout.
- Module counts are compact (`2/3`) and visible without forcing lesson lists open.
- The rail has a subtle navigation surface and left boundary, visually separate from lesson content without a heavy dark panel.
- Keyboard/focus and screen-reader semantics remain intact through buttons, `aria-expanded`, `aria-current`, and status labels.
- The design scales to 26+ lessons without making the right rail a long flat list on first load.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Security and authz`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                             | Evidence                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Public lesson hierarchy clearly separates course position, lesson content, completion, and next action; intro lessons get a container proposal distinct from practice lessons. | screenshots + owner review + route sweep                | `5/5`                   |
| UX flow clarity                               | `target`     | Learners can understand what to read, what to do next, and when mark-done is available with no duplicate done controls or dead-end completion states.                          | targeted e2e/component tests + screenshots              | `5/5`                   |
| Visual design quality                         | `target`     | Changed lesson sections use stronger hierarchy, readable line length, intentional contrast, stable dimensions, and no overlapping/clipped text on mobile/desktop.              | screenshot handoff                                      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Runtime IDs, lesson progress, pass criteria state, admin edit visibility, and existing course data contracts remain deterministic.                                             | unit/e2e tests + code review                            | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: the child may add an admin edit entry, but broad admin editor cleanup is a separate child.                                                                    | scoped admin-entry QA + explicit no-broad-admin diff    | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Mark-done controls, pass criteria, outline/menu, pills, admin edit entry, and responsive lesson sections remain keyboard and screen-reader safe.                               | Testing Library/Playwright assertions                   | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new heavy dependency, autoplay, iframe, provider, or large client-only feature; `/course` stays within current route budget intent.                                         | package diff + build/perf gate                          | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Course progress remains existing local/server contract; admin edit visibility is session/auth-derived; no new persisted data source is introduced.                             | data contract review + tests                            | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: public/published course cache behavior should remain unchanged unless an implementation change explicitly documents it.                                       | route/cache diff review                                 | `4/5`                   |
| Reliability and failure handling              | `target`     | Missing content, anonymous users, non-admin users, incomplete pass criteria, done state, and narrow viewports render predictable fallback states.                              | negative/edge-case tests + screenshots                  | `5/5`                   |
| Security and authz                            | `target`     | Any admin edit entry is hidden or disabled for non-admins and uses existing protected admin routes; no admin-only data reaches public users.                                   | authz tests + route review                              | `5/5`                   |
| Privacy and compliance                        | `target`     | No user notes, personal data, raw admin note bodies, tokens, private storage paths, or sensitive analytics payloads are exposed.                                               | no-secret/privacy diff review                           | `5/5`                   |
| Content governance                            | `target`     | Public labels and deferred content/product decisions are explicit; Help/Guide is updated if workflow labels or recovery actions change.                                        | Help/Guide assertions + brief decisions                 | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: admin edit entry improves access, but full admin dashboard/editor workflow cleanup remains separate.                                                          | admin-entry QA + deferral evidence                      | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: visual/semantic lesson structure should not regress metadata/canonicals; no SEO route work ships here.                                                        | metadata no-change review                               | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: clearer public section semantics help readability, but structured data and AI-facing route strategy remain deferred.                                          | rendered markup review                                  | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Existing course analytics/progress identifiers should keep working; no new event taxonomy is required unless mark-done behavior changes.                                       | analytics no-change review or targeted event regression | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: PRO/pricing/trial wording is deferred and no checkout, entitlement, catalog, or revenue behavior changes.                                                     | deferred decision evidence                              | `4/5`                   |
| Incident response and support operations      | `target`     | If completion/admin edit recovery behavior changes, Help/Guide/runbook surfaces include support-safe recovery steps in the same PR.                                            | Help/Guide/support sweep                                | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child changes no prices, checkout, subscriptions, refunds, invoices, payouts, entitlements, finance reports, or reconciliation truth.                         | explicit finance scope rationale                        | `N/A`                   |
| i18n operational readiness                    | `supporting` | Lesson labels and states should remain short, section-based, and layout-safe for later locale expansion; no translation workflow ships here.                                   | responsive screenshot + copy review                     | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js route, TypeScript course contracts, Tailwind tokens, admin/auth helpers, and tests; add no dependency by default.                                       | dependency diff + code review                           | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted unit/e2e/component coverage for changed course UI/progress/admin-entry behavior, plus screenshot handoff and pre-PR gates in implementation.                      | local validation + CI                                   | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Fixes apply through shared course renderer/view-models for future lessons, not one-off hardcoding to today's note contexts.                                                    | future/representative fixture tests                     | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration/provider dependency by default; rollback is code revert plus source notes remain traceable through this brief.                                                    | rollback note + verify gates                            | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `app/course/page.tsx` and existing course section rendering.
  - Do not create a parallel lesson page or route-local one-off layout for only two lesson IDs.
  - Preserve mobile drawer behavior unless current evidence proves it is part of the bug.
- TypeScript/domain contracts:
  - Reuse `CourseLesson`, pass criteria, progress, and `lessonExperience` view-model contracts.
  - Unknown or absent optional fields render fallback/absent states, not broken placeholder copy.
- Supabase/data layer:
  - No schema or RLS work is authorized.
  - Course content remains server-canonical through existing admin content/publish flow.
- Admin/auth:
  - Admin edit entry must rely on existing admin session/role patterns and fail closed.
  - Non-admin public users must not fetch protected admin data just to render a lesson.
- UI/reference surface:
  - Reference surfaces are the current course lesson renderer, recent real-content course polish PR, and existing admin preview/edit contracts.
  - Intro proposal should use the existing `concept` variant before inventing new renderer concepts.
  - Cards should not nest inside cards unnecessarily; use full-width bands or unframed layouts where that fits the existing course surface.
- Testing:
  - Targeted unit/component tests for pass criteria / mark-done and rendering contracts.
  - Playwright coverage for representative desktop and mobile lesson states.
  - Screenshot handoff for before/after or after/reference comparison.

## Data Placement And Sync Contract

- Server-canonical:
  - Course lesson content, module order, runtime IDs, pass criteria definitions, and published lesson data.
  - Signed-in progress where existing sync already owns it.
- Local-only:
  - Anonymous progress, drawer/outline UI state, transient completion feedback, and screenshot artifacts.
- Sync policy:
  - Do not change progress sync semantics unless a bug is proven in the mark-done flow.
  - If mark-done behavior changes, tests must cover anonymous and signed-in expectations or document unchanged paths.
- Retention and sensitivity:
  - Public lesson content remains public educational content.
  - Admin edit affordances must not reveal private admin-note text or protected mutation details.
- Cache/invalidation:
  - Public course published content cache behavior stays unchanged unless explicitly documented in implementation.

## Identity And Rename Contract

- Canonical stable ID:
  - Course lesson runtime ID remains the source of truth for progress, notes, analytics, QR, admin preview, and future route mapping.
- Human-readable identifiers:
  - Titles, slugs, labels, focus/pill text, and public copy are editable display fields.
- Mutability rules:
  - Do not rename or repurpose runtime IDs.
  - Slug/title/copy may change when the learning object remains the same.
- Rename vs repurpose:
  - Visual/copy polish happens in place.
  - A materially different lesson or skill promise requires a new lesson/entity.
- Compatibility:
  - Existing context refs from source notes remain traceable through this brief even after notes are marked done.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Course lesson sections, pass criteria states, completion labels/actions, admin edit entry, course outline/menu, lesson pills, future locales, and future product/commercial CTAs.
- Source of truth:
  - Shared course renderer/view-model and existing content contracts, not the current source-note titles.
- Additive behavior:
  - New lessons using existing fields inherit readability/layout/completion improvements.
  - New pass criteria rows should render through the same completion UI.
  - New admin users/editors should see the same role-gated edit affordance.
- Explicit mapping requirements:
  - New section types beyond the existing `concept` display flags, final intro-content selection, camera/split-screen, PRO/trial copy, SEO/structured data, and analytics event taxonomy require separate mapping and tests.
- Unknown or deprecated values:
  - Unknown optional fields render absent/fallback.
  - Unknown roles fail closed and do not expose edit entry.
  - Deprecated labels should remain searchable in tests/docs until migration is closed.
- Test/evidence:
  - Include representative fixtures for both selected lesson contexts or equivalent stable data.
  - Include at least one non-admin/no-admin-entry assertion if admin edit entry changes.

## Help / Guide Impact

Required if implementation changes labels, admin edit entry, mark-done recovery behavior, or support instructions:

- Update Admin Help/Guide for admin edit entry and lesson completion recovery if relevant.
- Update course-related assertions if public labels/actions change.
- If only visual treatment changes and workflow labels stay unchanged, record explicit no-impact rationale.

## Screenshot Handoff Requirement

Required before `npm run verify:pre-pr`:

- Artifact folder pattern: `output/course-lesson-design-readability-completion-YYYY-MM-DD-HHMMSS`.
- Include `before/after` screenshots when practical; otherwise use `after/reference`.
- Minimum representative screenshots:
  - desktop lesson page for `breathing-and-floating--floating-back`,
  - mobile lesson page for the same or equivalent lesson,
  - desktop intro lesson state for duplicate-done/pill/mark-done checks,
  - admin edit-entry state if added or changed.
- Handoff must include known visual caveats and confirm whether product-rendering files changed after capture.

## Route / Label / Support-Surface Sweep

Required before the first broad gate if implementation changes routes, labels, actions, Help/Guide, admin edit entry, mark-done behavior, or recovery copy.

Minimum search surfaces:

- `app/`
- `components/`
- `lib/`
- `tests/`
- `docs/`
- active/planned/done course lesson briefs
- Admin Help/Guide assertions

Minimum identifiers:

- `Mark as done`
- `Done`
- `Pass criteria`
- `course-mark-done-button`
- `course-pass-criteria-mark-done-button`
- `Course outline`
- `Total progress`
- `Lesson`
- `Focus`
- `Admin Edit`
- `View changes`
- `intro-course--welcome-course-structure`
- `breathing-and-floating--floating-back`

Implementation evidence:

- Surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, active/planned/done task briefs, and Admin Help/Guide assertions.
- Identifiers searched: `Mark as done`, `Done`, `Pass criteria`, `course-mark-done-button`, `course-pass-criteria-mark-done-button`, `Course outline`, `Total progress`, `Lesson`, `Focus`, `Admin Edit`, `View changes`, `intro-course--welcome-course-structure`, and `breathing-and-floating--floating-back`.
- Fallout handled: public course lesson labels/tests and Admin Help/Guide copy were updated in the same branch; no route migration or support-surface rename was introduced.

## Screenshot Approval Evidence

- Screenshot artifact handoff completed with `output/course-lesson-design-readability-completion-2026-06-15-150911`.
- Owner screenshot approval: owner approved the visual handoff in chat on `2026-06-15` with `godkjent`.
- Screenshot approval stop observed: `npm run verify:pre-pr`, commit, push, and PR work were paused until that owner approval arrived.

## Acceptance Criteria

1. Source notes listed in this child are captured and marked done in admin notes.
2. Current `/course` state is audited against the source notes before code changes.
3. Public lesson readability improves without hardcoding to only the source lesson IDs.
4. Mark-done/pass-criteria states are clear, deterministic, and tested.
5. Duplicate done controls are absent or intentionally explained by separate roles/states.
6. Focus/pill/number treatments are visually useful and do not compete with lesson content.
7. Any admin edit entry is role-gated, non-disruptive, and tested for non-admin safety.
8. Lesson container recommendations are documented and reviewed, using the existing all-lesson `lessonExperience.variant` choice and display flags unless the audit proves a gap.
9. Deferred decisions remain deferred and are not implemented accidentally.
10. Screenshot handoff is completed and owner-approved before `npm run verify:pre-pr`.

## Validation

Planning-only validation:

- `npm run lint:briefs`

Implementation validation, after explicit owner execution instruction:

- Targeted unit/component tests for changed course contracts.
- Targeted Playwright for representative lesson states.
- Screenshot handoff and owner visual approval.
- `npm run verify:pre-pr` before PR update.
- CI green and `npm run verify:pre-merge` before merge readiness.

## Checkpoint Log

- `2026-06-15 | main@43cd34ce | Selected Course Lesson Design Readability And Completion as the first child from the admin-notes intake; included Select Lesson Content as an intro-container audit/proposal while keeping final intro content selection owner-reviewed; explicitly deferred split-screen training, PRO/trial wording, and admin dashboard cleanup | next: mark captured source notes done, run brief lint, then wait for owner execution instruction before implementation branch`
- `2026-06-15 | main@43cd34ce | Planning validation complete: npm run lint:briefs -- --all passed; live admin-note status cleanup verified all 36 intake source notes found and 0 remaining open; intro-container audit finding recorded that existing concept variant already hides land/water practice by default | next: wait for explicit execute/build/implement instruction before implementation branch`
- `2026-06-15 | main@43cd34ce | Owner confirmed the intro-container audit/proposal scope: include a recommendation for introduction-page containers versus lesson-page containers, but keep final intro content selection out of implementation until owner review | next: wait for explicit execute/build/implement instruction before implementation branch`
- `2026-06-15 | branch codex/course-lesson-design-readability-completion @ main@43cd34ce | Owner explicitly authorized implementation; moved child brief to in-progress | next: audit current renderer/tests against the source-note findings before code changes`
- `2026-06-15 | branch codex/course-lesson-design-readability-completion @ main@43cd34ce | Owner chose one explicit container/layout choice for all lessons instead of a separate intro marker; existing lessonExperience.variant/display contract is the implementation path | next: make the editor choice visible/clear and continue scoped renderer polish`
- `2026-06-15 | branch codex/course-lesson-design-readability-completion | Implemented scoped course lesson readability/completion polish; targeted unit, lint, typecheck, brief lint, e2e, route-label-support sweep, and git diff --check passed; screenshot artifacts captured at output/course-lesson-design-readability-completion-2026-06-15-133555 | next: wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-15 | branch codex/course-lesson-design-readability-completion | Owner visual corrections applied: desktop course navigation moved to the right, progress and lesson menu split into separate right-rail surfaces, active done mobile overview no longer shows duplicate Done labels, and screenshots regenerated at output/course-lesson-design-readability-completion-2026-06-15-140553; targeted lint and Playwright checks passed | next: wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-15 | branch codex/course-lesson-design-readability-completion | Owner label correction applied: right rail now uses Course outline instead of Lesson menu so it does not collide with the active Lesson content card; screenshots regenerated at output/course-lesson-design-readability-completion-2026-06-15-140940; lint passed | next: wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-15 | branch codex/course-lesson-design-readability-completion | Owner color-separation correction applied: desktop right rail is now a dark control surface so Progress/Course outline no longer share the same white card language as lesson content; screenshots regenerated at output/course-lesson-design-readability-completion-2026-06-15-141425; targeted lint and Playwright checks passed | next: wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-15 | branch codex/course-lesson-design-readability-completion | Owner rejected the dark right-rail direction as overdesigned; replaced it with a light navigation rail, subtle boundary, compact rows, brand-blue progress, and no competing dark panel; screenshots regenerated at output/course-lesson-design-readability-completion-2026-06-15-143724; targeted lint and Playwright checks passed | next: wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-15 | branch codex/course-lesson-design-readability-completion | Owner asked what exact 10/10 course menu requires and authorized implementation; added the Course Outline 10/10 Menu Contract, converted the desktop rail into a curriculum map with explicit progress/current-module header, active-module-only expansion by default, compact expandable inactive modules, checkmark completion state, fixed status/title/duration columns, and aria-expanded/aria-current/status semantics; screenshots regenerated at output/course-lesson-design-readability-completion-2026-06-15-150349; targeted UI Playwright, lint, typecheck, brief lint, and git diff --check passed; the combined progress-sync suite still shows a reproducible timing flake while the isolated sync test passes | next: wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-15 | branch codex/course-lesson-design-readability-completion | Fixed duration chip grid-stretch bug where long lesson titles made the 3m chip expand vertically; chip now uses fixed height, self-start alignment, and no wrapping; screenshots regenerated at output/course-lesson-design-readability-completion-2026-06-15-150911; targeted lint and UI Playwright checks passed | next: wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-15 | branch codex/course-lesson-design-readability-completion | Owner approved the screenshot handoff; first perf-budget gate exposed that the home route was counting automatic Link prefetch of the larger course route chunks after the course UI work, so `ActionButton` now disables automatic prefetch while preserving click navigation; focused rebuild and perf-budget rerun passed with home JS transfer at 279.4kb and course JS transfer at 316.4kb; perf trend recommended tighten after repeated green runs, decision is hold for this UI slice and carry tightening into a perf/maintenance-owned checkpoint | next: run full npm run verify:pre-pr`
- `2026-06-15 | branch codex/course-lesson-design-readability-completion | Full npm run verify:pre-pr passed in full-public lane (`artifacts/test-runs/20260615-152328`): quality gates, lint, typecheck, 1596 unit tests, production build, perf budgets, and Playwright 109 passed / 563 skipped; eslint still reports only pre-existing output artifact warnings | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge`
