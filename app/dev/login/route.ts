import { NextResponse } from "next/server";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { isDevAuthBypassEnabled, isLocalDevelopmentRequest } from "@/lib/auth/dev-auth-bypass";
import { signInWithDevBypassAccount } from "@/lib/auth/dev-login";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function redirectWithNoStore(url: URL, status: 302 | 307 = 302) {
  return NextResponse.redirect(url, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request) {
  if (!isDevAuthBypassEnabled()) {
    return NextResponse.json(
      { ok: false, error: "Not found." },
      {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  if (!isLocalDevelopmentRequest(request)) {
    return NextResponse.json(
      { ok: false, error: "Forbidden." },
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const requestUrl = new URL(request.url);
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"), "/my-library");

  const result = await signInWithDevBypassAccount();
  if (!result.ok) {
    const signInUrl = new URL("/auth/sign-in", requestUrl.origin);
    signInUrl.searchParams.set("next", nextPath);
    signInUrl.searchParams.set("error", result.error);
    return result.applySupabaseCookies(redirectWithNoStore(signInUrl));
  }

  return result.applySupabaseCookies(redirectWithNoStore(new URL(nextPath, requestUrl.origin)));
}
