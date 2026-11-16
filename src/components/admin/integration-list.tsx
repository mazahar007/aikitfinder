import Link from "next/link";

import { EmptyRow, Panel, StatusBadge, tableClass, tdClass, thClass } from "@/components/admin/ui";
import type { IntegrationRecord } from "@/lib/admin/data";
import {
  categoryLabel,
  integrationByKey,
  type IntegrationCategory,
} from "@/lib/integrations/registry";

/** A table of integration records with their real status. Used by the integrations page and the section pages. */
export function IntegrationList({
  records,
  title,
}: {
  records: IntegrationRecord[];
  title?: string;
}) {
  return (
    <Panel title={title}>
      {records.length === 0 ? (
        <EmptyRow>
          No integration records were found. The integrations migration may not have been applied to
          this database yet.
        </EmptyRow>
      ) : (
        <div className="relative overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Dependency</th>
                <th className={thClass}>Area</th>
                <th className={thClass}>Provider</th>
                <th className={thClass}>Enabled</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const def = integrationByKey.get(r.key);
                const provider = def?.providers?.find((p) => p.value === r.provider)?.label;
                return (
                  <tr key={r.key}>
                    <td className={tdClass}>
                      <Link
                        href={`/admin/integrations/${r.key}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {r.name}
                      </Link>
                      <p className="text-muted-foreground">{def?.summary}</p>
                    </td>
                    <td className={tdClass}>
                      {categoryLabel[r.category as IntegrationCategory] ?? r.category}
                    </td>
                    <td className={tdClass}>{provider ?? (def?.providers ? "Not chosen" : "—")}</td>
                    <td className={tdClass}>{r.enabled ? "Yes" : "No"}</td>
                    <td className={tdClass}>
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
