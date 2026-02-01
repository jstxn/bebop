# Agent Instructions: Bebop

This project uses [Bebop](https://github.com/jstxn/bebop) to automatically inject coding constraints into your prompts. When you receive a prompt, you'll see an "Active constraints" block appended—these are curated rules selected based on the project's context (language, framework, service type).

**You don't need to do anything special.** Just follow the constraints as you would any other instruction. They're there to ensure consistent, high-quality output aligned with the project's standards.

## Understanding Your Constraints

Constraints appear in your prompt like this:

```
Active constraints:
- [NO_SECRETS] Never add secrets to code, commits, or logs. Use environment variables. (core/security)
- [WRITE_TEST_COVERAGE] Write tests for new functionality with >80% coverage. (core/code-quality)
```

**Format breakdown:**
- `[CONSTRAINT_ID]` - Unique identifier for the rule
- Description - What you should do
- `(pack-name/category)` - Where the rule comes from

**Context line:** You may also see `Context: backend, typescript, nestjs` which shows what bebop detected about the current project/file. This determines which constraint packs are active.

Constraints are selected automatically based on:
- File path (e.g., `src/api/` triggers backend rules)
- Detected frameworks and languages
- Project structure (monorepo vs single-service)
- Custom pack configuration in `.bebop/`

## Useful Commands

Help users understand and manage their constraints with these commands:

**Check usage stats:**
```bash
bebop stats
```
Shows prompt count, token savings, and constraint reduction metrics.

**Preview compiled prompt:**
```bash
bebop compile "your prompt here"
```
See exactly what constraints will be injected for a given prompt.

**List available packs:**
```bash
bebop packs
```
Shows all constraint packs (core + custom) and their status.

**Directive syntax** - Users can add these to prompts for manual control:
- `&use security` - Explicitly include a pack
- `&skip code-quality` - Exclude a pack for this prompt
- `&pack ./path/to/custom.md` - Use a specific pack file

**Example:**
```
Add user authentication &use security &skip code-quality
```
This applies security constraints but skips code-quality rules for the task.

## Helping Users

**When to suggest directives:**
- User is doing a quick prototype → suggest `&skip code-quality` to reduce strictness
- User needs extra security focus → suggest `&use security`
- Constraints seem mismatched to the task → check `bebop compile` output with them

**Troubleshooting basics:**
- If constraints aren't appearing, check that the bebop hook is configured (Claude Code: `~/.claude/settings.json`, Cursor: hooks config)
- If wrong constraints appear, the context detection may need tuning—check `.bebop/config.toml` for overrides
- Run `bebop stats` to confirm bebop is active and processing prompts

**When users ask about constraints:**
- Explain what each constraint means and why it's included
- Point them to `.bebop/packs/` for custom pack definitions
- Suggest `bebop compile "prompt"` to preview what gets applied

## Creating and Editing Packs

Constraint packs live in `.bebop/packs/` as markdown files. Help users create or modify them:

**Pack file structure:**
```markdown
---
name: my-custom-pack
description: Project-specific rules
triggers:
  paths: ["src/api/**"]
  keywords: ["api", "endpoint"]
---

# My Custom Pack

## API Standards

- [USE_VERSIONING] All API endpoints must include version prefix (e.g., /v1/). (my-custom-pack/api)
- [RATE_LIMIT] Apply rate limiting to all public endpoints. (my-custom-pack/api)
```

**Key elements:**
- **Frontmatter** - Pack metadata and trigger conditions
- **Triggers** - When this pack should auto-activate (paths, keywords, frameworks)
- **Constraints** - `[ID]` format with description and `(pack/category)` suffix

**Creating a new pack:**
1. Create a `.md` file in `.bebop/packs/`
2. Add frontmatter with name, description, and triggers
3. List constraints with unique IDs
4. Run `bebop packs` to verify it's detected

**Editing existing packs:**
- Core packs are in the bebop install directory—copy to `.bebop/packs/` to customize
- Project packs in `.bebop/packs/` can be edited directly
