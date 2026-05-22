import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GuidePdfDownloadButton from "@/components/guides/GuidePdfDownloadButton";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";

vi.mock("@/lib/analytics/client", () => ({
  sendClientAnalyticsEvent: vi.fn(),
}));

function buildSuccessfulPdfResponse(filename = "guide.pdf") {
  return {
    ok: true,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "content-disposition" ? `attachment; filename="${filename}"` : null,
    },
    blob: async () => new Blob(["%PDF-1.4"], { type: "application/pdf" }),
  };
}

describe("GuidePdfDownloadButton", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("downloads PDF on successful response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(buildSuccessfulPdfResponse("freeswimming-0-1000m-guide.pdf"));
    vi.stubGlobal("fetch", fetchMock);

    const createUrlSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:http://127.0.0.1/mock-pdf");
    const revokeUrlSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    render(
      <GuidePdfDownloadButton
        apiPath="/api/guides/0-1000m/pdf"
        fallbackFileName="freeswimming-0-1000m-guide.pdf"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/guides/0-1000m/pdf", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });
    });
    expect(sendClientAnalyticsEvent).toHaveBeenCalledWith("item_download_started", {
      apiPath: "/api/guides/0-1000m/pdf",
    });

    await waitFor(() => {
      expect(createUrlSpy).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByText("Could not download PDF right now. Please try again.")).toBeNull();
    expect(revokeUrlSpy).toHaveBeenCalledTimes(0);
  });

  it("announces pending download feedback while the PDF request is in flight", async () => {
    let resolveFetch: (response: ReturnType<typeof buildSuccessfulPdfResponse>) => void = () => {};
    const fetchMock = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:http://127.0.0.1/mock-pdf");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    render(<GuidePdfDownloadButton apiPath="/api/guides/0-1000m/pdf" />);

    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));

    const pendingStatus = await screen.findByRole("status");
    expect(pendingStatus).toHaveTextContent("Preparing PDF download...");
    expect(pendingStatus).toHaveAttribute("aria-live", "polite");
    expect(pendingStatus).toHaveClass("border-sky-200", "bg-sky-50", "text-sky-800");

    const button = screen.getByRole("button", { name: "Downloading PDF..." });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-describedby", pendingStatus.id);

    resolveFetch(buildSuccessfulPdfResponse());

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Download PDF" })).toBeEnabled();
    });
  });

  it("shows API error when download fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, error: "PDF is temporarily unavailable." }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<GuidePdfDownloadButton apiPath="/api/guides/0-1000m/pdf" />);

    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));

    await waitFor(() => {
      expect(screen.getByText("PDF is temporarily unavailable.")).toBeInTheDocument();
    });

    const errorStatus = screen.getByRole("status");
    expect(errorStatus).toHaveAttribute("aria-live", "polite");
    expect(errorStatus).toHaveClass("border-rose-200", "bg-rose-50", "text-rose-700");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("clears stale errors when retrying a failed PDF request", async () => {
    let resolveFetch: (response: ReturnType<typeof buildSuccessfulPdfResponse>) => void = () => {};
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ ok: false, error: "PDF is temporarily unavailable." }),
      })
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
      );
    vi.stubGlobal("fetch", fetchMock);

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:http://127.0.0.1/mock-pdf");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    render(<GuidePdfDownloadButton apiPath="/api/guides/0-1000m/pdf" />);

    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));

    await screen.findByText("PDF is temporarily unavailable.");

    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));

    await waitFor(() => {
      expect(screen.queryByText("PDF is temporarily unavailable.")).not.toBeInTheDocument();
    });
    expect(screen.getByRole("status")).toHaveTextContent("Preparing PDF download...");

    resolveFetch(buildSuccessfulPdfResponse());

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Download PDF" })).toBeEnabled();
    });
  });
});
