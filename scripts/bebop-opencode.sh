#!/bin/bash
# Bebop wrapper for opencode CLI
# Usage: ./bebop-opencode.sh "&use core example Create a feature"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${GREEN}📋${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1" >&2
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_agent() {
    echo -e "${BLUE}🤖${NC} $1"
}

# Check dependencies
check_command() {
    local cmd=$1
    local name=$2
    if ! command -v $cmd &> /dev/null; then
        print_error "$name not found. Install with: $3"
        exit 1
    fi
}

check_command bebop "Bebop CLI" "npm install -g @bebophq/cli"
check_command opencode "opencode CLI" "See opencode documentation"

# Get input
USER_INPUT="$@"

# Check flags
if [[ "$USER_INPUT" == *"--dry-run"* ]]; then
    print_info "Dry run mode - showing compiled prompt"
    echo ""
    bebop compile "$USER_INPUT"
    exit 0
fi

if [[ "$USER_INPUT" == *"--help"* ]] || [[ -z "$USER_INPUT" ]]; then
    cat << 'EOF'
Bebop wrapper for opencode CLI

Usage: bebop-opencode "[directives] [task]"

Examples:
  bebop-opencode "&use core example Create a user service"
  bebop-opencode "&plan create-endpoint route=POST:/users name=CreateUser"
  bebop-opencode "&svc userservice &use core/security Add login endpoint"
  bebop-opencode "--dry-run &use core example Create a feature"

Options:
  --dry-run    Show compiled prompt without sending to opencode
  --help        Show this help message
  --verbose      Show compilation details

Directives:
  &use <alias>     Load packs by alias (e.g., &use core example)
  &pack <id>       Load pack by ID (e.g., &pack core/security@v1)
  &plan <id>       Load plan by ID with params (e.g., &plan create-endpoint route=POST:/users)
  &svc <name>      Set service context (e.g., &svc userservice)
  &step <n>        Jump to specific plan step
  &rules +/-<id>    Enable/disable specific rules

Session Management:
  Start with: bebop session start
  Continue:   bebop session continue
  Show:       bebop session show
  Step:        bebop step <n>

Token Savings:
  Without Bebop: ~1,300 tokens per prompt
  With Bebop:    ~90 tokens per prompt
  Savings:        93%

Environment Variables:
  BEBOP_DEBUG        Enable debug output
  BEBOP_WORKSPACE     Set workspace path
  BEBOP_CONFIG       Set config file path
EOF
    exit 0
fi

# Detect workspace
if [ -z "$BEBOP_WORKSPACE" ]; then
    WORKSPACE=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
    export BEBOP_WORKSPACE="$WORKSPACE"
    print_info "Detected workspace: $WORKSPACE"
fi

# Compile prompt
print_info "Compiling prompt with Bebop..."
if [[ "$USER_INPUT" == *"--verbose"* ]]; then
    COMPILED=$(bebop compile "$USER_INPUT" 2>&1)
else
    COMPILED=$(bebop compile "$USER_INPUT" 2>&1)
fi

if [ $? -ne 0 ]; then
    print_error "Compilation failed:"
    echo "$COMPILED"
    exit 1
fi

# Show stats
LINE_COUNT=$(echo "$COMPILED" | wc -l | xargs)
WORD_COUNT=$(echo "$COMPILED" | wc -w | xargs)
CHAR_COUNT=$(echo "$COMPILED" | wc -c | xargs)

print_info "Compiled prompt ($LINE_COUNT lines, $WORD_COUNT words, $CHAR_COUNT chars)"
echo ""

# Show preview (first 5 lines)
print_info "Preview:"
echo "$COMPILED" | head -5
if [ $LINE_COUNT -gt 5 ]; then
    echo "... (use --dry-run to see full prompt)"
fi
echo ""

# Send to opencode
print_agent "Sending to opencode..."
echo ""

# Send compiled prompt
opencode "$COMPILED"

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    print_info "opencode completed successfully"
else
    print_warning "opencode exited with code $EXIT_CODE"
fi

exit $EXIT_CODE
