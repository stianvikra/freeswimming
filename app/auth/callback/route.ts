import { NextResponse } from "next/server";
import { getEmailOtpType } from "@/lib/auth/email-otp";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = getEmailOtpType(requestUrl.searchParams.get("type"));
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"));
  const supabase = await createServerSupabaseClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
    }
  }

  const fallback = new URL("/auth/sign-in", requestUrl.origin);
  fallback.searchParams.set("next", nextPath);
  fallback.searchParams.set(
    "error",
    "Could not verify sign-in. Request a new login code and try again."
  );

  return NextResponse.redirect(fallback);
}
