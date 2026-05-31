import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import Guide0To1000Tracker from "@/components/guides/Guide0To1000Tracker";
import type { Guide0To1000Session } from "@/lib/guides/guide-0-1000m";

vi.mock("@/components/admin/AdminContextNotesPanel", () => ({
  default: () => <div data-testid="admin-context-notes-panel" />,
}));

const GUIDE_PROGRESS_STORAGE_KEY = "fs_guide_0_1000m_progress_v1";

const TEST_SESSIONS: Guide0To1000Session[] = [
  {
    id: "S01",
    weekNumber: 1,
    title: "Session 01",
    focus: "Breathing rhythm",
    targetSet: "8 x 50m easy/moderate",
  },
  {
    id: "S02",
    weekNumber: 1,
    title: "Session 02",
    focus: "Steady pacing",
    targetSet: "6 x 100m controlled",
  },
];

function setNavigatorOnline(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value,
  });
}

describe("Guide0To1000Tracker sync", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("hydrates completion from server progress rows", async () => {
    const user = userEvent.setup();
    setNavigatorOnline(true);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        rows: [
          {
            guideSlug: "0-1000m",
            sectionId: "S01",
            completed: true,
            notes: "Remote completion",
            updatedAt: "2026-02-17T10:00:00.000Z",
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<Guide0To1000Tracker guideSlug="0-1000m" sessions={TEST_SESSIONS} />);

    const shell = screen.getByTestId("guide-0-1000m-action-shell");
    expect(shell).toHaveClass("fs-library-card", "fs-library-card-accent");
    expect(screen.getByRole("button", { name: "Open next session full screen" })).toHaveClass(
      "fs-cta-secondary"
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/progress/guide", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("1/2")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId("guide-0-1000m-sync-status")).toHaveAttribute(
        "data-sync-state",
        "synced"
      );
    });
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
    expect(screen.getByText("Completed sessions (1)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open next session full screen" }));

    const dialog = screen.getByRole("dialog", { name: "Session full screen" });
    expect(dialog).toHaveClass("bg-slate-900/72");
    const previousButton = within(dialog).getByRole("button", { name: "Previous" });
    expect(previousButton.parentElement).toHaveClass("grid-cols-2", "sm:flex");
    expect(previousButton).toHaveClass("fs-cta-secondary");
    expect(within(dialog).getByRole("button", { name: "Next" })).toHaveClass("fs-cta-secondary");
    const completeButton = within(dialog).getByRole("button", { name: "Mark complete" });
    expect(completeButton).toHaveClass("fs-cta-primary", "w-full", "sm:w-auto");

    await user.click(completeButton);

    expect(within(dialog).getByRole("button", { name: "Completed" })).toHaveClass(
      "bg-emerald-100",
      "transition-none",
      "text-emerald-950"
    );
    expect(screen.getByText("Session marked complete.").parentElement).toHaveClass(
      "fs-library-card",
      "bg-emerald-50/95"
    );
    expect(screen.getByText("Session marked complete.").parentElement?.parentElement).toHaveClass(
      "bottom-40",
      "sm:bottom-24"
    );
    expect(screen.getByRole("button", { name: "Undo" })).toHaveClass(
      "fs-cta-secondary",
      "border-emerald-300"
    );
  });

  it("shows an offline status without calling the progress API", async () => {
    setNavigatorOnline(false);

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<Guide0To1000Tracker guideSlug="0-1000m" sessions={TEST_SESSIONS} />);

    await waitFor(() => {
      expect(screen.getByTestId("guide-0-1000m-sync-status")).toHaveAttribute(
        "data-sync-state",
        "offline"
      );
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Offline mode: changes stay on this device and sync when connection returns."
    );
    expect(screen.getByRole("button", { name: "Retry sync" })).toBeInTheDocument();
  });

  it("retries the existing progress load path after a recoverable hydrate error", async () => {
    const user = userEvent.setup();
    setNavigatorOnline(true);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ rows: [] }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<Guide0To1000Tracker guideSlug="0-1000m" sessions={TEST_SESSIONS} />);

    await waitFor(() => {
      expect(screen.getByTestId("guide-0-1000m-sync-status")).toHaveAttribute(
        "data-sync-state",
        "error"
      );
    });
    expect(screen.getByRole("status")).toHaveTextContent("Guide progress hydrate failed (500).");

    await user.click(screen.getByRole("button", { name: "Retry sync" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(screen.getByTestId("guide-0-1000m-sync-status")).toHaveAttribute(
        "data-sync-state",
        "synced"
      );
    });
  });

  it("merges local and remote rows, then upserts merged progress", async () => {
    setNavigatorOnline(true);

    localStorage.setItem(
      GUIDE_PROGRESS_STORAGE_KEY,
      JSON.stringify([
        {
          guideSlug: "0-1000m",
          sectionId: "S01",
          completed: true,
          notes: "Local completion",
          updatedAt: "2026-02-17T09:00:00.000Z",
        },
      ])
    );

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          rows: [
            {
              guideSlug: "0-1000m",
              sectionId: "S02",
              completed: true,
              notes: "Remote completion",
              updatedAt: "2026-02-17T10:00:00.000Z",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, upserted: 2 }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<Guide0To1000Tracker guideSlug="0-1000m" sessions={TEST_SESSIONS} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    const postCall = fetchMock.mock.calls.find((call) => {
      const init = call[1] as RequestInit | undefined;
      return init?.method === "POST";
    });
    expect(postCall).toBeDefined();

    const init = postCall?.[1] as RequestInit;
    const body = JSON.parse(String(init.body)) as {
      rows: Array<{
        guideSlug: string;
        sectionId: string;
        completed: boolean;
        notes: string;
      }>;
    };

    expect(body.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          guideSlug: "0-1000m",
          sectionId: "S01",
          completed: true,
          notes: "Local completion",
        }),
        expect.objectContaining({
          guideSlug: "0-1000m",
          sectionId: "S02",
          completed: true,
          notes: "Remote completion",
        }),
      ])
    );
  });
});
