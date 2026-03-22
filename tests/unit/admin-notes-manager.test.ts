import { describe, expect, it } from "vitest";
import type { AdminNoteItem } from "@/lib/admin/notes";
import {
  ADMIN_NOTES_QUERY_KEYS,
  DEFAULT_ADMIN_NOTES_FILTER_STATE,
  applyAdminNotesFilterStateToSearchParams,
  buildAdminNoteContextFilterLabel,
  buildAdminNoteReferenceLabel,
  buildAdminNotesContextRefOptions,
  filterAdminNotes,
  parseAdminNotesFilterState,
} from "@/lib/admin/notes-manager";

function buildNote(overrides?: Partial<AdminNoteItem>): AdminNoteItem {
  return {
    id: "note-1",
    title: "Follow up note",
    body: "Check the plans page issue.",
    category: "Operations",
    note_date: "2026-03-21",
    priority: "normal",
    is_done: false,
    context_type: "page",
    context_ref: "/plans",
    created_by: "admin-user",
    updated_by: "admin-user",
    created_at: "2026-03-21T10:00:00.000Z",
    updated_at: "2026-03-21T10:00:00.000Z",
    attachments: [],
    related_notes: [],
    ...overrides,
  };
}

const catalog = {
  labelsByContextKey: {
    "page:/plans": "Plans",
    "course_lesson:kick-drills--kick-basics-support-not-speed":
      "M3 · L1 · Kick basics support, not speed",
  },
};

describe("admin notes manager filter state", () => {
  it("defaults to open notes when no query params are present", () => {
    const parsed = parseAdminNotesFilterState(new URLSearchParams());

    expect(parsed).toEqual(DEFAULT_ADMIN_NOTES_FILTER_STATE);
  });

  it("writes only non-default note filter params to the URL", () => {
    const next = applyAdminNotesFilterStateToSearchParams(new URLSearchParams("tab=notes"), {
      query: "note-123",
      status: "done",
      category: "Operations",
      priority: "high",
      contextType: "page",
      contextRef: "/plans",
    });

    expect(next.get("tab")).toBe("notes");
    expect(next.get(ADMIN_NOTES_QUERY_KEYS.query)).toBe("note-123");
    expect(next.get(ADMIN_NOTES_QUERY_KEYS.status)).toBe("done");
    expect(next.get(ADMIN_NOTES_QUERY_KEYS.category)).toBe("Operations");
    expect(next.get(ADMIN_NOTES_QUERY_KEYS.priority)).toBe("high");
    expect(next.get(ADMIN_NOTES_QUERY_KEYS.contextType)).toBe("page");
    expect(next.get(ADMIN_NOTES_QUERY_KEYS.contextRef)).toBe("/plans");
  });
});

describe("admin notes manager filtering", () => {
  const openPlansNote = buildNote();
  const doneLessonNote = buildNote({
    id: "note-2",
    title: "Kick lesson follow-up",
    body: "Adjust notes in lesson flow.",
    category: "Content",
    is_done: true,
    context_type: "course_lesson",
    context_ref: "kick-drills--kick-basics-support-not-speed",
  });

  it("searches by visible note ID and keeps done notes hidden by default", () => {
    const filtered = filterAdminNotes({
      items: [openPlansNote, doneLessonNote],
      filters: {
        query: "note-1",
        status: "open",
        category: "",
        priority: "",
        contextType: "",
        contextRef: "",
      },
      catalog,
    });

    expect(filtered).toEqual([openPlansNote]);
  });

  it("filters by done archive, context type, and exact context ref", () => {
    const filtered = filterAdminNotes({
      items: [openPlansNote, doneLessonNote],
      filters: {
        query: "",
        status: "done",
        category: "Content",
        priority: "",
        contextType: "course_lesson",
        contextRef: "kick-drills--kick-basics-support-not-speed",
      },
      catalog,
    });

    expect(filtered).toEqual([doneLessonNote]);
  });

  it("builds context filter labels with the raw path/ref when needed", () => {
    expect(
      buildAdminNoteContextFilterLabel({
        catalog,
        contextType: "page",
        contextRef: "/plans",
      })
    ).toBe("Page: Plans (/plans)");
  });

  it("builds visible note references and context ref options", () => {
    expect(buildAdminNoteReferenceLabel("1234-abcd")).toBe("Note ID 1234-abcd");

    const options = buildAdminNotesContextRefOptions({
      items: [openPlansNote, doneLessonNote],
      catalog,
      contextType: "",
    });

    expect(options.map((option) => option.label)).toEqual([
      "Course Lesson: M3 · L1 · Kick basics support, not speed (kick-drills--kick-basics-support-not-speed)",
      "Page: Plans (/plans)",
    ]);
  });

  it("filters by priority and searches attachment + related note metadata", () => {
    const withAttachment = buildNote({
      id: "note-3",
      priority: "urgent",
      attachments: [
        {
          id: "attachment-1",
          note_id: "note-3",
          file_name: "checkout-error.png",
          mime_type: "image/png",
          size_bytes: 1024,
          created_at: "2026-03-21T10:05:00.000Z",
          created_by: "admin-user",
          signed_url: "https://example.com/checkout-error.png",
        },
      ],
      related_notes: [
        {
          id: "note-4",
          title: "Billing follow-up",
          category: "Commerce",
          note_date: "2026-03-20",
          is_done: false,
          priority: "high",
        },
      ],
    });

    const filtered = filterAdminNotes({
      items: [openPlansNote, withAttachment],
      filters: {
        query: "checkout-error",
        status: "open",
        category: "",
        priority: "urgent",
        contextType: "",
        contextRef: "",
      },
      catalog,
    });

    expect(filtered).toEqual([withAttachment]);
  });
});
