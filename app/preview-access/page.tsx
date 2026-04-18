import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requestPreviewAccess } from "@/app/preview-access/actions";
import BrandImage from "@/components/brand/BrandImage";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { BRAND_USAGE } from "@/lib/brand";
import { getSiteLockConfig, isSiteLockEnabled } from "@/lib/site-lock/config";
import { isSiteLockSessionTokenValid } from "@/lib/site-lock/session";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Props = {
  searchParams: SearchParams;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preview Access",
  description: "Private preview access for freeswimming.org.",
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
  const notifyHref = "/contact?source=preview_access_notify";

  return (
    <section className="min-h-svh bg-[radial-gradient(960px_420px_at_50%_0%,rgba(94,146,255,0.20),rgba(255,255,255,0)_68%),linear-gradient(180deg,#edf4ff_0%,#ffffff_100%)] sm:min-h-screen">
      <div className="mx-auto flex min-h-svh w-full max-w-[760px] items-center px-5 py-10 sm:min-h-screen sm:px-6 sm:py-16">
        <div className="mx-auto w-full max-w-[31rem] sm:max-w-none">
          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              Under construction
            </p>

            <BrandImage
              asset={BRAND_USAGE.methodLockup}
              priority
              className="mx-auto mt-3 h-9 w-auto sm:mx-0 sm:h-11"
              sizes="(max-width: 640px) 260px, 340px"
            />

            <div className="mx-auto mt-5 max-w-[34rem] sm:mx-0">
              <p className="text-[15px] font-medium leading-6 text-slate-700 sm:text-[16px]">
                Olympic dreams? <span className="font-semibold text-slate-900">Wrong channel.</span>
              </p>
              <h1 className="mx-auto mt-2 max-w-[12ch] text-[30px] font-semibold leading-[1.02] text-slate-900 sm:mx-0 sm:text-[40px]">
                Adult learner?
              </h1>
              <p className="mx-auto mt-1.5 max-w-[28ch] text-[16px] leading-7 text-slate-700 sm:mx-0 sm:mt-2 sm:max-w-[32ch] sm:text-[17px]">
                You&apos;re exactly where you should be.
              </p>
            </div>
          </div>

          <div className="relative mx-auto mt-5 max-w-[31rem] overflow-hidden rounded-[24px] border border-blue-100/70 bg-[radial-gradient(560px_220px_at_15%_0%,rgba(99,168,255,0.12),rgba(255,255,255,0)_66%),linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.90))] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.10)] sm:mx-0 sm:mt-7 sm:max-w-none sm:p-7">
            <div className="opacity-72 absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#4b96f1] via-[#8dc5ff] to-transparent" />
            <div className="relative">
              <h2 className="text-[22px] font-semibold text-slate-900">Early access</h2>

              {errorMessage ? (
                <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {errorMessage}
                </p>
              ) : null}

              <form action={requestPreviewAccess} className="mt-6 space-y-4">
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
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700"
                >
                  Enter early access
                </button>
              </form>

              <div className="mt-6 border-t border-slate-200/80 pt-4">
                <a
                  href={notifyHref}
                  className="inline-flex items-center text-sm font-semibold text-blue-700 transition hover:text-blue-600"
                >
                  Apply for early access
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
