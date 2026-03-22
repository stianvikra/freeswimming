import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createRouteHandlerSupabaseClientMock } = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

import { GET as getTrainingContext } from "@/app/api/my-library/training-context/route";
import { POST as postFocus } from "@/app/api/my-library/training-context/focus/route";
import { POST as postNote } from "@/app/api/my-library/training-context/notes/route";
import { PATCH as patchFocus } from "@/app/api/my-library/training-context/focus/[focusId]/route";
import { PATCH as patchNote } from "@/app/api/my-library/training-context/notes/[noteId]/route";

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

describe("training context routes", () => {
  beforeEach(() => {
    createRouteHandlerSupabaseClientMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed for unauthenticated training-context GET", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue(buildRouteClient(null));

    const response = await getTrainingContext();
    expect(response.status).toBe(401);
  });

  it("fails closed for unauthenticated focus create", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue(buildRouteClient(null));

    const response = await postFocus(
      new Request("http://127.0.0.1:3000/api/my-library/training-context/focus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Steady exhale" }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("fails closed for unauthenticated note create", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue(buildRouteClient(null));

    const response = await postNote(
      new Request("http://127.0.0.1:3000/api/my-library/training-context/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ noteType: "observation", body: "I felt rushed in the breath." }),
      })
    );

    expect(response.status).toBe(401);
  });

  it("fails closed for unauthenticated focus patch", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue(buildRouteClient(null));

    const response = await patchFocus(
      new Request("http://127.0.0.1:3000/api/my-library/training-context/focus/focus-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "complete" }),
      }),
      { params: Promise.resolve({ focusId: "focus-1" }) }
    );

    expect(response.status).toBe(401);
  });

  it("rejects mixed focus action and edit payloads before load", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue(buildRouteClient("user-1"));

    const response = await patchFocus(
      new Request("http://127.0.0.1:3000/api/my-library/training-context/focus/focus-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "set_primary", title: "Patient catch timing" }),
      }),
      { params: Promise.resolve({ focusId: "focus-1" }) }
    );

    expect(response.status).toBe(400);
  });

  it("fails closed for unauthenticated note patch", async () => {
    createRouteHandlerSupabaseClientMock.mockResolvedValue(buildRouteClient(null));

    const response = await patchNote(
      new Request("http://127.0.0.1:3000/api/my-library/training-context/notes/note-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "answered", answer: "Keep one goggle down." }),
      }),
      { params: Promise.resolve({ noteId: "note-1" }) }
    );

    expect(response.status).toBe(401);
  });

  it("rejects clearing primary on a non-open focus", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "focus-1",
        user_id: "user-1",
        goal_id: null,
        title: "Patient catch timing",
        details: null,
        status: "completed",
        is_primary: false,
        context_type: null,
        context_ref: null,
        completed_at: "2026-03-22T09:00:00.000Z",
        archived_at: null,
        created_at: "2026-03-22T08:00:00.000Z",
        updated_at: "2026-03-22T09:00:00.000Z",
      },
      error: null,
    });
    const eqUser = vi.fn(() => ({ maybeSingle }));
    const eqId = vi.fn(() => ({ eq: eqUser }));
    const select = vi.fn(() => ({ eq: eqId }));

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
          }),
        },
        from: vi.fn(() => ({
          select,
        })),
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchFocus(
      new Request("http://127.0.0.1:3000/api/my-library/training-context/focus/focus-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "clear_primary" }),
      }),
      { params: Promise.resolve({ focusId: "focus-1" }) }
    );

    expect(response.status).toBe(409);
  });

  it("rejects invalid question patch payloads before write", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "note-1",
        user_id: "user-1",
        goal_id: null,
        focus_id: null,
        note_type: "question",
        status: "unanswered",
        body: "Am I dropping my elbow?",
        answer: null,
        context_type: null,
        context_ref: null,
        resolved_at: null,
        created_at: "2026-03-19T10:00:00.000Z",
        updated_at: "2026-03-19T10:00:00.000Z",
      },
      error: null,
    });
    const eq = vi.fn(() => ({ maybeSingle }));

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq,
            })),
          })),
        }),
      },
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await patchNote(
      new Request("http://127.0.0.1:3000/api/my-library/training-context/notes/note-1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "answered", answer: "" }),
      }),
      { params: Promise.resolve({ noteId: "note-1" }) }
    );

    expect(response.status).toBe(400);
  });
});
