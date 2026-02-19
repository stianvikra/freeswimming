import { describe, expect, it } from "vitest";
import { getMainMenuItems } from "@/components/navigation/mainMenuItems";

describe("main menu items", () => {
  it("omits dashboard item by default", () => {
    const items = getMainMenuItems();
    expect(items.some((item) => item.href === "/admin")).toBe(false);
  });

  it("includes dashboard item for admin-aware menus", () => {
    const items = getMainMenuItems({ includeDashboard: true });
    const dashboardIndex = items.findIndex((item) => item.href === "/admin");
    const libraryIndex = items.findIndex((item) => item.href === "/my-library");
    const plansIndex = items.findIndex((item) => item.href === "/plans");

    expect(dashboardIndex).toBeGreaterThan(-1);
    expect(dashboardIndex).toBe(libraryIndex + 1);
    expect(dashboardIndex).toBeLessThan(plansIndex);
  });
});
