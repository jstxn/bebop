#!/bin/bash
# Bebop wrapper for Claude Code CLI
# Usage: ./bebop-claude.sh "&use core example Create a feature"

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
    print_error "bebop CLI not found. Install with: npm install -g @bebop/cli"
    exit 1
fi

# Check if claude CLI is installed
if ! command -v claude &> /dev/null; then
    print_error "claude CLI not found. Please install Claude Code CLI first."
    exit 1
fi

# Get input
USER_INPUT="$@"

# Check for --dry-run flag
if [[ "$USER_INPUT" == *"--dry-run"* ]]; then
    print_info "Dry run mode - showing compiled prompt"
    bebop compile "$USER_INPUT"
    exit 0
fi

# Check for --help flag
if [[ "$USER_INPUT" == *"--help"* ]] || [[ -z "$USER_INPUT" ]]; then
    echo "Bebop wrapper for Claude Code CLI"
    echo ""
    echo "Usage: bebop-claude \"[directives] [task]\""
    echo ""
    echo "Examples:"
    echo "  bebop-claude \"&use core example Create a user service\""
    echo "  bebop-claude \"&plan create-endpoint route=POST:/users name=CreateUser\""
    echo "  bebop-claude \"--dry-run &use core example Create a feature\""
    echo ""
    echo "Options:"
    echo "  --dry-run    Show compiled prompt without sending to Claude"
    echo "  --help        Show this help message"
    echo ""
    echo "Directives:"
    echo "  &use <alias>     Load packs by alias"
    echo "  &pack <id>       Load pack by ID"
    echo "  &plan <id>       Load plan by ID"
    echo "  &svc <name>      Set service context"
    echo "  &step <n>        Jump to plan step"
    echo "  &rules +/-<id>   Override rules"
    exit 0
fi

# Compile prompt
print_info "Compiling prompt with Bebop..."
COMPILED=$(bebop compile "$USER_INPUT" 2>&1)

if [ $? -ne 0 ]; then
    print_error "Compilation failed:"
    echo "$COMPILED"
    exit 1
fi

# Show stats
WORD_COUNT=$(echo "$COMPILED" | wc -w | xargs)
print_info "Compiled prompt ($WORD_COUNT words)"
echo ""

# Send to Claude
print_info "Sending to Claude..."
echo ""
claude "$COMPILED"
