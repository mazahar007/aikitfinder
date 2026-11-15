import { CheckIcon } from "lucide-react";

import { stageStatusLabel, stages, type StageId, type StageStatus } from "@/lib/autoflow/stages";
import { cn } from "@/lib/utils";

/**
 * The six pipeline stages in order. Without `statuses` it shows the structure
 * only (used on the landing page and the overview); with them it shows where
 * a project stands.
 */
export function StageRail({
  statuses,
  current,
  className,
}: {
  statuses?: Record<StageId, StageStatus>;
  current?: StageId;
  className?: string;
}) {
  return (
    <ol className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {stages.map((stage, i) => {
        const status = statuses?.[stage.id];
        const isCurrent = current === stage.id;
        return (
          <li
            key={stage.id}
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "rounded-lg border bg-card p-4",
              isCurrent && "border-primary",
              stage.id === "review" && !isCurrent && "border-dashed",
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border font-mono text-xs",
                  status === "approved"
                    ? "border-success bg-success-tint text-success"
                    : "border-border text-muted-foreground",
                )}
              >
                {status === "approved" ? (
                  <CheckIcon className="size-4" aria-hidden="true" />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <h3 className="font-display text-base font-medium text-heading">{stage.name}</h3>
              {status ? (
                <span className="ml-auto font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                  {stageStatusLabel[status]}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-foreground">{stage.produces}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stage.ownerAction}</p>
          </li>
        );
      })}
    </ol>
  );
}
