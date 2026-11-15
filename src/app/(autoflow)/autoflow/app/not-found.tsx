import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function WorkspaceNotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="font-display text-3xl font-light tracking-tight text-heading">
        We couldn’t find that in your workspace
      </h1>
      <p className="mt-3 text-muted-foreground">
        The project may have been removed, or the link may be mistyped.
      </p>
      <Button asChild className="mt-8">
        <Link href="/autoflow/app/projects">Back to projects</Link>
      </Button>
    </div>
  );
}
