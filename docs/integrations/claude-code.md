# Using Bebop with Claude Code

Complete guide for integrating Bebop with Anthropic's Claude Code (IDE and CLI).

## Table of Contents

- [Quick Overview](#quick-overview)
- [Installation](#installation)
- [Usage Patterns](#usage-patterns)
- [Claude Code IDE Integration](#claude-code-ide-integration)
- [Claude Code CLI Integration](#claude-code-cli-integration)
- [Real-World Workflows](#real-world-workflows)
- [Best Practices](#best-practices)

---

## Quick Overview

Claude Code is Anthropic's AI coding assistant available as:
- **IDE Extension**: VS Code, JetBrains, etc.
- **CLI Tool**: `claude` command-line interface

Bebop works with **both** the IDE and CLI through 3 patterns:

1. **Pre-compile & Paste** - Compile with Bebop, paste to Claude
2. **CLI Wrapper** - Wrap `claude` command with Bebop
3. **Extension** - Use Bebop prompts directly in IDE (advanced)

**Recommendation:** Start with **CLI Wrapper** for daily use, **Pre-compile** for IDE.

---

## Installation

### Step 1: Install Bebop

```bash
npm install -g @bebophq/cli
bebop init
```

### Step 2: Choose Integration

#### Option A: CLI Wrapper (Recommended for CLI)

```bash
# Copy wrapper to PATH
cp scripts/bebop-claude.sh ~/bin/bebop-claude
chmod +x ~/bin/bebop-claude
export PATH="$HOME/bin:$PATH"
```

#### Option B: Pre-compile (Works with IDE + CLI)

```bash
# No installation needed - just use bebop compile
bebop compile &use core/security &use core/code-quality "Create a feature"
# Copy and paste to Claude Code
```

---

## Usage Patterns

### Pattern 1: CLI Wrapper (Seamless)

**Best for:** Daily CLI usage

```bash
# Use wrapper instead of claude directly
bebop-claude &use core/security &use core/code-quality "Create a user authentication system"

# What happens:
# 1. Bebop compiles prompt with constraints
# 2. Wrapper sends to claude CLI
# 3. You see response
```

**Comparison:**

**Without Bebop:**
```bash
$ claude "Create a user authentication system"

# What can go wrong:
# - Standards aren’t explicitly present in the prompt
# - You end up pasting reminders and redoing work
```

**With Bebop:**
```bash
$ bebop-claude &use core/security &use core/code-quality "Create a user authentication system"

# Claude receives:
# "Create a user authentication system
#
# Active constraints:
# - [NO_SECRETS] Never add secrets to code.
# - [WRITE_TEST_COVERAGE] Write tests for new functionality.
# - [USE_TYPED_INTERFACES] Use TypeScript interfaces."
#
# Result:
# - Guardrails are present up front as active constraints
# - Less “redo this with our standards” back-and-forth
```

### Pattern 2: Pre-compile & Paste (Universal)

**Best for:** IDE users, occasional CLI use

```bash
# Step 1: Compile
$ bebop compile &use core/security &use core/code-quality "Create a user authentication system"

Task: Create a user authentication system

Active constraints:
- [NO_SECRETS] Never add secrets to code, docs, or commits.
- [WRITE_TEST_COVERAGE] Write tests for new functionality with >80% coverage.
- [USE_TYPED_INTERFACES] Use TypeScript interfaces for all function parameters.

# Step 2: Copy and paste to Claude Code
```

**In Claude Code IDE:**
1. Open Claude Code panel (Cmd+K in VS Code)
2. Paste the compiled prompt
3. Submit

**In Claude Code CLI:**
```bash
$ claude "Task: Create a user authentication system

Active constraints:
- [NO_SECRETS] Never add secrets to code, docs, or commits.
- [WRITE_TEST_COVERAGE] Write tests for new functionality with >80% coverage.
- [USE_TYPED_INTERFACES] Use TypeScript interfaces for all function parameters."
```

### Pattern 3: Usage Tracking Session (Advanced)

**Best for:** Long sessions where you want a lightweight summary of Bebop usage.

```bash
# Start a tracked session (optional)
$ bebop hook session-start --tool claude

# Use Claude Code with Bebop
$ bebop-claude &use core/security &use core/code-quality "Create user authentication"
$ bebop-claude &use core/security &use core/code-quality "Write tests for authentication"

# View current session summary at any time
$ bebop stats --session --tool claude

# End session and print final summary
$ bebop hook session-end --tool claude
```

---

## Claude Code IDE Integration

### Method 1: Quick Prompt (Pre-compile)

**Workflow:**

```bash
# Terminal: Compile prompt
$ bebop compile &use core/security &use core/code-quality "Create a REST API endpoint"

Task: Create a REST API endpoint

Active constraints:
- [NO_SECRETS] Never add secrets to code.
- [VALIDATE_ALL_INPUTS] Validate all user inputs.

# Copy the output (Cmd+C on Mac, Ctrl+C on Linux)
```

**Claude Code IDE (VS Code):**

1. **Open Claude Code**: Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
2. **Paste compiled prompt**: `Cmd+V`
3. **Submit**: Press `Enter`

**Example in Claude Code IDE:**

```
Claude Code Chat Panel
┌────────────────────────────────────┐
│ Task: Create a REST API endpoint │
│                                │
│ Active constraints:              │
│ - [NO_SECRETS] Never add      │
│   secrets to code.              │
│ - [VALIDATE_ALL_INPUTS] Validate │
│   all user inputs.              │
│                                │
│ [Submit]                        │
└────────────────────────────────────┘

Claude's response:
Sure! I'll create a REST API endpoint with proper validation.
Here's the implementation:

```typescript
import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.post('/api/users', async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Implementation...
  // Note: No secrets or API keys hardcoded
});
```
```

### Method 2: Using Alias (Faster)

**Create shell alias:**

```bash
# Add to ~/.bashrc or ~/.zshrc
alias claude-bebop='function _claude_bebop() {
  local input="$@";
  local compiled=$(bebop compile "$input" 2>/dev/null);
  echo "$compiled" | pbcopy;  # Copy to clipboard (Mac)
  echo "✅ Compiled prompt copied to clipboard";
  echo "📋 Paste into Claude Code (Cmd+K)";
}; _claude_bebop'

# Reload shell
source ~/.bashrc
```

**Usage:**

```bash
# Compile and auto-copy
$ claude-bebop &use core/security &use core/code-quality "Create a user service"

📋 Bebop compiled prompt (87 words)

Active constraints:
- [NO_SECRETS] Never add secrets...
- [WRITE_TEST_COVERAGE] Write tests...

✅ Compiled prompt copied to clipboard
📋 Paste into Claude Code (Cmd+K)

# Now go to IDE, press Cmd+K, paste (Cmd+V)
```

### Method 3: VS Code Extension (Advanced)

**Create VS Code extension:**

```json
// package.json
{
  "name": "bebop-claude",
  "displayName": "Bebop for Claude Code",
  "version": "0.1.0",
  "contributes": {
    "commands": [
      {
        "command": "bebop.compileAndPaste",
        "title": "Bebop: Compile and Paste to Claude"
      },
      {
        "command": "bebop.compileOnly",
        "title": "Bebop: Compile Prompt Only"
      }
    ]
  }
}
```

```typescript
// extension.ts
import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
  // Command: Compile and paste to Claude
  let disposable = vscode.commands.registerCommand(
    'bebop.compileAndPaste',
    async () => {
      // Get user input
      const input = await vscode.window.showInputBox({
        prompt: 'Enter task (use directives like &use core/security)',
        placeHolder: '&use core/security &use core/code-quality Create a feature'
      });
      
      if (!input) return;
      
      // Compile with Bebop
      const compiled = await compileWithBebop(input);
      
      // Show preview
      const panel = vscode.window.createWebviewPanel(
        'bebop-preview',
        'Bebop Compiled Prompt',
        vscode.ViewColumn.One
      );
      
      panel.webview.html = `
        <html>
          <body>
            <h2>Compiled Prompt</h2>
            <pre>${compiled}</pre>
            <button onclick="copyAndPaste()">Copy & Paste to Claude</button>
            <script>
              function copyAndPaste() {
                navigator.clipboard.writeText(\`${compiled.replace(/`/g, '\\`')}\`);
                vscode.postMessage({ command: 'paste-to-claude' });
              }
            </script>
          </body>
        </html>
      `;
      
      // Handle messages
      panel.webview.onDidReceiveMessage(
        message => {
          if (message.command === 'paste-to-claude') {
            // Trigger Claude Code (Cmd+K)
            vscode.commands.executeCommand('claude-chat');
          }
        }
      );
    }
  );
  
  context.subscriptions.push(disposable);
}

function compileWithBebop(input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`bebop compile "${input}"`, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}
```

**Usage:**
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Bebop: Compile and Paste to Claude"
3. Enter your task with directives
4. Extension compiles, shows preview, and pastes to Claude

### Method 4: Custom Keyboard Shortcut

**Add to VS Code keybindings.json:**

```json
// ~/.vscode/keybindings.json
[
  {
    "key": "cmd+shift+b",
    "command": "bebop.compileAndPaste",
    "when": "!terminalFocus"
  },
  {
    "key": "ctrl+shift+b",
    "command": "bebop.compileAndPaste",
    "when": "!terminalFocus"
  }
]
```

**Usage:** Press `Cmd+Shift+B` → Bebop compiles → Pastes to Claude

---

## Claude Code CLI Integration

### Method 1: Using Wrapper Script

**Already created in `scripts/bebop-claude.sh`**

```bash
# Basic usage
$ bebop-claude &use core/security &use core/code-quality "Create a user authentication system"

📋 Bebop compiled prompt (95 words)

Active constraints:
- [NO_SECRETS] Never add secrets...
- [WRITE_TEST_COVERAGE] Write tests...
- [USE_TYPED_INTERFACES] Use TypeScript...

🤖 Sending to Claude...

# Claude's response appears directly in terminal
```

**Roadmap: Plan runner (not implemented yet)**

Long-term, Bebop will support multi-step plan execution via a plan IR + step runner.

See `PLANS.md` for the roadmap.

**Dry Run Mode:**

```bash
# See what would be sent
$ bebop-claude --dry-run &use core/security &use core/code-quality "Create a feature"

📋 Bebop compiled prompt (95 words)

Task: Create a feature

Active constraints:
- [NO_SECRETS] Never add secrets to code.
- [WRITE_TEST_COVERAGE] Write tests for new functionality.

# Claude won't be called - just shows prompt
```

### Method 2: Shell Function (Custom)

```bash
# Add to ~/.bashrc or ~/.zshrc
claude-bebopt() {
  local input="$@"
  local compiled=$(bebop compile "$input" 2>/dev/null)
  
  if [ $? -ne 0 ]; then
    echo "❌ Bebop compilation failed"
    return 1
  fi
  
  # Show stats
  local words=$(echo "$compiled" | wc -w | xargs)
  echo "📋 Bebop compiled ($words words)"
  
  # Send to Claude
  claude "$compiled"
}

# Usage
$ claude-bebopt &use core/security &use core/code-quality "Create a user service"
```

### Method 3: Interactive Mode

```bash
# Interactive wrapper with menu
claude-interactive() {
  echo "Claude Code + Bebop Interactive Mode"
  echo ""
  
  # Get task
  read -p "Enter task: " task
  
  # Show pack options
  echo ""
  echo "Available packs:"
  echo "  1) core/security"
  echo "  2) core/code-quality"
  echo "  3) core/security + core/code-quality"
  echo "  4) Auto-select (no directives)"
  read -p "Select pack [1-4]: " pack_choice
  
  # Compile prompt
  local input="$task"
  case $pack_choice in
    1) input="&use core/security $input" ;;
    2) input="&use core/code-quality $input" ;;
    3) input="&use core/security &use core/code-quality $input" ;;
    4) input="$input" ;;
  esac
  
  local compiled=$(bebop compile "$input" 2>/dev/null)
  
  # Show preview
  echo ""
  echo "📋 Compiled prompt:"
  echo "$compiled" | head -10
  read -p "Send to Claude? [y/N]: " confirm
  
  if [[ $confirm =~ ^[Yy]$ ]]; then
    claude "$compiled"
  fi
}

# Usage
$ claude-interactive
```

---

## Real-World Workflows

### Workflow 1: Daily Development

**Scenario:** Building a new feature

```bash
# Morning - Start a tracked session (optional)
$ cd my-project
$ bebop hook session-start --tool claude

# Task 1: Create API endpoint
$ bebop-claude &use core/security &use core/code-quality "Create route handler for POST /items (CreateItem)"

📋 Bebop compiled prompt (95 words)
🤖 Sending to Claude...

# Claude generates route handler code
$ # Implement the code...

# Task 2: Add tests
$ bebop-claude &use core/security &use core/code-quality "Write tests for CreateItem endpoint"

📋 Bebop compiled prompt (95 words)
🤖 Sending to Claude...

# Claude generates tests
$ # Run tests
$ npm test

# End of day
$ bebop hook session-end --tool claude
```

### Workflow 2: Bug Fixing

**Scenario:** Fix authentication bug

```bash
# Start a tracked session for this debugging run (optional)
$ bebop hook session-start --tool claude

# Dry run first - see what constraints apply
$ bebop-claude --dry-run "Fix authentication bug AUTH_001 in login endpoint"

📋 Bebop compiled prompt (95 words)

Task: Fix authentication bug AUTH_001 in login endpoint

Active constraints:
- [NO_SECRETS] Never add secrets...
- [HANDLE_ERRORS_GRACEFULLY] Handle errors...
- [LOG_SECURITY_EVENTS] Log auth attempts...

# Looks good - run without --dry-run
$ bebop-claude "Fix authentication bug AUTH_001 in login endpoint"

# Claude generates fix
$ # Implement and test...

# Write regression test
$ bebop-claude &use core/code-quality "Write test to prevent this bug"

# Claude generates test

# End session and print summary
$ bebop hook session-end --tool claude
```

### Workflow 3: Refactoring

**Scenario:** Refactor large service

```bash
# Start a tracked session (optional)
$ bebop hook session-start --tool claude

# Refactor with constraints
$ bebop-claude &use core/code-quality "Refactor UserService to be more testable"

📋 Bebop compiled prompt (120 words)

Task: Refactor UserService to be more testable

Active constraints:
- [KEEP_FUNCTIONS_SMALL] Keep functions under 50 lines.
- [FOLLOW_DRY_PRINCIPLE] Follow DRY principle.
- [USE_TYPED_INTERFACES] Use TypeScript interfaces.

# Claude refactors code
$ # Review changes...

# Add tests for refactored code
$ bebop-claude "Write comprehensive tests for refactored UserService"

# Claude generates tests

# End session and print summary
$ bebop hook session-end --tool claude
```

### Workflow 4: Onboarding New Developer

**Scenario:** Help new developer understand codebase

```bash
# Create an onboarding pack (markdown or yaml), then import it into your registry:
$ bebop pack import ./my-company-onboarding@v1.md
$ # Edit the pack to include:
# - Architecture overview rules
# - Coding standards
# - Best practices

# Onboarding session (optional)
$ bebop hook session-start --tool claude

# Use Claude to explain codebase
$ bebop-claude &use my-company/onboarding "Explain the authentication flow in this codebase"

# Claude provides explanation with constraints relevant to your company

# End session and print summary
$ bebop hook session-end --tool claude
```

### Workflow 5: Code Review

**Scenario:** Reviewing a PR

```bash
# Start a tracked session (optional)
$ bebop hook session-start --tool claude

# Use Claude to review
$ bebop-claude &use core/security &use core/code-quality "Review this PR for security and code quality issues"

# Claude reviews with your security and quality constraints

# Generate review comments
$ bebop-claude "Generate GitHub review comments for the issues found"

# Claude generates review comments

# End session and print summary
$ bebop hook session-end --tool claude
```

---

## Best Practices

### 1. Always Dry Run First

```bash
# ❌ Bad: Send without checking
$ bebop-claude "Create a complex feature"

# ✅ Good: Dry run first
$ bebop-claude --dry-run "Create a complex feature"
# Review compiled prompt
$ # If good, run without --dry-run
$ bebop-claude "Create a complex feature"
```

### 2. Usage tracking (optional)

```bash
# ✅ Good: Track a long run and get a summary
$ bebop hook session-start --tool claude
$ bebop-claude "Task 1"
$ # ... work ...
$ bebop-claude "Task 2"
$ bebop stats --session --tool claude
$ bebop hook session-end --tool claude

# ✅ Also fine: Don’t track sessions (Bebop still compiles guardrails)
$ bebop-claude "Task 1"
$ # ... work ...
$ bebop-claude "Task 2"
```

### 3. Roadmap: Plans

Planned long-term: multi-step plan execution via a plan IR + step runner. See `PLANS.md`.

### 4. Use Appropriate Packs

```bash
# ✅ Good: Use specific, relevant packs
$ bebop-claude &use core/security "Add JWT authentication"
$ bebop-claude &use core/code-quality "Refactor this function"

# Avoid: including lots of unrelated packs “just in case”
```

### 5. Track Usage

```bash
# Check stats regularly
$ bebop stats

Bebop usage summary
Prompts: 23
Est. tokens (unfiltered rules): 12,450
Est. tokens (compiled): 1,890
Est. reduction vs unfiltered: 10,560
Avg reduction vs unfiltered: 85%
Note: "unfiltered rules" = all rules from selected packs; token counts are estimates.
```

### 6. Use Service Context

```bash
# ✅ Good: Run from the service directory so path-based rules apply
cd services/api/users
$ bebop-claude "Add login endpoint"
```

---

## Troubleshooting

### Issue: "Claude doesn't receive compiled prompt"

**Diagnosis:**
```bash
# Test bebop compilation
$ bebop compile &use core/security &use core/code-quality "test"
Task: test

Active constraints:
...

# Test claude CLI
$ claude "test"

# Works!
```

**Solution:** Use wrapper script
```bash
$ bebop-claude &use core/security &use core/code-quality "test"
```

### Issue: "Compiled prompt too long"

**Diagnosis:**
```bash
$ bebop compile &use core/security &use core/code-quality "test" | wc -w
# If the word count is higher than expected, you're probably selecting too many constraints
```

**Solution:** Use fewer/more-specific packs
```bash
$ bebop compile &use core/code-quality "test"
# Fewer constraints → shorter prompt
```

### Issue: "Constraints not being applied"

**Diagnosis:**
```bash
# Check pack applicability
$ bebop pack show core/security

# Check working directory
$ pwd
# Should match pack's path patterns
```

**Solution:** Run from the relevant directory (so `applies_when.paths` matches)
```bash
$ cd services/api/users
$ bebop-claude &use core/security &use core/code-quality "Add login endpoint"
```

### Issue: "Claude ignores constraints"

**Diagnosis:**
```bash
# Dry run to see what's being sent
$ bebop-claude --dry-run "Create feature"
```

**Solution:**
1. Check if constraints are clear
2. Use more specific constraints
3. Report issue to bebop repo

---

## Guardrails Example

### Without Bebop

```bash
$ claude "Create a user authentication system with JWT"

# If standards aren’t explicitly present, you’ll often correct and retry.
```

### With Bebop

```bash
$ bebop-claude &use core/security &use core/code-quality "Create a user authentication system with JWT"

# What Claude receives:
# - Your task
# - A compact list of active constraints (guardrails)
```

---

## Summary

### Integration Options

| Method | Best For | Complexity | Setup Time |
|--------|----------|-------------|------------|
| **CLI Wrapper** | Daily CLI use | Low | 2 minutes |
| **Pre-compile & Paste** | IDE + CLI | Very Low | 0 minutes |
| **VS Code Extension** | Power users | High | 30 minutes |

### Recommendation

**Start with:** Pre-compile & Paste (works immediately)

**Upgrade to:** CLI Wrapper after trying it once

**Consider:** VS Code Extension if you use Claude Code IDE daily

### Quick Start

```bash
# 1. Install
npm install -g @bebophq/cli
bebop init

# 2. Try pre-compile
bebop compile &use core/security &use core/code-quality "Create a feature"
# Copy and paste to Claude Code

# 3. Try wrapper (optional)
cp scripts/bebop-claude.sh ~/bin/bebop-claude
chmod +x ~/bin/bebop-claude
export PATH="$HOME/bin:$PATH"
bebop-claude &use core/security &use core/code-quality "Create a feature"
```

---

**Start shipping with guardrails in Claude Code today.**

## Resources

- [Full Integration Guide](ai-cli-tools.md)
- [Scripts Documentation](../../scripts/README.md)
- [Quick Start Guide](../../QUICKSTART_CLI.md)
- [Bebop Documentation](../)
