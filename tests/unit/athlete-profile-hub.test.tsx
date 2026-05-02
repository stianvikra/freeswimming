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
    personalRecordsSchemaReady: true,
    swimCapabilityLimitsSchemaReady: true,
    loadError: null,
    metricsLoadError: null,
    preferencesLoadError: null,
    personalRecordsLoadError: null,
    swimCapabilityLimitsLoadError: null,
    profile: profile ?? null,
    cssMetric: null,
    preferences: null,
    personalRecords: [],
    swimCapabilityLimits: [],
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
    localStorage.setItem(
      "my-library-athlete-profile-records-draft:user-1",
      JSON.stringify({
        editingRecordId: null,
        distanceM: "200",
        stroke: "freestyle",
        course: "pool_25m",
        time: "2:24.18",
        recordedOn: "",
        sourceNote: "",
      })
    );

    render(<AthleteProfileHub initialSnapshot={buildSnapshot()} userId="user-1" />);

    expect(screen.getByTestId("athlete-profile-display-name")).toHaveValue("Pool draft");
    expect(screen.getByTestId("athlete-record-distance-m")).toHaveValue(200);
    expect(screen.getByTestId("athlete-record-time")).toHaveValue("2:24.18");
    expect(
      screen.getByText("Unsaved swimmer-profile edits were restored on this device.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Unsaved personal-record edits were restored on this device.")
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
      expect(screen.getByText("Swimmer profile saved.")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId("athlete-profile-section-profile")).toHaveAttribute(
        "data-section-open",
        "false"
      );
    });

    expect(screen.getAllByText("Poolside Stian").length).toBeGreaterThan(0);
    expect(localStorage.getItem("my-library-athlete-profile-profile-draft:user-1")).toBeNull();

    fireEvent.click(screen.getByTestId("athlete-profile-section-toggle-profile"));
    expect(screen.getByTestId("athlete-profile-display-name")).toHaveValue("Poolside Stian");
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

  it("saves and deletes personal records", async () => {
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true)
    );
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              ok: true,
              recordId: "record-1",
              snapshot: {
                ...buildSnapshot(),
                personalRecords: [
                  {
                    id: "record-1",
                    distanceM: 100,
                    stroke: "freestyle",
                    strokeLabel: "Freestyle",
                    course: "pool_25m",
                    courseLabel: "25m pool",
                    eventLabel: "100m Freestyle · 25m pool",
                    timeCentiseconds: 6234,
                    timeLabel: "1:02.34",
                    recordedOn: "2026-03-19",
                    sourceNote: "Club night",
                    createdAt: "2026-03-19T18:00:00.000Z",
                    updatedAt: "2026-03-19T18:05:00.000Z",
                  },
                ],
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              ok: true,
              snapshot: buildSnapshot(),
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        )
    );

    render(<AthleteProfileHub initialSnapshot={buildSnapshot()} userId="user-1" />);

    fireEvent.change(screen.getByTestId("athlete-record-distance-m"), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByTestId("athlete-record-stroke"), {
      target: { value: "freestyle" },
    });
    fireEvent.change(screen.getByTestId("athlete-record-course"), {
      target: { value: "pool_25m" },
    });
    fireEvent.change(screen.getByTestId("athlete-record-time"), {
      target: { value: "1:02.34" },
    });
    fireEvent.click(screen.getByTestId("athlete-record-save"));

    await waitFor(() => {
      expect(screen.getByText("Personal record saved.")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId("athlete-profile-section-records")).toHaveAttribute(
        "data-section-open",
        "false"
      );
    });

    expect(screen.getAllByText("100m Freestyle · 25m pool").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByTestId("athlete-profile-section-toggle-records"));
    fireEvent.click(screen.getByTestId("athlete-record-delete-record-1"));

    await waitFor(() => {
      expect(screen.getByText("Personal record deleted.")).toBeInTheDocument();
    });

    expect(screen.queryByText("100m Freestyle · 25m pool")).not.toBeInTheDocument();
  });

  it("keeps the profile section open when save fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: false,
            error: "Could not save swimmer profile right now.",
          }),
          {
            status: 500,
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
      expect(screen.getByText("Could not save swimmer profile right now.")).toBeInTheDocument();
    });

    expect(screen.getByTestId("athlete-profile-section-profile")).toHaveAttribute(
      "data-section-open",
      "true"
    );
    expect(screen.getByTestId("athlete-profile-display-name")).toHaveValue("Poolside Stian");
  });

  it("persists disclosure state locally without storing sensitive values", async () => {
    const savedSnapshot = buildSnapshot({
      id: "profile-1",
      displayName: "Poolside Stian",
      firstName: "Stian",
      lastName: "Vikra",
      primaryName: "Poolside Stian",
      ageBand: "35_44",
      ageBandLabel: "35 to 44",
      createdAt: "2026-03-19T18:00:00.000Z",
      updatedAt: "2026-03-19T18:05:00.000Z",
    });

    render(<AthleteProfileHub initialSnapshot={savedSnapshot} userId="user-1" />);

    expect(screen.getByTestId("athlete-profile-section-profile")).toHaveAttribute(
      "data-section-open",
      "false"
    );

    fireEvent.click(screen.getByTestId("athlete-profile-section-toggle-profile"));

    await waitFor(() => {
      expect(screen.getByTestId("athlete-profile-section-profile")).toHaveAttribute(
        "data-section-open",
        "true"
      );
    });

    const storedDisclosure = localStorage.getItem("my-library-athlete-profile-disclosure:user-1");
    expect(storedDisclosure).toContain('"profile":true');
    expect(storedDisclosure).not.toContain("Poolside Stian");

    cleanup();

    render(<AthleteProfileHub initialSnapshot={savedSnapshot} userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("athlete-profile-section-profile")).toHaveAttribute(
        "data-section-open",
        "true"
      );
    });
  });
});
