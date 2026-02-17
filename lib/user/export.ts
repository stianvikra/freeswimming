import type { Database } from "@/types/database";

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "email" | "created_at" | "updated_at"
>;

type EntitlementRow = Pick<
  Database["public"]["Tables"]["entitlements"]["Row"],
  | "id"
  | "product_id"
  | "purchaser_email"
  | "source"
  | "stripe_customer_id"
  | "stripe_checkout_session_id"
  | "granted_at"
  | "created_at"
  | "updated_at"
>;

type CourseProgressRow = Pick<
  Database["public"]["Tables"]["course_progress"]["Row"],
  "lesson_id" | "done" | "video_seconds" | "updated_at"
>;

type GuideProgressRow = Pick<
  Database["public"]["Tables"]["guide_progress"]["Row"],
  "guide_slug" | "section_id" | "completed" | "notes" | "updated_at"
>;

type GuideSessionProgressRow = Pick<
  Database["public"]["Tables"]["guide_session_progress"]["Row"],
  "guide_slug" | "session_number" | "completed" | "notes" | "completed_at" | "updated_at"
>;

type GoalRow = Pick<
  Database["public"]["Tables"]["goals"]["Row"],
  | "id"
  | "title"
  | "target_value"
  | "target_unit"
  | "target_date"
  | "status"
  | "celebrated_at"
  | "created_at"
  | "updated_at"
>;

type DownloadLinkRow = Pick<
  Database["public"]["Tables"]["download_links"]["Row"],
  "id" | "entitlement_id" | "expires_at" | "used_at" | "created_at"
>;

export type BuildUserExportPayloadInput = {
  userId: string;
  userEmail: string | null;
  profile: ProfileRow | null;
  entitlements: EntitlementRow[];
  courseProgress: CourseProgressRow[];
  guideProgress: GuideProgressRow[];
  guideSessionProgress: GuideSessionProgressRow[];
  goals: GoalRow[];
  downloadLinks: DownloadLinkRow[];
  generatedAt?: string;
};

export function buildUserExportPayload(input: BuildUserExportPayloadInput) {
  const generatedAt = input.generatedAt ?? new Date().toISOString();

  return {
    generatedAt,
    schemaVersion: "2026-02-17",
    user: {
      id: input.userId,
      email: input.userEmail,
    },
    profile: input.profile
      ? {
          id: input.profile.id,
          email: input.profile.email,
          createdAt: input.profile.created_at,
          updatedAt: input.profile.updated_at,
        }
      : null,
    entitlements: input.entitlements.map((row) => ({
      id: row.id,
      productId: row.product_id,
      purchaserEmail: row.purchaser_email,
      source: row.source,
      stripeCustomerId: row.stripe_customer_id,
      stripeCheckoutSessionId: row.stripe_checkout_session_id,
      grantedAt: row.granted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    courseProgress: input.courseProgress.map((row) => ({
      lessonId: row.lesson_id,
      done: row.done,
      videoSeconds: row.video_seconds,
      updatedAt: row.updated_at,
    })),
    guideProgress: input.guideProgress.map((row) => ({
      guideSlug: row.guide_slug,
      sectionId: row.section_id,
      completed: row.completed,
      notes: row.notes,
      updatedAt: row.updated_at,
    })),
    guideSessionProgress: input.guideSessionProgress.map((row) => ({
      guideSlug: row.guide_slug,
      sessionNumber: row.session_number,
      completed: row.completed,
      notes: row.notes,
      completedAt: row.completed_at,
      updatedAt: row.updated_at,
    })),
    goals: input.goals.map((row) => ({
      id: row.id,
      title: row.title,
      targetValue: row.target_value,
      targetUnit: row.target_unit,
      targetDate: row.target_date,
      status: row.status,
      celebratedAt: row.celebrated_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    downloadLinks: input.downloadLinks.map((row) => ({
      id: row.id,
      entitlementId: row.entitlement_id,
      expiresAt: row.expires_at,
      usedAt: row.used_at,
      createdAt: row.created_at,
    })),
  };
}
