import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import SiteChrome from "@/components/SiteChrome";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createServerSupabaseClientIfAuthCookiePresent } from "@/lib/supabase/server";

type AdminLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createServerSupabaseClientIfAuthCookiePresent();
  if (!supabase) {
    redirect("/auth/sign-in?next=%2Fadmin");
  }

  const gate = await requireAdminRoleFromSupabase(supabase, {
    allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
    minimumRole: "viewer",
  });

  if (!gate.ok && gate.status === 401) {
    redirect("/auth/sign-in?next=%2Fadmin");
  }

  if (!gate.ok) {
    return (
      <SiteChrome>
        <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pt-28 pb-20">
          <div className="rounded-3xl border border-amber-200 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.14)]">
            <p className="text-xs font-semibold tracking-wide text-amber-700 uppercase">
              Admin access required
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">You don&apos;t have access</h1>
            <p className="mt-3 max-w-[56ch] text-sm text-slate-700">
              This area is only available to configured admin roles. If you should have access,
              contact the site owner to assign your admin role.
            </p>
            <div className="mt-5">
              <Link
                href="/my-library"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
              >
                Back to My Library
              </Link>
            </div>
          </div>
        </section>
      </SiteChrome>
    );
  }

  const { role } = gate;

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pt-28 pb-20">
        <header className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.14)]">
          <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">Admin</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-slate-900">Admin console</h1>
            <span className="inline-flex h-8 items-center rounded-full border border-blue-200 bg-blue-50 px-3 text-xs font-semibold tracking-wide text-blue-700 uppercase">
              Role: {role}
            </span>
          </div>
          <p className="mt-3 max-w-[60ch] text-sm text-slate-700">
            Manage content, commerce settings, and operational states from one internal workspace.
            All mutations are role-gated server-side and aligned with audit logging.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              Open site
            </Link>
            <Link
              href="/my-library"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 active:bg-blue-200"
            >
              Open My Library
            </Link>
          </div>
        </header>
        <div className="mt-6">{children}</div>
      </section>
    </SiteChrome>
  );
}
