# Admin Email Template Governance Runbook

## Purpose

Run safe, auditable template copy changes without ad-hoc edits in code or provider consoles.

## Scope

- Admin message templates managed through lifecycle states:
  - `draft`
  - `review`
  - `published`
- Publish and rollback operations with audit evidence.

## Out Of Scope

- Provider migration or marketing automation redesign.
- Runtime secret handling in template content.

## Roles

- `editor`: updates draft copy and preview inputs.
- `reviewer`: validates quality, links, and placeholder integrity (editor/admin role).
- `publisher`: publishes approved drafts and executes rollback when needed (admin role).
- `support`: confirms active version and rollback path during incidents.

## Template Contract Baseline

- Every template has stable key + version metadata:
  - `templateKey`
  - `version`
  - `status`
  - `updatedBy`
  - `updatedAt`
- Placeholder syntax is explicit: `{{placeholder_name}}`.
- Publish must fail if required placeholders are missing or unknown placeholders are introduced.
- Draft/review content must not include secrets, tokens, or direct PII payload dumps.

## Standard Workflow

1. Open template and create/edit `draft`.
2. Run validation:
   - required placeholders present,
   - no unknown placeholders,
   - non-empty subject/body and valid link format.
3. Render preview with representative sample data.
   - Provide sample JSON values for key placeholders.
   - Use fallback defaults only as preview aid, not as production data contract.
4. Move draft to `review`.
5. Reviewer approves for publish.
6. Publisher (admin) publishes reviewed version.
7. Verify send path uses the new `published` version.

## Rollback Workflow

1. Identify last known-good published version in audit history.
2. Revert publish target to that version.
3. Re-run preview/send verification.
4. Record rollback reason and follow-up owner.

## QA/Test Artifact Hygiene

- Automated QA/template-preview runs must use explicit test keys only:
  - canonical prefix: `e2e_admin_email_template_*`
- Legacy residue from older preview coverage may still appear as:
  - `aw012_publish_fallback_*`
- These keys are test artifacts, not operator-owned templates.
- Cleanup rule:
  - only purge rows that match the explicit QA/test key contract,
  - never delete normal operator keys such as `auth_login_code`.
- Recovery expectation:
  - the protected QA cleanup path should be run before/after automated preview coverage,
  - if old legacy QA rows are found in production, purge only those explicit keys and re-check the template list afterward.

## Incident Support Checklist (<=5 min target)

1. Identify affected `templateKey`.
2. Confirm active `published` version.
3. Confirm last change actor/time/reason.
4. Execute rollback if needed.
5. Record incident note with:
   - affected template,
   - reverted version,
   - timestamp,
   - operator.

## Evidence To Capture Per Publish/Revert

- Template key.
- Version before/after.
- Actor and timestamp.
- Validation + preview result.
- Publish/revert reason.
