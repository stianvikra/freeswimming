import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminMessagesManager from "@/components/admin/AdminMessagesManager";
import type { AdminRole } from "@/lib/admin/access";
import type { AdminMessageItem } from "@/lib/admin/messages";

const baseItem: AdminMessageItem = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  sourceVariant: "contact",
  sourceLabel: "Contact",
  submitterName: "Test Swimmer",
  submitterEmail: "swimmer@example.com",
  messageBody: "Please help me with freestyle.",
  messageExcerpt: "Please help me with freestyle.",
  structuredIntake: [],
  requestDiagnostics: [{ label: "IP evidence", value: "Hashed" }],
  status: "new",
  statusBucket: "new",
  statusLabel: "New",
  notificationStatus: "accepted_by_provider",
  notificationStatusLabel: "Accepted",
  notificationErrorCode: null,
  createdAt: "2026-05-06T18:00:00.000Z",
  updatedAt: "2026-05-06T18:00:00.000Z",
  deliveryAttempts: [
    {
      id: "123e4567-e89b-42d3-a456-426614174111",
      target: "inbound_notification",
      targetLabel: "Inbound notification",
      providerKey: "resend_api",
      providerLabel: "Resend API",
      status: "accepted_by_provider",
      statusLabel: "Accepted",
      providerMessageId: "provider-1",
      errorCode: null,
      redactedErrorMessage: null,
      retryAfterSeconds: null,
      createdAt: "2026-05-06T18:01:00.000Z",
      updatedAt: "2026-05-06T18:01:00.000Z",
    },
  ],
};

function listResponse(
  items: AdminMessageItem[] = [baseItem],
  options:
    | AdminRole
    | {
        role?: AdminRole;
        schemaReady?: boolean;
        warning?: string | null;
        nextCursor?: string | null;
      } = "admin"
) {
  const role = typeof options === "string" ? options : (options.role ?? "admin");
  const schemaReady = typeof options === "string" ? true : (options.schemaReady ?? true);
  const warning = typeof options === "string" ? null : (options.warning ?? null);
  const nextCursor = typeof options === "string" ? null : (options.nextCursor ?? null);

  return {
    ok: true,
    json: async () => ({
      ok: true,
      role,
      items,
      schemaReady,
      warning,
      pageSize: 25,
      nextCursor,
    }),
  };
}

function listErrorResponse(error = "Could not load messages.") {
  return {
    ok: false,
    json: async () => ({
      ok: false,
      error,
    }),
  };
}

function mutationResponse(item: AdminMessageItem) {
  return {
    ok: true,
    json: async () => ({
      ok: true,
      role: "admin",
      item,
    }),
  };
}

function mutationErrorResponse(error = "Could not update message.") {
  return {
    ok: false,
    json: async () => ({
      ok: false,
      error,
    }),
  };
}

describe("AdminMessagesManager", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows a polite loading state before messages resolve", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(listResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminMessagesManager adminRole="admin" />);

    const loading = screen.getByRole("status");
    expect(loading).toHaveTextContent("Loading messages...");
    expect(loading).toHaveAttribute("aria-live", "polite");

    await screen.findByText("Test Swimmer");
  });

  it("keeps load error retry wired to the original messages loader", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(listErrorResponse())
      .mockResolvedValueOnce(listResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminMessagesManager adminRole="admin" />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Could not load messages.");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await screen.findByText("Test Swimmer");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/admin/messages?pageSize=25", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
  });

  it("keeps schema warnings polite while preserving the storage-not-ready state", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      listResponse([], {
        schemaReady: false,
        warning: "Message schema is not ready.",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminMessagesManager adminRole="admin" />);

    const warningText = await screen.findByText("Message schema is not ready.");
    const warning = warningText.closest('[role="status"]');
    if (!warning) {
      throw new Error("Expected warning state wrapper to render.");
    }
    expect(warning).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Message storage is not ready.")).toBeInTheDocument();
  });

  it("uses AW-006 token cards and actions for the message manager shell", async () => {
    const itemWithIntake: AdminMessageItem = {
      ...baseItem,
      structuredIntake: [{ key: "pool", label: "Preferred pool", value: "Toyenbadet" }],
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(listResponse([itemWithIntake], { nextCursor: "cursor-2" }));
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminMessagesManager adminRole="admin" />);

    const row = await screen.findByTestId("admin-message-list-item");
    const bodyPanel = await screen.findByTestId("admin-message-body-panel");

    expect(screen.getByTestId("admin-messages-manager-header")).toHaveClass(
      "fs-library-card",
      "fs-library-card-accent"
    );
    expect(
      screen.getByRole("link", { name: "Open hello@freeswimming.org inbox in a new tab" })
    ).toHaveClass("fs-cta-secondary");
    expect(screen.getByRole("button", { name: "Refresh" })).toHaveClass("fs-cta-secondary");
    expect(screen.getByRole("button", { name: "All" })).toHaveClass(
      "fs-library-card",
      "fs-library-card-accent"
    );
    expect(screen.getByTestId("admin-messages-list-panel")).toHaveClass("fs-library-card");
    expect(row).toHaveClass("bg-[rgba(191,219,254,0.34)]");
    expect(screen.getByTestId("admin-messages-detail-panel")).toHaveClass("fs-library-card");
    expect(bodyPanel).toHaveClass("rounded-[var(--fs-radius-control)]");
    const structuredIntakeEntry = screen.getByText("Preferred pool").closest("div");
    if (!structuredIntakeEntry) {
      throw new Error("Expected structured intake entry wrapper to render.");
    }
    expect(structuredIntakeEntry).toHaveClass("rounded-[var(--fs-radius-control)]");
    expect(screen.getByTestId("admin-messages-diagnostics-panel")).toHaveClass(
      "rounded-[var(--fs-radius-control)]"
    );
    expect(screen.getByTestId("admin-messages-delivery-panel")).toHaveClass(
      "rounded-[var(--fs-radius-control)]"
    );

    const actions = screen.getByTestId("admin-messages-actions-panel");
    expect(within(actions).getByRole("button", { name: "Mark read" })).toHaveClass(
      "fs-cta-secondary"
    );
    expect(within(actions).getByRole("button", { name: "Needs reply" })).toHaveClass("bg-amber-50");
    expect(within(actions).getByRole("button", { name: "Mark replied" })).toHaveClass(
      "bg-emerald-50"
    );
    expect(within(actions).getByRole("button", { name: "Archive" })).toHaveClass(
      "fs-cta-secondary"
    );
    expect(within(actions).getByRole("button", { name: "Move to deleted" })).toHaveClass(
      "text-rose-700"
    );
    expect(screen.getByRole("button", { name: "Load older" })).toHaveClass("fs-cta-secondary");
  });

  it("renders unchanged empty and no-selection guidance without live-region noise", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(listResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminMessagesManager adminRole="admin" />);

    const emptyState = await screen.findByTestId("admin-messages-empty-state");
    expect(emptyState).toHaveTextContent("No messages match the current filters.");
    expect(emptyState).not.toHaveAttribute("role");
    expect(emptyState).not.toHaveAttribute("aria-live");

    const noSelectionState = screen.getByTestId("admin-messages-no-selection-state");
    expect(noSelectionState).toHaveTextContent(
      "Select a message to inspect details and diagnostics."
    );
    expect(noSelectionState).not.toHaveAttribute("role");
    expect(noSelectionState).not.toHaveAttribute("aria-live");
  });

  it("loads messages and marks a selected message as needs reply", async () => {
    const updatedItem: AdminMessageItem = {
      ...baseItem,
      status: "needs_reply",
      statusBucket: "needs_reply",
      statusLabel: "Needs reply",
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(listResponse())
      .mockResolvedValueOnce(mutationResponse(updatedItem));
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminMessagesManager adminRole="admin" />);

    await screen.findByText("Test Swimmer");
    expect(screen.getByText("Stored requests")).toBeInTheDocument();
    expect(screen.getByText(/Reply from the normal email inbox in v1\./)).toBeInTheDocument();
    expect(screen.getAllByText("Please help me with freestyle.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("swimmer@example.com").length).toBeGreaterThan(0);

    const actions = (await screen.findByText("Actions")).parentElement;
    expect(actions).toBeTruthy();
    fireEvent.click(within(actions as HTMLElement).getByRole("button", { name: "Needs reply" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Needs reply completed.");
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      action: "needs_reply",
    });
    expect(screen.getAllByText("Needs reply").length).toBeGreaterThan(0);
  });

  it.each(["admin", "editor"] as const)(
    "shows the One.com inbox shortcut for %s role",
    async (role) => {
      const fetchMock = vi.fn().mockResolvedValueOnce(listResponse([baseItem], role));
      vi.stubGlobal("fetch", fetchMock);

      render(<AdminMessagesManager adminRole={role} />);

      await screen.findByText("Test Swimmer");

      const webmailLink = screen.getByRole("link", {
        name: "Open hello@freeswimming.org inbox in a new tab",
      });
      expect(webmailLink).toHaveAttribute("href", "https://mail.one.com/");
      expect(webmailLink).toHaveAttribute("target", "_blank");
      expect(webmailLink).toHaveAttribute("rel", "noreferrer");
      expect(screen.getByText("Open hello inbox")).toBeInTheDocument();
    }
  );

  it("hides the One.com inbox shortcut for viewer role", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(listResponse([baseItem], "viewer"));
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminMessagesManager adminRole="viewer" />);

    await screen.findByText("Test Swimmer");

    expect(
      screen.queryByRole("link", {
        name: "Open hello@freeswimming.org inbox in a new tab",
      })
    ).not.toBeInTheDocument();
  });

  it("requires confirmation before moving a message to deleted", async () => {
    const deletedItem: AdminMessageItem = {
      ...baseItem,
      status: "deleted",
      statusBucket: "deleted",
      statusLabel: "Deleted",
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(listResponse())
      .mockResolvedValueOnce(mutationResponse(deletedItem));
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminMessagesManager adminRole="admin" />);

    await screen.findByText("Test Swimmer");
    const actions = (await screen.findByText("Actions")).parentElement;
    expect(actions).toBeTruthy();
    fireEvent.click(
      within(actions as HTMLElement).getByRole("button", { name: "Move to deleted" })
    );

    expect(screen.getByText("Confirm soft delete")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Move to deleted completed.");
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      action: "delete",
    });
  });

  it("announces update action errors politely without changing the payload", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(listResponse())
      .mockResolvedValueOnce(mutationErrorResponse("Message status update failed."));
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminMessagesManager adminRole="admin" />);

    await screen.findByText("Test Swimmer");
    const actions = (await screen.findByText("Actions")).parentElement;
    expect(actions).toBeTruthy();
    fireEvent.click(within(actions as HTMLElement).getByRole("button", { name: "Needs reply" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Message status update failed.");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      action: "needs_reply",
    });
  });
});
