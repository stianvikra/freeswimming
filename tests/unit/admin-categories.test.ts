import { describe, expect, it } from "vitest";
import {
  isAdminCategoryScope,
  parseCreateAdminCategoryPayload,
  parseUpdateAdminCategoryPayload,
} from "@/lib/admin/categories";

describe("admin category helpers", () => {
  it("validates known scopes", () => {
    expect(isAdminCategoryScope("notes")).toBe(true);
    expect(isAdminCategoryScope("content")).toBe(true);
    expect(isAdminCategoryScope("unknown")).toBe(false);
  });

  it("normalizes slug from title when missing", () => {
    const parsed = parseCreateAdminCategoryPayload({
      title: "  Technique Focus  ",
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.slug).toBe("technique-focus");
    expect(parsed.value.sortOrder).toBe(0);
    expect(parsed.value.isActive).toBe(true);
  });

  it("rejects invalid create payload", () => {
    const parsed = parseCreateAdminCategoryPayload({
      title: "x",
      sortOrder: "abc",
    });
    expect(parsed.ok).toBe(false);
  });

  it("accepts partial update fields", () => {
    const parsed = parseUpdateAdminCategoryPayload({
      title: "Ops",
      isActive: false,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.title).toBe("Ops");
    expect(parsed.value.isActive).toBe(false);
  });

  it("rejects empty update payload", () => {
    const parsed = parseUpdateAdminCategoryPayload({});
    expect(parsed.ok).toBe(false);
  });
});
