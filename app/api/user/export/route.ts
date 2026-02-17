import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildUserExportPayload } from "@/lib/user/export";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonNoStore({ ok: false, error: "Unauthorized." }, 401);
  }

  const userId = user.id;
  const generatedAt = new Date().toISOString();

  const [
    profileResult,
    entitlementsResult,
    courseProgressResult,
    guideProgressResult,
    guideSessionProgressResult,
    goalsResult,
    downloadLinksResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("entitlements")
      .select(
        "id, product_id, purchaser_email, source, stripe_customer_id, stripe_checkout_session_id, granted_at, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("granted_at", { ascending: false }),
    supabase
      .from("course_progress")
      .select("lesson_id, done, video_seconds, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("guide_progress")
      .select("guide_slug, section_id, completed, notes, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("guide_session_progress")
      .select("guide_slug, session_number, completed, notes, completed_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("goals")
      .select(
        "id, title, target_value, target_unit, target_date, status, celebrated_at, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("download_links")
      .select("id, entitlement_id, expires_at, used_at, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const failedQuery =
    profileResult.error ??
    entitlementsResult.error ??
    courseProgressResult.error ??
    guideProgressResult.error ??
    guideSessionProgressResult.error ??
    goalsResult.error ??
    downloadLinksResult.error;

  if (failedQuery) {
    console.error("[UserExportApi] Could not build user export", failedQuery);
    return jsonNoStore({ ok: false, error: "Could not export user data." }, 500);
  }

  return jsonNoStore({
    ok: true,
    export: buildUserExportPayload({
      userId,
      userEmail: user.email ?? null,
      profile: profileResult.data ?? null,
      entitlements: entitlementsResult.data ?? [],
      courseProgress: courseProgressResult.data ?? [],
      guideProgress: guideProgressResult.data ?? [],
      guideSessionProgress: guideSessionProgressResult.data ?? [],
      goals: goalsResult.data ?? [],
      downloadLinks: downloadLinksResult.data ?? [],
      generatedAt,
    }),
  });
}
