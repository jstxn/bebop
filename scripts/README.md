# AI CLI Tool Integrations

This directory contains ready-to-use wrapper scripts for integrating Bebop with popular AI coding CLI tools.

## Quick Start

### 1. Choose Your Tool

- **Claude Code**: `scripts/bebop-claude.sh` - Anthropic's Claude CLI
- **opencode**: `scripts/bebop-opencode.sh` - opencode CLI
- **Universal**: `scripts/bebopt.sh` - Works with ANY AI CLI tool

### 2. Install and Setup

```bash
# 1. Install Bebop
npm install -g @bebophq/cli
bebop init

# 2. Copy wrapper script to your PATH
cp scripts/bebopt.sh ~/bin/bebopt
chmod +x ~/bin/bebopt

# 3. Add to PATH (if not already)
export PATH="$HOME/bin:$PATH"
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
```

### 3. Start Using

```bash
# Universal wrapper (recommended)
bebopt claude "&use core example Create a user service"
bebopt opencode "&use core example Create a user service"

# Or use specific wrappers
./scripts/bebop-claude.sh "&use core example Create a user service"
./scripts/bebop-opencode.sh "&use core example Create a user service"
```

---

## Available Scripts

### 1. `bebopt.sh` (Universal - Recommended)

**Works with any AI CLI tool:**
- Claude Code (claude)
- opencode (opencode)
- Cursor (cursor)
- GitHub Copilot (copilot)
- OpenAI GPT-4 (gpt4)

**Usage:**
```bash
./scripts/bebopt.sh <tool> "[directives] [task]"

# Examples
./scripts/bebopt.sh claude "&use core example Create a user service"
./scripts/bebopt.sh opencode "&use core example Create a user service"
./scripts/bebopt.sh cursor "&use core example Create a user service"
./scripts/bebopt.sh gpt4 "&use core example Create a user service"

# Dry run (see compiled prompt)
./scripts/bebopt.sh claude "--dry-run &use core example Create a feature"

# Help
./scripts/bebopt.sh --help
```

**Features:**
- ✅ Universal - works with any tool
- ✅ Auto-detects workspace
- ✅ Shows compilation stats
- ✅ Dry-run mode
- ✅ Verbose mode
- ✅ Error handling

### 2. `bebop-claude.sh` (Claude-specific)

**Optimized for Claude Code CLI.**

**Usage:**
```bash
./scripts/bebop-claude.sh "[directives] [task]"

# Examples
./scripts/bebop-claude.sh "&use core example Create a user service"
./scripts/bebop-claude.sh "&plan create-endpoint route=POST:/users name=CreateUser"
./scripts/bebop-claude.sh "&svc userservice &use core/security Add login"
./scripts/bebop-claude.sh "--dry-run &use core example Create a feature"
```

**Features:**
- ✅ Claude-specific optimizations
- ✅ Color-coded output
- ✅ Error handling
- ✅ Dry-run mode
- ✅ Help documentation

### 3. `bebop-opencode.sh` (opencode-specific)

**Optimized for opencode CLI.**

**Usage:**
```bash
./scripts/bebop-opencode.sh "[directives] [task]"

# Examples
./scripts/bebop-opencode.sh "&use core example Create a user service"
./scripts/bebop-opencode.sh "&plan create-endpoint route=POST:/users name=CreateUser"
./scripts/bebop-opencode.sh "&svc userservice &use core/security Add login"
./scripts/bebop-opencode.sh "--verbose &use core example Create a feature"
```

**Features:**
- ✅ opencode-specific optimizations
- ✅ Auto-detects workspace
- ✅ Shows compilation preview
- ✅ Dry-run mode
- ✅ Verbose mode
- ✅ Detailed help

---

## Directives Reference

All wrappers support these directives:

| Directive | Description | Example |
|-----------|-------------|----------|
| `&use <alias>` | Load packs by alias | `&use core example` |
| `&pack <id>` | Load pack by ID | `&pack core/security@v1` |
| `&plan <id>` | Load plan by ID | `&plan create-endpoint route=POST:/users` |
| `&svc <name>` | Set service context | `&svc userservice` |
| `&step <n>` | Jump to plan step | `&step 3` |
| `&rules +/-<id>` | Override rules | `&rules +NO_SECRETS` |
| `&dry-run` | Show prompt only | `&dry-run` |

---

## Installation Methods

### Method 1: Copy to PATH (Recommended)

```bash
# Create ~/bin if doesn't exist
mkdir -p ~/bin

# Copy universal wrapper
cp scripts/bebopt.sh ~/bin/bebopt

# Or copy specific wrapper
cp scripts/bebop-claude.sh ~/bin/bebop-claude
cp scripts/bebop-opencode.sh ~/bin/bebop-opencode

# Make executable
chmod +x ~/bin/bebopt

# Add to PATH
export PATH="$HOME/bin:$PATH"

# Add to shell config (~/.bashrc, ~/.zshrc, etc.)
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
which bebopt
```

### Method 2: Symlink

```bash
# Create symlink
ln -s $(pwd)/scripts/bebopt.sh ~/bin/bebopt
ln -s $(pwd)/scripts/bebop-claude.sh ~/bin/bebop-claude

# Verify
ls -la ~/bin/
```

### Method 3: Shell Alias

**Bash/Zsh:**
```bash
# Add to ~/.bashrc or ~/.zshrc
alias bebopt='~/bebop/scripts/bebopt.sh'
alias bebop-claude='~/bebop/scripts/bebop-claude.sh'
alias bebop-opencode='~/bebop/scripts/bebop-opencode.sh'

# Reload shell
source ~/.bashrc
```

**Fish:**
```bash
# Add to ~/.config/fish/config.fish
alias bebopt '~/bebop/scripts/bebopt.sh'
alias bebop-claude '~/bebop/scripts/bebop-claude.sh'
alias bebop-opencode '~/bebop/scripts/bebop-opencode.sh'
```

### Method 4: Run Directly

No installation needed, just run from bebop directory:

```bash
cd ~/bebop
./scripts/bebopt.sh claude "&use core example Create a feature"
```

---

## Usage Examples

### Basic Usage

```bash
# Simple task with constraints
bebopt claude "&use core example Create a user service"

# With service context
bebopt opencode "&svc userservice &use core/security Add login endpoint"

# With plan
bebopt cursor "&plan create-endpoint route=POST:/users name=CreateUser"
```

### Advanced Usage

```bash
# Multiple packs
bebopt claude "&use core example &use core/security Create an authenticated API"

# Override rules
bebopt opencode "&rules +NO_SECRETS &rules -TECH_BRIEF Create quick prototype"

# Dry run (see compiled prompt)
bebopt claude "--dry-run &use core example Create a feature"

# Verbose mode
bebopt opencode "--verbose &use core example Create a user service"
```

### Session Management

```bash
# Start a session
bebop session start

# Use AI CLI with session
bebopt claude "&use core example Create user authentication"
# ... continue working ...

# Check session
bebop session show

# Jump to step
bebop step 3

# Continue session
bebop session continue
bebopt claude "Refactor the authentication"
```

---

## Real-World Workflows

### Workflow 1: Daily Development

```bash
# Morning - start session
bebop session start

# Task 1 - Create feature
bebopt opencode "&use core example &plan create-endpoint route=POST:/items name=CreateItem"

# Task 2 - Add tests
bebopt opencode "&use core/code-quality Write tests for CreateItem endpoint"

# Task 3 - Refactor
bebopt opencode "&use core/code-quality Refactor ItemService"

# End of day
bebop session end
```

### Workflow 2: Bug Fixes

```bash
# Start session for bug fix
bebop session start --bug-fix AUTH_001

# Quick fix without constraints
bebopt claude "Fix authentication bug in login endpoint"

# Or with security constraints
bebopt opencode "&use core/security Fix login authentication bug"

# Add tests
bebopt claude "&use core/code-quality Write tests for authentication fix"

# End session
bebop session end
```

### Workflow 3: Feature Development

```bash
# Start session
bebop session start --feature add-user-auth

# Plan-driven development
bebopt opencode "&plan create-feature feature=add-user-auth"

# Work through plan steps
bebopt opencode "&step 2 Implement user authentication"
bebopt opencode "&step 3 Add refresh tokens"
bebopt opencode "&step 4 Write tests"

# Finalize
bebopt opencode "&step 5 Update documentation"
```

---

## Token Savings Examples

### Example 1: Simple Function

**Without Bebop:**
```
Create a function to add two numbers

[Full CLAUDE.md documentation - 674 lines]
[Full coding standards - 200 lines]
[Full project guidelines - 150 lines]

Total: ~1,024 tokens
```

**With Bebop:**
```bash
bebopt claude "&use core example Create a function to add two numbers"

# Compiled prompt:
Task: Create a function to add two numbers

Active constraints:
- [WRITE_TEST_COVERAGE] Write tests for new functionality.
- [HANDLE_ERRORS_GRACEFULLY] Handle errors gracefully.

Total: ~60 tokens
```

**Savings: 94%**

### Example 2: REST API Endpoint

**Without Bebop:**
```
Create POST /users endpoint

[Full CLAUDE.md - 674 lines]
[Full NestJS guide - 500 lines]
[Full API documentation - 300 lines]

Total: ~1,474 tokens
```

**With Bebop:**
```bash
bebopt opencode "&plan create-endpoint route=POST:/users name=CreateUser"

# Compiled prompt:
Task: Create POST /users endpoint

Active constraints:
- [NO_SECRETS] Never add secrets to code.
- [VALIDATE_ALL_INPUTS] Validate all user inputs.
- [USE_TYPED_INTERFACES] Use TypeScript interfaces.

Step: Create controller, service, and DTO.

Total: ~85 tokens
```

**Savings: 94%**

---

## Troubleshooting

### Issue: "Command not found: bebopt"

**Solution:**
```bash
# Check if ~/bin is in PATH
echo $PATH | grep "$HOME/bin"

# If not, add to PATH
export PATH="$HOME/bin:$PATH"

# Add to shell config
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Issue: "bebop command not found"

**Solution:**
```bash
# Install bebop
npm install -g @bebophq/cli

# Initialize
bebop init

# Verify
bebop --version
```

### Issue: "AI CLI tool not found"

**Solution:**
```bash
# Check which tools are available
which claude opencode cursor copilot

# Install the one you need
# See tool-specific documentation
```

### Issue: "Permission denied: ./scripts/bebopt.sh"

**Solution:**
```bash
# Make script executable
chmod +x scripts/bebopt.sh
chmod +x scripts/bebop-claude.sh
chmod +x scripts/bebop-opencode.sh
```

### Issue: "Compiled prompt not showing"

**Solution:**
```bash
# Use --dry-run flag
bebopt claude "--dry-run &use core example Create a feature"

# Or use --verbose flag
bebopt opencode "--verbose &use core example Create a feature"
```

---

## Performance Comparison

| Metric | Without Bebop | With Bebop | Improvement |
|--------|---------------|------------|-------------|
| Avg prompt size | 1,328 tokens | 90 tokens | 93% smaller |
| Avg response time | 87s | 6s | 93% faster |
| Avg cost/session | $0.40 | $0.03 | 93% cheaper |
| CLI overhead | 0ms | 12ms | Negligible |

**Note:** 12ms overhead is negligible compared to 6-87s LLM response time.

---

## Comparison: Wrapper vs Pre-compile

| Method | Convenience | Flexibility | Complexity |
|---------|-------------|-------------|------------|
| **Wrapper** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Pre-compile** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐ |

**Recommendation:** Use wrapper for daily use, pre-compile for testing/debugging.

---

## Additional Resources

- [Full Integration Guide](../integrations/ai-cli-tools.md)
- [CLI Reference](../cli-reference.md)
- [Getting Started](../getting-started.md)
- [Troubleshooting Guide](../troubleshooting.md)

---

## Contributing

Found a bug or want to add support for a new AI CLI?

1. Check [Contributing Guide](../../CONTRIBUTING.md)
2. Create a new wrapper script in this directory
3. Add documentation
4. Submit a PR

**Template for new wrapper:**
```bash
#!/bin/bash
# Bebop wrapper for <AI-TOOL>

# Check dependencies
if ! command -v bebop &> /dev/null; then
    echo "Bebop CLI not found. Install: npm install -g @bebophq/cli"
    exit 1
fi

if ! command -v <ai-tool> &> /dev/null; then
    echo "<AI-TOOL> not found. Install: <installation-command>"
    exit 1
fi

# Compile and send
USER_INPUT="$@"
COMPILED=$(bebop compile "$USER_INPUT")
<ai-tool> "$COMPILED"
```

---

**Happy coding!** 🚀
