import {
  BadgeCheckIcon,
  CircleHelpIcon,
  ClockIcon,
  FlaskConicalIcon,
  PlugIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatDate, pricingLabel, skillLevelLabel, verificationLabel } from "@/lib/content/labels";
import type { PricingModel, SkillLevel, VerificationStatus } from "@/lib/content/types";

const levelBars: Record<SkillLevel, number> = { beginner: 1, intermediate: 2, advanced: 3 };

/** Three bars, filled up to the level, so the level reads at a glance. */
function LevelMeter({ level }: { level: SkillLevel }) {
  const filled = levelBars[level];
  return (
    <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" focusable="false">
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={i * 4.5}
          y={8 - i * 3.5}
          width="3"
          height={4 + i * 3.5}
          rx="1"
          fill="currentColor"
          opacity={i < filled ? 1 : 0.3}
        />
      ))}
    </svg>
  );
}

export function LevelBadge({ level }: { level: SkillLevel }) {
  return (
    <Badge variant="neutral">
      <LevelMeter level={level} />
      {skillLevelLabel[level]}
    </Badge>
  );
}

export function PricingBadge({ pricing }: { pricing?: PricingModel }) {
  if (!pricing) return <Badge variant="neutral">Pricing not verified</Badge>;
  return <Badge variant="neutral">{pricingLabel[pricing]}</Badge>;
}

export function ApiBadge() {
  return (
    <Badge variant="neutral">
      <PlugIcon aria-hidden="true" />
      API
    </Badge>
  );
}

const verificationVariant = {
  verified: { variant: "success", icon: BadgeCheckIcon },
  "needs-review": { variant: "warning", icon: ClockIcon },
  unverified: { variant: "neutral", icon: CircleHelpIcon },
} as const;

export function VerificationBadge({
  status,
  date,
}: {
  status: VerificationStatus;
  /** Adds "· 1 Oct 2026" after the label. */
  date?: string;
}) {
  const { variant, icon: Icon } = verificationVariant[status];
  return (
    <Badge variant={variant} className="max-w-full flex-wrap whitespace-normal">
      <Icon aria-hidden="true" />
      {verificationLabel[status]}
      {date ? ` · ${formatDate(date)}` : null}
    </Badge>
  );
}

/** Marks demo records so they are never mistaken for real, verified content. */
export function SampleBadge() {
  return (
    <Badge variant="warning" title="Fictional sample data for the prototype">
      <FlaskConicalIcon aria-hidden="true" />
      Sample
    </Badge>
  );
}
