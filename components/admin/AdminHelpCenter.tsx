"use client";

const QUICK_ACTIONS = [
  { id: "overview", label: "What this is" },
  { id: "tabs", label: "Dashboard tabs" },
  { id: "services", label: "Connected services" },
  { id: "playbooks", label: "Daily playbooks" },
  { id: "troubleshoot", label: "Troubleshoot" },
  { id: "change-log", label: "Changes and roadmap" },
];

const DASHBOARD_TABS = [
  {
    name: "Content",
    useCase: "Create and edit modules, lessons, guides, and publish states.",
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
