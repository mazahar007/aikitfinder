/**
 * The three experiences under the AIKitFinder brand. One shared account,
 * separate navigation, identity and data per product.
 */
export type ProductId = "parent" | "directory" | "autoflow";
export type Theme = "light" | "dark";

export type ProductStatus = {
  /** Short label shown on status pills. Change it here when the product's state changes. */
  label: string;
  available: boolean;
};

export const products = {
  parent: {
    id: "parent",
    name: "AIKitFinder",
    home: "/",
    /** Dark by default; the visitor may switch (owner decision F-02). */
    defaultTheme: "dark" as Theme | "system",
    themeKey: "theme-parent",
  },
  directory: {
    id: "directory",
    name: "AI Tools Directory",
    home: "/directory",
    tagline: "Find and compare AI tools",
    /** Follows the saved choice, then the operating system. */
    defaultTheme: "system" as Theme | "system",
    /** Kept as "theme" so existing visitors keep their saved choice. */
    themeKey: "theme",
    status: { label: "Available · sample data", available: true } satisfies ProductStatus,
  },
  autoflow: {
    id: "autoflow",
    name: "AutoFlow AI",
    home: "/autoflow",
    tagline: "Plan and produce video content",
    defaultTheme: "dark" as Theme | "system",
    themeKey: "theme-autoflow",
    status: { label: "In development", available: false } satisfies ProductStatus,
  },
} as const;

/** Top-level paths that belong to the parent site. Everything else that is not AutoFlow is Directory. */
export const parentPaths = ["about", "contact", "privacy", "terms", "editorial-policy"] as const;

export function productForPath(pathname: string): ProductId {
  if (
    pathname === "/" ||
    parentPaths.some((p) => pathname === `/${p}` || pathname.startsWith(`/${p}/`))
  )
    return "parent";
  if (pathname === "/autoflow" || pathname.startsWith("/autoflow/")) return "autoflow";
  return "directory";
}
