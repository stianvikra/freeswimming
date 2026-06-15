import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminUsersManager from "@/components/admin/AdminUsersManager";
import type { AdminUsersOverviewPayload } from "@/lib/admin/users";

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
      id: "user-1",
      email: "swimmer@example.com",
      role: "viewer",
      createdAt: "2026-06-01T08:00:00.000Z",
      updatedAt: "2026-06-10T08:00:00.000Z",
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

  it("renders the read-only user overview and privacy boundary", async () => {
    mockFetchPayload(basePayload);

    render(<AdminUsersManager />);

    expect(screen.getByText("Loading user overview...")).toBeVisible();
    await waitFor(() => expect(screen.getByTestId("admin-users-list")).toBeVisible());

    expect(screen.getByRole("heading", { name: /Platform user overview/i })).toBeVisible();
    expect(screen.getByTestId("admin-users-summary")).toHaveTextContent("1 known user");
    expect(screen.getByTestId("admin-users-row-user-1")).toHaveTextContent("swimmer@example.com");
    expect(screen.getByTestId("admin-users-detail-panel")).toHaveTextContent("Poolside Guide");
    expect(screen.getByTestId("admin-users-privacy-boundary")).toHaveTextContent(
      "raw analytics payloads"
    );
    expect(screen.queryByText("stripe_checkout_session")).not.toBeInTheDocument();
  });

  it("sends bounded search, role, and sort params", async () => {
    const fetchMock = mockFetchPayload(basePayload);

    render(<AdminUsersManager />);
    await waitFor(() => expect(screen.getByTestId("admin-users-list")).toBeVisible());

    fireEvent.change(screen.getByLabelText("Search email"), {
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
      warnings: ["Admin users setup is not ready in this environment yet."],
    });

    render(<AdminUsersManager />);

    await waitFor(() => expect(screen.getByText("Partial user summary")).toBeVisible());
    expect(screen.getByText("No users found")).toBeVisible();
    expect(screen.getByText(/Admin users setup is not ready/i)).toBeVisible();
  });

  it("renders retry action on load failure", async () => {
    mockFetchPayload({ ok: false, error: "Forbidden." }, false);

    render(<AdminUsersManager />);

    await waitFor(() => expect(screen.getByText("Forbidden.")).toBeVisible());
    const alert = screen.getByRole("alert");
    expect(within(alert).getByRole("button", { name: /Retry/i })).toBeVisible();
  });
});
