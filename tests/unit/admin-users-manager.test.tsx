import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminUsersManager from "@/components/admin/AdminUsersManager";
import type { AdminUsersOverviewPayload } from "@/lib/admin/users";

const userId = "11111111-1111-4111-8111-111111111111";

const basePayload: AdminUsersOverviewPayload = {
  ok: true,
  generatedAt: "2026-06-12T12:00:00.000Z",
  query: {
    search: "",
    role: "all",
    sort: "updated_desc",
    page: 1,
    pageSize: 25,
  },
  summary: {
    totalUsers: 1,
    visibleUsers: 1,
    usersWithAccess: 1,
    usersWithoutAccess: 0,
    adminUsers: 0,
    editorUsers: 0,
    viewerUsers: 1,
    unknownRoleUsers: 0,
    missingProfileUsers: 0,
    unconfirmedUsers: 0,
    testerUsers: 0,
    partialSummary: false,
  },
  pageInfo: {
    page: 1,
    pageSize: 25,
    totalCount: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  },
  items: [
    {
      id: userId,
      email: "swimmer@example.com",
      displayName: "Fast Freestyler",
      displayNameSource: "athlete_profile",
      role: "viewer",
      roleSource: "profile",
      profileStatus: "complete",
      authStatus: "confirmed",
      testerStatus: "not_configured",
      createdAt: "2026-06-01T08:00:00.000Z",
      updatedAt: "2026-06-10T08:00:00.000Z",
      profileUpdatedAt: "2026-06-10T08:00:00.000Z",
      emailConfirmedAt: "2026-06-01T08:05:00.000Z",
      lastSignInAt: "2026-06-12T09:30:00.000Z",
      accessStatus: "active",
      entitlementCount: 1,
      products: [
        {
          id: "guide_poolside",
          title: "Poolside Guide",
          kind: "guide",
          active: true,
          known: true,
        },
      ],
      latestGrantedAt: "2026-06-11T09:00:00.000Z",
      lastActivityAt: "2026-06-12T10:00:00.000Z",
      lastActivitySource: "product_activity",
      supportCodes: [],
    },
  ],
  warnings: [],
};

function mockFetchSequence(payloads: unknown[]) {
  const fetchMock = vi.fn();
  for (const payload of payloads) {
    fetchMock.mockResolvedValueOnce({
      ok: (payload as { ok?: boolean }).ok !== false,
      json: vi.fn().mockResolvedValue(payload),
    });
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function mockFetchPayload(payload: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue(payload),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("AdminUsersManager", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("renders the auth user directory and privacy boundary", async () => {
    mockFetchPayload(basePayload);

    render(<AdminUsersManager adminRole="admin" />);

    expect(screen.getByText("Loading auth users...")).toBeVisible();
    await waitFor(() => expect(screen.getByTestId("admin-users-list")).toBeVisible());

    expect(screen.getByRole("heading", { name: /Auth user directory/i })).toBeVisible();
    expect(screen.getByTestId("admin-users-manager-header")).toHaveTextContent(
      "Role changes stay admin-only and audited."
    );
    expect(screen.getByTestId("admin-users-summary")).toHaveTextContent("1 auth user");
    expect(screen.getByTestId(`admin-users-row-${userId}`)).toHaveTextContent(
      "swimmer@example.com"
    );
    expect(screen.getByTestId(`admin-users-row-${userId}`)).toHaveTextContent("Profile linked");
    expect(screen.getByTestId("admin-users-detail-panel")).toHaveTextContent("Fast Freestyler");
    expect(screen.getByTestId("admin-users-detail-panel")).toHaveTextContent("Role management");
    expect(screen.getByTestId("admin-users-privacy-boundary")).toHaveTextContent(
      "raw analytics payloads"
    );
    expect(screen.queryByText("stripe_checkout_session")).not.toBeInTheDocument();
  });

  it("sends bounded search, role, and sort params", async () => {
    const fetchMock = mockFetchPayload(basePayload);

    render(<AdminUsersManager adminRole="admin" />);
    await waitFor(() => expect(screen.getByTestId("admin-users-list")).toBeVisible());

    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "owner@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Role"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("Sort"), { target: { value: "email_asc" } });
    fireEvent.click(screen.getByRole("button", { name: /Search/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        expect.stringContaining("q=owner%40example.com"),
        expect.anything()
      );
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining("role=admin"),
      expect.anything()
    );
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining("sort=email_asc"),
      expect.anything()
    );
  });

  it("submits admin role changes with confirmation and refreshes", async () => {
    const fetchMock = mockFetchSequence([
      basePayload,
      { ok: true, userId, role: "editor", auditLogged: true },
      {
        ...basePayload,
        items: [{ ...basePayload.items[0], role: "editor" }],
      },
    ]);

    render(<AdminUsersManager adminRole="admin" />);
    await waitFor(() => expect(screen.getByTestId("admin-users-role-panel")).toBeVisible());

    fireEvent.change(screen.getByLabelText("New role"), { target: { value: "editor" } });
    fireEvent.click(screen.getByLabelText(/Confirm this role change/i));
    fireEvent.click(screen.getByRole("button", { name: "Change role" }));

    await waitFor(() => expect(screen.getByText("Role updated and audit logged.")).toBeVisible());
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/admin/users/${userId}/role`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          role: "editor",
          expectedRole: "viewer",
          reason: "owner_request",
        }),
      })
    );
  });

  it("hides mutation ability from non-admin roles", async () => {
    mockFetchPayload(basePayload);

    render(<AdminUsersManager adminRole="viewer" />);
    await waitFor(() => expect(screen.getByTestId("admin-users-role-panel")).toBeVisible());

    expect(screen.getByText(/only Admin can change roles/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Change role" })).toBeDisabled();
    expect(screen.getByTestId("admin-users-role-boundary")).toHaveTextContent(
      "role changes require Admin access"
    );
  });

  it("renders partial warnings and empty state", async () => {
    mockFetchPayload({
      ...basePayload,
      summary: {
        ...basePayload.summary,
        totalUsers: 0,
        visibleUsers: 0,
        usersWithAccess: 0,
        partialSummary: true,
      },
      items: [],
      warnings: ["Auth user summary is capped."],
    });

    render(<AdminUsersManager adminRole="admin" />);

    await waitFor(() => expect(screen.getByText("Partial user summary")).toBeVisible());
    expect(screen.getByText("No users found")).toBeVisible();
    expect(screen.getByText(/Auth user summary is capped/i)).toBeVisible();
  });

  it("renders retry action on load failure", async () => {
    mockFetchPayload({ ok: false, error: "Forbidden." }, false);

    render(<AdminUsersManager adminRole="admin" />);

    await waitFor(() => expect(screen.getByText("Forbidden.")).toBeVisible());
    const alert = screen.getByRole("alert");
    expect(within(alert).getByRole("button", { name: /Retry/i })).toBeVisible();
  });
});
