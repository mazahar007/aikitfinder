/**
 * The AutoFlow AI production pipeline. A project moves through these stages
 * in order. This file defines the structure only: no stage is connected to an
 * AI provider yet, and none of them runs.
 */
export const stageIds = [
  "research",
  "script",
  "voice",
  "video_assembly",
  "thumbnail_metadata",
  "review",
] as const;

export type StageId = (typeof stageIds)[number];

/** Mirrors the `autoflow_stage_status` enum in supabase/migrations/0006. */
export type StageStatus = "not_started" | "in_progress" | "needs_review" | "approved";

export type StageDefinition = {
  id: StageId;
  name: string;
  /** What the stage will produce once it is built. */
  produces: string;
  /** What the owner will do in this stage. */
  ownerAction: string;
};

export const stages: readonly StageDefinition[] = [
  {
    id: "research",
    name: "Research",
    produces: "Topic brief with sources",
    ownerAction: "Choose the topic and confirm the facts to use.",
  },
  {
    id: "script",
    name: "Script",
    produces: "Narration script, scene by scene",
    ownerAction: "Edit and approve the script.",
  },
  {
    id: "voice",
    name: "Voice",
    produces: "Voiceover audio and subtitles",
    ownerAction: "Pick the language and voice, then approve the audio.",
  },
  {
    id: "video_assembly",
    name: "Video Assembly",
    produces: "Assembled video from your images, voiceover and subtitles",
    ownerAction: "Supply or confirm the visuals and check the cut.",
  },
  {
    id: "thumbnail_metadata",
    name: "Thumbnail / Metadata",
    produces: "Thumbnail, title, description and tags",
    ownerAction: "Choose a thumbnail and edit the text.",
  },
  {
    id: "review",
    name: "Review",
    produces: "Publish-ready package",
    ownerAction: "Give final approval. Nothing is published without it.",
  },
];

export const stageStatusLabel: Record<StageStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  needs_review: "Needs your review",
  approved: "Approved",
};

export function stageIndex(id: StageId): number {
  return stageIds.indexOf(id);
}
