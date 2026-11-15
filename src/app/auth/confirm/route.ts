import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { authStatus, RECOVERY_COOKIE, RECOVERY_WINDOW_SECONDS } from "@/lib/auth/config";
import { safeReturnPath } from "@/lib/auth/return-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const RESET_PAGE = "/account/reset-password";

/**
 * Where the links in account emails land: confirm a new account, or open the
 * password reset flow. Verifies the one-time token, starts the session and
 * sends the visitor on. The token is used once here and never logged or shown.
 *
 * Accepts both link styles Supabase can send:
 *   ?token_hash=...&type=email|signup|recovery   (the templates in docs/phase-1)
 *   ?code=...                                    (Supabase's default templates)
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const recovery = type === "recovery" || params.get("flow") === "recovery";

  const to = (path: string) => {
    const response = NextResponse.redirect(new URL(path, url.origin));
    // Keep the one-time token out of the Referer header of the next page.
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  };
  const failed = () => to(recovery ? `${RESET_PAGE}?link=invalid` : "/account?notice=link-invalid");
  if (!authStatus.enabled) return failed();

  const supabase = await createSupabaseServerClient();
  let userId: string | undefined;
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) userId = data.user?.id;
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) userId = data.user?.id;
  }
  if (!userId) return failed();

  if (recovery) {
    const response = to(RESET_PAGE);
    response.cookies.set(RECOVERY_COOKIE, userId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: RECOVERY_WINDOW_SECONDS,
    });
    return response;
  }

  const next = safeReturnPath(params.get("next"));
  return to(next === "/" ? "/account?notice=confirmed" : next);
}
