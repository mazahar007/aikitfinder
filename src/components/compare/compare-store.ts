"use client";

import { useSyncExternalStore } from "react";

import { COMPARE_MAX } from "@/lib/content/compare";

/**
 * The tools a visitor has picked for comparison, kept for the browser tab
 * (sessionStorage) so the picks survive navigation but not a new session.
 * Nothing is sent anywhere. If storage is blocked the picks still work until
 * the page is reloaded.
 */
export type CompareItem = { slug: string; name: string };

const KEY = "aikitfinder:compare";
const EMPTY: CompareItem[] = [];

let items: CompareItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function isItem(value: unknown): value is CompareItem {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as CompareItem).slug === "string" &&
    typeof (value as CompareItem).name === "string"
  );
}

function load() {
  loaded = true;
  try {
    const parsed: unknown = JSON.parse(window.sessionStorage.getItem(KEY) ?? "[]");
    const valid = Array.isArray(parsed) ? parsed.filter(isItem).slice(0, COMPARE_MAX) : [];
    items = valid.length ? valid : EMPTY;
  } catch {
    items = EMPTY;
  }
}

function setItems(next: CompareItem[]) {
  items = next.length ? next.slice(0, COMPARE_MAX) : EMPTY;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Storage blocked: keep the picks in memory only.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (!loaded) load();
  return items;
}

export function useCompareItems() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function toggleCompareItem(item: CompareItem) {
  const current = getSnapshot();
  if (current.some((i) => i.slug === item.slug)) {
    setItems(current.filter((i) => i.slug !== item.slug));
  } else if (current.length < COMPARE_MAX) {
    setItems([...current, item]);
  }
}

export function removeCompareItem(slug: string) {
  setItems(getSnapshot().filter((i) => i.slug !== slug));
}

export function replaceCompareItems(next: CompareItem[]) {
  setItems(next);
}

export function clearCompareItems() {
  setItems(EMPTY);
}
