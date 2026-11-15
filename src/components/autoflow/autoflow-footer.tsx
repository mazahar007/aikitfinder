import Link from "next/link";

import { Container } from "@/components/layout/container";
import { authStatus } from "@/lib/auth/config";
import { products } from "@/config/products";

const links = [
  { href: "/", label: "AIKitFinder home" },
  { href: products.directory.home, label: products.directory.name },
  { href: "/autoflow/app", label: authStatus.enabled ? "Workspace" : "Workspace preview" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function AutoflowFooter() {
  return (
    <footer className="border-t">
      <Container className="flex flex-col gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          AutoFlow AI is part of AIKitFinder. It is in development and not yet available for use.
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="inline-flex min-h-11 items-center hover:text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  );
}
