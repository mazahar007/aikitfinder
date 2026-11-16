import type { ReactNode } from "react";

import { IntegrationList } from "@/components/admin/integration-list";
import { NotBuilt, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/access";
import { listIntegrations } from "@/lib/admin/data";
import type { Permission } from "@/lib/admin/permissions";

/**
 * A section that is mostly ahead of its backend. It shows the real status of
 * the dependencies it relies on, anything real that exists, and a plain list
 * of what is not built.
 */
export async function SectionPage({
  title,
  description,
  permission,
  integrationKeys,
  notBuilt,
  children,
}: {
  title: string;
  description: string;
  permission: Permission;
  integrationKeys?: string[];
  notBuilt: string;
  children?: ReactNode;
}) {
  const admin = await requireAdmin(permission);
  const records =
    integrationKeys && admin.permissions.has("integrations.read")
      ? (await listIntegrations()).filter((r) => integrationKeys.includes(r.key))
      : null;
  return (
    <>
      <PageHeader title={title} description={description} />
      {children}
      {records ? <IntegrationList records={records} title="Dependencies for this section" /> : null}
      <NotBuilt>{notBuilt}</NotBuilt>
    </>
  );
}
