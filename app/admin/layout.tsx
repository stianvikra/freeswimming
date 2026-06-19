import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import AdminNoteQuickCaptureLauncher from "@/components/admin/AdminNoteQuickCaptureLauncher";
import SiteChrome from "@/components/SiteChrome";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { createServerSupabaseClientIfAuthCookiePresent } from "@/lib/supabase/server";

type AdminLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";

const adminWorkspaceClass =
  "mx-auto min-h-screen w-full max-w-[1800px] px-3 pt-4 pb-16 sm:px-5 sm:pt-6 xl:px-8";
const adminWorkspaceGridClass =
  "lg:grid lg:grid-cols-[minmax(0,1fr)_224px] lg:content-start lg:items-start lg:gap-4 xl:grid-cols-[minmax(0,1fr)_236px] xl:gap-5";
const adminShellCardClass = "fs-library-card fs-library-card-accent p-5 sm:p-6 md:p-8";
const adminShellHeaderClass =
  "border-b border-[color:var(--fs-border-soft)] bg-white/40 px-1 pb-4 sm:px-0";
const adminEyebrowClass = "text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]";
const adminHeadingClass =
  "text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]";
const adminMutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";
const adminPrimaryActionClass =
  "fs-cta-primary inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const adminHeaderActionClass =
  "fs-cta-secondary inline-flex min-h-10 items-center justify-center px-3 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

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
      <SiteChrome mobileNavMode="hidden">
        <section className={adminWorkspaceClass}>
          <div className={adminShellCardClass}>
            <p className={adminEyebrowClass}>Admin access required</p>
            <h1 className={`mt-2 ${adminHeadingClass}`}>You don&apos;t have access</h1>
            <p className={`mt-3 max-w-[56ch] ${adminMutedTextClass}`}>
              This area is only available to configured admin roles. If you should have access,
              contact the site owner to assign your admin role.
            </p>
            <div className="mt-5">
              <Link href="/my-library" className={adminPrimaryActionClass}>
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
    <SiteChrome mobileNavMode="hidden">
      <section className={`${adminWorkspaceClass} ${adminWorkspaceGridClass}`}>
        <header
          className={`${adminShellHeaderClass} lg:col-start-1`}
          data-testid="admin-shell-header"
        >
          <p className={adminEyebrowClass}>Admin</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <h1 className={adminHeadingClass}>Admin console</h1>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="inline-flex min-h-8 items-center rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-brand)] bg-white/80 px-3 text-xs font-semibold text-[color:var(--fs-color-brand-700)]">
                Role: {role}
              </span>
              <AdminNoteQuickCaptureLauncher
                adminRole={role}
                contextType="page"
                contextRef="/admin"
                contextLabel="Admin dashboard"
                triggerLabel="Quick note"
                triggerTestId="admin-workspace-quick-note-trigger"
                triggerClassName={adminHeaderActionClass}
              />
            </div>
          </div>
          <p className={`mt-3 hidden max-w-[60ch] sm:block ${adminMutedTextClass}`}>
            Manage content, commerce settings, and operational states from one internal workspace.
            All mutations are role-gated server-side and aligned with audit logging.
          </p>
        </header>
        <div className="contents">{children}</div>
      </section>
    </SiteChrome>
  );
}
