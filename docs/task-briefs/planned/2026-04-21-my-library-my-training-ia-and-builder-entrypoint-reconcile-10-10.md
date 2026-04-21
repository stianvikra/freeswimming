# Task Brief: My Library My Training IA And Builder Entrypoint Reconcile (10/10)

## Metadata

- `id`: `2026-04-21-my-library-my-training-ia-and-builder-entrypoint-reconcile-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-04-21`
- `updated`: `2026-04-21`

## Goal

Clarify the broader My Library/My Training information architecture so swim sessions, dryland builder, program builder preview, profile, and account surfaces are named and placed consistently.

## Sequencing Lock

- Run after the narrower My Swim Profile and Account & Security briefs unless this brief is used first as a discovery-only IA pass.
- Run before maintenance baseline unless explicitly deferred.
- Do not use this brief to implement all child cleanups in one large PR.

## Why This Brief Exists

- Owner raised possible IA changes:
  - add `My Profile`,
  - place Account/Security inside profile if kept,
  - change `Athlete Profile` to `Swimmer Profile`,
  - put goals/focus/notes inside profile,
  - consider `Overview -> My Training`,
  - reconcile Swim session builder, Dryland builder, and Program builder preview.
- These decisions are broader than one page cleanup and should be planned before maintenance work resumes.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                              | Evidence                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | My Library/My Training route map has clear jobs, labels, hierarchy, and builder entrypoints without duplicated concepts.    | IA map and route review                | `5/5`                   |
| UX flow clarity                               | `target`     | Users can find profile, saved sessions, builders, and training areas with fewer ambiguous labels and no dead-end paths.     | manual QA and screenshots              | `5/5`                   |
| Visual design quality                         | `target`     | Navigation and entrypoint surfaces follow the current clean builder/profile/card style across mobile and desktop.           | screenshot review                      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | IA changes do not break saved sessions, profile data, program/dryland access, route params, or existing user data.          | route tests and data audit             | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes owner-facing navigation/IA, not admin editing or publishing workflows.                             | explicit scope rationale               | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Navigation labels, tab order, current-page state, and focus behavior remain clear across changed route entrypoints.         | semantic review                        | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: IA changes must not add route-level payload bloat or slow `/my-library`.                                   | build/perf review                      | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Moving entrypoints does not move data ownership; server/local boundaries are documented for each touched domain.            | data-boundary review                   | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: route/link changes must not create stale lists or broken back navigation.                                  | route QA                               | `4/5`                   |
| Reliability and failure handling              | `target`     | Empty/loading/error states remain reachable and clear for profile, sessions, builders, and training overview paths.         | targeted QA                            | `5/5`                   |
| Security and authz                            | `target`     | Protected My Library/My Training routes remain authenticated and no account/profile data is exposed through new links.      | auth route tests                       | `5/5`                   |
| Privacy and compliance                        | `target`     | Personal profile, records, focus, notes, and account data remain private and minimized.                                     | privacy review                         | `5/5`                   |
| Content governance                            | `target`     | Route labels such as `My Swim Profile`, `My Training`, and builder names have one canonical naming contract.                | label inventory                        | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD/status workflow changes.                                                                          | explicit scope rationale               | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is authenticated My Library/My Training IA with no public crawl contract.                                  | explicit scope rationale               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content surface or structured data changes.                                           | explicit scope rationale               | `N/A`                   |
| Analytics and KPI observability               | `target`     | Existing navigation/action events are preserved or renamed deliberately with migration notes.                               | event taxonomy review                  | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: IA must not hide entitlement/billing paths if they remain required for paid access.                        | commerce link audit                    | `4/5`                   |
| Incident response and support operations      | `target`     | Support can describe where users find profile, sessions, builders, account/billing, and training overview after IA changes. | support/help note                      | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this IA brief does not modify invoice, payout, reconciliation, or financial reporting logic.                    | explicit scope rationale tied to scope | `N/A`                   |
| i18n operational readiness                    | `target`     | Canonical labels avoid mixed terminology and can be translated later without duplicate concepts.                            | copy inventory review                  | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing routing, tabs, cards, and nav components; add no dependency.                                                 | dependency diff                        | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests cover changed navigation, back links, protected routes, and mobile/desktop entrypoints.                               | targeted tests and verify gates        | `5/5`                   |
| Scalability and cost efficiency               | `target`     | IA creates a stable place for future swim/dryland/program surfaces without one-off navigation sprawl.                       | IA review                              | `5/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: changes should be split into reversible child PRs with no schema migration unless separately briefed.      | PR slicing plan                        | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - user identity,
  - saved sessions,
  - profile/preferences/records,
  - training focus/goals/notes where server-backed,
  - entitlements if referenced.
- Local-only:
  - transient navigation state only.
- Sync policy:
  - IA changes must not change persistence or sync semantics.
- Retention and sensitivity:
  - no new exposure of personal training/account data.
- Cache/invalidation:
  - route transitions/back links should not show stale builder/profile state.

## Identity And Rename Contract

- Canonical stable IDs:
  - existing user/session/program/profile IDs remain unchanged.
- Human-readable labels:
  - label candidates include `My Swim Profile`, `My Training`, `Swim session builder`, `Dryland builder`, and `Program builder`.
- Mutability:
  - route labels may change, stable data IDs must not.
- Compatibility:
  - route redirects/aliases are required if paths change.

## Scope

- Map current My Library/My Training route and entrypoint structure.
- Decide canonical labels and ownership for:
  - profile,
  - goals/focus/notes,
  - account/security,
  - saved sessions,
  - swim session builder,
  - dryland builder,
  - program builder preview.
- Produce narrow implementation slices if more than one route changes.

## Out Of Scope

- Implementing all child IA changes in one PR.
- New builder features.
- Account/Security auth changes unless coordinated with its dedicated brief.
- Billing verification.

## Acceptance Criteria

1. A route/IA map exists for My Library/My Training.
2. Canonical labels are documented and applied to changed surfaces.
3. Builder entrypoints are findable and not duplicated confusingly.
4. Profile/account/training concepts are separated or grouped deliberately.
5. Mobile and desktop navigation remain consistent.
6. Any route path changes have redirects or compatibility coverage.

## Validation

- `npm run lint:briefs`
- targeted route/navigation tests
- protected route tests
- screenshot handoff for changed IA surfaces
- owner approval before PR gate
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Local and Vercel preview.
- My Library.
- My Swim Sessions.
- Profile/training/account surfaces.
- Mobile and desktop.

## Design Constraints

- Follow the cleaner My Swim Sessions and builder action-density work.
- Avoid adding another floating menu.
- Use concise labels over explanatory paragraphs.

## Help/Guide Impact

- Required if route names, user workflow names, or account/profile locations change.

## Checkpoint Log

- `2026-04-21 | planned | created from owner IA findings around My Profile, My Training, builder entrypoints, and account/profile grouping | next: implement discovery/IA pass or defer before maintenance baseline`
