import { redirect } from "next/navigation";
import MyLibraryRoutinesWorkspace from "@/components/my-library/MyLibraryRoutinesWorkspace";
import { loadDrylandLibrarySnapshot } from "@/lib/dryland/server";
import { loadHabitSnapshot } from "@/lib/habits/server";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MyLibraryRoutinesPage() {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!supabase || !user) {
    redirect("/auth/sign-in?next=%2Fmy-library%2Froutines");
  }

  const [drylandLibrarySnapshot, habitSnapshot] = await Promise.all([
    loadDrylandLibrarySnapshot(supabase, user.id, null),
    loadHabitSnapshot(supabase, user.id),
  ]);

  return (
    <MyLibraryRoutinesWorkspace
      drylandLibrary={{
        microPlan: drylandLibrarySnapshot.microPlan,
        microPlanLoadError: drylandLibrarySnapshot.microPlanLoadError,
        microPlanSchemaReady: drylandLibrarySnapshot.microPlanSchemaReady,
        recentSessions: drylandLibrarySnapshot.recentSessions,
      }}
      habitSnapshot={habitSnapshot}
      nowIso={new Date().toISOString()}
    />
  );
}
