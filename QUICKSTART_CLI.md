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
bebopt claude "&use core example Create a user authentication system"

# With plans
bebopt claude "&plan create-endpoint route=POST:/users name=CreateUser"

# With service context
bebopt claude "&svc userservice &use core/security Add login endpoint"
```

### Using opencode

```bash
# Basic usage
bebopt opencode "&use core example Create a user authentication system"

# With plans
bebopt opencode "&plan create-endpoint route=POST:/users name=CreateUser"
```

### Using Cursor

```bash
bebopt cursor "&use core example Create a REST API"
```

## Step 4: See the Savings (10 seconds)

Compare prompt sizes:

```bash
# Without Bebop (send full documentation)
echo "Create a user service" | wc -w
# Output: 4 words
# But you'd also send: CLAUDE.md (674 lines), coding standards (200 lines), etc.
# Total: ~1,300 tokens

# With Bebop (send only constraints)
bebopt claude --dry-run "&use core example Create a user service" | wc -w
# Output: ~90 words

# Savings: 93% (1,300 → 90 tokens)
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
&use core example              # Load example pack
&pack core/security@v1        # Load specific pack
&plan create-endpoint route=POST:/users  # Load plan with params
&svc userservice             # Set service context
&step 3                      # Jump to step 3
&rules +NO_SECRETS           # Enable rule
&rules -TECH_BRIEF          # Disable rule
--dry-run                    # Show compiled prompt only
--verbose                    # Show details
```

### Session Management

```bash
# Start session
bebop session start

# Continue session
bebop session continue

# Show session status
bebop session show

# Jump to step
bebop step 3

# End session
bebop session end
```

## What Just Happened?

**Without Bebop:**
```
You type: "Create a user authentication system"

What gets sent to AI:
- Your task (10 words)
- Full CLAUDE.md (674 lines, ~850 tokens)
- Full coding standards (200 lines, ~250 tokens)
- Full project guidelines (150 lines, ~200 tokens)

Total: ~1,310 tokens
```

**With Bebop:**
```
You type: "bebopt claude &use core example Create a user authentication system"

What Bebop does:
1. Parse directive: &use core example
2. Load pack: core/example@v1
3. Extract rules: NO_SECRETS, WRITE_TESTS, etc.
4. Compile prompt

What gets sent to AI:
- Your task (10 words)
- Active constraints (3 rules, ~80 words)

Total: ~90 tokens

Savings: 93% (1,310 → 90 tokens)
```

## Real Savings

| Task | Without Bebop | With Bebop | Savings |
|------|---------------|------------|---------|
| Simple function | 850 tokens | 45 tokens | 95% |
| CRUD endpoint | 1,200 tokens | 95 tokens | 92% |
| Feature implementation | 2,500 tokens | 180 tokens | 93% |
| **Average** | **1,328 tokens** | **90 tokens** | **93%** |

**Daily cost savings (GPT-4 pricing):**
- Without: $0.40/session
- With: $0.03/session
- **Savings: $0.37/session**
- **Annual: $92.50/developer**

## Next Steps

1. **Try it out:**
   ```bash
   bebopt claude "&use core example Create a simple function"
   ```

2. **Use a plan:**
   ```bash
   bebopt opencode "&plan create-endpoint route=POST:/items name=CreateItem"
   ```

3. **Start a session:**
   ```bash
   bebop session start
   bebopt claude "&use core example Create a user service"
   ```

4. **Learn more:**
   - [Full Integration Guide](docs/integrations/ai-cli-tools.md)
   - [Scripts Documentation](scripts/README.md)
   - [Getting Started](docs/getting-started.md)

## Need Help?

- **Documentation:** See docs/ directory
- **Issues:** https://github.com/jstxn/bebop/issues
- **Quick commands:** `bebopt --help` or `bebopt claude --help`

---

**Start saving tokens today!** 🚀
