import type React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContinueCourseCard from "@/components/my-library/ContinueCourseCard";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import { COURSE_LAST_LESSON_STORAGE_KEY } from "@/lib/course/resume";

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

describe("ContinueCourseCard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows start state when no saved lesson exists", () => {
    render(<ContinueCourseCard />);

    expect(screen.getByRole("heading", { name: "Free Course" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Continue Free Course" })).not.toBeInTheDocument();

    const link = screen.getByRole("link", { name: "Start" });
    expect(link).toHaveAttribute("href", "/course");

    fireEvent.click(link);

    expect(sendClientAnalyticsEvent).toHaveBeenCalledWith("resume_clicked", {
      hasSavedProgress: false,
      destination: "/course",
    });
  });

  it("hydrates saved lesson state from localStorage after mount", async () => {
    localStorage.setItem(COURSE_LAST_LESSON_STORAGE_KEY, "mod1-l2");

    render(<ContinueCourseCard />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Continue" })).toBeInTheDocument();
    });

    const link = screen.getByRole("link", { name: "Continue" });
    expect(link).toHaveAttribute("href", "/course?lesson=mod1-l2");

    fireEvent.click(link);

    expect(sendClientAnalyticsEvent).toHaveBeenCalledWith("resume_clicked", {
      hasSavedProgress: true,
      destination: "/course?lesson=mod1-l2",
    });
  });
});
