import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CourseProgressSyncStatus, {
  normalizeCourseProgressSyncStatusState,
} from "@/components/course/CourseProgressSyncStatus";

describe("CourseProgressSyncStatus", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows saved sync status without a retry action", () => {
    render(
      <CourseProgressSyncStatus
        state="synced"
        label="Synced to your account just now."
        onRetry={vi.fn()}
      />
    );

    const status = screen.getByTestId("course-progress-sync-status");
    expect(status).toHaveAttribute("data-sync-state", "synced");
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
    expect(screen.getByRole("status")).toHaveTextContent("Synced to your account just now.");
    expect(
      screen.queryByRole("button", { name: "Retry course progress sync" })
    ).not.toBeInTheDocument();
  });

  it("keeps retry keyboard reachable for recoverable sync errors", () => {
    const onRetry = vi.fn();
    render(
      <CourseProgressSyncStatus
        state="error"
        label="Sync paused right now. We'll retry automatically."
        onRetry={onRetry}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent("Needs retry");
    const retry = screen.getByRole("button", { name: "Retry course progress sync" });
    fireEvent.click(retry);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("falls back to neutral account sync copy for unknown future states", () => {
    render(
      <CourseProgressSyncStatus
        state="queued"
        label="Signed in. Progress sync is active."
        onRetry={vi.fn()}
      />
    );

    expect(normalizeCourseProgressSyncStatusState("queued")).toBe("idle");
    expect(screen.getByTestId("course-progress-sync-status")).toHaveAttribute(
      "data-sync-state",
      "idle"
    );
    expect(screen.getByRole("status")).toHaveTextContent("Account sync");
    expect(
      screen.queryByRole("button", { name: "Retry course progress sync" })
    ).not.toBeInTheDocument();
  });
});
