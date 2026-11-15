import type { Metadata } from "next";

import { ProductScope } from "@/components/product/product-scope";
import { products } from "@/config/products";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    default: `${products.autoflow.name} | ${siteConfig.name}`,
    template: `%s | ${products.autoflow.name}`,
  },
};

/**
 * AutoFlow AI shell: the dark studio identity. The public pages and the
 * workspace add their own header and navigation.
 */
export default function AutoflowLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="akf-autoflow flex min-h-dvh flex-1 flex-col bg-background text-foreground">
      <ProductScope product="autoflow" />
      {children}
    </div>
  );
}
