# Pack: example/monorepo@v1

A sample pack for monorepo projects with multiple services/packages.

## Metadata

```yaml
id: example/monorepo
version: 1
description: Constraints for monorepo architecture and cross-service boundaries
applies_when:
  paths: ["packages/**", "services/**", "apps/**", "libs/**"]
```

## Rules

```yaml
rules:
  - id: NO_CROSS_SERVICE_IMPORTS
    text: "Services are independent. No direct imports across service boundaries (services/**/). Communicate via HTTP, queues, or shared libs."
    applies_when:
      paths: ["services/**"]
    enforce:
      type: diff-scan
      deny_patterns:
        - "from '\\.\\..*services/"
        - "from '\\.\\./\\.\\./services/"

  - id: USE_SHARED_LIBS
    text: "Extract shared code into libs/ or packages/. Import shared code, don't copy it between services."
    applies_when:
      paths: ["services/**", "apps/**"]

  - id: INDEPENDENT_PACKAGE_JSON
    text: "Each service/package has its own package.json. Declare dependencies explicitly, don't rely on hoisting."
    applies_when:
      paths: ["services/**", "packages/**"]

  - id: CONSISTENT_TSCONFIG
    text: "Extend the root tsconfig.base.json. Override only what's necessary for the specific package."
    applies_when:
      paths: ["services/**", "packages/**"]

  - id: SERVICE_OWNS_ITS_DATA
    text: "Each service owns its database/tables. No direct database access across service boundaries."
    applies_when:
      paths: ["services/**"]

  - id: VERSION_SHARED_PACKAGES
    text: "Use semantic versioning for shared packages. Pin versions in consuming services."
    applies_when:
      paths: ["packages/**", "libs/**"]

  - id: DOCUMENT_SERVICE_CONTRACTS
    text: "Document public APIs (OpenAPI/Swagger for HTTP, AsyncAPI for events). Keep contracts in sync with implementation."
    applies_when:
      paths: ["services/**"]
```

## Usage

```text
&pack example/monorepo@v1
```
