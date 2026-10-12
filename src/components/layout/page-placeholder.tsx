import Link from "next/link";
import { ConstructionIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PagePlaceholderProps = {
  title: string;
  description: string;
  /** Which roadmap phase delivers this page (shown to visitors). */
  phase: string;
};

/**
 * Honest placeholder for routes that exist in the navigation but are not
 * built yet, so no navigation link is ever broken.
 */
export function PagePlaceholder({ title, description, phase }: PagePlaceholderProps) {
  return (
    <Container className="py-12 sm:py-16">
      <div className="max-w-2xl">
        <Badge variant="warning">
          <ConstructionIcon aria-hidden="true" />
          In progress · {phase}
        </Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-brand sm:text-h1">{title}</h1>
        <p className="mt-3 text-lead text-muted-foreground">{description}</p>
        <p className="mt-6 text-muted-foreground">
          This page is part of the AIKitFinder build and is not ready yet. Nothing here is final
          content.
        </p>
        <Button asChild variant="secondary" className="mt-6">
          <Link href="/">Back to the homepage</Link>
        </Button>
      </div>
    </Container>
  );
}
