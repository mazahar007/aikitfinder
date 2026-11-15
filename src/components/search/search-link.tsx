"use client";

import { useRouter } from "next/navigation";

import { searchHref } from "@/lib/guest-search/client";

/**
 * A suggested search. Choosing one is an intentional search, so it gets its
 * own request ID like a typed one. Rendered as a button because following it
 * does something (uses a search); the address is not known until it is clicked.
 */
export function SearchLink({
  query,
  className,
  children,
}: {
  query: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const href = searchHref(query);
        if (href) router.push(href);
      }}
    >
      {children}
    </button>
  );
}
