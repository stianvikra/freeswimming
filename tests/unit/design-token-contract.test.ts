import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readGlobalsCss() {
  return readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
}

describe("design token foundation", () => {
  it("defines the first shared visual token contract", () => {
    const css = readGlobalsCss();

    expect(css).toContain("--fs-color-brand-700");
    expect(css).toContain("--fs-color-emerald-700");
    expect(css).toContain("--fs-color-cyan-700");
    expect(css).toContain("--fs-text-display");
    expect(css).toContain("--fs-space-card");
    expect(css).toContain("--fs-radius-card: 8px");
    expect(css).toContain("--fs-radius-control: 8px");
    expect(css).toContain("--fs-shadow-card");
  });

  it("exposes reusable token-backed proof utilities", () => {
    const css = readGlobalsCss();

    expect(css).toContain(".fs-surface-card");
    expect(css).toContain(".fs-method-step-card");
    expect(css).toContain(".fs-method-step-badge");
    expect(css).toContain(".fs-method-proof-pill");
    expect(css).toContain(".fs-program-card");
    expect(css).toContain(".fs-program-card-highlight");
    expect(css).toContain(".fs-library-card");
    expect(css).toContain(".fs-library-card-accent");
    expect(css).toContain(".fs-library-card-muted");
    expect(css).toContain(".fs-cta-primary");
    expect(css).toContain(".fs-cta-secondary");
    expect(css).toContain(".fs-tone-blue");
    expect(css).toContain(".fs-tone-emerald");
    expect(css).toContain(".fs-tone-cyan");
  });
});
