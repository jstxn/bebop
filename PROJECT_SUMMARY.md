# Bebop — Project Summary

Bebop is a **guardrails + context layer** for AI coding agents. It turns engineering standards (security, quality, conventions) into **versioned constraint packs**, then **auto-injects the right constraints** into tools like Claude Code, Cursor, opencode, and Codex.

The “revolutionary” part isn’t squeezing tokens—it’s making standards portable, automatic, and consistent across whichever agent a team happens to use.

---

## What Exists Today

### CLI Core

- `bebop compile` / `bebop compile-auto`: compile a task into a compact prompt with active constraints.
- `bebop select-packs`: see which packs would be selected for a context/task.
- `bebop pack list|show|import`: manage packs from `templates/packs/`, `packs/`, and `~/.bebop/packs`.
- `bebop stats`: view local usage summaries (estimated via word count).

### Automatic Integration

- `bebop init --auto` can set up automatic integrations:
  - Claude Code hook (`additionalContext`)
  - Cursor hook
  - opencode plugin
  - Shell aliases/wrappers (including Codex, when installed)

---

## What Users Actually Get

- **Consistent guardrails**: your security + quality standards are present without re-typing them.
- **Less rework**: fewer “I forgot to mention…” corrections and fewer avoidable mistakes.
- **Cross-tool consistency**: the same packs apply whether someone uses Claude Code, Cursor, opencode, or Codex.

---

## Roadmap (High-Leverage Next Steps)

- **Dynamic rule injection**: inject only what matters for *this* prompt and current workspace state.
- **Better measurement**: separate “task tokens”, “constraint overhead”, and “turns saved” so ROI is real.
- **Stronger enforcement**: move more guardrails from “advice” to “checks” (diff-aware, lint-aware, repo-aware).

---

*Last updated: January 31, 2026*
