#compdef bebop

_bebop() {
    local -a commands
    commands=(
        'init:Initialize bebop registry'
        'chat:Send input to LLM with bebop compilation'
        'compile:Compile input to prompt (no LLM)'
        'session:Manage sessions'
        'pack:Manage packs'
        'plan:Manage plans'
        'config:Manage configuration'
        'alias:Manage aliases'
        'stats:Show usage statistics'
        'update:Update bebop'
        'cleanup:Clean up old data'
        'help:Show help'
    )

    if (( CURRENT == 2 )); then
        _describe -t commands 'bebop commands' commands
        return
    fi

    case $words[2] in
        init)
            _arguments \
                '--project[Create project namespace]' \
                '--import[Import existing docs]:file:_files'
            ;;
        chat)
            _arguments \
                '--dry-run[Show compiled prompt without sending]' \
                '--verbose[Show verbose output]'
            if (( CURRENT > 2 )); then
                _values -s ' ' 'directives' '&use' '&pack' '&plan' '&svc' '&step' '&rules' '&dry-run'
            fi
            ;;
        compile)
            _values -s ' ' 'directives' '&use' '&pack' '&plan' '&svc' '&step' '&rules' '&dry-run'
            ;;
        session)
            _ bebop_session
            ;;
        pack)
            _ bebop_pack
            ;;
        plan)
            _ bebop_plan
            ;;
        config)
            _ bebop_config
            ;;
        alias)
            _ bebop_alias
            ;;
        cleanup)
            _arguments \
                '--dry-run[Show what would be cleaned]' \
                '--force[Clean without confirmation]'
            ;;
        update)
            _arguments \
                '--check[Check for updates only]'
            ;;
    esac
}

_bebop_session() {
    local -a subcommands
    subcommands=(
        'start:Start a new session'
        'continue:Continue active session'
        'show:Show current session details'
        'list:List all sessions'
        'end:End current session'
        'resume:Resume a specific session'
        'step:Jump to a specific step'
        'cleanup:Clean up old sessions'
    )

    if (( CURRENT == 3 )); then
        _describe -t session-commands 'session commands' subcommands
        return
    fi

    case $words[3] in
        step|resume)
            _arguments '1: :_bebop_sessions'
            ;;
        cleanup)
            _arguments '--days[Age in days]:days:'
            ;;
    esac
}

_bebop_pack() {
    local -a subcommands
    subcommands=(
        'list:List all packs'
        'show:Show pack details'
        'create:Create new pack'
        'compile:Compile pack'
        'test:Test pack rules'
        'import:Import docs as pack'
    )

    if (( CURRENT == 3 )); then
        _describe -t pack-commands 'pack commands' subcommands
        return
    fi

    case $words[3] in
        show|compile|test)
            _arguments '1: :_bebop_packs'
            ;;
        create)
            _arguments '--name[Pack name]:name:'
            ;;
        import)
            _arguments '1:file:_files'
            ;;
    esac
}

_bebop_plan() {
    local -a subcommands
    subcommands=(
        'list:List all plans'
        'show:Show plan details'
        'create:Create new plan'
        'compile:Compile plan'
        'run:Run a plan'
    )

    if (( CURRENT == 3 )); then
        _describe -t plan-commands 'plan commands' subcommands
        return
    fi

    case $words[3] in
        show|compile|run)
            _arguments '1: :_bebop_plans'
            ;;
        create)
            _arguments '--name[Plan name]:name:'
            ;;
    esac
}

_bebop_config() {
    local -a subcommands
    subcommands=(
        'get:Get config value'
        'set:Set config value'
    )

    if (( CURRENT == 3 )); then
        _describe -t config-commands 'config commands' subcommands
        return
    fi

    case $words[3] in
        get|set)
            _arguments '1: :_bebop_config_keys'
            ;;
    esac
}

_bebop_alias() {
    local -a subcommands
    subcommands=(
        'list:List all aliases'
        'add:Add an alias'
        'remove:Remove an alias'
    )

    if (( CURRENT == 3 )); then
        _describe -t alias-commands 'alias commands' subcommands
    esac
}

# Helper functions (these would query bebop for real data)
_bebop_sessions() {
    local -a sessions
    # Query bebop for sessions
    # sessions=($(bebop session list --format id-only))
    # For now, provide placeholder
    sessions=('session_latest')
    _describe -t sessions 'sessions' sessions
}

_bebop_packs() {
    local -a packs
    # Query bebop for packs
    # packs=($(bebop pack list --format id-only))
    # For now, provide examples
    packs=('core/example@v1' 'core/nestjs@v1')
    _describe -t packs 'packs' packs
}

_bebop_plans() {
    local -a plans
    # Query bebop for plans
    # plans=($(bebop plan list --format id-only))
    # For now, provide examples
    plans=('core/simple-task@v1' 'core/create-endpoint@v1')
    _describe -t plans 'plans' plans
}

_bebop_config_keys() {
    local -a keys
    keys=(
        'default_editor'
        'llm_provider'
        'llm_api_key'
        'max_tokens_per_session'
        'auto_cleanup_days'
    )
    _describe -t config-keys 'config keys' keys
}

_bebop "$@"
