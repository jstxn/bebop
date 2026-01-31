# Bebop

<div align="center">

<img src="assets/bebop.png" alt="Bebop" width="150" height="150">

**Automatic prompt optimization for AI coding agents**

[![npm version](https://badge.fury.io/js/%40bebophq%2Fcli.svg)](https://badge.fury.io/js/%40bebophq%2Fcli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Automatic guardrails and context-aware constraints (across Claude Code, Cursor, Codex, and more)

</div>

---

## What is Bebop?

Bebop is a **guardrails layer** for AI coding assistants like **Claude Code**, **Cursor**, and **Codex**. It works invisibly in the background, injecting relevant coding constraints so your standards stay consistent across tools and across long sessions.

**The problem:** your standards live in docs, wikis, `CLAUDE.md`, and tribal knowledge. In practice, people either paste rules repeatedly or skip them—and the agent drifts (security misses, style inconsistency, “why did you do X?” back-and-forth).

**The solution:** Bebop compiles your rules into **versioned constraint packs** and automatically injects the right constraints for the current context. This makes outputs more reliable and reduces rework. In workflows where teams currently paste long guidelines, it can also reduce prompt boilerplate significantly.

**Note:** Bebop does **not** change a model’s hard context window or a provider’s usage limits—it helps you use the context you already have more effectively.

---

## Quick Start

```bash
# Install
npm install -g @bebophq/cli

# Set up automatic integration
bebop init --auto

# That's it! Now use your AI coding agent normally.
# Bebop works invisibly in the background.
```

After running `bebop init --auto`:
- Open Claude Code, Cursor, or your preferred AI agent
- Type prompts normally
- Bebop automatically adds relevant constraints
- You never need to think about it

---

## How It Works

When you type a prompt in your AI coding agent:

```
You type:
  "Create a REST API for user registration"

Bebop automatically adds:
  Active constraints:
  - [NO_SECRETS] Never add secrets to code...
  - [VALIDATE_ALL_INPUTS] Validate all user inputs...
  - [WRITE_TEST_COVERAGE] Write tests with >80% coverage...

Claude receives both your prompt AND the constraints.
```

You see only your original prompt. Bebop's constraints are injected as additional context that Claude can see and follow.

---

## Supported Tools

| Tool | Status | Integration Method |
|------|--------|-------------------|
| **Claude Code** | ✅ Supported | UserPromptSubmit hook |
| **Cursor** | ✅ Supported | Hook integration |
| **opencode** | ✅ Supported | Plugin |
| **Codex** | ✅ Supported | Shell aliases |

Run `bebop init --auto` to automatically detect and configure your installed tools.

---

## Check Your Stats

See what Bebop is injecting and the estimated prompt impact:

```bash
bebop stats
```

```
Bebop usage summary
Prompts: 47
Est. tokens (unfiltered rules): 12,450
Est. tokens (compiled): 1,890
Est. reduction vs unfiltered: 10,560
Avg reduction vs unfiltered: 85%
Note: "unfiltered rules" = all rules from selected packs; token counts are estimates.
```

---

## Constraint Packs

Bebop includes two core packs:

**`core/security`** - Security best practices
- No hardcoded secrets
- Input validation
- Parameterized queries
- Encrypt sensitive data

**`core/code-quality`** - Code standards
- Write tests (>80% coverage)
- Follow linting rules
- Use typed interfaces
- Keep functions small

Bebop automatically selects relevant packs based on your project context.

### Create Custom Packs

Add your team's standards in `~/.bebop/packs/`:

```markdown
---
id: my-team/api-standards
version: 1
---

# API Standards

rules:
  - id: USE_REST_CONVENTIONS
    constraint: "Use RESTful conventions for all API endpoints."

  - id: RETURN_CONSISTENT_ERRORS
    constraint: "Return errors as: { error: string, code: string }"
```

---

## Advanced: CLI Commands

For debugging or manual workflows:

```bash
# See what context Bebop detects
bebop detect-context

# Manually compile a prompt
bebop compile "Create a login API"

# Compile with specific packs
bebop compile --packs "core/security" "Add authentication"

# List available packs
bebop pack list

# View usage statistics
bebop stats
```

---

## Configuration

### Project-Level Config

Create `.bebop-auto.yaml` in your project root:

```yaml
# Always include these packs
include:
  - core/security
  - my-team/standards

# Exclude packs
exclude:
  - core/code-quality

# Keyword triggers
keywords:
  auth: [core/security]
  test: [core/testing]
```

### Disable for a Project

```yaml
# .bebop-auto.yaml
enabled: false
```

---

## Troubleshooting

### Hooks not working?

```bash
# Verify installation
bebop init --auto

# Check if hooks are installed
cat ~/.claude/settings.json | grep bebop
```

### Not seeing constraints?

Bebop skips very short prompts (< 3 words) and slash commands. Try a longer, natural language prompt.

### Want to see what's happening?

```bash
# Manual compilation shows exactly what Bebop adds
bebop compile "Your prompt here"
```

---

## Uninstall

Remove Bebop hooks:

```bash
# Edit your settings file and remove bebop entries
# For Claude Code:
nano ~/.claude/settings.json
# Remove the bebop-hook.sh entry from UserPromptSubmit
```

Uninstall the CLI:

```bash
npm uninstall -g @bebophq/cli
```

---

## Contributing

```bash
git clone https://github.com/bebophq/cli.git
cd cli
npm install
npm run build
npm test
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT

---

**Questions?** Open an issue at [github.com/bebophq/cli](https://github.com/bebophq/cli/issues)
