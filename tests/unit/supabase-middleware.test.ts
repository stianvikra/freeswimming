import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { createServerClientMock, getUserMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn(),
  getUserMock: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

vi.mock("@/lib/supabase/env", () => ({
  getSupabaseAnonKey: () => "anon-key",
  getSupabaseUrl: () => "https://example.supabase.co",
}));

import { updateSupabaseSession } from "@/lib/supabase/middleware";

describe("updateSupabaseSession", () => {
  afterEach(() => {
    createServerClientMock.mockReset();
    getUserMock.mockReset();
  });

  it("skips Supabase auth refresh when no Supabase auth cookie exists", async () => {
    const request = new NextRequest("https://freeswimming.test/course", {
      headers: {
        cookie: "fs_preview_access=signed-preview-token",
      },
    });

    await updateSupabaseSession(request);

    expect(createServerClientMock).not.toHaveBeenCalled();
  });

  it("refreshes session cookies when a Supabase auth cookie exists", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: { id: "user-1" } }, error: null });
    createServerClientMock.mockReturnValueOnce({
      auth: {
        getUser: getUserMock,
      },
    });

    const request = new NextRequest("https://freeswimming.test/my-library", {
      headers: {
        cookie: "sb-projectref-auth-token=token",
      },
    });

    await updateSupabaseSession(request);

    expect(createServerClientMock).toHaveBeenCalledTimes(1);
    expect(getUserMock).toHaveBeenCalledTimes(1);
  });
});
