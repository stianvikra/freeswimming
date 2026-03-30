import Link from "next/link";
import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import AccountSecurityHub from "@/components/my-library/security/AccountSecurityHub";
import { resolveAdminRoleFromSupabase } from "@/lib/admin/server";
import { isSiteLockEnabled } from "@/lib/site-lock/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MyLibrarySecurityPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Fsecurity");
  }

  const adminRole = await resolveAdminRoleFromSupabase(supabase, user, {
    allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
  });

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pb-20 pt-28">
        <TrackEventOnMount
          eventName="account_security_viewed"
          payload={{
            isAdmin: Boolean(adminRole),
            siteLockEnabled: isSiteLockEnabled(),
          }}
        />
        <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.14)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                My Library
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Account & Security</h1>
              <p className="mt-2 max-w-[64ch] text-sm text-slate-600">
                Keep sign-in and private-preview access separate from swimmer profile data so
                security decisions stay easy to understand and easy to recover from.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/my-library/profile"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Open training setup
              </Link>
              <Link
                href="/my-library"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Back to My Library
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <AccountSecurityHub
              email={user.email ?? null}
              isAdmin={Boolean(adminRole)}
              siteLockEnabled={isSiteLockEnabled()}
            />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
