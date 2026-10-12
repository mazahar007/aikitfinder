/**
 * Small keyword matcher used for the Phase 2 prototype search. Phase 6
 * replaces it with PostgreSQL full-text search; the scoring idea (weighted
 * fields, every word should match) stays the same.
 */

const STOPWORDS = new Set(
  "a an and are as at be by can do for from how i in is it make me my of on or so the this to use using want what with you your".split(
    " ",
  ),
);

/** Lowercase, strip accents and punctuation. */
export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Very light stemming so "videos", "coding" and "images" match "video", "code", "image". */
export function stem(word: string) {
  let w = word;
  if (w.length >= 5) w = w.replace(/(ing|ers|ies|es|ed|er|s)$/, "");
  if (w.length >= 4) w = w.replace(/e$/, "");
  return w;
}

export function queryTerms(query: string): string[] {
  const words = normalize(query)
    .split(" ")
    .filter((w) => w && !STOPWORDS.has(w));
  return [...new Set(words.map(stem))];
}

export type WeightedField = { text: string | string[] | undefined; weight: number };

function fieldStems(text: WeightedField["text"]) {
  const joined = Array.isArray(text) ? text.join(" ") : (text ?? "");
  return normalize(joined).split(" ").filter(Boolean).map(stem);
}

export type MatchMode = "strict" | "relaxed";

/**
 * Scores a document against query terms; 0 means "not a match".
 * - strict: short queries (1–2 words) must match every word; longer ones 60%.
 * - relaxed: half of the words. Callers fall back to this when strict
 *   matching finds nothing, so natural-language queries still get results.
 */
export function scoreDocument(
  terms: string[],
  fields: WeightedField[],
  mode: MatchMode = "strict",
): number {
  if (terms.length === 0) return 0;
  const prepared = fields.map((f) => ({ stems: fieldStems(f.text), weight: f.weight }));
  let score = 0;
  let matched = 0;
  for (const term of terms) {
    let best = 0;
    for (const field of prepared) {
      for (const s of field.stems) {
        if (s === term) best = Math.max(best, field.weight);
        else if (term.length >= 3 && s.startsWith(term)) best = Math.max(best, field.weight * 0.6);
      }
    }
    if (best > 0) matched += 1;
    score += best;
  }
  const required =
    mode === "relaxed"
      ? Math.max(1, Math.ceil(terms.length / 2))
      : terms.length <= 2
        ? terms.length
        : Math.ceil(terms.length * 0.6);
  if (matched < required) return 0;
  // Reward documents that match more of the query.
  return score * (matched / terms.length);
}
