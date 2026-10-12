import type { Category } from "@/lib/content/types";

/** Initial categories from the master brief. Managed in the admin CMS from Phase 4. */
export const sampleCategories: Category[] = [
  {
    slug: "video-generation",
    name: "AI Video Generation",
    description: "Turn text, images or scripts into new video clips.",
    icon: "clapperboard",
  },
  {
    slug: "image-generation",
    name: "AI Image Generation",
    description: "Create images and illustrations from a written description.",
    icon: "image",
  },
  {
    slug: "audio-voice",
    name: "AI Audio and Voice",
    description: "Generate voiceovers, clean up recordings and transcribe speech.",
    icon: "audio",
  },
  {
    slug: "video-editing",
    name: "AI Video Editing",
    description: "Cut, caption and resize existing footage faster.",
    icon: "scissors",
  },
  {
    slug: "writing-research",
    name: "AI Writing and Research",
    description: "Draft, rewrite, summarise and research with source checking.",
    icon: "pen",
  },
  {
    slug: "coding-development",
    name: "AI Coding and Development",
    description: "Write, explain, review and debug code.",
    icon: "code",
  },
  {
    slug: "design",
    name: "AI Design",
    description: "Layouts, social graphics, presentations and brand assets.",
    icon: "palette",
  },
  {
    slug: "productivity",
    name: "AI Productivity",
    description: "Notes, meetings, email and everyday task helpers.",
    icon: "check",
  },
  {
    slug: "automation",
    name: "AI Automation",
    description: "Connect apps and let repeatable tasks run on their own.",
    icon: "workflow",
  },
  {
    slug: "marketing-seo",
    name: "AI Marketing and SEO",
    description: "Plan content, research keywords and write campaign copy.",
    icon: "megaphone",
  },
  {
    slug: "business",
    name: "AI Business Tools",
    description: "Pitch decks, proposals, customer support and operations.",
    icon: "briefcase",
  },
  {
    slug: "data-analytics",
    name: "AI Data and Analytics",
    description: "Clean, explore and chart data in plain language.",
    icon: "chart",
  },
];
