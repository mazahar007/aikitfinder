import type { Metadata } from "next";

import {
  EmptyRow,
  PageHeader,
  Panel,
  formatDate,
  tableClass,
  tdClass,
  thClass,
} from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/access";
import { listAudit } from "@/lib/admin/data";
import { roleLabel } from "@/lib/admin/permissions";

export const metadata: Metadata = { title: "Audit Logs" };

export default async function AdminAuditPage() {
  await requireAdmin("audit.read");
  const entries = await listAudit();
  return (
    <>
      <PageHeader
        title="Audit Logs"
        description="Every administrative change, newest first. Entries cannot be edited or deleted by anyone."
      />
      <Panel>
        {entries.length === 0 ? (
          <EmptyRow>No administrative actions have been recorded.</EmptyRow>
        ) : (
          <div className="relative overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>When</th>
                  <th className={thClass}>Who</th>
                  <th className={thClass}>Action</th>
                  <th className={thClass}>Target</th>
                  <th className={thClass}>Details</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td className={`${tdClass} whitespace-nowrap`}>{formatDate(e.created_at)}</td>
                    <td className={`${tdClass} break-all`}>
                      {e.actor_email ?? "Database owner"}
                      {e.actor_role ? (
                        <p className="text-xs text-muted-foreground">{roleLabel[e.actor_role]}</p>
                      ) : null}
                    </td>
                    <td className={`${tdClass} font-mono text-xs`}>{e.action}</td>
                    <td className={`${tdClass} font-mono text-xs break-all`}>
                      {e.target_type ? `${e.target_type}: ${e.target_id}` : "—"}
                    </td>
                    <td className={`${tdClass} font-mono text-xs break-all text-muted-foreground`}>
                      {Object.keys(e.summary).length ? JSON.stringify(e.summary) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
