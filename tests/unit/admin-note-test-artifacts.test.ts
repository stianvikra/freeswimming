import { describe, expect, it } from "vitest";
import {
  ADMIN_NOTE_TEST_ARTIFACT_PREFIX,
  buildAdminNoteTestArtifactScopePrefix,
  buildAdminNoteTestArtifactTitle,
  isAdminNoteTestArtifact,
  isAdminNoteTestArtifactForScope,
  isLegacyAdminNoteTestArtifact,
} from "@/lib/admin/admin-note-test-artifacts";

describe("admin-note test artifact contract", () => {
  it("builds a scoped title prefix for new automated artifacts", () => {
    expect(buildAdminNoteTestArtifactScopePrefix("Notes-Workflow")).toBe(
      `${ADMIN_NOTE_TEST_ARTIFACT_PREFIX}[notes-workflow]`
    );
    expect(
      buildAdminNoteTestArtifactTitle({
        scope: "notes-workflow",
        label: "Primary note",
        unique: "123-456",
      })
    ).toBe(`${ADMIN_NOTE_TEST_ARTIFACT_PREFIX}[notes-workflow] Primary note 123-456`);
  });

  it("recognizes new scoped artifacts", () => {
    const note = {
      title: `${ADMIN_NOTE_TEST_ARTIFACT_PREFIX}[contextual-notes] Plans quick capture 123-456`,
      body: "Page-level admin note for plans.",
    };

    expect(isAdminNoteTestArtifact(note)).toBe(true);
    expect(isAdminNoteTestArtifactForScope(note, "contextual-notes")).toBe(true);
    expect(isAdminNoteTestArtifactForScope(note, "notes-workflow")).toBe(false);
  });

  it("recognizes legacy artifact rows conservatively", () => {
    expect(
      isLegacyAdminNoteTestArtifact({
        title: "E2E Related Note 1774369753468-199",
        body: "Secondary note used for related-link flow.",
      })
    ).toBe(true);

    expect(
      isLegacyAdminNoteTestArtifact({
        title: "Quick note",
        body: "When taking screenshot we are covering the screen witht the quick note form.",
      })
    ).toBe(false);
  });

  it("does not classify normal operator notes as artifacts", () => {
    expect(
      isAdminNoteTestArtifact({
        title: "Subscription prices - Thoughs",
        body: "Intro tilbud 14,99 usd per month.",
      })
    ).toBe(false);
  });
});
