import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AthleteProfileHub from "@/components/my-library/profile/AthleteProfileHub";
import type { AthleteProfileSnapshot } from "@/lib/athlete-profile/server";

vi.mock("@/lib/analytics/client", () => ({
  sendClientAnalyticsEvent: vi.fn(),
}));

function buildSnapshot(profile?: AthleteProfileSnapshot["profile"]): AthleteProfileSnapshot {
  return {
    profileSchemaReady: true,
    metricsSchemaReady: true,
    preferencesSchemaReady: true,
    loadError: null,
    metricsLoadError: null,
    preferencesLoadError: null,
    profile: profile ?? null,
    cssMetric: null,
    preferences: null,
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
      "my-library-athlete-profile-profile-draft:user-1",
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

  it("saves CSS and preferences updates", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              ok: true,
              snapshot: {
                ...buildSnapshot(),
                cssMetric: {
                  id: "metric-1",
                  metricKey: "css",
                  unit: "seconds_per_100m",
                  valueSeconds: 118,
                  paceLabel: "1:58",
                  recordedOn: "2026-03-19",
                  sourceNote: "400 + 200 test",
                  createdAt: "2026-03-19T18:00:00.000Z",
                  updatedAt: "2026-03-19T18:05:00.000Z",
                },
                preferences: {
                  id: "pref-1",
                  poolLengthM: 25,
                  poolLengthLabel: "25m pool",
                  availableDays: ["monday", "wednesday"],
                  availableDayLabels: ["Mon", "Wed"],
                  preferredWeeklySessionCount: 5,
                  preferredSessionMinutes: 60,
                  preferredSessionMinutesLabel: "60 min",
                  createdAt: "2026-03-19T18:00:00.000Z",
                  updatedAt: "2026-03-19T18:05:00.000Z",
                },
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              ok: true,
              snapshot: {
                ...buildSnapshot(),
                cssMetric: {
                  id: "metric-1",
                  metricKey: "css",
                  unit: "seconds_per_100m",
                  valueSeconds: 118,
                  paceLabel: "1:58",
                  recordedOn: "2026-03-19",
                  sourceNote: "400 + 200 test",
                  createdAt: "2026-03-19T18:00:00.000Z",
                  updatedAt: "2026-03-19T18:05:00.000Z",
                },
                preferences: {
                  id: "pref-1",
                  poolLengthM: 25,
                  poolLengthLabel: "25m pool",
                  availableDays: ["monday", "wednesday"],
                  availableDayLabels: ["Mon", "Wed"],
                  preferredWeeklySessionCount: 5,
                  preferredSessionMinutes: 60,
                  preferredSessionMinutesLabel: "60 min",
                  createdAt: "2026-03-19T18:00:00.000Z",
                  updatedAt: "2026-03-19T18:05:00.000Z",
                },
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        )
    );

    render(<AthleteProfileHub initialSnapshot={buildSnapshot()} userId="user-1" />);

    fireEvent.change(screen.getByTestId("athlete-profile-css-pace"), {
      target: { value: "1:58" },
    });
    fireEvent.change(screen.getByTestId("athlete-profile-css-recorded-on"), {
      target: { value: "2026-03-19" },
    });
    fireEvent.click(screen.getByTestId("athlete-profile-css-save"));

    await waitFor(() => {
      expect(screen.getByText("CSS saved.")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("athlete-preferences-pool-length"), {
      target: { value: "25" },
    });
    fireEvent.change(screen.getByTestId("athlete-preferences-weekly-session-count"), {
      target: { value: "5" },
    });
    fireEvent.click(screen.getByTestId("athlete-preferences-day-monday"));
    fireEvent.click(screen.getByTestId("athlete-preferences-day-wednesday"));
    fireEvent.change(screen.getByTestId("athlete-preferences-session-minutes"), {
      target: { value: "60" },
    });
    fireEvent.click(screen.getByTestId("athlete-preferences-save"));

    await waitFor(() => {
      expect(screen.getByText("Training preferences saved.")).toBeInTheDocument();
    });

    expect(screen.getByText("1:58/100m")).toBeInTheDocument();
    expect(screen.getAllByText("25m pool").length).toBeGreaterThan(0);
  });
});
