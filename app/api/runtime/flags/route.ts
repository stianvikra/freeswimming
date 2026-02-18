import { NextResponse } from "next/server";
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

export async function GET() {
  const fallback = {
    softLaunchBanner: true,
  };

  if (isExampleSupabaseHost(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    return noStoreJson({
      ok: true,
      flags: fallback,
    });
  }

  try {
    const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
    const result = await supabase
      .from("admin_runtime_flags")
      .select("key, enabled")
      .eq("is_public", true);

    if (result.error) {
      console.error("[RuntimeFlags] Could not load public runtime flags", result.error);
      return applySupabaseCookies(
        noStoreJson({
          ok: true,
          flags: fallback,
        })
      );
    }

    const rows = result.data ?? [];
    const softLaunchBanner =
      rows.find((row) => row.key === "soft_launch_banner")?.enabled ?? fallback.softLaunchBanner;

    return applySupabaseCookies(
      noStoreJson({
        ok: true,
        flags: {
          softLaunchBanner,
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
