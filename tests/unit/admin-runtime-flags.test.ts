import { describe, expect, it } from "vitest";
import {
  isAdminRuntimeFlagKey,
  parseUpdateAdminRuntimeFlagPayload,
} from "@/lib/admin/runtime-flags";

describe("admin runtime flag helpers", () => {
  it("rejects unknown runtime flag keys", () => {
    expect(isAdminRuntimeFlagKey("soft_launch_banner")).toBe(false);
    expect(isAdminRuntimeFlagKey("unknown_flag")).toBe(false);
  });

  it("parses boolean enabled payload", () => {
    const parsed = parseUpdateAdminRuntimeFlagPayload({
      enabled: true,
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.enabled).toBe(true);
  });

  it("rejects non-boolean enabled payload", () => {
    const parsed = parseUpdateAdminRuntimeFlagPayload({
      enabled: "1",
    });
    expect(parsed.ok).toBe(false);
  });
});
