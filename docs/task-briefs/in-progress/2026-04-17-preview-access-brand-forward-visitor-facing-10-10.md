# Task Brief: Preview Access Brand-Forward Visitor-Facing Refresh (10/10)

## Metadata

- `id`: `2026-04-17-preview-access-brand-forward-visitor-facing-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-17`
- `updated`: `2026-04-17`

## Goal

Make `/preview-access` feel brand-forward and visitor-facing: remove admin-help/status UI, keep the shared preview password as the only primary action, and add a small secondary `Get notified when preview opens` CTA that reuses the existing contact flow.

## Why This Brief Exists

- The current `/preview-access` route is functionally correct enough to unlock the site, but it reads more like an internal admin tool than a polished visitor-facing preview entry.
- Current UI hierarchy creates two avoidable problems:
  - it visually overweights admin-only messaging on a surface that should mainly communicate one clear visitor action,
  - it exposes signed-in/admin-state cues that are not necessary for a premium first impression.
- The current route copy also implies an admin-first unlock expectation even though the actual unlock action is the shared password submit path:
  - `/Users/stianvikra/freeswimming/app/preview-access/page.tsx`
  - `/Users/stianvikra/freeswimming/app/preview-access/actions.ts`
- The repo already has canonical brand assets and a stronger visual language than the current locked-route card uses:
  - `/Users/stianvikra/freeswimming/components/brand/BrandImage.tsx`
  - `/Users/stianvikra/freeswimming/lib/brand.ts`
  - `/Users/stianvikra/freeswimming/docs/design/brand-logo-usage.md`
- The repo also already has a working contact flow that can carry a lightweight early-access notify path without inventing a new inline email-capture system in this slice:
  - `/Users/stianvikra/freeswimming/app/programs/page.tsx`
  - `/Users/stianvikra/freeswimming/components/ContactForm.tsx`

## Dependencies And Boundaries

- Existing private-gate runtime contract remains authoritative:
  - `/Users/stianvikra/freeswimming/docs/runbooks/private-access-gate.md`
  - `/Users/stianvikra/freeswimming/docs/runbooks/site-lock-operations.md`
- Recent preview-access copy baseline:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-31-preview-access-copy-truthfulness-followup-10-10.md`
- In-scope implementation surfaces:
  - `/Users/stianvikra/freeswimming/app/preview-access/page.tsx`
  - `/Users/stianvikra/freeswimming/app/preview-access/actions.ts` (only if needed for clearer deny/error states; no access-policy expansion)
  - `/Users/stianvikra/freeswimming/app/contact/page.tsx`
  - `/Users/stianvikra/freeswimming/components/brand/BrandImage.tsx`
  - `/Users/stianvikra/freeswimming/components/ContactForm.tsx`
  - `/Users/stianvikra/freeswimming/lib/brand.ts`
  - `/Users/stianvikra/freeswimming/lib/site-lock/session.ts`
  - `/Users/stianvikra/freeswimming/app/api/contact/route.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/contact-form.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/site-lock-session.test.ts`
  - `/Users/stianvikra/freeswimming/tests/e2e/private-access-gate.spec.ts`
  - relevant docs/runbook/help files if route guidance or operator expectations change materially.
- This slice owns:
  - locked-route brand hierarchy,
  - removal of unnecessary admin status/help presentation from the main visitor surface,
  - the new secondary notify CTA via existing contact flow,
  - test assertions protecting the refreshed UI contract.
- This slice does not own:
  - a new inline waitlist database or consent pipeline,
  - a new tester-program application workflow,
  - site-lock backend redesign,
  - real passkeys,
  - broader homepage or marketing redesign.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Security and authz`
- `Reliability and failure handling`
- `Testing and QA automation`

Strict `10/10` mode for this brief:

- every declared `target` category must close at `5/5`

| Category                                      | Mapping      | Threshold For This Brief                                                                                                                                        | Evidence                                                     | Expected Closeout |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------- |
| Product goals and IA                          | `target`     | `/preview-access` reads in one scan as a branded preview-entry surface with one clear unlock action and one clearly secondary notify path.                      | route review + screenshot QA + unit/e2e assertions           | `5/5`             |
| UX flow clarity                               | `target`     | Password entry is the only primary CTA, notify interest is visibly secondary, and no admin-status card or signed-in identity cue competes with the main action. | manual QA + unit/e2e coverage                                | `5/5`             |
| Visual design quality                         | `target`     | The route uses canonical app brand assets and matches the repo's current visual language with calm spacing, consistent type hierarchy, and no nested-card feel. | screenshot QA + code review                                  | `5/5`             |
| Business logic correctness and data integrity | `target`     | UI text and hierarchy match the live access contract exactly: shared password remains the unlock mechanism, and the notify CTA does not imply granted access.   | code review + targeted tests                                 | `5/5`             |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice removes visitor-facing admin-help presentation only and does not change admin editing, publishing, or operator mutation flows.           | explicit scope rationale                                     | `N/A`             |
| Accessibility (a11y)                          | `target`     | Keyboard focus order, field labels, button semantics, readable contrast, and error messaging remain correct after the layout refresh and CTA changes.           | route QA + targeted accessibility assertions                 | `5/5`             |
| Performance (CWV + payloads)                  | `target`     | The refreshed locked route stays lightweight, uses existing assets/components, and adds no meaningful JS or payload regression beyond current route baseline.   | diff review + `npm run build` + route artifact review        | `5/5`             |
| Data placement and sync boundaries            | `target`     | Preview unlock state remains server-canonical via the existing cookie flow, while notify interest reuses an existing contact path instead of new local storage. | brief contract + code review                                 | `5/5`             |
| Caching and invalidation strategy             | `supporting` | `/preview-access` remains dynamic and reflects current site-lock/session state on reload with no new cache ambiguity introduced by the refreshed UI.            | route review + existing dynamic contract                     | `4/5`             |
| Reliability and failure handling              | `target`     | Locked, invalid-password, and post-submit states remain deterministic and clear, with no unexpected dead ends introduced by the new secondary CTA.              | targeted tests + manual QA                                   | `5/5`             |
| Security and authz                            | `target`     | The redesign does not broaden access, leak signed-in identity on the locked surface, or weaken fail-closed behavior for protected routes and unlock submission. | code review + existing/private-gate negative-path coverage   | `5/5`             |
| Privacy and compliance                        | `target`     | No signed-in email is shown on the locked visitor surface, and the notify CTA does not collect/store new personal data on this route in this slice.             | code review + scope review                                   | `5/5`             |
| Content governance                            | `supporting` | Canonical brand assets and the existing contact flow remain the source of truth; route copy stays aligned with the actual lock contract and approved brand use. | brand review + brief alignment                               | `4/5`             |
| Admin workflow and editability                | `N/A`        | N/A because the route refresh does not add admin CRUD, state workflows, or role-gated editing surfaces.                                                         | explicit scope rationale                                     | `N/A`             |
| SEO and crawlability                          | `supporting` | The private route remains `noindex`/non-public, and any CTA to contact must not weaken existing robots/sitemap private-mode behavior.                           | metadata review + existing tests                             | `4/5`             |
| AI discoverability                            | `N/A`        | N/A because this slice changes only a private locked-route surface and does not add new public semantic content or crawl-facing entity pages.                   | explicit scope rationale                                     | `N/A`             |
| Analytics and KPI observability               | `supporting` | Supporting only: no new analytics dependency is required unless the implementation adds a small existing-pattern event for notify CTA usage.                    | scope review + code review                                   | `4/5`             |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, entitlement, pricing, refund, or paid-access behavior changes in this locked-route refresh.                                            | explicit scope rationale                                     | `N/A`             |
| Incident response and support operations      | `N/A`        | N/A because this slice changes no operator recovery workflow or alerting path; it only refreshes visitor-facing presentation on the locked route.               | explicit scope rationale tied to route-only visual/UX scope  | `N/A`             |
| Finance and reporting operations              | `N/A`        | N/A because this work has no finance, payout, reconciliation, or reporting impact.                                                                              | explicit scope rationale tied to non-commerce route scope    | `N/A`             |
| i18n operational readiness                    | `N/A`        | N/A because this slice preserves the current English-only preview gate and introduces no locale routing or content-model blocker beyond current baseline.       | explicit scope rationale tied to unchanged locale model      | `N/A`             |
| Stack-fit and dependency discipline           | `target`     | The work must reuse existing Next.js/Tailwind/brand/contact-flow patterns and add no new dependency for logo rendering, waitlist capture, or form handling.     | dependency diff + code review                                | `5/5`             |
| Testing and QA automation                     | `target`     | Unit and private-gate e2e coverage must protect the new hierarchy: no admin-help card, no signed-in identity display, branded route shell, and notify CTA.      | updated tests + `npm run lint:briefs` + targeted/full checks | `5/5`             |
| Scalability and cost efficiency               | `supporting` | The notify path should reuse existing contact infrastructure and avoid introducing a bespoke storage/ops burden for a small locked-route CTA.                   | architecture review + diff review                            | `4/5`             |
| DevOps and rollback readiness                 | `supporting` | The slice remains reversible as a route/UI update with no migration requirement and no secret/config churn.                                                     | PR diff + rollback simplicity review                         | `4/5`             |

## Data Placement And Sync Contract

- Server-canonical:
  - site-lock enabled/disabled state,
  - preview password validation,
  - preview access cookie issuance,
  - contact-form submission handling on the existing contact route.
- Local-only:
  - transient field state on `/preview-access`,
  - local navigation from notify CTA to `/contact`.
- Sync policy:
  - `/preview-access` itself must not create new persisted notify-interest records in this slice,
  - notify interest is delegated to the existing contact flow and its current submission contract,
  - preview unlock continues to be immediate and browser-local via the existing cookie flow.
- Retention and sensitivity:
  - no new PII may be collected directly on `/preview-access`,
  - signed-in email/admin-state should not be surfaced on the locked visitor page,
  - no plain preview password may appear in logs, tests, or repository files.
- Cache/invalidation:
  - `/preview-access` remains dynamic,
  - current site-lock and preview-cookie state must re-evaluate on each request,
  - CTA-only changes must not add cacheable stale auth UI.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this slice creates no persisted entity, route slug, canonical identifier, or renameable admin object;
  - it only changes the presentation and navigation contract of the existing locked-route entry surface.

## Scope

- Refresh `/preview-access` into a brand-forward, visitor-facing entry route using canonical app brand assets.
- Remove the current admin-help/status presentation from the main page surface.
- Do not show signed-in email or admin eligibility state on the locked route.
- Keep the shared preview password as the single primary unlock action.
- Add a small secondary CTA for early-access notification that routes through the existing contact flow.
- Keep the notify CTA reachable during private mode by allowing the existing `/contact` + `/api/contact` flow through the site-lock bypass list.
- Update copy so the page describes what the visitor can do now without implying broader access or internal workflow.
- Update targeted tests and any route/runbook assertions needed for the new contract.

## Out Of Scope

- Requiring admin sign-in before password unlock.
- Introducing a new inline email capture form, waitlist database, CRM sync, or consent backend on `/preview-access`.
- Building a dedicated tester-application program.
- Changing site-lock password validation, cookie issuance, or bypass-token backend behavior.
- Redesigning homepage, menu drawer, or broader brand system beyond what the locked route needs.

## Acceptance Criteria

1. `/preview-access` presents one clear primary action: enter the preview password.
2. The route no longer shows the admin preview unlock card or signed-in email/admin-status messaging.
3. The route uses the canonical brand direction from the app/logo system rather than a generic utility-card presentation.
4. A clearly secondary CTA offers `Get notified when preview opens` and routes through the existing contact flow instead of a new inline capture system.
5. The notify CTA remains reachable during private mode instead of looping visitors back into the locked route.
6. Copy does not imply that notify interest grants access or that admin sign-in is required for general preview entry unless backend policy is explicitly changed in a separate slice.
7. Invalid-password state remains clear and accessible.
8. Relevant tests and brief lint pass.

## Validation

- `npm run lint:briefs`
- `npx vitest run tests/unit/admin-preview-unlock-card.test.tsx`
- `SITE_LOCK_ENABLED=1 PW_SITE_LOCK_USE_PASSWORD=1 PW_SITE_LOCK_PASSWORD="<password>" npx playwright test tests/e2e/private-access-gate.spec.ts --project=desktop-chromium`
- `npm run verify:public` when route metadata/visibility assertions are touched
- `npm run verify:pre-pr`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3100/preview-access?next=%2F`
  - verify locked state, invalid password state, and notify CTA routing
- PR preview:
  - preview URL from the PR after push
- Recommended matrix:
  - iPhone Safari-width viewport
  - Android Chromium-width viewport
  - desktop Chromium
  - desktop Safari/WebKit

## Constraints

- Use the app's canonical brand assets; do not use the owner-provided screenshot/reference image as a runtime asset.
- Keep the route premium and minimal, not marketing-heavy.
- Do not create nested cards or internal-tool styling that makes the locked route feel like an admin panel.
- Keep changes scoped to `/preview-access` and directly related supporting tests/docs.
- Do not introduce a new dependency.
- Preserve the current underlying access policy unless a separate brief explicitly changes it.

## 10/10 Quality Bar

- The page should feel intentional and premium in one scan, not like a temporary utility gate.
- Password unlock must remain the obvious primary action with no competing admin/status UI.
- Required changed states must remain clear:
  - default locked state,
  - invalid password error,
  - focused input/button states,
  - secondary notify CTA state,
  - responsive mobile/desktop layouts.
- Accessibility expectations:
  - proper heading hierarchy,
  - explicit form labels,
  - visible keyboard focus,
  - sufficient contrast,
  - no meaning conveyed only by color.
- Performance expectations:
  - no heavy client logic,
  - no unnecessary image payload bloat,
  - no route-level regression beyond current lightweight locked-page baseline.
- Business-logic correctness:
  - UI must not imply that notify interest unlocks preview,
  - UI must not imply admin sign-in is the required general visitor path if runtime behavior does not enforce that,
  - no silent fallback to stale or contradictory status messaging.
- Failure handling expectations:
  - wrong password remains clearly rejected,
  - notify CTA still leaves the visitor with a clear way back to unlock,
  - no dead-end state after CTA exploration.

## 10/10 Cross-Cut Categories

- Content governance and source-of-truth:
  - canonical brand assets from `lib/brand` and approved public logo pack remain the only brand source for this route.
- Identity and rename safety:
  - `N/A` because no persisted named entity or route identifier changes.
- Taxonomy and category management:
  - `N/A` because this slice introduces no new taxonomy model.
- Workflow and publishing safety:
  - preview gate remains a single locked-route workflow with no new destructive actions or publish state model.
- Business logic correctness and data integrity:
  - password unlock truth and notify-CTA non-access semantics must be explicit and test-protected.
- RBAC and auditability:
  - no new role boundary is introduced; the route should expose less signed-in role/status information than today.
- UX/UI quality contract:
  - one primary action, one secondary action, calm hierarchy, and no confusing admin artifacts.
- Admin editor ergonomics:
  - `N/A` because no admin editing/publishing workflow changes.
- Performance contract:
  - route stays within existing lightweight shell expectations and avoids new client-side complexity.
- Data placement and sync boundaries:
  - no new local persistence or preview-route data write path.
- Caching and invalidation strategy:
  - route remains dynamic and derives state from the existing site-lock session contract.
- Testing contract:
  - unit + private-gate e2e must cover removed admin-help/state cues, password path, and notify CTA presence/routing.
- Observability and KPI tracking:
  - no new vendor analytics required; any instrumentation must reuse existing patterns and avoid PII leakage.
- Incident response and support operations:
  - `N/A` because there is no change to support recovery workflow, alerting, or operational control plane.
- Finance and reporting operations:
  - `N/A` because the route has no finance/reporting effect.
- i18n operational readiness:
  - `N/A` because this brief changes only the current English private-entry surface and adds no new locale blocker.
- Stack-fit and dependency discipline:
  - reuse current Next.js, Tailwind, brand-image, and contact-flow patterns only.
- Scalability and cost efficiency:
  - avoid a new bespoke waitlist system for this route; reuse current contact path first.
- Migration and rollback readiness:
  - route-only UI refresh with no data migration; rollback is a normal code revert.
- Definition of done quant targets:
  - zero unexpected `500` on covered locked-route flows,
  - zero signed-in email/admin-status display on the refreshed route,
  - one visible primary unlock CTA and one clearly secondary notify CTA.
- Help/Guide and operator training documentation:
  - update required if any existing runbook/help text still describes `/preview-access` as an admin-first route surface; otherwise include explicit `N/A` rationale in the implementation PR.

## Help/Guide Impact

- Update likely required:
  - review `/Users/stianvikra/freeswimming/docs/runbooks/private-access-gate.md`
  - review `/Users/stianvikra/freeswimming/docs/runbooks/site-lock-operations.md`
- Rationale:
  - current operator-facing text references admin-first route guidance that may no longer match the visitor-facing route contract after this refresh, even if backend access policy remains unchanged.

## Security, Privacy, and Compliance

- Keep the route fail-closed.
- Do not expose signed-in email/admin eligibility on the locked page.
- Do not store or commit preview password values.
- Do not imply that the notify CTA is an authorization path.

## Observability and KPI Contract

- No new instrumentation is required for the first implementation pass.
- If CTA measurement is later needed, reuse existing first-party event patterns and keep payloads free of email/password values.

## Session Continuity And Recovery

- Canonical recovery order:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint

## Git Rhythm Defaults

- Commit after local validation for this isolated slice.
- Push after `npm run verify:pre-pr` passes.

## Automation Mode

- `automation-first`

## Branch Hygiene Defaults

- Post-merge cleanup:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`

## PR Browser Rule

- Default PR/review/merge links open in Safari.

## Manual QA URL Rule

- Default UI QA URL for this slice:
  - `/preview-access?next=%2F`

## Checkpoint Log

- `2026-04-17 | working tree | created planned brief for a brand-forward, visitor-facing /preview-access refresh that removes admin-help/status UI, keeps password as the primary unlock action, and adds a secondary early-access notify CTA via the existing contact flow | next: move brief to in-progress when implementation starts, refresh the route UI, update targeted tests, and validate the private-gate flow`
- `2026-04-17 | implementation start | moved brief to in-progress on branch preview-access-brand-forward-visitor-facing and started route/contact-flow updates for the brand-forward locked-page refresh | next: finish UI + contact variant changes, update tests/runbooks, and run validation`
- `2026-04-17 | implementation checkpoint | refreshed /preview-access into a brand-forward visitor-facing route, removed the admin/status card, added a preview-updates contact variant plus site-lock bypass for /contact and /api/contact, updated runbooks/tests, and validated with npm run lint:briefs:all, npx vitest run tests/unit/contact-form.test.tsx tests/unit/site-lock-session.test.ts, targeted contact/private-gate Playwright coverage, and a full npm run verify:pre-pr PASS; local plain preview password is not present in env files, so the required password-backed private-gate rerun still needs owner-provided PW_SITE_LOCK_PASSWORD before final merge recommendation | next: commit, push, open PR, watch CI, then rerun verify:pre-merge with available credentials and keep merge-readiness conditional on the missing password-backed gate`
