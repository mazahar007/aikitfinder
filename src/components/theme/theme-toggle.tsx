"use client";

import { useLayoutEffect } from "react";
import { MoonIcon, SunIcon } from "lucide-react";

import { THEME_STORAGE_KEY } from "@/components/theme/theme-script";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

/**
 * Switches between light and dark. Until the visitor chooses, the site
 * follows the device setting (and keeps following it if it changes).
 * Both icons are rendered and CSS shows the right one, so the server and
 * client markup always match.
 */
export function ThemeToggle() {
  useLayoutEffect(() => {
    // Re-apply after React's dev-mode remount clears the attribute set by the
    // inline script. A no-op in production.
    applyTheme(storedTheme() ?? systemTheme());

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!storedTheme()) applyTheme(systemTheme());
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next: Theme = current === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
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

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="text-foreground"
      title="Switch between light and dark theme"
    >
      <MoonIcon className="size-5! dark:hidden" aria-hidden="true" />
      <SunIcon className="hidden size-5! dark:block" aria-hidden="true" />
      <span className="sr-only">Switch between light and dark theme</span>
    </Button>
  );
}
