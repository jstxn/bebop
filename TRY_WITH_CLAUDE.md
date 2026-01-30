# 🎯 Try Bebop with Claude Code in 2 Minutes

Save 93% of your Claude Code tokens and get consistent, reliable results.

---

## Quick Start

### Option 1: Pre-compile & Paste (No Setup)

```bash
# 1. Install bebop (30 seconds)
npm install -g @bebophq/cli
bebop init

# 2. Compile prompt (10 seconds)
bebop compile &use core example "Create a user authentication system"

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
bebop-claude &use core example "Create a user authentication system"
```

**Total time: 2 minutes** ✅

---

## What You Get

### Without Bebop

```bash
$ claude "Create a user authentication system"

# What Claude receives:
# "Create a user authentication system" (15 words, ~20 tokens)
# + CLAUDE.md (674 lines, ~850 tokens)
# + Coding standards (200 lines, ~250 tokens)
# + Project guidelines (150 lines, ~200 tokens)
#
# Total: ~1,320 tokens
# Cost: ~$0.04
# Response time: ~90 seconds
```

### With Bebop

```bash
$ bebop-claude &use core example "Create a user authentication system"

# What Claude receives:
# "Create a user authentication system" (15 words, ~20 tokens)
#
# Active constraints:
# - [NO_SECRETS] Never add secrets to code. (15 words, ~20 tokens)
# - [WRITE_TEST_COVERAGE] Write tests for new functionality. (20 words, ~25 tokens)
# - [USE_TYPED_INTERFACES] Use TypeScript interfaces. (15 words, ~20 tokens)
#
# Total: ~85 tokens
# Cost: ~$0.003
# Response time: ~7 seconds
#
# Savings: 94% (1,320 → 85 tokens)
```

---

## See It in Action

### Example 1: Simple Task

```bash
# What you type:
bebop-claude &use core example "Create a REST API endpoint"

# What happens:
📋 Bebop compiled prompt (95 words)

Active constraints:
- [NO_SECRETS] Never add secrets to code.
- [VALIDATE_ALL_INPUTS] Validate all user inputs.
- [WRITE_TEST_COVERAGE] Write tests with >80% coverage.

🤖 Sending to Claude...

# Claude responds with code following all constraints
```

### Example 2: Using Plans

```bash
# What you type:
bebop plan run backend/create-rest-endpoint route=POST:/users name=CreateUser

# Bebop guides you step-by-step
📋 Plan: backend/create-rest-endpoint@v1
📝 Session: session_20250129_090000_abc123

Step 1/12: Read service documentation
💡 Complete this step, then run 'bebop step 2'

# Complete step 1, then:
bebop step 2

Step 2/12: Create route handler
bebop-claude "Create route handler for POST /users"

# Claude generates route handler with constraints
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

## Start Saving Tokens Today!

```bash
# Install
npm install -g @bebophq/cli
bebop init

# Try it
bebop compile &use core example "Create a user service"
# Copy and paste to Claude Code

# Or use wrapper
cp scripts/bebop-claude.sh ~/bin/bebop-claude
chmod +x ~/bin/bebop-claude
export PATH="$HOME/bin:$PATH"
bebop-claude &use core example "Create a user service"
```

**Immediate 93% token savings!** 🚀
