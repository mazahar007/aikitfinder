import type { Metadata } from "next";

import { IntegrationList } from "@/components/admin/integration-list";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/access";
import { listIntegrations } from "@/lib/admin/data";
import { statusMeaning, type IntegrationStatus } from "@/lib/integrations/registry";

export const metadata: Metadata = { title: "Dependencies & Integrations" };

const order: IntegrationStatus[] = ["not_configured", "demo", "configured", "connected", "error"];

export default async function AdminIntegrationsPage() {
  await requireAdmin("integrations.read");
  const records = await listIntegrations();
  const demo = records.filter((r) => r.status === "demo").length;

  return (
    <>
      <PageHeader
        title="Dependencies & Integrations"
        description="Every outside service the platform depends on, with its real status. Open one to change its settings."
      />
      {demo > 0 ? (
        <p
          role="note"
          className="rounded-lg border border-warning/40 bg-warning-tint px-4 py-3 text-sm text-foreground"
        >
          <strong className="font-semibold">Demo mode.</strong> {demo} of {records.length}{" "}
          dependencies hold demo values only. No real provider connection has been established, and
          no AutoFlow stage can run.
        </p>
      ) : null}
      <IntegrationList records={records} />
      <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {order.map((s) => (
          <div key={s} className="rounded-lg border bg-card p-3">
            <dt>
              <StatusBadge status={s} />
            </dt>
            <dd className="mt-1.5 text-muted-foreground">{statusMeaning[s]}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
