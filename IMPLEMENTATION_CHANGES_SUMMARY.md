# Bebop Implementation Plan - Summary of Changes

**Focus: Automatic, invisible integration with AI CLI tools**

---

## What Changed

### Critical Realization

**Original approach:** Manual directives (`&use core/security`)

- User must type: `claude "&use core/security &use core/nestjs Create login"`
- Requires user to remember pack names and directive syntax
- Manual wrapper scripts required

**New approach:** Automatic integration (zero directives)

- User types: `claude "Create login"`
- Everything happens automatically via hooks
- Zero configuration required after `bebop init --auto`

### Why This Matters

Users don't want another tool to manage. They want to use their AI tools normally and get automatic optimization.

**Evidence from exploration:**

- Claude Code has `UserPromptSubmit` hooks
- Cursor has similar hooks
- opencode has plugin system
- Shell aliases provide universal fallback

---

## Key Changes to Implementation Plan

### Phase Reordering

| Original (Wrong)              | Revised (Correct)                 | Why                                |
| ----------------------------- | --------------------------------- | ---------------------------------- |
| Phase 0: Scope + UX           | Phase 0.5: Hook research          | Hooks are foundational             |
| **Phase 1: Directive parser** | **Phase 1: Context detection**    | Auto-detect, don't parse           |
| Phase 2: Local registry       | Phase 2: Pack selection           | Auto-select, don't manual          |
| Phase 3: Init scaffolding     | Phase 3: Prompt compiler          | Auto-compile, don't manual         |
| Phase 4: Packs                | Phase 4: Hook integration         | Integrate with AI CLIs             |
| Phase 5: Plan runner          | Phase 0.5: Local registry (moved) | Supporting feature                 |
| Phase 6: Enforcement          | Phase 5: Enforcement              | Integration first                  |
| Phase 7: Distribution         | Phase 6: Auto-setup               | User experience first              |
|                               | Phase 7: Distribution             | Sharing is important but secondary |

### New Phases Added

**Phase 0.5 — Hook Architecture Research** ✅ COMPLETE

- Documented hook systems for Claude Code, Cursor, opencode
- Identified integration points
- Mapped configuration files

**Phase 1 — Context Detection Engine** NEW

- Auto-detect project type, framework, language
- Auto-detect service in monorepos
- Auto-detect git context (branch, PR)
- Analyze task keywords

**Phase 2 — Pack Selection Engine** NEW

- Rule-based auto-selection
- Always include: core/security, core/code-quality
- Conditional by: project type, language, framework, service
- Keyword-based: test, security, performance

**Phase 3 — Prompt Compiler** NEW

- Load selected packs
- Select relevant rules
- Compile optimized prompt
- Calculate token savings

**Phase 4 — AI CLI Hook Integration** NEW

- Claude Code: `UserPromptSubmit` hook
- Cursor: Similar hook
- opencode: Plugin system
- Fallback: Shell aliases

**Phase 6 — Auto-Setup** NEW

- `bebop init --auto` command
- Detect installed AI CLI tools
- Install hooks/plugins automatically
- Create shell aliases
- Test integration

---

## Critical Gaps Fixed

### 1. Integration Architecture ✅

**Before:** Manual wrappers requiring explicit invocation
**After:** Hook-based automatic integration

### 2. User Experience ✅

**Before:** User must type directives
**After:** Zero directives - automatic

### 3. Implementation Focus ✅

**Before:** Directive parser is Phase 1
**After:** Context detection + pack selection + compilation are Phase 1-3

### 4. Zero Configuration ✅

**Before:** Manual setup of aliases, manual pack selection
**After:** `bebop init --auto` does everything

### 5. Fallback Strategy ✅

**Before:** No integration for tools without hooks
**After:** Shell aliases provide universal fallback

---

## Implementation Priority

### P0 (MVP - 4 weeks)

**Goal:** Automatic, invisible optimization for Claude Code

1. **Phase 1: Context Detection** (1 week)
   - Implement `src/context-detector.ts`
   - Detect project type, framework, language
   - Detect service, git context
   - Analyze task keywords
   - Tests: 95%+ accuracy

2. **Phase 2: Pack Selection** (1 week)
   - Implement `src/pack-selector.ts`
   - Rule-based selection algorithm
   - Scoring and confidence
   - Conflict resolution
   - Tests: 90%+ accuracy

3. **Phase 3: Prompt Compilation** (1 week)
   - Implement `src/prompt-compiler.ts`
   - Pack loading
   - Rule selection
   - Prompt formatting
   - Token calculation
   - Tests: 90%+ token savings

4. **Phase 4a: Claude Code Hook** (0.5 weeks)
   - Implement hook script
   - Configure Claude Code settings
   - Test integration

5. **Phase 4b: Shell Aliases** (0.5 weeks)
   - Implement shell alias fallback
   - Universal compatibility
   - Test with multiple AI CLIs

6. **Phase 0.5: Local Registry** (minimal)
   - 5 starter packs
   - Basic pack storage

**MVP User Experience:**

```bash
$ npm install -g @bebophq/cli
$ bebop init --auto

Detected AI CLI tools:
  ✅ Claude Code
  ✅ opencode

Installing integration:
  ✅ Claude Code hook installed (~/.claude/settings.json)
  ✅ opencode plugin installed (~/.config/opencode/plugin/bebop.js)
  ✅ Shell aliases added (~/.bashrc)

Testing integration:
  ✅ Claude Code: Hook active
  ✅ opencode: Plugin loaded

Setup complete! You can now use AI tools normally.
Bebop will automatically optimize your prompts.

Try: claude "Create a user authentication system"
```

### P1 (Enhancement - 2 weeks)

**Goal:** Support more AI CLI tools + enforcement

7. **Phase 4c: Cursor Hook** (0.5 weeks)
8. **Phase 4d: opencode Plugin** (0.5 weeks)
9. **Phase 5: Enforcement Hooks** (0.5 weeks)
   - Secret scanning
   - Diff validation
10. **Phase 6a: Pack Management CLI** (0.5 weeks)
    - `bebop pack list`, `bebop pack show`, etc.

### P2 (Polish - 2 weeks)

**Goal:** Team collaboration and analytics

11. **Phase 7: Distribution** (1 week)
    - Team pack registries
    - Version management
    - Rollback capabilities

12. **Phase 6b: Analytics Dashboard** (0.5 weeks)
    - Token savings tracking
    - Pack selection accuracy
    - Performance metrics

13. **Phase 6c: Auto-Updates** (0.5 weeks)
    - Pack update checks
    - Automatic upgrades

---

## Success Metrics

### User Experience

- ✅ Zero manual configuration after `bebop init --auto`
- ✅ Zero manual typing of directives
- ✅ 100% invisible operation (users don't know Bebop is running)
- ✅ < 100ms compilation time

### Technical

- ✅ 90%+ token reduction (measured)
- ✅ 95%+ context detection accuracy
- ✅ 90%+ pack selection accuracy
- ✅ Semantic equivalence verified by human testing

### Integration

- ✅ Works with Claude Code (hook)
- ✅ Works with opencode (plugin)
- ✅ Works with Cursor (hook)
- ✅ Works with any AI CLI (shell alias)

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

## Files Created/Modified

### New Files Created

1. **IMPLEMENTATION_PLAN_V2.md** - Revised implementation plan with automatic focus
2. **IMPLEMENTATION_GAPS_REVIEW.md** - Comprehensive gap analysis

### Files Modified

1. **PROJECT_SUMMARY.md** - Updated to reflect accurate status
   - Clarified auto-skill is in design phase
   - Fixed "Phase 1-3 complete" claim
   - Added status warnings
   - Updated "What's Missing" section

### Files That Need Updates (Future)

1. **IMPLEMENTATION_PLAN.md** - Should reference V2 or be replaced
2. **README.md** - Update to reflect automatic integration approach
3. **skills/bebop-auto-skill.md** - Link to implementation when available
4. **AUTO_SKILL.md** - Same as above
5. **PACKS.md** - Add auto-selection algorithm details
6. **DIRECTIVES.md** - Downgrade to secondary feature
7. **Integration guides** - Update with hook-based approach

---

## Immediate Next Steps

### This Week

1. ✅ Create IMPLEMENTATION_PLAN_V2.md
2. ✅ Create IMPLEMENTATION_GAPS_REVIEW.md
3. ✅ Update PROJECT_SUMMARY.md
4. 🔄 Review revised plan with team
5. ⏳ Create detailed technical spec for Phase 1

### Next 2 Weeks

6. Implement context detector (Phase 1)
7. Implement pack selector (Phase 2)
8. Implement prompt compiler (Phase 3)
9. Create test suite for Phases 1-3
10. Measure accuracy and token savings

### Following 2 Weeks

11. Implement Claude Code hook (Phase 4a)
12. Implement shell aliases (Phase 4b)
13. Implement `bebop init --auto` (Phase 6)
14. Alpha test with real users
15. Gather feedback and iterate

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

## Key Takeaways

1. **Automatic Integration is Critical**
   - Manual wrappers won't be used
   - Hooks are the right approach
   - Zero configuration is the goal

2. **Phase 1-3 are Foundational**
   - Context detection is essential
   - Pack selection needs algorithm
   - Compilation needs optimization

3. **MVP Focus**
   - Claude Code hook + shell aliases = universal coverage
   - 4 weeks to working prototype
   - Iterative improvement

4. **User Experience is Everything**
   - Zero manual typing
   - Zero configuration
   - 100% invisible

---

## Conclusion

The revised implementation plan makes Bebop **truly automatic and invisible** - the way it should be.

**Critical Change:** From manual directives to automatic hooks
**Key Innovation:** Zero-configuration AI CLI integration
**Success Metric:** Users don't know Bebop is running

**Next Action:** Begin Phase 1 implementation (context detection)

---

**Files to review:**

1. [IMPLEMENTATION_PLAN_V2.md](IMPLEMENTATION_PLAN_V2.md) - Revised implementation plan
2. [IMPLEMENTATION_GAPS_REVIEW.md](IMPLEMENTATION_GAPS_REVIEW.md) - Detailed gap analysis
3. [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Updated with accurate status

**Recommendation:** Proceed with revised implementation plan, prioritize automatic integration.
