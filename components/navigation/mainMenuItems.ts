export type MainMenuItem = {
  href: string;
  title: string;
  subtitle: string;
};

export const MAIN_MENU_ITEMS: MainMenuItem[] = [
  { href: "/", title: "Home", subtitle: "Back to start" },
  { href: "/course", title: "Free Course", subtitle: "Modules & lessons" },
  { href: "/programs", title: "Swim Programs", subtitle: "Structured plans & PDFs" },
  { href: "/analysis", title: "Video Analysis", subtitle: "Personal feedback — optional" },
  { href: "/our-method", title: "Our Method", subtitle: "Learn. Drill. Swim." },
  { href: "/contact", title: "Contact", subtitle: "Questions or help" },
];
