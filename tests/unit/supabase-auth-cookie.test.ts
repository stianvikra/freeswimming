import { describe, expect, it } from "vitest";
import {
  hasSupabaseAuthTokenCookie,
  isSupabaseAuthTokenCookieName,
} from "@/lib/supabase/auth-cookie";

describe("supabase auth cookie helpers", () => {
  it("recognizes Supabase auth token cookie names, including chunked cookies", () => {
    expect(isSupabaseAuthTokenCookieName("sb-projectref-auth-token")).toBe(true);
    expect(isSupabaseAuthTokenCookieName("sb-projectref-auth-token.0")).toBe(true);
    expect(isSupabaseAuthTokenCookieName("sb-projectref-auth-token.1")).toBe(true);
  });

  it("does not treat code verifier or unrelated cookies as active auth tokens", () => {
    expect(isSupabaseAuthTokenCookieName("sb-projectref-auth-token-code-verifier")).toBe(false);
    expect(isSupabaseAuthTokenCookieName("fs_preview_access")).toBe(false);
  });

  it("requires a non-empty auth token cookie value", () => {
    expect(
      hasSupabaseAuthTokenCookie([
        { name: "sb-projectref-auth-token", value: "" },
        { name: "fs_preview_access", value: "signed-preview-token" },
      ])
    ).toBe(false);

    expect(
      hasSupabaseAuthTokenCookie([{ name: "sb-projectref-auth-token.0", value: "token-part" }])
    ).toBe(true);
  });
});
