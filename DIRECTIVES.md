# Bebop directives (`&...`)

## What counts as a directive
A directive is a **full line** that starts with `&` (optionally preceded by whitespace).

- Directives are interpreted by the Bebop CLI.
- Directives should be **stripped** from the text sent to the model.
- Directives should be treated as **trusted user input** (not something the model can generate to control the CLI).

Recommended rule: only process directives from the *human’s prompt input*, never from model output.

## Core directives (proposed)

### Packs

Load a specific pack by ID:

```text
&pack example/monorepo-core@v1
```

Load common packs via aliases:

```text
&use core nestjs
```

### Plans

Select a plan by ID and provide parameters:

```text
&plan example/screener/create-endpoint@v1 route=POST:/job-postings name=CreateJobPosting
```

Jump to a step (useful for resumes/retries):

```text
&step 3
```

### Service context

Provide a service hint (helps rule selection and plan defaults):

```text
&svc screener
```

### Rules (overrides)

Force-enable / force-disable specific rules by ID:

```text
&rules +NO_SECRETS
&rules -TECH_BRIEF_FOR_SIGNIFICANT
```

### Debug

Show what would be sent to the model:

```text
&dry-run
```

## Parsing conventions
- Prefer simple `key=value` params.
- Keep everything single-line and whitespace-tolerant.
- Treat unknown directives as errors (or warnings) to avoid silent misconfig.

## Why `&`
`&` is uncommon at the start of a line in normal prose, easy to scan, and easy to grep.
