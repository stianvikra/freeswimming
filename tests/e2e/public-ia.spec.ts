import { expect, test } from "@playwright/test";
import { gotoWithTransientRetry } from "./utils/transient-navigation";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Public IA e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
}

test.describe("public route IA", () => {
  test("keeps legacy about as a temporary alias for the canonical method page", async ({
    page,
    request,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    const redirect = await request.get("/about", {
      failOnStatusCode: false,
      maxRedirects: 0,
    });

    expect(redirect.status()).toBe(307);
    expect(redirect.headers().location).toBe("/our-method");

    await gotoWithTransientRetry(page, "/about");

    await expect(page).toHaveURL(/\/our-method$/);
    const heading = page.getByRole("heading", { name: "Our Method", exact: true });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveCSS("font-size", "56px");
    await expect(page.getByText("A free, step-by-step freestyle method for adults")).toBeVisible();
    await expect(page.getByRole("link", { name: "Start the free course" })).toHaveAttribute(
      "href",
      "/course"
    );
    await expect(page.getByRole("link", { name: "Ask a question" })).toHaveAttribute(
      "href",
      "/contact"
    );

    const learnCard = page.getByTestId("method-step-card-learn");
    await expect(learnCard).toBeVisible();
    await expect(learnCard).toHaveCSS("border-radius", "8px");
    await expect(page.getByRole("link", { name: "Start the free course" })).toHaveCSS(
      "border-radius",
      "8px"
    );
  });
});
