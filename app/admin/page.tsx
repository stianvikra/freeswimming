export default function AdminPage() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Foundation ready</h2>
      <p className="mt-2 max-w-[64ch] text-sm text-slate-700">
        Next slices will add content and commerce modules with draft/publish workflows, validation,
        and audit logging.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Content</p>
          <p className="mt-2 text-sm text-slate-700">Modules, lessons, guides, publish state.</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Commerce</p>
          <p className="mt-2 text-sm text-slate-700">Product metadata and active/inactive state.</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Operations</p>
          <p className="mt-2 text-sm text-slate-700">Site lock and runtime support controls.</p>
        </article>
      </div>
    </section>
  );
}
