# Packs: instructions as atomic rule IDs

## Problem
Repo guidance is usually in prose (Markdown). That’s great for humans, but expensive and noisy for models.

## Approach
A *pack* is a compiled set of:
- **Atomic rule IDs** (short, stable identifiers)
- **Rule text** (minimal, “load-bearing” statement)
- **Applicability metadata** (when this rule applies)
- Optional **enforcement hooks** (things the CLI can validate without prompting)

This enables:
- Sending only a small subset of rules for the current task.
- Enforcing constraints outside the model (e.g., “no secrets” scan), reducing rework and increasing reliability.

## Pack example (compiled form)

```yaml
id: example/monorepo-core
version: 1
rules:
  - id: NO_XSVC_IMPORT
    text: "Services are independent; no runtime imports across services/**; communicate via HTTP/queues."
    applies_when:
      paths: ["services/**"]
    enforce:
      type: diff-scan
      deny_patterns:
        - "services/**/../services/**"  # illustrative

  - id: NO_SECRETS
    text: "Never add secrets (keys/tokens/passwords) to code, docs, logs."
    applies_when:
      any: true
    enforce:
      type: secret-scan
      level: block

  - id: DOCKER_VALIDATION_PREFERRED
    text: "Run lint/test/typecheck in Docker for the affected service to match CI."
    applies_when:
      paths: ["services/**"]
```

## Source packs vs compiled packs
- *Source pack*: human docs (Markdown), rich context, examples.
- *Compiled pack*: minimal rule set + metadata.

In practice you can start manually (hand-written compiled packs), then later add a compiler.

## Selection and “active constraints”
The CLI should select rules based on context such as:
- Working directory (repo + service)
- Changed file paths
- Language (ts/js/py)
- Framework/service signals detected from the repo (when available)

Then it should send the model something like:

```text
Active constraints:
- [RULE_ID] one-line rule
- ...
```

…and keep the rest out of context.

## Working with packs (current CLI)
- List packs: `bebop pack list`
- Inspect a pack: `bebop pack show core/security@v1`
- Import a pack file into your registry: `bebop pack import <file>`
- Apply packs to a prompt: `bebop compile "&use core/security Create an endpoint"`
