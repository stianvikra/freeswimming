import { NextResponse } from "next/server";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { getSiteLockConfig } from "@/lib/site-lock/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"), "/");
  const redirectUrl = new URL("/preview-access", requestUrl.origin);
  redirectUrl.searchParams.set("next", nextPath);

  const response = NextResponse.redirect(redirectUrl, {
    status: 302,
    headers: {
      "Cache-Control": "no-store",
    },
  });

  try {
    const config = getSiteLockConfig();
    response.cookies.set({
      name: config.cookieName,
      value: "",
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV !== "development",
    });
  } catch {
    response.cookies.set({
      name: "fs_preview_access",
      value: "",
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV !== "development",
    });
  }

  return response;
}
