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
});
