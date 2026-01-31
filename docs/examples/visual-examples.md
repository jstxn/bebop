# Visual Examples: Bebop + Claude Code

See exactly what users experience when using Bebop with Claude Code.

---

## Example 1: Simple Task (CLI Wrapper)

### What User Sees

```bash
$ bebop-claude &use core/security &use core/code-quality "Create a user authentication system"

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
User types: bebop-claude &use core/security &use core/code-quality "Create a user authentication system"
           ↓
    [bebop-claude.sh wrapper]
           ↓
    1. Parses directives
    2. Loads packs: core/security + core/code-quality
    3. Extracts relevant rules: NO_SECRETS, WRITE_TEST_COVERAGE, USE_TYPED_INTERFACES
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
    Receives: Compiled prompt (task + active constraints)
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

## Example 2: Usage Tracking Session (Hook Commands)

Use sessions to group and summarize Bebop usage over a long coding run.

### What User Sees

```bash
$ cd my-project
$ bebop hook session-start --tool claude
Bebop session started: session_1738230000000_ab12cd

$ bebop-claude &use core/security &use core/code-quality "Create a REST API endpoint"

📋 Bebop compiled prompt (87 words)

Active constraints:
- [NO_SECRETS] Never add secrets (API keys, tokens, passwords, certificates) to code, commits, or logs. Use environment variables or secret management. (core/security)
- [WRITE_TEST_COVERAGE] Write tests for new functionality. (core/code-quality)

🤖 Sending to Claude...

$ bebop-claude &use core/security &use core/code-quality "Write tests for the endpoint"

$ bebop stats --session --tool claude
Bebop usage summary
Tool: claude
Session: session_1738230000000_ab12cd
Prompts: 2
Est. tokens (unfiltered rules): ...
Est. tokens (compiled): ...
Est. reduction vs unfiltered: ...
Avg reduction vs unfiltered: ...%
Note: "unfiltered rules" = all rules from selected packs; token counts are estimates.

$ bebop hook session-end --tool claude
Bebop usage summary
Tool: claude
Session: session_1738230000000_ab12cd
Prompts: 2
Est. tokens (unfiltered rules): ...
Est. tokens (compiled): ...
Est. reduction vs unfiltered: ...
Avg reduction vs unfiltered: ...%
Note: "unfiltered rules" = all rules from selected packs; token counts are estimates.
```

---

## Example 3: Pre-compile & Paste to Claude Code IDE

### Step 1: Compile in Terminal

```bash
$ bebop compile &use core/security &use core/code-quality "Add JWT authentication to API"

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
$ bebop-claude --dry-run &use core/security &use core/code-quality "Create a user service"

📋 Bebop compiled prompt (95 words)

Task: Create a user service

Active constraints:
- [NO_SECRETS] Never add secrets (keys, tokens, passwords) to code or docs.
- [WRITE_TEST_COVERAGE] Write tests for new functionality with >80% coverage.
- [USE_TYPED_INTERFACES] Use TypeScript interfaces for all function parameters.

🔍 Dry run mode - not sending to Claude

# User reviews compiled prompt
# If satisfied, runs without --dry-run:
$ bebop-claude &use core/security &use core/code-quality "Create a user service"
```

---

## Example 5: Guardrails Comparison

### Without Bebop

```bash
$ claude "Create a user authentication system with JWT"

# What can go wrong:
# - Standards aren’t explicitly present in the prompt
# - You end up pasting reminders and redoing work
```

### With Bebop

```bash
$ bebop-claude &use core/security &use core/code-quality "Create a user authentication system with JWT"

# What Claude receives (user sees):
Task: Create a user authentication system with JWT

Active constraints:
- [NO_SECRETS] Never add secrets (keys, tokens, passwords) to code or docs.
- [USE_STANDARD_JWT] Use standard JWT libraries (jsonwebtoken), don't implement crypto yourself.
- [VALIDATE_ALL_INPUTS] Validate and sanitize all user inputs to prevent injection attacks.
- [WRITE_TEST_COVERAGE] Write tests for new functionality with >80% coverage.

# Result:
# - Claude sees the relevant guardrails up front
# - Fewer “redo this with our standards” loops
```

---

## Example 6: Multi-Pack Usage

### What User Types

```bash
$ bebop-claude &use core/security &use core/code-quality "Create a REST API for user management"
```

### What Bebop Does

```
1. Parse directives:
   - &use core/security
   - &use core/code-quality

2. Load packs:
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
  2. Import a pack from a file with `bebop pack import <file>`
  3. See `PACKS.md` for pack IDs and pack format

💡 Did you mean one of these?
  - core/security@v1
  - core/code-quality@v1
  - example/monorepo-core@v1
```

### What User Sees (Success)

```bash
$ bebop-claude &use core/security &use core/code-quality "Create a feature"

📋 Bebop compiled prompt (95 words)

Active constraints:
- [NO_SECRETS] Never add secrets (keys, tokens, passwords) to code or docs.
- [WRITE_TEST_COVERAGE] Write tests for new functionality with >80% coverage.
- [USE_TYPED_INTERFACES] Use TypeScript interfaces for all function parameters.

🤖 Sending to Claude...

# Claude responds successfully
```

---

## Example 8: Using Repo Context (Service Detection)

### User in Monorepo

```bash
$ cd ~/dev/my-monorepo/services/api/userservice
$ pwd
/Users/justen/dev/my-monorepo/services/api/userservice

$ bebop-claude &use core/security &use core/code-quality "Create a login endpoint"

📋 Bebop compiled prompt (95 words)

Task: Create a login endpoint

Active constraints:
- [NO_SECRETS] Never add secrets...
- [VALIDATE_ALL_INPUTS] Validate inputs...

# Bebop auto-detected: userservice
```

---

## Summary

### User Experience

✅ **Seamless**: Just add `bebop-claude` before your prompt
✅ **Transparent**: See exactly what's being sent
✅ **Consistent**: Guardrails show up automatically
✅ **Efficient**: Less rework and fewer repeated reminders
✅ **Controlled**: Enforce your standards automatically

### What Changes

| Aspect | Without Bebop | With Bebop |
|---------|---------------|------------|
| User types | "Create a feature" | "bebop-claude &use core/security &use core/code-quality Create a feature" |
| Claude receives | Task (plus whatever your tool adds) | Task + active constraints |
| Constraints | Easy to forget / inconsistently applied | Included automatically |
| Consistency | Varies | More deterministic |

### Key Insight

**Users don't need to change how they work** - just add a prefix (`bebop-claude`) and optionally include directives (`&use`, `&pack`).

Everything else happens behind the scenes, and they get guardrails immediately.
