/** Only same-site paths may be used as a return destination after sign-in (prevents open redirects). */
export function safeReturnPath(value: string | null | undefined, fallback = "/"): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.startsWith("/auth/")
  )
    return fallback;
  return value;
}
