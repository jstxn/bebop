# Plans: lossless plan IR + step runner

> Status: roadmap / concept. The current Bebop CLI does **not** include `bebop plan ...` or `bebop step ...` commands yet.

## Problem
A full implementation plan can be long. Even if it’s “perfect”, you pay token costs repeatedly if it stays in-context.

## Approach
Represent plans as a small, lossless *plan IR* that the CLI can execute as a **state machine**.

- The CLI holds the plan and the current step pointer.
- The model only sees the current step + minimal constraints.
- The CLI can re-inject just-in-time details (file paths, commands) as needed.

## Plan IR example

```yaml
id: example/screener/create-endpoint
version: 1
vars:
  service_root: services/api/screener
  compose_service: screener
steps:
  - READ: "{service_root}/.claude/claude.md"
  - EDIT: "{service_root}/src/**"
  - TEST: "{service_root}/test/**"
  - RUN: "docker compose run {compose_service} npm run lint"
  - RUN: "docker compose run {compose_service} npm run test"
  - RUN: "docker compose run {compose_service} npm run test:typecheck"
```

## Handles, aliases, and share-codes
You usually don’t want people typing IR.

### Handle by ID

```text
&plan example/screener/create-endpoint@v1 route=POST:/job-postings
```

### Alias
CLI/local config can map short names to IDs:

```toml
# aliases.toml (concept)
[plans]
"screener:add-endpoint" = "example/screener/create-endpoint@v1"
```

Then a user can type:

```text
&plan screener:add-endpoint route=POST:/job-postings
```

### Share-code (optional)
A short code that encodes plan ID + parameters + checksum, e.g.:

```text
&share BPLN1-X7K3-9Q2F-...  # concept only
```

Critically: the model never needs to see the expanded plan.
