import { ViewTransition } from "react";

/**
 * Unlike a layout, a template remounts on every navigation, so its
 * <ViewTransition> runs the page enter/exit animation (classes "page" in
 * motion.css). The header sits outside it and stays still.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
