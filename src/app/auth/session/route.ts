import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";

/**
 * Tells the page whether someone is signed in, so headers on prerendered
 * pages can show the right account control. Returns only what the header
 * shows; never a token.
 */
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    { user: user ? { email: user.email, displayName: user.displayName } : null },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
