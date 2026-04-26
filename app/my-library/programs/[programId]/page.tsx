import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import ProgramBuilderHub from "@/components/my-library/programs/ProgramBuilderHub";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadProgramLibrarySnapshot } from "@/lib/programs/server";

export const dynamic = "force-dynamic";

type Params = Promise<{
  programId: string;
}>;

type Props = {
  params: Params;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function ProgramBuilderPage({ params }: Props) {
  const { programId } = await params;

  if (!UUID_PATTERN.test(programId)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/sign-in?next=${encodeURIComponent(`/my-library/programs/${programId}`)}`);
  }

  const programLibrary = await loadProgramLibrarySnapshot(supabase, user.id, programId);

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[1120px] px-6 pb-20 pt-28">
        <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.14)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                My Library
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Program builder preview</h1>
              <p className="mt-2 max-w-[68ch] text-sm text-slate-600">
                Preview one saved program in its own route, place accepted workouts into week/day
                slots, and export the saved canonical program without forking planner identity.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/my-library"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Back to My Library
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <ProgramBuilderHub programLibrary={programLibrary} />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
