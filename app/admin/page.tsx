import AdminWorkspace from "@/components/admin/AdminWorkspace";
import { resolveAdminRoleFromSupabase } from "@/lib/admin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user
    ? await resolveAdminRoleFromSupabase(supabase, user, {
        allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
      })
    : null;

  return <AdminWorkspace role={role} />;
}
