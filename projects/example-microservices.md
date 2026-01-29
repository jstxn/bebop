# Bebop project notes: example-microservices

This file captures how Bebop could be applied to this monorepo.

## Candidate packs
- `example/monorepo-core@v1`
  - Based on repo-wide ground rules (microservices independence, no secrets, Docker validation).

- `example/nestjs-api@v1`
  - NestJS conventions (module structure, DTOs, tests AAA pattern).

## Candidate plan templates

### Create an endpoint (Screener API)

User:

```text
&use core nestjs
&svc screener
&plan example/screener/create-endpoint@v1 route=POST:/job-postings name=CreateJobPosting
Implement the endpoint with validation + tests.
```

Expected compiled prompt (conceptually):
- Minimal “Active constraints” subset
- Current step only (read guide → implement → tests → validators)

## Notes
- This monorepo has strong “run validators per-service in Docker” guidance; encode as rule IDs and auto-suggest compose commands.
- Prefer enforcing “no cross-service imports” with a diff scan rather than relying on the model to remember it.
