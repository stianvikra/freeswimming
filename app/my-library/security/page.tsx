import { redirect } from "next/navigation";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MyLibrarySecurityPage() {
  const { user } = await getServerSupabaseUserIfAuthCookiePresent();

  if (!user) {
    redirect("/auth/sign-in?next=%2Fmy-library");
  }

  redirect("/my-library");
}
