import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminNotesManager from "@/components/admin/AdminNotesManager";
import type { AdminNoteItem } from "@/lib/admin/notes";

const navigationState = vi.hoisted(() => ({
  pathname: "/admin",
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
  useSearchParams: () => navigationState.searchParams,
}));

function jsonResponse(payload: unknown, ok = true) {
  return {
    ok,
    json: async () => payload,
  } as Response;
}

function buildNote(overrides: Partial<AdminNoteItem> = {}): AdminNoteItem {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Primary note",
    body: "Primary body",
    category: "Operations",
    note_date: "2026-05-20",
    priority: "normal",
    is_done: false,
    context_type: null,
    context_ref: null,
    created_by: "admin-user",
    updated_by: "admin-user",
    created_at: "2026-05-20T10:00:00.000Z",
    updated_at: "2026-05-20T10:00:00.000Z",
    attachments: [],
    related_notes: [],
    ...overrides,
  };
}

function installFetchMock(
  options: {
    notesResponses?: Response[];
    createResponse?: Response;
  } = {}
) {
  const notesResponses = options.notesResponses ?? [
    jsonResponse({
      ok: true,
      items: [buildNote()],
      schemaReady: true,
      warning: null,
    }),
  ];
  let notesGetIndex = 0;

  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.pathname : input.url;
    const method = init?.method ?? "GET";

    if (url === "/api/admin/notes" && method === "GET") {
      const response = notesResponses[Math.min(notesGetIndex, notesResponses.length - 1)];
      notesGetIndex += 1;
      return Promise.resolve(response);
    }

    if (url === "/api/admin/notes" && method === "POST") {
      return Promise.resolve(
        options.createResponse ??
          jsonResponse(
            {
              ok: false,
              error: "Could not create note.",
            },
            false
          )
      );
    }

    if (url === "/api/admin/categories/notes") {
      return Promise.resolve(jsonResponse({ ok: true, items: [] }));
    }

    if (url === "/api/admin/content") {
      return Promise.resolve(jsonResponse({ ok: true, items: [] }));
    }

    if (url === "/api/admin/products") {
      return Promise.resolve(jsonResponse({ ok: true, items: [] }));
    }

    throw new Error(`Unhandled fetch for ${method} ${url}`);
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("AdminNotesManager state rendering", () => {
  beforeEach(() => {
    navigationState.pathname = "/admin";
    navigationState.searchParams = new URLSearchParams();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows a polite loading state before notes resolve", () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url =
        typeof input === "string" ? input : input instanceof URL ? input.pathname : input.url;
      if (url === "/api/admin/notes") {
        return new Promise<Response>(() => {});
      }
      throw new Error(`Unhandled fetch for ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminNotesManager />);

    const loading = screen.getByRole("status");
    expect(loading).toHaveTextContent("Loading notes…");
    expect(loading).toHaveAttribute("aria-live", "polite");
  });

  it("keeps schema warnings polite and unchanged", async () => {
    installFetchMock({
      notesResponses: [
        jsonResponse({
          ok: true,
          items: [buildNote()],
          schemaReady: false,
          warning: "Admin notes schema is not ready.",
        }),
      ],
    });

    render(<AdminNotesManager />);

    const warningText = await screen.findByText("Admin notes schema is not ready.");
    const warning = warningText.closest('[role="status"]');
    if (!warning) {
      throw new Error("Expected warning state wrapper to render.");
    }
    expect(warning).toHaveAttribute("role", "status");
    expect(warning).toHaveAttribute("aria-live", "polite");
  });

  it("keeps load error retry wired to the original notes loader", async () => {
    const fetchMock = installFetchMock({
      notesResponses: [
        jsonResponse(
          {
            ok: false,
            error: "Could not load notes.",
          },
          false
        ),
        jsonResponse({
          ok: true,
          items: [buildNote()],
          schemaReady: true,
          warning: null,
        }),
      ],
    });

    render(<AdminNotesManager />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveTextContent("Could not load notes.");

    fireEvent.click(within(alert).getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("Primary note")).toBeVisible();
    const notesGetCalls = fetchMock.mock.calls.filter(
      ([input, init]) =>
        input === "/api/admin/notes" &&
        ((init as RequestInit | undefined)?.method ?? "GET") === "GET"
    );
    expect(notesGetCalls).toHaveLength(2);
    expect(notesGetCalls[1]).toEqual([
      "/api/admin/notes",
      {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      },
    ]);
  });

  it("renders the unchanged empty notes guidance without live-region noise", async () => {
    installFetchMock({
      notesResponses: [
        jsonResponse({
          ok: true,
          items: [],
          schemaReady: true,
          warning: null,
        }),
      ],
    });

    render(<AdminNotesManager />);

    const emptyState = await screen.findByTestId("admin-notes-empty-state");
    expect(emptyState).toHaveTextContent("No notes created yet. Add your first admin note below.");
    expect(emptyState).not.toHaveAttribute("role");
    expect(emptyState).not.toHaveAttribute("aria-live");
  });

  it("renders filtered no-results guidance without live-region noise", async () => {
    navigationState.searchParams = new URLSearchParams("notesQuery=missing&notesStatus=all");
    installFetchMock();

    render(<AdminNotesManager />);

    const noResults = await screen.findByTestId("admin-notes-no-results-state");
    expect(noResults).toHaveTextContent(
      "No notes match the current filters. Clear filters or switch to done archive to find older notes."
    );
    expect(noResults).not.toHaveAttribute("role");
    expect(noResults).not.toHaveAttribute("aria-live");
  });

  it("keeps notes filters compact and wrapping on the admin desktop surface", async () => {
    installFetchMock();

    render(<AdminNotesManager />);

    await screen.findByText("Primary note");

    expect(screen.getByTestId("admin-notes-filter-controls")).toHaveClass("flex", "flex-wrap");
    expect(screen.getByTestId("admin-notes-search").closest("label")).toHaveClass(
      "xl:basis-[16rem]"
    );
    expect(screen.getByTestId("admin-notes-status-filter")).toHaveClass("xl:basis-[20rem]");
    expect(screen.getByTestId("admin-notes-category-filter").closest("label")).toHaveClass(
      "xl:basis-[10rem]"
    );
    expect(screen.getByTestId("admin-notes-context-ref-filter").closest("label")).toHaveClass(
      "xl:basis-[12rem]"
    );
  });

  it("uses AW-006 token cards and actions for the notes manager shell", async () => {
    installFetchMock();

    render(<AdminNotesManager />);

    await screen.findByText("Primary note");

    const header = screen.getByTestId("admin-notes-manager-header");
    expect(header.className).toContain("fs-library-card");
    expect(header.className).toContain("fs-library-card-accent");

    const openStatus = screen.getByTestId("admin-notes-status-open");
    expect(openStatus.className).toContain("fs-library-card");
    expect(openStatus.className).toContain("fs-library-card-accent");

    const noteItem = screen.getByTestId("admin-note-item");
    expect(noteItem.className).toContain("rounded-[var(--fs-radius-card)]");
    expect(within(noteItem).getByRole("button", { name: "Edit" }).className).toContain(
      "fs-cta-secondary"
    );
    expect(within(noteItem).getByRole("button", { name: /Delete/ }).className).toContain(
      "text-rose-700"
    );

    const createPanel = screen.getByTestId("admin-notes-create-panel");
    expect(createPanel.className).toContain("fs-library-card");
    expect(screen.getByRole("button", { name: "Save note" }).className).toContain("fs-cta-primary");
  });

  it("progressively reveals low-frequency create helpers without hiding their actions", async () => {
    installFetchMock();

    render(<AdminNotesManager />);

    await screen.findByText("Primary note");
    const createForm = screen.getByTestId("admin-notes-create-form");

    expect(within(createForm).queryByRole("button", { name: "Use P1 template" })).toBeNull();
    expect(
      within(createForm).queryByRole("button", { name: "Paste image from clipboard" })
    ).toBeNull();
    expect(within(createForm).queryByTestId("admin-note-create-context-type")).toBeNull();

    fireEvent.click(within(createForm).getByRole("button", { name: /Incident quick templates/ }));
    fireEvent.click(within(createForm).getByRole("button", { name: "Use P1 template" }));
    expect(within(createForm).getByLabelText("Category")).toHaveValue("Incident P1");

    fireEvent.click(within(createForm).getByRole("button", { name: /Image \(optional\)/ }));
    expect(
      within(createForm).getByRole("button", { name: "Paste image from clipboard" })
    ).toBeVisible();
    expect(within(createForm).getByLabelText("Upload images")).toBeInTheDocument();

    fireEvent.click(within(createForm).getByRole("button", { name: /Attach to \(optional\)/ }));
    expect(within(createForm).getByTestId("admin-note-create-context-type")).toBeVisible();
    expect(within(createForm).getByLabelText("Selected target")).toBeDisabled();
  });

  it("announces create action errors politely without changing the payload", async () => {
    const fetchMock = installFetchMock({
      notesResponses: [
        jsonResponse({
          ok: true,
          items: [],
          schemaReady: true,
          warning: null,
        }),
      ],
      createResponse: jsonResponse(
        {
          ok: false,
          error: "Note title must be unique.",
        },
        false
      ),
    });

    render(<AdminNotesManager />);

    await screen.findByTestId("admin-notes-empty-state");
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Primary note" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save note" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Note title must be unique.");
    expect(status).toHaveAttribute("aria-live", "polite");

    const createCall = fetchMock.mock.calls.find(
      ([input, init]) =>
        input === "/api/admin/notes" &&
        ((init as RequestInit | undefined)?.method ?? "GET") === "POST"
    );
    expect(createCall).toBeDefined();
    if (!createCall) {
      throw new Error("Expected create call to be made.");
    }
    const [, init] = createCall;
    expect(init).toMatchObject({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    });
    expect(JSON.parse(String((init as RequestInit).body))).toMatchObject({
      title: "Primary note",
      category: "General",
      priority: "normal",
      body: "",
      isDone: false,
      contextType: "",
      contextRef: "",
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save note" })).toBeEnabled();
    });
  });
});
