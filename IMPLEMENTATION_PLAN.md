# Bebop implementation plan (v1)

This is a phased, shippable plan for building Bebop as a shareable CLI.

## Phase 0 — scope + UX
- Decide supported environments (local-only first)
- Decide directive set v1 (`&pack`, `&use`, `&plan`, `&svc`, `&step`, `&dry-run`)
- Decide registry layout (e.g., `~/.bebop/`)
- Decide init UX (`bebop init` and/or `/init`) and what it scaffolds

## Phase 1 — directive preprocessor (biggest win)
- Parse `&...` lines from user input
- Strip them from text sent to the model
- Produce a “compiled prompt” with:
  - task summary
  - active constraints (rule IDs + one-liners)
  - current step (if plan selected)

Success metric: large Markdown docs are never pasted into model context.

## Phase 2 — local registry (packs + plans)
- Resolve `&use` aliases → `&pack` IDs
- Resolve `&plan` aliases → plan IDs
- Store registry under `~/.bebop/` (repo-specific namespaces later)
- Add a “decoder” for share-codes (plan ID + params + checksum)

## Phase 3 — `init` scaffolding
- `init` creates folders + starter packs/plans/aliases
- Optional: `init --project` seeds a project namespace (e.g., `projects/example-microservices`)
- Optional: `init --import` snapshots key repo docs into source packs (manual compilation first)

## Phase 4 — packs (manual first)
- Hand-author a small number of high-value compiled packs
- Rule selection based on:
  - repo/service context
  - file paths
  - user `&svc`
- Render “active constraints” consistently

## Phase 5 — plan runner
- Interpret plan IR as a state machine
- Persist step pointer per session (or per repo/task)
- Only send the current step to the model

## Phase 6 — enforcement hooks
- Add non-LLM validations (secret scan, forbidden imports, command allowlists)
- Fail fast before prompting the model where possible

## Phase 7 — distribution + sharing
- Decide packaging (npm, pipx, standalone binary)
- Add share-codes (optional)
- Add docs and examples

## Non-goals (v1)
- “Compressing prompts” via text encoding alone
- Remote registries or network dependencies
- Fully automatic doc → rule compiler (can be added later)
