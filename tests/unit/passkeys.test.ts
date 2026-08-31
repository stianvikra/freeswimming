import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { loadPasskeySecuritySnapshot } from "@/lib/auth/passkeys";
import type { Database } from "@/types/database";

function createSupabaseMock(params: { currentLevel: unknown; nextLevel: unknown }) {
  return {
    auth: {
      mfa: {
        listFactors: vi.fn().mockResolvedValue({ data: { all: [] }, error: null }),
        getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
          data: params,
          error: null,
        }),
      },
    },
  } as unknown as SupabaseClient<Database>;
}

describe("loadPasskeySecuritySnapshot", () => {
  it("preserves supported assurance levels", async () => {
    const result = await loadPasskeySecuritySnapshot(
      createSupabaseMock({ currentLevel: "aal1", nextLevel: "aal2" })
    );

    expect(result).toEqual({
      ok: true,
      snapshot: {
        currentLevel: "aal1",
        nextLevel: "aal2",
        passkeys: [],
      },
    });
  });

  it("fails closed for unknown future assurance levels", async () => {
    const result = await loadPasskeySecuritySnapshot(
      createSupabaseMock({ currentLevel: "aal3", nextLevel: "future-aal" })
    );

    expect(result).toEqual({
      ok: true,
      snapshot: {
        currentLevel: null,
        nextLevel: null,
        passkeys: [],
      },
    });
  });
});
