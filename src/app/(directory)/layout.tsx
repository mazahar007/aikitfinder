import { Suspense } from "react";
import type { Metadata } from "next";

import { CompareTray } from "@/components/compare/compare-tray";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PointerSpotlight } from "@/components/motion/pointer-spotlight";
import { ProductScope } from "@/components/product/product-scope";
import { products } from "@/config/products";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    default: `${products.directory.name} | ${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },
};

/**
 * AI Tools Directory shell: its own header, search, footer and compare tray.
 * Nothing here is shared with the parent site or AutoFlow except the account.
 */
export default function DirectoryLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <ProductScope product="directory" />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter />
      <PointerSpotlight />
      {/* Reads the URL (to hide itself on /compare), so it streams in. */}
      <Suspense fallback={null}>
        <CompareTray />
      </Suspense>
    </>
  );
}
