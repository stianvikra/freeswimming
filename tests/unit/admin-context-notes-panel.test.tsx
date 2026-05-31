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

function okJson(payload: unknown, init?: Partial<Response>): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
    ...init,
  } as Response;
}

function errorJson(payload: unknown, init?: Partial<Response>): Response {
  return {
    ok: false,
    status: 500,
    json: async () => payload,
    ...init,
  } as Response;
}

function buildNotesPayload(overrides?: {
  items?: AdminNoteItem[];
  role?: "editor" | "viewer";
  schemaReady?: boolean;
  warning?: string | null;
}) {
  return {
    ok: true,
    role: overrides?.role ?? "editor",
    items: overrides?.items ?? [],
    schemaReady: overrides?.schemaReady ?? true,
    warning: overrides?.warning ?? null,
  };
}

function buildCategoriesPayload() {
  return {
    ok: true,
    items: [{ id: "category-1", title: "Operations", is_active: true }],
  };
}

describe("AdminContextNotesPanel", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders contextual warning and empty states through the admin state primitive", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.startsWith("/api/admin/notes?")) {
        return okJson(
          buildNotesPayload({
            schemaReady: false,
            warning: "Admin notes schema is not ready.",
          })
        );
      }

      if (url === "/api/admin/categories/notes") {
        return okJson(buildCategoriesPayload());
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminContextNotesPanel
        contextType="page"
        contextRef="/context-warning-empty"
        contextLabel="Context warning"
        collapsedByDefault={false}
      />
    );

    const warning = await screen.findByText("Admin notes schema is not ready.");
    expect(warning.closest('[role="status"]')).toHaveAttribute("aria-live", "polite");

    const emptyState = await screen.findByTestId("admin-context-notes-empty-state");
    expect(emptyState).toHaveTextContent("No admin notes attached yet.");
    expect(emptyState).not.toHaveAttribute("role");
    expect(emptyState).not.toHaveAttribute("aria-live");
  });

  it("renders contextual loading through the admin state primitive during context refresh", async () => {
    let resolveSecondNotes!: (value: Response) => void;
    const secondNotesPromise = new Promise<Response>((resolve) => {
      resolveSecondNotes = resolve;
    });

    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("contextRef=%2Fcontext-loading-a")) {
        return Promise.resolve(okJson(buildNotesPayload()));
      }

      if (url.includes("contextRef=%2Fcontext-loading-b")) {
        return secondNotesPromise;
      }

      if (url === "/api/admin/categories/notes") {
        return Promise.resolve(okJson(buildCategoriesPayload()));
      }

      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    vi.stubGlobal("fetch", fetchMock);

    const { rerender } = render(
      <AdminContextNotesPanel
        contextType="page"
        contextRef="/context-loading-a"
        contextLabel="Context loading A"
        collapsedByDefault={false}
      />
    );

    await screen.findByTestId("admin-context-notes-empty-state");

    rerender(
      <AdminContextNotesPanel
        contextType="page"
        contextRef="/context-loading-b"
        contextLabel="Context loading B"
        collapsedByDefault={false}
      />
    );

    const loading = await screen.findByText("Loading notes…");
    expect(loading.closest('[role="status"]')).toHaveAttribute("aria-live", "polite");

    resolveSecondNotes(okJson(buildNotesPayload()));
    await screen.findByTestId("admin-context-notes-empty-state");
  });

  it("keeps contextual load errors announced and retries with the same loader", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.startsWith("/api/admin/notes?")) {
        const notesRequestCount = fetchMock.mock.calls.filter(([callInput]) =>
          String(callInput).startsWith("/api/admin/notes?")
        ).length;

        if (notesRequestCount === 1) {
          return errorJson({
            ok: false,
            error: "Could not load context notes.",
          });
        }

        return okJson(buildNotesPayload());
      }

      if (url === "/api/admin/categories/notes") {
        return okJson(buildCategoriesPayload());
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminContextNotesPanel
        contextType="page"
        contextRef="/context-load-error"
        contextLabel="Context load error"
        collapsedByDefault={false}
      />
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Could not load context notes.");
    expect(alert).toHaveAttribute("aria-live", "assertive");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await screen.findByTestId("admin-context-notes-empty-state");
    expect(
      fetchMock.mock.calls.filter(([input]) => String(input).startsWith("/api/admin/notes?"))
    ).toHaveLength(2);
  });

  it("renders contextual action errors through polite admin state feedback", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.startsWith("/api/admin/notes?")) {
        return okJson(buildNotesPayload());
      }

      if (url === "/api/admin/categories/notes") {
        return okJson(buildCategoriesPayload());
      }

      if (url === "/api/admin/notes" && init?.method === "POST") {
        return errorJson({
          ok: false,
          error: "Could not save note.",
        });
      }

      throw new Error(`Unexpected fetch: ${url} ${init?.method ?? "GET"}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminContextNotesPanel
        contextType="page"
        contextRef="/context-action-error"
        contextLabel="Context action error"
        collapsedByDefault={false}
      />
    );

    const createForm = await screen.findByTestId("admin-context-note-create-form");
    fireEvent.change(within(createForm).getByLabelText("Title"), {
      target: { value: "Broken save" },
    });
    fireEvent.click(within(createForm).getByRole("button", { name: "Save note" }));

    const actionError = await screen.findByText("Could not save note.");
    expect(actionError.closest('[role="status"]')).toHaveAttribute("aria-live", "polite");
  });

  it("uses AW-006 token cards and actions for contextual notes", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.startsWith("/api/admin/notes?")) {
        return okJson(buildNotesPayload({ items: [buildItem()] }));
      }

      if (url === "/api/admin/categories/notes") {
        return okJson(buildCategoriesPayload());
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminContextNotesPanel
        contextType="page"
        contextRef="/context-token-actions"
        contextLabel="Context token actions"
        collapsedByDefault={false}
      />
    );

    const panel = await screen.findByTestId("admin-context-notes-panel");
    expect(panel).toHaveClass("fs-library-card", "fs-library-card-accent");
    expect(await screen.findByTestId("admin-note-quick-capture-trigger")).toHaveClass(
      "fs-cta-primary"
    );
    expect(screen.getByTestId("admin-context-notes-toggle")).toHaveClass("fs-cta-secondary");

    const createPanel = await screen.findByTestId("admin-context-note-create-panel");
    expect(createPanel).toHaveClass("fs-library-card", "fs-library-card-muted");

    const createForm = await screen.findByTestId("admin-context-note-create-form");
    expect(within(createForm).getByRole("button", { name: "Save note" })).toHaveClass(
      "fs-cta-primary"
    );
    expect(
      within(createForm).getByRole("button", { name: "Paste image from clipboard" })
    ).toHaveClass("fs-cta-secondary");
    expect(within(createForm).getByText("Upload images").closest("label")).toHaveClass(
      "fs-cta-secondary"
    );

    const item = await screen.findByTestId("admin-context-note-item");
    expect(item).toHaveClass("fs-library-card");
    expect(within(item).getByRole("button", { name: "Edit" })).toHaveClass("fs-cta-secondary");
    expect(within(item).getByRole("button", { name: "Delete" })).toHaveClass(
      "rounded-[var(--fs-radius-control)]",
      "text-rose-700"
    );

    fireEvent.click(within(item).getByRole("button", { name: "Edit" }));

    const editForm = await screen.findByTestId("admin-context-note-edit-form");
    expect(within(editForm).getByRole("button", { name: "Save changes" })).toHaveClass(
      "fs-cta-primary"
    );
    expect(within(editForm).getByRole("button", { name: "Cancel" })).toHaveClass(
      "fs-cta-secondary"
    );
    expect(within(editForm).getByText("Upload images").closest("label")).toHaveClass(
      "fs-cta-secondary"
    );
  });

  it("keeps viewer contextual notes read-only after token/action parity", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.startsWith("/api/admin/notes?")) {
        return okJson(buildNotesPayload({ items: [buildItem()], role: "viewer" }));
      }

      if (url === "/api/admin/categories/notes") {
        return okJson(buildCategoriesPayload());
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminContextNotesPanel
        contextType="page"
        contextRef="/context-viewer"
        contextLabel="Context viewer"
        collapsedByDefault={false}
      />
    );

    const item = await screen.findByTestId("admin-context-note-item");

    expect(screen.queryByTestId("admin-context-note-create-panel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("admin-note-quick-capture-trigger")).not.toBeInTheDocument();
    expect(within(item).queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(within(item).queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(within(item).getByText("Read only")).toBeVisible();
    expect(screen.getByText(/Viewer role can review contextual notes here/)).toHaveClass(
      "rounded-[var(--fs-radius-control)]"
    );
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
    expect(screen.getByTestId("admin-context-note-action-notice")).toHaveAttribute(
      "aria-live",
      "polite"
    );
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
