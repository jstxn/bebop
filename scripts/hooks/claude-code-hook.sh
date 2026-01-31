#!/bin/bash
# Bebop Claude Code Hook
# Automatically compiles prompts with Bebop constraints
#
# This hook intercepts prompts in Claude Code and adds compiled constraints
# as additional context, without modifying the original prompt.

set -e

# Read JSON input from stdin
INPUT=$(cat)

# Extract the prompt and working directory
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')

# Skip if no prompt
if [ -z "$PROMPT" ]; then
  exit 0
fi

# Skip if prompt is very short (likely a command or simple response)
WORD_COUNT=$(echo "$PROMPT" | wc -w | xargs)
if [ "$WORD_COUNT" -lt 3 ]; then
  exit 0
fi

# Skip if prompt starts with / (slash command)
if [[ "$PROMPT" == /* ]]; then
  exit 0
fi

# Run bebop compile-auto to get constraints
# Use --json to get structured output, then extract just the constraints
COMPILED=$(bebop compile-auto "$PROMPT" --cwd "$CWD" 2>/dev/null) || {
  # If bebop fails, just continue without constraints
  exit 0
}

# Skip if compilation produced no useful output
if [ -z "$COMPILED" ] || [ "$COMPILED" = "null" ]; then
  exit 0
fi

# Extract just the "Active constraints" section
CONSTRAINTS=$(echo "$COMPILED" | grep -A 100 "Active constraints:" | head -20)

# If we got constraints, output them as additional context
if [ -n "$CONSTRAINTS" ]; then
  # Output as JSON with additionalContext
  cat << EOF
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "$(echo "$CONSTRAINTS" | sed 's/"/\\"/g' | tr '\n' ' ')"
  }
}
EOF
fi

exit 0
