import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import AdminHelpCenter, {
  ADMIN_HELP_COVERED_TAB_VALUES,
  ADMIN_HELP_HAS_ACTIVE_TAB_COVERAGE,
  ADMIN_HELP_TAB_GUIDES,
} from "@/components/admin/AdminHelpCenter";
import { ADMIN_TAB_VALUES } from "@/lib/admin/admin-workspace";

function openDetailsSection(name: string) {
  const heading = screen.getByRole("heading", { name });
  const summary = heading.closest("summary");
  expect(summary).not.toBeNull();
  fireEvent.click(summary as HTMLElement);
}

describe("AdminHelpCenter", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses the AW-006 admin token shell for the help guide surface", () => {
    render(<AdminHelpCenter />);

    expect(screen.getByTestId("admin-help-center")).toHaveClass(
      "fs-library-card",
      "fs-library-card-accent"
    );

    const startLink = screen.getByTestId("admin-help-quick-action-overview");
    expect(startLink).toHaveClass("fs-cta-secondary");
    expect(startLink).toHaveAttribute("href", "#overview");
    expect(startLink.parentElement).toHaveClass("lg:hidden");
    expect(startLink.parentElement).toHaveClass("overflow-x-auto");

    const overviewSection = document.querySelector("#overview");
    expect(overviewSection).toHaveClass("fs-library-card", "scroll-mt-28");

    expect(screen.getByTestId("admin-help-tab-quick-reference")).toBeVisible();

    const qualityMatrix = document.querySelector("#quality-matrix");
    expect(qualityMatrix).toHaveClass("fs-library-card");
    openDetailsSection("10/10 Help/Training quality coverage matrix");
    expect(screen.getByRole("table").parentElement).toHaveClass(
      "rounded-[var(--fs-radius-control)]",
      "border-[color:var(--fs-border-soft)]"
    );

    openDetailsSection("Documentation controls (required)");
    const runbookReference = screen.getByText("docs/runbooks/admin-message-inbox.md");
    expect(runbookReference.tagName).toBe("CODE");
    expect(runbookReference).toHaveClass(
      "rounded-[var(--fs-radius-control)]",
      "ring-[color:var(--fs-border-soft)]"
    );
  });

  it("keeps quick reference content, recovery guidance, and deeper anchors intact", () => {
    render(<AdminHelpCenter />);

    expect(screen.getByRole("heading", { name: "Help/Guide" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Start here" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Tab quick reference" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Recovery states" })).toBeVisible();

    expect(screen.getByTestId("admin-help-quick-action-quick-reference")).toHaveAttribute(
      "href",
      "#quick-reference"
    );
    expect(screen.getByTestId("admin-help-quick-action-recovery")).toHaveAttribute(
      "href",
      "#recovery"
    );
    expect(screen.getByTestId("admin-help-quick-action-analytics")).toHaveAttribute(
      "href",
      "#analytics"
    );
    expect(screen.getByTestId("admin-help-quick-action-users")).toHaveAttribute("href", "#users");

    for (const guide of ADMIN_HELP_TAB_GUIDES) {
      const card = screen.getByTestId(`admin-help-tab-guide-${guide.id}`);
      expect(card).toBeVisible();
      expect(within(card).getByText(guide.name)).toBeVisible();
      expect(within(card).getByText("Primary job")).toBeVisible();
      expect(within(card).getByText("Common action")).toBeVisible();
      expect(within(card).getByText("Dangerous action")).toBeVisible();
      expect(within(card).getByText("Recovery")).toBeVisible();
    }

    expect(screen.getByText("Content load mismatch")).toBeVisible();
    expect(screen.getByText(/No content items yet/i)).toBeVisible();
    expect(screen.getByText(/Do not create or publish new records/i)).toBeVisible();
    expect(screen.getByText(/role-changing/i)).toBeVisible();
    expect(
      within(screen.getByTestId("admin-help-tab-guide-analytics")).getByText(
        /purchases, revenue, Stripe, finance, or unique people/i
      )
    ).toBeVisible();
    expect(
      within(screen.getByTestId("admin-help-tab-guide-users")).getByText(/private training/i)
    ).toBeVisible();

    openDetailsSection("Buttons and what they do");
    expect(screen.getByText("Course Workspace / All Content tabs:")).toBeVisible();
    expect(screen.getByText("7 days / 30 days / 90 days:")).toBeVisible();
    expect(screen.getByText("Open hello inbox:")).toBeVisible();
    expect(screen.getByText("Move to deleted / Confirm delete:")).toBeVisible();
    expect(screen.getByText("Search / Role / Sort:")).toBeVisible();
    expect(screen.getByText("User summary:")).toBeVisible();
    expect(screen.getByText("Change role:")).toBeVisible();
    expect(screen.getByText("Status actions:")).toBeVisible();

    openDetailsSection("How Messages work");
    expect(screen.getByText("Messages badge means Needs reply")).toBeVisible();
    expect(screen.getByText(/not an unread counter/i)).toBeVisible();
    expect(
      screen.getAllByText(/normal email inbox remains the v1 reply workspace/i).length
    ).toBeGreaterThanOrEqual(1);

    openDetailsSection("How Notes work");
    expect(screen.getByText("Notes badge means Open")).toBeVisible();
    expect(screen.getByText(/including contextual notes in the same queue/i)).toBeVisible();
    expect(screen.getByText("Floating Notes shortcut")).toBeVisible();
    expect(screen.getByText(/opens the same Open queue/i)).toBeVisible();
    expect(screen.getByText(/not an unread or new-note counter/i)).toBeVisible();
    expect(screen.getByText(/Direct links with explicit status/i)).toBeVisible();

    openDetailsSection("How the Content page works");
    expect(screen.getByText("Lesson fields editor")).toBeVisible();
    expect(screen.getByText(/Edit lesson keeps public fields first/i)).toBeVisible();
    expect(screen.getByText(/Video planning notes.*support tools/i)).toBeVisible();
    expect(
      screen.getAllByText(/Lesson experience layout.*public section preset/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Shown.*Hidden.*public visibility/i).length).toBeGreaterThanOrEqual(
      1
    );
    expect(screen.getAllByText(/Summary.*support sections/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Save changes / View changes / Cancel:")).toBeVisible();
    expect(screen.getByText("Public lesson mirror / Technical fallback fields:")).toBeVisible();
    expect(screen.getByText(/support actions, and legacy fields/i)).toBeVisible();
    expect(screen.queryByText(/Advanced\/fallback/i)).not.toBeInTheDocument();

    openDetailsSection("How Users works");
    expect(screen.getByText("Start from Auth users")).toBeVisible();
    expect(screen.getByText("Read access as entitlement summary")).toBeVisible();
    expect(screen.getByText(/Users is an Auth-canonical account/i)).toBeVisible();
    expect(screen.getByText(/blocks last-admin lockout/i)).toBeVisible();
    expect(screen.getByText(/does not show private training notes/i)).toBeVisible();

    openDetailsSection("How Analytics works");
    expect(
      screen.getByText(/not money records or tracking individual public visitors/i)
    ).toBeVisible();
    expect(screen.getByText("Know the dashboard words")).toBeVisible();
    expect(
      screen.getByText(
        /A logged action is one counted thing that happened.*Event is the technical name/i
      )
    ).toBeVisible();
    expect(screen.getByText(/Read limit means the dashboard stopped/i)).toBeVisible();
    expect(screen.getByText(/Started shows how often the builder was opened/i)).toBeVisible();
    expect(
      screen.getByText(/Manual starts and saves show hands-on builder activity/i)
    ).toBeVisible();
    expect(
      screen.getByText(
        /Shown and clicked are mapped rows for a saved-workout Poolside guide placement that is paused/i
      )
    ).toBeVisible();
    expect(screen.getByText(/The stage summary lines up mapped prompt activity/i)).toBeVisible();
    expect(
      screen.getAllByText(/future-placement readiness until a new placement launches/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/Checkout handoffs mean the approved saved-workout guide path/i)
    ).toBeVisible();
    expect(
      screen.getByText(
        /Checkout cancelled means the approved saved-workout Poolside guide checkout/i
      )
    ).toBeVisible();
    expect(screen.getByText(/Completed checkout means Stripe reported/i)).toBeVisible();
    expect(
      screen.getByText(/Shown means a current sales prompt on Plans or My Library appeared/i)
    ).toBeVisible();
    expect(screen.getByText(/Viewed, marked done, continued, and support interest/i)).toBeVisible();
    expect(screen.getAllByText(/not proven technique mastery/i).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/Generated sessions show how often generated drafts became saved workouts/i)
    ).toBeVisible();
    expect(
      screen.getByText(
        /Generated sessions show how often generated drafts became saved workouts.*Template starts count only the Use template action/i
      )
    ).toBeVisible();
    expect(screen.getByText("Started / Saved / Save rate:")).toBeVisible();
    expect(screen.getByText("Free lesson learning signals:")).toBeVisible();
    expect(screen.getByText("Poolside guide paused funnel:")).toBeVisible();
    expect(screen.getByText("Poolside guide prompt readiness:")).toBeVisible();
    expect(screen.getByText("Poolside guide checkout readiness:")).toBeVisible();
    expect(screen.getByText("Poolside guide checkout cancel readiness:")).toBeVisible();
    expect(screen.getByText("Poolside guide access readiness:")).toBeVisible();
    expect(screen.getByText("Generated sessions / Template starts:")).toBeVisible();
    expect(screen.getByText(/not purchases, revenue, exports, or unique people/i)).toBeVisible();

    openDetailsSection("Troubleshoot fast");
    expect(screen.getByText(/Do not infer missing revenue, individual visitors/i)).toBeVisible();

    openDetailsSection("Documentation controls (required)");
    expect(
      screen.getByText(
        "Every new/updated brief must declare Help/Guide impact as: required update or explicit N/A with reason."
      )
    ).toBeVisible();
    expect(screen.getByText("docs/runbooks/public-analytics-privacy-assessment.md")).toBeVisible();
    expect(screen.getByText("docs/runbooks/admin-email-template-governance.md")).toBeVisible();
  });

  it("keeps active admin tabs covered by Help/Guide quick reference", () => {
    expect(ADMIN_HELP_HAS_ACTIVE_TAB_COVERAGE).toBe(true);
    expect(ADMIN_HELP_COVERED_TAB_VALUES).toEqual([...ADMIN_TAB_VALUES]);
  });
});
