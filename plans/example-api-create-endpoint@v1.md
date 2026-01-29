# Plan: example/screener/create-endpoint@v1

A reusable plan for creating a NestJS endpoint in `services/api/screener`.

## Plan IR (concept)

```yaml
id: example/screener/create-endpoint
version: 1
vars:
  service_root: services/api/screener
  compose_service: screener
steps:
  - READ: "{service_root}/.claude/claude.md"
  - READ: "{service_root}/README.md"            # if present
  - EDIT: "{service_root}/src/**"               # controller/service/module/dto
  - TEST: "{service_root}/test/**"              # AAA pattern
  - RUN: "docker compose run {compose_service} npm run lint"
  - RUN: "docker compose run {compose_service} npm run test"
  - RUN: "docker compose run {compose_service} npm run test:typecheck"
```

## Invocation example

```text
&use core nestjs
&svc screener
&plan example/screener/create-endpoint@v1 route=POST:/job-postings name=CreateJobPosting
```
