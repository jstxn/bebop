# Pack: core/code-quality@v1

Code quality and consistency rules.

```yaml
id: core/code-quality
version: 1
rules:
  - id: WRITE_TEST_COVERAGE
    text: "Write tests for new functionality with >80% coverage. Use AAA pattern (Arrange, Act, Assert)."
    applies_when:
      languages: ["typescript", "javascript", "python", "go"]
      any: true

  - id: FOLLOW_LINTING_RULES
    text: "Follow project linting rules. Run linter before committing. Fix all auto-fixable issues."
    applies_when:
      any: true

  - id: USE_TYPED_INTERFACES
    text: "Use TypeScript interfaces or types for all function parameters and return values. Avoid 'any'."
    applies_when:
      languages: ["typescript"]
      any: true

  - id: HANDLE_ERRORS_GRACEFULLY
    text: "Handle errors gracefully with try-catch, proper error messages, and appropriate HTTP status codes."
    applies_when:
      languages: ["typescript", "javascript", "python", "go"]
      any: true

  - id: WRITE_DESCRIPTIVE_NAMES
    text: "Use descriptive variable, function, and class names. Avoid abbreviations (except standard ones like HTTP, API, URL)."
    applies_when:
      any: true

  - id: KEEP_FUNCTIONS_SMALL
    text: "Keep functions under 50 lines. Split complex logic into smaller, testable functions."
    applies_when:
      any: true

  - id: DOCUMENT_PUBLIC_APIS
    text: "Document all public functions, classes, and interfaces with JSDoc/Docstring comments."
    applies_when:
      any: true

  - id: AVOID_NESTED_CONDITIONALS
    text: "Avoid deeply nested conditionals (>3 levels). Use early returns or extract to helper functions."
    applies_when:
      any: true

  - id: USE_CONSTANTS_OVER_MAGIC
    text: "Use named constants instead of magic numbers and strings. Export common constants."
    applies_when:
      any: true

  - id: FOLLOW_DRY_PRINCIPLE
    text: "Follow DRY (Don't Repeat Yourself). Extract repeated code into reusable functions or utilities."
    applies_when:
      any: true

  - id: USE_ASYNC_AWAIT
    text: "Use async/await instead of callbacks for asynchronous code. Handle promise rejections."
    applies_when:
      languages: ["typescript", "javascript"]
      any: true

  - id: VALIDATE_ENV_VARS
    text: "Validate required environment variables at startup. Provide clear error messages if missing."
    applies_when:
      any: true

  - id: USE_MEANINGFUL_LOGS
    text: "Use structured logging with appropriate log levels (error, warn, info, debug). Avoid excessive logging."
    applies_when:
      any: true
```

## Usage

```bash
bebop pack show core/code-quality@v1
bebop compile "&use core/code-quality Refactor this function"
```

## Examples

### Bad (violates WRITE_TEST_COVERAGE)
```typescript
// ❌ No tests
function calculateDiscount(price: number, discount: number): number {
  return price * (1 - discount);
}
```

### Good
```typescript
// ✅ With tests using AAA pattern
describe('calculateDiscount', () => {
  it('should apply discount correctly', () => {
    // Arrange
    const price = 100;
    const discount = 0.2;
    
    // Act
    const result = calculateDiscount(price, discount);
    
    // Assert
    expect(result).toBe(80);
  });
});
```

### Bad (violates KEEP_FUNCTIONS_SMALL)
```typescript
// ❌ Too long (>50 lines)
function processOrder(order: Order): void {
  // 50+ lines of complex logic
}
```

### Good
```typescript
// ✅ Split into smaller functions
function processOrder(order: Order): void {
  validateOrder(order);
  calculatePricing(order);
  processPayment(order);
  sendConfirmation(order);
}
```

### Bad (violates USE_TYPED_INTERFACES)
```typescript
// ❌ Uses 'any'
function processData(data: any): any {
  return JSON.parse(data);
}
```

### Good
```typescript
// ✅ Uses proper types
interface ProcessedData {
  id: string;
  value: number;
}

function processData(data: string): ProcessedData {
  return JSON.parse(data);
}
```

### Bad (violates USE_CONSTANTS_OVER_MAGIC)
```typescript
// ❌ Magic numbers
if (retryCount > 3) {
  throw new Error('Too many retries');
}

setTimeout(callback, 5000);
```

### Good
```typescript
// ✅ Named constants
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

if (retryCount > MAX_RETRIES) {
  throw new Error('Too many retries');
}

setTimeout(callback, RETRY_DELAY_MS);
```

## Enforcement

This pack includes enforcement hooks for:
- **Lint checking**: Runs linter before allowing commits
- **Test coverage**: Checks minimum test coverage
- **Type checking**: Validates TypeScript types
- **Pattern matching**: Identifies code quality issues

Run validation:
```bash
bebop pack test core/code-quality@v1
```

## Project-Specific Adaptation

You can extend this pack for your project:

```yaml
id: my-company/code-quality
version: 1
extends: core/code-quality@v1
rules:
  - id: USE_COMPANY_LINTER
    text: "Run company-specific linter: npm run lint:company"
    applies_when:
      any: true
  
  - id: FOLLOW_CODING_STANDARDS
    text: "Follow internal coding standards document: https://docs.company.com/standards"
    applies_when:
      any: true
```
