"use client";

import { ADMIN_NOTE_TEST_ARTIFACT_PREFIX } from "@/lib/admin/admin-note-test-artifacts";

type TabGuide = {
  name: string;
  primaryJob: string;
  commonRisk: string;
};

type Playbook = {
  title: string;
  steps: string[];
};

type ActionGroup = {
  section: string;
  actions: Array<{ label: string; meaning: string }>;
};

const LAST_UPDATED = "2026-04-06";

const QUICK_ACTIONS = [
  { id: "overview", label: "Start here" },
  { id: "learning-path", label: "Learning path" },
  { id: "tabs", label: "Dashboard tabs" },
  { id: "content-page", label: "Content workflow" },
  { id: "qr-links", label: "QR workflow" },
  { id: "email-templates", label: "Email templates" },
  { id: "buttons", label: "Buttons explained" },
  { id: "quality-matrix", label: "10/10 matrix" },
  { id: "controls", label: "Doc controls" },
  { id: "services", label: "Connected services" },
  { id: "playbooks", label: "Daily playbooks" },
  { id: "troubleshoot", label: "Troubleshoot" },
  { id: "change-log", label: "Change governance" },
];

const DASHBOARD_TABS: TabGuide[] = [
  {
    name: "Content",
    primaryJob: "Create, edit, review, publish, and archive content records safely.",
    commonRisk: "Wrong status or wrong order can publish incomplete learning flow.",
  },
  {
    name: "QR Links",
    primaryJob: "Manage stable short links and downloadable QR files for campaigns and lessons.",
    commonRisk: "Wrong destination or status can send users to broken/non-live pages.",
  },
  {
    name: "Commerce",
    primaryJob: "Keep product labels/slugs aligned with active sales setup.",
    commonRisk: "Mismatch between product setup and checkout configuration.",
  },
  {
    name: "Operations",
    primaryJob: "Control runtime flags and private-access lock behavior.",
    commonRisk: "Flag changes without verification can hide or expose routes unexpectedly.",
  },
  {
    name: "Email templates",
    primaryJob:
      "Manage lifecycle-safe email copy with placeholder validation and publish controls.",
    commonRisk: "Publishing template text with invalid placeholders can break outbound messages.",
  },
  {
    name: "Notes",
    primaryJob:
      "Run an internal work queue with visible note IDs, priority, screenshots, related-note links, context filters, and done archive recovery.",
    commonRisk:
      "Hidden context, missing screenshots, or mixed open/done queues make the next operator pick the wrong note.",
  },
  {
    name: "Categories",
    primaryJob: "Maintain category taxonomy used by content and notes workflows.",
    commonRisk: "Inconsistent naming makes filtering and reporting noisy.",
  },
  {
    name: "Help/Guide",
    primaryJob: "Learn workflows, recovery steps, and operational ownership.",
    commonRisk: "Outdated guidance causes avoidable operator mistakes.",
  },
];

const LEARNING_PATH = [
  {
    title: "Step 1: Understand structure (5 min)",
    detail:
      "Read Dashboard tabs, then Content workflow. This gives you a shared mental model before editing anything.",
  },
  {
    title: "Step 2: Safe content edit cycle (10 min)",
    detail:
      "In Content tab: draft -> review -> preview -> publish. Use revisions for rollback if needed.",
  },
  {
    title: "Step 3: QR publishing cycle (10 min)",
    detail:
      "In QR Links: create slug, verify destination, activate, test stable link, then download QR files.",
  },
  {
    title: "Step 4: Email template governance cycle (10 min)",
    detail:
      "In Email templates: create draft, validate placeholders, move to review, then let admin publish with rollback-ready history.",
  },
  {
    title: "Step 5: Recovery drill (5 min)",
    detail:
      "Practice one rollback flow: disable broken QR or restore a content revision and confirm public result.",
  },
];

const CONTENT_PAGE_FLOW = [
  {
    title: "Platform mirror snapshot",
    detail:
      "Shows if admin data aligns with platform data by group (modules, lessons, sessions, drills, products). Explicit QA/test slugs such as e2e-admin-content-* are excluded from parity counts and listed separately, and admins can purge them from the catalog. Click a card to focus content list.",
  },
  {
    title: "Course workspace (modules -> lessons)",
    detail:
      "Use this first for day-to-day course production. Overview mode shows all modules with compact lesson previews. The current `Module workspace` stays on top so active scope is always visible, and overview cards now also expose quick `Open lesson`, `Edit lesson`, `Delete lesson`, and `Delete module` actions. `Open module scope` switches to focus mode, where the selected module becomes the one primary lesson workspace below. Use `Show all modules` to return to overview. Lesson edits stay open after save so small follow-up fixes can be made without reopening the same row.",
  },
  {
    title: "Learner common mistakes visibility",
    detail:
      "When a lesson has authored `Common mistakes` and the section is enabled, learners see it by default. They can still hide it, and the hide/show choice is remembered locally per lesson in that browser.",
  },
  {
    title: "Course identity: slug vs runtime ID",
    detail:
      "Slug is the human-readable content key and can be renamed carefully. Module/lesson runtime IDs stay locked after creation. Rename in place only when it is still the same learning object; if the objective or topic changes materially, create a new module/lesson instead of repurposing the old one.",
  },
  {
    title: "Guide identity: slug vs runtime ID",
    detail:
      "Guide session/drill slugs are readable labels, not the canonical runtime identity. Session/drill runtime IDs are created once, stay locked after creation, and should never be repurposed for materially different guide content.",
  },
  {
    title: "All content list",
    detail:
      "Use this for cross-type audits and bulk filtering. Keep a single scope active when editing to reduce mistakes.",
  },
  {
    title: "Create content item form",
    detail:
      "Create new draft records safely before review/publish. Course lessons must now be linked to a parent module at creation so runtime context is locked from the start; use the course workspace button when you are already inside the right module.",
  },
  {
    title: "Status workflow",
    detail:
      "Draft = work in progress. Review = internal quality gate. Published = live for users. Archived = hidden but retained.",
  },
];

const QR_WORKFLOW = [
  {
    title: "Start with list-first overview",
    detail:
      "Use filters and search first to avoid duplicates. Open `New link` only when you need to create or patch a row.",
  },
  {
    title: "Use edit-surface QR for in-context work",
    detail:
      "Lesson/page/product edit screens now show linked QR rows plus a compact create/manage panel. Use this for context-aware editorial work, then open the full registry when you need broader search, asset generation, or cross-content auditing.",
  },
  {
    title: "Create from required fields first",
    detail:
      "Required block = slug + HTTPS destination + status. Keep status draft while verifying where it should point.",
  },
  {
    title: "Use advanced metadata only when needed",
    detail:
      "Advanced block is optional: content item, content label, placement key, and owner user id for traceability.",
  },
  {
    title: "Activate after verification",
    detail: "Switch to active only after destination and ownership fields are confirmed.",
  },
  {
    title: "Test stable link",
    detail: "Open `/go/v/<slug>` in a new tab and confirm it lands at the intended destination.",
  },
  {
    title: "Generate and download QR assets",
    detail: "Use Show QR, then download SVG/PNG for campaign or print surfaces.",
  },
  {
    title: "Rollback fast if something is wrong",
    detail:
      "Immediate rollback options: Disable status or restore a safe destination URL, then retest stable link.",
  },
];

const EMAIL_TEMPLATE_WORKFLOW = [
  {
    title: "Start in draft with explicit placeholder declarations",
    detail:
      "Write subject/body first, then declare required and optional placeholders so validation + preview rendering can enforce contract safety.",
  },
  {
    title: "Use review as internal quality gate",
    detail:
      "Move template to review before publish. This is where copy, locale, and placeholder usage should be peer-checked by editor/admin.",
  },
  {
    title: "Publish only after validation passes",
    detail:
      "Use preview with sample JSON (fallback defaults fill known tokens), then publish/revert via admin role; publish increments version and records operator metadata.",
  },
  {
    title: "Use lifecycle transitions intentionally",
    detail:
      "Allowed transitions protect production safety: draft/review/published/archived are not interchangeable shortcuts.",
  },
  {
    title: "Handle conflicts by reload-then-retry",
    detail:
      "If another operator updated a template first, reload latest state and re-apply your intended change.",
  },
];

const BUTTON_GUIDE: ActionGroup[] = [
  {
    section: "Content tab",
    actions: [
      {
        label: "Course Workspace / All Content tabs",
        meaning:
          "Course Workspace is the default production flow. All Content is for audits and cross-type filtering.",
      },
      {
        label: "Open module scope / Show all modules",
        meaning:
          "Switch between all-module overview and one focused module workspace. The active workspace selector stays on top so you can see or change current scope before scanning overview cards.",
      },
      {
        label: "Mirror snapshot cards",
        meaning: "Focuses list scope to the selected data group and jumps to the list workflow.",
      },
      {
        label: "Open lesson / Edit lesson / Delete lesson / Delete module",
        meaning:
          "Overview mode now supports quick lesson open/edit/delete actions inside each module card, plus module delete. Use focused module workspace when you need ordering, move controls, preview, or create in one place.",
      },
      {
        label: "Save changes / Cancel",
        meaning:
          "Save refreshes the open editor from the saved server row without closing it. Cancel exits the editor; if you changed something, confirm before leaving.",
      },
      {
        label: "Open preview",
        meaning: "Opens admin preview mode with clear preview banner and status context.",
      },
      {
        label: "Open lesson",
        meaning: "Opens public lesson page exactly as users see it.",
      },
      {
        label: "Revisions / Restore",
        meaning: "Inspect previous versions and restore the last known good state when needed.",
      },
      {
        label: "Move to draft / Move to review / Publish / Archive",
        meaning:
          "Moves item through lifecycle states with explicit intent. Publish/revert transitions require admin role.",
      },
      {
        label: "Delete",
        meaning: "Permanent remove. Use only when you are sure record should no longer exist.",
      },
      {
        label: "Clear focus",
        meaning: "Returns to broad view after finishing a focused edit sequence.",
      },
      {
        label: "Refresh / Retry",
        meaning: "Reloads latest server state or retries the same failed operation.",
      },
    ],
  },
  {
    section: "QR Links tab",
    actions: [
      {
        label: "New link / Hide new link",
        meaning:
          "Toggles the create panel so list/filter can stay primary while you audit existing rows.",
      },
      {
        label: "Create first QR link / Use example values",
        meaning:
          "Empty-state fast start. Loads practical starter values that you can edit before saving.",
      },
      {
        label: "Required / Advanced (optional)",
        meaning: "Required keeps common create flow short; Advanced holds traceability metadata.",
      },
      {
        label: "Filter by status / Search",
        meaning: "Narrow list to active/draft/disabled/archived rows or find by slug/destination.",
      },
      {
        label: "Copy link",
        meaning: "Copies stable redirect URL (`/go/v/<slug>`) for sharing/testing.",
      },
      {
        label: "Show QR",
        meaning: "Generates QR preview and unlocks SVG/PNG download buttons.",
      },
      {
        label: "Edit",
        meaning: "Updates slug, destination, status, and metadata for an existing row.",
      },
      {
        label: "More actions",
        meaning: "Opens lower-frequency actions so row-level primary actions stay clear.",
      },
      {
        label: "Activate / Disable",
        meaning: "Fast operational switch for live routing, grouped under More actions.",
      },
      {
        label: "Delete",
        meaning:
          "Permanent remove of QR row, grouped under More actions. Prefer disable when unsure.",
      },
    ],
  },
  {
    section: "Email templates tab",
    actions: [
      {
        label: "Create template",
        meaning:
          "Creates new template row in draft/review with placeholder validation and unique key+locale contract.",
      },
      {
        label: "Edit / Close editor",
        meaning:
          "Opens inline edit form for subject/body/placeholders/status and closes it when done.",
      },
      {
        label: "Show history / Hide history",
        meaning:
          "Toggles revision timeline view so operators can inspect actor/time/action before publish or rollback decisions.",
      },
      {
        label: "Move to Review / Move to Published / Move to Archived / Move to Draft",
        meaning:
          "Applies lifecycle transitions with optimistic concurrency checks to avoid silent overwrite.",
      },
      {
        label: "Save changes / Reset draft",
        meaning:
          "Save sends the current patch with conflict protection. Reset restores editor state from latest loaded row.",
      },
      {
        label: "Refresh",
        meaning:
          "Reloads server-canonical template list if another operator changed state or conflict warning appears.",
      },
    ],
  },
  {
    section: "Operations tab",
    actions: [
      {
        label: "Open lock operations workflow",
        meaning:
          "Opens GitHub Actions dispatch for lock_on/lock_off with audited deploy + smoke verification.",
      },
      {
        label: "Open password page",
        meaning: "Opens private-access page for gate behavior testing.",
      },
      {
        label: "Sign out this browser",
        meaning: "Clears local preview-gate session to re-test restricted access from clean state.",
      },
      {
        label: "Refresh",
        meaning: "Reloads operations snapshot and runtime flags from server.",
      },
    ],
  },
  {
    section: "Notes, Categories, and Commerce",
    actions: [
      {
        label: "Quick note",
        meaning:
          "Opens the lightweight quick-capture utility panel so you can save a route-aware note, stage up to six screenshots before save, and keep the page underneath interactive while you work.",
      },
      {
        label: "Collapse / Resume quick note",
        meaning:
          "Temporarily slides the quick-note draft out to the right edge without discarding text or the staged images. Reopen it from the slim edge handle when you are ready to continue.",
      },
      {
        label: "Use P0 template / Use P1 template / Use P2 template",
        meaning:
          "Prefills standardized incident structure. P0 = critical outage, P1 = major degradation with workaround, P2 = low-impact bug/UX issue.",
      },
      {
        label: "Open / Done archive / All + Search + Context filters",
        meaning:
          "Turns Notes into a work queue so operators can find the right note by ID, text, category, priority, route, or attached content context.",
      },
      {
        label: "Visible note ID / Open in Notes / Related note title",
        meaning:
          "Shows the stable canonical note identifier and the queue jump path back into full Notes. Related note titles use the same stable-ID jump so follow-up work can continue without guessing search text.",
      },
      {
        label: "Priority",
        meaning:
          "Marks urgency separately from category. Urgent/high notes should surface first in the work queue.",
      },
      {
        label: "Add images / Delete image",
        meaning:
          "Attach admin-only screenshots or other note images, or fall back here when clipboard paste is not the best fit. If a screenshot only exists in Codex chat, save the real file under `/.tmp/admin-note-imports/` and give Codex the note ID + file path for assistant-led attachment import. Delete must remove both note metadata and the underlying stored image.",
      },
      {
        label: "Paste image from clipboard / Upload images",
        meaning:
          "Makes image entry explicit: either copy a screenshot/image first and paste it from clipboard, or upload one or more files directly without relying on hidden keyboard memory.",
      },
      {
        label: "Link note / Remove link",
        meaning:
          "Connects related notes by stable note ID without merging them into one record. After linking, click the related note title to jump straight to that note in the queue.",
      },
      {
        label: "Save note / Save changes / Delete",
        meaning:
          "Creates, updates, or removes task notes with route/content context. Contextual `Add note` stays at the top of the panel and collapses once notes exist so you can review first, then reopen compose only when needed. Create and Quick note can stage up to six pasted/uploaded images before first save; successful Quick note saves stay ready for another note on the same locked context; Edit can add/remove more images and related-note links later.",
      },
      {
        label: "Save category / Delete",
        meaning: "Maintains taxonomy used by note/content filtering and dashboards.",
      },
      {
        label: "Save product",
        meaning: "Updates commerce display data used by sales surfaces.",
      },
    ],
  },
];

const QUALITY_MATRIX = [
  {
    category: "UX flow clarity",
    contract: "Every workflow has next step + rollback step in plain language.",
    where: "Learning path + playbooks + troubleshoot.",
  },
  {
    category: "UI/design",
    contract: "Scannable sections, short cards, no dense text blocks.",
    where: "All Help/Guide sections.",
  },
  {
    category: "Business logic + data integrity",
    contract: "Status and rollback guidance matches real state transitions.",
    where: "Content/QR workflows + button glossary.",
  },
  {
    category: "Security/privacy",
    contract: "No secrets in docs; no insecure bypass instructions.",
    where: "Controls + troubleshoot sections.",
  },
  {
    category: "Reliability + failure handling",
    contract: "Known failure modes map to deterministic recovery steps.",
    where: "Troubleshoot + runbook references.",
  },
  {
    category: "Admin workflow + editability",
    contract: "High-frequency actions explained with expected outcome.",
    where: "Button glossary.",
  },
  {
    category: "Testing/QA automation",
    contract: "Help text changes are backed by e2e assertions.",
    where: "`tests/e2e/admin-help-center.spec.ts`.",
  },
  {
    category: "Incident/support operations",
    contract: "Escalation and rollback path are explicit.",
    where: "Playbooks + troubleshoot + runbook links.",
  },
  {
    category: "i18n readiness",
    contract: "Copy avoids logic dependence on hardcoded phrasing.",
    where: "Governance controls + brief template checks.",
  },
  {
    category: "DevOps/rollback readiness",
    contract: "Workflow changes require Help + runbook alignment in same PR.",
    where: "Governance controls section.",
  },
];

const DOC_CONTROLS = [
  "If any admin label/button/workflow changes, update Help/Guide in the same PR.",
  "If recovery behavior changes, update relevant runbook in the same PR.",
  "If the change affects operators, add/refresh at least one help-center e2e assertion.",
  "Every new/updated brief must declare Help/Guide impact as: required update or explicit N/A with reason.",
  "Do not mark brief done if Help/Guide is stale for changed workflows.",
];

const CONNECTED_SERVICES = [
  {
    name: "Supabase",
    purpose: "Stores user/admin data and enforces data access policies.",
    caution: "Missing migrations create setup warnings or unavailable admin features.",
  },
  {
    name: "Stripe",
    purpose: "Handles payment and entitlement-related product flow.",
    caution: "Product/price alignment must be verified before publishing commerce changes.",
  },
  {
    name: "Vercel",
    purpose: "Hosts production and preview deployments.",
    caution: "Preview green does not replace required CI checks.",
  },
  {
    name: "GitHub Actions",
    purpose: "Runs required CI checks for merge safety.",
    caution: "Never merge with red required checks.",
  },
];

const DAILY_PLAYBOOKS: Playbook[] = [
  {
    title: "Publish new content safely",
    steps: [
      "Create/edit in draft first.",
      "Move to review and validate copy, status, and ordering.",
      "Open preview and verify key lesson/module pages.",
      "Publish only when checks are green.",
    ],
  },
  {
    title: "Run a safe QR release",
    steps: [
      "Search/filter registry first to confirm slug is not already in use.",
      "Open New link and complete required fields (slug + HTTPS destination + status).",
      "Attach metadata (content/placement/owner) for traceability.",
      "Activate and test stable URL (`/go/v/<slug>`).",
      "Download SVG/PNG and distribute only after link test passes.",
    ],
  },
  {
    title: "Rollback quickly",
    steps: [
      "For content: open revisions and restore last known good version.",
      "For QR: disable link immediately or restore safe destination.",
      "Retest public route and document the recovery in notes.",
    ],
  },
  {
    title: "Capture review notes with context",
    steps: [
      "Open the exact page/content row you are reviewing.",
      "Use `Quick note` when you want a lightweight admin note from the current surface without losing context.",
      "If you still need to scroll, click, or collect a screenshot before saving, collapse `Quick note`; the page stays interactive underneath and you can reopen the same draft from the docked edge handle on the right.",
      "If you navigate to another supported admin/context surface before saving, the same draft can follow you, but it stays attached to the original locked context shown in the panel.",
      "Page-level `Quick note` is intentionally available on supported public pages plus selected My Library hubs: `/my-library`, `goals`, `training`, `profile`, `workouts`, `dryland`, `generator`, and `security`, plus saved detail routes under `/my-library/workouts/<id>`, `/my-library/dryland/<id>`, and `/my-library/programs/<id>`.",
      "Use the top `Add note` section when you want full fields in place; if notes already exist it stays collapsed until you expand it again.",
      "If the note is already saved and you forgot the screenshot, open `Edit` in the contextual notes panel and upload the image there instead of recreating the note.",
      "Saved contextual notes now show the visible note ID, an `Open in Notes` jump, and related-note titles that jump into the full queue by stable note ID.",
      "If the issue is visual, copy the screenshot or image to your clipboard first, then use `Paste image from clipboard`, or choose `Upload images` if you already have the files.",
      "Fastest screenshot path is often: let Codex create the note first, open the direct note link, then paste or upload the screenshot yourself in Notes.",
      "You can stage up to six pre-save images on create flows, and repeated paste/upload appends instead of replacing the earlier screenshots.",
      "Remember that pasted or uploaded pre-save images stay local until note save and attachment upload both succeed; if clipboard access is blocked or no image is found, fall back to `Upload images`.",
      "If you need Codex to perform the attachment step, the chat image is discussion-only; save the real file under `/.tmp/admin-note-imports/` and give Codex the canonical note ID plus that staged file path.",
      "Codex-led staged imports should delete the local staging file after confirmed success and keep it in place if upload fails so recovery stays explicit.",
      "After a successful Quick note save, the panel stays open and ready for another note on the same locked context so you can keep capturing without reopening it.",
      "Saved image cards now show a stable evidence summary: image order, file type, file size, and upload date, without exposing raw storage paths.",
      `If a note title starts with \`${ADMIN_NOTE_TEST_ARTIFACT_PREFIX}\`, it is automated test residue and should clear automatically; if it stays open, use the admin-notes recovery runbook before deleting anything manually.`,
      "On mobile, the two image actions stay visible so you do not need to remember hidden paste shortcuts.",
      "Link any follow-up note instead of pasting duplicate text.",
      "Use Search + Priority + Context filters in Notes to reopen the same note quickly.",
      "Mark completion status once resolved, then use Done archive to confirm it is recoverable.",
    ],
  },
];

const RUNBOOK_LINKS = [
  "docs/runbooks/qr-redirect-operations.md",
  "docs/runbooks/site-lock-operations.md",
  "docs/runbooks/admin-notes-recovery.md",
  "docs/runbooks/admin-email-template-governance.md",
  "docs/runbooks/private-access-gate.md",
  "docs/runbooks/post-merge-local-sync.md",
  "docs/runbooks/ci-unblock.md",
];

export default function AdminHelpCenter() {
  return (
    <div className="space-y-6">
      <section
        className="rounded-2xl border border-slate-200 bg-white p-6"
        data-testid="admin-help-center"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Help/Guide</h2>
          <p className="text-xs font-medium text-slate-500">Last updated: {LAST_UPDATED}</p>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          This is the operator training surface for admin. Use it to learn daily workflows, avoid
          common mistakes, and recover quickly when something fails.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <a
              key={action.id}
              href={`#${action.id}`}
              className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {action.label}
            </a>
          ))}
        </div>
      </section>

      <section id="overview" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">What this dashboard is for</h3>
        <p className="mt-2 text-sm text-slate-700">
          Admin controls content, QR routing, product setup, and operational flags. If you do not
          have access, ask an owner to verify allowlist + role before troubleshooting UI behavior.
        </p>
      </section>

      <section id="learning-path" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">
          Operator learning path (first day)
        </h3>
        <div className="mt-3 space-y-3">
          {LEARNING_PATH.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
            >
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-700">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="tabs" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">
          Dashboard tabs and when to use them
        </h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {DASHBOARD_TABS.map((tab) => (
            <article
              key={tab.name}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
            >
              <p className="text-sm font-semibold text-slate-900">{tab.name}</p>
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Primary job:</span> {tab.primaryJob}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Common risk:</span> {tab.commonRisk}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="content-page" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">How the Content page works</h3>
        <p className="mt-2 text-sm text-slate-700">
          Work top-down: snapshot to workspace/list to row actions to create form.
        </p>
        <div className="mt-3 space-y-3">
          {CONTENT_PAGE_FLOW.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
            >
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-700">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="qr-links" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">How QR Links work</h3>
        <p className="mt-2 text-sm text-slate-700">
          QR Links is your stable redirect registry. Keep slugs stable, destinations verified, and
          status intentional.
        </p>
        <div className="mt-3 space-y-3">
          {QR_WORKFLOW.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
            >
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-700">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="email-templates" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">How Email Templates work</h3>
        <p className="mt-2 text-sm text-slate-700">
          Email Templates is lifecycle-safe message governance for operational copy that should not
          require code edits for every wording update.
        </p>
        <div className="mt-3 space-y-3">
          {EMAIL_TEMPLATE_WORKFLOW.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
            >
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-700">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="buttons" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">Buttons and what they do</h3>
        <p className="mt-2 text-sm text-slate-700">
          These meanings must stay aligned with real admin labels. Update this section whenever a
          label, action, or workflow changes.
        </p>
        <div className="mt-3 space-y-3">
          {BUTTON_GUIDE.map((group) => (
            <article
              key={group.section}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
            >
              <p className="text-sm font-semibold text-slate-900">{group.section}</p>
              <ul className="mt-2 space-y-2">
                {group.actions.map((action) => (
                  <li key={action.label} className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{action.label}:</span>{" "}
                    {action.meaning}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="edit-scope" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">What can be edited right now</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
            <p className="text-sm font-semibold text-emerald-900">Available now</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-emerald-900">
              <li>Create/edit/publish/archive content rows.</li>
              <li>Move/reorder module and lesson structure using safe workflows.</li>
              <li>Create/edit/activate/disable/delete QR registry rows.</li>
              <li>Generate/download QR assets (SVG/PNG) from registry rows.</li>
              <li>
                Create/edit/review/archive email templates with placeholder validation (admin role
                required for publish/revert).
              </li>
              <li>Maintain notes, categories, and commerce labels.</li>
              <li>Run revision restore and QR rollback operations.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-semibold text-amber-900">Guardrails</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-900">
              <li>Use draft/review before publish for non-trivial changes.</li>
              <li>Prefer disable over delete when operational risk is uncertain.</li>
              <li>
                Rename in place only for the same learning object; do not repurpose old lessons.
              </li>
              <li>Run required verify gates before PR update/merge.</li>
              <li>Update Help/Guide + runbook in same PR when workflow changes.</li>
            </ul>
          </article>
        </div>
      </section>

      <section id="quality-matrix" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">
          10/10 Help/Training quality coverage matrix
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          This matrix defines what must be documented for high-quality operator guidance.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-700">
                <th className="px-2 py-2 font-semibold">Category</th>
                <th className="px-2 py-2 font-semibold">Documentation contract</th>
                <th className="px-2 py-2 font-semibold">Where covered</th>
              </tr>
            </thead>
            <tbody>
              {QUALITY_MATRIX.map((row) => (
                <tr
                  key={row.category}
                  className="border-b border-slate-100 align-top text-slate-700"
                >
                  <td className="px-2 py-2 font-medium text-slate-900">{row.category}</td>
                  <td className="px-2 py-2">{row.contract}</td>
                  <td className="px-2 py-2">{row.where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="controls" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">
          Documentation controls (required)
        </h3>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-700">
          {DOC_CONTROLS.map((control) => (
            <li key={control}>{control}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-slate-700">
          Runbook references:{" "}
          {RUNBOOK_LINKS.map((path, index) => (
            <span key={path}>
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">
                {path}
              </code>
              {index < RUNBOOK_LINKS.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </section>

      <section id="services" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">Connected services</h3>
        <div className="mt-3 space-y-3">
          {CONNECTED_SERVICES.map((service) => (
            <article
              key={service.name}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
            >
              <p className="text-sm font-semibold text-slate-900">{service.name}</p>
              <p className="mt-1 text-sm text-slate-700">What it does: {service.purpose}</p>
              <p className="mt-1 text-sm text-slate-700">Watch out for: {service.caution}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="playbooks" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">Daily playbooks</h3>
        <div className="mt-3 space-y-3">
          {DAILY_PLAYBOOKS.map((playbook) => (
            <article
              key={playbook.title}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
            >
              <p className="text-sm font-semibold text-slate-900">{playbook.title}</p>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-slate-700">
                {playbook.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section id="troubleshoot" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">Troubleshoot fast</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-semibold text-amber-900">Admin setup warning appears</p>
            <p className="mt-1 text-sm text-amber-800">
              Apply latest migrations, refresh admin, then retest affected workflow.
            </p>
          </article>
          <article className="rounded-xl border border-rose-200 bg-rose-50 p-3">
            <p className="text-sm font-semibold text-rose-900">QR scan does not land correctly</p>
            <p className="mt-1 text-sm text-rose-800">
              Open stable link directly (`/go/v/&lt;slug&gt;`), disable or fix destination, then
              retest.
            </p>
          </article>
          <article className="rounded-xl border border-rose-200 bg-rose-50 p-3">
            <p className="text-sm font-semibold text-rose-900">Create or publish action fails</p>
            <p className="mt-1 text-sm text-rose-800">
              Read API error text, verify role/allowlist, and confirm required CI checks are green.
            </p>
          </article>
          <article className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-semibold text-amber-900">
              Clipboard paste is blocked, chat image is not enough, or image upload fails
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Confirm the screenshot was copied first. If clipboard access is blocked or upload
              still fails, keep the note ID, refresh Notes, and use Upload images. If the image
              only exists in Codex chat, save the real file under `/.tmp/admin-note-imports/` and
              give Codex the note ID + file path. Use the admin-notes recovery runbook if the
              state is still unclear.
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">Need escalation</p>
            <p className="mt-1 text-sm text-slate-700">
              Capture exact route, item id/slug, error text, and latest deployment/check status
              before escalating.
            </p>
          </article>
        </div>
      </section>

      <section id="change-log" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">Change governance and freshness</h3>
        <p className="mt-2 text-sm text-slate-700">
          Help/Guide is part of release quality. If workflow labels, behavior, or recovery steps
          change, update this page in the same PR and keep help e2e assertions aligned.
        </p>
      </section>
    </div>
  );
}
