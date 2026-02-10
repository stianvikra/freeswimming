export type MainMenuItem = {
  href: string;
  title: string;
  subtitle: string;
};

export const MAIN_MENU_ITEMS: MainMenuItem[] = [
  { href: "/", title: "Home", subtitle: "Back to start" },
  { href: "/course", title: "Free course", subtitle: "Modules & lessons" },
  { href: "/programs", title: "Swim programs", subtitle: "Structured plans & PDFs" },
  { href: "/analysis", title: "Video analysis", subtitle: "Personal feedback — optional" },
  { href: "/how-we-teach", title: "How we teach", subtitle: "Learn. Drill. Swim." },
  { href: "/contact", title: "Contact", subtitle: "Questions or help" },
];
