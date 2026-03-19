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
      athleteProfile: {
        id: "athlete-profile-1",
        display_name: "Poolside Stian",
        first_name: "Stian",
        last_name: "Vikra",
        age_band: "35_44",
        created_at: "2026-03-19T08:00:00.000Z",
        updated_at: "2026-03-19T08:05:00.000Z",
      },
      trainingMetrics: [
        {
          id: "metric-1",
          metric_key: "css",
          unit: "seconds_per_100m",
          value_seconds: 118,
          recorded_on: "2026-03-19",
          source_note: "400 + 200 test",
          created_at: "2026-03-19T08:10:00.000Z",
          updated_at: "2026-03-19T08:11:00.000Z",
        },
      ],
      trainingPreferences: {
        id: "pref-1",
        pool_length_m: 25,
        available_days: ["monday", "wednesday"],
        preferred_weekly_session_count: 5,
        preferred_session_minutes: 60,
        created_at: "2026-03-19T08:12:00.000Z",
        updated_at: "2026-03-19T08:13:00.000Z",
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
      trainingFocuses: [
        {
          id: "focus-1",
          goal_id: "goal-1",
          title: "Longer exhale in the water",
          details: "Relax before rotating to breathe.",
          status: "active",
          context_type: null,
          context_ref: null,
          completed_at: null,
          archived_at: null,
          created_at: "2026-03-19T08:00:00.000Z",
          updated_at: "2026-03-19T08:00:00.000Z",
        },
      ],
      trainingNotes: [
        {
          id: "note-1",
          goal_id: "goal-1",
          focus_id: "focus-1",
          note_type: "question",
          status: "answered",
          body: "Am I lifting my head before breathing?",
          answer: "Yes, keep one goggle in the water.",
          context_type: null,
          context_ref: null,
          resolved_at: "2026-03-19T08:05:00.000Z",
          created_at: "2026-03-19T08:00:00.000Z",
          updated_at: "2026-03-19T08:05:00.000Z",
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
      schemaVersion: "2026-03-19-athlete-profile-training-setup",
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
      athleteProfile: {
        id: "athlete-profile-1",
        displayName: "Poolside Stian",
        firstName: "Stian",
        lastName: "Vikra",
        ageBand: "35_44",
        createdAt: "2026-03-19T08:00:00.000Z",
        updatedAt: "2026-03-19T08:05:00.000Z",
      },
      trainingMetrics: [
        {
          id: "metric-1",
          metricKey: "css",
          unit: "seconds_per_100m",
          valueSeconds: 118,
          recordedOn: "2026-03-19",
          sourceNote: "400 + 200 test",
          createdAt: "2026-03-19T08:10:00.000Z",
          updatedAt: "2026-03-19T08:11:00.000Z",
        },
      ],
      trainingPreferences: {
        id: "pref-1",
        poolLengthM: 25,
        availableDays: ["monday", "wednesday"],
        preferredWeeklySessionCount: 5,
        preferredSessionMinutes: 60,
        createdAt: "2026-03-19T08:12:00.000Z",
        updatedAt: "2026-03-19T08:13:00.000Z",
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
      trainingFocuses: [
        {
          id: "focus-1",
          goalId: "goal-1",
          title: "Longer exhale in the water",
          details: "Relax before rotating to breathe.",
          status: "active",
          contextType: null,
          contextRef: null,
          completedAt: null,
          archivedAt: null,
          createdAt: "2026-03-19T08:00:00.000Z",
          updatedAt: "2026-03-19T08:00:00.000Z",
        },
      ],
      trainingNotes: [
        {
          id: "note-1",
          goalId: "goal-1",
          focusId: "focus-1",
          noteType: "question",
          status: "answered",
          body: "Am I lifting my head before breathing?",
          answer: "Yes, keep one goggle in the water.",
          contextType: null,
          contextRef: null,
          resolvedAt: "2026-03-19T08:05:00.000Z",
          createdAt: "2026-03-19T08:00:00.000Z",
          updatedAt: "2026-03-19T08:05:00.000Z",
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
      athleteProfile: null,
      trainingMetrics: [],
      trainingPreferences: null,
      entitlements: [],
      courseProgress: [],
      guideProgress: [],
      guideSessionProgress: [],
      goals: [],
      trainingFocuses: [],
      trainingNotes: [],
      downloadLinks: [],
    });

    expect(payload.profile).toBeNull();
    expect(payload.athleteProfile).toBeNull();
    expect(payload.entitlements).toEqual([]);
    expect(payload.trainingFocuses).toEqual([]);
    expect(payload.trainingNotes).toEqual([]);
    expect(payload.downloadLinks).toEqual([]);
  });
});
