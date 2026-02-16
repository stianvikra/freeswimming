import { describe, expect, it } from "vitest";
import { getEmailOtpType } from "@/lib/auth/email-otp";

describe("getEmailOtpType", () => {
  it("returns allowed email otp types", () => {
    expect(getEmailOtpType("magiclink")).toBe("magiclink");
    expect(getEmailOtpType("email")).toBe("email");
    expect(getEmailOtpType("recovery")).toBe("recovery");
  });

  it("returns null for unknown values", () => {
    expect(getEmailOtpType(null)).toBeNull();
    expect(getEmailOtpType("sms")).toBeNull();
    expect(getEmailOtpType("")).toBeNull();
    expect(getEmailOtpType("totp")).toBeNull();
  });
});
