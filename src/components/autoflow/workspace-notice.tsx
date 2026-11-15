import { InfoIcon } from "lucide-react";

import { authStatus } from "@/lib/auth/config";

/** Shown across the workspace while accounts are closed. */
export function PreviewNotice() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning-tint px-4 py-3 text-sm text-foreground"
    >
      <InfoIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
      <p>
        <strong className="font-semibold">Layout preview.</strong> {authStatus.reason} Nothing can
        be created, generated or saved here yet, and no AI provider is connected.
      </p>
    </div>
  );
}
