import { Suspense } from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { MainNav, NavLinks } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchForm } from "@/components/search/search-form";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <Container className="flex h-16 items-center gap-4 lg:gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden md:block">
          {/* The active link depends on the URL, so it streams in; the
              fallback renders the same links without highlighting. */}
          <Suspense fallback={<NavLinks pathname={null} />}>
            <MainNav />
          </Suspense>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <SearchForm shortcut className="hidden w-56 md:block lg:w-72" />
          <Button asChild variant="ghost" size="icon" className="text-foreground md:hidden">
            <Link href="/search">
              <SearchIcon className="size-5!" aria-hidden="true" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>
          <Suspense fallback={null}>
            <MobileNav />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}
