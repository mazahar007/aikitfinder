"use client";

import { useEffect } from "react";

import { replaceCompareItems, type CompareItem } from "@/components/compare/compare-store";

/** Keeps the tray in step with the tools shown on /compare (the URL is the source of truth). */
export function SyncCompare({ items }: { items: CompareItem[] }) {
  const signature = items.map((i) => `${i.slug}:${i.name}`).join("|");
  useEffect(() => {
    replaceCompareItems(items);
    // `signature` captures the content of `items`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
  return null;
}
