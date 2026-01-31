# Cursor integration

Bebop works with Cursor by compiling a compact **Active constraints** block from your packs and (optionally) injecting it into your prompt workflow.

## Option 1 (recommended): Automatic hook install

```bash
npm install -g @bebophq/cli
bebop init --auto
```

This installs a Bebop hook for Cursor under `~/.cursor/hooks/` and registers it in Cursor’s settings, so your prompts can get additional Bebop context automatically.

**Requirements**
- `jq` available on your `PATH` (the hook uses it to read Cursor’s JSON payload).

## Option 2: Simple terminal wrapper

Create a small wrapper that compiles your prompt before sending it to Cursor:

```bash
cat > ~/bin/bebop-cursor << 'EOF'
#!/bin/bash
set -e

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  shift
fi

USER_INPUT="$*"
COMPILED=$(BEBOP_TOOL=cursor bebop compile "$USER_INPUT")

if [[ "$DRY_RUN" == "true" ]]; then
  echo "$COMPILED"
  exit 0
fi

cursor chat "$COMPILED"
EOF

chmod +x ~/bin/bebop-cursor
export PATH="$HOME/bin:$PATH"
```

**Usage**

```bash
bebop-cursor "&use core/security &use core/code-quality Create a REST API endpoint"
bebop-cursor --dry-run "&use core/security Create an endpoint"
```

## Tips

- **Force packs** with `&use` / `&pack`, or **let Bebop auto-select** by omitting directives.
- **Run from the relevant directory** so `applies_when.paths` rules match (path-based applicability depends on your current working directory).
- **Track usage** (optional):
  - Start: `bebop hook session-start --tool cursor`
  - Inspect: `bebop stats --session --tool cursor`
  - End: `bebop hook session-end --tool cursor`

## Troubleshooting

- If you don’t see constraints, verify Bebop works:
  - `bebop compile "&use core/security test"`
- If using the auto hook, verify `jq` is installed:
  - `command -v jq`

## Resources

- `docs/integrations/ai-cli-tools.md`
- `DIRECTIVES.md`
- `PACKS.md`
- `docs/troubleshooting.md`
