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

import { GET as getGeneratorIntake } from "@/app/api/my-library/generator-intake/route";

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

describe("generator intake route", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
    loadGeneratorIntakeSnapshotMock.mockResolvedValue({
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
      profile: null,
      cssMetric: null,
      preferences: null,
      personalRecords: [],
      swimCapabilityLimits: [],
      openGoals: [],
      activeFocus: null,
      blocks: {
        preferences: {
          key: "preferences",
          label: "Training preferences",
          description: "desc",
          state: "empty",
          available: false,
          includedByDefault: false,
          summary: "No training preferences saved yet.",
          missingReason:
            "Save pool length or weekly preferences if you want reusable generator defaults later.",
          sourceIds: [],
          lastUpdatedAt: null,
          manageHref: "/my-library/profile",
          manageLabel: "Edit preferences",
        },
        css: {
          key: "css",
          label: "CSS pace",
          description: "desc",
          state: "empty",
          available: false,
          includedByDefault: false,
          summary: "No CSS pace saved yet.",
          missingReason: "Save a current CSS pace if you want later generator work to use it.",
          sourceIds: [],
          lastUpdatedAt: null,
          manageHref: "/my-library/profile",
          manageLabel: "Edit CSS",
        },
        personal_records: {
          key: "personal_records",
          label: "Best times",
          description: "desc",
          state: "empty",
          available: false,
          includedByDefault: false,
          summary: "No best times saved yet.",
          missingReason: "Add best times if later generation should see benchmark events.",
          sourceIds: [],
          lastUpdatedAt: null,
          manageHref: "/my-library/profile",
          manageLabel: "Edit best times",
        },
        goals: {
          key: "goals",
          label: "Open goals",
          description: "desc",
          state: "empty",
          available: false,
          includedByDefault: false,
          summary: "No open goals ready for intake.",
          missingReason:
            "Open goals are optional. Add one if you want generation tied to a target.",
          sourceIds: [],
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
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated generator-intake GET", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue(buildRouteClient(null));

    const response = await getGeneratorIntake();
    expect(response.status).toBe(401);
  });

  it("returns snapshot for the authenticated owner", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue(buildRouteClient("user-1"));

    const response = await getGeneratorIntake();
    const payload = (await response.json()) as {
      ok: boolean;
      snapshot: { sourceFingerprint: string };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.snapshot.sourceFingerprint).toBe("fingerprint-1");
    expect(loadGeneratorIntakeSnapshotMock).toHaveBeenCalledWith(
      expect.objectContaining({
        auth: expect.any(Object),
      }),
      "user-1"
    );
  });
});
