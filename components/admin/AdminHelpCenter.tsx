"use client";

const QUICK_ACTIONS = [
  { id: "overview", label: "What this is" },
  { id: "tabs", label: "Dashboard tabs" },
  { id: "content-page", label: "How Content page works" },
  { id: "buttons", label: "Buttons explained" },
  { id: "edit-scope", label: "What can be edited now" },
  { id: "services", label: "Connected services" },
  { id: "playbooks", label: "Daily playbooks" },
  { id: "troubleshoot", label: "Troubleshoot" },
  { id: "change-log", label: "Changes and roadmap" },
];

const DASHBOARD_TABS = [
  {
    name: "Content",
    useCase: "Create and edit modules, lessons, guide sessions/drills, and publish states.",
  },
  {
    name: "Commerce",
    useCase: "Manage product names, slugs, and active sales setup.",
  },
  {
    name: "Operations",
    useCase: "Control runtime flags and private-access behavior.",
  },
  {
    name: "Notes",
    useCase: "Track work items and internal follow-ups.",
  },
  {
    name: "Categories",
    useCase: "Keep content and notes grouped in a clean taxonomy.",
  },
];

const CONNECTED_SERVICES = [
  {
    name: "Supabase",
    purpose: "Stores app data, user accounts, and admin records.",
    caution: "If migrations are missing, admin setup warnings will appear.",
  },
  {
    name: "Stripe",
    purpose: "Handles payments and product entitlement flow.",
    caution: "Product IDs and price IDs must stay aligned with admin product data.",
  },
  {
    name: "Vercel",
    purpose: "Runs deployments and preview environments.",
    caution: "A successful preview does not replace required CI checks.",
  },
  {
    name: "GitHub Actions",
    purpose: "Runs verify, smoke, and security automation.",
    caution: "Never merge when required checks are red.",
  },
];

const DAILY_PLAYBOOKS = [
  {
    title: "Publish new content safely",
    steps: [
      "Create or update content in draft.",
      "Move to review and verify text, ordering, and category.",
      "Publish only after preview and CI checks are green.",
    ],
  },
  {
    title: "Rollback quickly",
    steps: [
      "Open revisions on the affected content item.",
      "Restore the last known good revision.",
      "Refresh public page and confirm the issue is gone.",
    ],
  },
  {
    title: "Capture work notes while reviewing pages",
    steps: [
      "Open the page you are reviewing (lesson, drill, session, or product).",
      "Expand the admin notes panel.",
      "Create or update notes so context stays attached to the exact page.",
    ],
  },
];

const CONTENT_PAGE_FLOW = [
  {
    title: "Platform mirror snapshot",
    detail:
      "Shows if admin content is aligned with platform baseline (modules, lessons, sessions, drills, products). Green means aligned. Yellow means something is missing or extra.",
  },
  {
    title: "Content items list",
    detail:
      "Shows all records currently in admin catalog. You can search by text and filter by content type. Each row gives workflow actions like edit, review, publish, archive, revisions, and delete.",
  },
  {
    title: "Create content item form",
    detail:
      "Lets you create a new record with type, status, title, slug, summary, body, order, and category. This is used to stage work safely before publish.",
  },
  {
    title: "Status workflow",
    detail:
      "Use draft for work-in-progress, review for internal checking, and published when ready for users. Archive hides old records without deleting history.",
  },
];

const BUTTON_GUIDE = [
  {
    section: "Content tab",
    actions: [
      {
        label: "Refresh",
        meaning:
          "Loads latest data from server. Use this after changes, imports, or when list looks outdated.",
      },
      {
        label: "Edit",
        meaning:
          "Opens edit mode on that row. In this phase, module, lesson, session, and drill rows can be edited directly.",
      },
      {
        label: "Search field",
        meaning:
          "Filters the list by title, slug, category, summary, and type label so you can find the right row quickly.",
      },
      {
        label: "All types filter",
        meaning:
          "Limits the list to one content type (for example only lessons or only drills). Use this before bulk edits.",
      },
      {
        label: "Save changes",
        meaning: "Stores your edits for that row. If there are no changes, nothing is saved.",
      },
      {
        label: "Cancel",
        meaning: "Closes edit mode. If you changed something, you will be asked before discarding.",
      },
      {
        label: "Revisions / Hide revisions",
        meaning:
          "Opens or closes the change history for one item. Use this to inspect earlier versions.",
      },
      {
        label: "Restore",
        meaning: "Reverts one item back to a chosen earlier version from revision history.",
      },
      {
        label: "Move to draft / Move to review / Publish / Archive",
        meaning:
          "Changes lifecycle state. Use these to control what is being edited, checked, live, or retired.",
      },
      {
        label: "Delete",
        meaning:
          "Permanently removes that record from admin catalog. Use only when record should no longer exist.",
      },
      {
        label: "Save content item",
        meaning: "Creates a new content record from the form at the bottom of Content tab.",
      },
      {
        label: "Retry",
        meaning: "Tries the same request again after a failed load or action.",
      },
    ],
  },
  {
    section: "Operations tab",
    actions: [
      {
        label: "Open password page",
        meaning: "Opens the private access page used by site lock. Use when testing gate behavior.",
      },
      {
        label: "Sign out this browser",
        meaning:
          "Clears preview gate session in current browser so you can test gated access from a clean state.",
      },
      {
        label: "Refresh",
        meaning: "Reloads operations snapshot and runtime flag values from server.",
      },
    ],
  },
  {
    section: "Notes, Categories, and Commerce",
    actions: [
      {
        label: "Save note / Save changes / Delete",
        meaning:
          "Creates, updates, or removes admin notes. Notes can be attached to module, lesson, session, drill, product, or page route.",
      },
      {
        label: "Save category / Delete",
        meaning: "Maintains taxonomy used by notes/content workflows.",
      },
      {
        label: "Save product",
        meaning: "Updates product setup data used by commerce and entitlement flows.",
      },
    ],
  },
];

export default function AdminHelpCenter() {
  return (
    <div className="space-y-6">
      <section
        className="rounded-2xl border border-slate-200 bg-white p-6"
        data-testid="admin-help-center"
      >
        <h2 className="text-lg font-semibold text-slate-900">Help/Guide</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          This page explains how to run the platform safely without technical language. Use it as
          the single reference for daily admin work.
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
          Use Admin to control content, product setup, and operational flags. Normal visitors should
          never see admin tools. If you do not have access, ask an owner to verify your admin
          allowlist and role.
        </p>
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
              <p className="mt-1 text-sm text-slate-700">{tab.useCase}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="content-page" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">How the Content page works</h3>
        <p className="mt-2 text-sm text-slate-700">
          Content page has three layers: alignment snapshot, existing items, and create form. Start
          at the top, then move down.
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

      <section id="buttons" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">Buttons and what they do</h3>
        <p className="mt-2 text-sm text-slate-700">
          If a button feels unclear, check this list first. The wording here matches the labels you
          see in Admin.
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
              <li>Create new content records (module/lesson/session/drill/product).</li>
              <li>Edit existing course modules, lessons, guide sessions, and guide drills.</li>
              <li>Change lifecycle status (draft, review, published, archived).</li>
              <li>Open revisions and restore older versions.</li>
              <li>Create, edit, attach, and delete notes.</li>
              <li>Update categories and commerce product rows.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-semibold text-amber-900">Planned next improvements</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-900">
              <li>Expanded edit mode for page and product rows.</li>
              <li>More in-place editors for long text fields and richer body content.</li>
              <li>More guided editing helpers for large content batches.</li>
            </ul>
          </article>
        </div>
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
              Apply latest database migrations, then refresh Admin.
            </p>
          </article>
          <article className="rounded-xl border border-rose-200 bg-rose-50 p-3">
            <p className="text-sm font-semibold text-rose-900">Create or publish action fails</p>
            <p className="mt-1 text-sm text-rose-800">
              Check API error text, verify role/allowlist, and confirm CI is green before retry.
            </p>
          </article>
        </div>
      </section>

      <section id="change-log" className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-900">Changes and planned work</h3>
        <p className="mt-2 text-sm text-slate-700">
          Review active and planned tasks in the task-brief folders before major admin operations.
          If a workflow changes, update this Help/Guide page in the same PR.
        </p>
      </section>
    </div>
  );
}
