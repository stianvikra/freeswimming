import { describe, expect, it } from "vitest";
import {
  getAdminPageContextLabel,
  hasDedicatedContextNotesForPage,
  normalizeAdminPageContextRef,
} from "@/lib/admin/page-note-context";

describe("page note context helpers", () => {
  it("normalizes refs to stable lowercase paths", () => {
    expect(normalizeAdminPageContextRef(" /Plans/?x=1 ")).toBe("/plans");
    expect(normalizeAdminPageContextRef("course")).toBe("/course");
    expect(normalizeAdminPageContextRef("///my-library//goals///")).toBe("/my-library/goals");
  });

  it("returns known labels and safe fallback labels", () => {
    expect(getAdminPageContextLabel("/plans")).toBe("Plans page");
    expect(getAdminPageContextLabel("/unknown-path")).toBe("Page: /unknown-path");
  });

  it("marks routes with dedicated contextual panels", () => {
    expect(hasDedicatedContextNotesForPage("/course")).toBe(true);
    expect(hasDedicatedContextNotesForPage("/guides/poolside")).toBe(true);
    expect(hasDedicatedContextNotesForPage("/my-library/item/guide-poolside")).toBe(true);
    expect(hasDedicatedContextNotesForPage("/plans")).toBe(false);
  });
});
