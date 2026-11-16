import type { Metadata } from "next";
import Link from "next/link";

import {
  EmptyRow,
  PageHeader,
  Panel,
  StatCard,
  formatDate,
  tableClass,
  tdClass,
  thClass,
} from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/access";
import { listTools, statusLabel, verificationLabel } from "@/lib/admin/catalog";

export const metadata: Metadata = { title: "AI Directory" };

const statuses = ["draft", "in-review", "published", "needs-update", "archived"] as const;

export default async function AdminDirectoryPage({ searchParams }: PageProps<"/admin/directory">) {
  await requireAdmin("catalog.write");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const status =
    typeof params.status === "string" && (statuses as readonly string[]).includes(params.status)
      ? params.status
      : "";
  const [tools, all] = await Promise.all([
    listTools(q, status),
    q || status ? listTools() : Promise.resolve(null),
  ]);
  const everything = all ?? tools;

  if (tools === null) {
    return (
      <>
        <PageHeader
          title="AI Directory"
          description="Tools, categories, pricing, sources and verification."
        />
        <p
          role="note"
          className="rounded-lg border border-warning/40 bg-warning-tint px-4 py-3 text-sm"
        >
          Directory management is not available on this database yet (migration 0011 has not been
          applied).
        </p>
      </>
    );
  }
  const count = (s: string) => (everything ?? []).filter((t) => t.status === s).length;

  return (
    <>
      <PageHeader
        title="AI Directory"
        description="Tools, categories, pricing, sources and verification. Only published tools appear on the public site."
      >
        <div className="flex gap-2">
          <Link
            href="/admin/directory/categories"
            className={buttonVariants({ variant: "secondary" })}
          >
            Categories
          </Link>
          <Link href="/admin/directory/tools/new" className={buttonVariants()}>
            Add tool
          </Link>
        </div>
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Tools" value={everything?.length ?? 0} />
        <StatCard label="Published" value={count("published")} />
        <StatCard label="Drafts" value={count("draft") + count("in-review")} />
        <StatCard
          label="Verified"
          value={(everything ?? []).filter((t) => t.verification === "verified").length}
        />
      </div>
      <form className="flex flex-wrap gap-2" role="search">
        <label htmlFor="tool-search" className="sr-only">
          Search tools
        </label>
        <input
          id="tool-search"
          name="q"
          defaultValue={q}
          placeholder="Search by name or address name"
          className="h-11 min-w-0 flex-1 rounded-md border border-input bg-card px-3 text-sm"
        />
        <label htmlFor="tool-status" className="sr-only">
          Status
        </label>
        <select
          id="tool-status"
          name="status"
          defaultValue={status}
          className="h-11 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {statusLabel[s]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-11 rounded-md border border-input bg-card px-4 text-sm font-semibold text-primary"
        >
          Filter
        </button>
      </form>
      <Panel>
        {tools.length === 0 ? (
          <EmptyRow>
            {q || status
              ? "No tool matches."
              : "No tools yet. Add the first real tool with its official sources."}
          </EmptyRow>
        ) : (
          <div className="relative overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Tool</th>
                  <th className={thClass}>Category</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Verification</th>
                  <th className={thClass}>Sources</th>
                  <th className={thClass}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((t) => (
                  <tr key={t.id}>
                    <td className={tdClass}>
                      <Link
                        href={`/admin/directory/tools/${t.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {t.name}
                      </Link>
                      {t.featured ? (
                        <Badge variant="info" className="ml-2">
                          Featured
                        </Badge>
                      ) : null}
                      {t.is_sample ? (
                        <Badge variant="warning" className="ml-2">
                          Sample
                        </Badge>
                      ) : null}
                      <p className="font-mono text-xs text-muted-foreground">{t.slug}</p>
                    </td>
                    <td className={tdClass}>{t.category ?? "—"}</td>
                    <td className={tdClass}>
                      <Badge
                        variant={
                          t.status === "published"
                            ? "success"
                            : t.status === "archived"
                              ? "neutral"
                              : "warning"
                        }
                      >
                        {statusLabel[t.status]}
                      </Badge>
                    </td>
                    <td className={tdClass}>
                      {verificationLabel[t.verification]}
                      {t.last_verified_at ? (
                        <p className="text-xs text-muted-foreground">{t.last_verified_at}</p>
                      ) : null}
                    </td>
                    <td className={tdClass}>{t.source_count}</td>
                    <td className={tdClass}>{formatDate(t.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <p className="text-sm text-muted-foreground">
        The public Directory still shows the labeled sample records from code. Switching it to read
        these database records is the next step.
      </p>
    </>
  );
}
