"use client";

import { useLayoutEffect } from "react";

import { resolveTheme } from "@/components/theme/theme-script";
import type { ProductId } from "@/config/products";

/**
 * Marks which product the current page belongs to, on <html>, and applies that
 * product's theme. The inline head script does this on first load; this keeps
 * it correct when the visitor moves between products without a page reload.
 * Renders nothing.
 */
export function ProductScope({ product }: { product: ProductId }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-product", product);
    root.setAttribute("data-theme", resolveTheme(product));
  }, [product]);
  return null;
}
