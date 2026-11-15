import type { SessionUser } from "@/lib/auth/config";
import { stageIds, type StageId, type StageStatus } from "@/lib/autoflow/stages";

/** Mirrors the `autoflow_project_status` enum in supabase/migrations/0006. */
export type ProjectStatus = "draft" | "in_progress" | "ready_for_review" | "approved" | "archived";

export type Project = {
  id: string;
  title: string;
  status: ProjectStatus;
  currentStage: StageId;
  stages: Record<StageId, StageStatus>;
  /** Output format; the first supported workflow is 16:9 video. */
  aspectRatio: "16:9";
  updatedAt: string | null;
  /** True only for the built-in layout sample. It is not stored anywhere. */
  sample: boolean;
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  draft: "Draft",
  in_progress: "In progress",
  ready_for_review: "Ready for review",
  approved: "Approved",
  archived: "Archived",
};

/**
 * A fixed example used to show the project screens while accounts are closed.
 * It is labeled as a sample everywhere it appears, cannot be edited, and is
 * never shown to a signed-in user.
 */
export const SAMPLE_PROJECT_ID = "sample";

const sampleProject: Project = {
  id: SAMPLE_PROJECT_ID,
  title: "Sample project",
  status: "draft",
  currentStage: "research",
  stages: Object.fromEntries(stageIds.map((id) => [id, "not_started"])) as Record<
    StageId,
    StageStatus
  >,
  aspectRatio: "16:9",
  updatedAt: null,
  sample: true,
};

/**
 * Projects owned by the user.
 *
 * The table exists as a migration (0006) but no database is connected, so a
 * signed-in user would get an empty list and a visitor in preview mode gets
 * the labeled sample. Replace the body with a query through the user's own
 * session (row level security applies) when the database is connected.
 */
export async function listProjects(user: SessionUser | null): Promise<Project[]> {
  if (user) return [];
  return [sampleProject];
}

export async function getProject(user: SessionUser | null, id: string): Promise<Project | null> {
  if (user) return null;
  return id === SAMPLE_PROJECT_ID ? sampleProject : null;
}
