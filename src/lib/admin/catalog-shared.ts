/** Labels and options shared by the admin Directory pages and forms. Safe for the browser. */
export type ContentStatus = "draft" | "in-review" | "published" | "needs-update" | "archived";
export type Verification = "verified" | "needs-review" | "unverified";

export const statusLabel: Record<ContentStatus, string> = {
  draft: "Draft",
  "in-review": "In review",
  published: "Published",
  "needs-update": "Needs update",
  archived: "Archived",
};

export const verificationLabel: Record<Verification, string> = {
  verified: "Verified",
  "needs-review": "Needs review",
  unverified: "Unverified",
};

export const platformOptions = [
  ["web", "Web"],
  ["desktop", "Desktop"],
  ["ios", "iOS"],
  ["android", "Android"],
  ["browser-extension", "Browser extension"],
  ["api", "API"],
] as const;
