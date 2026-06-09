import { describe, expect, it } from "vitest";
import {
  ADMIN_ANALYTICS_WORKSPACE_BOUNDARY,
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
    expect(parseAdminTab("messages")).toBe("messages");
    expect(parseAdminTab("analytics")).toBe("analytics");
    expect(parseAdminTab("unknown")).toBeNull();
    expect(parseAdminTab(null)).toBeNull();
  });

  it("keeps admin messages behind a typed module boundary", () => {
    expect(parseAdminWorkspaceModuleId("messages")).toBe("messages");
    expect(ADMIN_MESSAGES_WORKSPACE_BOUNDARY.status).toBe("active");
    expect(buildAdminWorkspaceModuleHref(ADMIN_MESSAGES_WORKSPACE_BOUNDARY)).toBe(
      "/admin?tab=messages"
    );
    expect(getAdminWorkspaceModuleBoundary("messages")).toMatchObject({
      id: "messages",
      label: "Messages",
      viewBoundary: expect.stringContaining("dedicated admin messages component boundary"),
    });
  });

  it("keeps admin analytics behind a typed read-only module boundary", () => {
    expect(parseAdminWorkspaceModuleId("analytics")).toBe("analytics");
    expect(ADMIN_ANALYTICS_WORKSPACE_BOUNDARY.status).toBe("active");
    expect(buildAdminWorkspaceModuleHref(ADMIN_ANALYTICS_WORKSPACE_BOUNDARY)).toBe(
      "/admin?tab=analytics"
    );
    expect(getAdminWorkspaceModuleBoundary("analytics")).toMatchObject({
      id: "analytics",
      label: "Analytics",
      mutationBoundary: expect.stringContaining("does not mutate analytics rows"),
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
