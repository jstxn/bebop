# Quick Start: AI CLI Integration

Get started with Bebop and your favorite AI coding CLI in 5 minutes.

## Step 1: Install Bebop (1 minute)

```bash
npm install -g @bebophq/cli
bebop init
```

## Step 2: Choose Your Integration (2 minutes)

### Option A: Universal Wrapper (Recommended)

Works with Claude, opencode, Cursor, Copilot, GPT-4, and more!

```bash
# Copy the wrapper script
cp scripts/bebopt.sh ~/bin/bebopt
chmod +x ~/bin/bebopt

# Add to PATH
export PATH="$HOME/bin:$PATH"
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Option B: Tool-Specific Wrapper

Optimized for your specific tool.

```bash
# For Claude Code
cp scripts/bebop-claude.sh ~/bin/bebop-claude
chmod +x ~/bin/bebop-claude

# For opencode
cp scripts/bebop-opencode.sh ~/bin/bebop-opencode
chmod +x ~/bin/bebop-opencode

# Add to PATH
export PATH="$HOME/bin:$PATH"
```

## Step 3: Start Using (30 seconds)

### Using Claude

```bash
# Basic usage
bebopt claude "&use core/security &use core/code-quality Create a user authentication system"

# Let Bebop auto-select packs (no directives)
bebopt claude "Create a user authentication system"
```

### Using opencode

```bash
# Basic usage
bebopt opencode "&use core/security &use core/code-quality Create a user authentication system"

# Let Bebop auto-select packs (no directives)
bebopt opencode "Create a user authentication system"
```

### Using Cursor

```bash
bebopt cursor "&use core/security &use core/code-quality Create a REST API"
```

## Step 4: See What Gets Sent (10 seconds)

Preview the compiled prompt (task + active constraints):

```bash
# Show the exact text Bebop will send to your AI CLI:
bebopt claude --dry-run "&use core/security &use core/code-quality Create a user service"

# Tip: if your workflow currently involves pasting long guidelines into prompts,
# this is where Bebop can dramatically reduce boilerplate.
```

## Quick Reference

### Common Commands

```bash
# Universal wrapper
bebopt claude "task"
bebopt opencode "task"
bebopt cursor "task"
bebopt copilot "task"
bebopt gpt4 "task"

# Tool-specific wrappers
bebop-claude "task"
bebop-opencode "task"

# Directives
&use core/security             # Load security pack
&pack core/security@v1        # Load specific pack

# Wrapper options
--dry-run                    # Show compiled prompt only (don’t send)
--verbose                    # Show details
```

### Usage tracking (optional)

```bash
# Start a tracked session for a specific tool
bebop hook session-start --tool claude

# See current session summary
bebop stats --session --tool claude

# End session and print final summary
bebop hook session-end --tool claude
```

## What Just Happened?

**Without Bebop (typical):**
```
You type: "Create a user authentication system"

What happens:
- You (or your team) repeat standards manually, or rely on docs being remembered
- The agent may drift over long sessions
```

**With Bebop:**
```
You type: "bebopt claude &use core/security &use core/code-quality Create a user authentication system"

What Bebop does:
1. Loads packs
2. Selects applicable rules
3. Compiles a prompt with active constraints

What gets sent to AI:
- Your task
- A compact list of active constraints
```

## Next Steps

1. **Try it out:**
   ```bash
   bebopt claude "&use core/code-quality Create a simple function"
   ```

2. **Inspect packs:**
   ```bash
   bebop pack list
   bebop pack show core/security@v1
   ```

3. **Install automatic integration (hooks/plugins/aliases):**
   ```bash
   bebop init --auto
   ```

4. **Learn more:**
   - [Full Integration Guide](docs/integrations/ai-cli-tools.md)
   - [Scripts Documentation](scripts/README.md)
   - [Directives](DIRECTIVES.md)
   - [Performance & measurement](docs/performance.md)

## Need Help?

- **Documentation:** See docs/ directory
- **Issues:** https://github.com/jstxn/bebop/issues
- **Quick commands:** `bebopt --help` or `bebopt claude --help`

---

**Start shipping with guardrails.**
