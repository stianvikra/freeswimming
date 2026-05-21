import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminContentManager from "@/components/admin/AdminContentManager";
import type { AdminContentItemRow } from "@/lib/admin/content";
import {
  ALL_CONTENT_SCOPE_STORAGE_KEY,
  CONTENT_PRIMARY_VIEW_STORAGE_KEY,
} from "@/lib/admin/content-view-preferences";

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

function buildContentItem(overrides?: Partial<AdminContentItemRow>): AdminContentItemRow {
  return {
    id: "content-1",
    content_type: "page",
    slug: "plans",
    title: "Plans",
    summary: "Paid offers page.",
    category: "Pages",
    body: {},
    sort_order: 0,
    status: "draft",
    parent_id: null,
    published_at: null,
    created_by: "admin-user",
    updated_by: "admin-user",
    created_at: "2026-05-21T08:00:00.000Z",
    updated_at: "2026-05-21T08:00:00.000Z",
    ...overrides,
  };
}

function buildContentPayload(overrides?: {
  items?: AdminContentItemRow[];
  schemaReady?: boolean;
  warning?: string | null;
}) {
  return {
    ok: true,
    role: "editor",
    items: overrides?.items ?? [],
    schemaReady: overrides?.schemaReady ?? true,
    warning: overrides?.warning ?? null,
  };
}

function buildCategoriesPayload() {
  return {
    ok: true,
    items: [{ id: "category-1", title: "Pages", is_active: true }],
  };
}

function buildRevision(overrides?: Partial<Record<string, unknown>>) {
  return {
    id: "revision-1",
    revisionNumber: 2,
    action: "update",
    changedByEmail: "admin@example.com",
    createdAt: "2026-05-21T09:00:00.000Z",
    snapshotTitle: "Plans",
    snapshotStatus: "draft",
    ...overrides,
  };
}

function buildRevisionsPayload(
  overrides?: Partial<{
    items: unknown[];
    canRestore: boolean;
  }>
) {
  return {
    ok: true,
    items: overrides?.items ?? [],
    canRestore: overrides?.canRestore ?? true,
  };
}

function useAllContentView(scope: "all" | AdminContentItemRow["content_type"] = "all") {
  window.localStorage.setItem(CONTENT_PRIMARY_VIEW_STORAGE_KEY, "all_content");
  window.localStorage.setItem(ALL_CONTENT_SCOPE_STORAGE_KEY, scope);
}

describe("AdminContentManager state rendering", () => {
  beforeEach(() => {
    Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders content loading and empty states through the admin state primitive", async () => {
    useAllContentView();
    let resolveContent!: (value: Response) => void;
    const contentPromise = new Promise<Response>((resolve) => {
      resolveContent = resolve;
    });
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);

      if (url === "/api/admin/content") {
        return contentPromise;
      }

      if (url === "/api/admin/categories/content") {
        return Promise.resolve(okJson(buildCategoriesPayload()));
      }

      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AdminContentManager />);

    const loading = await screen.findByTestId("admin-content-loading-state");
    expect(loading).toHaveAttribute("role", "status");
    expect(loading).toHaveAttribute("aria-live", "polite");
    expect(loading).toHaveTextContent("Loading content list…");

    resolveContent(okJson(buildContentPayload()));

    const emptyState = await screen.findByTestId("admin-content-empty-state");
    expect(emptyState).toHaveTextContent(
      "No content items created yet. Use the form below to create your first draft."
    );
    expect(emptyState).not.toHaveAttribute("role");
    expect(emptyState).not.toHaveAttribute("aria-live");
  });

  it("keeps content load errors announced and retries with the same loader", async () => {
    useAllContentView();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url === "/api/admin/content") {
        const contentRequestCount = fetchMock.mock.calls.filter(
          ([callInput]) => String(callInput) === "/api/admin/content"
        ).length;

        if (contentRequestCount === 1) {
          return errorJson({
            ok: false,
            error: "Could not load content list.",
          });
        }

        return okJson(buildContentPayload());
      }

      if (url === "/api/admin/categories/content") {
        return okJson(buildCategoriesPayload());
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AdminContentManager />);

    const alert = await screen.findByTestId("admin-content-load-error-state");
    expect(alert).toHaveAttribute("role", "alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveTextContent("Could not load content list.");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await screen.findByTestId("admin-content-empty-state");
    expect(
      fetchMock.mock.calls.filter(([input]) => String(input) === "/api/admin/content")
    ).toHaveLength(2);
  });

  it("renders schema warnings through polite admin state feedback", async () => {
    useAllContentView();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url === "/api/admin/content") {
        return okJson(
          buildContentPayload({
            schemaReady: false,
            warning: "Content catalog will appear after admin content setup is ready.",
          })
        );
      }

      if (url === "/api/admin/categories/content") {
        return okJson(buildCategoriesPayload());
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AdminContentManager />);

    const warning = await screen.findByTestId("admin-content-schema-warning-state");
    expect(warning).toHaveAttribute("role", "status");
    expect(warning).toHaveAttribute("aria-live", "polite");
    expect(warning).toHaveTextContent(
      "Content catalog will appear after admin content setup is ready."
    );

    const createWarning = await screen.findByTestId("admin-content-create-schema-warning-state");
    expect(createWarning).toHaveAttribute("role", "status");
    expect(createWarning).toHaveAttribute("aria-live", "polite");
    expect(createWarning).toHaveTextContent(
      "Setup is not ready yet. Apply latest admin schema migrations before creating content."
    );
  });

  it("renders course-workspace module preview empty states through the admin state primitive", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url === "/api/admin/content") {
        return okJson(
          buildContentPayload({
            items: [
              buildContentItem({
                id: "module-empty",
                content_type: "course_module",
                slug: "course-module-empty",
                title: "Empty module",
                category: "Course",
                body: { moduleId: "empty-module" },
              }),
            ],
          })
        );
      }

      if (url === "/api/admin/categories/content") {
        return okJson(buildCategoriesPayload());
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AdminContentManager />);

    const previewEmpty = await screen.findByTestId(
      "admin-course-module-lesson-preview-empty-state"
    );
    expect(previewEmpty).toHaveTextContent("No lessons linked to this module yet.");
    expect(previewEmpty).not.toHaveAttribute("role");
    expect(previewEmpty).not.toHaveAttribute("aria-live");
  });

  it("renders focused module empty states through the admin state primitive", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url === "/api/admin/content") {
        return okJson(
          buildContentPayload({
            items: [
              buildContentItem({
                id: "module-empty",
                content_type: "course_module",
                slug: "course-module-empty",
                title: "Empty module",
                category: "Course",
                body: { moduleId: "empty-module" },
              }),
            ],
          })
        );
      }

      if (url === "/api/admin/categories/content") {
        return okJson(buildCategoriesPayload());
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AdminContentManager />);

    fireEvent.click(await screen.findByRole("button", { name: "Open module scope" }));

    const focusedEmpty = await screen.findByTestId("admin-course-workspace-empty-state");
    expect(focusedEmpty).toHaveTextContent("No lessons in this module yet.");
    expect(focusedEmpty).not.toHaveAttribute("role");
    expect(focusedEmpty).not.toHaveAttribute("aria-live");
    expect(screen.getByTestId("admin-course-workspace-current-scope")).toHaveTextContent(
      "Empty module"
    );
  });

  it("renders workspace lesson create errors through polite admin state feedback", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === "/api/admin/content" && init?.method === "POST") {
        return errorJson({
          ok: false,
          error: "Could not create lesson.",
        });
      }

      if (url === "/api/admin/content") {
        return okJson(
          buildContentPayload({
            items: [
              buildContentItem({
                id: "module-empty",
                content_type: "course_module",
                slug: "course-module-empty",
                title: "Empty module",
                category: "Course",
                body: { moduleId: "empty-module" },
              }),
            ],
          })
        );
      }

      if (url === "/api/admin/categories/content") {
        return okJson(buildCategoriesPayload());
      }

      throw new Error(`Unexpected fetch: ${url} ${init?.method ?? "GET"}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AdminContentManager />);

    const moduleRow = await screen.findByTestId("admin-course-module-status-row");
    fireEvent.click(within(moduleRow).getByRole("button", { name: "Add lesson" }));

    const workspaceCreateForm = await screen.findByTestId("admin-workspace-lesson-create-form");
    fireEvent.change(within(workspaceCreateForm).getByLabelText("Title"), {
      target: { value: "Broken workspace lesson" },
    });
    fireEvent.click(within(workspaceCreateForm).getByRole("button", { name: "Create lesson" }));

    const createError = await screen.findByTestId("admin-workspace-lesson-create-error-state");
    expect(createError).toHaveAttribute("role", "status");
    expect(createError).toHaveAttribute("aria-live", "polite");
    expect(createError).toHaveTextContent("Could not create lesson.");
  });

  it("does not announce no-results content states", async () => {
    useAllContentView("page");
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url === "/api/admin/content") {
        return okJson(
          buildContentPayload({
            items: [buildContentItem({ id: "product-1", content_type: "product" })],
          })
        );
      }

      if (url === "/api/admin/categories/content") {
        return okJson(buildCategoriesPayload());
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AdminContentManager />);

    const noResults = await screen.findByTestId("admin-content-no-results-state");
    expect(noResults).toHaveTextContent("No content items match current search/filter.");
    expect(noResults).not.toHaveAttribute("role");
    expect(noResults).not.toHaveAttribute("aria-live");
  });

  it("renders create action errors through polite admin state feedback", async () => {
    useAllContentView();
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === "/api/admin/content" && init?.method === "POST") {
        return errorJson({
          ok: false,
          error: "Could not create content item.",
        });
      }

      if (url === "/api/admin/content") {
        return okJson(buildContentPayload());
      }

      if (url === "/api/admin/categories/content") {
        return okJson(buildCategoriesPayload());
      }

      throw new Error(`Unexpected fetch: ${url} ${init?.method ?? "GET"}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AdminContentManager />);

    await screen.findByTestId("admin-content-empty-state");

    const saveButton = screen.getByRole("button", { name: "Save content item" });
    const createForm = saveButton.closest("form");
    expect(createForm).not.toBeNull();

    fireEvent.change(within(createForm as HTMLFormElement).getByLabelText("Title"), {
      target: { value: "Broken content item" },
    });
    fireEvent.click(saveButton);

    const actionError = await screen.findByTestId("admin-content-action-error-state");
    expect(actionError).toHaveAttribute("role", "status");
    expect(actionError).toHaveAttribute("aria-live", "polite");
    expect(actionError).toHaveTextContent("Could not create content item.");

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([input, init]) => String(input) === "/api/admin/content" && init?.method === "POST"
        )
      ).toBe(true)
    );
  });

  it("renders edit dirty and save errors through polite admin state feedback", async () => {
    useAllContentView();
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === "/api/admin/content/content-1" && init?.method === "PATCH") {
        return errorJson({
          ok: false,
          error: "Could not save content changes.",
        });
      }

      if (url === "/api/admin/content") {
        return okJson(buildContentPayload({ items: [buildContentItem()] }));
      }

      if (url === "/api/admin/categories/content") {
        return okJson(buildCategoriesPayload());
      }

      throw new Error(`Unexpected fetch: ${url} ${init?.method ?? "GET"}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AdminContentManager />);

    await screen.findByText("Plans");
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const editForm = await screen.findByTestId("admin-content-edit-form");
    fireEvent.change(within(editForm).getByLabelText("Title"), {
      target: { value: "Plans updated" },
    });

    const dirtyState = await screen.findByTestId("admin-content-edit-dirty-state");
    expect(dirtyState).toHaveAttribute("role", "status");
    expect(dirtyState).toHaveAttribute("aria-live", "polite");
    expect(dirtyState).toHaveTextContent("You have unsaved changes.");

    fireEvent.click(within(editForm).getByRole("button", { name: "Save changes" }));

    const editError = await screen.findByTestId("admin-content-edit-error-state");
    expect(editError).toHaveAttribute("role", "status");
    expect(editError).toHaveAttribute("aria-live", "polite");
    expect(editError).toHaveTextContent("Could not save content changes.");
  });

  it("renders revision-history loading and empty states through the admin state primitive", async () => {
    useAllContentView();
    let resolveRevisions!: (value: Response) => void;
    const revisionsPromise = new Promise<Response>((resolve) => {
      resolveRevisions = resolve;
    });
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url === "/api/admin/content") {
        return okJson(buildContentPayload({ items: [buildContentItem()] }));
      }

      if (url === "/api/admin/categories/content") {
        return okJson(buildCategoriesPayload());
      }

      if (url === "/api/admin/content/content-1/revisions") {
        return revisionsPromise;
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AdminContentManager />);

    await screen.findByText("Plans");
    fireEvent.click(screen.getByRole("button", { name: "Revisions" }));

    const revisionPanel = await screen.findByTestId("admin-content-revision-history-panel");
    const revisionLoading = within(revisionPanel).getByRole("status");
    expect(revisionLoading).toHaveTextContent("Loading revisions…");
    expect(revisionLoading).toHaveAttribute("aria-live", "polite");

    resolveRevisions(okJson(buildRevisionsPayload()));

    await waitFor(() => {
      expect(within(revisionPanel).getByText("No revisions yet.")).toBeInTheDocument();
    });
    const emptyHistory = within(revisionPanel).getByText("No revisions yet.").closest("div");
    expect(emptyHistory).not.toHaveAttribute("role");
    expect(emptyHistory).not.toHaveAttribute("aria-live");
  });

  it("keeps revision-history error retry wired to the original revision loader", async () => {
    useAllContentView();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url === "/api/admin/content") {
        return okJson(buildContentPayload({ items: [buildContentItem()] }));
      }

      if (url === "/api/admin/categories/content") {
        return okJson(buildCategoriesPayload());
      }

      if (url === "/api/admin/content/content-1/revisions") {
        const revisionRequestCount = fetchMock.mock.calls.filter(
          ([callInput]) => String(callInput) === "/api/admin/content/content-1/revisions"
        ).length;

        if (revisionRequestCount === 1) {
          return errorJson({
            ok: false,
            error: "Could not load revision history.",
          });
        }

        return okJson(buildRevisionsPayload());
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AdminContentManager />);

    await screen.findByText("Plans");
    fireEvent.click(screen.getByRole("button", { name: "Revisions" }));

    const revisionPanel = await screen.findByTestId("admin-content-revision-history-panel");
    const revisionError = await within(revisionPanel).findByRole("alert");
    expect(revisionError).toHaveTextContent("Could not load revision history.");

    fireEvent.click(within(revisionPanel).getByRole("button", { name: "Retry" }));

    await within(revisionPanel).findByText("No revisions yet.");
    expect(
      fetchMock.mock.calls.filter(
        ([input]) => String(input) === "/api/admin/content/content-1/revisions"
      )
    ).toHaveLength(2);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/admin/content/content-1/revisions", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
  });

  it("preserves revision restore action behavior when history entries render", async () => {
    useAllContentView();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const restoredItem = buildContentItem({ title: "Plans restored" });
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === "/api/admin/content") {
        return okJson(buildContentPayload({ items: [buildContentItem()] }));
      }

      if (url === "/api/admin/categories/content") {
        return okJson(buildCategoriesPayload());
      }

      if (url === "/api/admin/content/content-1/revisions" && init?.method === "POST") {
        return okJson({
          ok: true,
          item: restoredItem,
          restoredRevisionId: "revision-1",
        });
      }

      if (url === "/api/admin/content/content-1/revisions") {
        return okJson(buildRevisionsPayload({ items: [buildRevision()] }));
      }

      throw new Error(`Unexpected fetch: ${url} ${init?.method ?? "GET"}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AdminContentManager />);

    await screen.findByText("Plans");
    fireEvent.click(screen.getByRole("button", { name: "Revisions" }));

    const revisionPanel = await screen.findByTestId("admin-content-revision-history-panel");
    const revisionItem = await within(revisionPanel).findByTestId("admin-content-revision-item");
    expect(revisionItem).toHaveTextContent("Rev 2 · update");

    const restoreButton = within(revisionItem).getByRole("button", { name: "Restore" });
    expect(restoreButton).not.toBeDisabled();

    fireEvent.click(restoreButton);

    await screen.findByTestId("admin-content-action-notice-state");
    expect(screen.getByTestId("admin-content-action-notice-state")).toHaveTextContent(
      "Revision restored."
    );
    expect(confirmSpy).toHaveBeenCalledWith(
      'Restore "Plans" to this revision? Current values will be replaced.'
    );
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input) === "/api/admin/content/content-1/revisions" &&
          init?.method === "POST" &&
          init.body === JSON.stringify({ revisionId: "revision-1" })
      )
    ).toBe(true);
  });
});
