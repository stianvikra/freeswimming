import { expect, test } from "@playwright/test";

test("main menu exposes a persistent install action", async ({ page }) => {
  await page.goto("/course?lesson=mod3-l1");

  await page.getByTestId("course-nav-lessons").click();
  await page.getByRole("button", { name: "Menu", exact: true }).click();

  await expect(page.getByTestId("install-app-menu-action")).toBeVisible();
});

test("first successful mark-as-done can trigger contextual install prompt once", async ({
  page,
}) => {
  await page.goto("/course?lesson=mod3-l1");

  await page.evaluate(() => {
    localStorage.removeItem("a2hs_prompt_seen");
    localStorage.removeItem("a2hs_dismissed_at");
    localStorage.removeItem("fs_course_done_lessons");

    const installEvent = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
      prompt?: () => Promise<void>;
      userChoice?: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
    };

    installEvent.prompt = async () => {};
    installEvent.userChoice = Promise.resolve({
      outcome: "dismissed",
      platform: "web",
    });

    window.dispatchEvent(installEvent);
  });

  await page.getByRole("button", { name: "Mark as done" }).click();

  const prompt = page.getByTestId("a2hs-auto-prompt");
  await expect(prompt).toBeVisible({ timeout: 4_500 });

  await page.getByRole("button", { name: "Not now" }).click();
  await expect(prompt).toBeHidden();

  await page.getByRole("button", { name: "Done" }).click();
  await page.getByRole("button", { name: "Mark as done" }).click();
  await page.waitForTimeout(1_900);
  await expect(prompt).toBeHidden();
});
