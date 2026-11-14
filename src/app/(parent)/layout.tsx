import { ParentEffects } from "@/components/parent/effects";
import { ParentSprite } from "@/components/parent/sprite";
import { ProductScope } from "@/components/product/product-scope";

import "@/styles/parent.css";

/**
 * AIKitFinder parent site shell. It carries the parent identity (dark navy,
 * violet, restrained pink) and nothing from the Directory or AutoFlow. The
 * header and footer are added by the pages, because the homepage's header
 * also holds the Pause control for its hero animation.
 */
export default function ParentLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="akf-parent akf-parent-page">
      <ProductScope product="parent" />
      <ParentSprite />
      <ParentEffects />
      {children}
    </div>
  );
}
