import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  IntegrationConfigForm,
  IntegrationSecretForm,
  TestConnectionButton,
} from "@/components/admin/integration-editor";
import { EmptyRow, PageHeader, Panel, StatusBadge, formatDate } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/access";
import { listIntegrationLogs, listIntegrations } from "@/lib/admin/data";
import { categoryLabel, integrationByKey, statusMeaning } from "@/lib/integrations/registry";
import { secretStorageConfigured } from "@/lib/integrations/secrets";

export const metadata: Metadata = { title: "Integration" };

export default async function AdminIntegrationPage({
  params,
}: PageProps<"/admin/integrations/[key]">) {
  const admin = await requireAdmin("integrations.read");
  const { key } = await params;
  const definition = integrationByKey.get(key);
  if (!definition) notFound();
  const [records, logs] = await Promise.all([listIntegrations(), listIntegrationLogs(key)]);
  const record = records.find((r) => r.key === key);
  if (!record) notFound();

  const canConfigure = admin.permissions.has("integrations.configure");
  const canSetSecrets = admin.permissions.has("integrations.secrets.write");
  const dependency = definition.dependsOn
    ? records.find((r) => r.key === definition.dependsOn)
    : undefined;
  const dependents = records.filter((r) => r.depends_on === key);

  return (
    <>
      <Link
        href="/admin/integrations"
        className="inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Dependencies & Integrations
      </Link>
      <PageHeader title={definition.name} description={definition.summary}>
        <StatusBadge status={record.status} />
      </PageHeader>

      <p role="note" className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
        <strong className="font-semibold text-foreground">
          {categoryLabel[definition.category]}.
        </strong>{" "}
        {statusMeaning[record.status]}
        {dependency ? (
          <>
            {" "}
            Depends on{" "}
            <Link
              href={`/admin/integrations/${dependency.key}`}
              className="font-medium text-primary hover:underline"
            >
              {dependency.name}
            </Link>
            .
          </>
        ) : null}
        {dependents.length ? <> Used by {dependents.map((d) => d.name).join(", ")}.</> : null}
      </p>

      <Panel title="Configuration">
        <IntegrationConfigForm definition={definition} record={record} canEdit={canConfigure} />
      </Panel>

      {definition.secrets.length ? (
        <Panel title="Credentials">
          {!secretStorageConfigured ? (
            <p role="note" className="border-b px-4 py-3 text-sm text-muted-foreground">
              Credential storage is not set up on this server, so credentials cannot be saved yet.
              Nothing is stored in plain text as a fallback.
            </p>
          ) : null}
          {definition.secrets.map((s) => (
            <IntegrationSecretForm
              key={s.key}
              integrationKey={key}
              field={s.key}
              fieldLabel={s.label}
              current={record.secrets.find((x) => x.field === s.key)}
              canEdit={canSetSecrets}
              storageReady={secretStorageConfigured}
            />
          ))}
        </Panel>
      ) : null}

      <Panel title="Connection">
        <dl className="grid gap-3 border-b px-4 py-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Last real test</dt>
            <dd className="text-foreground">
              {record.last_test_at ? formatDate(record.last_test_at) : "Never tested"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Result</dt>
            <dd className="text-foreground">
              {record.last_test_ok === null ? "—" : record.last_test_ok ? "Passed" : "Failed"}
              {record.last_test_message ? ` · ${record.last_test_message}` : ""}
            </dd>
          </div>
        </dl>
        <TestConnectionButton integrationKey={key} canEdit={canConfigure} />
      </Panel>

      <Panel title="Integration log">
        {logs.length === 0 ? (
          <EmptyRow>Nothing has been recorded for this integration yet.</EmptyRow>
        ) : (
          <ul className="divide-y text-sm">
            {logs.map((l) => (
              <li key={l.id} className="px-4 py-2.5">
                <span className="font-mono text-xs text-muted-foreground">
                  {formatDate(l.created_at)}
                </span>{" "}
                <span className="font-medium text-foreground">{l.event}</span>
                <span className="text-muted-foreground"> — {l.message}</span>
                {l.actor_email ? (
                  <span className="text-muted-foreground"> ({l.actor_email})</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
