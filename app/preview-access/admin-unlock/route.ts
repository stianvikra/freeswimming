import { NextResponse } from "next/server";
import { getSafeNextPath } from "@/lib/auth/next-path";
import { requireAdminRoleFromSupabase } from "@/lib/admin/server";
import { getSiteLockConfig, isSiteLockEnabled } from "@/lib/site-lock/config";
import { createSiteLockSessionToken } from "@/lib/site-lock/session";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";

function noStoreJson(
  body: Record<string, unknown>,
  init?: {
    status?: number;
  }
) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function getAalErrorMessage() {
  return "Complete stronger admin verification in this session before unlocking the preview.";
}

function noStoreRedirect(request: Request, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function previewAccessPath(nextPath: string) {
  const params = new URLSearchParams({ next: nextPath });
  return `/preview-access?${params.toString()}`;
}

function setPreviewAccessCookie(response: NextResponse, sessionToken: string) {
  const config = getSiteLockConfig();
  response.cookies.set({
    name: config.cookieName,
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/",
    maxAge: config.sessionMaxAgeSeconds,
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextPath = getSafeNextPath(url.searchParams.get("next"), "/");

  if (!isSiteLockEnabled()) {
    return noStoreRedirect(request, nextPath);
  }

  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const gate = await requireAdminRoleFromSupabase(supabase, {
    minimumRole: "admin",
    allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
  });

  if (!gate.ok) {
    return applySupabaseCookies(noStoreRedirect(request, previewAccessPath(nextPath)));
  }

  const config = getSiteLockConfig();
  const sessionToken = await createSiteLockSessionToken(config.bypassToken);
  const response = noStoreRedirect(request, nextPath);
  setPreviewAccessCookie(response, sessionToken);

  return applySupabaseCookies(response);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    next?: unknown;
  };
  const nextPath = getSafeNextPath(typeof body.next === "string" ? body.next : null, "/");

  if (!isSiteLockEnabled()) {
    return noStoreJson({
      ok: true,
      redirectPath: nextPath,
    });
  }

  const config = getSiteLockConfig();
  const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
  const gate = await requireAdminRoleFromSupabase(supabase, {
    minimumRole: "admin",
    allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
  });

  if (!gate.ok) {
    const response = noStoreJson(
      {
        ok: false,
        error:
          gate.status === 401
            ? "Sign in as an admin first."
            : "This account cannot unlock the private preview.",
      },
      { status: gate.status }
    );
    return applySupabaseCookies(response);
  }

  const claimsResult = await supabase.auth.getClaims();
  if (claimsResult.error) {
    const response = noStoreJson(
      {
        ok: false,
        error: "Could not verify the admin session strongly enough right now.",
      },
      { status: 500 }
    );
    return applySupabaseCookies(response);
  }

  if (claimsResult.data?.claims.aal !== "aal2") {
    const response = noStoreJson(
      {
        ok: false,
        error: getAalErrorMessage(),
      },
      { status: 403 }
    );
    return applySupabaseCookies(response);
  }

  const sessionToken = await createSiteLockSessionToken(config.bypassToken);
  const response = noStoreJson({
    ok: true,
    redirectPath: nextPath,
  });
  setPreviewAccessCookie(response, sessionToken);

  return applySupabaseCookies(response);
}
