import { describe, expect, it } from "vitest";
import {
  getAdminSchemaSetupMessage,
  isAdminContentSchemaMissing,
  isAdminNotesSchemaMissing,
  isAdminRuntimeFlagsSchemaMissing,
} from "@/lib/admin/schema";

describe("admin schema helpers", () => {
  it("detects missing admin content schema", () => {
    expect(isAdminContentSchemaMissing({ code: "42P01", message: "relation does not exist" })).toBe(
      true
    );
    expect(
      isAdminContentSchemaMissing({
        message: 'Could not find table "admin_content_items" in schema cache',
      })
    ).toBe(true);
  });

  it("detects missing admin runtime flags schema", () => {
    expect(
      isAdminRuntimeFlagsSchemaMissing({ message: 'relation "admin_runtime_flags" does not exist' })
    ).toBe(true);
  });

  it("detects missing admin notes schema", () => {
    expect(isAdminNotesSchemaMissing({ code: "PGRST205" })).toBe(true);
  });

  it("returns setup message per section", () => {
    expect(getAdminSchemaSetupMessage("content")).toContain("Admin content");
    expect(getAdminSchemaSetupMessage("operations")).toContain("Admin operations");
    expect(getAdminSchemaSetupMessage("notes")).toContain("Admin notes");
  });
});
