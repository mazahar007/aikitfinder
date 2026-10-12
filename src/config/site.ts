/**
 * Site-wide settings and navigation. Change labels or links here rather than
 * inside components so the header, footer and metadata stay consistent.
 */
/**
 * Public base URL. Set NEXT_PUBLIC_SITE_URL explicitly for the real domain;
 * otherwise fall back to the URL Vercel or Netlify provide at build time.
 */
function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.URL) return process.env.URL; // Netlify
  return "http://localhost:3000";
}

export const siteConfig = {
  name: "AIKitFinder",
  tagline: "Discover AI. Build Smarter.",
  description:
    "Find the right AI tools, learn how to use them, and put them to work with practical guides, settings explanations and workflows.",
  url: siteUrl(),
  /** Allow search engines to index the site. Turn on only for the real domain. */
  indexable: process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true",
} as const;

export type NavItem = { title: string; href: string };

export const mainNav: NavItem[] = [
  { title: "Explore Tools", href: "/tools" },
  { title: "Guides", href: "/guides" },
  { title: "Workflows", href: "/workflows" },
  { title: "Deals", href: "/deals" },
  { title: "About", href: "/about" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Explore",
    items: [
      { title: "AI tools", href: "/tools" },
      { title: "Categories", href: "/categories" },
      { title: "Guides", href: "/guides" },
      { title: "Workflows", href: "/workflows" },
      { title: "Deals", href: "/deals" },
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
