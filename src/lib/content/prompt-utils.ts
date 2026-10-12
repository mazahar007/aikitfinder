import type { PromptVariable } from "@/lib/content/types";

const PLACEHOLDER = /\[([^\]\n]+)\]/g;

/** Names of the [blanks] in a prompt, in order of first appearance. */
export function placeholderNames(text: string): string[] {
  const names: string[] = [];
  for (const match of text.matchAll(PLACEHOLDER)) {
    if (!names.includes(match[1])) names.push(match[1]);
  }
  return names;
}

/**
 * One entry per blank in the text, in text order. Declared descriptions are
 * kept; a blank nobody described still gets a generic one, so the fill-in form
 * always matches the prompt.
 */
export function promptVariables(text: string, declared: PromptVariable[]): PromptVariable[] {
  return placeholderNames(text).map(
    (name) =>
      declared.find((v) => v.name === name) ?? {
        name,
        description: "Replace this with your own details.",
      },
  );
}

/** Replaces each [name] that has a non-empty value; other blanks stay as they are. */
export function fillPrompt(text: string, values: Record<string, string>): string {
  return text.replace(PLACEHOLDER, (whole, name: string) => {
    const value = values[name]?.trim();
    return value ? value : whole;
  });
}

/** How many of the prompt's distinct blanks have a value. */
export function filledCount(names: string[], values: Record<string, string>) {
  return names.filter((n) => values[n]?.trim()).length;
}
