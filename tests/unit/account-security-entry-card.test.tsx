import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import AccountSecurityEntryCard from "@/components/my-library/security/AccountSecurityEntryCard";

describe("AccountSecurityEntryCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the current email-code contract and the security entry link", () => {
    render(<AccountSecurityEntryCard />);

    expect(screen.getByTestId("account-security-entry-card")).toHaveTextContent(
      "Email code is the active sign-in method today"
    );
    expect(screen.getByTestId("account-security-entry-card")).toHaveTextContent("Email code today");
    expect(screen.getByRole("link", { name: "Open Account & Security" })).toHaveAttribute(
      "href",
      "/my-library/security"
    );
    expect(screen.queryByText(/add passkey/i)).not.toBeInTheDocument();
  });
});
