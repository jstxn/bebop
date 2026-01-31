# Wrapper scripts (AI CLI integrations)

This directory contains simple wrapper scripts that compile your prompt with Bebop before sending it to an AI CLI tool.

## Quick start

```bash
npm install -g @bebophq/cli
bebop init

cp scripts/bebopt.sh ~/bin/bebopt
chmod +x ~/bin/bebopt
export PATH="$HOME/bin:$PATH"
```

## Scripts

### `scripts/bebopt.sh` (universal)

Works with multiple tools:
- `claude` (Claude Code CLI)
- `opencode`
- `cursor`
- `copilot`
- `gpt4` (via `curl`, requires `OPENAI_API_KEY`)

```bash
bebopt <tool> [--dry-run] [--verbose] "<prompt>"
```

Examples:

```bash
bebopt claude "&use core/security &use core/code-quality Create a user service"
bebopt claude --dry-run "&use core/security Create an endpoint"
bebopt opencode "&use core/code-quality Refactor this function"
```

### `scripts/bebop-claude.sh` (Claude Code CLI)

```bash
bebop-claude [--dry-run] [--verbose] "<prompt>"
```

### `scripts/bebop-opencode.sh` (opencode)

```bash
bebop-opencode [--dry-run] [--verbose] "<prompt>"
```

## Directives

The current Bebop CLI supports:

- `&use` — include one or more packs (e.g., `&use core/security &use core/code-quality`)
- `&pack` — include a pack by ID/version (e.g., `&pack core/security@v1`)

See `DIRECTIVES.md` for details (and the roadmap).

## Usage tracking (optional)

These wrappers compile with `--tool <tool>` so you can summarize usage per tool:

```bash
bebop stats --tool claude
```

To group a long run into a session:

```bash
bebop hook session-start --tool claude
# ... run prompts ...
bebop stats --session --tool claude
bebop hook session-end --tool claude
```

## Automatic integration (recommended for daily use)

`bebop init --auto` installs hooks/plugins/aliases for detected tools (Claude Code, Cursor, opencode, etc.).

```bash
bebop init --auto
```
