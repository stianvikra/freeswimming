import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import PoolsideGuideTracker from "@/components/guides/PoolsideGuideTracker";
import type { PoolsideDrill } from "@/lib/guides/guide-poolside";

vi.mock("next/image", () => ({
  default: () => null,
}));

const GUIDE_PROGRESS_STORAGE_KEY = "fs_guide_poolside_progress_v1";

const TEST_DRILLS: PoolsideDrill[] = [
  {
    id: "D01",
    title: "Drill 01",
    summary: "Summary 01",
    setup: "Setup 01",
    keyFocus: ["Hold line", "Stable kick"],
    visualAssetPath: "/guides/poolside/drill-01.svg",
    visualAlt: "Drill 01 visual",
  },
  {
    id: "D02",
    title: "Drill 02",
    summary: "Summary 02",
    setup: "Setup 02",
    keyFocus: ["Relaxed recovery"],
    visualAssetPath: "/guides/poolside/drill-02.svg",
    visualAlt: "Drill 02 visual",
  },
];

function setNavigatorOnline(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value,
  });
}

function getProgressApiCallCount(fetchMock: ReturnType<typeof vi.fn>): number {
  return fetchMock.mock.calls.filter((call) => String(call[0]) === "/api/progress/guide").length;
}

describe("PoolsideGuideTracker sync", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("hydrates completion from server progress rows", async () => {
    setNavigatorOnline(true);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        rows: [
          {
            guideSlug: "poolside",
            sectionId: "D01",
            completed: true,
            notes: "Remote completion",
            updatedAt: "2026-02-17T10:00:00.000Z",
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PoolsideGuideTracker guideSlug="poolside" drills={TEST_DRILLS} />);

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
      expect(screen.getByTestId("guide-poolside-sync-status")).toHaveAttribute(
        "data-sync-state",
        "synced"
      );
    });
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
    expect(screen.getByRole("button", { name: "Completed" })).toBeInTheDocument();
  });

  it("shows an offline status without calling the progress API", async () => {
    setNavigatorOnline(false);

    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ notes: [] }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    render(<PoolsideGuideTracker guideSlug="poolside" drills={TEST_DRILLS} />);

    await waitFor(() => {
      expect(screen.getByTestId("guide-poolside-sync-status")).toHaveAttribute(
        "data-sync-state",
        "offline"
      );
    });

    expect(getProgressApiCallCount(fetchMock)).toBe(0);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Offline mode: changes stay on this device and sync when connection returns."
    );
    expect(screen.getByRole("button", { name: "Retry sync" })).toBeInTheDocument();
  });

  it("retries the existing progress load path after a recoverable hydrate error", async () => {
    const user = userEvent.setup();
    setNavigatorOnline(true);

    const progressResponses = [
      {
        ok: false,
        status: 500,
      },
      {
        ok: true,
        json: async () => ({ rows: [] }),
      },
    ];
    const fetchMock = vi.fn(async (input) => {
      if (String(input) === "/api/progress/guide") {
        return progressResponses.shift();
      }

      return {
        ok: true,
        json: async () => ({ notes: [] }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<PoolsideGuideTracker guideSlug="poolside" drills={TEST_DRILLS} />);

    await waitFor(() => {
      expect(screen.getByTestId("guide-poolside-sync-status")).toHaveAttribute(
        "data-sync-state",
        "error"
      );
    });
    expect(screen.getByRole("status")).toHaveTextContent("Drill progress hydrate failed (500).");

    await user.click(screen.getByRole("button", { name: "Retry sync" }));

    await waitFor(() => {
      expect(getProgressApiCallCount(fetchMock)).toBe(2);
    });
    await waitFor(() => {
      expect(screen.getByTestId("guide-poolside-sync-status")).toHaveAttribute(
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
          guideSlug: "poolside",
          sectionId: "D01",
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
              guideSlug: "poolside",
              sectionId: "D02",
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

    render(<PoolsideGuideTracker guideSlug="poolside" drills={TEST_DRILLS} />);

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
          guideSlug: "poolside",
          sectionId: "D01",
          completed: true,
          notes: "Local completion",
        }),
        expect.objectContaining({
          guideSlug: "poolside",
          sectionId: "D02",
          completed: true,
          notes: "Remote completion",
        }),
      ])
    );
  });
});
