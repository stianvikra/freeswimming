import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import DrylandBuilderHub from "@/components/my-library/dryland/DrylandBuilderHub";
import { loadDrylandLibrarySnapshot } from "@/lib/dryland/server";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Params = Promise<{
  sessionId: string;
}>;

type Props = {
  params: Params;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const routeActionClass =
  "fs-cta-secondary inline-flex min-h-11 shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

export default async function DrylandBuilderPage({ params }: Props) {
  const { sessionId } = await params;

  if (!UUID_PATTERN.test(sessionId)) {
    notFound();
  }

  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect(`/auth/sign-in?next=${encodeURIComponent(`/my-library/dryland/${sessionId}`)}`);
  }

  const drylandLibrary = await loadDrylandLibrarySnapshot(supabase, user.id, sessionId);

  return (
    <SiteChrome mobileNavMode="hidden">
      <section
        data-testid="dryland-builder-workspace"
        className="mx-auto min-h-screen w-full max-w-[1080px] px-4 pt-24 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-28 sm:pb-20"
      >
        <header className="mb-6 border-b border-[color:var(--fs-border-brand)] pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
                My Library
              </p>
              <h1 className="mt-2 text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]">
                Dryland builder
              </h1>
            </div>
            <div data-testid="dryland-builder-route-actions" className="flex flex-wrap gap-2">
              <Link href="/my-library/dryland" className={routeActionClass}>
                Dryland Sessions
              </Link>
              <Link href="/my-library" className={routeActionClass}>
                Back to My Library
              </Link>
            </div>
          </div>
        </header>

        <DrylandBuilderHub drylandLibrary={drylandLibrary} />
      </section>
    </SiteChrome>
  );
}
