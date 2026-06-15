import { expect, test, type Page } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin users overview e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

function skipForUnexpectedDevLoginDestination(destination: URL): void {
  if (destination.pathname === "/auth/sign-in") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }
  if (destination.pathname === "/preview-access") {
    test.skip(true, "Site lock is enabled; dev-login did not reach /admin.");
  }

  test.skip(true, `Dev login redirected to unexpected path (${destination.pathname}).`);
}

async function openAllowlistedAdmin(page: Page): Promise<void> {
  await page.goto(`/dev/login?next=${encodeURIComponent("/admin?tab=users")}`);
  const destinationAfterDevLogin = new URL(page.url());

  if (destinationAfterDevLogin.pathname !== "/admin") {
    skipForUnexpectedDevLoginDestination(destinationAfterDevLogin);
  }

  const noAccessHeading = page.getByRole("heading", { name: "You don't have access" });
  if (await noAccessHeading.isVisible().catch(() => false)) {
    test.skip(true, "Dev bypass account is signed in but not allowlisted/admin.");
  }

  await expect(page.getByRole("heading", { name: "Admin console" })).toBeVisible();
}

test.describe("admin users overview", () => {
  test.beforeEach(({ browserName }, testInfo) => {
    test.skip(browserName !== "chromium", "Admin users overview e2e uses Chromium only.");
    runOnceOnDesktopChromium(testInfo.project.name);
  });

  test("renders mocked read-only users overview without private details", async ({ page }) => {
    await page.route("**/api/admin/users/overview**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          generatedAt: "2026-06-15T12:00:00.000Z",
          query: {
            search: "",
            role: "all",
            sort: "updated_desc",
            page: 1,
            pageSize: 25,
          },
          summary: {
            totalUsers: 1,
            visibleUsers: 1,
            usersWithAccess: 1,
            usersWithoutAccess: 0,
            adminUsers: 0,
            editorUsers: 0,
            viewerUsers: 1,
            unknownRoleUsers: 0,
            partialSummary: false,
          },
          pageInfo: {
            page: 1,
            pageSize: 25,
            totalCount: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          },
          items: [
            {
              id: "user-1",
              email: "swimmer@example.com",
              role: "viewer",
              createdAt: "2026-06-01T08:00:00.000Z",
              updatedAt: "2026-06-10T08:00:00.000Z",
              accessStatus: "active",
              entitlementCount: 1,
              products: [
                {
                  id: "guide_poolside",
                  title: "Poolside Guide",
                  kind: "guide",
                  active: true,
                  known: true,
                },
              ],
              latestGrantedAt: "2026-06-11T09:00:00.000Z",
              lastActivityAt: "2026-06-12T10:00:00.000Z",
              lastActivitySource: "product_activity",
              supportCodes: [],
            },
          ],
          warnings: [],
        }),
      });
    });

    await openAllowlistedAdmin(page);

    await expect(page.getByTestId("admin-tab-users")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("admin-users-manager")).toBeVisible();
    await expect(page.getByTestId("admin-users-row-user-1")).toContainText("swimmer@example.com");
    await expect(page.getByTestId("admin-users-detail-panel")).toContainText("Poolside Guide");
    await expect(page.getByTestId("admin-users-privacy-boundary")).toContainText(
      "raw analytics payloads"
    );
    await expect(page.getByText("stripe_checkout_session")).toHaveCount(0);
    await expect(page.getByText("habit name")).toHaveCount(0);
  });
});
