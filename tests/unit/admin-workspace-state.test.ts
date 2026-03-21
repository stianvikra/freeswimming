import { describe, expect, it } from "vitest";
import { applyAdminTabToSearchParams, parseAdminTab } from "@/lib/admin/admin-workspace";

describe("admin workspace tab URL state", () => {
  it("parses only supported admin tabs", () => {
    expect(parseAdminTab("notes")).toBe("notes");
    expect(parseAdminTab("content")).toBe("content");
    expect(parseAdminTab("unknown")).toBeNull();
    expect(parseAdminTab(null)).toBeNull();
  });

  it("writes non-default tabs and removes the default content tab", () => {
    const notesParams = applyAdminTabToSearchParams(new URLSearchParams("foo=bar"), "notes");
    expect(notesParams.get("foo")).toBe("bar");
    expect(notesParams.get("tab")).toBe("notes");

    const contentParams = applyAdminTabToSearchParams(notesParams, "content");
    expect(contentParams.get("foo")).toBe("bar");
    expect(contentParams.get("tab")).toBeNull();
  });
});
