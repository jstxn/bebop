# Plan: backend/create-rest-endpoint@v1

> Status: roadmap / concept. The current Bebop CLI does **not** execute plans yet (no `bebop plan run` / `bebop step`).

A reusable plan for creating REST API endpoints.

```yaml
id: backend/create-rest-endpoint
version: 1
vars:
  route_method: ""  # e.g., GET, POST, PUT, DELETE
  route_path: ""   # e.g., /users, /users/:id
  operation_name: ""  # e.g., CreateUser, GetUser, UpdateUser, DeleteUser
  service_root: "src"
  test_dir: "tests"
  docker_service: "app"

steps:
  # Step 1: Read service documentation
  - type: READ
    path: "{service_root}/README.md"
    optional: true

  # Step 2: Read existing code for context
  - type: READ
    path: "{service_root}/routes/*.ts"
    optional: true

  # Step 3: Create/update route handler
  - type: EDIT
    path: "{service_root}/routes/**"
    description: "Create route handler for {route_method} {route_path}"

  # Step 4: Create/update controller/service layer
  - type: EDIT
    path: "{service_root}/services/**"
    description: "Implement {operation_name} business logic"

  # Step 5: Create/update data models/DTOs
  - type: EDIT
    path: "{service_root}/models/**"
    description: "Define data models and DTOs for {operation_name}"

  # Step 6: Add request validation
  - type: EDIT
    path: "{service_root}/validators/**"
    description: "Add input validation for {operation_name}"

  # Step 7: Write tests
  - type: TEST
    path: "{test_dir}/**/*{operation_name}*.test.ts"
    description: "Write tests for {operation_name} using AAA pattern"
    enforce:
      type: test-coverage
      min_coverage: 80

  # Step 8: Run linter
  - type: RUN
    command: "npm run lint"
    description: "Run linter to check code quality"

  # Step 9: Run type check
  - type: RUN
    command: "npm run typecheck"
    description: "Run TypeScript type checking"

  # Step 10: Run tests
  - type: RUN
    command: "npm test"
    description: "Run all tests"

  # Step 11: Run tests in Docker (optional)
  - type: RUN
    command: "docker compose run {docker_service} npm test"
    optional: true
    description: "Run tests in Docker to match CI environment"

  # Step 12: Update API documentation
  - type: EDIT
    path: "docs/api.md"
    optional: true
    description: "Update API documentation for {route_method} {route_path}"
```

## Roadmap usage (concept)

### Basic Usage

```bash
# Create a GET endpoint
bebop plan run backend/create-rest-endpoint \
  route_method=GET \
  route_path=/users/:id \
  operation_name=GetUser

# Create a POST endpoint
bebop plan run backend/create-rest-endpoint \
  route_method=POST \
  route_path=/users \
  operation_name=CreateUser

# Create a PUT endpoint
bebop plan run backend/create-rest-endpoint \
  route_method=PUT \
  route_path=/users/:id \
  operation_name=UpdateUser

# Create a DELETE endpoint
bebop plan run backend/create-rest-endpoint \
  route_method=DELETE \
  route_path=/users/:id \
  operation_name=DeleteUser
```

### Customizing for Your Project

```bash
# Specify custom paths
bebop plan run backend/create-rest-endpoint \
  route_method=POST \
  route_path=/jobs \
  operation_name=CreateJob \
  service_root=services/api/screener \
  test_dir=services/api/screener/test \
  docker_service=screener
```

### Example Session

```bash
$ bebop plan run backend/create-rest-endpoint \
  route_method=POST \
  route_path=/users \
  operation_name=CreateUser

📋 Plan: backend/create-rest-endpoint@v1
📝 Session: session_20250129_140000_xyz789

Step 1/12: Read service documentation
  → src/README.md

💡 Complete this step, then run 'bebop step 2' to continue

$ bebop step 2

Step 2/12: Read existing code for context
  → src/routes/*.ts

💡 Complete this step, then run 'bebop step 3' to continue

$ bebop step 3

Step 3/12: Create route handler
  → src/routes/users.ts
  
Description: Create route handler for POST /users

💡 Create the route handler, then run 'bebop step 4' to continue
```

## What Gets Created

For `route_method=POST route_path=/users operation_name=CreateUser`:

1. **Route Handler** (`src/routes/users.ts`):
```typescript
router.post('/users', createUserHandler);
```

2. **Service Layer** (`src/services/users.ts`):
```typescript
export async function createUser(data: CreateUserDTO): Promise<User> {
  // Business logic here
}
```

3. **Data Model** (`src/models/User.ts`):
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
}
```

4. **Validator** (`src/validators/users.ts`):
```typescript
export const createUserSchema = {
  name: Joi.string().required(),
  email: Joi.string().email().required(),
};
```

5. **Tests** (`tests/users.test.ts`):
```typescript
describe('createUser', () => {
  it('should create a user successfully', async () => {
    // Arrange
    const userData = { name: 'John', email: 'john@example.com' };
    
    // Act
    const user = await createUser(userData);
    
    // Assert
    expect(user.id).toBeDefined();
    expect(user.name).toBe(userData.name);
  });
});
```

## Extending the Plan

You can extend this plan for your specific needs:

```yaml
id: my-company/create-rest-endpoint
version: 1
extends: backend/create-rest-endpoint@v1
steps:
  # Add authentication step
  - type: EDIT
    path: "{service_root}/middleware/**"
    description: "Add authentication middleware for {route_method} {route_path}"
    after_step: 2

  # Add caching step
  - type: EDIT
    path: "{service_root}/cache/**"
    description: "Add caching for {route_method} {route_path}"
    optional: true
    after_step: 4

  # Add monitoring step
  - type: EDIT
    path: "{service_root}/monitoring/**"
    description: "Add metrics and monitoring for {operation_name}"
    after_step: 7
```

## Best Practices

1. **Start with Step 1**: Always read existing code before making changes
2. **Complete Each Step**: Don't skip steps unless you know what you're doing
3. **Run Tests**: Always run tests before moving to the next step
4. **Use &dry-run**: Preview what would be sent before making changes
5. **Check Output**: Review generated code carefully
6. **Add Tests**: Always add comprehensive tests
7. **Update Docs**: Don't forget to update documentation

## Troubleshooting

### Issue: "Route already exists"

```bash
# Skip route creation step
bebop step 4
```

### Issue: "Tests failing"

```bash
# Go back to fix implementation
bebop step 4

# Or run tests directly
npm test
```

### Issue: "Type errors"

```bash
# Run type check
npm run typecheck

# Fix types before continuing
bebop step 4
```

## Related Plans

- `backend/create-graphql-resolver@v1` - Create GraphQL resolvers
- `backend/create-grpc-service@v1` - Create gRPC services
- `frontend/create-api-client@v1` - Create API client for frontend

## See Also

- `PACKS.md` (pack format + usage)
- `PLANS.md` (plan runner roadmap)
- `docs/troubleshooting.md`
