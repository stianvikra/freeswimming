import Link from "next/link";

type Props = {
  email: string | null;
  isAdmin: boolean;
  siteLockEnabled: boolean;
};

function getPreviewStatusCopy(isAdmin: boolean, siteLockEnabled: boolean) {
  if (!siteLockEnabled) {
    return "Site public";
  }

  return isAdmin ? "Admin fallback ready" : "Site private";
}

function getPreviewBodyCopy(isAdmin: boolean, siteLockEnabled: boolean) {
  if (!siteLockEnabled) {
    return "The site is public right now. If private mode returns later, preview access will stay separate from normal My Library sign-in.";
  }

  if (isAdmin) {
    return "When the site is private, sign in with your admin email and then use the shared preview password on /preview-access. Device-based admin unlock is deferred until a future auth stack supports it cleanly.";
  }

  return "When the site is private, preview access stays separate from normal My Library sign-in. Public visitors stay locked out while admins use a dedicated unlock path.";
}

export default function AccountSecurityHub({ email, isAdmin, siteLockEnabled }: Props) {
  return (
    <div data-testid="account-security-hub" className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Sign-in & recovery</h2>
            <p className="mt-2 max-w-[68ch] text-sm text-slate-600">
              Freeswimming uses email codes for sign-in today. Device-based sign-in like passkeys is
              not available in the current auth stack yet, so recovery stays simple and easy to
              understand.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Email code today
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sign-in email
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">{email ?? "No email found"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Current sign-in method
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">One-time email code</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              No password is required. We email a sign-in code each time you need access.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Device-based sign-in
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">Not live yet</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Passkeys and other device-native sign-in methods are deferred until a supported auth
              stack is chosen.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Private preview access</h2>
            <p className="mt-2 max-w-[68ch] text-sm text-slate-600">
              {getPreviewBodyCopy(isAdmin, siteLockEnabled)}
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            {getPreviewStatusCopy(isAdmin, siteLockEnabled)}
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Site status
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {siteLockEnabled ? "Private mode on" : "Public mode"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Your access
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {isAdmin ? "Admin preview eligible" : "Standard account"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Unlock method today
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {siteLockEnabled ? "Shared preview password" : "Not needed right now"}
            </p>
          </div>
        </div>

        {siteLockEnabled ? (
          <div className="mt-4">
            <Link
              href="/preview-access?next=%2Fadmin"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              Open preview access
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
