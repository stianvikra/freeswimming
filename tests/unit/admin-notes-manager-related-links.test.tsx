import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminNotesManager from "@/components/admin/AdminNotesManager";

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

describe("AdminNotesManager related note links", () => {
  beforeEach(() => {
    navigationState.pathname = "/admin";
    navigationState.searchParams = new URLSearchParams();

    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url =
          typeof input === "string" ? input : input instanceof URL ? input.pathname : input.url;

        if (url === "/api/admin/notes") {
          return Promise.resolve(
            jsonResponse({
              ok: true,
              items: [
                {
                  id: "11111111-1111-4111-8111-111111111111",
                  title: "Primary note",
                  body: "Primary body",
                  category: "Operations",
                  note_date: "2026-03-26",
                  priority: "normal",
                  is_done: false,
                  context_type: null,
                  context_ref: null,
                  created_by: "admin-user",
                  updated_by: "admin-user",
                  created_at: "2026-03-26T10:00:00.000Z",
                  updated_at: "2026-03-26T10:00:00.000Z",
                  attachments: [],
                  related_notes: [
                    {
                      id: "22222222-2222-4222-8222-222222222222",
                      title: "Secondary note",
                      category: "Operations",
                      note_date: "2026-03-26",
                      is_done: false,
                      priority: "high",
                    },
                  ],
                },
                {
                  id: "22222222-2222-4222-8222-222222222222",
                  title: "Secondary note",
                  body: "Secondary body",
                  category: "Operations",
                  note_date: "2026-03-26",
                  priority: "high",
                  is_done: false,
                  context_type: null,
                  context_ref: null,
                  created_by: "admin-user",
                  updated_by: "admin-user",
                  created_at: "2026-03-26T10:01:00.000Z",
                  updated_at: "2026-03-26T10:01:00.000Z",
                  attachments: [],
                  related_notes: [],
                },
              ],
            })
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

        throw new Error(`Unhandled fetch for ${url}`);
      })
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("lets admins jump to a linked note by clicking only the linked title", async () => {
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");

    render(<AdminNotesManager />);

    const primaryItems = await screen.findAllByTestId("admin-note-item");
    const primaryItem = primaryItems.find((item) => within(item).queryByText("Primary note"));

    expect(primaryItem).toBeDefined();
    if (!primaryItem) {
      throw new Error("Expected Primary note item to be rendered.");
    }

    const relatedTitleButton = within(primaryItem).getByRole("button", { name: "Secondary note" });

    expect(
      within(primaryItem).queryByRole("button", {
        name: "Note ID 22222222-2222-4222-8222-222222222222",
      })
    ).not.toBeInTheDocument();

    fireEvent.click(relatedTitleButton);

    await waitFor(() => {
      expect(screen.getByTestId("admin-notes-search")).toHaveValue(
        "22222222-2222-4222-8222-222222222222"
      );
    });

    await waitFor(() => {
      expect(screen.getAllByTestId("admin-note-item")).toHaveLength(1);
    });

    expect(screen.getByText("Secondary note")).toBeVisible();
    expect(screen.getByText("Note ID 22222222-2222-4222-8222-222222222222")).toBeVisible();
    expect(screen.queryByText("Primary note")).not.toBeInTheDocument();
    expect(replaceStateSpy).toHaveBeenCalledWith(
      window.history.state,
      "",
      expect.stringContaining("notesQuery=22222222-2222-4222-8222-222222222222")
    );
  });
});
