# Bebop TUI Implementation Plan

**Status:** Planning
**Created:** 2026-01-31
**Goal:** Build a context-efficient, BYOK AI coding TUI

---

## Vision

A terminal-based AI coding agent that:
1. Works with any LLM provider (BYOK)
2. Prioritizes context efficiency and cost transparency
3. Integrates existing Bebop constraint injection
4. Provides a viable alternative to Claude Code/Codex for cost-conscious engineers

---

## Package Architecture

### Recommended: Monorepo with Shared Core

```
bebop/
├── packages/
│   ├── core/                 # @bebophq/core - shared logic
│   │   ├── src/
│   │   │   ├── providers/    # LLM API clients
│   │   │   ├── tools/        # File, shell, git operations
│   │   │   ├── context/      # Token counting, summarization
│   │   │   ├── constraints/  # Pack compilation (existing)
│   │   │   └── session/      # Conversation management
│   │   └── package.json
│   │
│   ├── cli/                  # @bebophq/cli - existing CLI
│   │   ├── src/
│   │   │   ├── commands/     # compile, detect, stats, init
│   │   │   └── index.ts
│   │   └── package.json      # depends on @bebophq/core
│   │
│   └── tui/                  # @bebophq/tui - new TUI
│       ├── src/
│       │   ├── ui/           # Terminal UI components
│       │   ├── agent/        # Agent loop, tool execution
│       │   └── index.ts
│       └── package.json      # depends on @bebophq/core
│
├── package.json              # Workspace root
├── pnpm-workspace.yaml       # or npm/yarn workspaces
└── tsconfig.base.json
```

### Why This Structure

| Benefit | Explanation |
|---------|-------------|
| **Shared logic** | Providers, tools, context management used by both CLI and TUI |
| **Independent publishing** | Users install only what they need |
| **Clear boundaries** | CLI = commands, TUI = interactive, Core = shared |
| **Existing code reuse** | Current CLI logic moves to core, CLI becomes thin wrapper |

### Migration Path

1. Extract shared logic from current `src/` into `packages/core/`
2. Keep CLI as thin wrapper around core
3. Build TUI as separate package using core
4. Existing `@bebophq/cli` users unaffected

### Code Sharing Benefits

Since both CLI and TUI are TypeScript:
- **Constraint compilation** - Reuse existing pack/compile logic
- **Context detection** - Same workspace detector
- **Provider clients** - Share Anthropic/OpenAI SDK wrappers
- **Tool implementations** - File, shell, git operations
- **Types** - Single source of truth for interfaces

---

## Core Package (@bebophq/core)

### What Moves Here (from existing CLI)

```typescript
// packages/core/src/index.ts
export { compile } from './constraints/compile';
export { detectContext } from './context/detect';
export { PackRegistry } from './constraints/registry';
export { createSession, Session } from './session';

// New additions
export { AnthropicProvider, OpenAIProvider } from './providers';
export { FileTools, ShellTools, GitTools } from './tools';
export { TokenCounter, ContextManager } from './context';
```

### Providers

```typescript
// packages/core/src/providers/types.ts
export interface LLMProvider {
  name: string;
  chat(messages: Message[], options: ChatOptions): AsyncIterable<Chunk>;
  countTokens(text: string): number;
  models: ModelInfo[];
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | ContentBlock[];
}

export interface ChatOptions {
  model: string;
  maxTokens?: number;
  temperature?: number;
  tools?: Tool[];
  systemPrompt?: string;
}
```

### Tools (for agent use)

```typescript
// packages/core/src/tools/types.ts
export interface Tool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  execute(input: unknown): Promise<ToolResult>;
}

// Built-in tools
export const fileReadTool: Tool;
export const fileWriteTool: Tool;
export const fileEditTool: Tool;
export const shellExecuteTool: Tool;
export const gitStatusTool: Tool;
export const globTool: Tool;
export const grepTool: Tool;
```

### Context Management

```typescript
// packages/core/src/context/manager.ts
export class ContextManager {
  constructor(options: {
    maxTokens: number;
    summarizationThreshold: number;
    provider: LLMProvider;
  });

  // Track what's in context
  addMessage(message: Message): void;
  getContextSize(): number;

  // Efficiency features
  summarizeIfNeeded(): Promise<void>;
  pruneOldMessages(keepLast: number): void;

  // Cost tracking
  getSessionCost(): Cost;
  getTokenBreakdown(): TokenBreakdown;
}
```

---

## TUI Package (@bebophq/tui)

### Tech Stack

**Decision:** TypeScript + Ink (same as Claude Code)

**Rationale:**
- Existing Bebop CLI is TypeScript—share code, single toolchain
- Faster iteration than Rust rewrite
- Ink/React pattern is proven (Claude Code uses it)
- Ship faster, optimize later if needed

| Component | Choice | Reason |
|-----------|--------|--------|
| Language | TypeScript | Matches existing CLI |
| UI Framework | **Ink** (React for terminals) | Familiar React model, good ecosystem |
| Input handling | Ink's built-in | Handles key events, focus |
| Styling | Ink + chalk | Colors, formatting |
| State | React hooks + context | Simple, no extra deps |
| Build | tsup or esbuild | Fast bundling |

### Key Dependencies

```json
{
  "dependencies": {
    "ink": "^5.0.0",
    "ink-text-input": "^6.0.0",
    "ink-spinner": "^5.0.0",
    "react": "^18.0.0",
    "@anthropic-ai/sdk": "^0.30.0",
    "openai": "^4.0.0",
    "chalk": "^5.0.0",
    "tiktoken": "^1.0.0"
  }
}

### UI Structure

```
┌─ Bebop ────────────────────────────────────────────────────┐
│ ┌─ Status Bar ───────────────────────────────────────────┐ │
│ │ claude-sonnet-4-20250514 │ 12.4k/200k tokens │ $0.08 session │ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌─ Messages ─────────────────────────────────────────────┐ │
│ │ > Create a REST API for user registration              │ │
│ │                                                        │ │
│ │ I'll create a user registration API with:              │ │
│ │ • POST /api/users/register endpoint                    │ │
│ │ • Input validation                                     │ │
│ │ • Password hashing with bcrypt                         │ │
│ │                                                        │ │
│ │ ┌─ Tool: file_write ─────────────────────────────────┐ │ │
│ │ │ src/routes/users.ts (+45 lines)                    │ │ │
│ │ │ [v]iew [a]ccept [r]eject                          │ │ │
│ │ └────────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌─ Input ────────────────────────────────────────────────┐ │
│ │ > _                                                    │ │
│ └────────────────────────────────────────────────────────┘ │
│ [Ctrl+C] quit  [Ctrl+L] clear  [Tab] focus  [?] help      │
└────────────────────────────────────────────────────────────┘
```

### Key Components

```typescript
// packages/tui/src/ui/App.tsx
export function App() {
  return (
    <Box flexDirection="column">
      <StatusBar />
      <MessageList />
      <ToolApproval />
      <InputArea />
      <HelpBar />
    </Box>
  );
}

// packages/tui/src/ui/StatusBar.tsx
export function StatusBar({ session }: { session: Session }) {
  return (
    <Box borderStyle="single" paddingX={1}>
      <Text>{session.model}</Text>
      <Text> │ </Text>
      <Text color={getContextColor(session.contextUsage)}>
        {formatTokens(session.tokensUsed)}/{formatTokens(session.maxTokens)}
      </Text>
      <Text> │ </Text>
      <Text color="green">${session.cost.toFixed(2)} session</Text>
    </Box>
  );
}
```

### Agent Loop

```typescript
// packages/tui/src/agent/loop.ts
export async function runAgentLoop(
  session: Session,
  userMessage: string,
  onUpdate: (update: AgentUpdate) => void
): Promise<void> {
  // 1. Inject Bebop constraints (from core)
  const constraints = await compileConstraints(session.context);

  // 2. Build messages with context management
  const messages = session.contextManager.buildMessages(userMessage, constraints);

  // 3. Stream response
  for await (const chunk of session.provider.chat(messages, {
    model: session.model,
    tools: session.enabledTools,
  })) {
    onUpdate({ type: 'chunk', content: chunk });
    session.contextManager.trackTokens(chunk);
  }

  // 4. Handle tool calls
  if (chunk.toolCalls) {
    for (const call of chunk.toolCalls) {
      onUpdate({ type: 'tool_request', call });
      // Wait for user approval...
      const result = await executeToolWithApproval(call);
      onUpdate({ type: 'tool_result', result });
    }
  }
}
```

---

## Efficiency Features

### 1. Smart File Loading

```typescript
// Instead of loading entire files, load relevant chunks
async function smartFileRead(path: string, query: string): Promise<string> {
  const content = await fs.readFile(path, 'utf-8');

  // If file is small, return all
  if (countTokens(content) < 500) return content;

  // Otherwise, find relevant sections
  const chunks = splitIntoChunks(content, 200); // ~200 tokens each
  const relevant = await rankByRelevance(chunks, query);

  return relevant.slice(0, 3).join('\n...\n');
}
```

### 2. Aggressive Summarization

```typescript
// Summarize conversation when approaching limit
async function summarizeConversation(
  messages: Message[],
  keepLast: number = 4
): Promise<Message[]> {
  const toSummarize = messages.slice(0, -keepLast);
  const toKeep = messages.slice(-keepLast);

  const summary = await provider.chat([
    { role: 'system', content: 'Summarize this conversation concisely...' },
    ...toSummarize
  ]);

  return [
    { role: 'system', content: `Previous context: ${summary}` },
    ...toKeep
  ];
}
```

### 3. Token Budget Mode

```typescript
// User sets budget, TUI respects it
interface BudgetConfig {
  maxTokensPerTurn: number;    // Don't send more than this
  maxCostPerSession: number;   // Warn/stop at this cost
  summarizeAt: number;         // Summarize when context hits this %
}
```

### 4. Cost Comparison

```typescript
// Show what current request would cost on different providers
function showCostComparison(tokens: number): CostComparison[] {
  return [
    { provider: 'Claude Sonnet', cost: tokens * CLAUDE_SONNET_RATE },
    { provider: 'Claude Haiku', cost: tokens * CLAUDE_HAIKU_RATE },
    { provider: 'GPT-4o', cost: tokens * GPT4O_RATE },
    { provider: 'GPT-4o-mini', cost: tokens * GPT4O_MINI_RATE },
  ];
}
```

---

## Configuration

```yaml
# ~/.bebop/config.yaml
providers:
  anthropic:
    apiKey: ${ANTHROPIC_API_KEY}  # From env
  openai:
    apiKey: ${OPENAI_API_KEY}

defaults:
  provider: anthropic
  model: claude-sonnet-4-20250514

efficiency:
  summarizeAt: 0.7           # Summarize at 70% context
  maxTokensPerFile: 2000     # Chunk large files
  budgetWarning: 5.00        # Warn at $5

constraints:
  autoInject: true
  packs:
    - core/security
    - core/code-quality
```

---

## Implementation Phases

### Phase 0: Monorepo Setup (1-2 days)
- [ ] Set up pnpm/npm workspaces
- [ ] Create packages/core, packages/cli, packages/tui
- [ ] Move shared code from src/ to packages/core
- [ ] Ensure existing CLI still works
- [ ] Update build scripts

### Phase 1: Core Providers (3-4 days)
- [ ] Implement AnthropicProvider with streaming
- [ ] Implement OpenAIProvider with streaming
- [ ] Token counting per provider
- [ ] Unified Message/Tool types
- [ ] Basic error handling

### Phase 2: Core Tools (3-4 days)
- [ ] FileReadTool with smart chunking
- [ ] FileWriteTool with diff display
- [ ] FileEditTool (string replacement)
- [ ] ShellExecuteTool with timeout
- [ ] GlobTool, GrepTool

### Phase 3: Basic TUI (4-5 days)
- [ ] Ink setup and basic layout
- [ ] Message list with streaming
- [ ] Input area with history
- [ ] Status bar with token count
- [ ] Basic key bindings (quit, clear, help)

### Phase 4: Agent Loop (3-4 days)
- [ ] Connect TUI to provider
- [ ] Tool call display and approval flow
- [ ] Error handling and recovery
- [ ] Session persistence

### Phase 5: Efficiency Features (4-5 days)
- [ ] Context manager with summarization
- [ ] Cost tracking and display
- [ ] Smart file loading
- [ ] Token budget mode

### Phase 6: Constraint Integration (2-3 days)
- [ ] Port constraint compilation from CLI
- [ ] Auto-inject based on context
- [ ] Pack selection UI

### Phase 7: Polish (3-4 days)
- [ ] Configuration UI / setup wizard
- [ ] Help system
- [ ] Session export/import
- [ ] Performance optimization

**Total: ~4-5 weeks for MVP**

---

## MVP Definition (Week 2)

Minimum to validate the thesis:

1. ✅ Connect to Claude API
2. ✅ Basic chat with streaming
3. ✅ File read/write tools
4. ✅ Token counting display
5. ✅ Cost display
6. ✅ One efficiency feature (smart file loading OR summarization)

**Validation metric:** Same task takes 30%+ fewer tokens than Claude Code.

---

## Open Questions

1. **Session persistence format?** JSON? SQLite?
2. **Multi-file editing UX?** Show all changes, approve individually or batch?
3. **Git integration depth?** Just status, or full commit/push/PR flow?
4. **Local model support?** Ollama? LMStudio? Scope creep risk.
5. **Plugin system?** Too early, but worth considering architecture for it.

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Token efficiency vs Claude Code | 30%+ savings |
| Time to first working session | < 2 minutes |
| Daily dogfood usage | Creator uses as primary tool |
| User feedback | 5 external testers find it useful |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Scope creep | Strict MVP definition, time-box phases |
| "Efficient but worse UX" | Dogfood daily, prioritize usability |
| Provider API changes | Abstract behind provider interface |
| Too slow to ship | Cut features, not quality |

---

## Next Steps

1. [ ] Decide: Monorepo vs separate repos
2. [ ] Set up workspace structure
3. [ ] Extract core from existing CLI
4. [ ] Build first provider (Anthropic)
5. [ ] Build minimal TUI shell
6. [ ] Connect and test end-to-end
