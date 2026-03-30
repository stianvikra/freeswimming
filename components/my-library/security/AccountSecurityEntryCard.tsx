import Link from "next/link";

export default function AccountSecurityEntryCard() {
  return (
    <section
      data-testid="account-security-entry-card"
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Account & Security</h2>
          <p className="mt-2 text-sm text-slate-600">
            Keep sign-in and preview-access guidance separate from swimmer profile data. Email code
            is the active sign-in method today, and stronger device-based sign-in is deferred until
            a supported auth stack is chosen.
          </p>
        </div>
        <Link
          href="/my-library/security"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
        >
          Open Account & Security
        </Link>
      </div>
      <div className="mt-4 flex justify-end">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
          Email code today
        </span>
      </div>
    </section>
  );
}
