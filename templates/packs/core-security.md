# Pack: core/security@v1

Security-related rules for any project.

```yaml
id: core/security
version: 1
rules:
  - id: NO_SECRETS
    text: "Never add secrets (API keys, tokens, passwords, certificates) to code, commits, or logs. Use environment variables or secret management."
    applies_when:
      any: true
    enforce:
      type: secret-scan
      level: block
      patterns:
        - 'api_key\s*='
        - 'password\s*='
        - 'secret\s*='
        - 'token\s*='
        - "-----BEGIN.*KEY-----"

  - id: NO_HARD_CREDENTIALS
    text: "Never hardcode credentials. Use environment variables or secret managers."
    applies_when:
      any: true
    enforce:
      type: diff-scan
      deny_patterns:
        - |-
          ["][A-Za-z0-9+/]{32,}["]  # Likely API keys

  - id: VALIDATE_ALL_INPUTS
    text: "Validate and sanitize all user inputs to prevent injection attacks (SQL, XSS, command injection)."
    applies_when:
      languages: ["javascript", "typescript", "python", "go", "java"]
      any: true

  - id: USE_SECURE_HEADERS
    text: "Set security headers: CSP, X-Content-Type-Options, X-Frame-Options, HSTS."
    applies_when:
      languages: ["javascript", "typescript", "node"]
      paths: ["**/*server*", "**/*app*"]

  - id: ENCRYPT_SENSITIVE_DATA
    text: "Encrypt sensitive data at rest and in transit using strong encryption (AES-256, TLS 1.3)."
    applies_when:
      any: true

  - id: USE_PARAMETERIZED_QUERIES
    text: "Use parameterized queries or ORM to prevent SQL injection. Never concatenate strings for queries."
    applies_when:
      languages: ["javascript", "typescript", "python", "go", "java", "csharp"]
      any: true

  - id: IMPLEMENT_RATE_LIMITING
    text: "Implement rate limiting on all public APIs and authentication endpoints."
    applies_when:
      paths: ["**/api/**", "**/routes/**"]
      any: true

  - id: AUTHENTICATE_ALL_ENDPOINTS
    text: "Require authentication for all non-public endpoints. Default to deny, explicitly allow."
    applies_when:
      paths: ["**/api/**", "**/routes/**"]
      any: true

  - id: LOG_SECURITY_EVENTS
    text: "Log authentication attempts, authorization failures, and suspicious activities."
    applies_when:
      any: true
```

## Usage

```bash
bebop pack use core/security@v1
```

## Examples

### Bad (violates NO_SECRETS)

```typescript
const apiKey = "sk-proj-abc123..."; // ❌ Violates NO_SECRETS
```

### Good

```typescript
const apiKey = process.env.API_KEY; // ✅ Uses environment variable
```

### Bad (violates USE_PARAMETERIZED_QUERIES)

```typescript
const query = `SELECT * FROM users WHERE id = '${userId}'`; // ❌ SQL injection risk
```

### Good

```typescript
const query = "SELECT * FROM users WHERE id = $1";
await db.query(query, [userId]); // ✅ Parameterized query
```

## Enforcement

This pack includes enforcement hooks for:

- **Secret scanning**: Blocks commits containing secrets
- **Diff scanning**: Detects hardcoded credentials in changes
- **Pattern matching**: Identifies common security vulnerabilities

Run validation:

```bash
bebop pack test core/security@v1
```
