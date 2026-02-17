import { describe, expect, it } from "vitest";
import { buildUserExportPayload } from "@/lib/user/export";

describe("buildUserExportPayload", () => {
  it("maps database rows into stable export payload shape", () => {
    const payload = buildUserExportPayload({
      userId: "user-1",
      userEmail: "swimmer@example.com",
      generatedAt: "2026-02-17T12:00:00.000Z",
      profile: {
        id: "user-1",
        email: "swimmer@example.com",
        created_at: "2026-02-01T08:00:00.000Z",
        updated_at: "2026-02-10T08:00:00.000Z",
      },
      entitlements: [
        {
          id: "ent-1",
          product_id: "guide_0_1000m",
          purchaser_email: "swimmer@example.com",
          source: "stripe_checkout",
          stripe_customer_id: "cus_123",
          stripe_checkout_session_id: "cs_test_123",
          granted_at: "2026-02-11T08:00:00.000Z",
          created_at: "2026-02-11T08:00:00.000Z",
          updated_at: "2026-02-11T08:00:00.000Z",
        },
      ],
      courseProgress: [
        {
          lesson_id: "lesson-1",
          done: true,
          video_seconds: 120,
          updated_at: "2026-02-12T08:00:00.000Z",
        },
      ],
      guideProgress: [
        {
          guide_slug: "poolside",
          section_id: "d01",
          completed: true,
          notes: "felt smooth",
          updated_at: "2026-02-13T08:00:00.000Z",
        },
      ],
      guideSessionProgress: [
        {
          guide_slug: "0-1000m",
          session_number: 1,
          completed: true,
          notes: "solid pacing",
          completed_at: "2026-02-14T08:00:00.000Z",
          updated_at: "2026-02-14T08:10:00.000Z",
        },
      ],
      goals: [
        {
          id: "goal-1",
          title: "Swim 1000m",
          target_value: 1000,
          target_unit: "m",
          target_date: "2026-03-01",
          status: "active",
          celebrated_at: null,
          created_at: "2026-02-15T08:00:00.000Z",
          updated_at: "2026-02-15T08:00:00.000Z",
        },
      ],
      downloadLinks: [
        {
          id: "dl-1",
          entitlement_id: "ent-1",
          expires_at: "2026-02-20T08:00:00.000Z",
          used_at: null,
          created_at: "2026-02-15T09:00:00.000Z",
        },
      ],
    });

    expect(payload).toEqual({
      generatedAt: "2026-02-17T12:00:00.000Z",
      schemaVersion: "2026-02-17",
      user: {
        id: "user-1",
        email: "swimmer@example.com",
      },
      profile: {
        id: "user-1",
        email: "swimmer@example.com",
        createdAt: "2026-02-01T08:00:00.000Z",
        updatedAt: "2026-02-10T08:00:00.000Z",
      },
      entitlements: [
        {
          id: "ent-1",
          productId: "guide_0_1000m",
          purchaserEmail: "swimmer@example.com",
          source: "stripe_checkout",
          stripeCustomerId: "cus_123",
          stripeCheckoutSessionId: "cs_test_123",
          grantedAt: "2026-02-11T08:00:00.000Z",
          createdAt: "2026-02-11T08:00:00.000Z",
          updatedAt: "2026-02-11T08:00:00.000Z",
        },
      ],
      courseProgress: [
        {
          lessonId: "lesson-1",
          done: true,
          videoSeconds: 120,
          updatedAt: "2026-02-12T08:00:00.000Z",
        },
      ],
      guideProgress: [
        {
          guideSlug: "poolside",
          sectionId: "d01",
          completed: true,
          notes: "felt smooth",
          updatedAt: "2026-02-13T08:00:00.000Z",
        },
      ],
      guideSessionProgress: [
        {
          guideSlug: "0-1000m",
          sessionNumber: 1,
          completed: true,
          notes: "solid pacing",
          completedAt: "2026-02-14T08:00:00.000Z",
          updatedAt: "2026-02-14T08:10:00.000Z",
        },
      ],
      goals: [
        {
          id: "goal-1",
          title: "Swim 1000m",
          targetValue: 1000,
          targetUnit: "m",
          targetDate: "2026-03-01",
          status: "active",
          celebratedAt: null,
          createdAt: "2026-02-15T08:00:00.000Z",
          updatedAt: "2026-02-15T08:00:00.000Z",
        },
      ],
      downloadLinks: [
        {
          id: "dl-1",
          entitlementId: "ent-1",
          expiresAt: "2026-02-20T08:00:00.000Z",
          usedAt: null,
          createdAt: "2026-02-15T09:00:00.000Z",
        },
      ],
    });
  });

  it("supports null profile and empty collections", () => {
    const payload = buildUserExportPayload({
      userId: "user-2",
      userEmail: null,
      generatedAt: "2026-02-17T12:00:00.000Z",
      profile: null,
      entitlements: [],
      courseProgress: [],
      guideProgress: [],
      guideSessionProgress: [],
      goals: [],
      downloadLinks: [],
    });

    expect(payload.profile).toBeNull();
    expect(payload.entitlements).toEqual([]);
    expect(payload.downloadLinks).toEqual([]);
  });
});
