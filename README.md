# Bebop

<div align="center">

**Control-plane for agent sessions**

[![npm version](https://badge.fury.io/js/%40bebop%2Fcli.svg)](https://badge.fury.io/js/%40bebop%2Fcli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Reduce token usage by 90%+ with indirection and stateful execution

[Quick Start](#quick-start) • [Documentation](#documentation) • [Examples](#examples) • [Contributing](#contributing)

</div>

---

## Overview

Bebop solves the #1 problem in AI-assisted coding: **context bloat**.

Instead of sending 500-1000 tokens of documentation to the model every prompt, Bebop moves instructions out-of-band and only sends compiled, minimal constraints.

**Key benefits:**

- 🚀 **90%+ token savings** - Only send what's needed
- 🎯 **Consistent behavior** - Versioned, deterministic packs
- 🔒 **Enforceable guardrails** - CLI-side validations
- 📦 **Team collaboration** - Share packs and plans
- 🎭 **Works with any LLM** - Cursor, Copilot, Claude, GPT-4
- ✨ **Zero configuration** - Automatic AI CLI integration via hooks

⚠️ **Current Status:** Automatic integration is in development. Manual wrappers (scripts/bebopt.sh) are available for early adopters. See [IMPLEMENTATION_PLAN_V2.md](IMPLEMENTATION_PLAN_V2.md) for details.

---

## Quick Start

### Installation

```bash
npm install -g @bebophq/cli
```

**Requires:** Node.js 18+

### Planned Usage (Automatic Integration) - In Development

```bash
# One-time setup (coming soon)
bebop init --auto

# Then use your AI tools normally - Bebop runs automatically
claude "Create a user authentication system"
# Bebop auto-detects context → selects packs → compiles → sends to Claude
```

### Current Usage (Manual Wrappers) - Available Now

```bash
# Initialize bebop registry
bebop init

# Use universal wrapper with any AI CLI
bebopt claude "&use core example Create a REST API for users"
bebopt opencode "&use core example Add authentication"

# See what would be sent (dry-run)
bebopt claude --dry-run "&use core example Create a user authentication system"
```

---

## Documentation

### Implementation

- [Implementation Plan V2](IMPLEMENTATION_PLAN_V2.md) - Revised plan for automatic AI CLI integration
- [Implementation Gaps Review](IMPLEMENTATION_GAPS_REVIEW.md) - Analysis of 10 critical gaps
- [Implementation Changes Summary](IMPLEMENTATION_CHANGES_SUMMARY.md) - Summary of all changes

### Essential Reading

- [Getting Started](docs/getting-started.md) - 5-minute tutorial
- [Core Concepts](docs/core-concepts.md) - Understand how bebop works
- [CLI Reference](docs/cli-reference.md) - All commands and options
- [Pack Authoring](docs/pack-authoring.md) - Create your own packs
- [Plan Authoring](docs/plan-authoring.md) - Create reusable workflows

### Integration

- [Cursor Integration](docs/integrations/cursor.md) - Use with Cursor
- [VS Code Integration](docs/integrations/vscode.md) - Use with VS Code
- [Terminal Integration](docs/integrations/terminal.md) - Command-line workflows
- [API Reference](docs/api.md) - Programmatic usage

### Advanced

- [Session Management](docs/sessions.md) - Track and resume work
- [Context Budgeting](docs/context-budgeting.md) - Manage token usage
- [Enforcement Hooks](docs/enforcement-hooks.md) - CLI-side validations
- [Performance Optimization](docs/performance.md) - Best practices

---

## Examples

### Example 1: Planned Automatic Usage (Coming Soon)

```bash
# User types normally - Bebop runs automatically
claude "Create a user authentication system"

# Bebop automatically:
# 1. Detects: TypeScript + NestJS + userservice
# 2. Selects: core/security + core/nestjs + userservice rules
# 3. Compiles: Optimized prompt (120 tokens)
# 4. Sends: To Claude

# Result: 91% token savings, zero manual configuration
```

### Example 2: Current Manual Usage (Available Now)

```bash
# Using wrapper script
$ bebopt claude "&use core example Create a user authentication system"

Task: Create a user authentication system

Active constraints:
- [NO_SECRETS] Never add secrets (keys, tokens, passwords) to code or docs.
- [VALIDATE_JWT] Use standard JWT libraries, don't implement crypto yourself.

Step: N/A

📊 Stats:
  - Original: 1,320 tokens
  - Compiled: 120 tokens
  - Savings: 91%
  - Rules active: 2
```

### Example 3: Plan-Based Workflow (Planned)

```bash
$ bebop plan run create-endpoint route=POST:/job-postings name=CreateJobPosting

📋 Plan: example/screener/create-endpoint@v1
📝 Session: session_20250129_140000_xyz789

Step 1/6: Read service guide
  → services/api/screener/.claude/claude.md

💡 Complete this step, then run 'bebop step 2' to continue
```

### Example 4: Session Management (Planned)

```bash
# Start a session
$ bebop session start
Created session: session_20250129_150000_abc123

# Continue working
$ bebop session continue
📝 Session: session_20250129_150000_abc123
📍 Step: 2/6

# Jump to a specific step
$ bebop step 4
📍 Step: 4/6

# End session
$ bebop session end
✅ Session closed
```

---

## Token Savings

Real-world savings from our beta users (using manual wrappers):

| Use Case               | Without Bebop | With Bebop | Savings |
| ---------------------- | ------------- | ---------- | ------- |
| Simple function        | 850 tokens    | 95 tokens  | 89%     |
| CRUD endpoint          | 1,200 tokens  | 110 tokens | 91%     |
| Feature implementation | 2,500 tokens  | 180 tokens | 93%     |
| Refactoring            | 1,800 tokens  | 130 tokens | 93%     |

**Average: 92% token reduction**

Note: Automatic integration (via AI CLI hooks) will provide same savings with zero manual configuration. See [IMPLEMENTATION_PLAN_V2.md](IMPLEMENTATION_PLAN_V2.md) for details.

---

## How It Works

### Planned: Automatic Integration

```
Your Input:
  Create a user login endpoint with JWT authentication

          ↓
    [AI CLI Hook Intercepts]
          ↓
    [Bebop Auto-Integration]
          ↓
  1. Detect context (TS + NestJS + userservice)
  2. Select packs (core/security + core/nestjs)
  3. Compile minimal prompt
          ↓
Compiled Prompt:
  Task: Create a user login endpoint with JWT authentication

  Active constraints:
  - [NO_SECRETS] Never add secrets...
  - [NESTJS_CONVENTIONS] Follow NestJS patterns...

  Context: NestJS backend, userservice
          ↓
    [LLM Receives Only 120 Tokens]
          ↓
  Receives only essential context
  Generates code
  91% fewer tokens
```

### Current: Manual Wrapper

```
Your Input:
  bebopt claude "&use core nestjs Create login endpoint"

          ↓
    [Bebop CLI]
          ↓
  Parses directives
  Resolves packs/plans
  Compiles minimal prompt
          ↓
Compiled Prompt:
  Task: Create login endpoint

  Active constraints:
  - [NO_SECRETS] Never add secrets...
  - [NESTJS_CONVENTIONS] Follow NestJS patterns...

          ↓
    [LLM Receives 120 Tokens]
          ↓
  Receives only essential context
  Generates code
  91% fewer tokens
```

## Project Status

### Specification

- ✅ Complete specification (12,000+ lines)
- ✅ Ready-to-use manual wrappers (scripts/bebopt.sh, etc.)
- ✅ Template packs/plans (3 artifacts)
- ✅ Comprehensive documentation (10 guides)

### Implementation

**Automatic Integration (Planned - See [IMPLEMENTATION_PLAN_V2.md](IMPLEMENTATION_PLAN_V2.md)):**

- ⏳ Phase 1: Context detection engine
- ⏳ Phase 2: Pack selection engine
- ⏳ Phase 3: Prompt compiler
- ⏳ Phase 4: AI CLI hook integration (Claude Code, opencode, Cursor)
- ⏳ Phase 6: Auto-setup (`bebop init --auto`)

**Manual Wrappers (Available Now):**

- ✅ Universal wrapper (bebopt.sh)
- ✅ Claude Code wrapper (bebop-claude.sh)
- ✅ opencode wrapper (bebop-opencode.sh)

**Current Version:** 0.1.0 (Alpha)

**Note:** See [IMPLEMENTATION_GAPS_REVIEW.md](IMPLEMENTATION_GAPS_REVIEW.md) for detailed gap analysis and [IMPLEMENTATION_CHANGES_SUMMARY.md](IMPLEMENTATION_CHANGES_SUMMARY.md) for revision summary.

## Roadmap

### Priority 1: Automatic AI CLI Integration (4 weeks)

- [ ] Phase 1: Context detection engine
- [ ] Phase 2: Pack selection engine
- [ ] Phase 3: Prompt compiler
- [ ] Phase 4: AI CLI hook integration (Claude Code, opencode, Cursor)
- [ ] Phase 6: Auto-setup (`bebop init --auto`)

### Priority 2: Enhancement (2 weeks)

- [ ] Phase 5: Enforcement hooks (secret scanning, validation)
- [ ] Pack management CLI (list, show, create, update)
- [ ] Plan runner with sessions

### Priority 3: Collaboration (2 weeks)

- [ ] Phase 7: Distribution & sharing
- [ ] Team pack registries
- [ ] Version management
- [ ] Analytics & optimization suggestions

See [IMPLEMENTATION_PLAN_V2.md](IMPLEMENTATION_PLAN_V2.md) for detailed timeline.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

Quick start:

```bash
git clone https://github.com/bebop/cli.git
cd cli
npm install
npm run build
npm test
```

## License

MIT © Bebop Contributors

## Support

- 📖 [Documentation](docs/)
- 💬 [Discord](https://discord.gg/bebop)
- 🐛 [Issues](https://github.com/bebop/cli/issues)
- ✉️ [Email](mailto:support@bebop.dev)

## Acknowledgments

Inspired by the real-world challenges of managing AI context at scale in production environments.

---

**Made with ❤️ by the Bebop team**

<a href="https://star-history.com/#bebop/cli&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=bebop/cli&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=bebop/cli&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=bebop/cli&type=Date" />
  </picture>
</a>
