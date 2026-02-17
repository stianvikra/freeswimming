import { getDevAuthBypassConfig } from "@/lib/auth/dev-auth-bypass";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type DevBypassSignInResult =
  | {
      ok: true;
      userEmail: string;
    }
  | {
      ok: false;
      error: "Could not sign in.";
    };

export async function signInWithDevBypassAccount(): Promise<DevBypassSignInResult> {
  const config = getDevAuthBypassConfig();
  const supabase = await createServerSupabaseClient();

  try {
    await supabase.auth.signOut();
  } catch {}

  const { error } = await supabase.auth.signInWithPassword({
    email: config.email,
    password: config.password,
  });

  if (error) {
    console.error("[DevLogin] Could not sign in with configured dev account", error);
    return {
      ok: false,
      error: "Could not sign in.",
    };
  }

  return {
    ok: true,
    userEmail: config.email,
  };
}
