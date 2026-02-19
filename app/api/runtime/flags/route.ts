import { NextResponse } from "next/server";
import { isUnauthenticatedAuthUserLookupError } from "@/lib/admin/access";
import { resolveAdminRoleFromSupabase } from "@/lib/admin/server";
import { getSiteLockConfig } from "@/lib/site-lock/config";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

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

function isSiteLockActive(): boolean {
  try {
    return getSiteLockConfig().enabled;
  } catch {
    return false;
  }
}

export async function GET() {
  const siteLockEnabled = isSiteLockActive();
  const fallback = {
    softLaunchBanner: !siteLockEnabled,
    dashboardVisible: false,
  };

  if (isExampleSupabaseHost(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    return noStoreJson({
      ok: true,
      flags: fallback,
    });
  }

  try {
    const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
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

    const result = await supabase
      .from("admin_runtime_flags")
      .select("key, enabled")
      .eq("is_public", true);

    if (result.error) {
      console.error("[RuntimeFlags] Could not load public runtime flags", result.error);
      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          flags: {
            ...fallback,
            dashboardVisible,
          },
        })
      );
    }

    const rows = result.data ?? [];
    const softLaunchBanner = siteLockEnabled
      ? false
      : (rows.find((row) => row.key === "soft_launch_banner")?.enabled ??
        fallback.softLaunchBanner);

    return applySupabaseCookies(
      noStoreJson({
        ok: true,
        flags: {
          softLaunchBanner,
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
