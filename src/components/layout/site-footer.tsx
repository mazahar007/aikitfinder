import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { footerNav, siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-brand text-on-brand">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="col-span-2 max-w-xs md:col-span-1">
          <Logo inverted />
          <p className="mt-3 text-sm leading-relaxed">{siteConfig.description}</p>
        </div>
        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-sm font-semibold text-white">{group.title}</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-9 items-center rounded-sm hover:text-white hover:underline focus-visible:outline-white"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <Container className="text-xs">
        <p className="border-t border-white/15 py-6">
          {siteConfig.name} is an independent guide. Tool names belong to their owners; listing a
          tool does not mean it endorses us or that we endorse it.
        </p>
      </Container>
    </footer>
  );
}
