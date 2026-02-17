import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GuidePdfDownloadButton from "@/components/guides/GuidePdfDownloadButton";

describe("GuidePdfDownloadButton", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("downloads PDF on successful response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: (name: string) =>
          name.toLowerCase() === "content-disposition"
            ? 'attachment; filename=\"freeswimming-0-1000m-guide.pdf\"'
            : null,
      },
      blob: async () => new Blob(["%PDF-1.4"], { type: "application/pdf" }),
    });
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

    await waitFor(() => {
      expect(createUrlSpy).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByText("Could not download PDF right now. Please try again.")).toBeNull();
    expect(revokeUrlSpy).toHaveBeenCalledTimes(0);
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
  });
});
