import { NextResponse } from "next/server";
import { getDevAuthBypassConfig } from "@/lib/auth/dev-auth-bypass";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export type DevBypassSignInResult =
  | {
      ok: true;
      userEmail: string;
      applySupabaseCookies: <T extends NextResponse>(response: T) => T;
    }
  | {
      ok: false;
      error: "Could not sign in.";
      applySupabaseCookies: <T extends NextResponse>(response: T) => T;
    };

export async function signInWithDevBypassAccount(): Promise<DevBypassSignInResult> {
  const config = getDevAuthBypassConfig();
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();

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
      applySupabaseCookies,
    };
  }

  return {
    ok: true,
    userEmail: config.email,
    applySupabaseCookies,
  };
}
