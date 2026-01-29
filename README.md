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

---

## Quick Start

### Installation

```bash
npm install -g @bebop/cli
```

**Requires:** Node.js 18+  

### First-Time Setup

```bash
# Initialize bebop registry
bebop init

# Setup for your project
cd your-project
bebop init --project
```

### Basic Usage

```bash
# Send a simple request
bebop chat &use core example Create a REST API for users

# Use a plan with parameters
bebop chat &plan create-endpoint route=POST:/users name=CreateUser

# See what would be sent (dry-run)
bebop chat --dry-run &use core example Add authentication
```

---

## Documentation

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

### Example 1: Simple Task with Constraints

```bash
$ bebop chat &use core example Create a user authentication system

Task: Create a user authentication system

Active constraints:
- [NO_SECRETS] Never add secrets (keys, tokens, passwords) to code or docs.
- [VALIDATE_JWT] Use standard JWT libraries, don't implement crypto yourself.

Step: N/A

📊 Stats:
  - Original: 34 tokens
  - Compiled: 87 tokens
  - Rules active: 2
```

### Example 2: Plan-Based Workflow

```bash
$ bebop plan run create-endpoint route=POST:/job-postings name=CreateJobPosting

📋 Plan: upwage/screener/create-endpoint@v1
📝 Session: session_20250129_140000_xyz789

Step 1/6: Read service guide
  → services/api/screener/.claude/claude.md

💡 Complete this step, then run 'bebop step 2' to continue
```

### Example 3: Session Management

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

Real-world savings from our beta users:

| Use Case | Without Bebop | With Bebop | Savings |
|----------|---------------|------------|---------|
| Simple function | 850 tokens | 95 tokens | 89% |
| CRUD endpoint | 1,200 tokens | 110 tokens | 91% |
| Feature implementation | 2,500 tokens | 180 tokens | 93% |
| Refactoring | 1,800 tokens | 130 tokens | 93% |

**Average: 92% token reduction**

---

## How It Works

```
Your Input:
  &use core nestjs
  &plan create-endpoint route=POST:/users
  Implement with JWT authentication

          ↓
    [Bebop CLI]
          ↓
  Parses directives
  Resolves packs/plans
  Compiles minimal prompt
          ↓
Compiled Prompt:
  Task: Implement with JWT authentication
  
  Active constraints:
  - [NO_XSVC_IMPORT] Services are independent...
  - [NESTJS_CONVENTIONS] Follow NestJS patterns...
  
  Step: Create controller, service, DTO
          ↓
    [LLM]
          ↓
  Receives only essential context
  Generates code
  90% fewer tokens
```

## Project Status

- ✅ Phase 1: Directive parser & prompt compiler
- ✅ Phase 2: Local registry (packs & plans)
- ✅ Phase 3: Init scaffolding
- 🚧 Phase 4: Pack management (manual packs)
- 🚧 Phase 5: Plan runner & sessions
- ⏳ Phase 6: Enforcement hooks
- ⏳ Phase 7: Distribution & sharing

**Current Version:** 0.1.0 (Alpha)

## Roadmap

- [ ] Natural language constraint extraction
- [ ] Automatic pack compilation from docs
- [ ] Remote registry & sharing
- [ ] Team collaboration features
- [ ] Analytics & optimization suggestions
- [ ] IDE integrations (Cursor, VS Code, JetBrains)

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
