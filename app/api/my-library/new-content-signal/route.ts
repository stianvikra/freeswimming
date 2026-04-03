import { NextResponse } from "next/server";
import { isUnauthenticatedAuthUserLookupError } from "@/lib/admin/access";
import { loadCourseModulesByStatus } from "@/lib/admin/content-course";
import {
  buildMyLibraryCourseSignal,
  resolveMyLibraryViewerSince,
} from "@/lib/my-library/new-content-notice";
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

export async function GET() {
  try {
    const { supabase, applySupabaseCookies } = await createRouteHandlerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      if (
        isUnauthenticatedAuthUserLookupError({
          code: userError.code,
          message: userError.message,
          status: userError.status,
        })
      ) {
        return applySupabaseCookies(
          noStoreJson({ ok: false, error: "Unauthorized." }, { status: 401 })
        );
      }
      console.error("[MyLibraryNewContentSignal] Could not resolve user", userError);
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Could not verify session." }, { status: 500 })
      );
    }

    if (!user) {
      return applySupabaseCookies(
        noStoreJson({ ok: false, error: "Unauthorized." }, { status: 401 })
      );
    }

    const profileCreatedResult = await supabase
      .from("athlete_profiles")
      .select("created_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileCreatedResult.error) {
      console.error(
        "[MyLibraryNewContentSignal] Could not load athlete profile creation timestamp",
        profileCreatedResult.error
      );
    }

    const modules = await loadCourseModulesByStatus({
      statuses: ["published"],
      fallback: [],
      autoSeedWhenEmpty: true,
    });
    const signal = buildMyLibraryCourseSignal(modules, {
      viewerSince: resolveMyLibraryViewerSince({
        profileCreatedAt: profileCreatedResult.data?.created_at ?? null,
        userCreatedAt: user.created_at ?? null,
      }),
    });

    return applySupabaseCookies(
      noStoreJson({
        ok: true,
        signal,
      })
    );
  } catch (error) {
    console.error("[MyLibraryNewContentSignal] Unexpected failure", error);
    return noStoreJson({ ok: false, error: "Could not load new-content signal." }, { status: 500 });
  }
}
