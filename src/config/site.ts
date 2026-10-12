/**
 * Site-wide settings and navigation. Change labels or links here rather than
 * inside components so the header, footer and metadata stay consistent.
 */
export const siteConfig = {
  name: "AIKitFinder",
  tagline: "Discover AI. Build Smarter.",
  description:
    "Find the right AI tools, learn how to use them, and put them to work with practical guides, settings explanations and workflows.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export type NavItem = { title: string; href: string };

export const mainNav: NavItem[] = [
  { title: "Explore Tools", href: "/tools" },
  { title: "Guides", href: "/guides" },
  { title: "Workflows", href: "/workflows" },
  { title: "About", href: "/about" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Explore",
    items: [
      { title: "AI tools", href: "/tools" },
      { title: "Guides", href: "/guides" },
      { title: "Workflows", href: "/workflows" },
      { title: "Search", href: "/search" },
    ],
  },
  {
    title: "AIKitFinder",
    items: [
      { title: "About", href: "/about" },
      { title: "Editorial policy", href: "/editorial-policy" },
      { title: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    items: [
      { title: "Privacy", href: "/privacy" },
      { title: "Terms", href: "/terms" },
    ],
  },
];
