# Contributing to Bebop

Thank you for your interest in contributing to Bebop! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Documentation](#documentation)
- [Community Guidelines](#community-guidelines)

---

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something great.

**Key principles:**
- Be welcoming to newcomers
- Assume good intentions
- Focus on what's best for the community
- Show empathy towards other community members

Report issues: conduct@bebop.dev

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm
- Git

### Setup Development Environment

```bash
# Fork the repository
git clone https://github.com/YOUR_USERNAME/bebop.git
cd bebop

# Install dependencies
npm install

# Link for local testing
npm link

# Verify installation
bebop --version
```

### Project Structure

```
bebop/
├── src/                    # Source code
│   ├── cli.ts             # CLI entry point
│   ├── commands/          # Command implementations
│   ├── compiler/         # Prompt compiler
│   ├── directive-parser/  # Directive parser
│   ├── registry/         # Registry management
│   ├── session/          # Session management
│   └── utils/            # Utilities
├── tests/                 # Tests
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/             # End-to-end tests
├── docs/                 # Documentation
├── templates/            # Pack/plan templates
├── scripts/              # Build/utility scripts
└── package.json
```

---

## Development Workflow

### 1. Choose an Issue

Check [GitHub Issues](https://github.com/bebop/cli/issues) for good first issues:
- Label: `good first issue` - For newcomers
- Label: `help wanted` - Community contributions welcome
- Label: `enhancement` - Feature requests

**Important:** Comment on the issue before starting to avoid duplicate work.

### 2. Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/issue-123-short-description
```

**Branch naming conventions:**
- `feature/issue-NNN-description` - New features
- `fix/issue-NNN-description` - Bug fixes
- `docs/issue-NNN-description` - Documentation
- `refactor/issue-NNN-description` - Refactoring

### 3. Make Changes

#### Code Style

Follow existing conventions:

```typescript
// Use TypeScript for all new code
// Use interfaces for public APIs
// Use meaningful variable names
// Add JSDoc comments for public functions

interface CompilerOptions {
  strict: boolean;
  verbose?: boolean;
}

/**
 * Compiles a user input into a prompt
 */
export async function compilePrompt(
  input: string,
  options?: CompilerOptions
): Promise<CompiledPrompt> {
  // Implementation
}
```

#### Error Handling

```typescript
import { errors, BebopError } from '../errors';

// Use defined errors
throw errors.PACK_NOT_FOUND('core/security@v1');

// Check for bebop errors
if (error instanceof BebopError) {
  console.error(error.toString());
}
```

#### File Organization

```
src/commands/
├── init.ts
├── chat.ts
├── pack.ts
└── plan.ts

Each file should export:
- Command implementation
- Help text
- Examples
```

### 4. Write Tests

```typescript
// tests/unit/compiler.test.ts
import { compilePrompt } from '../../src/compiler';

describe('compilePrompt', () => {
  it('should compile simple input', async () => {
    const result = await compilePrompt('Create a function');
    expect(result.task).toBe('Create a function');
  });

  it('should handle directives', async () => {
    const result = await compilePrompt('&use core example Create feature');
    expect(result.constraints).toHaveLength(2);
  });

  it('should handle invalid input', async () => {
    await expect(
      compilePrompt('')
    ).rejects.toThrow(BebopError);
  });
});
```

### 5. Run Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### 6. Lint and Format

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

---

## Testing

### Unit Tests

Test individual functions in isolation:

```typescript
describe('DirectiveParser', () => {
  it('should parse pack directives', () => {
    const parser = new DirectiveParser();
    const result = parser.parse('&pack core/example@v1');
    expect(result.directives.packs).toEqual(['core/example@v1']);
  });
});
```

### Integration Tests

Test multiple components together:

```typescript
describe('compilePrompt Integration', () => {
  it('should compile with pack resolution', async () => {
    const result = await compilePrompt('&pack core/example Create feature');
    expect(result.constraints).toBeDefined();
    expect(result.task).toBe('Create feature');
  });
});
```

### End-to-End Tests

Test complete workflows:

```typescript
describe.skip('E2E: Real LLM', () => {
  it('should send compiled prompt to LLM', async () => {
    const result = await compilePrompt('&pack core/example Create function');
    const response = await sendToLLM(result);
    expect(response.content).toBeTruthy();
  });
});
```

**Note:** E2E tests are skipped by default. Run with:
```bash
npm run test:e2e OPENAI_API_KEY=your-key
```

### Test Coverage

Target: >80% coverage

```bash
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

---

## Submitting Changes

### 1. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commits
git commit -m "feat: add pack validation command"
```

**Commit message format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, etc.)
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```
feat(pack): add validation command

Add `bebop pack validate` command to check pack syntax
and rule applicability.

Fixes #123
```

### 2. Push to Fork

```bash
git push origin feature/issue-123-short-description
```

### 3. Create Pull Request

Go to GitHub and create a PR:

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Fixes #123

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests passing
```

### 4. Address Review Feedback

Be responsive to feedback:
- Make requested changes
- Respond to comments
- Update PR as needed

---

## Documentation

### Code Documentation

```typescript
/**
 * Compiles user input into a minimal prompt for LLM
 * 
 * @example
 * ```typescript
 * const result = await compilePrompt('Create a function');
 * console.log(result.task); // "Create a function"
 * ```
 * 
 * @param input - Raw user input with directives
 * @param options - Compiler options
 * @returns Compiled prompt with task, constraints, and step
 * @throws {BebopError} If input is invalid
 */
export async function compilePrompt(
  input: string,
  options?: CompilerOptions
): Promise<CompiledPrompt>
```

### User Documentation

Update relevant docs in `docs/`:

- **New feature:** Add to getting-started.md and cli-reference.md
- **API change:** Update api.md
- **Breaking change:** Update migration-guide.md

### Example Documentation

Add examples in `templates/`:

```yaml
# templates/packs/example.md
id: example/template
version: 1
rules:
  - id: EXAMPLE_RULE
    text: "Example rule text"
    applies_when:
      any: true
```

---

## Community Guidelines

### Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For questions and ideas
- **Discord**: Real-time chat: https://discord.gg/bebop

### Reporting Issues

When reporting bugs, include:

```markdown
## Environment
- Bebop version: 0.1.0
- Node.js version: 20.10.0
- OS: macOS 14.2

## Expected Behavior
What should happen

## Actual Behavior
What actually happened

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Code Sample
```typescript
// Minimal reproduction
```

## Error Message
Paste error message here

## Screenshots
If applicable
```

### Suggesting Features

When suggesting features:

1. Check existing issues first
2. Describe the problem you're solving
3. Describe the proposed solution
4. Explain why it's important
5. Consider if you can contribute it

**Template:**
```markdown
## Problem
Describe the problem this solves

## Proposed Solution
Describe the solution

## Alternatives
Describe alternative approaches

## Additional Context
Any other context, mockups, etc.
```

---

## Project-Specific Guidelines

### Performance

Bebop must be fast:
- Startup time: <100ms
- Compilation time: <50ms
- Memory usage: <100MB

**Before optimizing:**
1. Measure with `time` command
2. Use Node.js profiler
3. Identify bottlenecks

**Example:**
```bash
# Measure startup
time bebop --version

# Profile
node --prof ./dist/cli.js compile "&use core example test"
node --prof-process isolate-*.log > profile.txt
```

### Security

- Never log secrets or API keys
- Validate all user input
- Use environment variables for sensitive data
- Follow OWASP guidelines

### Backward Compatibility

- Don't break existing APIs without deprecation
- Use semantic versioning
- Document breaking changes in migration guide

---

## Release Process

Releases are managed by maintainers:

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release branch
4. Tag release: `git tag -a v0.2.0 -m "Release 0.2.0"`
5. Push to GitHub
6. Publish to npm

---

## Recognition

Contributors are recognized in:
- CONTRIBUTORS.md
- Release notes
- GitHub contributors page

Thank you for your contributions!

---

## Questions?

- Check existing documentation
- Search GitHub issues
- Ask in Discord
- Contact maintainers: maintainers@bebop.dev

---

**Happy contributing!** 🚀
