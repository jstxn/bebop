# Pack: example/nestjs-api@v1

A sample pack for NestJS backend API projects.

## Metadata

```yaml
id: example/nestjs-api
version: 1
description: Constraints for NestJS API development
applies_when:
  languages: [typescript]
  paths: ["src/**/*.controller.ts", "src/**/*.service.ts", "src/**/*.module.ts"]
```

## Rules

```yaml
rules:
  - id: USE_DEPENDENCY_INJECTION
    text: "Use NestJS dependency injection. Inject services via constructor, don't instantiate directly."
    applies_when:
      paths: ["src/**/*.service.ts", "src/**/*.controller.ts"]

  - id: VALIDATE_REQUEST_DTOS
    text: "Use class-validator decorators on all request DTOs. Apply ValidationPipe globally or per-route."
    applies_when:
      paths: ["src/**/*.dto.ts", "src/**/*.controller.ts"]

  - id: USE_RESPONSE_DTOS
    text: "Define response DTOs and use @ApiResponse decorators for Swagger documentation."
    applies_when:
      paths: ["src/**/*.controller.ts"]

  - id: HANDLE_EXCEPTIONS_PROPERLY
    text: "Throw NestJS HTTP exceptions (NotFoundException, BadRequestException, etc.). Use exception filters for custom handling."
    applies_when:
      paths: ["src/**/*.service.ts", "src/**/*.controller.ts"]

  - id: SINGLE_RESPONSIBILITY_SERVICES
    text: "Keep services focused on one domain. Split large services into smaller, composable services."
    applies_when:
      paths: ["src/**/*.service.ts"]

  - id: USE_TRANSACTIONS_FOR_WRITES
    text: "Wrap multi-step database writes in transactions. Use TypeORM QueryRunner or Prisma transactions."
    applies_when:
      paths: ["src/**/*.service.ts"]

  - id: AUTHENTICATE_ENDPOINTS
    text: "Apply @UseGuards(AuthGuard) to protected endpoints. Document public endpoints explicitly."
    applies_when:
      paths: ["src/**/*.controller.ts"]

  - id: LOG_BUSINESS_EVENTS
    text: "Log significant business events (user actions, state changes) with structured logging. Include correlation IDs."
    applies_when:
      paths: ["src/**/*.service.ts"]
```

## Usage

```text
&pack example/nestjs-api@v1
```
