import { Badge } from "@/components/ui/badge";
import {
  integrationByKey,
  pipelineDependencies,
  pipelineState,
  pipelineStateLabel,
  statusLabel,
  type IntegrationStatus,
  type PipelineState,
} from "@/lib/integrations/registry";

const variant: Record<PipelineState, "neutral" | "warning" | "info" | "success"> = {
  planned: "neutral",
  demo: "warning",
  configured: "info",
  connected: "success",
  operational: "success",
};

const meaning: Record<PipelineState, string> = {
  planned: "Not set up.",
  demo: "Demo values only. Nothing real is connected.",
  configured: "Real settings saved, not tested.",
  connected: "Connection tested. The stage itself is not built.",
  operational: "Built, connected and tested.",
};

/**
 * What each pipeline stage depends on, and how far along that dependency
 * really is. `statuses` is null where they cannot be read (a visitor, or a
 * database without the integration tables); every stage is then "Planned".
 * Nothing is shown as Operational unless the stage is built and tested.
 */
export function PipelineDependencies({
  statuses,
}: {
  statuses: Map<string, IntegrationStatus> | null;
}) {
  return (
    <div>
      <ol className="divide-y rounded-lg border bg-card">
        {pipelineDependencies.map(({ stage, needs }, i) => {
          const state = pipelineState(stage, needs, statuses);
          return (
            <li
              key={stage}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3"
              data-pipeline-state={state}
            >
              <span className="font-mono text-xs text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-40 flex-1 font-medium text-heading">{stage}</span>
              <span className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {needs.map((key) => {
                  const status = statuses?.get(key);
                  return (
                    <span key={key}>
                      {integrationByKey.get(key)?.name}
                      {status ? <span className="text-xs"> ({statusLabel[status]})</span> : null}
                    </span>
                  );
                })}
              </span>
              <Badge variant={variant[state]}>{pipelineStateLabel[state]}</Badge>
            </li>
          );
        })}
      </ol>
      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        {(Object.keys(meaning) as PipelineState[]).map((s) => (
          <div key={s} className="flex gap-1">
            <dt className="font-semibold text-foreground">{pipelineStateLabel[s]}:</dt>
            <dd>{meaning[s]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
