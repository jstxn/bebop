# Performance & Measurement

Bebop’s goal is to make AI coding agents **more reliable** by keeping guardrails consistent and context-aware. It does **not** increase a model’s hard context window or bypass provider usage limits.

Where the “performance” wins typically come from:

- **Less rework**: fewer “redo this with our standards” loops.
- **Less repetition**: fewer manual reminders / pasted rule blocks.
- **Cleaner working context**: constraints stay compact and relevant instead of dumping long docs.

> Token/billing impact varies heavily by tool and workflow. Measure with your own baselines.

---

## How to Measure Bebop in Your Environment

### 1) Measure compilation overhead (local)

```bash
time bebop compile "&use core/security &use core/code-quality Create a user service"
```

This measures the *local* cost of selecting packs and compiling a prompt.

### 2) Measure iteration efficiency (the big one)

Pick a small set of representative tasks (e.g., “add endpoint”, “fix bug”, “write tests”) and compare:

- Turns to acceptable result (or PR-ready diff)
- Number of “correction” turns (“follow our conventions”, “add tests”, “don’t hardcode secrets”)
- Time-to-merge (or time-to-green CI)

### 3) Measure token/billing impact (provider-side)

For real billing numbers, use the provider/tool’s own usage reporting.

If you want to isolate Bebop’s effect, compare two workflows:

- **Baseline A:** your team’s current “rules” approach (docs/CLAUDE.md/manual reminders/etc.)
- **Baseline B:** the same tasks with Bebop enabled

---

## Reading `bebop stats`

`bebop stats` shows **estimated** prompt sizes based on word-count heuristics.

- **Est. tokens (compiled):** task + the constraints Bebop actually injected.
- **Est. tokens (unfiltered rules):** a “maximal” baseline: all rules from the selected packs (before applicability + max constraint limits).
- **Est. reduction vs unfiltered:** how much Bebop reduced that maximal baseline.

This is useful for comparing *Bebop configurations* (packs, max constraints, applicability), but it’s not a substitute for provider billing.

---

## Practical Optimization Tips

### Keep packs focused

Prefer small, specific packs over one “giant standards pack”.

### Use applicability metadata

Add `applies_when.languages` and `applies_when.paths` so irrelevant rules don’t get injected.

### Treat hard rules as checks, not prose

When possible, use enforcement hooks (e.g., secret scanning) so the system can block obvious violations before the model is even asked.

---

## Forward-Looking Ideas

These are directions that can make Bebop feel even more “magical” over long sessions:

- **Dynamic rule loading:** inject only the subset relevant to the current prompt.
- **Delta injection:** carry forward prior constraints and send only changes.
- **Semantic compilation:** compile repo standards into a structured “guardrails IR”, then project to minimal prompt text.

