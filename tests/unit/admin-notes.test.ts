import { describe, expect, it } from "vitest";
import {
  ADMIN_INCIDENT_NOTE_CATEGORY_BY_SEVERITY,
  buildAdminNoteAttachmentEvidenceSummary,
  buildAdminNoteAttachmentOrdinalLabel,
  buildAdminNoteAttachmentStoragePath,
  buildIncidentNoteBodyTemplate,
  canonicalizeAdminNoteLinkPair,
  parseCreateAdminNotePayload,
  parseUpdateAdminNotePayload,
  validateAdminNoteAttachment,
} from "@/lib/admin/notes";

describe("parseCreateAdminNotePayload", () => {
  it("accepts a valid note payload", () => {
    const parsed = parseCreateAdminNotePayload({
      title: "Follow up Stripe webhook",
      body: "Double-check idempotency behavior in preview.",
      category: "Commerce",
      noteDate: "2026-02-20",
      isDone: false,
      contextType: "course_lesson",
      contextRef: "mod3-l1",
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.title).toBe("Follow up Stripe webhook");
    expect(parsed.value.category).toBe("Commerce");
    expect(parsed.value.noteDate).toBe("2026-02-20");
    expect(parsed.value.priority).toBe("normal");
    expect(parsed.value.contextType).toBe("course_lesson");
    expect(parsed.value.contextRef).toBe("kick-drills--kick-basics-support-not-speed");
  });

  it("rejects short titles", () => {
    const parsed = parseCreateAdminNotePayload({
      title: "x",
    });

    expect(parsed.ok).toBe(false);
  });

  it("rejects partial context on create", () => {
    const parsed = parseCreateAdminNotePayload({
      title: "Note with invalid context",
      contextType: "course_lesson",
    });

    expect(parsed.ok).toBe(false);
  });
});

describe("parseUpdateAdminNotePayload", () => {
  it("parses done toggle and category", () => {
    const parsed = parseUpdateAdminNotePayload({
      isDone: true,
      category: "Product",
      priority: "urgent",
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.isDone).toBe(true);
    expect(parsed.value.category).toBe("Product");
    expect(parsed.value.priority).toBe("urgent");
  });

  it("allows context update", () => {
    const parsed = parseUpdateAdminNotePayload({
      contextType: "guide_drill",
      contextRef: "d03",
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.contextType).toBe("guide_drill");
    expect(parsed.value.contextRef).toBe("d03");
  });

  it("canonicalizes course context updates to stable runtime ids", () => {
    const parsed = parseUpdateAdminNotePayload({
      contextType: "course_module",
      contextRef: "mod3",
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.contextType).toBe("course_module");
    expect(parsed.value.contextRef).toBe("kick-drills");
  });

  it("rejects partial context on update", () => {
    const parsed = parseUpdateAdminNotePayload({
      contextRef: "mod3-l1",
    });
    expect(parsed.ok).toBe(false);
  });

  it("rejects unknown/empty updates", () => {
    const parsed = parseUpdateAdminNotePayload({});
    expect(parsed.ok).toBe(false);
  });
});

describe("admin note attachment validation", () => {
  it("accepts allowed image types and builds storage paths", () => {
    const validated = validateAdminNoteAttachment({
      fileName: "Checkout error 1.png",
      mimeType: "image/png",
      sizeBytes: 2048,
    });

    expect(validated.ok).toBe(true);
    if (!validated.ok) return;

    expect(validated.value.fileName).toBe("Checkout-error-1.png");
    expect(
      buildAdminNoteAttachmentStoragePath({
        noteId: "123e4567-e89b-42d3-a456-426614174000",
        attachmentId: "123e4567-e89b-42d3-a456-426614174001",
        fileName: validated.value.fileName,
      })
    ).toContain("Checkout-error-1.png");
  });

  it("rejects unsupported types", () => {
    const validated = validateAdminNoteAttachment({
      fileName: "malware.svg",
      mimeType: "image/svg+xml",
      sizeBytes: 1024,
    });

    expect(validated.ok).toBe(false);
  });

  it("builds deterministic evidence labels for saved and staged images", () => {
    expect(buildAdminNoteAttachmentOrdinalLabel(0, 3)).toBe("Image 1 of 3");
    expect(buildAdminNoteAttachmentOrdinalLabel(0, 1)).toBe("Image 1");
    expect(
      buildAdminNoteAttachmentEvidenceSummary({
        mimeType: "image/png",
        sizeBytes: 2048,
        createdAt: "2026-03-31T14:22:11.000Z",
      })
    ).toBe("PNG · 2.0 KB · Uploaded 2026-03-31");
    expect(
      buildAdminNoteAttachmentEvidenceSummary({
        mimeType: "image/webp",
        sizeBytes: 1536,
        locationLabel: "Staged locally",
      })
    ).toBe("WEBP · 1.5 KB · Staged locally");
  });
});

describe("admin note link canonicalization", () => {
  it("sorts note ids into a canonical pair", () => {
    const canonical = canonicalizeAdminNoteLinkPair(
      "123e4567-e89b-42d3-a456-426614174099",
      "123e4567-e89b-42d3-a456-426614174001"
    );

    expect(canonical.ok).toBe(true);
    if (!canonical.ok) return;

    expect(canonical.value.noteId).toBe("123e4567-e89b-42d3-a456-426614174001");
    expect(canonical.value.relatedNoteId).toBe("123e4567-e89b-42d3-a456-426614174099");
  });

  it("rejects self-links", () => {
    const canonical = canonicalizeAdminNoteLinkPair(
      "123e4567-e89b-42d3-a456-426614174001",
      "123e4567-e89b-42d3-a456-426614174001"
    );

    expect(canonical.ok).toBe(false);
  });
});

describe("buildIncidentNoteBodyTemplate", () => {
  it("returns deterministic template with required ops fields", () => {
    const template = buildIncidentNoteBodyTemplate("P1");

    expect(template).toContain("Severity: P1");
    expect(template).toContain("Surface: / | /course | /my-library | /admin");
    expect(template).toContain("Mitigation status: investigating | contained | resolved");
    expect(template).toContain("Next update (UTC):");
  });

  it("keeps taxonomy mapping aligned with severity", () => {
    expect(ADMIN_INCIDENT_NOTE_CATEGORY_BY_SEVERITY.P0).toBe("Incident P0");
    expect(ADMIN_INCIDENT_NOTE_CATEGORY_BY_SEVERITY.P1).toBe("Incident P1");
    expect(ADMIN_INCIDENT_NOTE_CATEGORY_BY_SEVERITY.P2).toBe("Incident P2");
  });
});
