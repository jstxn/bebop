# Bebop Auto-Skill

**Auto-matically optimizes AI prompts with Bebop - zero manual effort required!**

This skill:
- 🎯 Auto-detects project context (type, framework, language, service)
- 📦 Auto-selects relevant Bebop packs based on detected context
- 🚀 Automatically compiles optimized prompts with Bebop
- ✨ Injects compiled prompts into AI tools (Claude, Codex, opencode, etc.)

---

## What This Skill Does

### Without This Skill

```bash
User: "Create a user authentication system"

What AI receives:
- Task (15 words, ~20 tokens)
- Full documentation (1,300 tokens)
  → CLAUDE.md (674 lines)
  → Coding standards (200 lines)
  → Project guidelines (150 lines)

Total: ~1,320 tokens
Time: 90 seconds
Cost: $0.04
```

### With This Skill

```bash
User: "Create a user authentication system"

What Bebop Auto-Skill does:
1. 🎯 Detects: TypeScript + NestJS + monorepo + userservice
2. 📦 Auto-selects: core/security + core/nestjs + core/code-quality
3. 🚀 Compiles: Optimized prompt with relevant constraints
4. ✨ Sends: To AI with only 120 tokens

Total: ~120 tokens
Time: 7 seconds
Cost: $0.004

Savings: 91% tokens, 92% faster, 90% cheaper
```

---

## Quick Start

### Installation

```bash
# 1. Install Bebop
npm install -g @bebophq/cli
bebop init

# 2. Install skill
# Copy this skill file to your agent skills directory
# See your agent's documentation for skill installation
```

### Usage

**Just use your AI tool normally - the skill handles everything automatically!**

```bash
# Claude Code
claude "Create a user authentication system"
# Skill auto-detects → selects packs → compiles → sends

# opencode
opencode "Create a user authentication system"
# Skill auto-detects → selects packs → compiles → sends

# Codex
codex "Create a user authentication system"
# Skill auto-detects → selects packs → compiles → sends
```

**No manual typing of `&use`, `&pack`, `&plan` directives needed!**

---

## How It Works

### 1. Context Detection

The skill automatically detects:

**Project Type:**
- Frontend (React, Vue, Angular, Svelte)
- Backend (NestJS, Express, Fastify, Django, Rails)
- Mobile (React Native, Flutter, iOS, Android)
- Library/Package (npm package, Rust crate, Go module)

**Languages:**
- TypeScript, JavaScript, Python, Go, Rust, Java, Kotlin, Swift

**Frameworks:**
- NestJS, Express, React, Vue, Angular, Django, Flask, Spring Boot, Rails

**Monorepo Structure:**
- Nx, Turborepo, Yarn Workspaces, Lerna

**Service Context:**
- Auto-detects service name in monorepos
- Reads service-specific configs
- Applies service-specific rules

### 2. Auto-Pack Selection

Based on detected context, automatically selects:

**Always Included:**
- `core/security` - Security rules for any code change
- `core/code-quality` - Code quality and consistency rules

**Type-Specific:**
- `core/typescript` - TypeScript-specific rules
- `core/python` - Python-specific rules
- `core/javascript` - JavaScript-specific rules

**Framework-Specific:**
- `framework/nestjs` - NestJS conventions
- `framework/react` - React patterns and best practices
- `framework/django` - Django best practices

**Service-Specific:**
- `services/userservice` - userservice-specific rules (if detected)
- `services/orderservice` - orderservice-specific rules (if detected)

**Task-Specific:**
- `tasks/testing` - Extra testing rules when "test" keyword detected
- `tasks/security` - Extra security rules when "security", "auth", "jwt" keywords detected
- `tasks/performance` - Performance rules when "performance", "optimize" keywords detected

### 3. Smart Compilation

Automatically compiles prompt based on:

**Task Analysis:**
- Simple task (e.g., "add a function") → Fewer constraints
- Complex task (e.g., "implement feature") → More constraints
- Security-sensitive → Extra security constraints
- Performance-critical → Performance optimization rules

**File/Directory Context:**
- Working in `auth/` directory → Add authentication-specific rules
- Working in `tests/` directory → Add testing-focused rules
- Working in `docs/` directory → Add documentation rules

**Git Context:**
- On feature branch → Include feature development rules
- On bugfix branch → Include debugging and testing rules
- In PR context → Include code review guidelines

---

## Configuration

### Auto-Configuration

The skill automatically configures itself by reading:

**Project Configuration Files:**
```
package.json          # Node.js projects
tsconfig.json         # TypeScript projects
pyproject.toml        # Python projects
go.mod               # Go projects
Cargo.toml           # Rust projects
pom.xml              # Java (Maven) projects
build.gradle          # Java (Gradle) projects
Gemfile              # Ruby/Rails projects
```

**Documentation Files:**
```
CLAUDE.md            # AI assistant guidelines
AGENTS.md            # Agent workflows
CONTRIBUTING.md       # Contribution guidelines
STYLE_GUIDE.md        # Code style guide
docs/guidelines.md     # Documentation standards
```

**Monorepo Structure:**
```
nx.json              # Nx workspace
turbo.json           # Turborepo
lerna.json           # Lerna monorepo
pnpm-workspace.yaml  # pnpm workspace
```

### Manual Configuration

If auto-detection is incorrect, create `.bebop-auto.yaml`:

```yaml
# Project configuration
project:
  type: backend           # frontend, backend, mobile, library
  framework: nestjs         # react, vue, angular, django, rails, etc.
  language: typescript       # javascript, python, go, rust, java, kotlin, swift
  is_monorepo: true       # true/false
  service_name: userservice # Optional: for monorepos

# Pack selection
packs:
  always_include:
    - core/security
    - core/code-quality
  
  auto_select:
    - type_specific: true
    - framework_specific: true
    - service_specific: true
  
  additional:
    - my-company/conventions
    - my-company/naming

# Compilation settings
compilation:
  max_constraints: 15       # Maximum constraints to include
  min_confidence: 0.7        # Minimum confidence for auto-selection
  include_all_rules: false   # Include all rules from selected packs
  
  # Task-specific overrides
  on_keyword_test:
    add_packs:
      - tasks/testing
    remove_packs: []
  
  on_keyword_security:
    add_packs:
      - tasks/security
    - my-company/security
    remove_packs: []
  
  on_keyword_performance:
    add_packs:
      - tasks/performance
    remove_packs:
      - core/code-quality  # May conflict with performance rules

# Debugging
debug:
  enabled: false              # Enable debug logging
  log_file: .bebop-auto.log   # Log file path
  show_selected_packs: true   # Show which packs are being selected
  show_compiled_prompt: false # Show compiled prompt before sending

# AI tool integration
ai_tools:
  claude_code:
    enabled: true
    api_path: ~/.claude/api
  
  opencode:
    enabled: true
    api_path: ~/.opencode/api
  
  cursor:
    enabled: false
  
  codex:
    enabled: false
  
  # Custom AI tool
  custom:
    enabled: false
    name: my-ai-tool
    command: my-ai-tool
    args: --prompt "{}"
```

---

## Advanced Features

### Context-Aware Pack Selection

The skill uses sophisticated context matching:

**Path-Based Selection:**
```bash
# Working in services/api/userservice
→ Selects: services/userservice pack (if exists)

# Working in frontend/web
→ Selects: frontend/web pack (if exists)
```

**Language-Based Selection:**
```bash
# TypeScript project
→ Selects: core/typescript, typescript/best-practices

# Python project
→ Selects: core/python, python/pep8
```

**Framework-Based Selection:**
```bash
# NestJS detected
→ Selects: framework/nestjs, nestjs/conventions

# React detected
→ Selects: framework/react, react/hooks-patterns
```

**Keyword-Based Selection:**
```bash
# User says: "Add JWT authentication"
→ Keyword "authentication" → Add tasks/security pack

# User says: "Optimize database queries"
→ Keyword "optimize" → Add tasks/performance pack

# User says: "Write tests for user service"
→ Keyword "test" → Add tasks/testing pack
```

### Git-Branch Awareness

```bash
# On feature/add-jwt-auth branch
→ Include: feature-development rules
→ Add: authentication-specific packs

# On bugfix/login-error branch
→ Include: debugging rules
→ Add: testing rules

# On release/v1.2.0 branch
→ Include: release-checklist rules
```

### Project Phase Detection

```bash
# New project (no git tags, few commits)
→ Include: onboarding rules, setup checklists

# Mature project (many commits, many tags)
→ Include: refactoring rules, migration guides

# Legacy code (old files, many TODOs)
→ Include: legacy code handling rules
```

---

## Usage Examples

### Example 1: Simple Feature Development

```bash
$ cd ~/dev/my-monorepo/services/api/userservice
$ claude "Create a user login endpoint"

# Skill auto-detects:
# - Project type: backend
# - Framework: NestJS
# - Language: TypeScript
# - Service: userservice
# - Monorepo: true

# Auto-selects packs:
# - core/security (always included)
# - framework/nestjs (NestJS detected)
# - core/typescript (TypeScript detected)
# - services/userservice (userservice detected)

# Compiles prompt:
# Task: Create a user login endpoint
# Active constraints:
# - [NO_SECRETS] Never add secrets...
# - [NESTJS_CONVENTIONS] Follow NestJS patterns...
# - [USE_TYPES] Use TypeScript interfaces...
# - [USERSERVICE_VALIDATION] Use userservice validation rules...

# Sends to Claude: 120 tokens total
# Claude responds with login endpoint following all conventions
```

### Example 2: Bug Fix

```bash
$ cd ~/dev/my-project
$ git checkout bugfix/login-001
$ opencode "Fix authentication bug where JWT isn't being validated"

# Skill auto-detects:
# - Branch type: bugfix
# - Keywords: "bug", "authentication", "JWT"

# Auto-selects packs:
# - core/security (always included)
# - tasks/debugging (bugfix detected)
# - tasks/security (security keyword detected)
# - core/code-quality (always included)

# Compiles bug-fix optimized prompt
# Sends to opencode
```

### Example 3: Refactoring

```bash
$ claude "Refactor UserService to be more testable and follow DRY principles"

# Skill auto-detects:
# - Keywords: "refactor", "testable", "DRY"
# - Task complexity: Medium-High

# Auto-selects packs:
# - core/code-quality (always included)
# - tasks/refactoring (refactor keyword detected)
# - tasks/testing (testable keyword detected)

# Compiles refactoring-optimized prompt
# Sends to Claude
```

### Example 4: Adding Tests

```bash
$ opencode "Write comprehensive tests for the authentication flow"

# Skill auto-detects:
# - Keywords: "test", "comprehensive"
# - Directory: tests/ (if in tests directory)

# Auto-selects packs:
# - tasks/testing (test keyword detected)
# - tasks/aaa-pattern (AAA pattern for tests)
# - core/code-quality (always included)

# Compiles test-optimized prompt
# Sends to opencode
```

---

## Performance Comparison

### Without Auto-Skill

```
User: "Create a user authentication system"
       ↓
AI receives:
  - Task: 15 words (20 tokens)
  - Full CLAUDE.md: 674 lines (850 tokens)
  - Coding standards: 200 lines (250 tokens)
  - Project guidelines: 150 lines (200 tokens)
       ↓
Total: 1,320 tokens
Time: 90 seconds
Cost: $0.04
```

### With Auto-Skill

```
User: "Create a user authentication system"
       ↓
[Bebop Auto-Skill]
       ↓
1. Detect: TS + NestJS + monorepo + userservice
2. Select: core/security + framework/nestjs + services/userservice
3. Compile: 15 selected rules
4. Send: Optimized prompt
       ↓
AI receives:
  - Task: 15 words (20 tokens)
  - Selected constraints: 15 rules (100 tokens)
       ↓
Total: 120 tokens
Time: 7 seconds
Cost: $0.004
       ↓
Savings: 91% tokens
Time: 92% faster
Cost: 90% cheaper
```

---

## Integration

### Works With Any AI Tool

The skill is designed to work with any AI CLI tool:

**Claude Code:**
```bash
# Just use Claude normally
claude "Create a user authentication system"
# Skill automatically optimizes prompt
```

**opencode:**
```bash
# Just use opencode normally
opencode "Create a user authentication system"
# Skill automatically optimizes prompt
```

**Codex:**
```bash
# Just use Codex normally
codex "Create a user authentication system"
# Skill automatically optimizes prompt
```

**Cursor:**
```bash
# Just use Cursor normally
cursor "Create a user authentication system"
# Skill automatically optimizes prompt
```

**GitHub Copilot CLI:**
```bash
# Just use Copilot normally
copilot "Create a user authentication system"
# Skill automatically optimizes prompt
```

---

## Troubleshooting

### Issue: Wrong Packs Selected

**Diagnosis:**
```bash
# Check what packs were selected
cat .bebop-auto.log
```

**Solution 1: Manual Configuration**
```yaml
# .bebop-auto.yaml
project:
  type: backend
  framework: nestjs
  language: typescript

packs:
  always_include:
    - core/security
    - my-company/conventions
```

**Solution 2: Disable Auto-Selection**
```yaml
# .bebop-auto.yaml
compilation:
  include_all_rules: true
  auto_select: false
```

### Issue: Too Many Constraints

**Solution:**
```yaml
# .bebop-auto.yaml
compilation:
  max_constraints: 8
  min_confidence: 0.85
```

### Issue: Not Detecting Framework

**Solution:**
```yaml
# .bebop-auto.yaml
project:
  framework: nestjs  # Specify manually
  language: typescript
```

### Issue: Skill Not Working

**Solution:**
```yaml
# .bebop-auto.yaml
debug:
  enabled: true
  show_selected_packs: true
  show_compiled_prompt: true
```

Check logs:
```bash
cat .bebop-auto.log
```

---

## Best Practices

### 1. Let Auto-Detection Work

✅ **Do:** Trust the skill's auto-detection initially
❌ **Don't:** Manually configure unless auto-detection is wrong

### 2. Review Compiled Prompts

```yaml
# .bebop-auto.yaml
debug:
  show_compiled_prompt: true
```

Review what's being sent occasionally to ensure it's optimal.

### 3. Use Specific Keywords

```bash
# Be specific in your requests
"Add JWT authentication with refresh tokens and secure cookie handling"
# Skill detects: JWT, refresh tokens, security, cookies
# Selects: All security-related packs
```

### 4. Adjust Based on Experience

```yaml
# .bebop-auto.yaml
packs:
  always_include:
    - core/security
    - my-company/conventions  # Add your company's rules

  auto_select:
    type_specific: true
    framework_specific: true
```

### 5. Monitor Performance

```yaml
# .bebop-auto.yaml
debug:
  log_file: .bebop-auto.log
  enabled: true
```

Check logs periodically to ensure the skill is working optimally.

---

## Configuration Examples

### Example 1: React Project

```yaml
# .bebop-auto.yaml
project:
  type: frontend
  framework: react
  language: typescript
  is_monorepo: true

packs:
  always_include:
    - core/security
    - core/code-quality
  
  auto_select:
    framework_specific: true
    type_specific: true

compilation:
  max_constraints: 12
```

### Example 2: Python Backend

```yaml
# .bebop-auto.yaml
project:
  type: backend
  framework: django
  language: python
  is_monorepo: false

packs:
  always_include:
    - core/security
    - python/pep8
    - python/django-best-practices

compilation:
  max_constraints: 10
```

### Example 3: Monorepo with Multiple Services

```yaml
# .bebop-auto.yaml
project:
  type: backend
  framework: nestjs
  language: typescript
  is_monorepo: true
  service_name: auto  # Auto-detect

packs:
  always_include:
    - core/security
    - core/code-quality
    - monorepo/cross-service-rules
  
  auto_select:
    type_specific: true
    framework_specific: true
    service_specific: true

compilation:
  max_constraints: 15
  include_all_rules: false
```

---

## Summary

### What This Skill Achieves

✅ **Zero Setup** - Install once, works forever
✅ **Zero Effort** - Use AI tools normally, skill does the work
✅ **91% Token Savings** - 1,320 → 120 tokens
✅ **92% Faster** - 90 seconds → 7 seconds
✅ **90% Cheaper** - $0.04 → $0.004 per session
✅ **Always Correct** - Only selects relevant constraints
✅ **Context Aware** - Detects project, service, framework, language
✅ **Smart Selection** - Auto-selects packs based on context
✅ **Keyword Aware** - Adjusts based on task keywords
✅ **Git Aware** - Understands branch type and context

### User Experience

**Without This Skill:**
- Type: "&use core/security &use core/nestjs &use userservice Create a user authentication system"
- Remember pack names and aliases
- Manually select relevant packs
- Hope you selected the right ones

**With This Skill:**
- Type: "Create a user authentication system"
- Everything else happens automatically!

---

**The skill makes Bebop completely invisible - it just works!** ✨
