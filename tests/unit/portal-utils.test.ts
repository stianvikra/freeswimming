import { describe, expect, it } from "vitest";
import { getSafePortalReturnPath, pickActiveStripeCustomerId } from "@/lib/commerce/portal";

describe("getSafePortalReturnPath", () => {
  it("accepts safe local return paths", () => {
    expect(getSafePortalReturnPath("/my-library?tab=library")).toBe("/my-library?tab=library");
    expect(getSafePortalReturnPath("/checkout/success")).toBe("/checkout/success");
  });

  it("falls back for unsafe or empty paths", () => {
    expect(getSafePortalReturnPath(undefined)).toBe("/my-library");
    expect(getSafePortalReturnPath("")).toBe("/my-library");
    expect(getSafePortalReturnPath("my-library")).toBe("/my-library");
    expect(getSafePortalReturnPath("https://evil.example")).toBe("/my-library");
    expect(getSafePortalReturnPath("//evil.example/path")).toBe("/my-library");
  });
});

describe("pickActiveStripeCustomerId", () => {
  it("returns first non-deleted customer id", () => {
    const result = pickActiveStripeCustomerId([
      { id: "cus_deleted", deleted: true },
      { id: "cus_123" },
      { id: "cus_456" },
    ]);

    expect(result).toBe("cus_123");
  });

  it("returns null when no active customer id is found", () => {
    const result = pickActiveStripeCustomerId([
      { id: "", deleted: false },
      { id: "cus_deleted", deleted: true },
      {},
    ]);

    expect(result).toBeNull();
  });
});
