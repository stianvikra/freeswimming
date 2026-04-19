import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requestPreviewAccess } from "@/app/preview-access/actions";
import BrandImage from "@/components/brand/BrandImage";
import PageTemplate from "@/components/PageTemplate";
import SiteChrome from "@/components/SiteChrome";
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

const submitButtonClass =
  "w-full rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 px-5 py-4 text-[16px] font-semibold text-white shadow-[0_18px_50px_rgba(37,99,235,0.28)] transition hover:brightness-[1.02] active:translate-y-px";

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
  const errorId = "preview-access-error";
  const notifyHref = "/contact?source=preview_access_notify";

  return (
    <SiteChrome mobileNavMode="hidden">
      <PageTemplate surfaceTone="brand" topInset="tight" withBottomSafeArea={false}>
        <div className="pt-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Under construction
          </p>

          <BrandImage
            asset={BRAND_USAGE.methodLockup}
            priority
            className="mt-3 h-9 w-auto sm:h-10"
            sizes="(max-width: 640px) 260px, 340px"
          />

          <div className="mt-5 max-w-[34rem]">
            <p className="text-[15px] font-medium leading-6 text-slate-700 sm:text-[16px]">
              Olympic dreams? <span className="font-semibold text-slate-900">Wrong channel.</span>
            </p>
            <h1 className="mt-2 max-w-[12ch] text-[30px] font-semibold leading-[1.02] text-slate-900 sm:text-[40px]">
              Adult learner?
            </h1>
            <p className="mt-1.5 max-w-[28ch] text-[16px] leading-7 text-slate-700 sm:mt-2 sm:max-w-[32ch] sm:text-[17px]">
              You&apos;re exactly where you should be.
            </p>
          </div>
        </div>

        <div className="relative mt-5 overflow-hidden rounded-[22px] border border-blue-100/65 bg-[radial-gradient(560px_220px_at_15%_0%,rgba(99,168,255,0.10),rgba(255,255,255,0)_66%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.88))] p-5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] sm:mt-4 sm:p-6">
          <div className="opacity-72 absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#4b96f1] via-[#8dc5ff] to-transparent" />
          <div className="relative">
            <h2 className="text-[20px] font-semibold text-slate-900">Early access</h2>

            {errorMessage ? (
              <p
                id={errorId}
                className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[14px] leading-6 text-rose-700"
                aria-live="polite"
              >
                {errorMessage}
              </p>
            ) : null}

            <form action={requestPreviewAccess} className="mt-6 space-y-5">
              <input type="hidden" name="next" value={nextPath} />

              <div>
                <label htmlFor="preview-password" className="ui-field-label">
                  ACCESS PASSWORD
                </label>
                <input
                  id="preview-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  aria-invalid={errorMessage ? true : undefined}
                  aria-describedby={errorMessage ? errorId : undefined}
                  className="ui-field mt-2"
                />
              </div>

              <button type="submit" className={submitButtonClass}>
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
      </PageTemplate>
    </SiteChrome>
  );
}
