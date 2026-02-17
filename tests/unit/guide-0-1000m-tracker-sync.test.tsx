import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Guide0To1000Tracker from "@/components/guides/Guide0To1000Tracker";
import type { Guide0To1000Session } from "@/lib/guides/guide-0-1000m";

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

    expect(screen.getByText("Completed sessions (1)")).toBeInTheDocument();
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
