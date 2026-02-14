import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PressButton from "@/components/ui/PressButton";

describe("PressButton", () => {
  it("defaults to button type and nav tier classes", () => {
    render(<PressButton>Send</PressButton>);
    const button = screen.getByRole("button", { name: "Send" });

    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("ui-press-tier-nav");
  });

  it("applies disabled semantics with ariaDisabled", () => {
    render(<PressButton ariaDisabled>Continue</PressButton>);
    const button = screen.getByRole("button", { name: "Continue" });

    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveClass("ui-disabled");
  });
});
