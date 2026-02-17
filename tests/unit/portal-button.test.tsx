import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PortalButton from "@/components/my-library/PortalButton";

describe("PortalButton", () => {
  afterEach(() => {
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
    fireEvent.click(screen.getByRole("button", { name: "Manage billing" }));

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

    expect(onNavigate).not.toHaveBeenCalled();
  });
});
