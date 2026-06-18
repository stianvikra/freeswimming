import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import AdminHelpCenter from "@/components/admin/AdminHelpCenter";

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

    const overviewSection = document.querySelector("#overview");
    expect(overviewSection).toHaveClass("fs-library-card", "scroll-mt-28");

    const qualityMatrix = document.querySelector("#quality-matrix");
    expect(qualityMatrix).toHaveClass("fs-library-card");
    expect(screen.getByRole("table").parentElement).toHaveClass(
      "rounded-[var(--fs-radius-control)]",
      "border-[color:var(--fs-border-soft)]"
    );

    const runbookReference = screen.getByText("docs/runbooks/admin-message-inbox.md");
    expect(runbookReference.tagName).toBe("CODE");
    expect(runbookReference).toHaveClass(
      "rounded-[var(--fs-radius-control)]",
      "ring-[color:var(--fs-border-soft)]"
    );
  });

  it("keeps the existing Help/Guide content and anchors intact", () => {
    render(<AdminHelpCenter />);

    expect(screen.getByRole("heading", { name: "Help/Guide" })).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Operator learning path (first day)" })
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Dashboard tabs and when to use them" })
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "How Users works" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Buttons and what they do" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "How Analytics works" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Troubleshoot fast" })).toBeVisible();

    expect(screen.getByTestId("admin-help-quick-action-learning-path")).toHaveAttribute(
      "href",
      "#learning-path"
    );
    expect(screen.getByTestId("admin-help-quick-action-change-log")).toHaveAttribute(
      "href",
      "#change-log"
    );
    expect(screen.getByTestId("admin-help-quick-action-analytics")).toHaveAttribute(
      "href",
      "#analytics"
    );
    expect(screen.getByTestId("admin-help-quick-action-users")).toHaveAttribute("href", "#users");

    expect(screen.getByText("Course Workspace / All Content tabs:")).toBeVisible();
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
    expect(screen.getByText("7 days / 30 days / 90 days:")).toBeVisible();
    expect(screen.getByText("Open hello inbox:")).toBeVisible();
    expect(screen.getByText("Move to deleted / Confirm delete:")).toBeVisible();
    expect(screen.getByText("Search / Role / Sort:")).toBeVisible();
    expect(screen.getByText("User summary:")).toBeVisible();
    expect(screen.getByText("Change role:")).toBeVisible();
    expect(screen.getByText("Start from Auth users")).toBeVisible();
    expect(screen.getByText("Read access as entitlement summary")).toBeVisible();
    expect(screen.getByText(/Users is an Auth-canonical account/i)).toBeVisible();
    expect(screen.getByText(/blocks last-admin lockout/i)).toBeVisible();
    expect(screen.getByText(/does not show private training notes/i)).toBeVisible();
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
    expect(screen.getByText(/Do not infer missing revenue, individual visitors/i)).toBeVisible();
    expect(
      screen.getByText(
        "Every new/updated brief must declare Help/Guide impact as: required update or explicit N/A with reason."
      )
    ).toBeVisible();
    expect(screen.getByText("docs/runbooks/public-analytics-privacy-assessment.md")).toBeVisible();
    expect(screen.getByText("docs/runbooks/admin-email-template-governance.md")).toBeVisible();
  });
});
