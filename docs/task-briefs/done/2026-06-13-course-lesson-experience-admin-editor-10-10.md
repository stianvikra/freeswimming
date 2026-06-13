# Task Brief: Course Lesson Experience Admin Editor (10/10)

## Metadata

- `id`: `2026-06-13-course-lesson-experience-admin-editor-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-13`
- `updated`: `2026-06-13`

## Brief Audit Record

- `last_audited`: `2026-06-13`
- `base`: `main@8b65e4cd`
- `audit_status`: `ready`
- `decision`: Use an admin-only structured lesson-experience editor inside the existing Course Workspace / All Content lesson edit flow, with explicit `Save changes`, existing status transitions, and existing preview links. Do not add inline editing inside the public `/course` learner route in this slice.
- `reason`: The public V1 child is merged and proves the learner layout, data contract, fallback images, and linked mistake/correction rendering. Current admin editing still only exposes core lesson fields, while public `/course` already has a fast published/preview content split that should not absorb editor state, editor controls, or admin-only field prompts.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, parent brief, `/course`, `app/course/courseData.ts`, `lib/course/lesson-experience.ts`, `lib/admin/content-course.ts`, `components/admin/AdminContentManager.tsx`, admin content APIs, Supabase storage policy, screenshot handoff rules, scorecard categories, or verification lanes change.

## Parent

- [Course Lesson Experience 10/10 Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-13-course-lesson-experience-10-10-parent.md)
- [Course Lesson Experience V1 Pedagogical Layout And Fallback Data](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-06-13-course-lesson-experience-v1-pedagogical-layout-fallback-data-10-10.md)

## Goal

Make the new course lesson experience text and structure fields easy, safe, previewable, and rollback-safe for an admin to edit at scale without slowing or polluting the public `/course` learner surface.

## Pre-Implementation Owner Explanation

Admin skal kunne produsere og rette mange leksjoner uten å kode. Denne slicen bygger trygg redigering av forklaring, hvorfor øvelsen betyr noe, landøvelse, vannøvelse, feil/korrigeringer, følelsescues, neste steg og supporttekst. Bilder redigeres ikke her: eksisterende gyldige bildefelt bevares, og leksjoner uten bilde bruker dagens placeholder/fallback. Ute av scope er bildeopplasting/media library, å endre selve kursinnholdet bredt, bygge PRO-flyt, endre checkout, eller legge admin-only kode inn i public leksjonssiden.

### Refreshed 10/10 Owner Explanation

For at dette skal være 10/10 for admin, holder det ikke med bare flere tekstfelter. Admin må først kunne velge hvilken type leksjonsopplevelse dette er, for eksempel konsept/intro, landøvelse, vannøvelse eller swim-sett, og deretter slå av/på hver relevant innholdscontainer. En intro-leksjon skal ikke tvinges inn i samme land+vann-drill-layout som en svømmedrill. Denne refreshen legger derfor til layoutvalg og egne synlighetsvalg for quick explanation, why, land practice, water practice, feel cues, common mistakes, next step og support. Bilder er fortsatt ute av scope som redigerbare felt; eksisterende bilde-metadata bevares og manglende bilder får fallback bare når den aktuelle practice-containeren er aktiv.

## Decision Gate Before Implementation

Before coding this admin editor, the implementation run must evaluate successful editing patterns from relevant apps, CMS tools, and learning platforms, then recommend one model.

Evaluate at minimum:

- Inline editing directly in a lesson preview.
- Structured side-panel or form editing.
- Table/list editing for high-volume lesson work.
- Autosave versus explicit `Save` plus `Publish`.
- Draft/review/published preview behavior.
- Image placeholders/fallbacks now, with upload/library explicitly out of scope for this brief.
- Clear handling of new optional fields, including admin-only placeholder/badge copy such as `New field`.
- Coupled `common mistake + correction` editing.
- Bulk safety for a single admin editing many lessons.

Decision rule:

- Recommend the simplest model that lets one admin edit many lessons confidently.
- Inline editing may be selected only if public `/course` remains fast, cacheable, and free of admin-only code/data.
- If inline editing adds public-route risk, use an admin-only preview/editor surface instead.
- Record the selected model, rejected alternatives, and performance/security tradeoffs in this brief before implementation starts.

### Selected Model After `main@8b65e4cd` Re-Audit

Use the existing admin content pattern:

- Keep Course Workspace as the high-volume lesson list and module-scoped navigation surface.
- Extend the existing course lesson inline form in `AdminContentManager` with a structured `Lesson experience` section rather than a raw JSON editor.
- Use explicit `Save changes` plus existing draft/review/published transitions and preview links.
- Add a lesson-experience layout variant selector (`concept`, `dryland`, `water_drill`, `swim_set`, `custom`) so admin can choose the intended content model before editing details.
- Add separate lesson-experience container toggles for quick explanation, why-this-matters, land practice, water practice, feel cues, common mistakes/corrections, next step, and support.
- Represent `commonMistakes[]` as repeatable rows where one row owns `mistake` and optional `fix`.
- Keep practice images non-editable in this slice. The admin editor may show that missing public media renders as `Visual not added yet`, but it must not add upload, media-library, replace/remove, Supabase storage, bucket-policy, or cleanup behavior now. Existing valid `lessonExperience.*Practice.image` metadata remains pass-through.
- Show admin-only `New field` prompts or badges only inside the admin editor, never in public `/course` payloads or rendering.

Rejected alternatives:

- Public-route inline editing is rejected for this slice because it would couple editor controls, editor state, and admin-only prompts to the learner route. Existing `/api/course/content` already separates cached published content from no-store admin preview content, so the safer model is admin editing plus preview.
- Autosave is rejected because this workflow needs validation, revision clarity, rollback safety, and deliberate status transitions for a single admin editing many lessons.
- A new CMS dependency is rejected because existing admin content rows, revision/publish workflow, preview links, and Course Workspace already cover the needed ownership boundary.

External pattern check:

- Contentful-style live preview supports side-by-side edit/preview, live updates, and inspector mode, but advanced inline behavior adds SDK, security-header, and cookie/embedding considerations. This is useful inspiration for preview, not a reason to place editing code on `/course`.
- Sanity-style validation supports field-level and document-level rules, but studio/client validation is not enough by itself; API/server validation must enforce publish-blocking invariants.
- Moodle-style LMS editing separates teacher edit mode, course index navigation, bulk actions, visibility, and rollback from the student-facing view. This supports an admin-only edit mode with explicit actions for this repo.

## Scope

- Extend the admin course lesson editor for the `lessonExperience` contract:
  - `variant` (`concept`, `dryland`, `water_drill`, `swim_set`, `custom`)
  - `display.quickExplanation`
  - `display.whyThisMatters`
  - `display.landPractice`
  - `display.waterPractice`
  - `display.feelCues`
  - `display.commonMistakes`
  - `display.nextStep`
  - `display.support`
  - `quickExplanation`
  - `whyThisMatters` with admin label `Why this exercise matters`
  - `landPractice.title`
  - `landPractice.steps`
  - `waterPractice.title`
  - `waterPractice.steps`
  - `waterPractice.safetyNote`
  - linked `commonMistakes[]` rows with `mistake` and `fix`
  - `feelCues[]`
  - `nextStep`
  - `support.title`
  - `support.body`
- Preserve lesson-type differences:
  - concept/intro lessons can hide practice containers entirely,
  - dryland lessons can show land practice without water practice,
  - water drill lessons can show land + water practice,
  - swim-set lessons can show water practice without forcing land practice or mistake rows,
  - custom lessons can manually choose any supported container mix.
- Preserve inactive-container content safely:
  - turning a lesson-experience container off hides it publicly,
  - saved draft content inside inactive containers is preserved for later reuse,
  - active containers with required text/steps must pass validation.
- Preserve the linked mistake/correction invariant:
  - one row owns one mistake and its correction,
  - corrections cannot be stored as a separate right-column list,
  - fix/correction without a mistake fails validation,
  - legacy `commonMistakes: string[]` remains readable as mistake-only rows.
- Preserve optional-field behavior:
  - public `/course` must not render `New field` or other placeholder copy,
  - admin may show an explicit `New field` badge or placeholder to prompt editing,
  - inactive containers do not render public fallback text/cards,
  - blank `whyThisMatters` remains absent from the public payload/render.
- Keep practice image handling non-editable:
  - public lessons without images keep the `Visual not added yet` fallback,
  - admin may see missing-image guidance,
  - no upload, media library, replace/remove, Supabase storage, storage policy, cleanup, or image-source expansion ships in this slice,
  - existing valid `lessonExperience.*Practice.image` metadata remains readable and pass-through if already present.
- Keep public `/course` runtime fast:
  - no admin editor bundle on public learner routes,
  - no admin-only data sent to anonymous users,
  - public render remains data-driven through the view-model.
- Preserve existing lesson runtime IDs, preview links, admin notes context, QR behavior, published-content cache rules, and publish workflow.
- Add Help/Guide updates for the new admin editing workflow.
- Add tests for validation, pass-through, preview, rollback-safe editing, and public-route non-regression.

## Out Of Scope

- Producing or rewriting the whole course.
- Creating, replacing, uploading, or curating practice images/media library entries.
- `Deferred: bulk lesson-experience import/editing`.
- `Deferred: inline visual editing/live preview`.
- `Deferred: i18n/translation workflow for lesson experience`.
- `Deferred: SEO/structured data for canonical lesson routes`.
- New PRO save flows, checkout, Stripe, entitlement, refund, invoice, payout, or finance behavior.
- Canonical lesson routes, sitemap changes, structured data, or SEO route migration.
- New analytics dashboards unless needed for admin editor safety diagnostics.
- Changing public support CTA destinations.
- Moving current admin content to a new CMS or adding a new dependency unless the decision gate proves it is necessary.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the scoped 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Admin editor ergonomics
- Admin workflow and editability
- Security and authz
- Reliability and failure handling
- Content governance
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                         | Evidence                                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin can find, edit, preview, and publish lesson-experience fields without leaving the course content workflow.                                                           | admin flow QA + screenshots                         | `5/5`                   |
| UX flow clarity                               | `target`     | Admin can choose the lesson-experience layout, see which containers are public, save, preview, publish, cancel, validate, and recover with no dead-end states.             | component/e2e tests + manual QA                     | `5/5`                   |
| Visual design quality                         | `target`     | Admin editing UI matches existing admin tokens, spacing, form patterns, feedback states, and responsive behavior.                                                          | screenshot handoff                                  | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Lesson-experience edits preserve runtime IDs, layout variant, container visibility, mistake/correction pairs, image metadata pass-through, and legacy lesson fields.       | unit tests + API tests + e2e edit/publish flow      | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admin starts with a layout preset, can override container visibility, and avoids irrelevant fields for intro/dryland/drill/swim-set lessons.                               | decision record + admin QA                          | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Form labels, row controls, validation errors, preview, keyboard flow, and focus management remain accessible; image upload controls are out of scope.                      | component tests + Playwright checks                 | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Public `/course` does not load admin editor code; admin editor keeps acceptable interaction latency for a lesson with rich text fields and image non-editability guidance. | bundle/code review + route smoke                    | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical lesson body fields include variant + display; inactive draft content may be stored but cannot silently render publicly.                                   | data contract + save/publish tests                  | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Admin preview and published `/course` cache behavior stay predictable after edits, publishes, and rollback.                                                                | preview/published cache tests                       | `5/5`                   |
| Reliability and failure handling              | `target`     | Validation, failed saves, missing-image placeholders, stale previews, and rollback attempts produce recoverable states without data loss.                                  | negative-path tests + manual QA                     | `5/5`                   |
| Security and authz                            | `target`     | Content editing is admin-only, fails closed, validates input, and does not add image mutation/storage routes in this slice.                                                | unauthorized/forbidden tests + route review         | `5/5`                   |
| Privacy and compliance                        | `target`     | No personal data is collected by the editor; no new image metadata collection, private storage paths, or sensitive local details are introduced.                           | diff review + negative-path assertions              | `5/5`                   |
| Content governance                            | `target`     | Draft/review/published ownership, revision history, rollback path, and field-level content rules are explicit.                                                             | workflow tests + Help/Guide update                  | `5/5`                   |
| Admin workflow and editability                | `target`     | Admin can select layout, edit all relevant active containers, preserve inactive content, and manage linked mistake/correction rows with clear save/publish feedback.       | admin e2e + screenshot handoff                      | `5/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: admin edits may improve public lesson semantics, but canonical route/sitemap work remains a separate child.                                               | no route metadata changes or explicit deferred note | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: structured lesson fields remain semantic and data-driven, while public structured data decisions stay deferred.                                           | public payload/render review                        | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting unless admin editor diagnostics are added; no public KPI taxonomy expansion is required by this child.                                                          | no-new-event review or explicit event tests         | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: support text may be edited, but checkout, pricing, entitlements, and finance truth stay unchanged.                                                        | route/action sweep                                  | `4/5`                   |
| Incident response and support operations      | `target`     | Admin has recovery guidance for failed saves/uploads, bad published content, and rollback from incorrect lesson-experience edits.                                          | Help/Guide/runbook update + negative-path QA        | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child changes no payments, prices, refunds, invoices, payouts, entitlements, or finance reporting truth.                                                  | explicit finance scope rationale                    | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because fields and layout must not block future localization, but no locale routing or translation workflow is implemented here.                                | field model review + responsive screenshot review   | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js, TypeScript, Supabase/admin-content APIs, admin UI primitives, and test stack; add no dependency without decision-gate evidence.                    | dependency diff + code review                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Cover normalization, admin validation, unauthorized paths, save/publish, preview, public fallback render, and screenshot handoff.                                          | unit/API/e2e/screenshot evidence + `verify:pre-pr`  | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Admin can edit many lessons without route-local code or manual JSON surgery; media handling stays outside this payload unless a new owner-approved media brief is created. | high-volume workflow review + public payload review | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Changes deploy without schema surprises or include explicit migrations; rollback from bad content and bad code is documented and tested where practical.                   | migration/rollback note + pre-merge validation      | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `components/admin/AdminContentManager.tsx`, admin feedback states, and current course preview/open-lesson flows.
  - Keep admin editor code under admin surfaces; public `/course` should consume typed data only.
- TypeScript:
  - Reuse `CourseLessonExperience` and `buildCourseLessonExperienceViewModel`.
  - Add explicit validation helpers for layout variant, container display values, active-container minimums, and linked mistake/correction rows.
  - Treat unknown optional values as absent and never publish malformed pairs.
- Supabase/admin content:
  - Prefer existing `admin_content_items.body` and revision/publish workflow unless execution finds a clear need for migration.
  - Do not add image upload/storage in this slice. Storage bucket, authz, signed/public URL policy, and cleanup/rollback behavior require a separate owner-approved media brief, not an automatic follow-up from this admin-editor brief.
- UI:
  - Compare inline editing, side-panel form editing, and table/list editing before choosing.
  - Use existing admin tokens, cards, form fields, action hierarchy, and feedback states.
- Testing:
  - Unit tests for normalization and validation.
  - API/route tests for unauthorized/forbidden/save failures.
  - E2E for edit, preview, publish, rollback-safe recovery, and public route render.
  - Screenshot handoff for admin editor and public `/course` non-regression if visual surfaces change.

## Data Placement And Sync Contract

- Server-canonical:
  - Course lesson `body.lessonExperience` fields in admin content.
  - Course lesson `body.lessonExperience.variant` and `body.lessonExperience.display` own the public lesson-experience layout.
  - Existing image metadata/path only if already present; this slice does not create new image storage truth.
- Local-only:
  - Unsaved admin form state and temporary validation state.
  - No local-only truth for published content.
- Sync policy:
  - Save writes draft/review content through existing admin content paths.
  - Publish makes content visible through existing published course content cache/invalidation.
  - Failed save preserves the admin draft in the UI until recovery or cancel.
- Retention and sensitivity:
  - No new personal data.
  - Do not expose private storage paths, raw signed URLs, or local filesystem paths in public payloads.
- Cache/invalidation:
  - Admin preview must reflect draft/review state according to current preview mode.
  - Published `/course` updates only after publish/invalidation.

## Identity And Rename Contract

- Canonical stable ID:
  - Course lesson runtime ID remains immutable and owns progress, notes, QR, preview, and future route mapping.
- Human-readable identifiers:
  - Titles, quick explanations, why-this-matters copy, practice titles, cues, mistakes, corrections, image captions, and support text are editable display content.
- Mutability rules:
  - Display content may be edited in place when the learning object remains the same.
  - Runtime IDs, module IDs, and legacy aliases must not be changed by this editor.
- Rename vs repurpose:
  - Rename/correct copy in place.
  - Create a new lesson if the skill, progression position, or learning object materially changes.
- Compatibility:
  - Legacy `commonMistakes: string[]` must remain readable and editable without losing data.
  - Mistake/correction rows are the forward-compatible shape.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Lesson-experience variant, container display keys, text fields, `whyThisMatters`, practice image metadata pass-through, linked mistake/correction rows, future locales, future proof/trust snippets, and future analytics values.
- Source of truth:
  - Admin content body remains canonical for lesson text fields until a later migration is explicitly approved.
- Additive behavior:
  - New lessons can use the same editor fields without route-local code.
  - New intro/concept, dryland, water-drill, and swim-set lessons get data-driven default container visibility.
  - New optional fields can appear as admin prompts without leaking placeholders to public learners.
  - Lessons without practice images render public fallback media containers only when that practice container is active.
  - Legacy mistake-only data stays valid.
- Explicit mapping requirements:
  - New lesson-experience variants, display container keys, external asset providers, bulk import formats, locale workflows, analytics events, PRO actions, or structured data require explicit mapping and tests.
  - Future slices must use these stable names so they are easy to find in repo sweeps:
    - `Deferred: bulk lesson-experience import/editing`
    - `Deferred: inline visual editing/live preview`
    - `Deferred: i18n/translation workflow for lesson experience`
    - `Deferred: SEO/structured data for canonical lesson routes`
    - `Deferred: course lesson public layout and lesson-info polish`
    - `Deferred: course lesson mark-as-done progress behavior`
    - `Deferred: course lesson public pill/cue clarity`
    - `Deferred: course lesson commercial CTA policy`
- Unknown or deprecated values:
  - Unknown variants fall back to the lesson-type-derived default variant.
  - Unknown display keys are ignored.
  - Unknown optional fields are ignored in public render.
  - Unknown image sources fail validation or render fallback instead of leaking unsafe URLs.
- Test/evidence:
  - Include a future-value fixture proving the editor is not hardcoded to the first representative V1 lesson.

## Help / Guide Impact

- Required in same implementation PR:
  - Admin Help/Guide instructions for lesson-experience editing.
  - Recovery guidance for failed save/upload/publish and rollback from incorrect content.
  - Explanation of layout presets, active/inactive containers, linked mistake/correction rows, and why practice images are non-editable in this slice.

## Route / Label / Support-Surface Impact Sweep

Run before `verify:pre-pr` if this child changes admin labels, support labels, routes, preview links, QR behavior, Help/Guide assertions, or runbooks.

Minimum paths:

- `app/`
- `components/`
- `tests/`
- `docs/`
- `docs/runbooks/`
- active/planned/done task briefs touching `/course` or admin content

Evidence for this implementation:

- Identifiers searched: `Public containers`, `public-container toggles`, `Show on public lesson`, `Dryland prep`, `One cue`, `Use this as the lesson's one reminder`, `Select Lesson Content`, `9aa31814`.
- Directories/surfaces checked: `app/`, `components/`, `lib/`, `tests/`, active task brief, parent task brief, Admin Help/Guide assertions, and public `/course` e2e assertions.
- Fallout handled: old admin/help labels were replaced, concept/public copy regression is tested, production note `9aa31814...` is included, and remaining production notes are deferred by stable names below.

## Production Admin Notes Audit

- Included in this PR:
  - `9aa31814...` / `Select Lesson Content`: covered by the layout variant selector and `Show on public lesson` container toggles.
- Deferred from this PR:
  - `8593d718...` / `Lesson info under video`: belongs in `Deferred: course lesson public layout and lesson-info polish`.
  - `49043378...` / `Lesson Page - Mark as done`: belongs in `Deferred: course lesson mark-as-done progress behavior`.
  - `042757a0...` / `Before Water pill / Sorte tall`: belongs in `Deferred: course lesson public pill/cue clarity` and possibly `Deferred: course lesson commercial CTA policy` if CTA copy is changed.
  - `488f7290...` / `Pille Foucs med tall og bokstaver bak`: belongs in `Deferred: course lesson public pill/cue clarity`.
- Rationale: this child owns admin editing of lesson-experience structure and the smallest public-copy fixes needed to keep intro/concept lessons truthful. Mark-as-done behavior, commercial CTA policy, and broader public layout redesign are separate product slices.

## Screenshot Handoff Requirement

This is admin UI work and likely public preview work.

Required after targeted QA and before `npm run verify:pre-pr`:

- Admin editor desktop screenshot.
- Admin editor mobile or narrow screenshot if supported.
- Public `/course` after screenshot proving no learner regression.
- If comparing inline editing to a reference surface, use `after/reference` filenames and explain the reference.

Evidence for this implementation:

- Screenshot artifact handoff: `output/course-lesson-admin-editor-20260613T184130` (final accepted artifacts captured after lint-staged formatting and temporary harness cleanup).
- Screenshot comparison naming: all files are `after-*` because this is an after-only scoped implementation handoff.
- Owner screenshot approval stop: owner approved the screenshot handoff in chat before `npm run verify:pre-pr` was resumed.

## Acceptance Criteria

1. Decision gate documents the evaluated editor patterns and selects one implementation model.
2. Admin can edit all V1 lesson-experience text fields without JSON editing.
3. Admin can choose a lesson-experience layout variant and see/update the resulting active container set.
4. Admin can activate/deactivate quick explanation, why, land practice, water practice, feel cues, common mistakes, next step, and support independently.
5. Inactive containers do not render publicly, but their stored draft content is preserved.
6. Active practice containers without images keep the `Visual not added yet` fallback; inactive practice containers render nothing.
7. Admin can edit linked mistake/correction rows, and the stored data preserves row-level pairing.
8. Fix/correction without a mistake fails validation.
9. Legacy mistake-only lessons remain readable and editable.
10. Practice images remain non-editable in this slice.
11. Existing valid practice image metadata remains readable/pass-through, but no image upload, replace/remove, or media-library editing is added.
12. Public `/course` never loads admin editor code or admin-only data.
13. Preview/publish/rollback behavior remains clear and tested.
14. Unauthorized users cannot edit content; no image mutation route is added in this slice.
15. Help/Guide covers the new workflow and recovery paths.
16. Screenshot handoff is approved before PR gate.
17. `npm run verify:pre-pr` passes before PR handoff.

## Validation

- Decision-gate notes in this brief.
- Unit tests for normalization/validation.
- Admin content route tests for authz, invalid variants/display, invalid active-container content, invalid pairs, save failures, and rollback-safe behavior.
- Failure-mode evidence: changed admin content API validation tests cover malformed lesson-experience payloads, unauthorized access, forbidden access, invalid active-container content, invalid mistake/correction pairs, image metadata pass-through, and controlled save failures.
- No unexpected 500 evidence: invalid admin lesson-experience edits are asserted through typed validation failures rather than server crashes; targeted route/unit tests pass before the pre-PR gate.
- Admin e2e for edit/preview/publish.
- Public `/course` e2e for active/inactive container rendering, fallback media, and no admin-only leakage.
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge` before merge recommendation.

## Checkpoint Log

- `2026-06-13 | planned | created admin-editor follow-up brief from V1 lesson-experience discussion: require decision gate over successful CMS/app editing patterns, evaluate inline editing only if public performance/security stays clean, and preserve linked mistake/correction rows plus practice image editing; next: execute after public V1 skeleton is approved and merged`
- `2026-06-13 | planned | updated requirements after V1 why-field decision: admin editor must expose `whyThisMatters`as`Why this exercise matters`, may use admin-only `New field`placeholder/badge copy, and must keep placeholders out of public`/course`; next: execute this child after public V1 skeleton is approved and merged`
- `2026-06-13 | in-progress | started implementation on branch `feat/course-lesson-experience-admin-editor-2026-06-13`; re-scoped practice images to non-editable pass-through/fallback for this slice and recorded stable deferred slice names for bulk import/editing, inline visual editing/live preview, i18n, and SEO/structured data; next: implement structured admin editor for V1 text/structure fields and linked mistake/correction rows`
- `2026-06-13 | in-progress | implemented structured admin lesson-experience fields, linked mistake/correction validation, API guards, Help/Guide updates, and public no-admin-leak assertions; targeted unit tests and `npm run lint:briefs:all`pass; screenshot handoff captured in`output/course-lesson-admin-editor-20260613T163355`; next: owner visual approval before `npm run verify:pre-pr``
- `2026-06-13 | in-progress | owner audit found the first editor pass was not 10/10 for varied lesson types because it lacked layout variants and per-container lesson-experience visibility; refreshed scope to add variant + display contract for concept, dryland, water-drill, swim-set, and custom lesson experiences; next: implement the refreshed 10/10 contract before new screenshot handoff`
- `2026-06-13 | screenshot-review | implemented layout variants, per-container public visibility, inactive-content preservation, null-safe concept lessons without drill data, Help/Guide copy, parent-brief lifecycle link, and focused tests. Added scoped label polish after owner design audit: admin label `Show on public lesson`, public pill labels `Dryland prep`and`One cue`, and concept feel-cue helper copy that does not imply water practice. Production admin note `9aa31814...`is included; other production notes are deferred by stable names in the forward-compatibility contract. Local evidence:`npm run typecheck` PASS; targeted Vitest (`course-lesson-experience`, `admin-content`, `admin-content-route`, `admin-content-manager-state`, `admin-help-center`) PASS with 59 tests; targeted Playwright `course-lesson-experience.spec.ts admin-help-center.spec.ts --project=desktop-chromium`PASS with 2 passed / 1 expected local dev-login skip;`npm run lint:briefs:all`PASS;`npm run lint`PASS with 7 pre-existing output-artifact warnings;`git diff --check`PASS. Screenshot artifacts captured at`output/course-lesson-admin-editor-20260613193505`using temporary local visual harness for admin because dev-login/Supabase egress blocks local admin screenshots; harness was removed after capture. Next: owner visual approval before`npm run verify:pre-pr`, commit, PR creation, CI, and `npm run verify:pre-merge`.`
- `2026-06-13 | pre-pr | owner approved screenshot handoff, then `npm run verify:pre-pr` PASS on the full lane. Evidence included quality-gates PASS, lint PASS with 7 pre-existing output-artifact warnings, typecheck PASS, unit tests PASS (`1560` tests), build PASS, perf budgets PASS (`/course`median LCP`92.0ms`, CLS `0.000`, JS `311.0kb`; trend recommendation `hold`because worst margin was`12.4%`, below the `15.0%` tighten threshold), and Playwright PASS (`108`passed,`546`expected skipped in local auth-gated matrix). Next: commit, push, open PR, monitor CI, and run`npm run verify:pre-merge` before merge readiness.`
- `2026-06-13 | merged | PR #1116 merged as squash commit `5ebd9322`; CI required checks passed, `npm run verify:pre-merge`PASS on current HEAD before merge, and final accepted screenshot artifacts were captured at`output/course-lesson-admin-editor-20260613T184130`. Next: closeout brief moved to done.`

## Completion Record

- `completed`: `2026-06-13`
- `merged_pr`: `#1116`
- `squash_commit`: `5ebd9322`
- `result`: Closed Course Lesson Experience Admin Editor. Admins can now edit structured lesson-experience content safely across intro/concept, dryland, water-drill, swim-set, and custom lesson types with public-container toggles, linked mistake/correction rows, image-placeholder pass-through, and Help/Guide recovery guidance.
- `validation`: `npm run verify:pre-pr` PASS on full lane for `0946fee9`; GitHub CI PASS for PR #1116; `npm run verify:pre-merge` PASS before merge; screenshot handoff approved with final artifacts at `output/course-lesson-admin-editor-20260613T184130`.
- `10/10 claim`: yes - all critical target categories reached `5/5`; remaining media upload, mark-as-done, public pill/CTA, and broader lesson-info layout work is explicitly deferred by stable follow-up names.

| Category                                      | Achieved Score | Evidence                                                                                                                | Gaps / Notes                                                                                 |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR #1116 merged; structured editor and public render contracts covered by unit/e2e tests and screenshots.               | No active gap in this slice.                                                                 |
| UX flow clarity                               | `5/5`          | Layout selector, public-container toggles, save/cancel states, Help/Guide copy, and screenshot handoff.                 | No active gap in this slice.                                                                 |
| Visual design quality                         | `5/5`          | Final screenshot artifacts: `output/course-lesson-admin-editor-20260613T184130`; owner approved.                        | No active gap in this slice.                                                                 |
| Business logic correctness and data integrity | `5/5`          | Unit/API tests cover normalization, variants, display flags, paired mistakes/corrections, and image pass-through.       | No active gap in this slice.                                                                 |
| Admin editor ergonomics                       | `5/5`          | Admin can choose presets, override visible containers, preserve hidden content, and avoid JSON editing.                 | Bulk import/editing remains deferred by stable follow-up name.                               |
| Accessibility (a11y)                          | `5/5`          | Labels, fieldsets, responsive screenshots, targeted Playwright, and full verification lane passed.                      | No active gap in this slice.                                                                 |
| Performance (CWV + payloads)                  | `5/5`          | Public `/course` stays data-driven; perf budgets PASS with `/course` JS `311.0kb`, CLS `0.000`.                         | Trend recommendation is `hold`, not tighten, because worst margin was `12.4%` below `15.0%`. |
| Data placement and sync boundaries            | `5/5`          | Server-canonical `body.lessonExperience`; no local-only published truth; inactive content preserved.                    | No active gap in this slice.                                                                 |
| Caching and invalidation strategy             | `5/5`          | Existing admin content save/publish/preview flow reused; `verify:pre-pr` and CI passed.                                 | No active gap in this slice.                                                                 |
| Reliability and failure handling              | `5/5`          | Validation failures are typed; invalid pairs and malformed payloads fail without unexpected 500s.                       | No active gap in this slice.                                                                 |
| Security and authz                            | `5/5`          | Admin-only routes fail closed; unauthorized/forbidden and malformed payload tests passed.                               | No new image mutation/storage route in this slice.                                           |
| Privacy and compliance                        | `5/5`          | No new personal data, storage paths, signed URLs, or image metadata collection introduced.                              | No active gap in this slice.                                                                 |
| Content governance                            | `5/5`          | Revision-backed admin content workflow reused; Help/Guide explains presets, hidden content, and rollback.               | No active gap in this slice.                                                                 |
| Admin workflow and editability                | `5/5`          | Admin editor supports layout variants, field editing, toggles, mistake/correction rows, and preview-safe public render. | No active gap in this slice.                                                                 |
| Incident response and support operations      | `5/5`          | Help/Guide recovery guidance and validation/error states added; rollback evidence documented.                           | No active gap in this slice.                                                                 |
| Stack-fit and dependency discipline           | `5/5`          | Reused Next.js/App Router, existing admin manager, content APIs, UI tokens, and tests; no new dependency.               | No active gap in this slice.                                                                 |
| Testing and QA automation                     | `5/5`          | `npm run verify:pre-pr` PASS, GitHub CI PASS, `npm run verify:pre-merge` PASS, targeted unit/e2e PASS.                  | Local auth-gated skips were expected in matrix.                                              |
| Scalability and cost efficiency               | `5/5`          | New lessons use data-driven fields and defaults without route-local code or manual JSON surgery.                        | Media upload/editor remains deferred to keep payload and storage policy scoped.              |
| DevOps and rollback readiness                 | `5/5`          | Squash commit `5ebd9322`; rollback via `git revert 5ebd9322`; no migrations.                                            | No active gap in this slice.                                                                 |
