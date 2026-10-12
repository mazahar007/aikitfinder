import Link from "next/link";
import type { ReactNode } from "react";
import { CircleHelpIcon, ExternalLinkIcon, XIcon } from "lucide-react";

import { LevelBadge, SampleBadge, VerificationBadge } from "@/components/content/badges";
import { ToolLogo } from "@/components/content/tool-logo";
import { compareHref } from "@/lib/content/compare";
import { formatDate, platformLabel, pricingLabel } from "@/lib/content/labels";
import type { Category, Tool } from "@/lib/content/types";

/**
 * Side-by-side facts. There are no scores, ratings or winners: each cell shows
 * what we have verified, or says it is not verified yet. Every row gives a
 * `key` (plain text) so we can tell whether the tools differ on that row.
 */
type Cell = { key: string; node: ReactNode };
type Row = { label: string; cell: (tool: Tool) => Cell };
type Group = { title: string; rows: Row[] };

function Unknown() {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground italic">
      <CircleHelpIcon className="size-3.5 shrink-0" aria-hidden="true" />
      Not verified yet
    </span>
  );
}

const unknown: Cell = { key: "", node: <Unknown /> };

const text = (value?: string): Cell => (value ? { key: value, node: value } : unknown);

function bullets(items: string[], max: number): Cell {
  if (!items.length) return unknown;
  const shown = items.slice(0, max);
  return {
    key: shown.join("|"),
    node: (
      <ul className="list-disc space-y-1 pl-4">
        {shown.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ),
  };
}

function externalLink(href: string | undefined, label: string): Cell {
  if (!href) return unknown;
  return {
    key: href,
    node: (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
      >
        {label}
        <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    ),
  };
}

function groups(categories: Category[]): Group[] {
  const categoryName = (slug?: string) =>
    categories.find((c) => c.slug === slug)?.name.replace(/^AI /, "");
  return [
    {
      title: "Overview",
      rows: [
        { label: "Category", cell: (t) => text(categoryName(t.categorySlugs[0])) },
        {
          label: "Skill level",
          cell: (t) => ({ key: t.skillLevel, node: <LevelBadge level={t.skillLevel} /> }),
        },
        { label: "Best for", cell: (t) => text(t.useCases[0]) },
        { label: "Who it’s for", cell: (t) => text(t.audience.join(", ")) },
      ],
    },
    {
      title: "Pricing",
      rows: [
        {
          label: "Pricing model",
          cell: (t) => text(t.pricingModel ? pricingLabel[t.pricingModel] : undefined),
        },
        { label: "Free plan", cell: (t) => text(t.freePlan) },
        { label: "Free trial", cell: (t) => text(t.freeTrial) },
        {
          label: "Pricing note",
          cell: (t) =>
            t.pricingNote
              ? {
                  key: t.pricingNote.text,
                  node: (
                    <>
                      {t.pricingNote.text}
                      {t.pricingNote.checkedAt ? (
                        <span className="block text-xs text-muted-foreground">
                          Checked {formatDate(t.pricingNote.checkedAt)}
                        </span>
                      ) : null}
                    </>
                  ),
                }
              : unknown,
        },
      ],
    },
    {
      title: "Platforms and API",
      rows: [
        {
          label: "Platforms",
          cell: (t) => text(t.platforms?.map((p) => platformLabel[p]).join(", ")),
        },
        {
          label: "Public API",
          cell: (t) => {
            if (t.apiAvailable === undefined) return unknown;
            const label = t.apiAvailable ? "Available" : "No public API";
            return {
              key: label,
              node: (
                <>
                  {label}
                  {t.apiNotes ? (
                    <span className="block text-xs text-muted-foreground">{t.apiNotes}</span>
                  ) : null}
                </>
              ),
            };
          },
        },
        { label: "Official docs", cell: (t) => externalLink(t.docsUrl, "Documentation") },
      ],
    },
    {
      title: "What it does",
      rows: [
        { label: "Inputs", cell: (t) => bullets(t.inputs, 4) },
        { label: "Outputs", cell: (t) => bullets(t.outputs, 4) },
        { label: "Key features", cell: (t) => bullets(t.features, 4) },
        { label: "Limitations", cell: (t) => bullets(t.limitations, 3) },
      ],
    },
    {
      title: "Trust",
      rows: [
        {
          label: "Information",
          cell: (t) => ({
            key: `${t.verification}|${t.lastVerifiedAt ?? ""}`,
            node: <VerificationBadge status={t.verification} date={t.lastVerifiedAt} />,
          }),
        },
        { label: "Official site", cell: (t) => externalLink(t.officialUrl, "Visit site") },
        {
          label: "Sources",
          cell: (t) =>
            t.sources.length
              ? {
                  key: t.sources.map((s) => s.url).join("|"),
                  node: (
                    <ul className="space-y-1">
                      {t.sources.slice(0, 2).map((s) => (
                        <li key={s.url}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="font-medium text-primary hover:underline"
                          >
                            {s.title}
                            <span className="sr-only"> (opens in a new tab)</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ),
                }
              : unknown,
        },
      ],
    },
  ];
}

export function CompareTable({
  tools,
  categories,
  differencesOnly,
}: {
  tools: Tool[];
  categories: Category[];
  differencesOnly: boolean;
}) {
  const slugs = tools.map((t) => t.slug);
  const tableGroups = groups(categories).map((group) => {
    const rows = group.rows
      .map((row) => {
        const cells = tools.map((t) => row.cell(t));
        const same = cells.every((c) => c.key === cells[0].key);
        return { label: row.label, cells, same };
      })
      .filter((row) => !differencesOnly || !row.same);
    return { title: group.title, rows };
  });
  const hiddenAll = differencesOnly && tableGroups.every((g) => g.rows.length === 0);

  if (hiddenAll) {
    return (
      <p className="rounded-md border bg-card p-6 text-muted-foreground" role="status">
        These tools have the same verified details on every row. Show all rows to see them.
      </p>
    );
  }

  return (
    <div
      role="region"
      aria-labelledby="compare-caption"
      tabIndex={0}
      // `relative` keeps screen-reader-only text (absolutely positioned) inside
      // this scroller; otherwise it can widen the whole page on small screens.
      className="relative overflow-x-auto rounded-lg border bg-card"
    >
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <caption id="compare-caption" className="sr-only">
          Side-by-side comparison of {tools.map((t) => t.name).join(", ")}
        </caption>
        <thead>
          <tr className="border-b">
            <td className="sticky left-0 z-10 w-32 bg-card p-3 sm:w-44" />
            {tools.map((t) => (
              <th key={t.slug} scope="col" className="min-w-48 p-3 align-top font-normal">
                <div className="flex items-start gap-3">
                  <ToolLogo name={t.name} />
                  <div className="min-w-0">
                    <Link
                      href={`/tools/${t.slug}`}
                      className="font-semibold text-heading hover:text-primary"
                    >
                      {t.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.shortDescription}</p>
                    {t.isSample ? (
                      <span className="mt-1.5 inline-block">
                        <SampleBadge />
                      </span>
                    ) : null}
                    <Link
                      href={compareHref(
                        slugs.filter((s) => s !== t.slug),
                        { differencesOnly },
                      )}
                      className="mt-1.5 inline-flex min-h-8 items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      <XIcon className="size-3.5" aria-hidden="true" />
                      Remove<span className="sr-only"> {t.name}</span>
                    </Link>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        {tableGroups.map((group) =>
          group.rows.length ? (
            <tbody key={group.title}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={tools.length + 1}
                  className="sticky left-0 bg-surface-subtle px-3 py-2 text-xs font-semibold tracking-wide text-heading uppercase"
                >
                  {group.title}
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.label} className="border-t align-top">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 w-32 bg-card p-3 font-medium text-heading sm:w-44"
                  >
                    {row.label}
                  </th>
                  {row.cells.map((cell, i) => (
                    <td key={tools[i].slug} className="p-3 text-foreground">
                      {cell.node}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ) : null,
        )}
      </table>
    </div>
  );
}
