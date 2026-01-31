# 🎯 Try Bebop with Claude Code in 2 Minutes

Get consistent, reliable guardrails in Claude Code (without changing how you work).

---

## Quick Start

### Option 1: Pre-compile & Paste (No Setup)

```bash
# 1. Install bebop (30 seconds)
npm install -g @bebophq/cli
bebop init

# 2. Compile prompt (10 seconds)
bebop compile &use core/security &use core/code-quality "Create a user authentication system"

# 3. Copy and paste to Claude Code (20 seconds)
# Open Claude Code (Cmd+K in VS Code)
# Paste the compiled prompt
# Submit
```

**Total time: 1 minute** ✅

### Option 2: CLI Wrapper (2 Minute Setup)

```bash
# 1. Install bebop (30 seconds)
npm install -g @bebophq/cli
bebop init

# 2. Setup wrapper (90 seconds)
cp scripts/bebop-claude.sh ~/bin/bebop-claude
chmod +x ~/bin/bebop-claude
export PATH="$HOME/bin:$PATH"

# 3. Use it (10 seconds)
bebop-claude &use core/security &use core/code-quality "Create a user authentication system"
```

**Total time: 2 minutes** ✅

---

## What You Get

### Without Bebop

```bash
$ claude "Create a user authentication system"

# What tends to happen over long sessions:
# - You repeat standards manually (or assume they're remembered)
# - The agent drifts (misses guardrails, style, tests, etc.)
```

### With Bebop

```bash
$ bebop-claude &use core/security &use core/code-quality "Create a user authentication system"

# What Claude receives (in addition to your task):
# - Active constraints: a compact list of relevant guardrails
# - Context line: project/service signals (when available)
```

---

## See It in Action

### Example 1: Simple Task

```bash
# What you type:
bebop-claude &use core/security &use core/code-quality "Create a REST API endpoint"

# What happens:
📋 Bebop compiled prompt (95 words)

Active constraints:
- [NO_SECRETS] Never add secrets to code.
- [VALIDATE_ALL_INPUTS] Validate all user inputs.
- [WRITE_TEST_COVERAGE] Write tests with >80% coverage.

🤖 Sending to Claude...

# Claude responds with code following all constraints
```

### Example 2: Track a Session (Optional)

```bash
# Start a tracked session for Claude (usage/logging)
bebop hook session-start --tool claude

# Use Claude Code with Bebop (multiple prompts)
bebop-claude &use core/security &use core/code-quality "Create a REST API endpoint"
bebop-claude &use core/security &use core/code-quality "Write tests for the endpoint"

# Check session summary at any time
bebop stats --session --tool claude

# End session and print final summary
bebop hook session-end --tool claude
```

---

## Documentation

- **[Claude Code Integration Guide](docs/integrations/claude-code.md)** - Comprehensive guide
- **[Visual Examples](docs/examples/visual-examples.md)** - See exactly what happens
- **[Quick Start CLI](QUICKSTART_CLI.md)** - 5-minute setup guide
- **[AI CLI Tools](docs/integrations/ai-cli-tools.md)** - Works with any AI CLI

---

## Repository

📦 **https://github.com/jstxn/bebop**

### What's Included

✅ Complete documentation
✅ Ready-to-use wrapper scripts
✅ Template packs and plans
✅ Visual examples
✅ Integration guides for Claude, opencode, Cursor, Copilot

---

## Start Using Bebop Today!

```bash
# Install
npm install -g @bebophq/cli
bebop init

# Try it
bebop compile &use core/security &use core/code-quality "Create a user service"
# Copy and paste to Claude Code

# Or use wrapper
cp scripts/bebop-claude.sh ~/bin/bebop-claude
chmod +x ~/bin/bebop-claude
export PATH="$HOME/bin:$PATH"
bebop-claude &use core/security &use core/code-quality "Create a user service"
```

**Immediate guardrails.** 🚀
