# Semdok Harness integration

This guide is added by the Semdok Design Review plugin. It is not part of upstream EGM.

## Invocation and resources

Start messages with `/egm-brainstorm`, `/egm-draft`, or `/egm-review` (also `/egm-resolve`, `/egm-review-loop`,
`/egm-drift-report`, and `/egm-bootstrap`). These skills are user-invoked only: the `skill` tool refuses them. To run
another EGM skill during a flow (for example `egm-review-loop` or `egm-resolve` during review Stages 7 and 9), read
its `SKILL.md` under the EGM root's `skills/<name>/` folder and follow it in the same thread. Keep drafting and
orchestration in the main context.

The invoked skill states the EGM root as an absolute path. Resolve `agents/`, `resources/`, and `docs/` against
that root, and resolve `references/` against the invoked skill's base directory. Never search for another copy of
EGM. Review targets and generated artifacts belong to the user's workspace, not the plugin folder.

Write briefs, drafts, and reports to the user's working directory. If the user's prompt or `AGENTS.md` has a line
`EGM artifact directory: <path>`, write them there instead. Resolve a relative path against the working directory;
if it resolves outside the working directory, ask the user to confirm before writing there. Create the folder if it
does not exist.

Semdok Harness has no artifact comments. To request draft revisions, the user edits `design_draft.md` directly, adds
`<!-- -->` comments in it, or gives the notes in chat. Read the draft again before each revision. For the handoff
choices that EGM shows as a question modal, use a structured question tool if this session has one; otherwise list
the numbered options in chat and wait for the answer.

## Goldfish reviewers

Spawn every Goldfish with the `subagent` tool. Semdok Harness does not register named EGM subagents, so each
reviewer is a general subagent that reads its persona file first. Each call must:

- Start a **new** subagent for each independent review. Never reuse or continue an earlier reviewer.
- Set `cwd` to the user's working directory.
- When the tool lists an `agent_preset` named `team-reviewer` (Agent Team plugin, Orchestrator mode), set
  `agent_preset: team-reviewer`; it can read files but cannot edit them. Otherwise omit `agent_preset`.
- Use a self-contained `prompt`, because the subagent sees none of this conversation. Begin it with:

  ```text
  You are an EGM Goldfish reviewer with no prior context. First read your persona file
  <absolute EGM root>/agents/<persona>.md and follow it exactly. Read any standard it names from
  <absolute EGM root>/resources/document_standards/. You are read-only: do not create, edit, or delete files and do
  not run commands. If you cannot read your persona or standard, say so and stop; you have not reviewed.
  Return your complete findings as your closing message.
  ```

  Then add the task text that the EGM skill specifies for that reviewer, verbatim, with absolute paths to the review
  target and to any files named in Goldfish context. Do not copy your own deliberation, earlier findings from other
  reviewers (unless the skill says to pass them), or unrelated conversation.

Do not launch the synthesizer as a child. Dispatch the reviewers of each stage directly from the main context, then
do the synthesizer's work yourself: read `agents/synthesizer.md` for how to merge, de-duplicate, and rank findings,
and write the report.

Subagents run in the background. Start all reviewers of the current stage in one turn, then wait until a completion
notice has arrived for every one of them before you write that stage's report. Keep the review stages sequential:
finish a stage, write its report, and complete the required remediation before dispatching the next stage.
Uninterrupted mode skips human checkpoints, not these stage dependencies.

Subagents cannot ask the user for approval, so a reviewer's file read that needs approval fails. A reviewer that
reports it could not read its persona or the target has not reviewed: tell the user, and do not count its result.

Reviewers cannot open URLs. Do not pass documentation URLs as Goldfish context: save the page as a file in the
workspace and pass that path instead.

Fresh subagents exclude this conversation's history. This is context isolation, not filesystem isolation: reviewers
can read accessible files, so pass required review constraints explicitly.
