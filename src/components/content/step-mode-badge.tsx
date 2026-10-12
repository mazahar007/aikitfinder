import { HandIcon, ZapIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { StepMode } from "@/lib/content/types";

export const stepModeText: Record<StepMode, { label: string; meaning: string }> = {
  manual: { label: "Manual", meaning: "You do this yourself, or use a tool and check the result." },
  automatable: {
    label: "Can be automated",
    meaning: "A tool could run this step for you. AIKitFinder does not run it or set it up.",
  },
};

/** Icon and words, so the difference never depends on colour. */
export function StepModeBadge({ mode }: { mode: StepMode }) {
  return (
    <Badge variant={mode === "manual" ? "neutral" : "info"}>
      {mode === "manual" ? <HandIcon aria-hidden="true" /> : <ZapIcon aria-hidden="true" />}
      {stepModeText[mode].label}
    </Badge>
  );
}
