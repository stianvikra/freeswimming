import type React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CourseModule } from "@/app/course/courseData";
import MyLibraryNewContentNotice from "@/components/my-library/MyLibraryNewContentNotice";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import {
  buildMyLibraryCourseSignal,
  buildMyLibrarySeenState,
  buildMyLibrarySeenStorageKey,
} from "@/lib/my-library/new-content-notice";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/analytics/client", () => ({
  sendClientAnalyticsEvent: vi.fn(),
}));

function buildModules(lessonIds: string[]): CourseModule[] {
  return [
    {
      id: "mod1",
      title: "Intro",
      lessons: lessonIds.map((lessonId, index) => ({
        id: lessonId,
        title: `Lesson ${index + 1}`,
        youtubeId: "abc123",
        goal: "Goal",
        cues: ["Cue"],
        drill: {
          title: "Drill",
          steps: ["Step"],
        },
        nextStep: "Next",
      })),
    },
  ];
}

function mockSignalResponse(lessonIds: string[]) {
  const signal = buildMyLibraryCourseSignal(buildModules(lessonIds));
  return {
    signal,
    response: {
      ok: true,
      json: async () => ({
        ok: true,
        signal,
      }),
    },
  };
}

describe("MyLibraryNewContentNotice", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows notice on first load and persists seen state on dismiss", async () => {
    const { signal, response } = mockSignalResponse(["mod1-l1", "mod1-l2"]);
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    render(<MyLibraryNewContentNotice userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("my-library-new-content-notice")).toBeInTheDocument();
    });
    expect(screen.getByText("+2 nye leksjoner i Free Course")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("my-library-new-content-dismiss"));

    await waitFor(() => {
      expect(screen.queryByTestId("my-library-new-content-notice")).toBeNull();
    });

    const storedRaw = localStorage.getItem(buildMyLibrarySeenStorageKey("user-1"));
    expect(storedRaw).toBeTruthy();
    expect(storedRaw).toContain(signal.signature);

    expect(sendClientAnalyticsEvent).toHaveBeenCalledWith("library_new_content_notice_shown", {
      lessonCount: 2,
      signature: signal.signature,
    });
    expect(sendClientAnalyticsEvent).toHaveBeenCalledWith("library_new_content_notice_seen", {
      lessonCount: 2,
      signature: signal.signature,
    });
  });

  it("stays hidden when seen signature is unchanged", async () => {
    const { signal, response } = mockSignalResponse(["mod1-l1"]);
    localStorage.setItem(
      buildMyLibrarySeenStorageKey("user-1"),
      JSON.stringify(buildMyLibrarySeenState(signal))
    );
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    render(<MyLibraryNewContentNotice userId="user-1" />);

    await waitFor(() => {
      expect(screen.queryByTestId("my-library-new-content-notice")).toBeNull();
      expect(screen.queryByTestId("my-library-new-content-notice-loading")).toBeNull();
    });
  });

  it("shows only added lesson delta when signal changes", async () => {
    const previousSignal = buildMyLibraryCourseSignal(buildModules(["mod1-l1"]));
    localStorage.setItem(
      buildMyLibrarySeenStorageKey("user-1"),
      JSON.stringify(buildMyLibrarySeenState(previousSignal))
    );

    const { signal, response } = mockSignalResponse(["mod1-l1", "mod1-l2", "mod1-l3"]);
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    render(<MyLibraryNewContentNotice userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("my-library-new-content-notice")).toBeInTheDocument();
    });
    expect(screen.getByText("+2 nye leksjoner i Free Course")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("my-library-new-content-open"));
    expect(sendClientAnalyticsEvent).toHaveBeenCalledWith("library_new_content_notice_opened", {
      lessonCount: signal.lessonCount,
      signature: signal.signature,
    });
  });

  it("shows fallback error state and retries successfully", async () => {
    const errorResponse = {
      ok: false,
      json: async () => ({
        ok: false,
        error: "Could not load signal.",
      }),
    };
    const success = mockSignalResponse(["mod1-l1"]);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(success.response);
    vi.stubGlobal("fetch", fetchMock);

    render(<MyLibraryNewContentNotice userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("my-library-new-content-notice-error")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.getByTestId("my-library-new-content-notice")).toBeInTheDocument();
    });
  });
});
