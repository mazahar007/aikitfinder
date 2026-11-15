import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { authStatus } from "@/lib/auth/config";
import { safeReturnPath } from "@/lib/auth/return-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Where the link in the confirmation email lands. Verifies the one-time token,
 * starts the session and sends the visitor on to where they were going.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = safeReturnPath(url.searchParams.get("next"));
  const failed = new URL("/?auth=link-invalid", url.origin);
  if (!authStatus.enabled) return NextResponse.redirect(failed);

  const supabase = await createSupabaseServerClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(failed);
}
