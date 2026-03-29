import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

import {
  DELETE as deleteDrylandSession,
  PATCH as patchDrylandSession,
} from "@/app/api/my-library/dryland/[sessionId]/route";
import { POST as postDrylandSession } from "@/app/api/my-library/dryland/route";
import type { DrylandSessionDraft } from "@/lib/dryland/shared";
import type { Database } from "@/types/database";

type DrylandRow = Database["public"]["Tables"]["dryland_sessions"]["Row"];

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function buildDrylandRow(overrides?: Partial<DrylandRow>): DrylandRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "user-1",
    source_kind: "manual",
    status: "draft",
    session_kind: "strength",
    title: "Strength session 2026-03-29",
    description: "Simple dryland test session.",
    focus_text: "Brace the trunk first.",
    exercises: [
      {
        id: "exercise-1",
        source: "bank",
        bankExerciseId: "strength-air-squat",
        title: "Air squat",
        summary: "Lower-body strength.",
        howTo: "Sit back and stand tall.",
        targetAreas: ["Quads", "Glutes"],
        accent: "blue",
        mediaType: "none",
        mediaUrl: null,
        mediaPosterUrl: null,
        mediaLabel: null,
        notes: "",
        sets: [
          {
            id: "set-1",
            reps: 12,
            holdSeconds: null,
            loadKg: null,
            restSeconds: 90,
            isCompleted: false,
            completedAt: null,
          },
        ],
      },
    ],
    started_at: null,
    completed_at: null,
    actual_duration_seconds: null,
    created_at: "2026-03-29T10:00:00.000Z",
    updated_at: "2026-03-29T10:00:00.000Z",
    ...overrides,
  };
}

function buildDrylandDraft(overrides?: Partial<DrylandSessionDraft>): DrylandSessionDraft {
  return {
    version: 1,
    sessionKind: "strength",
    title: "Strength session 2026-03-29",
    description: "Simple dryland test session.",
    focusText: "Brace the trunk first.",
    startedAt: null,
    completedAt: null,
    actualDurationSeconds: null,
    exercises: [
      {
        id: "exercise-1",
        source: "bank",
        bankExerciseId: "strength-air-squat",
        title: "Air squat",
        summary: "Lower-body strength.",
        howTo: "Sit back and stand tall.",
        targetAreas: ["Quads", "Glutes"],
        accent: "blue",
        mediaType: "none",
        mediaUrl: null,
        mediaPosterUrl: null,
        mediaLabel: null,
        notes: "",
        sets: [
          {
            id: "set-1",
            reps: 12,
            holdSeconds: null,
            loadKg: null,
            restSeconds: 90,
            isCompleted: false,
            completedAt: null,
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe("dryland routes", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated dryland save", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postDrylandSession(
      new Request("http://127.0.0.1:3000/api/my-library/dryland", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceKind: "manual",
          sessionKind: "strength",
          draft: buildDrylandDraft(),
        }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("creates a dryland session for the authenticated owner", async () => {
    const single = vi.fn().mockResolvedValue({
      data: buildDrylandRow(),
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn().mockReturnValue({ insert });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await postDrylandSession(
      new Request("http://127.0.0.1:3000/api/my-library/dryland", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceKind: "manual",
          sessionKind: "strength",
          draft: buildDrylandDraft(),
        }),
      })
    );
    const payload = (await response.json()) as {
      ok: boolean;
      session: { id: string };
      summary: { title: string };
    };

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("dryland_sessions");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        source_kind: "manual",
        status: "draft",
        title: "Strength session 2026-03-29",
      })
    );
    expect(payload.ok).toBe(true);
    expect(payload.session.id).toBe("11111111-1111-4111-8111-111111111111");
    expect(payload.summary.title).toBe("Strength session 2026-03-29");
  });

  it("updates a dryland session for the authenticated owner", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: buildDrylandRow({
        title: "Updated strength session",
      }),
      error: null,
    });
    const select = vi.fn(() => ({ maybeSingle }));
    const eqId = vi.fn(() => ({ select }));
    const eqUser = vi.fn(() => ({ eq: eqId }));
    const update = vi.fn(() => ({ eq: eqUser }));
    const from = vi.fn().mockReturnValue({ update });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchDrylandSession(
      new Request(
        "http://127.0.0.1:3000/api/my-library/dryland/11111111-1111-4111-8111-111111111111",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            draft: buildDrylandDraft({
              title: "Updated strength session",
            }),
          }),
        }
      ),
      {
        params: Promise.resolve({
          sessionId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("dryland_sessions");
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Updated strength session",
      })
    );
  });

  it("deletes a dryland session for the authenticated owner", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: "11111111-1111-4111-8111-111111111111" },
      error: null,
    });
    const select = vi.fn(() => ({ maybeSingle }));
    const eqId = vi.fn(() => ({ select }));
    const eqUser = vi.fn(() => ({ eq: eqId }));
    const remove = vi.fn(() => ({ eq: eqUser }));
    const from = vi.fn().mockReturnValue({ delete: remove });

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
        from,
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await deleteDrylandSession(
      new Request(
        "http://127.0.0.1:3000/api/my-library/dryland/11111111-1111-4111-8111-111111111111",
        {
          method: "DELETE",
        }
      ),
      {
        params: Promise.resolve({
          sessionId: "11111111-1111-4111-8111-111111111111",
        }),
      }
    );
    const payload = (await response.json()) as {
      ok: boolean;
      deletedSessionId: string;
    };

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("dryland_sessions");
    expect(payload.ok).toBe(true);
    expect(payload.deletedSessionId).toBe("11111111-1111-4111-8111-111111111111");
  });
});
