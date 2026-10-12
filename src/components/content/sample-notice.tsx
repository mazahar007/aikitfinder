import { FlaskConicalIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Shown on every page that lists sample records during the prototype phase. */
export function SampleNotice({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-md border border-warning/40 bg-warning-tint px-4 py-3 text-sm text-foreground",
        className,
      )}
    >
      <FlaskConicalIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
      <span>
        <strong className="font-semibold text-warning">Prototype:</strong> every tool, guide and
        workflow shown here is a fictional sample used to test the design. Links go to example.com.
      </span>
    </p>
  );
}
