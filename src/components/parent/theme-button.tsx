"use client";

import { useThemeToggle } from "@/components/theme/theme-toggle";

/** The parent site's light/dark control, in the approved icon-button style. */
export function ParentThemeButton() {
  const toggle = useThemeToggle();
  return (
    <button
      type="button"
      className="icon-btn theme"
      onClick={toggle}
      title="Switch between light and dark theme"
    >
      <svg aria-hidden="true">
        <use href="#i-sun" />
      </svg>
      <span className="sr">Switch between light and dark theme</span>
    </button>
  );
}
