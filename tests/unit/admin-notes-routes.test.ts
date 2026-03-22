import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  createRouteHandlerSupabaseClientMock,
  requireAdminRoleFromSupabaseMock,
  createAdminSupabaseClientMock,
  hydrateAdminNoteRowsMock,
  loadHydratedAdminNoteByIdMock,
  selectAdminNoteFieldsMock,
} = vi.hoisted(() => ({
  createRouteHandlerSupabaseClientMock: vi.fn(),
  requireAdminRoleFromSupabaseMock: vi.fn(),
  createAdminSupabaseClientMock: vi.fn(),
  hydrateAdminNoteRowsMock: vi.fn(),
  loadHydratedAdminNoteByIdMock: vi.fn(),
  selectAdminNoteFieldsMock: vi.fn(),
}));

vi.mock("@/lib/supabase/route-handler", () => ({
  createRouteHandlerSupabaseClient: createRouteHandlerSupabaseClientMock,
}));

vi.mock("@/lib/admin/server", () => ({
  requireAdminRoleFromSupabase: requireAdminRoleFromSupabaseMock,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: createAdminSupabaseClientMock,
}));

vi.mock("@/lib/admin/notes-server", () => ({
  hydrateAdminNoteRows: hydrateAdminNoteRowsMock,
  loadHydratedAdminNoteById: loadHydratedAdminNoteByIdMock,
  selectAdminNoteFields: selectAdminNoteFieldsMock,
}));

import { DELETE as deleteNote } from "@/app/api/admin/notes/[id]/route";
import { POST as uploadAttachment } from "@/app/api/admin/notes/[id]/attachments/route";
import { DELETE as deleteAttachment } from "@/app/api/admin/notes/[id]/attachments/[attachmentId]/route";
import { POST as addRelatedNote } from "@/app/api/admin/notes/[id]/links/route";

function applyResponseCookiesIdentity<T>(response: T): T {
  return response;
}

function noteContext(id: string) {
  return {
    params: Promise.resolve({ id }),
  };
}

function attachmentContext(id: string, attachmentId: string) {
  return {
    params: Promise.resolve({ id, attachmentId }),
  };
}

function linkContext(id: string) {
  return {
    params: Promise.resolve({ id }),
  };
}

function buildSelectEqOrder(result: unknown) {
  const order = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ order });
  const select = vi.fn().mockReturnValue({ eq });
  return { select, eq, order };
}

function buildSelectTwoEqMaybeSingle(result: unknown) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eqSecond = vi.fn().mockReturnValue({ maybeSingle });
  const eqFirst = vi.fn().mockReturnValue({ eq: eqSecond });
  const select = vi.fn().mockReturnValue({ eq: eqFirst });
  return { select, eqFirst, eqSecond, maybeSingle };
}

function buildDeleteEqSelect(result: unknown) {
  const select = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ select });
  const del = vi.fn().mockReturnValue({ eq });
  return { del, eq, select };
}

function buildDeleteTwoEqSelectMaybeSingle(result: unknown) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const select = vi.fn().mockReturnValue({ maybeSingle });
  const eqSecond = vi.fn().mockReturnValue({ select });
  const eqFirst = vi.fn().mockReturnValue({ eq: eqSecond });
  const del = vi.fn().mockReturnValue({ eq: eqFirst });
  return { del, eqFirst, eqSecond, select, maybeSingle };
}

function buildDeleteEqSelectMaybeSingle(result: unknown) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const select = vi.fn().mockReturnValue({ maybeSingle });
  const eq = vi.fn().mockReturnValue({ select });
  const del = vi.fn().mockReturnValue({ eq });
  return { del, eq, select, maybeSingle };
}

function buildSelectIn(result: unknown) {
  const inMock = vi.fn().mockResolvedValue(result);
  const select = vi.fn().mockReturnValue({ in: inMock });
  return { select, inMock };
}

describe("admin notes mutation routes", () => {
  beforeEach(() => {
    requireAdminRoleFromSupabaseMock.mockResolvedValue({
      ok: true,
      user: { id: "admin-user-id" },
      role: "admin",
    });
    selectAdminNoteFieldsMock.mockReturnValue("id,title");
    hydrateAdminNoteRowsMock.mockResolvedValue({
      ok: true,
      items: [],
    });
    loadHydratedAdminNoteByIdMock.mockResolvedValue({
      ok: true,
      item: {
        id: "123e4567-e89b-42d3-a456-426614174099",
        title: "Hydrated note",
        body: "",
        category: "Operations",
        note_date: "2026-03-22",
        priority: "high",
        is_done: false,
        context_type: null,
        context_ref: null,
        created_by: "admin-user-id",
        updated_by: "admin-user-id",
        created_at: "2026-03-22T09:00:00.000Z",
        updated_at: "2026-03-22T09:00:00.000Z",
        attachments: [],
        related_notes: [],
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("deletes note attachments from storage before reporting note delete success", async () => {
    const noteId = "123e4567-e89b-42d3-a456-426614174099";
    const attachmentRow = {
      id: "123e4567-e89b-42d3-a456-426614174011",
      note_id: noteId,
      file_name: "incident.png",
      mime_type: "image/png",
      size_bytes: 1024,
      storage_path: "notes/path/incident.png",
      created_at: "2026-03-22T09:00:00.000Z",
      created_by: "admin-user-id",
    };

    const attachmentsSelect = buildSelectEqOrder({
      data: [attachmentRow],
      error: null,
    });
    const attachmentsDelete = buildDeleteEqSelect({
      data: [attachmentRow],
      error: null,
    });
    const noteDelete = buildDeleteEqSelectMaybeSingle({
      data: { id: noteId },
      error: null,
    });

    const supabase = {
      from: vi
        .fn()
        .mockImplementationOnce(() => ({ select: attachmentsSelect.select }))
        .mockImplementationOnce(() => ({ delete: attachmentsDelete.del }))
        .mockImplementationOnce(() => ({ delete: noteDelete.del })),
    };

    const removeMock = vi.fn().mockResolvedValue({ data: [], error: null });
    createAdminSupabaseClientMock.mockReturnValue({
      storage: {
        from: vi.fn().mockReturnValue({ remove: removeMock }),
      },
    });
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase,
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await deleteNote(
      new Request(`https://freeswimming.org/api/admin/notes/${noteId}`, {
        method: "DELETE",
      }),
      noteContext(noteId)
    );

    const payload = (await response.json()) as { ok?: boolean; id?: string };
    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.id).toBe(noteId);
    expect(removeMock).toHaveBeenCalledWith([attachmentRow.storage_path]);
  });

  it("restores attachment metadata if storage delete fails", async () => {
    const noteId = "123e4567-e89b-42d3-a456-426614174099";
    const attachmentId = "123e4567-e89b-42d3-a456-426614174011";
    const attachmentRow = {
      id: attachmentId,
      note_id: noteId,
      file_name: "incident.png",
      mime_type: "image/png",
      size_bytes: 1024,
      storage_path: "notes/path/incident.png",
      created_at: "2026-03-22T09:00:00.000Z",
      created_by: "admin-user-id",
    };

    const existingAttachment = buildSelectTwoEqMaybeSingle({
      data: attachmentRow,
      error: null,
    });
    const deleteAttachmentMetadata = buildDeleteTwoEqSelectMaybeSingle({
      data: attachmentRow,
      error: null,
    });
    const restoreInsert = vi.fn().mockResolvedValue({ error: null });

    const supabase = {
      from: vi
        .fn()
        .mockImplementationOnce(() => ({ select: existingAttachment.select }))
        .mockImplementationOnce(() => ({ delete: deleteAttachmentMetadata.del }))
        .mockImplementationOnce(() => ({ insert: restoreInsert })),
    };

    createAdminSupabaseClientMock.mockReturnValue({
      storage: {
        from: vi.fn().mockReturnValue({
          remove: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "bucket unavailable" },
          }),
        }),
      },
    });
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase,
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await deleteAttachment(
      new Request(
        `https://freeswimming.org/api/admin/notes/${noteId}/attachments/${attachmentId}`,
        {
          method: "DELETE",
        }
      ),
      attachmentContext(noteId, attachmentId)
    );

    const payload = (await response.json()) as { ok?: boolean; error?: string };
    expect(response.status).toBe(500);
    expect(payload.ok).toBe(false);
    expect(payload.error).toContain("Could not delete attachment");
    expect(restoreInsert).toHaveBeenCalledWith(attachmentRow);
  });

  it("canonicalizes link insert order before saving related note pairs", async () => {
    const noteId = "123e4567-e89b-42d3-a456-426614174099";
    const relatedNoteId = "123e4567-e89b-42d3-a456-426614174001";
    const notesLookup = buildSelectIn({
      data: [{ id: noteId }, { id: relatedNoteId }],
      error: null,
    });
    const insertLink = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            note_id: relatedNoteId,
            related_note_id: noteId,
            created_at: "2026-03-22T09:00:00.000Z",
            created_by: "admin-user-id",
          },
          error: null,
        }),
      }),
    });

    const supabase = {
      from: vi
        .fn()
        .mockImplementationOnce(() => ({ select: notesLookup.select }))
        .mockImplementationOnce(() => ({ insert: insertLink })),
    };

    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase,
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const response = await addRelatedNote(
      new Request(`https://freeswimming.org/api/admin/notes/${noteId}/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ relatedNoteId }),
      }),
      linkContext(noteId)
    );

    const payload = (await response.json()) as { ok?: boolean; item?: { id?: string } };
    expect(response.status).toBe(201);
    expect(payload.ok).toBe(true);
    expect(insertLink).toHaveBeenCalledWith({
      note_id: relatedNoteId,
      related_note_id: noteId,
      created_by: "admin-user-id",
    });
  });

  it("fails closed for unauthorized attachment uploads", async () => {
    const noteId = "123e4567-e89b-42d3-a456-426614174099";
    requireAdminRoleFromSupabaseMock.mockResolvedValueOnce({
      ok: false,
      error: "Forbidden",
      status: 403,
    });
    createRouteHandlerSupabaseClientMock.mockResolvedValue({
      supabase: {},
      applySupabaseCookies: applyResponseCookiesIdentity,
    });

    const formData = new FormData();
    formData.set("file", new File(["capture"], "captured-proof.png", { type: "image/png" }));

    const response = await uploadAttachment(
      new Request(`https://freeswimming.org/api/admin/notes/${noteId}/attachments`, {
        method: "POST",
        body: formData,
      }),
      noteContext(noteId)
    );

    const payload = (await response.json()) as { ok?: boolean; error?: string };
    expect(response.status).toBe(403);
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Forbidden");
  });
});
