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

const DEV_LOGIN_MAX_ATTEMPTS = 3;
const DEV_LOGIN_RETRY_DELAY_MS = 400;

function isRetryableDevLoginError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const status = "status" in error && typeof error.status === "number" ? error.status : null;
  const code = "code" in error && typeof error.code === "string" ? error.code : null;

  return (
    status === 0 ||
    status === 408 ||
    status === 429 ||
    (status !== null && status >= 500) ||
    code === "ETIMEDOUT" ||
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    message.includes("fetch failed") ||
    message.includes("timed out") ||
    message.includes("timeout") ||
    message.includes("connection reset") ||
    message.includes("econnreset")
  );
}

export async function signInWithDevBypassAccount(): Promise<DevBypassSignInResult> {
  const config = getDevAuthBypassConfig();
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();

  try {
    await supabase.auth.signOut();
  } catch {}

  for (let attempt = 0; attempt < DEV_LOGIN_MAX_ATTEMPTS; attempt += 1) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: config.email,
        password: config.password,
      });

      if (!error) {
        return {
          ok: true,
          userEmail: config.email,
          applySupabaseCookies,
        };
      }

      const shouldRetry = attempt < DEV_LOGIN_MAX_ATTEMPTS - 1 && isRetryableDevLoginError(error);
      if (!shouldRetry) {
        console.error("[DevLogin] Could not sign in with configured dev account", error);
        return {
          ok: false,
          error: "Could not sign in.",
          applySupabaseCookies,
        };
      }
    } catch (error) {
      const shouldRetry = attempt < DEV_LOGIN_MAX_ATTEMPTS - 1 && isRetryableDevLoginError(error);
      if (!shouldRetry) {
        console.error("[DevLogin] Could not sign in with configured dev account", error);
        return {
          ok: false,
          error: "Could not sign in.",
          applySupabaseCookies,
        };
      }
    }

    await new Promise((resolve) => setTimeout(resolve, DEV_LOGIN_RETRY_DELAY_MS * (attempt + 1)));
  }

  return {
    ok: false,
    error: "Could not sign in.",
    applySupabaseCookies,
  };
}
