import { NextResponse } from "next/server";
import { getEmailOtpType } from "@/lib/auth/email-otp";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { getSafeSignInContextSource } from "@/lib/auth/sign-in-context";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = getEmailOtpType(requestUrl.searchParams.get("type"));
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"));
  const source = getSafeSignInContextSource(requestUrl.searchParams.get("source"));
  const hasAuthCallbackInput = Boolean(code || (tokenHash && type));
  const routeClient = hasAuthCallbackInput ? await createRouteHandlerSupabaseClient() : null;

  if (code && routeClient) {
    const { error } = await routeClient.supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return routeClient.applySupabaseCookies(
        NextResponse.redirect(new URL(nextPath, requestUrl.origin))
      );
    }
  }

  if (tokenHash && type && routeClient) {
    const { error } = await routeClient.supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return routeClient.applySupabaseCookies(
        NextResponse.redirect(new URL(nextPath, requestUrl.origin))
      );
    }
  }

  const fallback = new URL("/auth/sign-in", requestUrl.origin);
  fallback.searchParams.set("next", nextPath);
  if (source) {
    fallback.searchParams.set("source", source);
  }
  fallback.searchParams.set(
    "error",
    "Could not verify sign-in. Request a new sign-in email and try again."
  );

  const response = NextResponse.redirect(fallback);
  return routeClient ? routeClient.applySupabaseCookies(response) : response;
}
