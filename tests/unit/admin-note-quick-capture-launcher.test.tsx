import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminNoteQuickCaptureLauncher from "@/components/admin/AdminNoteQuickCaptureLauncher";

describe("AdminNoteQuickCaptureLauncher", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
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
