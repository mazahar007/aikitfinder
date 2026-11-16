"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type Item = { href: string; label: string };

export function AdminNavLinks({ items, pathname }: { items: Item[]; pathname: string | null }) {
  return (
    <ul className="flex gap-1 lg:flex-col">
      {items.map(({ href, label }) => {
        const active = pathname
          ? href === "/admin"
            ? pathname === "/admin"
            : pathname === href || pathname.startsWith(`${href}/`)
          : false;
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center rounded-md px-3 text-sm font-medium whitespace-nowrap",
                active
                  ? "bg-primary-tint text-heading"
                  : "text-muted-foreground hover:bg-surface-subtle hover:text-foreground",
              )}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminNav({ items }: { items: Item[] }) {
  return <AdminNavLinks items={items} pathname={usePathname()} />;
}
