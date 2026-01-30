# Bebop Skills

Collection of skills for integrating Bebop with AI agents and tools.

---

## Available Skills

### 1. Bebop Auto-Skill

**File:** `bebop-auto-skill.md`

**What it does:**
- Auto-detects project context (type, framework, language, service)
- Auto-selects relevant Bebop packs based on detected context
- Automatically compiles optimized prompts with Bebop
- Injects compiled prompts into AI tools

**Supported AI Tools:**
- Claude Code
- opencode
- Cursor
- Codex
- GitHub Copilot
- Any AI CLI tool

**Features:**
- ✅ Zero manual effort - no typing of `&use`, `&pack` directives
- ✅ Context-aware - detects project type, framework, language
- ✅ Smart pack selection - selects relevant packs automatically
- ✅ Keyword-aware - adjusts based on task keywords (test, security, etc.)
- ✅ Git-aware - understands branch types and context
- ✅ 91% token savings - automatically!

**Quick Start:**
```bash
# 1. Install Bebop
npm install -g @bebophq/cli
bebop init

# 2. Load the skill into your agent
# See your agent's documentation for how to load skills

# 3. Use your AI tool normally
claude "Create a user authentication system"
# Skill automatically optimizes the prompt!
```

**Documentation:** [bebop-auto-skill.md](bebop-auto-skill.md)

---

## How to Use These Skills

### Option 1: Load into Agent

If your agent supports loading skills from files:

```bash
# Load the skill file
agent load-skill skills/bebop-auto-skill.md
```

### Option 2: Copy to Agent Config

Some agents have a skills directory:

```bash
# Copy skill to agent's skills directory
cp skills/bebop-auto-skill.md ~/.agent-name/skills/bebop-auto-skill.md
```

### Option 3: Use with opencode

If you're using opencode (like this agent):

The skill can be invoked automatically - just mention Bebop:

```bash
# Ask opencode to use Bebop
opencode "Use Bebop to create a user authentication system"

# Or just mention it naturally
opencode "I want to create a user authentication system with Bebop"
```

---

## Skill Configuration

### Auto-Configuration

Most skills configure themselves automatically by reading:
- `package.json` - Node.js projects
- `tsconfig.json` - TypeScript configuration
- `.bebop-auto.yaml` - Custom Bebop Auto configuration

### Manual Configuration

Create `.bebop-auto.yaml` to customize:

```yaml
# Project type
project:
  type: backend
  framework: nestjs
  language: typescript

# Pack selection
packs:
  always_include:
    - core/security
    - core/code-quality
  
  auto_select:
    type_specific: true
    framework_specific: true

# Debugging
debug:
  enabled: false
  show_selected_packs: true
```

See [bebop-auto-skill.md](bebop-auto-skill.md) for full configuration options.

---

## Skills vs Manual Usage

| Aspect | Manual | With Auto-Skill |
|--------|---------|-----------------|
| **Setup** | 2 minutes | 5 minutes (one-time) |
| **Usage** | Type `&use core/security` every time | Just type task normally |
| **Pack Selection** | Manual | Automatic |
| **Context Detection** | Manual | Automatic |
| **Token Savings** | 93% (with effort) | 91% (automatic) |
| **User Effort** | High | Zero |
| **Consistency** | Variable | Guaranteed |

---

## Examples

### Example 1: Simple Task

**Without Skill:**
```bash
# User must remember to use Bebop
claude "&use core/security &use core/nestjs Create a login endpoint"
```

**With Skill:**
```bash
# User just types normally
claude "Create a login endpoint"
# Skill auto-detects, selects packs, compiles, sends
```

### Example 2: Complex Task

**Without Skill:**
```bash
# User must select multiple packs
claude "&use core/security &use core/nestjs &use userservice &use tasks/testing &use tasks/debugging Fix authentication bug"
```

**With Skill:**
```bash
# User just types normally
claude "Fix authentication bug"
# Skill auto-detects context, selects all relevant packs, compiles, sends
```

### Example 3: Testing

**Without Skill:**
```bash
# User must select testing pack
claude "&use tasks/testing Write tests for authentication"
```

**With Skill:**
```bash
# User just types normally
claude "Write tests for authentication"
# Skill detects "test" keyword, adds testing pack, compiles, sends
```

---

## Creating Custom Skills

### Skill Structure

A Bebop skill should follow this structure:

```markdown
# Skill Name

Brief description of what the skill does.

## Quick Start

How to start using this skill.

## Capabilities

List of what the skill can do.

## Configuration

How to configure the skill.

## Examples

Real-world usage examples.

## Troubleshooting

Common issues and solutions.
```

### Example: Custom Skill for Specific Framework

```markdown
# Bebop FastAPI Skill

Auto-optimizes prompts for FastAPI projects.

## Quick Start

1. Install Bebop
2. Load this skill
3. Use normally

## Capabilities

- Auto-detects FastAPI projects
- Selects FastAPI-specific packs
- Compiles optimized prompts

## Configuration

Create `.bebop-fastapi.yaml`:

```yaml
framework: fastapi
language: python
packs:
  - framework/fastapi
  - python/async-patterns
```
```

---

## Contributing Skills

### Adding New Skills

1. Create new skill file: `skills/my-skill.md`
2. Follow the skill structure
3. Test thoroughly
4. Add documentation
5. Submit to main Bebop repo

### Skill Guidelines

- ✅ Clear purpose and benefits
- ✅ Simple quick start
- ✅ Comprehensive examples
- ✅ Troubleshooting section
- ✅ Configuration documentation
- ✅ Performance benchmarks if applicable

---

## Resources

- [Bebop Main Repo](https://github.com/jstxn/bebop)
- [Bebop Documentation](../)
- [Integration Guides](../docs/integrations/)
- [Quick Start](../QUICKSTART_CLI.md)
- [Claude Code Integration](../docs/integrations/claude-code.md)

---

## FAQ

### Q: Do I need to install Bebop first?

**A:** Yes! Skills depend on Bebop CLI. Install with:
```bash
npm install -g @bebophq/cli
bebop init
```

### Q: How do I load a skill into my agent?

**A:** Depends on your agent. Check your agent's documentation for:
- How to load skills
- Where to place skill files
- How to configure skills

### Q: Can I use multiple skills?

**A:** Yes! You can combine skills. For example:
- Bebop Auto-Skill for automatic optimization
- Custom skills for specific frameworks
- Domain-specific skills for your business logic

### Q: How do I create a custom skill?

**A:** Follow the skill structure template in the "Creating Custom Skills" section above. Include:
- Clear purpose
- Quick start guide
- Configuration options
- Usage examples
- Troubleshooting

---

## Support

- **Issues:** https://github.com/jstxn/bebop/issues
- **Discussions:** https://github.com/jstxn/bebop/discussions
- **Documentation:** See parent directory

---

**Happy optimizing!** 🚀
