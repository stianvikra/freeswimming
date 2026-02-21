import { describe, expect, it } from "vitest";
import { parseCreateAdminNotePayload, parseUpdateAdminNotePayload } from "@/lib/admin/notes";

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
    expect(parsed.value.contextType).toBe("course_lesson");
    expect(parsed.value.contextRef).toBe("mod3-l1");
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
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.isDone).toBe(true);
    expect(parsed.value.category).toBe("Product");
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
