import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminOperationsManager from "@/components/admin/AdminOperationsManager";
import type { AdminRuntimeFlagRow } from "@/lib/admin/runtime-flags";

const siteLock = {
  configured: true,
  enabled: true,
  mode: "password",
  cookieName: "fs_preview",
  sessionMaxAgeSeconds: 86400,
};

const flag: AdminRuntimeFlagRow = {
  key: "soft_launch_banner",
  description: "Show public soft-launch banner.",
  enabled: true,
  is_public: true,
  updated_at: "2026-05-29T10:00:00.000Z",
  updated_by: null,
};

function operationsResponse(flags: AdminRuntimeFlagRow[] = [flag]) {
  return {
    ok: true,
    json: async () => ({
      ok: true,
      siteLock,
      flags,
      schemaReady: true,
      warning: null,
    }),
  };
}

function operationsErrorResponse(error = "Could not load operations data.") {
  return {
    ok: false,
    json: async () => ({
      ok: false,
      error,
    }),
  };
}

describe("AdminOperationsManager state rendering", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("uses AW-006 token cards and actions for operations rows", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(operationsResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminOperationsManager />);

    expect(screen.getByTestId("admin-operations-manager")).toHaveClass("space-y-4");
    expect(screen.getByTestId("admin-operations-manager-header")).toHaveClass(
      "fs-library-card",
      "fs-library-card-accent"
    );
    expect(screen.getByRole("button", { name: "Refresh" })).toHaveClass("fs-cta-secondary");

    const loading = screen.getByRole("status");
    expect(loading).toHaveTextContent("Loading operations state");
    expect(loading).toHaveAttribute("aria-live", "polite");

    await screen.findByText("Private Access Gate (env-controlled)");
    expect(screen.getByTestId("admin-operations-site-lock-card")).toHaveClass(
      "fs-library-card",
      "fs-library-card-muted"
    );
    expect(screen.getByTestId("admin-operations-flag-row")).toHaveClass("fs-library-card");
    expect(screen.getByRole("button", { name: "Disable" })).toHaveClass("fs-cta-secondary");
    expect(screen.getByRole("link", { name: "Open unlock page" })).toHaveClass("fs-cta-secondary");
  });

  it("keeps load error retry wired to the original operations loader", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(operationsErrorResponse())
      .mockResolvedValueOnce(operationsResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminOperationsManager />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Could not load operations data.");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await screen.findByText("Private Access Gate (env-controlled)");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/admin/operations/flags", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
  });

  it("keeps runtime flag toggle payloads unchanged while using token actions", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(operationsResponse())
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          item: {
            ...flag,
            enabled: false,
          },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminOperationsManager />);

    fireEvent.click(await screen.findByRole("button", { name: "Disable" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Enable" })).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenLastCalledWith("/api/admin/operations/flags/soft_launch_banner", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        enabled: false,
      }),
    });
  });
});
