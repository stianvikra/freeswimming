import { describe, expect, it } from "vitest";
import {
  getAdminPageContextLabel,
  hasDedicatedContextNotesForPage,
  normalizeAdminPageContextRef,
  supportsAdminPageNotesSurface,
} from "@/lib/admin/page-note-context";

describe("page note context helpers", () => {
  it("normalizes refs to stable lowercase paths", () => {
    expect(normalizeAdminPageContextRef(" /Plans/?x=1 ")).toBe("/plans");
    expect(normalizeAdminPageContextRef("course")).toBe("/course");
    expect(normalizeAdminPageContextRef("///my-library//goals///")).toBe("/my-library/goals");
  });

  it("returns known labels and safe fallback labels", () => {
    expect(getAdminPageContextLabel("/plans")).toBe("Plans page");
    expect(getAdminPageContextLabel("/my-library/training")).toBe("My Library training");
    expect(getAdminPageContextLabel("/my-library/habits")).toBe("My Library habits");
    expect(getAdminPageContextLabel("/my-library/workouts/workout-1")).toBe(
      "My Library swim session detail"
    );
    expect(getAdminPageContextLabel("/my-library/dryland/session-1")).toBe(
      "My Library dryland session detail"
    );
    expect(getAdminPageContextLabel("/my-library/programs/program-1")).toBe(
      "My Library program detail"
    );
    expect(getAdminPageContextLabel("/unknown-path")).toBe("Page: /unknown-path");
  });

  it("marks routes with dedicated contextual panels", () => {
    expect(hasDedicatedContextNotesForPage("/course")).toBe(true);
    expect(hasDedicatedContextNotesForPage("/guides/poolside")).toBe(true);
    expect(hasDedicatedContextNotesForPage("/my-library/item/guide-poolside")).toBe(true);
    expect(hasDedicatedContextNotesForPage("/plans")).toBe(false);
  });

  it("supports page-level notes on public routes, selected my-library hubs, and saved builder detail routes", () => {
    expect(supportsAdminPageNotesSurface("/plans")).toBe(true);
    expect(supportsAdminPageNotesSurface("/my-library")).toBe(true);
    expect(supportsAdminPageNotesSurface("/my-library/goals")).toBe(true);
    expect(supportsAdminPageNotesSurface("/my-library/habits")).toBe(true);
    expect(supportsAdminPageNotesSurface("/my-library/profile")).toBe(true);
    expect(supportsAdminPageNotesSurface("/my-library/workouts")).toBe(true);
    expect(supportsAdminPageNotesSurface("/my-library/workouts/workout-1")).toBe(true);
    expect(supportsAdminPageNotesSurface("/my-library/dryland/session-1")).toBe(true);
    expect(supportsAdminPageNotesSurface("/my-library/programs/program-1")).toBe(true);
    expect(supportsAdminPageNotesSurface("/my-library/item/guide-poolside")).toBe(false);
    expect(supportsAdminPageNotesSurface("/auth/sign-in")).toBe(false);
    expect(supportsAdminPageNotesSurface("/admin")).toBe(false);
  });
});
