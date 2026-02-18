import { describe, expect, it } from "vitest";
import { hashSiteLockPasswordSha256, isSiteLockPasswordValid } from "@/lib/site-lock/password";

describe("site lock password", () => {
  it("validates password against sha256 hash format", async () => {
    const hash = await hashSiteLockPasswordSha256("test-password");
    const isValid = await isSiteLockPasswordValid("test-password", `sha256:${hash}`);

    expect(isValid).toBe(true);
  });

  it("rejects invalid password", async () => {
    const hash = await hashSiteLockPasswordSha256("test-password");
    const isValid = await isSiteLockPasswordValid("wrong-password", `sha256:${hash}`);

    expect(isValid).toBe(false);
  });

  it("rejects unsupported hash format", async () => {
    const isValid = await isSiteLockPasswordValid("test-password", "bcrypt:abc");
    expect(isValid).toBe(false);
  });
});
