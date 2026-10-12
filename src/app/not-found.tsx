import Link from "next/link";

import { Container } from "@/components/layout/container";
import { SearchForm } from "@/components/search/search-form";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="max-w-2xl py-16 text-center sm:py-24">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-h1">
        We couldn’t find that page
      </h1>
      <p className="mt-3 text-muted-foreground">
        It may have moved, or the link may be mistyped. Try searching instead.
      </p>
      <SearchForm variant="hero" id="notfound-search" className="mt-8" />
      <Button asChild variant="ghost" className="mt-6">
        <Link href="/">Go to the homepage</Link>
      </Button>
    </Container>
  );
}
