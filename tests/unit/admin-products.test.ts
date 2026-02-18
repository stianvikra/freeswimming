import { describe, expect, it } from "vitest";
import { parseUpdateAdminProductPayload } from "@/lib/admin/products";

describe("parseUpdateAdminProductPayload", () => {
  it("accepts title and active updates", () => {
    const parsed = parseUpdateAdminProductPayload({
      title: " Updated title ",
      active: false,
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.title).toBe("Updated title");
    expect(parsed.value.active).toBe(false);
  });

  it("rejects payload without known fields", () => {
    const parsed = parseUpdateAdminProductPayload({});
    expect(parsed.ok).toBe(false);
  });

  it("rejects non-boolean active", () => {
    const parsed = parseUpdateAdminProductPayload({
      active: "yes",
    });
    expect(parsed.ok).toBe(false);
  });
});
