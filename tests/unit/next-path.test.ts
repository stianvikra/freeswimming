import { describe, expect, it } from "vitest";
import { getSafeNextPath } from "@/lib/auth/next-path";

describe("getSafeNextPath", () => {
  it("defaults to /my-library when missing or invalid", () => {
    expect(getSafeNextPath(null)).toBe("/my-library");
    expect(getSafeNextPath(undefined)).toBe("/my-library");
    expect(getSafeNextPath("")).toBe("/my-library");
    expect(getSafeNextPath("https://evil.example")).toBe("/my-library");
    expect(getSafeNextPath("//evil.example/path")).toBe("/my-library");
    expect(getSafeNextPath("my-library")).toBe("/my-library");
  });

  it("keeps safe relative app paths", () => {
    expect(getSafeNextPath("/my-library")).toBe("/my-library");
    expect(getSafeNextPath("/auth/sign-in?next=%2Fmy-library")).toBe(
      "/auth/sign-in?next=%2Fmy-library"
    );
  });
});
