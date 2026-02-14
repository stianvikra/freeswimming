import type { TestInfo } from "@playwright/test";

export function isMobileProject(testInfo: TestInfo) {
  return testInfo.project.name.startsWith("mobile-");
}

export function isDesktopProject(testInfo: TestInfo) {
  return testInfo.project.name.startsWith("desktop-");
}

export function isDesktopOrTabletProject(testInfo: TestInfo) {
  const name = testInfo.project.name;
  return name.startsWith("desktop-") || name.startsWith("tablet-");
}
