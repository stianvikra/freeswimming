import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminWorkspace from "@/components/admin/AdminWorkspace";

const { pathnameValue, replaceMock, searchParamsValue } = vi.hoisted(() => ({
  pathnameValue: { current: "/admin" },
  replaceMock: vi.fn(),
  searchParamsValue: { current: "" },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameValue.current,
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(searchParamsValue.current),
}));

function mockManager(testId: string) {
  return {
    default: () => <section data-testid={testId} />,
  };
}

vi.mock("@/components/admin/AdminAnalyticsDashboard", () => mockManager("admin-manager-analytics"));
vi.mock("@/components/admin/AdminCommerceManager", () => mockManager("admin-manager-commerce"));
vi.mock("@/components/admin/AdminContentManager", () => mockManager("admin-manager-content"));
vi.mock("@/components/admin/AdminCategoriesManager", () => mockManager("admin-manager-categories"));
vi.mock("@/components/admin/AdminEmailTemplatesManager", () =>
  mockManager("admin-manager-email-templates")
);
vi.mock("@/components/admin/AdminHelpCenter", () => ({
  ...mockManager("admin-manager-help"),
  ADMIN_HELP_QUICK_ACTIONS: [
    { id: "overview", label: "Start here" },
    { id: "learning-path", label: "Learning path" },
    { id: "change-log", label: "Change governance" },
  ],
}));
vi.mock("@/components/admin/AdminMessagesManager", () => mockManager("admin-manager-messages"));
vi.mock("@/components/admin/AdminNotesManager", () => mockManager("admin-manager-notes"));
vi.mock("@/components/admin/AdminOperationsManager", () => mockManager("admin-manager-operations"));
vi.mock("@/components/admin/AdminQrLinksManager", () => mockManager("admin-manager-qr-links"));
vi.mock("@/components/admin/AdminUsersManager", () => mockManager("admin-manager-users"));

describe("AdminWorkspace shell", () => {
  beforeEach(() => {
    pathnameValue.current = "/admin";
    searchParamsValue.current = "";
    replaceMock.mockClear();
    stubWorkspaceSummaryFetch();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("uses the AW-006 token shell for tabs and active context", () => {
    render(<AdminWorkspace role="admin" />);

    expect(screen.getByTestId("admin-workspace-shell")).toHaveClass("contents");
    expect(screen.getByTestId("admin-tab-grid")).toHaveClass(
      "grid",
      "grid-cols-2",
      "lg:sticky",
      "lg:col-start-2",
      "lg:row-start-2",
      "lg:grid-cols-1"
    );
    expect(screen.getByTestId("admin-tab-grid")).not.toHaveClass("lg:row-span-2");
    expect(screen.getByTestId("admin-tab-grid")).not.toHaveClass("overflow-x-auto");
    expect(screen.getByTestId("admin-workspace-main")).toHaveClass(
      "lg:col-start-1",
      "lg:row-start-2",
      "min-w-0"
    );

    const contentTab = screen.getByTestId("admin-tab-content");
    expect(contentTab).toHaveClass("fs-library-card", "fs-library-card-accent");
    expect(contentTab).toHaveAttribute("aria-pressed", "true");

    const notesTab = screen.getByTestId("admin-tab-notes");
    expect(notesTab).toHaveClass("fs-library-card");
    expect(notesTab).not.toHaveClass("fs-library-card-accent");

    expect(screen.queryByTestId("admin-active-section-panel")).not.toBeInTheDocument();
    expect(screen.getByTestId("admin-active-section-label")).toHaveTextContent("Content");
    expect(screen.getByTestId("admin-manager-content")).toBeVisible();
  });

  it("keeps tab URL state and manager selection intact", () => {
    searchParamsValue.current = "tab=notes";

    render(<AdminWorkspace role="editor" />);

    expect(screen.getByTestId("admin-tab-notes")).toHaveClass("fs-library-card-accent");
    expect(screen.getByTestId("admin-active-section-label")).toHaveTextContent("Notes");
    expect(screen.getByTestId("admin-manager-notes")).toBeVisible();

    fireEvent.click(screen.getByTestId("admin-tab-qr-links"));

    expect(replaceMock).toHaveBeenCalledWith("/admin?tab=qr-links", { scroll: false });
  });

  it("keeps every top-level admin section keyboard-focusable with one active state", () => {
    render(<AdminWorkspace role="admin" />);

    const adminSections = screen.getByRole("navigation", { name: "Admin sections" });
    const sectionButtons = within(adminSections).getAllByRole("button");
    expect(sectionButtons).toHaveLength(11);
    expect(screen.getByTestId("admin-tab-grid")).toHaveClass("grid-cols-2", "sm:grid-cols-3");
    expect(sectionButtons.map((button) => button.textContent)).toEqual([
      "Content",
      "QR Links",
      "Commerce",
      "Operations",
      "Analytics",
      "Users",
      "Email templates",
      "Messages",
      "Notes",
      "Categories",
      "Help/Guide",
    ]);

    for (const button of sectionButtons) {
      button.focus();
      expect(button).toHaveFocus();
    }

    expect(
      sectionButtons.filter((button) => button.getAttribute("aria-pressed") === "true")
    ).toHaveLength(1);
    expect(
      sectionButtons.filter((button) => button.getAttribute("aria-pressed") === "false")
    ).toHaveLength(10);
  });

  it("renders the Users workspace from typed tab state", () => {
    searchParamsValue.current = "tab=users";

    render(<AdminWorkspace role="viewer" />);

    expect(screen.getByTestId("admin-tab-users")).toHaveClass("fs-library-card-accent");
    expect(screen.getByTestId("admin-tab-users")).toHaveAttribute(
      "title",
      "Accounts, access, support, and audited role controls"
    );
    expect(screen.getByTestId("admin-active-section-label")).toHaveTextContent("Users");
    expect(screen.getByTestId("admin-manager-users")).toBeVisible();
  });

  it("renders the Analytics workspace from typed tab state", () => {
    searchParamsValue.current = "tab=analytics";

    render(<AdminWorkspace role="viewer" />);

    expect(screen.getByTestId("admin-tab-analytics")).toHaveClass("fs-library-card-accent");
    expect(screen.getByTestId("admin-active-section-label")).toHaveTextContent("Analytics");
    expect(screen.getByTestId("admin-manager-analytics")).toBeVisible();
  });

  it("shows Help/Guide section links in the active desktop rail", () => {
    searchParamsValue.current = "tab=help";

    render(<AdminWorkspace role="admin" />);

    expect(screen.getByTestId("admin-tab-help")).toHaveClass("fs-library-card-accent");
    expect(screen.getByTestId("admin-manager-help")).toBeVisible();

    const subnav = screen.getByTestId("admin-help-subnav");
    expect(subnav).toHaveClass("hidden", "lg:block");
    expect(screen.getByTestId("admin-help-subnav-overview")).toHaveAttribute("href", "#overview");
    expect(screen.getByTestId("admin-help-subnav-learning-path")).toHaveAttribute(
      "href",
      "#learning-path"
    );
    expect(screen.getByTestId("admin-help-subnav-change-log")).toHaveAttribute(
      "href",
      "#change-log"
    );
  });

  it("shows a Messages needs-reply badge from the shell summary count", async () => {
    stubWorkspaceSummaryFetch({ messagesNeedsReplyCount: 3 });

    render(<AdminWorkspace role="admin" />);

    const messagesTab = screen.getByTestId("admin-tab-messages");
    const badge = await screen.findByTestId("admin-tab-messages-needs-reply-badge");

    expect(badge).toHaveTextContent("3");
    expect(messagesTab).toHaveAttribute("aria-label", "Messages, 3 need reply");
    expect(fetch).toHaveBeenCalledWith("/api/admin/messages/summary", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
  });

  it("caps the Messages needs-reply badge without hiding the accessible meaning", async () => {
    stubWorkspaceSummaryFetch({ messagesNeedsReplyCount: 12 });

    render(<AdminWorkspace role="admin" />);

    const messagesTab = screen.getByTestId("admin-tab-messages");
    const badge = await screen.findByTestId("admin-tab-messages-needs-reply-badge");

    expect(badge).toHaveTextContent("9+");
    expect(messagesTab).toHaveAttribute("aria-label", "Messages, 9 or more need reply");
  });

  it("fails quiet when the Messages summary count is unavailable", async () => {
    stubWorkspaceSummaryFetch({ messagesResponse: messagesSummaryErrorResponse() });

    render(<AdminWorkspace role="admin" />);

    await waitFor(() => {
      expect(screen.queryByTestId("admin-tab-messages-needs-reply-badge")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("admin-messages-summary-status")).toHaveTextContent(
      "Messages needs-reply count unavailable."
    );
    expect(screen.getByTestId("admin-tab-messages")).toHaveAttribute("aria-label", "Messages");
  });

  it("shows a Notes open-count badge from the shell summary count", async () => {
    stubWorkspaceSummaryFetch({ notesOpenCount: 4 });

    render(<AdminWorkspace role="admin" />);

    const notesTab = screen.getByTestId("admin-tab-notes");
    const badge = await screen.findByTestId("admin-tab-notes-open-badge");

    expect(badge).toHaveTextContent("4");
    expect(notesTab).toHaveAttribute("aria-label", "Notes, 4 open notes");
    expect(fetch).toHaveBeenCalledWith("/api/admin/notes/summary", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
  });

  it("caps the Notes open-count badge without hiding the accessible meaning", async () => {
    stubWorkspaceSummaryFetch({ notesOpenCount: 14 });

    render(<AdminWorkspace role="admin" />);

    const notesTab = screen.getByTestId("admin-tab-notes");
    const badge = await screen.findByTestId("admin-tab-notes-open-badge");

    expect(badge).toHaveTextContent("9+");
    expect(notesTab).toHaveAttribute("aria-label", "Notes, 9 or more open notes");
  });

  it("fails quiet when the Notes summary count is unavailable", async () => {
    stubWorkspaceSummaryFetch({ notesResponse: notesSummaryErrorResponse() });

    render(<AdminWorkspace role="admin" />);

    await waitFor(() => {
      expect(screen.queryByTestId("admin-tab-notes-open-badge")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("admin-notes-summary-status")).toHaveTextContent(
      "Notes open count unavailable."
    );
    expect(screen.getByTestId("admin-tab-notes")).toHaveAttribute("aria-label", "Notes");
    expect(screen.getByTestId("admin-notes-quick-access")).toHaveAttribute(
      "aria-label",
      "Open Notes"
    );
    expect(screen.queryByTestId("admin-notes-quick-access-badge")).not.toBeInTheDocument();
  });

  it("shows a compact Notes quick access from non-Notes tabs", async () => {
    stubWorkspaceSummaryFetch({ notesOpenCount: 5 });
    searchParamsValue.current =
      "tab=messages&notesStatus=done&notesQuery=stale&notesPriority=high&notesCategory=Product&notesContextType=course_lesson&notesContextRef=legacy&foo=bar";

    render(<AdminWorkspace role="admin" />);

    const quickAccess = screen.getByTestId("admin-notes-quick-access");
    expect(quickAccess).toHaveClass("fixed", "left-3", "min-h-12", "sm:left-5", "lg:bottom-5");
    quickAccess.focus();
    expect(quickAccess).toHaveFocus();

    const badge = await screen.findByTestId("admin-notes-quick-access-badge");
    expect(badge).toHaveTextContent("5");
    expect(quickAccess).toHaveAttribute("aria-label", "Open Notes, 5 open notes");

    fireEvent.click(quickAccess);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalled();
    });
    const href = String(replaceMock.mock.calls[0]?.[0] ?? "");
    const params = new URLSearchParams(href.split("?")[1] ?? "");
    expect(href.startsWith("/admin?")).toBe(true);
    expect(params.get("tab")).toBe("notes");
    expect(params.get("foo")).toBe("bar");
    expect(params.get("notesStatus")).toBeNull();
    expect(params.get("notesQuery")).toBeNull();
    expect(params.get("notesPriority")).toBeNull();
    expect(params.get("notesCategory")).toBeNull();
    expect(params.get("notesContextType")).toBeNull();
    expect(params.get("notesContextRef")).toBeNull();
  });

  it("hides Notes quick access while the Notes workspace is active", () => {
    searchParamsValue.current = "tab=notes";

    render(<AdminWorkspace role="admin" />);

    expect(screen.queryByTestId("admin-notes-quick-access")).not.toBeInTheDocument();
  });

  it("selects Notes as the open queue while clearing stale Notes filters from shell clicks", async () => {
    searchParamsValue.current =
      "tab=messages&notesStatus=done&notesQuery=stale&notesPriority=high&notesCategory=Product&notesContextType=course_lesson&notesContextRef=legacy&foo=bar";

    render(<AdminWorkspace role="admin" />);

    fireEvent.click(screen.getByTestId("admin-tab-notes"));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalled();
    });
    const href = String(replaceMock.mock.calls[0]?.[0] ?? "");
    const params = new URLSearchParams(href.split("?")[1] ?? "");
    expect(href.startsWith("/admin?")).toBe(true);
    expect(params.get("tab")).toBe("notes");
    expect(params.get("foo")).toBe("bar");
    expect(params.get("notesStatus")).toBeNull();
    expect(params.get("notesQuery")).toBeNull();
    expect(params.get("notesPriority")).toBeNull();
    expect(params.get("notesCategory")).toBeNull();
    expect(params.get("notesContextType")).toBeNull();
    expect(params.get("notesContextRef")).toBeNull();
  });
});

type MockSummaryResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

function stubWorkspaceSummaryFetch(options?: {
  messagesNeedsReplyCount?: number;
  notesOpenCount?: number;
  messagesResponse?: MockSummaryResponse;
  notesResponse?: MockSummaryResponse;
}) {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: string | URL | Request) => {
      const url =
        typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url === "/api/admin/messages/summary") {
        return Promise.resolve(
          options?.messagesResponse ??
            messagesSummaryResponse(options?.messagesNeedsReplyCount ?? 0)
        );
      }
      if (url === "/api/admin/notes/summary") {
        return Promise.resolve(
          options?.notesResponse ?? notesSummaryResponse(options?.notesOpenCount ?? 0)
        );
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    })
  );
}

function messagesSummaryResponse(needsReplyCount: number) {
  return {
    ok: true,
    json: async () => ({
      ok: true,
      role: "admin",
      schemaReady: true,
      warning: null,
      needsReplyCount,
    }),
  };
}

function messagesSummaryErrorResponse() {
  return {
    ok: false,
    json: async () => ({
      ok: false,
      error: "Could not load message summary right now.",
    }),
  };
}

function notesSummaryResponse(openCount: number) {
  return {
    ok: true,
    json: async () => ({
      ok: true,
      role: "admin",
      schemaReady: true,
      warning: null,
      openCount,
    }),
  };
}

function notesSummaryErrorResponse() {
  return {
    ok: false,
    json: async () => ({
      ok: false,
      error: "Could not load notes summary right now.",
    }),
  };
}
