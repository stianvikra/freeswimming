import { describe, expect, it } from "vitest";
import {
  isAdminEmailAllowlisted,
  isAdminRoleColumnMissingError,
  isUnauthenticatedAuthUserLookupError,
  parseAdminEmailAllowlist,
  resolveAdminRoleForUser,
} from "@/lib/admin/access";

describe("admin access helpers", () => {
  it("parses comma-separated allowlist emails", () => {
    const list = parseAdminEmailAllowlist(" owner@freeswimming.org , ops@freeswimming.org ");
    expect(list.has("owner@freeswimming.org")).toBe(true);
    expect(list.has("ops@freeswimming.org")).toBe(true);
  });

  it("resolves admin role from app metadata claim", () => {
    const role = resolveAdminRoleForUser({
      email: "user@freeswimming.org",
      app_metadata: { admin_role: "editor" },
    } as never);
    expect(role).toBe("editor");
  });

  it("prefers profile role over metadata claim", () => {
    const role = resolveAdminRoleForUser(
      {
        email: "user@freeswimming.org",
        app_metadata: { admin_role: "viewer" },
      } as never,
      { profileRole: "admin" }
    );
    expect(role).toBe("admin");
  });

  it("falls back to allowlist email as admin", () => {
    const role = resolveAdminRoleForUser(
      {
        email: "owner@freeswimming.org",
        app_metadata: {},
      } as never,
      { allowlistedEmailsRaw: "owner@freeswimming.org" }
    );
    expect(role).toBe("admin");
  });

  it("denies user when no claim and no allowlist match", () => {
    const role = resolveAdminRoleForUser(
      {
        email: "user@freeswimming.org",
        app_metadata: {},
      } as never,
      { allowlistedEmailsRaw: "owner@freeswimming.org" }
    );
    expect(role).toBeNull();
  });

  it("normalizes email casing in allowlist check", () => {
    expect(
      isAdminEmailAllowlisted(
        "Owner@FreeSwimming.org",
        "owner@freeswimming.org,ops@freeswimming.org"
      )
    ).toBe(true);
  });

  it("detects missing role-column errors from postgrest", () => {
    expect(
      isAdminRoleColumnMissingError({
        code: "PGRST204",
        message: "Could not find the 'role' column of 'profiles' in the schema cache",
      })
    ).toBe(true);
  });

  it("treats auth session missing user lookup errors as unauthenticated", () => {
    expect(
      isUnauthenticatedAuthUserLookupError({
        status: 400,
        message: "Auth session missing!",
      })
    ).toBe(true);
  });

  it("does not treat unrelated user lookup errors as unauthenticated", () => {
    expect(
      isUnauthenticatedAuthUserLookupError({
        status: 500,
        message: "Database unavailable",
      })
    ).toBe(false);
  });
});
