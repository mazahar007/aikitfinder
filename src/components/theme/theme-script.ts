import { parentPaths, products, type ProductId, type Theme } from "@/config/products";

/** Each product remembers its own light/dark choice (owner decision F-02). */
export function themeStorageKey(product: ProductId): string {
  return products[product].themeKey;
}

/** Kept for existing imports: the Directory's key. */
export const THEME_STORAGE_KEY = products.directory.themeKey;

/** The theme to show for a product: the saved choice, else the product's default. Client only. */
export function resolveTheme(product: ProductId): Theme {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(themeStorageKey(product));
  } catch {
    // Storage can be unavailable (private mode).
  }
  if (saved === "light" || saved === "dark") return saved;
  const fallback = products[product].defaultTheme;
  if (fallback !== "system") return fallback;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Runs in <head> before the first paint so no page flashes the wrong theme.
 * It works out which product the URL belongs to, then applies that product's
 * saved choice or default. Built from the same registry as `productForPath`.
 */
const keys = JSON.stringify({
  parent: products.parent.themeKey,
  directory: products.directory.themeKey,
  autoflow: products.autoflow.themeKey,
});
const darkDefault = JSON.stringify({
  parent: products.parent.defaultTheme === "dark",
  directory: false,
  autoflow: products.autoflow.defaultTheme === "dark",
});
export const themeInitScript = `(function(){try{var p=location.pathname,r=/^\\/(${parentPaths.join("|")})(\\/|$)/,m=p==="/"||r.test(p)?"parent":/^\\/autoflow(\\/|$)/.test(p)?"autoflow":"directory",k=${keys},f=${darkDefault},s=localStorage.getItem(k[m]),d=s==="dark"||(s!=="light"&&(f[m]||(m==="directory"&&matchMedia("(prefers-color-scheme: dark)").matches))),e=document.documentElement;e.setAttribute("data-product",m);e.setAttribute("data-theme",d?"dark":"light")}catch(e){}})()`;
