import { NextResponse } from "next/server";
import { COURSE_MODULES } from "@/app/course/courseData";
import { isAthleteProfileSchemaMissing } from "@/lib/athlete-profile/schema";
import { loadCourseModulesByStatus } from "@/lib/admin/content-course";
import { normalizeCourseProgressRows } from "@/lib/course/progress";
import {
  buildCanonicalCourseLessonIdMap,
  canonicalizeCourseLessonRuntimeId,
} from "@/lib/course/runtime-identity";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isTrainingContextSchemaMissing } from "@/lib/training-context/schema";
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
  const courseModules = await loadCourseModulesByStatus({
    statuses: ["published"],
    fallback: COURSE_MODULES,
    autoSeedWhenEmpty: false,
  });
  const canonicalLessonIdByAlias = buildCanonicalCourseLessonIdMap(courseModules);
  const resolveLessonId = (lessonId: string) =>
    canonicalizeCourseLessonRuntimeId(lessonId, canonicalLessonIdByAlias);

  const [
    profileResult,
    athleteProfileResult,
    entitlementsResult,
    courseProgressResult,
    guideProgressResult,
    guideSessionProgressResult,
    goalsResult,
    trainingFocusesResult,
    trainingNotesResult,
    downloadLinksResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("athlete_profiles")
      .select("id, display_name, first_name, last_name, age_band, created_at, updated_at")
      .eq("user_id", userId)
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
      .from("training_focuses")
      .select(
        "id, goal_id, title, details, status, context_type, context_ref, completed_at, archived_at, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("training_notes")
      .select(
        "id, goal_id, focus_id, note_type, status, body, answer, context_type, context_ref, resolved_at, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("download_links")
      .select("id, entitlement_id, expires_at, used_at, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const normalizedAthleteProfile =
    athleteProfileResult.error && isAthleteProfileSchemaMissing(athleteProfileResult.error)
      ? null
      : (athleteProfileResult.data ?? null);
  const normalizedTrainingFocuses =
    trainingFocusesResult.error && isTrainingContextSchemaMissing(trainingFocusesResult.error)
      ? []
      : (trainingFocusesResult.data ?? []);
  const normalizedTrainingNotes =
    trainingNotesResult.error && isTrainingContextSchemaMissing(trainingNotesResult.error)
      ? []
      : (trainingNotesResult.data ?? []);

  const failedQuery =
    profileResult.error ??
    (athleteProfileResult.error && !isAthleteProfileSchemaMissing(athleteProfileResult.error)
      ? athleteProfileResult.error
      : null) ??
    entitlementsResult.error ??
    courseProgressResult.error ??
    guideProgressResult.error ??
    guideSessionProgressResult.error ??
    goalsResult.error ??
    (trainingFocusesResult.error && !isTrainingContextSchemaMissing(trainingFocusesResult.error)
      ? trainingFocusesResult.error
      : null) ??
    (trainingNotesResult.error && !isTrainingContextSchemaMissing(trainingNotesResult.error)
      ? trainingNotesResult.error
      : null) ??
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
      athleteProfile: normalizedAthleteProfile,
      entitlements: entitlementsResult.data ?? [],
      courseProgress: normalizeCourseProgressRows(courseProgressResult.data ?? [], {
        resolveLessonId,
      }).map((row) => ({
        lesson_id: row.lessonId,
        done: row.done,
        video_seconds: row.videoSeconds,
        updated_at: row.updatedAt,
      })),
      guideProgress: guideProgressResult.data ?? [],
      guideSessionProgress: guideSessionProgressResult.data ?? [],
      goals: goalsResult.data ?? [],
      trainingFocuses: normalizedTrainingFocuses,
      trainingNotes: normalizedTrainingNotes,
      downloadLinks: downloadLinksResult.data ?? [],
      generatedAt,
    }),
  });
}
