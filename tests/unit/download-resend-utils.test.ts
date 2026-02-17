import { describe, expect, it } from "vitest";
import {
  getSafeDownloadResendNextPath,
  isValidResendEmail,
  normalizeResendEmail,
  toDownloadResendSource,
} from "@/lib/commerce/download-resend";

describe("download resend helpers", () => {
  it("normalizes email by trimming and lowercasing", () => {
    expect(normalizeResendEmail("  User@Example.COM ")).toBe("user@example.com");
  });

  it("validates email format", () => {
    expect(isValidResendEmail("buyer@example.com")).toBe(true);
    expect(isValidResendEmail("buyer@@example.com")).toBe(false);
    expect(isValidResendEmail("missing-at.example.com")).toBe(false);
  });

  it("keeps only safe local next paths", () => {
    expect(getSafeDownloadResendNextPath("/my-library?tab=library")).toBe(
      "/my-library?tab=library"
    );
    expect(getSafeDownloadResendNextPath("https://evil.test/path")).toBe("/my-library");
    expect(getSafeDownloadResendNextPath("//evil.test")).toBe("/my-library");
    expect(getSafeDownloadResendNextPath(undefined)).toBe("/my-library");
  });

  it("normalizes source values into allowed source enum", () => {
    expect(toDownloadResendSource("checkout_success")).toBe("checkout_success");
    expect(toDownloadResendSource("library_recovery")).toBe("library_recovery");
    expect(toDownloadResendSource("anything-else")).toBe("unknown");
    expect(toDownloadResendSource(undefined)).toBe("unknown");
  });
});
