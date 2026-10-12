import type { ReactNode } from "react";
import { SearchXIcon } from "lucide-react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed bg-card px-6 py-12 text-center" role="status">
      <SearchXIcon className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-semibold text-heading">{title}</h2>
      {children ? (
        <div className="mx-auto mt-2 max-w-md text-muted-foreground">{children}</div>
      ) : null}
    </div>
  );
}
