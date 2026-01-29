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
bebop-claude &use core example Create a user authentication system

# Bebop internally runs:
compiled=$(bebop compile "&use core example Create a user authentication system")
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
User types: bebop compile "&use core example Create a user service"
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
$ bebop compile &use core example "Create a user authentication system"

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
npm install -g @bebop/cli
bebop init

# 2. Create wrapper function
cat > ~/bin/bebop-claude << 'EOF'
#!/bin/bash
USER_INPUT="$@"

# Check if --dry-run flag
if [[ "$USER_INPUT" == *"--dry-run"* ]]; then
  bebop compile "$USER_INPUT"
  exit 0
fi

# Compile prompt
COMPILED=$(bebop compile "$USER_INPUT")

# Send to Claude
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
bebop-claude &use core example "Create a user authentication system"

# With plans
bebop-claude &plan create-endpoint route=POST:/users name=CreateUser

# Dry run (see compiled prompt)
bebop-claude --dry-run &use core example "Create a function"

# With service context
bebop-claude &svc userservice &use core/security "Add login endpoint"
```

### Alternative: Shell Alias

```bash
# Add to ~/.bashrc or ~/.zshrc
alias claude='function _claude() { bebop compile "$@" | claude; }; _claude'

# Usage
claude &use core example "Create a feature"
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
bebop-opencode &use core example "Create a user service"
```

### Session Management

```bash
# Start a session
bebop session start

# Use Claude with session context
bebop-claude &use core example "Create user authentication"
# ... continue working ...

# Check session
bebop session show

# Jump to step
bebop step 3

# Continue session
bebop session continue
bebop-claude "Refactor the authentication"
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
bebop-openai &use core example "Create a REST API"
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
bebop-gpt4 &use core example "Create a function"
```

---

## opencode

Since opencode is an AI CLI tool (like me!), here's how to integrate:

### Quick Setup (Wrapper Pattern)

```bash
# 1. Install bebop
npm install -g @bebop/cli
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
bebop-opencode &use core example "Create a user authentication system"

# With plans
bebop-opencode &plan create-endpoint route=POST:/users name=CreateUser

# With service context
bebop-opencode &svc userservice &use core/security "Add login endpoint"

# Dry run
bebop-opencode --dry-run &use core example "Create a feature"
```

### Session Integration

```bash
# Start session
bebop session start

# Use opencode with bebop
bebop-opencode &use core example "Create user service"
# ... continue working ...

# Check session status
bebop session show

# Continue session
bebop session continue
bebop-opencode "Refactor the service"
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

### Integration with opencode's Workflow

If opencode has multi-step workflows:

```bash
# Create plan for opencode workflows
bebop plan create --name opencode/feature-development

# Plan steps could include:
# 1. Read relevant files
# 2. Generate code with opencode
# 3. Run tests
# 4. Review and refine

# Use the plan
bebop plan run opencode/feature-development feature=add-user-auth
```

---

## Cursor CLI

Already covered in [Cursor Integration Guide](integrations/cursor.md), but quick summary:

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
bebop-cursor &use core example "Create a user service"
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
bebop-copilot &use core example "Create a function"
```

---

## Other Tools

### Pattern: Universal Pre-compile

Works with ANY CLI tool:

```bash
# Step 1: Compile
$ bebop compile &use core example "Create a user service"

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
bebopt claude &use core example "Create a feature"
bebopt opencode &use core example "Create a feature"
bebopt cursor &use core example "Create a feature"
```

### Pattern: Pipe-based

Use bebop output as input:

```bash
# Compile and pipe to any tool
bebop compile "&use core example Create a feature" | your-ai-cli

# Or with shell function
alias ai-bebop='bebop compile "$(cat)" | your-ai-cli'

# Usage
echo "&use core example Create a feature" | ai-bebop
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
bebopt &use core example "Create a feature"
```

### Multi-Tool Support

```bash
# Use different tools for different tasks
bebopt-coding() { bebop compile "$@" | claude; }
bebopt-writing() { bebop compile "$@" | opencode; }
bebopt-refactoring() { bebop compile "$@" | cursor; }

# Usage
bebopt-coding &use core example "Write a function"
bebopt-writing &use core example "Write documentation"
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
bebopt-interactive &use core example "Create a feature"
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
bebopt-default &use core example "Create a feature"
```

### Session State Management

```bash
# Track which tool was used in session
bebop session start --tool claude

# Use with same tool
bebopt-session() {
  local session_info=$(bebop session show --json)
  local tool=$(echo "$session_info" | jq -r '.metadata.tool')
  local compiled=$(bebop compile "$@")
  $tool "$compiled"
}

# Usage
bebopt-session &use core example "Create a feature"
```

---

## Best Practices

### 1. Start Simple

```bash
# Use pre-compile pattern first
$ bebop compile &use core example "Create a feature"
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
bebop-claude --dry-run &use core example "Create a complex feature"
# Review compiled prompt
# Then run without --dry-run
bebop-claude &use core example "Create a complex feature"
```

### 4. Check Token Savings

```bash
# Compare prompt sizes
$ echo "Create a feature" | wc -w
# Output: 3 words

$ bebop compile "&use core example Create a feature" | wc -w
# Output: 87 words (includes constraints)

# Full documentation would be 500+ words
# Savings: 82%
```

### 5. Monitor Performance

```bash
# Track compilation time
time bebop compile &use core example "Create a feature"
# real 0m0.012s

# Track end-to-end time
time bebop-claude &use core example "Create a feature"
# real 0m5.234s
```

---

## Troubleshooting

### Issue: "bebop command not found"

```bash
# Check installation
which bebop

# If not found, install
npm install -g @bebop/cli

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
bebop compile "&use core example test"

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

- [Cursor Integration Guide](integrations/cursor.md)
- [CLI Reference](cli-reference.md)
- [Troubleshooting Guide](troubleshooting.md)
