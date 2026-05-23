import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminNoteQuickCaptureLauncher from "@/components/admin/AdminNoteQuickCaptureLauncher";
import { clearQuickCaptureDraftStore } from "@/lib/admin/admin-note-quick-capture-draft";

describe("AdminNoteQuickCaptureLauncher", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    clearQuickCaptureDraftStore();
    window.sessionStorage.clear();
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

  it("keeps quick-note text entry focused while typing continuously", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        items: [{ id: "category-1", title: "Operations", is_active: true }],
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

    await user.click(screen.getByTestId("admin-note-quick-capture-trigger"));
    await screen.findByTestId("admin-note-quick-capture-dialog");

    const titleInput = screen.getByLabelText("Title");
    await user.click(titleInput);
    await user.type(titleInput, "Typing should stay active");

    expect(titleInput).toHaveValue("Typing should stay active");
    expect(titleInput).toHaveFocus();
  });

  it("opens as a non-modal utility panel instead of a blocking dialog", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        items: [{ id: "category-1", title: "Operations", is_active: true }],
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

    await user.click(screen.getByTestId("admin-note-quick-capture-trigger"));
    await screen.findByTestId("admin-note-quick-capture-dialog");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Collapse quick note" })).toBeInTheDocument();
  });

  it("uses the simplified quick-note heading, copy, and primary actions", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        items: [{ id: "category-1", title: "Operations", is_active: true }],
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

    await user.click(screen.getByTestId("admin-note-quick-capture-trigger"));
    await screen.findByTestId("admin-note-quick-capture-dialog");

    expect(screen.getByRole("heading", { name: "Admin note" })).toBeInTheDocument();
    expect(
      screen.queryByText("Capture a context-aware admin note without leaving this surface.")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Create note fast")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Title"), "Tighten copy");
    expect(screen.getAllByRole("button", { name: "Discard" })).toHaveLength(2);
    expect(screen.queryByText("Loading category suggestions…")).not.toBeInTheDocument();
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

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    const requestBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body));
    expect(requestBody.contextType).toBe("page");
    expect(requestBody.contextRef).toBe("/plans");
    expect(requestBody.priority).toBe("high");
    expect(requestBody.title).toBe("Plans follow-up");

    await screen.findByText("Quick note saved.");
    const savedState = screen.getByTestId("admin-note-quick-capture-saved-state");
    expect(savedState).toHaveAttribute("role", "status");
    expect(savedState).toHaveAttribute("aria-live", "polite");
    expect(savedState).toHaveClass("border-emerald-200", "bg-emerald-50", "text-emerald-700");
    expect(within(savedState).getByRole("link", { name: "Open in Notes" })).toBeInTheDocument();
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("admin-note-quick-capture-dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(
      screen.getByText("Ready for another note in the same locked context.", { exact: false })
    ).toBeInTheDocument();

    const openLink = screen.getByRole("link", { name: "Open in Notes" });
    expect(openLink).toHaveAttribute(
      "href",
      expect.stringContaining("notesQuery=123e4567-e89b-42d3-a456-426614174099")
    );
    expect(openLink).toHaveAttribute("href", expect.stringContaining("notesContextType=page"));
    expect(openLink).toHaveAttribute("href", expect.stringContaining("notesContextRef=%2Fplans"));
  });

  it("closes the quick-capture panel when opening the saved note in Notes", async () => {
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
      />
    );

    fireEvent.click(screen.getByTestId("admin-note-quick-capture-trigger"));
    await screen.findByTestId("admin-note-quick-capture-dialog");

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Plans follow-up" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const openLink = await screen.findByRole("link", { name: "Open in Notes" });
    fireEvent.click(openLink);

    await waitFor(() => {
      expect(screen.queryByTestId("admin-note-quick-capture-dialog")).not.toBeInTheDocument();
    });
  });

  it("auto-dismisses the saved notice after a short acknowledgement window", async () => {
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
      />
    );

    fireEvent.click(screen.getByTestId("admin-note-quick-capture-trigger"));
    await screen.findByTestId("admin-note-quick-capture-dialog");

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Plans follow-up" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await screen.findByText("Quick note saved.");
    expect(screen.getByTestId("admin-note-quick-capture-dialog")).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.queryByText("Quick note saved.")).not.toBeInTheDocument();
      },
      { timeout: 6_000 }
    );
  }, 10_000);

  it("saves a quick note and uploads staged image attachments without forcing a reopen", async () => {
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
              {
                id: "attachment-2",
                note_id: "123e4567-e89b-42d3-a456-426614174099",
                file_name: "captured-proof-2.png",
                mime_type: "image/png",
                size_bytes: 12,
                created_at: "2026-03-22T12:01:30.000Z",
                created_by: "admin-user",
                signed_url: "https://example.com/captured-proof-2.png",
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

    fireEvent.change(screen.getByLabelText("Upload images"), {
      target: {
        files: [new File(["png"], "captured-proof.png", { type: "image/png" })],
      },
    });
    await screen.findByText("1 image ready to attach");

    fireEvent.change(screen.getByLabelText("Upload images"), {
      target: {
        files: [new File(["png"], "captured-proof-2.png", { type: "image/png" })],
      },
    });
    await screen.findByText("2 images ready to attach");
    expect(screen.getAllByTestId("admin-note-quick-capture-image-preview")).toHaveLength(2);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Plans screenshot follow-up" },
    });
    fireEvent.change(screen.getByLabelText("Text"), {
      target: { value: "Remember the visual change." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    expect(String(fetchMock.mock.calls[2]?.[0])).toContain(
      "/api/admin/notes/123e4567-e89b-42d3-a456-426614174099/attachments"
    );
    const uploadFormData = fetchMock.mock.calls[2]?.[1]?.body as FormData;
    const uploadedFiles = uploadFormData.getAll("files") as File[];
    expect(uploadedFiles).toHaveLength(2);
    expect(uploadedFiles.map((file) => file.name)).toEqual([
      "captured-proof.png",
      "captured-proof-2.png",
    ]);
    expect(onSaved).toHaveBeenCalledTimes(1);
    await screen.findByText("Quick note saved.");
    expect(screen.getByTestId("admin-note-quick-capture-dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.queryByTestId("admin-note-quick-capture-image-preview")).not.toBeInTheDocument();
  });

  it("appends repeated staged images and lets one image be removed without clearing the rest", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        items: [{ id: "category-1", title: "Operations", is_active: true }],
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

    fireEvent.change(screen.getByLabelText("Upload images"), {
      target: {
        files: [new File(["png"], "captured-proof.png", { type: "image/png" })],
      },
    });
    await screen.findByText("1 image ready to attach");

    fireEvent.change(screen.getByLabelText("Upload images"), {
      target: {
        files: [new File(["png"], "captured-proof-2.png", { type: "image/png" })],
      },
    });
    await screen.findByText("2 images ready to attach");
    expect(screen.getAllByTestId("admin-note-quick-capture-image-preview")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Remove image 1" }));

    await screen.findByText("1 image ready to attach");
    expect(screen.getAllByTestId("admin-note-quick-capture-image-preview")).toHaveLength(1);
    expect(screen.queryByText("captured-proof.png")).not.toBeInTheDocument();
    expect(screen.getByText("captured-proof-2.png")).toBeInTheDocument();
  });

  it("collapses and resumes a quick-note draft without losing staged image evidence", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        items: [{ id: "category-1", title: "Operations", is_active: true }],
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

    fireEvent.change(screen.getByLabelText("Upload images"), {
      target: {
        files: [new File(["png"], "captured-proof.png", { type: "image/png" })],
      },
    });
    await screen.findByText("1 image ready to attach");

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Collapsed quick note" },
    });
    fireEvent.change(screen.getByLabelText("Text"), {
      target: { value: "Keep this draft while reviewing the page." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Collapse quick note" }));

    await waitFor(() => {
      expect(screen.queryByTestId("admin-note-quick-capture-dialog")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("admin-note-quick-capture-minimized")).toBeInTheDocument();
    expect(screen.getByTestId("admin-note-quick-capture-resume")).toHaveAttribute(
      "aria-label",
      "Resume quick note"
    );
    expect(screen.queryByRole("button", { name: "Discard" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("admin-note-quick-capture-resume"));

    await screen.findByTestId("admin-note-quick-capture-dialog");
    expect(screen.getByLabelText("Title")).toHaveValue("Collapsed quick note");
    expect(screen.getByLabelText("Text")).toHaveValue("Keep this draft while reviewing the page.");
    expect(screen.getByText("1 image ready to attach")).toBeInTheDocument();
  });

  it("restores the same draft on another supported surface while keeping the original locked context", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        items: [{ id: "category-1", title: "Operations", is_active: true }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const firstRender = render(
      <AdminNoteQuickCaptureLauncher
        adminRole="editor"
        contextType="page"
        contextRef="/plans"
        contextLabel="Plans page"
      />
    );

    fireEvent.click(screen.getByTestId("admin-note-quick-capture-trigger"));
    await screen.findByTestId("admin-note-quick-capture-dialog");

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Carry this draft across pages" },
    });
    fireEvent.change(screen.getByLabelText("Text"), {
      target: { value: "Stay attached to the original page context." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Collapse quick note" }));

    await waitFor(() => {
      expect(screen.queryByTestId("admin-note-quick-capture-dialog")).not.toBeInTheDocument();
    });

    firstRender.unmount();

    render(
      <AdminNoteQuickCaptureLauncher
        adminRole="editor"
        contextType="course_lesson"
        contextRef="lesson-123"
        contextLabel="Lesson: Floating on your back"
      />
    );

    expect(screen.getByTestId("admin-note-quick-capture-minimized")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("admin-note-quick-capture-resume"));

    await screen.findByTestId("admin-note-quick-capture-dialog");
    expect(screen.getByLabelText("Title")).toHaveValue("Carry this draft across pages");
    expect(screen.getByLabelText("Text")).toHaveValue(
      "Stay attached to the original page context."
    );
    expect(screen.getAllByText("Plans page")).toHaveLength(2);
    expect(
      screen.getByText("You are viewing another page right now. This draft will still save to", {
        exact: false,
      })
    ).toBeInTheDocument();
    const contextWarning = screen.getByTestId("admin-note-quick-capture-context-warning");
    expect(contextWarning).not.toHaveAttribute("role");
    expect(contextWarning).not.toHaveAttribute("aria-live");
    expect(contextWarning).toHaveClass("border-amber-200", "bg-amber-50", "text-amber-800");
  });

  it("keeps image recovery visible when note save succeeds but attachment upload fails", async () => {
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

    fireEvent.change(screen.getByLabelText("Upload images"), {
      target: {
        files: [new File(["png"], "captured-proof.png", { type: "image/png" })],
      },
    });
    await screen.findByText("1 image ready to attach");

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Plans screenshot follow-up" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await screen.findByText(/Note saved, but could not upload attachments/i);
    const errorState = screen.getByTestId("admin-note-quick-capture-error-state");
    expect(errorState).toHaveAttribute("role", "status");
    expect(errorState).toHaveAttribute("aria-live", "polite");
    expect(errorState).toHaveClass("border-rose-200", "bg-rose-50", "text-rose-700");
    expect(screen.getByRole("button", { name: "Retry upload" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open in Notes" })).toBeInTheDocument();
  });

  it("stages a clipboard image from the explicit paste button and uploads it after the note save succeeds", async () => {
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
            title: "Clipboard note",
            body: "Pasted image note.",
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
            title: "Clipboard note",
            body: "Pasted image note.",
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
                file_name: "pasted-image.png",
                mime_type: "image/png",
                size_bytes: 12,
                created_at: "2026-03-22T12:01:00.000Z",
                created_by: "admin-user",
                signed_url: "https://example.com/pasted-image.png",
              },
            ],
            related_notes: [],
          },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        read: vi.fn().mockResolvedValue([
          {
            types: ["image/png"],
            getType: async () => new Blob(["png"], { type: "image/png" }),
          },
        ]),
      },
    });

    render(
      <AdminNoteQuickCaptureLauncher
        adminRole="editor"
        contextType="page"
        contextRef="/plans"
        contextLabel="Plans page"
      />
    );

    fireEvent.click(screen.getByTestId("admin-note-quick-capture-trigger"));
    await screen.findByTestId("admin-note-quick-capture-form");
    fireEvent.click(screen.getByRole("button", { name: "Paste image from clipboard" }));

    await screen.findByText("1 image ready to attach");

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Clipboard note" },
    });
    fireEvent.change(screen.getByLabelText("Text"), {
      target: { value: "Pasted image note." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    expect(String(fetchMock.mock.calls[2]?.[0])).toContain(
      "/api/admin/notes/123e4567-e89b-42d3-a456-426614174099/attachments"
    );
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
    fireEvent.click(screen.getAllByRole("button", { name: "Discard" })[0]);

    await waitFor(() => {
      expect(screen.queryByTestId("admin-note-quick-capture-dialog")).not.toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/admin/categories/notes");
  });
});
