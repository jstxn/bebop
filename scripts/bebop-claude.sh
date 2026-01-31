#!/bin/bash
# Bebop wrapper for Claude Code CLI
# Usage: ./bebop-claude.sh "&use core/security &use core/code-quality Create a feature"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}📋${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1" >&2
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

# Check if bebop is installed
if ! command -v bebop &> /dev/null; then
    print_error "bebop CLI not found. Install with: npm install -g @bebophq/cli"
    exit 1
fi

# Check if claude CLI is installed
if ! command -v claude &> /dev/null; then
    print_error "claude CLI not found. Please install Claude Code CLI first."
    exit 1
fi

show_help() {
    echo "Bebop wrapper for Claude Code CLI"
    echo ""
    echo "Usage: bebop-claude [--dry-run] [--verbose] \"[directives] [task]\""
    echo ""
    echo "Examples:"
    echo "  bebop-claude \"&use core/security &use core/code-quality Create a user service\""
    echo "  bebop-claude --dry-run \"&use core/security Create an endpoint\""
    echo ""
    echo "Options:"
    echo "  --dry-run     Show compiled prompt without sending to Claude"
    echo "  --verbose     Print the raw input before compiling"
    echo "  --help        Show this help message"
    echo ""
    echo "Directives:"
    echo "  &use <pack...>   Include packs (e.g., &use core/security &use core/code-quality)"
    echo "  &pack <id>       Include a pack by ID (e.g., &pack core/security@v1)"
    echo ""
    echo "Usage tracking (optional):"
    echo "  bebop hook session-start --tool claude"
    echo "  bebop stats --session --tool claude"
    echo "  bebop hook session-end --tool claude"
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

# Compile prompt
print_info "Compiling prompt with Bebop..."
if [[ "$VERBOSE" == "true" ]]; then
    echo "Input: $USER_INPUT"
    echo ""
fi

if ! COMPILED=$(bebop compile --tool claude <<< "$USER_INPUT"); then
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
WORD_COUNT=$(echo "$COMPILED" | wc -w | xargs)
print_info "Compiled prompt ($WORD_COUNT words)"
echo ""

# Send to Claude
print_info "Sending to Claude..."
echo ""
claude "$COMPILED"
