import { describe, expect, it } from "vitest";
import {
  ADMIN_MESSAGES_WORKSPACE_BOUNDARY,
  applyAdminTabToSearchParams,
  buildAdminWorkspaceModuleHref,
  getAdminWorkspaceModuleBoundary,
  parseAdminTab,
  parseAdminWorkspaceModuleId,
} from "@/lib/admin/admin-workspace";

describe("admin workspace tab URL state", () => {
  it("parses only supported admin tabs", () => {
    expect(parseAdminTab("notes")).toBe("notes");
    expect(parseAdminTab("content")).toBe("content");
    expect(parseAdminTab("messages")).toBeNull();
    expect(parseAdminTab("unknown")).toBeNull();
    expect(parseAdminTab(null)).toBeNull();
  });

  it("keeps admin messages as a planned module boundary until the inbox child activates it", () => {
    expect(parseAdminWorkspaceModuleId("messages")).toBe("messages");
    expect(ADMIN_MESSAGES_WORKSPACE_BOUNDARY.status).toBe("planned");
    expect(buildAdminWorkspaceModuleHref(ADMIN_MESSAGES_WORKSPACE_BOUNDARY)).toBe(
      "/admin?tab=messages"
    );
    expect(getAdminWorkspaceModuleBoundary("messages")).toMatchObject({
      id: "messages",
      label: "Messages",
      viewBoundary: expect.stringContaining("dedicated admin messages component boundary"),
    });
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
