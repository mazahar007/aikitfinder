import {
  AudioLinesIcon,
  BriefcaseIcon,
  ChartColumnIcon,
  ClapperboardIcon,
  CodeIcon,
  type LucideIcon,
  ImageIcon,
  ListChecksIcon,
  MegaphoneIcon,
  PaletteIcon,
  PenLineIcon,
  ScissorsIcon,
  SparklesIcon,
  WorkflowIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  clapperboard: ClapperboardIcon,
  image: ImageIcon,
  audio: AudioLinesIcon,
  scissors: ScissorsIcon,
  pen: PenLineIcon,
  code: CodeIcon,
  palette: PaletteIcon,
  check: ListChecksIcon,
  workflow: WorkflowIcon,
  megaphone: MegaphoneIcon,
  briefcase: BriefcaseIcon,
  chart: ChartColumnIcon,
};

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = icons[icon] ?? SparklesIcon;
  return <Icon className={className} aria-hidden="true" />;
}
