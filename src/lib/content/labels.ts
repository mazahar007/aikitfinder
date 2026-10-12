import type { Platform, PricingModel, SkillLevel, VerificationStatus } from "@/lib/content/types";

export const skillLevels: SkillLevel[] = ["beginner", "intermediate", "advanced"];
export const pricingModels: PricingModel[] = ["free", "freemium", "paid", "open-source"];

export const skillLevelLabel: Record<SkillLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const pricingLabel: Record<PricingModel, string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
  "open-source": "Open source",
};

export const platformLabel: Record<Platform, string> = {
  web: "Web",
  desktop: "Desktop app",
  ios: "iOS",
  android: "Android",
  "browser-extension": "Browser extension",
  api: "API",
};

export const verificationLabel: Record<VerificationStatus, string> = {
  verified: "Verified",
  "needs-review": "Needs review",
  unverified: "Not verified yet",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats an ISO date (YYYY-MM-DD) as e.g. "1 Oct 2026". Stable on server and client. */
export function formatDate(iso: string) {
  return dateFormatter.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
}
