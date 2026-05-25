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

    expect(screen.getByAltText("Learn. Drill. Swim.")).toBeInTheDocument();
    expect(screen.getByText("Reply by email")).toBeInTheDocument();
    expect(screen.getByText("Usually 24–48 hours")).toBeInTheDocument();
    expect(screen.getByText("No payment details, passwords, or sign-in codes")).toBeInTheDocument();
    expect(
      screen.getByText(
        "A short message is enough: your current level, what you are trying to do, and what would help next."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send message" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Send a message" })).not.toBeInTheDocument();
    expect(
      screen.queryByText("Send us a short message and we’ll reply by email.")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Example")).not.toBeInTheDocument();
    expect(screen.queryByText("We usually reply within 24–48 hours.")).not.toBeInTheDocument();
    expect(screen.getByLabelText("NAME")).not.toHaveFocus();
  });

  it("shows video analysis trust guidance before submission", () => {
    render(<ContactForm variant="analysis" />);

    expect(screen.getByRole("heading", { name: "Video Analysis" })).toBeInTheDocument();
    expect(
      screen.getByText("Send a short clip and get one clear technical priority by email.")
    ).toBeInTheDocument();
    expect(screen.getByText("Reply window")).toBeInTheDocument();
    expect(screen.getByText("Useful context")).toBeInTheDocument();
    expect(screen.getByText("No payment details, passwords, or sign-in codes")).toBeInTheDocument();
    expect(screen.getByText("Send the smallest useful sample")).toBeInTheDocument();
    expect(screen.getByText("What the analysis reply looks like")).toBeInTheDocument();
    expect(screen.getByText("Priority")).toBeInTheDocument();
    expect(screen.getByText("Next pool task")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The final reply depends on the clip and context you send; we do not need payment details or private medical information."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Useful: current level, target distance or pace, what you feel in the water, and one shareable video link if you have it."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("focuses the first invalid field after submit validation fails", async () => {
    const user = userEvent.setup();

    render(<ContactForm variant="contact" />);

    const nameInput = screen.getByLabelText("NAME");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => {
      expect(screen.getByText("Please enter your name.")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(nameInput).toHaveFocus();
    });
    const feedback = screen.getByRole("alert");
    expect(feedback).toHaveAttribute("id", "contact-form-error");
    expect(feedback).toHaveAttribute("aria-live", "assertive");
    expect(feedback).toHaveAttribute("data-feedback-tone", "error");
    expect(feedback).toHaveTextContent("Check this field");
    expect(feedback).toHaveTextContent("Please enter your name.");
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(nameInput).toHaveAttribute("aria-describedby", "contact-form-error");
  });

  it("announces sending and API errors without changing the request payload", async () => {
    const user = userEvent.setup();
    type ContactFetchResponse = { ok: boolean; json: () => Promise<{ ok: boolean }> };
    const fetchState: { resolve?: (value: ContactFetchResponse) => void } = {};
    const fetchMock = vi.fn(
      () =>
        new Promise<ContactFetchResponse>((resolve) => {
          fetchState.resolve = resolve;
        })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<ContactForm variant="analysis" />);

    await user.type(screen.getByLabelText("NAME"), "Video Swimmer");
    await user.type(screen.getByLabelText("EMAIL"), "video@example.com");
    await user.type(
      screen.getByLabelText("MESSAGE"),
      "Please review my breathing timing from this short clip."
    );
    await user.click(screen.getByRole("button", { name: "Send" }));

    const pendingFeedback = screen.getByRole("status");
    expect(pendingFeedback).toHaveAttribute("data-feedback-tone", "pending");
    expect(pendingFeedback).toHaveTextContent("Sending request");
    expect(pendingFeedback).toHaveTextContent("Keep this page open while we send your request.");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, requestInit] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(requestInit.method).toBe("POST");
    expect(requestInit.body).toContain('"variant":"analysis"');
    expect(requestInit.body).toContain('"name":"Video Swimmer"');
    expect(requestInit.body).toContain('"email":"video@example.com"');
    expect(requestInit.body).toContain(
      '"message":"Please review my breathing timing from this short clip."'
    );

    const finishFetch = fetchState.resolve;
    if (!finishFetch) {
      throw new Error("Expected ContactForm to start the request.");
    }
    finishFetch({
      ok: false,
      json: async () => ({ ok: false }),
    });

    await waitFor(() => {
      const feedback = screen.getByRole("alert");
      expect(feedback).toHaveAttribute("data-feedback-tone", "error");
      expect(feedback).toHaveTextContent("Could not send request");
      expect(feedback).toHaveTextContent("Could not send right now. Please try again.");
    });
  });

  it("allows preview notify submissions without a message", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ContactForm variant="preview_access_notify" />);

    expect(screen.getByRole("heading", { name: "Apply for early access" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    expect(screen.getByAltText("Learn. Drill. Swim.")).toBeInTheDocument();
    expect(screen.getByLabelText("EMAIL")).toHaveAttribute("placeholder", "your@email.com");
    expect(screen.getByLabelText("OPTIONAL NOTE")).toBeInTheDocument();
    expect(screen.queryByText("Your details")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Leave your name and email. Add a note only if it helps.")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("What to include")).not.toBeInTheDocument();
    expect(screen.queryByText("Optional note ideas")).not.toBeInTheDocument();
    expect(screen.queryByText("No password is sent from this form.")).not.toBeInTheDocument();
    expect(
      screen.queryByText("No payment details, passwords, or sign-in codes")
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("NAME"), "Test User");
    await user.type(screen.getByLabelText("EMAIL"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "Apply for early access" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(requestInit.method).toBe("POST");
    expect(requestInit.body).toContain('"variant":"preview_access_notify"');
    expect(requestInit.body).toContain('"message":""');

    await waitFor(() => {
      expect(screen.getByText("Application received")).toBeInTheDocument();
    });
    const feedback = screen.getByRole("status");
    expect(feedback).toHaveAttribute("data-feedback-tone", "success");
    expect(feedback).toHaveTextContent("Application received");
  });
});
