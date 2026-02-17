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

function splitHeaderValue(value: string | null): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function resolveRequestOrigin(request: Request): string {
  const requestUrl = new URL(request.url);
  const forwardedHost = splitHeaderValue(request.headers.get("x-forwarded-host"))[0];
  const host = forwardedHost || splitHeaderValue(request.headers.get("host"))[0] || requestUrl.host;

  const forwardedProto = splitHeaderValue(request.headers.get("x-forwarded-proto"))[0];
  const protocol = forwardedProto || requestUrl.protocol.replace(":", "") || "http";

  return `${protocol}://${host}`;
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
  const requestOrigin = resolveRequestOrigin(request);
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"), "/my-library");

  const result = await signInWithDevBypassAccount();
  if (!result.ok) {
    const signInUrl = new URL("/auth/sign-in", requestOrigin);
    signInUrl.searchParams.set("next", nextPath);
    signInUrl.searchParams.set("error", result.error);
    return result.applySupabaseCookies(redirectWithNoStore(signInUrl));
  }

  return result.applySupabaseCookies(redirectWithNoStore(new URL(nextPath, requestOrigin)));
}
