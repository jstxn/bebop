# Visual Examples: Bebop + Claude Code

See exactly what users experience when using Bebop with Claude Code.

---

## Example 1: Simple Task (CLI Wrapper)

### What User Sees

```bash
$ bebop-claude &use core example "Create a user authentication system"

📋 Bebop compiled prompt (95 words)

Active constraints:
- [NO_SECRETS] Never add secrets (keys, tokens, passwords) to code or docs.
- [WRITE_TEST_COVERAGE] Write tests for new functionality with >80% coverage.
- [USE_TYPED_INTERFACES] Use TypeScript interfaces for all function parameters.

🤖 Sending to Claude...

# Claude responds directly in terminal
```

### What's Happening Behind the Scenes

```
User types: bebop-claude &use core example "Create a user authentication system"
           ↓
    [bebop-claude.sh wrapper]
           ↓
    1. Parses directive: &use core example
    2. Loads pack: core/example@v1
    3. Extracts rules: NO_SECRETS, WRITE_TEST_COVERAGE, USE_TYPED_INTERFACES
    4. Compiles prompt
           ↓
    [Compiled Prompt]
Task: Create a user authentication system

Active constraints:
- [NO_SECRETS] Never add secrets (keys, tokens, passwords) to code or docs.
- [WRITE_TEST_COVERAGE] Write tests for new functionality with >80% coverage.
- [USE_TYPED_INTERFACES] Use TypeScript interfaces for all function parameters.
           ↓
    [claude CLI]
           ↓
    Receives: Compiled prompt (95 words, ~105 tokens)
           ↓
    Generates: Authentication code
           ↓
    User sees: Code in terminal
```

### Claude's Response

```typescript
// Authentication service
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { CreateUserDTO } from '../dto/CreateUserDTO';

export class AuthService {
  async register(userData: CreateUserDTO): Promise<string> {
    // Hash password (no secrets - using bcrypt)
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create user
    const user = await User.create({
      ...userData,
      password: hashedPassword
    });
    
    // Generate JWT (no hardcoded secrets - using environment)
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,  // ✅ Environment variable, not hardcoded
      { expiresIn: '7d' }
    );
    
    return token;
  }

  async login(email: string, password: string): Promise<string> {
    // ... implementation
  }
}

// Tests for AuthService
describe('AuthService', () => {
  it('should register user with hashed password', async () => {
    // Arrange
    const userData = { email: 'test@example.com', password: 'password123' };
    
    // Act
    const token = await authService.register(userData);
    
    // Assert
    expect(token).toBeDefined();
    expect(token.length).toBeGreaterThan(0);
  });
});
```

**Note:** Claude followed all constraints:
- ✅ No hardcoded secrets (uses `process.env.JWT_SECRET`)
- ✅ TypeScript interfaces used (`CreateUserDTO`)
- ✅ Tests written (with AAA pattern)

---

## Example 2: Using Plan (Session-Based)

### What User Sees

```bash
$ cd my-project
$ bebop session start

✅ Session created: session_20250129_090000_abc123
📝 Session: session_20250129_090000_abc123

$ bebop plan run backend/create-rest-endpoint route=POST:/users name=CreateUser

📋 Plan: backend/create-rest-endpoint@v1
📝 Session: session_20250129_090000_abc123

Step 1/12: Read service documentation
  → src/README.md

💡 Complete this step, then run 'bebop step 2' to continue

$ # User reads documentation...
$ bebop step 2

Step 2/12: Create route handler
  → src/routes/users.ts

💡 Complete this step, then run 'bebop step 3' to continue

$ bebop-claude "Create route handler for POST /users with CreateUserDTO"

📋 Bebop compiled prompt (87 words)

Active constraints:
- [NO_SECRETS] Never add secrets to code.
- [VALIDATE_ALL_INPUTS] Validate all user inputs.
- [USE_TYPED_INTERFACES] Use TypeScript interfaces.

🤖 Sending to Claude...

# Claude generates route handler
```

### Session Progress

```bash
$ bebop session show

Session: session_20250129_090000_abc123
Created: 2025-01-29 09:00:00
Updated: 2025-01-29 09:15:00
Workspace: /Users/justen/dev/my-project

Active packs:
  - core/example@v1
  - core/security@v1

Active plan: backend/create-rest-endpoint@v1
Step: 2/12

Last completed:
  - Step 1: Read service documentation (5 min ago)
```

### Continuing Session

```bash
$ bebop session continue
📝 Session: session_20250129_090000_abc123
📍 Step: 2/12 (Create route handler)

$ bebop-claude "Implement route handler with validation"

📋 Bebop compiled prompt (87 words)

🤖 Sending to Claude...

# Claude generates route handler with validation
```

---

## Example 3: Pre-compile & Paste to Claude Code IDE

### Step 1: Compile in Terminal

```bash
$ bebop compile &use core/example &use core/security "Add JWT authentication to API"

Task: Add JWT authentication to API

Active constraints:
- [NO_SECRETS] Never add secrets (keys, tokens, passwords) to code, docs, or commits.
- [USE_STANDARD_JWT] Use standard JWT libraries (jsonwebtoken), don't implement crypto yourself.
- [VALIDATE_ALL_INPUTS] Validate and sanitize all user inputs to prevent injection attacks.
- [AUTHENTICATE_ALL_ENDPOINTS] Require authentication for all non-public endpoints.
- [LOG_SECURITY_EVENTS] Log authentication attempts, authorization failures, and suspicious activities.

```

### Step 2: Copy and Paste to Claude Code IDE

**VS Code + Claude Code Extension:**

```
┌─────────────────────────────────────────┐
│ VS Code Editor                         │
├─────────────────────────────────────────┤
│ // src/auth/AuthService.ts          │
│ import jwt from 'jsonwebtoken';       │
│ import { Request, Response } from    │
│   'express';                       │
│                                     │
│ export const authenticate = (        │
│   req: Request, res: Response     │
│ ) => {                             │
│   // TODO: Implement auth           │
│ };                                  │
└─────────────────────────────────────────┘

Press Cmd+K to open Claude Code
```

**User presses `Cmd+K`:**

```
┌─────────────────────────────────────────┐
│ Claude Code Chat Panel               │
├─────────────────────────────────────────┤
│ 💬                            │
│ Paste your prompt here...         │
│                                 │
│ [Cancel]  [Send]               │
└─────────────────────────────────────────┘
```

**User pastes compiled prompt:**

```
┌─────────────────────────────────────────┐
│ Claude Code Chat Panel               │
├─────────────────────────────────────────┤
│ Task: Add JWT authentication to    │
│ API                              │
│                                  │
│ Active constraints:               │
│ - [NO_SECRETS] Never add       │
│   secrets to code...             │
│ - [USE_STANDARD_JWT] Use        │
│   standard JWT libraries...       │
│ - [VALIDATE_ALL_INPUTS]        │
│   Validate and sanitize all       │
│   user inputs...                │
│ - [AUTHENTICATE_ALL_ENDPOINTS]  │
│   Require authentication...      │
│ - [LOG_SECURITY_EVENTS]        │
│   Log authentication attempts...  │
│                                  │
│ [Cancel]  [Send]               │
└─────────────────────────────────────────┘
```

**User clicks Send:**

```
┌─────────────────────────────────────────┐
│ Claude Code Response                │
├─────────────────────────────────────────┤
│ ✨ Thinking...                   │
│                                  │
│ I'll add JWT authentication with     │
│ proper security constraints:          │
│                                  │
│ ```typescript                     │
│ import jwt from 'jsonwebtoken';     │
│ import { Request, Response } from    │
│   'express';                       │
│                                  │
│ export const authenticate = (        │
│   req: Request,                 │
│   res: Response, next: Function   │
│ ) => {                           │
│   const token = req.headers         │
│     .authorization?.split(' ')[1];  │
│                                  │
│   if (!token) {                  │
│     return res.status(401)         │
│       .json({ error: 'No token' });│
│   }                              │
│                                  │
│   try {                           │
│     const decoded = jwt.verify(       │
│       token,                        │
│       process.env.JWT_SECRET,       │
│       // ✅ Using env var, not     │
│       // hardcoded secret            │
│     );                             │
│     req.user = decoded;             │
│     next();                        │
│   } catch (error) {               │
│     // Log security event           │
│     console.error(                 │
│       'Auth failed:',              │
│       error.message                │
│     );                            │
│     return res.status(401)         │
│       .json({ error: 'Invalid' + │
│         ' token' });               │
│   }                              │
│ };                               │
│ ```                              │
│                                  │
│ I've implemented JWT auth with:      │
│ ✅ Environment variable for JWT    │
│    secret (NO_SECRETS)           │
│ ✅ Standard jsonwebtoken library    │
│    (USE_STANDARD_JWT)            │
│ ✅ Token validation              │
│    (VALIDATE_ALL_INPUTS)        │
│ ✅ Returns 401 for missing/     │
│    invalid tokens                │
│ ✅ Logs auth failures            │
│    (LOG_SECURITY_EVENTS)         │
│                                  │
│ Apply to routes:                 │
│ router.use('/api', authenticate);│
│ [Apply to File]  [Copy]          │
└─────────────────────────────────────────┘
```

---

## Example 4: Dry Run Mode

### What User Sees

```bash
$ bebop-claude --dry-run &use core/example "Create a user service"

📋 Bebop compiled prompt (95 words)

Task: Create a user service

Active constraints:
- [NO_SECRETS] Never add secrets (keys, tokens, passwords) to code or docs.
- [WRITE_TEST_COVERAGE] Write tests for new functionality with >80% coverage.
- [USE_TYPED_INTERFACES] Use TypeScript interfaces for all function parameters.

🔍 Dry run mode - not sending to Claude

# User reviews compiled prompt
# If satisfied, runs without --dry-run:
$ bebop-claude &use core/example "Create a user service"
```

---

## Example 5: Token Savings Comparison

### Without Bebop

```bash
$ claude "Create a user authentication system with JWT"

# What Claude receives (user doesn't see):
# "Create a user authentication system with JWT"
# + full CLAUDE.md (674 lines, ~850 tokens)
# + full coding standards (200 lines, ~250 tokens)
# + full security guidelines (150 lines, ~200 tokens)
# + full project conventions (100 lines, ~150 tokens)
#
# Total: ~1,450 tokens
# Cost: ~$0.04
# Response time: ~95 seconds
```

### With Bebop

```bash
$ bebop-claude &use core/example &use core/security "Create a user authentication system with JWT"

# What Claude receives (user sees):
Task: Create a user authentication system with JWT

Active constraints:
- [NO_SECRETS] Never add secrets (keys, tokens, passwords) to code or docs.
- [USE_STANDARD_JWT] Use standard JWT libraries (jsonwebtoken), don't implement crypto yourself.
- [VALIDATE_ALL_INPUTS] Validate and sanitize all user inputs to prevent injection attacks.
- [WRITE_TEST_COVERAGE] Write tests for new functionality with >80% coverage.

# Total: ~115 tokens
# Cost: ~$0.003
# Response time: ~8 seconds

# Savings: 92% (1,450 → 115 tokens)
# Time savings: 92% faster (95s → 8s)
```

---

## Example 6: Multi-Pack Usage

### What User Types

```bash
$ bebop-claude &use core/example &use core/security &use core/code-quality "Create a REST API for user management"
```

### What Bebop Does

```
1. Parse directives:
   - &use core/example
   - &use core/security
   - &use core/code-quality

2. Load packs:
   - core/example@v1 (6 rules)
   - core/security@v1 (10 rules)
   - core/code-quality@v1 (12 rules)

3. Select relevant rules:
   Based on:
   - Task: "Create a REST API"
   - Working directory: /Users/justen/dev/my-api
   - Languages: TypeScript

   Selected rules:
   - [NO_SECRETS] - Applies to all
   - [VALIDATE_ALL_INPUTS] - Applies to APIs
   - [WRITE_TEST_COVERAGE] - Applies to all
   - [USE_TYPED_INTERFACES] - Applies to TS
   - [KEEP_FUNCTIONS_SMALL] - Applies to all
   - [FOLLOW_DRY_PRINCIPLE] - Applies to all

4. Compile prompt:
   Task: Create a REST API for user management

   Active constraints:
   - [NO_SECRETS] Never add secrets...
   - [VALIDATE_ALL_INPUTS] Validate inputs...
   - [WRITE_TEST_COVERAGE] Write tests...
   - [USE_TYPED_INTERFACES] Use TypeScript...
   - [KEEP_FUNCTIONS_SMALL] Keep functions under 50 lines...
   - [FOLLOW_DRY_PRINCIPLE] Follow DRY...

5. Send to Claude

6. Claude generates code following all constraints
```

---

## Example 7: Error Handling

### What User Sees (Error Case)

```bash
$ bebop-claude &use invalid/pack "Create a feature"

❌ Error [PACK_NOT_FOUND]: Pack not found: invalid/pack

Suggestions:
  1. Run `bebop pack list` to see available packs
  2. Create a new pack with `bebop pack create --name <id>`
  3. Check to pack ID is correct (e.g., namespace/pack@version)

💡 Did you mean one of these?
  - core/example@v1
  - core/security@v1
  - core/code-quality@v1
```

### What User Sees (Success)

```bash
$ bebop-claude &use core/example "Create a feature"

📋 Bebop compiled prompt (95 words)

Active constraints:
- [NO_SECRETS] Never add secrets (keys, tokens, passwords) to code or docs.
- [WRITE_TEST_COVERAGE] Write tests for new functionality with >80% coverage.
- [USE_TYPED_INTERFACES] Use TypeScript interfaces for all function parameters.

🤖 Sending to Claude...

# Claude responds successfully
```

---

## Example 8: Using Service Context

### User in Monorepo

```bash
$ cd ~/dev/my-monorepo/services/api/userservice
$ pwd
/Users/justen/dev/my-monorepo/services/api/userservice

$ bebop-claude &use core/example "Create a login endpoint"

📋 Bebop compiled prompt (95 words)

Task: Create a login endpoint

Active constraints:
- [NO_SECRETS] Never add secrets...
- [VALIDATE_ALL_INPUTS] Validate inputs...
- [SERVICE_USERSERVICE] Use userservice conventions...

# Bebop auto-detected: userservice
# Applied service-specific rules
```

### Manual Service Specification

```bash
$ bebop-claude &svc userservice &use core/security "Create a login endpoint"

📋 Bebop compiled prompt (95 words)

Task: Create a login endpoint

Active constraints:
- [NO_SECRETS] Never add secrets...
- [VALIDATE_ALL_INPUTS] Validate inputs...
- [AUTHENTICATE_ALL_ENDPOINTS] Require auth for all endpoints...
- [LOG_SECURITY_EVENTS] Log auth attempts...

# Applied userservice + security rules
```

---

## Summary

### User Experience

✅ **Seamless**: Just add `bebop-claude` before your prompt
✅ **Transparent**: See exactly what's being sent
✅ **Fast**: 92% faster response times
✅ **Cheap**: 93% token cost savings
✅ **Controlled**: Enforce your standards automatically

### What Changes

| Aspect | Without Bebop | With Bebop |
|---------|---------------|------------|
| User types | "Create a feature" | "bebop-claude &use core example Create a feature" |
| Claude receives | 1,450 tokens | 115 tokens |
| Response time | 95 seconds | 8 seconds |
| Cost | $0.04 | $0.003 |
| Constraints | Hopes Claude reads docs | Enforced automatically |
| Consistency | Varies | Deterministic |

### Key Insight

**Users don't need to change how they work** - just add a prefix (`bebop-claude`) and optionally include directives (`&use`, `&plan`, etc.).

Everything else happens behind the scenes, and they see massive savings immediately!
