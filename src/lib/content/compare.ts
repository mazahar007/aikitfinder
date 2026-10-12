export const COMPARE_MIN = 2;
export const COMPARE_MAX = 4;

type RawParams = Record<string, string | string[] | undefined>;

const list = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value : value ? [value] : [])
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);

/**
 * Reads /compare URL parameters. `tools` is a comma-separated list of slugs;
 * `add` (from the picker form) is appended to it. Unknown slugs and duplicates
 * are dropped, and the list is capped at COMPARE_MAX.
 */
export function parseCompareParams(params: RawParams, validSlugs: string[]) {
  const wanted = [...list(params.tools), ...list(params.add)].filter(
    (slug, i, all) => validSlugs.includes(slug) && all.indexOf(slug) === i,
  );
  return {
    slugs: wanted.slice(0, COMPARE_MAX),
    truncated: wanted.length > COMPARE_MAX,
    differencesOnly: list(params.diff)[0] === "1",
  };
}

export function compareHref(slugs: string[], options: { differencesOnly?: boolean } = {}) {
  const params = new URLSearchParams();
  if (slugs.length) params.set("tools", slugs.join(","));
  if (options.differencesOnly) params.set("diff", "1");
  const qs = params.toString();
  return qs ? `/compare?${qs}` : "/compare";
}
