import { redirect } from "next/navigation";
import SiteChrome from "@/components/SiteChrome";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signOutFromLibrary } from "@/app/my-library/actions";

export const dynamic = "force-dynamic";

export default async function MyLibraryPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=%2Fmy-library");
  }

  return (
    <SiteChrome>
      <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pb-20 pt-28">
        <div className="rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-[0_16px_60px_rgba(24,58,107,0.14)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Library</h1>
              <p className="mt-2 text-sm text-slate-600">Signed in as {user.email}</p>
            </div>
            <form action={signOutFromLibrary}>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
              >
                Sign out
              </button>
            </form>
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Owned Content</h2>
            <p className="mt-2 text-sm text-slate-600">
              Account guard and session wiring are active. Product and entitlement data UI is next.
            </p>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
