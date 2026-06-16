import { buildCourseOverviewPath } from "@/lib/course/canonical-routes";

export type MainMenuItem = {
  href: string;
  title: string;
  subtitle: string;
};

const BASE_MAIN_MENU_ITEMS: MainMenuItem[] = [
  { href: "/", title: "Home", subtitle: "Back to start" },
  { href: buildCourseOverviewPath(), title: "Free Course", subtitle: "Modules & lessons" },
  { href: "/my-library", title: "My Library", subtitle: "Owned content & resume" },
  { href: "/plans", title: "Plans", subtitle: "Paid guides & feedback" },
  { href: "/programs", title: "Swim Programs", subtitle: "Structured plans & PDFs" },
  { href: "/analysis", title: "Video Analysis", subtitle: "Personal feedback — optional" },
  { href: "/our-method", title: "Our Method", subtitle: "Learn. Drill. Swim." },
  { href: "/contact", title: "Contact", subtitle: "Questions or help" },
];

const DASHBOARD_MENU_ITEM: MainMenuItem = {
  href: "/admin",
  title: "Dashboard",
  subtitle: "Content, commerce, and ops",
};

export function getMainMenuItems(options?: { includeDashboard?: boolean }): MainMenuItem[] {
  if (!options?.includeDashboard) {
    return BASE_MAIN_MENU_ITEMS;
  }

  return [
    ...BASE_MAIN_MENU_ITEMS.slice(0, 3),
    DASHBOARD_MENU_ITEM,
    ...BASE_MAIN_MENU_ITEMS.slice(3),
  ];
}

export const MAIN_MENU_ITEMS = getMainMenuItems();
