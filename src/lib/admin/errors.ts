export const DENIED = "You do not have permission to do that.";

const sentence = (text: string) =>
  (text.charAt(0).toUpperCase() + text.slice(1)).replace(/\.?$/, ".");

/**
 * Database messages that are safe and useful to show. The admin functions
 * raise plain-language messages with these codes; anything else becomes a
 * generic sentence so no internal detail reaches the page.
 */
export function explain(error: { code?: string; message?: string }): string {
  if (error.code === "42501")
    return error.message && error.message !== "not allowed" ? sentence(error.message) : DENIED;
  if (error.code === "22023" || error.code === "23514")
    return sentence(error.message ?? "That value was not accepted.");
  return "The change could not be saved. Try again.";
}
