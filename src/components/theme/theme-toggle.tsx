"use client";

import { useLayoutEffect } from "react";
import { MoonIcon, SunIcon } from "lucide-react";

import { resolveTheme, themeStorageKey } from "@/components/theme/theme-script";
import { Button } from "@/components/ui/button";
import type { ProductId, Theme } from "@/config/products";
import { cn } from "@/lib/utils";

/** The product the page belongs to, as marked on <html> by the head script and ProductScope. */
function currentProduct(): ProductId {
  const value = document.documentElement.getAttribute("data-product");
  return value === "parent" || value === "autoflow" ? value : "directory";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

/**
 * The switching logic without any markup, so each product can render its own
 * control. Returns the click handler.
 */
export function useThemeToggle() {
  useLayoutEffect(() => {
    // Re-apply after React's dev-mode remount clears the attribute set by the
    // inline script. A no-op in production.
    applyTheme(resolveTheme(currentProduct()));

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(resolveTheme(currentProduct()));
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next: Theme = current === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(themeStorageKey(currentProduct()), next);
    } catch {
      // Storage can be unavailable (private mode); the switch still works for this visit.
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduceMotion) {
      applyTheme(next);
      return;
    }
    // Reveal the new theme in a circle growing from the button.
    const rect = event.currentTarget.getBoundingClientRect();
    root.style.setProperty("--theme-x", `${rect.left + rect.width / 2}px`);
    root.style.setProperty("--theme-y", `${rect.top + rect.height / 2}px`);
    root.classList.add("theme-switching");
    const transition = document.startViewTransition(() => applyTheme(next));
    transition.finished.finally(() => root.classList.remove("theme-switching"));
  }

  return toggle;
}

/**
 * Switches between light and dark for the current product only: each product
 * remembers its own choice. Until the visitor chooses, the Directory follows
 * the device setting (and keeps following it if it changes); the parent site
 * and AutoFlow start dark.
 * Both icons are rendered and CSS shows the right one, so the server and
 * client markup always match.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const toggle = useThemeToggle();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn("text-foreground", className)}
      title="Switch between light and dark theme"
    >
      <MoonIcon className="size-5! dark:hidden" aria-hidden="true" />
      <SunIcon className="hidden size-5! dark:block" aria-hidden="true" />
      <span className="sr-only">Switch between light and dark theme</span>
    </Button>
  );
}
