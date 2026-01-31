# Integration Guide: AI CLI Tools

How to use Bebop with your existing AI coding assistants.

## Table of Contents

- [Quick Overview](#quick-overview)
- [Integration Patterns](#integration-patterns)
- [Claude Code](#claude-code)
- [OpenAI CLI](#openai-cli)
- [opencode](#opencode)
- [Cursor CLI](#cursor-cli)
- [GitHub Copilot CLI](#github-copilot-cli)
- [Other Tools](#other-tools)
- [Advanced Setup](#advanced-setup)

---

## Install Bebop

```bash
npm install -g @bebophq/cli
bebop init
```

## Quick Overview

Bebop works with **any** AI CLI tool through 3 integration patterns:

1. **Wrapper** - Bebop wraps the CLI (seamless)
2. **Pre-compile** - Bebop compiles, you paste (manual)
3. **Middleware** - Bebop sits between user and CLI (advanced)

**Choose based on:**
- **Convenience**: Wrapper (best for daily use)
- **Flexibility**: Pre-compile (works with any tool)
- **Control**: Middleware (advanced users)

---

## Integration Patterns

### Pattern 1: Wrapper (Recommended)

Bebop wraps your CLI tool.

**Pros:**
- ✅ Seamless user experience
- ✅ Single command
- ✅ Automatic compilation
- ✅ Works with aliases

**Cons:**
- ❌ Requires wrapper script
- ❌ Tool-specific setup

**How it works:**
```
User types: bebop-claude "create a user service"
           ↓
    Bebop CLI
           ↓
    Compile prompt
           ↓
    Send to Claude CLI
           ↓
    User sees response
```

**Example:**
```bash
# User command
bebop-claude &use core/security &use core/code-quality Create a user authentication system

# Bebop internally runs:
compiled=$(bebop compile "&use core/security &use core/code-quality Create a user authentication system")
claude "$compiled"
```

---

### Pattern 2: Pre-compile (Universal)

Bebop compiles the prompt, you paste to your CLI.

**Pros:**
- ✅ Works with ANY tool
- ✅ No scripts needed
- ✅ Full control
- ✅ Easy to debug

**Cons:**
- ❌ Two-step process
- ❌ Manual copy-paste
- ❌ Not seamless

**How it works:**
```
User types: bebop compile "&use core/code-quality Create a user service"
           ↓
    Bebop CLI
           ↓
    Output compiled prompt
           ↓
    User copies prompt
           ↓
    User pastes to Claude CLI
           ↓
    User sees response
```

**Example:**
```bash
# Step 1: Compile
$ bebop compile &use core/security &use core/code-quality "Create a user authentication system"

Task: Create a user authentication system

Active constraints:
- [NO_SECRETS] Never add secrets (keys, tokens, passwords) to code or docs.

# Step 2: Copy and paste to your CLI
$ claude "Task: Create a user authentication system

Active constraints:
- [NO_SECRETS] Never add secrets (keys, tokens, passwords) to code or docs."
```

---

### Pattern 3: Middleware (Advanced)

Bebop sits between user input and CLI via hooks/interceptors.

**Pros:**
- ✅ Most flexible
- ✅ Can modify responses
- ✅ Full control

**Cons:**
- ❌ Most complex
- ❌ Tool-specific
- ❌ Harder to maintain

**How it works:**
```
User types: my-cli-agent "create a user service"
           ↓
    Shell hook intercepts
           ↓
    Bebop compilation
           ↓
    Modified command to CLI
           ↓
    Response post-processed
           ↓
    User sees final output
```

**Example:**
```bash
# Shell function that intercepts commands
my-cli-agent() {
  local input="$@"
  local compiled=$(bebop compile "$input")
  echo "📋 Bebop compiled prompt:"
  echo "$compiled"
  echo ""
  echo "🤖 Sending to agent..."
  
  # Send to your CLI tool
  claude "$compiled"
}
```

---

## Claude Code

### Quick Setup (Wrapper Pattern)

```bash
# 1. Install bebop
npm install -g @bebophq/cli
bebop init

# 2. Create wrapper function
cat > ~/bin/bebop-claude << 'EOF'
#!/bin/bash
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  shift
fi

USER_INPUT="$*"

# Compile prompt
COMPILED=$(BEBOP_TOOL=claude bebop compile "$USER_INPUT")

# Send to Claude
if [[ "$DRY_RUN" == "true" ]]; then
  echo "$COMPILED"
  exit 0
fi
claude "$COMPILED"
EOF

chmod +x ~/bin/bebop-claude

# 3. Add to PATH
export PATH="$HOME/bin:$PATH"
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
```

**Usage:**
```bash
# Basic usage
bebop-claude &use core/security &use core/code-quality "Create a user authentication system"

# Dry run (see compiled prompt)
bebop-claude --dry-run &use core/code-quality "Create a function"

# Let Bebop auto-select packs (no directives)
bebop-claude "Create a user authentication system"
```

### Alternative: Shell Alias

```bash
# Add to ~/.bashrc or ~/.zshrc
alias claude='function _claude() { bebop compile "$@" | claude; }; _claude'

# Usage
claude &use core/code-quality "Create a feature"
```

### Integration with opencode

If you're using opencode:

```bash
# Create opencode wrapper
cat > ~/bin/bebop-opencode << 'EOF'
#!/bin/bash
USER_INPUT="$@"
COMPILED=$(bebop compile "$USER_INPUT")
opencode "$COMPILED"
EOF

chmod +x ~/bin/bebop-opencode

# Usage
bebop-opencode &use core/code-quality "Create a user service"
```

### Usage tracking (optional)

```bash
# Start a tracked session
bebop hook session-start --tool claude

# Use Claude with Bebop
bebop-claude &use core/security &use core/code-quality "Create user authentication"

# Check session summary
bebop stats --session --tool claude

# End session and print final summary
bebop hook session-end --tool claude
```

---

## OpenAI CLI

### Quick Setup (Wrapper Pattern)

```bash
# 1. Install OpenAI CLI
pip install openai

# 2. Create wrapper
cat > ~/bin/bebop-openai << 'EOF'
#!/bin/bash
USER_INPUT="$@"

# Compile prompt
COMPILED=$(bebop compile "$USER_INPUT")

# Send to OpenAI
openai api chat.completions.create -m gpt-4 -g "user" "$COMPILED"
EOF

chmod +x ~/bin/bebop-openai

# Usage
bebop-openai &use core/code-quality "Create a REST API"
```

### Alternative: Using curl directly

```bash
cat > ~/bin/bebop-gpt4 << 'EOF'
#!/bin/bash
USER_INPUT="$@"
COMPILED=$(bebop compile "$USER_INPUT")

curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d "{
    \"model\": \"gpt-4\",
    \"messages\": [{\"role\": \"user\", \"content\": \"$COMPILED\"}]
  }"
EOF

chmod +x ~/bin/bebop-gpt4

# Usage
bebop-gpt4 &use core/code-quality "Create a function"
```

---

## opencode

Since opencode is an AI CLI tool (like me!), here's how to integrate:

### Quick Setup (Wrapper Pattern)

```bash
# 1. Install bebop
npm install -g @bebophq/cli
bebop init

# 2. Create opencode wrapper
cat > ~/bin/bebop-opencode << 'EOF'
#!/bin/bash
USER_INPUT="$@"

# Support --dry-run flag
if [[ "$USER_INPUT" == *"--dry-run"* ]]; then
  bebop compile "$USER_INPUT"
  exit 0
fi

# Compile prompt
COMPILED=$(bebop compile "$USER_INPUT")

# Send to opencode
opencode "$COMPILED"
EOF

chmod +x ~/bin/bebop-opencode

# 3. Add to PATH
export PATH="$HOME/bin:$PATH"
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
```

**Usage:**
```bash
# Basic usage
bebop-opencode &use core/security &use core/code-quality "Create a user authentication system"

# Dry run
bebop-opencode --dry-run &use core/code-quality "Create a feature"

# Let Bebop auto-select packs (no directives)
bebop-opencode "Create a user authentication system"
```

### Usage tracking (optional)

```bash
# Start a tracked session
bebop hook session-start --tool opencode

# Use opencode with Bebop
bebop-opencode &use core/code-quality "Create user service"

# Check session summary
bebop stats --session --tool opencode

# End session and print final summary
bebop hook session-end --tool opencode
```

### Advanced: Function with Auto-Detection

```bash
# Enhanced wrapper with workspace detection
cat > ~/bin/bebop-opencode << 'EOF'
#!/bin/bash
USER_INPUT="$@"

# Auto-detect workspace
WORKSPACE=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
export BEBOP_WORKSPACE="$WORKSPACE"

# Compile prompt
COMPILED=$(bebop compile "$USER_INPUT")

# Display compilation stats
if [[ "$USER_INPUT" != *"--dry-run"* ]]; then
  echo "📋 Bebop compiled prompt ($(echo "$COMPILED" | wc -w) words)"
  echo ""
fi

# Send to opencode
opencode "$COMPILED"
EOF

chmod +x ~/bin/bebop-opencode
```

### Roadmap: Plan runner

Long-term, Bebop will support multi-step plan execution via a plan IR + step runner. This is **not implemented** in the current CLI yet.

See `PLANS.md` for the roadmap.

---

## Cursor CLI

Already covered in [Cursor Integration Guide](cursor.md), but quick summary:

```bash
# Create wrapper
cat > ~/bin/bebop-cursor << 'EOF'
#!/bin/bash
USER_INPUT="$@"
COMPILED=$(bebop compile "$USER_INPUT")
cursor chat "$COMPILED"
EOF

chmod +x ~/bin/bebop-cursor

# Usage
bebop-cursor &use core/code-quality "Create a user service"
```

---

## GitHub Copilot CLI

### Setup

```bash
# Install Copilot CLI (if not already)
npm install -g @githubnext/copilot-cli

# Create wrapper
cat > ~/bin/bebop-copilot << 'EOF'
#!/bin/bash
USER_INPUT="$@"
COMPILED=$(bebop compile "$USER_INPUT")

copilot "$COMPILED"
EOF

chmod +x ~/bin/bebop-copilot

# Usage
bebop-copilot &use core/code-quality "Create a function"
```

---

## Other Tools

### Pattern: Universal Pre-compile

Works with ANY CLI tool:

```bash
# Step 1: Compile
$ bebop compile &use core/code-quality "Create a user service"

Task: Create a user service

Active constraints:
- [NO_SECRETS] Never add secrets to code.
- [USE_TYPED_INTERFACES] Use TypeScript interfaces.

# Step 2: Copy and paste to any CLI
$ your-ai-cli "[paste compiled prompt here]"
```

### Pattern: Shell Function

Create a generic wrapper:

```bash
# Generic wrapper for any CLI tool
bebopt() {
  local tool=$1
  shift
  local input="$@"
  
  local compiled=$(bebop compile "$input")
  echo "📋 Sending compiled prompt to $tool..."
  $tool "$compiled"
}

# Usage
bebopt claude &use core/code-quality "Create a feature"
bebopt opencode &use core/code-quality "Create a feature"
bebopt cursor &use core/code-quality "Create a feature"
```

### Pattern: Pipe-based

Use bebop output as input:

```bash
# Compile and pipe to any tool
bebop compile "&use core/code-quality Create a feature" | your-ai-cli

# Or with shell function
alias ai-bebop='bebop compile "$(cat)" | your-ai-cli'

# Usage
echo "&use core/code-quality Create a feature" | ai-bebop
```

---

## Advanced Setup

### Auto-Detect Tool

```bash
# Smart wrapper that detects which AI CLI you're using
bebopt() {
  local input="$@"
  local compiled=$(bebop compile "$input")
  
  # Detect available tools
  if command -v claude &> /dev/null; then
    claude "$compiled"
  elif command -v opencode &> /dev/null; then
    opencode "$compiled"
  elif command -v cursor &> /dev/null; then
    cursor "$compiled"
  elif command -v copilot &> /dev/null; then
    copilot "$compiled"
  else
    echo "❌ No AI CLI found. Please install one of: claude, opencode, cursor, copilot"
    return 1
  fi
}

# Usage (automatically uses available tool)
bebopt &use core/code-quality "Create a feature"
```

### Multi-Tool Support

```bash
# Use different tools for different tasks
bebopt-coding() { bebop compile "$@" | claude; }
bebopt-writing() { bebop compile "$@" | opencode; }
bebopt-refactoring() { bebop compile "$@" | cursor; }

# Usage
bebopt-coding &use core/code-quality "Write a function"
bebopt-writing &use core/code-quality "Write documentation"
bebopt-refactoring &use core/security "Refactor auth code"
```

### Interactive Tool Selection

```bash
bebopt-interactive() {
  local input="$@"
  local compiled=$(bebop compile "$input")
  
  echo "Select AI tool:"
  echo "1) Claude"
  echo "2) opencode"
  echo "3) Cursor"
  echo "4) Copilot"
  read -p "Choice [1-4]: " choice
  
  case $choice in
    1) claude "$compiled" ;;
    2) opencode "$compiled" ;;
    3) cursor "$compiled" ;;
    4) copilot "$compiled" ;;
    *) echo "Invalid choice" ;;
  esac
}

# Usage
bebopt-interactive &use core/code-quality "Create a feature"
```

### Environment Variable Configuration

```bash
# Set your preferred AI tool
export BEBOP_DEFAULT_AI_TOOL="claude"  # or "opencode", "cursor", etc.

# Wrapper that uses default
bebopt-default() {
  local input="$@"
  local compiled=$(bebop compile "$input")
  
  local tool=${BEBOP_DEFAULT_AI_TOOL:-claude}
  $tool "$compiled"
}

# Usage
bebopt-default &use core/code-quality "Create a feature"
```

### Tool tagging (for stats)

```bash
# Tag usage records so `bebop stats --tool ...` works
BEBOP_TOOL=claude bebop compile "&use core/code-quality Create a feature"
BEBOP_TOOL=opencode bebop compile "&use core/code-quality Create a feature"
```

---

## Best Practices

### 1. Start Simple

```bash
# Use pre-compile pattern first
$ bebop compile &use core/code-quality "Create a feature"
# Copy and paste to your CLI
```

### 2. Gradual Adoption

```bash
# Start with wrapper for most-used tool
cat > ~/bin/bebop-claude << 'EOF'
#!/bin/bash
USER_INPUT="$@"
COMPILED=$(bebop compile "$USER_INPUT")
claude "$COMPILED"
EOF

chmod +x ~/bin/bebop-claude

# Use for common tasks, fall back to pre-compile for others
```

### 3. Use Dry Run

```bash
# Always use --dry-run first
bebop-claude --dry-run &use core/security &use core/code-quality "Create a complex feature"
# Review compiled prompt
# Then run without --dry-run
bebop-claude &use core/security &use core/code-quality "Create a complex feature"
```

### 4. Inspect Prompt Impact

```bash
# Compare word counts (task-only vs compiled prompt)
$ echo "Create a feature" | wc -w
# Output: 3 words

$ bebop compile "&use core/security &use core/code-quality Create a feature" | wc -w
# Output: 87 words (includes constraints)

# Tip: if your workflow currently involves pasting long guidelines into prompts,
# this is where Bebop can reduce boilerplate. Otherwise, the win is consistency.
```

### 5. Monitor Performance

```bash
# Track compilation time
time bebop compile &use core/security &use core/code-quality "Create a feature"

# Track end-to-end time
time bebop-claude &use core/security &use core/code-quality "Create a feature"
```

---

## Troubleshooting

### Issue: "bebop command not found"

```bash
# Check installation
which bebop

# If not found, install
npm install -g @bebophq/cli

# Verify
bebop --version
```

### Issue: "AI CLI not found"

```bash
# Check which tools are available
which claude opencode cursor copilot

# Install one if needed
# Example: Install Claude CLI
# See Claude documentation for installation
```

### Issue: "Compiled prompt not being sent"

```bash
# Debug wrapper script
cat ~/bin/bebop-claude

# Check if bebop compile works
bebop compile "&use core/code-quality test"

# Check if CLI tool works
claude "test"

# Verify wrapper has execute permissions
ls -la ~/bin/bebop-claude
```

### Issue: "PATH not updated"

```bash
# Check PATH
echo $PATH | grep "$HOME/bin"

# If not in PATH, add to shell config
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
which bebop-claude
```

---

## Summary

| Pattern | Best For | Complexity | Integration |
|---------|----------|-------------|--------------|
| **Wrapper** | Daily use, specific tool | Low | Seamless |
| **Pre-compile** | Any tool, flexibility | Very Low | Manual |
| **Middleware** | Advanced users, full control | High | Complex |

**Recommendation:** Start with **wrapper pattern** for your most-used tool, use **pre-compile** for others.

## See Also

- [Cursor Integration Guide](cursor.md)
- [Quick Start](../../QUICKSTART_CLI.md)
- [Directives](../../DIRECTIVES.md)
- [Packs](../../PACKS.md)
- [Troubleshooting Guide](../troubleshooting.md)
- [Performance & measurement](../performance.md)
