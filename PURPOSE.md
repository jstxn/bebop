# Bebop: Purpose & Mission

## Core Purpose

Bebop is a **guardrails + context layer** for AI coding agents. It automatically injects compact, relevant coding constraints into prompts—improving consistency, safety, and speed of iteration across tools (Claude Code, Codex, Cursor, etc.).

## The Problem We Solve

AI coding agents like Claude Code, Codex, and Cursor need context about project standards—security practices, code style, testing requirements. Without optimization:

- **Context drift**: Agents forget or inconsistently apply standards over long sessions
- **Repeated back-and-forth**: “Don’t do X / follow our rules” corrections burn time and attention
- **Inconsistency**: Agents forget constraints after several turns
- **Security risk**: No enforcement of security guardrails

## How Bebop Solves It

1. **Compile, don't copy**: Transform verbose standards into compact constraints
2. **Auto-inject**: Hook into AI CLI tools to add constraints invisibly
3. **Smart selection**: Only inject constraints relevant to the current task/context
4. **Enforce guardrails**: Security and quality rules applied consistently

```
Without Bebop: "Create login API" + pages of guidelines (or repeated reminders)
With Bebop:    "Create login API" + a short list of relevant constraints

Result: standards stay consistent with less rework
```

**Important:** token reduction depends on your workflow (e.g., whether you paste long guidelines into prompts). Bebop does not increase a model’s hard context window or bypass provider usage limits.

## Guiding Principles

### 1. Invisible by Default
Users should never have to think about Bebop. It works in the background via hooks and auto-integration. No syntax to learn, no commands to remember.

### 2. Quality Over Quantity
Fewer tokens ≠ less guidance. Compiled constraints are precise and actionable. An agent reading `[VALIDATE_ALL_INPUTS]` knows exactly what to do.

### 3. Security First
Core security pack is always included. Agents cannot generate code with hardcoded secrets, SQL injection vulnerabilities, or unvalidated inputs.

### 4. Context Preservation
By keeping constraints precise and relevant, we give agents more room for actual work—code, reasoning, and file contents—while keeping standards consistently visible.

### 5. Universal Compatibility
Bebop works with any AI coding agent that accepts text prompts. Integration patterns adapt to each tool's architecture.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   User's Prompt                      │
│              "Create a REST API for users"           │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│                 Bebop Hook Layer                     │
│  1. Detect context (language, framework, service)    │
│  2. Select relevant packs                            │
│  3. Compile to constraint IDs                        │
│  4. Inject into prompt                               │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│              AI Agent Receives                       │
│  "Create a REST API for users"                       │
│  Active constraints:                                 │
│  - [NO_SECRETS] Never add secrets to code...         │
│  - [VALIDATE_ALL_INPUTS] Validate user inputs...     │
│  - [USE_TYPED_INTERFACES] Use TypeScript types...    │
│  Context: backend, typescript, nestjs                │
└─────────────────────────────────────────────────────┘
```

## Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **Packs** | Bundles of rules for a domain (security, quality) | `packs/`, `templates/packs/` |
| **Plans** | Multi-step workflows with state | `plans/`, `templates/plans/` |
| **CLI** | Compile, detect, stats commands | `src/` |
| **Hooks** | Auto-integration with AI tools | `src/init.ts`, `scripts/` |
| **Skills** | Agent-loadable instruction sets | `skills/` |

## Integration Status

| Tool | Method | Status |
|------|--------|--------|
| Claude Code | UserPromptSubmit hook | ✅ Implemented |
| Cursor | Hook integration | ✅ Implemented |
| opencode | Plugin | ✅ Implemented |
| Codex | AGENTS.md injection | 🔜 Planned |

## For Agents Working in This Repo

When contributing to Bebop:

1. **Read existing patterns** in `src/` before adding new code
2. **Follow the constraint packs** we eat our own dogfood
3. **Keep functions small** (<50 lines) and well-typed
4. **Test changes** with `npm test`
5. **Check integration points** in `src/init.ts` for hook patterns

### Key Files

- `src/init.ts` - Auto-integration logic for all AI tools
- `src/compile.ts` - Prompt compilation engine
- `src/detect.ts` - Context detection (language, framework, service)
- `templates/packs/` - Constraint pack templates
- `docs/integrations/` - Per-tool integration guides

## Success Metrics

- **Consistency**: Fewer “forgot to mention” failures and fewer reversions
- **Iteration speed**: Fewer turns to get to a correct PR-quality result
- **Zero friction**: Users shouldn't need to configure anything
- **Quality maintained**: Output code passes linting, tests, security checks
- **Universal reach**: Support all major AI coding agents

## Mission Statement

**Make AI coding agents more efficient without sacrificing quality.**

Every unnecessary token avoided is context preserved. Every constraint enforced is a vulnerability prevented. Every integration is a user who never has to think about prompt guardrails again.
