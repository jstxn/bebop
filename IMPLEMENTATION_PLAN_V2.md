# Bebop Implementation Plan v2 - Automatic AI CLI Integration

**Revised for automatic, invisible optimization within existing AI CLI tools (Claude Code, Cursor, opencode)**

---

## Executive Summary

**Critical Realization:** The original implementation plan was backwards. Users don't want to type `&use core/security` or run wrapper scripts. They want to use their AI tools normally and get automatic optimization.

**New Approach:** Hook-based automatic integration using AI CLI tool extension points:

- Claude Code: `UserPromptSubmit` hook
- Cursor: Similar hook system
- opencode: Plugin system
- Others: Shell aliases/functions

**User Experience:**

```bash
# Before (manual - wrong approach)
claude "&use core/security &use core/nestjs Create a login endpoint"

# After (automatic - correct approach)
claude "Create a login endpoint"
# Bebop automatically: detects context → selects packs → compiles → sends to Claude
```

---

## Revised 7-Phase Implementation Plan

### Phase 0.5 — Hook Architecture Research ✅ COMPLETE

**Status:** Already completed via exploration

- Documented hook systems for Claude Code, Cursor, opencode
- Identified `UserPromptSubmit` hook as primary integration point
- Found command execution patterns for all major AI CLIs
- Documented skill/plugin loading mechanisms

**Deliverables:**

- ✅ Hook integration patterns documented
- ✅ Cross-platform compatibility identified
- ✅ Configuration file locations mapped

---

### Phase 1 — Auto-Context Detection Engine

**Objective:** Automatically detect project context without user input

#### 1.1 Context Detection Algorithm

**Detect:**

1. **Project Type**
   - Frontend (package.json has "react", "vue", "angular")
   - Backend (has server files, API routes)
   - Mobile (React Native, Flutter configs)
   - Monorepo (nx.json, turbo.json, pnpm-workspace.yaml)

2. **Language**
   - File extension scanning (ts, py, go, rs, etc.)
   - Config file detection (tsconfig.json, pyproject.toml, go.mod, Cargo.toml)

3. **Framework**
   - NestJS: "@nestjs/core" in package.json
   - Express: "express" in package.json
   - React: "react" in package.json
   - Django: manage.py file
   - Rails: Gemfile with "rails"

4. **Service Context** (monorepos)
   - Path analysis: `services/api/screener` → "screener"
   - Config reading: service-specific .claude files

5. **Git Context**
   - Current branch: `git branch --show-current`
   - Branch type detection: `feature/*`, `bugfix/*`, `release/*`
   - PR context: git remotes, PR number

#### 1.2 Implementation

**New file:** `src/context-detector.ts`

```typescript
export interface DetectedContext {
  project: {
    type: 'frontend' | 'backend' | 'mobile' | 'library';
    framework: string | null;
    language: string[];
    isMonorepo: boolean;
    monorepoType: 'nx' | 'turborepo' | 'yarn-workspaces' | 'lerna' | 'unknown';
  };
  service: {
    name: string | null;
    root: string | null;
  };
  git: {
    branch: string;
    branchType: 'feature' | 'bugfix' | 'release' | 'main' | 'unknown';
    isPr: boolean;
  };
  task: {
    keywords: string[];
    complexity: 'low' | 'medium' | 'high';
    type: 'feature' | 'bugfix' | 'refactor' | 'test' | 'documentation' | 'unknown';
  };
}

export class ContextDetector {
  async detect(cwd?: string): Promise<DetectedContext>;
  private async detectProjectType(): Promise<...>;
  private async detectFramework(): Promise<...>;
  private async detectLanguage(): Promise<...>;
  private async detectService(): Promise<...>;
  private async detectGitContext(): Promise<...>;
  private async analyzeTask(input: string): Promise<...>;
}
```

**Testing:**

```typescript
// tests/context-detector.test.ts
describe("ContextDetector", () => {
  it("detects NestJS monorepo", async () => {
    const context = await detector.detect("/path/to/nestjs-monorepo");
    expect(context.project.type).toBe("backend");
    expect(context.project.framework).toBe("nestjs");
    expect(context.project.isMonorepo).toBe(true);
  });

  it("detects service in monorepo", async () => {
    const context = await detector.detect("/services/api/screener");
    expect(context.service.name).toBe("screener");
  });

  it("detects bug fix branch", async () => {
    const context = await detector.detect();
    expect(context.git.branchType).toBe("bugfix");
  });
});
```

**Success metric:** Context detection accuracy > 95% on common project structures.

---

### Phase 2 — Auto-Pack Selection Engine

**Objective:** Automatically select relevant packs based on detected context

#### 2.1 Pack Selection Algorithm

**Rule-based selection:**

```typescript
export interface PackSelectionRules {
  // Always include
  alwaysInclude: string[]; // e.g., ['core/security', 'core/code-quality']

  // Conditional inclusion
  conditional: {
    projectType: {
      frontend: string[]; // e.g., ['framework/react', 'framework/vue']
      backend: string[]; // e.g., ['framework/nestjs', 'framework/express']
      mobile: string[]; // e.g., ['framework/react-native']
    };
    language: {
      typescript: string[];
      python: string[];
      go: string[];
    };
    framework: Record<string, string[]>; // e.g., { nestjs: ['nestjs/conventions'] }
    service: Record<string, string[]>; // e.g., { userservice: ['services/userservice'] }
  };

  // Keyword-based
  keywords: Record<string, string[]>; // e.g., { test: ['tasks/testing'], security: ['tasks/security'] }

  // Maximum constraints
  maxConstraints: number;
  minConfidence: number;
}

export class PackSelector {
  async select(context: DetectedContext, userInput: string): Promise<string[]>;
  private selectAlwaysInclude(): string[];
  private selectByProjectType(context: DetectedContext): string[];
  private selectByLanguage(context: DetectedContext): string[];
  private selectByFramework(context: DetectedContext): string[];
  private selectByService(context: DetectedContext): string[];
  private selectByKeywords(userInput: string): string[];
  private deduplicateAndPrioritize(packs: string[]): string[];
}
```

**Selection Logic:**

```typescript
async select(context: DetectedContext, userInput: string): Promise<string[]> {
  const selectedPacks = new Set<string>();

  // Always include
  this.rules.alwaysInclude.forEach(p => selectedPacks.add(p));

  // Project type
  if (this.rules.conditional.projectType[context.project.type]) {
    this.rules.conditional.projectType[context.project.type].forEach(p => selectedPacks.add(p));
  }

  // Language
  context.project.language.forEach(lang => {
    if (this.rules.conditional.language[lang]) {
      this.rules.conditional.language[lang].forEach(p => selectedPacks.add(p));
    }
  });

  // Framework
  if (context.project.framework && this.rules.conditional.framework[context.project.framework]) {
    this.rules.conditional.framework[context.project.framework].forEach(p => selectedPacks.add(p));
  }

  // Service
  if (context.service.name && this.rules.conditional.service[context.service.name]) {
    this.rules.conditional.service[context.service.name].forEach(p => selectedPacks.add(p));
  }

  // Keywords
  context.task.keywords.forEach(keyword => {
    if (this.rules.keywords[keyword]) {
      this.rules.keywords[keyword].forEach(p => selectedPacks.add(p));
    }
  });

  // Deduplicate and prioritize
  return this.deduplicateAndPrioritize(Array.from(selectedPacks));
}
```

#### 2.2 Configuration

**File:** `.bebop-auto.yaml` (optional override)

```yaml
# Manual override if auto-detection is wrong
project:
  type: backend
  framework: nestjs
  language: typescript
  is_monorepo: true
  service: userservice

packs:
  always_include:
    - core/security
    - core/code-quality

  max_constraints: 15
  min_confidence: 0.7

keywords:
  test: ["tasks/testing", "tasks/aaa-pattern"]
  security: ["tasks/security", "framework/auth"]
  performance: ["tasks/performance"]

debug:
  enabled: false
  log_file: .bebop-auto.log
  show_selected_packs: true
  show_compiled_prompt: false
```

**Testing:**

```typescript
describe("PackSelector", () => {
  it("selects NestJS backend packs", async () => {
    const context = {
      project: {
        type: "backend",
        framework: "nestjs",
        language: ["typescript"],
      },
      service: { name: "userservice" },
      task: { keywords: ["auth"] },
    };

    const packs = await selector.select(context, "Create login endpoint");
    expect(packs).toContain("core/security");
    expect(packs).toContain("core/nestjs");
    expect(packs).toContain("core/typescript");
    expect(packs).toContain("services/userservice");
  });
});
```

**Success metric:** Pack selection accuracy > 90% on real-world tasks.

---

### Phase 3 — Automatic Prompt Compiler

**Objective:** Compile optimized prompt without manual directives

#### 3.1 Compilation Pipeline

**Input:** User's natural language input + auto-detected context + auto-selected packs

**Output:** Compiled prompt ready for AI

```typescript
export interface CompiledPrompt {
  task: string;
  constraints: Array<{
    id: string;
    text: string;
    source: string; // pack ID
  }>;
  context: {
    project: string;
    service: string | null;
    framework: string | null;
  };
  stats: {
    originalTokens: number;
    compiledTokens: number;
    savings: number;
  };
}

export class PromptCompiler {
  async compile(
    userInput: string,
    context: DetectedContext,
    selectedPacks: string[],
  ): Promise<CompiledPrompt>;

  private async loadPacks(packs: string[]): Promise<Pack[]>;
  private selectRelevantRules(packs: Pack[], context: DetectedContext): Rule[];
  private formatConstraints(rules: Rule[]): string[];
  private calculateTokens(text: string): number;
}
```

**Compilation Logic:**

```typescript
async compile(userInput: string, context: DetectedContext, selectedPacks: string[]): Promise<CompiledPrompt> {
  // Load selected packs
  const packs = await this.loadPacks(selectedPacks);

  // Select relevant rules based on context
  const relevantRules = this.selectRelevantRules(packs, context);

  // Format constraints
  const constraints = relevantRules.map(rule => ({
    id: rule.id,
    text: rule.text,
    source: rule.packId
  }));

  // Calculate token savings
  const compiledText = this.formatCompiledPrompt(userInput, constraints, context);
  const originalTokens = this.calculateTokens(this.formatOriginalPrompt(userInput, context));
  const compiledTokens = this.calculateTokens(compiledText);

  return {
    task: userInput,
    constraints,
    context: {
      project: path.basename(context.git.branch),
      service: context.service.name,
      framework: context.project.framework
    },
    stats: {
      originalTokens,
      compiledTokens,
      savings: ((originalTokens - compiledTokens) / originalTokens * 100)
    }
  };
}
```

**Output Format:**

```
Task: Create a user login endpoint

Active constraints:
- [NO_SECRETS] Never add secrets (keys, tokens, passwords) to code, docs, or logs. (core/security)
- [NESTJS_CONVENTIONS] Follow NestJS patterns: use decorators, DTOs, guards. (core/nestjs)
- [USE_TYPES] Use TypeScript interfaces for all request/response types. (core/typescript)
- [USERSERVICE_VALIDATION] Use userservice validation decorators. (services/userservice)

Context: NestJS backend, userservice
```

**Testing:**

```typescript
describe("PromptCompiler", () => {
  it("compiles prompt with relevant constraints", async () => {
    const compiled = await compiler.compile(
      "Create a login endpoint",
      nestjsContext,
      ["core/security", "core/nestjs"],
    );

    expect(compiled.constraints.length).toBeGreaterThan(0);
    expect(compiled.stats.savings).toBeGreaterThan(80);
  });

  it("achieves 90%+ token savings", async () => {
    const compiled = await compiler.compile(
      "Create a login endpoint",
      context,
      packs,
    );
    expect(compiled.stats.savings).toBeGreaterThanOrEqual(90);
  });
});
```

**Success metric:** 90%+ token reduction on average, compiled prompts are semantically equivalent to full context.

---

### Phase 4 — AI CLI Hook Integration

**Objective:** Seamlessly integrate with existing AI CLI tools via hooks

#### 4.1 Claude Code Hook Integration

**Hook Type:** `UserPromptSubmit`

**File:** `~/.claude/settings.json` (auto-configured by `bebop init`)

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "bebop-hook compile"
          }
        ]
      }
    ]
  }
}
```

**Hook Script:** `~/.claude/hooks/bebop-hook.sh` (auto-installed)

```bash
#!/bin/bash
# Claude Code UserPromptSubmit hook

# Read user input from stdin
USER_INPUT=$(cat)

# Skip if already compiled (prevent infinite loop)
if [[ "$USER_INPUT" == *"Active constraints:"* ]]; then
  echo "$USER_INPUT"
  exit 0
fi

# Detect context
CONTEXT=$(bebop detect-context --json)

# Select packs
PACKS=$(bebop select-packs --context "$CONTEXT" --input "$USER_INPUT" --json)

# Compile prompt
COMPILED=$(bebop compile --input "$USER_INPUT" --context "$CONTEXT" --packs "$PACKS")

# Output compiled prompt (replaces original input)
echo "$COMPILED"
```

#### 4.2 Cursor Hook Integration

**Hook Type:** Similar to Claude Code

**File:** `~/.cursor/settings.json` (auto-configured)

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "bebop-hook compile"
          }
        ]
      }
    ]
  }
}
```

#### 4.3 opencode Plugin Integration

**Plugin File:** `~/.config/opencode/plugin/bebop.js`

```javascript
module.exports = {
  name: "bebop",
  version: "1.0.0",

  sessionHooks: {
    async onUserPrompt(userInput, context) {
      // Skip if already compiled
      if (userInput.includes("Active constraints:")) {
        return userInput;
      }

      // Use bebop CLI
      const { execSync } = require("child_process");

      const contextJson = execSync("bebop detect-context --json", {
        encoding: "utf-8",
      });
      const packsJson = execSync(
        `bebop select-packs --context '${contextJson}' --input '${userInput}' --json`,
        { encoding: "utf-8" },
      );
      const compiled = execSync(
        `bebop compile --input '${userInput}' --context '${contextJson}' --packs '${packsJson}'`,
        { encoding: "utf-8" },
      );

      return compiled.trim();
    },
  },
};
```

#### 4.4 Shell Alias Fallback

**For tools without hooks:**

**File:** `~/.bashrc` or `~/.zshrc` (auto-added)

```bash
# Bebop automatic integration
claude() {
  local input="$@"

  # Skip if already compiled
  if [[ "$input" != *"Active constraints:"* ]]; then
    input=$(bebop compile-auto "$input")
  fi

  command claude "$input"
}

opencode() {
  local input="$@"

  # Skip if already compiled
  if [[ "$input" != *"Active constraints:"* ]]; then
    input=$(bebop compile-auto "$input")
  fi

  command opencode "$input"
}

cursor() {
  local input="$@"

  # Skip if already compiled
  if [[ "$input" != *"Active constraints:"* ]]; then
    input=$(bebop compile-auto "$input")
  fi

  command cursor "$input"
}
```

**CLI Command:** `bebop compile-auto` (new command)

```bash
#!/bin/bash
# Single command for automatic compilation

USER_INPUT="$@"

# Detect context
CONTEXT=$(bebop detect-context --json)

# Select packs
PACKS=$(bebop select-packs --context "$CONTEXT" --input "$USER_INPUT" --json)

# Compile
bebop compile --input "$USER_INPUT" --context "$CONTEXT" --packs "$PACKS"
```

#### 4.5 Auto-Installation

**Command:** `bebop init --auto` (new)

**What it does:**

1. Detects installed AI CLI tools (claude, opencode, cursor)
2. Installs hooks for supported tools
3. Creates shell aliases for fallback
4. Tests integration
5. Reports status

**Implementation:**

```typescript
async installAutoIntegration(): Promise<void> {
  const detectedTools = await this.detectAITools();

  for (const tool of detectedTools) {
    switch (tool) {
      case 'claude':
        await this.installClaudeHook();
        break;
      case 'opencode':
        await this.installOpencodePlugin();
        break;
      case 'cursor':
        await this.installCursorHook();
        break;
    }
  }

  await this.installShellAliases();
  await this.testIntegration();
}
```

**Testing:**

```bash
$ bebop init --auto

Detected AI CLI tools:
  ✅ Claude Code
  ✅ opencode
  ❌ Cursor (not installed)

Installing integration:
  ✅ Claude Code hook installed (~/.claude/settings.json)
  ✅ opencode plugin installed (~/.config/opencode/plugin/bebop.js)
  ✅ Shell aliases added (~/.bashrc)

Testing integration:
  ✅ Claude Code: Hook active
  ✅ opencode: Plugin loaded
  ✅ Shell aliases: Working

Setup complete! You can now use AI tools normally.
Bebop will automatically optimize your prompts.

Try: claude "Create a user authentication system"
```

**Success metric:** Integration works with 100% of detected AI CLI tools, zero user configuration required.

---

### Phase 5 — Local Pack Registry

**Objective:** Store and manage packs locally

**Status:** Existing spec is good, just needs implementation.

**Implementation details from original plan are valid.**

**Key additions:**

- Auto-download starter packs on `bebop init`
- Pack version management
- Pack update checks

---

### Phase 6 — Enforcement Hooks

**Objective:** CLI-side validation before sending to AI

**Status:** Existing spec is good, needs integration with automatic flow.

**Key addition:**

- Run enforcement automatically after compilation
- Fail fast before sending to AI
- Show clear error messages

---

### Phase 7 — Distribution + Sharing

**Objective:** Share packs and auto-skill configuration across teams

**Key features:**

- Team pack registries
- Version management
- Rollback capabilities

---

## Critical Gaps Fixed

### 1. ✅ Integration Architecture

**Before:** Manual wrapper scripts requiring explicit `bebopt claude "..."` calls
**After:** Hook-based automatic integration via AI CLI extension points

### 2. ✅ User Experience

**Before:** User must type `&use core/security &use core/nestjs Create...`
**After:** User just types `Create...` - everything is automatic

### 3. ✅ Implementation Focus

**Before:** Directive parser is Phase 1 (wrong)
**After:** Auto-context detection + pack selection + compilation are Phase 1-3 (correct)

### 4. ✅ Zero Configuration

**Before:** Manual setup of aliases, manual pack selection
**After:** `bebop init --auto` does everything automatically

### 5. ✅ Fallback Strategy

**Before:** No integration for tools without hooks
**After:** Shell aliases provide universal fallback

---

## Implementation Order (Priority)

### P0 (MVP - 4 weeks)

1. Phase 1: Context detection engine
2. Phase 2: Pack selection engine
3. Phase 3: Prompt compiler
4. Phase 4: Claude Code hook + shell aliases
5. Basic local registry (5 starter packs)

**MVP User Experience:**

```bash
$ npm install -g @bebophq/cli
$ bebop init --auto
$ claude "Create a user login endpoint"
# Automatic: context detected → packs selected → compiled → sent to Claude
```

### P1 (Enhancement - 2 weeks)

6. opencode plugin
7. Cursor hook
8. Enforcement hooks
9. Pack management CLI

### P2 (Polish - 2 weeks)

10. Pack sharing
11. Auto-updates
12. Analytics dashboard

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Types Command                         │
│              claude "Create a login endpoint"                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              AI CLI Hook / Shell Alias                       │
│     (Intercepts before sending to LLM)                       │
│                                                              │
│  Hook: UserPromptSubmit → bebop-hook compile                 │
│  Alias: claude() → bebop compile-auto → command claude       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Bebop CLI                                   │
│                                                              │
│  1. Context Detector                                         │
│     - Scan files (package.json, tsconfig.json, etc.)         │
│     - Detect project type, framework, language                 │
│     - Detect service (monorepo)                               │
│     - Detect git context (branch, PR)                         │
│                                                              │
│  2. Pack Selector                                           │
│     - Always include: core/security, core/code-quality        │
│     - By project type: framework/nestjs, framework/react     │
│     - By language: core/typescript, core/python              │
│     - By service: services/userservice                        │
│     - By keywords: test, security, performance               │
│                                                              │
│  3. Prompt Compiler                                         │
│     - Load selected packs                                     │
│     - Select relevant rules                                   │
│     - Compile optimized prompt                                │
│     - Calculate token savings                                 │
│                                                              │
│  4. Enforcement Hooks (optional)                             │
│     - Secret scanning                                        │
│     - Diff validation                                       │
│     - Pattern matching                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Compiled Prompt Output                          │
│                                                              │
│  Task: Create a user login endpoint                         │
│                                                              │
│  Active constraints:                                         │
│  - [NO_SECRETS] Never add secrets...                        │
│  - [NESTJS_CONVENTIONS] Follow NestJS patterns...           │
│  - [USE_TYPES] Use TypeScript interfaces...                   │
│                                                              │
│  Context: NestJS backend, userservice                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI CLI Tool                               │
│              Sends to LLM as normal                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Success Metrics

### User Experience

- ✅ Zero manual configuration after `bebop init --auto`
- ✅ Zero manual typing of directives
- ✅ 100% invisible operation (users don't know Bebop is running)
- ✅ Zero latency impact (< 100ms compilation time)

### Technical

- ✅ 90%+ token reduction (measured)
- ✅ 95%+ context detection accuracy
- ✅ 90%+ pack selection accuracy
- ✅ Semantic equivalence verified by human testing

### Integration

- ✅ Works with Claude Code (hook)
- ✅ Works with opencode (plugin)
- ✅ Works with Cursor (hook)
- ✅ Works with any AI CLI (shell alias fallback)

---

## Risk Mitigation

### Risk 1: Hook Detection Fails

**Mitigation:** Shell alias fallback always works

### Risk 2: Context Detection Wrong

**Mitigation:** `.bebop-auto.yaml` manual override + continuous learning

### Risk 3: Wrong Packs Selected

**Mitigation:** High-confidence threshold, human review in early phase, feedback loop

### Risk 4: Compilation Breaks

**Mitigation:** Fallback to original input, error reporting, rollback

### Risk 5: AI Tool Updates Break Hooks

**Mitigation:** Version-agnostic design, hook format stability guarantees

---

## Next Steps

1. ✅ Update documentation to reflect automatic integration approach
2. ✅ Create Phase 1-3 implementation tickets
3. ✅ Build prototype of context detector + pack selector + compiler
4. ✅ Test with real projects and real prompts
5. ✅ Implement Claude Code hook integration
6. ✅ Measure token savings and accuracy
7. ✅ Iterate and refine

---

**This revised plan makes Bebop truly automatic and invisible - the way it should be.**
