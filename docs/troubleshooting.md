# Troubleshooting guide

Common issues and fixes for Bebop.

## Install issues

### `npm install -g @bebophq/cli` fails (permissions)

```bash
# Recommended: use nvm
nvm install 18
nvm use 18
npm install -g @bebophq/cli
```

### `bebop: command not found`

```bash
npm config get prefix
export PATH="$(npm config get prefix)/bin:$PATH"
command -v bebop
```

## Registry / init issues

### Error: `REGISTRY_NOT_FOUND`

```bash
bebop init
ls -la ~/.bebop/
```

If you use a custom registry path, set `BEBOP_REGISTRY`:

```bash
export BEBOP_REGISTRY="$HOME/.bebop"
```

## Pack issues

### Error: `PACK_NOT_FOUND`

```bash
bebop pack list
bebop pack show core/security@v1
```

If you haven’t installed the template packs yet, run:

```bash
bebop init
```

To add your own pack file to the registry:

```bash
bebop pack import ./my-pack.md
```

### Warning: `missing packs: ...`

This usually means you referenced a pack that isn’t installed (e.g. via `&use` / `&pack`).

- Confirm the ID is correct with `bebop pack list`
- Confirm the version is available (e.g. `core/security@v1`)

### Pack rules not being selected

1) Confirm the pack is loaded:

```bash
bebop pack show core/security@v1
```

2) Check what Bebop selected for your prompt:

```bash
bebop compile --json "&use core/security Create an endpoint"
```

3) If your pack uses `applies_when.paths`, run Bebop from the relevant directory (path-based applicability depends on `cwd`):

```bash
cd services/api/users
bebop compile "&use core/security Add login endpoint"
```

## Auto-selection issues (`.bebop-auto.yaml`)

Bebop can auto-select packs based on detected context. Configuration is loaded from `.bebop-auto.yaml` / `.bebop-auto.yml` by searching upward from your working directory.

### “Bebop isn’t picking the packs I expect”

```bash
bebop select-packs --verbose --json --input "Create an endpoint"
```

### “My config isn’t being applied”

- Confirm the config file exists somewhere above your `cwd`:
  - `.bebop-auto.yaml` or `.bebop-auto.yml`
- Validate it’s valid YAML (a syntax error may cause Bebop to ignore parts of it).

## Enforcement issues

### Error: `ENFORCEMENT_FAILED`

If a pack includes enforcement hooks (e.g. “no secrets”), Bebop can block prompts that violate them.

- Remove the sensitive content from the prompt/input.
- Adjust the pack rules if your org’s policy differs.
- Disable enforcement (if appropriate):

```bash
bebop compile --no-enforce "&use core/security Create an endpoint"
```

## Integration issues (Claude Code / Cursor / opencode)

### Automatic integration didn’t install

Run:

```bash
bebop init --auto
```

Notes:
- The Claude/Cursor hook scripts use `jq`. Install it if needed:
  - `command -v jq`
- Claude hook location: `~/.claude/hooks/`
- Cursor hook location: `~/.cursor/hooks/`
- opencode plugin location: `~/.config/opencode/plugin/`

## Stats / usage logging

### `bebop stats` shows no usage

- Run a few prompts through `bebop compile` / `bebop compile-auto` first.
- Ensure usage logging isn’t disabled:
  - `BEBOP_USAGE_LOG=0` disables logging.

### Group stats by tool

Use `--tool` (or set `BEBOP_TOOL`) so Claude/Cursor/opencode runs don’t mix together:

```bash
BEBOP_TOOL=claude bebop compile "&use core/security Create an endpoint"
bebop stats --tool claude
```

### Track a “session” for a long run (optional)

```bash
bebop hook session-start --tool claude
# ... run prompts ...
bebop stats --session --tool claude
bebop hook session-end --tool claude
```

### Reset logs (destructive)

```bash
rm -f ~/.bebop/logs/usage.jsonl ~/.bebop/logs/sessions.json
```
