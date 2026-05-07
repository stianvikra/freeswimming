import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminMessagesManager from "@/components/admin/AdminMessagesManager";
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

function listResponse(items: AdminMessageItem[] = [baseItem]) {
  return {
    ok: true,
    json: async () => ({
      ok: true,
      role: "admin",
      items,
      schemaReady: true,
      warning: null,
      pageSize: 25,
      nextCursor: null,
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

describe("AdminMessagesManager", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
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

    expect(await screen.findAllByText("Needs reply completed.")).toHaveLength(2);
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      action: "needs_reply",
    });
    expect(screen.getAllByText("Needs reply").length).toBeGreaterThan(0);
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

    expect(await screen.findAllByText("Move to deleted completed.")).toHaveLength(2);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      action: "delete",
    });
  });
});
