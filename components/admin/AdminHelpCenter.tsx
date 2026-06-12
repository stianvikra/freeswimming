"use client";

import { cx } from "@/components/ui/cx";
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

const LAST_UPDATED = "2026-06-11";

export const ADMIN_HELP_QUICK_ACTIONS = [
  { id: "overview", label: "Start here" },
  { id: "learning-path", label: "Learning path" },
  { id: "tabs", label: "Dashboard tabs" },
  { id: "content-page", label: "Content workflow" },
  { id: "qr-links", label: "QR workflow" },
  { id: "email-templates", label: "Email templates" },
  { id: "messages", label: "Messages" },
  { id: "analytics", label: "Analytics" },
  { id: "buttons", label: "Buttons explained" },
  { id: "quality-matrix", label: "10/10 matrix" },
  { id: "controls", label: "Doc controls" },
  { id: "services", label: "Connected services" },
  { id: "playbooks", label: "Daily playbooks" },
  { id: "troubleshoot", label: "Troubleshoot" },
  { id: "change-log", label: "Change governance" },
] as const;

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
    name: "Analytics",
    primaryJob:
      "Inspect privacy-safe tracked activity, funnel counts, current sales prompt activity, saved-workout guide prompt interest, saved-workout checkout handoffs, saved-workout completion/access signals, builder save-rate, generated sessions, template starts, route/product activity, and dashboard caveats.",
    commonRisk:
      "Treating dashboard counts as purchases, accounting records, revenue, Stripe reconciliation, or unique people instead of product activity signals.",
  },
  {
    name: "Email templates",
    primaryJob:
      "Manage lifecycle-safe email copy with placeholder validation and publish controls.",
    commonRisk: "Publishing template text with invalid placeholders can break outbound messages.",
  },
  {
    name: "Messages",
    primaryJob:
      "Read stored intake requests, triage status, archive/delete safely, and diagnose notification delivery.",
    commonRisk:
      "Treating email delivery as the source of truth can hide stored requests or failed notifications.",
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

const MESSAGE_WORKFLOW = [
  {
    title: "Start from stored app state",
    detail:
      "Messages are stored in the platform before user success. Use Messages to confirm receipt and diagnose notification state; the normal email inbox remains the v1 reply workspace.",
  },
  {
    title: "Triage without changing content",
    detail:
      "Use New, Read, Needs reply, Replied, Archived, and Deleted filters to manage workflow state. Original message content stays immutable except later redaction/delete workflows.",
  },
  {
    title: "Prefer archive before delete",
    detail:
      "Archive is the reversible default for done/no-action messages. Move to Deleted only when you intentionally want it out of the active workflow; restore brings it back as New.",
  },
  {
    title: "Diagnose notification issues",
    detail:
      "Check notification status and delivery attempts to answer whether the platform received the request and whether provider notification was accepted, disabled, or failed. A failed notification never means the stored request is lost.",
  },
];

const ANALYTICS_WORKFLOW = [
  {
    title: "Know the dashboard words",
    detail:
      "A logged action is one counted thing that happened, such as a page view, a button click, or a checkout handoff. Event is the technical name for the same thing. Read limit means the dashboard stopped at a safe maximum number of stored records. Setup missing means the analytics storage is not ready, so numbers stay hidden instead of guessed.",
  },
  {
    title: "Start with data health",
    detail:
      "Check range, generated time, last activity, setup state, and read limit before reading any dashboard number. Capped or setup-missing data must be treated as incomplete.",
  },
  {
    title: "Use the top summary for a quick pulse",
    detail:
      "Total tracked actions, public aggregate, known users, browser/server split, and checkout rate answer whether safe tracking is active in the selected range.",
  },
  {
    title: "Read builder starts and saves as product activity",
    detail:
      "Started shows how often the builder was opened. Saved shows how often a workout was saved. A person can create more than one tracked action, so this is not unique people, purchases, checkout performance, or revenue.",
  },
  {
    title: "Read current sales prompts as prompt activity",
    detail:
      "Shown means a current sales prompt on Plans or My Library appeared. Clicked means someone clicked it. Checkout cancelled means someone returned from checkout. Clicks are not purchases, and checkout cancelled does not mean every other visitor declined.",
  },
  {
    title: "Read the saved-workout guide prompt as interest",
    detail:
      "Shown means the Poolside guide prompt appeared after a workout was saved. Clicked means someone clicked that prompt. Needs review means some logged actions do not match the approved prompt setup yet. These numbers are not purchases, access grants, revenue, accounting records, or unique people.",
  },
  {
    title: "Use Poolside guide stage summary as a quick path view",
    detail:
      "The stage summary lines up shown, clicked, checkout handoff, completed checkout, and access granted for the approved saved-workout guide path. Rates are selected-range event counts, not unique-user conversion, revenue, Stripe reconciliation, accounting records, or finance reporting. Use the detailed panels for rows that need review.",
  },
  {
    title: "Read saved-workout checkout handoffs as checkout start only",
    detail:
      "Checkout handoffs mean the approved saved-workout guide path reached checkout start. Needs review means some checkout-start actions do not match that approved path yet. These numbers are not purchases, access grants, revenue, accounting records, or unique people.",
  },
  {
    title: "Read saved-workout access as product support signal",
    detail:
      "Completed checkout means Stripe reported a supported completion event for the approved saved-workout guide path. Access granted means the app recognized access after fulfillment. Needs review stays out of the main numbers and may show safe reasons like source not mapped, placement not mapped, product not mapped, missing attribution, access pending, or access before checkout. Treat those as aggregate support diagnostics only, not provider failure, entitlement failure, revenue, Stripe reconciliation, accounting records, refunds, payouts, invoices, or unique people.",
  },
  {
    title: "Read manual vs generated workouts side by side",
    detail:
      "Manual starts and saves show hands-on builder activity. Generated drafts and saves show AI-assisted activity. Needs review means saved workouts are missing a supported type. These rates are product activity only, not exports, purchases, revenue, or accounting evidence.",
  },
  {
    title: "Read generated sessions and template starts separately",
    detail:
      "Generated sessions show how often generated drafts became saved workouts. Template starts count only the Use template action. Do not infer template use from nearby labels, generated drafts, or saved workouts.",
  },
  {
    title: "Read funnel as product signal only",
    detail:
      "Plans, product, checkout, and access counts are useful for product review. They do not replace Stripe, accounting reports, refunds, invoices, payouts, or revenue records.",
  },
  {
    title: "Use top lists for direction, not raw investigation",
    detail:
      "Top tracked actions, routes, and products show safe labels for direction. The dashboard intentionally does not show raw technical payloads, raw URLs, emails, IPs, user agents, visitor IDs, notes, cart details, or payment/shipping data.",
  },
  {
    title: "Respect the public privacy boundary",
    detail:
      "Public aggregate traffic is not linked to signed-in user profiles, even when the same browser may later authenticate. Values marked as needing review should stay out of decisions until reviewed.",
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
    section: "Messages tab",
    actions: [
      {
        label: "Status filters / Source / Search",
        meaning:
          "Narrows the stored inbox by workflow state, intake source, submitter, or message excerpt without exposing private message content outside admin.",
      },
      {
        label: "Mark read / Mark unread",
        meaning:
          "Changes only the admin workflow state. It does not alter the original request or provider delivery evidence.",
      },
      {
        label: "Needs reply / Mark replied",
        meaning:
          "Flags that the normal email inbox should handle the response, then records that the email reply is done. Dashboard reply compose/outbound log is deferred in v1.",
      },
      {
        label: "Open hello inbox",
        meaning:
          "Opens the One.com inbox for hello@freeswimming.org in a new tab using the browser's One.com session. It is navigation only; send the reply in email, then return to Messages and mark the row replied.",
      },
      {
        label: "Archive / Restore",
        meaning:
          "Moves a message out of active triage and brings archived/deleted messages back as New when needed.",
      },
      {
        label: "Move to deleted / Confirm delete",
        meaning:
          "Soft-deletes the message from active workflow after confirmation. The inbox child does not hard-delete or redact stored content.",
      },
      {
        label: "Refresh / Load older",
        meaning:
          "Reloads latest server-canonical state or fetches the next newest-first page without changing filters.",
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
    section: "Analytics tab",
    actions: [
      {
        label: "7 days / 30 days / 90 days",
        meaning:
          "Switches the bounded read range only. It does not write analytics rows, browser tracking state, cookies, visitor IDs, or admin preferences.",
      },
      {
        label: "Refresh / Retry",
        meaning:
          "Reloads the same selected range from the admin insights endpoint. Use it after deploys, migrations, or quiet periods to confirm freshness.",
      },
      {
        label: "Data health states",
        meaning:
          "Fresh means recent tracked activity exists. Quiet means no recent tracked activity is visible. Capped means totals may be incomplete. Setup missing means analytics storage is not ready. No data yet means the selected range has no matching records.",
      },
      {
        label: "Started / Saved / Save rate",
        meaning:
          "Shows builder starts, saved workouts, and save rate for the selected range. It is useful for builder review, not purchases, revenue, exports, or unique people.",
      },
      {
        label: "Current sales prompts",
        meaning:
          "Shows how often current sales prompts on Plans and My Library were shown, clicked, or returned from checkout. Use it as prompt activity only, not purchase, access, revenue, or accounting evidence.",
      },
      {
        label: "Poolside guide stage summary",
        meaning:
          "Shows shown, clicked, checkout handoff, completed checkout, and access granted together for the approved saved-workout guide path. Rates are event-count ratios only, not unique people, revenue, Stripe reconciliation, accounting evidence, or finance reporting.",
      },
      {
        label: "Poolside guide prompt",
        meaning:
          "Shows how often the Poolside guide prompt was shown and clicked after a workout was saved. Needs review stays out of the main numbers until reviewed, and none of these values mean purchase, access, revenue, or accounting evidence.",
      },
      {
        label: "Poolside guide checkout",
        meaning:
          "Shows checkout handoffs from the approved saved-workout guide path. Needs review stays out of the main number until reviewed, and these values do not mean purchase, access, revenue, accounting evidence, or unique people.",
      },
      {
        label: "Poolside guide access",
        meaning:
          "Shows completed checkout and app-recognized access for the approved saved-workout guide path. Needs review can show safe aggregate reasons such as product not mapped or access pending, and these values do not mean provider failure, entitlement failure, revenue, Stripe reconciliation, accounting evidence, refunds, payouts, invoices, or unique people.",
      },
      {
        label: "Generated sessions / Template starts",
        meaning:
          "Shows generated drafts, generated saves, and template starts. Template starts count only the Use template action, and items that need review stay out of template totals until reviewed.",
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
  {
    name: "Message delivery",
    purpose:
      "Sends admin notifications after a message is stored; provider status is shown as diagnostics, not as message identity.",
    caution:
      "A disabled or failed notification does not mean the platform lost the request; check Messages first.",
  },
  {
    name: "First-party analytics",
    purpose:
      "Stores sanitized aggregate/product/funnel/upsell logged actions and renders read-only admin insights without third-party scripts.",
    caution:
      "Do not treat dashboard counts, including sales prompt clicks and checkout-cancel returns, as accounting records, unique-person tracking, or approval for cookies/vendor tracking.",
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
      "Page-level `Quick note` is intentionally available on supported public pages plus selected My Library hubs: `/my-library`, `goals`, `training`, `routines`, `habits`, `profile`, `workouts`, `dryland`, and `generator`, plus saved detail routes under `/my-library/workouts/<id>`, `/my-library/dryland/<id>`, and `/my-library/programs/<id>`.",
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
  {
    title: "Triage inbound messages",
    steps: [
      "Open Messages and scan New first.",
      "Use Source and Search to find the relevant intake request.",
      "Open detail and confirm stored content plus notification diagnostics.",
      "Move to Needs reply when a human response is required, reply from the normal email inbox, then return and Mark replied.",
      "Archive when no action is needed.",
      "Use Deleted only for intentionally removed workflow items; restore if the message was moved by mistake.",
    ],
  },
];

const RUNBOOK_LINKS = [
  "docs/runbooks/qr-redirect-operations.md",
  "docs/runbooks/site-lock-operations.md",
  "docs/runbooks/admin-notes-recovery.md",
  "docs/runbooks/admin-message-inbox.md",
  "docs/checklists/admin-message-v1-pre-live-smoke.md",
  "docs/runbooks/admin-email-template-governance.md",
  "docs/runbooks/public-analytics-privacy-assessment.md",
  "docs/runbooks/private-access-gate.md",
  "docs/runbooks/post-merge-local-sync.md",
  "docs/runbooks/ci-unblock.md",
];

const helpHeroClass = "fs-library-card fs-library-card-accent p-4 sm:p-5";
const helpSectionClass = "fs-library-card scroll-mt-28 p-4 sm:p-5";
const helpQuickActionClass =
  "fs-cta-secondary inline-flex min-h-9 items-center justify-center px-3 text-xs font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const helpItemClass =
  "rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/75 p-3";
const helpCalloutClass = "rounded-[var(--fs-radius-control)] border p-3";
const helpHeadingClass = "text-base font-semibold text-[color:var(--fs-color-ink-strong)]";
const helpHeroHeadingClass = "text-lg font-semibold text-[color:var(--fs-color-ink-strong)]";
const helpItemTitleClass = "text-sm font-semibold text-[color:var(--fs-color-ink-strong)]";
const helpBodyClass = "mt-2 text-sm leading-6 text-[color:var(--fs-color-muted)]";
const helpItemBodyClass = "mt-1 text-sm leading-6 text-[color:var(--fs-color-muted)]";
const helpStrongClass = "font-semibold text-[color:var(--fs-color-ink-strong)]";
const helpListClass = "mt-2 list-inside list-disc space-y-1 text-sm leading-6";
const helpCodeClass =
  "rounded-[var(--fs-radius-control)] bg-white/80 px-1.5 py-0.5 text-xs text-[color:var(--fs-color-ink-strong)] ring-1 ring-[color:var(--fs-border-soft)]";

export default function AdminHelpCenter() {
  return (
    <div className="space-y-6">
      <section className={helpHeroClass} data-testid="admin-help-center">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className={helpHeroHeadingClass}>Help/Guide</h2>
          <p className="text-xs font-semibold text-[color:var(--fs-color-muted)]">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
        <p className={`${helpBodyClass} max-w-3xl`}>
          This is the operator training surface for admin. Use it to learn daily workflows, avoid
          common mistakes, and recover quickly when something fails.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
          {ADMIN_HELP_QUICK_ACTIONS.map((action) => (
            <a
              key={action.id}
              href={`#${action.id}`}
              className={helpQuickActionClass}
              data-testid={`admin-help-quick-action-${action.id}`}
            >
              {action.label}
            </a>
          ))}
        </div>
      </section>

      <section id="overview" className={helpSectionClass}>
        <h3 className={helpHeadingClass}>What this dashboard is for</h3>
        <p className={helpBodyClass}>
          Admin controls content, QR routing, product setup, and operational flags. If you do not
          have access, ask an owner to verify allowlist + role before troubleshooting UI behavior.
        </p>
      </section>

      <section id="learning-path" className={helpSectionClass}>
        <h3 className={helpHeadingClass}>Operator learning path (first day)</h3>
        <div className="mt-3 space-y-3">
          {LEARNING_PATH.map((item) => (
            <article key={item.title} className={helpItemClass}>
              <p className={helpItemTitleClass}>{item.title}</p>
              <p className={helpItemBodyClass}>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="tabs" className={helpSectionClass}>
        <h3 className={helpHeadingClass}>Dashboard tabs and when to use them</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {DASHBOARD_TABS.map((tab) => (
            <article key={tab.name} className={helpItemClass}>
              <p className={helpItemTitleClass}>{tab.name}</p>
              <p className={helpItemBodyClass}>
                <span className={helpStrongClass}>Primary job:</span> {tab.primaryJob}
              </p>
              <p className={helpItemBodyClass}>
                <span className={helpStrongClass}>Common risk:</span> {tab.commonRisk}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="content-page" className={helpSectionClass}>
        <h3 className={helpHeadingClass}>How the Content page works</h3>
        <p className={helpBodyClass}>
          Work top-down: snapshot to workspace/list to row actions to create form.
        </p>
        <div className="mt-3 space-y-3">
          {CONTENT_PAGE_FLOW.map((item) => (
            <article key={item.title} className={helpItemClass}>
              <p className={helpItemTitleClass}>{item.title}</p>
              <p className={helpItemBodyClass}>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="qr-links" className={helpSectionClass}>
        <h3 className={helpHeadingClass}>How QR Links work</h3>
        <p className={helpBodyClass}>
          QR Links is your stable redirect registry. Keep slugs stable, destinations verified, and
          status intentional.
        </p>
        <div className="mt-3 space-y-3">
          {QR_WORKFLOW.map((item) => (
            <article key={item.title} className={helpItemClass}>
              <p className={helpItemTitleClass}>{item.title}</p>
              <p className={helpItemBodyClass}>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="email-templates" className={helpSectionClass}>
        <h3 className={helpHeadingClass}>How Email Templates work</h3>
        <p className={helpBodyClass}>
          Email Templates is lifecycle-safe message governance for operational copy that should not
          require code edits for every wording update.
        </p>
        <div className="mt-3 space-y-3">
          {EMAIL_TEMPLATE_WORKFLOW.map((item) => (
            <article key={item.title} className={helpItemClass}>
              <p className={helpItemTitleClass}>{item.title}</p>
              <p className={helpItemBodyClass}>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="messages" className={helpSectionClass}>
        <h3 className={helpHeadingClass}>How Messages work</h3>
        <p className={helpBodyClass}>
          Messages is the source-of-truth safety net for stored public intake requests and
          notification diagnostics. The normal email inbox remains the v1 reply workspace.
        </p>
        <div className="mt-3 space-y-3">
          {MESSAGE_WORKFLOW.map((item) => (
            <article key={item.title} className={helpItemClass}>
              <p className={helpItemTitleClass}>{item.title}</p>
              <p className={helpItemBodyClass}>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="analytics" className={helpSectionClass}>
        <h3 className={helpHeadingClass}>How Analytics works</h3>
        <p className={helpBodyClass}>
          Analytics is a read-only operational dashboard over sanitized first-party logged actions.
          Use it for product and support direction, not money records or tracking individual public
          visitors.
        </p>
        <div className="mt-3 space-y-3">
          {ANALYTICS_WORKFLOW.map((item) => (
            <article key={item.title} className={helpItemClass}>
              <p className={helpItemTitleClass}>{item.title}</p>
              <p className={helpItemBodyClass}>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="buttons" className={helpSectionClass}>
        <h3 className={helpHeadingClass}>Buttons and what they do</h3>
        <p className={helpBodyClass}>
          These meanings must stay aligned with real admin labels. Update this section whenever a
          label, action, or workflow changes.
        </p>
        <div className="mt-3 space-y-3">
          {BUTTON_GUIDE.map((group) => (
            <article key={group.section} className={helpItemClass}>
              <p className={helpItemTitleClass}>{group.section}</p>
              <ul className="mt-2 space-y-2">
                {group.actions.map((action) => (
                  <li
                    key={action.label}
                    className="text-sm leading-6 text-[color:var(--fs-color-muted)]"
                  >
                    <span className={helpStrongClass}>{action.label}:</span> {action.meaning}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="edit-scope" className={helpSectionClass}>
        <h3 className={helpHeadingClass}>What can be edited right now</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <article className={cx(helpCalloutClass, "border-emerald-200 bg-emerald-50/70")}>
            <p className="text-sm font-semibold text-emerald-900">Available now</p>
            <ul className={`${helpListClass} text-emerald-900`}>
              <li>Create/edit/publish/archive content rows.</li>
              <li>Move/reorder module and lesson structure using safe workflows.</li>
              <li>Create/edit/activate/disable/delete QR registry rows.</li>
              <li>Generate/download QR assets (SVG/PNG) from registry rows.</li>
              <li>
                Create/edit/review/archive email templates with placeholder validation (admin role
                required for publish/revert).
              </li>
              <li>Read, filter, status, archive, soft-delete, and restore stored messages.</li>
              <li>
                Inspect privacy-safe analytics health, read-only funnel signals, and existing
                upsell, saved-workout guide stage summary, prompt, checkout handoff, and access
                caveats.
              </li>
              <li>Maintain notes, categories, and commerce labels.</li>
              <li>Run revision restore and QR rollback operations.</li>
            </ul>
          </article>
          <article className={cx(helpCalloutClass, "border-amber-200 bg-amber-50")}>
            <p className="text-sm font-semibold text-amber-900">Guardrails</p>
            <ul className={`${helpListClass} text-amber-900`}>
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

      <section id="quality-matrix" className={helpSectionClass}>
        <h3 className={helpHeadingClass}>10/10 Help/Training quality coverage matrix</h3>
        <p className={helpBodyClass}>
          This matrix defines what must be documented for high-quality operator guidance.
        </p>
        <div className="mt-3 overflow-x-auto rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/80">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[color:var(--fs-border-soft)] text-left text-[color:var(--fs-color-muted)]">
                <th className="px-2 py-2 font-semibold">Category</th>
                <th className="px-2 py-2 font-semibold">Documentation contract</th>
                <th className="px-2 py-2 font-semibold">Where covered</th>
              </tr>
            </thead>
            <tbody>
              {QUALITY_MATRIX.map((row) => (
                <tr
                  key={row.category}
                  className="border-b border-[color:var(--fs-border-soft)] align-top text-[color:var(--fs-color-muted)] last:border-b-0"
                >
                  <td className="px-2 py-2 font-medium text-[color:var(--fs-color-ink-strong)]">
                    {row.category}
                  </td>
                  <td className="px-2 py-2">{row.contract}</td>
                  <td className="px-2 py-2">{row.where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="controls" className={helpSectionClass}>
        <h3 className={helpHeadingClass}>Documentation controls (required)</h3>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-6 text-[color:var(--fs-color-muted)]">
          {DOC_CONTROLS.map((control) => (
            <li key={control}>{control}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm leading-6 text-[color:var(--fs-color-muted)]">
          Runbook references:{" "}
          {RUNBOOK_LINKS.map((path, index) => (
            <span key={path}>
              <code className={helpCodeClass}>{path}</code>
              {index < RUNBOOK_LINKS.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </section>

      <section id="services" className={helpSectionClass}>
        <h3 className={helpHeadingClass}>Connected services</h3>
        <div className="mt-3 space-y-3">
          {CONNECTED_SERVICES.map((service) => (
            <article key={service.name} className={helpItemClass}>
              <p className={helpItemTitleClass}>{service.name}</p>
              <p className={helpItemBodyClass}>What it does: {service.purpose}</p>
              <p className={helpItemBodyClass}>Watch out for: {service.caution}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="playbooks" className={helpSectionClass}>
        <h3 className={helpHeadingClass}>Daily playbooks</h3>
        <div className="mt-3 space-y-3">
          {DAILY_PLAYBOOKS.map((playbook) => (
            <article key={playbook.title} className={helpItemClass}>
              <p className={helpItemTitleClass}>{playbook.title}</p>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-sm leading-6 text-[color:var(--fs-color-muted)]">
                {playbook.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section id="troubleshoot" className={helpSectionClass}>
        <h3 className={helpHeadingClass}>Troubleshoot fast</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <article className={cx(helpCalloutClass, "border-amber-200 bg-amber-50")}>
            <p className="text-sm font-semibold text-amber-900">Admin setup warning appears</p>
            <p className="mt-1 text-sm text-amber-800">
              Apply latest migrations, refresh admin, then retest affected workflow.
            </p>
          </article>
          <article className={cx(helpCalloutClass, "border-rose-200 bg-rose-50")}>
            <p className="text-sm font-semibold text-rose-900">QR scan does not land correctly</p>
            <p className="mt-1 text-sm text-rose-800">
              Open stable link directly (`/go/v/&lt;slug&gt;`), disable or fix destination, then
              retest.
            </p>
          </article>
          <article className={cx(helpCalloutClass, "border-rose-200 bg-rose-50")}>
            <p className="text-sm font-semibold text-rose-900">Create or publish action fails</p>
            <p className="mt-1 text-sm text-rose-800">
              Read API error text, verify role/allowlist, and confirm required CI checks are green.
            </p>
          </article>
          <article className={cx(helpCalloutClass, "border-amber-200 bg-amber-50")}>
            <p className="text-sm font-semibold text-amber-900">
              Message exists but notification failed
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Treat the message row as received. Check delivery attempts for disabled config,
              retryable provider failure, or final provider rejection before escalating. If a
              response is needed, reply from the normal email inbox and mark the row replied.
            </p>
          </article>
          <article className={cx(helpCalloutClass, "border-amber-200 bg-amber-50")}>
            <p className="text-sm font-semibold text-amber-900">
              Analytics is empty, quiet, capped, or setup-missing
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Check Data health first. Empty can mean no traffic in range, Quiet can mean no recent
              tracked activity, Capped means totals are bounded, and Setup missing means the
              analytics setup is not ready. Do not infer missing revenue, individual visitors, or
              accounting truth from this dashboard alone.
            </p>
          </article>
          <article className={cx(helpCalloutClass, "border-amber-200 bg-amber-50")}>
            <p className="text-sm font-semibold text-amber-900">
              Clipboard paste is blocked, chat image is not enough, or image upload fails
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Confirm the screenshot was copied first. If clipboard access is blocked or upload
              still fails, keep the note ID, refresh Notes, and use Upload images. If the image only
              exists in Codex chat, save the real file under `/.tmp/admin-note-imports/` and give
              Codex the note ID + file path. Use the admin-notes recovery runbook if the state is
              still unclear.
            </p>
          </article>
          <article className={helpItemClass}>
            <p className={helpItemTitleClass}>Need escalation</p>
            <p className={helpItemBodyClass}>
              Capture exact route, item id/slug, error text, and latest deployment/check status
              before escalating.
            </p>
          </article>
        </div>
      </section>

      <section id="change-log" className={helpSectionClass}>
        <h3 className={helpHeadingClass}>Change governance and freshness</h3>
        <p className={helpBodyClass}>
          Help/Guide is part of release quality. If workflow labels, behavior, or recovery steps
          change, update this page in the same PR and keep help e2e assertions aligned.
        </p>
      </section>
    </div>
  );
}
