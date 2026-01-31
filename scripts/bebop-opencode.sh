#!/bin/bash
# Bebop wrapper for opencode CLI
# Usage: ./bebop-opencode.sh "&use core/security &use core/code-quality Create a feature"

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

show_help() {
    cat << 'EOF'
Bebop wrapper for opencode CLI

Usage: bebop-opencode [--dry-run] [--verbose] "[directives] [task]"

Examples:
  bebop-opencode "&use core/security &use core/code-quality Create a user service"
  bebop-opencode --dry-run "&use core/security Create an endpoint"

Options:
  --dry-run    Show compiled prompt without sending to opencode
  --help        Show this help message
  --verbose      Print the raw input before compiling

Directives:
  &use <alias>     Load packs by alias (e.g., &use core/security)
  &pack <id>       Load pack by ID (e.g., &pack core/security@v1)

Environment Variables:
  BEBOP_WORKSPACE    Override detected workspace root
  BEBOP_REGISTRY     Override registry path (default: ~/.bebop)
  BEBOP_ENFORCE=0    Disable enforcement hooks
  BEBOP_USAGE_LOG=0  Disable usage logging

Usage tracking (optional):
  bebop hook session-start --tool opencode
  bebop stats --session --tool opencode
  bebop hook session-end --tool opencode
EOF
}

# Parse wrapper flags
DRY_RUN=false
VERBOSE=false
while [[ $# -gt 0 ]]; do
    case "$1" in
        --dry-run) DRY_RUN=true; shift ;;
        --verbose) VERBOSE=true; shift ;;
        --help|-h) show_help; exit 0 ;;
        --) shift; break ;;
        *) break ;;
    esac
done

USER_INPUT="$*"
if [[ -z "$USER_INPUT" ]]; then
    show_help
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
if [[ "$VERBOSE" == "true" ]]; then
    echo "Input: $USER_INPUT"
    echo ""
fi

if ! COMPILED=$(bebop compile --tool opencode <<< "$USER_INPUT"); then
    print_error "Compilation failed"
    exit 1
fi

if [[ "$DRY_RUN" == "true" ]]; then
    print_info "Dry run - compiled prompt:"
    echo ""
    echo "$COMPILED"
    exit 0
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
