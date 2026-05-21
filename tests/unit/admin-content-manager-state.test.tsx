import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

function useAllContentView(scope: "all" | AdminContentItemRow["content_type"] = "all") {
  window.localStorage.setItem(CONTENT_PRIMARY_VIEW_STORAGE_KEY, "all_content");
  window.localStorage.setItem(ALL_CONTENT_SCOPE_STORAGE_KEY, scope);
}

describe("AdminContentManager state rendering", () => {
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
});
