# Pack: example/monorepo-core@v1

This is a starter compiled pack derived from repo-wide conventions in `AGENTS.md` and `CLAUDE.md`.

## Compiled pack (concept)

```yaml
id: example/monorepo-core
version: 1
rules:
  - id: NO_XSVC_IMPORT
    text: "Services are independent; do not import/cross-reference files across services/** at runtime; use HTTP/queues."
    applies_when: { paths: ["services/**"] }

  - id: NO_SECRETS
    text: "Never add secrets (keys, tokens, passwords) to code, docs, logs, or commits."
    applies_when: { any: true }

  - id: VALIDATE_IN_DOCKER
    text: "Run lint/test/typecheck in Docker for the specific service you changed to match CI."
    applies_when: { paths: ["services/**"] }

  - id: VALIDATE_CHANGED_FILES_FIRST
    text: "Prefer targeted eslint/tsc on changed files; fall back to full project typecheck if needed."
    applies_when: { paths: ["services/**"], languages: ["ts","tsx"] }

  - id: TECH_BRIEF_FOR_SIGNIFICANT
    text: "For significant work, create a tech brief (docs/techbriefs) before implementation."
    applies_when: { any: true }

  - id: NO_DIRECT_MAIN_COMMITS
    text: "Do not commit or push directly to protected branches (main/staging); use PRs."
    applies_when: { any: true }
```

## Usage

```text
&pack example/monorepo-core@v1
```
