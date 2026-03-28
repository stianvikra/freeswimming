# Core Flow Incident Response Runbook

## Purpose

Provide a deterministic first-response flow for production incidents on core routes:

- `/`
- `/course`
- `/my-library`
- `/admin`

## Severity Definitions

- `P0`: critical outage or unsafe behavior (users/admin cannot complete core actions, auth/entitlement failure, data corruption risk).
- `P1`: major degradation with workaround (core action possible but unreliable/slow/error-prone).
- `P2`: non-critical bug or UX defect with low operational impact.

## First 10 Minutes (Required)

1. Confirm scope:
   - route(s) affected,
   - user segment (public/signed-in/admin),
   - first seen time.
2. Capture evidence:
   - failing URL,
   - screenshot/video,
   - browser/device,
   - exact error message (no secrets).
3. Classify severity (`P0`, `P1`, `P2`) and assign owner.
4. Verify current deploy and checks:
   - open active production deployment in Vercel,
   - check latest `main` PR/commit checks on GitHub.
5. Pick immediate containment:
   - rollback deployment, or
   - disable risky behavior through existing runtime/admin controls.

## Route Triage Matrix

| Surface       | Primary failure signals                                             | First checks                                                                                |
| ------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `/`           | Blank render, nav broken, core CTA broken                           | Verify latest deployment, console/runtime errors, route load in desktop+mobile              |
| `/course`     | Lesson load fails, progress save fails, support card actions broken | Confirm `/api/course/content` and `/api/progress/course` behavior; validate auth path       |
| `/my-library` | Library list missing, entitlement mismatch, retry loops             | Confirm library reads + entitlement state and recent commerce changes                       |
| `/admin`      | Access gate loops, content mutations fail, save errors              | Confirm auth role path, admin API responses (`401/403` vs `500`), schema readiness warnings |

Additional `My Library` sub-route checks:

- `/my-library/goals` -> `/my-library/training`
  - confirm `Use as focus` and `Add note` links include a canonical `goalId` query param,
  - confirm opening the linked training route preselects the intended goal without mutating the goal row,
  - confirm existing local focus/note draft text is preserved when goal-prefill is applied.
- `/my-library/generator`
  - confirm `/api/my-library/generator-intake` returns owner-scoped `200` or fail-closed `401`,
  - confirm `/api/my-library/generator/session-draft` returns owner-scoped `200` for session target, `401` for unauthenticated reads, and explicit `422` when program target is chosen in this slice,
  - confirm `/api/my-library/workouts` and `/api/my-library/workouts/[workoutId]` return owner-scoped `200`, fail-closed `401`, and `404` for missing canonical workout ids,
  - confirm `/api/my-library/workouts/[workoutId]/export/pdf` returns owner-scoped printable `200`, fail-closed `401`, `404` for missing canonical workout ids, and `503` when the canonical workouts schema is not ready,
  - confirm the current-workout action strip can delete the workout in view without requiring the saved-workouts panel to be opened first,
  - confirm saved-workout row actions stay card-scoped (`Edit`, `Poolside PDF`, `Delete`) and do not open, print, or delete a different canonical workout than the one selected on that row,
  - confirm workout-editor PDF copy makes it obvious whether the opened tab reflects the saved canonical workout or the current unsaved local draft,
  - confirm stale/missing block copy names the affected source area (`profile`, `goals`, `focus`),
  - confirm refresh does not mutate saved My Library records,
  - confirm transient success notices clear on their own while error states stay visible until the owner resolves them,
  - confirm notes remain excluded from default intake prefill in v1,
  - confirm generated drafts stay local until explicit accept/save,
  - confirm accepted workouts reopen in the same generator editor without mutating another user's data.

## i18n Triage Overlay (When Locale Work Starts)

Add these checks when incident scope is locale-specific:

1. Confirm locale route resolution for affected URL (`default` vs target locale path).
2. Confirm fallback behavior when localized content is missing (no blank route or `500`) against:
   - `docs/decisions/locale-content-fallback-matrix.md`
3. Confirm canonical/metadata response is consistent with locale state.
4. Confirm analytics/event payload still carries stable non-locale identifiers.

## Containment And Rollback

1. If `P0` and recent deploy is suspected:
   - rollback in Vercel first,
   - re-test impacted route.
2. If mutation risk exists:
   - stop ongoing admin edits for impacted area,
   - preserve data integrity (no manual hot edits without traceability).
3. If issue is isolated and safe:
   - keep deploy and ship hotfix PR with explicit negative-path tests.

## Communication Contract

- Open one incident note with:
  - start in `/admin?tab=notes`,
  - keep the note in the default `Open` queue until mitigation is complete,
  - timestamp,
  - visible note ID,
  - taxonomy category (`Incident P0`, `Incident P1`, `Incident P2`, or `Incident Follow-up`),
  - severity,
  - owner,
  - user impact,
  - mitigation status.
- Update every 30 minutes until mitigated.
- Close incident with:
  - root cause,
  - fix PR link,
  - follow-up brief (if structural gap remains).

### Standard Incident Note Template (Admin -> Notes)

Use this exact structure in note body:

```text
Severity: P0|P1|P2
Surface: / | /course | /my-library | /admin
User impact:
First seen (UTC):
Owner:
Mitigation status: investigating | contained | resolved
Evidence:
Next update (UTC):
```

Notes:

- `Incident P0/P1/P2` categories should match selected severity.
- Use `Incident Follow-up` for post-incident cleanup tasks after mitigation.
- If the incident note is later marked done, use `Done archive` or note-ID search to recover it.

## Verification Gates Before Incident Closure

- Local gate: `npm run verify:pre-pr`
- Merge gate for fix branch: `npm run verify:pre-merge`
- Required PR checks green.
- Manual smoke on affected route(s) in production.

## Security/Privacy Guardrails

- Never paste secrets, raw tokens, or full personal data in incident notes.
- Keep logs/screenshots redacted.
- Unauthorized/forbidden paths must remain fail-closed (`401/403`), not downgraded for convenience.
