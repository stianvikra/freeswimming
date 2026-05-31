import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminContentManager from "@/components/admin/AdminContentManager";
import type { AdminContentItemRow } from "@/lib/admin/content";
import type { AdminContentMirrorSnapshot } from "@/lib/admin/content-mirror";
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
  role?: "admin" | "editor" | "viewer";
  mirror?: AdminContentMirrorSnapshot;
}) {
  return {
    ok: true,
    role: overrides?.role ?? "editor",
    items: overrides?.items ?? [],
    schemaReady: overrides?.schemaReady ?? true,
    warning: overrides?.warning ?? null,
    mirror: overrides?.mirror,
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

function buildMirrorSnapshot(
  overrides?: Partial<AdminContentMirrorSnapshot>
): AdminContentMirrorSnapshot {
  return {
    checkedAt: "2026-05-29T10:00:00.000Z",
    metrics: [
      {
        key: "course_module",
        label: "Course modules",
        platformCount: 2,
        adminCount: 1,
        delta: -1,
        status: "missing",
        coverage: {
          missingCount: 1,
          extraCount: 0,
          ignoredCount: 1,
          missingSamples: ["intro-course"],
          extraSamples: [],
          ignoredSamples: ["e2e-admin-content-module"],
        },
      },
      {
        key: "programs",
        label: "Programs/products",
        platformCount: 1,
        adminCount: 1,
        delta: 0,
        status: "matched",
        coverage: {
          missingCount: 0,
          extraCount: 0,
          ignoredCount: 0,
          missingSamples: [],
          extraSamples: [],
          ignoredSamples: [],
        },
      },
    ],
    summary: {
      matchedCount: 1,
      mismatchCount: 1,
      coverageMismatchCount: 1,
      ignoredRecordCount: 1,
      ignoredMetricCount: 1,
    },
    ...overrides,
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

    expect(await screen.findByTestId("admin-content-manager-header")).toHaveClass(
      "fs-library-card",
      "fs-library-card-accent"
    );
    expect(screen.getByTestId("admin-content-primary-view-tabs")).toHaveClass(
      "rounded-[var(--fs-radius-control)]"
    );
    expect(screen.getByRole("button", { name: "Course Workspace" })).toHaveClass(
      "text-[color:var(--fs-color-brand-700)]"
    );
    expect(screen.getByTestId("admin-course-lesson-workspace")).toHaveClass(
      "fs-library-card",
      "fs-library-card-muted"
    );
    expect(screen.getByTestId("admin-course-module-status-row")).toHaveClass("fs-library-card");
    const moduleRow = screen.getByTestId("admin-course-module-status-row");
    expect(within(moduleRow).getByRole("button", { name: "Open module scope" })).toHaveClass(
      "fs-cta-secondary"
    );
    expect(within(moduleRow).getByRole("button", { name: "Edit module" })).toHaveClass(
      "fs-cta-primary"
    );
    expect(within(moduleRow).getByRole("button", { name: "Add lesson" }).className).toContain(
      "border-emerald-200"
    );

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
    expect(workspaceCreateForm).toHaveClass("border-[color:var(--fs-border-brand)]");
    expect(
      within(workspaceCreateForm).getByRole("button", { name: "Create lesson" }).className
    ).toContain("border-emerald-200");
    expect(within(workspaceCreateForm).getByRole("button", { name: "Cancel" })).toHaveClass(
      "fs-cta-secondary"
    );
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

  it("renders audit, mirror, and focus utility states through admin state feedback", async () => {
    useAllContentView();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url === "/api/admin/content") {
        return okJson(
          buildContentPayload({
            items: [buildContentItem()],
            mirror: buildMirrorSnapshot(),
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

    const auditMode = await screen.findByTestId("admin-content-audit-mode-state");
    expect(auditMode).toHaveAttribute("role", "status");
    expect(auditMode).toHaveAttribute("aria-live", "polite");
    expect(auditMode).toHaveTextContent(
      "All content audit mode is enabled. This can be a long mixed list."
    );

    const mirrorState = await screen.findByTestId("admin-content-mirror-state");
    expect(mirrorState.tagName).toBe("ARTICLE");
    expect(mirrorState).toHaveAttribute("role", "status");
    expect(mirrorState).toHaveClass("bg-white", "text-slate-700");
    expect(
      within(mirrorState).getByRole("heading", { name: "Platform mirror snapshot" })
    ).toBeInTheDocument();
    expect(mirrorState).toHaveTextContent("Platform mirror snapshot");
    expect(mirrorState).toHaveTextContent("1 mismatch");
    expect(mirrorState).toHaveTextContent("1 identity drift");
    expect(within(mirrorState).getByTestId("admin-mirror-metric-course_module")).toHaveTextContent(
      "Course modules"
    );
    expect(within(mirrorState).getByTestId("admin-mirror-metric-course_module")).toHaveClass(
      "border-amber-300",
      "bg-amber-50/40"
    );
    expect(within(mirrorState).getByTestId("admin-mirror-metric-programs")).toHaveClass(
      "border-slate-200",
      "bg-white"
    );
    expect(mirrorState).toHaveTextContent("Sign in as admin to delete ignored QA/test records.");

    fireEvent.click(within(mirrorState).getByTestId("admin-mirror-metric-course_module"));

    const focusMode = await screen.findByTestId("admin-content-focus-mode");
    expect(focusMode).toHaveAttribute("role", "status");
    expect(focusMode).toHaveAttribute("aria-live", "polite");
    expect(focusMode).toHaveTextContent("Focus mode: Course modules");
    expect(focusMode).toHaveTextContent(
      "Mismatch detected. Use this filtered view to resolve missing/extra records."
    );

    fireEvent.click(within(focusMode).getByRole("button", { name: "Clear focus" }));

    await waitFor(() => {
      expect(screen.queryByTestId("admin-content-focus-mode")).not.toBeInTheDocument();
    });
  });

  it("keeps mirror QA cleanup action behavior while surfacing cleanup feedback", async () => {
    useAllContentView();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === "/api/admin/content/test-records" && init?.method === "POST") {
        return okJson({
          ok: true,
          deletedCount: 1,
          deletedIds: ["content-ignored"],
          deletedSlugs: ["e2e-admin-content-module"],
          normalizedCourseStructure: false,
          warning: "Course order normalization needs retry.",
        });
      }

      if (url === "/api/admin/content") {
        return okJson(
          buildContentPayload({
            role: "admin",
            items: [buildContentItem()],
            mirror: buildMirrorSnapshot(),
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

    fireEvent.click(await screen.findByTestId("admin-mirror-cleanup-test-records"));

    const actionNotice = await screen.findByTestId("admin-content-action-notice-state");
    expect(actionNotice).toHaveAttribute("role", "status");
    expect(actionNotice).toHaveTextContent(
      "Deleted 1 QA/test content record. Course order normalization needs retry."
    );
    expect(confirmSpy).toHaveBeenCalledWith(
      "Delete 1 ignored QA/test content record(s)? This only removes explicit e2e-admin-content-* rows."
    );
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input) === "/api/admin/content/test-records" && init?.method === "POST"
      )
    ).toBe(true);
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

  it("renders course-structure follow-up feedback through polite admin state feedback", async () => {
    useAllContentView();
    const moduleItem = buildContentItem({
      content_type: "course_module",
      category: "Course",
      slug: "module-1",
      title: "Module 1",
      body: { moduleId: "module-1" },
      sort_order: 0,
    });
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === "/api/admin/content/content-1" && init?.method === "PATCH") {
        return okJson({
          ok: true,
          item: buildContentItem({
            ...moduleItem,
            sort_order: 2,
          }),
        });
      }

      if (url === "/api/admin/content/course-structure" && init?.method === "POST") {
        return errorJson({
          ok: false,
          error: "Could not update course structure.",
        });
      }

      if (url === "/api/admin/content") {
        return okJson(buildContentPayload({ items: [moduleItem] }));
      }

      if (url === "/api/admin/categories/content") {
        return okJson(buildCategoriesPayload());
      }

      throw new Error(`Unexpected fetch: ${url} ${init?.method ?? "GET"}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<AdminContentManager />);

    await screen.findByTestId("admin-content-item");
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const editForm = await screen.findByTestId("admin-content-edit-form");
    fireEvent.change(within(editForm).getByLabelText("Sort order"), {
      target: { value: "2" },
    });
    fireEvent.click(within(editForm).getByRole("button", { name: "Save changes" }));

    const feedback = await screen.findByTestId("admin-content-course-structure-message-state");
    expect(feedback).toHaveAttribute("role", "status");
    expect(feedback).toHaveAttribute("aria-live", "polite");
    expect(feedback).toHaveTextContent(
      "Content item was saved, but order normalization failed. Retry normalization from course structure actions."
    );
    expect(
      fetchMock.mock.calls.some(
        ([input, init]) =>
          String(input) === "/api/admin/content/course-structure" &&
          init?.method === "POST" &&
          init.body === JSON.stringify({ action: "normalize" })
      )
    ).toBe(true);
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
