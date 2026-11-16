import type { Metadata } from "next";

import { SectionPage } from "@/components/admin/section-page";
import { EmptyRow, Panel, formatDate } from "@/components/admin/ui";
import { listIntegrationLogs } from "@/lib/admin/data";

export const metadata: Metadata = { title: "System Logs" };

export default async function Page() {
  const logs = await listIntegrationLogs();
  return (
    <SectionPage
      title="System Logs"
      description="Integration events: configuration changes, credential changes and connection tests. Credentials never appear here."
      permission="integrations.read"
      notBuilt="Application and worker logs. Server logs are in the hosting provider's dashboard."
    >
      <Panel title="Integration events">
        {logs.length === 0 ? (
          <EmptyRow>No integration events have been recorded.</EmptyRow>
        ) : (
          <ul className="divide-y text-sm">
            {logs.map((l) => (
              <li key={l.id} className="px-4 py-2.5">
                <span className="font-mono text-xs text-muted-foreground">
                  {formatDate(l.created_at)}
                </span>{" "}
                <span className="font-medium text-foreground">{l.integration_key}</span>{" "}
                <span className="font-mono text-xs">{l.event}</span>
                <span className="text-muted-foreground"> — {l.message}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </SectionPage>
  );
}
