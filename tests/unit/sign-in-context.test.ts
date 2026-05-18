import { describe, expect, it } from "vitest";
import {
  buildAuthCallbackUrl,
  getSafeSignInContextSource,
  getSignInContextCopy,
} from "@/lib/auth/sign-in-context";

describe("sign-in context helpers", () => {
  it("allows only known sign-in context sources", () => {
    expect(getSafeSignInContextSource("checkout_success")).toBe("checkout_success");
    expect(getSafeSignInContextSource("claim_entry")).toBe("claim_entry");
    expect(getSafeSignInContextSource("library_recovery")).toBeNull();
    expect(getSafeSignInContextSource("https://evil.example")).toBeNull();
    expect(getSafeSignInContextSource(null)).toBeNull();
  });

  it("explains admin sign-in without granting admin access", () => {
    const copy = getSignInContextCopy("/admin", null);

    expect(copy.kind).toBe("admin");
    expect(copy.title).toBe("Sign in to continue");
    expect(copy.description).toContain("confirm your identity");
    expect(copy.description).toContain("Admin access is checked after sign-in");
    expect(copy.description).toContain("does not grant admin access");
  });

  it("explains protected My Library destinations", () => {
    const copy = getSignInContextCopy("/my-library/workouts", null);

    expect(copy.kind).toBe("library");
    expect(copy.title).toBe("Sign in to My Library");
    expect(copy.description).toContain("return to My Library or the member page");
  });

  it("explains checkout and claim contexts without promising access", () => {
    const checkout = getSignInContextCopy("/my-library", "checkout_success");
    const claim = getSignInContextCopy("/my-library", "claim_entry");

    expect(checkout.kind).toBe("checkout");
    expect(checkout.description).toContain("same email you used at checkout");
    expect(checkout.description).toContain("entitlement checks attach any available access");
    expect(claim.kind).toBe("claim");
    expect(claim.title).toBe("Sign in to claim access");
    expect(claim.description).toContain("claim checks decide");
  });

  it("preserves safe source values on callback URLs only as query context", () => {
    const callbackUrl = new URL(
      buildAuthCallbackUrl("https://freeswimming.org", "/my-library", "checkout_success")
    );
    const unsafeCallbackUrl = new URL(
      buildAuthCallbackUrl("https://freeswimming.org", "/my-library", "evil")
    );

    expect(callbackUrl.pathname).toBe("/auth/callback");
    expect(callbackUrl.searchParams.get("next")).toBe("/my-library");
    expect(callbackUrl.searchParams.get("source")).toBe("checkout_success");
    expect(unsafeCallbackUrl.searchParams.get("source")).toBeNull();
  });
});
