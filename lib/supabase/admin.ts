import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/env";

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function createAdminSupabaseClient() {
  if (adminClient) return adminClient;

  adminClient = createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
