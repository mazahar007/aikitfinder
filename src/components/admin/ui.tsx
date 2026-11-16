import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  pipelineStateLabel,
  statusLabel,
  type IntegrationStatus,
  type PipelineState,
} from "@/lib/integrations/registry";
import { cn } from "@/lib/utils";

const statusVariant: Record<
  IntegrationStatus,
  "neutral" | "warning" | "info" | "success" | "destructive"
> = {
  not_configured: "neutral",
  demo: "warning",
  configured: "info",
  connected: "success",
  error: "destructive",
};

export function StatusBadge({ status }: { status: IntegrationStatus }) {
  return <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>;
}

const stateVariant: Record<PipelineState, "neutral" | "warning" | "info" | "success"> = {
  planned: "neutral",
  demo: "warning",
  configured: "info",
  connected: "success",
  operational: "success",
};

export function PipelineBadge({ state }: { state: PipelineState }) {
  return <Badge variant={stateVariant[state]}>{pipelineStateLabel[state]}</Badge>;
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-heading">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

/** One number on the dashboard. `unavailable` explains why there is no number instead of showing a made-up one. */
export function StatCard({
  label,
  value,
  detail,
  unavailable,
  demo,
}: {
  label: string;
  value?: number | string;
  detail?: string;
  unavailable?: string;
  demo?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {demo ? <Badge variant="warning">Demo</Badge> : null}
      </div>
      {unavailable ? (
        <>
          <p
            className="mt-2 font-mono text-2xl font-semibold text-muted-foreground"
            aria-hidden="true"
          >
            —
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{unavailable}</p>
        </>
      ) : (
        <>
          <p className="mt-2 font-mono text-2xl font-semibold text-heading tabular-nums">{value}</p>
          {detail ? <p className="mt-1 text-sm text-muted-foreground">{detail}</p> : null}
        </>
      )}
    </div>
  );
}

export function Panel({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border bg-card", className)}>
      {title ? (
        <h2 className="border-b px-4 py-3 text-sm font-semibold text-heading">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

export function EmptyRow({ children }: { children: ReactNode }) {
  return <p className="px-4 py-8 text-center text-sm text-muted-foreground">{children}</p>;
}

/** A plain statement that a section is not built, so nothing looks more finished than it is. */
export function NotBuilt({ children }: { children: ReactNode }) {
  return (
    <div
      role="note"
      className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground"
    >
      <strong className="font-semibold text-foreground">Not built yet.</strong> {children}
    </div>
  );
}

export const tableClass = "w-full min-w-[640px] text-left text-sm";
export const thClass = "border-b px-4 py-2.5 font-semibold text-muted-foreground";
export const tdClass = "border-b px-4 py-2.5 align-top";

export function formatDate(value: string | null | undefined): string {
  if (!value) return "Never";
  return (
    new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(value)) + " UTC"
  );
}
