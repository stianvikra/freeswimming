import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AthleteProfileHub from "@/components/my-library/profile/AthleteProfileHub";
import type { AthleteProfileSnapshot } from "@/lib/athlete-profile/server";

vi.mock("@/lib/analytics/client", () => ({
  sendClientAnalyticsEvent: vi.fn(),
}));

function buildSnapshot(profile?: AthleteProfileSnapshot["profile"]): AthleteProfileSnapshot {
  return {
    schemaReady: true,
    loadError: null,
    profile: profile ?? null,
  };
}

describe("AthleteProfileHub", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("restores unsaved local draft state", () => {
    localStorage.setItem(
      "my-library-athlete-profile-draft:user-1",
      JSON.stringify({
        displayName: "Pool draft",
        firstName: "",
        lastName: "",
        ageBand: "",
      })
    );

    render(<AthleteProfileHub initialSnapshot={buildSnapshot()} userId="user-1" />);

    expect(screen.getByTestId("athlete-profile-display-name")).toHaveValue("Pool draft");
    expect(
      screen.getByText("Unsaved athlete-profile edits were restored on this device.")
    ).toBeInTheDocument();
  });

  it("saves profile updates and refreshes current snapshot", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: true,
            snapshot: buildSnapshot({
              id: "profile-1",
              displayName: "Poolside Stian",
              firstName: "Stian",
              lastName: "Vikra",
              primaryName: "Poolside Stian",
              ageBand: "35_44",
              ageBandLabel: "35 to 44",
              createdAt: "2026-03-19T18:00:00.000Z",
              updatedAt: "2026-03-19T18:05:00.000Z",
            }),
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      )
    );

    render(<AthleteProfileHub initialSnapshot={buildSnapshot()} userId="user-1" />);

    fireEvent.change(screen.getByTestId("athlete-profile-display-name"), {
      target: { value: "Poolside Stian" },
    });
    fireEvent.click(screen.getByTestId("athlete-profile-save"));

    await waitFor(() => {
      expect(screen.getByText("Athlete profile saved.")).toBeInTheDocument();
    });

    expect(screen.getAllByText("Poolside Stian").length).toBeGreaterThan(0);
    expect(localStorage.getItem("my-library-athlete-profile-draft:user-1")).toBeNull();
  });
});
