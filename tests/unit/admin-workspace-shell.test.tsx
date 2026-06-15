import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("uses the AW-006 token shell for tabs and active context", () => {
    render(<AdminWorkspace role="admin" />);

    expect(screen.getByTestId("admin-workspace-shell")).toHaveClass("contents");
    expect(screen.getByTestId("admin-tab-grid")).toHaveClass(
      "lg:sticky",
      "lg:col-start-2",
      "lg:grid-cols-1",
      "overflow-x-auto"
    );
    expect(screen.getByTestId("admin-workspace-main")).toHaveClass("lg:col-start-1", "min-w-0");

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
});
