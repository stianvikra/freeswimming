import { NextResponse } from "next/server";
import { isUnauthenticatedAuthUserLookupError } from "@/lib/admin/access";
import { resolveAdminRoleFromSupabase } from "@/lib/admin/server";
import { createRouteHandlerSupabaseClientIfAuthCookiePresent } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";

function isExampleSupabaseHost(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.hostname === "example.com" || parsed.hostname === "www.example.com";
  } catch {
    return false;
  }
}

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

export async function GET() {
  const fallback = {
    dashboardVisible: false,
  };

  if (isExampleSupabaseHost(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    return noStoreJson({
      ok: true,
      flags: fallback,
    });
  }

  try {
    const result = await createRouteHandlerSupabaseClientIfAuthCookiePresent();
    if (!result) {
      return noStoreJson({
        ok: true,
        flags: fallback,
      });
    }

    const { supabase, applySupabaseCookies } = result;
    let dashboardVisible = false;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      if (
        !isUnauthenticatedAuthUserLookupError({
          code: userError.code,
          message: userError.message,
          status: userError.status,
        })
      ) {
        console.error(
          "[RuntimeFlags] Could not resolve auth user for dashboard visibility",
          userError
        );
      }
    } else if (user) {
      const role = await resolveAdminRoleFromSupabase(supabase, user, {
        allowlistedEmailsRaw: process.env.ADMIN_EMAIL_ALLOWLIST,
      });
      dashboardVisible = Boolean(role);
    }

    return applySupabaseCookies(
      noStoreJson({
        ok: true,
        flags: {
          dashboardVisible,
        },
      })
    );
  } catch (error) {
    console.error("[RuntimeFlags] Unexpected runtime flag lookup failure", error);
    return noStoreJson({
      ok: true,
      flags: fallback,
    });
  }
}
