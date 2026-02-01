# Packs directory

This folder contains sample pack definitions for Bebop.

## Sample Packs

| Pack | Description |
|------|-------------|
| [example-react-frontend.md](example-react-frontend.md) | React + TypeScript frontend constraints |
| [example-nestjs-api.md](example-nestjs-api.md) | NestJS backend API constraints |
| [example-monorepo.md](example-monorepo.md) | Monorepo architecture constraints |

## Core Packs

See `templates/packs/` for the built-in core packs:
- `core-security.md` - Security best practices
- `core-code-quality.md` - Code quality standards

## Creating Your Own Packs

1. Copy one of the sample packs as a starting point
2. Customize the `id`, `description`, and `applies_when` metadata
3. Add/modify rules for your project's standards
4. Import with: `bebop pack import ./my-pack.md`

See [PACKS.md](../PACKS.md) for the full pack format specification.
