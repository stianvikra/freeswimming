import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AuthRequestStatus from "@/components/auth/AuthRequestStatus";

describe("AuthRequestStatus", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("stays silent when there is no sent, cooldown, or error state", () => {
    render(<AuthRequestStatus sent={false} error="" cooldownUntilMs={null} />);

    expect(screen.queryByTestId("auth-request-status")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("announces sent-state guidance politely", () => {
    render(<AuthRequestStatus sent error="" cooldownUntilMs={null} />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Sign-in email sent. Open the secure link first.");
    expect(status).toHaveTextContent("enter the one-time code below instead");
  });

  it("announces active cooldown guidance from the shared countdown helper", () => {
    const initialNowMs = new Date("2026-05-19T10:00:00.000Z").getTime();
    vi.useFakeTimers();
    vi.setSystemTime(initialNowMs);

    render(
      <AuthRequestStatus
        sent
        error="Please wait before retrying."
        cooldownUntilMs={initialNowMs + 90_000}
        initialNowMs={initialNowMs}
      />
    );

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent(
      "Please wait 90 seconds before requesting a new sign-in email."
    );
  });

  it("returns to sent guidance when a cooldown-backed sent state has expired", () => {
    const initialNowMs = new Date("2026-05-19T10:00:00.000Z").getTime();
    vi.useFakeTimers();
    vi.setSystemTime(initialNowMs);

    render(
      <AuthRequestStatus
        sent
        error="Please wait before retrying."
        cooldownUntilMs={initialNowMs - 1_000}
        initialNowMs={initialNowMs}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Sign-in email sent. Open the secure link first."
    );
  });

  it("announces non-cooldown errors through the same request feedback region", () => {
    render(<AuthRequestStatus sent={false} error="Enter a valid email address." />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Enter a valid email address.");
  });
});
