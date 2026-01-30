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
bebop compile &use core example "Create a feature"
# Copy and paste to Claude Code
```

---

## Usage Patterns

### Pattern 1: CLI Wrapper (Seamless)

**Best for:** Daily CLI usage

```bash
# Use wrapper instead of claude directly
bebop-claude &use core example "Create a user authentication system"

# What happens:
# 1. Bebop compiles prompt with constraints
# 2. Wrapper sends to claude CLI
# 3. You see response
```

**Comparison:**

**Without Bebop:**
```bash
$ claude "Create a user authentication system"

# Claude receives:
# "Create a user authentication system"
# + full CLAUDE.md (674 lines, 850 tokens)
# + full coding standards (200 lines, 250 tokens)
# + full project guidelines (150 lines, 200 tokens)
# Total: ~1,300 tokens
```

**With Bebop:**
```bash
$ bebop-claude &use core example "Create a user authentication system"

# Claude receives:
# "Create a user authentication system
#
# Active constraints:
# - [NO_SECRETS] Never add secrets to code.
# - [WRITE_TEST_COVERAGE] Write tests for new functionality.
# - [USE_TYPED_INTERFACES] Use TypeScript interfaces."
#
# Total: ~90 tokens
#
# Savings: 93% (1,300 → 90 tokens)
```

### Pattern 2: Pre-compile & Paste (Universal)

**Best for:** IDE users, occasional CLI use

```bash
# Step 1: Compile
$ bebop compile &use core example "Create a user authentication system"

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

### Pattern 3: Session-Based (Advanced)

**Best for:** Complex, multi-step tasks

```bash
# Start session
$ bebop session start

# Use Claude Code with Bebop
$ bebop-claude &use core example "Create user authentication"
# ... Claude generates code ...

# Continue session
$ bebop session continue
$ bebop-claude "Refactor authentication service"
# ... Claude refactors code ...

# Jump to plan step
$ bebop step 3
$ bebop-claude "Write tests for authentication"
# ... Claude writes tests ...
```

---

## Claude Code IDE Integration

### Method 1: Quick Prompt (Pre-compile)

**Workflow:**

```bash
# Terminal: Compile prompt
$ bebop compile &use core example "Create a REST API endpoint"

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
$ claude-bebop &use core example "Create a user service"

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
        prompt: 'Enter task (use directives like &use core example)',
        placeHolder: '&use core example Create a feature'
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
$ bebop-claude &use core example "Create a user authentication system"

📋 Bebop compiled prompt (95 words)

Active constraints:
- [NO_SECRETS] Never add secrets...
- [WRITE_TEST_COVERAGE] Write tests...
- [USE_TYPED_INTERFACES] Use TypeScript...

🤖 Sending to Claude...

# Claude's response appears directly in terminal
```

**With Plans:**

```bash
# Start a plan
$ bebop plan run backend/create-rest-endpoint route=POST:/users name=CreateUser

📋 Plan: backend/create-rest-endpoint@v1
📝 Session: session_20250129_140000_xyz789

Step 1/12: Read service documentation
  → src/README.md

💡 Complete this step, then run 'bebop step 2'

# Complete step 1 (read docs)
$ bebop step 2

Step 2/12: Create route handler
  → src/routes/users.ts

# Use Claude to create route handler
$ bebop-claude "Create route handler for POST /users"

📋 Bebop compiled prompt (95 words)

Active constraints:
- [NO_SECRETS] Never add secrets...
- [VALIDATE_ALL_INPUTS] Validate inputs...

🤖 Sending to Claude...

# Claude generates route handler code
```

**Dry Run Mode:**

```bash
# See what would be sent
$ bebop-claude --dry-run &use core example "Create a feature"

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
$ claude-bebopt &use core example "Create a user service"
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
  echo "  1) core/example"
  echo "  2) core/security"
  echo "  3) core/code-quality"
  echo "  4) No pack"
  read -p "Select pack [1-4]: " pack_choice
  
  # Compile prompt
  local input="$task"
  case $pack_choice in
    1) input="&use core example $input" ;;
    2) input="&use core/security $input" ;;
    3) input="&use core/code-quality $input" ;;
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
# Morning - Start session
$ cd my-project
$ bebop session start

# Task 1: Create API endpoint
$ bebop-claude &plan create-endpoint route=POST:/items name=CreateItem

📋 Plan: backend/create-rest-endpoint@v1
📝 Session: session_20250129_090000_abc123

Step 1/12: Read service documentation
$ # Read docs...
$ bebop step 2

Step 2/12: Create route handler
$ bebop-claude "Create route handler for POST /items"

📋 Bebop compiled prompt (95 words)
🤖 Sending to Claude...

# Claude generates route handler code
$ # Implement the code...

# Task 2: Add tests
$ bebop step 7
Step 7/12: Write tests
$ bebop-claude "Write tests for CreateItem endpoint"

📋 Bebop compiled prompt (95 words)
🤖 Sending to Claude...

# Claude generates tests
$ # Run tests
$ npm test

# End of day
$ bebop session end
✅ Session closed: session_20250129_090000_abc123
```

### Workflow 2: Bug Fixing

**Scenario:** Fix authentication bug

```bash
# Start session for bug fix
$ bebop session start --bug-fix AUTH_001

# Dry run first - see what constraints apply
$ bebop-claude --dry-run "Fix authentication bug in login endpoint"

📋 Bebop compiled prompt (95 words)

Task: Fix authentication bug in login endpoint

Active constraints:
- [NO_SECRETS] Never add secrets...
- [HANDLE_ERRORS_GRACEFULLY] Handle errors...
- [LOG_SECURITY_EVENTS] Log auth attempts...

# Looks good - run without --dry-run
$ bebop-claude "Fix authentication bug in login endpoint"

# Claude generates fix
$ # Implement and test...

# Write regression test
$ bebop-claude &use core/code-quality "Write test to prevent this bug"

# Claude generates test
```

### Workflow 3: Refactoring

**Scenario:** Refactor large service

```bash
# Start refactoring session
$ bebop session start --refactor UserService

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
```

### Workflow 4: Onboarding New Developer

**Scenario:** Help new developer understand codebase

```bash
# Create onboarding pack
$ bebop pack create --name my-company/onboarding
$ # Edit pack with:
# - Architecture overview rules
# - Coding standards
# - Best practices

# Onboarding session
$ bebop session start --onboarding new-dev

# Use Claude to explain codebase
$ bebop-claude &use my-company/onboarding "Explain the authentication flow in this codebase"

# Claude provides explanation with constraints relevant to your company
```

### Workflow 5: Code Review

**Scenario:** Reviewing a PR

```bash
# Start code review session
$ bebop session start --code-review PR-123

# Use Claude to review
$ bebop-claude &use core/security &use core/code-quality "Review this PR for security and code quality issues"

# Claude reviews with your security and quality constraints

# Generate review comments
$ bebop-claude "Generate GitHub review comments for the issues found"

# Claude generates review comments
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

### 2. Use Session Management

```bash
# ✅ Good: Track progress in sessions
$ bebop session start
$ bebop-claude "Task 1"
$ # ... work ...
$ bebop session continue
$ bebop-claude "Task 2"
$ bebop session end

# ❌ Bad: Untracked work
$ bebop-claude "Task 1"
$ # ... work ...
$ bebop-claude "Task 2"
# No history/context tracking
```

### 3. Leverage Plans

```bash
# ✅ Good: Use plans for repetitive workflows
$ bebop plan run create-endpoint route=POST:/items name=CreateItem
$ # Work through steps systematically

# ❌ Bad: Manually type each step
$ bebop-claude "Read docs"
$ # Read docs...
$ bebop-claude "Create route handler"
$ # Create route...
$ bebop-claude "Create service"
$ # Create service...
# Easy to miss steps
```

### 4. Use Appropriate Packs

```bash
# ✅ Good: Use specific, relevant packs
$ bebop-claude &use core/security "Add JWT authentication"
$ bebop-claude &use core/code-quality "Refactor this function"

# ❌ Bad: Use everything
$ bebop-claude &use * "Add JWT authentication"
# Too many constraints, may be irrelevant
```

### 5. Track Token Savings

```bash
# Check stats regularly
$ bebop stats

📊 Bebop Statistics

Sessions:
  - Total: 23
  - This week: 15

Token savings:
  - Total saved: 127,450 tokens
  - Average per session: 5,541 tokens
  - Cost saved: $3.82
```

### 6. Use Service Context

```bash
# ✅ Good: Let bebop know which service you're working on
cd services/api/users
$ bebop-claude "Add login endpoint"

# Or specify manually
$ bebop-claude &svc userservice "Add login endpoint"

# Bebop can select service-specific rules
```

---

## Troubleshooting

### Issue: "Claude doesn't receive compiled prompt"

**Diagnosis:**
```bash
# Test bebop compilation
$ bebop compile &use core example "test"
Task: test

Active constraints:
...

# Test claude CLI
$ claude "test"

# Works!
```

**Solution:** Use wrapper script
```bash
$ bebop-claude &use core example "test"
```

### Issue: "Compiled prompt too long"

**Diagnosis:**
```bash
$ bebop compile &use * "test"
# Many rules loaded → prompt too long
```

**Solution:** Use specific packs
```bash
$ bebop compile &use core/example "test"
# Only relevant rules
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

**Solution:** Use &svc directive
```bash
$ bebop-claude &svc userservice "Add login endpoint"
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

## Token Savings Example

### Without Bebop

```bash
$ claude "Create a user authentication system with JWT"

# What Claude receives:
# 1. Your task (15 words, ~20 tokens)
# 2. Full CLAUDE.md (674 lines, ~850 tokens)
# 3. Full coding standards (200 lines, ~250 tokens)
# 4. Full project guidelines (150 lines, ~200 tokens)
#
# Total: ~1,320 tokens
# Cost: ~$0.04
# Response time: ~90 seconds
```

### With Bebop

```bash
$ bebop-claude &use core/example &use core/security "Create a user authentication system with JWT"

# What Claude receives:
# 1. Your task (15 words, ~20 tokens)
# 2. Compiled constraints:
#    - [NO_SECRETS] Never add secrets... (~20 tokens)
#    - [USE_STANDARD_JWT] Use standard JWT... (~25 tokens)
#    - [VALIDATE_INPUTS] Validate all inputs... (~20 tokens)
#    - [WRITE_TESTS] Write comprehensive tests... (~20 tokens)
#
# Total: ~105 tokens
# Cost: ~$0.003
# Response time: ~7 seconds
#
# Savings: 92% (1,320 → 105 tokens)
# Time savings: 83% faster
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
bebop compile &use core/example "Create a feature"
# Copy and paste to Claude Code

# 3. Try wrapper (optional)
cp scripts/bebop-claude.sh ~/bin/bebop-claude
chmod +x ~/bin/bebop-claude
export PATH="$HOME/bin:$PATH"
bebop-claude &use core/example "Create a feature"
```

---

**Start saving tokens with Claude Code today!** 🚀

## Resources

- [Full Integration Guide](ai-cli-tools.md)
- [Scripts Documentation](../../scripts/README.md)
- [Quick Start Guide](../../QUICKSTART_CLI.md)
- [Bebop Documentation](../)
