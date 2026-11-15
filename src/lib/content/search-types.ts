/**
 * The shapes and labels of search results. Kept apart from the search itself
 * (search.ts, server only) so the results page can use them in the browser.
 */
import type { SkillLevel } from "@/lib/content/types";

export type SearchResultType =
  "tool" | "guide" | "workflow" | "prompt" | "setting" | "troubleshooting";

export type SearchResult = {
  type: SearchResultType;
  title: string;
  description: string;
  href: string;
  /** Extra context, e.g. which tool a setting belongs to. */
  context?: string;
  skillLevel?: SkillLevel;
  isSample: boolean;
  score: number;
};

export const searchGroupOrder: { type: SearchResultType; label: string }[] = [
  { type: "tool", label: "Tools" },
  { type: "guide", label: "Guides" },
  { type: "workflow", label: "Workflows" },
  { type: "prompt", label: "Prompts" },
  { type: "setting", label: "Settings explained" },
  { type: "troubleshooting", label: "Troubleshooting" },
];
