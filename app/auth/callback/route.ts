import { NextResponse } from "next/server";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
    }
  }

  const fallback = new URL("/auth/sign-in", requestUrl.origin);
  fallback.searchParams.set("next", nextPath);
  fallback.searchParams.set("error", "Could not verify sign-in link. Please try again.");

  return NextResponse.redirect(fallback);
}
