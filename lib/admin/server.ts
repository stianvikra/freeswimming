import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  hasRequiredAdminRole,
  isAdminRoleColumnMissingError,
  resolveAdminRoleForUser,
  type AdminRole,
  type MinimumAdminRole,
} from "@/lib/admin/access";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type ResolveAdminRoleOptions = {
  allowlistedEmailsRaw?: string | undefined;
};

type RequireAdminRoleOptions = ResolveAdminRoleOptions & {
  minimumRole: MinimumAdminRole;
};

type RequireAdminRoleResult =
  | {
      ok: true;
      user: User;
      role: AdminRole;
    }
  | {
      ok: false;
      status: 401 | 403 | 500;
      error: string;
    };

async function loadProfileRole(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ role: string | null; error: null | { code?: string; message?: string } }> {
  const result = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (result.error) {
    return {
      role: null,
      error: {
        code: result.error.code,
        message: result.error.message,
      },
    };
  }

  return {
    role: result.data?.role ?? null,
    error: null,
  };
}

async function ensureAllowlistedAdminProfile(user: User) {
  if (!user.email) return;

  const adminSupabase = createAdminSupabaseClient();
  const { error } = await adminSupabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email.toLowerCase(),
      role: "admin",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("[Admin] Could not bootstrap allowlisted admin profile", error);
  }
}

export async function resolveAdminRoleFromSupabase(
  supabase: SupabaseClient<Database>,
  user: User,
  options: ResolveAdminRoleOptions
): Promise<AdminRole | null> {
  const { role: profileRole, error: profileRoleError } = await loadProfileRole(supabase, user.id);

  if (profileRoleError && !isAdminRoleColumnMissingError(profileRoleError)) {
    console.error("[Admin] Could not load admin role from profile", profileRoleError);
  }

  const resolvedRole = resolveAdminRoleForUser(user, {
    profileRole,
    allowlistedEmailsRaw: options.allowlistedEmailsRaw,
  });

  if (resolvedRole === "admin" && !profileRole && user.email) {
    await ensureAllowlistedAdminProfile(user);
  }

  return resolvedRole;
}

export async function requireAdminRoleFromSupabase(
  supabase: SupabaseClient<Database>,
  options: RequireAdminRoleOptions
): Promise<RequireAdminRoleResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("[Admin] Could not load auth user", userError);
    return { ok: false, status: 500, error: "Could not verify admin session." };
  }

  if (!user) {
    return { ok: false, status: 401, error: "Unauthorized." };
  }

  const role = await resolveAdminRoleFromSupabase(supabase, user, {
    allowlistedEmailsRaw: options.allowlistedEmailsRaw,
  });

  if (!role || !hasRequiredAdminRole(role, options.minimumRole)) {
    return { ok: false, status: 403, error: "Forbidden." };
  }

  return {
    ok: true,
    user,
    role,
  };
}
