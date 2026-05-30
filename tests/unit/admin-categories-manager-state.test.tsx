import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminCategoriesManager from "@/components/admin/AdminCategoriesManager";
import type { AdminCategoryRow } from "@/lib/admin/categories";

const category: AdminCategoryRow = {
  id: "category-technique",
  scope: "notes",
  title: "Technique",
  slug: "technique",
  sort_order: 0,
  is_active: true,
  created_by: "admin-user-id",
  updated_by: "admin-user-id",
  created_at: "2026-05-19T10:00:00.000Z",
  updated_at: "2026-05-19T10:00:00.000Z",
};

function categoriesResponse(
  items: AdminCategoryRow[] = [category],
  options: { schemaReady?: boolean; warning?: string | null } = {}
) {
  return {
    ok: true,
    json: async () => ({
      ok: true,
      items,
      schemaReady: options.schemaReady ?? true,
      warning: options.warning ?? null,
    }),
  };
}

function categoriesErrorResponse(error = "Could not load categories.") {
  return {
    ok: false,
    json: async () => ({
      ok: false,
      error,
    }),
  };
}

function createErrorResponse(error = "Could not create category.") {
  return {
    ok: false,
    json: async () => ({
      ok: false,
      error,
    }),
  };
}

describe("AdminCategoriesManager state rendering", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("uses AW-006 token cards and actions for category scopes and rows", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(categoriesResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminCategoriesManager />);

    await screen.findByText("Technique");

    expect(screen.getByTestId("admin-categories-manager-header")).toHaveClass(
      "fs-library-card",
      "fs-library-card-accent"
    );
    expect(screen.getByRole("button", { name: "Refresh" })).toHaveClass("fs-cta-secondary");

    const notesScope = screen.getByRole("button", { name: /Notes categories/i });
    expect(notesScope).toHaveClass("fs-library-card", "fs-library-card-accent");

    const contentScope = screen.getByRole("button", { name: /Content categories/i });
    expect(contentScope).toHaveClass("fs-library-card");
    expect(contentScope).not.toHaveClass("fs-library-card-accent");

    expect(screen.getByTestId("admin-category-item")).toHaveClass("fs-library-card");
    expect(screen.getByRole("button", { name: "Deactivate" })).toHaveClass(
      "rounded-[var(--fs-radius-control)]"
    );
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass(
      "rounded-[var(--fs-radius-control)]"
    );

    expect(screen.getByTestId("admin-categories-create-panel")).toHaveClass(
      "fs-library-card",
      "fs-library-card-muted"
    );
    expect(screen.getByRole("button", { name: "Save category" })).toHaveClass("fs-cta-primary");
  });

  it("shows a polite loading state before categories resolve", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(categoriesResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminCategoriesManager />);

    const loading = screen.getByRole("status");
    expect(loading).toHaveTextContent("Loading categories…");
    expect(loading).toHaveAttribute("aria-live", "polite");

    await screen.findByText("Technique");
  });

  it("keeps schema warnings polite and unchanged", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      categoriesResponse([category], {
        schemaReady: false,
        warning: "Category schema is not ready.",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminCategoriesManager />);

    const warningText = await screen.findByText("Category schema is not ready.");
    const warning = warningText.closest('[role="status"]');
    if (!warning) {
      throw new Error("Expected warning state wrapper to render.");
    }
    expect(warning).toHaveTextContent("Category schema is not ready.");
    expect(warning).toHaveAttribute("aria-live", "polite");
  });

  it("keeps load error retry wired to the original category loader", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(categoriesErrorResponse())
      .mockResolvedValueOnce(categoriesResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminCategoriesManager />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Could not load categories.");
    expect(screen.getByRole("button", { name: "Retry" })).toHaveClass("fs-cta-secondary");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await screen.findByText("Technique");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/admin/categories/notes", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
  });

  it("renders the unchanged empty category guidance without live-region noise", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(categoriesResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminCategoriesManager />);

    const emptyState = await screen.findByTestId("admin-categories-empty-state");
    expect(emptyState).toHaveTextContent("No categories created yet for this scope.");
    expect(emptyState).not.toHaveAttribute("role");
    expect(emptyState).not.toHaveAttribute("aria-live");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("announces create action errors politely without changing the payload", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(categoriesResponse())
      .mockResolvedValueOnce(createErrorResponse("Category title must be unique."));
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminCategoriesManager />);

    await screen.findByText("Technique");

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Technique" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save category" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Category title must be unique.");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(fetchMock).toHaveBeenLastCalledWith("/api/admin/categories/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        title: "Technique",
        slug: "",
        sortOrder: 0,
      }),
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save category" })).toBeEnabled();
    });
  });
});
