import type { Metadata } from "next";

import { IntegrationList } from "@/components/admin/integration-list";
import { PageHeader, StatCard, formatDate } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/access";
import { getOverview, listIntegrations } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const admin = await requireAdmin("admin.access");
  const [o, integrations] = await Promise.all([
    getOverview(),
    admin.permissions.has("integrations.read") ? listIntegrations() : Promise.resolve([]),
  ]);
  const noJobs = "The job system is not built yet.";

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={
          o
            ? `Live counts from the database, as of ${formatDate(o.generated_at)}.`
            : "The overview could not be loaded."
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={o?.users_total ?? "—"}
          detail={o ? `${o.users_new_7d} new in the last 7 days` : undefined}
        />
        <StatCard
          label="Active users"
          value={o?.users_active_30d ?? "—"}
          detail="Signed in during the last 30 days"
        />
        <StatCard
          label="AI Tools"
          value={o?.tools_total ?? "—"}
          detail={o ? `${o.tools_published} published in the database` : undefined}
        />
        <StatCard
          label="Directory categories"
          value={o?.categories ?? "—"}
          detail="In the database"
        />
        <StatCard label="AutoFlow projects" value={o?.projects_total ?? "—"} />
        <StatCard label="Total rendering jobs" unavailable={noJobs} />
        <StatCard label="Failed jobs" unavailable={noJobs} />
        <StatCard
          label="Connected integrations"
          value={o?.integrations_connected ?? "—"}
          detail={o ? `of ${o.integrations_total} dependencies` : undefined}
        />
        <StatCard
          label="Unconfigured integrations"
          value={o ? o.integrations_demo + o.integrations_not_configured : "—"}
          detail={
            o
              ? `${o.integrations_demo} in demo mode, ${o.integrations_not_configured} not configured`
              : undefined
          }
        />
        <StatCard label="Storage usage" unavailable="No object storage is connected." />
        <StatCard
          label="API usage"
          unavailable="No AI provider is connected, so there is no usage."
        />
        <StatCard
          label="Revenue"
          demo
          unavailable="No payment provider is connected. There is no revenue data."
        />
      </div>
      {admin.permissions.has("integrations.read") ? (
        <IntegrationList records={integrations} title="Dependencies & Integrations" />
      ) : null}
    </>
  );
}
