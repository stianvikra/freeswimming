import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminPreviewUnlockCard from "@/components/auth/AdminPreviewUnlockCard";
import { requestPreviewAccess } from "@/app/preview-access/actions";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { resolveAdminRoleFromSupabase } from "@/lib/admin/server";
import { getSiteLockConfig, isSiteLockEnabled } from "@/lib/site-lock/config";
import { isSiteLockSessionTokenValid } from "@/lib/site-lock/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preview Access",
  description: "Private preview access for freeswimming.org while launch is in progress.",
  robots: {
    index: false,
    follow: false,
  },
};

const errorCopy: Record<string, string> = {
  "invalid-password": "Access password was not accepted. Please try again.",
};

export default async function PreviewAccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(typeof params.next === "string" ? params.next : null, "/");

  if (!isSiteLockEnabled()) {
    redirect(nextPath);
  }

  const config = getSiteLockConfig();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(config.cookieName)?.value;

  if (
    await isSiteLockSessionTokenValid({
      token: sessionCookie,
      secret: config.bypassToken,
      maxAgeSeconds: config.sessionMaxAgeSeconds,
    })
  ) {
    redirect(nextPath);
  }

  const errorCode = typeof params.error === "string" ? params.error : "";
  const errorMessage = errorCopy[errorCode] ?? null;
  const previewReturnPath = `/preview-access?next=${encodeURIComponent(nextPath)}`;
  const adminSignInHref = `/auth/sign-in?next=${encodeURIComponent(previewReturnPath)}`;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminRole = user
    ? await resolveAdminRoleFromSupabase(supabase, user, {
        allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
      })
    : null;

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-[720px] items-center px-6 py-16">
      <div className="w-full rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.16)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          Private preview
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          freeswimming.org is currently private
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          We are polishing content and flows before launch. Public visitors stay locked out here.
          Admins can sign in first, then use the shared preview password below.
        </p>

        {errorMessage ? (
          <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {errorMessage}
          </p>
        ) : null}

        <AdminPreviewUnlockCard
          nextPath={nextPath}
          signInHref={adminSignInHref}
          signedInEmail={user?.email ?? null}
          isAdmin={Boolean(adminRole)}
        />

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Fallback access password</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            This is the current unlock method while stronger device-based admin sign-in remains
            deferred.
          </p>
          <form action={requestPreviewAccess} className="mt-4 space-y-4">
            <input type="hidden" name="next" value={nextPath} />
            <div>
              <label
                htmlFor="preview-password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Access password
              </label>
              <input
                id="preview-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm outline-none ring-blue-300 transition focus:ring-2"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
            >
              Open preview
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
