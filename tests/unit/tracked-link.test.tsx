import type React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import TrackedLink from "@/components/analytics/TrackedLink";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";

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

describe("TrackedLink", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("sends analytics event when link is clicked", () => {
    render(
      <TrackedLink
        href="/contact"
        eventName="support_clicked"
        payload={{ source: "plans_unavailable" }}
      >
        Contact support
      </TrackedLink>
    );

    fireEvent.click(screen.getByRole("link", { name: "Contact support" }));

    expect(sendClientAnalyticsEvent).toHaveBeenCalledWith("support_clicked", {
      source: "plans_unavailable",
    });
  });

  it("does not send analytics event when default click is prevented", () => {
    render(
      <TrackedLink
        href="/contact"
        eventName="support_clicked"
        onClick={(event) => event.preventDefault()}
      >
        Contact support
      </TrackedLink>
    );

    fireEvent.click(screen.getByRole("link", { name: "Contact support" }));

    expect(sendClientAnalyticsEvent).not.toHaveBeenCalled();
  });
});
