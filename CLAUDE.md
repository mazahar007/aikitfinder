# AIKitFinder + AutoFlow AI — project instructions

@AGENTS.md

These rules apply to every session in this repository. The governing requirements document is
Developer Handoff v18; decisions are recorded in `docs/phase-0a/DESIGN_DECISION_LOG.md`.

## Model selection

The owner selects the model with `/model`. If a task does not fit the active model, say so before
starting.

- **Claude Fable 5.2:** complex, multi-step engineering; architecture decisions; repository-wide
  refactoring; database design; authentication; automation engine work; complex integrations;
  final architecture and code review at critical milestones.
- **Claude Opus 5.5:** smaller scoped implementation, routine bug fixes, UI adjustments,
  documentation updates, focused testing.

## Phases and approval

- Work on one phase at a time. Never start multiple major phases at once.
- Do not start a phase, or continue past a major milestone, without the owner's explicit
  approval. At every milestone: report, stop, and wait.
- Do not expand scope on your own initiative. Raise proposals; do not act on them unapproved.

## Changes

- Preserve existing working functionality, routes and URLs.
- Change only files the approved task requires. No unrelated edits or refactors.
- Make a Git checkpoint (separate, clearly described commit) for each distinct step.
- Do not deploy to production, or create or modify a production database, without approval.

## Verification

- Run the actual checks (`pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm build`, and
  automated tests where they exist) and report the real results, including failures.
- At critical milestones, also verify existing functionality in a running build.
- Never claim a feature is implemented, working or tested without checking the actual code and
  results. Documentation or a mockup is not an implementation.
