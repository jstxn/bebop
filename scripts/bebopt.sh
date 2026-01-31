#!/bin/bash
# Universal Bebop wrapper for any AI CLI tool
# Usage: ./bebopt.sh claude "&use core/security &use core/code-quality Create a feature"
#        ./bebopt.sh opencode "&use core/security &use core/code-quality Create a feature"
#        ./bebopt.sh cursor "&use core/security &use core/code-quality Create a feature"

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

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

print_bebop() {
    echo -e "${PURPLE}🎯${NC} $1"
}

# Show help
show_help() {
    cat << 'EOF'
🎯 Bebop Universal Wrapper

Usage: bebopt <tool> "[directives] [task]"

Available Tools:
  claude       - Anthropic Claude Code CLI
  opencode     - opencode CLI
  cursor       - Cursor CLI
  copilot      - GitHub Copilot CLI
  gpt4         - OpenAI GPT-4 (via curl)

Examples:
  bebopt claude "&use core/security &use core/code-quality Create a user service"
  bebopt opencode "&use core/security Create an endpoint"
  bebopt cursor "&use core/code-quality Refactor this function"

Directives:
  &use <alias>     Load packs by alias
  &pack <id>       Load pack by ID

Options:
  --dry-run        Show compiled prompt without sending
  --verbose        Show detailed output
  --help           Show this help message

Usage tracking (optional):
  bebop hook session-start --tool <tool>
  bebop stats --session --tool <tool>
  bebop hook session-end --tool <tool>

Environment Variables:
  BEBOP_WORKSPACE     Set workspace path
  BEBOP_REGISTRY      Set registry path (default: ~/.bebop)
  BEBOP_ENFORCE=0     Disable enforcement hooks
  BEBOP_USAGE_LOG=0   Disable usage logging

Quick Start:
  1. Install bebop: npm install -g @bebophq/cli
  2. Initialize:     bebop init
  3. Use wrapper:    bebopt claude "&use core/security &use core/code-quality Create a feature"

For more information:
  https://github.com/jstxn/bebop
EOF
}

# Check bebop installation
check_bebop() {
    if ! command -v bebop &> /dev/null; then
        print_error "Bebop CLI not found."
        echo ""
        echo "Install with:"
        echo "  npm install -g @bebophq/cli"
        echo ""
        echo "Then initialize:"
        echo "  bebop init"
        exit 1
    fi
}

# Get AI tool command
get_ai_tool() {
    local tool=$1
    
    case $tool in
        claude|claude-cli)
            echo "claude"
            ;;
        opencode|opencode-cli)
            echo "opencode"
            ;;
        cursor|cursor-cli)
            echo "cursor"
            ;;
        copilot|copilot-cli|gh-copilot)
            echo "copilot"
            ;;
        gpt4|gpt-4|openai)
            echo "gpt4"
            ;;
        *)
            print_error "Unknown tool: $tool"
            echo ""
            echo "Available tools:"
            echo "  claude, opencode, cursor, copilot, gpt4"
            exit 1
            ;;
    esac
}

# Check if tool is available
check_tool() {
    local tool=$1
    
    if [[ "$tool" == "gpt4" ]]; then
        if ! command -v curl &> /dev/null; then
            print_error "curl not found. Install curl first."
            exit 1
        fi
        if ! command -v jq &> /dev/null; then
            print_error "jq not found. Install jq first."
            exit 1
        fi
        return
    fi

    if ! command -v $tool &> /dev/null; then
        print_error "Tool not found: $tool"
        echo ""
        echo "Install $tool first, then try again."
        case $tool in
            claude)
                echo "See: https://docs.anthropic.com/claude/reference/claude-code"
                ;;
            opencode)
                echo "See opencode documentation"
                ;;
            cursor)
                echo "See: https://cursor.sh"
                ;;
            copilot)
                echo "Install: npm install -g @githubnext/copilot-cli"
                ;;
            gpt4)
                echo "Need: curl, jq, and OPENAI_API_KEY environment variable"
                ;;
        esac
        exit 1
    fi
}

# GPT-4 implementation using curl
run_gpt4() {
    local prompt="$1"
    
    if [ -z "$OPENAI_API_KEY" ]; then
        print_error "OPENAI_API_KEY environment variable not set"
        echo ""
        echo "Set it with:"
        echo "  export OPENAI_API_KEY='your-api-key'"
        echo ""
        echo "Or add to ~/.bashrc or ~/.zshrc"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        print_error "curl not found. Install curl first."
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        print_error "jq not found. Install jq first."
        exit 1
    fi
    
    print_agent "Sending to OpenAI GPT-4..."
    echo ""
    
    curl -s https://api.openai.com/v1/chat/completions \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $OPENAI_API_KEY" \
        -d "{
            \"model\": \"gpt-4\",
            \"messages\": [{\"role\": \"user\", \"content\": $(echo "$prompt" | jq -Rs .)}]
        }" | jq -r '.choices[0].message.content'
}

# Main execution
main() {
    # Parse arguments
    if [[ $# -eq 0 ]] || [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
        show_help
        exit 0
    fi
    
    check_bebop
    
    local tool_name=$1
    shift
    local dry_run=false
    local verbose=false
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dry-run) dry_run=true; shift ;;
            --verbose) verbose=true; shift ;;
            --help|-h) show_help; exit 0 ;;
            --) shift; break ;;
            *) break ;;
        esac
    done
    local user_input="$*"
    if [[ -z "$user_input" ]]; then
        show_help
        exit 0
    fi
    
    # Get actual command
    local ai_tool=$(get_ai_tool "$tool_name")
    
    # Check if tool is available
    check_tool "$ai_tool"
    
    # Compile prompt
    print_bebop "Compiling prompt with Bebop..."
    
    if [ "$verbose" = true ]; then
        echo "Input: $user_input"
        echo ""
    fi
    
    local compiled
    if ! compiled=$(bebop compile --tool "$ai_tool" <<< "$user_input"); then
        print_error "Compilation failed"
        exit 1
    fi
    
    # Show stats
    local lines=$(echo "$compiled" | wc -l | xargs)
    local words=$(echo "$compiled" | wc -w | xargs)
    local chars=$(echo "$compiled" | wc -c | xargs)
    
    print_bebop "Compiled prompt ($lines lines, $words words, $chars chars)"
    echo ""
    
    # If dry-run, just show the prompt
    if [ "$dry_run" = true ]; then
        print_info "Dry run - compiled prompt:"
        echo ""
        echo "$compiled"
        exit 0
    fi
    
    # Show preview
    print_info "Preview (first 5 lines):"
    echo "$compiled" | head -5
    if [ $lines -gt 5 ]; then
        echo "... (use --dry-run to see full prompt)"
    fi
    echo ""
    
    # Send to AI tool
    print_agent "Sending to $ai_tool..."
    echo ""
    
    case $ai_tool in
        gpt4)
            run_gpt4 "$compiled"
            ;;
        *)
            # Send to other tools directly
            $ai_tool "$compiled"
            ;;
    esac
    
    local exit_code=$?
    echo ""
    
    if [ $exit_code -eq 0 ]; then
        print_info "$ai_tool completed successfully"
    else
        print_warning "$ai_tool exited with code $exit_code"
    fi
    
    exit $exit_code
}

# Run main
main "$@"
