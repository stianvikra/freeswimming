import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PortalButton from "@/components/my-library/PortalButton";

describe("PortalButton", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("calls /api/portal and redirects on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, url: "https://billing.stripe.com/session/test" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const onNavigate = vi.fn();

    render(<PortalButton returnPath="/my-library" onNavigate={onNavigate} />);
    const button = screen.getByRole("button", { name: "Manage billing" });
    expect(button).toHaveClass("fs-cta-secondary");
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnPath: "/my-library" }),
      });
    });

    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledWith("https://billing.stripe.com/session/test");
    });
  });

  it("shows API error in UI when portal cannot be opened", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, error: "No Stripe billing account found for this user." }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const onNavigate = vi.fn();

    render(<PortalButton returnPath="/my-library" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole("button", { name: "Manage billing" }));

    await waitFor(() => {
      expect(
        screen.getByText("No Stripe billing account found for this user.")
      ).toBeInTheDocument();
    });

    const feedback = screen.getByTestId("portal-feedback");
    expect(feedback).toHaveAttribute("role", "status");
    expect(feedback).toHaveAttribute("aria-live", "polite");
    expect(feedback).toHaveAttribute("data-feedback-tone", "error");
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("announces pending billing portal handoff without changing the button label", async () => {
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}));
    vi.stubGlobal("fetch", fetchMock);

    const onNavigate = vi.fn();

    render(<PortalButton returnPath="/my-library" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole("button", { name: "Manage billing" }));

    const feedback = await screen.findByTestId("portal-feedback");
    const button = screen.getByRole("button", { name: "Opening billing..." });

    expect(feedback).toHaveAttribute("role", "status");
    expect(feedback).toHaveAttribute("aria-live", "polite");
    expect(feedback).toHaveAttribute("data-feedback-tone", "pending");
    expect(feedback).toHaveTextContent("Opening billing portal...");
    expect(button).toHaveAttribute("aria-describedby", feedback.id);
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
