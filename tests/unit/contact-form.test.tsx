import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContactForm from "@/components/ContactForm";

describe("ContactForm", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", ((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }) as typeof requestAnimationFrame);
    vi.stubGlobal("scrollTo", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("does not autofocus the name field on initial load", () => {
    render(<ContactForm variant="contact" />);

    expect(screen.getByLabelText("NAME")).not.toHaveFocus();
  });

  it("focuses the first invalid field after submit validation fails", async () => {
    const user = userEvent.setup();

    render(<ContactForm variant="contact" />);

    const nameInput = screen.getByLabelText("NAME");
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(screen.getByText("Please enter your name.")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(nameInput).toHaveFocus();
    });
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(nameInput).toHaveAttribute("aria-describedby", "contact-form-error");
  });

  it("allows preview notify submissions without a message", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ContactForm variant="preview_access_notify" />);

    expect(screen.getByRole("heading", { name: "Preview Updates" })).toBeInTheDocument();
    expect(screen.getByLabelText("OPTIONAL NOTE")).toBeInTheDocument();
    expect(screen.queryByText("What to include")).not.toBeInTheDocument();
    expect(screen.queryByText("Optional note ideas")).not.toBeInTheDocument();
    expect(screen.queryByText("No password is sent from this form.")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("NAME"), "Test User");
    await user.type(screen.getByLabelText("EMAIL"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "Join notify list" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(requestInit.method).toBe("POST");
    expect(requestInit.body).toContain('"variant":"preview_access_notify"');
    expect(requestInit.body).toContain('"message":""');

    await waitFor(() => {
      expect(screen.getByText("You’re on the list")).toBeInTheDocument();
    });
  });
});
