# Bebop directives (`&...`)

## What counts as a directive
In the current CLI, a “directive” is a **whitespace-separated token** that starts with `&` (e.g. `&use`).

For best results (and fewer surprises), put directives at the start of your prompt.

- Directives are interpreted by the Bebop CLI.
- Directives should be **stripped** from the text sent to the model.
- Directives should be treated as **trusted user input** (not something the model can generate to control the CLI).

Recommended rule: only process directives from the *human’s prompt input*, never from model output.

## Supported directives (current)

### Packs

Load a specific pack by ID:

```text
&pack example/monorepo-core@v1
```

Load common packs via aliases:

```text
&use core nestjs
```

## Planned directives (roadmap)
These are **not implemented** in the current Bebop CLI, but are part of the long-term design:

- `&plan`, `&step` — step-runner / plan IR (see `PLANS.md`)
- `&svc` — explicit service hint
- `&rules` — per-prompt rule overrides
- `&dry-run` — directive-based dry-run (today this is typically a wrapper flag)

## Parsing conventions
- Prefer simple `key=value` params.
- Keep everything single-line and whitespace-tolerant.
- Today, unknown directives are ignored (and stripped from the task). Long-term, they should become errors or warnings to avoid silent misconfiguration.

## Why `&`
`&` is uncommon at the start of a line in normal prose, easy to scan, and easy to grep.
