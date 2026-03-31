import Link from "next/link";

type Props = {
  nextPath: string;
  signInHref: string;
  signedInEmail: string | null;
  isAdmin: boolean;
};

export default function AdminPreviewUnlockCard({ signInHref, signedInEmail, isAdmin }: Props) {
  return (
    <article
      data-testid="admin-preview-unlock-card"
      className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/70 p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Admin unlock
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Admin preview access</h2>
          <p className="mt-2 max-w-[64ch] text-sm text-slate-600">
            Sign in with your admin email so this page can confirm your admin access. Then use the
            shared preview password below.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {!signedInEmail ? "Sign in first" : isAdmin ? "Admin signed in" : "No admin access"}
        </span>
      </div>

      {!signedInEmail ? (
        <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 p-4">
          <p className="text-sm text-slate-700">
            Sign in with your admin email first, then return here to use the shared preview
            password.
          </p>
          <div className="mt-4">
            <Link
              href={signInHref}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Sign in as admin
            </Link>
          </div>
        </div>
      ) : !isAdmin ? (
        <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 p-4 text-sm text-slate-700">
          Signed in as {signedInEmail}, but this account does not have admin preview access.
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 p-4">
          <p className="text-sm text-slate-700">
            Signed in as {signedInEmail}. Use the shared preview password below to unlock preview
            access in this browser.
          </p>
        </div>
      )}
    </article>
  );
}
