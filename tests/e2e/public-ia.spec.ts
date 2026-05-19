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

  test("keeps programs cards token-backed with clear CTA destinations", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await gotoWithTransientRetry(page, "/programs");

    await expect(page.getByRole("heading", { name: "Swim Programs", exact: true })).toBeVisible();
    await expect(
      page.getByTestId("programs-hero-lockup").getByText("Learn. Drill. Swim.")
    ).toBeVisible();

    const poolsideCard = page.getByTestId("program-card-poolside-pdf");
    const analysisCard = page.getByTestId("program-card-video-analysis");

    await expect(poolsideCard.getByRole("heading", { name: "Poolside PDF Guide" })).toBeVisible();
    await expect(
      analysisCard.getByRole("heading", { name: "Video Analysis", exact: true })
    ).toBeVisible();
    await expect(poolsideCard).toHaveCSS("border-radius", "8px");
    await expect(analysisCard).toHaveCSS("border-radius", "8px");
    await expect(
      poolsideCard
        .getByTestId("program-card-poolside-pdf-proof")
        .getByText("What the Poolside PDF shows")
    ).toBeVisible();
    await expect(poolsideCard.getByText("Pool cue")).toBeVisible();
    await expect(
      poolsideCard.getByText("It is a compact practice guide, not a custom coaching report.")
    ).toBeVisible();
    await expect(
      analysisCard
        .getByTestId("program-card-video-analysis-proof")
        .getByText("What the feedback reply includes")
    ).toBeVisible();
    await expect(analysisCard.getByText("Next swim")).toBeVisible();
    await expect(
      analysisCard.getByText("The exact feedback depends on the clip and context you send.")
    ).toBeVisible();

    const pdfCta = poolsideCard.getByRole("link", { name: "Join PDF waitlist" });
    const analysisCta = analysisCard.getByRole("link", { name: "Get feedback" });

    await expect(pdfCta).toHaveAttribute("href", "/contact");
    await expect(analysisCta).toHaveAttribute("href", "/analysis");
    await expect(pdfCta).toHaveCSS("border-radius", "8px");
    await expect(analysisCta).toHaveCSS("border-radius", "8px");
    await expect(page.getByText("GET PDF UPDATES")).toHaveCount(0);
  });

  test("keeps contact and analysis request guidance clear", async ({ page }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await gotoWithTransientRetry(page, "/contact");

    await expect(page.getByRole("heading", { name: "Contact", exact: true })).toBeVisible();
    await expect(
      page.getByTestId("contact-trust-strip").getByText("Reply by email", { exact: true })
    ).toBeVisible();
    await expect(page.getByText("Usually 24–48 hours")).toBeVisible();
    await expect(page.getByText("No payment details, passwords, or sign-in codes")).toBeVisible();

    const contactFormCard = page.getByTestId("contact-form-card");
    await expect(contactFormCard).toHaveCSS("border-radius", "8px");
    await expect(contactFormCard.getByRole("button", { name: "Send message" })).toHaveCSS(
      "border-radius",
      "8px"
    );

    await gotoWithTransientRetry(page, "/analysis");

    await expect(page.getByRole("heading", { name: "Video Analysis", exact: true })).toBeVisible();
    const analysisBrandMark = page.getByTestId("analysis-intro-brand-mark").locator("img");
    await expect(analysisBrandMark).toBeVisible();
    const analysisBrandMetrics = await analysisBrandMark.evaluate((img: HTMLImageElement) => {
      const box = img.getBoundingClientRect();
      return {
        naturalRatio: img.naturalWidth / img.naturalHeight,
        renderedRatio: box.width / box.height,
      };
    });
    expect(
      Math.abs(analysisBrandMetrics.renderedRatio - analysisBrandMetrics.naturalRatio),
      "analysis intro brand mark should render without vertical or horizontal squeeze"
    ).toBeLessThan(0.05);
    await expect(
      page.getByText("Send a short clip and get one clear technical priority by email.")
    ).toBeVisible();
    await expect(page.getByText("Send the smallest useful sample")).toBeVisible();
    await expect(page.getByText("What the analysis reply looks like")).toBeVisible();
    await expect(page.getByText("Next pool task")).toBeVisible();
    await expect(
      page.getByText(
        "The final reply depends on the clip and context you send; we do not need payment details or private medical information."
      )
    ).toBeVisible();
    await expect(page.getByText("No payment details, passwords, or sign-in codes")).toBeVisible();

    const analysisFormCard = page.getByTestId("analysis-form-card");
    await expect(analysisFormCard).toHaveCSS("border-radius", "8px");
    await expect(analysisFormCard.getByRole("button", { name: "Send" })).toHaveCSS(
      "border-radius",
      "8px"
    );
  });
});
