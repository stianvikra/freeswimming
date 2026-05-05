import AdminWorkspace from "@/components/admin/AdminWorkspace";
import { resolveAdminRoleFromSupabase } from "@/lib/admin/server";
import { getServerSupabaseUserIfAuthCookiePresent } from "@/lib/supabase/server";

export default async function AdminPage() {
  const { supabase, user } = await getServerSupabaseUserIfAuthCookiePresent();

  const role =
    supabase && user
      ? await resolveAdminRoleFromSupabase(supabase, user, {
          allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
        })
      : null;

  return <AdminWorkspace role={role} />;
}
