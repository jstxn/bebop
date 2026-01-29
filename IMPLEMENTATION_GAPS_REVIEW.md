# Bebop Implementation Plan - Critical Gaps Review

**Focus: Automatic, invisible integration with AI CLI tools**

---

## Executive Summary

The original implementation plan was **fundamentally backwards**. It focused on manual directive parsing (`&use`, `&pack`, etc.) when the real need is **zero-configuration automatic optimization**.

**Critical Realization:** Users don't want to type directives. They want to use their AI tools normally and get automatic optimization.

**Key Gap:** No clear path to automatic integration - only manual wrapper scripts that require explicit invocation.

---

## Critical Gaps Identified

### 🔴 Gap 1: Wrong Primary Focus

**Original Plan:** Directive parser is Phase 1
**Problem:** Directives are a power-user feature, not the primary use case

**Evidence:**

- `scripts/bebopt.sh`, `bebop-opencode.sh`, `bebop-claude.sh` all require manual invocation
- Auto-skill spec (skills/bebop-auto-skill.md) describes automatic behavior but **no implementation**
- PROJECT_SUMMARY.md claims "91% token savings automatically" but **no automatic integration exists**

**Impact:** High - Misaligned with user needs

**Fix:** Make automatic integration Phase 1-3 (context detection → pack selection → compilation), not directive parsing

---

### 🔴 Gap 2: No Automatic Integration Architecture

**Original Plan:** Manual wrapper scripts
**Problem:** Wrapper scripts require users to type `bebopt claude "..."` - not automatic

**Evidence:**

- All scripts are **manual wrappers**, not automatic hooks
- No mention of AI CLI hook systems (UserPromptSubmit, etc.)
- No integration with Claude Code's built-in hook system
- No plugin architecture for opencode

**Impact:** Critical - Users won't use manual wrappers

**Fix:** Use AI CLI hook systems for automatic integration:

- Claude Code: `UserPromptSubmit` hook
- Cursor: Similar hook
- opencode: Plugin system
- Fallback: Shell aliases

---

### 🔴 Gap 3: Auto-Skill is Spec, Not Implementation

**Original Plan:** Auto-skill described in documentation but not implemented
**Problem:** Auto-skill spec is 765 lines but there's **zero implementation code**

**Evidence:**

- `skills/bebop-auto-skill.md` describes sophisticated auto-detection
- `AUTO_SKILL.md` describes automatic behavior
- **No TypeScript/JavaScript implementation files exist**
- Only `src/errors.ts` and `src/workspace-detector.ts` exist

**Impact:** High - Claims automatic behavior without delivering it

**Fix:** Implement auto-skill as core CLI functionality:

- Context detector (Phase 1)
- Pack selector (Phase 2)
- Prompt compiler (Phase 3)
- Hook integration (Phase 4)

---

### 🔴 Gap 4: Missing Auto-Context Detection

**Original Plan:** Context detection is mentioned but not designed
**Problem:** Auto-detection is critical but underspecified

**Evidence:**

- `workspace-detector.ts` exists but only detects basic info
- No algorithm for detecting project type (frontend/backend/mobile)
- No framework detection (NestJS, React, Django, etc.)
- No keyword analysis for task type (feature, bugfix, test)
- No git context detection (branch type, PR state)

**Impact:** High - Auto-selection can't work without context detection

**Fix:** Implement comprehensive context detection engine:

- Project type detection (via package.json, config files)
- Framework detection (via dependencies)
- Language detection (via file extensions)
- Service detection (via path analysis)
- Git context detection (branch, PR)
- Task analysis (keywords, complexity)

---

### 🔴 Gap 5: Missing Auto-Pack Selection Algorithm

**Original Plan:** Phase 4 mentions "rule selection based on repo/service context" but no algorithm
**Problem:** Auto-selection needs well-defined algorithm

**Evidence:**

- PACKS.md says "CLI should select rules based on context" but no spec
- No scoring/confidence mechanism
- No conflict resolution strategy
- No fallback for low-confidence selections

**Impact:** High - Wrong pack selection = wrong behavior

**Fix:** Implement rule-based pack selection:

- Always include: core/security, core/code-quality
- Conditional by: project type, language, framework, service
- Keyword-based: test, security, performance
- Scoring: confidence threshold
- Deduplication: prioritize higher-level packs

---

### 🔴 Gap 6: Zero Configuration Path Missing

**Original Plan:** `bebop init` creates folders but no auto-setup
**Problem:** Users want zero config, not manual setup

**Evidence:**

- PROJECT_SUMMARY.md: "Zero Setup" claim
- IMPLEMENTATION_PLAN.md: "init creates folders + starter packs"
- **No `bebop init --auto` command**
- **No automatic hook installation**
- **No shell alias setup**

**Impact:** Critical - Users won't adopt if manual setup required

**Fix:** Implement `bebop init --auto`:

- Detect installed AI CLI tools
- Install hooks/plugins automatically
- Create shell aliases
- Download starter packs
- Test integration
- Report status

---

### 🟡 Gap 7: Testing Strategy Missing

**Original Plan:** No testing methodology specified
**Problem:** Automatic behavior needs thorough testing

**Evidence:**

- No test files exist
- No semantic equivalence testing strategy
- No accuracy measurement methodology
- No token savings verification approach

**Impact:** Medium - Risk of wrong behavior

**Fix:** Define testing strategy:

- Unit tests for context detection (95%+ accuracy target)
- Unit tests for pack selection (90%+ accuracy target)
- Integration tests for compilation (90%+ token savings target)
- Human evaluation for semantic equivalence
- Real-world A/B testing with actual users

---

### 🟡 Gap 8: Performance Not Addressed

**Original Plan:** Claims 90%+ savings but no methodology
**Problem:** Need to verify claims and measure overhead

**Evidence:**

- PROJECT_SUMMARY.md: "93% token reduction" claim
- **No benchmarking methodology**
- **No real-world test cases**
- **No overhead measurement**

**Impact:** Medium - Risk of false claims

**Fix:** Implement performance measurement:

- Benchmark suite with real prompts
- Token counting before/after
- Compilation latency measurement (target < 100ms)
- Real-world monitoring

---

### 🟡 Gap 9: Fallback Strategy Missing

**Original Plan:** No fallback for integration failures
**Problem:** What if hooks don't work?

**Evidence:**

- No mention of what happens when hook detection fails
- No shell alias fallback
- No error recovery strategy
- No rollback mechanism

**Impact:** Medium - Integration fragility

**Fix:** Implement robust fallback:

- Shell aliases work universally
- Graceful degradation (skip Bebop if it fails)
- Fallback to original input
- Error logging and reporting

---

### 🟢 Gap 10: Project Status Inaccurate

**Original Plan:** PROJECT_SUMMARY.md claims "Phase 1-3 complete"
**Problem:** Only error handling + workspace detector exist

**Evidence:**

- PROJECT_SUMMARY.md:200-209 claims Phase 1-3 complete
- Actual implementation: Only 2 source files exist
- No directive parser, no registry, no compiler

**Impact:** Low - Misleading but doesn't affect implementation

**Fix:** Update PROJECT_SUMMARY.md to reflect accurate status

---

## Integration Architecture Gap Analysis

### Current State (Wrong)

```
User: claude "Create a login endpoint"
         ↓
    Claude receives raw input
         ↓
    Sends 1,320 tokens to LLM
         ↓
    Slow, expensive
```

**With Manual Wrapper (Still Wrong)**

```
User: bebopt claude "&use core/security Create..."
         ↓
    User must type wrapper command
         ↓
    User must remember directives
         ↓
    Not automatic
```

### Required State (Correct)

```
User: claude "Create a login endpoint"
         ↓
    Hook intercepts (automatic)
         ↓
    Bebop detects context (automatic)
         ↓
    Bebop selects packs (automatic)
         ↓
    Bebop compiles prompt (automatic)
         ↓
    Claude receives 120 tokens (automatic)
         ↓
    Fast, cheap
```

---

## AI CLI Tool Integration Gaps

### Claude Code

**Gap:** Original plan ignores Claude Code's hook system
**Fix:** Use `UserPromptSubmit` hook
**Implementation:** Hook script in `~/.claude/hooks/`, config in `~/.claude/settings.json`

### Cursor

**Gap:** Original plan ignores Cursor's hook system
**Fix:** Use similar hook approach
**Implementation:** Hook script, config file

### opencode

**Gap:** Original plan ignores opencode's plugin system
**Fix:** Use plugin API
**Implementation:** Plugin file in `~/.config/opencode/plugin/`

### Other AI CLIs

**Gap:** No integration for tools without hooks
**Fix:** Shell aliases
**Implementation:** `~/.bashrc` or `~/.zshrc`

---

## Revised Implementation Order

### Original (Wrong Priority)

1. Phase 0: Scope + UX
2. **Phase 1: Directive preprocessor** ← Wrong priority
3. Phase 2: Local registry
4. Phase 3: Init scaffolding
5. Phase 4: Packs
6. Phase 5: Plan runner
7. Phase 6: Enforcement
8. Phase 7: Distribution

### Revised (Correct Priority)

1. **Phase 1: Context detection engine** ← Correct priority
2. **Phase 2: Pack selection engine**
3. **Phase 3: Prompt compiler**
4. **Phase 4: AI CLI hook integration**
5. Phase 0.5: Local registry (move from Phase 2)
6. Phase 5: Enforcement hooks
7. Phase 6: Init auto-setup
8. Phase 7: Distribution

---

## Implementation Gaps by Phase

### Phase 1: Context Detection

**Gap:** No specification
**Missing:**

- Context data structure
- Detection algorithms
- File reading logic
- Git context extraction
- Task keyword analysis

**Fix:** Create `src/context-detector.ts` with full spec

---

### Phase 2: Pack Selection

**Gap:** No algorithm specification
**Missing:**

- Selection rules structure
- Scoring algorithm
- Confidence calculation
- Conflict resolution
- Deduplication logic

**Fix:** Create `src/pack-selector.ts` with full spec

---

### Phase 3: Prompt Compilation

**Gap:** No compilation pipeline
**Missing:**

- Pack loading logic
- Rule selection algorithm
- Prompt formatting
- Token calculation
- Semantic equivalence verification

**Fix:** Create `src/prompt-compiler.ts` with full spec

---

### Phase 4: Hook Integration

**Gap:** No hook implementation
**Missing:**

- Claude Code hook script
- Cursor hook script
- opencode plugin
- Shell alias logic
- Auto-installation

**Fix:** Create `src/hook-installer.ts` + hook scripts

---

### Phase 0.5: Local Registry

**Gap:** Existing spec is good
**Missing:**

- Auto-download starter packs
- Version management
- Update checks

**Fix:** Implement from original spec

---

### Phase 5: Enforcement Hooks

**Gap:** Existing spec is good
**Missing:**

- Integration with automatic flow
- Fail-fast before compilation

**Fix:** Integrate into automatic pipeline

---

### Phase 6: Auto-Setup

**Gap:** Completely missing
**Missing:**

- AI CLI tool detection
- Hook installation
- Shell alias creation
- Integration testing
- Status reporting

**Fix:** Implement `bebop init --auto`

---

### Phase 7: Distribution

**Gap:** Existing spec is good
**Missing:**

- Team pack registries
- Rollback capabilities

**Fix:** Implement from original spec

---

## Success Metrics Gaps

### Current (Missing)

❌ Zero manual configuration after install
❌ Zero manual typing of directives
❌ 100% invisible operation
❌ Zero latency impact

### Required (Add)

✅ Zero manual configuration after `bebop init --auto`
✅ Zero manual typing of directives
✅ 100% invisible operation (users don't know Bebop is running)
✅ < 100ms compilation time
✅ 90%+ token reduction (measured)
✅ 95%+ context detection accuracy
✅ 90%+ pack selection accuracy
✅ Semantic equivalence verified by human testing

---

## Risk Mitigation Gaps

### Current (Missing)

❌ Fallback for hook detection failure
❌ Manual override for wrong context detection
❌ Human review for wrong pack selection
❌ Fallback for compilation failure
❌ Version-agnostic hook design

### Required (Add)

✅ Shell alias fallback (always works)
✅ `.bebop-auto.yaml` manual override
✅ High-confidence threshold
✅ Fallback to original input
✅ Version-agnostic design
✅ Continuous learning feedback loop

---

## Files That Need Updates

### Critical (Must Fix)

1. `IMPLEMENTATION_PLAN.md` - Rewrite with automatic focus
2. `PROJECT_SUMMARY.md` - Fix inaccurate status claims
3. `README.md` - Update to reflect automatic integration
4. `skills/bebop-auto-skill.md` - Link to implementation, not just spec
5. `AUTO_SKILL.md` - Same as above

### Important (Should Fix)

6. `PACKS.md` - Add auto-selection algorithm details
7. `DIRECTIVES.md` - Downgrade to secondary feature
8. `PLANS.md` - Add plan runner integration details
9. All integration guides - Update with hook-based approach

### Nice to Have

10. Create `docs/automatic-integration.md` - How it works
11. Create `docs/hook-architecture.md` - Technical details
12. Create `docs/performance-metrics.md` - Measurement methodology

---

## Immediate Actions Required

### Priority 1 (This Week)

1. Create `IMPLEMENTATION_PLAN_V2.md` with revised phases ✅ DONE
2. Write comprehensive review document ✅ IN PROGRESS
3. Update PROJECT_SUMMARY.md with accurate status
4. Create detailed technical spec for Phase 1 (context detection)

### Priority 2 (Next 2 Weeks)

5. Implement context detector (Phase 1)
6. Implement pack selector (Phase 2)
7. Implement prompt compiler (Phase 3)
8. Create test suite for Phases 1-3

### Priority 3 (Following 2 Weeks)

9. Implement Claude Code hook (Phase 4)
10. Implement shell aliases (Phase 4)
11. Implement `bebop init --auto` (Phase 6)
12. Measure performance and validate claims

---

## Conclusion

**Summary of Critical Gaps:**

1. **Wrong Focus:** Directive parsing instead of automatic integration
2. **No Architecture:** Manual wrappers instead of hooks
3. **No Implementation:** Auto-skill is spec, not code
4. **No Context Detection:** Auto-selection can't work
5. **No Selection Algorithm:** Auto-selection is undefined
6. **No Auto-Setup:** Users want zero config
7. **No Testing:** Automatic behavior needs verification
8. **No Performance:** Claims need measurement
9. **No Fallback:** Integration is fragile
10. **Wrong Status:** Documentation is misleading

**Root Cause:** Original plan was designed for **manual usage** (`&use core/security`) when the real need is **automatic usage** (zero directives).

**Solution:** Revise plan to prioritize automatic integration:

1. Context detection (Phase 1)
2. Pack selection (Phase 2)
3. Prompt compilation (Phase 3)
4. Hook integration (Phase 4)

**Impact:** This revision makes Bebop truly automatic and invisible - the way it should be.

---

**Next Step:** Review revised plan and begin Phase 1 implementation.
