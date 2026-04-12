import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminContextNotesPanel from "@/components/admin/AdminContextNotesPanel";
import type { AdminNoteItem } from "@/lib/admin/notes";

function buildItem(overrides?: Partial<AdminNoteItem>): AdminNoteItem {
  return {
    id: "note-1",
    title: "Plans follow-up",
    body: "Remember to tighten the page copy.",
    category: "Operations",
    note_date: "2026-04-01",
    priority: "normal",
    is_done: false,
    context_type: "page",
    context_ref: "/plans",
    created_by: "admin-user",
    updated_by: "admin-user",
    created_at: "2026-04-01T10:00:00.000Z",
    updated_at: "2026-04-01T10:00:00.000Z",
    attachments: [],
    related_notes: [],
    ...overrides,
  };
}

describe("AdminContextNotesPanel", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("lets operators add and remove images on an already-saved contextual note", async () => {
    const initialItem = buildItem();
    const itemWithAttachment = buildItem({
      attachments: [
        {
          id: "attachment-1",
          note_id: "note-1",
          file_name: "context-proof.png",
          mime_type: "image/png",
          size_bytes: 12,
          created_at: "2026-04-01T10:02:00.000Z",
          created_by: "admin-user",
          signed_url: "https://example.com/context-proof.png",
        },
      ],
    });

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.startsWith("/api/admin/notes?")) {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            role: "editor",
            items: [initialItem],
            schemaReady: true,
            warning: null,
          }),
        } as Response;
      }

      if (url === "/api/admin/categories/notes") {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            items: [{ id: "category-1", title: "Operations", is_active: true }],
          }),
        } as Response;
      }

      if (url === "/api/admin/notes/note-1/attachments" && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            item: itemWithAttachment,
          }),
        } as Response;
      }

      if (url === "/api/admin/notes/note-1/attachments/attachment-1" && init?.method === "DELETE") {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            item: itemWithAttachment,
          }),
        } as Response;
      }

      throw new Error(`Unexpected fetch: ${url} ${init?.method ?? "GET"}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminContextNotesPanel
        contextType="page"
        contextRef="/plans"
        contextLabel="Plans page"
        collapsedByDefault={false}
      />
    );

    await screen.findByTestId("admin-context-note-item");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const editForm = await screen.findByTestId("admin-context-note-edit-form");

    fireEvent.change(screen.getByTestId("admin-context-note-edit-attachment-input"), {
      target: {
        files: [new File(["png"], "context-proof.png", { type: "image/png" })],
      },
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/notes/note-1/attachments",
        expect.objectContaining({
          method: "POST",
          credentials: "same-origin",
        })
      );
    });

    expect(await screen.findByText("Image uploaded.")).toBeInTheDocument();
    expect(within(editForm).getByText("context-proof.png")).toBeVisible();

    fireEvent.click(screen.getByTestId("admin-context-note-attachment-delete"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/notes/note-1/attachments/attachment-1",
        expect.objectContaining({
          method: "DELETE",
          credentials: "same-origin",
        })
      );
    });

    expect(await screen.findByText("Image deleted.")).toBeInTheDocument();
    expect(within(editForm).getByText("No images attached yet.")).toBeVisible();
  }, 15_000);

  it("shows stable note references and full-notes jump links for contextual notes", async () => {
    const initialItem = buildItem({
      related_notes: [
        {
          id: "note-2",
          title: "Follow-up note",
          category: "Operations",
          note_date: "2026-04-02",
          is_done: true,
          priority: "high",
        },
      ],
    });

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.startsWith("/api/admin/notes?")) {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            role: "editor",
            items: [initialItem],
            schemaReady: true,
            warning: null,
          }),
        } as Response;
      }

      if (url === "/api/admin/categories/notes") {
        return {
          ok: true,
          json: async () => ({
            ok: true,
            items: [{ id: "category-1", title: "Operations", is_active: true }],
          }),
        } as Response;
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminContextNotesPanel
        contextType="page"
        contextRef="/plans"
        contextLabel="Plans page"
        collapsedByDefault={false}
      />
    );

    const item = await screen.findByTestId("admin-context-note-item");
    expect(within(item).getByText("Note ID note-1")).toBeVisible();
    expect(within(item).getByRole("link", { name: "Open in Notes" })).toHaveAttribute(
      "href",
      "/admin?tab=notes&notesQuery=note-1&notesStatus=open"
    );
    expect(within(item).getByText("Related notes")).toBeVisible();
    expect(within(item).getByRole("link", { name: "Follow-up note" })).toHaveAttribute(
      "href",
      "/admin?tab=notes&notesQuery=note-2&notesStatus=done"
    );
    expect(within(item).getByText(/High\s+·\s+Note ID note-2/)).toBeVisible();
  });
});
