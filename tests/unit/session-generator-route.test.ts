import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock, loadGeneratorIntakeSnapshotMock } = vi.hoisted(
  () => ({
    createRouteHandlerSupabaseClientMock: vi.fn(),
    loadGeneratorIntakeSnapshotMock: vi.fn(),
  })
);

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/generator-intake/server", async () => {
  const actual = await vi.importActual<typeof import("@/lib/generator-intake/server")>(
    "@/lib/generator-intake/server"
  );

  return {
    ...actual,
    loadGeneratorIntakeSnapshot: loadGeneratorIntakeSnapshotMock,
  };
});

import { POST as postSessionDraft } from "@/app/api/my-library/generator/session-draft/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildRouteClient(userId: string | null) {
  return {
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: userId ? { id: userId } : null,
          },
        }),
      },
    },
    applySupabaseCookies: applyResponseCookiesIdentity,
  };
}

function buildSnapshot() {
  return {
    loadedAt: "2026-03-20T10:00:00.000Z",
    sourceFingerprint: "fingerprint-1",
    loadError: null,
    notesIncluded: false,
    profileSchemaReady: true,
    metricsSchemaReady: true,
    preferencesSchemaReady: true,
    personalRecordsSchemaReady: true,
    swimCapabilityLimitsSchemaReady: true,
    trainingContextSchemaReady: true,
    goalsLoadError: null,
    profile: {
      id: "profile-1",
      displayName: "Poolside Stian",
      firstName: "Stian",
      lastName: "Vikra",
      primaryName: "Poolside Stian",
      ageBand: "35_44",
      ageBandLabel: "35-44",
      createdAt: "2026-03-20T10:00:00.000Z",
      updatedAt: "2026-03-20T10:00:00.000Z",
    },
    cssMetric: {
      id: "metric-1",
      metricKey: "css",
      unit: "seconds_per_100m",
      valueSeconds: 118,
      paceLabel: "1:58",
      recordedOn: "2026-03-20",
      sourceNote: null,
      createdAt: "2026-03-20T10:00:00.000Z",
      updatedAt: "2026-03-20T10:00:00.000Z",
    },
    preferences: {
      id: "pref-1",
      poolLengthM: 25,
      poolLengthLabel: "25m pool",
      availableDays: ["monday", "wednesday"],
      availableDayLabels: ["Monday", "Wednesday"],
      preferredWeeklySessionCount: 3,
      preferredSessionMinutes: 45,
      preferredSessionMinutesLabel: "45 min",
      createdAt: "2026-03-20T10:00:00.000Z",
      updatedAt: "2026-03-20T10:00:00.000Z",
    },
    personalRecords: [],
    swimCapabilityLimits: [],
    openGoals: [
      {
        id: "goal-1",
        title: "Swim 1500m stronger",
        summary: "Build toward a stronger 1500m freestyle.",
        status: "on_track",
        statusLabel: "On track",
        statusTone: "blue",
        goalType: "custom",
        source: "custom",
        progressPercent: 35,
        progressLabel: "35%",
        progressValue: 35,
        targetValue: null,
        targetDate: "2026-05-01",
        targetDistanceM: null,
        targetTimeSeconds: null,
        targetCount: null,
        targetRef: null,
        celebratedAt: null,
        showCelebration: false,
        primaryAction: {
          kind: "link",
          label: "Open goals",
          href: "/my-library/goals",
        },
      },
    ],
    activeFocus: null,
    blocks: {
      preferences: {
        key: "preferences",
        label: "Training preferences",
        description: "desc",
        state: "available",
        available: true,
        includedByDefault: true,
        summary: "25m pool · 3 sessions/week · 45 min",
        missingReason: null,
        sourceIds: ["pref-1"],
        lastUpdatedAt: "2026-03-20T10:00:00.000Z",
        manageHref: "/my-library/profile",
        manageLabel: "Edit preferences",
      },
      css: {
        key: "css",
        label: "CSS pace",
        description: "desc",
        state: "available",
        available: true,
        includedByDefault: true,
        summary: "CSS 1:58/100m",
        missingReason: null,
        sourceIds: ["metric-1"],
        lastUpdatedAt: "2026-03-20T10:00:00.000Z",
        manageHref: "/my-library/profile",
        manageLabel: "Edit CSS",
      },
      personal_records: {
        key: "personal_records",
        label: "Personal records",
        description: "desc",
        state: "empty",
        available: false,
        includedByDefault: false,
        summary: "No personal records saved yet.",
        missingReason: "Add personal records if later generation should see benchmark events.",
        sourceIds: [],
        lastUpdatedAt: null,
        manageHref: "/my-library/profile",
        manageLabel: "Edit personal records",
      },
      goals: {
        key: "goals",
        label: "Open goals",
        description: "desc",
        state: "available",
        available: true,
        includedByDefault: true,
        summary: "1 open goal ready for intake.",
        missingReason: null,
        sourceIds: ["goal-1"],
        lastUpdatedAt: null,
        manageHref: "/my-library/goals",
        manageLabel: "Edit goals",
      },
      capability_limits: {
        key: "capability_limits",
        label: "Stroke and skill limits",
        description: "desc",
        state: "empty",
        available: false,
        includedByDefault: false,
        summary: "No stroke or skill limits saved yet.",
        missingReason: "Save limits in Swim Profile if later generation should enforce them.",
        sourceIds: [],
        lastUpdatedAt: null,
        manageHref: "/my-library/profile",
        manageLabel: "Edit limits",
      },
    },
  };
}

describe("session generator route", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
    loadGeneratorIntakeSnapshotMock.mockResolvedValue(buildSnapshot());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated generation requests", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue(buildRouteClient(null));

    const response = await postSessionDraft(
      new Request("http://127.0.0.1:3000/api/my-library/generator/session-draft", {
        method: "POST",
        body: JSON.stringify({}),
      })
    );

    expect(response.status).toBe(401);
  });

  it("returns one generated session draft for the authenticated owner", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue(buildRouteClient("user-1"));

    const response = await postSessionDraft(
      new Request("http://127.0.0.1:3000/api/my-library/generator/session-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selection: {
            preferences: true,
            css: true,
            personal_records: false,
            goals: true,
            capability_limits: false,
          },
          overrides: {
            targetType: "session",
            desiredSessionCount: "",
            desiredSessionMinutes: "45",
            focusText: "",
            constraintText: "Keep it smooth.",
          },
          input: {
            environment: "pool",
            poolLengthM: "25",
            poolLengthUnit: "m",
            sessionType: "threshold_css",
            effort: "moderate",
            sizeMode: "distance",
            targetDistanceM: "2200",
            targetTimeMin: "45",
            includeDrills: false,
            includeKick: true,
            allowedStrokes: ["freestyle"],
            equipmentAllowlist: ["kickboard"],
          },
        }),
      })
    );

    const payload = (await response.json()) as {
      ok: boolean;
      draft: { status: string; title: string; steps: Array<{ category: string }> };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.draft.status).toBe("draft");
    expect(payload.draft.title).toContain("Threshold / CSS");
    expect(payload.draft.steps[0]?.category).toBe("warmup");
  });

  it("keeps program generation deferred in this slice", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue(buildRouteClient("user-1"));

    const response = await postSessionDraft(
      new Request("http://127.0.0.1:3000/api/my-library/generator/session-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          overrides: {
            targetType: "program",
          },
        }),
      })
    );

    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(422);
    expect(payload.ok).toBe(false);
    expect(payload.error).toContain("Program generation stays deferred");
  });
});
