import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminNoteQuickCaptureLauncher from "@/components/admin/AdminNoteQuickCaptureLauncher";

describe("AdminNoteQuickCaptureLauncher", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    delete window.__FS_ADMIN_SCREENSHOT_CAPTURE_OVERRIDE__;
  });

  it("hides the launcher for viewer role", () => {
    render(
      <AdminNoteQuickCaptureLauncher
        adminRole="viewer"
        contextType="page"
        contextRef="/plans"
        contextLabel="Plans page"
      />
    );

    expect(screen.queryByTestId("admin-note-quick-capture-trigger")).not.toBeInTheDocument();
  });

  it("saves a quick note with canonical context and exposes the notes link", async () => {
    const onSaved = vi.fn();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          items: [{ id: "category-1", title: "Operations", is_active: true }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          item: {
            id: "123e4567-e89b-42d3-a456-426614174099",
            title: "Plans follow-up",
            body: "Remember to tighten copy.",
            category: "Operations",
            note_date: "2026-03-22",
            priority: "high",
            is_done: false,
            context_type: "page",
            context_ref: "/plans",
            created_by: "admin-user",
            updated_by: "admin-user",
            created_at: "2026-03-22T12:00:00.000Z",
            updated_at: "2026-03-22T12:00:00.000Z",
            attachments: [],
            related_notes: [],
          },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminNoteQuickCaptureLauncher
        adminRole="editor"
        contextType="page"
        contextRef="/plans"
        contextLabel="Plans page"
        onSaved={onSaved}
      />
    );

    fireEvent.click(screen.getByTestId("admin-note-quick-capture-trigger"));
    await screen.findByTestId("admin-note-quick-capture-dialog");

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Plans follow-up" },
    });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Operations" },
    });
    fireEvent.change(screen.getByLabelText("Priority"), {
      target: { value: "high" },
    });
    fireEvent.change(screen.getByLabelText("Text"), {
      target: { value: "Remember to tighten copy." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save note" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    const requestBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body));
    expect(requestBody.contextType).toBe("page");
    expect(requestBody.contextRef).toBe("/plans");
    expect(requestBody.priority).toBe("high");
    expect(requestBody.title).toBe("Plans follow-up");

    await screen.findByText("Quick note saved.");
    expect(onSaved).toHaveBeenCalledTimes(1);

    const openLink = screen.getByRole("link", { name: "Open in Notes" });
    expect(openLink).toHaveAttribute(
      "href",
      expect.stringContaining("notesQuery=123e4567-e89b-42d3-a456-426614174099")
    );
    expect(openLink).toHaveAttribute("href", expect.stringContaining("notesContextType=page"));
    expect(openLink).toHaveAttribute("href", expect.stringContaining("notesContextRef=%2Fplans"));
  });

  it("saves a quick note and uploads a captured screenshot attachment", async () => {
    const onSaved = vi.fn();
    window.__FS_ADMIN_SCREENSHOT_CAPTURE_OVERRIDE__ = {
      isSupported: () => true,
      capture: async () => ({
        blob: new Blob(["capture"], { type: "image/png" }),
        width: 200,
        height: 100,
        fileName: "captured-proof.png",
      }),
      cropToFile: async () => new File(["cropped"], "captured-proof.png", { type: "image/png" }),
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          items: [{ id: "category-1", title: "Operations", is_active: true }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          item: {
            id: "123e4567-e89b-42d3-a456-426614174099",
            title: "Plans screenshot follow-up",
            body: "Remember the visual change.",
            category: "Operations",
            note_date: "2026-03-22",
            priority: "normal",
            is_done: false,
            context_type: "page",
            context_ref: "/plans",
            created_by: "admin-user",
            updated_by: "admin-user",
            created_at: "2026-03-22T12:00:00.000Z",
            updated_at: "2026-03-22T12:00:00.000Z",
            attachments: [],
            related_notes: [],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          item: {
            id: "123e4567-e89b-42d3-a456-426614174099",
            title: "Plans screenshot follow-up",
            body: "Remember the visual change.",
            category: "Operations",
            note_date: "2026-03-22",
            priority: "normal",
            is_done: false,
            context_type: "page",
            context_ref: "/plans",
            created_by: "admin-user",
            updated_by: "admin-user",
            created_at: "2026-03-22T12:00:00.000Z",
            updated_at: "2026-03-22T12:00:00.000Z",
            attachments: [
              {
                id: "attachment-1",
                note_id: "123e4567-e89b-42d3-a456-426614174099",
                file_name: "captured-proof.png",
                mime_type: "image/png",
                size_bytes: 12,
                created_at: "2026-03-22T12:01:00.000Z",
                created_by: "admin-user",
                signed_url: "https://example.com/captured-proof.png",
              },
            ],
            related_notes: [],
          },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminNoteQuickCaptureLauncher
        adminRole="editor"
        contextType="page"
        contextRef="/plans"
        contextLabel="Plans page"
        onSaved={onSaved}
      />
    );

    fireEvent.click(screen.getByTestId("admin-note-quick-capture-trigger"));
    await screen.findByTestId("admin-note-quick-capture-dialog");

    fireEvent.click(screen.getByRole("button", { name: "Capture screenshot" }));
    await screen.findByTestId("admin-note-screenshot-preview-image");
    fireEvent.click(screen.getByRole("button", { name: "Save screenshot" }));
    await screen.findByText("Screenshot ready to attach");

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Plans screenshot follow-up" },
    });
    fireEvent.change(screen.getByLabelText("Text"), {
      target: { value: "Remember the visual change." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save note" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    expect(String(fetchMock.mock.calls[2]?.[0])).toContain(
      "/api/admin/notes/123e4567-e89b-42d3-a456-426614174099/attachments"
    );
    expect(onSaved).toHaveBeenCalledTimes(1);
    await screen.findByText("Quick note saved.");
  });

  it("keeps screenshot recovery visible when note save succeeds but attachment upload fails", async () => {
    window.__FS_ADMIN_SCREENSHOT_CAPTURE_OVERRIDE__ = {
      isSupported: () => true,
      capture: async () => ({
        blob: new Blob(["capture"], { type: "image/png" }),
        width: 200,
        height: 100,
        fileName: "captured-proof.png",
      }),
      cropToFile: async () => new File(["cropped"], "captured-proof.png", { type: "image/png" }),
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          items: [{ id: "category-1", title: "Operations", is_active: true }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          item: {
            id: "123e4567-e89b-42d3-a456-426614174099",
            title: "Plans screenshot follow-up",
            body: "Remember the visual change.",
            category: "Operations",
            note_date: "2026-03-22",
            priority: "normal",
            is_done: false,
            context_type: "page",
            context_ref: "/plans",
            created_by: "admin-user",
            updated_by: "admin-user",
            created_at: "2026-03-22T12:00:00.000Z",
            updated_at: "2026-03-22T12:00:00.000Z",
            attachments: [],
            related_notes: [],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          ok: false,
          error: "Could not upload attachments.",
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminNoteQuickCaptureLauncher
        adminRole="editor"
        contextType="page"
        contextRef="/plans"
        contextLabel="Plans page"
      />
    );

    fireEvent.click(screen.getByTestId("admin-note-quick-capture-trigger"));
    await screen.findByTestId("admin-note-quick-capture-dialog");

    fireEvent.click(screen.getByRole("button", { name: "Capture screenshot" }));
    await screen.findByTestId("admin-note-screenshot-preview-image");
    fireEvent.click(screen.getByRole("button", { name: "Save screenshot" }));
    await screen.findByText("Screenshot ready to attach");

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Plans screenshot follow-up" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save note" }));

    await screen.findByText(/Note saved, but could not upload attachments/i);
    expect(screen.getByRole("button", { name: "Retry upload" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open in Notes" })).toBeInTheDocument();
  });

  it("cancels without posting a note", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        items: [],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminNoteQuickCaptureLauncher
        adminRole="admin"
        contextType="page"
        contextRef="/admin"
        contextLabel="Admin dashboard"
      />
    );

    fireEvent.click(screen.getByTestId("admin-note-quick-capture-trigger"));
    await screen.findByTestId("admin-note-quick-capture-dialog");
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Should not save" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByTestId("admin-note-quick-capture-dialog")).not.toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/admin/categories/notes");
  });
});
