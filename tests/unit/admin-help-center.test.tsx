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

    expect(screen.getByText("Course Workspace / All Content tabs:")).toBeVisible();
    expect(screen.getByText("7 days / 30 days / 90 days:")).toBeVisible();
    expect(screen.getByText("Open hello inbox:")).toBeVisible();
    expect(screen.getByText("Move to deleted / Confirm delete:")).toBeVisible();
    expect(
      screen.getByText(/not finance reconciliation or user-level public traffic/i)
    ).toBeVisible();
    expect(screen.getByText(/Do not infer missing revenue, user attribution/i)).toBeVisible();
    expect(
      screen.getByText(
        "Every new/updated brief must declare Help/Guide impact as: required update or explicit N/A with reason."
      )
    ).toBeVisible();
    expect(screen.getByText("docs/runbooks/public-analytics-privacy-assessment.md")).toBeVisible();
    expect(screen.getByText("docs/runbooks/admin-email-template-governance.md")).toBeVisible();
  });
});
