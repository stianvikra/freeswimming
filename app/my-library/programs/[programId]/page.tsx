import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import CreateManualProgramButton from "@/components/my-library/programs/CreateManualProgramButton";
import ProgramBuilderHub from "@/components/my-library/programs/ProgramBuilderHub";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";
import { loadProgramLibrarySnapshot } from "@/lib/programs/server";

export const dynamic = "force-dynamic";

type Params = Promise<{
  programId: string;
}>;

type Props = {
  params: Params;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const routeActionBaseClass =
  "inline-flex min-h-10 shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 sm:min-h-11";
const routePrimaryActionClass = `fs-cta-primary ${routeActionBaseClass}`;
const routeSecondaryActionClass = `fs-cta-secondary ${routeActionBaseClass} hover:bg-white`;

export default async function ProgramBuilderPage({ params }: Props) {
  const { programId } = await params;

  if (!UUID_PATTERN.test(programId)) {
    notFound();
  }

  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect(`/auth/sign-in?next=${encodeURIComponent(`/my-library/programs/${programId}`)}`);
  }

  const programLibrary = await loadProgramLibrarySnapshot(supabase, user.id, programId);

  return (
    <SiteChrome>
      <section
        data-testid="program-builder-route-shell"
        className="mx-auto min-h-screen w-full max-w-[1120px] px-4 pt-24 pb-20 sm:px-6 sm:pt-28"
      >
        <div data-testid="program-builder-page-card" className="space-y-6 sm:space-y-8">
          <header className="border-b border-[color:var(--fs-border-brand)] pb-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]">
                  My Library
                </p>
                <h1 className="mt-2 text-2xl leading-tight font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px] sm:leading-none">
                  Program builder
                </h1>
                <p className="mt-3 max-w-[68ch] text-sm leading-6 text-[color:var(--fs-color-muted)]">
                  Place saved swim sessions into weeks and days, then save or export the program.
                </p>
              </div>
              <div data-testid="program-builder-route-actions" className="flex flex-wrap gap-2">
                {programLibrary.schemaReady ? (
                  <CreateManualProgramButton
                    testId="program-builder-route-create-manual"
                    className={routePrimaryActionClass}
                  />
                ) : null}
                <Link href="/my-library" className={routeSecondaryActionClass}>
                  Back to My Library
                </Link>
              </div>
            </div>
          </header>

          <div>
            <ProgramBuilderHub programLibrary={programLibrary} />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
